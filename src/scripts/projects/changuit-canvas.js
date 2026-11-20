import { setupCanvas } from '../canvas.js';

/* ChanguitApp: pedidos que se conectan con alguien cerca */
const cv = document.getElementById('cvChanga');
const rnd = (a, b) => a + Math.random() * (b - a);
let people = null, reqs = [];
const labels = ['Arreglar una canilla', 'Pasear al perro', 'Armar un mueble', 'Cortar el pasto', 'Pintar una pared', 'Hacer una mudanza'];
const init = (W, H) => { people = Array.from({ length: 24 }, () => ({ x: rnd(.06, .94) * W, y: rnd(.08, .88) * H, ph: Math.random() * 6.28, busy: 0 })); };
function spawn(W, H) {
  const r = { x: rnd(.1, .78) * W, y: rnd(.12, .82) * H, t: 0, label: labels[Math.floor(Math.random() * labels.length)] };
  let best = null, bd = 1e9; people.forEach(p => { if (p.busy) return; const d = Math.hypot(p.x - r.x, p.y - r.y); if (d < bd) { bd = d; best = p; } });
  if (best) { best.busy = 1; r.helper = best; } reqs.push(r);
}
setupCanvas(cv, (c, W, H, ts, dt, still) => {
  if (!people || people.W !== W) { init(W, H); people.W = W; if (still) for (let i = 0; i < 2; i++) spawn(W, H); }
  c.clearRect(0, 0, W, H);
  c.fillStyle = '#D7DBE3';
  for (let x = 24; x < W; x += 32) for (let y = 24; y < H; y += 32) { c.beginPath(); c.arc(x, y, 1, 0, 6.28); c.fill(); }
  if (!still && Math.random() < dt / 1000 && reqs.length < 3) spawn(W, H);
  reqs = reqs.filter(r => { if (r.t >= 5200) { if (r.helper) r.helper.busy = 0; return false; } return true; });
  reqs.forEach(r => {
    r.t += still ? 2200 : dt;
    const p = r.helper, k = Math.min(1, Math.max(0, (r.t - 600) / 900));
    const a = r.t > 4400 ? Math.max(0, 1 - (r.t - 4400) / 800) : 1;
    c.globalAlpha = a;
    if (p && k > 0) { c.strokeStyle = '#2648B5'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + (r.x - p.x) * k, p.y + (r.y - p.y) * k); c.stroke(); }
    const pulse = (r.t % 1200) / 1200;
    if (r.t < 1600) { c.strokeStyle = 'rgba(11,22,48,' + (1 - pulse) * .4 + ')'; c.lineWidth = 1; c.beginPath(); c.arc(r.x, r.y, 8 + pulse * 40, 0, 6.28); c.stroke(); }
    c.fillStyle = '#0B1630'; c.beginPath(); c.arc(r.x, r.y, 6, 0, 6.28); c.fill();
    if (k >= 1) { c.font = '500 12px Figtree, Arial'; c.fillText(r.label, r.x + 12, r.y + 4); }
    c.globalAlpha = 1;
  });
  people.forEach(p => { const s = 3.5 + Math.sin(ts / 700 + p.ph) * .6; c.fillStyle = p.busy ? '#2648B5' : 'rgba(38,72,181,.35)'; c.beginPath(); c.arc(p.x, p.y, p.busy ? 6 : s, 0, 6.28); c.fill(); });
});
