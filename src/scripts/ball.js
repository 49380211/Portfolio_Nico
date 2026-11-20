import { RM, hero } from './env.js';

/* Pelota de tenis en 3D: cae en la "O" de NICOLÁS y, al bajar, rueda hasta el
   borde derecho de la pantalla rebotando con el scroll. El módulo entero es
   el cierre que antes era una IIFE. */

const tb = document.getElementById('tb'), shEl = document.getElementById('tbSh'), slot = document.querySelector('.hero .slot');
const SZ = 280;
let A = null, cur = null, vel = { x: 0, y: 0, d: 0 }, rot = 0, hop = 0, hv = 0, squash = 0, lastY = scrollY, started = false, prev = null, three = null, lastT = 0;

// fieltro con fibras + costura con la curva real de una pelota de tenis
const buildBall = () => {
  if (!window.THREE) return null;
  try {
    const T = THREE, W = 1024, H = 512;
    const col = document.createElement('canvas'), bmp = document.createElement('canvas');
    col.width = bmp.width = W; col.height = bmp.height = H;
    const g = col.getContext('2d'), b = bmp.getContext('2d');
    g.fillStyle = '#D2E93A'; g.fillRect(0, 0, W, H);
    b.fillStyle = '#808080'; b.fillRect(0, 0, W, H);
    for (let i = 0; i < 70000; i++) {
      const x = Math.random() * W, y = Math.random() * H, a = Math.random() * 6.28, l = 1 + Math.random() * 3, up = Math.random() < .5;
      g.strokeStyle = up ? 'rgba(250,255,200,.12)' : 'rgba(110,130,0,.10)';
      b.strokeStyle = up ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.25)';
      for (const c of [g, b]) { c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    }
    const ka = .72, kb = .28, kc = 2 * Math.sqrt(ka * kb), pts = [];
    for (let i = 0; i <= 3000; i++) {
      const t = i / 3000 * Math.PI * 2;
      let x = ka * Math.cos(t) + kb * Math.cos(3 * t), z = ka * Math.sin(t) - kb * Math.sin(3 * t), y = kc * Math.sin(2 * t);
      const n = Math.hypot(x, y, z); x /= n; y /= n; z /= n;
      const lat = Math.asin(y), lon = Math.atan2(z, x);
      pts.push([(lon + Math.PI) / (Math.PI * 2) * W, (Math.PI / 2 - lat) / Math.PI * H, Math.max(.2, Math.cos(lat))]);
    }
    const stroke = (c, w, color) => { c.fillStyle = color; pts.forEach(([u, v, k]) => { for (const o of [-W, 0, W]) { c.beginPath(); c.ellipse(u + o, v, w / 2 / k, w / 2, 0, 0, 6.29); c.fill(); } }); };
    stroke(g, 22, '#B9CF2C'); stroke(g, 12, '#F3F5E6');
    stroke(b, 22, '#3a3a3a'); stroke(b, 12, '#9a9a9a');
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(SZ, SZ); renderer.outputEncoding = T.sRGBEncoding;
    const scene = new T.Scene(), cam = new T.OrthographicCamera(-1.02, 1.02, 1.02, -1.02, .1, 10); cam.position.z = 5;
    const map = new T.CanvasTexture(col); map.encoding = T.sRGBEncoding; map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const bump = new T.CanvasTexture(bmp);
    const mesh = new T.Mesh(new T.SphereGeometry(1, 96, 64), new T.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: .025, roughness: 1, metalness: 0 }));
    mesh.rotation.set(.55, -.5, .25); scene.add(mesh);
    scene.add(new T.HemisphereLight(0xffffff, 0x8a93a8, .7));
    const key = new T.DirectionalLight(0xffffff, 1.15); key.position.set(-2.5, 3, 4); scene.add(key);
    const rim = new T.DirectionalLight(0xdfe6ff, .35); rim.position.set(3, -1.5, -2); scene.add(rim);
    tb.innerHTML = ''; tb.appendChild(renderer.domElement);
    const q = new T.Quaternion(), ax = new T.Vector3();
    return { roll(dx, dy, r) { const ang = Math.hypot(dx, dy) / r; if (ang < 1e-5) return; ax.set(dy, dx, 0).normalize(); q.setFromAxisAngle(ax, ang); mesh.quaternion.premultiply(q); }, render() { renderer.render(scene, cam); } };
  } catch (e) { return null; }
};

const measure = () => { const r = slot.getBoundingClientRect(); A = { x: r.left + r.width / 2, y: r.top + scrollY + r.height / 2, d: r.width * 1.22 }; };
const target = () => {
  const vw = innerWidth, vh = innerHeight, mob = vw < 640;
  const p = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight * .7)));
  const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const x1 = vw - (mob ? 32 : 46), y1 = vh * (mob ? .9 : .88), d1 = mob ? 46 : 66;
  const y0 = A.y - scrollY;
  return { x: A.x + (x1 - A.x) * e, y: y0 + (y1 - y0) * e - Math.sin(Math.PI * e) * vh * .22, d: A.d + (d1 - A.d) * e, p };
};
const frame = ts => {
  const n = lastT ? Math.max(1, Math.min(4, Math.round((ts - lastT) / 16.67))) : 1; lastT = ts;
  if (scrollY < hero.offsetHeight + 200) measure();
  const t = target();
  if (!cur) cur = { ...t };
  const dy = scrollY - lastY; lastY = scrollY;
  for (let i = 0; i < n; i++) {
    if (RM) cur = { ...t };
    else for (const k of ['x', 'y', 'd']) { vel[k] = (vel[k] + (t[k] - cur[k]) * .14) * .74; cur[k] += vel[k]; }
    if (!RM && started) {
      if (i === 0 && t.p >= 1 && hop === 0 && Math.abs(dy) > 6) hv = -Math.min(13, Math.abs(dy) * .22);
      hv += .9; hop += hv;
      if (hop > 0) { if (hv > 2.5) { squash = Math.min(.26, hv * .025); hv = -hv * .45; hop = 0; } else { hop = 0; hv = 0; } }
    }
    squash *= .82;
  }
  const px = cur.x, py = cur.y + hop;
  if (prev) {
    const mx = px - prev[0], my = py - prev[1] + (t.p >= 1 ? dy * .5 : 0);
    if (three) three.roll(mx, my, cur.d / 2); else rot += (mx + my * .3) / (cur.d / 2) * 57.3;
  }
  prev = [px, py];
  const sx = 1 + squash * .55, sy = 1 - squash, s = cur.d / (SZ * .98);
  tb.style.transform = `translate(${px}px,${py + squash * cur.d * .5}px) scale(${s * sx},${s * sy})` + (three ? '' : ` rotate(${rot}deg)`);
  const air = Math.min(1, -hop / 240);
  shEl.style.transform = `translate(${cur.x}px,${cur.y + cur.d * .5}px) scale(${s * (1.05 - air * .5)},${s * (1 - air * .4)})`;
  shEl.style.opacity = (1 - air * .7).toFixed(3);
  if (three) three.render();
  requestAnimationFrame(frame);
};
addEventListener('resize', () => { if (A) measure(); });

/** Suelta la pelota: arma el render 3D y arranca el loop de animación. */
export const startBall = () => {
  if (started) return;
  three = buildBall(); measure();
  if (!RM) { hop = -(A.y + 320); hv = 0; }
  tb.classList.add('on'); started = true; requestAnimationFrame(frame);
};
