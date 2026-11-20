/* Copiar el mail al portapapeles, con la selección del texto como plan B
   para los navegadores que no dan permiso. */

const toast = msg => { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2000); };
document.getElementById('copy').addEventListener('click', () => {
  const sel = () => { const r = document.createRange(); r.selectNodeContents(document.getElementById('mailv')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Mail seleccionado: copialo con Ctrl+C'); };
  try { navigator.clipboard.writeText('nicoatalah@gmail.com').then(() => toast('Mail copiado'), sel); } catch (e) { sel(); }
});
