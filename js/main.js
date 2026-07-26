/* ============================================================
   ZX-Code Showcase · main.js
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- LOADER ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('is-done');
      startHeroIntro();
    }, 1400);
  });

  /* ---------- LENIS SMOOTH SCROLL ---------- */
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Anchor links
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -60, duration: 1.4 });
            // close mobile menu
            const mm = document.getElementById('mobileMenu');
            const burger = document.getElementById('navBurger');
            if (mm) mm.classList.remove('is-open');
            if (burger) burger.classList.remove('is-open');
          }
        }
      });
    });
  }

  /* ---------- GSAP + ScrollTrigger ---------- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------- CUSTOM CURSOR ---------- */
  if (!isTouch) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let dx = mx, dy = my;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
    });
    document.addEventListener('mousedown', () => ring && ring.classList.add('is-down'));
    document.addEventListener('mouseup', () => ring && ring.classList.remove('is-down'));

    function tickCursor() {
      dx += (mx - dx) * 0.6;
      dy += (my - dy) * 0.6;
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      if (dot) {
        dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      }
      if (ring) {
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      }
      requestAnimationFrame(tickCursor);
    }
    tickCursor();

    // Hover state
    document.querySelectorAll('[data-cursor="hover"], a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => ring && ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring && ring.classList.remove('is-hover'));
    });
  }

  /* ---------- SCROLL PROGRESS + NAV STATE ---------- */
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');

  function onScrollUpdate() {
    const h = document.documentElement;
    const scrolled = h.scrollTop || document.body.scrollTop;
    const total = h.scrollHeight - h.clientHeight;
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    if (progress) progress.style.width = pct + '%';

    if (nav) {
      if (scrolled > 30) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', onScrollUpdate, { passive: true });
  onScrollUpdate();

  /* ---------- MOBILE MENU ---------- */
  const burger = document.getElementById('navBurger');
  const mm = document.getElementById('mobileMenu');
  if (burger && mm) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('is-open');
      mm.classList.toggle('is-open');
    });
  }

  /* ---------- HERO PARTICLES ---------- */
  const particlesContainer = document.getElementById('heroParticles');
  if (particlesContainer && !prefersReducedMotion) {
    const COUNT = isTouch ? 18 : 38;
    const particles = [];
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 3 + 1;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.opacity = (Math.random() * 0.5 + 0.2).toString();
      const colors = ['rgba(255,255,255,0.7)', 'rgba(124,92,255,0.7)', 'rgba(6,182,212,0.7)', 'rgba(245,158,11,0.7)'];
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      particlesContainer.appendChild(p);
      particles.push({
        el: p,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        baseOpacity: parseFloat(p.style.opacity),
      });
    }

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
    });

    function tickParticles() {
      const w = particlesContainer.offsetWidth;
      const h = particlesContainer.offsetHeight;
      particles.forEach((p) => {
        // Parallax pull towards mouse
        const dx = mouseX - (p.x + w * 0.0);
        const dy = mouseY - (p.y + h * 0.0);
        p.vx += dx * 0.00002;
        p.vy += dy * 0.00002;
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        p.el.style.transform = `translate3d(${p.x - w / 2}px, ${p.y - h / 2}px, 0)`;
      });
      requestAnimationFrame(tickParticles);
    }
    // Init positions relative to center
    particles.forEach((p) => {
      p.x = Math.random() * particlesContainer.offsetWidth;
      p.y = Math.random() * particlesContainer.offsetHeight;
    });
    tickParticles();
  }

  /* ---------- HERO PARALLAX (mouse) ---------- */
  if (!isTouch && !prefersReducedMotion) {
    const heroGlows = document.querySelectorAll('.hero-glow');
    const heroGrid = document.querySelector('.hero-grid');
    const heroContent = document.querySelector('.hero-content');
    document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      if (heroGrid) heroGrid.style.transform = `perspective(800px) rotateX(${60 + y * 6}deg) translateY(${20 + y * 10}px) translateX(${-x * 20}px)`;
      heroGlows.forEach((g, i) => {
        const factor = (i + 1) * 18;
        g.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
      if (heroContent) heroContent.style.transform = `translate(${x * -6}px, ${y * -6}px)`;
    });
  }

  /* ---------- HERO INTRO ANIMATION ---------- */
  function startHeroIntro() {
    if (typeof gsap === 'undefined' || prefersReducedMotion) {
      // Fallback: just show everything
      document.querySelectorAll('.hero .mask-text').forEach((el) => {
        el.style.transform = 'translateY(0)';
      });
      document.querySelectorAll('.hero .reveal-up').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.hero-title .mask-text', {
      y: 0,
      duration: 1.2,
      stagger: 0.1,
    }, 0.1)
      .to('.hero .reveal-up', {
        opacity: 1,
        y: 0,
        duration: 1.0,
        stagger: 0.12,
      }, 0.4);
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Also reveal sibling mask-lines within section heads
        const section = entry.target.closest('.section-head, .cta');
        if (section) {
          section.querySelectorAll('.mask-line').forEach((l) => l.classList.add('is-visible'));
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  revealEls.forEach((el) => io.observe(el));

  // Also observe section titles directly (in case data-reveal not present)
  document.querySelectorAll('.section-title, .cta-title').forEach((title) => {
    const titleIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.mask-line').forEach((l) => l.classList.add('is-visible'));
          titleIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    titleIO.observe(title);
  });

  /* ---------- COUNT-UP ---------- */
  function animateCount(el, target, duration = 1.6) {
    const start = 0;
    const startTime = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4); // easeOutQuart
    function step(now) {
      const elapsed = (now - startTime) / 1000;
      const t = Math.min(1, elapsed / duration);
      const value = Math.round(start + (target - start) * ease(t));
      el.textContent = value.toString();
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(step);
  }

  const countEls = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-count'), 10);
        animateCount(entry.target, target);
        countIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  countEls.forEach((el) => countIO.observe(el));

  /* ---------- 3D TILT ---------- */
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const strength = 6;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(0)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateZ(0)';
      });
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      const strength = 0.35;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ---------- STORY STICKY STEP SYNC ---------- */
  if (typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    const steps = document.querySelectorAll('.story-step-text');
    const visualSteps = document.querySelectorAll('.story-step');
    const storyVisual = document.getElementById('storyVisual');

    steps.forEach((step, i) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveStep(i),
        onEnterBack: () => setActiveStep(i),
      });
    });

    function setActiveStep(index) {
      steps.forEach((s, i) => s.classList.toggle('is-active', i === index));
      visualSteps.forEach((s, i) => s.classList.toggle('is-active', i === index));
      if (storyVisual && typeof gsap !== 'undefined') {
        gsap.fromTo(storyVisual,
          { scale: 0.98, opacity: 0.8 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'expo.out' }
        );
      }
    }

    // Initial
    if (steps.length) setActiveStep(0);
  } else {
    // Fallback: just show step 0
    document.querySelectorAll('.story-step-text').forEach((s, i) => {
      if (i === 0) s.classList.add('is-active');
    });
    document.querySelectorAll('.story-step').forEach((s, i) => {
      if (i === 0) s.classList.add('is-active');
    });
  }

  /* ---------- SECTION MASK-LINE FALLBACK ---------- */
  // Some sections don't have data-reveal on the title; reveal on first paint if visible
  function revealInitialVisible() {
    document.querySelectorAll('.mask-line').forEach((line) => {
      const rect = line.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Will be handled by IO; skip
      }
    });
  }
  revealInitialVisible();

  /* ---------- REFRESH SCROLLTRIGGER ON LOAD ---------- */
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(() => ScrollTrigger.refresh(), 200);
    }
  });

})();
