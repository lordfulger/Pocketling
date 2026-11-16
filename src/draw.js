// Pixel-art engine: palette, font, creatures (8 animal families), eggs and the decorated room.
export const LW = 80, LH = 56, CX = 40, FLOOR = 52;
export const OUT = "#2b2340";

export const PAL = { k: OUT, w: "#ffffff", r: "#ef4a63", R: "#b8293f", p: "#ff9fbb", y: "#ffd84d", Y: "#e9a227", b: "#9b6440", B: "#6e4128", g: "#7ccf6c", G: "#2f6d45", c: "#8fdcf4", C: "#3b8fc9", s: "#e4dfee", S: "#b5aec8", o: "#ff9b5a", n: "#5b4a3e" };
export const ART = {
  meal: ["....kk....", "...kwwk...", "..kwwwwk..", ".kwwwwwwk.", ".kwwwwwwk.", "kwwwwwwwwk", "kwwGGGGwwk", "kwwGGGGwwk", ".kkkkkkkk."],
  snack: ["....rr....", "....kR....", "..kkpkk...", ".kppwppk..", "kpwpppppk.", "kpppppwpk.", "kkkkkkkkk.", ".kYyYyYk..", ".kyYyYyk..", "..kkkkk..."],
  poop: ["...kk....", "..kbbk...", "...kbbk..", "..kbbbbk.", ".kbBbbbk.", "kbbbbBbbk", ".kkkkkkk."],
  syringe: ["k.kkkkkkk..", "kkwccccckkk", "k.kkkkkkk.."],
  heart: [".r.r.", "rrrrr", ".rrr.", "..r.."],
  sparkle: ["..w..", "..y..", "wyyyw", "..y..", "..w.."],
  star: ["..y..", ".yyy.", "yyyyy", ".yyy.", ".y.y."],
  letter: ["kkkkkkkkk", "kkwwwwwkk", "kwkwwwkwk", "kwwkrkwwk", "kwwwwwwwk", "kkkkkkkkk"],
  miniLetter: ["kkkkkkk", "kkwwwkk", "kwkrkwk", "kwwwwwk", "kkkkkkk"],
  miniFood: ["..kkk..", ".kwwwk.", "kwwwwwk", "kwGGGwk", ".kkkkk."],
  miniHeart: [".rr.rr.", "rrrrrrr", ".rrrrr.", "..rrr..", "...r..."],
  skull: [".kkkkk.", "kwwwwwk", "kwkwkwk", "kwwwwwk", ".kwkwk.", "..kkk.."],
  note: ["..kk", "..kk", "..k.", "kkk.", "kkk."],
  flower: [".p.p.", "ppypp", ".ppp.", "..g..", ".gg.."],
  plant: ["..g.g...", ".ggGgg..", "gGg.gGg.", ".g.G.g..", "...G....", ".kkkkk..", ".kooook.", "..kook..", "..kkkk.."],
  cactus: ["...g...", "..gGg..", "g.gGg..", "gggGg.g", ".ggGggg", "..gGg..", "..gGg..", ".kkkkk.", ".koook.", "..kok..", "..kkk.."],
  teddy: [".bb...bb.", "bBbbbbbBb", ".bbbbbbb.", ".bkbbbkb.", ".bbbwbbb.", "..bbkbb..", ".bbbbbbb.", "bbbbbbbbb", ".bb...bb."],
  gift: ["..r..r..", "...rr...", "kkkkkkkk", "kpppRppk", "kpppRppk", "kRRRRRRk", "kpppRppk", "kkkkkkkk"],
  rock: ["..kkkk..", ".kSSSSk.", "kSsSSSSk", "kSSSSSSk", "kkkkkkkk"],
  fish: [".kkk..k.", "kooowkk.", "koooooko", "kooookk.", ".kkk..k."],
  mole: ["..kkkkk..", ".kbbbbbk.", "kbkbbbkbk", "kbbbpbbbk", "kbbwwwbbk", "kbbbbbbbk"],
  bug: [".k...k.", "..k.k..", ".kkkkk.", "kgkgkgk", "kgggggk", ".kkkkk."],
  pancake: ["...kk....", "..kwwk...", ".kyyyyyk.", "kYYYYYYYk", ".kyyyyyk.", "kYYYYYYYk", ".kkkkkkk."],
  salad: ["..g.G.g..", ".gGgGgGg.", "kgrgggrgk", "kwwwwwwwk", ".kwwwwwk.", "..kkkkk.."],
  noodles: ["..k...k..", "...k.k...", "kyYyYyYyk", "kwwwwwwwk", ".kwwwwwk.", "..kkkkk.."],
  icecream: ["..kkk..", ".kpppk.", "kpwpppk", ".kpppk.", "kYkYkYk", ".kYYYk.", "..kYk..", "...k..."],
  cookie: [".kkkkk.", "kbBbbbk", "kbbbBbk", "kBbbbbk", "kbbBbbk", ".kkkkk."],
  berry: ["..gGg..", ".krrrk.", "krwrrrk", "krrrwrk", ".krrrk.", "..krk.."],
  candy: [".kkk.", "kpwpk", "kwpwk", "kpwpk", ".kkk.", "..k..", "..k..", "..k.."],
  cake: ["...r...", "..kkk..", ".kwwwk.", "kpppppk", "kwwwwwk", "kpppppk", "kkkkkkk"],
  coin: [".kkk.", "kyyYk", "kyYyk", "kYyyk", ".kkk."],
  pumpkin: ["...G....", "..kGk...", ".kokokk.", "kookooko", "kokkokko", "kooookok", ".kkkkkk."],
};

const FONT_SRC = {
  A: ".#. #.# ### #.# #.#", B: "##. #.# ##. #.# ##.", C: ".## #.. #.. #.. .##", D: "##. #.# #.# #.# ##.",
  E: "### #.. ##. #.. ###", F: "### #.. ##. #.. #..", G: ".## #.. #.# #.# .##", H: "#.# #.# ### #.# #.#",
  I: "### .#. .#. .#. ###", J: "..# ..# ..# #.# .#.", K: "#.# #.# ##. #.# #.#", L: "#.. #.. #.. #.. ###",
  M: "#.# ### ### #.# #.#", N: "##. #.# #.# #.# #.#", O: ".#. #.# #.# #.# .#.", P: "##. #.# ##. #.. #..",
  Q: ".#. #.# #.# ##. .##", R: "##. #.# ##. #.# #.#", S: ".## #.. .#. ..# ##.", T: "### .#. .#. .#. .#.",
  U: "#.# #.# #.# #.# ###", V: "#.# #.# #.# #.# .#.", W: "#.# #.# ### ### #.#", X: "#.# #.# .#. #.# #.#",
  Y: "#.# #.# .#. .#. .#.", Z: "### ..# .#. #.. ###",
  "0": "### #.# #.# #.# ###", "1": ".#. ##. .#. .#. ###", "2": "##. ..# .#. #.. ###", "3": "##. ..# .#. ..# ##.",
  "4": "#.# #.# ### ..# ..#", "5": "### #.. ##. ..# ##.", "6": ".## #.. ### #.# ###", "7": "### ..# .#. .#. .#.",
  "8": "### #.# ### #.# ###", "9": "### #.# ### ..# ##.",
  ":": "... .#. ... .#. ...", "-": "... ... ### ... ...", "!": ".#. .#. .#. ... .#.", "?": "##. ..# .#. ... .#.",
  ">": "#.. .#. ..# .#. #..", "<": "..# .#. #.. .#. ..#", ".": "... ... ... ... .#.", " ": "... ... ... ... ...",
  "/": "..# ..# .#. #.. #..", "+": "... .#. ### .#. ...", "'": ".#. .#. ... ... ...", "x": "... #.# .#. #.# ...",
};
const FONT = {};
for (const k in FONT_SRC) FONT[k] = FONT_SRC[k].split(" ");

export function R(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
export function art(ctx, rows, x, y, o = {}) {
  x = Math.round(x); y = Math.round(y);
  for (let r = o.cut || 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === ".") continue;
      ctx.fillStyle = o.tint || PAL[ch] || OUT;
      ctx.fillRect(x + (o.flip ? row.length - 1 - c : c), y + r, 1, 1);
    }
  }
}
export function text(ctx, str, x, y, col, scale = 1) {
  str = String(str).toUpperCase(); ctx.fillStyle = col || OUT;
  for (const ch of str) {
    const gl = FONT[ch] || FONT[ch.toLowerCase()] || FONT["?"];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (gl[r][c] === "#") ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
    x += 4 * scale;
  }
}
export const textW = (s, scale = 1) => String(s).length * 4 * scale - scale;
export function textC(ctx, s, y, col, scale = 1) { text(ctx, s, Math.round((LW - textW(s, scale)) / 2), y, col, scale); }
export function cleanLabel(s, n) { return String(s || "").toUpperCase().replace(/[^A-Z0-9 !?.\-']/g, "").slice(0, n); }
export function panel(ctx, x, y, w, h) { R(ctx, x, y, w, h, OUT); R(ctx, x + 1, y + 1, w - 2, h - 2, "#fff4f7"); }

function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
export function mix(a, b, t) { const A = hex(a), B = hex(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); }

export function PixGrid(N) {
  const grid = new Array(N * N).fill(null);
  const inb = (x, y) => x >= 0 && y >= 0 && x < N && y < N;
  const api = {
    grid, N,
    set(x, y, c) { x = Math.round(x); y = Math.round(y); if (inb(x, y)) grid[y * N + x] = c; },
    get(x, y) { x = Math.round(x); y = Math.round(y); return inb(x, y) ? grid[y * N + x] : null; },
    ell(ex, ey, rx, ry, c, onlyIf) {
      for (let y = Math.floor(-ry); y <= Math.ceil(ry); y++) for (let x = Math.floor(-rx); x <= Math.ceil(rx); x++) {
        if ((x * x) / (rx * rx) + (y * y) / (ry * ry) > 1) continue;
        const X = Math.round(ex + x), Y = Math.round(ey + y);
        if (onlyIf && !onlyIf(api.get(X, Y))) continue;
        api.set(X, Y, c);
      }
    },
    tri(ax, ay, bx, by, cx, cy, c) {
      const minx = Math.floor(Math.min(ax, bx, cx)), maxx = Math.ceil(Math.max(ax, bx, cx));
      const miny = Math.floor(Math.min(ay, by, cy)), maxy = Math.ceil(Math.max(ay, by, cy));
      const s = (px, py, x1, y1, x2, y2) => (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
      for (let y = miny; y <= maxy; y++) for (let x = minx; x <= maxx; x++) {
        const d1 = s(x, y, ax, ay, bx, by), d2 = s(x, y, bx, by, cx, cy), d3 = s(x, y, cx, cy, ax, ay);
        if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) api.set(x, y, c);
      }
    },
    outline(col) {
      const out = grid.slice();
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        if (grid[y * N + x]) continue;
        if (api.get(x - 1, y) || api.get(x + 1, y) || api.get(x, y - 1) || api.get(x, y + 1)) out[y * N + x] = col;
      }
      for (let i = 0; i < out.length; i++) grid[i] = out[i];
    },
    over(other) { for (let i = 0; i < grid.length; i++) if (other.grid[i]) grid[i] = other.grid[i]; },
    stamp(rows, x0, y0) { rows.forEach((row, r) => { for (let c = 0; c < row.length; c++) if (row[c] !== ".") api.set(x0 + c, y0 + r, PAL[row[c]] || OUT); }); },
    blit(ctx, ox, oy, sx, sy, o = {}) {
      ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        let c = grid[y * N + x]; if (!c) continue;
        if (o.sil) c = o.sil;
        ctx.fillStyle = c;
        ctx.fillRect(ox + ((o.flip ? 2 * sx - x : x) - sx), oy + (y - sy), 1, 1);
      }
      ctx.globalAlpha = 1;
    },
  };
  return api;
}

/* ===================== animal families ===================== */
export const FAMILIES = {
  kitten:  { name: "Kitten",  c: ["#ffc49a", "#e8956b", "#ffe2cc"], belly: "#fff3e8", ears: "cat", tail: "curl", nose: "pink", whiskers: 1, mouth: "w", marks: "stripes", egg: ["#ffe9d9", "#e8956b"], blurb: "Playful, curious and a little sassy." },
  bunny:   { name: "Bunny",   c: ["#f7f3ff", "#cdc3e6", "#ffffff"], belly: "#ffffff", ears: "bunny", tail: "puff", nose: "pink", mouth: "w", teeth: 1, egg: ["#ffffff", "#c8b6f0"], blurb: "Soft, gentle and always hopping." },
  puppy:   { name: "Puppy",   c: ["#ebc391", "#c4955f", "#f8dfbd"], belly: "#fff4e6", ears: "floppy", tail: "wag", muzzle: "#fff4e6", nose: "dark", mouth: "smile", marks: "patch", egg: ["#fff2df", "#a57449"], blurb: "Loyal, loud and full of love." },
  bear:    { name: "Bear",    c: ["#bb8d67", "#8d6446", "#dbb99a"], belly: "#ead0b6", ears: "round", muzzle: "#ead0b6", nose: "dark", mouth: "smile", big: 1, egg: ["#f3e2d2", "#8d6446"], blurb: "Big, cuddly and very sleepy." },
  fox:     { name: "Fox",     c: ["#ff9c55", "#df6f2e", "#ffc28d"], belly: "#fff6ee", ears: "fox", tail: "bushy", muzzle: "#fff6ee", nose: "dark", mouth: "w", egg: ["#ffe6d3", "#ef7d3a"], blurb: "Clever, quick and a bit mischievous." },
  penguin: { name: "Penguin", c: ["#46557a", "#2e3858", "#66779f"], belly: "#ffffff", fixedBelly: 1, beak: 1, flippers: 1, feetColor: "#ffa33a", mouth: "none", tall: 1, egg: ["#eef3ff", "#46557a"], blurb: "Waddly, brave and loves the cold." },
  frog:    { name: "Frog",    c: ["#92da6e", "#5aa846", "#c6f1ab"], belly: "#ecfbd9", frogEyes: 1, mouth: "wide", marks: "spots", wide: 1, egg: ["#eaffdc", "#5aa846"], blurb: "Bouncy, silly and always grinning." },
  dragon:  { name: "Dragon",  c: ["#a3d3ff", "#6a9fe0", "#d7ecff"], belly: "#fff1b8", fixedBelly: 1, ears: "horns", wings: 1, tail: "spike", nose: "nostrils", mouth: "smile", marks: "scales", egg: ["#e6f3ff", "#6a9fe0"], blurb: "Tiny, brave and secretly fluffy." },
};
export const FAMILY_ORDER = ["kitten", "bunny", "puppy", "bear", "fox", "penguin", "frog", "dragon"];
const DIMS = {
  baby:  { rx: 7,  ry: 6.5,  feet: 1, gap: 2, ey: 0,  earS: 0.6 },
  child: { rx: 9,  ry: 8,    feet: 2, gap: 3, ey: -1, earS: 0.8 },
  teen:  { rx: 10, ry: 9.5,  feet: 2, gap: 3, ey: -2, earS: 0.9 },
  adult: { rx: 12, ry: 10.5, feet: 2, gap: 4, ey: -2, earS: 1 },
};
export const STAGE_LABEL = { baby: "Baby", child: "Child", teen: "Teen", adult: "Adult" };
const VARIANT_INFO = {
  "baby.n":     { adj: "Baby",       blurb: "Brand new to the world." },
  "child.n":    { adj: "Little",     blurb: "Curious about everything." },
  "teen.good":  { adj: "Cheerful",   blurb: "Growing up well." },
  "teen.poor":  { adj: "Scruffy",    blurb: "A bit rough around the edges." },
  "adult.star": { adj: "Starry",     blurb: "Only for perfect parents.", life: 24, sleep: [21, 8] },
  "adult.good": { adj: "Sweet",      blurb: "Raised with lots of love.", life: 19, sleep: [21, 8] },
  "adult.ok":   { adj: "Easygoing",  blurb: "Happy-go-lucky.", life: 15, sleep: [22, 9] },
  "adult.poor": { adj: "Grumpy",     blurb: "Needed more attention.", life: 10, sleep: [23, 10] },
};
export const BOOK_STAGES = ["baby.n", "child.n", "teen.good", "teen.poor", "adult.star", "adult.good", "adult.ok", "adult.poor"];
const BASE_WEIGHT = { baby: 5, child: 10, teen: 15, adult: 20 };
const FAM_WEIGHT = { bear: 8, penguin: 4, dragon: 5, bunny: -2, frog: 0, kitten: 0, puppy: 2, fox: 0 };
const specCache = {};
export function formId(family, stage, variant) { return `${family}.${stage}.${variant}`; }
export function getSpec(id) {
  if (specCache[id]) return specCache[id];
  const [family, stage, variant] = String(id).split(".");
  const F = FAMILIES[family], D = DIMS[stage];
  if (!F || !D) return null;
  const info = VARIANT_INFO[`${stage}.${variant}`] || VARIANT_INFO["baby.n"];
  let c = F.c.slice();
  if (variant === "poor") c = c.map(v => mix(v, "#9a94a8", 0.22));
  if (variant === "star") c = c.map(v => mix(v, "#ffffff", 0.1));
  const sp = Object.assign({}, F, {
    id, family, stage, variant, c,
    rx: D.rx + (F.big ? 1 : 0) + (F.wide ? 1 : 0) - (F.tall ? 1 : 0),
    ry: D.ry + (F.tall ? 1 : 0) - (F.wide ? 1 : 0),
    feet: D.feet, gap: D.gap + (F.wide && stage !== "baby" ? 1 : 0), ey: D.ey, earS: D.earS, eye: 3, n: F.wide ? 2.5 : 2.2,
    label: `${info.adj} ${F.name.toLowerCase()}`, blurb: info.blurb,
    life: info.life || 0, sleep: info.sleep || null,
    base: BASE_WEIGHT[stage] + (stage === "baby" ? 0 : (FAM_WEIGHT[family] || 0)),
  });
  specCache[id] = sp;
  return sp;
}
export const GHOST = { c: ["#ffffff", "#dfe2f6", "#ffffff"], rx: 8, ry: 9, n: 2, feet: 0, eye: 3, gap: 3, ey: -1, blush: 1, mouth: "smile", earS: 1 };

/* ===================== customization data ===================== */
export const COATS = {
  natural:    { name: "Natural" },
  strawberry: { name: "Strawberry", c: ["#ffb3c7", "#ec7c9c", "#ffe1ea"], belly: "#fff2f6" },
  lavender:   { name: "Lavender",   c: ["#cdb6ff", "#9a7be3", "#efe7ff"], belly: "#f8f4ff" },
  mint:       { name: "Mint",       c: ["#9fe8c4", "#56bd90", "#ddfaec"], belly: "#f1fff8" },
  sky:        { name: "Sky",        c: ["#a3d6ff", "#5ea6e6", "#ddf0ff"], belly: "#f3f9ff" },
  lemon:      { name: "Lemon",      c: ["#ffe57e", "#eeb23d", "#fff6cb"], belly: "#fffbe8" },
  peach:      { name: "Peach",      c: ["#ffc29a", "#ec8f62", "#ffe4d2"], belly: "#fff4ec" },
  snow:       { name: "Snow",       c: ["#f7f7fc", "#c8c8dc", "#ffffff"], belly: "#ffffff" },
  cocoa:      { name: "Cocoa",      c: ["#bd8f6d", "#8a5f43", "#dfc3ac"], belly: "#f2e3d5" },
  midnight:   { name: "Midnight",   c: ["#646aa3", "#3c4073", "#9298cf"], belly: "#c8ccf3" },
  bubblegum:  { name: "Bubblegum",  c: ["#ff9fd8", "#e266b4", "#ffd6f0"], belly: "#fff0fa" },
  cherry:     { name: "Cherry",     c: ["#ff7a8a", "#d94a62", "#ffc2cb"], belly: "#fff0f2" },
  galaxy:     { name: "Galaxy",     c: ["#6a4fb3", "#43307f", "#9d86e6"], belly: "#d9cff8" },
  gold:       { name: "Gold",       c: ["#ffd24a", "#d99a1a", "#fff1a8"], belly: "#fff8dc" },
};
export const HEADWEAR = { none: "None", bow: "Bow", flower: "Flower", wreath: "Flower crown", cap: "Cap", beanie: "Beanie", crown: "Crown", party: "Party hat", phones: "Headphones", sunhat: "Sun hat", tiara: "Tiara", bunnyband: "Bunny band", witch: "Witch hat", santa: "Santa hat", halo: "Halo" };
export const FACEWEAR = { none: "None", glasses: "Glasses", shades: "Sunglasses", hearteyes: "Heart eyes", freckles: "Freckles", rosy: "Rosy cheeks", monocle: "Monocle", mask: "Hero mask" };
export const NECKWEAR = { none: "None", scarf: "Scarf", bowtie: "Bow tie", bell: "Bell collar", pearls: "Pearls", lei: "Flower lei", medal: "Gold medal" };
export const DEFAULT_STYLE = { coat: "natural", head: "none", face: "none", neck: "none" };

/* ===================== creature renderer ===================== */
// Feet sit on row `by`, centred on column `cx`. Returns head/eye positions for bubbles and tags.
export function drawCreature(ctx, sp, cx, by, o = {}) {
  const N = 60, OX = 30, OY = 56;
  const P = PixGrid(N);
  const st = Object.assign({}, DEFAULT_STYLE, o.style || {});
  const coat = COATS[st.coat] && COATS[st.coat].c ? COATS[st.coat] : null;
  let [base, shade, light] = coat ? coat.c : sp.c;
  if (coat && sp.variant === "poor") { base = mix(base, "#9a94a8", .22); shade = mix(shade, "#9a94a8", .22); light = mix(light, "#9a94a8", .22); }
  const belly = sp.belly ? (coat && !sp.fixedBelly ? coat.belly : sp.belly) : null;
  const sq = o.sq || 1;
  const rx = Math.max(3, Math.round(sp.rx * (1 + (1 - sq) * 0.9)));
  const ry = Math.max(3, Math.round(sp.ry * sq));
  const feet = sp.feet || 0;
  const es = sp.earS || 1;
  const bx = OX, bottom = OY - feet, cy = bottom - ry, top = cy - ry;
  const hatOn = ["cap", "beanie", "crown", "party", "phones", "sunhat", "witch", "santa", "bunnyband"].includes(st.head) || o.hat;
  const isBodyCol = v => v === base || v === shade || v === light;

  // behind the body
  if (sp.wings) for (const s of [-1, 1]) { P.tri(bx + s * (rx - 3), cy - 1, bx + s * (rx + 5 * es), cy - ry * 0.95, bx + s * (rx + 4 * es), cy + 3, light); P.set(bx + s * (rx + 3 * es), cy - ry * 0.4, shade); }
  if (sp.tail === "curl") { P.ell(bx + rx + 1, cy + ry * 0.4, 2.2 * es, 1.8, base); P.ell(bx + rx + 2.5 * es, cy + ry * 0.05, 1.4, 2.6 * es, base); }
  if (sp.tail === "bushy") { P.ell(bx + rx + 2 * es, cy + ry * 0.2, 3.6 * es, 3 * es, base); P.ell(bx + rx + 4 * es, cy - ry * 0.15, 2.2 * es, 2 * es, "#ffffff"); }
  if (sp.tail === "wag") P.ell(bx + rx + 1, cy + ry * 0.25 - Math.round(Math.sin((o.t || 0) / 120)), 2, 1.5, shade);
  if (sp.tail === "puff") P.ell(bx + rx, cy + ry * 0.5, 2.3 * es, 2.3 * es, "#ffffff");
  if (sp.tail === "spike") { P.tri(bx + rx - 2, cy + ry * 0.1, bx + rx - 2, cy + ry * 0.75, bx + rx + 6 * es, cy + ry * 0.85, shade); P.set(bx + rx + 2, cy + ry * 0.2, shade); }
  if (sp.ears === "cat") for (const s of [-1, 1]) P.tri(bx + s * (rx - 1), cy - ry * 0.3, bx + s * (rx * 0.2), cy - ry * 0.85, bx + s * (rx * 0.78), top - 5 * es, base);
  if (sp.ears === "fox") for (const s of [-1, 1]) P.tri(bx + s * rx, cy - ry * 0.15, bx + s * (rx * 0.12), cy - ry * 0.8, bx + s * (rx * 0.85), top - 7 * es, base);
  if (sp.ears === "bunny" && !hatOn) for (const s of [-1, 1]) P.ell(bx + s * Math.max(2, 4 * es), top - 5 * es, 2.2, 6.4 * es, base);
  if (sp.ears === "bunny" && hatOn) for (const s of [-1, 1]) P.ell(bx + s * (rx + 1), cy - ry * 0.3, 1.8, 5 * es, base);
  if (sp.ears === "round") for (const s of [-1, 1]) P.ell(bx + s * rx * 0.72, cy - ry * 0.78, 2.4 * es + 0.6, 2.4 * es + 0.6, base);
  if (sp.ears === "horns" && !hatOn) for (const s of [-1, 1]) P.tri(bx + s * rx * 0.35 - 1, top + 2, bx + s * rx * 0.35 + 1, top + 2, bx + s * rx * 0.5, top - 3.5 * es, "#fff1b8");
  if (sp.frogEyes) for (const s of [-1, 1]) P.ell(bx + s * (sp.gap + 0.5), top + 1, 3, 2.6, base);
  if (sp.flippers) for (const s of [-1, 1]) P.ell(bx + s * rx, cy + 2, 1.8, ry * 0.45, shade);
  if (feet) for (const s of [-1, 1]) P.ell(bx + s * Math.round(rx * 0.5), OY - 1, 2.6, 1.6, sp.feetColor || shade);

  // body
  const n = sp.n || 2.2;
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
    const nx = x / rx, ny = y / ry;
    if (Math.pow(Math.abs(nx), n) + Math.pow(Math.abs(ny), n) > 1) continue;
    let c = base;
    if (nx * 0.45 + ny * 0.9 > 0.66) c = shade;
    else if ((nx + 0.42) * (nx + 0.42) + (ny + 0.5) * (ny + 0.5) < 0.045) c = light;
    P.set(bx + x, cy + y, c);
  }
  if (belly) {
    if (sp.beak) P.ell(bx, cy + ry * 0.18, rx * 0.72, ry * 0.78, belly, isBodyCol);
    else P.ell(bx, cy + ry * 0.4, rx * 0.55, ry * 0.48, belly, isBodyCol);
  }
  if (sp.marks === "scales" && belly) for (let y = Math.round(cy + ry * 0.1); y < cy + ry; y += 2) for (let x = -rx; x <= rx; x++) if (P.get(bx + x, y) === belly && (x + y) % 3 === 0) P.set(bx + x, y, "#f0d98a");
  if (sp.marks === "stripes") for (const i of [-2, 0, 2]) for (const y of [1, 2]) if (isBodyCol(P.get(bx + i, top + y))) P.set(bx + i, top + y, shade);
  if (sp.marks === "spots") for (const [x, y, r] of [[-0.55, -0.15, 1.3], [0.6, 0.1, 1.1], [0.3, -0.55, 1]]) P.ell(bx + rx * x, cy + ry * y, r, r, shade, isBodyCol);
  if (sp.ears === "cat" || sp.ears === "fox") for (const s of [-1, 1]) { const ix = bx + s * Math.round(rx * (sp.ears === "fox" ? 0.6 : 0.62)); P.set(ix, top - 1, "#ff9fbb"); P.set(ix, top, "#ff9fbb"); if (sp.ears === "fox") { P.set(bx + s * Math.round(rx * 0.82), top - Math.round(6 * es), "#4a3030"); P.set(bx + s * Math.round(rx * 0.8), top - Math.round(5 * es), "#4a3030"); } }
  if (sp.ears === "bunny" && !hatOn) for (const s of [-1, 1]) for (let y = -Math.round(8 * es); y <= -3; y++) P.set(bx + s * Math.max(2, 4 * es), top + y, "#ffb3c9");
  if (sp.ears === "round") for (const s of [-1, 1]) P.set(bx + s * Math.round(rx * 0.72), cy - Math.round(ry * 0.8), light === base ? shade : light);

  P.outline(OUT);
  const isBody = (x, y) => { const v = P.get(x, y); return !!v && v !== OUT; };

  // floppy ears get their own outline so they read as separate shapes
  if (sp.ears === "floppy") {
    const Q = PixGrid(N);
    for (const s of [-1, 1]) Q.ell(bx + s * (rx - 0.5), cy - ry * 0.3 + 1, 2.4 * es + 0.5, 4.4 * es + 0.8, shade);
    Q.outline(OUT); P.over(Q);
  }

  // face
  const look = o.look || 0;
  const ey = sp.frogEyes ? top : cy + (sp.ey || 0) - 1;
  const gap = sp.gap;
  const eyesAt = [bx - gap - 1 + look, bx + gap + look];
  const eyes = o.eyes || "open";
  if (sp.marks === "patch") P.ell(eyesAt[1] + 0.5, ey + 1, 2.6, 2.4, shade, v => isBodyCol(v) || v === belly);
  for (const ex of eyesAt) {
    const leftEye = ex < bx + look;
    if (eyes === "open" || eyes === "angry" || eyes === "sad") {
      if (st.face === "hearteyes" && eyes === "open") { const x0 = leftEye ? ex - 1 : ex; for (const [hx, hy] of [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [1, 2]]) P.set(x0 + hx, ey + hy, "#ef4a63"); continue; }
      for (const r of [0, 1, 2]) { P.set(ex, ey + r, OUT); P.set(ex + 1, ey + r, OUT); }
      P.set(ex, ey, "#ffffff");
      if (sp.variant === "poor" || eyes === "sad") { const lid = P.get(ex - 1, ey) && P.get(ex - 1, ey) !== OUT ? P.get(ex - 1, ey) : shade; P.set(ex, ey, lid); P.set(ex + 1, ey, lid); }
      if (eyes === "angry") { if (leftEye) { P.set(ex, ey - 2, OUT); P.set(ex + 1, ey - 1, OUT); } else { P.set(ex + 1, ey - 2, OUT); P.set(ex, ey - 1, OUT); } }
      if (eyes === "sad") { if (leftEye) { P.set(ex + 1, ey - 2, OUT); P.set(ex, ey - 1, OUT); } else { P.set(ex, ey - 2, OUT); P.set(ex + 1, ey - 1, OUT); } }
    } else if (eyes === "happy") {
      P.set(ex, ey + 1, OUT); P.set(ex + 1, ey + 1, OUT); P.set(ex - 1, ey + 2, OUT); P.set(ex + 2, ey + 2, OUT);
    } else if (eyes === "sleep" || eyes === "blink") {
      P.set(ex - 1, ey + 1, OUT); P.set(ex + 2, ey + 1, OUT); P.set(ex, ey + 2, OUT); P.set(ex + 1, ey + 2, OUT);
    } else if (eyes === "squeeze") {
      if (leftEye) { P.set(ex - 1, ey, OUT); P.set(ex, ey + 1, OUT); P.set(ex + 1, ey + 1, OUT); P.set(ex - 1, ey + 2, OUT); }
      else { P.set(ex + 2, ey, OUT); P.set(ex + 1, ey + 1, OUT); P.set(ex, ey + 1, OUT); P.set(ex + 2, ey + 2, OUT); }
    }
  }
  const faceY = sp.frogEyes ? cy - 2 : ey;
  const cheekY = faceY + 3;
  const blushOn = sp.blush || sp.variant === "good" || sp.variant === "star" || sp.stage === "baby" || o.sick || st.face === "rosy" || sp.beak;
  if (blushOn) {
    const col = o.sick ? "#9fcf6b" : "#ff8fb1";
    for (const [x, y] of [[eyesAt[0] - 2, cheekY], [eyesAt[0] - 1, cheekY], [eyesAt[1] + 2, cheekY], [eyesAt[1] + 3, cheekY]]) if (isBody(x, y)) P.set(x, y, col);
    if (st.face === "rosy") for (const [x, y] of [[eyesAt[0] - 2, cheekY + 1], [eyesAt[0] - 3, cheekY], [eyesAt[1] + 3, cheekY + 1], [eyesAt[1] + 4, cheekY]]) if (isBody(x, y)) P.set(x, y, col);
  }
  if (st.face === "freckles") for (const [x, y] of [[eyesAt[0] - 2, cheekY], [eyesAt[0], cheekY + 1], [eyesAt[1] + 1, cheekY + 1], [eyesAt[1] + 3, cheekY]]) if (isBody(x, y)) P.set(x, y, "#b07a55");
  if (st.face === "glasses" || st.face === "shades") {
    for (const ex of eyesAt) {
      if (st.face === "glasses") { for (let x = ex - 1; x <= ex + 2; x++) { P.set(x, ey - 1, OUT); P.set(x, ey + 3, OUT); } for (let y = ey - 1; y <= ey + 3; y++) { P.set(ex - 1, y, OUT); P.set(ex + 2, y, OUT); } }
      else { for (let x = ex - 1; x <= ex + 2; x++) for (let y = ey; y <= ey + 2; y++) P.set(x, y, OUT); P.set(ex, ey, "#8a86a8"); }
    }
    for (let x = eyesAt[0] + 3; x < eyesAt[1] - 1; x++) P.set(x, ey, OUT);
  }

  if (st.face === "monocle") { const ex = eyesAt[1]; for (let x = ex - 1; x <= ex + 2; x++) { P.set(x, ey - 1, "#e9a227"); P.set(x, ey + 3, "#e9a227"); } for (let y = ey; y <= ey + 2; y++) { P.set(ex - 1, y, "#e9a227"); P.set(ex + 2, y, "#e9a227"); } for (let y = ey + 4; y <= ey + 7; y++) P.set(ex + 2, y, "#e9a227"); }
  if (st.face === "mask") for (let y = ey - 1; y <= ey + 3; y++) for (let x = eyesAt[0] - 2; x <= eyesAt[1] + 3; x++) { const v = P.get(x, y); if (v && v !== OUT && v !== "#ffffff" && v !== "#ef4a63") P.set(x, y, "#ef4a63"); }
  if (o.elder) { for (const ex of eyesAt) { P.set(ex, ey - 1, "#f4f4f8"); P.set(ex + 1, ey - 1, "#f4f4f8"); P.set(ex + (ex < bx ? -1 : 2), ey - 1, "#f4f4f8"); } }

  // muzzle, nose and mouth
  const mx = bx + look;
  let my = faceY + 4;
  if (sp.muzzle) { P.ell(mx, faceY + 5, Math.max(2.4, rx * 0.3), 2.1, sp.muzzle, v => !!v && v !== OUT); for (const x of [-1, 0, 1]) P.set(mx + x, faceY + 4, "#3a2a35"); P.set(mx, faceY + 5, "#3a2a35"); my = faceY + 6; }
  else if (sp.nose === "pink") { P.set(mx, faceY + 4, "#ff7aa0"); my = faceY + 5; }
  else if (sp.nose === "nostrils") { P.set(mx - 1, faceY + 4, shade); P.set(mx + 1, faceY + 4, shade); my = faceY + 5; }
  if (sp.whiskers) for (const s of [-1, 1]) { P.set(bx + s * (rx + 1), faceY + 4, "#7b6f8f"); P.set(bx + s * (rx + 2), faceY + 3, "#7b6f8f"); P.set(bx + s * (rx + 1), faceY + 5, "#7b6f8f"); }
  const mouth = o.mouth || sp.mouth || "smile";
  if (sp.beak) {
    for (const x of [-1, 0, 1]) P.set(mx + x, faceY + 4, "#ffa33a"); P.set(mx, faceY + 5, "#ffa33a");
    if (mouth === "open" || mouth === "o") P.set(mx, faceY + 5, "#c4552a");
  } else if (sp.mouth === "wide" && !o.mouth) {
    const wy = cy + 1; for (let x = -4; x <= 4; x++) P.set(mx + x, wy, OUT); P.set(mx - 5, wy - 1, OUT); P.set(mx + 5, wy - 1, OUT);
  } else {
    if (sp.mouth === "wide") my = cy + 1;
    if (mouth === "smile") { P.set(mx - 1, my, OUT); P.set(mx + 1, my, OUT); P.set(mx, my + 1, OUT); }
    else if (mouth === "w") { P.set(mx - 2, my, OUT); P.set(mx - 1, my + 1, OUT); P.set(mx, my, OUT); P.set(mx + 1, my + 1, OUT); P.set(mx + 2, my, OUT); if (sp.teeth) P.set(mx, my + 1, "#ffffff"); }
    else if (mouth === "open") { P.set(mx - 1, my, OUT); P.set(mx, my, OUT); P.set(mx + 1, my, OUT); P.set(mx - 1, my + 1, OUT); P.set(mx, my + 1, "#ff6f8f"); P.set(mx + 1, my + 1, OUT); P.set(mx, my + 2, OUT); }
    else if (mouth === "frown") { P.set(mx - 1, my + 1, OUT); P.set(mx, my, OUT); P.set(mx + 1, my + 1, OUT); }
    else if (mouth === "flat") { P.set(mx - 1, my, OUT); P.set(mx, my, OUT); P.set(mx + 1, my, OUT); }
    else if (mouth === "o") { P.set(mx, my, OUT); P.set(mx, my + 1, OUT); }
  }

  // care variants
  if (sp.variant === "poor") {
    if (!hatOn) for (const [x, y] of [[-1, -1], [0, -2], [1, -1], [2, -2], [-2, -2]]) P.set(bx + x, top + y, shade);
    const bxp = bx - Math.round(rx * 0.5), byp = cy + Math.round(ry * 0.35);
    for (let x = 0; x < 4; x++) for (let y = 0; y < 2; y++) if (isBody(bxp + x, byp + y)) P.set(bxp + x, byp + y, (x === 1 || x === 2) && y === 0 ? "#e6b98a" : "#ffdcb0");
  }
  if (sp.variant === "star" && !hatOn) { for (const [x, y] of [[0, 1], [-1, 2], [1, 2], [0, 3]]) if (isBody(bx + x, top + y + 1)) P.set(bx + x, top + y + 1, "#ffd84d"); }

  // around the neck
  const neckY = Math.min(cy + ry - 2, my + 3);
  if (st.neck === "scarf") {
    for (let x = -rx; x <= rx; x++) for (const y of [neckY, neckY + 1]) if (isBody(bx + x, y)) P.set(bx + x, y, ((x + 40) % 4 === 0) ? "#ffd84d" : "#ef4a63");
    const tx = bx + Math.round(rx * 0.4);
    for (let y = neckY + 2; y <= neckY + 4; y++) { P.set(tx, y, "#ef4a63"); P.set(tx + 1, y, "#b8293f"); }
  } else if (st.neck === "bowtie") {
    for (const y of [-1, 0, 1]) { P.set(bx - 2, neckY + y, "#3b8fc9"); P.set(bx + 2, neckY + y, "#3b8fc9"); }
    P.set(bx - 1, neckY, "#3b8fc9"); P.set(bx + 1, neckY, "#3b8fc9"); P.set(bx, neckY, "#1f5f8f");
  } else if (st.neck === "bell") {
    for (let x = -rx; x <= rx; x++) if (isBody(bx + x, neckY)) P.set(bx + x, neckY, "#ef4a63");
    for (const [x, y] of [[-1, 1], [0, 1], [1, 1], [0, 2]]) P.set(bx + x, neckY + y, "#ffd84d");
    P.set(bx, neckY + 2, "#e9a227");
  } else if (st.neck === "lei") {
    const cols = ["#ff8fb1", "#ffd84d", "#c8adff", "#ff9b5a"]; let i = 0;
    for (let x = -rx; x <= rx; x++) { const y = neckY + Math.round((1 - (x * x) / (rx * rx)) * 1.5); if (isBody(bx + x, y)) P.set(bx + x, y, (x & 1) ? "#5fae5a" : cols[i++ % 4]); }
  } else if (st.neck === "medal") {
    for (let i = 0; i < 3; i++) { P.set(bx - 2 + i, neckY + i, "#3b8fc9"); P.set(bx + 2 - i, neckY + i, "#ef4a63"); }
    for (const [x, y] of [[-1, 3], [0, 3], [1, 3], [-1, 4], [0, 4], [1, 4], [0, 5]]) P.set(bx + x, neckY + y, "#ffd84d"); P.set(bx, neckY + 4, "#e9a227");
  } else if (st.neck === "pearls") {
    for (let x = -rx; x <= rx; x++) { const y = neckY + Math.round((1 - (x * x) / (rx * rx)) * 1.5); if (isBody(bx + x, y) && (x & 1) === 0) P.set(bx + x, y, "#ffffff"); }
  }

  // on the head
  if (st.head === "bow") P.stamp(["kk...kk", "krk.krk", "krrRrrk", "krk.krk", "kk...kk"], bx - Math.round(rx * 0.6) - 3, top - 2);
  else if (st.head === "flower") P.stamp(["..p..", ".pyp.", "pyyyp", ".pyp.", "..g.."], bx + Math.round(rx * 0.35), top - 3);
  else if (st.head === "wreath") { const cols = ["#ff8fb1", "#ffd84d", "#7ccf6c", "#c8adff"]; let i = 0; for (let x = -Math.round(rx * 0.75); x <= Math.round(rx * 0.75); x += 2) { const yy = top + 1 + (Math.abs(x) > rx * 0.5 ? 1 : 0); P.set(bx + x, yy, cols[i++ % 4]); P.set(bx + x + 1, yy, "#5fae5a"); } }
  else if (st.head === "cap" || st.head === "beanie") {
    const col = st.head === "cap" ? "#ef4a63" : "#7fa8ff", dark = st.head === "cap" ? "#b8293f" : "#ffffff";
    for (let y = top; y <= top + 3; y++) for (let x = -rx; x <= rx; x++) if (isBody(bx + x, y)) P.set(bx + x, y, y === top + 3 ? dark : col);
    if (st.head === "cap") { for (let x = 0; x <= rx + 3; x++) { if (!isBody(bx + x, top + 3)) { P.set(bx + x, top + 3, dark); P.set(bx + x, top + 4, OUT); P.set(bx + x, top + 2, OUT); } } P.set(bx + rx + 4, top + 3, OUT); P.set(bx, top - 1, col); }
    else { P.set(bx, top - 1, "#ffffff"); P.set(bx - 1, top - 1, "#ffffff"); P.set(bx + 1, top - 1, "#ffffff"); P.set(bx, top - 2, "#ffffff"); P.set(bx - 1, top - 2, OUT); P.set(bx + 1, top - 2, OUT); P.set(bx, top - 3, OUT); }
  } else if (st.head === "crown") {
    for (let x = -4; x <= 4; x++) { P.set(bx + x, top - 1, "#ffb21f"); P.set(bx + x, top, "#ffb21f"); }
    for (const x of [-4, 0, 4]) { P.set(bx + x, top - 2, "#ffb21f"); P.set(bx + x, top - 3, OUT); }
    P.set(bx - 2, top - 1, "#ef4a63"); P.set(bx + 2, top - 1, "#3b8fc9"); P.set(bx, top - 2, "#ef4a63");
  } else if (st.head === "phones") {
    for (let x = -rx + 1; x <= rx - 1; x++) P.set(bx + x, top - 1 + Math.round((x * x) / (rx * rx) * 4), OUT);
    for (const s of [-1, 1]) { const x0 = s < 0 ? bx - rx - 1 : bx + rx - 1; for (let y = cy - 3; y <= cy + 1; y++) for (let x = x0; x <= x0 + 2; x++) P.set(x, y, (y === cy - 3 || y === cy + 1 || x === x0 || x === x0 + 2) ? OUT : "#ef4a63"); }
  }
  else if (st.head === "sunhat") {
    for (let x = -rx - 3; x <= rx + 3; x++) { P.set(bx + x, top + 1, "#f2d48a"); P.set(bx + x, top + 2, OUT); }
    P.set(bx - rx - 4, top + 1, OUT); P.set(bx + rx + 4, top + 1, OUT);
    for (let y = top - 3; y <= top; y++) for (let x = -Math.round(rx * 0.6); x <= Math.round(rx * 0.6); x++) P.set(bx + x, y, y === top ? "#ff7aa0" : "#f2d48a");
    for (let x = -Math.round(rx * 0.6) - 1; x <= Math.round(rx * 0.6) + 1; x++) P.set(bx + x, top - 4, OUT);
    for (let y = top - 3; y <= top; y++) { P.set(bx - Math.round(rx * 0.6) - 1, y, OUT); P.set(bx + Math.round(rx * 0.6) + 1, y, OUT); }
  } else if (st.head === "tiara") {
    for (let x = -3; x <= 3; x++) P.set(bx + x, top, "#d6d9e8");
    for (const x of [-2, 0, 2]) P.set(bx + x, top - 1, "#d6d9e8"); P.set(bx, top - 2, "#d6d9e8"); P.set(bx, top - 1, "#ff7aa0");
  } else if (st.head === "bunnyband") {
    for (let x = -rx; x <= rx; x++) if (isBody(bx + x, top + 1)) P.set(bx + x, top + 1, "#ff7aa0");
    for (const s of [-1, 1]) for (let y = 1; y <= 7; y++) { const x = bx + s * 3 + (y > 5 ? s : 0); P.set(x - 1, top - y, OUT); P.set(x + 1, top - y, OUT); P.set(x, top - y, y < 6 ? "#ffd1e0" : "#ffffff"); }
    for (const s of [-1, 1]) P.set(bx + s * 3, top - 8, OUT);
  } else if (st.head === "witch") {
    for (let x = -rx - 2; x <= rx + 2; x++) { P.set(bx + x, top, "#4a2f7a"); P.set(bx + x, top + 1, OUT); }
    for (let i = 1; i <= 8; i++) { const w = Math.max(0, Math.round((rx * 0.75) * (1 - i / 9))); const off = i > 6 ? i - 6 : 0; for (let x = -w; x <= w; x++) P.set(bx + x + off, top - i, i === 2 ? "#ffd84d" : "#6b45b0"); P.set(bx - w - 1 + off, top - i, OUT); P.set(bx + w + 1 + off, top - i, OUT); }
    P.set(bx + 3, top - 9, OUT);
  } else if (st.head === "santa") {
    for (let y = top; y <= top + 2; y++) for (let x = -rx; x <= rx; x++) if (isBody(bx + x, y)) P.set(bx + x, y, y === top + 2 ? "#ffffff" : "#ef4a63");
    for (let i = 1; i <= 5; i++) { const w = Math.max(0, Math.round(rx * 0.6 * (1 - i / 6))); for (let x = -w; x <= w; x++) P.set(bx + x + i, top - i, "#ef4a63"); P.set(bx - w - 1 + i, top - i, OUT); P.set(bx + w + 1 + i, top - i, OUT); }
    for (const [x, y] of [[6, -6], [7, -6], [6, -7], [7, -7]]) P.set(bx + x, top + y, "#ffffff");
  } else if (st.head === "halo") {
    for (let x = -4; x <= 4; x++) if (Math.abs(x) > 1 || true) { P.set(bx + x, top - 5 + (Math.abs(x) === 4 ? 1 : 0), "#ffe066"); }
    for (let x = -2; x <= 2; x++) P.set(bx + x, top - 4, "#fff6c0");
  }
  if (st.head === "party" || o.hat) {
    const cols = ["#ff7aa0", "#ffd84d"];
    for (let i = 0; i < 6; i++) { const w = 5 - i; for (let x = -Math.floor(w / 2); x <= Math.floor(w / 2); x++) P.set(bx + x + 1, top - 1 - i, i === 0 ? OUT : cols[i % 2]); }
    P.set(bx + 1, top - 7, "#ffffff"); P.set(bx, top - 7, "#ffffff"); P.set(bx + 1, top - 8, "#ffffff");
  }
  if (o.sick) { const dx = bx + rx - 1, dy = top + 3; P.set(dx, dy, "#5aaee8"); P.set(dx, dy + 1, "#5aaee8"); P.set(dx - 1, dy + 1, "#8fdcf4"); }

  if (o.elder) { const x0 = bx - rx - 3; for (let y = cy - 2; y <= OY; y++) P.set(x0, y, "#8b5a3c"); P.set(x0 + 1, cy - 3, "#8b5a3c"); P.set(x0 + 2, cy - 2, "#8b5a3c"); }
  P.blit(ctx, Math.round(cx), Math.round(by), OX, OY, o);
  return { headY: Math.round(by) - (OY - top) - (sp.ears === "bunny" && !hatOn ? Math.round(10 * es) : sp.ears === "fox" || sp.ears === "cat" ? Math.round(5 * es) : 0), rx, ry, eyeY: Math.round(by) - (OY - ey) };
}

export function drawEgg(ctx, cx, by, o = {}) {
  const N = 32, OX = 16, OY = 30;
  const P = PixGrid(N);
  const ry = 10, rxBase = 7.6, cy = OY - ry;
  const fam = FAMILIES[o.family];
  const base = fam ? fam.egg[0] : "#fff6e8";
  const shadeC = mix(base, "#b9a58c", 0.35);
  for (let y = -ry; y <= ry; y++) {
    const t = y / ry;
    const w = rxBase * Math.sqrt(Math.max(0, 1 - t * t)) * (1 + 0.14 * t);
    const skew = Math.round((o.tilt || 0) * (-y) / ry);
    for (let x = -Math.ceil(w); x <= Math.ceil(w); x++) {
      if (Math.abs(x) > w) continue;
      let c = base;
      const nx = x / rxBase;
      if (nx * 0.45 + t * 0.9 > 0.62) c = shadeC;
      else if ((nx + 0.4) ** 2 + (t + 0.45) ** 2 < 0.04) c = "#ffffff";
      P.set(OX + x + skew, cy + y, c);
    }
  }
  const spots = fam ? [fam.egg[1]] : ["#ff8fb1", "#ffd84d", "#8fdcf4", "#7ccf6c", "#c8adff"];
  [[-3, -4, 1.6], [3, -1, 2.2], [-2, 4, 1.8], [4, 6, 1.2], [0, -8, 1.1]].forEach(([x, y, r], i) => {
    const skew = Math.round((o.tilt || 0) * (-y) / ry);
    P.ell(OX + x + skew, cy + y, r, r, spots[i % spots.length], v => !!v);
  });
  if (!fam && o.mystery !== false) { P.set(OX - 1, cy - 1, OUT); P.set(OX, cy - 2, OUT); P.set(OX + 1, cy - 1, OUT); P.set(OX + 1, cy, OUT); P.set(OX, cy + 1, OUT); P.set(OX, cy + 3, OUT); }
  P.outline(OUT);
  if (o.crack) for (let x = -7; x <= 7; x++) { const yy = cy + 1 + (Math.abs(x) % 2 ? -1 : 0) + (x > 2 ? 1 : 0); if (P.get(OX + x, yy)) P.set(OX + x, yy, OUT); }
  P.blit(ctx, Math.round(cx), Math.round(by), OX, OY, o);
}

/* ===================== room ===================== */
export const WALLS = {
  dots:    { name: "Polka dots",   base: "#fff0f4", ink: "#ffd3e1" },
  stripes: { name: "Mint stripes", base: "#ecfbf3", ink: "#cdefdc" },
  hearts:  { name: "Hearts",       base: "#f5edff", ink: "#e2cffc" },
  clouds:  { name: "Clouds",       base: "#dcefff", ink: "#ffffff" },
  gingham: { name: "Gingham",      base: "#ffffff", ink: "#ffdde4" },
  brick:   { name: "Brick",        base: "#f4cbb4", ink: "#e2a98c" },
  leaves:  { name: "Leaves",       base: "#f2f8e4", ink: "#a9d77f" },
  stars:   { name: "Starry",       base: "#2d3274", ink: "#fff3b0" },
  peach:   { name: "Plain peach",  base: "#ffe7d8", ink: "#ffe7d8" },
  rainbow: { name: "Rainbow",      base: "#fff3f8", ink: "#ffd6e0" },
  ocean:   { name: "Ocean",        base: "#cfeeff", ink: "#9fd6f5" },
  candy:   { name: "Candy stripes", base: "#ffffff", ink: "#ffc7d9" },
};
export const FLOORS = {
  wood:    { name: "Light wood",   base: "#f6dcc0", ink: "#e6c8a4" },
  dark:    { name: "Dark wood",    base: "#b98a62", ink: "#a07350" },
  tiles:   { name: "Pink tiles",   base: "#ffdbe5", ink: "#f2b5c8" },
  checker: { name: "Checkerboard", base: "#f4f0ff", ink: "#cfc5ea" },
  grass:   { name: "Grass",        base: "#aadd80", ink: "#86c45c" },
  carpet:  { name: "Blue carpet",  base: "#bcc9f4", ink: "#a5b5ec" },
  marble:  { name: "Marble",       base: "#f3f3f7", ink: "#d8d8e4" },
  cloud:   { name: "Cloud floor",  base: "#e6f2ff", ink: "#ffffff" },
  sakura:  { name: "Petal wood",   base: "#f6dcc0", ink: "#e6c8a4" },
};
export const WINDOWS = { square: "Square", round: "Round", arch: "Arched", twin: "Two panes", none: "No window" };
export const CURTAINS = { pink: { name: "Pink", c: "#ffb3c9" }, blue: { name: "Blue", c: "#9fc8f5" }, mint: { name: "Mint", c: "#9fe3c0" }, yellow: { name: "Yellow", c: "#ffe07a" }, lace: { name: "Lace", c: "#ffffff" }, none: { name: "None" } };
export const ARTS = { heart: "Heart frame", photo: "Photo of us", clock: "Clock", shelf: "Shelf", rainbow: "Rainbow", mirror: "Mirror", love: "LOVE banner", moon: "Moon painting", poster: "Star poster", none: "Nothing" };
export const CEILINGS = { none: "Nothing", lights: "Fairy lights", bunting: "Bunting", garland: "Heart garland", lanterns: "Lanterns", clouds: "Fluffy clouds", disco: "Disco ball" };
export const ITEMS = { plant: "Plant", cactus: "Cactus", lamp: "Lamp", books: "Bookshelf", fish: "Fishbowl", teddy: "Teddy", bed: "Bed", gift: "Gift", speaker: "Speaker", piano: "Piano", tv: "TV", castle: "Toy castle", tree: "Pine tree", none: "Nothing" };
export const RUGS = { none: "None", round: "Round pink", oval: "Oval blue", stripes: "Striped", heart: "Heart", star: "Star", rainbow: "Rainbow" };
export const DEFAULT_DECOR = { wall: "dots", floor: "wood", window: "square", curtain: "pink", art: "heart", ceiling: "none", left: "plant", right: "none", rug: "none" };

export const STAR_PTS = [[4, 4], [13, 12], [22, 3], [33, 9], [41, 2], [50, 14], [59, 5], [68, 11], [76, 3], [8, 24], [27, 28], [46, 22], [63, 30], [74, 20], [36, 34], [15, 35]];
export function skyAt(d) {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 8 && h < 17) return { top: "#8fd3ff", bot: "#c9ecff" };
  if (h >= 6 && h < 8) return { top: "#ffb8a0", bot: "#ffe3c4", low: true };
  if (h >= 17 && h < 19.5) return { top: "#b48ae0", bot: "#ffa982", low: true };
  return { top: "#1f2860", bot: "#33407e", night: true };
}
function drawWall(ctx, key, now) {
  const w = WALLS[key] || WALLS.dots;
  R(ctx, 0, 0, LW, 40, w.base); ctx.fillStyle = w.ink;
  if (key === "dots") { for (let y = 3, r = 0; y < 38; y += 6, r++) for (let x = r % 2 ? 3 : 0; x < LW; x += 6) ctx.fillRect(x, y, 1, 1); }
  else if (key === "stripes") { for (let x = 2; x < LW; x += 8) ctx.fillRect(x, 0, 3, 40); }
  else if (key === "hearts") { for (let y = 4, r = 0; y < 36; y += 9, r++) for (let x = r % 2 ? 6 : 1; x < LW; x += 10) { ctx.fillRect(x, y, 1, 1); ctx.fillRect(x + 2, y, 1, 1); ctx.fillRect(x, y + 1, 3, 1); ctx.fillRect(x + 1, y + 2, 1, 1); } }
  else if (key === "clouds") { for (const [x, y] of [[4, 6], [30, 3], [52, 10], [66, 4], [18, 22], [44, 26], [70, 24], [2, 32]]) { ctx.fillRect(x + 1, y, 4, 1); ctx.fillRect(x, y + 1, 7, 2); } }
  else if (key === "gingham") { ctx.globalAlpha = .6; for (let x = 0; x < LW; x += 8) ctx.fillRect(x, 0, 4, 40); for (let y = 0; y < 40; y += 8) ctx.fillRect(0, y, LW, 4); ctx.globalAlpha = 1; }
  else if (key === "brick") { for (let y = 0, r = 0; y < 40; y += 5, r++) { ctx.fillRect(0, y, LW, 1); for (let x = r % 2 ? 0 : 5; x < LW; x += 10) ctx.fillRect(x, y, 1, 5); } }
  else if (key === "leaves") { for (let y = 4, r = 0; y < 36; y += 8, r++) for (let x = r % 2 ? 5 : 0; x < LW; x += 10) { ctx.fillRect(x, y + 1, 1, 1); ctx.fillRect(x + 1, y, 1, 2); ctx.fillRect(x + 2, y, 1, 1); } }
  else if (key === "stars") { for (const [x, y] of STAR_PTS) { ctx.globalAlpha = ((Math.floor(now / 700) + x) % 5 === 0) ? .3 : 1; ctx.fillRect(x, y, 1, 1); } ctx.globalAlpha = 1; }
  else if (key === "rainbow") { const cols = ["#ffd6e0", "#ffe8c7", "#fff6c2", "#dcf7d2", "#d6ecff", "#e8dcff"]; for (let y = 0; y < 40; y++) R(ctx, 0, y, LW, 1, cols[Math.floor(y / 7) % 6]); }
  else if (key === "ocean") { for (let y = 5; y < 38; y += 7) for (let x = 0; x < LW; x++) ctx.fillRect(x, y + Math.round(Math.sin((x + y + now / 300) / 4)), 1, 1); for (const [x, y] of [[12, 30], [40, 18], [66, 26]]) { R(ctx, x, y, 3, 2, "#ff9b5a"); R(ctx, x + 3, y, 1, 2, "#ef7d3a"); } }
  else if (key === "candy") { for (let y = 0; y < 40; y++) for (let x = 0; x < LW; x++) if (((x + y) >> 2) % 2 === 0) ctx.fillRect(x, y, 1, 1); }
}
function drawFloor(ctx, key) {
  const f = FLOORS[key] || FLOORS.wood;
  R(ctx, 0, 40, LW, 2, "#d9ab88"); R(ctx, 0, 40, LW, 1, "#e9c3a2");
  R(ctx, 0, 42, LW, 14, f.base); ctx.fillStyle = f.ink;
  if (key === "wood" || key === "dark") { for (let y = 45, r = 0; y < LH; y += 4, r++) { ctx.fillRect(0, y, LW, 1); for (let x = r % 2 ? 9 : 2; x < LW; x += 18) ctx.fillRect(x, y - 3, 1, 3); } }
  else if (key === "tiles") { for (let y = 46; y < LH; y += 5) ctx.fillRect(0, y, LW, 1); for (let x = 4; x < LW; x += 8) ctx.fillRect(x, 42, 1, 14); }
  else if (key === "checker") { for (let y = 42, r = 0; y < LH; y += 4, r++) for (let x = r % 2 ? 4 : 0; x < LW; x += 8) ctx.fillRect(x, y, 4, 4); }
  else if (key === "grass") { for (const [x, y] of [[3, 44], [11, 49], [19, 45], [27, 52], [35, 46], [44, 50], [52, 44], [60, 49], [68, 45], [75, 52], [7, 53], [57, 54]]) { ctx.fillRect(x, y, 1, 2); ctx.fillRect(x + 1, y - 1, 1, 2); } R(ctx, 15, 47, 1, 1, "#ffffff"); R(ctx, 63, 52, 1, 1, "#ffd84d"); R(ctx, 40, 54, 1, 1, "#ff9fbb"); }
  else if (key === "carpet") { for (let i = 0; i < 70; i++) ctx.fillRect((i * 37) % LW, 42 + (i * 13) % 14, 1, 1); }
  else if (key === "marble") { for (let i = 0; i < 4; i++) for (let s = 0; s < 14; s++) ctx.fillRect((i * 23 + s * 2 + (s % 3)) % LW, 42 + s, 1, 1); }
  else if (key === "cloud") { for (const [x, y] of [[6, 46], [26, 50], [48, 45], [66, 51], [14, 54], [58, 55]]) { ctx.fillRect(x, y, 6, 2); ctx.fillRect(x + 1, y - 1, 3, 1); } }
  else if (key === "sakura") { for (let y = 45, r = 0; y < LH; y += 4, r++) { ctx.fillRect(0, y, LW, 1); for (let x = r % 2 ? 9 : 2; x < LW; x += 18) ctx.fillRect(x, y - 3, 1, 3); } for (const [x, y] of [[5, 44], [19, 49], [33, 46], [47, 53], [61, 47], [74, 51], [27, 54], [69, 43]]) { R(ctx, x, y, 2, 1, "#ffb3c9"); R(ctx, x, y + 1, 1, 1, "#ff8fb1"); } }
}
function windowShape(key) {
  if (key === "round") return { w: 19, h: 18, inside: (x, y) => (x - 9) ** 2 + (y - 9) ** 2 <= 72 };
  if (key === "arch") return { w: 19, h: 18, inside: (x, y) => (y >= 8 && x >= 0 && x < 19) || ((x - 9) ** 2 + (y - 8) ** 2 <= 81) };
  if (key === "twin") return { w: 21, h: 16, inside: (x, y) => (x < 9 || x > 11) && y >= 0 && y < 16 };
  return { w: 21, h: 16, inside: () => true };
}
function drawWindow(ctx, key, curtain, now, fx) {
  if (key === "none") return;
  const sh = windowShape(key), wx = 7, wy = 5;
  const sky = Object.assign({}, skyAt(new Date()));
  const wk = fx && fx.weather;
  if (wk === "cloudy" || wk === "rain" || wk === "storm" || wk === "fog") { sky.top = mix(sky.top, "#8f98ab", 0.45); sky.bot = mix(sky.bot, "#aab2c2", 0.45); }
  const ins = (x, y) => x >= 0 && y >= 0 && x < sh.w && y < sh.h && sh.inside(x, y);
  const cur = CURTAINS[curtain];
  if (cur && cur.c) { R(ctx, wx - 4, wy - 1, 3, sh.h + 4, cur.c); R(ctx, wx + sh.w + 1, wy - 1, 3, sh.h + 4, cur.c); if (curtain === "lace") { ctx.fillStyle = "#e9e4f2"; for (let y = wy; y < wy + sh.h + 3; y += 2) { ctx.fillRect(wx - 3, y, 1, 1); ctx.fillRect(wx + sh.w + 2, y, 1, 1); } } }
  for (let y = -1; y <= sh.h; y++) for (let x = -1; x <= sh.w; x++) {
    if (ins(x, y)) R(ctx, wx + x, wy + y, 1, 1, y < sh.h / 2 ? sky.top : sky.bot);
    else if (ins(x - 1, y) || ins(x + 1, y) || ins(x, y - 1) || ins(x, y + 1)) R(ctx, wx + x, wy + y, 1, 1, OUT);
  }
  const put = (x, y, c) => { if (ins(x, y)) R(ctx, wx + x, wy + y, 1, 1, c); };
  if (sky.night) { for (const [x, y] of [[2, 3], [6, 1], [14, 5], [4, 10], [16, 11], [12, 8]]) put(x, y, "#fff6c0"); for (const [x, y] of [[12, 2], [13, 2], [14, 2], [12, 3], [12, 4], [13, 4], [14, 4]]) put(x, y, "#fff3b0"); }
  else {
    const sy = sky.low ? 10 : 3;
    for (let x = 12; x <= 14; x++) for (let y = sy; y <= sy + 2; y++) put(x, y, "#ffd84d");
    const cxo = Math.floor(Date.now() / 4000) % (sh.w + 8) - 6;
    for (const [x, y, w] of [[0, 11, 5], [1, 10, 3]]) for (let i = 0; i < w; i++) put(cxo + x + i, y, "#ffffff");
  }
  if (wk === "cloudy" || wk === "rain" || wk === "storm" || wk === "snow") { const cx0 = Math.floor(now / 5000) % (sh.w + 10) - 8; for (const [x, y, w] of [[0, 2, 6], [1, 1, 4], [9, 4, 5]]) for (let i = 0; i < w; i++) put(cx0 + x + i, y, wk === "snow" ? "#eef2f8" : "#c9cfdb"); }
  if (wk === "rain" || wk === "storm") for (let i = 0; i < 14; i++) { const x = (i * 5 + Math.floor(now / 90)) % sh.w, y = (i * 7 + Math.floor(now / 40)) % sh.h; put(x, y, "#9cc7f0"); put(x, y + 1, "#9cc7f0"); }
  if (wk === "storm" && now % 5000 < 140) for (let y = 0; y < sh.h; y++) for (let x = 0; x < sh.w; x++) put(x, y, "#f4f6ff");
  if (wk === "snow" || (fx && fx.holiday === "christmas")) for (let i = 0; i < 12; i++) { const x = (i * 7 + Math.round(Math.sin((now / 900) + i) * 2)) % sh.w, y = (i * 5 + Math.floor(now / 160)) % sh.h; put((x + sh.w) % sh.w, y, "#ffffff"); }
  if (wk === "fog") for (let y = 0; y < sh.h; y += 2) for (let x = (y / 2) % 2; x < sh.w; x += 2) put(x, y, "#dfe3ea");
  if (fx && fx.holiday === "halloween") for (let i = 0; i < 2; i++) { const bx2 = Math.floor((now / 120 + i * 9) % (sh.w + 6)) - 3, by2 = 3 + i * 5 + Math.round(Math.sin(now / 200 + i) * 1.5), f = Math.floor(now / 150) % 2; put(bx2, by2, OUT); put(bx2 - 1, by2 - f, OUT); put(bx2 + 1, by2 - f, OUT); }
  if (fx && fx.holiday === "newyear") { const cols = ["#ff7aa0", "#ffd84d", "#8fdcf4", "#7ccf6c"]; for (let i = 0; i < 2; i++) { const ph = (now / 900 + i * 0.5) % 1, cx1 = 5 + i * 9, cy1 = 4 + i * 2, r = Math.round(ph * 4); if (ph < 0.8) for (let a = 0; a < 8; a++) put(cx1 + Math.round(Math.cos(a * Math.PI / 4) * r), cy1 + Math.round(Math.sin(a * Math.PI / 4) * r), cols[(i + a) % 4]); } }
  const mid = Math.floor(sh.w / 2);
  if (key !== "twin") for (let y = 0; y < sh.h; y++) put(mid, y, "#ffffff");
  for (let x = 0; x < sh.w; x++) put(x, Math.floor(sh.h * 0.45), "#ffffff");
  if (cur && cur.c) { R(ctx, wx - 4, wy - 2, sh.w + 8, 2, cur.c); for (let x = wx - 4; x < wx + sh.w + 4; x += 3) R(ctx, x + 1, wy, 1, 1, cur.c); }
}
function drawArt(ctx, key) {
  const x = 58, y = 8;
  if (key === "heart") { R(ctx, x, y, 13, 11, "#c08a5c"); R(ctx, x + 1, y + 1, 11, 9, "#fff7e8"); art(ctx, ART.heart, x + 4, y + 3); }
  else if (key === "photo") {
    R(ctx, x - 1, y - 1, 16, 13, "#9b6440"); R(ctx, x, y, 14, 11, "#bfe6ff"); R(ctx, x, y + 8, 14, 3, "#a9dd7f");
    for (const [px, c] of [[3, "#ff9fbb"], [9, "#8fb8ff"]]) { R(ctx, x + px, y + 3, 3, 3, "#ffe0c8"); R(ctx, x + px, y + 6, 3, 3, c); R(ctx, x + px, y + 9, 1, 1, OUT); R(ctx, x + px + 2, y + 9, 1, 1, OUT); }
    R(ctx, x + 6, y + 1, 1, 1, "#ef4a63"); R(ctx, x + 8, y + 1, 1, 1, "#ef4a63"); R(ctx, x + 6, y + 2, 3, 1, "#ef4a63"); R(ctx, x + 7, y + 3, 1, 1, "#ef4a63");
  } else if (key === "clock") {
    const ccx = x + 6, ccy = y + 6, r = 6;
    for (let yy = -r - 1; yy <= r + 1; yy++) for (let xx = -r - 1; xx <= r + 1; xx++) { const d = xx * xx + yy * yy; if (d <= r * r) R(ctx, ccx + xx, ccy + yy, 1, 1, "#ffffff"); else if (d <= (r + 1.2) ** 2) R(ctx, ccx + xx, ccy + yy, 1, 1, "#ef4a63"); }
    for (let i = 0; i < 12; i += 3) { const a = i / 12 * Math.PI * 2; R(ctx, ccx + Math.round(Math.sin(a) * 5), ccy - Math.round(Math.cos(a) * 5), 1, 1, "#b5aec8"); }
    const d = new Date(), ha = ((d.getHours() % 12) + d.getMinutes() / 60) / 12 * Math.PI * 2, ma = d.getMinutes() / 60 * Math.PI * 2;
    for (let i = 1; i <= 3; i++) R(ctx, ccx + Math.round(Math.sin(ha) * i), ccy - Math.round(Math.cos(ha) * i), 1, 1, OUT);
    for (let i = 1; i <= 5; i++) R(ctx, ccx + Math.round(Math.sin(ma) * i), ccy - Math.round(Math.cos(ma) * i), 1, 1, OUT);
    R(ctx, ccx, ccy, 1, 1, "#ef4a63");
  } else if (key === "shelf") {
    R(ctx, x - 2, y + 12, 18, 2, "#a36d45"); R(ctx, x, y + 14, 1, 2, "#7a4e2f"); R(ctx, x + 13, y + 14, 1, 2, "#7a4e2f");
    for (const [bx2, h, c] of [[0, 7, "#ef4a63"], [2, 8, "#3b8fc9"], [4, 6, "#ffd84d"], [6, 8, "#7ccf6c"]]) R(ctx, x + bx2, y + 12 - h, 2, h, c);
    art(ctx, ART.plant.slice(0, 5).map(r => r.slice(0, 7)), x + 9, y + 2); R(ctx, x + 10, y + 7, 4, 5, "#ff9b5a");
  } else if (key === "rainbow") {
    const cols = ["#ef4a63", "#ff9b5a", "#ffd84d", "#7ccf6c", "#3b8fc9", "#9474e0"];
    for (let yy = 0; yy <= 8; yy++) for (let xx = -9; xx <= 9; xx++) { const d = Math.sqrt(xx * xx + (yy - 8) ** 2); const i = Math.floor(9 - d); if (d <= 9 && i >= 0 && i < 6) R(ctx, x + 6 + xx, y + 2 + yy, 1, 1, cols[i]); }
    R(ctx, x - 4, y + 9, 5, 2, "#ffffff"); R(ctx, x + 12, y + 9, 5, 2, "#ffffff");
  } else if (key === "mirror") {
    for (let yy = -8; yy <= 8; yy++) for (let xx = -6; xx <= 6; xx++) { const d = (xx * xx) / 36 + (yy * yy) / 64; if (d <= 1) R(ctx, x + 6 + xx, y + 7 + yy, 1, 1, d > 0.72 ? "#d8b26a" : "#dff3ff"); }
    R(ctx, x + 3, y + 3, 1, 3, "#ffffff"); R(ctx, x + 4, y + 2, 1, 2, "#ffffff");
  } else if (key === "love") {
    R(ctx, x - 3, y + 2, 19, 9, "#ff9fbb"); R(ctx, x - 3, y + 11, 3, 2, "#ff9fbb"); R(ctx, x + 13, y + 11, 3, 2, "#ff9fbb");
    text(ctx, "LOVE", x - 1, y + 4, "#ffffff");
  } else if (key === "moon") {
    R(ctx, x - 1, y - 1, 16, 14, "#c08a5c"); R(ctx, x, y, 14, 12, "#28306a");
    for (let yy = -4; yy <= 4; yy++) for (let xx = -4; xx <= 4; xx++) if (xx * xx + yy * yy <= 16 && (xx - 2) * (xx - 2) + (yy + 1) * (yy + 1) > 9) R(ctx, x + 7 + xx, y + 6 + yy, 1, 1, "#fff3b0");
    for (const [sx, sy] of [[2, 2], [11, 3], [3, 9], [12, 9]]) R(ctx, x + sx, y + sy, 1, 1, "#ffffff");
  } else if (key === "poster") {
    R(ctx, x - 1, y - 1, 15, 15, "#ff9fbb"); R(ctx, x, y, 13, 13, "#ffe3ec"); art(ctx, ART.star, x + 4, y + 3); text(ctx, "WOW", x + 1, y + 8, "#ef4a63");
    R(ctx, x + 5, y - 2, 3, 2, "#ffffffaa");
  }
}
function drawCeiling(ctx, key, now, glow) {
  if (key === "none") return;
  const sag = x => 2 + Math.round(Math.sin((x / LW) * Math.PI) * 3);
  if (key === "lights" || key === "bunting" || key === "garland") for (let x = 0; x < LW; x++) R(ctx, x, sag(x), 1, 1, glow ? "#6b6a8a" : "#8b7a6e");
  if (key === "lights") {
    const cols = ["#ff7aa0", "#ffd84d", "#8fdcf4", "#7ccf6c"];
    for (let x = 3, i = 0; x < LW; x += 7, i++) { const on = (Math.floor(now / 600) + i) % 3 !== 0; const c = on ? cols[i % 4] : "#c9c3d6"; R(ctx, x, sag(x) + 1, 1, 2, c); if (glow && on) { ctx.globalAlpha = .25; R(ctx, x - 1, sag(x), 3, 4, c); ctx.globalAlpha = 1; } }
  } else if (key === "bunting") {
    const cols = ["#ef4a63", "#ffd84d", "#3b8fc9", "#7ccf6c", "#ff9fbb"];
    for (let x = 2, i = 0; x < LW - 3; x += 6, i++) { const y = sag(x) + 1; R(ctx, x, y, 5, 1, cols[i % 5]); R(ctx, x + 1, y + 1, 3, 1, cols[i % 5]); R(ctx, x + 2, y + 2, 1, 1, cols[i % 5]); }
  } else if (key === "garland") {
    for (let x = 4; x < LW - 3; x += 8) art(ctx, ART.heart, x - 2, sag(x) + 1);
  } else if (key === "clouds") {
    [[14, 5], [40, 3], [64, 6]].forEach(([x, y], i) => { const yy = y + Math.round(Math.sin(now / 900 + i)); R(ctx, x, 0, 1, yy, "#c9c3d6"); R(ctx, x - 4, yy, 9, 3, "#ffffff"); R(ctx, x - 2, yy - 1, 5, 1, "#ffffff"); R(ctx, x - 4, yy + 3, 9, 1, "#dfe6f2"); });
  } else if (key === "disco") {
    R(ctx, 40, 0, 1, 3, "#8b7a6e");
    for (let yy = -3; yy <= 3; yy++) for (let xx = -3; xx <= 3; xx++) if (xx * xx + yy * yy <= 10) R(ctx, 40 + xx, 6 + yy, 1, 1, ((xx + yy + Math.floor(now / 200)) & 1) ? "#e4e8f2" : "#9aa3b5");
    const cols = ["#ff7aa0", "#8fdcf4", "#ffd84d", "#c8adff"];
    for (let i = 0; i < 10; i++) { const a = now / 1500 + i * 0.63, r = 10 + (i % 4) * 7; const px = 40 + Math.round(Math.cos(a) * r * 1.6), py = 14 + Math.round(Math.sin(a) * r * 0.5); if (py < 40 && px >= 0 && px < LW) { ctx.globalAlpha = glow ? 0.9 : 0.6; R(ctx, px, py, 1, 1, cols[i % 4]); ctx.globalAlpha = 1; } }
  } else if (key === "lanterns") {
    const cols = ["#ff9fbb", "#ffd84d", "#c8adff"];
    [34, 48, 72].forEach((x, i) => { const y = 3 + (i % 2) * 2; R(ctx, x, 0, 1, y, "#8b7a6e"); R(ctx, x - 2, y, 5, 6, cols[i]); R(ctx, x - 3, y + 1, 7, 4, cols[i]); R(ctx, x - 2, y + 2, 5, 1, "rgba(255,255,255,.5)"); R(ctx, x - 1, y + 6, 3, 1, "#8b7a6e"); if (glow) { ctx.globalAlpha = .3; R(ctx, x - 4, y - 1, 9, 9, cols[i]); ctx.globalAlpha = 1; } });
  }
}
const ITEM_W = { plant: 8, cactus: 7, lamp: 7, books: 12, fish: 11, teddy: 9, bed: 22, gift: 8, speaker: 7, piano: 15, tv: 12, castle: 11, tree: 11, none: 0 };
function drawItem(ctx, key, side, now, glow) {
  const w = ITEM_W[key] || 0; if (!w) return;
  const x = side === "left" ? 1 : LW - w - 1;
  if (key === "plant") art(ctx, ART.plant, x, 43);
  else if (key === "cactus") art(ctx, ART.cactus, x, 41);
  else if (key === "teddy") art(ctx, ART.teddy, x, 43);
  else if (key === "gift") art(ctx, ART.gift, x, 44);
  else if (key === "lamp") {
    R(ctx, x + 1, 50, 5, 2, "#8b7a6e"); R(ctx, x + 3, 36, 1, 14, "#8b7a6e");
    R(ctx, x + 2, 30, 3, 1, OUT); R(ctx, x + 1, 31, 5, 2, "#ffd36e"); R(ctx, x, 33, 7, 3, "#ffd36e"); R(ctx, x, 36, 7, 1, "#e9a227");
    if (glow) { ctx.globalAlpha = .22; ctx.fillStyle = "#ffe9a8"; for (let r = 10; r > 2; r -= 3) { ctx.beginPath(); ctx.arc(x + 3.5, 37, r, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1; R(ctx, x, 33, 7, 3, "#ffe9a8"); }
  } else if (key === "books") {
    R(ctx, x, 28, 12, 24, "#a36d45"); R(ctx, x + 1, 29, 10, 22, "#7a4e2f");
    const cols = ["#ef4a63", "#3b8fc9", "#ffd84d", "#7ccf6c", "#ff9fbb", "#c8adff"];
    [34, 41, 48].forEach((sy, s) => { R(ctx, x + 1, sy, 10, 1, "#a36d45"); for (let i = 0; i < 4; i++) R(ctx, x + 1 + i * 2 + (i > 1 ? 1 : 0), sy - 4 - ((i + s) % 2), 2, 4 + ((i + s) % 2), cols[(i + s * 2) % 6]); });
  } else if (key === "fish") {
    R(ctx, x + 2, 50, 7, 2, "#a36d45");
    for (let yy = -5; yy <= 5; yy++) for (let xx = -5; xx <= 5; xx++) { const d = xx * xx + yy * yy; if (d <= 25) { const water = yy >= -2; R(ctx, x + 5 + xx, 44 + yy, 1, 1, d > 18 ? "#9fb7c9" : water ? (glow ? "#7fd2ff" : "#8fd3f4") : "#eaf7ff"); } }
    const fx = x + 4 + Math.round(Math.sin(now / 600) * 2); R(ctx, fx, 45, 2, 1, "#ff9b5a"); R(ctx, fx + (Math.sin(now / 600) > 0 ? -1 : 2), 45, 1, 1, "#ef4a63");
    if (Math.floor(now / 900) % 3 === 0) R(ctx, fx + 1, 42, 1, 1, "#ffffff");
  } else if (key === "bed") {
    R(ctx, x, 38, 2, 14, "#c08a5c"); R(ctx, x + 20, 43, 2, 9, "#c08a5c");
    R(ctx, x + 2, 44, 18, 6, "#ffffff"); R(ctx, x + 2, 50, 18, 1, "#c08a5c");
    R(ctx, x + 2, 42, 6, 3, "#ffffff"); R(ctx, x + 2, 42, 6, 1, "#e4dfee");
    R(ctx, x + 7, 44, 13, 5, "#ff9fbb"); for (let i = 0; i < 3; i++) art(ctx, [".r.r", "rrrr", ".rr."], x + 9 + i * 4, 45, { tint: "#ef7f9e" });
  } else if (key === "piano") {
    R(ctx, x, 36, 15, 10, "#3a3550"); R(ctx, x + 1, 37, 13, 2, "#4f4870"); R(ctx, x + 1, 42, 13, 3, "#ffffff");
    for (let i = 0; i < 6; i++) R(ctx, x + 2 + i * 2, 42, 1, 2, OUT);
    R(ctx, x + 1, 46, 2, 6, "#3a3550"); R(ctx, x + 12, 46, 2, 6, "#3a3550");
  } else if (key === "tv") {
    R(ctx, x, 38, 12, 9, OUT); const t = Math.floor(now / 700) % 3; R(ctx, x + 1, 39, 10, 7, ["#8fd3ff", "#ffb3c9", "#b8e6a0"][t]);
    R(ctx, x + 2 + t * 2, 41, 3, 3, "#ffffff"); R(ctx, x + 2, 47, 8, 1, OUT); R(ctx, x + 3, 48, 6, 4, "#a36d45"); R(ctx, x + 3, 37, 1, 1, OUT); R(ctx, x + 8, 37, 1, 1, OUT); R(ctx, x + 4, 36, 1, 1, OUT); R(ctx, x + 7, 36, 1, 1, OUT);
  } else if (key === "castle") {
    R(ctx, x + 1, 42, 9, 10, "#c8adff"); R(ctx, x, 39, 3, 13, "#b394f2"); R(ctx, x + 8, 39, 3, 13, "#b394f2");
    for (const tx of [0, 2, 8, 10]) R(ctx, x + tx, 38, 1, 1, "#b394f2");
    R(ctx, x + 4, 47, 3, 5, "#7a5cc4"); R(ctx, x + 1, 36, 1, 3, OUT); R(ctx, x + 2, 36, 2, 1, "#ef4a63");
  } else if (key === "tree") {
    for (let i = 0; i < 12; i++) { const w = Math.floor(i / 2) + 1; R(ctx, x + 5 - w, 36 + i, w * 2 + 1, 1, i % 4 === 3 ? "#3f8f45" : "#4fa85a"); }
    R(ctx, x + 4, 48, 3, 4, "#8b5a3c"); art(ctx, ART.star, x + 3, 32);
    const cols = ["#ef4a63", "#ffd84d", "#8fdcf4"]; for (let i = 0; i < 6; i++) R(ctx, x + 3 + (i * 3) % 6, 39 + i * 1.6, 1, 1, cols[(i + Math.floor(now / 500)) % 3]);
  } else if (key === "speaker") {
    R(ctx, x, 40, 7, 12, OUT); R(ctx, x + 1, 41, 5, 10, "#4a4466");
    for (const [cy2, r] of [[44, 1.6], [48, 2.2]]) for (let yy = -2; yy <= 2; yy++) for (let xx = -2; xx <= 2; xx++) if (xx * xx + yy * yy <= r * r) R(ctx, x + 3 + xx, cy2 + yy, 1, 1, "#9a94b5");
  }
}
function drawRug(ctx, key) {
  if (key === "none") return;
  const c0 = 40, cyy = 51;
  for (let yy = -4; yy <= 4; yy++) for (let xx = -20; xx <= 20; xx++) {
    let inside = false, col = "#ff9fbb";
    if (key === "round") { const e = (xx * xx) / 196 + (yy * yy) / 9; inside = e <= 1; col = e > .6 ? "#ff7aa0" : "#ffb3c9"; }
    else if (key === "oval") { const e = (xx * xx) / 361 + (yy * yy) / 12; inside = e <= 1; col = e > .65 ? "#6f8fd9" : "#9fb8f5"; }
    else if (key === "stripes") { inside = Math.abs(xx) <= 17 && Math.abs(yy) <= 3; col = ((xx + 40) >> 2) % 2 ? "#ffd84d" : "#ffffff"; if (Math.abs(yy) === 3) col = "#ef9b3a"; }
    else if (key === "heart") { const X = xx / 13, Y = -yy / 3.6; inside = (X * X + Y * Y - 1) ** 3 - X * X * Y * Y * Y <= 0; col = "#ff7aa0"; }
    else if (key === "star") { const a = Math.atan2(yy * 4, xx), rr = Math.sqrt(xx * xx + yy * yy * 16); inside = rr <= 10 + 5 * Math.cos(a * 5); col = "#ffd84d"; }
    else if (key === "rainbow") { const e = Math.sqrt((xx * xx) / 361 + ((yy - 4) * (yy - 4)) / 64); inside = yy <= 4 && e <= 1; col = ["#9474e0", "#3b8fc9", "#7ccf6c", "#ffd84d", "#ff9b5a", "#ef4a63"][Math.min(5, Math.floor(e * 6))]; }
    if (inside) R(ctx, c0 + xx, cyy + yy, 1, 1, col);
  }
}
export function holidayAt(d) {
  const m = d.getMonth() + 1, day = d.getDate();
  if (m === 2 && day >= 10 && day <= 14) return "valentine";
  if (m === 10 && day >= 25) return "halloween";
  if (m === 12 && day >= 18 && day <= 26) return "christmas";
  if ((m === 12 && day === 31) || (m === 1 && day === 1)) return "newyear";
  return null;
}
function drawHoliday(ctx, now, h, d) {
  if (h === "valentine") { if (d.ceiling === "none") for (let x = 4; x < LW - 3; x += 8) art(ctx, ART.heart, x - 2, 2 + Math.round(Math.sin((x / LW) * Math.PI) * 3)); for (const [x, y] of [[34, 14], [44, 22], [52, 12]]) art(ctx, ART.heart, x, y + Math.round(Math.sin(now / 600 + x) * 1), { tint: "#ffb3c9" }); }
  if (h === "halloween") { art(ctx, ART.pumpkin, 46, 45); for (let i = 0; i < 6; i++) { R(ctx, LW - 1 - i, i, 1, 1, "#d8d8e4"); R(ctx, LW - 1 - i * 2, 0, 1, 1, "#d8d8e4"); R(ctx, LW - 1, i * 2, 1, 1, "#d8d8e4"); } }
  if (h === "christmas") { const x = 34, y = 8; for (let a = 0; a < 16; a++) R(ctx, x + Math.round(Math.cos(a * Math.PI / 8) * 4), y + Math.round(Math.sin(a * Math.PI / 8) * 4), 1, 1, a % 4 === 0 ? "#ef4a63" : "#3f8f45"); R(ctx, x - 1, y + 4, 3, 2, "#ef4a63"); if (d.right === "none" && d.left !== "tree") drawItem(ctx, "tree", "right", now, false); }
  if (h === "newyear") { const n = new Date(); const yr = String(n.getMonth() === 11 ? n.getFullYear() + 1 : n.getFullYear()); text(ctx, yr, Math.round((LW - textW(yr)) / 2), 26, "#e9a227"); }
}
export function drawRoom(ctx, now, d, fx = {}) {
  drawWall(ctx, d.wall, now);
  drawWindow(ctx, d.window, d.curtain, now, fx);
  drawArt(ctx, d.art);
  drawCeiling(ctx, d.ceiling, now, false);
  drawFloor(ctx, d.floor);
  drawRug(ctx, d.rug);
  drawItem(ctx, d.left, "left", now, false);
  drawItem(ctx, d.right, "right", now, false);
  if (fx.holiday) drawHoliday(ctx, now, fx.holiday, d);
}
export function drawGlow(ctx, now, d) {
  drawCeiling(ctx, d.ceiling, now, true);
  for (const side of ["left", "right"]) if (d[side] === "lamp" || d[side] === "fish") drawItem(ctx, d[side], side, now, true);
}
export function drawOutdoor(ctx, now, opts = {}) {
  const sky = skyAt(new Date());
  for (let y = 0; y < 44; y++) R(ctx, 0, y, LW, 1, mix(sky.top, sky.bot, y / 44));
  if (sky.night) for (const [x, y] of STAR_PTS) if (y < 36) R(ctx, x, y, 1, 1, "#fff6c0");
  const off = opts.scroll || 0;
  ctx.fillStyle = sky.night ? "#2c3a6e" : "#bfe7b0";
  for (let x = 0; x < LW; x++) { const h = 6 + Math.round(Math.sin((x + off * 0.3) / 9) * 3); ctx.fillRect(x, 44 - h, 1, h); }
  R(ctx, 0, 44, LW, 12, sky.night ? "#3f6b4a" : "#8fd36b"); R(ctx, 0, 44, LW, 1, sky.night ? "#2f5238" : "#6fbf55");
  ctx.fillStyle = sky.night ? "#2f5238" : "#6fbf55";
  for (let i = 0; i < 12; i++) { const x = ((i * 23 - off) % (LW + 10) + LW + 10) % (LW + 10) - 5; ctx.fillRect(x, 48 + (i % 3) * 2, 2, 1); }
}
