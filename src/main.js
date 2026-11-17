// Pocketling: a real-time pocket pet. Game state, simulation, UI and multiplayer glue.
import {
  LW, LH, CX, FLOOR, OUT, ART, R, art, text, textC, textW, cleanLabel, panel, mix,
  FAMILIES, FAMILY_ORDER, STAGE_LABEL, BOOK_STAGES, getSpec, formId, GHOST, drawCreature, drawEgg,
  COATS, HEADWEAR, FACEWEAR, NECKWEAR, DEFAULT_STYLE,
  WALLS, FLOORS, WINDOWS, CURTAINS, ARTS, CEILINGS, ITEMS, RUGS, DEFAULT_DECOR, drawRoom, drawGlow, STAR_PTS, holidayAt, drawOutdoor,
} from "./draw.js";
import { GAMES, GAME_BY_ID } from "./games.js";
import { createNet } from "./net.js";

const MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const EGG_MS = 60 * 1000;
const CALL_LIMIT = 15 * MIN;
const KEY = "pocketling-v1";
const BOND_MAX = 5;
const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const jitter = n => Math.max(1, Math.round(n * (0.8 + Math.random() * 0.4)));
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const BAKED = { herName: "", from: "", welcome: "", notes: [], birthday: "", anniversary: "", petName: "", nudge: 0 };
let CFG = Object.assign({}, BAKED, { notes: [] });

const STAGES = {
  baby:  { hunger: 4,  happy: 5,  poop: 20,  sleep: null,    mis: false },
  child: { hunger: 35, happy: 40, poop: 100, sleep: [20, 9], mis: true },
  teen:  { hunger: 55, happy: 60, poop: 150, sleep: [21, 9], mis: true },
  adult: { hunger: 75, happy: 80, poop: 180, sleep: [22, 9], mis: true },
};
/* ===================== shop, food, traits, achievements, goals ===================== */
const FOODS = {
  riceball: { name: "Rice ball", kind: "meal", art: "meal", price: 0, hunger: 1, weight: 1 },
  salad:    { name: "Salad", kind: "meal", art: "salad", price: 5, hunger: 1, weight: -1 },
  pancake:  { name: "Pancakes", kind: "meal", art: "pancake", price: 6, hunger: 1, happy: 1, weight: 2 },
  fish:     { name: "Grilled fish", kind: "meal", art: "fish", price: 8, hunger: 2, weight: 1 },
  noodles:  { name: "Noodles", kind: "meal", art: "noodles", price: 8, hunger: 2, weight: 2 },
  cupcake:  { name: "Cupcake", kind: "snack", art: "snack", price: 0, happy: 1, weight: 2, sugar: 1 },
  berry:    { name: "Strawberry", kind: "snack", art: "berry", price: 3, happy: 1, weight: 0 },
  candy:    { name: "Lollipop", kind: "snack", art: "candy", price: 2, happy: 1, weight: 1, sugar: 2 },
  cookie:   { name: "Cookie", kind: "snack", art: "cookie", price: 3, happy: 1, weight: 1, sugar: 1 },
  icecream: { name: "Ice cream", kind: "snack", art: "icecream", price: 6, happy: 1, weight: 2, sugar: 1 },
  cake:     { name: "Party cake", kind: "snack", art: "cake", price: 15, happy: 2, weight: 3, sugar: 2 },
};
const TRAITS = {
  playful: { name: "Playful", text: "Loves games. Earns extra coins and happiness from winning." },
  foodie:  { name: "Foodie", text: "Gets hungry faster and goes wild for its favourite food." },
  sleepy:  { name: "Sleepy", text: "Goes to bed an hour early and sleeps in an hour late." },
  neat:    { name: "Neat", text: "Makes messes less often." },
  cuddly:  { name: "Cuddly", text: "Stays happy longer and loves cuddles." },
  brave:   { name: "Brave", text: "Rarely gets sick and needs only one dose of medicine." },
};
const TRAIT_KEYS = Object.keys(TRAITS);
const PRICES = {
  "wall.rainbow": 40, "wall.ocean": 40, "wall.candy": 35, "floor.cloud": 40, "floor.sakura": 35,
  "art.moon": 30, "art.poster": 25, "ceiling.clouds": 35, "ceiling.disco": 60,
  "item.piano": 60, "item.tv": 50, "item.castle": 45, "item.tree": 40, "rug.rainbow": 30,
  "coat.cherry": 40, "coat.galaxy": 60, "coat.gold": 90,
  "head.sunhat": 25, "head.tiara": 45, "head.bunnyband": 35, "head.witch": 40, "head.santa": 40, "head.halo": 70,
  "face.monocle": 30, "face.mask": 30, "neck.lei": 30, "neck.medal": 80,
};
const ACH = [
  ["hatch", "First hatch", "Hatch your first egg", s => (s.stats.hatched || 0) >= 1, 10],
  ["adult", "All grown up", "Raise a pet to adulthood", s => (s.stats.adults || 0) >= 1, 20],
  ["starry", "Perfect parent", "Raise a starry adult", s => (s.stats.starry || 0) >= 1, 60],
  ["zoo4", "Zookeeper", "Hatch 4 different animals", s => Object.keys(s.stats.families || {}).length >= 4, 30],
  ["zoo8", "Full zoo", "Hatch all 8 animals", s => Object.keys(s.stats.families || {}).length >= 8, 100],
  ["wins10", "Game on", "Win 10 games", s => (s.stats.wins || 0) >= 10, 20],
  ["wins50", "Champion", "Win 50 games", s => (s.stats.wins || 0) >= 50, 60],
  ["clean", "Squeaky clean", "Clean up 25 messes", s => (s.stats.cleans || 0) >= 25, 15],
  ["tried", "Food critic", "Try every food", s => Object.keys(s.tried || {}).length >= Object.keys(FOODS).length, 30],
  ["fav", "Favourite things", "Feed its favourite food 10 times", s => (s.stats.favFed || 0) >= 10, 15],
  ["manners", "Perfect manners", "Reach full manners", s => (s.stats.manners || 0) >= 1, 15],
  ["bff", "Best friends", "Fill all friendship hearts with someone", s => Object.values(s.bond || {}).some(v => v >= 5) || (s.stats.bff || 0) >= 1, 25],
  ["married", "Happily married", "Get married", s => (s.stats.married || 0) >= 1, 40],
  ["family", "Family tree", "Have an egg together", s => (s.stats.babies || 0) >= 1, 40],
  ["gen3", "Generations", "Raise a third generation", s => s.gen >= 3, 50],
  ["mail", "Pen pal", "Send 10 letters", s => (s.stats.mailSent || 0) >= 10, 20],
  ["photos", "Photographer", "Add 5 photos to the album", s => (s.stats.photos || 0) >= 5, 15],
  ["shop", "Interior designer", "Buy 5 things in the shop", s => (s.stats.bought || 0) >= 5, 20],
  ["streak7", "Every day", "Visit 7 days in a row", s => (s.bestStreak || 0) >= 7, 30],
  ["streak30", "Devoted", "Visit 30 days in a row", s => (s.bestStreak || 0) >= 30, 120],
];
const GOAL_POOL = [
  { key: "meals", text: "Feed your pets 20 meals", target: 20 }, { key: "wins", text: "Win 12 games", target: 12 },
  { key: "cleans", text: "Clean up 15 messes", target: 15 }, { key: "playdates", text: "Have 8 playdates", target: 8 },
  { key: "together", text: "Play 5 two-player games", target: 5 }, { key: "letters", text: "Send each other 6 letters", target: 6 },
  { key: "cuddles", text: "Cuddle your pets 30 times", target: 30 }, { key: "snacks", text: "Hand out 15 treats", target: 15 },
];
const GOAL_REWARD = 50;
function weekId() { return Math.floor((Date.now() + 3 * DAY) / (7 * DAY)); }
function weekGoals() { const r = mulberry(weekId() * 7919); const pool = GOAL_POOL.slice(); const out = []; while (out.length < 3) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]); return out; }
function dayKey(t) { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }

const OLD_FORMS = { pip: "kitten.baby.n", tuft: "kitten.child.n", bean: "kitten.teen.good", spud: "kitten.teen.poor", lumi: "kitten.adult.good", starla: "kitten.adult.star", puff: "kitten.adult.ok", bramble: "kitten.adult.poor", smudge: "kitten.adult.poor" };

/* ===================== state ===================== */
let S = null, LIVE = true, freshLocal = false;
const pn = () => (S && S.name) || "Your pet";

function newPet(prev, opts = {}) {
  const now = Date.now();
  return {
    v: 1, stage: "egg", form: "egg", family: opts.family || null, mystery: false, name: "", gen: prev ? prev.gen + 1 : 1,
    eggStart: opts.family ? now : 0, born: 0, evolveAt: 0, lifeDays: 0, parents: opts.parents || null,
    hunger: 0, happy: 0, discipline: 0, weight: 5,
    hT: 1, pT: 1, poopT: 20, misT: 180, snackT: 60, snackStreak: 0,
    poops: 0, sick: false, doses: 0, sickMin: 0, starveMin: 0,
    asleep: false, lightsOff: false,
    calls: { hunger: null, happy: null, lights: null, misbehave: null },
    mistakes: 0, totalMistakes: 0, deadAt: 0, cause: "",
    lastSim: now, savedAt: now, lastSeen: now,
    paused: prev ? !!prev.paused : false, sound: prev ? prev.sound !== false : true, quiet: prev ? prev.quiet !== false : true,
    hints: prev ? prev.hints !== false : true, visitors: prev ? prev.visitors !== false : true,
    decor: Object.assign({}, DEFAULT_DECOR, prev && prev.decor),
    style: Object.assign({}, DEFAULT_STYLE, prev && prev.style, opts.style),
    history: prev ? (prev.history || []).slice(-40) : [],
    seen: prev ? Object.assign({}, prev.seen || {}) : {},
    best: prev ? Object.assign({}, prev.best || {}) : {},
    heirs: prev ? (prev.heirs || []).filter(h => h.id !== opts.heirId) : [],
    log: [],
    letters: prev ? (prev.letters || []) : [], letterIdx: prev ? prev.letterIdx || 0 : 0,
    letterPending: false, nextLetterAt: 0,
    welcomeShown: prev ? !!prev.welcomeShown : false, lastNudge: prev ? prev.lastNudge || 0 : 0,
    gifts: {}, bond: {}, bondT: {}, partner: null, lastBaby: 0,
    coins: prev ? prev.coins || 0 : 30, owned: prev ? Object.assign({}, prev.owned) : {}, pantry: prev ? Object.assign({}, prev.pantry) : {},
    trait: null, fav: null, dislike: null, parentTraits: opts.parentTraits || null, tried: prev ? Object.assign({}, prev.tried) : {},
    stats: prev ? Object.assign({}, prev.stats) : {}, ach: prev ? Object.assign({}, prev.ach) : {}, claimed: prev ? Object.assign({}, prev.claimed) : {},
    streak: prev ? prev.streak || 0 : 0, bestStreak: prev ? prev.bestStreak || 0 : 0, lastDay: prev ? prev.lastDay || "" : "",
    adventure: null, tricks: {}, trickT: {}, talk: prev ? prev.talk !== false : true,
    garden: prev ? Object.assign({}, prev.garden) : {}, events: prev ? (prev.events || []).slice() : [], jar: prev ? prev.jar || null : null,
    photo: prev ? prev.photo || null : null, tourDone: prev ? !!prev.tourDone : false, backupDay: prev ? prev.backupDay || "" : "",
    music: prev ? !!prev.music : false, useWeather: prev ? !!prev.useWeather : false, geo: prev ? prev.geo || null : null, weather: prev ? prev.weather || null : null, pushOn: prev ? !!prev.pushOn : false,
  };
}
function migrate(o) {
  const d = newPet(null);
  for (const k in d) if (!(k in o)) o[k] = d[k];
  o.decor = Object.assign({}, DEFAULT_DECOR, o.decor);
  o.style = Object.assign({}, DEFAULT_STYLE, o.style);
  if (!o.calls) o.calls = d.calls;
  for (const k of ["gifts", "bond", "bondT", "best", "seen", "owned", "pantry", "tried", "stats", "ach", "claimed", "tricks", "trickT", "garden"]) if (!o[k] || typeof o[k] !== "object") o[k] = {};
  if (o.stage !== "egg" && o.stage !== "dead" && !o.trait) { o.trait = TRAIT_KEYS[rand(0, TRAIT_KEYS.length - 1)]; const priced = Object.keys(FOODS).filter(k => FOODS[k].price > 0); o.fav = priced[rand(0, priced.length - 1)]; o.dislike = priced.filter(k => k !== o.fav)[rand(0, priced.length - 2)]; }
  if (o.stage !== "egg" && o.stage !== "dead" && o.family) { o.stats.families = Object.assign({}, o.stats.families, { [o.family]: 1 }); }
  if (!Array.isArray(o.heirs)) o.heirs = [];
  if (!Array.isArray(o.events)) o.events = [];
  if (OLD_FORMS[o.form]) { o.form = OLD_FORMS[o.form]; o.family = "kitten"; }
  for (const k of Object.keys(o.seen)) if (OLD_FORMS[k]) { o.seen[OLD_FORMS[k]] = 1; delete o.seen[k]; }
  if (o.stage === "egg" && !o.family && o.eggStart) o.family = FAMILY_ORDER[rand(0, FAMILY_ORDER.length - 1)];
  if (o.stage !== "egg" && o.stage !== "dead" && !getSpec(o.form)) { o.family = o.family || "kitten"; o.form = formId(o.family, o.stage, o.stage === "baby" || o.stage === "child" ? "n" : o.stage === "teen" ? "good" : "ok"); }
  if (o.stage !== "egg" && o.stage !== "dead") o.seen[o.form] = 1;
  return o;
}
function valid(o) { return o && typeof o === "object" && o.v === 1 && typeof o.stage === "string" && typeof o.lastSim === "number"; }
function loadLocal() { try { const raw = localStorage.getItem(KEY); if (raw) { const o = JSON.parse(raw); if (valid(o)) return migrate(o); } } catch (e) {} return null; }
function saveLocal() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* ===================== simulation ===================== */
function petSpec() { return getSpec(S.form) || getSpec(formId(S.family || "kitten", "baby", "n")); }
function miniSpec() { return getSpec(formId(S.family || "kitten", "baby", "n")); }
function inWin(h, w) { return w[0] > w[1] ? (h >= w[0] || h < w[1]) : (h >= w[0] && h < w[1]); }
function sleepWindow() { const sp = getSpec(S.form); const w = (sp && sp.sleep) || (STAGES[S.stage] && STAGES[S.stage].sleep); if (w && S.trait === "sleepy") return [(w[0] + 23) % 24, (w[1] + 1) % 24]; return w; }
function isElder() { return S.stage === "adult" && S.lifeDays && Date.now() - S.born > (S.lifeDays - 3) * DAY; }
function ageDays(t) { return S.born ? Math.max(0, Math.floor(((S.stage === "dead" ? S.deadAt : t) - S.born) / DAY)) : 0; }
function baseWeight() { const sp = getSpec(S.form); return sp ? sp.base : 5; }
function alive() { return !!S && S.stage !== "egg" && S.stage !== "dead"; }
function log(t, txt) { S.log.push({ t, text: txt }); if (S.log.length > 80) S.log.splice(0, S.log.length - 80); }
function openCall(k, t) { if (!S.calls[k]) { S.calls[k] = { t, counted: false }; if (LIVE) sfx("alert"); } }
function closeCall(k) { S.calls[k] = null; }
function mistake(t, why) { S.mistakes++; S.totalMistakes++; log(t, why); }
const CALL_TEXT = { hunger: "Went hungry too long (care mistake)", happy: "Got lonely and sad (care mistake)", lights: "Slept with the light on (care mistake)" };
function checkCalls(t) { for (const k of ["hunger", "happy", "lights"]) { const c = S.calls[k]; if (c && !c.counted && t - c.t >= CALL_LIMIT) { c.counted = true; mistake(t, CALL_TEXT[k]); } } }
function hatch(t) {
  S.stage = "baby"; S.form = formId(S.family, "baby", "n"); S.born = t; S.evolveAt = t + 65 * MIN;
  S.hunger = 1; S.happy = 1; S.weight = 5; S.mistakes = 0;
  S.hT = jitter(STAGES.baby.hunger); S.pT = jitter(STAGES.baby.happy); S.poopT = jitter(STAGES.baby.poop);
  S.seen[S.form] = 1; S.nextLetterAt = t + 20 * MIN;
  S.trait = S.parentTraits && Math.random() < 0.6 ? S.parentTraits[rand(0, S.parentTraits.length - 1)] : TRAIT_KEYS[rand(0, TRAIT_KEYS.length - 1)];
  const priced = Object.keys(FOODS).filter(k => FOODS[k].price > 0);
  S.fav = priced[rand(0, priced.length - 1)]; S.dislike = priced.filter(k => k !== S.fav)[rand(0, priced.length - 2)];
  S.stats.hatched = (S.stats.hatched || 0) + 1; S.stats.families = Object.assign({}, S.stats.families, { [S.family]: 1 });
  log(t, `Hatched into a baby ${FAMILIES[S.family].name.toLowerCase()}!`);
  if (LIVE) { play("hatch", 4200); sfx("tune"); }
}
function evolve(t) {
  const from = S.form, sp = getSpec(from), m = S.mistakes, d = S.discipline;
  let stage, variant;
  if (S.stage === "baby") { stage = "child"; variant = "n"; S.evolveAt = S.born + DAY; }
  else if (S.stage === "child") { stage = "teen"; variant = m <= 2 ? "good" : "poor"; S.evolveAt = S.born + 3 * DAY; }
  else if (S.stage === "teen") {
    stage = "adult";
    if (sp.variant === "good") variant = (m === 0 && d >= 100) ? "star" : (m <= 2 && d >= 75) ? "good" : m <= 4 ? "ok" : "poor";
    else variant = (m <= 1 && d >= 75) ? "good" : m <= 4 ? "ok" : "poor";
    S.evolveAt = 0;
  } else return;
  const oldBase = baseWeight();
  S.form = formId(S.family, stage, variant); S.stage = stage; S.seen[S.form] = 1;
  const nsp = getSpec(S.form);
  S.weight = Math.min(99, nsp.base + Math.max(0, S.weight - oldBase));
  if (stage === "adult") S.lifeDays = nsp.life + Math.max(0, 4 - Math.floor(S.totalMistakes / 3));
  S.mistakes = 0;
  const c = STAGES[stage];
  S.hT = Math.min(S.hT, jitter(c.hunger)); S.pT = Math.min(S.pT, jitter(c.happy));
  log(t, `Grew up into a ${nsp.label}!`);
  earn(stage === "adult" ? (variant === "star" ? 60 : 25) : 15);
  if (stage === "adult") { S.stats.adults = (S.stats.adults || 0) + 1; if (variant === "star") S.stats.starry = (S.stats.starry || 0) + 1; }
  if (LIVE) { play("evolve", 4200, { from, to: S.form }); sfx("tune"); }
}
function getSick(t) { S.sick = true; S.doses = Math.random() < 0.4 ? 2 : 1; S.sickMin = 0; log(t, "Caught a bug and feels sick"); if (LIVE) sfx("alert"); }
function die(t, cause) {
  S.history.push({ name: S.name || "Unnamed", form: S.form, gen: S.gen, days: ageDays(t), cause, at: t, partner: S.partner ? S.partner.petName : null });
  S.stage = "dead"; S.deadAt = t; S.cause = cause; S.asleep = false; S.lightsOff = false; S.sick = false; S.letterPending = false;
  S.calls = { hunger: null, happy: null, lights: null, misbehave: null };
  log(t, cause === "old age" ? "Passed away peacefully of old age" : cause === "illness" ? "Passed away after being sick too long" : "Passed away from hunger");
  if (LIVE) sfx("sad");
}
function step(t) {
  if (S.stage === "dead") return;
  if (S.stage === "egg") { if (S.family && S.eggStart && t - S.eggStart >= EGG_MS) hatch(t); return; }
  if (S.adventure && !S.adventure.returned) {
    if (t < S.adventure.end) return;
    S.adventure.returned = true; const pl = PLACES.find(p => p.id === S.adventure.place);
    log(t, `Came home from ${pl ? pl.name : "an adventure"} with stories to tell`); if (LIVE) sfx("tune");
  }
  const cfg = STAGES[S.stage];
  const win = sleepWindow();
  const should = !!win && inWin(new Date(t).getHours(), win);
  if (should && !S.asleep) { S.asleep = true; closeCall("misbehave"); log(t, "Fell asleep"); if (!S.lightsOff) openCall("lights", t); }
  if (!should && S.asleep) { S.asleep = false; S.lightsOff = false; closeCall("lights"); log(t, "Woke up"); }
  if (S.asleep) { if (S.lightsOff) closeCall("lights"); checkCalls(t); return; }
  if (S.evolveAt && t >= S.evolveAt) { evolve(t); return; }
  if (--S.hT <= 0) { S.hunger = Math.max(0, S.hunger - 1); S.hT = jitter(cfg.hunger * (S.trait === "foodie" ? 0.75 : 1)); }
  if (--S.pT <= 0) { S.happy = Math.max(0, S.happy - 1); S.pT = jitter(cfg.happy * (S.trait === "cuddly" ? 1.2 : 1)); }
  if (S.hunger === 0) openCall("hunger", t);
  if (S.happy === 0) openCall("happy", t);
  if (--S.poopT <= 0) { if (S.poops < 4) { S.poops++; log(t, "Made a mess"); } S.poopT = jitter(cfg.poop * (S.trait === "neat" ? 1.35 : 1)); }
  if (!S.sick) { const p = (S.poops * 0.0007 + (S.weight > baseWeight() * 2 ? 0.0008 : 0) + 0.00003) * (S.trait === "brave" ? 0.5 : 1); if (Math.random() < p) getSick(t); }
  else if (++S.sickMin > 10 * 60) { die(t, "illness"); return; }
  if (S.hunger === 0) { if (++S.starveMin > 12 * 60) { die(t, "hunger"); return; } } else S.starveMin = 0;
  if (S.snackStreak > 0 && --S.snackT <= 0) { S.snackStreak--; S.snackT = 60; }
  if (cfg.mis && !S.calls.misbehave && --S.misT <= 0) { S.misT = rand(150, 360); if (S.discipline < 100 && S.hunger > 0 && S.happy > 0 && !S.sick) openCall("misbehave", t); }
  if (S.calls.misbehave && t - S.calls.misbehave.t >= CALL_LIMIT) { mistake(t, "Threw a tantrum and got away with it"); closeCall("misbehave"); }
  if (CFG.notes.length && !S.letterPending && S.nextLetterAt && t >= S.nextLetterAt) { S.letterPending = true; log(t, "Brought you a letter"); if (LIVE) sfx("tune"); }
  checkCalls(t);
  if (S.stage === "adult" && S.lifeDays && t - S.born >= S.lifeDays * DAY) die(t, "old age");
}
function simulateTo(now) {
  if (!S) return 0;
  if (S.paused) { S.lastSim = now; return 0; }
  const pending = Math.floor((now - S.lastSim) / MIN);
  if (pending <= 0) return 0;
  const cap = 60 * 24 * 90;
  LIVE = pending <= 3;
  let n = 0;
  while (now - S.lastSim >= MIN && n < cap) { S.lastSim += MIN; step(S.lastSim); n++; }
  if (n >= cap) S.lastSim = now;
  LIVE = true;
  return n;
}

/* ===================== online: account, saving, homes ===================== */
const net = window.POCKETLING_NET || createNet(window.POCKETLING_FIREBASE);
let me = null;            // { uid, name, photo }
let hid = null, house = null, unwatchHouse = null, pres = null;
let joinHid = new URLSearchParams(location.search).get("join");
let unwatchMail = null, mail = {}, visitUid = null;
const memberNames = {};
async function loadNames(uids) { for (const u of uids) if (!(u in memberNames) && net) { memberNames[u] = ""; const p = await net.profile(u); memberNames[u] = (p && p.name) || "Friend"; renderMail(); renderAlbum(); } }
let saving = false, lastRemote = 0, remoteTimer = null;
const snow = () => net ? net.serverNow() : Date.now();

function markDirty(important) {
  S.savedAt = Date.now();
  saveLocal();
  if (!me || !net) return;
  if (important) { clearTimeout(remoteTimer); remoteTimer = setTimeout(pushRemote, 2000); }
  else if (Date.now() - lastRemote > 2 * MIN) pushRemote();
  scheduleAlerts(false);
}
let lastAlerts = 0;
function scheduleAlerts(force) {
  if (!me || !net || !S.pushOn) return;
  if (!force && Date.now() - lastAlerts < 3 * MIN) return;
  lastAlerts = Date.now();
  net.saveAlerts(me.uid, predictAlerts());
}
function pushRemote() {
  if (!me || !net || saving) return;
  saving = true;
  net.savePet(me.uid, JSON.stringify(S), S.savedAt).then(() => { lastRemote = Date.now(); }).catch(() => {}).finally(() => { saving = false; });
}
async function onSignedIn(user) {
  me = { uid: user.uid, name: (user.displayName || "Friend").split(" ")[0], photo: user.photoURL || "" };
  renderAccount();
  net.saveProfile(me.uid, { name: me.name, photo: me.photo }).catch(() => {});
  try {
    const remote = await net.loadPet(me.uid);
    if (remote && remote.json) {
      let o = null; try { o = JSON.parse(remote.json); } catch (e) {}
      if (valid(o) && (freshLocal || (o.savedAt || 0) > S.savedAt)) {
        const prev = o.lastSeen;
        S = migrate(o); resetUi(); simulateTo(Date.now()); computeAway(prev); S.lastSeen = Date.now(); saveLocal();
        toast(`Welcome back! ${S.name || "Your pet"} is here.`);
      }
    }
    freshLocal = false;
    pushRemote();
  } catch (e) { toast("Couldn't reach your saved pet. Playing on this device for now."); }
  try {
    hid = await net.houseOf(me.uid);
    if (joinHid && joinHid === hid) { joinHid = null; cleanUrl(); }
    if (hid) watchHouse(hid);
  } catch (e) {}
  if (unwatchMail) unwatchMail();
  unwatchMail = net.watchMail(me.uid, v => { mail = v; handlePings(); renderMail(); renderPanel(true); });
  refreshAll();
}
function onSignedOut() {
  if (unwatchMail) unwatchMail(); unwatchMail = null; mail = {};
  me = null; if (unwatchHouse) unwatchHouse(); unwatchHouse = null; hid = null; house = null; pres = null; CFG = Object.assign({}, BAKED, { notes: [] });
  refreshAll();
}
function cleanUrl() { try { history.replaceState(null, "", location.pathname); } catch (e) {} }
function watchHouse(id) {
  if (unwatchHouse) unwatchHouse();
  hid = id;
  pres = net.presence(hid, me.uid);
  house = { presence: {}, members: {}, goals: {}, album: {} };
  unwatchHouse = net.watchHouse(hid, {
    owner: v => { if (house) { house.owner = v; onHouse(); } },
    members: v => { if (house) { house.members = v; loadNames(Object.keys(v)); onHouse(); } },
    config: v => { if (house) { house.config = v; onHouse(); } },
    presence: v => { if (house) { house.presence = v; onHouse(); } },
    goals: v => { if (house) { house.goals = v; renderGoals(); } },
    album: v => { if (house) { house.album = v; renderAlbum(); } },
  }, weekId(), () => { toast("Lost access to your home."); house = null; refreshAll(); });
  const h = net.home(hid), mine = me.uid;
  const extra = [
    h.watch("chat", v => { if (house) { house.chat = v || {}; renderChat(); } }, 40),
    h.watch(`jar/${mine}`, v => { if (house) { house.jarMine = v || {}; jarKey = ""; renderJar(); } }),
    h.watch("events", v => { if (house) { house.events = v || {}; renderCountdowns(); } }),
    h.watch("garden", v => { if (house) { house.garden = v || {}; renderGarden(); gardenDrawn = 0; } }),
    h.watch("familyPet", v => { if (house) { house.familyPet = v; renderFamPet(); } }),
    h.watch("party", v => { if (house) { house.party = v; renderExtras(); } }),
  ];
  const base = unwatchHouse; unwatchHouse = () => { base(); extra.forEach(u => typeof u === "function" && u()); };
  pushPresence(true);
}
async function createHome() {
  if (!me) return signIn();
  try { const id = await net.createHouse(me.uid); watchHouse(id); toast("Home created. Send your invite link!"); sfx("tune"); }
  catch (e) { toast("Couldn't create a home. Check the Firebase setup."); }
  refreshAll();
}
async function joinHome() {
  if (!me) return signIn();
  const id = joinHid; if (!id) return;
  try {
    if (hid && hid !== id) { if (pres) pres.clear(); await net.leaveHouse(me.uid, hid); }
    await net.joinHouse(me.uid, id); joinHid = null; cleanUrl(); watchHouse(id); toast("You joined the home!"); sfx("tune");
  } catch (e) { toast("That invite link didn't work. Ask for a new one."); }
  refreshAll();
}
async function leaveHome() {
  if (!me || !hid) return;
  try { if (pres) pres.clear(); await net.leaveHouse(me.uid, hid); } catch (e) {}
  if (unwatchHouse) unwatchHouse(); unwatchHouse = null; hid = null; house = null; pres = null;
  CFG = Object.assign({}, BAKED, { notes: [] });
  toast("You left the home."); refreshAll();
}
async function signIn() {
  if (!net) return toast("Sign-in isn't set up on this site yet.");
  audioOn();
  try { await net.signIn(); } catch (e) { toast("Sign-in didn't work. Try again."); }
}

/* shared settings live on the home and are written by its creator */
function normCfg(d) {
  const c = Object.assign({}, BAKED, { notes: [] });
  if (d && typeof d === "object") {
    for (const k of ["herName", "from", "welcome", "birthday", "anniversary", "petName"]) if (typeof d[k] === "string") c[k] = d[k];
    if (Array.isArray(d.notes)) c.notes = d.notes.filter(n => typeof n === "string" && n.trim()).map(n => n.trim());
    else if (d.notes && typeof d.notes === "object") c.notes = Object.values(d.notes).filter(n => typeof n === "string" && n.trim());
    if (typeof d.nudge === "number") c.nudge = d.nudge;
  }
  return c;
}
function isOwner() { return !!(me && house && house.owner === me.uid); }
function onHouse() {
  const before = JSON.stringify(CFG);
  CFG = normCfg(house && house.config);
  if (JSON.stringify(CFG) !== before) applyConfig();
  handlePresence();
  $("owner-card").hidden = !isOwner();
  if (isOwner()) fillOwnerForm(false);
  renderTogether();
}
function applyConfig() {
  if (!S) return;
  if (CFG.nudge && CFG.nudge > (S.lastNudge || 0)) { const first = !S.lastNudge; S.lastNudge = CFG.nudge; if (!first && alive() && CFG.notes.length) S.nextLetterAt = Date.now(); }
  if (alive() && !S.nextLetterAt && CFG.notes.length) S.nextLetterAt = Date.now() + 30 * MIN;
  if (CFG.welcome && !S.welcomeShown && !isOwner()) {
    S.welcomeShown = true;
    const L = { t: Date.now(), text: CFG.welcome, kind: "welcome", from: CFG.from };
    S.letters.push(L); markDirty(true); openLetter(L, true);
  }
  renderPanel(true);
}

/* ===================== audio + haptics ===================== */
let actx = null;
function audioOn() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (actx && actx.state === "suspended") actx.resume().catch(() => {}); }
function tone(f, start, dur) {
  const o = actx.createOscillator(), gn = actx.createGain();
  o.type = "square"; o.frequency.value = f;
  const t0 = actx.currentTime + start;
  gn.gain.setValueAtTime(0.0001, t0); gn.gain.linearRampToValueAtTime(0.03, t0 + 0.005);
  gn.gain.setValueAtTime(0.03, t0 + dur - 0.012); gn.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  o.connect(gn).connect(actx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}
function quietNow() { if (!S.quiet) return false; const h = new Date().getHours(); return h >= 22 || h < 8; }
const SFX = {
  click: [[2400, 0, .025]], ok: [[1800, 0, .05], [2400, .06, .05]], no: [[420, 0, .1], [360, .12, .14]],
  alert: [[2000, 0, .07], [2000, .14, .07], [2000, .28, .07]], eat: [[900, 0, .05], [1100, .25, .05], [900, .5, .05], [1100, .75, .05]],
  win: [[1300, 0, .06], [1700, .07, .06], [2200, .14, .1]], lose: [[900, 0, .08], [600, .1, .16]],
  tune: [[1046, 0, .09], [1318, .11, .09], [1568, .22, .09], [2093, .33, .18]], sad: [[784, 0, .22], [659, .26, .22], [523, .52, .36]],
  pop: [[1600, 0, .03], [2200, .04, .03]], giggle: [[1900, 0, .04], [2300, .06, .04], [2000, .12, .04], [2500, .18, .05]],
  dance: [[1046, 0, .1], [1318, .15, .1], [1568, .3, .1], [1318, .45, .1], [1046, .6, .1], [1568, .75, .1], [2093, .9, .2]],
  wedding: [[784, 0, .2], [1046, .25, .2], [1318, .5, .2], [1568, .75, .4], [1318, 1.2, .15], [1568, 1.4, .5]],
};
function sfx(name) {
  if (!S || !S.sound || !actx || actx.state !== "running") return;
  if (quietNow() && (name === "alert" || name === "tune")) return;
  try { (SFX[name] || []).forEach(([f, s, d]) => tone(f, s, d)); } catch (e) {}
}
function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) {} }

/* ===================== screen ===================== */
const low = document.createElement("canvas"); low.width = LW; low.height = LH;
const g = low.getContext("2d");
const cv = $("screen"), ctx = cv.getContext("2d");
let mode = "main";        // main | pick | game
let game = null, anim = null;
let petX = CX, petTarget = CX, petFacing = 0, petIdleUntil = 0;
let particles = [], hold = 0, lastAlertBeep = 0;
function resetUi() { mode = "main"; game = null; anim = null; particles = []; hold = 0; inter = null; }
function play(type, dur, data) { anim = { type, t0: performance.now(), dur, data: data || {} }; }
function spawn(type, x, y, n, opts = {}) {
  for (let i = 0; i < n; i++) particles.push({
    type, x: x + (Math.random() - 0.5) * (opts.spread || 6), y: y + (Math.random() - 0.5) * (opts.spreadY || 2),
    vx: (Math.random() - 0.5) * (opts.vx || 10), vy: -(opts.up == null ? 14 : opts.up) - Math.random() * 8, life: opts.life || 1200, born: performance.now(),
    col: ["#ff7aa0", "#ffd84d", "#8fdcf4", "#7ccf6c", "#c8adff"][rand(0, 4)],
  });
}
function fitCanvas() {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const cell = Math.max(2, Math.round(((cv.clientWidth || 300) * dpr) / LW));
  if (cv.width !== cell * LW) { cv.width = cell * LW; cv.height = cell * LH; }
}
function present() {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(low, 0, 0, cv.width, cv.height);
  const cell = cv.width / LW;
  if (cell >= 5) { ctx.fillStyle = "rgba(43, 35, 64, .06)"; for (let x = 1; x < LW; x++) ctx.fillRect(Math.round(x * cell), 0, 1, cv.height); for (let y = 1; y < LH; y++) ctx.fillRect(0, Math.round(y * cell), cv.width, 1); }
}
function special() {
  const d = new Date(), md = String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const her = CFG.herName.trim();
  if (CFG.birthday && CFG.birthday.slice(5) === md) return { kind: "birthday", text: her ? `Happy birthday, ${her}!` : "Happy birthday!" };
  if (CFG.anniversary && CFG.anniversary.slice(5) === md) {
    const n = d.getFullYear() - parseInt(CFG.anniversary.slice(0, 4), 10), sfxs = ["th", "st", "nd", "rd"], v = n % 100;
    const ord = n > 0 ? n + (sfxs[(v - 20) % 10] || sfxs[v] || sfxs[0]) + " " : "";
    return { kind: "anniversary", text: `Happy ${ord}anniversary${her ? ", " + her : ""}!` };
  }
  return null;
}
const POOP_X = [LW - 12, LW - 21, LW - 30, LW - 39];
function roamBounds(sp) { const half = sp.rx + 3; const right = S.poops ? POOP_X[S.poops - 1] - 2 - half : LW - 2 - half; return [half + 1, Math.max(half + 1, right)]; }
function currentNeed() {
  if (!S.hints) return null;
  const list = [];
  if (S.letterPending || Object.keys(mail).length) list.push("letter");
  if (S.asleep && !S.lightsOff) list.push("light");
  if (S.calls.hunger) list.push("food");
  if (S.calls.happy) list.push("heart");
  if (S.calls.misbehave) list.push("fuss");
  if (S.sick) list.push("sick");
  return list.length ? list[Math.floor(performance.now() / 2200) % list.length] : null;
}
function drawBubble(x, y, kind) {
  x = Math.max(1, Math.min(LW - 13, Math.round(x))); y = Math.max(0, Math.round(y));
  R(g, x + 1, y, 10, 9, OUT); R(g, x, y + 1, 12, 7, OUT); R(g, x + 1, y + 1, 10, 7, "#ffffff");
  R(g, x + 2, y + 9, 2, 1, OUT); R(g, x + 1, y + 10, 1, 1, OUT);
  if (kind === "food") art(g, ART.miniFood, x + 3, y + 2);
  else if (kind === "heart") art(g, ART.miniHeart, x + 3, y + 2);
  else if (kind === "sick") art(g, ART.skull, x + 3, y + 1);
  else if (kind === "fuss") text(g, "!", x + 5, y + 2, "#ef4a63");
  else if (kind === "letter") art(g, ART.miniLetter, x + 3, y + 2);
  else if (kind === "light") text(g, "Z", x + 5, y + 2, "#3b5bc9");
}
function drawPoops(n, t, clipX) {
  for (let i = 0; i < n; i++) {
    const x = POOP_X[i]; if (clipX != null && x < clipX) continue;
    art(g, ART.poop, x, FLOOR - 6);
    const ph = Math.floor(t / 400) % 2; g.fillStyle = "#9cbf6b"; g.fillRect(x + 2, FLOOR - 10 - ph, 1, 2); g.fillRect(x + 6, FLOOR - 11 + ph, 1, 2);
  }
}
function nameTag(name, x, y) {
  const s = cleanLabel(name, 8); if (!s) return;
  const w = textW(s) + 4, x0 = Math.max(0, Math.min(LW - w, Math.round(x - w / 2))), y0 = Math.max(0, y);
  g.globalAlpha = .85; R(g, x0, y0, w, 7, "#ffffff"); g.globalAlpha = 1; text(g, s, x0 + 2, y0 + 1, OUT);
}
function updateParticles(now, dt) { particles = particles.filter(p => now - p.born < p.life); for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; if (p.type === "confetti") p.vy += 20 * dt; else p.vy *= 0.98; } }
function drawParticles(now, dark) {
  for (const p of particles) {
    g.globalAlpha = Math.max(0, Math.min(1, (1 - (now - p.born) / p.life) * 1.5));
    if (p.type === "heart") art(g, ART.heart, p.x - 2, p.y - 2);
    else if (p.type === "spark") art(g, ART.sparkle, p.x - 2, p.y - 2);
    else if (p.type === "note") art(g, ART.note, p.x - 2, p.y - 2, { tint: p.col });
    else if (p.type === "flower") art(g, ART.flower, p.x - 2, p.y - 2);
    else if (p.type === "coin") art(g, ART.coin, p.x - 2, p.y - 2);
    else if (p.type === "z") text(g, "Z", Math.round(p.x), Math.round(p.y), dark ? "#c9d0ff" : "#3b5bc9");
    else if (p.type === "confetti") R(g, p.x, p.y, 1, 1, p.col);
    else if (p.type === "crumb") R(g, p.x, p.y, 1, 1, "#ffffff");
    g.globalAlpha = 1;
  }
}
function myOpts(extra) { return Object.assign({ style: S.style, sick: S.sick, hat: !!special(), elder: alive() && isElder(), t: performance.now() }, extra); }
function drawMe(x, by, o) { return drawCreature(g, petSpec(), x, by, myOpts(o)); }
function petPose(now) {
  const blink = (Math.floor(now / 150) % 28) === 0;
  let eyes = blink ? "blink" : "open", mouth = null, sq = 1 + Math.sin(now / 250) * 0.035, look = petFacing;
  if (S.asleep) { eyes = "sleep"; sq = 0.9 + Math.sin(now / 700) * 0.03; mouth = "flat"; look = 0; }
  else if (S.calls.misbehave) { eyes = "angry"; mouth = "frown"; }
  else if (S.sick || S.hunger === 0 || S.happy === 0) { eyes = blink ? "blink" : "sad"; mouth = "frown"; }
  else if (S.happy >= 3 && S.hunger >= 3 && Math.floor(now / 3000) % 5 === 0) { eyes = "happy"; mouth = "open"; }
  return { eyes, mouth, sq, look, hop: 0 };
}
function drawHome(now, opts = {}) {
  drawRoom(g, now, roomDecor(), roomFx());
  drawPoops(S.poops, now, opts.poopClip);
  drawVisitors(now, opts);
  if (!visitUid) drawFamPet(now);
  const p = Object.assign(petPose(now), interPose("me", now)), sp = petSpec();
  const walkHop = (!S.asleep && Math.abs(petTarget - petX) > 0.5) ? Math.round(Math.abs(Math.sin(now / 130))) : 0;
  const info = drawMe(petX, FLOOR - walkHop - (p.hop || 0), { sq: p.sq, eyes: p.eyes, mouth: p.mouth, look: p.look });
  if (S.partner && opts.ring !== false && Math.floor(now / 4000) % 3 === 0 && !p.hop) art(g, ART.heart, petX - 2, info.headY - 6);
  if (S.sick && !S.hints) art(g, ART.skull, LW - 9, 1);
  if (S.letterPending) art(g, ART.letter, Math.max(1, petX - sp.rx - 12), FLOOR - 7);
  const need = currentNeed();
  if (need) drawBubble(petX + info.rx - 2, info.headY - 12, need);
  else if (speech && performance.now() < speech.until && !S.asleep) drawSpeech(petX, info.headY, speech.text);
}
function renderScreen(now) {
  g.clearRect(0, 0, LW, LH);
  let dark = false;
  if (anim) renderAnim(now);
  else if (S.stage === "egg") renderEgg(now);
  else if (S.stage === "dead") renderDead(now);
  else if (mode === "game" && game) renderGame(now);
  else if (away()) renderAway(now);
  else { drawHome(now); if (S.lightsOff) { g.fillStyle = "rgba(14, 16, 46, .84)"; g.fillRect(0, 0, LW, LH); drawGlow(g, now, roomDecor()); dark = true; } }
  drawParticles(now, dark);
  if (S.paused && !anim) { R(g, 0, 0, LW, 7, "rgba(43,35,64,.75)"); text(g, "PAUSED", 2, 1, "#ffffff"); }
  present();
}
function roomDecor() { const f = visitUid && friends().find(x => x.uid === visitUid); return f && f.p.decor ? Object.assign({}, DEFAULT_DECOR, f.p.decor) : S.decor; }
function roomFx() { const f = visitUid && friends().find(x => x.uid === visitUid); return { weather: S.useWeather && S.weather && Date.now() - S.weather.t < 3 * HOUR ? S.weather.kind : null, holiday: holidayAt(new Date()), photo: f ? f.p.photo : S.photo }; }
function cushion() { R(g, CX - 10, FLOOR - 3, 20, 4, "#ff9fbb"); R(g, CX - 12, FLOOR - 2, 24, 3, "#ff9fbb"); R(g, CX - 11, FLOOR, 22, 1, "#e07393"); }
function renderEgg(now) {
  drawRoom(g, now, roomDecor(), roomFx()); drawVisitors(now); cushion();
  if (!S.family) { drawEgg(g, CX, FLOOR - 2, { tilt: Math.floor(now / 1800) % 4 === 0 ? Math.round(Math.sin(now / 120)) : 0 }); return; }
  const left = (S.eggStart + EGG_MS - Date.now()) / 1000;
  let tilt = 0;
  if (left < 25) tilt = Math.round(Math.sin(now / (left < 10 ? 70 : 140)) * (left < 10 ? 2 : 1));
  else if (Math.floor(now / 1800) % 4 === 0) tilt = Math.round(Math.sin(now / 120));
  drawEgg(g, CX, FLOOR - 2, { tilt, crack: left < 10, family: S.mystery ? null : S.family });
}
function renderDead(now) {
  R(g, 0, 0, LW, LH, "#2a2c5e");
  for (const [x, y] of STAR_PTS) R(g, x, y, 1, 1, (Math.floor(now / 600) + x) % 3 ? "#fff6c0" : "#8a8fd0");
  R(g, 0, 46, LW, 10, "#3a3d74");
  const info = drawCreature(g, GHOST, CX, 40 + Math.round(Math.sin(now / 700) * 2), { eyes: "sleep", alpha: 0.92 });
  g.fillStyle = "#ffd84d"; for (let x = -4; x <= 4; x++) g.fillRect(CX + x, info.headY - 4 + (Math.abs(x) === 4 ? 1 : 0), 1, 1);
  if (Math.random() < 0.04) spawn("spark", rand(4, LW - 4), rand(4, 34), 1, { up: 2, life: 900 });
  textC(g, "REST WELL", 49, "#c9cdf5");
}
function renderAnim(now) {
  const p = Math.min(1, (now - anim.t0) / anim.dur), d = anim.data, sp = petSpec();
  switch (anim.type) {
    case "eat": {
      drawRoom(g, now, roomDecor(), roomFx());
      const food = ART[(FOODS[d.food] || FOODS.riceball).art] || ART.meal, bites = Math.min(3, Math.floor(p * 4));
      if (bites < 3) art(g, food, 22, FLOOR + 1 - food.length, { cut: Math.ceil(food.length * bites / 3) });
      const chomp = Math.floor(now / 250) % 2;
      drawMe(48, FLOOR, { eyes: chomp ? "happy" : "open", mouth: chomp ? "smile" : "open", look: -1, sq: chomp ? 0.94 : 1 });
      if (chomp && Math.random() < 0.3) spawn("crumb", 28, FLOOR - 6, 2, { up: 8, life: 500 });
      break;
    }
    case "no": { drawRoom(g, now, roomDecor(), roomFx()); drawPoops(S.poops, now); const s = Math.floor(now / 160) % 2 ? 1 : -1; drawMe(CX + s, FLOOR, { eyes: "squeeze", mouth: "frown", look: s }); text(g, "NO", 4, 4, "#ef4a63", 2); break; }
    case "happy": {
      drawRoom(g, now, roomDecor(), roomFx()); drawPoops(S.poops, now); drawVisitors(now);
      const hop = Math.round(Math.abs(Math.sin(p * Math.PI * 3)) * 5);
      drawMe(petX, FLOOR - hop, { eyes: "happy", mouth: "open", sq: hop ? 1.05 : 0.92 });
      if (!d.spawned) { d.spawned = 1; spawn("heart", petX, 26, 4, { spread: 16, up: 18, life: 1300 }); }
      break;
    }
    case "dance": case "wedding": {
      drawRoom(g, now, roomDecor(), roomFx());
      drawVisitors(now, { dance: true });
      const hop = Math.round(Math.abs(Math.sin(now / 160)) * 4), sway = Math.round(Math.sin(now / 320) * 3);
      drawMe(petX + sway, FLOOR - hop, { eyes: "happy", mouth: "open", sq: hop ? 1.05 : 0.9, look: sway > 0 ? 1 : -1 });
      if (Math.random() < 0.15) spawn(anim.type === "wedding" ? "heart" : "note", rand(6, LW - 6), 30, 1, { up: 10, vx: 8, life: 1600 });
      if (anim.type === "wedding") { if (Math.random() < 0.3) spawn("confetti", rand(2, LW - 2), 0, 2, { up: -6, vx: 6, life: 2500 }); textC(g, d.text || "JUST MARRIED!", 3, "#ef4a63"); }
      break;
    }
    case "flush": {
      const wx = Math.round(-8 + p * (LW + 16));
      drawHome(now, { poopClip: wx + 4 });
      R(g, 0, 0, Math.max(0, wx), LH, "rgba(110, 190, 240, .55)");
      for (let y = 0; y < LH; y++) { const o = Math.round(Math.sin(y / 2 + now / 80) * 1.5); R(g, wx + o, y, 3, 1, "#5aaee8"); R(g, wx + o + 3, y, 1, 1, "#ffffff"); }
      if (Math.random() < 0.5) spawn("spark", wx, rand(4, LH - 4), 1, { up: 4, life: 400 });
      break;
    }
    case "med": {
      drawRoom(g, now, roomDecor(), roomFx());
      const ouch = p > 0.55;
      const info = drawMe(50, FLOOR, { eyes: ouch ? "squeeze" : "open", mouth: ouch ? "o" : "frown", sick: !d.cured || p < 0.6, look: -1 });
      art(g, ART.syringe, Math.min(50 - info.rx - 12, -12 + p * 70), FLOOR - 14);
      if (p > 0.7 && d.cured && !d.spawned) { d.spawned = 1; spawn("spark", 50, 30, 5, { spread: 18, up: 10 }); }
      break;
    }
    case "scold": { drawRoom(g, now, roomDecor(), roomFx()); drawMe(52 + Math.floor(now / 90) % 2, FLOOR, { eyes: "sad", mouth: "frown", sq: 0.95, look: -1 }); text(g, "!", 14, 10, "#ef4a63", 4); break; }
    case "sad": {
      drawRoom(g, now, roomDecor(), roomFx()); drawPoops(S.poops, now);
      const info = drawMe(CX, FLOOR, { eyes: "sad", mouth: "frown", sq: 0.95 });
      R(g, CX - sp.gap - 2, info.eyeY + 3 + (Math.round(p * 16) % 8), 1, 2, "#5aaee8");
      break;
    }
    case "pat": { drawRoom(g, now, roomDecor(), roomFx()); drawPoops(S.poops, now); drawVisitors(now); drawMe(petX + Math.round(Math.sin(now / 60)), FLOOR, { eyes: "happy", mouth: "open", sq: 0.94 + Math.abs(Math.sin(now / 90)) * 0.08 }); break; }
    case "hatch": {
      drawRoom(g, now, roomDecor(), roomFx()); cushion();
      if (p < 0.55) drawEgg(g, CX, FLOOR - 2, { tilt: Math.round(Math.sin(now / 60) * 2), crack: p > 0.3, family: S.mystery ? null : S.family });
      else if (p < 0.64) R(g, 0, 0, LW, LH, "#ffffff");
      else { drawMe(CX, FLOOR - 2, { eyes: Math.floor(now / 400) % 3 ? "open" : "happy", mouth: "open" }); if (!d.spawned) { d.spawned = 1; spawn("spark", CX, 34, 8, { spread: 30, up: 10, life: 1500 }); } }
      break;
    }
    case "trick": renderTrickAnim(now, p, d); break;
    case "evolve": {
      drawRoom(g, now, roomDecor(), roomFx());
      const flick = p < 0.7 ? (Math.floor(now / Math.max(60, 260 - p * 300)) % 2) : 1;
      const which = getSpec(flick ? d.to : d.from) || sp;
      if (p < 0.7) { drawCreature(g, which, CX, FLOOR, { sil: "#ffffff" }); g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(0, 0, LW, LH); }
      else drawCreature(g, which, CX, FLOOR, myOpts({ eyes: "happy", mouth: "open" }));
      if (p >= 0.7 && !d.spawned) { d.spawned = 1; spawn("spark", CX, 28, 10, { spread: 40, up: 10, life: 1500 }); }
      break;
    }
  }
}

/* ===================== care actions ===================== */
let toastTimer = null;
function toast(msg) { const t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3000); }
function why(needsAwake = true) {
  if (!S) return "Loading…";
  if (anim) return "busy";
  if (S.stage === "egg") return S.family ? "It's still an egg. It hatches soon." : "Pick an egg first.";
  if (S.stage === "dead") return `${pn()} has passed on. Start a new egg when you're ready.`;
  if (away()) return `${pn()} is out exploring. Back in ${fmtDur(S.adventure.end - Date.now())}.`;
  if (needsAwake && S.asleep) return `${pn()} is asleep. Let it rest.`;
  if (needsAwake && S.lightsOff) return "Turn the light on first.";
  return null;
}
function deny(reason) { if (reason === "busy") return; sfx("no"); buzz(20); toast(reason); }
function refuse(reason) { sfx("no"); buzz(20); play("no", 1400); if (reason) toast(reason); refreshAll(); }
function fussRefuse() { return !!S.calls.misbehave && Math.random() < 0.5; }
function done() { markDirty(true); refreshAll(); }
const ACT = {
  meal() { const w = why(); if (w) return deny(w); mode = "food-meal"; sfx("click"); refreshAll(); },
  snack() { const w = why(); if (w) return deny(w); mode = "food-snack"; sfx("click"); refreshAll(); },
  play() {
    const w = why(); if (w) return deny(w);
    if (S.sick) return refuse(`${pn()} feels too sick to play.`);
    if (fussRefuse()) return refuse(`${pn()} is throwing a tantrum. Try scolding it.`);
    mode = "pick"; sfx("click"); refreshAll();
  },
  clean() {
    const w = why(); if (w) return deny(w); play("flush", 1800, {}); sfx("ok"); buzz(10);
    if (S.poops) { log(Date.now(), "Got cleaned up"); earn(S.poops); S.stats.cleans = (S.stats.cleans || 0) + S.poops; for (let i = 0; i < S.poops; i++) bumpGoal("cleans"); }
    S.poops = 0; done();
  },
  medicine() {
    const w = why(); if (w) return deny(w);
    if (!S.sick) return refuse(`${pn()} isn't sick.`);
    S.doses = S.trait === "brave" ? 0 : S.doses - 1; const cured = S.doses <= 0; if (cured) earn(3);
    if (cured) { S.sick = false; S.sickMin = 0; S.doses = 0; log(Date.now(), "Feeling better after medicine"); } else toast("One more dose needed.");
    play("med", 2000, { cured }); sfx("ok"); buzz(10); done();
  },
  light() {
    const w = why(false); if (w) return deny(w);
    S.lightsOff = !S.lightsOff;
    if (S.asleep) { if (S.lightsOff) { closeCall("lights"); toast(`Good night, ${pn()}.`); if (S.gifts.lightNight !== dayKey(Date.now() - 10 * HOUR)) { S.gifts.lightNight = dayKey(Date.now() - 10 * HOUR); earn(2); } } else openCall("lights", Date.now()); }
    sfx("click"); done();
  },
  scold() {
    const w = why(); if (w) return deny(w);
    if (S.calls.misbehave) { S.discipline = Math.min(100, S.discipline + 25); closeCall("misbehave"); earn(2); if (S.discipline >= 100) S.stats.manners = 1; play("scold", 1800); sfx("ok"); buzz(25); toast(S.discipline >= 100 ? "Perfect manners!" : "Good. Its manners are improving."); }
    else { S.happy = Math.max(0, S.happy - 1); if (S.happy === 0) openCall("happy", Date.now()); play("sad", 1800); sfx("no"); buzz(25); toast(`${pn()} didn't do anything wrong. It's sad now.`); }
    done();
  },
  pat() {
    const w = why(); if (w) return deny(w);
    if (S.calls.misbehave) { toast(`${pn()} is sulking and won't cuddle.`); return; }
    play("pat", 1200); sfx("giggle"); buzz(12); spawn("heart", petX, 26, 3, { spread: 14, up: 16, life: 1200 });
    S.stats.cuddles = (S.stats.cuddles || 0) + 1; if (Date.now() - (S.gifts.cuddleGoal || 0) > 5 * MIN) { S.gifts.cuddleGoal = Date.now(); bumpGoal("cuddles"); }
    if (S.trait === "cuddly" && S.happy < 4 && canGetGift("cuddle", 1)) { S.happy++; closeCall("happy"); toast(`${pn()} loves cuddles!`); }
    markDirty(false);
  },
};

/* ===================== games ===================== */
const env = {
  g, now: () => performance.now(), snow,
  pet: (x, by, o = {}) => { const info = drawMe(x, by, o); if (o.tag) nameTag(S.name || "YOU", x, info.headY - 9); return info; },
  mini: (x, by, o = {}) => drawCreature(g, miniSpec(), x, by, myOpts(o)),
  partner: () => { const f = coPartner(); if (!f) return null; const c = f.p.co; return { x: typeof c.x === "number" ? c.x : CX, caught: Array.isArray(c.caught) ? c.caught : [], taps: typeof c.taps === "number" ? c.taps : 0, pet: f.p.pet, name: f.p.name }; },
  partnerMini: (x, by, o = {}) => { const f = coPartner(); const pp = f && f.p.pet; const sp = pp && getSpec(formId(pp.family || "kitten", "baby", "n")); if (sp) drawCreature(g, sp, x, by, Object.assign({ style: pp.style }, o)); },
  partnerPet: (x, by, o = {}) => { const f = coPartner(); const pp = f && f.p.pet; const sp = pp && getSpec(pp.form); if (!sp) return; const info = drawCreature(g, sp, x, by, Object.assign({ style: pp.style }, o)); if (o.tag) nameTag(pp.name || f.p.name, x, info.headY - 9); },
  room: () => { drawRoom(g, performance.now(), S.decor, roomFx()); g.fillStyle = "rgba(255,244,247,.72)"; g.fillRect(0, 0, LW, 40); },
  sfx, buzz, spawn, hold: () => hold,
  tone: (f, d) => { if (S.sound && actx && actx.state === "running") try { tone(f, 0, d); } catch (e) {} },
  petHeight: () => { const sp = petSpec(); return Math.round(sp.ry * 2 + (sp.feet || 0)); },
  petRx: () => petSpec().rx, miniRx: () => miniSpec().rx, miniH: () => { const sp = miniSpec(); return Math.round(sp.ry * 2 + (sp.feet || 0)); },
};
function startGame(id, opts = {}) {
  const w = why(); if (w) return deny(w);
  if (S.sick) return refuse(`${pn()} feels too sick to play.`);
  const def = GAME_BY_ID[id];
  game = { id, def, st: def.create(env, opts), overAt: 0 };
  mode = "game"; hold = 0; sfx("ok"); buildPad(); refreshAll();
}
function endGame() {
  if (game && game.st.coop) { coState = null; pushPresence(true); }
  const won = game && game.st.over && game.st.over.won;
  mode = "main"; game = null; hold = 0; refreshAll();
  if (won && alive()) play("happy", 1300);
}
function finishGame(over) {
  S.weight = Math.max(baseWeight(), S.weight - 1);
  if (over.won) { S.happy = Math.min(4, S.happy + 1); closeCall("happy"); }
  const prev = S.best[game.id] || 0;
  if (over.score > prev) S.best[game.id] = over.score;
  if (game.st.coop) { const f = coPartner(); if (f) addBond(f.uid, "Played a game together"); bumpGoal("together"); }
  if (over.won) { S.stats.wins = (S.stats.wins || 0) + 1; bumpGoal("wins"); if (S.trait === "playful" && S.happy < 4) S.happy++; }
  const base = game.st.coop ? (over.won ? 12 : 5) : (over.won ? 8 : 2);
  earn(Math.round(base * (S.trait === "playful" ? 1.5 : 1)));
  log(Date.now(), `${over.won ? "Won" : "Played"} ${game.def.name}`);
  markDirty(true);
}
function tickGame(now, dt) {
  const st = game.st;
  if (!st.over) { game.def.tick(st, env, dt, { hold }); if (st.coop) { coState = Object.assign({ id: st.id, seed: st.seed, start: st.start, game: game.id }, game.def.coSync ? game.def.coSync(st) : {}); } }
  if (st.over && !game.overAt) { game.overAt = now; finishGame(st.over); sfx(st.over.won ? "tune" : "lose"); }
  if (game.overAt && now - game.overAt > 2800) endGame();
}
function renderGame(now) {
  game.def.render(game.st, env);
  if (game.overAt) {
    const o = game.st.over;
    panel(g, 8, 13, LW - 16, 27);
    textC(g, o.won ? "YOU WIN!" : "TRY AGAIN", 18, o.won ? "#2f8a57" : "#8f2f4f", 1);
    textC(g, o.line || "", 27, OUT);
    if ((S.best[game.id] || 0) <= o.score && o.score > 0) textC(g, "NEW BEST!", 33, "#e9a227");
  }
}
function buildPad() {
  const pad = $("game-pad"); pad.textContent = "";
  if (!game) return;
  const items = game.def.pad || [];
  const cols = items.length === 4 ? 2 : Math.max(1, items.length);
  pad.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  items.forEach((it, i) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "gbtn"; b.textContent = it.label;
    if (game.def.padColors) { b.style.background = game.def.padColors[i]; b.style.color = "#2b2340"; b.style.borderColor = "#2b2340"; }
    b.addEventListener("pointerdown", e => {
      e.preventDefault(); audioOn(); buzz(5);
      if (!game || game.st.over) { if (game && game.overAt) endGame(); return; }
      if (it.hold) { hold = it.hold; b.classList.add("held"); try { b.setPointerCapture(e.pointerId); } catch (_) {} }
      else if (game.def.press) game.def.press(game.st, env, it.id);
    });
    const up = () => { if (it.hold && hold === it.hold) hold = 0; b.classList.remove("held"); };
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(ev => b.addEventListener(ev, up));
    pad.appendChild(b);
  });
  const q = document.createElement("button"); q.type = "button"; q.className = "gbtn wide"; q.textContent = "Stop playing";
  q.style.gridColumn = "1 / -1"; q.addEventListener("click", endGame); pad.appendChild(q);
}
function buildGamePicker() {
  const host = $("games"); host.textContent = "";
  GAMES.filter(d => !d.twoPlayer).forEach(def => {
    const b = document.createElement("button"); b.type = "button"; b.className = "game-card";
    b.appendChild(iconCanvas(def.icon));
    const t = document.createElement("div");
    const n = document.createElement("b"); n.textContent = def.name;
    const s = document.createElement("span"); s.textContent = def.blurb;
    const best = document.createElement("em"); best.dataset.game = def.id;
    t.append(n, s, best); b.appendChild(t);
    b.addEventListener("click", () => { audioOn(); startGame(def.id); });
    host.appendChild(b);
  });
}
function updateBest() { document.querySelectorAll("#games em[data-game]").forEach(el => { const v = S.best[el.dataset.game]; el.textContent = v ? `Best: ${v}` : ""; }); }

/* ===================== together: presence, visits, interactions, marriage ===================== */
let coState = null, myAct = null, lastPresence = "", lastPresenceT = 0, actCooldown = 0, lastInviteKey = "";
const handledActs = new Set(), seenFriends = new Set(), arrivedAt = {};
let pendingProposal = null, pendingFamily = null, pendingAdv = null;
function presenceObj() {
  const pet = S.stage === "dead" ? null : { name: (S.name || "").slice(0, 14), form: S.form, stage: S.stage, family: S.family, style: S.style, asleep: S.asleep, married: S.partner ? S.partner.uid : null, trait: S.trait, away: away() ? S.adventure.place : null };
  return { v: 1, name: me ? me.name : "Friend", pet, x: Math.round(petX), act: myAct, co: coState, decor: S.decor, photo: S.photo || null, sum: mySummary(), t: snow() };
}
function pushPresence(force) {
  if (!pres) return;
  const o = presenceObj(); const key = JSON.stringify(Object.assign({}, o, { t: 0 }));
  if (!force && key === lastPresence && Date.now() - lastPresenceT < 15000) return;
  lastPresence = key; lastPresenceT = Date.now();
  pres.set(o);
}
function friends() {
  if (!house || !house.presence || !me) return [];
  const out = [], t = snow();
  for (const [uid, p] of Object.entries(house.presence)) {
    if (uid === me.uid || !p || p.v !== 1) continue;
    if (typeof p.t === "number" && t - p.t > 60000) continue;
    out.push({ uid, p });
  }
  return out;
}
const fName = f => (f && f.p && f.p.name) || "Your friend";
function coPartner() { if (!game || !game.st.coop) return null; return friends().find(f => f.p.co && f.p.co.id === game.st.id) || null; }
function pendingCoop() {
  if (game) return null;
  for (const f of friends()) { const c = f.p.co; if (c && typeof c.id === "string" && typeof c.seed === "number" && typeof c.start === "number" && c.start + 20000 > snow() && GAME_BY_ID[c.game || "catch"]) return { f, co: c }; }
  return null;
}
function handlePresence() {
  const fr = friends();
  for (const f of fr) {
    if (!seenFriends.has(f.uid)) {
      seenFriends.add(f.uid); arrivedAt[f.uid] = performance.now();
      if (f.p.pet) { sfx("tune"); toast(`${fName(f)} came over${f.p.pet.name ? " with " + f.p.pet.name : ""}!`); }
    }
    const a = f.p.act;
    if (a && typeof a.id === "string" && !handledActs.has(a.id)) {
      handledActs.add(a.id);
      if (typeof a.t === "number" && Math.abs(snow() - a.t) < 30000 && (!a.to || a.to === me.uid)) applyAct(f, a);
    }
  }
  for (const uid of [...seenFriends]) if (!fr.some(f => f.uid === uid)) { seenFriends.delete(uid); delete vis[uid]; }
}
function canGetGift(type, hours) { const last = S.gifts[type] || 0; if (Date.now() - last < hours * HOUR) return false; S.gifts[type] = Date.now(); return true; }
function addBond(uid, why) {
  if (!uid || !alive()) return;
  const last = S.bondT[uid] || 0;
  if (Date.now() - last < 30 * MIN) return;
  S.bondT[uid] = Date.now();
  const before = S.bond[uid] || 0;
  S.bond[uid] = Math.min(BOND_MAX, before + 1);
  if (S.bond[uid] > before) { log(Date.now(), `${why} (friendship ${S.bond[uid]}/${BOND_MAX})`); if (S.bond[uid] === BOND_MAX) { S.stats.bff = 1; toast("Best friends! Their friendship hearts are full."); } }
  markDirty(true);
}
function sendAct(type, extra) {
  if (!pres) return;
  myAct = Object.assign({ id: Math.random().toString(36).slice(2, 10), type, t: snow() }, extra || {});
  pushPresence(true);
}
function applyAct(f, a) {
  const who = fName(f), theirPet = (f.p.pet && f.p.pet.name) || "their pet";
  if (a.type === "hearts") {
    spawn("heart", rand(10, LW - 10), 30, 8, { spread: 60, up: 18, life: 1600 }); sfx("giggle"); buzz(20);
    if (alive() && !S.asleep && !anim && mode === "main") play("happy", 1300);
    let extra = ""; if (alive() && !S.asleep && canGetGift("hearts", 1)) { S.happy = Math.min(4, S.happy + 1); closeCall("happy"); extra = ` ${pn()} feels loved.`; log(Date.now(), `${who} sent hearts`); }
    addBond(f.uid, `${who} sent hearts`);
    toast(`${who} sent you hearts!${extra}`);
  } else if (a.type === "snack") {
    if (alive() && !S.asleep && !anim && mode === "main") {
      let extra = ""; if (canGetGift("snack", 1) && S.hunger < 4) { S.hunger++; closeCall("hunger"); extra = ` ${pn()} ate it up.`; log(Date.now(), `${who} shared a snack`); }
      play("eat", 2200, { food: a.food && FOODS[a.food] ? a.food : "cupcake" }); sfx("eat"); toast(`${who} shared a snack from ${theirPet}!${extra}`);
    } else toast(`${who} shared a snack, but ${pn()} can't eat right now.`);
    addBond(f.uid, `${who} shared a snack`);
  } else if (a.type === "dance") {
    if (alive() && !S.asleep && !S.lightsOff && mode === "main") { standApart(f.uid); play("dance", 6000); sfx("dance"); buzz(15); if (canGetGift("dance", 2)) { S.happy = Math.min(4, S.happy + 1); closeCall("happy"); } toast(`${who} started a dance party!`); }
    else toast(`${who} wants to dance, but ${pn()} can't right now.`);
    addBond(f.uid, `Danced with ${theirPet}`);
  } else if (a.type === "propose") {
    pendingProposal = { f, id: a.id }; sfx("alert"); buzz(30);
  } else if (a.type === "accept" && a.ref && myAct && myAct.type === "propose" && a.ref === myAct.id) {
    marry(f);
  } else if (a.type === "decline") {
    toast(`${who} said not yet. Keep playing together!`);
  } else if (a.type === "family") {
    pendingFamily = { f, id: a.id, seed: a.seed }; sfx("alert"); buzz(30);
  } else if (a.type === "familyok" && a.ref && myAct && myAct.type === "family" && a.ref === myAct.id) {
    haveBaby(f, myAct.seed);
  } else if (a.type === "adventure" && PLACES.some(p => p.id === a.place) && typeof a.seed === "number") {
    pendingAdv = { f, id: a.id, place: a.place, seed: a.seed }; sfx("alert"); buzz(30);
  } else if (a.type === "trick" && TRICKS[a.trick]) {
    spawn("heart", rand(10, LW - 10), 26, 4, { spread: 40, up: 14 }); sfx("giggle");
    toast(`${theirPet} showed off a trick: ${TRICKS[a.trick].name.toLowerCase()}!`);
    if (alive() && !S.asleep && !anim && mode === "main" && !away()) play("happy", 1300);
  }
  markDirty(true); refreshAll();
}
function standApart(uid) {
  petX = petTarget = CX - 14;
  const v = vis[uid]; if (v) { v.x = v.target = CX + 14; v.idle = performance.now() + 7000; }
  inter = null;
}
function marry(f) {
  standApart(f.uid);
  const pp = f.p.pet || {};
  S.partner = { uid: f.uid, owner: fName(f), petName: pp.name || "their pet", form: pp.form, style: pp.style, family: pp.family, since: Date.now() };
  log(Date.now(), `Married ${S.partner.petName}!`); S.stats.married = (S.stats.married || 0) + 1; earn(30);
  pendingProposal = null;
  if (!anim) play("wedding", 7000);
  sfx("wedding"); buzz(40);
  toast(`${pn()} and ${S.partner.petName} got married!`);
  markDirty(true); refreshAll();
}
function haveBaby(f, seed) {
  if (!S.partner) return;
  const pp = f.p.pet || {};
  const mine = { uid: me.uid, name: S.name || "Pet", family: S.family, coat: S.style.coat };
  const theirs = { uid: f.uid, name: pp.name || "Pet", family: pp.family || S.family, coat: (pp.style && pp.style.coat) || "natural" };
  const [A, B] = [mine, theirs].sort((x, y) => (x.uid < y.uid ? -1 : 1));
  const r = mulberry(seed);
  const family = r() < 0.5 ? A.family : B.family;
  let coat = r() < 0.5 ? A.coat : B.coat;
  if (!COATS[coat]) coat = "natural";
  const heir = { id: String(seed), family: FAMILIES[family] ? family : S.family, coat, parents: [A.name, B.name], traits: [S.trait, pp.trait].filter(t => TRAITS[t]), t: Date.now() };
  S.stats.babies = (S.stats.babies || 0) + 1;
  if (!S.heirs.some(h => h.id === heir.id)) S.heirs.push(heir);
  if (S.heirs.length > 3) S.heirs.shift();
  S.lastBaby = Date.now(); pendingFamily = null;
  log(Date.now(), `${A.name} and ${B.name} had an egg!`);
  standApart(f.uid); play("wedding", 4000, { text: "A NEW EGG!" }); sfx("tune");
  toast("A new egg! It's waiting in the Family card.");
  markDirty(true); refreshAll();
}

/* visiting pets wander and play with yours on their own */
const vis = {};
let inter = null, nextInter = performance.now() + 6000;
function visitorList() { return S.visitors ? friends().filter(f => f.p.pet && f.p.pet.stage !== "dead" && !f.p.pet.away && getSpec(f.p.pet.form)).slice(0, 2) : []; }
function canInteract(f) { return mode === "main" && !anim && alive() && !away() && !S.asleep && !S.lightsOff && f && f.p.pet && f.p.pet.stage !== "egg" && !f.p.pet.asleep; }
function updateVisitors(now, dt) {
  const list = visitorList();
  for (const f of list) {
    if (!vis[f.uid]) vis[f.uid] = { x: petX < CX ? LW + 14 : -14, target: petX < CX ? LW - 20 : 20, facing: 0, idle: 0, waved: false };
    const v = vis[f.uid], sp = getSpec(f.p.pet.form);
    if (f.p.pet.asleep) { v.facing = 0; continue; }
    const speed = inter && inter.uid === f.uid ? inter.vSpeed || 14 : 9;
    if (Math.abs(v.target - v.x) > 0.5) { const d = Math.sign(v.target - v.x); v.x += d * Math.min(Math.abs(v.target - v.x), speed * dt); v.facing = d; }
    else {
      v.facing = 0;
      if (!v.waved && v.x > 0 && v.x < LW) { v.waved = true; v.hopUntil = now + 900; spawn("heart", v.x, 22, 2, { up: 10 }); }
      if (!(inter && inter.uid === f.uid) && now > v.idle) { v.target = 12 + Math.random() * (LW - 24); v.idle = now + 2000 + Math.random() * 4000; const gap = petSpec().rx + sp.rx + 4; if (Math.abs(v.target - petX) < gap) v.target = petX + (petX < CX ? gap : -gap); v.target = Math.max(12, Math.min(LW - 12, v.target)); }
    }
  }
  for (const k of Object.keys(vis)) if (!list.some(f => f.uid === k)) delete vis[k];
  const f = list[0];
  if (!inter && f && vis[f.uid] && vis[f.uid].waved && now > nextInter && canInteract(f)) startInter(f, now);
  if (inter) runInter(now, dt);
}
function startInter(f, now) {
  const kinds = ["hug", "chase", "hop", "gift", "highfive"];
  inter = { uid: f.uid, type: kinds[rand(0, kinds.length - 1)], t0: now, phase: "go", dur: 5200 };
  if (inter.type === "hop") inter.dur = 2600;
  if (inter.type === "chase") { inter.dur = 5000; inter.dir = petX < CX ? 1 : -1; }
}
function runInter(now, dt) {
  const f = friends().find(x => x.uid === inter.uid), v = vis[inter.uid];
  if (!f || !v || !canInteract(f)) { inter = null; nextInter = now + 8000; return; }
  const mySp = petSpec(), theirSp = getSpec(f.p.pet.form);
  const el = now - inter.t0;
  const side = Math.sign(v.x - petX) || 1;
  const touchGap = (mySp.rx + theirSp.rx) / 2 + (inter.type === "highfive" ? 3 : 1);
  if (inter.type === "hug" || inter.type === "highfive" || inter.type === "gift") {
    const meet = Math.max(mySp.rx + 4, Math.min(LW - mySp.rx - 4, (petX + v.x) / 2));
    const gapW = inter.type === "gift" ? touchGap + 6 : touchGap;
    petTarget = meet - side * gapW; v.target = meet + side * gapW; inter.vSpeed = 14;
    if (inter.phase === "go" && Math.abs(petX - petTarget) < 1 && Math.abs(v.x - v.target) < 1) {
      inter.phase = "touch"; inter.tt = now;
      if (inter.type === "hug") { spawn("heart", (petX + v.x) / 2, 24, 5, { spread: 10, up: 16 }); sfx("giggle"); }
      if (inter.type === "highfive") { spawn("spark", (petX + v.x) / 2, 26, 4, { up: 10 }); sfx("pop"); }
      if (inter.type === "gift") { spawn("flower", v.x, 30, 1, { up: 0, vx: 0, life: 1400, spread: 0 }); particles[particles.length - 1].vx = (petX - v.x) / 1.2; particles[particles.length - 1].vy = -4; sfx("ok"); }
    }
    if (inter.phase === "touch" && now - inter.tt > 2000) endInter(f, now);
  } else if (inter.type === "chase") {
    const half = el > inter.dur / 2;
    const runner = half ? "them" : "me";
    const dir = half ? -inter.dir : inter.dir;
    if (runner === "me") { petTarget = dir > 0 ? LW - mySp.rx - 4 : mySp.rx + 4; v.target = petX - dir * (touchGap + 2); inter.vSpeed = 13; }
    else { v.target = dir > 0 ? LW - theirSp.rx - 4 : theirSp.rx + 4; petTarget = v.x - dir * (touchGap + 2); inter.vSpeed = 12; }
    if (Math.random() < 0.02) sfx("giggle");
    if (el > inter.dur) endInter(f, now);
  } else if (inter.type === "hop") {
    if (Math.random() < 0.08) spawn("note", rand(10, LW - 10), 28, 1, { up: 8, vx: 6, life: 1400 });
    if (el > inter.dur) endInter(f, now);
  }
  if (el > 9000) endInter(f, now);
}
function endInter(f, now) {
  const names = `${pn()} and ${(f.p.pet && f.p.pet.name) || "their pet"}`;
  const what = { hug: "shared a hug", chase: "played tag", hop: "bounced together", gift: "swapped flowers", highfive: "high-fived" }[inter.type];
  if (canGetGift("playdate", 1)) { S.happy = Math.min(4, S.happy + 1); closeCall("happy"); }
  earn(2); S.stats.playdates = (S.stats.playdates || 0) + 1; bumpGoal("playdates");
  addBond(f.uid, `${names} ${what}`);
  inter = null; nextInter = now + 9000 + Math.random() * 9000;
  renderTogether();
}
function interPose(who, now) {
  if (!inter) return {};
  const el = now - inter.t0;
  if (inter.type === "hop") return { hop: Math.round(Math.abs(Math.sin(el / 180)) * 4), eyes: "happy", mouth: "open" };
  if (inter.phase === "touch") {
    const t = now - inter.tt;
    if (inter.type === "hug") return { eyes: "happy", mouth: "w", sq: 0.93, look: who === "me" ? 1 : -1 };
    if (inter.type === "highfive") return { hop: t < 500 ? Math.round(Math.sin(t / 500 * Math.PI) * 5) : 0, eyes: "happy", mouth: "open" };
    if (inter.type === "gift") return { eyes: "happy", mouth: "open" };
  }
  if (inter.type === "chase") return { eyes: "happy", mouth: "open" };
  return {};
}
function drawVisitors(now, opts = {}) {
  for (const f of visitorList()) {
    const p = f.p.pet, sp = getSpec(p.form), v = vis[f.uid]; if (!sp || !v) continue;
    if (p.stage === "egg") { drawEgg(g, v.x, FLOOR - 1, { family: p.family }); continue; }
    let pose = { eyes: p.asleep ? "sleep" : "open", look: v.facing };
    if (inter && inter.uid === f.uid) pose = Object.assign(pose, interPose("them", now), { look: inter.phase === "touch" ? (petX < v.x ? -1 : 1) : v.facing });
    if (opts.dance) pose = { eyes: "happy", mouth: "open", hop: Math.round(Math.abs(Math.sin(now / 160 + 1)) * 4) };
    if (v.hopUntil && now < v.hopUntil) pose.hop = Math.round(Math.abs(Math.sin((v.hopUntil - now) / 150)) * 3);
    const walkHop = Math.abs(v.target - v.x) > 0.5 ? Math.round(Math.abs(Math.sin(now / 130 + 1))) : 0;
    const info = drawCreature(g, sp, v.x, FLOOR - walkHop - (pose.hop || 0), { style: p.style, eyes: pose.eyes, mouth: pose.mouth, sq: pose.sq || 1 + Math.sin(now / 260 + 2) * 0.035, look: pose.look, t: now });
    const bub = bubbles[f.uid];
    if (bub && performance.now() < bub.until) drawSpeech(v.x, info.headY, bub.text);
    else if (now - (arrivedAt[f.uid] || 0) < 5000) nameTag(p.name || fName(f), v.x, info.headY - 9);
    else if (S.partner && S.partner.uid === f.uid && Math.floor(now / 4000) % 3 === 0) art(g, ART.heart, v.x - 2, info.headY - 6);
  }
}

/* together card */
function heartRow(n, max) { return Array.from({ length: max }, (_, i) => `<svg viewBox="0 0 20 18" aria-hidden="true"><path d="M10 16.5s-7.5-4.9-7.5-9.8C2.5 4 4.3 2.2 6.5 2.2c1.5 0 2.7.8 3.5 2 .8-1.2 2-2 3.5-2 2.2 0 4 1.8 4 4.5 0 4.9-7.5 9.8-7.5 9.8z" fill="${i < n ? "var(--accent)" : "none"}" stroke="var(--accent)" stroke-width="1.8"/></svg>`).join(""); }
let togetherKey = "";
function renderTogether() {
  if (!S) return;
  const fr = friends();
  $("pill-friend").hidden = !fr.length;
  if (fr.length) $("pill-friend").textContent = fr.length === 1 ? `${fName(fr[0])} is here` : `${fr.length} friends here`;
  const body = $("together-body");
  let state = !net ? "off" : !me ? "out" : joinHid && joinHid !== hid ? "join" : !hid ? "nohome" : "home";
  const key = JSON.stringify([state, fr.map(f => [f.uid, fName(f), f.p.pet, S.bond[f.uid] || 0]), S.partner && S.partner.uid, S.stage, !!house, S.lastBaby, S.heirs.length]);
  if (key !== togetherKey) {
    togetherKey = key;
    body.textContent = "";
    const note = (txt) => { const p = document.createElement("p"); p.className = "notice"; p.textContent = txt; body.appendChild(p); };
    const btn = (label, fn, cls = "primary") => { const b = document.createElement("button"); b.type = "button"; b.className = cls; b.textContent = label; b.addEventListener("click", fn); body.appendChild(b); return b; };
    if (state === "off") note("Playing together turns on once this site is connected to Firebase. See the setup guide in the project's README.");
    else if (state === "out") { note("Sign in with Google to save your pet online and play with someone special."); btn("Sign in with Google", signIn); }
    else if (state === "join") { note(hid ? "You've been invited to a new home. Joining will leave your current one." : "You've been invited to a home! Join to visit each other's pets."); btn("Join this home", joinHome); }
    else if (state === "nohome") { note("Create a home, then send the invite link to the person you want to play with."); btn("Create our home", createHome); }
    const list = $("friends"); list.textContent = "";
    if (state === "home") {
      fr.forEach(f => {
        const row = document.createElement("div"); row.className = "friend";
        const c = document.createElement("canvas"); c.width = LW; c.height = LH; c.setAttribute("aria-hidden", "true");
        const x = c.getContext("2d"); const p = f.p.pet; const sp = p && getSpec(p.form);
        if (sp) drawCreature(x, sp, CX, FLOOR - 2, { style: p.style, eyes: p.asleep ? "sleep" : "open" }); else if (p && p.stage === "egg") drawEgg(x, CX, FLOOR - 2, { family: p.family });
        const t = document.createElement("div");
        const b = document.createElement("b"); b.textContent = fName(f);
        const s = document.createElement("span");
        s.textContent = !p ? "Between pets right now" : p.stage === "egg" ? "Waiting for an egg to hatch" : `${p.name || "Their pet"}, ${sp ? sp.label : "a pet"}${p.asleep ? " · sleeping" : ""}${S.partner && S.partner.uid === f.uid ? " · married to " + pn() : ""}`;
        const hearts = document.createElement("span"); hearts.className = "bond"; hearts.innerHTML = heartRow(S.bond[f.uid] || 0, BOND_MAX); hearts.title = "Friendship";
        t.append(b, s, hearts); row.append(c, t); list.appendChild(row);
      });
    }
  }
  $("together-btns").hidden = state !== "home" || !fr.length;
  const f0 = fr[0];
  const busy = mode === "game" || !!anim;
  ["t-hearts", "t-snack", "t-dance", "t-catch", "t-race", "t-tug", "t-memrace", "t-fishduel", "t-visit"].forEach(id => { $(id).disabled = busy; });
  if (visitUid && !fr.some(f => f.uid === visitUid)) visitUid = null;
  $("t-visit").textContent = visitUid ? "Go back home" : f0 ? `Visit ${fName(f0)}'s room` : "Visit their room";
  $("pill-visit").hidden = !visitUid; if (visitUid) $("pill-visit").textContent = `At ${fName(fr.find(f => f.uid === visitUid))}'s`;
  const fp = f0 && f0.p.pet;
  const canPropose = f0 && alive() && S.stage === "adult" && fp && fp.stage === "adult" && !S.partner && !fp.married && (S.bond[f0.uid] || 0) >= BOND_MAX;
  $("t-marry").hidden = !canPropose; $("t-marry").disabled = busy;
  const canFamily = f0 && S.partner && S.partner.uid === f0.uid && alive() && S.stage === "adult" && fp && fp.stage === "adult";
  $("t-baby").hidden = !canFamily; $("t-baby").disabled = busy || Date.now() - (S.lastBaby || 0) < 2 * DAY;
  if (canFamily && Date.now() - (S.lastBaby || 0) < 2 * DAY) $("t-baby").textContent = "Next egg in " + fmtDur(S.lastBaby + 2 * DAY - Date.now()); else $("t-baby").textContent = "Start a family";
  let noteTxt = "";
  if (state === "home") {
    if (!fr.length) noteTxt = "Nobody else is here right now. When they open Pocketling, their pet walks into your room to play.";
    else if (!S.partner && S.stage === "adult" && fp && fp.stage === "adult" && (S.bond[f0.uid] || 0) < BOND_MAX) noteTxt = `Fill all ${BOND_MAX} friendship hearts by playing together, and these two can get married.`;
    else if (S.stage !== "adult" && !S.partner) noteTxt = "Pets play together on their own while you're both here. Grown-up pets with full friendship hearts can marry.";
    else noteTxt = "Pets play together on their own while you're both here. Hearts, snacks and dances give a small boost once an hour.";
  }
  $("together-note").textContent = noteTxt;
  $("invite-row").hidden = state !== "home";
  if (state === "home") $("invite-url").value = `${location.origin}${location.pathname}?join=${hid}`;
  $("leave-row").hidden = state !== "home";
  // invitations
  const coop = pendingCoop();
  let inv = null;
  if (pendingProposal && friends().some(f => f.uid === pendingProposal.f.uid)) inv = { key: "p" + pendingProposal.id, text: `${(pendingProposal.f.p.pet && pendingProposal.f.p.pet.name) || "Their pet"} wants to marry ${pn()}! Say yes?`, yes: acceptProposal, no: declineProposal };
  else if (pendingFamily && friends().some(f => f.uid === pendingFamily.f.uid)) inv = { key: "f" + pendingFamily.id, text: `${fName(pendingFamily.f)} wants your pets to start a family. Have an egg together?`, yes: acceptFamily, no: () => { const pf = pendingFamily; pendingFamily = null; if (pf) sendAct("decline", { to: pf.f.uid }); refreshAll(); } };
  else if (pendingAdv && friends().some(f => f.uid === pendingAdv.f.uid)) { const pl = PLACES.find(p => p.id === pendingAdv.place); inv = { key: "a" + pendingAdv.id, text: `${(pendingAdv.f.p.pet && pendingAdv.f.p.pet.name) || "Their pet"} wants ${pn()} to come to ${pl.name}! Go together?`, yes: () => { const pa = pendingAdv; pendingAdv = null; const why2 = canAdventure(pl); if (why2) { toast(why2); return refreshAll(); } startAdventure(pa.place, { seed: pa.seed, with: (pa.f.p.pet && pa.f.p.pet.name) || "a friend" }); }, no: () => { pendingAdv = null; refreshAll(); } }; }
  else if (coop) inv = { key: "c" + coop.co.id, text: `${fName(coop.f)} wants to play ${GAME_BY_ID[coop.co.game || "catch"].name}!`, yes: joinCoop, no: () => { declinedCoop = coop.co.id; refreshAll(); } };
  if (inv && inv.key === "c" + declinedCoop) inv = null;
  $("invite").hidden = !inv;
  if (inv) { $("invite-text").textContent = inv.text; invYes = inv.yes; invNo = inv.no; if (inv.key !== lastInviteKey) { lastInviteKey = inv.key; sfx("alert"); buzz(30); toast(inv.text); } }
}
let invYes = null, invNo = null, declinedCoop = "";
$("invite-yes").addEventListener("click", () => { audioOn(); if (invYes) invYes(); });
$("invite-no").addEventListener("click", () => { if (invNo) invNo(); });
function acceptProposal() {
  const p = pendingProposal; if (!p) return;
  if (!(alive() && S.stage === "adult" && !S.partner)) { toast(`${pn()} can't get married right now.`); pendingProposal = null; return refreshAll(); }
  sendAct("accept", { to: p.f.uid, ref: p.id }); marry(p.f);
}
function declineProposal() { const p = pendingProposal; pendingProposal = null; if (p) sendAct("decline", { to: p.f.uid }); refreshAll(); }
function acceptFamily() {
  const p = pendingFamily; if (!p) return;
  if (!S.partner || S.partner.uid !== p.f.uid) { pendingFamily = null; return refreshAll(); }
  sendAct("familyok", { to: p.f.uid, ref: p.id }); haveBaby(p.f, p.seed);
}
function joinCoop() {
  const inv = pendingCoop(); if (!inv) return;
  startGame(inv.co.game || "catch", { co: { id: inv.co.id, seed: inv.co.seed, start: inv.co.start, host: false } });
}
function quickTogether(type) {
  audioOn();
  const fr = friends(); if (!fr.length) return toast("Nobody else is here right now.");
  if (Date.now() < actCooldown) return; actCooldown = Date.now() + 2500;
  const f = fr[0], who = fName(f);
  if (type === "catch" || type === "race" || type === "tug" || type === "memrace" || type === "fishduel") {
    const w = why(); if (w) return deny(w);
    const co = { id: Math.random().toString(36).slice(2, 10), seed: rand(1, 1e9), start: snow() + 6000, host: true, game: type };
    startGame(type, { co }); coState = { id: co.id, seed: co.seed, start: co.start, game: type }; pushPresence(true);
    return toast(`Invited ${who} to ${GAME_BY_ID[type].name}. Starting in a few seconds.`);
  }
  if (type === "visit") { visitUid = visitUid ? null : f.uid; sfx("ok"); toast(visitUid ? `${pn()} is visiting ${who}'s room.` : `${pn()} is back home.`); return refreshAll(); }
  if (type === "propose") { sendAct("propose", { to: f.uid }); return toast(`${pn()} proposed! Waiting for ${who}…`); }
  if (type === "family") { sendAct("family", { to: f.uid, seed: rand(1, 1e9) }); return toast(`Asked ${who} to start a family…`); }
  sendAct(type, { to: f.uid });
  if (type === "hearts") { spawn("heart", petX, 26, 6, { spread: 20, up: 18 }); sfx("giggle"); toast(`Hearts sent to ${who}.`); }
  else if (type === "snack") { sfx("ok"); toast(`Sent a snack to ${who}'s pet.`); bumpGoal("snacks"); }
  else if (type === "dance") { if (alive() && !S.asleep && !S.lightsOff && !anim && mode === "main") { standApart(f.uid); play("dance", 6000); sfx("dance"); if (canGetGift("dance", 2)) { S.happy = Math.min(4, S.happy + 1); closeCall("happy"); } } toast(`Dance party with ${who}!`); }
  addBond(f.uid, { hearts: `Sent hearts to ${who}`, snack: `Shared a snack with ${who}`, dance: `Danced with ${who}` }[type]);
  refreshAll();
}
$("t-hearts").addEventListener("click", () => quickTogether("hearts"));
$("t-snack").addEventListener("click", () => quickTogether("snack"));
$("t-dance").addEventListener("click", () => quickTogether("dance"));
$("t-catch").addEventListener("click", () => quickTogether("catch"));
$("t-race").addEventListener("click", () => quickTogether("race"));
$("t-tug").addEventListener("click", () => quickTogether("tug"));
$("t-memrace").addEventListener("click", () => quickTogether("memrace"));
$("t-fishduel").addEventListener("click", () => quickTogether("fishduel"));
$("t-visit").addEventListener("click", () => quickTogether("visit"));
$("t-marry").addEventListener("click", () => quickTogether("propose"));
$("t-baby").addEventListener("click", () => quickTogether("family"));
$("invite-copy").addEventListener("click", () => {
  const v = $("invite-url").value;
  const ok = () => toast("Invite link copied. Send it to her!");
  try { navigator.clipboard.writeText(v).then(ok, () => { $("invite-url").select(); toast("Select the link and copy it."); }); } catch (e) { $("invite-url").select(); }
  if (navigator.share) navigator.share({ title: "Pocketling", text: "Come play Pocketling with me!", url: v }).catch(() => {});
});

/* ===================== main loop ===================== */
let lastFrame = 0, lastSimCheck = 0;
function loop(now) {
  requestAnimationFrame(loop);
  if (now - lastFrame < 66) return;
  const dt = Math.min(0.2, (now - (lastFrame || now)) / 1000);
  lastFrame = now;
  if (!S) return;
  if (now - lastSimCheck > 1000) { lastSimCheck = now; simTick(); }
  if (anim && now - anim.t0 >= anim.dur) { const t = anim.type, d = anim.data; anim = null; if (t === "eat" || (t === "med" && d.cured)) play("happy", 1300); refreshAll(); }
  if (mode !== "game" && !anim && alive() && !S.asleep && !S.lightsOff) {
    const [lo, hi] = roamBounds(petSpec());
    if (!inter) {
      petTarget = Math.max(lo, Math.min(hi, petTarget));
      if (Math.abs(petTarget - petX) < 0.5 && now > petIdleUntil) { petTarget = lo + Math.random() * (hi - lo); petIdleUntil = now + 1500 + Math.random() * 3500; }
    } else petTarget = Math.max(lo, Math.min(hi, petTarget));
    if (Math.abs(petTarget - petX) >= 0.5) { const dir = Math.sign(petTarget - petX); petX += dir * Math.min(Math.abs(petTarget - petX), (inter ? 13 : isElder() ? 5 : 9) * dt); petFacing = dir; } else petFacing = 0;
    petX = Math.max(lo, Math.min(hi, petX));
  }
  updateVisitors(now, dt);
  if (alive() && S.asleep && mode === "main" && Math.random() < 0.03) spawn("z", petX + 6, 26, 1, { up: 5, vx: 4, life: 2200, spread: 2 });
  if (special() && mode === "main" && Math.random() < 0.15) spawn("confetti", rand(2, LW - 2), 0, 1, { up: -6, vx: 6, life: 2500 });
  if (mode === "game" && game) tickGame(now, dt);
  if (mode === "main" && !anim && alive() && !away() && !S.asleep && !S.lightsOff && S.talk !== false && now > nextSpeech) {
    nextSpeech = now + 25000 + Math.random() * 35000;
    const pool = speechPool(); sayNow(pool[rand(0, pool.length - 1)]);
  }
  partyTick(now); gardenFrame(now);
  pushPresence(false);
  updateParticles(now, dt);
  renderScreen(now);
}
function snapKey() { return JSON.stringify(S.calls) + S.stage + S.form + S.poops + S.sick + S.asleep + S.letterPending + S.hunger + S.happy + S.lightsOff; }
function simTick() {
  const before = snapKey();
  const steps = simulateTo(Date.now());
  if (document.visibilityState === "visible") S.lastSeen = Date.now();
  if (steps) markDirty(false);
  if (attention() && Date.now() - lastAlertBeep > 10 * MIN) { lastAlertBeep = Date.now(); sfx("alert"); }
  if (before !== snapKey()) refreshAll(); else renderPanel();
  renderTogether();
  renderDecor(false);
  checkAch(); checkDaily(); refreshWeather(false);
  renderExtras(); backupTick();
  if (!S.tourDone && S.family && tourStep < 0 && $("modal").hidden && $("away").hidden && document.visibilityState === "visible") showTour(0);
}

/* ===================== DOM: quick actions, panel ===================== */
const ICONROWS = {
  meal: ["#.#.#..#.", "#.#.#.##.", "#.#.#.##.", "#####.##.", ".###..##.", "..#...##.", "..#....#.", "..#....#.", "..#....#."],
  light: ["...###...", "..#...#..", ".#.....#.", ".#..#..#.", ".#..#..#.", "..#.#.#..", "...###...", "...###...", "....#...."],
  play: ["..#####..", ".##...##.", "#.#....##", "#..#....#", "#...##..#", "#.....#.#", "##....#.#", ".##...##.", "..#####.."],
  medicine: [".#######.", "#.......#", "#...#...#", "#...#...#", "#.#####.#", "#...#...#", "#...#...#", "#.......#", ".#######."],
  clean: ["....#....", "....#....", "...###...", "..##.##..", ".##...##.", ".#.....#.", ".#.#...#.", "..#...#..", "...###..."],
  scold: ["#########", "#...#...#", "#...#...#", "#...#...#", "#.......#", "#...#...#", "#########", ".##......", ".#......."],
  snack: ["....#....", "...###...", "..#####..", ".##.####.", "#########", "#########", ".#.#.#.#.", ".#######.", "..#####.."],
  pat: [".##...##.", "####.####", "#########", "#########", ".#######.", "..#####..", "...###...", "....#....", "........."],
  attention: ["....#....", "...###...", "..#...#..", "..#...#..", "..#...#..", ".#.....#.", "#########", ".........", "...###..."],
  friends: [".##...##.", "#..#.#..#", "#..#.#..#", ".##...##.", ".........", "###...###", "#.#...#.#", ".........", "........."],
};
const QUICK = [
  { id: "meal", label: "Meal" }, { id: "snack", label: "Snack" }, { id: "play", label: "Play" }, { id: "clean", label: "Clean" },
  { id: "medicine", label: "Medicine" }, { id: "light", label: "Light off" }, { id: "scold", label: "Scold" }, { id: "pat", label: "Cuddle" },
];
const GUIDE = [
  ["meal", "Meal and snack", "A meal fills one hunger heart. A snack fills one happy heart but adds more weight, and too many in a row can make it sick."],
  ["light", "Light", "When it falls asleep at night, turn the light off within 15 minutes. It wakes up on its own in the morning."],
  ["play", "Play", "Twelve mini-games. Winning earns a happy heart, and every game burns off a little weight. Try to beat your best scores."],
  ["medicine", "Medicine", "Give it when it looks pale and a skull bubble appears. Sometimes it takes two doses."],
  ["clean", "Clean", "Flush away its droppings. A messy room is the most common way pets get sick."],
  ["scold", "Scold", "Sometimes it acts up and frowns at you even though it's full and happy. Scold it then to build manners. Scolding it for no reason makes it sad."],
  ["pat", "Cuddle", "Just for fun. Tap your pet on the screen or press Cuddle."],
  ["attention", "Needs you", "The pink badge above the screen means it needs something. Leaving it for 15 minutes counts as a care mistake."],
  ["friends", "Friends", "In a shared home your pets visit and play on their own, filling friendship hearts. Adults with full hearts can marry and have eggs."],
];
const themedIcons = [], quickEls = {};
function inkColor() { return getComputedStyle(document.body).color || OUT; }
function paintIcon(c, rows, col) { const x = c.getContext("2d"); x.clearRect(0, 0, 9, 9); x.fillStyle = col; rows.forEach((row, y) => { for (let i = 0; i < 9; i++) if (row[i] === "#") x.fillRect(i, y, 1, 1); }); }
function iconCanvas(rows) { const c = document.createElement("canvas"); c.width = 9; c.height = 9; c.setAttribute("aria-hidden", "true"); themedIcons.push({ c, rows }); paintIcon(c, rows, inkColor()); return c; }
function repaintIcons() { const col = inkColor(); themedIcons.forEach(({ c, rows }) => paintIcon(c, rows, col)); }
function buildDom() {
  QUICK.forEach((q, i) => {
    const b = document.createElement("button"); b.className = "act"; b.type = "button"; b.title = `${q.label} (key ${i + 1})`;
    b.appendChild(iconCanvas(ICONROWS[q.id]));
    const l = document.createElement("span"); l.textContent = q.label; b.appendChild(l);
    b.addEventListener("click", () => { audioOn(); buzz(6); if (S) ACT[q.id](); });
    $("actions").appendChild(b); quickEls[q.id] = { b, l };
  });
  GUIDE.forEach(([icon, title, body]) => {
    const li = document.createElement("li");
    const gi = document.createElement("div"); gi.className = "gi"; gi.appendChild(iconCanvas(ICONROWS[icon]));
    const tx = document.createElement("div"); const b = document.createElement("b"); b.textContent = title;
    const sp = document.createElement("span"); sp.textContent = body; tx.append(b, sp); li.append(gi, tx); $("guide").appendChild(li);
  });
  buildGamePicker();
  buildDecor();
  try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => setTimeout(repaintIcons, 50)); } catch (e) {}
}
function attention() { return alive() && Object.values(S.calls).some(Boolean); }
function updateControls() {
  if (!S) return;
  const picking = S.stage === "egg" && !S.family || (S.stage === "dead");
  $("egg-pick").hidden = !(S.stage === "egg" && !S.family);
  $("actions").hidden = mode !== "main" || (S.stage === "egg" && !S.family);
  $("pill-coins").textContent = String(S.coins || 0);
  $("game-pick").hidden = mode !== "pick";
  $("food-pick").hidden = !mode.startsWith("food");
  if (mode.startsWith("food")) renderFoods();
  $("game-pad").hidden = mode !== "game";
  $("keys").hidden = mode !== "main" || picking;
  if (mode === "game" && game && game.def.tapHint) { $("keys").hidden = false; $("keys").textContent = game.def.tapHint; }
  else $("keys").textContent = "Tap your pet to cuddle it. On a keyboard, keys 1 to 8 match the buttons.";
  $("pill-alert").hidden = !attention();
  const blocked = !alive() || S.asleep || S.lightsOff;
  const needs = { meal: !!S.calls.hunger, play: !!S.calls.happy && !S.sick, clean: S.poops > 0 && !blocked, medicine: S.sick && !blocked, light: S.asleep && !S.lightsOff, scold: !!S.calls.misbehave };
  for (const id in quickEls) { const { b } = quickEls[id]; b.classList.toggle("dim", id === "light" ? !alive() : blocked); b.classList.toggle("need", !!needs[id]); }
  quickEls.light.l.textContent = S.lightsOff ? "Light on" : "Light off";
  if (mode === "pick") updateBest();
}
function heartSvg(full) { return heartRow(full ? 1 : 0, 1); }
function fmtDur(ms) { ms = Math.max(0, ms); const d = Math.floor(ms / DAY), h = Math.floor((ms % DAY) / HOUR), m = Math.floor((ms % HOUR) / MIN); if (d) return `${d}d ${h}h`; if (h) return `${h}h ${m}m`; return `${Math.max(1, m)}m`; }
function fmtHour(h) { return `${h % 12 || 12} ${h < 12 ? "am" : "pm"}`; }
function fmtTime(t) {
  const d = new Date(t), now = new Date(), time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return time;
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yest. " + time;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}
function needsList() {
  const out = [];
  if (S.stage === "egg") { if (!S.family) return [["ok", "Pick an egg below the screen"]]; const left = Math.max(0, Math.ceil((S.eggStart + EGG_MS - Date.now()) / 1000)); return [["ok", left > 0 ? `Hatching in ${left}s` : "Hatching…"]]; }
  if (S.stage === "dead") return [["", S.cause === "old age" ? "Lived a long, full life" : S.cause === "illness" ? "Was sick for too long" : "Went hungry for too long"]];
  if (S.paused) out.push(["ok", "Babysitter is on: time is paused"]);
  if (S.letterPending) out.push(["ok", "Has a letter for you"]);
  if (S.asleep) out.push(S.lightsOff ? ["ok", "Sleeping"] : ["urgent", "Asleep: turn the light off"]);
  if (S.calls.hunger) out.push(["urgent", "Hungry: feed a meal"]);
  if (S.calls.happy) out.push(["urgent", "Lonely: play or give a snack"]);
  if (S.calls.misbehave) out.push(["urgent", "Acting up for no reason: scold it"]);
  if (S.sick) out.push(["urgent", S.doses > 1 ? "Sick: needs 2 doses of medicine" : "Sick: give medicine"]);
  if (S.poops) out.push(["urgent", S.poops > 1 ? `${S.poops} messes to clean` : "Made a mess: clean up"]);
  if (!S.asleep && S.lightsOff) out.push(["", "Light is off while it's awake"]);
  if (!out.some(o => o[0] === "urgent") && !S.asleep) {
    if (S.hunger <= 1) out.push(["", "Getting peckish"]); else if (S.happy <= 1) out.push(["", "A little bored"]); else if (!out.length || (out.length === 1 && S.paused)) out.push(["ok", "Happy and content"]);
  }
  return out;
}
function factsList(now) {
  const f = [];
  if (!alive()) return f;
  if (S.evolveAt) { const next = { baby: "a child", child: "a teen", teen: "an adult" }[S.stage]; f.push(["Grows into " + next, S.evolveAt > now ? "in " + fmtDur(S.evolveAt - now) : "after it wakes"]); }
  else if (S.stage === "adult") f.push(["Adult for", fmtDur(now - (S.born + 3 * DAY))]);
  const w = sleepWindow();
  f.push(["Bedtime", w ? `${fmtHour(w[0])} to ${fmtHour(w[1])}` : "Naps anytime"]);
  f.push(["Weight", `${S.weight} oz`]);
  if (S.trait && TRAITS[S.trait]) f.push(["Personality", TRAITS[S.trait].name]);
  if (S.fav && S.tried[S.fav]) f.push(["Favourite food", FOODS[S.fav].name]);
  if (isElder()) f.push(["Age", "Getting old"]);
  f.push(["Care mistakes", S.stage === "adult" ? `${S.totalMistakes} total` : `${S.mistakes} this stage`]);
  return f;
}
let lastPanelKey = "", renaming = false;
function renderPanel(force) {
  if (!S) return;
  updateControls();
  const now = Date.now();
  const sp = getSpec(S.form);
  const stageLabel = S.stage === "egg" ? "Egg" : S.stage === "dead" ? "Departed" : STAGE_LABEL[S.stage];
  const name = S.stage === "egg" ? (S.family ? `A ${S.mystery ? "mystery" : FAMILIES[S.family].name.toLowerCase()} egg` : "Choose an egg") : (S.name || (S.stage === "dead" ? "Unnamed" : "New baby"));
  const age = ageDays(now);
  let meta = `Gen ${S.gen} · ${stageLabel}`;
  if (S.stage !== "egg") meta += (sp && S.stage !== "dead" ? ` (${sp.label})` : "") + ` · ${age} ${age === 1 ? "day" : "days"} old`;
  if (S.parents) meta += ` · child of ${S.parents.join(" & ")}`;
  const needs = (S.hints || !alive()) ? needsList() : [];
  const facts = factsList(now);
  const sp2 = special();
  const key = JSON.stringify([name, meta, needs, facts, !!me, S.coins, Object.keys(mail).length, S.stage, S.name, S.paused, S.sound, S.quiet, S.hints, S.visitors, S.history.length, S.hunger, S.happy, S.discipline,
    S.letterPending, S.letters.length, S.log.length, CFG.herName, sp2 && sp2.text, renaming, S.partner && S.partner.uid, S.heirs.length, mode]);
  if (!force && key === lastPanelKey) return;
  lastPanelKey = key;
  const her = CFG.herName.trim();
  $("hello").hidden = !her;
  if (her) { $("hello").textContent = "Hi, "; const b = document.createElement("b"); b.textContent = her; $("hello").append(b); }
  $("banner").hidden = !sp2; if (sp2) $("banner").textContent = sp2.text;
  $("screen-name").textContent = name; $("pet-name").textContent = name; $("pet-meta").textContent = meta;
  $("rename-btn").hidden = !(alive() && S.name) || renaming;
  $("meters").hidden = !alive();
  $("m-hunger").innerHTML = heartRow(S.hunger, 4); $("m-happy").innerHTML = heartRow(S.happy, 4);
  $("m-disc").style.width = S.discipline + "%";
  const nd = $("needs"); nd.textContent = "";
  needs.forEach(([cls, t]) => { const c = document.createElement("span"); c.className = "chip " + cls; c.textContent = t; nd.appendChild(c); });
  const fx = $("facts"); fx.textContent = "";
  facts.forEach(([label, val]) => { const d = document.createElement("div"); d.className = "fact"; const s = document.createElement("span"); s.textContent = label; const b = document.createElement("b"); b.textContent = val; d.append(s, b); fx.appendChild(d); });
  $("letter-btn").hidden = !S.letterPending; $("letter-btn").textContent = `Read the letter ${S.name || "it"} brought you`;
  $("newegg-btn").hidden = S.stage !== "dead";
  $("newegg-btn").textContent = S.heirs.length ? "Raise the next generation" : "Start a new egg";
  const showName = (alive() && !S.name) || renaming;
  $("name-form").hidden = !showName;
  $("name-label").textContent = renaming ? `Rename ${S.name}` : "It hatched! What will you call it?";
  $("name-cancel").hidden = !renaming;
  $("name-input").placeholder = CFG.petName || (S.parents ? `${S.parents[0]} Jr.` : "Mochi");
  $("sync").textContent = !net ? "Saved in this browser." : me ? "Saved to your account, so it follows you to any device where you sign in." : "Saved in this browser only. Sign in with Google to keep it safe and use it on any device.";
  $("opt-sound").checked = !!S.sound; $("opt-quiet").checked = !!S.quiet; $("opt-pause").checked = !!S.paused; $("opt-hints").checked = !!S.hints; $("opt-visitors").checked = !!S.visitors;
  $("opt-talk").checked = S.talk !== false; $("opt-music").checked = !!S.music; $("opt-weather").checked = !!S.useWeather;
  renderAchievements(false); renderGoals(); renderMail(); renderAlbum(); renderPushRow();
  $("reset-text").textContent = alive() ? `${S.name || "Your pet"} will be gone for good. This can't be undone.` : "This replaces the current egg.";
  $("letters-card").hidden = !S.letters.length;
  $("letters-count").textContent = S.letters.length ? String(S.letters.length) : "";
  const ll = $("letters"); ll.textContent = "";
  S.letters.slice().reverse().forEach(L => {
    const li = document.createElement("li"); const b = document.createElement("button"); b.type = "button";
    const t = document.createElement("span"); t.className = "l-text"; t.textContent = L.text.split("\n")[0];
    const d = document.createElement("span"); d.className = "l-date"; d.textContent = (L.kind === "welcome" ? "Welcome note · " : L.kind === "mail" ? `From ${L.from} · ` : "") + new Date(L.t).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    b.append(t, d); b.addEventListener("click", () => openLetter(L)); li.appendChild(b); ll.appendChild(li);
  });
  const di = $("diary"); di.textContent = "";
  const entries = S.log.slice(-30).reverse();
  if (!entries.length) { const li = document.createElement("li"); li.className = "plain"; li.textContent = "Nothing yet. Events will show up here."; di.appendChild(li); }
  entries.forEach(e => { const li = document.createElement("li"); const tm = document.createElement("time"); tm.textContent = fmtTime(e.t); const s = document.createElement("span"); s.textContent = e.text; li.append(tm, s); di.appendChild(li); });
  renderBook(); renderFamily(); renderEggs();
  const mem = $("memories"); mem.textContent = "";
  $("memories-card").hidden = !S.history.length;
  S.history.slice().reverse().forEach(h => {
    const li = document.createElement("li");
    const hs = getSpec(OLD_FORMS[h.form] || h.form);
    const c = document.createElement("canvas"); c.width = 40; c.height = 34; c.setAttribute("aria-hidden", "true");
    const x = c.getContext("2d"); R(x, 0, 28, 40, 6, "#a8dc84"); R(x, 26, 14, 10, 15, "#b5aec8"); R(x, 27, 13, 8, 1, "#b5aec8"); R(x, 28, 18, 6, 1, "#8d86a3"); R(x, 30, 16, 2, 5, "#8d86a3"); art(x, ART.flower, 21, 25);
    if (hs) drawCreature(x, hs, 14, 30, { eyes: "sleep", alpha: 0.75, style: { coat: "natural" } });
    const t = document.createElement("div");
    const a = document.createElement("b"); a.textContent = `${h.name}, ${hs ? hs.label : "a pet"}`;
    const b = document.createElement("span"); b.className = "m-meta"; b.textContent = `Gen ${h.gen} · ${h.days} days · ${h.cause}${h.partner ? " · married to " + h.partner : ""}`;
    t.append(a, b); li.append(c, t); mem.appendChild(li);
  });
}
function renderAccount() {
  const a = $("acct"); a.textContent = "";
  if (!net) { $("acct-text").textContent = "Online saving isn't set up on this site yet."; $("acct-btn").hidden = true; return; }
  if (me) {
    if (me.photo) { const img = document.createElement("img"); img.src = me.photo; img.alt = ""; img.referrerPolicy = "no-referrer"; a.appendChild(img); }
    const s = document.createElement("span"); s.style.fontWeight = "800"; s.textContent = me.name; a.appendChild(s);
    $("acct-text").textContent = `Signed in as ${me.name}. Your pet saves to your Google account.`;
    $("acct-btn").textContent = "Sign out"; $("acct-btn").hidden = false;
  } else {
    const b = document.createElement("button"); b.className = "signin"; b.type = "button";
    b.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.4 5.7c4.3-4 6.9-9.9 6.9-17.2z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.2-8.5 2.2-6.3 0-11.6-4.1-13.5-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg><span>Sign in</span>`;
    b.addEventListener("click", signIn); a.appendChild(b);
    $("acct-text").textContent = "Sign in with Google to save your pet and play with friends.";
    $("acct-btn").textContent = "Sign in with Google"; $("acct-btn").hidden = false;
  }
}
$("acct-btn").addEventListener("click", () => { if (me) { if (pres) pres.clear(); net.signOut(); } else signIn(); });
$("leave-btn").addEventListener("click", leaveHome);

/* egg picker: new eggs and the nursery */
let eggKey = "";
function renderEggs() {
  if (!(S.stage === "egg" && !S.family)) return;
  const key = JSON.stringify(S.heirs);
  if (key === eggKey && $("eggs").childElementCount) return; eggKey = key;
  const host = $("eggs"); host.textContent = "";
  $("egg-title").textContent = S.heirs.length ? "Raise the next generation" : "Choose your egg";
  $("egg-sub").textContent = S.heirs.length ? "Eggs from your pets' family are waiting, or pick a brand new one." : "Each egg hatches into a different animal.";
  const mk = (label, sub, drawFn, fn, cls) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "egg-btn" + (cls ? " " + cls : "");
    const c = document.createElement("canvas"); c.width = 32; c.height = 32; c.setAttribute("aria-hidden", "true"); drawFn(c.getContext("2d"));
    const t = document.createElement(cls ? "div" : "span"); const n = document.createElement("b"); n.textContent = label; const s = document.createElement("small"); s.textContent = sub; s.style.display = "block";
    if (cls) { t.append(n, s); b.append(c, t); } else { b.append(c, n, s); }
    b.addEventListener("click", () => { audioOn(); fn(); }); host.appendChild(b);
  };
  S.heirs.forEach(h => mk(`Child of ${h.parents.join(" & ")}`, `A ${FAMILIES[h.family].name.toLowerCase()} egg from your family`, x => drawEgg(x, 16, 31, { family: h.family }), () => chooseHeir(h), "heir-btn"));
  FAMILY_ORDER.forEach(f => mk(FAMILIES[f].name, FAMILIES[f].blurb, x => drawEgg(x, 16, 31, { family: f }), () => chooseEgg(f)));
  mk("Mystery", "Could be anything!", x => drawEgg(x, 16, 31, {}), () => chooseEgg("mystery"));
}
function chooseEgg(f) {
  S.mystery = f === "mystery";
  S.family = S.mystery ? FAMILY_ORDER[rand(0, FAMILY_ORDER.length - 1)] : f;
  S.eggStart = Date.now(); S.lastSim = Date.now();
  log(Date.now(), S.mystery ? "Picked a mystery egg" : `Picked a ${FAMILIES[S.family].name.toLowerCase()} egg`);
  sfx("tune"); markDirty(true); refreshAll(); pushPresence(true);
}
function chooseHeir(h) {
  S.family = h.family; S.parents = h.parents; S.style.coat = h.coat || S.style.coat; S.mystery = false; S.parentTraits = h.traits && h.traits.length ? h.traits : null;
  S.heirs = S.heirs.filter(x => x.id !== h.id);
  S.eggStart = Date.now(); S.lastSim = Date.now();
  log(Date.now(), `Started raising the child of ${h.parents.join(" & ")}`);
  sfx("tune"); markDirty(true); refreshAll(); pushPresence(true);
}

/* family card */
let familyKey = "";
function renderFamily() {
  const key = JSON.stringify([S.partner, S.heirs, S.parents, S.name]);
  if (key === familyKey) return; familyKey = key;
  const host = $("family"); host.textContent = "";
  const show = S.partner || S.heirs.length || S.parents;
  $("family-card").hidden = !show;
  const line = (drawFn, title, sub) => {
    const row = document.createElement("div"); row.className = "family-line";
    const c = document.createElement("canvas"); c.width = LW; c.height = LH; c.setAttribute("aria-hidden", "true"); drawFn(c.getContext("2d"));
    const t = document.createElement("div"); const b = document.createElement("b"); b.textContent = title; const s = document.createElement("span"); s.textContent = sub;
    t.append(b, s); row.append(c, t); host.appendChild(row);
  };
  if (S.partner) { const psp = getSpec(S.partner.form); line(x => { if (psp) drawCreature(x, psp, CX, FLOOR - 2, { style: S.partner.style, eyes: "happy", mouth: "w" }); }, `Married to ${S.partner.petName}`, `${S.partner.owner}'s pet · since ${new Date(S.partner.since).toLocaleDateString([], { month: "short", day: "numeric" })}`); }
  if (S.parents) line(x => { const sp = getSpec(S.form); if (sp && alive()) drawCreature(x, sp, CX, FLOOR - 2, { style: S.style }); else drawEgg(x, CX, FLOOR - 2, { family: S.family }); }, `${pn()}'s parents`, S.parents.join(" & "));
  S.heirs.forEach(h => line(x => drawEgg(x, CX, FLOOR - 2, { family: h.family }), `Egg in the nursery`, `Child of ${h.parents.join(" & ")}. It hatches when you start the next generation.`));
}

/* pet book */
let bookKey = "";
function renderBook() {
  if (!$("book-details").open) { $("book-count").textContent = `${Object.keys(S.seen).length} found`; return; }
  const k = JSON.stringify(S.seen);
  if (k === bookKey) return; bookKey = k;
  const host = $("book"); host.textContent = "";
  let n = 0;
  FAMILY_ORDER.forEach(fam => {
    const sec = document.createElement("div"); sec.className = "book-family";
    const h = document.createElement("h3"); h.textContent = FAMILIES[fam].name;
    const cnt = document.createElement("span"); h.appendChild(cnt);
    const grid = document.createElement("div"); grid.className = "book";
    let fn = 0;
    BOOK_STAGES.forEach(sv => {
      const [stage, variant] = sv.split("."); const id = formId(fam, stage, variant); const sp = getSpec(id); const seen = !!S.seen[id]; if (seen) { n++; fn++; }
      const fig = document.createElement("figure");
      const c = document.createElement("canvas"); c.width = LW; c.height = LH;
      drawCreature(c.getContext("2d"), sp, CX, FLOOR - 2, seen ? { eyes: "open" } : { sil: "#9a94b5" });
      c.setAttribute("role", "img"); c.setAttribute("aria-label", seen ? sp.label : "Not discovered yet");
      const cap = document.createElement("figcaption"); cap.textContent = seen ? sp.label : "???";
      fig.append(c, cap); grid.appendChild(fig);
    });
    cnt.textContent = `${fn}/${BOOK_STAGES.length}`;
    sec.append(h, grid); host.appendChild(sec);
  });
  $("book-count").textContent = `${n} of ${FAMILY_ORDER.length * BOOK_STAGES.length}`;
}
$("book-details").addEventListener("toggle", () => { bookKey = ""; renderBook(); });
function refreshAll() { renderPanel(true); renderTogether(); renderExtras(); }

/* ===================== decorate ===================== */
function mapNames(o) { const r = {}; for (const k in o) r[k] = typeof o[k] === "string" ? o[k] : o[k].name; return r; }
const ROOM_GROUPS = [["wall", "Wallpaper", WALLS], ["floor", "Floor", FLOORS], ["window", "Window", WINDOWS], ["curtain", "Curtains", CURTAINS], ["art", "Wall art", ARTS], ["ceiling", "Hanging", CEILINGS], ["left", "Left corner", ITEMS], ["right", "Right corner", ITEMS], ["rug", "Rug", RUGS]];
const PET_GROUPS = [["coat", "Colour", COATS], ["head", "On its head", HEADWEAR], ["face", "Face", FACEWEAR], ["neck", "Around its neck", NECKWEAR]];
const decoButtons = { room: {}, pet: {} };
let decoTab = "room", decoKey = "";
function buildDecor() {
  const mk = (host, groups, kind) => groups.forEach(([key, label, opts]) => {
    const grp = document.createElement("div"); grp.className = "opt-group";
    const h = document.createElement("h3"); h.textContent = label; h.id = `og-${kind}-${key}`;
    const row = document.createElement("div"); row.className = "opt-row"; row.setAttribute("role", "group"); row.setAttribute("aria-labelledby", h.id);
    decoButtons[kind][key] = {};
    for (const [val, name] of Object.entries(mapNames(opts))) {
      const b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.setAttribute("aria-pressed", "false");
      const c = document.createElement("canvas"); c.width = kind === "pet" ? 50 : LW; c.height = kind === "pet" ? 35 : LH; c.setAttribute("aria-hidden", "true");
      const s = document.createElement("span"); s.textContent = name; b.append(c, s);
      b.addEventListener("click", () => { audioOn(); buzz(6); pickDecor(kind, key, val, b); });
      row.appendChild(b); decoButtons[kind][key][val] = { b, c, s, name };
    }
    grp.append(h, row); host.appendChild(grp);
  });
  mk($("deco-room"), ROOM_GROUPS, "room"); mk($("deco-pet"), PET_GROUPS, "pet");
  const setTab = t => { decoTab = t; $("tab-room").setAttribute("aria-selected", String(t === "room")); $("tab-pet").setAttribute("aria-selected", String(t === "pet")); $("deco-room").hidden = t !== "room"; $("deco-pet").hidden = t !== "pet"; renderDecor(true); };
  $("tab-room").addEventListener("click", () => setTab("room")); $("tab-pet").addEventListener("click", () => setTab("pet"));
  $("deco-details").addEventListener("toggle", () => renderDecor(true));
  $("deco-random").addEventListener("click", () => {
    audioOn(); sfx("tune");
    const pick = o => { const k = Object.keys(o); return k[rand(0, k.length - 1)]; };
    const pickOwned = (kind, key, opts) => { const ok = Object.keys(opts).filter(v => isOwned(kind, key, v)); return ok[rand(0, ok.length - 1)]; };
    if (decoTab === "room") for (const [key, , opts] of ROOM_GROUPS) S.decor[key] = pickOwned("room", key, opts); else for (const [key, , opts] of PET_GROUPS) S.style[key] = pickOwned("pet", key, opts);
    markDirty(true); renderDecor(true); pushPresence(true);
  });
  $("deco-reset").addEventListener("click", () => { if (decoTab === "room") S.decor = Object.assign({}, DEFAULT_DECOR); else S.style = Object.assign({}, DEFAULT_STYLE); sfx("click"); markDirty(true); renderDecor(true); pushPresence(true); });
}
function renderDecor(force) {
  if (!S || !$("deco-details").open) return;
  const k = JSON.stringify([decoTab, S.decor, S.style, S.form, new Date().getHours()]);
  if (!force && k === decoKey) return; decoKey = k;
  const now = performance.now();
  if (decoTab === "room") {
    for (const [key] of ROOM_GROUPS) for (const [val, { b, c, s, name }] of Object.entries(decoButtons.room[key])) { b.setAttribute("aria-pressed", String(S.decor[key] === val)); priceLabel("room", key, val, b, s, name); const x = c.getContext("2d"); x.clearRect(0, 0, LW, LH); drawRoom(x, now, Object.assign({}, S.decor, { [key]: val })); }
  } else {
    const sp = alive() ? petSpec() : getSpec(formId(S.family || "kitten", "child", "n"));
    for (const [key] of PET_GROUPS) for (const [val, { b, c, s, name }] of Object.entries(decoButtons.pet[key])) {
      b.setAttribute("aria-pressed", String(S.style[key] === val)); priceLabel("pet", key, val, b, s, name);
      const x = c.getContext("2d"); x.clearRect(0, 0, 50, 35); R(x, 0, 0, 50, 35, "#fff4f7"); R(x, 0, 30, 50, 5, "#f6dcc0");
      drawCreature(x, sp, 25, 32, { style: Object.assign({}, S.style, { [key]: val }), eyes: "open" });
    }
  }
}

/* ===================== away summary, letters, photo ===================== */
function computeAway(prevSeen) {
  if (!S || !prevSeen) return;
  const gap = Date.now() - prevSeen;
  const items = S.log.filter(e => e.t > prevSeen && (gap > 6 * HOUR || !/^(Fell asleep|Woke up)$/.test(e.text)));
  if (gap < 20 * MIN || !items.length || S.stage === "egg") return;
  const her = CFG.herName.trim();
  $("away-title").textContent = alive() ? `${pn()} missed you${her ? ", " + her : ""}!` : "While you were away";
  $("away-sub").textContent = `You were away for ${fmtDur(gap)}. Here's what happened.`;
  const ul = $("away-list"); ul.textContent = "";
  const shown = items.slice(-8);
  if (items.length > shown.length) { const li = document.createElement("li"); li.className = "plain"; li.textContent = `…and ${items.length - shown.length} earlier events in the diary.`; ul.appendChild(li); }
  shown.forEach(e => { const li = document.createElement("li"); const tm = document.createElement("time"); tm.textContent = fmtTime(e.t); const s = document.createElement("span"); s.textContent = e.text; li.append(tm, s); ul.appendChild(li); });
  $("away").hidden = false;
}
function openLetter(L, isNew) {
  $("p-head").textContent = L.kind === "welcome" ? "A note came with your egg" : L.kind === "mail" ? `A letter from ${L.from}` : isNew ? `${pn()} brought you a letter` : "A letter";
  $("p-body").textContent = L.text;
  const from = L.kind === "mail" ? "" : (L.from || CFG.from || "").trim();
  $("p-sign").textContent = from; $("p-sign").hidden = !from;
  $("modal").hidden = false; setTimeout(() => $("p-close").focus(), 30);
}
function openPendingLetter() {
  if (!S.letterPending) return;
  const notes = CFG.notes;
  if (!notes.length) { S.letterPending = false; refreshAll(); return; }
  const L = { t: Date.now(), text: notes[S.letterIdx % notes.length], from: CFG.from };
  S.letterIdx++; S.letterPending = false; S.nextLetterAt = Date.now() + rand(10, 18) * HOUR;
  S.letters.push(L); if (S.letters.length > 200) S.letters.shift();
  markDirty(true); sfx("tune"); buzz(15); openLetter(L, true); spawn("heart", petX, 26, 5, { spread: 20, up: 16 }); refreshAll();
}
$("p-close").addEventListener("click", () => { $("modal").hidden = true; });
$("modal").addEventListener("click", e => { if (e.target.id === "modal") $("modal").hidden = true; });
$("letter-btn").addEventListener("click", () => { audioOn(); openPendingLetter(); });
async function savePhoto() {
  const W = 880, H = 760, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  const gr = x.createLinearGradient(0, 0, W, H); gr.addColorStop(0, "#ffe3ec"); gr.addColorStop(1, "#e9e1ff");
  x.fillStyle = gr; x.fillRect(0, 0, W, H); x.fillStyle = OUT; x.fillRect(34, 34, 812, 572);
  x.imageSmoothingEnabled = false; x.drawImage(low, 40, 40, 800, 560);
  x.fillStyle = OUT; x.font = "800 40px Nunito, sans-serif"; x.textBaseline = "top";
  const sp = getSpec(S.form);
  x.fillText(S.stage === "egg" ? "A new egg" : (S.name || "My pocketling"), 40, 636);
  x.font = "700 24px Nunito, sans-serif"; x.fillStyle = "#8f2f4f";
  const d = new Date();
  x.fillText(`${sp && alive() ? sp.label : S.stage === "dead" ? "Remembered" : "Egg"} · Gen ${S.gen} · ${d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}`, 40, 690);
  const blob = await new Promise(r => c.toBlob(r, "image/png"));
  if (!blob) return toast("Couldn't make the photo.");
  const fname = `${(S.name || "pocketling").replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}-${d.toISOString().slice(0, 10)}.png`;
  const file = new File([blob], fname, { type: "image/png" });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: S.name || "Pocketling" }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = fname; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
}
$("photo-btn").addEventListener("click", savePhoto);

/* owner panel */
let ownerDirty = false;
function fillOwnerForm(force) {
  if (!isOwner() || (ownerDirty && !force)) return;
  $("cfg-her").value = CFG.herName; $("cfg-from").value = CFG.from; $("cfg-welcome").value = CFG.welcome;
  $("cfg-notes").value = CFG.notes.join("\n"); $("cfg-bday").value = CFG.birthday; $("cfg-anniv").value = CFG.anniversary; $("cfg-petname").value = CFG.petName;
}
$("owner-form").addEventListener("input", () => { ownerDirty = true; $("cfg-status").textContent = ""; });
function formCfg() {
  return { herName: $("cfg-her").value.trim(), from: $("cfg-from").value.trim(), welcome: $("cfg-welcome").value.trim(),
    notes: $("cfg-notes").value.split("\n").map(s => s.trim()).filter(Boolean).slice(0, 200),
    birthday: $("cfg-bday").value, anniversary: $("cfg-anniv").value, petName: $("cfg-petname").value.trim(), nudge: CFG.nudge || 0 };
}
async function saveCfg(extra) {
  if (!isOwner()) return;
  $("cfg-status").textContent = "Saving…";
  try { await net.setConfig(hid, Object.assign(formCfg(), extra || {})); ownerDirty = false; $("cfg-status").textContent = extra && extra.nudge ? "Sent. Her pet brings the next note the next time it's awake and her page is open." : "Saved. She'll see it the next time she opens Pocketling."; }
  catch (e) { $("cfg-status").textContent = "Couldn't save. Check your connection and try again."; }
}
$("owner-form").addEventListener("submit", e => { e.preventDefault(); saveCfg(); });
$("cfg-nudge").addEventListener("click", () => saveCfg({ nudge: Date.now() }));
$("cfg-preview").addEventListener("click", () => { const c = formCfg(); openLetter({ text: c.notes[0] || c.welcome || "Write a note above to preview it here.", from: c.from, kind: c.notes[0] ? "" : "welcome" }, true); });

/* rename, new egg, save codes, settings */
$("rename-btn").addEventListener("click", () => { renaming = true; $("name-input").value = S.name; renderPanel(true); $("name-input").focus(); });
$("name-cancel").addEventListener("click", () => { renaming = false; $("name-input").value = ""; renderPanel(true); });
$("name-form").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("name-input").value.trim().slice(0, 14) || $("name-input").placeholder || "Mochi";
  const was = S.name; S.name = v; $("name-input").value = ""; renaming = false;
  audioOn(); sfx("ok"); log(Date.now(), was ? `Renamed from ${was} to ${v}` : `Named ${v}`);
  if (S.partner && was !== v) S.partner = Object.assign({}, S.partner);
  markDirty(true); renderPanel(true); pushPresence(true);
});
function newEggFlow() {
  if (alive()) S.history.push({ name: S.name || "Unnamed", form: S.form, gen: S.gen, days: ageDays(Date.now()), cause: "sent off to a new home", at: Date.now(), partner: S.partner ? S.partner.petName : null });
  S = newPet(S); resetUi(); petX = CX; petTarget = CX;
  log(Date.now(), "Ready for a new egg");
  sfx("tune"); markDirty(true); eggKey = ""; refreshAll(); renderDecor(true); pushPresence(true);
  setTimeout(() => $("egg-pick").scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
}
$("newegg-btn").addEventListener("click", () => { audioOn(); newEggFlow(); });
$("reset-btn").addEventListener("click", () => { if (S.stage === "dead") return newEggFlow(); $("reset-confirm").hidden = false; $("reset-btn").hidden = true; });
$("reset-no").addEventListener("click", () => { $("reset-confirm").hidden = true; $("reset-btn").hidden = false; });
$("reset-yes").addEventListener("click", () => { $("reset-confirm").hidden = true; $("reset-btn").hidden = false; audioOn(); newEggFlow(); });
function encodeSave() { return "PKL1:" + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
function decodeSave(s) { s = s.trim(); if (!s.startsWith("PKL1:")) throw new Error("bad"); const o = JSON.parse(decodeURIComponent(escape(atob(s.slice(5).replace(/\s+/g, ""))))); if (!valid(o)) throw new Error("bad"); return o; }
$("code-copy").addEventListener("click", () => {
  const code = encodeSave(), out = $("code-out"); out.value = code; out.hidden = false;
  const fallback = () => { out.focus(); out.select(); $("code-status").textContent = "Select the code above and copy it."; };
  try { navigator.clipboard.writeText(code).then(() => { $("code-status").textContent = "Copied. Paste it on your other device under Load a save code."; }, fallback); } catch (e) { fallback(); }
});
$("code-load-open").addEventListener("click", () => { $("code-in").hidden = false; $("code-load").hidden = false; $("code-in").focus(); $("code-status").textContent = ""; });
$("code-load").addEventListener("click", () => {
  try {
    const o = migrate(decodeSave($("code-in").value)); const prev = o.lastSeen;
    S = o; resetUi(); simulateTo(Date.now()); computeAway(prev); S.lastSeen = Date.now();
    markDirty(true); refreshAll(); renderDecor(true); pushPresence(true);
    $("code-in").value = ""; $("code-in").hidden = true; $("code-load").hidden = true;
    $("code-status").textContent = `Loaded ${S.name || "your pet"}.`; sfx("tune");
  } catch (e) { $("code-status").textContent = "That code didn't work. Copy the whole code, including PKL1: at the start."; }
});
$("opt-sound").addEventListener("change", e => { S.sound = e.target.checked; audioOn(); if (S.sound) sfx("ok"); markDirty(true); });
$("opt-quiet").addEventListener("change", e => { S.quiet = e.target.checked; markDirty(true); });
$("opt-pause").addEventListener("change", e => {
  simulateTo(Date.now()); S.paused = e.target.checked; S.lastSim = Date.now();
  log(Date.now(), S.paused ? "Babysitter took over" : "Babysitter went home");
  toast(S.paused ? "Time is paused. Nothing happens until you switch it off." : "Welcome back. Time is running again.");
  markDirty(true); renderPanel(true);
});
$("opt-hints").addEventListener("change", e => { S.hints = e.target.checked; markDirty(true); renderPanel(true); });
$("opt-visitors").addEventListener("change", e => { S.visitors = e.target.checked; markDirty(true); });
$("opt-talk").addEventListener("change", e => { S.talk = e.target.checked; if (S.talk) { audioOn(); sayNow("YAY! HI!"); } else speech = null; markDirty(true); });
$("away-close").addEventListener("click", () => { $("away").hidden = true; });
$("pick-cancel").addEventListener("click", () => { mode = "main"; refreshAll(); });

/* screen taps */
function lcdPoint(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * LW, (e.clientY - r.top) / r.height * LH]; }
cv.addEventListener("pointerdown", e => {
  audioOn();
  if (!S) return;
  const [x, y] = lcdPoint(e);
  if (mode === "game" && game) {
    e.preventDefault();
    if (game.overAt) return endGame();
    if (game.def.holdTap) { hold = x < CX ? -1 : 1; try { cv.setPointerCapture(e.pointerId); } catch (_) {} return; }
    if (game.def.tap) game.def.tap(game.st, env, x, y);
    return;
  }
  if (anim) return;
  if (S.stage === "dead") { toast("Tap the button below to start the next generation."); return; }
  if (S.stage === "egg") { sfx("pop"); spawn("spark", x, y, 2, { up: 6, life: 600 }); return; }
  if (away()) { toast(`${pn()} is out exploring. Back in ${fmtDur(S.adventure.end - Date.now())}.`); return; }
  if (S.adventure && S.adventure.returned) { adventureBack(); return; }
  if (Object.keys(mail).length) { openMail(); return; }
  if (S.letterPending) { openPendingLetter(); return; }
  const sp = petSpec();
  if (Math.abs(x - petX) <= sp.rx + 4 && y > FLOOR - sp.ry * 2 - 10) ACT.pat();
});
const endHold = () => { if (game && game.def.holdTap) hold = 0; };
cv.addEventListener("pointerup", endHold); cv.addEventListener("pointercancel", endHold);

/* keyboard */
document.addEventListener("keydown", e => {
  if (!$("modal").hidden) { if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); $("modal").hidden = true; } return; }
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target && e.target.tagName)) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (mode === "game" && game) {
    const pad = game.def.pad || [];
    if (k === "escape") return endGame();
    if (game.overAt) return;
    if (k === "arrowleft" || k === "arrowright") {
      e.preventDefault();
      const it = pad.find(p => p.hold === (k === "arrowleft" ? -1 : 1));
      if (it) hold = it.hold; else if (!e.repeat && pad.length >= 2 && game.def.press) game.def.press(game.st, env, pad[k === "arrowleft" ? 0 : pad.length - 1].id);
      return;
    }
    if ((k === " " || k === "enter" || k === "arrowup") && !e.repeat && pad[0] && !pad[0].hold && game.def.press) { e.preventDefault(); game.def.press(game.st, env, pad[0].id); return; }
    const i = parseInt(k, 10); if (i >= 1 && i <= pad.length && !e.repeat && game.def.press) game.def.press(game.st, env, pad[i - 1].id);
    return;
  }
  if (mode === "pick") { if (k === "escape") { mode = "main"; refreshAll(); } return; }
  const i = parseInt(k, 10);
  if (i >= 1 && i <= 8 && !e.repeat) { audioOn(); ACT[QUICK[i - 1].id](); }
});
document.addEventListener("keyup", e => { if (["arrowleft", "arrowright"].includes(e.key.toLowerCase())) hold = 0; });
document.addEventListener("pointerdown", audioOn, { once: true });
document.addEventListener("visibilitychange", () => {
  if (!S) return;
  if (document.visibilityState === "hidden") { S.lastSeen = Date.now(); saveLocal(); pushRemote(); scheduleAlerts(true); stopMusic(); }
  else { const prev = S.lastSeen; simulateTo(Date.now()); computeAway(prev); S.lastSeen = Date.now(); checkDaily(); markDirty(false); refreshAll(); pushPresence(true); startMusic(); }
});
window.addEventListener("resize", fitCanvas);


/* ===================== coins, shop and food ===================== */
function earn(n) {
  if (!n || !S) return;
  S.coins = (S.coins || 0) + n;
  S.stats.coinsEarned = (S.stats.coinsEarned || 0) + n;
  if (LIVE && typeof performance !== "undefined") spawn("coin", petX + rand(-6, 6), 22, 1, { up: 12, life: 900 });
}
function spend(n) { if ((S.coins || 0) < n) return false; S.coins -= n; return true; }
function priceKey(kind, key, val) { return kind === "room" && (key === "left" || key === "right") ? `item.${val}` : kind === "room" ? `${key}.${val}` : `${key}.${val}`; }
function isOwned(kind, key, val) { const k = priceKey(kind, key, val); if (FOUND[k]) return !!S.owned[k]; return !PRICES[k] || !!S.owned[k]; }
function monthsOf(k) { return SEASONAL[k].map(m => MONTHS[m - 1]).join(", "); }
function priceLabel(kind, key, val, b, s, name) {
  const k = priceKey(kind, key, val), price = PRICES[k], have = !!S.owned[k];
  const found = FOUND[k] && !have, offSeason = SEASONAL[k] && !have && !seasonOk(k), locked = found || (price && !have);
  b.classList.toggle("locked", !!locked);
  if (b.dataset.confirm) return;
  s.textContent = found ? `${name} · rare` : offSeason ? `${name} · ${monthsOf(k)}` : locked ? `${name} · ${price}c${SEASONAL[k] ? " · limited" : ""}` : name;
}
function pickDecor(kind, key, val, b) {
  const k = priceKey(kind, key, val), price = PRICES[k];
  if (FOUND[k] && !S.owned[k]) { sfx("no"); return toast(k === "item.vase" ? "Grow and harvest flowers in the garden to get this one." : "This one can't be bought. Keep going on adventures to find it!"); }
  if (SEASONAL[k] && !S.owned[k] && !seasonOk(k)) { sfx("no"); return toast(`That's a seasonal item, sold only in ${monthsOf(k)}.`); }
  if (val === "myphoto" && !S.photo) { sfx("no"); return toast("Choose a photo below first."); }
  if (price && !S.owned[k]) {
    if ((S.coins || 0) < price) { sfx("no"); return toast(`That costs ${price} coins. You have ${S.coins || 0}. Play games and look after your pet to earn more.`); }
    if (!b.dataset.confirm) {
      b.dataset.confirm = "1"; const s = b.querySelector("span"); s.textContent = `Buy for ${price}?`; sfx("click");
      setTimeout(() => { delete b.dataset.confirm; renderDecor(true); }, 3500);
      return;
    }
    delete b.dataset.confirm;
    spend(price); S.owned[k] = Date.now(); S.stats.bought = (S.stats.bought || 0) + 1; sfx("tune"); toast("Bought! It's yours to keep.");
    log(Date.now(), `Bought something new for ${price} coins`);
  } else sfx("click");
  if (kind === "room") S.decor[key] = val; else S.style[key] = val;
  markDirty(true); renderDecor(true); pushPresence(true); renderPanel(true);
}
function renderFoods() {
  const kind = mode === "food-meal" ? "meal" : "snack";
  const key = kind + JSON.stringify([S.coins, S.pantry, S.tried, S.fav]);
  if (renderFoods.key === key) return; renderFoods.key = key;
  $("food-title").textContent = kind === "meal" ? "Pick a meal" : "Pick a treat";
  const host = $("foods"); host.textContent = "";
  for (const [id, f] of Object.entries(FOODS)) {
    if (f.kind !== kind) continue;
    const b = document.createElement("button"); b.type = "button"; b.className = "game-card";
    const c = document.createElement("canvas"); c.width = 11; c.height = 10; c.style.width = "26px"; c.style.height = "24px"; c.setAttribute("aria-hidden", "true");
    art(c.getContext("2d"), ART[f.art], 0, 0);
    const t = document.createElement("div"); const n = document.createElement("b"); n.textContent = f.name;
    const sp = document.createElement("span");
    const bits = []; if (f.hunger) bits.push(`+${f.hunger} hunger`); if (f.happy) bits.push(`+${f.happy} happy`); if (f.weight < 0) bits.push("light"); if (f.sugar > 1) bits.push("very sweet");
    sp.textContent = bits.join(" · ");
    const pr = document.createElement("em");
    const have = S.pantry[id] || 0;
    pr.textContent = have ? `${have} gifted` : f.price ? `${f.price} coins` : "Free";
    if (id === S.fav && S.tried[id]) pr.textContent += " · favourite";
    t.append(n, sp, pr); b.append(c, t);
    b.addEventListener("click", () => { audioOn(); feed(id); });
    host.appendChild(b);
  }
}
function feed(id) {
  const f = FOODS[id]; if (!f) return;
  mode = "main";
  const w = why(); if (w) { refreshAll(); return deny(w); }
  if (fussRefuse()) return refuse(`${pn()} is throwing a tantrum. Try scolding it.`);
  if (f.kind === "meal" && S.hunger >= 4) return refuse(`${pn()} is full.`);
  if (f.kind === "snack" && S.sick) return refuse(`${pn()} feels too sick for treats.`);
  const fromPantry = (S.pantry[id] || 0) > 0;
  if (!fromPantry && f.price && (S.coins || 0) < f.price) { refreshAll(); sfx("no"); return toast(`${f.name} costs ${f.price} coins. You have ${S.coins || 0}.`); }
  if (id === S.dislike && Math.random() < 0.6) { S.tried[id] = 1; return refuse(`Yuck! ${pn()} doesn't like ${f.name.toLowerCase()}.`); }
  if (fromPantry) S.pantry[id]--; else if (f.price) spend(f.price);
  const wasHungry = !!S.calls.hunger;
  if (f.hunger) { S.hunger = Math.min(4, S.hunger + f.hunger); closeCall("hunger"); S.poopT = Math.min(S.poopT, rand(8, 30)); S.stats.meals = (S.stats.meals || 0) + 1; bumpGoal("meals"); }
  let happy = f.happy || 0;
  const firstTime = !S.tried[id]; S.tried[id] = 1;
  if (id === S.fav) { happy += S.trait === "foodie" ? 2 : 1; S.stats.favFed = (S.stats.favFed || 0) + 1; toast(firstTime ? `${pn()} found its favourite food: ${f.name.toLowerCase()}!` : `Yum! ${pn()}'s favourite!`); spawn("heart", petX, 24, 4, { spread: 16, up: 16 }); }
  if (happy) { S.happy = Math.min(4, S.happy + happy); closeCall("happy"); }
  S.weight = Math.max(baseWeight(), Math.min(99, S.weight + (f.weight || 0)));
  if (f.sugar) { S.snackStreak += f.sugar; S.snackT = 60; if (S.snackStreak >= 5 && Math.random() < 0.35) getSick(Date.now()); else if (S.snackStreak >= 4) toast("That's a lot of sweets. Too many can make it sick."); }
  if (f.kind === "snack") bumpGoal("snacks");
  if (wasHungry) earn(2);
  play("eat", 2200, { food: id }); sfx("eat"); buzz(10); done();
}
$("food-cancel").addEventListener("click", () => { mode = "main"; refreshAll(); });

/* ===================== achievements, daily streak, weekly goals ===================== */
function checkAch() {
  if (!S) return;
  for (const [id, name, , test, reward] of ACH) {
    if (S.ach[id]) continue;
    let ok = false; try { ok = test(S); } catch (e) {}
    if (ok) { S.ach[id] = Date.now(); earn(reward); log(Date.now(), `Achievement: ${name}`); toast(`Achievement unlocked: ${name} (+${reward} coins)`); sfx("tune"); markDirty(true); renderAchievements(true); }
  }
}
function checkDaily() {
  if (!S) return;
  const today = dayKey(Date.now());
  if (S.lastDay === today) return;
  const yesterday = dayKey(Date.now() - DAY);
  S.streak = S.lastDay === yesterday ? (S.streak || 0) + 1 : 1;
  S.bestStreak = Math.max(S.bestStreak || 0, S.streak);
  S.lastDay = today;
  const bonus = 10 + 5 * Math.min(6, S.streak - 1);
  S.coins = (S.coins || 0) + bonus;
  setTimeout(() => toast(S.streak > 1 ? `Day ${S.streak} in a row! +${bonus} coins` : `Welcome! +${bonus} coins for today`), 1200);
  markDirty(true);
}
function bumpGoal(key) {
  if (!net || !hid || !weekGoals().some(g => g.key === key)) return;
  net.bumpGoal(hid, weekId(), key);
}
function renderGoals() {
  const card = $("goals-card");
  card.hidden = !(hid && house);
  if (card.hidden) return;
  const host = $("goals"); host.textContent = "";
  const counts = (house && house.goals) || {};
  const end = (weekId() + 1) * 7 * DAY - 3 * DAY;
  $("goals-sub").textContent = `Shared with everyone in your home. Resets in ${fmtDur(end - Date.now())}.`;
  for (const gl of weekGoals()) {
    const v = Math.min(gl.target, counts[gl.key] || 0), doneG = v >= gl.target, ck = `${weekId()}:${gl.key}`;
    const row = document.createElement("div"); row.className = "goal";
    const t = document.createElement("div"); const b = document.createElement("b"); b.textContent = gl.text;
    const bar = document.createElement("span"); bar.className = "bar"; const i = document.createElement("i"); i.style.width = `${Math.round(100 * v / gl.target)}%`; bar.appendChild(i);
    const sm = document.createElement("small"); sm.textContent = `${v} / ${gl.target}`;
    t.append(b, bar, sm); row.appendChild(t);
    const btn = document.createElement("button"); btn.type = "button"; btn.className = doneG && !S.claimed[ck] ? "primary" : "ghost";
    btn.textContent = S.claimed[ck] ? "Claimed" : doneG ? `Claim ${GOAL_REWARD}c` : `${GOAL_REWARD}c`;
    btn.disabled = !doneG || !!S.claimed[ck];
    btn.addEventListener("click", () => { if (S.claimed[ck]) return; S.claimed[ck] = Date.now(); earn(GOAL_REWARD); sfx("tune"); toast(`Goal complete! +${GOAL_REWARD} coins`); markDirty(true); renderGoals(); renderPanel(true); });
    row.appendChild(btn); host.appendChild(row);
  }
}
let achKey = "";
function renderAchievements(force) {
  const k = JSON.stringify(S.ach);
  if (!force && k === achKey) return; achKey = k;
  const host = $("achievements"); host.textContent = "";
  let n = 0;
  for (const [id, name, desc, , reward] of ACH) {
    const got = !!S.ach[id]; if (got) n++;
    const li = document.createElement("li"); li.className = got ? "got" : "";
    const b = document.createElement("b"); b.textContent = name;
    const sp = document.createElement("span"); sp.textContent = `${desc} · ${reward} coins`;
    li.append(b, sp); host.appendChild(li);
  }
  $("ach-count").textContent = `${n} of ${ACH.length}`;
  $("streak-line").textContent = S.streak ? `Visit streak: ${S.streak} ${S.streak === 1 ? "day" : "days"} (best ${S.bestStreak}). Come back tomorrow for more coins.` : "";
}

/* ===================== letters and gifts between players ===================== */
function otherMembers() { if (!house || !house.members || !me) return []; return Object.keys(house.members).filter(u => u !== me.uid); }
let mailKey = "";
function renderMail() {
  const card = $("mail-card");
  const others = otherMembers();
  card.hidden = !(me && hid && others.length);
  if (card.hidden) return;
  const key = JSON.stringify([others, others.map(u => memberNames[u]), Object.keys(mail), S.coins]);
  if (key === mailKey) return; mailKey = key;
  const sel = $("mail-to"); const cur = sel.value; sel.textContent = "";
  others.forEach(u => { const o = document.createElement("option"); o.value = u; o.textContent = memberNames[u] || "Friend"; sel.appendChild(o); });
  if (others.includes(cur)) sel.value = cur;
  const gs = $("mail-gift"); const gcur = gs.value; gs.textContent = "";
  const add = (v, t) => { const o = document.createElement("option"); o.value = v; o.textContent = t; gs.appendChild(o); };
  add("", "No gift"); add("coins:10", "10 coins"); add("coins:25", "25 coins");
  for (const [id, f] of Object.entries(FOODS)) if (f.price) add(`food:${id}`, `${f.name} (${f.price} coins)`);
  for (const k of Object.keys(PRICES)) if (!SEASONAL[k] || seasonOk(k)) add(`item:${k}`, `Decoration: ${foundName(k)} (${PRICES[k]} coins)`);
  gs.value = gcur || "";
  const n = Object.keys(mail).length;
  $("mail-inbox").hidden = !n;
  $("mail-inbox").textContent = n ? `${pn()} is holding ${n === 1 ? "a letter" : n + " letters"} for you. Tap your pet to read.` : "";
}
$("mail-form").addEventListener("submit", async e => {
  e.preventDefault(); audioOn();
  const to = $("mail-to").value, txt = $("mail-text").value.trim().slice(0, 300), gv = $("mail-gift").value;
  if (!to) return;
  if (!txt && !gv) return toast("Write a few words or pick a gift first.");
  let gift = null, cost = 0;
  if (gv.startsWith("coins:")) { cost = parseInt(gv.slice(6), 10); gift = { type: "coins", n: cost }; }
  else if (gv.startsWith("food:")) { const id = gv.slice(5); cost = FOODS[id].price; gift = { type: "food", id }; }
  else if (gv.startsWith("item:")) { const id = gv.slice(5); cost = PRICES[id] || 0; gift = { type: "item", id }; }
  if (cost && (S.coins || 0) < cost) return toast(`That gift costs ${cost} coins. You have ${S.coins || 0}.`);
  try {
    await net.sendMail(to, { from: me.uid, name: me.name, pet: S.name || "", text: txt, gift, t: snow() });
    if (cost) spend(cost);
    S.stats.mailSent = (S.stats.mailSent || 0) + 1; bumpGoal("letters");
    $("mail-text").value = ""; $("mail-gift").value = "";
    log(Date.now(), `Sent a letter to ${memberNames[to] || "a friend"}`);
    sfx("ok"); toast(`${pn()} is off to deliver your letter!`); markDirty(true); renderPanel(true);
  } catch (err) { toast("Couldn't send the letter. Try again."); }
});
function handlePings() {
  for (const [id, m] of Object.entries(mail)) {
    if (!m || !m.ping) continue;
    delete mail[id]; net.deleteMail(me.uid, id);
    if (snow() - (m.t || 0) > DAY) continue;
    toast(`${m.name || "Someone"} is thinking of you!`); sfx("giggle"); buzz(30);
    spawn("heart", rand(10, LW - 10), 30, 10, { spread: 60, up: 18, life: 1800 });
    log(Date.now(), `${m.name || "Someone"} was thinking of you`);
    if (alive() && !away() && !S.asleep && !anim && mode === "main") play("happy", 1300);
  }
}
function openMail() {
  const ids = Object.keys(mail).sort((a, b) => (mail[a].t || 0) - (mail[b].t || 0));
  if (!ids.length) return;
  const id = ids[0], m = mail[id];
  delete mail[id];
  net.deleteMail(me.uid, id);
  let giftText = "";
  if (m.gift && m.gift.type === "coins" && m.gift.n > 0 && m.gift.n <= 25) { S.coins += m.gift.n; giftText = `\n\nGift: ${m.gift.n} coins`; }
  if (m.gift && m.gift.type === "item" && PRICES[m.gift.id]) { if (S.owned[m.gift.id]) { S.coins += 20; giftText = `\n\nGift: ${foundName(m.gift.id)} (you already had one, so here are 20 coins)`; } else { S.owned[m.gift.id] = Date.now(); giftText = `\n\nGift: ${foundName(m.gift.id)} for your room (find it in Decorate)`; renderDecor(true); } }
  if (m.gift && m.gift.type === "food" && FOODS[m.gift.id]) { S.pantry[m.gift.id] = (S.pantry[m.gift.id] || 0) + 1; giftText = `\n\nGift: ${FOODS[m.gift.id].name.toLowerCase()} (find it in the ${FOODS[m.gift.id].kind === "meal" ? "Meal" : "Snack"} menu)`; }
  const L = { t: Date.now(), text: (m.text || "") + giftText, from: `${m.name || "A friend"}${m.pet ? " & " + m.pet : ""}`, kind: "mail" };
  S.letters.push(L); if (S.letters.length > 200) S.letters.shift();
  log(Date.now(), `Got a letter from ${m.name || "a friend"}`);
  markDirty(true); sfx("tune"); buzz(15); spawn("heart", petX, 26, 5, { spread: 20, up: 16 });
  $("p-head").textContent = `A letter from ${m.name || "a friend"}`; $("p-body").textContent = L.text.trim() || "(a gift for you)";
  $("p-sign").textContent = m.name ? `Love, ${m.name}` : ""; $("p-sign").hidden = !m.name; $("modal").hidden = false; setTimeout(() => $("p-close").focus(), 30);
  renderMail(); refreshAll();
}

/* ===================== shared photo album ===================== */
let albumKey = "";
function renderAlbum() {
  const card = $("album-card");
  card.hidden = !(me && hid && house);
  if (card.hidden) return;
  const items = Object.entries((house && house.album) || {}).sort((a, b) => (b[1].t || 0) - (a[1].t || 0));
  const key = JSON.stringify([items.map(i => i[0]), Object.values(memberNames)]);
  if (key === albumKey) return; albumKey = key;
  const host = $("album"); host.textContent = "";
  if (!items.length) { const p = document.createElement("p"); p.className = "small"; p.textContent = "No photos yet. Snap one of your pets together!"; host.appendChild(p); }
  for (const [id, ph] of items) {
    if (typeof ph.img !== "string" || !ph.img.startsWith("data:image/png")) continue;
    const fig = document.createElement("figure");
    const img = document.createElement("img"); img.src = ph.img; img.alt = ph.caption || "A Pocketling photo";
    const cap = document.createElement("figcaption");
    const b = document.createElement("b"); b.textContent = ph.caption || "Untitled";
    const sp = document.createElement("span"); sp.textContent = `${memberNames[ph.by] || ph.name || "Someone"} · ${new Date(ph.t).toLocaleDateString([], { month: "short", day: "numeric" })}`;
    cap.append(b, sp);
    if (me && (ph.by === me.uid || isOwner())) { const del = document.createElement("button"); del.type = "button"; del.className = "link"; del.textContent = "Remove"; del.addEventListener("click", () => { net.deletePhoto(hid, id).catch(() => {}); }); cap.appendChild(del); }
    fig.append(img, cap); host.appendChild(fig);
  }
}
$("album-snap").addEventListener("click", async () => {
  audioOn();
  if (!hid) return;
  const big = document.createElement("canvas"); big.width = LW * 2; big.height = LH * 2;
  const x = big.getContext("2d"); x.imageSmoothingEnabled = false; x.drawImage(low, 0, 0, big.width, big.height);
  const img = big.toDataURL("image/png");
  try {
    await net.addPhoto(hid, { by: me.uid, name: me.name, caption: $("album-caption").value.trim().slice(0, 60), img, t: snow() });
    $("album-caption").value = ""; S.stats.photos = (S.stats.photos || 0) + 1; markDirty(true);
    sfx("pop"); toast("Added to your album!"); R(g, 0, 0, LW, LH, "#ffffff");
  } catch (e) { toast("Couldn't add the photo. Try again."); }
});

/* ===================== phone notifications ===================== */
function predictAlerts() {
  if (!alive() || S.paused) return [];
  const real = S, realRandom = Math.random, realLive = LIVE, nm = pn();
  const items = [], seen = new Set();
  try {
    S = JSON.parse(JSON.stringify(real)); Math.random = () => 0.999; LIVE = false;
    let t = S.lastSim; const end = t + 26 * HOUR;
    let prev = { hunger: !!S.calls.hunger, happy: !!S.calls.happy, lights: !!S.calls.lights, poops: S.poops, letter: S.letterPending, form: S.form, back: !!(S.adventure && S.adventure.returned) };
    while (t < end && S.stage !== "dead") {
      t += MIN; S.lastSim = t; step(t);
      const add = (key, title, body) => { if (seen.has(key)) return; seen.add(key); const h = new Date(t).getHours(); if (real.quiet && key !== "lights" && (h >= 22 || h < 8)) return; items.push({ t, title, body }); };
      if (S.calls.hunger && !prev.hunger) add("hunger", `${nm} is hungry`, "Time for a meal!");
      if (S.calls.happy && !prev.happy) add("happy", `${nm} is lonely`, "Come play or give it a treat.");
      if (S.calls.lights && !prev.lights) add("lights", `${nm} fell asleep`, "Turn off the light so it can rest.");
      if (S.poops >= 2 && prev.poops < 2) add("poops", `${nm} made a mess`, "Clean up before it gets sick.");
      if (S.letterPending && !prev.letter) add("letter", `${nm} has a letter for you`, "Open Pocketling to read it.");
      if (S.form !== prev.form) add("grow", `${nm} is growing up!`, "Come see what it turned into.");
      if (S.starveMin >= 6 * 60) add("starve", `${nm} is starving`, "Please feed it soon!");
      if (S.adventure && S.adventure.returned && !prev.back) add("back", `${nm} is home from an adventure`, "Come hear all about it!");
      prev = { hunger: !!S.calls.hunger, happy: !!S.calls.happy, lights: !!S.calls.lights, poops: S.poops, letter: S.letterPending, form: S.form, back: !!(S.adventure && S.adventure.returned) };
    }
  } catch (e) { /* ignore */ }
  finally { S = real; Math.random = realRandom; LIVE = realLive; }
  return items.slice(0, 12);
}
async function renderPushRow() {
  const btn = $("push-btn"), txt = $("push-text");
  if (!net || !me) { btn.hidden = true; txt.textContent = "Sign in to get a buzz on your phone when your pet needs you."; return; }
  const ok = await net.pushSupported();
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (!ok) { btn.hidden = true; txt.textContent = !net.pushReady ? "Notifications aren't set up on this site yet (see the README)." : ios && !standalone ? "On iPhone, first add Pocketling to your Home Screen (Share, then Add to Home Screen), open it from there, and turn this on." : "This browser can't show notifications."; return; }
  btn.hidden = false;
  const on = S.pushOn && Notification.permission === "granted";
  btn.textContent = on ? "Turn off" : "Turn on";
  txt.textContent = on ? "On. You'll get a buzz when your pet needs you or a letter arrives." : "Get a buzz on this device when your pet needs you or a letter arrives.";
}
$("push-btn").addEventListener("click", async () => {
  audioOn();
  if (S.pushOn && Notification.permission === "granted") { S.pushOn = false; markDirty(true); net.saveAlerts(me.uid, []); toast("Notifications off."); return renderPushRow(); }
  try { await net.enablePush(me.uid); S.pushOn = true; markDirty(true); scheduleAlerts(true); toast("Notifications on!"); }
  catch (e) { toast(e && e.message === "denied" ? "Notifications are blocked. Allow them in your browser settings, then try again." : "Couldn't turn on notifications."); }
  renderPushRow();
});

/* ===================== weather ===================== */
const WMO = c => c <= 1 ? "clear" : c <= 3 ? "cloudy" : c <= 48 ? "fog" : (c >= 71 && c <= 77) || c === 85 || c === 86 ? "snow" : c >= 95 ? "storm" : "rain";
async function refreshWeather(force) {
  if (!S.useWeather || !S.geo) return;
  if (!force && S.weather && Date.now() - S.weather.t < 30 * MIN) return;
  if (refreshWeather.busy) return; refreshWeather.busy = true;
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${S.geo.lat}&longitude=${S.geo.lon}&current=weather_code`);
    const j = await r.json();
    if (j && j.current && typeof j.current.weather_code === "number") { S.weather = { kind: WMO(j.current.weather_code), t: Date.now() }; saveLocal(); }
  } catch (e) {}
  refreshWeather.busy = false;
}
$("opt-weather").addEventListener("change", e => {
  if (!e.target.checked) { S.useWeather = false; markDirty(true); return; }
  if (!navigator.geolocation) { e.target.checked = false; return toast("This browser can't share your location."); }
  navigator.geolocation.getCurrentPosition(pos => {
    S.geo = { lat: Math.round(pos.coords.latitude * 10) / 10, lon: Math.round(pos.coords.longitude * 10) / 10 };
    S.useWeather = true; markDirty(true); refreshWeather(true); toast("The window now shows your weather.");
  }, () => { e.target.checked = false; toast("Location was blocked, so local weather is off."); }, { maximumAge: 6 * HOUR, timeout: 15000 });
});

/* ===================== music ===================== */
const TRACKS = {
  morning: { bpm: 104, lead: [72, 0, 76, 0, 79, 0, 76, 74, 72, 0, 74, 76, 74, 0, 72, 0, 69, 0, 72, 0, 74, 0, 72, 69, 67, 0, 69, 72, 69, 0, 0, 0], bass: [48, 0, 0, 0, 55, 0, 0, 0, 53, 0, 0, 0, 55, 0, 0, 0, 45, 0, 0, 0, 52, 0, 0, 0, 50, 0, 0, 0, 55, 0, 0, 0] },
  day: { bpm: 120, lead: [76, 79, 81, 79, 76, 0, 74, 76, 79, 0, 76, 74, 72, 0, 74, 0, 76, 79, 81, 84, 81, 0, 79, 76, 74, 76, 74, 72, 72, 0, 0, 0], bass: [48, 0, 55, 0, 48, 0, 55, 0, 53, 0, 57, 0, 53, 0, 57, 0, 45, 0, 52, 0, 45, 0, 52, 0, 50, 0, 55, 0, 48, 0, 0, 0] },
  evening: { bpm: 92, lead: [69, 0, 72, 0, 76, 0, 74, 72, 71, 0, 72, 74, 72, 0, 0, 0, 67, 0, 69, 0, 72, 0, 71, 69, 67, 0, 64, 0, 67, 0, 0, 0], bass: [45, 0, 0, 0, 52, 0, 0, 0, 43, 0, 0, 0, 50, 0, 0, 0, 41, 0, 0, 0, 48, 0, 0, 0, 43, 0, 0, 0, 47, 0, 0, 0] },
  night: { bpm: 72, lead: [72, 0, 0, 67, 0, 0, 69, 0, 71, 72, 0, 0, 0, 0, 0, 0, 69, 0, 0, 65, 0, 0, 67, 0, 69, 67, 0, 0, 0, 0, 0, 0], bass: [48, 0, 0, 0, 0, 0, 52, 0, 53, 0, 0, 0, 0, 0, 0, 0, 41, 0, 0, 0, 0, 0, 45, 0, 43, 0, 0, 0, 0, 0, 0, 0] },
};
let musicTimer = null, musicStep = 0, musicNext = 0;
function trackNow() { const h = new Date().getHours(); return h >= 6 && h < 11 ? "morning" : h >= 11 && h < 17 ? "day" : h >= 17 && h < 21 ? "evening" : "night"; }
function note(midi, at, dur, type, vol) {
  const o = actx.createOscillator(), gn = actx.createGain();
  o.type = type; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
  gn.gain.setValueAtTime(0.0001, at); gn.gain.linearRampToValueAtTime(vol, at + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(gn).connect(actx.destination); o.start(at); o.stop(at + dur + 0.05);
}
function startMusic() {
  if (!S || !S.music || musicTimer || !actx || document.visibilityState !== "visible") return;
  musicNext = actx.currentTime + 0.1; musicStep = 0;
  musicTimer = setInterval(() => {
    if (!actx || actx.state !== "running") return;
    const tr = TRACKS[trackNow()], stepDur = 60 / tr.bpm / 2;
    while (musicNext < actx.currentTime + 0.3) {
      const i = musicStep % tr.lead.length, quiet = (mode === "game" || anim) ? 0.4 : 1;
      if (tr.lead[i]) note(tr.lead[i], musicNext, stepDur * 1.8, "triangle", 0.018 * quiet);
      if (tr.bass[i]) note(tr.bass[i], musicNext, stepDur * 3.5, "sine", 0.03 * quiet);
      musicNext += stepDur; musicStep++;
    }
  }, 100);
}
function stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; }
$("opt-music").addEventListener("change", e => { S.music = e.target.checked; audioOn(); markDirty(true); if (S.music) setTimeout(startMusic, 100); else stopMusic(); });
document.addEventListener("pointerdown", () => { if (S && S.music) startMusic(); });

/* ===================== adventures ===================== */
const PLACES = [
  { id: "meadow", name: "Sunny meadow", hours: 1, minStage: "child", coins: [4, 10], foods: ["berry", "salad"], find: "ceiling.kites", chance: 0.18,
    lines: ["{p} chased a butterfly all the way across the meadow.", "{p} rolled down a grassy hill and giggled the whole way.", "{p} made a daisy chain and wore it like a crown.", "{p} met a very polite snail."] },
  { id: "beach", name: "Seashell beach", hours: 2, minStage: "child", coins: [8, 16], foods: ["fish", "icecream"], find: "art.shells", chance: 0.2,
    lines: ["{p} built a sandcastle with a moat.", "{p} ran away from every single wave.", "{p} watched the crabs have a dance-off.", "{p} found a bottle with a smiley face drawn on it."] },
  { id: "forest", name: "Whispering forest", hours: 3, minStage: "teen", coins: [10, 22], foods: ["berry", "cookie"], find: "head.explorer", chance: 0.2,
    lines: ["{p} followed a trail of glowing mushrooms.", "{p} had a staring contest with an owl and lost.", "{p} found a hollow log that echoed its name back.", "{p} helped a squirrel hide its acorns."] },
  { id: "mountain", name: "Snowy mountain", hours: 4, minStage: "teen", coins: [14, 30], foods: ["noodles", "pancake"], find: "item.telescope", chance: 0.22,
    lines: ["{p} slid down the mountain on its tummy.", "{p} built a tiny snow friend.", "{p} saw the whole world from the very top.", "{p} drank hot cocoa with a mountain goat."] },
  { id: "stars", name: "Star island", hours: 6, minStage: "adult", coins: [25, 50], foods: ["cake"], find: "coat.galaxy", chance: 0.25,
    lines: ["{p} counted shooting stars until it ran out of numbers.", "{p} floated in the warm, glowing sea.", "{p} wished on a star. It won't say what for.", "{p} danced with the fireflies all night."] },
];
const STAGE_RANK = { baby: 0, child: 1, teen: 2, adult: 3 };
const FOUND = { "ceiling.kites": "Find it on adventures", "art.shells": "Find it on adventures", "head.explorer": "Find it on adventures", "item.telescope": "Find it on adventures", "item.vase": "Grow flowers to unlock" };
const SEASONAL = { "head.santa": [12], "item.tree": [12], "item.snowman": [11, 12, 1, 2], "head.witch": [10], "item.pumpkin": [9, 10, 11], "head.sunhat": [6, 7, 8], "neck.lei": [6, 7, 8], "head.bunnyband": [3, 4], "head.heartband": [2] };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
Object.assign(PRICES, { "item.snowman": 45, "item.pumpkin": 35, "head.heartband": 30 });
ACH.push(
  ["explorer", "Explorer", "Come back from 5 adventures", s => (s.stats.adventures || 0) >= 5, 30],
  ["gardener", "Green thumb", "Harvest 10 times", s => (s.stats.harvests || 0) >= 10, 25],
  ["trickster", "Show-off", "Learn 3 tricks", s => Object.keys(TRICKS).filter(k => (s.tricks || {})[k] >= TRICKS[k].need).length >= 3, 30],
  ["chatty", "Chatterbox", "Send 20 chat messages", s => (s.stats.chats || 0) >= 20, 15],
  ["party", "Party animal", "Throw a party", s => (s.stats.parties || 0) >= 1, 15],
);
function seasonOk(k) { const m = SEASONAL[k]; return !m || m.includes(new Date().getMonth() + 1); }
function adventureLoot(place, seed) {
  const r = mulberry(seed);
  const coins = place.coins[0] + Math.floor(r() * (place.coins[1] - place.coins[0] + 1));
  const food = r() < 0.65 ? place.foods[Math.floor(r() * place.foods.length)] : null;
  const found = r() < place.chance ? place.find : null;
  const l1 = place.lines[Math.floor(r() * place.lines.length)];
  let l2 = place.lines[Math.floor(r() * place.lines.length)]; if (l2 === l1) l2 = place.lines[(place.lines.indexOf(l1) + 1) % place.lines.length];
  return { coins, food, found, lines: [l1, l2] };
}
function canAdventure(place) {
  if (!alive()) return "Only a hatched pet can go exploring.";
  if (S.adventure) return S.adventure.returned ? `${pn()} is home with stories. Tap it to hear about the trip first.` : `${pn()} is already out exploring.`;
  if (STAGE_RANK[S.stage] < STAGE_RANK[place.minStage]) return `${pn()} is too little for this one. It opens at the ${place.minStage} stage.`;
  if (S.asleep) return `${pn()} is asleep.`;
  if (S.sick) return `${pn()} is sick. Make it better first.`;
  if (S.hunger < 2) return `${pn()} is too hungry to go. Feed it first.`;
  if (S.poops) return "Clean up before heading out.";
  return null;
}
function startAdventure(placeId, opts = {}) {
  const place = PLACES.find(p => p.id === placeId); if (!place) return;
  const w = canAdventure(place); if (w) return deny(w);
  const seed = opts.seed || rand(1, 1e9);
  S.adventure = { place: place.id, start: Date.now(), end: Date.now() + place.hours * HOUR, seed, with: opts.with || null };
  log(Date.now(), `Set off for ${place.name}${opts.with ? " with " + opts.with : ""}`);
  sfx("tune"); toast(`${pn()} set off for ${place.name}! Back in ${place.hours} ${place.hours === 1 ? "hour" : "hours"}.`);
  markDirty(true); scheduleAlerts(true); refreshAll(); pushPresence(true);
}
function adventureBack() {
  const a = S.adventure; if (!a || !a.returned) return;
  const place = PLACES.find(p => p.id === a.place) || PLACES[0];
  const loot = adventureLoot(place, a.seed);
  const nm = pn();
  let story = loot.lines.map(l => l.replace("{p}", nm)).join(" ");
  if (a.with) story += ` ${a.with} came along, and they had the best time together.`;
  const got = [`${loot.coins} coins`];
  earn(loot.coins);
  if (loot.food) { S.pantry[loot.food] = (S.pantry[loot.food] || 0) + 1; got.push(FOODS[loot.food].name.toLowerCase()); }
  if (loot.found && !S.owned[loot.found]) { S.owned[loot.found] = Date.now(); got.push(`something rare: ${foundName(loot.found)}`); }
  else if (loot.found) { earn(10); got[0] = `${loot.coins + 10} coins`; }
  S.stats.adventures = (S.stats.adventures || 0) + 1;
  S.adventure = null; S.happy = Math.min(4, S.happy + 1);
  markDirty(true);
  $("p-head").textContent = `A postcard from ${place.name}`;
  $("p-body").textContent = `${story}\n\nBrought home: ${got.join(", ")}.`;
  $("p-sign").textContent = `Love, ${nm}`; $("p-sign").hidden = false;
  $("modal").hidden = false; setTimeout(() => $("p-close").focus(), 30);
  play("happy", 1500); sfx("tune"); refreshAll();
}
function foundName(k) { const [grp, val] = k.split("."); const maps = { ceiling: CEILINGS, art: ARTS, head: HEADWEAR, item: ITEMS, coat: COATS, wall: WALLS, floor: FLOORS, rug: RUGS, face: FACEWEAR, neck: NECKWEAR }; const m = maps[grp]; const n = m && m[val]; return (typeof n === "string" ? n : n && n.name || val).toLowerCase(); }
function renderAway(now) {
  drawRoom(g, now, roomDecor(), roomFx());
  const a = S.adventure, place = PLACES.find(p => p.id === a.place) || PLACES[0];
  panel(g, 12, 14, 56, 26);
  textC(g, "OUT EXPLORING", 17, "#8f2f4f");
  textC(g, cleanLabel(place.name, 14), 25, OUT);
  const left = a.end - Date.now();
  textC(g, left > 0 ? `BACK IN ${fmtShort(left)}` : "TAP TO SAY HI", 32, left > 0 ? "#67647f" : "#2f8a57");
  drawVisitors(now);
}
function fmtShort(ms) { const h = Math.floor(ms / HOUR), m = Math.ceil((ms % HOUR) / MIN); return h ? `${h}H ${m}M` : `${m}M`; }
let advKey = "";
function renderAdventures() {
  const card = $("adventure-card");
  card.hidden = !alive();
  if (card.hidden) return;
  const key = JSON.stringify([S.adventure, S.stage, S.asleep, S.sick, S.hunger, S.poops, friends().map(f => f.uid), Math.floor(Date.now() / MIN)]);
  if (key === advKey) return; advKey = key;
  const host = $("adventures"); host.textContent = "";
  const sub = $("adventure-sub");
  if (S.adventure) {
    const a = S.adventure, place = PLACES.find(p => p.id === a.place) || PLACES[0];
    const left = a.end - Date.now();
    sub.textContent = left > 0 ? `${pn()} is at ${place.name}${a.with ? " with " + a.with : ""}. Back at ${new Date(a.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.` : `${pn()} is home! Tap it to hear about the trip.`;
    const bar = document.createElement("span"); bar.className = "bar"; const i = document.createElement("i"); i.style.width = `${Math.round(100 * Math.min(1, (Date.now() - a.start) / (a.end - a.start)))}%`; bar.appendChild(i); host.appendChild(bar);
    if (left <= 0) { const b = document.createElement("button"); b.className = "primary full"; b.type = "button"; b.textContent = "Hear about the trip"; b.addEventListener("click", () => { audioOn(); adventureBack(); }); host.appendChild(b); }
    return;
  }
  const fr = friends().find(f => f.p.pet && f.p.pet.stage !== "egg" && !f.p.pet.asleep);
  sub.textContent = fr ? `Tap a place to go alone, or bring ${fr.p.pet.name || "their pet"} along. Stats pause while it's away.` : "Pick a place. Stats pause while it's away, and it comes back with coins, food and sometimes something rare.";
  for (const place of PLACES) {
    const row = document.createElement("div"); row.className = "goal";
    const t = document.createElement("div"); const b = document.createElement("b"); b.textContent = `${place.name} · ${place.hours} ${place.hours === 1 ? "hour" : "hours"}`;
    const sm = document.createElement("small"); sm.textContent = `${place.coins[0]}–${place.coins[1]} coins, maybe ${place.foods.map(f => FOODS[f].name.toLowerCase()).join(" or ")}${S.owned[place.find] ? "" : ", and a rare find"}`;
    t.append(b, sm); row.appendChild(t);
    const btns = document.createElement("div"); btns.style.display = "flex"; btns.style.gap = "6px"; btns.style.flexWrap = "wrap"; btns.style.justifyContent = "flex-end";
    const why2 = canAdventure(place);
    const go = document.createElement("button"); go.type = "button"; go.className = "ghost"; go.textContent = "Go"; go.disabled = !!why2; go.title = why2 || "";
    go.addEventListener("click", () => { audioOn(); startAdventure(place.id); });
    btns.appendChild(go);
    if (fr && !why2) { const tg = document.createElement("button"); tg.type = "button"; tg.className = "primary"; tg.textContent = "Go together"; tg.addEventListener("click", () => { audioOn(); const seed = rand(1, 1e9); sendAct("adventure", { to: fr.uid, place: place.id, seed }); startAdventure(place.id, { seed, with: fr.p.pet.name || "a friend" }); }); btns.appendChild(tg); }
    row.appendChild(btns); host.appendChild(row);
  }
}

/* ===================== your photo as wall art ===================== */
$("photo-file").addEventListener("change", async e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(f); });
    const W = 18, H = 13, c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d");
    const s = Math.max(W / img.width, H / img.height), dw = img.width * s, dh = img.height * s;
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
    x.filter = "contrast(1.15) saturate(1.2)";
    x.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    const d = x.getImageData(0, 0, W, H).data; let px = "";
    for (let i = 0; i < W * H; i++) px += [d[i * 4], d[i * 4 + 1], d[i * 4 + 2]].map(v => Math.round(v / 17).toString(16)).join("");
    S.photo = { w: W, h: H, px }; S.decor.art = "myphoto";
    URL.revokeObjectURL(img.src);
    markDirty(true); renderDecor(true); pushPresence(true); sfx("tune"); toast("Your photo is on the wall!");
    drawPhotoPreview();
  } catch (err) { toast("Couldn't read that photo. Try a JPG or PNG."); }
  e.target.value = "";
});
function drawPhotoPreview() {
  const c = $("photo-preview"), x = c.getContext("2d"); x.clearRect(0, 0, c.width, c.height);
  const ph = S.photo; if (!ph) { c.hidden = true; return; } c.hidden = false;
  for (let i = 0; i < ph.w * ph.h; i++) { x.fillStyle = "#" + ph.px.substr(i * 3, 3); x.fillRect(i % ph.w, Math.floor(i / ph.w), 1, 1); }
}

/* ===================== talking pets ===================== */
let speech = null, nextSpeech = performance.now() + 8000;
function sayNow(txt, ms) { const t = cleanLabel(txt, 34); if (!t) return; speech = { text: t, until: performance.now() + (ms || 3800), who: "me" }; }
function speechPool() {
  const her = (me && me.name) || CFG.herName || "";
  const h = new Date().getHours(), out = [];
  if (S.calls.hunger) return ["I'M HUNGRY!", "FOOD PLEASE!"];
  if (S.calls.happy) return ["PLAY WITH ME?", "I'M BORED..."];
  if (S.sick) return ["I FEEL ICKY", "MEDICINE?"];
  if (S.calls.misbehave) return ["NO! NO! NO!", "WON'T!"];
  if (her) out.push(`HI ${her}!`, `I LOVE YOU ${her}!`, `${her} IS THE BEST`);
  if (h >= 6 && h < 11) out.push("GOOD MORNING!"); else if (h >= 20) out.push("SLEEPY...", "NIGHT NIGHT SOON");
  if (S.partner) out.push(`I MISS ${S.partner.petName}`, `${S.partner.petName} IS SO CUTE`);
  const fr = friends()[0]; if (fr && fr.p.pet && fr.p.pet.name) out.push(`HI ${fr.p.pet.name}!`, `LET'S PLAY ${fr.p.pet.name}!`);
  const ev = upcomingEvents()[0]; if (ev && ev.days <= 30) out.push(ev.days === 0 ? `IT'S ${ev.name} TODAY!` : `${ev.days} ${ev.days === 1 ? "DAY" : "DAYS"} TO ${ev.name}!`);
  const tr = { playful: "LET'S PLAY A GAME!", foodie: S.fav && S.tried[S.fav] ? `I WANT ${FOODS[S.fav].name}!` : "SNACK TIME?", sleepy: "YAWN...", cuddly: "HUG ME!", brave: "I'M NOT SCARED!", neat: "SO TIDY!" }[S.trait];
  if (tr) out.push(tr);
  if (isElder()) out.push("I'M GETTING OLD", "I LOVE OUR LIFE");
  out.push("LA LA LA", "HEHE", "WHAT'S UP?");
  return out;
}
function drawSpeech(x, headY, txt) {
  const words = txt.split(" "), lines = [""];
  for (const w of words) { const cur = lines[lines.length - 1]; if ((cur + " " + w).trim().length > 17) lines.push(w); else lines[lines.length - 1] = (cur + " " + w).trim(); }
  const w = Math.max(...lines.map(l => textW(l))) + 6, h = lines.length * 6 + 4;
  const bx = Math.max(1, Math.min(LW - w - 1, Math.round(x - w / 2))), by = Math.max(1, headY - h - 4);
  R(g, bx, by, w, h, OUT); R(g, bx + 1, by + 1, w - 2, h - 2, "#ffffff");
  const tx = Math.max(bx + 2, Math.min(bx + w - 4, Math.round(x)));
  R(g, tx, by + h, 2, 1, OUT); R(g, tx, by + h + 1, 1, 1, OUT);
  lines.forEach((l, i) => text(g, l, bx + 3, by + 3 + i * 6, OUT));
}

/* ===================== tricks ===================== */
const TRICKS = { sit: { name: "Sit", need: 3 }, wave: { name: "Wave", need: 4 }, spin: { name: "Spin", need: 5 }, jump: { name: "Big jump", need: 5 }, roll: { name: "Roll over", need: 6 }, dance: { name: "Happy dance", need: 7 } };
function practice(id) {
  audioOn();
  const w = why(); if (w) return deny(w);
  if (STAGE_RANK[S.stage] < 1) return toast("Babies are too little for tricks. Try again when it grows up.");
  S.tricks = S.tricks || {}; S.trickT = S.trickT || {};
  const count = S.tricks[id] || 0, learned = count >= TRICKS[id].need;
  if (learned) {
    play("trick", 2200, { trick: id, ok: true }); sfx("win");
    if (canGetGift("showoff", 1)) { S.happy = Math.min(4, S.happy + 1); closeCall("happy"); earn(1); }
    const f = friends()[0]; if (f) sendAct("trick", { to: f.uid, trick: id });
    return done();
  }
  const wait = 30 * MIN - (Date.now() - (S.trickT[id] || 0));
  if (wait > 0) return toast(`${pn()} needs a break from practising ${TRICKS[id].name.toLowerCase()}. Try again in ${fmtDur(wait)}.`);
  S.trickT[id] = Date.now();
  const ok = Math.random() < 0.4 + 0.1 * count;
  if (ok) { S.tricks[id] = count + 1; earn(2); }
  play("trick", 2200, { trick: id, ok });
  sfx(ok ? "win" : "lose");
  if (ok && S.tricks[id] >= TRICKS[id].need) { earn(15); log(Date.now(), `Learned a new trick: ${TRICKS[id].name}!`); setTimeout(() => toast(`${pn()} learned ${TRICKS[id].name.toLowerCase()}! (+15 coins)`), 2300); }
  else toast(ok ? `Good job! ${S.tricks[id]}/${TRICKS[id].need} practices.` : `${pn()} got a bit confused. Keep practising.`);
  done();
}
let tricksKey = "";
function renderTricks() {
  $("tricks-card").hidden = !alive();
  if (!alive()) return;
  const key = JSON.stringify([S.tricks, S.stage, Math.floor(Date.now() / MIN)]);
  if (key === tricksKey) return; tricksKey = key;
  const host = $("tricks"); host.textContent = "";
  for (const [id, t] of Object.entries(TRICKS)) {
    const c = (S.tricks || {})[id] || 0, learned = c >= t.need;
    const row = document.createElement("div"); row.className = "goal";
    const d = document.createElement("div"); const b = document.createElement("b"); b.textContent = t.name;
    const bar = document.createElement("span"); bar.className = "bar"; const i = document.createElement("i"); i.style.width = `${Math.round(100 * Math.min(1, c / t.need))}%`; bar.appendChild(i);
    const sm = document.createElement("small"); sm.textContent = learned ? "Learned!" : `${c} / ${t.need} practices`;
    d.append(b, bar, sm); row.appendChild(d);
    const btn = document.createElement("button"); btn.type = "button"; btn.className = learned ? "primary" : "ghost"; btn.textContent = learned ? "Show off" : "Practise";
    btn.addEventListener("click", () => practice(id)); row.appendChild(btn); host.appendChild(row);
  }
}
function renderTrickAnim(now, p, d) {
  const sp = petSpec(); drawRoom(g, now, roomDecor(), roomFx()); drawVisitors(now);
  const x = petX, t = now - anim.t0;
  if (!d.ok && p > 0.5) { drawMe(x, FLOOR, { eyes: "squeeze", mouth: "o" }); text(g, "?", x + sp.rx + 2, FLOOR - sp.ry * 2 - 8, "#8f2f4f", 2); return; }
  if (d.trick === "sit") drawMe(x, FLOOR, { sq: p < 0.8 ? 0.78 : 1, eyes: "happy", mouth: "w" });
  else if (d.trick === "wave") { const info = drawMe(x, FLOOR, { eyes: "happy", mouth: "open" }); const up = Math.floor(t / 180) % 2; R(g, x + info.rx + 1, info.eyeY + 2 - up * 2, 2, 3, petSpec().c[0]); R(g, x + info.rx + 1, info.eyeY + 1 - up * 2, 2, 1, OUT); }
  else if (d.trick === "spin") { drawMe(x, FLOOR - Math.round(Math.abs(Math.sin(p * Math.PI)) * 3), { look: [-1, 0, 1, 0][Math.floor(t / 90) % 4], eyes: "happy" }); if (Math.random() < 0.4) spawn("spark", x + rand(-12, 12), rand(26, 46), 1, { up: 4, life: 400 }); }
  else if (d.trick === "jump") { const hop = Math.round(Math.sin(Math.min(1, p * 1.3) * Math.PI) * 16); drawMe(x, FLOOR - hop, { eyes: "happy", mouth: "open", sq: hop > 10 ? 1.08 : 0.92 }); }
  else if (d.trick === "roll") { const xx = 18 + p * 44; drawMe(xx, FLOOR, { sq: 0.75 + Math.abs(Math.sin(t / 120)) * 0.3, eyes: "squeeze", look: 1 }); }
  else { const sway = Math.round(Math.sin(t / 150) * 4); drawMe(x + sway, FLOOR - Math.round(Math.abs(Math.sin(t / 150)) * 3), { eyes: "happy", mouth: "open", look: sway > 0 ? 1 : -1 }); if (Math.random() < 0.2) spawn("note", rand(10, LW - 10), 30, 1, { up: 10, vx: 6, life: 1200 }); }
  if (d.ok && p > 0.85 && !d.spawned) { d.spawned = 1; spawn("heart", x, 26, 3, { spread: 14, up: 14 }); }
}

/* ===================== garden (shared in a home, private otherwise) ===================== */
const SEEDS = {
  berry: { name: "Strawberries", price: 4, mins: 90, yield: { food: "berry", n: 2 }, col: "#ef4a63" },
  lettuce: { name: "Lettuce", price: 4, mins: 120, yield: { food: "salad", n: 1 }, col: "#7ccf6c" },
  tulip: { name: "Tulips", price: 5, mins: 150, yield: { coins: 14, flower: 1 }, col: "#ff7aa0" },
  sunflower: { name: "Sunflower", price: 6, mins: 210, yield: { coins: 20, flower: 1 }, col: "#ffd84d" },
  pumpkin: { name: "Pumpkin", price: 8, mins: 300, yield: { coins: 30, item: "item.pumpkin" }, col: "#ff9b5a" },
};
const PLOTS = 6;
function gardenData() { if (hid && house) return house.garden || {}; return S.garden || {}; }
function plotInfo(p, now) {
  if (!p || !SEEDS[p.seed]) return { empty: true };
  const dur = SEEDS[p.seed].mins / 3 * MIN, waters = Array.isArray(p.waters) ? p.waters : Object.values(p.waters || {});
  let done = 0; for (const w of waters) if (now >= w + dur) done++;
  const growing = waters.length > done;
  return { seed: p.seed, stage: Math.min(3, done), ready: done >= 3, thirsty: done < 3 && !growing, growing, next: growing ? waters[waters.length - 1] + dur : 0, waters, by: p.by };
}
async function setPlot(i, v) {
  if (hid && house) { try { await net.home(hid).set(`garden/${i}`, v); } catch (e) { toast("Couldn't reach the garden. Try again."); } }
  else { S.garden = Object.assign({}, S.garden || {}); if (v) S.garden[i] = v; else delete S.garden[i]; markDirty(true); renderGarden(); }
}
function plotAction(i) {
  audioOn();
  const p = gardenData()[i], info = plotInfo(p, Date.now());
  if (info.empty) { const sel = $("seed-pick").value; const sd = SEEDS[sel]; if (!sd) return; if (!spend(sd.price)) return toast(`${sd.name} seeds cost ${sd.price} coins.`); setPlot(i, { seed: sel, planted: snow(), waters: [], by: me ? me.uid : "me" }); sfx("pop"); toast(`Planted ${sd.name.toLowerCase()}. Water it to help it grow.`); return markDirty(true); }
  if (info.ready) {
    if (hid && house) {
      net.home(hid).tx(`garden/${i}`, v => (v && v.planted === p.planted) ? null : undefined)
        .then(r => { if (r && r.committed) harvest(info.seed); else toast("Someone already picked that one!"); })
        .catch(() => toast("Couldn't reach the garden. Try again."));
      return;
    }
    harvest(info.seed); setPlot(i, null); return;
  }
  if (info.thirsty) { const waters = info.waters.slice(); waters.push(snow()); setPlot(i, Object.assign({}, p, { waters })); sfx("ok"); return; }
  toast(`Growing nicely. Ready for water again in ${fmtDur(info.next - Date.now())}.`);
}
function harvest(seed) {
  {
    const sd = SEEDS[seed], y = sd.yield, got = [];
    if (y.food) { S.pantry[y.food] = (S.pantry[y.food] || 0) + y.n; got.push(`${y.n} ${FOODS[y.food].name.toLowerCase()}`); }
    if (y.coins) { earn(y.coins); got.push(`${y.coins} coins`); }
    if (y.flower && !S.owned["item.vase"]) { S.owned["item.vase"] = Date.now(); got.push("a flower vase for your room"); }
    if (y.item && !S.owned[y.item]) { S.owned[y.item] = Date.now(); got.push(`a ${foundName(y.item)} for your room`); }
    S.stats.harvests = (S.stats.harvests || 0) + 1;
    sfx("tune"); toast(`Harvested ${sd.name.toLowerCase()}: ${got.join(", ")}!`); log(Date.now(), `Harvested ${sd.name.toLowerCase()}`);
    markDirty(true); refreshAll();
  }
}
let gardenKey = "";
function renderGarden() {
  const now = Date.now(), data = gardenData();
  const key = JSON.stringify([data, Math.floor(now / MIN), S.coins, !!hid]);
  if (key === gardenKey) return; gardenKey = key;
  $("garden-sub").textContent = hid && house ? "Shared with everyone in your home. Anyone can plant, water and harvest." : "Plant seeds, water them at each stage, and harvest food and flowers.";
  const sel = $("seed-pick"); if (!sel.childElementCount) for (const [k, sd] of Object.entries(SEEDS)) { const o = document.createElement("option"); o.value = k; o.textContent = `${sd.name} (${sd.price} coins, ${Math.round(sd.mins / 60 * 10) / 10}h)`; sel.appendChild(o); }
  const host = $("plots"); host.textContent = "";
  for (let i = 0; i < PLOTS; i++) {
    const info = plotInfo(data[i], now);
    const b = document.createElement("button"); b.type = "button"; b.className = "plot" + (info.ready ? " ready" : info.thirsty ? " thirsty" : "");
    const t = document.createElement("b"); const s = document.createElement("span");
    if (info.empty) { t.textContent = "Empty"; s.textContent = "Tap to plant"; }
    else { t.textContent = SEEDS[info.seed].name; s.textContent = info.ready ? "Ready to harvest!" : info.thirsty ? "Thirsty: tap to water" : `Growing · ${fmtDur(info.next - now)}`; }
    b.append(t, s); b.addEventListener("click", () => plotAction(i)); host.appendChild(b);
  }
}
function renderGardenView(G, now) {
  const data = gardenData(), t = Date.now();
  drawOutdoor(G, now);
  R(G, 0, 40, LW, 16, "#b98a62");
  for (let i = 0; i < PLOTS; i++) {
    const x = 2 + (i % 3) * 20, y = i < 3 ? 34 : 48, info = plotInfo(data[i], t);
    R(G, x, y, 18, 5, "#7a5638"); R(G, x + 1, y + 1, 16, 3, "#8f6542");
    if (info.empty) continue;
    const cx = x + 9, col = SEEDS[info.seed].col;
    if (info.stage === 0) { R(G, cx - 3, y, 1, 1, "#4a3a2e"); R(G, cx + 2, y, 1, 1, "#4a3a2e"); R(G, cx, y - 1, 1, 1, "#7ccf6c"); }
    if (info.stage >= 1) { R(G, cx, y - 3, 1, 3, "#4fa85a"); R(G, cx - 1, y - 3, 1, 1, "#7ccf6c"); R(G, cx + 1, y - 2, 1, 1, "#7ccf6c"); }
    if (info.stage >= 2) { R(G, cx - 3, y - 4, 2, 2, "#7ccf6c"); R(G, cx + 2, y - 5, 2, 2, "#7ccf6c"); R(G, cx, y - 6, 1, 3, "#4fa85a"); }
    if (info.stage >= 3) {
      if (info.seed === "sunflower") { R(G, cx, y - 11, 1, 6, "#4fa85a"); R(G, cx - 2, y - 14, 5, 5, "#ffd84d"); R(G, cx - 1, y - 13, 3, 3, "#8b5a3c"); }
      else if (info.seed === "pumpkin") { R(G, cx - 4, y - 4, 9, 4, "#ff9b5a"); R(G, cx - 3, y - 5, 7, 1, "#ff9b5a"); R(G, cx, y - 7, 1, 2, "#4fa85a"); R(G, cx - 1, y - 4, 1, 4, "#e07a3a"); R(G, cx + 2, y - 4, 1, 4, "#e07a3a"); }
      else if (info.seed === "lettuce") { R(G, cx - 3, y - 5, 7, 4, "#9be07a"); R(G, cx - 2, y - 6, 5, 1, "#9be07a"); R(G, cx - 1, y - 4, 3, 2, "#c8f0a8"); }
      else { R(G, cx, y - 9, 1, 4, "#4fa85a"); R(G, cx - 1, y - 11, 3, 2, col); R(G, cx - 3, y - 6, 2, 2, col); R(G, cx + 2, y - 7, 2, 2, col); }
    }
    if (info.thirsty && Math.floor(now / 500) % 2) { R(G, cx + 5, y - 9, 2, 3, "#5aaee8"); R(G, cx + 5, y - 10, 1, 1, "#5aaee8"); }
    if (info.ready && Math.floor(now / 400) % 2) art(G, ART.sparkle, cx + 4, y - 12);
  }
  if (alive() && !away()) drawCreature(G, miniSpec(), 69, 47, myOpts({ eyes: S.asleep ? "sleep" : "happy", look: -1 }));
}

let gardenDrawn = 0;
function gardenFrame(now) {
  if (now - gardenDrawn < 450) return;
  const d = $("garden-card").querySelector("details"); if (!d || !d.open) return;
  gardenDrawn = now; const c = $("garden-canvas"), x = c.getContext("2d"); x.clearRect(0, 0, LW, LH); renderGardenView(x, now);
}

/* ===================== countdowns (shared in a home) ===================== */
function upcomingEvents() {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const out = [];
  const add = (name, date, id, by) => { const d = new Date(date + "T00:00:00"); if (isNaN(d)) return; const days = Math.round((d - now) / DAY); if (days >= 0) out.push({ name: cleanLabel(name, 14) || "IT", label: name, days, date, id, by }); };
  const nextOf = md => { if (!md) return null; const y = now.getFullYear(); let d = `${y}-${md.slice(5)}`; if (new Date(d + "T00:00:00") < now) d = `${y + 1}-${md.slice(5)}`; return d; };
  if (CFG.birthday) add(`${CFG.herName || "Her"}'s birthday`, nextOf(CFG.birthday));
  if (CFG.anniversary) add("Our anniversary", nextOf(CFG.anniversary));
  for (const [id, e] of Object.entries((house && house.events) || {})) if (e && e.name && e.date) add(e.name, e.date, id, e.by);
  for (const e of (S.events || [])) add(e.name, e.date, e.id, "me");
  return out.sort((a, b) => a.days - b.days);
}
let evKey = "";
function renderCountdowns() {
  const list = upcomingEvents(), key = JSON.stringify([list, !!hid]);
  if (key === evKey) return; evKey = key;
  const host = $("countdowns"); host.textContent = "";
  if (!list.length) { const p = document.createElement("p"); p.className = "small"; p.textContent = "Nothing yet. Add a trip, a date night or the next time you'll see each other."; host.appendChild(p); }
  for (const e of list) {
    const row = document.createElement("div"); row.className = "goal";
    const d = document.createElement("div"); const b = document.createElement("b"); b.textContent = e.label;
    const sm = document.createElement("small"); sm.textContent = new Date(e.date + "T00:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    d.append(b, sm); row.appendChild(d);
    const big = document.createElement("div"); big.className = "days"; big.textContent = e.days === 0 ? "Today!" : `${e.days} ${e.days === 1 ? "day" : "days"}`;
    row.appendChild(big);
    if (e.id && (e.by === "me" || (me && e.by === me.uid))) { const x = document.createElement("button"); x.type = "button"; x.className = "link"; x.textContent = "Remove"; x.addEventListener("click", () => { if (e.by === "me") { S.events = (S.events || []).filter(v => v.id !== e.id); markDirty(true); evKey = ""; renderCountdowns(); } else net.home(hid).remove(`events/${e.id}`); }); d.appendChild(x); }
    host.appendChild(row);
  }
}
$("event-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("event-name").value.trim().slice(0, 40), date = $("event-date").value;
  if (!name || !date) return toast("Add a name and a date.");
  if (hid && house && me) net.home(hid).push("events", { name, date, by: me.uid }).catch(() => toast("Couldn't save that. Try again."));
  else { S.events = (S.events || []).concat({ id: Math.random().toString(36).slice(2, 9), name, date }); markDirty(true); }
  $("event-name").value = ""; $("event-date").value = ""; sfx("ok"); evKey = ""; renderCountdowns();
});

/* ===================== reasons jar (write reasons for each other) ===================== */
let jarKey = "";
function renderJar() {
  const card = $("jar-card"), others = otherMembers();
  card.hidden = !(me && hid && house && others.length);
  if (card.hidden) return;
  const mine = (house && house.jarMine) || {};
  const drawn = (S.jar && S.jar.drawn) || [];
  const waiting = Object.keys(mine).filter(id => !drawn.includes(id));
  const key = JSON.stringify([others.map(u => memberNames[u]), waiting.length, S.jar && S.jar.last]);
  if (key === jarKey) return; jarKey = key;
  const other = others[0], oname = memberNames[other] || "them";
  $("jar-label").textContent = `Add a reason you love ${oname}`;
  const today = dayKey(Date.now()), canDraw = waiting.length && (!S.jar || S.jar.last !== today);
  $("jar-draw").disabled = !canDraw;
  $("jar-draw").textContent = canDraw ? "Draw today's reason" : waiting.length ? "Come back tomorrow for another" : "The jar is empty for now";
  $("jar-count").textContent = `${waiting.length} ${waiting.length === 1 ? "reason is" : "reasons are"} waiting for you.`;
}
$("jar-form").addEventListener("submit", e => {
  e.preventDefault();
  const t = $("jar-text").value.trim().slice(0, 200); if (!t) return;
  const other = otherMembers()[0]; if (!other) return;
  net.home(hid).push(`jar/${other}`, { from: me.uid, name: me.name, text: t, t: snow() }).then(() => { $("jar-text").value = ""; sfx("pop"); toast("Into the jar it goes!"); }).catch(() => toast("Couldn't add that. Try again."));
});
$("jar-draw").addEventListener("click", () => {
  audioOn();
  const mine = (house && house.jarMine) || {};
  S.jar = S.jar || { last: "", drawn: [] };
  const waiting = Object.keys(mine).filter(id => !S.jar.drawn.includes(id));
  if (!waiting.length) return;
  const id = waiting[rand(0, waiting.length - 1)], r = mine[id];
  S.jar.drawn.push(id); S.jar.last = dayKey(Date.now()); markDirty(true);
  $("p-head").textContent = `A reason from ${r.name || "someone"}`; $("p-body").textContent = r.text; $("p-sign").textContent = ""; $("p-sign").hidden = true;
  $("modal").hidden = false; sfx("tune"); spawn("heart", petX, 26, 6, { spread: 20, up: 16 }); jarKey = ""; renderJar();
});

/* ===================== family pet (shared by the home) ===================== */
function famPet() { return house && house.familyPet && house.familyPet.family ? house.familyPet : null; }
function famStage(fp) { const c = fp.care || 0; return c < 8 ? "baby" : c < 25 ? "child" : c < 60 ? "teen" : "adult"; }
function famSpec(fp) { const st = famStage(fp); return getSpec(formId(fp.family, st, st === "teen" ? "good" : st === "adult" ? "good" : "n")); }
function famHearts(t) { return Math.max(0, Math.min(4, 4 - Math.floor((snow() - (t || 0)) / (3 * HOUR)))); }
let famX = 64, famTarget = 64, famIdle = 0, famKey = "";
function renderFamPet() {
  const card = $("fampet-card");
  card.hidden = !(me && hid && house);
  if (card.hidden) return;
  const fp = famPet();
  const key = JSON.stringify([fp, Math.floor(Date.now() / MIN)]);
  if (key === famKey) return; famKey = key;
  $("fampet-adopt").hidden = !!fp; $("fampet-body").hidden = !fp;
  if (!fp) { const sel = $("fampet-family"); if (!sel.childElementCount) FAMILY_ORDER.forEach(f => { const o = document.createElement("option"); o.value = f; o.textContent = FAMILIES[f].name; sel.appendChild(o); }); return; }
  const sp = famSpec(fp);
  $("fampet-name").textContent = `${fp.name}, ${sp.label}`;
  $("fampet-meta").textContent = `Looked after by everyone in your home${fp.lastName ? ` · last cared for by ${fp.lastName}` : ""}`;
  $("fampet-hunger").innerHTML = heartRow(famHearts(fp.fed), 4); $("fampet-happy").innerHTML = heartRow(famHearts(fp.played), 4);
  const c = $("fampet-canvas"), x = c.getContext("2d"); x.clearRect(0, 0, LW, LH); R(x, 0, 0, LW, LH, "#fff4f7"); R(x, 0, 46, LW, 10, "#f6dcc0");
  drawCreature(x, sp, CX, FLOOR - 2, { eyes: famHearts(fp.fed) && famHearts(fp.played) ? "happy" : "sad", mouth: famHearts(fp.fed) ? "w" : "frown" });
}
$("fampet-adopt").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("fampet-newname").value.trim().slice(0, 14) || "Bean";
  net.home(hid).set("familyPet", { name, family: $("fampet-family").value, born: snow(), fed: snow(), played: snow(), care: 0, lastName: me.name }).then(() => { sfx("tune"); toast(`Welcome home, ${name}!`); }).catch(() => toast("Couldn't adopt right now."));
});
function famCare(kind) {
  audioOn();
  const fp = famPet(); if (!fp) return;
  const key = "fam-" + kind; if (Date.now() - (S.gifts[key] || 0) < 20 * MIN) return toast(`${fp.name} is still happy from the last one. Try again soon.`);
  S.gifts[key] = Date.now();
  net.home(hid).tx("familyPet", v => { if (!v) return v; v.care = (v.care || 0) + 1; v[kind === "feed" ? "fed" : "played"] = Date.now(); v.lastName = me.name; return v; }).catch(() => {});
  earn(2); sfx(kind === "feed" ? "eat" : "giggle"); spawn("heart", famX, 26, 3, { up: 14 }); bumpGoal(kind === "feed" ? "meals" : "cuddles");
  toast(kind === "feed" ? `You fed ${fp.name}.` : `You played with ${fp.name}.`); markDirty(true);
}
$("fampet-feed").addEventListener("click", () => famCare("feed"));
$("fampet-play").addEventListener("click", () => famCare("play"));
let famLast = 0;
function drawFamPet(now) {
  const fp = famPet(); if (!fp) return;
  const dt = Math.min(0.2, (now - (famLast || now)) / 1000); famLast = now;
  const sp = famSpec(fp); if (!sp) return;
  if (Math.abs(famTarget - famX) < 0.5) { if (performance.now() > famIdle) { famTarget = 14 + Math.random() * (LW - 28); famIdle = performance.now() + 3000 + Math.random() * 5000; } }
  else famX += Math.sign(famTarget - famX) * Math.min(Math.abs(famTarget - famX), 6 * dt);
  const sad = !famHearts(fp.fed) || !famHearts(fp.played);
  drawCreature(g, sp, famX, FLOOR + 1, { eyes: sad ? "sad" : (Math.floor(now / 3000) % 4 === 0 ? "happy" : "open"), sq: 1 + Math.sin(now / 240 + 3) * 0.04, look: Math.sign(famTarget - famX), t: now });
}

/* ===================== chat, emotes and thinking-of-you ===================== */
const EMOTES = { wave: "HI!", heart: "LOVE YOU!", laugh: "HAHA!", kiss: "XOXO", wow: "WOW!", sleepy: "ZZZ..." };
const EMOTE_NAMES = { wave: "waves", heart: "sends love", laugh: "laughs", kiss: "blows a kiss", wow: "is amazed", sleepy: "is sleepy" };
const bubbles = {};
let chatKey = "", lastChatSeen = 0;
function renderChat() {
  const card = $("chat-card");
  card.hidden = !(me && hid && house);
  if (card.hidden) return;
  const msgs = Object.entries((house && house.chat) || {}).map(([id, m]) => Object.assign({ id }, m)).filter(m => m && typeof m.t === "number").sort((a, b) => a.t - b.t);
  const key = JSON.stringify(msgs.map(m => m.id));
  if (key === chatKey) return; chatKey = key;
  const host = $("chat-log"); host.textContent = "";
  if (!msgs.length) { const p = document.createElement("p"); p.className = "small"; p.textContent = "Say hi! Messages also pop up over your pet in each other's rooms."; host.appendChild(p); }
  for (const m of msgs.slice(-30)) {
    const row = document.createElement("div"); row.className = "chat-msg" + (m.by === me.uid ? " mine" : "");
    const b = document.createElement("b"); b.textContent = m.by === me.uid ? "You" : (m.name || "Friend");
    const s = document.createElement("span"); s.textContent = m.emote ? `*${EMOTE_NAMES[m.emote] || m.emote}*` : m.text;
    row.append(b, s); host.appendChild(row);
    if (m.t > lastChatSeen && m.by !== me.uid && snow() - m.t < 60000) { bubbles[m.by] = { text: cleanLabel(m.emote ? EMOTES[m.emote] : m.text, 34), until: performance.now() + 5000 }; sfx("pop"); }
  }
  lastChatSeen = Math.max(lastChatSeen, ...msgs.map(m => m.t), 0);
  host.scrollTop = host.scrollHeight;
}
function sendChat(text, emote) {
  if (!hid || !me) return;
  const msg = { by: me.uid, name: me.name, t: snow() };
  if (emote) msg.emote = emote; else msg.text = text.slice(0, 200);
  net.home(hid).push("chat", msg).catch(() => toast("Couldn't send. Try again."));
  sayNow(emote ? EMOTES[emote] : text, 4000);
  S.stats.chats = (S.stats.chats || 0) + 1; markDirty(false);
}
$("chat-form").addEventListener("submit", e => { e.preventDefault(); const t = $("chat-text").value.trim(); if (!t) return; sendChat(t); $("chat-text").value = ""; });
document.querySelectorAll("#emotes button").forEach(b => b.addEventListener("click", () => { audioOn(); sendChat("", b.dataset.emote); sfx("pop"); }));
$("t-think").addEventListener("click", async () => {
  audioOn();
  const other = otherMembers()[0]; if (!other) return toast("Invite someone to your home first.");
  if (Date.now() - (S.gifts.think || 0) < 10 * MIN) return toast("You just sent one. Give it a few minutes.");
  S.gifts.think = Date.now();
  try { await net.sendMail(other, { from: me.uid, name: me.name, pet: S.name || "", ping: true, t: snow() }); sfx("giggle"); spawn("heart", petX, 26, 6, { spread: 20, up: 16 }); toast(`${memberNames[other] || "They"} will know you're thinking of them.`); }
  catch (e) { toast("Couldn't send it. Try again."); }
});

/* ===================== parties ===================== */
function partyOn() { const p = house && house.party; return p && typeof p.until === "number" && p.until > snow() ? p : null; }
$("t-party").addEventListener("click", () => {
  audioOn();
  if (!hid || !me) return;
  if (partyOn()) return toast("There's already a party going!");
  if (S.gifts.partyDay === dayKey(Date.now())) return toast("One party a day. Throw another tomorrow!");
  if (!spend(20)) return toast("A party costs 20 coins for snacks and decorations.");
  S.gifts.partyDay = dayKey(Date.now()); S.stats.parties = (S.stats.parties || 0) + 1;
  net.home(hid).set("party", { by: me.uid, name: me.name, t: snow(), until: snow() + 10 * MIN }).catch(() => {});
  markDirty(true); sfx("dance"); toast("Party time! Everyone in your home is invited.");
});
let lastPartySeen = "";
function partyTick(now) {
  const p = partyOn();
  if (!p) return;
  const k = String(p.t);
  if (k !== lastPartySeen) {
    lastPartySeen = k;
    if (S.gifts.partyJoin !== dayKey(Date.now()) && alive()) { S.gifts.partyJoin = dayKey(Date.now()); earn(10); S.happy = Math.min(4, S.happy + 1); closeCall("happy"); markDirty(true); }
    if (p.by !== (me && me.uid)) { toast(`${p.name || "Someone"} is throwing a party!`); sfx("dance"); }
    if (mode === "main" && !anim && alive() && !away() && !S.asleep && !S.lightsOff) play("dance", 5000);
  }
  if (mode === "main" && Math.random() < 0.25) spawn("confetti", rand(2, LW - 2), 0, 1, { up: -6, vx: 6, life: 2500 });
}

/* ===================== side-by-side comparison ===================== */
function mySummary() { return { gen: S.gen, ach: Object.keys(S.ach || {}).length, wins: S.stats.wins || 0, streak: S.streak || 0, tricks: Object.keys(TRICKS).filter(k => (S.tricks || {})[k] >= TRICKS[k].need).length, adventures: S.stats.adventures || 0, harvests: S.stats.harvests || 0 }; }
let cmpKey = "";
function renderCompare() {
  const card = $("compare-card"), f = friends().find(x => x.p.sum);
  card.hidden = !f;
  if (!f) return;
  const a = mySummary(), b = f.p.sum, key = JSON.stringify([a, b, f.p.pet && f.p.pet.name]);
  if (key === cmpKey) return; cmpKey = key;
  const rows = [["Generation", "gen"], ["Achievements", "ach"], ["Games won", "wins"], ["Visit streak", "streak"], ["Tricks learned", "tricks"], ["Adventures", "adventures"], ["Harvests", "harvests"]];
  const t = $("compare"); t.textContent = "";
  const head = document.createElement("tr"); for (const h of ["", pn(), (f.p.pet && f.p.pet.name) || fName(f)]) { const th = document.createElement("th"); th.textContent = h; head.appendChild(th); } t.appendChild(head);
  for (const [label, k] of rows) { const tr = document.createElement("tr"); const va = a[k] || 0, vb = b[k] || 0; for (const [v, win] of [[label, false], [va, va > vb], [vb, vb > va]]) { const td = document.createElement("td"); td.textContent = v; if (win) td.className = "win"; tr.appendChild(td); } t.appendChild(tr); }
}

/* ===================== first-time tour ===================== */
const TOUR = [
  ["screen", "This is your pet's room. Tap your pet to cuddle it. Thought bubbles show what it needs."],
  ["actions", "Feed, clean, play and care for it here. A pink dot means it needs that right now."],
  ["needs", "Its hearts, needs and growing-up timer are all in this card."],
  ["adventure-card", "Send your pet on adventures for coins, food and rare finds."],
  ["garden-card", "Grow food and flowers in the garden. Water each plant as it grows."],
  ["deco-details", "Decorate the room and dress up your pet. You can even hang your own photo."],
  ["together", "Sign in and create a home to visit, chat and play with someone special."],
  ["settings-card", "Turn on notifications, music and the babysitter here. That's it, have fun!"],
];
let tourStep = -1;
function showTour(i) {
  document.querySelectorAll(".tour-target").forEach(el => el.classList.remove("tour-target"));
  tourStep = i;
  if (i < 0 || i >= TOUR.length) { $("tour").hidden = true; S.tourDone = true; markDirty(false); return; }
  let [id, txt] = TOUR[i]; let el = $(id);
  if (!el || el.hidden || el.offsetParent === null) { if (el && el.closest(".card") && !el.closest(".card").hidden) el = el.closest(".card"); else return showTour(i + 1); }
  el.classList.add("tour-target"); el.scrollIntoView({ behavior: "smooth", block: "center" });
  $("tour-text").textContent = txt; $("tour-step").textContent = `${i + 1} of ${TOUR.length}`;
  $("tour-next").textContent = i === TOUR.length - 1 ? "Done" : "Next";
  $("tour").hidden = false;
}
$("tour-next").addEventListener("click", () => showTour(tourStep + 1));
$("tour-skip").addEventListener("click", () => showTour(TOUR.length));
$("tour-again").addEventListener("click", () => { window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => showTour(0), 300); });

/* ===================== backups ===================== */
const BKEY = "pocketling-backups";
function localBackups() { try { return JSON.parse(localStorage.getItem(BKEY) || "{}"); } catch (e) { return {}; } }
function backupTick() {
  if (!S) return;
  const day = new Date().toISOString().slice(0, 10);
  if (S.backupDay === day) return;
  S.backupDay = day;
  const json = JSON.stringify(S);
  try { const b = localBackups(); b[day] = json; const keep = Object.keys(b).sort().slice(-7); const out = {}; keep.forEach(k => out[k] = b[k]); localStorage.setItem(BKEY, JSON.stringify(out)); } catch (e) {}
  if (me && net) { net.saveBackup(me.uid, day, json); net.listBackups(me.uid).then(all => { Object.keys(all).sort().slice(0, -14).forEach(k => net.removeBackup(me.uid, k)); }); }
}
$("backup-open").addEventListener("click", async () => {
  const host = $("backup-list"); host.hidden = false; host.textContent = "Loading…";
  const all = {};
  for (const [d, j] of Object.entries(localBackups())) all[d] = j;
  if (me && net) for (const [d, v] of Object.entries(await net.listBackups(me.uid))) if (v && v.json) all[d] = all[d] || v.json;
  host.textContent = "";
  const days = Object.keys(all).sort().reverse();
  if (!days.length) { host.textContent = "No backups yet. One is made each day you play."; return; }
  for (const d of days) {
    let o = null; try { o = JSON.parse(all[d]); } catch (e) {}
    if (!valid(o)) continue;
    const row = document.createElement("div"); row.className = "goal";
    const t = document.createElement("div"); const b = document.createElement("b"); b.textContent = new Date(d + "T12:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    const sm = document.createElement("small"); const sp = getSpec(o.form); sm.textContent = `${o.name || "Egg"} · ${sp ? sp.label : o.stage} · ${o.coins || 0} coins`;
    t.append(b, sm); row.appendChild(t);
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "ghost"; btn.textContent = "Restore";
    btn.addEventListener("click", () => {
      if (!btn.dataset.sure) { btn.dataset.sure = 1; btn.textContent = "Replace current pet?"; return; }
      S = migrate(o); resetUi(); simulateTo(Date.now()); S.lastSeen = Date.now(); markDirty(true); refreshAll(); renderDecor(true); pushPresence(true);
      toast("Backup restored."); host.hidden = true;
    });
    row.appendChild(btn); host.appendChild(row);
  }
});

/* ===================== extra panel rendering ===================== */
function away() { return !!(S && S.adventure && !S.adventure.returned); }
function seasonNote() {
  const now = Object.keys(SEASONAL).filter(k => seasonOk(k) && !S.owned[k]).map(foundName);
  const found = Object.keys(FOUND).filter(k => !S.owned[k]).length;
  return (now.length ? `Limited this month: ${now.join(", ")}. Seasonal things are only sold in their season.` : "Seasonal things come and go with the months, so check back.") + (found ? ` ${found} rare ${found === 1 ? "thing" : "things"} can only be found, not bought.` : "");
}
function renderExtras() {
  if (!S) return;
  $("season-note").textContent = seasonNote();
  renderAdventures(); renderTricks(); renderGarden(); renderCountdowns(); renderJar(); renderFamPet(); renderChat(); renderCompare();
  $("party-note").hidden = !partyOn();
  if (partyOn()) $("party-note").textContent = `${partyOn().name || "Someone"} is throwing a party! Confetti for ${fmtDur(partyOn().until - snow())}.`;
  $("home-extras").hidden = !(me && hid && house);
  $("t-think").hidden = !(me && hid && otherMembers().length);
}

/* ===================== boot ===================== */
buildDom();
S = loadLocal();
if (!S) { S = newPet(null); freshLocal = true; }
const prevSeen = S.lastSeen;
simulateTo(Date.now()); computeAway(prevSeen); S.lastSeen = Date.now(); saveLocal();
checkDaily();
fitCanvas(); renderAccount(); refreshAll(); refreshWeather(false);
requestAnimationFrame(loop);
if (net) net.onUser(u => { if (u) onSignedIn(u); else onSignedOut(); });
if (joinHid && !me) setTimeout(() => toast("You've been invited! Sign in with Google to join."), 800);
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
window.__pocketling = { get S() { return S; }, set S(v) { S = v; }, refreshAll, friends, renderExtras, showTour, say: sayNow };
