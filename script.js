/* ============================================================
   D&T DIGITAL UNIVERSE — SCROLL ANIMATION + STAR FIELD
   ============================================================ */


/* ══════════════════════════════════════════════════════════════
   1. STAR FIELD CANVAS
   ══════════════════════════════════════════════════════════════
   Renders animated stars on a full-screen canvas fixed behind
   all content. Includes a gold ambient glow (bottom-right).

   ★ To adjust:
     DENSITY    — lower = more stars (try 2500–5000)
     TWINKLE    — higher = faster twinkling
     GLOW_COLOR — rgba of the corner glow
   ══════════════════════════════════════════════════════════════ */
(function starField() {
  const canvas = document.getElementById('stars');
  const ctx    = canvas.getContext('2d');

  const DENSITY    = 3200;  // one star per N pixels of screen area
  const TWINKLE    = 0.9;   // twinkling speed multiplier
  const GLOW_COLOR = 'rgba(180,120,40,0.18)'; // corner glow color

  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    const count = Math.floor((canvas.width * canvas.height) / DENSITY);
    stars = Array.from({ length: count }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.3 + 0.2,
      alpha: Math.random() * 0.55 + 0.1,
      speed: (Math.random() * 0.6 + 0.2) * TWINKLE,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function frame(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Gold corner glow */
    const g = ctx.createRadialGradient(
      canvas.width * 0.85, canvas.height * 0.90, 0,
      canvas.width * 0.85, canvas.height * 0.90, canvas.width * 0.5
    );
    g.addColorStop(0, GLOW_COLOR);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Draw each star, brightness driven by a sine wave */
    for (const s of stars) {
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();


/* ══════════════════════════════════════════════════════════════
   2. SCROLL REVEAL — IntersectionObserver
   ══════════════════════════════════════════════════════════════
   Any element with a [data-reveal] attribute starts invisible.
   When it enters the viewport, the class "is-visible" is added,
   which CSS transitions handle (opacity + translate).

   ★ To change when an element triggers:
     threshold: 0.15 means 15% of the element must be visible.
     Lower = triggers earlier, higher = triggers later.
   ══════════════════════════════════════════════════════════════ */
(function scrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          /* Unobserve after revealing so it doesn't re-hide on scroll up */
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 } /* ★ adjust this 0–1 to change trigger sensitivity */
  );

  items.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════════════════════════
   3. STAT COUNTER ANIMATION
   ══════════════════════════════════════════════════════════════
   Elements with class "counter" and data-count="N" will count
   up from 0 to N when they become visible.

   ★ To change speed: adjust DURATION (milliseconds).
   ══════════════════════════════════════════════════════════════ */
(function counters() {
  const DURATION = 1600; /* ms — ★ increase for slower counting */

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function startCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const start  = performance.now();

    function step(now) {
      const t = Math.min((now - start) / DURATION, 1);
      el.textContent = Math.round(easeOut(t) * target);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Trigger when the stats section enters viewport */
  const counters = document.querySelectorAll('.counter');
  let triggered  = false;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered) {
        triggered = true;
        counters.forEach(el => startCounter(el));
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('s4');
  if (statsSection) observer.observe(statsSection);
})();


/* ══════════════════════════════════════════════════════════════
   4. DEPARTMENT NAV — CLICK TO SWITCH ACTIVE ITEM
   ══════════════════════════════════════════════════════════════
   Clicking a department name in section 6 highlights it.
   ══════════════════════════════════════════════════════════════ */
(function deptNav() {
  const items = document.querySelectorAll('.dn-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
})();


/* ══════════════════════════════════════════════════════════════
   5. RADAR RING SLOW ROTATION (optional CSS complement)
   ══════════════════════════════════════════════════════════════
   Gently rotates the outer radar rings to give a living,
   breathing feel to the intro section.
   ══════════════════════════════════════════════════════════════ */
(function radarRotate() {
  const rings = document.querySelectorAll('.rr');
  let angle = 0;

  function tick() {
    angle += 0.03; /* ★ increase for faster rotation */
    rings.forEach((ring, i) => {
      /* Alternate directions for visual depth */
      const dir = i % 2 === 0 ? 1 : -1;
      const speed = 0.5 + i * 0.15;
      ring.style.transform =
        `translate(-50%,-50%) rotate(${angle * speed * dir}deg)`;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();


/* ══════════════════════════════════════════════════════════════
   6. TOPBAR — becomes fully opaque on scroll
   ══════════════════════════════════════════════════════════════ */
(function topbarScroll() {
  const bar = document.querySelector('.topbar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      bar.style.background = 'rgba(6,6,8,0.95)';
      bar.style.borderBottomColor = 'rgba(255,255,255,0.08)';
    } else {
      bar.style.background = 'rgba(6,6,8,0.70)';
      bar.style.borderBottomColor = 'rgba(255,255,255,0.05)';
    }
  }, { passive: true });
})();
