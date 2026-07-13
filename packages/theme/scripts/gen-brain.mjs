import { readFileSync, writeFileSync } from 'fs';
const SRC = process.argv[2];
const OUT = process.argv[3];
const svg = readFileSync(SRC, 'utf8');

const vb = svg.match(/viewBox="([^"]+)"/)[1];
const m = svg.match(/transform="matrix\(([^)]+)\)"/)[1].split(',').map(Number);
const [a,b,c,d,e,f] = m;

const groupRe = /<g\b[^>]*transform="translate\(([-\d.]+),([-\d.]+)\)"[^>]*>\s*<path\b([^>]*?)\/>\s*<\/g>/g;
const dots = [];
let mm;
while ((mm = groupRe.exec(svg)) !== null) {
  const tx = parseFloat(mm[1]);
  const ty = parseFloat(mm[2]);
  const pathAttrs = mm[3];
  const fill = (pathAttrs.match(/fill:(#[0-9a-fA-F]{6})/) || [])[1] || '#000000';
  const dAttr = pathAttrs.match(/\bd="([^"]+)"/)[1];
  const sx = a*tx + c*ty + e;
  const sy = b*tx + d*ty + f;
  dots.push({ tx, ty, fill, d: dAttr, sx, sy });
}
const N = dots.length;
if (N !== 62) console.error('WARN dot count', N);

/* ----------------------------------------------------------------------------
 * Firing schedule — a sparse network of synapses firing in succession.
 *
 * A signal propagates from a seed near the brain's centre along a SPARSE graph
 * (a minimum-spanning-tree backbone + a few random long-range synapses), so it
 * travels and branches along the dot network rather than sweeping left→right.
 * Edge latencies are randomised (seeded → stable across builds) to scramble the
 * order a little; a node igniting two children at once makes natural little
 * bursts. And not every dot fires: drop probability rises with propagation time,
 * so the cascade peters out toward the periphery, leaving outer dots dark — like
 * the signal never reached them. Per-dot peak scale and duration vary too.
 * ------------------------------------------------------------------------- */

// Deterministic PRNG (mulberry32) so regenerating yields the same firing pattern.
function mulberry32(seed) {
  let aa = seed >>> 0;
  return function () {
    aa = (aa + 0x6d2b79f5) | 0;
    let t = Math.imul(aa ^ (aa >>> 15), 1 | aa);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0x5eed42);

const dist = (i, j) => Math.hypot(dots[i].sx - dots[j].sx, dots[i].sy - dots[j].sy);
const nn = dots.map((_, i) =>
  [...Array(N).keys()].filter((j) => j !== i).sort((p, q) => dist(i, p) - dist(i, q)),
);

// Sparse graph: Prim MST backbone (connected, avg degree ~2) ...
const inMST = new Array(N).fill(false);
const key = new Array(N).fill(Infinity);
const par = new Array(N).fill(-1);
const adj = dots.map(() => new Set());
for (let j = 0; j < N; j++) key[j] = dist(0, j);
key[0] = 0;
for (let done = 0; done < N; done++) {
  let u = -1, best = Infinity;
  for (let j = 0; j < N; j++) if (!inMST[j] && key[j] < best) { best = key[j]; u = j; }
  inMST[u] = true;
  if (par[u] !== -1) { adj[u].add(par[u]); adj[par[u]].add(u); }
  for (let j = 0; j < N; j++) if (!inMST[j]) {
    const dd = dist(u, j);
    if (dd < key[j]) { key[j] = dd; par[j] = u; }
  }
}
// ... plus a few random short-range extra synapses for occasional branching.
for (let i = 0; i < N; i++) {
  if (rand() < 0.22) {
    const cand = nn[i].find((j) => !adj[i].has(j));
    if (cand != null) { adj[i].add(cand); adj[cand].add(i); }
  }
}

// Seed near the centroid so activation radiates outward through the network.
const cx = dots.reduce((s, o) => s + o.sx, 0) / N;
const cy = dots.reduce((s, o) => s + o.sy, 0) / N;
let seed = 0, seedBest = Infinity;
for (let i = 0; i < N; i++) {
  const dd = Math.hypot(dots[i].sx - cx, dots[i].sy - cy);
  if (dd < seedBest) { seedBest = dd; seed = i; }
}

// Propagate: Dijkstra over randomised edge latencies → arrival (fire) order.
const arrive = new Array(N).fill(Infinity);
const settled = new Array(N).fill(false);
arrive[seed] = 0;
for (let n = 0; n < N; n++) {
  let u = -1, best = Infinity;
  for (let i = 0; i < N; i++) if (!settled[i] && arrive[i] < best) { best = arrive[i]; u = i; }
  if (u === -1) break;
  settled[u] = true;
  for (const v of adj[u]) {
    const w = dist(u, v) * (0.5 + 0.9 * rand());   // randomised latency scrambles order
    if (arrive[u] + w < arrive[v]) arrive[v] = arrive[u] + w;
  }
}

// Normalise arrival into a time window; decide who fires (drop rises with time).
const aMax = Math.max(...arrive.filter((x) => isFinite(x))) || 1;
const WINDOW = 720;        // ms from first to last ignition
const DROP_BASE = 0.02;    // early/central dots almost always fire
const DROP_SLOPE = 0.42;   // ...peripheral/late dots increasingly stay dark
let fireCount = 0;
dots.forEach((o, i) => {
  const nt = isFinite(arrive[i]) ? arrive[i] / aMax : 1;     // 0 (first) … 1 (last)
  o.fires = isFinite(arrive[i]) && i !== seed
    ? rand() > DROP_BASE + DROP_SLOPE * nt
    : isFinite(arrive[i]);                                   // the seed always fires
  if (!o.fires) return;
  fireCount++;
  o.delay = Math.max(0, Math.round(nt * WINDOW + (rand() - 0.5) * 28));
  o.scale = +(1.22 + 0.36 * rand()).toFixed(3);   // peak pop scale 1.22–1.58
  o.dur = Math.round(380 + 220 * rand());         // flash duration 380–600ms
});

const body = dots.map((o, i) => {
  const style = o.fires
    ? `{ fill: '${o.fill}', ['--fd']: '${o.delay}ms', ['--fs']: '${o.scale}', ['--fdur']: '${o.dur}ms', ['--g']: '${o.fill}' } as React.CSSProperties`
    : `{ fill: '${o.fill}' }`;
  const cls = o.fires ? 'clsx(styles.dot, styles.fires)' : 'styles.dot';
  return (
    `      <g transform="translate(${o.tx},${o.ty})">\n` +
    `        <path data-i="${i}" className={${cls}} style={${style}} d="${o.d}" />\n` +
    `      </g>`
  );
}).join('\n');

// Runtime firing data: the neighbour graph + dot centres + tuning constants, so
// HeroBrain can re-run the cascade from a RANDOM seed on a timer (the navbar
// uses the baked .fires hover chain instead). Sets → arrays for serialisation;
// coords rounded to keep the generated module small.
const graph = {
  nodes: dots.map((o) => [Math.round(o.sx * 100) / 100, Math.round(o.sy * 100) / 100]),
  adj: adj.map((s) => [...s]),
  window: WINDOW,
  dropBase: DROP_BASE,
  dropSlope: DROP_SLOPE,
};

const out = `import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

/**
 * jsPsych dot-brain mark, inlined so each of the 62 dots animates on its own.
 * Generated from static/img/jspsych-logo-no-text.svg by scripts/gen-brain.mjs —
 * do not hand-edit; rerun the generator instead.
 *
 * On hover, a signal propagates from the brain's centre along a SPARSE neighbour
 * graph: dots fire in succession as the activation branches outward, and it
 * peters out before reaching the periphery, so a subset of dots stay dark. Dots
 * that fire carry styles.fires plus:
 *   --fd   : fire delay (its position in the propagation order)
 *   --fs   : peak pop scale (varied per dot for bursty liveliness)
 *   --fdur : flash duration (varied per dot)
 *   --g    : its own fill, reused as the glow color when it fires
 * Dots without styles.fires never animate. Pure CSS, triggered by
 * .navbar__brand:hover (see styles.module.css).
 *
 * Each dot also carries data-i (its index). BRAIN_GRAPH (exported below) holds
 * the neighbour graph + dot centres so HeroBrain can replay the cascade from a
 * random seed on a timer, via the data-fire trigger in styles.module.css.
 */
export default function JspsychBrain({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg
      viewBox="${vb}"
      role="img"
      aria-label="jsPsych"
      className={clsx(styles.brain, className)}
      {...props}>
      <g transform="matrix(${m.join(',')})">
${body}
      </g>
    </svg>
  );
}

/**
 * Neighbour graph + dot centres + tuning constants for runtime propagation.
 * nodes[i] = [x, y] screen centre of dot i; adj[i] = indices of i's neighbours.
 * Consumed by HeroBrain to ignite a fresh chain from a random seed each pulse.
 */
export const BRAIN_GRAPH = ${JSON.stringify(graph)} as const;
`;
writeFileSync(OUT, out);
const degrees = adj.map((s) => s.size);
const avgDeg = (degrees.reduce((x, y) => x + y, 0) / N).toFixed(2);
console.log(`Wrote ${OUT}: ${N} dots, ${fireCount} fire (${Math.round(100*fireCount/N)}%), ${N-fireCount} stay dark`);
console.log(`graph avg degree ${avgDeg}, seed #${seed} near centroid, window ${WINDOW}ms`);
