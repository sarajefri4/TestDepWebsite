/* ============================================================
   STARS CANVAS
   ============================================================ */
(function () {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');

  let stars = [];
  let animFrame;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    const count = Math.floor((canvas.width * canvas.height) / 3200);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.015 + 0.003,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const a = s.alpha * (0.6 + 0.4 * Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.fill();
    }
    animFrame = requestAnimationFrame(draw);
  }

  // Warm glow in bottom-right corner (matches screenshot)
  function drawGlow() {
    const grd = ctx.createRadialGradient(
      canvas.width * 0.88, canvas.height * 0.92, 0,
      canvas.width * 0.88, canvas.height * 0.92, canvas.width * 0.45
    );
    grd.addColorStop(0, 'rgba(180,120,40,0.18)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Wrap draw to include glow
  function tick(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGlow();
    for (const s of stars) {
      const a = s.alpha * (0.6 + 0.4 * Math.sin(t * 0.001 * s.speed * 100 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(tick);
})();


/* ============================================================
   SECTION NAVIGATION
   ============================================================ */
(function () {
  const navItems = document.querySelectorAll('.dept-nav li');
  const sections = document.querySelectorAll('.section-content');

  function activate(id) {
    // Update nav
    navItems.forEach(li => {
      li.classList.toggle('active', li.dataset.section === id);
    });
    // Update sections
    sections.forEach(sec => {
      sec.classList.toggle('active', sec.id === id);
    });
  }

  navItems.forEach(li => {
    li.addEventListener('click', () => {
      activate(li.dataset.section);
    });
  });
})();


/* ============================================================
   CARD ENTRANCE ANIMATION (Intersection Observer)
   ============================================================ */
(function () {
  const cards = document.querySelectorAll('.project-card');

  // Set initial state
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(card => observer.observe(card));
})();


/* ============================================================
   SECTION CHANGE TRIGGERS CARD RE-ANIMATION
   ============================================================ */
(function () {
  const navItems = document.querySelectorAll('.dept-nav li');

  navItems.forEach(li => {
    li.addEventListener('click', () => {
      const sectionId = li.dataset.section;
      const section = document.getElementById(sectionId);
      if (!section) return;

      const cards = section.querySelectorAll('.project-card');
      cards.forEach((card, i) => {
        card.style.transition = 'none';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
          card.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 50);
      });
    });
  });
})();
