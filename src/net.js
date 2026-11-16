// Firebase layer: Google sign-in, cloud saves, shared homes and live presence (Realtime Database).
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get, set, update, remove, onValue, onDisconnect } from "firebase/database";

export function createNet(config) {
  if (!config || !config.apiKey || !config.databaseURL || /PASTE|YOUR_/i.test(config.apiKey)) return null;
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getDatabase(app);
  let offset = 0;
  onValue(ref(db, ".info/serverTimeOffset"), s => { offset = s.val() || 0; });
  const randomId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), b => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");

  return {
    serverNow: () => Date.now() + offset,
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
    watchHouse(hid, cb, onErr) { return onValue(ref(db, `houses/${hid}`), s => cb(s.val()), onErr); },
    setConfig(hid, cfg) { return set(ref(db, `houses/${hid}/config`), cfg); },
    presence(hid, uid) {
      const r = ref(db, `houses/${hid}/presence/${uid}`);
      onDisconnect(r).remove();
      return { set: obj => set(r, obj).catch(() => {}), clear: () => remove(r).catch(() => {}) };
    },
  };
}
