import gsap from 'gsap';

import { RM, root, nameEl } from './env.js';
import { reveals } from './reveals.js';
import { onScroll } from './scroll.js';
import { startBall } from './ball.js';

/* Secuencia de entrada, con GSAP: el nombre sube letra por letra, se encoge
   hasta su tamaño final, aparecen nav / tag / subtítulo y al final cae la
   pelota. Con movimiento reducido se salta derecho al estado final. */

const settle = () => { root.classList.remove('loading'); reveals(); onScroll(); };
export const intro = () => {
  if (RM) { root.classList.remove('loading'); settle(); startBall(); return; }
  const mob = innerWidth < 640;
  gsap.set(nameEl, { scale: mob ? 1.45 : 1.75, transformOrigin: '50% 55%' });
  nameEl.style.visibility = 'visible';
  gsap.timeline({ onComplete: settle })
    .fromTo('.name .c', { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .7, ease: 'power3.out', stagger: .03 }, .05)
    .to(nameEl, { scale: 1, duration: 1.25, ease: 'expo.inOut', onComplete: () => gsap.set(nameEl, { clearProps: 'transform' }) }, .4)
    .fromTo('.nav > *', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out', stagger: .06 }, 1.3)
    .fromTo('.tag', { opacity: 0, scale: .85 }, { opacity: 1, scale: 1, duration: .7, ease: 'back.out(2)' }, 1.35)
    .fromTo('.sub', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out' }, 1.45)
    // la pelota cae y queda como la "O"
    .add(startBall, 1.55);
};
