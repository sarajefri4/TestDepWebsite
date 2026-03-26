/* ================================================================
   D&T DIGITAL UNIVERSE — SCROLL ANIMATION ENGINE
   ================================================================
   HOW IT WORKS:
   Each .scene div is e.g. 300vh tall. Its .pin child is sticky,
   so it stays glued to the screen while the parent scrolls.
   getP(el) returns 0→1 as you scroll through that tall div.
   Each animation function reads that 0–1 and drives CSS transforms.
   This runs at 60fps via requestAnimationFrame — the same technique
   Apple uses for iPhone product pages.
   ================================================================ */


/* ── Utilities ───────────────────────────────────────────────── */

const q  = (sel, ctx = document) => ctx.querySelector(sel);
const qa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Keep value inside [lo, hi] */
function clamp(v, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, v)); }

/** Linear interpolate */
function lerp(a, b, t) { return a + (b - a) * clamp(t); }

/** Smooth deceleration curve (fast→slow) */
function easeOut(t) { return 1 - Math.pow(1 - clamp(t), 3); }

/** Smooth acceleration+deceleration */
function easeInOut(t) {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * map(value, inStart, inEnd, outStart, outEnd)
 * Maps a value from one range to another (clamped).
 * Example: map(0.5, 0.0, 1.0, 0, 100) → 50
 */
function map(v, a, b, c, d) {
  return lerp(c, d, (v - a) / (b - a));
}

/**
 * getP(sceneEl)
 * Returns scroll progress through a scene: 0 = just entered, 1 = leaving.
 */
function getP(el) {
  const rect = el.getBoundingClientRect();
  const h    = el.offsetHeight - window.innerHeight;
  return h > 0 ? clamp(-rect.top / h) : 0;
}

/**
 * set(el, props)
 * Applies transform + opacity to an element in one call.
 * All props are optional — omit what you don't need.
 */
function set(el, { x, y, s, rx, ry, rz, o } = {}) {
  if (!el) return;
  const parts = [];
  if (rx !== undefined || ry !== undefined) parts.push('perspective(900px)');
  if (x  !== undefined) parts.push(`translateX(${x}px)`);
  if (y  !== undefined) parts.push(`translateY(${y}px)`);
  if (s  !== undefined) parts.push(`scale(${s})`);
  if (rx !== undefined) parts.push(`rotateX(${rx}deg)`);
  if (ry !== undefined) parts.push(`rotateY(${ry}deg)`);
  if (rz !== undefined) parts.push(`rotate(${rz}deg)`);
  if (parts.length)      el.style.transform = parts.join(' ');
  if (o  !== undefined)  el.style.opacity   = clamp(o);
}

/**
 * fadeUp(el, p, inStart, inEnd, outStart, outEnd, dy)
 * Fades an element up into view, then out again.
 * ★ inStart/inEnd: when it appears (0–1 progress)
 * ★ outStart/outEnd: when it disappears (0–1 progress)
 */
function fadeUp(el, p, iS, iE, oS = 0.84, oE = 0.96, dy = 28) {
  if (!el) return;
  const inT  = easeOut(map(p, iS, iE, 0, 1));
  const outT = map(p, oS, oE, 0, 1);
  const o    = Math.min(inT, 1 - outT);
  set(el, { y: lerp(dy, 0, inT), o });
}

/**
 * slideX(el, p, inStart, inEnd, dx, outStart, outEnd)
 * Slides element in from left (dx<0) or right (dx>0).
 */
function slideX(el, p, iS, iE, dx = -60, oS = 0.84, oE = 0.96) {
  if (!el) return;
  const t   = easeOut(map(p, iS, iE, 0, 1));
  const out = map(p, oS, oE, 0, 1);
  set(el, { x: lerp(dx, 0, t), o: Math.min(t, 1 - out) });
}

/**
 * floatIn(el, p, inStart, inEnd, outStart, outEnd)
 * ★ THE APPLE EFFECT ★
 * Element starts below + tilted face-down, then floats up
 * and rotates to face the viewer — exactly like iPhone on stage.
 */
function floatIn(el, p, iS, iE, oS = 0.84, oE = 0.96) {
  if (!el) return;
  const t   = easeOut(map(p, iS, iE, 0, 1));
  const out = map(p, oS, oE, 0, 1);
  set(el, {
    y:  lerp(120, 0, t),     // rises 120px → resting position
    rx: lerp(22, 0, t),      // tilts from face-down 22° → flat 0°
    s:  lerp(0.84, 1, t),    // grows from 84% → 100%
    o:  Math.min(map(p, iS, iS + 0.14, 0, 1), 1 - out),
  });
}


/* ── Scene element cache ────────────────────────────────────── */
const S = {
  radar:     document.getElementById('scene-radar'),
  brand:     document.getElementById('scene-brand'),
  statement: document.getElementById('scene-statement'),
  stats:     document.getElementById('scene-stats'),
  paths:     document.getElementById('scene-paths'),
  dept:      document.getElementById('scene-dept'),
  team:      document.getElementById('scene-team'),
  strategy:  document.getElementById('scene-strategy'),
  showcase:  document.getElementById('scene-showcase'),
  footer:    document.getElementById('scene-footer'),
};


/* ================================================================
   SCENE 1 — RADAR
   Rings expand from 0, crosshair fades, centre star rotates
   ================================================================ */
function animRadar(p) {
  const rings = qa('.rr');
  rings.forEach((ring, i) => {
    const start = i * 0.06;           // stagger each ring
    const t     = easeOut(map(p, start, start + 0.22, 0, 1));
    const alpha = map(p, start, start + 0.18, 0, 0.10 + i * 0.02)
                * map(p, 0.82, 0.97, 1, 0);
    ring.style.transform = `translate(-50%,-50%) scale(${t})`;
    ring.style.opacity   = alpha;
  });

  const dot = q('#rd');
  const t   = easeOut(map(p, 0, 0.18, 0, 1));
  set(dot, {
    rz: p * 360,                       // rotates as you scroll
    s:  lerp(0.3, 1, t),
    o:  map(p, 0, 0.15, 0, 1) * map(p, 0.82, 0.97, 1, 0),
  });
}


/* ================================================================
   SCENE 2 — BRAND HERO
   "D&T DIGITAL" ← · ✦ scales up + rotates · → "UNIVERSE"
   ================================================================ */
function animBrand(p) {
  slideX(q('#br-left'),    p, 0.00, 0.20, -70);
  slideX(q('#br-right'),   p, 0.08, 0.26,  70);
  fadeUp(q('#brand-rule'), p, 0.30, 0.46, 0.83, 0.96, 0);
  fadeUp(q('#brand-sub'),  p, 0.36, 0.52, 0.83, 0.96);

  const star = q('#br-star');
  const t    = easeOut(map(p, 0.04, 0.24, 0, 1));
  const out  = map(p, 0.83, 0.97, 0, 1);
  set(star, {
    rz: p * 200,             // ✦ slowly rotates the whole scroll
    s:  lerp(0, 1, t),
    o:  Math.min(t, 1 - out),
  });
}


/* ================================================================
   SCENE 3 — STATEMENT
   Title + gold UNIVERSE scale in, WE'RE TECH + desc reveal
   ================================================================ */
function animStatement(p) {
  // "D&T DIGITAL" line slides from top
  fadeUp(q('#stl1'), p, 0.00, 0.18, 0.83, 0.96, -20);

  // "UNIVERSE" in gold — scales up like a product reveal
  const t2  = easeOut(map(p, 0.06, 0.26, 0, 1));
  const out2 = map(p, 0.83, 0.97, 0, 1);
  set(q('#stl2'), {
    y: lerp(50, 0, t2),
    s: lerp(0.7, 1, t2),
    o: Math.min(map(p, 0.06, 0.22, 0, 1), 1 - out2),
  });

  fadeUp(q('#sbh'),      p, 0.22, 0.38, 0.83, 0.96);
  fadeUp(q('#sbh-star'), p, 0.28, 0.40, 0.83, 0.96, 0);
  fadeUp(q('#sbd'),      p, 0.34, 0.50, 0.83, 0.96);
}


/* ================================================================
   SCENE 4 — STATS
   Left label ← · "100+" scales up · → right label
   ================================================================ */
let counterFired = false;

function animStats(p) {
  slideX(q('#sw-left'),  p, 0.00, 0.22, -50, 0.83, 0.96);
  slideX(q('#sw-right'), p, 0.10, 0.28,  50, 0.83, 0.96);

  // Centre number — scales from tiny to full
  const tc  = easeOut(map(p, 0.04, 0.28, 0, 1));
  const out = map(p, 0.83, 0.97, 0, 1);
  set(q('#sw-big'), {
    s: lerp(0.5, 1, tc),
    o: Math.min(map(p, 0.04, 0.22, 0, 1), 1 - out),
  });

  // Fire counter once it's visible
  if (tc > 0.4 && !counterFired) {
    counterFired = true;
    const el  = q('#cnt');
    const max = parseInt(el.dataset.count, 10);
    const t0  = performance.now();
    const DUR = 1500; // ms
    (function step(now) {
      el.textContent = Math.round(easeOut(Math.min((now - t0) / DUR, 1)) * max);
      if (now - t0 < DUR) requestAnimationFrame(step);
    })(t0);
  }
}


/* ================================================================
   SCENE 5 — THE PATHS WE CHART
   Title slides from left, description items stagger in from right
   ================================================================ */
function animPaths(p) {
  slideX(q('#pwl'),      p, 0.00, 0.22, -70);
  fadeUp(q('#pwr-by'),   p, 0.18, 0.34, 0.83, 0.96);
  fadeUp(q('#pwr-item'), p, 0.26, 0.42, 0.83, 0.96);
  fadeUp(q('#pwr-desc'), p, 0.34, 0.50, 0.83, 0.96);
}


/* ================================================================
   SCENE 6 — DEPARTMENTS + CARDS  ★ APPLE FLOAT-IN ★
   Nav slides in from left, then cards float up + tilt flat
   ================================================================ */
function animDept(p) {
  slideX(q('#dept-nav'), p, 0.00, 0.20, -60);

  floatIn(q('#dc0'), p, 0.22, 0.44); // Card 1 floats in first
  floatIn(q('#dc1'), p, 0.36, 0.58); // Card 2 follows
}


/* ================================================================
   SCENE 7 — TEAM
   Photos float up staggered (Apple product grid reveal),
   then the overlay card rises
   ================================================================ */
function animTeam(p) {
  fadeUp(q('#team-lbl'), p, 0.00, 0.16, 0.83, 0.96);

  // Four person photos — staggered Apple-style float
  ['tp0','tp1','tp2','tp3'].forEach((id, i) => {
    floatIn(q(`#${id}`), p, 0.12 + i * 0.09, 0.30 + i * 0.09);
  });

  floatIn(q('#team-card'), p, 0.52, 0.70); // Dark card rises last
}


/* ================================================================
   SCENE 8 — STRATEGY + G·E·A·R  ★ APPLE FLOAT-IN ★
   Strategy title builds line-by-line, then GEAR boxes
   float in with 3D tilt — like Apple showing product specs
   ================================================================ */
function animStrategy(p) {
  fadeUp(q('#st-pre'),    p, 0.00, 0.14, 0.83, 0.96, 22);
  fadeUp(q('#st-h2'),     p, 0.06, 0.20, 0.83, 0.96, 22);
  fadeUp(q('#st-for'),    p, 0.12, 0.26, 0.83, 0.96, 22);
  fadeUp(q('#st-beyond'), p, 0.18, 0.30, 0.83, 0.96, 22);
  fadeUp(q('#st-star'),   p, 0.24, 0.34, 0.83, 0.96, 10);

  // G E A R — each box floats in with Apple tilt, staggered
  ['gb0','gb1','gb2','gb3'].forEach((id, i) => {
    floatIn(q(`#${id}`), p, 0.28 + i * 0.10, 0.50 + i * 0.10);
  });
}


/* ================================================================
   SCENE 9 — SHOWCASE
   Label fades in, dark card slides in with perspective tilt
   ================================================================ */
function animShowcase(p) {
  fadeUp(q('#show-lbl'), p, 0.00, 0.18, 0.83, 0.96);

  // Card: horizontal slide + perspective tilt (Y axis)
  const card = q('#show-card');
  const t    = easeOut(map(p, 0.12, 0.40, 0, 1));
  const out  = map(p, 0.83, 0.97, 0, 1);
  set(card, {
    x:  lerp(80, 0, t),
    ry: lerp(12, 0, t),    // rotates in on Y axis as it slides
    s:  lerp(0.90, 1, t),
    o:  Math.min(map(p, 0.12, 0.28, 0, 1), 1 - out),
  });
}


/* ================================================================
   SCENE 10 — FOOTER STATEMENT
   Left text ← · ✦ scales up from 0 · → right text
   ================================================================ */
function animFooter(p) {
  slideX(q('#fw-left'),  p, 0.00, 0.26, -60, 1.1, 1.1); // never hides
  slideX(q('#fw-right'), p, 0.08, 0.30,  60, 1.1, 1.1);

  // Giant ✦ star — the climax reveal
  const star = q('#fw-star');
  const t    = easeOut(map(p, 0.04, 0.28, 0, 1));
  set(star, {
    s:  lerp(0, 1, t),
    rz: lerp(-20, 0, t),  // slight rotation as it scales in
    o:  map(p, 0.04, 0.24, 0, 1),
  });
}


/* ================================================================
   MAIN RAF LOOP — runs at 60fps
   ================================================================ */
const ANIM = [
  [S.radar,     animRadar],
  [S.brand,     animBrand],
  [S.statement, animStatement],
  [S.stats,     animStats],
  [S.paths,     animPaths],
  [S.dept,      animDept],
  [S.team,      animTeam],
  [S.strategy,  animStrategy],
  [S.showcase,  animShowcase],
  [S.footer,    animFooter],
];

function tick() {
  ANIM.forEach(([el, fn]) => { if (el) fn(getP(el)); });
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);


/* ================================================================
   SCROLL PROGRESS BAR
   Gold line at top of page showing overall page progress
   ================================================================ */
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const totalH = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = (window.scrollY / totalH * 100) + '%';
}, { passive: true });


/* ================================================================
   TOPBAR — becomes opaque on scroll
   ================================================================ */
const topbar = document.getElementById('topbar');
window.addEventListener('scroll', () => {
  topbar.classList.toggle('solid', window.scrollY > 80);
}, { passive: true });


/* ================================================================
   DEPARTMENT NAV — click to toggle active item
   ================================================================ */
qa('.dn-item').forEach(item => {
  item.addEventListener('click', () => {
    qa('.dn-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});


/* ================================================================
   STAR FIELD CANVAS
   ★ DENSITY: lower = more stars (try 2500–5000)
   ★ GLOW   : rgba color + opacity of the corner glow
   ================================================================ */
(function starField() {
  const canvas = document.getElementById('stars');
  const ctx    = canvas.getContext('2d');
  const DENSITY = 3200;
  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: Math.floor(canvas.width * canvas.height / DENSITY) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.2,
      a: Math.random() * 0.55 + 0.1,
      sp: Math.random() * 0.8 + 0.2,
      ph: Math.random() * Math.PI * 2,
    }));
  }

  function frame(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gold ambient glow — bottom-right
    const g = ctx.createRadialGradient(
      canvas.width * 0.85, canvas.height * 0.9, 0,
      canvas.width * 0.85, canvas.height * 0.9, canvas.width * 0.5
    );
    g.addColorStop(0, 'rgba(180,120,40,0.17)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      const a = s.a * (0.5 + 0.5 * Math.sin(t * 0.001 * s.sp + s.ph));
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
