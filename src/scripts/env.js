/* Estado compartido entre módulos: la preferencia de movimiento reducido y
   los nodos que usan varios de ellos. */
export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const root = document.documentElement;
export const hero = document.getElementById('inicio');
export const nav = document.getElementById('nav');
export const prog = document.getElementById('prog');
export const nameEl = document.querySelector('.name');

/* Arrancar siempre desde arriba: la intro y la caída de la pelota dan por
   hecho que la página está en scroll 0. Este módulo lo importan todos los
   demás, así que corre antes de que cualquiera lea scrollY. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);
