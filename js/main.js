/* ============================================================
   ZX-Code Showcase · main.js
   Single-page · warm editorial system · hash routing · particle theme switch
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- THEME SYNC (bfcache-safe) ---------- */
  function syncTheme() {
    try {
      var t = localStorage.getItem('zx-theme');
      if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
    } catch (e) {}
  }
  syncTheme();
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) syncTheme();
  });

  /* ---------- SINGLE-PAGE ROUTING ---------- */
  const PAGES = ['home', 'features', 'workflow', 'compare', 'developer'];

  function pageIdFromHash() {
    let h = (location.hash || '').replace(/^#/, '');
    return PAGES.indexOf(h) >= 0 ? h : 'home';
  }

  function updateNavActive(id) {
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach((a) => {
      const p = a.getAttribute('data-page');
      a.classList.toggle('is-active', p === id);
    });
  }

  /* persistent observers (re-used across page switches) */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-count'), 10);
        animateCount(entry.target, target);
        countIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  function revealPageEnter(container) {
    const els = container.querySelectorAll('.page-enter');
    els.forEach((el) => el.classList.remove('is-in'));
    // force reflow so transition replays
    void container.offsetWidth;
    els.forEach((el, i) => {
      setTimeout(() => el.classList.add('is-in'), i * 55);
    });
  }

  function armReveal(container) {
    container.querySelectorAll('.reveal').forEach((el) => {
      el.classList.remove('is-visible');
      revealIO.observe(el);
    });
    container.querySelectorAll('[data-count]').forEach((el) => {
      el.textContent = '0';
      countIO.observe(el);
    });
  }

  function activatePage(id, opts) {
    opts = opts || {};
    let target = document.querySelector('.page[data-page-id="' + id + '"]');
    if (!target) { id = 'home'; target = document.querySelector('.page[data-page-id="home"]'); }

    document.querySelectorAll('.page').forEach((p) => {
      p.hidden = (p !== target);
    });

    updateNavActive(id);
    window.scrollTo(0, 0);

    // re-trigger entrance animations for the newly shown page
    revealPageEnter(target);
    armReveal(target);

    // close mobile menu if open
    const mm = document.getElementById('mobileMenu');
    const burger = document.getElementById('navBurger');
    if (mm) mm.classList.remove('is-open');
    if (burger) burger.classList.remove('is-open');
  }

  // intercept in-page navigation links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-page]');
    if (!a) return;
    const id = a.getAttribute('data-page');
    if (PAGES.indexOf(id) < 0) return;
    e.preventDefault();
    if (location.hash === '#' + id) {
      // same page: just scroll top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    location.hash = '#' + id; // triggers hashchange
  });

  window.addEventListener('hashchange', () => {
    activatePage(pageIdFromHash());
  });

  // initial route
  activatePage(pageIdFromHash());

  /* ---------- LOADER (fast) ---------- */
  const loader = document.getElementById('loader');
  const isFirstVisit = !sessionStorage.getItem('zx-visited');

  function hideLoader() {
    if (loader) loader.classList.add('is-done');
  }

  if (isFirstVisit) {
    sessionStorage.setItem('zx-visited', '1');
    window.addEventListener('load', () => {
      setTimeout(hideLoader, 680);
    });
    setTimeout(hideLoader, 2200);
  } else {
    hideLoader();
  }

  /* ---------- CUSTOM CURSOR ---------- */
  if (!isTouch) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let dx = mx, dy = my;

    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('mousedown', () => ring && ring.classList.add('is-down'));
    document.addEventListener('mouseup', () => ring && ring.classList.remove('is-down'));

    function tickCursor() {
      dx += (mx - dx) * 0.6;
      dy += (my - dy) * 0.6;
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (dot) dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(tickCursor);
    }
    tickCursor();

    function bindHover() {
      document.querySelectorAll('a, button, [data-cursor="hover"]').forEach((el) => {
        if (el.__zxhover) return;
        el.__zxhover = true;
        el.addEventListener('mouseenter', () => ring && ring.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => ring && ring.classList.remove('is-hover'));
      });
    }
    bindHover();
  }

  /* ---------- NAV SCROLL STATE ---------- */
  const nav = document.getElementById('nav');
  function onScroll() {
    const s = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('is-scrolled', s > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE MENU ---------- */
  const burger = document.getElementById('navBurger');
  const mm = document.getElementById('mobileMenu');
  if (burger && mm) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('is-open');
      mm.classList.toggle('is-open');
    });
  }

  /* ---------- COUNT-UP ---------- */
  function animateCount(el, target, duration = 1.5) {
    const startTime = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    function step(now) {
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(1, elapsed / duration);
      el.textContent = Math.round(target * ease(t)).toString();
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(step);
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      const strength = 0.32;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ---------- HERO PARALLAX (mouse) ---------- */
  if (!isTouch && !prefersReducedMotion) {
    const hero = document.querySelector('.hero');
    const heroVisual = document.querySelector('.hero-visual');
    if (hero && heroVisual) {
      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        heroVisual.style.transform = `translate(${x * -10}px, ${y * -10}px) scale(1.01)`;
      });
      hero.addEventListener('mouseleave', () => {
        heroVisual.style.transform = '';
      });
    }
  }

  /* ============================================================
     THEME TOGGLE · particle burst -> reassemble
     ============================================================ */
  const themeBtn = document.getElementById('themeToggle');
  const pCanvas = document.getElementById('particleCanvas');

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  function applyTheme(t, persist) {
    if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    if (persist) {
      try { localStorage.setItem('zx-theme', t); } catch (e) {}
    }
  }

  function brandPalette() {
    const cs = getComputedStyle(document.documentElement);
    const pick = (n, fb) => {
      const v = cs.getPropertyValue(n).trim();
      return v || fb;
    };
    return [
      pick('--brand', '#b8542f'),
      pick('--brand-deep', '#8c3a1b'),
      pick('--brand-bright', '#d5663c'),
      pick('--ink', '#181612'),
      '#e8a06a'
    ];
  }

  let burstRunning = false;
  function particleBurst(originX, originY, onPeak) {
    if (!pCanvas) { if (onPeak) onPeak(); return; }
    const ctx = pCanvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    pCanvas.width = W * dpr;
    pCanvas.height = H * dpr;
    pCanvas.style.width = W + 'px';
    pCanvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    pCanvas.classList.add('is-active');
    const palette = brandPalette();

    const maxR = Math.hypot(Math.max(originX, W - originX), Math.max(originY, H - originY)) + 40;

    const COUNT = 220;
    const parts = [];
    for (let i = 0; i < COUNT; i++) {
      const ang = (i / COUNT) * Math.PI * 2 + Math.random() * 0.18;
      const distJitter = 0.55 + Math.random() * 0.6;
      parts.push({
        ang,
        distMul: distJitter,
        r: 1.2 + Math.random() * 3.2,
        color: palette[(Math.random() * palette.length) | 0],
        spin: (Math.random() - 0.5) * 0.04,
        wobble: Math.random() * Math.PI * 2
      });
    }

    const DURATION = 820;
    const start = performance.now();
    let peaked = false;
    burstRunning = true;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    function frame(now) {
      const t = Math.min(1, (now - start) / DURATION);
      ctx.clearRect(0, 0, W, H);

      let coverage;
      if (t < 0.5) {
        coverage = easeOutCubic(t / 0.5);
      } else {
        coverage = 1 - easeInOutCubic((t - 0.5) / 0.5);
      }

      let gAlpha;
      if (t < 0.12) gAlpha = t / 0.12;
      else if (t > 0.82) gAlpha = 1 - (t - 0.82) / 0.18;
      else gAlpha = 1;
      gAlpha = Math.max(0, Math.min(1, gAlpha));

      ctx.globalAlpha = gAlpha;

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.wobble += 0.18;
        const wobbleAmt = Math.sin(p.wobble) * 6 * coverage;
        const rad = coverage * maxR * p.distMul;
        const a = p.ang + p.spin * t * 30;
        const x = originX + Math.cos(a) * rad + Math.cos(p.wobble) * wobbleAmt;
        const y = originY + Math.sin(a) * rad + Math.sin(p.wobble) * wobbleAmt;
        const rad2 = p.r * (0.6 + coverage * 0.9);

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(x, y, rad2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (t < 0.5) {
        const glowR = 30 + coverage * 80;
        const g = ctx.createRadialGradient(originX, originY, 0, originX, originY, glowR);
        g.addColorStop(0, 'rgba(255,255,255,0.5)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(originX, originY, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (!peaked && t >= 0.46) {
        peaked = true;
        if (onPeak) onPeak();
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, W, H);
        pCanvas.classList.remove('is-active');
        burstRunning = false;
      }
    }
    requestAnimationFrame(frame);
  }

  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    if (prefersReducedMotion || !pCanvas || burstRunning) {
      applyTheme(next, true);
      return;
    }
    let ox = window.innerWidth / 2, oy = window.innerHeight / 2;
    if (themeBtn) {
      const r = themeBtn.getBoundingClientRect();
      ox = r.left + r.width / 2;
      oy = r.top + r.height / 2;
    }
    particleBurst(ox, oy, () => applyTheme(next, true));
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  window.addEventListener('resize', () => {
    if (pCanvas && !burstRunning) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      pCanvas.width = window.innerWidth * dpr;
      pCanvas.height = window.innerHeight * dpr;
      pCanvas.style.width = window.innerWidth + 'px';
      pCanvas.style.height = window.innerHeight + 'px';
    }
  });

})();
