const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const hero = document.getElementById('inicio'), nav = document.getElementById('nav'), prog = document.getElementById('prog');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);

/* ---------- títulos: cada línea en su máscara ---------- */
document.querySelectorAll('.split').forEach(el => {
  el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((l, i) => `<span class="ln"><span style="--i:${i}">${l.trim()}</span></span>`).join('');
});
/* ---------- odómetros de los años ---------- */
document.querySelectorAll('.odo').forEach(o => {
  o.innerHTML = [...o.dataset.v].map((d, i) => `<span class="dg" aria-hidden="true"><span style="--i:${i}" data-d="${d}">${[...Array(20)].map((_, k) => `<i>${k % 10}</i>`).join('')}</span></span>`).join('');
});
document.querySelectorAll('.dots').forEach(d => { const l = +d.dataset.l; d.setAttribute('role', 'img'); d.setAttribute('aria-label', l + ' de 5'); d.innerHTML = [0, 1, 2, 3, 4].map(i => `<i class="${i < l ? 'f' : ''}" style="--i:${i}"></i>`).join(''); });

/* ---------- reveals al bajar ---------- */
const inView = (el, cb, th = .15, margin = '0px 0px -8% 0px') => {
  if (!('IntersectionObserver' in window)) { cb(); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { cb(); io.disconnect(); } }), { threshold: th, rootMargin: margin });
  io.observe(el);
};
const reveals = () => {
  document.querySelectorAll('.split,.fade,.draw,.hl,#stages,#principles,#path,#langs').forEach(el => inView(el, () => el.classList.add('in')));
  // lo recortado no cuenta como visible: se observa al contenedor
  document.querySelectorAll('.mask').forEach(el => inView(el.parentElement, () => el.classList.add('in'), .1));
  document.querySelectorAll('[data-odo]').forEach(row => inView(row, () => row.querySelectorAll('.dg > span').forEach(s => { s.style.transform = `translateY(-${10 + +s.dataset.d}em)`; }), .4));
  document.querySelectorAll('[data-count]').forEach(el => inView(el, () => {
    if (RM) return; const n = +el.dataset.count; let i = 0;
    const tick = () => { el.textContent = i; if (i++ < n) setTimeout(tick, 120); }; tick();
  }, .6));
};

/* ---------- scroll: barra de progreso, nav y salida del nombre ---------- */
const nameEl = document.querySelector('.name');
const onScroll = () => {
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

/* ---------- pelota 3D: cae en la "O" de NICOLÁS y al bajar se va al borde derecho ---------- */
const startBall = (() => {
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
  return () => {
    if (started) return;
    three = buildBall(); measure();
    if (!RM) { hop = -(A.y + 320); hv = 0; }
    tb.classList.add('on'); started = true; requestAnimationFrame(frame);
  };
})();

/* ---------- entrada: la misma secuencia que el portfolio de Augusto ---------- */
const settle = () => { root.classList.remove('loading'); reveals(); onScroll(); };
const intro = () => {
  const G = window.gsap;
  if (!G || RM) { root.classList.remove('loading'); settle(); startBall(); return; }
  const mob = innerWidth < 640;
  G.set(nameEl, { scale: mob ? 1.45 : 1.75, transformOrigin: '50% 55%' });
  nameEl.style.visibility = 'visible';
  G.timeline({ onComplete: settle })
    .fromTo('.name .c', { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .7, ease: 'power3.out', stagger: .03 }, .05)
    .to(nameEl, { scale: 1, duration: 1.25, ease: 'expo.inOut', onComplete: () => G.set(nameEl, { clearProps: 'transform' }) }, .4)
    .fromTo('.nav > *', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out', stagger: .06 }, 1.3)
    .fromTo('.tag', { opacity: 0, scale: .85 }, { opacity: 1, scale: 1, duration: .7, ease: 'back.out(2)' }, 1.35)
    .fromTo('.sub', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out' }, 1.45)
    // la pelota cae y queda como la "O"
    .add(startBall, 1.55);
};
Promise.race([document.fonts ? document.fonts.load('800 100px "Barlow Condensed"').then(() => document.fonts.ready) : Promise.resolve(), new Promise(r => setTimeout(r, 2500))]).then(intro, intro);

/* ---------- canvases ---------- */
const setupCanvas = (cv, draw) => {
  const ctx = cv.getContext('2d'); let W = 0, H = 0, running = false, last = 0;
  const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); new ResizeObserver(size).observe(cv);
  const loop = ts => { if (!running) return; draw(ctx, W, H, ts, Math.min(50, ts - last || 16)); last = ts; requestAnimationFrame(loop); };
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { running = e.isIntersecting && !RM; if (running) requestAnimationFrame(loop); })).observe(cv);
  draw(ctx, W, H, 0, 16, true);
};

/* ChanguitApp: pedidos que se conectan con alguien cerca */
(() => {
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
})();

/* Gloire Éternelle: mapa de hexágonos */
(() => {
  const cv = document.getElementById('cvMap');
  let grid = null, cap = null, own = new Set(), revolt = new Map(), acc = 0;
  const R = 17;
  const build = (W, H) => {
    grid = []; const w = Math.sqrt(3) * R, h = 1.5 * R, idx = {};
    for (let r = -1; r * h < H + R; r++) for (let q = -1; q * w < W + w; q++) { idx[r + ',' + q] = grid.length; grid.push({ x: q * w + (r & 1 ? w / 2 : 0), y: r * h, r, q, n: [] }); }
    grid.forEach(g => { const o = g.r & 1; [[0, -1], [0, 1], [-1, o - 1], [-1, o], [1, o - 1], [1, o]].forEach(([dr, dq]) => { const i = idx[(g.r + dr) + ',' + (g.q + dq)]; if (i !== undefined) g.n.push(i); }); });
    cap = grid.reduce((b, g, i) => Math.hypot(g.x - W * .45, g.y - H * .48) < Math.hypot(grid[b].x - W * .45, grid[b].y - H * .48) ? i : b, 0);
    own = new Set([cap]); revolt.clear();
  };
  const hex = (c, x, y, s) => { c.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); c.lineTo(x + s * Math.cos(a), y + s * Math.sin(a)); } c.closePath(); };
  const step = () => {
    const front = []; own.forEach(i => grid[i].n.forEach(j => { if (!own.has(j)) front.push(j); }));
    if (front.length) own.add(front[Math.floor(Math.random() * front.length)]);
    if (own.size > grid.length * .14 && Math.random() < .1) {
      const arr = [...own].filter(i => i !== cap), t = arr[Math.floor(Math.random() * arr.length)];
      revolt.set(t, 0); grid[t].n.forEach(j => { if (own.has(j) && j !== cap && Math.random() < .5) revolt.set(j, 0); });
    }
    if (own.size > grid.length * .5) build(cv.W, cv.H);
  };
  setupCanvas(cv, (c, W, H, ts, dt, still) => {
    if (!grid || cv.W !== W || cv.H !== H) { cv.W = W; cv.H = H; build(W, H); if (still) for (let i = 0; i < 60; i++) step(); }
    acc += dt; if (!still && acc > 180) { acc = 0; step(); }
    revolt.forEach((t, i) => { t += still ? 0 : dt; revolt.set(i, t); if (t > 2200) { revolt.delete(i); own.delete(i); } });
    c.clearRect(0, 0, W, H);
    grid.forEach((g, i) => {
      hex(c, g.x, g.y, R - 2);
      if (revolt.has(i)) { c.fillStyle = Math.floor(revolt.get(i) / 220) % 2 ? '#D2342C' : '#F0B7B3'; c.fill(); }
      else if (own.has(i)) { c.fillStyle = '#0B1630'; c.fill(); }
      else { c.strokeStyle = '#D0D5DE'; c.lineWidth = 1; c.stroke(); }
    });
    const g = grid[cap]; hex(c, g.x, g.y, R - 2); c.fillStyle = '#DDF35A'; c.fill();
  });
})();

/* copiar mail */
const toast = msg => { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2000); };
document.getElementById('copy').addEventListener('click', () => {
  const sel = () => { const r = document.createRange(); r.selectNodeContents(document.getElementById('mailv')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Mail seleccionado: copialo con Ctrl+C'); };
  try { navigator.clipboard.writeText('nicoatalah@gmail.com').then(() => toast('Mail copiado'), sel); } catch (e) { sel(); }
});
