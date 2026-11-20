/* Markup que generamos en vez de escribirlo a mano: las máscaras de los
   títulos, los dígitos de los odómetros y los puntos de los idiomas.
   Corre al importarse, antes de que nada observe estos elementos. */

/* ---------- títulos: cada línea en su máscara ---------- */
document.querySelectorAll('.split').forEach(el => {
  el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((l, i) => `<span class="ln"><span style="--i:${i}">${l.trim()}</span></span>`).join('');
});
/* ---------- odómetros de los años ---------- */
document.querySelectorAll('.odo').forEach(o => {
  o.innerHTML = [...o.dataset.v].map((d, i) => `<span class="dg" aria-hidden="true"><span style="--i:${i}" data-d="${d}">${[...Array(20)].map((_, k) => `<i>${k % 10}</i>`).join('')}</span></span>`).join('');
});
document.querySelectorAll('.dots').forEach(d => { const l = +d.dataset.l; d.setAttribute('role', 'img'); d.setAttribute('aria-label', l + ' de 5'); d.innerHTML = [0, 1, 2, 3, 4].map(i => `<i class="${i < l ? 'f' : ''}" style="--i:${i}"></i>`).join(''); });
