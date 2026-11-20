import { RM } from './env.js';

/* Revelado al bajar: cada elemento se marca con la clase "in" la primera vez
   que entra en pantalla, y el CSS se encarga de la transición. */

const inView = (el, cb, th = .15, margin = '0px 0px -8% 0px') => {
  if (!('IntersectionObserver' in window)) { cb(); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { cb(); io.disconnect(); } }), { threshold: th, rootMargin: margin });
  io.observe(el);
};
export const reveals = () => {
  document.querySelectorAll('.split,.fade,.draw,.hl,#stages,#principles,#path,#langs').forEach(el => inView(el, () => el.classList.add('in')));
  // lo recortado no cuenta como visible: se observa al contenedor
  document.querySelectorAll('.mask').forEach(el => inView(el.parentElement, () => el.classList.add('in'), .1));
  document.querySelectorAll('[data-odo]').forEach(row => inView(row, () => row.querySelectorAll('.dg > span').forEach(s => { s.style.transform = `translateY(-${10 + +s.dataset.d}em)`; }), .4));
  document.querySelectorAll('[data-count]').forEach(el => inView(el, () => {
    if (RM) return; const n = +el.dataset.count; let i = 0;
    const tick = () => { el.textContent = i; if (i++ < n) setTimeout(tick, 120); }; tick();
  }, .6));
};
