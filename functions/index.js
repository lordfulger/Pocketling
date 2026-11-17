// Cloud Functions for Pocketling: phone notifications.
// - petAlerts: every 10 minutes, sends any pet alerts that have come due (the app schedules them ahead of time).
// - mailAlert: tells someone when a letter or a "thinking of you" ping arrives.
// - visitAlert: tells home members when someone opens Pocketling (at most every 3 hours).
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onValueCreated } = require("firebase-functions/v2/database");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

async function sendTo(uid, { title, body, tag }) {
  const db = getDatabase();
  const snap = await db.ref(`users/${uid}/push`).get();
  const entries = snap.exists() ? Object.entries(snap.val()).filter(([, t]) => typeof t === "string") : [];
  if (!entries.length) return 0;
  const res = await getMessaging().sendEachForMulticast({
    tokens: entries.map(([, t]) => t),
    data: { title: String(title).slice(0, 80), body: String(body).slice(0, 160), tag: tag || "pocketling" },
    webpush: { headers: { Urgency: "high", TTL: "3600" } },
  });
  const dead = [];
  res.responses.forEach((r, i) => {
    const code = (r.error && r.error.code) || "";
    if (!r.success && /registration-token-not-registered|invalid-registration-token|invalid-argument/.test(code)) dead.push(entries[i][0]);
  });
  await Promise.all(dead.map(k => db.ref(`users/${uid}/push/${k}`).remove()));
  return res.successCount;
}

exports.petAlerts = onSchedule({ schedule: "every 10 minutes", timeoutSeconds: 120 }, async () => {
  const db = getDatabase();
  const now = Date.now();
  const snap = await db.ref("alerts").get();
  if (!snap.exists()) return;
  const jobs = [];
  snap.forEach(child => {
    const v = child.val() || {};
    const items = Array.isArray(v.items) ? v.items : Object.values(v.items || {});
    const sentUpTo = Math.max(v.sentUpTo || 0, now - 30 * 60 * 1000);
    const due = items.filter(i => i && typeof i.t === "number" && i.t <= now && i.t > sentUpTo).sort((a, b) => a.t - b.t);
    if (!due.length) return;
    const last = due[due.length - 1];
    jobs.push(sendTo(child.key, { title: last.title, body: due.length > 1 ? `${last.body} (+${due.length - 1} more)` : last.body, tag: "pet" })
      .then(() => child.ref.child("sentUpTo").set(now)).catch(() => {}));
  });
  await Promise.all(jobs);
});

exports.mailAlert = onValueCreated("/mail/{to}/{id}", async event => {
  const m = event.data.val() || {};
  if (m.ping) { await sendTo(event.params.to, { title: `${m.name || "Someone"} is thinking of you`, body: m.pet ? `${m.pet} sends a big hug too.` : "Open Pocketling to send one back.", tag: "ping" }); return; }
  const body = m.text ? String(m.text).slice(0, 120) : m.gift ? "They sent you a gift!" : "Open Pocketling to read it.";
  await sendTo(event.params.to, { title: `${m.name || "Someone"} sent you a letter`, body, tag: "mail" });
});

exports.visitAlert = onValueCreated("/houses/{hid}/presence/{uid}", async event => {
  const { hid, uid } = event.params;
  const p = event.data.val() || {};
  const db = getDatabase();
  const members = (await db.ref(`houses/${hid}/members`).get()).val() || {};
  const now = Date.now();
  await Promise.all(Object.keys(members).filter(m => m !== uid).map(async m => {
    if ((await db.ref(`houses/${hid}/presence/${m}`).get()).exists()) return;
    const lastRef = db.ref(`alerts/${m}/lastVisitPing`);
    if (now - ((await lastRef.get()).val() || 0) < 3 * 3600 * 1000) return;
    await lastRef.set(now);
    const pet = p.pet && p.pet.name;
    await sendTo(m, { title: `${p.name || "Your friend"} is playing Pocketling`, body: pet ? `${pet} came over to play. Come say hi!` : "Come say hi!", tag: "visit" });
  }));
});
