// Mini-games. Each game draws on the 80x56 screen through env and reports st.over = { won, score, line }.
import { LW, LH, CX, FLOOR, OUT, R, art, text, textC, textW, panel, ART, STAR_PTS, drawOutdoor } from "./draw.js";

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function bar(g, frac, col) { R(g, 1, 1, LW - 2, 2, "rgba(43,35,64,.25)"); R(g, 1, 1, Math.round((LW - 2) * Math.max(0, Math.min(1, frac))), 2, col || "#ffd84d"); }
function pinkBg(g) { R(g, 0, 0, LW, LH, "#fff4f7"); for (let y = 2; y < LH; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < LW; x += 4) R(g, x, y, 1, 1, "#ffe1ea"); }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- 1. Guess ---------- */
const guess = {
  id: "guess", name: "Which way?", blurb: "Guess which way it hops. Win 3 of 5.",
  icon: ["..#...#..", ".##...##.", "#########", ".##...##.", "..#...#..", ".........", "...###...", "..#####..", "..#####.."],
  pad: [{ id: "L", label: "← Left" }, { id: "R", label: "Right →" }],
  create: () => ({ round: 0, wins: 0, results: [], phase: "ask", t: 0 }),
  press(st, env, id) {
    if (st.phase !== "ask") return;
    st.dir = Math.random() < 0.5 ? "L" : "R"; st.win = st.dir === id; st.results.push(st.win); if (st.win) st.wins++;
    st.phase = "reveal"; st.t = env.now(); env.sfx(st.win ? "win" : "lose"); env.buzz(st.win ? 15 : 30);
  },
  tap(st, env, x) { this.press(st, env, x < CX ? "L" : "R"); },
  tick(st, env) {
    if (st.phase === "reveal" && env.now() - st.t > 1200) {
      st.round++;
      if (st.round >= 5) st.over = { won: st.wins >= 3, score: st.wins, line: `${st.wins} OF 5` };
      else st.phase = "ask";
    }
  },
  render(st, env) {
    const g = env.g, now = env.now();
    env.room();
    for (let i = 0; i < 5; i++) { const r = st.results[i]; R(g, CX - 10 + i * 4, 1, 3, 3, r == null ? "#e7b6c6" : r ? "#4fb98a" : "#ef4a63"); }
    if (st.phase === "ask") {
      env.pet(CX, FLOOR, { sq: 1 + Math.sin(now / 200) * 0.04, look: Math.floor(now / 400) % 2 ? -1 : 1 });
      if (Math.floor(now / 400) % 2) { text(g, "<", 4, 24, OUT, 2); text(g, ">", LW - 9, 24, OUT, 2); }
      textC(g, "WHICH WAY?", 7, "#8f2f4f");
    } else {
      const p = Math.min(1, (now - st.t) / 350);
      const x = CX + ((st.dir === "L" ? 18 : LW - 18) - CX) * p;
      env.pet(x, FLOOR - Math.round(Math.sin(p * Math.PI) * 4), { eyes: st.win ? "happy" : "open", mouth: st.win ? "open" : null, look: st.dir === "L" ? -1 : 1 });
      const w = st.win ? "YES!" : "NOPE";
      text(g, w, Math.round((LW - textW(w, 2)) / 2), 8, st.win ? "#2f8a57" : "#ef4a63", 2);
    }
  },
};

/* ---------- 2. Catch stars (solo or together) ---------- */
function starSchedule(seed, dur, coop) {
  const r = mulberry(seed), out = [];
  let t = 1500;
  while (t < dur - 1200 && out.length < 90) { const prog = t / dur; out.push({ t, x: 5 + Math.floor(r() * (LW - 10)), v: 15 + prog * 12 + r() * 6 }); t += (coop ? 480 : 650) + r() * 450 - prog * 230; }
  return out;
}
const catchStars = {
  id: "catch", name: "Star catch", blurb: "Hold left or right to catch 8 falling stars.",
  icon: ["....#....", "...###...", "#########", ".#######.", "..##.##..", ".##...##.", ".........", ".#######.", "..#####.."],
  pad: [{ id: "L", label: "← Left", hold: -1 }, { id: "R", label: "Right →", hold: 1 }], holdTap: true,
  create(env, opts = {}) {
    const coop = !!opts.co;
    const dur = coop ? 25000 : 20000;
    const seed = coop ? opts.co.seed : rnd(1, 1e9);
    return { coop, id: coop ? opts.co.id : null, seed, start: coop ? opts.co.start : env.snow() + 1500, dur, stars: starSchedule(seed, dur, coop), mine: [], x: coop ? (opts.co.host ? 26 : 54) : CX, flash: 0, target: coop ? 16 : 8 };
  },
  coSync: st => ({ x: Math.round(st.x), caught: st.mine.slice(0, 120) }),
  caught(st, env) { const s = new Set(st.mine); if (st.coop) { const p = env.partner && env.partner(); if (p && Array.isArray(p.caught)) for (const i of p.caught) if (Number.isInteger(i)) s.add(i); } return s; },
  visible(st, env) {
    const e = env.snow() - st.start, got = this.caught(st, env), out = [];
    st.stars.forEach((s, i) => { if (got.has(i) || e < s.t) return; const y = -3 + s.v * (e - s.t) / 1000; if (y < LH - 2) out.push({ i, x: s.x, y }); });
    return out;
  },
  tick(st, env, dt, input) {
    const e = env.snow() - st.start;
    st.x = Math.max(10, Math.min(LW - 10, st.x + input.hold * 46 * dt));
    if (e >= 0) {
      const head = FLOOR - env.petHeight() - 1;
      for (const s of this.visible(st, env)) if (s.y >= head && s.y <= head + 10 && Math.abs(s.x - st.x) <= env.petRx() + 2 && !st.mine.includes(s.i)) { st.mine.push(s.i); st.flash = env.now(); env.sfx("pop"); env.spawn("spark", s.x, s.y, 2, { up: 6, life: 500 }); }
    }
    if (e >= st.dur) { const sc = this.caught(st, env).size; st.over = { won: sc >= st.target, score: sc, line: `${sc} STARS` }; }
  },
  render(st, env) {
    const g = env.g, now = env.now(), e = env.snow() - st.start;
    R(g, 0, 0, LW, LH, "#22295e");
    for (const [x, y] of STAR_PTS) R(g, x, y, 1, 1, "#5b62a8");
    R(g, 0, 48, LW, 8, "#3b4486"); R(g, 0, 48, LW, 1, "#5560a8");
    bar(g, 1 - Math.max(0, e) / st.dur);
    text(g, `${this.caught(st, env).size}/${st.target}`, 2, 5, "#ffffff");
    for (const s of this.visible(st, env)) art(g, ART.star, s.x - 2, s.y - 2);
    if (st.coop && env.partner) { const p = env.partner(); if (p) env.partnerPet(p.x, FLOOR, { alpha: .9, tag: true }); }
    const glad = st.flash && now - st.flash < 300;
    env.pet(st.x, FLOOR, { eyes: glad ? "happy" : "open", mouth: glad ? "open" : null, look: env.hold(), tag: st.coop });
    if (e < 0) { panel(g, CX - 26, 14, 52, 22); textC(g, st.coop && !(env.partner && env.partner()) ? "WAITING" : "GET READY", 18, "#8f2f4f"); textC(g, String(Math.ceil(-e / 1000)), 26, OUT); }
    else if (e < 1500) { panel(g, 8, 18, LW - 16, 13); textC(g, "HOLD < OR >", 22, OUT); }
  },
};

/* ---------- 3. Hop (runner) ---------- */
const hop = {
  id: "hop", name: "Hop!", blurb: "Jump over 12 rocks without bumping one.",
  icon: [".........", "...##....", "..####...", "..####...", "...##....", ".........", ".......#.", "......###", "#########"],
  pad: [{ id: "J", label: "Jump!" }],
  create: env => ({ y: 0, vy: 0, obs: [], speed: 30, next: env.now() + 1300, score: 0, scroll: 0, px: 16, hitT: 0 }),
  press(st, env) { if (st.y <= 0.01) { st.vy = 118; env.sfx("click"); env.buzz(6); } },
  tap(st, env) { this.press(st, env); },
  tick(st, env, dt) {
    const now = env.now();
    st.vy -= 330 * dt; st.y = Math.max(0, st.y + st.vy * dt); if (st.y === 0 && st.vy < 0) st.vy = 0;
    st.speed += 1.4 * dt; st.scroll += st.speed * dt;
    if (now > st.next) { const big = Math.random() < 0.4; st.obs.push({ x: LW + 4, w: big ? 8 : 7, h: big ? 6 : 5, kind: big ? "rock" : "bush" }); st.next = now + 900 + Math.random() * 900 - Math.min(400, st.score * 25); }
    const rx = env.miniRx();
    for (const o of st.obs) {
      o.x -= st.speed * dt;
      if (!o.passed && o.x + o.w < st.px - rx) { o.passed = 1; st.score++; env.sfx("pop"); if (st.score >= 12) st.over = { won: true, score: st.score, line: `${st.score} JUMPS` }; }
      if (!o.passed && o.x < st.px + rx - 2 && o.x + o.w > st.px - rx + 2 && st.y < o.h - 1) { st.over = { won: false, score: st.score, line: `${st.score} JUMPS` }; env.sfx("no"); env.buzz(40); }
    }
    st.obs = st.obs.filter(o => o.x > -12);
  },
  render(st, env) {
    const g = env.g;
    drawOutdoor(g, env.now(), { scroll: st.scroll });
    for (const o of st.obs) { if (o.kind === "rock") art(g, ART.rock, o.x, FLOOR - 4); else { R(g, o.x, FLOOR - 4, 7, 5, "#4f9a3e"); R(g, o.x + 1, FLOOR - 5, 5, 1, "#4f9a3e"); R(g, o.x + 2, FLOOR - 3, 1, 1, "#ef4a63"); R(g, o.x + 5, FLOOR - 2, 1, 1, "#ffd84d"); } }
    env.mini(st.px, FLOOR - Math.round(st.y), { eyes: st.y > 2 ? "happy" : "open", mouth: st.y > 2 ? "open" : null, look: 1 });
    text(g, `${st.score}/12`, 2, 2, OUT);
  },
};

/* ---------- 4. Memory ---------- */
const MEM_ICONS = [ART.heart, ART.star, ART.miniFood, ART.note, ART.miniLetter, ART.flower];
const memory = {
  id: "memory", name: "Memory", blurb: "Tap cards to find all 6 pairs in a minute.",
  icon: ["####.####", "#..#.#..#", "#.##.##.#", "####.####", ".........", "####.####", "#..#.####", "#..#.####", "####.####"],
  pad: [], tapHint: "Tap two cards to find a match",
  create(env) {
    const ids = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5].sort(() => Math.random() - 0.5);
    return { cards: ids.map(i => ({ icon: i, up: false, done: false })), open: [], lock: 0, moves: 0, start: env.now(), limit: 60000 };
  },
  cell(i) { return { x: 8 + (i % 4) * 17, y: 6 + Math.floor(i / 4) * 16 }; },
  tap(st, env, x, y) {
    if (st.lock) return;
    const i = st.cards.findIndex((c, k) => { const p = this.cell(k); return x >= p.x && x < p.x + 14 && y >= p.y && y < p.y + 13; });
    if (i < 0) return;
    const c = st.cards[i]; if (c.up || c.done) return;
    c.up = true; st.open.push(i); env.sfx("click"); env.buzz(5);
    if (st.open.length === 2) {
      st.moves++;
      const [a, b] = st.open;
      if (st.cards[a].icon === st.cards[b].icon) {
        st.cards[a].done = st.cards[b].done = true; st.open = []; env.sfx("win");
        const p = this.cell(b); env.spawn("spark", p.x + 7, p.y + 6, 3, { up: 6 });
        if (st.cards.every(k => k.done)) st.over = { won: true, score: Math.max(1, 30 - st.moves), line: `${st.moves} MOVES` };
      } else st.lock = env.now() + 700;
    }
  },
  tick(st, env) {
    if (st.lock && env.now() > st.lock) { for (const i of st.open) st.cards[i].up = false; st.open = []; st.lock = 0; }
    if (env.now() - st.start > st.limit) st.over = { won: false, score: st.cards.filter(c => c.done).length / 2, line: "OUT OF TIME" };
  },
  render(st, env) {
    const g = env.g;
    pinkBg(g); bar(g, 1 - (env.now() - st.start) / st.limit, "#ff7aa0");
    st.cards.forEach((c, i) => {
      const p = this.cell(i);
      R(g, p.x, p.y, 14, 13, OUT);
      if (c.up || c.done) { R(g, p.x + 1, p.y + 1, 12, 11, c.done ? "#e3f8e6" : "#ffffff"); const ic = MEM_ICONS[c.icon]; art(g, ic, p.x + 7 - Math.ceil(ic[0].length / 2), p.y + 6 - Math.ceil(ic.length / 2) + 1); }
      else { R(g, p.x + 1, p.y + 1, 12, 11, "#ff9fbb"); R(g, p.x + 2, p.y + 2, 10, 9, "#ffb3c9"); art(g, ART.heart, p.x + 5, p.y + 5, { tint: "#ffffff" }); }
    });
  },
};

/* ---------- 5. Copy me ---------- */
const PADS = [{ c: "#ff7aa0", d: "#c9587b", f: 523 }, { c: "#ffd84d", d: "#c9a633", f: 659 }, { c: "#6fb7ff", d: "#4b86c4", f: 784 }, { c: "#7ccf6c", d: "#539a47", f: 1046 }];
const simon = {
  id: "simon", name: "Copy me", blurb: "Watch the lights, then repeat them. Reach 6.",
  icon: ["####.####", "####.####", "####.####", "####.####", ".........", "####.####", "####.####", "####.####", "####.####"],
  pad: [{ id: 0, label: "Pink" }, { id: 1, label: "Yellow" }, { id: 2, label: "Blue" }, { id: 3, label: "Green" }], padColors: PADS.map(p => p.c),
  create: env => ({ seq: [rnd(0, 3)], idx: 0, phase: "show", i: 0, t: env.now() + 600, lit: -1, litT: 0 }),
  press(st, env, id) {
    if (st.phase !== "input") return;
    id = Number(id);
    st.lit = id; st.litT = env.now() + 250; env.tone(PADS[id].f, .18); env.buzz(6);
    if (id !== st.seq[st.idx]) { st.over = { won: false, score: st.seq.length - 1, line: `REACHED ${st.seq.length - 1}` }; env.sfx("no"); return; }
    st.idx++;
    if (st.idx >= st.seq.length) {
      if (st.seq.length >= 6) { st.over = { won: true, score: 6, line: "PERFECT!" }; return; }
      st.seq.push(rnd(0, 3)); st.idx = 0; st.phase = "show"; st.i = 0; st.t = env.now() + 800;
    }
  },
  tap(st, env, x, y) { this.press(st, env, (x < CX ? 0 : 1) + (y < 28 ? 0 : 2)); },
  tick(st, env) {
    const now = env.now();
    if (st.phase === "show" && now >= st.t) {
      if (st.i < st.seq.length) { st.lit = st.seq[st.i]; st.litT = now + 380; env.tone(PADS[st.lit].f, .3); st.i++; st.t = now + 560; }
      else { st.phase = "input"; st.idx = 0; }
    }
    if (st.lit >= 0 && now > st.litT) st.lit = -1;
  },
  render(st, env) {
    const g = env.g;
    R(g, 0, 0, LW, LH, "#2b2340");
    PADS.forEach((p, i) => { const x = i % 2 ? 41 : 2, y = i < 2 ? 2 : 29; R(g, x, y, 37, 25, st.lit === i ? p.c : p.d); if (st.lit === i) { R(g, x + 2, y + 2, 4, 1, "#ffffff"); R(g, x + 2, y + 2, 1, 4, "#ffffff"); } });
    R(g, CX - 13, 20, 26, 16, "#2b2340"); R(g, CX - 12, 21, 24, 14, "#fff4f7");
    textC(g, st.phase === "show" ? "WATCH" : "GO", 23, "#8f2f4f"); textC(g, `${st.seq.length}/6`, 29, OUT);
  },
};

/* ---------- 6. Bop-a-mole ---------- */
const HOLES = [[16, 30], [40, 30], [64, 30], [16, 49], [40, 49], [64, 49]];
const whack = {
  id: "whack", name: "Bop-a-mole", blurb: "Tap the moles before they hide. Bop 12.",
  icon: ["...###...", "..#####..", "..#.#.#..", "..#####..", "...###...", ".........", ".#######.", "#########", ".#######."],
  pad: [], tapHint: "Tap the moles",
  create: env => ({ moles: [], next: env.now() + 600, score: 0, end: env.now() + 20000 }),
  tap(st, env, x, y) {
    const now = env.now();
    for (const m of st.moles) {
      const [hx, hy] = HOLES[m.i];
      if (!m.hit && Math.abs(x - hx) < 9 && y > hy - 13 && y < hy + 3) { m.hit = now; m.until = now + 250; st.score++; env.sfx("pop"); env.buzz(10); env.spawn("spark", hx, hy - 8, 3, { up: 6 }); return; }
    }
  },
  tick(st, env) {
    const now = env.now();
    st.moles = st.moles.filter(m => now < m.until);
    if (now > st.next) {
      const free = HOLES.map((_, i) => i).filter(i => !st.moles.some(m => m.i === i));
      if (free.length) { const prog = 1 - (st.end - now) / 20000; st.moles.push({ i: free[rnd(0, free.length - 1)], born: now, until: now + 1300 - prog * 500 }); }
      st.next = now + 520 + Math.random() * 380;
    }
    if (now > st.end) st.over = { won: st.score >= 12, score: st.score, line: `${st.score} BOPS` };
  },
  render(st, env) {
    const g = env.g, now = env.now();
    R(g, 0, 0, LW, LH, "#9be07a"); for (let i = 0; i < 30; i++) R(g, (i * 29) % LW, 6 + (i * 17) % 48, 1, 2, "#7cc85e");
    bar(g, (st.end - now) / 20000); text(g, `${st.score}/12`, 2, 5, OUT);
    for (const [hx, hy] of HOLES) { R(g, hx - 7, hy - 1, 15, 3, "#4a3a2e"); R(g, hx - 6, hy - 2, 13, 1, "#4a3a2e"); }
    for (const m of st.moles) {
      const [hx, hy] = HOLES[m.i];
      const up = Math.min(1, (now - m.born) / 150, (m.until - now) / 150);
      const h = Math.round(7 * Math.max(0, up));
      for (let r = 0; r < h; r++) { const row = ART.mole[r]; if (!row) continue; for (let c = 0; c < row.length; c++) if (row[c] !== ".") R(g, hx - 4 + c, hy - h + r - 1, 1, 1, m.hit && row[c] === "k" && r === 2 ? "#ef4a63" : ({ k: OUT, b: "#9b6440", p: "#ff9fbb", w: "#ffffff" })[row[c]]); }
      if (m.hit) text(g, "x", hx - 1, hy - 14, "#ef4a63");
      R(g, hx - 7, hy, 15, 2, "#4a3a2e");
    }
  },
};

/* ---------- 7. Perfect stop ---------- */
const ZONES = [16, 12, 9, 7, 5];
const timing = {
  id: "timing", name: "Perfect stop", blurb: "Stop the arrow inside the green. Hit 3 of 5.",
  icon: [".........", "....#....", "...###...", ".........", "#########", "#..###..#", "#..###..#", "#########", "........."],
  pad: [{ id: "S", label: "Stop!" }],
  create(env) { const s = { round: 0, hits: 0, m: 0, dir: 1, speed: 0.75, phase: "move", t: 0 }; this.zone(s); return s; },
  zone(s) { const w = ZONES[s.round] / 64; s.zx = Math.random() * (1 - w); s.zw = w; },
  press(st, env) {
    if (st.phase !== "move") return;
    st.hit = st.m >= st.zx && st.m <= st.zx + st.zw; if (st.hit) st.hits++;
    st.phase = "show"; st.t = env.now(); env.sfx(st.hit ? "win" : "lose"); env.buzz(st.hit ? 12 : 30);
  },
  tap(st, env) { this.press(st, env); },
  tick(st, env, dt) {
    if (st.phase === "move") { st.m += st.dir * st.speed * dt; if (st.m > 1) { st.m = 1; st.dir = -1; } if (st.m < 0) { st.m = 0; st.dir = 1; } }
    else if (env.now() - st.t > 1000) {
      st.round++;
      if (st.round >= 5) st.over = { won: st.hits >= 3, score: st.hits, line: `${st.hits} OF 5` };
      else { st.speed *= 1.22; this.zone(st); st.phase = "move"; }
    }
  },
  render(st, env) {
    const g = env.g;
    env.room();
    textC(g, `ROUND ${st.round + 1}/5`, 4, "#8f2f4f");
    R(g, 7, 22, 66, 10, OUT); R(g, 8, 23, 64, 8, "#ffffff");
    R(g, 8 + Math.round(st.zx * 64), 23, Math.max(2, Math.round(st.zw * 64)), 8, "#7ccf6c");
    const mx = 8 + Math.round(st.m * 63);
    R(g, mx, 20, 1, 14, OUT); R(g, mx - 1, 18, 3, 2, "#ef4a63");
    if (st.phase === "show") text(g, st.hit ? "YES!" : "MISS", Math.round((LW - textW(st.hit ? "YES!" : "MISS", 2)) / 2), 36, st.hit ? "#2f8a57" : "#ef4a63", 2);
    else env.mini(CX, FLOOR + 2, { eyes: "open", look: st.dir });
  },
};

/* ---------- 8. Find the treat ---------- */
const SLOTS = [18, 40, 62];
const shell = {
  id: "shell", name: "Find the treat", blurb: "Watch the cups shuffle and pick the one with the treat.",
  icon: [".........", "..#####..", ".#######.", ".#######.", "#########", ".........", "...###...", "..#####..", "...###..."],
  pad: [{ id: 0, label: "Left" }, { id: 1, label: "Middle" }, { id: 2, label: "Right" }],
  create(env) { const s = { round: 0, wins: 0 }; this.reset(s, env); return s; },
  reset(s, env) { s.slots = [0, 1, 2]; s.treat = rnd(0, 2); s.phase = "peek"; s.t = env.now(); s.swaps = 4 + s.round * 2; s.swap = null; s.pick = -1; },
  press(st, env, id) {
    if (st.phase !== "pick") return;
    st.pick = Number(id); st.phase = "reveal"; st.t = env.now();
    st.win = st.slots[st.pick] === st.treat; if (st.win) st.wins++;
    env.sfx(st.win ? "win" : "lose"); env.buzz(st.win ? 12 : 30);
  },
  tap(st, env, x) { this.press(st, env, x < 29 ? 0 : x < 51 ? 1 : 2); },
  tick(st, env) {
    const now = env.now();
    if (st.phase === "peek" && now - st.t > 1400) { st.phase = "shuffle"; st.t = now; }
    if (st.phase === "shuffle") {
      const dur = Math.max(220, 380 - st.round * 60);
      if (!st.swap) { if (st.swaps <= 0) { st.phase = "pick"; return; } let a = rnd(0, 2), b = rnd(0, 2); while (b === a) b = rnd(0, 2); st.swap = { a, b, t: now, dur }; }
      else if (now - st.swap.t >= st.swap.dur) { const { a, b } = st.swap; [st.slots[a], st.slots[b]] = [st.slots[b], st.slots[a]]; st.swap = null; st.swaps--; env.sfx("click"); }
    }
    if (st.phase === "reveal" && now - st.t > 1400) {
      st.round++;
      if (st.round >= 3) st.over = { won: st.wins >= 2, score: st.wins, line: `${st.wins} OF 3` };
      else this.reset(st, env);
    }
  },
  cupX(st, slot, now) {
    if (st.swap && (slot === st.swap.a || slot === st.swap.b)) {
      const p = Math.min(1, (now - st.swap.t) / st.swap.dur), other = slot === st.swap.a ? st.swap.b : st.swap.a;
      return { x: SLOTS[slot] + (SLOTS[other] - SLOTS[slot]) * p, y: (slot === st.swap.a ? -1 : 1) * Math.round(Math.sin(p * Math.PI) * 4) };
    }
    return { x: SLOTS[slot], y: 0 };
  },
  render(st, env) {
    const g = env.g, now = env.now();
    env.room();
    R(g, 4, 44, 72, 2, "#c08a5c");
    textC(g, st.phase === "pick" ? "WHERE IS IT?" : st.phase === "peek" ? "WATCH!" : `ROUND ${st.round + 1}/3`, 4, "#8f2f4f");
    for (let slot = 0; slot < 3; slot++) {
      const { x, y } = this.cupX(st, slot, now);
      const cupId = st.slots[slot];
      const lift = (st.phase === "peek" && now - st.t < 1100) || (st.phase === "reveal" && (slot === st.pick || cupId === st.treat)) ? 9 : 0;
      if (cupId === st.treat && lift) art(g, ART.snack, x - 5, 34);
      const by = 44 + y - lift;
      R(g, x - 5, by - 10, 11, 1, OUT);
      for (let r = 0; r < 10; r++) { const w = 5 + Math.floor(r / 3); R(g, x - w - 1, by - 9 + r, 1, 1, OUT); R(g, x + w + 1, by - 9 + r, 1, 1, OUT); R(g, x - w, by - 9 + r, w * 2 + 1, 1, r === 4 ? "#ffffff" : "#ef4a63"); }
      R(g, x - 8, by + 1, 17, 1, OUT);
    }
    if (st.phase === "reveal") text(g, st.win ? "FOUND IT!" : "NOPE", Math.round((LW - textW(st.win ? "FOUND IT!" : "NOPE")) / 2), 12, st.win ? "#2f8a57" : "#ef4a63");
  },
};

/* ---------- 9. Higher or lower ---------- */
const hilo = {
  id: "hilo", name: "Higher or lower", blurb: "Guess the next card. Get 5 right before 2 misses.",
  icon: ["#####....", "#...#....", "#.#.#.###", "#...#.#.#", "#####.#.#", "......#.#", "......###", ".........", "........."],
  pad: [{ id: "H", label: "Higher ↑" }, { id: "L", label: "Lower ↓" }],
  create: () => ({ cur: rnd(2, 8), next: null, right: 0, lives: 2, phase: "ask", t: 0 }),
  press(st, env, id) {
    if (st.phase !== "ask") return;
    let n = rnd(1, 9); while (n === st.cur) n = rnd(1, 9);
    st.next = n; st.ok = id === "H" ? n > st.cur : n < st.cur;
    if (st.ok) st.right++; else st.lives--;
    st.phase = "show"; st.t = env.now(); env.sfx(st.ok ? "win" : "lose"); env.buzz(st.ok ? 10 : 30);
  },
  tap(st, env, x, y) { this.press(st, env, y < 28 ? "H" : "L"); },
  tick(st, env) {
    if (st.phase === "show" && env.now() - st.t > 1100) {
      if (st.right >= 5) st.over = { won: true, score: st.right, line: `${st.right} RIGHT` };
      else if (st.lives <= 0) st.over = { won: false, score: st.right, line: `${st.right} RIGHT` };
      else { st.cur = st.next; st.next = null; st.phase = "ask"; }
    }
  },
  card(g, x, y, v) { R(g, x, y, 20, 26, OUT); R(g, x + 1, y + 1, 18, 24, "#ffffff"); if (v == null) text(g, "?", x + 5, y + 6, "#ff7aa0", 3); else text(g, String(v), x + 5, y + 6, v % 2 ? "#ef4a63" : "#3b8fc9", 3); }
  ,
  render(st, env) {
    const g = env.g;
    pinkBg(g);
    this.card(g, 14, 14, st.cur); this.card(g, 46, 14, st.next);
    text(g, ">", 37, 24, "#8f2f4f");
    text(g, `${st.right}/5`, 2, 2, OUT);
    for (let i = 0; i < 2; i++) art(g, ART.heart, LW - 14 + i * 6, 2, i < st.lives ? {} : { tint: "#d8cfe0" });
    if (st.phase === "show") textC(g, st.ok ? "RIGHT!" : "WRONG", 44, st.ok ? "#2f8a57" : "#ef4a63");
    else textC(g, "HIGHER OR LOWER?", 44, "#8f2f4f");
  },
};

/* ---------- 10. Rock paper scissors ---------- */
const RPS_ICON = {
  r: ["..#####..", ".#SSSSS#.", "#SSSsSSS#", "#SSSSSSS#", "#SsSSSsS#", ".#SSSSS#.", "..#####.."].map(r => r.replace(/#/g, "k")),
  p: ["#######..", "#wwwww##.", "#wkkkww#.", "#wwwwww#.", "#wkkkkw#.", "#wwwwww#.", "########."].map(r => r.replace(/#/g, "k")),
  s: ["kk.....kk", "kwk...kwk", ".kwk.kwk.", "..kwkwk..", "...krk...", "..krkrk..", ".krk.krk.", ".kk...kk."],
};
const rps = {
  id: "rps", name: "Rock paper scissors", blurb: "First to 3 wins against your pet.",
  icon: ["..###....", ".#####...", ".#####...", "..###....", ".......##", "......#.#", "#.#..#..#", ".#...####", "#.#......"],
  pad: [{ id: "r", label: "Rock" }, { id: "p", label: "Paper" }, { id: "s", label: "Scissors" }],
  create: () => ({ me: 0, them: 0, phase: "ask", t: 0 }),
  press(st, env, id) {
    if (st.phase !== "ask") return;
    const th = "rps"[rnd(0, 2)];
    st.mine = id; st.theirs = th;
    st.res = id === th ? 0 : ((id === "r" && th === "s") || (id === "p" && th === "r") || (id === "s" && th === "p")) ? 1 : -1;
    if (st.res > 0) st.me++; else if (st.res < 0) st.them++;
    st.phase = "show"; st.t = env.now(); env.sfx(st.res > 0 ? "win" : st.res < 0 ? "lose" : "click");
  },
  tap(st, env, x) { this.press(st, env, x < 27 ? "r" : x < 53 ? "p" : "s"); },
  tick(st, env) {
    if (st.phase === "show" && env.now() - st.t > 1300) {
      if (st.me >= 3 || st.them >= 3) st.over = { won: st.me >= 3, score: st.me, line: `${st.me} - ${st.them}` };
      else st.phase = "ask";
    }
  },
  render(st, env) {
    const g = env.g, now = env.now();
    env.room();
    text(g, `YOU ${st.me}`, 2, 2, OUT); const t = `${st.them} PET`; text(g, t, LW - 2 - textW(t), 2, OUT);
    env.pet(58, FLOOR, { eyes: st.phase === "show" && st.res < 0 ? "happy" : "open", mouth: st.phase === "show" && st.res < 0 ? "open" : null, look: -1 });
    R(g, 30, 14, 15, 13, OUT); R(g, 31, 15, 13, 11, "#ffffff");
    if (st.phase === "show") { art(g, RPS_ICON[st.theirs], 33, 17); R(g, 6, 22, 15, 13, OUT); R(g, 7, 23, 13, 11, "#ffffff"); art(g, RPS_ICON[st.mine], 9, 25); textC(g, st.res > 0 ? "YOU WIN" : st.res < 0 ? "PET WINS" : "DRAW", 9, st.res > 0 ? "#2f8a57" : st.res < 0 ? "#ef4a63" : "#8f2f4f"); }
    else { art(g, RPS_ICON["rps"[Math.floor(now / 250) % 3]], 33, 17); textC(g, "PICK ONE", 9, "#8f2f4f"); }
  },
};

/* ---------- 11. Flutter ---------- */
const flap = {
  id: "flap", name: "Flutter", blurb: "Tap to flutter through 8 candy gates.",
  icon: [".##...##.", ".##...##.", ".##...##.", ".........", "....#....", "...###...", ".........", ".##...##.", ".##...##."],
  pad: [{ id: "F", label: "Flutter!" }],
  create: env => ({ y: 26, vy: 0, started: false, cols: [], next: 0, score: 0, scroll: 0 }),
  press(st, env) { st.started = true; st.vy = -58; env.sfx("click"); env.buzz(5); },
  tap(st, env) { this.press(st, env); },
  tick(st, env, dt) {
    if (!st.started) return;
    st.vy += 170 * dt; st.y += st.vy * dt; st.scroll += 26 * dt;
    st.next -= dt;
    if (st.next <= 0) { st.cols.push({ x: LW + 2, gy: rnd(17, 37) }); st.next = 1.45; }
    const r = env.miniRx() - 1, h = env.miniH();
    for (const c of st.cols) {
      c.x -= 26 * dt;
      if (!c.passed && c.x + 7 < 20 - r) { c.passed = 1; st.score++; env.sfx("pop"); if (st.score >= 8) st.over = { won: true, score: 8, line: "8 GATES" }; }
      if (!c.passed && c.x < 20 + r && c.x + 7 > 20 - r && (st.y - h + 2 < c.gy - 12 || st.y > c.gy + 12)) { st.over = { won: false, score: st.score, line: `${st.score} GATES` }; env.sfx("no"); env.buzz(40); }
    }
    st.cols = st.cols.filter(c => c.x > -10);
    if (st.y > FLOOR + 2 || st.y - h < -2) { st.over = { won: false, score: st.score, line: `${st.score} GATES` }; env.sfx("no"); }
  },
  render(st, env) {
    const g = env.g;
    drawOutdoor(g, env.now(), { scroll: st.scroll });
    for (const c of st.cols) for (let y = 0; y < LH; y++) { if (y > c.gy - 12 && y < c.gy + 12) continue; R(g, c.x, y, 7, 1, ((y >> 1) % 2) ? "#ffffff" : "#ff7aa0"); R(g, c.x - 1, y, 1, 1, OUT); R(g, c.x + 7, y, 1, 1, OUT); }
    env.mini(20, Math.round(st.y), { eyes: st.vy < 0 ? "happy" : "open", look: 1 });
    text(g, `${st.score}/8`, 2, 2, OUT);
    if (!st.started) { panel(g, 18, 20, 44, 12); textC(g, "TAP TO FLY", 24, OUT); }
  },
};

/* ---------- 12. Fishing ---------- */
const fish = {
  id: "fish", name: "Fishing", blurb: "Reel in when the float dives. Catch 3 of 5.",
  icon: ["......#..", ".....#.#.", "....#...#", "...#.....", "..#......", ".#.....#.", "#.....###", ".......#.", "........."],
  pad: [{ id: "R", label: "Reel in!" }],
  create(env) { const s = { cast: 0, caught: 0 }; this.newCast(s, env); return s; },
  newCast(s, env) { const now = env.now(); s.phase = "wait"; s.biteAt = now + 1500 + Math.random() * 2800; s.nibbles = [now + 700 + Math.random() * 500, now + 1300 + Math.random() * 900].filter(t => t < s.biteAt - 300); s.t = now; },
  press(st, env) {
    const now = env.now();
    if (st.phase === "bite") { st.phase = "result"; st.got = true; st.caught++; st.t = now; env.sfx("win"); env.buzz(20); env.spawn("spark", 56, 30, 4, { up: 8 }); }
    else if (st.phase === "wait") { st.phase = "result"; st.got = false; st.why = "TOO SOON"; st.t = now; env.sfx("lose"); }
  },
  tap(st, env) { this.press(st, env); },
  tick(st, env) {
    const now = env.now();
    if (st.phase === "wait" && now >= st.biteAt) { st.phase = "bite"; st.t = now; env.sfx("alert"); env.buzz(25); }
    else if (st.phase === "bite" && now - st.t > 750) { st.phase = "result"; st.got = false; st.why = "GOT AWAY"; st.t = now; env.sfx("lose"); }
    else if (st.phase === "result" && now - st.t > 1300) {
      st.cast++;
      if (st.cast >= 5) st.over = { won: st.caught >= 3, score: st.caught, line: `${st.caught} FISH` };
      else this.newCast(st, env);
    }
  },
  render(st, env) {
    const g = env.g, now = env.now();
    drawOutdoor(g, now);
    R(g, 0, 32, LW, 24, "#6fb7ea"); for (let i = 0; i < 10; i++) R(g, (i * 17 + Math.floor(now / 200)) % LW, 36 + (i * 7) % 18, 3, 1, "#a8dcff");
    R(g, 0, 30, 30, 4, "#a36d45"); R(g, 4, 34, 2, 10, "#7a4e2f"); R(g, 22, 34, 2, 10, "#7a4e2f");
    env.mini(14, 30, { eyes: st.phase === "result" && st.got ? "happy" : "open", look: 1 });
    let by = 33;
    if (st.phase === "wait" && st.nibbles.some(t => now > t && now < t + 250)) by = 34;
    if (st.phase === "bite") by = 36;
    for (let i = 0; i <= 20; i++) { const x = 20 + i * 1.8, y = 22 + (by - 22) * (i / 20) - Math.sin(i / 20 * Math.PI) * 6; R(g, x, y, 1, 1, "#ffffff"); }
    R(g, 56, by - 2, 3, 2, "#ef4a63"); R(g, 56, by, 3, 1, "#ffffff");
    text(g, `${st.caught}/3`, 2, 2, OUT); text(g, `CAST ${Math.min(5, st.cast + 1)}`, LW - 2 - textW("CAST 5"), 2, OUT);
    if (st.phase === "bite") text(g, "!", 56, 18, "#ef4a63", 2);
    if (st.phase === "result") { if (st.got) { art(g, ART.fish, 52, 20); textC(g, "GOT ONE!", 10, "#2f8a57"); } else textC(g, st.why, 10, "#ef4a63"); }
  },
};

/* ---------- Two-player: Tap race ---------- */
function versusIntro(g, env, st) {
  const e = env.snow() - st.start;
  if (e < 0) { panel(g, CX - 26, 14, 52, 22); textC(g, env.partner() ? "GET READY" : "WAITING", 18, "#8f2f4f"); textC(g, String(Math.ceil(-e / 1000)), 26, OUT); }
  else if (e < 1200) { panel(g, CX - 20, 18, 40, 12); textC(g, "GO!", 21, "#2f8a57", 1); }
}
const race = {
  id: "race", name: "Tap race", blurb: "Tap as fast as you can. First to the flag wins.", twoPlayer: true,
  icon: ["#........", "##.......", "###......", "##.......", "#........", "#........", "#..#..#..", "#.###.###", "#########"],
  pad: [{ id: "T", label: "Tap! Tap! Tap!" }],
  create: (env, opts) => ({ coop: true, id: opts.co.id, seed: opts.co.seed, start: opts.co.start, taps: 0, goal: 40, dur: 20000 }),
  coSync: st => ({ taps: st.taps }),
  press(st, env) { if (env.snow() < st.start) return; st.taps = Math.min(st.goal, st.taps + 1); env.sfx("click"); },
  tap(st, env) { this.press(st, env); },
  tick(st, env) {
    const p = env.partner(), pt = p ? Math.min(st.goal, p.taps || 0) : 0, e = env.snow() - st.start;
    if (st.taps >= st.goal || pt >= st.goal || e >= st.dur) st.over = { won: st.taps >= pt, score: st.taps, line: `${st.taps} - ${pt}` };
  },
  render(st, env) {
    const g = env.g, now = env.now(), p = env.partner(), pt = p ? Math.min(st.goal, p.taps || 0) : 0;
    drawOutdoor(g, now, { scroll: 0 });
    R(g, 0, 36, LW, 2, "#8fd36b"); R(g, 0, 38, LW, 1, "#6fbf55"); R(g, 0, 46, LW, 1, "#6fbf55");
    R(g, 70, 8, 1, 46, OUT); for (let y = 8; y < 14; y++) for (let x = 71; x < 77; x++) R(g, x, y, 1, 1, ((x + y) & 1) ? OUT : "#ffffff");
    const run = Math.floor(now / 120) % 2;
    if (p) env.partnerMini(8 + Math.round(56 * pt / st.goal), 36 - run, { look: 1, alpha: .95 });
    env.mini(8 + Math.round(56 * st.taps / st.goal), 54 - (st.taps % 2), { look: 1, eyes: "happy" });
    text(g, `YOU ${st.taps}`, 2, 2, OUT); const t = `${pt} THEM`; text(g, t, LW - 2 - textW(t), 2, OUT);
    versusIntro(g, env, st);
  },
};

/* ---------- Two-player: Tug of war ---------- */
const tug = {
  id: "tug", name: "Tug of war", blurb: "Tap to pull the rope to your side.", twoPlayer: true,
  icon: [".........", "##.....##", "##.....##", "#########", "##..#..##", "##.....##", ".........", ".........", "........."],
  pad: [{ id: "T", label: "Pull! Pull!" }],
  create: (env, opts) => ({ coop: true, id: opts.co.id, seed: opts.co.seed, start: opts.co.start, taps: 0, dur: 15000, win: 24, host: !!opts.co.host }),
  coSync: st => ({ taps: st.taps }),
  press(st, env) { if (env.snow() < st.start) return; st.taps++; env.sfx("click"); env.buzz(4); },
  tap(st, env) { this.press(st, env); },
  diff(st, env) { const p = env.partner(); return st.taps - (p ? p.taps || 0 : 0); },
  tick(st, env) {
    const d = this.diff(st, env), e = env.snow() - st.start;
    if (Math.abs(d) >= st.win || e >= st.dur) { const p = env.partner(); st.over = { won: d >= 0, score: st.taps, line: `${st.taps} - ${p ? p.taps || 0 : 0}` }; }
  },
  render(st, env) {
    const g = env.g, now = env.now();
    drawOutdoor(g, now);
    const d = Math.max(-st.win, Math.min(st.win, this.diff(st, env)));
    const off = -Math.round(d * 1.1);
    R(g, CX - st.win - 4, 48, 1, 5, "#ef4a63"); R(g, CX + st.win + 4, 48, 1, 5, "#ef4a63"); R(g, CX, 49, 1, 3, "#ffffff");
    for (let x = 12; x < LW - 12; x++) R(g, x + off, 40 + (x % 3 === 0 ? 1 : 0), 1, 1, "#b0814e");
    R(g, CX + off - 1, 38, 3, 6, "#ef4a63");
    const strain = Math.floor(now / 100) % 2;
    env.mini(12 + off - strain, FLOOR, { look: -1, eyes: "squeeze" });
    if (env.partner()) env.partnerMini(LW - 12 + off + strain, FLOOR, { look: 1, eyes: "squeeze" });
    text(g, `YOU ${st.taps}`, 2, 2, OUT); const p = env.partner(); const t = `${p ? p.taps || 0 : 0} THEM`; text(g, t, LW - 2 - textW(t), 2, OUT);
    versusIntro(g, env, st);
  },
};

export const GAMES = [guess, catchStars, hop, memory, simon, whack, timing, shell, hilo, rps, flap, fish, race, tug];
export const GAME_BY_ID = Object.fromEntries(GAMES.map(g => [g.id, g]));
