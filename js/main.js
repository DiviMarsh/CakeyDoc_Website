/* ============================================================
   CAKEYDOC — Interactivity
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Loading screen ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('hidden'), 500);
  });
  // Fallback in case 'load' already fired
  setTimeout(() => loader && loader.classList.add('hidden'), 2200);

  /* ---------- Scroll progress bar ---------- */
  const progress = document.getElementById('scroll-progress');
  function updateProgress() {
    if (!progress) return;
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + '%';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Sticky header shrink ---------- */
  const header = document.querySelector('header');
  function updateHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 30);
  }
  document.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ---------- Mobile nav ---------- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    }));
  }

  /* ---------- Active nav link highlighting ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  if (sections.length && navAnchors.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.classList.remove('active'));
          const match = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
          if (match) match.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(s => navObserver.observe(s));
  }

  /* ---------- Theme toggle (light/dark) ---------- */
  const themeToggle = document.querySelector('.theme-toggle');
  const root = document.documentElement;
  const savedTheme = window.__cakeydocTheme || 'light';
  root.setAttribute('data-theme', savedTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      window.__cakeydocTheme = next;
    });
  }

  /* ---------- Scroll reveal via Intersection Observer ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Typewriter effect ---------- */
  const typeEl = document.querySelector('.typewrite');
  if (typeEl) {
    const words = JSON.parse(typeEl.dataset.words || '[]');
    let wIndex = 0, cIndex = 0, deleting = false;
    function tick() {
      const word = words[wIndex];
      if (!deleting) {
        cIndex++;
        typeEl.textContent = word.slice(0, cIndex);
        if (cIndex === word.length) { deleting = true; setTimeout(tick, 1400); return; }
      } else {
        cIndex--;
        typeEl.textContent = word.slice(0, cIndex);
        if (cIndex === 0) { deleting = false; wIndex = (wIndex + 1) % words.length; }
      }
      setTimeout(tick, deleting ? 45 : 85);
    }
    if (words.length) tick();
  }

  /* ---------- Animated number counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target < 10 ? (target * eased).toFixed(1) : Math.floor(target * eased);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  /* ---------- Ripple button effect ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i !== item && i.classList.remove('open'));
      item.classList.toggle('open', !wasOpen);
    });
  });

  /* ---------- Testimonial slider ---------- */
  const tSlides = document.querySelector('.testimonial-slides');
  if (tSlides) {
    const slideEls = tSlides.querySelectorAll('.t-slide');
    const dotsWrap = document.querySelector('.t-dots');
    let idx = 0;
    slideEls.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 't-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    function goTo(i) {
      idx = (i + slideEls.length) % slideEls.length;
      tSlides.style.transform = `translateX(-${idx * 100}%)`;
      dotsWrap.querySelectorAll('.t-dot').forEach((d, di) => d.classList.toggle('active', di === idx));
    }
    document.querySelector('.t-arrow.prev')?.addEventListener('click', () => goTo(idx - 1));
    document.querySelector('.t-arrow.next')?.addEventListener('click', () => goTo(idx + 1));
    let autoplay = setInterval(() => goTo(idx + 1), 5500);
    const wrap = document.querySelector('.testimonial-wrap');
    wrap?.addEventListener('mouseenter', () => clearInterval(autoplay));
    wrap?.addEventListener('mouseleave', () => autoplay = setInterval(() => goTo(idx + 1), 5500));
  }

  /* ---------- Gallery filtering ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hide', !match);
      });
    });
  });

  /* ---------- Gallery lightbox modal ---------- */
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    const modalImg = overlay.querySelector('img');
    const modalCaption = overlay.querySelector('.modal-caption');
    let visibleItems = [];
    let current = 0;
    function refreshVisible() {
      visibleItems = Array.from(galleryItems).filter(i => !i.classList.contains('hide'));
    }
    function openModal(item) {
      refreshVisible();
      current = visibleItems.indexOf(item);
      renderModal();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function renderModal() {
      const item = visibleItems[current];
      const img = item.querySelector('img');
      modalImg.src = img.src;
      modalImg.alt = img.alt;
      modalCaption.textContent = img.alt;
    }
    galleryItems.forEach(item => item.addEventListener('click', () => openModal(item)));
    overlay.querySelector('.modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    function closeModal() { overlay.classList.remove('open'); document.body.style.overflow = ''; }
    overlay.querySelector('.modal-nav.prev').addEventListener('click', () => { current = (current - 1 + visibleItems.length) % visibleItems.length; renderModal(); });
    overlay.querySelector('.modal-nav.next').addEventListener('click', () => { current = (current + 1) % visibleItems.length; renderModal(); });
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') overlay.querySelector('.modal-nav.prev').click();
      if (e.key === 'ArrowRight') overlay.querySelector('.modal-nav.next').click();
    });
  }

  /* ---------- Lazy loading images (native + fade-in) ---------- */
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.style.opacity = 0;
    img.style.transition = 'opacity 0.5s ease';
    if (img.complete) img.style.opacity = 1;
    else img.addEventListener('load', () => img.style.opacity = 1);
  });

  /* ---------- Back to top ---------- */
  const backTop = document.querySelector('.fab-top');
  if (backTop) {
    document.addEventListener('scroll', () => {
      backTop.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Toast helper ---------- */
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg><span></span>`;
      document.body.appendChild(toast);
    }
    toast.querySelector('span').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
  window.showToast = showToast;

  /* ---------- Contact form validation ---------- */
  const form = document.querySelector('.order-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        const wrap = field.closest('.field');
        const isEmail = field.type === 'email';
        const emailOk = !isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (!field.value.trim() || !emailOk) {
          wrap.classList.add('invalid');
          valid = false;
        } else {
          wrap.classList.remove('invalid');
        }
      });
      if (valid) {
        showToast("Thanks! Your order request has been sent.");
        form.reset();
      } else {
        showToast("Please check the highlighted fields.");
      }
    });
    form.querySelectorAll('input, textarea').forEach(f => {
      f.addEventListener('input', () => f.closest('.field').classList.remove('invalid'));
    });
  }

  /* ---------- Newsletter form ---------- */
  const newsletter = document.querySelector('.newsletter-form');
  if (newsletter) {
    newsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletter.querySelector('input');
      if (input.value.trim()) {
        showToast("You're on the list — sweet updates coming your way!");
        newsletter.reset();
      }
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          window.scrollTo({ top: target.offsetTop - 76, behavior: 'smooth' });
        }
      }
    });
  });

});