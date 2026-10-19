(function () {
  'use strict';

  const PROJECTS = [
    { n: '01', title: { it: 'Video intervista', en: 'Video interview' }, client: 'Amplia Infrastructures',
      disc: { it: 'Motion graphics · Video', en: 'Motion graphics · Video' }, year: '2026',
      role: { it: 'Riprese, montaggio, motion graphics', en: 'Filming, editing, motion graphics' },
      desc: { it: 'Interviste riprese, editate e montate presso i cantieri di Amplia Infrastructures: dalla ripresa sul campo al montaggio finale, con titolazioni e grafiche animate.',
              en: "Interviews filmed, edited and cut on Amplia Infrastructures' construction sites: from on-site shooting to final edit, with animated titles and graphics." },
      video: 'assets/amplia-intervista.mp4', images: [] },
    { n: '02', title: { it: 'Presentazione Artner', en: 'Artner presentation' }, client: 'OkOne',
      disc: { it: 'Motion graphics', en: 'Motion graphics' }, year: '2025',
      role: { it: 'Motion design, montaggio', en: 'Motion design, editing' },
      desc: { it: 'Video di presentazione in motion graphics per Artner, realizzato per OkOne.',
              en: 'Motion graphics presentation video for Artner, produced for OkOne.' },
      video: 'assets/artner.mp4', images: [] },
    { n: '03', title: { it: 'Branding Goliosi', en: 'Goliosi branding' }, client: 'Goliosi',
      disc: { it: 'Branding · Piattaforma digitale', en: 'Branding · Digital platform' }, year: '2022',
      role: { it: 'Identità visiva, applicazioni', en: 'Visual identity, applications' },
      desc: { it: "Branding per una piattaforma digitale sull'oleocultura. Il marchio unisce la formella — il passaggio da un'epoca all'altra — il quadrato della piattaforma digitale e quattro olive: cultura, innovazione, tradizione e community.",
              en: "Branding for a digital platform about olive-oil culture. The mark combines the 'formella' — the shift from one era to the next — the square of the digital platform, and four olives: culture, innovation, tradition and community." },
      video: null, images: [
        { src: 'assets/goliosi-logo.jpg', alt: 'Goliosi — logo' },
        { src: 'assets/goliosi-sistema.jpg', alt: 'Goliosi — costruzione del marchio' },
        { src: 'assets/goliosi-mockup.jpg', alt: 'Goliosi — applicazioni' }] },
    { n: '04', title: { it: 'Compositing Oculus', en: 'Oculus compositing' }, client: 'Oculus',
      disc: { it: 'Photoshop · Compositing', en: 'Photoshop · Compositing' }, year: '2022',
      role: { it: 'Compositing, fotoritocco', en: 'Compositing, retouching' },
      desc: { it: 'Compositing digitale per sponsorizzare il visore Oculus utilizzando immagini da fonti diverse.',
              en: 'Digital compositing to promote the Oculus headset, combining images from different sources.' },
      video: null, images: [
        { src: 'assets/oculus-cover.jpg', alt: 'Compositing Oculus — tavola di presentazione' },
        { src: 'assets/oculus-finale.jpg', alt: 'Compositing Oculus — immagine finale' },
        { src: 'assets/oculus-costruzione.jpg', alt: 'Compositing Oculus — costruzione del soggetto' }] },
    { n: '05', title: { it: 'Reel AudioFactory', en: 'AudioFactory reel' }, client: 'AudioFactory',
      disc: { it: 'Social media · Motion 3D', en: 'Social media · 3D motion' }, year: '2024',
      role: { it: 'Modellazione 3D, animazione', en: '3D modelling, animation' },
      desc: { it: 'Reel animato per il brand AudioFactory. Il modello è stato ricreato in 3D dalle schematiche 2D e poi importato su After Effects per creare un reel promozionale per i canali social.',
              en: 'Animated reel for the AudioFactory brand. The model was rebuilt in 3D from 2D schematics, then brought into After Effects to create a promotional reel for social channels.' },
      video: 'assets/audiofactory-reel.mp4', vertical: true, images: [] }
  ];

  const LABELS = {
    it: { close: 'Chiudi', client: 'Cliente', disc: 'Disciplina', year: 'Anno', role: 'Ruolo', next: 'Prossimo progetto' },
    en: { close: 'Close', client: 'Client', disc: 'Discipline', year: 'Year', role: 'Role', next: 'Next project' }
  };

  const root = document.documentElement;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const reducedMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lang = 'it';
  let openIndex = null; // 1-based project number, or null

  // ---------- Helpers ----------
  function tween(set, from, to, dur, done) {
    const t0 = performance.now();
    const ease = x => 1 - Math.pow(1 - x, 3);
    const f = now => {
      const k = Math.min(1, (now - t0) / dur);
      set(from + (to - from) * ease(k));
      if (k < 1) requestAnimationFrame(f); else if (done) done();
    };
    requestAnimationFrame(f);
  }

  // ---------- Language ----------
  function setLang(next) {
    lang = next;
    root.lang = next;
    root.dataset.lang = next;
    $$('[data-set-lang]').forEach(b => b.classList.toggle('is-active', b.dataset.setLang === next));
    try { localStorage.setItem('mc-lang', next); } catch (e) { /* storage unavailable */ }
    if (openIndex) renderOverlay();
    fit();
  }
  $$('[data-set-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.setLang)));

  // ---------- Fit "Campitelli" to the full width ----------
  function fit() {
    $$('[data-fit]').forEach(el => {
      el.style.fontSize = '100px';
      const w = el.getBoundingClientRect().width;
      const avail = el.parentElement.clientWidth;
      if (w) el.style.fontSize = (100 * avail / w) + 'px';
    });
  }
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit).catch(() => {});

  // ---------- Smooth anchor scrolling ----------
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const t = id && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    const se = document.scrollingElement || document.documentElement;
    const to = t.getBoundingClientRect().top + se.scrollTop - (id === 'top' ? 0 : 72);
    if (reducedMotion) { se.scrollTop = to; return; }
    tween(v => { se.scrollTop = v; }, se.scrollTop, to, 800);
  });

  // ---------- Scroll reveal ----------
  function setupReveal() {
    if (reducedMotion) return;
    const ease = 'cubic-bezier(.2,.7,.2,1)';
    let pending = $$('[data-reveal]').map(el => {
      const line = el.dataset.reveal === 'line';
      el.style.transition = `opacity 1s ${ease}, transform ${line ? 1.2 : 1}s ${ease}`;
      el.style.transitionDelay = (el.dataset.delay || 0) + 'ms';
      el.style.transform = line ? 'translateY(105%)' : 'translateY(48px)';
      if (!line) el.style.opacity = '0';
      return { el, target: line ? el.parentElement : el };
    });
    const check = () => {
      const h = window.innerHeight || document.documentElement.clientHeight;
      pending = pending.filter(({ el, target }) => {
        if (target.getBoundingClientRect().top < h * 0.94) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          return false;
        }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener('scroll', check, true);
        window.removeEventListener('resize', check);
      }
    };
    window.addEventListener('scroll', check, { passive: true, capture: true });
    window.addEventListener('resize', check);
    requestAnimationFrame(() => requestAnimationFrame(check));
    setTimeout(check, 300);
  }

  // ---------- Cards: hover preview + open ----------
  $$('article[data-project]').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const v = card.querySelector('video');
      if (!v) return;
      if (!v.getAttribute('src') && v.dataset.src) v.src = v.dataset.src;
      v.muted = true;
      v.play().catch(() => {});
    });
    card.addEventListener('mouseleave', () => {
      const v = card.querySelector('video');
      if (v) v.pause();
    });
    card.addEventListener('click', () => openProject(Number(card.dataset.project)));
  });

  // ---------- Carousel ----------
  const track = $('#track');
  const prevBtn = $('#car-prev');
  const nextBtn = $('#car-next');
  const posEl = $('#car-pos');
  let car = 0;

  const stepSize = () => {
    const c = track.querySelector('article');
    return (c ? c.offsetWidth : track.clientWidth) + (parseFloat(getComputedStyle(track).columnGap) || 0);
  };
  const restoreSnap = () => { track.style.scrollSnapType = 'x mandatory'; updateCarousel(); };

  function updateCarousel() {
    const cards = $$('article', track);
    const max = track.scrollWidth - track.clientWidth;
    const padL = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    let i = 0, best = Infinity;
    cards.forEach((c, k) => {
      const d = Math.abs(c.offsetLeft - track.offsetLeft - track.scrollLeft - padL);
      if (d < best) { best = d; i = k; }
    });
    if (track.scrollLeft >= max - 4) i = cards.length - 1;
    car = i;
    posEl.textContent = '0' + (i + 1);
    prevBtn.classList.toggle('is-dim', track.scrollLeft <= 4);
    nextBtn.classList.toggle('is-dim', track.scrollLeft >= max - 4);
  }

  function carStep(dir) {
    const max = track.scrollWidth - track.clientWidth;
    const target = Math.max(0, Math.min(max, (car + dir) * stepSize()));
    track.style.scrollSnapType = 'none';
    tween(v => { track.scrollLeft = v; }, track.scrollLeft, target, 550, restoreSnap);
  }
  prevBtn.addEventListener('click', () => carStep(-1));
  nextBtn.addEventListener('click', () => carStep(1));
  track.addEventListener('scroll', updateCarousel, { passive: true });
  window.addEventListener('resize', updateCarousel);

  // Mouse drag to scroll
  (function setupDrag() {
    let down = false, moved = false, x0 = 0, s0 = 0;
    track.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      down = true; moved = false; x0 = e.clientX; s0 = track.scrollLeft;
      track.style.scrollSnapType = 'none';
      track.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', e => {
      if (!down) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 5) moved = true;
      track.scrollLeft = s0 - dx;
    });
    window.addEventListener('mouseup', e => {
      if (!down) return;
      down = false;
      track.style.cursor = 'grab';
      const st = stepSize(), max = track.scrollWidth - track.clientWidth, dx = e.clientX - x0;
      let i = Math.round(track.scrollLeft / st);
      const i0 = Math.round(s0 / st);
      if (i === i0 && Math.abs(dx) > 50) i += dx < 0 ? 1 : -1;
      const target = Math.max(0, Math.min(max, i * st));
      tween(v => { track.scrollLeft = v; }, track.scrollLeft, target, 450, restoreSnap);
    });
    // A drag should not count as a click on a card
    track.addEventListener('click', e => {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);
    track.addEventListener('dragstart', e => e.preventDefault());
  })();

  // ---------- Custom cursor ----------
  function setupCursor() {
    if (!window.matchMedia || matchMedia('(pointer: coarse)').matches || !matchMedia('(hover: hover)').matches) return;
    const c = $('#cursor');
    root.classList.add('has-cursor');
    let x = -100, y = -100, cx = -100, cy = -100, s = 0.14, ts = 0.14;
    window.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; c.style.opacity = '1'; });
    document.addEventListener('mouseover', e => {
      const card = e.target.closest && e.target.closest('[data-cursor]');
      const link = e.target.closest && e.target.closest('a,button');
      if (card && !openIndex) ts = 1;
      else ts = link ? 0.42 : 0.14;
    });
    document.addEventListener('mouseleave', () => { c.style.opacity = '0'; });
    const tick = () => {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; s += (ts - s) * 0.18;
      c.style.transform = `translate(${cx}px,${cy}px) scale(${s})`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  // ---------- Project overlay ----------
  const overlay = $('#overlay');

  function renderOverlay() {
    const p = PROJECTS[openIndex - 1];
    const next = PROJECTS[openIndex % PROJECTS.length];
    const L = LABELS[lang];
    $$('[data-l]', overlay).forEach(el => { el.textContent = L[el.dataset.l]; });
    $('#ov-n').textContent = p.n;
    $('#ov-title').textContent = p.title[lang];
    $('#ov-client').textContent = p.client;
    $('#ov-disc').textContent = p.disc[lang];
    $('#ov-year').textContent = p.year;
    $('#ov-role').textContent = p.role[lang];
    $('#ov-desc').textContent = p.desc[lang];
    $('#ov-next-title').textContent = next.title[lang];
  }

  function renderMedia() {
    const p = PROJECTS[openIndex - 1];
    const media = $('#ov-media');
    media.textContent = '';
    if (p.video) {
      const v = document.createElement('video');
      v.src = p.video;
      v.controls = true;
      v.playsInline = true;
      if (p.vertical) v.classList.add('is-vertical');
      media.appendChild(v);
      v.play().catch(() => {});
    } else {
      p.images.forEach(im => {
        const img = document.createElement('img');
        img.src = im.src;
        img.alt = im.alt;
        img.loading = 'lazy';
        media.appendChild(img);
      });
    }
  }

  function openProject(n) {
    $$('article video').forEach(v => v.pause());
    document.body.style.overflow = 'hidden';
    openIndex = n;
    overlay.hidden = false;
    renderOverlay();
    renderMedia();
    overlay.scrollTop = 0;
  }

  function closeProject() {
    if (!openIndex) return;
    const v = $('#ov-media video');
    if (v) v.pause();
    $('#ov-media').textContent = '';
    overlay.hidden = true;
    document.body.style.overflow = '';
    openIndex = null;
  }

  $('#ov-close').addEventListener('click', closeProject);
  $('#ov-next').addEventListener('click', () => openProject((openIndex % PROJECTS.length) + 1));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeProject(); });

  // ---------- Init ----------
  let saved = null;
  try { saved = localStorage.getItem('mc-lang'); } catch (e) { /* storage unavailable */ }
  setLang(saved === 'en' ? 'en' : 'it');
  setupReveal();
  updateCarousel();
  setupCursor();
})();
