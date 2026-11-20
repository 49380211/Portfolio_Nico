/* Punto de entrada. Solo arma el orden de arranque; la lógica vive en los
   módulos. El orden de los imports importa: env.js resetea el scroll a 0 y
   dom-prep.js genera markup que los demás dan por hecho. */
import './env.js';
import './dom-prep.js';
import './scroll.js';
import './projects/changuit-canvas.js';
import './projects/map-canvas.js';
import './copy-mail.js';
import { intro } from './intro.js';

/* Esperamos a la tipografía antes de animar el nombre, pero no más de 2,5 s:
   si Google Fonts tarda, la intro arranca igual. */
Promise.race([document.fonts ? document.fonts.load('800 100px "Barlow Condensed"').then(() => document.fonts.ready) : Promise.resolve(), new Promise(r => setTimeout(r, 2500))]).then(intro, intro);
