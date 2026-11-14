/* =====================================================
   Our Story — shared script (landing + gallery)
   Put your photos in /images as photo1.jpg … photoN.jpg
   Optional music: put music.mp3 next to this file
   (without it, a soft built-in melody plays instead)
   ===================================================== */
const CONFIG = {
  photoCount: 12,          // how many photos you have
  photoPath: 'images/photo',
  photoExt: '.jpg',
  musicSrc: 'music.mp3',
  captions: ['Boss', 'my favorite gal', 'together', 'always you', 'sweet memory', 'Us',
             'pure magic', 'my person', 'golden hour', 'forever yours', 'home', 'my heart']
};

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const page = document.body.dataset.page;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Photos (with generated placeholders) ---------- */
function placeholder(i) {
  const hues = [['#f8d7da', '#c75a7c'], ['#fff6ea', '#d4a95b'], ['#f4b6c2', '#7a1c3b'], ['#f3d79a', '#b98a3e']];
  const [a, b] = hues[i % hues.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 210"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="200" height="210" fill="url(#g)"/><text x="100" y="115" font-size="64" text-anchor="middle" fill="#fff6ea" opacity=".85">♥</text><text x="100" y="160" font-size="14" text-anchor="middle" fill="#fff6ea" font-family="Georgia,serif" opacity=".9">add photo ${i + 1}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
function photoImg(i) {
  const idx = i % CONFIG.photoCount;
  const img = new Image();
  img.alt = 'Our memory ' + (idx + 1);
  img.loading = 'lazy';
  img.decoding = 'async';
  img.onerror = () => { img.onerror = null; img.src = placeholder(idx); };
  img.src = CONFIG.photoPath + (idx + 1) + CONFIG.photoExt;
  return img;
}

/* ---------- Background: hearts, sparkles, bokeh ---------- */
function initParticles() {
  const cv = $('#fx'), ctx = cv.getContext('2d');
  let w, h, dpr, parts = [];
  const COLORS = ['244,182,194', '248,215,218', '243,215,154', '232,98,138'];

  function heartPath(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * .3);
    ctx.bezierCurveTo(x, y - s * .2, x - s, y - s * .2, x - s, y + s * .3);
    ctx.bezierCurveTo(x - s, y + s * .8, x, y + s * .9, x, y + s * 1.2);
    ctx.bezierCurveTo(x, y + s * .9, x + s, y + s * .8, x + s, y + s * .3);
    ctx.bezierCurveTo(x + s, y - s * .2, x, y - s * .2, x, y + s * .3);
    ctx.fill();
  }
  function star(x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
  }
  function make(type, fresh) {
    const p = { type, x: rand(0, w), y: fresh ? rand(0, h) : h + rand(20, 120), ph: rand(0, 6.28), c: COLORS[(Math.random() * COLORS.length) | 0] };
    if (type === 'heart') Object.assign(p, { s: rand(5, 13), vy: rand(.25, .7), sway: rand(10, 30), a: rand(.25, .6) });
    if (type === 'spark') Object.assign(p, { r: rand(2, 6), vy: rand(.05, .25), tw: rand(.01, .035), c: '255,240,200', y: rand(0, h) });
    if (type === 'bokeh') Object.assign(p, { r: rand(20, 70), vy: rand(.08, .25), a: rand(.04, .12) });
    if (type === 'burst') Object.assign(p, { r: rand(2, 5), vx: rand(-2.5, 2.5), vy: rand(-3, .5), life: 1, c: '255,240,200' });
    return p;
  }
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const k = w < 700 ? .55 : 1;
    parts = [];
    for (let i = 0; i < 20 * k; i++) parts.push(make('heart', true));
    for (let i = 0; i < 34 * k; i++) parts.push(make('spark', true));
    for (let i = 0; i < 14 * k; i++) parts.push(make('bokeh', true));
  }
  let t = 0;
  function frame() {
    t++;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p.type === 'bokeh') {
        p.y -= p.vy; p.x += Math.sin(t / 200 + p.ph) * .15;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(${p.c},${p.a})`); g.addColorStop(.7, `rgba(${p.c},${p.a * .6})`); g.addColorStop(1, `rgba(${p.c},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        if (p.y < -p.r) { p.y = h + p.r; p.x = rand(0, w); }
      } else if (p.type === 'heart') {
        p.y -= p.vy; p.x += Math.sin(t / 60 + p.ph) * .4;
        ctx.fillStyle = `rgba(${p.c},${p.a * Math.min(1, p.y / 120)})`;
        heartPath(p.x, p.y, p.s);
        if (p.y < -30) Object.assign(p, make('heart', false));
      } else if (p.type === 'spark') {
        p.y -= p.vy; p.ph += p.tw;
        ctx.fillStyle = `rgba(${p.c},${Math.max(0, Math.sin(p.ph)) * .9})`;
        star(p.x, p.y, p.r);
        if (p.y < -10) { p.y = h + 10; p.x = rand(0, w); }
      } else {
        p.x += p.vx; p.y += p.vy; p.vy += .06; p.life -= .02;
        ctx.fillStyle = `rgba(${p.c},${Math.max(p.life, 0)})`; star(p.x, p.y, p.r * 1.4);
        if (p.life <= 0) parts.splice(i, 1);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }
  resize(); frame();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
  // tap/click = little burst of sparkles
  addEventListener('pointerdown', e => { for (let i = 0; i < 14; i++) { const b = make('burst'); b.x = e.clientX; b.y = e.clientY; parts.push(b); } });
}

/* ---------- Music (mp3 if present, otherwise soft synth) ---------- */
const Music = (() => {
  const KEY = 'loveMusic', TKEY = 'loveMusicTime';
  let audio, ac, master, timer, step = 0, synth = false, on = false;
  const btn = () => $('#musicBtn');
  const render = () => btn() && btn().classList.toggle('playing', on);

  function startSynth() {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    if (!master) { master = ac.createGain(); master.gain.value = .16; master.connect(ac.destination); }
    // Am – F – C – G, gentle arpeggios
    const chords = [[220, 261.6, 329.6, 440], [174.6, 220, 261.6, 349.2], [261.6, 329.6, 392, 523.3], [196, 246.9, 293.7, 392]];
    clearInterval(timer);
    timer = setInterval(() => {
      const chord = chords[(step / 8 | 0) % 4], f = chord[[0, 1, 2, 3, 2, 1, 3, 2][step % 8]] * (step % 8 === 0 ? .5 : 1);
      note(f, 2.6); if (step % 8 === 0) { note(chord[0] / 2, 4); note(chord[2], 4); }
      step++;
    }, 520);
  }
  function note(f, d) {
    const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.35, t + .04); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .1);
  }
  function stopSynth() { clearInterval(timer); if (ac && ac.state === 'running') ac.suspend(); }

  async function play() {
    on = true; render(); localStorage.setItem(KEY, 'on');
    if (synth) return startSynth();
    try { await audio.play(); }
    catch (e) { if (e.name === 'NotAllowedError') { on = false; render(); return false; } synth = true; startSynth(); }
    return true;
  }
  function pause() {
    on = false; render(); localStorage.setItem(KEY, 'off');
    synth ? stopSynth() : audio.pause();
  }
  function toggle() { on ? pause() : play(); }

  function init() {
    audio = new Audio(CONFIG.musicSrc); audio.loop = true; audio.volume = .55; audio.preload = 'auto';
    audio.addEventListener('error', () => { synth = true; if (on) startSynth(); });
    const saved = parseFloat(sessionStorage.getItem(TKEY));
    if (saved) audio.addEventListener('loadedmetadata', () => { try { audio.currentTime = saved; } catch (e) {} }, { once: true });
    btn() && btn().addEventListener('click', e => { e.stopPropagation(); toggle(); });
    addEventListener('pagehide', () => sessionStorage.setItem(TKEY, audio.currentTime || 0));

    // Resume where the other page left off; browsers may block until the first interaction.
    const pref = localStorage.getItem(KEY);
    const begin = () => { if (localStorage.getItem(KEY) !== 'off' && !on) play(); };
    if (pref === 'on') play().then(ok => { if (ok === false) armed(); });
    else if (pref === null) armed();
    function armed() {
      ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, function h(e) {
        if (e.target.closest && e.target.closest('#musicBtn')) return;
        ['pointerdown', 'keydown', 'touchstart'].forEach(x => removeEventListener(x, h, true));
        begin();
      }, true));
    }
  }
  return { init, play };
})();

/* ---------- Page transitions ---------- */
function initTransitions() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-go]');
    if (!a) return;
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(() => { location.href = a.href; }, 850);
  });
  addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('leaving'); });
}

/* ---------- Typewriter + reveal ---------- */
function typeWrite(el, text, speed = 60) {
  return new Promise(res => {
    el.textContent = ''; el.classList.add('typing');
    let i = 0;
    (function tick() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, speed + rand(0, 35));
      else { setTimeout(() => el.classList.remove('typing'), 1400); res(); }
    })();
  });
}
function initReveals() {
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target; io.unobserve(el);
    if (el.classList.contains('reveal')) el.classList.add('in');
    if (el.dataset.text && el.classList.contains('type')) typeWrite(el, el.dataset.text);
  }), { threshold: .45 });
  $$('.reveal, .type').forEach(el => io.observe(el));
}

/* ---------- Landing page ---------- */
function initLanding() {
  const t = $('#title'), txt = t.textContent;
  t.textContent = '';
  [...txt].forEach((ch, i) => {
    const s = document.createElement('span');
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    s.style.animationDelay = (1.6 + i * .11) + 's';
    t.appendChild(s);
  });
  const tag = $('#tagline');
  setTimeout(() => typeWrite(tag, tag.dataset.text, 55), +tag.dataset.delay);
}

/* ---------- Gallery: floating parallax photos ---------- */
let fps = [];
function buildFloatingPhotos() {
  const field = $('#photoField'), main = $('#gallery');
  field.innerHTML = '';
  const H = main.scrollHeight, W = innerWidth, small = W < 700;
  const n = small ? 16 : 28;
  fps = [];
  for (let i = 0; i < n; i++) {
    const depth = rand(.25, 1);                         // 1 = near, .25 = far
    const size = (small ? rand(86, 130) : rand(120, 230)) * (.55 + depth * .6);
    const top = ((i + rand(0, 1)) / n) * (H - size * 1.3);
    const left = rand(-size * .1, W - size * .9);
    const fp = document.createElement('div'); fp.className = 'fp';
    fp.style.cssText = `width:${size}px;left:${left}px;top:${top}px;z-index:${Math.round(depth * 10)}`;
    const inn = document.createElement('div'); inn.className = 'fp-in';
    inn.style.setProperty('--r0', rand(-30, 30) + 'deg');
    const fr = document.createElement('div'); fr.className = 'frame';
    fr.style.cssText = `--rot:${rand(-10, 10)}deg;--dur:${rand(6, 12)}s;--fdur:${rand(8, 16)}s;--del:${-rand(0, 10)}s;--o:${(.35 + depth * .6).toFixed(2)};--blur:${((1 - depth) * 2.4).toFixed(1)}px`;
    fr.appendChild(photoImg(i));
    inn.appendChild(fr); fp.appendChild(inn); field.appendChild(fp);
    fps.push({ el: fp, base: top + size * .6, f: (depth - .55) * .55 });
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  fps.forEach(p => io.observe(p.el));
  onScroll();
}
function onScroll() {
  const y = scrollY, vh = innerHeight, mid = y + vh / 2;
  if (!reduceMotion) for (const p of fps) {
    const dist = mid - p.base;
    if (Math.abs(dist) < vh * 1.6) p.el.style.transform = `translate3d(0,${(dist * p.f).toFixed(1)}px,0)`;
  }
  const bar = $('#progress');
  if (bar) bar.style.width = (y / Math.max(1, document.documentElement.scrollHeight - vh) * 100) + '%';
}

/* ---------- Gallery: vintage camera ejecting polaroids ---------- */
function initCamera() {
  const stage = $('#stage'), cam = $('#camera'), flash = $('#flash'), section = $('#cameraSection');
  let count = 0, busy = false;
  const MAX = 16, SLOT = 69 / 260; // slot position within the camera svg

  function eject() {
    if (count >= MAX) { $$('.polaroid', stage).slice(0, 4).forEach(p => p.remove()); count -= 4; }
    const sr = stage.getBoundingClientRect(), cr = cam.getBoundingClientRect();
    const pw = Math.max(96, cr.width * .5), ph = pw * 1.2 + 34;
    const slotY = cr.top - sr.top + cr.height * SLOT;
    const el = document.createElement('div'); el.className = 'polaroid';
    el.style.width = pw + 'px'; el.style.left = (cr.left - sr.left + cr.width / 2) + 'px'; el.style.top = slotY + 'px';
    el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px'); el.style.setProperty('--r', '0deg');
    const inn = document.createElement('div'); inn.className = 'pol-in';
    inn.appendChild(photoImg(count + 3));
    const cap = document.createElement('span'); cap.textContent = CONFIG.captions[count % CONFIG.captions.length];
    inn.appendChild(cap); el.appendChild(inn); stage.appendChild(el);
    const k = count++;

    // flash + shake
    flash.classList.remove('go'); cam.classList.remove('shoot'); void flash.offsetWidth;
    flash.classList.add('go'); cam.classList.add('shoot');

    // 1) slide partway out of the slot, like a developing Polaroid
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.setProperty('--t', '1.5s'); el.style.setProperty('--ty', (-ph * .62) + 'px');
    }));
    // 2) fly out and spread across the screen
    setTimeout(() => {
      const cols = 5, range = sr.width / 2 - pw / 2 - 6;
      const tx = (((k % cols) + rand(.1, .9)) / cols * 2 - 1) * range;
      const room = slotY - 14 - ph * 1.1;
      const row = ((k / cols) | 0) % 3;
      const ty = -ph * 1.1 - Math.max(0, room) * ((row + rand(0, 1)) / 3);
      el.style.setProperty('--t', '1.6s');
      el.style.setProperty('--tx', tx + 'px'); el.style.setProperty('--ty', ty + 'px'); el.style.setProperty('--r', rand(-16, 16) + 'deg');
      setTimeout(() => el.classList.add('out'), 1500);
    }, 1700);
  }
  function burst(n) {
    if (busy) return; busy = true;
    let i = 0;
    (function next() { eject(); if (++i < n) setTimeout(next, 1100); else setTimeout(() => busy = false, 1500); })();
  }
  let fired = false;
  new IntersectionObserver((es, io) => { if (es[0].isIntersecting && !fired) { fired = true; setTimeout(() => burst(6), 700); io.disconnect(); } }, { threshold: .5 }).observe(stage);
  $('#shootBtn').addEventListener('click', () => burst(2));
  cam.addEventListener('click', () => burst(1));
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initParticles(); Music.init(); initTransitions();
  if (page === 'landing') initLanding();
  if (page === 'gallery') initReveals();
});
addEventListener('load', () => {
  if (page !== 'gallery') return;
  buildFloatingPhotos(); initCamera();
  let last = innerWidth, rt;
  addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (innerWidth !== last) { last = innerWidth; buildFloatingPhotos(); } }, 250); });
});
