/* ============================================================
   TEXAS ACCENT ROOFING — SCRIPT
   Modular, concise vanilla JS
   ============================================================ */

'use strict';

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initYear();
  initNavShrink();
  initMenu();
  initModal();
  initFAQ();
  initBeforeAfter();
  initGallery();
  initScrollAnimations();
  initCounters();
  initFormValidation();
});

/* ── YEAR ─────────────────────────────────────────────────── */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── NAV SHRINK ───────────────────────────────────────────── */
function initNavShrink() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const overlay = document.getElementById('menu-overlay');

  const syncNavState = () => {
    const shouldCompact = window.scrollY > 24;
    nav.classList.toggle('nav-compact', shouldCompact);
    if (overlay) overlay.style.top = nav.offsetHeight + 'px';
  };

  syncNavState();
  window.addEventListener('scroll', syncNavState, { passive: true });
}

/* ── SCROLL LOCK ─────────────────────────────────────────── */
const scrollLock   = () => document.body.classList.add('modal-open');
const scrollUnlock = () => document.body.classList.remove('modal-open');

/* ── MOBILE MENU ──────────────────────────────────────────── */
function initMenu() {
  const hamburger = document.querySelector('.hamburger');
  const overlay   = document.getElementById('menu-overlay');
  if (!hamburger || !overlay) return;

  const toggleMenu = (open) => {
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', String(!open));
    open ? scrollLock() : scrollUnlock();
  };

  hamburger.addEventListener('click', () => {
    const isOpen = overlay.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Close on nav link click
  overlay.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) toggleMenu(false);
  });
}

/* ── MODAL ────────────────────────────────────────────────── */
function initModal() {
  const modal     = document.getElementById('modal');
  const closeBtns = modal.querySelectorAll('.modal-close');
  const triggers  = document.querySelectorAll('.open-modal');
  if (!modal) return;

  const openModal = () => {
    modal.hidden = false;
    scrollLock();
    modal.querySelector('input, select, textarea, button')?.focus();
  };

  const closeModal = () => {
    modal.hidden = true;
    scrollUnlock();
  };

  triggers.forEach(btn => btn.addEventListener('click', openModal));
  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}

/* ── FAQ ──────────────────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer   = btn.nextElementSibling;
      const isOpen   = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      document.querySelectorAll('.faq-question').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherAnswer = other.nextElementSibling;
          if (otherAnswer) otherAnswer.hidden = true;
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      if (answer) answer.hidden = isOpen;
    });
  });
}

/* ── BEFORE / AFTER SLIDER ────────────────────────────────── */
function initBeforeAfter() {
  const container = document.querySelector('.ba-slider-container');
  if (!container) return;

  const after  = container.querySelector('.ba-after');
  const handle = container.querySelector('.ba-handle');
  if (!after || !handle) return;

  let isDragging = false;

  const setPosition = (clientX) => {
    const rect = container.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));
    after.style.clipPath    = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left       = `${pct}%`;
    handle.setAttribute('aria-valuenow', Math.round(pct));
  };

  // Pointer Events API — unified mouse/touch/stylus
  handle.addEventListener('pointerdown', (e) => {
    isDragging = true;
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  handle.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    setPosition(e.clientX);
  });

  handle.addEventListener('pointerup',     () => { isDragging = false; });
  handle.addEventListener('pointercancel', () => { isDragging = false; });

  // Keyboard support
  handle.addEventListener('keydown', (e) => {
    const rect = container.getBoundingClientRect();
    const current = parseFloat(handle.style.left) || 50;
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft')  setPosition(rect.left + (current - step) / 100 * rect.width);
    if (e.key === 'ArrowRight') setPosition(rect.left + (current + step) / 100 * rect.width);
  });

  // Init at 50%
  setPosition(container.getBoundingClientRect().left + container.getBoundingClientRect().width * 0.5);
}

/* ── GALLERY LIGHTBOX ─────────────────────────────────────── */
function initGallery() {
  const lightbox   = document.getElementById('lightbox');
  const lbImg      = document.getElementById('lightbox-img');
  const lbCaption  = document.getElementById('lightbox-caption');
  if (!lightbox || !lbImg) return;

  const items = Array.from(document.querySelectorAll('.gallery-item'));
  let currentIndex = 0;

  const getImageData = (item) => {
    const img = item.querySelector('img');
    const cap = item.querySelector('.polaroid-caption');
    return {
      src: img?.src || '',
      alt: img?.alt || '',
      caption: cap?.textContent || ''
    };
  };

  const openLightbox = (index) => {
    currentIndex = index;
    const { src, alt, caption } = getImageData(items[index]);
    lbImg.src = src;
    lbImg.alt = alt;
    lbCaption.textContent = caption;
    lightbox.hidden = false;
    scrollLock();
    lightbox.querySelector('.lightbox-close')?.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    scrollUnlock();
    lbImg.src = '';
  };

  const navigate = (dir) => {
    currentIndex = (currentIndex + dir + items.length) % items.length;
    const { src, alt, caption } = getImageData(items[currentIndex]);
    lbImg.src = src;
    lbImg.alt = alt;
    lbCaption.textContent = caption;
  };

  // Open on click
  items.forEach((item, i) => {
    const frame = item.querySelector('.polaroid-frame');
    if (frame) {
      frame.addEventListener('click', () => openLightbox(i));
    }
  });

  // Controls
  lightbox.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev')?.addEventListener('click', () => navigate(-1));
  lightbox.querySelector('.lightbox-next')?.addEventListener('click', () => navigate(1));

  // Overlay click to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Touch swipe
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
  }, { passive: true });
}

/* ── SCROLL ANIMATIONS ────────────────────────────────────── */
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children in the same parent
        const siblings = Array.from(entry.target.parentElement?.querySelectorAll('.animate-up') || []);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 60}ms`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.animate-up').forEach(el => observer.observe(el));
}

/* ── STAT COUNTERS ────────────────────────────────────────── */
function initCounters() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    if (prefersReduced) {
      el.textContent = target.toLocaleString();
      return;
    }

    const duration = 1500;
    const start    = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.getElementById('stats');
  if (statsSection) observer.observe(statsSection);
}

/* ── FORM VALIDATION ──────────────────────────────────────── */
function initFormValidation() {
  document.querySelectorAll('form[data-netlify]').forEach(form => {
    form.addEventListener('submit', (e) => {
      let valid = true;

      form.querySelectorAll('[required]').forEach(field => {
        const errorEl = field.parentElement?.querySelector('.form-error');
        const value   = field.value.trim();

        field.classList.remove('error');
        if (errorEl) errorEl.textContent = '';

        if (!value) {
          valid = false;
          field.classList.add('error');
          if (errorEl) errorEl.textContent = 'This field is required.';
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          valid = false;
          field.classList.add('error');
          if (errorEl) errorEl.textContent = 'Please enter a valid email.';
        } else if (field.type === 'tel' && !/[\d\s\-().+]{7,}/.test(value)) {
          valid = false;
          field.classList.add('error');
          if (errorEl) errorEl.textContent = 'Please enter a valid phone number.';
        }
      });

      if (!valid) e.preventDefault();
    });
  });
}
