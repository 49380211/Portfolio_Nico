import { RM, root, hero, nav, prog, nameEl } from './env.js';

/* Lo que depende del scroll: la barra de progreso, el fondo del nav y la
   salida del nombre del hero. */

export const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  nav.classList.toggle('solid', scrollY > 40);
  if (!root.classList.contains('loading') && !RM) {
    const p = Math.min(1, scrollY / hero.offsetHeight);
    nameEl.style.transform = `translateY(${p * hero.offsetHeight * .22}px)`;
    nameEl.style.opacity = 1 - p * .9;
  }
};
addEventListener('scroll', onScroll, { passive: true });
