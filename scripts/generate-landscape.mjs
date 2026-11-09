// Gera as gravuras em nanquim (SVG, camadas separadas) usadas no hero e no rodapé.
// Uso: node scripts/generate-landscape.mjs
// Saída: public/art/{hero,footer}-{far,mid,near}.svg (+ footer-water.svg)
import { mkdirSync, writeFileSync } from "node:fs";

const BG = "#F6F5F0";
const INK = "#181916";
const f1 = (n) => Math.round(n * 10) / 10;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (t) => t * t * (3 - 2 * t);

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed) {
  const rnd = mulberry32(seed);
  const P = new Float32Array(256);
  for (let i = 0; i < 256; i++) P[i] = rnd();
  return (x) => {
    const i = Math.floor(x);
    const f = x - i;
    const a = P[i & 255];
    const b = P[(i + 1) & 255];
    return a + (b - a) * smooth(f);
  };
}

function fbm(noise, x, oct = 5) {
  let s = 0, a = 0.5, fr = 1, n = 0;
  for (let o = 0; o < oct; o++) {
    s += a * noise(x * fr + o * 17.3);
    n += a;
    a *= 0.5;
    fr *= 2.03;
  }
  return s / n;
}

const ridged = (noise, x, oct = 5) => {
  let s = 0, a = 0.5, fr = 1, n = 0;
  for (let o = 0; o < oct; o++) {
    const v = 1 - Math.abs(noise(x * fr + o * 9.1) * 2 - 1);
    s += a * v * v;
    n += a;
    a *= 0.5;
    fr *= 2.1;
  }
  return s / n;
};

function conifer(x, yb, h, rnd) {
  const w = h * (0.2 + rnd() * 0.07);
  const tiers = Math.max(3, Math.round(h / 5.5));
  const top = yb - h;
  const tierH = (h * 0.9) / tiers;
  let d = `M${f1(x)} ${f1(yb)}L${f1(x)} ${f1(top)}`;
  for (let j = 1; j <= tiers; j++) {
    const ty = top + h * 0.9 * (j / tiers);
    const tw = w * (0.25 + 0.75 * (j / tiers));
    d += `M${f1(x - tw)} ${f1(ty)}L${f1(x)} ${f1(ty - tierH * 0.95)}L${f1(x + tw)} ${f1(ty)}`;
    if (h > 16 && j > 1) {
      d += `M${f1(x + tw * 0.15)} ${f1(ty)}l${f1(tw * 0.55)} ${f1(-tierH * 0.35)}`;
    }
  }
  d += `M${f1(x - w * 0.8)} ${f1(yb)}l${f1(w * 1.6)} 0`;
  const fill = `${f1(x)},${f1(top)} ${f1(x - w)},${f1(yb - h * 0.05)} ${f1(x + w)},${f1(yb - h * 0.05)}`;
  return { fill, d, yb };
}

/**
 * Constrói uma camada de gravura.
 * ridge(x) -> y (ou Infinity quando não há terreno naquela coluna).
 */
function buildLayer(opts) {
  const {
    seed, W, H, bottom = H, ridge, sw = 0.8, opacity = 1,
    contours = { n: 10, gap: 8, spread: 5, keep: 0.75 },
    hatch = null, ravines = 0, trees = null, ticks = 0,
  } = opts;
  const rnd = mulberry32(seed);
  const nB = makeNoise(seed + 1);
  const nT = makeNoise(seed + 2);
  const nR = makeNoise(seed + 3);
  const nB2 = makeNoise(seed + 4);

  const Yarr = new Float32Array(W + 9);
  for (let i = 0; i < Yarr.length; i++) Yarr[i] = ridge(i - 4);
  const Y = (x) => {
    const i = clamp(Math.round(x), 0, W);
    return Yarr[i + 4];
  };
  const valid = (x) => Number.isFinite(Y(x)) && Y(x) < bottom - 2;

  const parts = [];

  // 1) preenchimento (oculta camadas de trás)
  let fillD = "";
  let run = null;
  const flush = () => {
    if (run && run.length > 2) {
      fillD += `M${f1(run[0][0])} ${bottom + 60}` + run.map(([x, y]) => `L${f1(x)} ${f1(y)}`).join("") +
        `L${f1(run[run.length - 1][0])} ${bottom + 60}Z`;
    }
    run = null;
  };
  for (let x = 0; x <= W; x += 3) {
    if (valid(x)) (run ??= []).push([x, Y(x)]);
    else flush();
  }
  flush();
  parts.push(`<path d="${fillD}" fill="${BG}" stroke="none"/>`);

  // 2) linha de crista
  let ridgeD = "";
  let pen = false;
  for (let x = 0; x <= W; x += 2) {
    if (valid(x)) {
      ridgeD += `${pen ? "L" : "M"}${f1(x)} ${f1(Y(x))}`;
      pen = true;
    } else pen = false;
  }
  parts.push(`<path d="${ridgeD}" stroke-width="${f1(sw * 1.5)}"/>`);

  // 3) curvas de nível
  let cD = "";
  for (let k = 1; k <= contours.n; k++) {
    const r = k * contours.spread;
    const off = k * contours.gap * (1 + 0.07 * k);
    let on = false;
    let left = 0;
    let gapLeft = rnd() * 40;
    for (let x = 0; x <= W; x += 4) {
      if (!valid(x)) { on = false; continue; }
      const ys = (Y(x - r) + Y(x) + Y(x + r)) / 3 + off + (fbm(nR, x * 0.012 + k * 5) - 0.5) * 7;
      if (ys > bottom) { on = false; continue; }
      if (gapLeft > 0) { gapLeft -= 4; on = false; continue; }
      if (left <= 0) {
        left = 60 + rnd() * 260;
        if (rnd() > contours.keep) { gapLeft = 20 + rnd() * 80; continue; }
        on = false;
      }
      cD += `${on ? "L" : "M"}${f1(x)} ${f1(ys)}`;
      on = true;
      left -= 4;
      if (left <= 0) { gapLeft = 6 + rnd() * 30; on = false; }
    }
  }
  parts.push(`<path d="${cD}" stroke-width="${f1(sw * 0.7)}" opacity="0.8"/>`);

  // 4) hachuras de sombra
  if (hatch) {
    const { step, len, depth, dstep, angle, thr } = hatch;
    let hD = "";
    for (let x = 2; x < W; x += step) {
      if (!valid(x)) continue;
      const y = Y(x);
      const s = (Y(x + 5) - Y(x - 5)) / 10;
      const n = fbm(nB, x * 0.011);
      const shade = clamp(0.4 + s * 1.3 + (n - 0.5) * 0.5, 0, 1);
      if (shade < thr) continue;
      const colVar = 0.55 + 0.9 * fbm(nB2, x * 0.045);
      const maxD = depth * (0.3 + 0.7 * shade) * colVar;
      for (let d = 3; d < maxD; d += dstep * (0.75 + rnd() * 0.5)) {
        const yy = y + d;
        if (yy > bottom - 1) break;
        const fall = 1 - d / maxD;
        if (rnd() > 0.3 + 0.7 * shade * fall) continue;
        const l = len * (0.5 + 0.5 * shade) * Math.pow(fall, 0.5) * (0.6 + rnd() * 0.6);
        if (l < 2.5) continue;
        const a = (angle * Math.PI) / 180 + (rnd() - 0.5) * 0.2;
        hD += `M${f1(x + (rnd() - 0.5) * 1.4)} ${f1(yy)}l${f1(-l * Math.cos(a))} ${f1(l * Math.sin(a))}`;
        if (shade > 0.72 && fall > 0.35 && rnd() > 0.45) {
          const a2 = ((angle - 38) * Math.PI) / 180;
          hD += `M${f1(x)} ${f1(yy)}l${f1(-l * 0.8 * Math.cos(a2))} ${f1(l * 0.8 * Math.sin(a2))}`;
        }
      }
    }
    parts.push(`<path d="${hD}" stroke-width="${f1(sw * 0.62)}" opacity="0.9"/>`);
  }

  // 5) ravinas (drenagens descendo da crista)
  if (ravines) {
    let rD = "";
    for (let i = 0; i < ravines; i++) {
      let x = rnd() * W;
      if (!valid(x)) continue;
      let y = Y(x) + 3;
      const sl = (Y(x + 5) - Y(x - 5)) / 10;
      const dir = sl > 0 ? 1 : -1;
      const steps = 6 + Math.floor(rnd() * 12);
      const side = 1.8 + rnd() * 2;
      let a = `M${f1(x)} ${f1(y)}`;
      let b = `M${f1(x + side)} ${f1(y)}`;
      for (let s = 0; s < steps; s++) {
        x += dir * (0.8 + s * 0.12) + (fbm(nR, (x + s * 7) * 0.03 + i) - 0.5) * 5;
        y += 3.5 + rnd() * 2;
        if (y > bottom) break;
        const w = side * (1 - s / (steps * 1.3));
        a += `L${f1(x)} ${f1(y)}`;
        b += `L${f1(x + w)} ${f1(y + 0.8)}`;
      }
      rD += a + b;
    }
    parts.push(`<path d="${rD}" stroke-width="${f1(sw * 0.7)}" opacity="0.85"/>`);
  }

  // 6) árvores (coníferas)
  if (trees) {
    const { count, hMin, hMax, band, density } = trees;
    const list = [];
    let guard = 0;
    while (list.length < count && guard++ < count * 40) {
      const x = 10 + rnd() * (W - 20);
      if (!valid(x)) continue;
      if (fbm(nT, x * 0.006) < density) continue;
      const depthT = Math.pow(rnd(), 1.4);
      const yb = Y(x) + 6 + depthT * band;
      if (yb > bottom - 1) continue;
      const h = (hMin + rnd() * (hMax - hMin)) * (0.7 + 0.5 * depthT);
      list.push(conifer(x, yb, h, rnd));
    }
    list.sort((a, b) => a.yb - b.yb);
    for (const t of list) {
      parts.push(`<polygon points="${t.fill}" fill="${BG}" stroke="none"/><path d="${t.d}" stroke-width="${f1(sw * 0.7)}"/>`);
    }
  }

  // 7) ticks de relva no primeiro plano
  if (ticks) {
    let tD = "";
    for (let i = 0; i < ticks; i++) {
      const x = rnd() * W;
      if (!valid(x)) continue;
      const y = Y(x) + 10 + Math.pow(rnd(), 0.8) * (bottom - Y(x) - 10);
      const l = 3 + rnd() * 7;
      tD += `M${f1(x)} ${f1(y)}l${f1(-l * 0.25)} ${f1(-l)}M${f1(x + 1.6)} ${f1(y)}l${f1(l * 0.2)} ${f1(-l * 0.8)}`;
    }
    parts.push(`<path d="${tD}" stroke-width="${f1(sw * 0.6)}" opacity="0.9"/>`);
  }

  return svg(W, H + 60, parts.join(""), sw, opacity);
}

function svg(W, H, body, sw, opacity = 1) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><g opacity="${opacity}">${body}</g></svg>`;
}

function waterLayer({ seed, W, H, top, bottom }) {
  const rnd = mulberry32(seed);
  let d = "";
  let y = top + 4;
  let gap = 3.2;
  while (y < bottom) {
    let x = rnd() * 80;
    while (x < W) {
      const l = 30 + rnd() * 220;
      const wob = (rnd() - 0.5) * 0.6;
      d += `M${f1(x)} ${f1(y)}l${f1(l)} ${f1(wob)}`;
      x += l + 8 + rnd() * 70;
    }
    y += gap;
    gap *= 1.075;
  }
  const fill = `<rect x="0" y="${top}" width="${W}" height="${bottom + 60 - top}" fill="${BG}" stroke="none"/>`;
  return svg(W, H + 60, `${fill}<path d="${d}" stroke-width="0.6" opacity="0.8"/>`, 0.6);
}

mkdirSync("public/art", { recursive: true });
const out = (name, s) => {
  writeFileSync(`public/art/${name}.svg`, s);
  console.log(name, Math.round(s.length / 1024) + " KB");
};

/* ---------- HERO (1600 x 640 visível) ---------- */
{
  const W = 1600, H = 640;
  const nF = makeNoise(11), nM = makeNoise(23), nN = makeNoise(37);
  const far = (x) => 285 - 215 * Math.pow(0.65 * ridged(nF, x * 0.0026) + 0.35 * fbm(nF, x * 0.0045 + 40), 1.25);
  const mid = (x) => 430 - 250 * Math.pow(0.6 * ridged(nM, x * 0.0034 + 7) + 0.4 * fbm(nM, x * 0.006 + 90), 1.3);
  const near = (x) => 565 - 150 * (0.4 * ridged(nN, x * 0.005 + 3) + 0.6 * fbm(nN, x * 0.009 + 20));

  out("hero-far", buildLayer({
    seed: 101, W, H, ridge: far, sw: 0.7, opacity: 0.62,
    contours: { n: 14, gap: 6, spread: 6, keep: 0.85 },
    hatch: { step: 2.6, len: 24, depth: 120, dstep: 6, angle: 66, thr: 0.3 },
    ravines: 40,
  }));
  out("hero-mid", buildLayer({
    seed: 202, W, H, ridge: mid, sw: 0.85, opacity: 0.85,
    contours: { n: 12, gap: 7, spread: 7, keep: 0.78 },
    hatch: { step: 2.3, len: 30, depth: 150, dstep: 5.2, angle: 68, thr: 0.28 },
    ravines: 90,
    trees: { count: 110, hMin: 7, hMax: 17, band: 90, density: 0.5 },
  }));
  out("hero-near", buildLayer({
    seed: 303, W, H, ridge: near, sw: 1, opacity: 1,
    contours: { n: 8, gap: 9, spread: 8, keep: 0.7 },
    hatch: { step: 2.3, len: 26, depth: 90, dstep: 4.8, angle: 70, thr: 0.3 },
    ravines: 18,
    trees: { count: 240, hMin: 18, hMax: 44, band: 110, density: 0.4 },
    ticks: 420,
  }));
}

/* ---------- RODAPÉ panorâmico (2000 x 560 visível, com lago) ---------- */
{
  const W = 2000, H = 560, lakeY = 392;
  const nF = makeNoise(51), nM = makeNoise(63), nN = makeNoise(77);
  const far = (x) => 255 - 200 * Math.pow(0.65 * ridged(nF, x * 0.0021) + 0.35 * fbm(nF, x * 0.004 + 15), 1.25);
  const mid = (x) => 372 - 190 * Math.pow(0.58 * ridged(nM, x * 0.0032 + 5) + 0.42 * fbm(nM, x * 0.0055 + 33), 1.25);
  const bank = (x) => {
    const e = Math.max(smooth(clamp(1 - x / (W * 0.3), 0, 1)), smooth(clamp(1 - (W - x) / (W * 0.27), 0, 1)));
    return e;
  };
  const near = (x) => {
    const e = bank(x);
    if (e < 0.001) return Infinity;
    if (e < 0.04) return lakeY + 6 + (0.04 - e) * 3200;
    return lakeY + 6 - e * (120 * (0.55 + 0.9 * fbm(nN, x * 0.006 + 8)));
  };

  out("footer-far", buildLayer({
    seed: 404, W, H, ridge: far, sw: 0.7, opacity: 0.6,
    contours: { n: 13, gap: 6, spread: 6, keep: 0.85 },
    hatch: { step: 2.6, len: 22, depth: 110, dstep: 6, angle: 66, thr: 0.3 },
    ravines: 40,
  }));
  out("footer-mid", buildLayer({
    seed: 505, W, H, bottom: lakeY, ridge: mid, sw: 0.85, opacity: 0.85,
    contours: { n: 9, gap: 6, spread: 7, keep: 0.8 },
    hatch: { step: 2.3, len: 28, depth: 110, dstep: 5.2, angle: 68, thr: 0.28 },
    ravines: 70,
    trees: { count: 130, hMin: 7, hMax: 16, band: 40, density: 0.48 },
  }));
  out("footer-water", waterLayer({ seed: 606, W, H, top: lakeY, bottom: H }));
  out("footer-near", buildLayer({
    seed: 707, W, H, ridge: near, sw: 1, opacity: 1,
    contours: { n: 5, gap: 8, spread: 8, keep: 0.65 },
    hatch: { step: 2.6, len: 24, depth: 80, dstep: 4.8, angle: 70, thr: 0.28 },
    ravines: 10,
    trees: { count: 230, hMin: 20, hMax: 46, band: 70, density: 0.38 },
    ticks: 240,
  }));
}
