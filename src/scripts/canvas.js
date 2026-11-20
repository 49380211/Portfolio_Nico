import { RM } from './env.js';

/* Andamio de los canvas 2D: ajusta el tamaño al contenedor y al
   devicePixelRatio, y solo deja corriendo el loop mientras el canvas está en
   pantalla. "draw" recibe (ctx, ancho, alto, timestamp, delta, primeraPasada). */

export const setupCanvas = (cv, draw) => {
  const ctx = cv.getContext('2d'); let W = 0, H = 0, running = false, last = 0;
  const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); new ResizeObserver(size).observe(cv);
  const loop = ts => { if (!running) return; draw(ctx, W, H, ts, Math.min(50, ts - last || 16)); last = ts; requestAnimationFrame(loop); };
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { running = e.isIntersecting && !RM; if (running) requestAnimationFrame(loop); })).observe(cv);
  draw(ctx, W, H, 0, 16, true);
};
