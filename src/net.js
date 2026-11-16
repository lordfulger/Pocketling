// Firebase layer: Google sign-in, cloud saves, shared homes, live presence, mail, album, goals and push alerts.
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get, set, update, remove, push, onValue, onDisconnect, runTransaction, query, limitToLast } from "firebase/database";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

export function createNet(config) {
  if (!config || !config.apiKey || !config.databaseURL || /PASTE|YOUR_/i.test(config.apiKey)) return null;
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getDatabase(app);
  let offset = 0;
  onValue(ref(db, ".info/serverTimeOffset"), s => { offset = s.val() || 0; });
  const randomId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), b => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
  const hashKey = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return "t" + h.toString(36); };

  return {
    serverNow: () => Date.now() + offset,
    pushReady: !!config.vapidKey,
    onUser(cb) { getRedirectResult(auth).catch(() => {}); return onAuthStateChanged(auth, cb); },
    async signIn() {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try { await signInWithPopup(auth, provider); }
      catch (e) {
        const code = e && e.code;
        if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment" || code === "auth/web-storage-unsupported") await signInWithRedirect(auth, provider);
        else if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") throw e;
      }
    },
    signOut: () => signOut(auth),

    async loadPet(uid) { const s = await get(ref(db, `users/${uid}/pet`)); return s.exists() ? s.val() : null; },
    savePet(uid, json, savedAt) { return set(ref(db, `users/${uid}/pet`), { json, savedAt }); },
    saveProfile(uid, p) { return set(ref(db, `profiles/${uid}`), p); },
    async profile(uid) { try { const s = await get(ref(db, `profiles/${uid}`)); return s.val(); } catch (e) { return null; } },

    async houseOf(uid) { const s = await get(ref(db, `users/${uid}/house`)); return s.val(); },
    async createHouse(uid) {
      const hid = randomId();
      await update(ref(db), { [`houses/${hid}/owner`]: uid, [`houses/${hid}/members/${uid}`]: true, [`users/${uid}/house`]: hid });
      return hid;
    },
    async joinHouse(uid, hid) { await update(ref(db), { [`houses/${hid}/members/${uid}`]: true, [`users/${uid}/house`]: hid }); },
    async leaveHouse(uid, hid) { await update(ref(db), { [`houses/${hid}/members/${uid}`]: null, [`houses/${hid}/presence/${uid}`]: null, [`users/${uid}/house`]: null }); },
    // Each part of a home is watched separately so fast presence updates don't resend the photo album.
    watchHouse(hid, h, week, onErr) {
      const base = `houses/${hid}`;
      const subs = [
        onValue(ref(db, `${base}/owner`), s => h.owner(s.val()), onErr),
        onValue(ref(db, `${base}/members`), s => h.members(s.val() || {}), onErr),
        onValue(ref(db, `${base}/config`), s => h.config(s.val()), () => {}),
        onValue(ref(db, `${base}/presence`), s => h.presence(s.val() || {}), () => {}),
        onValue(ref(db, `${base}/goals/${week}`), s => h.goals(s.val() || {}), () => {}),
        onValue(query(ref(db, `${base}/album`), limitToLast(40)), s => h.album(s.val() || {}), () => {}),
      ];
      return () => subs.forEach(u => u());
    },
    setConfig(hid, cfg) { return set(ref(db, `houses/${hid}/config`), cfg); },
    presence(hid, uid) {
      const r = ref(db, `houses/${hid}/presence/${uid}`);
      onDisconnect(r).remove();
      return { set: obj => set(r, obj).catch(() => {}), clear: () => remove(r).catch(() => {}) };
    },
    bumpGoal(hid, week, key) { return runTransaction(ref(db, `houses/${hid}/goals/${week}/${key}`), v => (v || 0) + 1).catch(() => {}); },
    addPhoto(hid, photo) { return set(push(ref(db, `houses/${hid}/album`)), photo); },
    deletePhoto(hid, id) { return remove(ref(db, `houses/${hid}/album/${id}`)); },

    sendMail(to, msg) { return set(push(ref(db, `mail/${to}`)), msg); },
    watchMail(uid, cb) { return onValue(ref(db, `mail/${uid}`), s => cb(s.val() || {}), () => {}); },
    deleteMail(uid, id) { return remove(ref(db, `mail/${uid}/${id}`)).catch(() => {}); },

    saveAlerts(uid, items) { return update(ref(db, `alerts/${uid}`), { items, at: Date.now() }).catch(() => {}); },
    async pushSupported() { try { return !!config.vapidKey && "Notification" in window && "serviceWorker" in navigator && await isSupported(); } catch (e) { return false; } },
    async enablePush(uid) {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") throw new Error("denied");
      const reg = await navigator.serviceWorker.ready;
      const token = await getToken(getMessaging(app), { vapidKey: config.vapidKey, serviceWorkerRegistration: reg });
      if (!token) throw new Error("no-token");
      await set(ref(db, `users/${uid}/push/${hashKey(token)}`), token);
      return token;
    },
  };
}
