/*
╔══════════════════════════════════════════════════════════════════╗
║  SCROLL ANIMATION ENGINE — D&T Technology Department            ║
╠══════════════════════════════════════════════════════════════════╣
║  HOW IT WORKS (non-technical summary)                            ║
║  ────────────────────────────────────────────────────────────── ║
║  1. Each page section is very tall (e.g. 320vh = 3.2 screens).  ║
║  2. As you scroll through a section, we calculate how far        ║
║     through it you are (0% = just entered, 100% = leaving).     ║
║  3. We use that percentage to move, fade, and rotate elements.  ║
║  4. This runs 60 times per second via requestAnimationFrame,     ║
║     giving buttery-smooth, scroll-linked animation.             ║
║                                                                  ║
║  ADJUSTING ANIMATION TIMING                                      ║
║  ────────────────────────────────────────────────────────────── ║
║  Each animation is described as: map(p, START, END, FROM, TO)   ║
║  • p        = current scroll progress (0–1)                     ║
║  • START    = when the animation begins   (0.0 – 1.0)           ║
║  • END      = when the animation finishes (0.0 – 1.0)           ║
║  • FROM/TO  = the start and end values (pixels, degrees, etc.)  ║
║                                                                  ║
║  Example: map(p, 0.1, 0.3, 0, 1)                                ║
║    → opacity goes from 0 to 1 between 10% and 30% scroll        ║
╚══════════════════════════════════════════════════════════════════╝
*/


/* ══════════════════════════════════════════════════════════════
   UTILITY HELPERS
   ══════════════════════════════════════════════════════════════ */

/**
 * clamp(value, min, max)
 * Keeps a number within [min, max].
 * Default range is 0–1 (used for progress values).
 */
function clamp(v, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * map(val, inLo, inHi, outLo, outHi)
 * Maps `val` from one range to another, clamped at boundaries.
 * This is the core function driving every animation.
 *
 * Example: map(0.5, 0.0, 1.0, 0, 100) → 50
 *          map(0.2, 0.1, 0.3, 0, 1)   → 0.5 (halfway through the 0.1→0.3 range)
 */
function map(val, inLo, inHi, outLo, outHi) {
  const t = clamp((val - inLo) / (inHi - inLo));
  return outLo + (outHi - outLo) * t;
}

/**
 * ease(t)
 * Smooth "ease-in-out" curve — acceleration at start, deceleration at end.
 * Used to make animations feel natural rather than robotic.
 */
function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * easeOut(t)
 * Decelerates — fast at start, slow at end. Good for things "arriving".
 */
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * getProgress(sceneEl)
 * Returns how far (0–1) the user has scrolled through a scene.
 * 0 = scene just became pinned at the top of the screen.
 * 1 = scene is about to scroll away.
 */
function getProgress(sceneEl) {
  const rect     = sceneEl.getBoundingClientRect();
  const scrollable = sceneEl.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return clamp(-rect.top / scrollable);
}

/**
 * set(el, styles)
 * Shortcut to apply multiple CSS transforms/styles at once.
 */
function set(el, { opacity, y, x, scale, rotateX, rotateY, rotate } = {}) {
  if (!el) return;
  const transforms = [];
  if (y       !== undefined) transforms.push(`translateY(${y}px)`);
  if (x       !== undefined) transforms.push(`translateX(${x}px)`);
  if (scale   !== undefined) transforms.push(`scale(${scale})`);
  if (rotateX !== undefined) transforms.push(`perspective(900px) rotateX(${rotateX}deg)`);
  if (rotateY !== undefined) transforms.push(`perspective(900px) rotateY(${rotateY}deg)`);
  if (rotate  !== undefined) transforms.push(`rotate(${rotate}deg)`);
  if (transforms.length)     el.style.transform = transforms.join(' ');
  if (opacity !== undefined) el.style.opacity   = opacity;
}


/* ══════════════════════════════════════════════════════════════
   SCENE REFERENCES — cached on load for performance
   ══════════════════════════════════════════════════════════════ */
const scenes = {
  hero:  document.getElementById('scene-hero'),
  stats: document.getElementById('scene-stats'),
  paths: document.getElementById('scene-paths'),
};

// Get all 6 department scenes
const deptScenes = Array.from(document.querySelectorAll('.dept-scene'));

// Progress dots in the header
const dots = Array.from(document.querySelectorAll('.pdot'));


/* ══════════════════════════════════════════════════════════════
   SCENE 1 — HERO ANIMATION
   ══════════════════════════════════════════════════════════════ */
function animHero(p) {
  const diamond = document.getElementById('hero-diamond');
  const ring    = document.getElementById('hero-ring');
  const title   = document.getElementById('hero-title');
  const dept    = document.getElementById('hero-dept');
  const tagline = document.getElementById('hero-tagline');
  const cue     = document.getElementById('scroll-cue');

  /*
   ─── DIAMOND ───────────────────────────────────────────────
   • Fades + scales in from 0→30% scroll
   • Rotates continuously as you scroll (0° → 180°)
   • Drifts upward between 50% and 100% scroll
  */
  const dScale   = easeOut(map(p, 0.0, 0.25, 0.2, 1));
  const dOpacity = map(p, 0.0, 0.15, 0, 1) * map(p, 0.88, 1.0, 1, 0);
  const dY       = map(p, 0.45, 1.0, 0, -200);
  const dRot     = p * 200; // continuous slow rotation
  set(diamond, { opacity: dOpacity, scale: dScale, y: dY, rotate: dRot });

  /*
   ─── RING ──────────────────────────────────────────────────
   • Expands in from 0→30%, then shrinks slightly at end
  */
  const rScale   = easeOut(map(p, 0.05, 0.30, 0, 1)) * map(p, 0.88, 1.0, 1, 0);
  const rOpacity = map(p, 0.05, 0.25, 0, 0.7) * map(p, 0.85, 1.0, 1, 0);
  set(ring, { opacity: rOpacity, scale: rScale });

  /*
   ─── TITLE ─────────────────────────────────────────────────
   • Slides up + fades in at 20–35%
   • Fades out at 80–92%
  */
  const tY       = map(p, 0.18, 0.35, 40, 0);
  const tOpacity = map(p, 0.18, 0.35, 0, 1) * map(p, 0.82, 0.95, 1, 0);
  set(title, { opacity: tOpacity, y: tY });

  /*
   ─── SUBTITLE ──────────────────────────────────────────────
  */
  const deptO = map(p, 0.28, 0.42, 0, 1) * map(p, 0.82, 0.95, 1, 0);
  set(dept, { opacity: deptO });

  /*
   ─── TAGLINE ───────────────────────────────────────────────
  */
  const tagY = map(p, 0.36, 0.50, 20, 0);
  const tagO = map(p, 0.36, 0.50, 0, 1) * map(p, 0.82, 0.95, 1, 0);
  set(tagline, { opacity: tagO, y: tagY });

  /*
   ─── SCROLL CUE ────────────────────────────────────────────
   • Fully visible when idle, fades out once scrolling begins
  */
  const cueO = map(p, 0.0, 0.12, 1, 0);
  set(cue, { opacity: cueO });
}


/* ══════════════════════════════════════════════════════════════
   SCENE 2 — STATS / STATEMENT ANIMATION
   ══════════════════════════════════════════════════════════════ */
function animStats(p) {
  const line  = document.getElementById('stmt-line');
  const star  = document.getElementById('stmt-star');
  const desc  = document.getElementById('stmt-desc');
  const stats = document.getElementById('stats-row');

  /*
   ─── "WE'RE TECH" LINE ─────────────────────────────────────
   • Slides in from the left 0–20%, exits right at 82–96%
  */
  const lX = map(p, 0.0, 0.20, -60, 0) + map(p, 0.82, 0.96, 0, 40);
  const lO = map(p, 0.0, 0.20, 0, 1) * map(p, 0.84, 0.96, 1, 0);
  set(line, { opacity: lO, x: lX });

  /* Star icon */
  const sO = map(p, 0.10, 0.25, 0, 1) * map(p, 0.82, 0.96, 1, 0);
  set(star, { opacity: sO });

  /* Description paragraph */
  const dY = map(p, 0.18, 0.34, 24, 0);
  const dO = map(p, 0.18, 0.34, 0, 1) * map(p, 0.82, 0.96, 1, 0);
  set(desc, { opacity: dO, y: dY });

  /* Stats row */
  const sY = map(p, 0.32, 0.50, 30, 0);
  const sO2 = map(p, 0.32, 0.50, 0, 1) * map(p, 0.82, 0.96, 1, 0);
  set(stats, { opacity: sO2, y: sY });

  /* Trigger number counting once stats are visible */
  if (sO2 > 0.5) triggerCounters();
}

/* Counter — only runs once */
let countersDone = false;
function triggerCounters() {
  if (countersDone) return;
  countersDone = true;
  document.querySelectorAll('.counter').forEach(el => {
    const target   = parseInt(el.dataset.count, 10);
    const duration = 1400; // ms — ★ change this to speed up/slow down counting
    const start    = performance.now();
    function step(now) {
      const t = clamp((now - start) / duration);
      el.textContent = Math.round(easeOut(t) * target);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}


/* ══════════════════════════════════════════════════════════════
   SCENE 3 — "THE PATHS WE CHART" TRANSITION
   ══════════════════════════════════════════════════════════════ */
function animPaths(p) {
  const label = document.getElementById('paths-label');
  const h2    = document.getElementById('paths-h2');

  const lO = map(p, 0.0, 0.25, 0, 1) * map(p, 0.80, 0.95, 1, 0);
  set(label, { opacity: lO });

  const hY = map(p, 0.10, 0.35, 60, 0);
  const hO = map(p, 0.10, 0.35, 0, 1) * map(p, 0.80, 0.95, 1, 0);
  set(h2, { opacity: hO, y: hY });
}


/* ══════════════════════════════════════════════════════════════
   DEPARTMENT SCENES — shared animation logic
   ══════════════════════════════════════════════════════════════ */

/**
 * animDept(sceneEl, p)
 * Runs for each department scene individually.
 * Elements animate in as you enter, stay while you scroll through,
 * then fade out as you leave.
 *
 * ★ TIMING GUIDE (tweak these numbers to retime animations):
 *   meta  enters: 0.00–0.14  exits: 0.84–0.96
 *   title enters: 0.08–0.22  exits: 0.84–0.96
 *   desc  enters: 0.16–0.30  exits: 0.84–0.96
 *   card0 enters: 0.28–0.46  exits: 0.86–0.96
 *   card1 enters: 0.40–0.58  exits: 0.88–0.96
 *   card2 enters: 0.52–0.70  exits: 0.90–0.96
 */
function animDept(sceneEl, p) {

  const meta  = sceneEl.querySelector('[data-el="meta"]');
  const title = sceneEl.querySelector('[data-el="title"]');
  const desc  = sceneEl.querySelector('[data-el="desc"]');
  const cards = sceneEl.querySelectorAll('.project-card');

  /* ─── META (department number + name) ─────────────────── */
  const metaX = map(p, 0.00, 0.14, -50, 0);
  const metaO = map(p, 0.00, 0.14, 0, 1) * map(p, 0.84, 0.96, 1, 0);
  set(meta, { opacity: metaO, x: metaX });

  /* ─── HEADLINE ──────────────────────────────────────────── */
  const titleY = map(p, 0.08, 0.22, 40, 0);
  const titleO = map(p, 0.08, 0.22, 0, 1) * map(p, 0.84, 0.96, 1, 0);
  set(title, { opacity: titleO, y: titleY });

  /* ─── DESCRIPTION ───────────────────────────────────────── */
  const descO = map(p, 0.16, 0.30, 0, 1) * map(p, 0.84, 0.96, 1, 0);
  set(desc, { opacity: descO });

  /* ─── PROJECT CARDS ─────────────────────────────────────── */
  /*
   Each card enters one after another (staggered), rising from below
   with a subtle 3D tilt that flattens as it arrives — exactly like
   Apple's product page cards.

   ★ To adjust the stagger gap between cards, change the 0.12 offset:
     card 0 starts at 0.28
     card 1 starts at 0.28 + 0.12 = 0.40
     card 2 starts at 0.28 + 0.24 = 0.52
  */
  cards.forEach((card, i) => {
    const enterStart = 0.28 + i * 0.12;
    const enterEnd   = enterStart + 0.18;
    const exitStart  = 0.86 + i * 0.02;
    const exitEnd    = exitStart + 0.10;

    const t       = easeOut(map(p, enterStart, enterEnd, 0, 1));
    const cardY   = map(t, 0, 1, 90, 0);        // rises 90px → 0
    const cardRX  = map(t, 0, 1, 14, 0);        // tilts flat: 14° → 0°
    const cardS   = map(t, 0, 1, 0.88, 1);      // grows from 88% → 100%
    const cardO   = map(p, enterStart, enterEnd, 0, 1)
                  * map(p, exitStart,  exitEnd,  1, 0);

    set(card, { opacity: cardO, y: cardY, scale: cardS, rotateX: cardRX });
  });
}


/* ══════════════════════════════════════════════════════════════
   HEADER PROGRESS DOTS
   ══════════════════════════════════════════════════════════════ */

/**
 * updateDots(activeDotIndex)
 * Highlights the dot corresponding to the currently visible section.
 * The 8 dots correspond to: hero, stats, paths, dept0–dept5
 */
function updateDots(activeIndex) {
  dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
}


/* ══════════════════════════════════════════════════════════════
   MAIN ANIMATION LOOP
   ══════════════════════════════════════════════════════════════ */

/**
 * tick()
 * Called 60 times per second by the browser.
 * Reads scroll position, calculates progress for each scene,
 * and calls the matching animation function.
 */
function tick() {
  /* Determine which scene is currently "active" for the header dots */
  const vh = window.innerHeight;

  /* Hero */
  if (scenes.hero) {
    const p = getProgress(scenes.hero);
    animHero(p);
    const rect = scenes.hero.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom > 0) updateDots(0);
  }

  /* Stats */
  if (scenes.stats) {
    const p = getProgress(scenes.stats);
    animStats(p);
    const rect = scenes.stats.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom > 0) updateDots(1);
  }

  /* Paths transition */
  if (scenes.paths) {
    const p = getProgress(scenes.paths);
    animPaths(p);
    const rect = scenes.paths.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom > 0) updateDots(2);
  }

  /* Department scenes */
  deptScenes.forEach((scene, i) => {
    const p    = getProgress(scene);
    animDept(scene, p);
    const rect = scene.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom > 0) updateDots(3 + i);
  });

  requestAnimationFrame(tick);
}

/* Start the loop when the page loads */
requestAnimationFrame(tick);


/* ══════════════════════════════════════════════════════════════
   ANIMATED STAR FIELD — canvas background
   ══════════════════════════════════════════════════════════════
   ★ Adjust these constants to change the star field appearance:
     STAR_DENSITY : higher = more stars (try 2000–5000)
     TWINKLE_SPEED: higher = faster twinkling
     GLOW_OPACITY : intensity of the gold glow in the corner
   ══════════════════════════════════════════════════════════════ */
(function starField() {
  const canvas = document.getElementById('stars');
  const ctx    = canvas.getContext('2d');

  /* ★ Change these to adjust the star field */
  const STAR_DENSITY  = 3500; // one star per N square pixels
  const TWINKLE_SPEED = 0.8;  // multiplier — higher = faster
  const GLOW_OPACITY  = 0.20; // gold corner glow intensity (0–1)

  let stars = [];

  /* Resize canvas to fill the window */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  /* Create the star array */
  function buildStars() {
    const count = Math.floor((canvas.width * canvas.height) / STAR_DENSITY);
    stars = Array.from({ length: count }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.3 + 0.2,          // radius
      alpha: Math.random() * 0.55 + 0.1,          // base brightness
      speed: (Math.random() * 0.6 + 0.2) * TWINKLE_SPEED,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  /* Draw one frame */
  function frame(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Gold ambient glow — bottom-right corner */
    const g = ctx.createRadialGradient(
      canvas.width * 0.85, canvas.height * 0.90, 0,
      canvas.width * 0.85, canvas.height * 0.90, canvas.width * 0.5
    );
    g.addColorStop(0, `rgba(180,120,40,${GLOW_OPACITY})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Stars — each twinkles using a sine wave */
    for (const s of stars) {
      const a = s.alpha * (0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase));
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
