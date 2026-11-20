import { setupCanvas } from '../canvas.js';

/* Gloire Éternelle: mapa de hexágonos */
const cv = document.getElementById('cvMap');
let grid = null, cap = null, own = new Set(), revolt = new Map(), acc = 0;
const R = 17;
const build = (W, H) => {
  grid = []; const w = Math.sqrt(3) * R, h = 1.5 * R, idx = {};
  for (let r = -1; r * h < H + R; r++) for (let q = -1; q * w < W + w; q++) { idx[r + ',' + q] = grid.length; grid.push({ x: q * w + (r & 1 ? w / 2 : 0), y: r * h, r, q, n: [] }); }
  grid.forEach(g => { const o = g.r & 1; [[0, -1], [0, 1], [-1, o - 1], [-1, o], [1, o - 1], [1, o]].forEach(([dr, dq]) => { const i = idx[(g.r + dr) + ',' + (g.q + dq)]; if (i !== undefined) g.n.push(i); }); });
  cap = grid.reduce((b, g, i) => Math.hypot(g.x - W * .45, g.y - H * .48) < Math.hypot(grid[b].x - W * .45, grid[b].y - H * .48) ? i : b, 0);
  own = new Set([cap]); revolt.clear();
};
const hex = (c, x, y, s) => { c.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); c.lineTo(x + s * Math.cos(a), y + s * Math.sin(a)); } c.closePath(); };
const step = () => {
  const front = []; own.forEach(i => grid[i].n.forEach(j => { if (!own.has(j)) front.push(j); }));
  if (front.length) own.add(front[Math.floor(Math.random() * front.length)]);
  if (own.size > grid.length * .14 && Math.random() < .1) {
    const arr = [...own].filter(i => i !== cap), t = arr[Math.floor(Math.random() * arr.length)];
    revolt.set(t, 0); grid[t].n.forEach(j => { if (own.has(j) && j !== cap && Math.random() < .5) revolt.set(j, 0); });
  }
  if (own.size > grid.length * .5) build(cv.W, cv.H);
};
setupCanvas(cv, (c, W, H, ts, dt, still) => {
  if (!grid || cv.W !== W || cv.H !== H) { cv.W = W; cv.H = H; build(W, H); if (still) for (let i = 0; i < 60; i++) step(); }
  acc += dt; if (!still && acc > 180) { acc = 0; step(); }
  revolt.forEach((t, i) => { t += still ? 0 : dt; revolt.set(i, t); if (t > 2200) { revolt.delete(i); own.delete(i); } });
  c.clearRect(0, 0, W, H);
  grid.forEach((g, i) => {
    hex(c, g.x, g.y, R - 2);
    if (revolt.has(i)) { c.fillStyle = Math.floor(revolt.get(i) / 220) % 2 ? '#D2342C' : '#F0B7B3'; c.fill(); }
    else if (own.has(i)) { c.fillStyle = '#0B1630'; c.fill(); }
    else { c.strokeStyle = '#D0D5DE'; c.lineWidth = 1; c.stroke(); }
  });
  const g = grid[cap]; hex(c, g.x, g.y, R - 2); c.fillStyle = '#DDF35A'; c.fill();
});
