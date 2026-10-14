(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

  const header     = $('#navbar');
  const menuToggle = $('#menuToggle');
  const nav        = $('#primaryNav');
  const backTop    = $('#backTop');
  const floatTop   = $('#floatTop');

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileMQ     = matchMedia('(max-width: 960px)');
  const hasIO        = 'IntersectionObserver' in window;

  /* ===== 1. SCROLL STATE ===== */
  const watchScroll = (offset, onChange) => {
    const sentinel = document.createElement('div');
    sentinel.className = 'scroll-sentinel';
    sentinel.style.top = offset + 'px';
    sentinel.setAttribute('aria-hidden', 'true');
    document.body.appendChild(sentinel);
    new IntersectionObserver(entries => {
      onChange(!entries[entries.length - 1].isIntersecting);
    }).observe(sentinel);
  };

  if (hasIO) {
    watchScroll(24,  past => header?.classList.toggle('is-scrolled', past));
    watchScroll(500, past => {
      backTop?.classList.toggle('is-visible', past);
      floatTop?.classList.toggle('is-visible', past);
    });
  } else {
    let ticking = false, a0 = null, b0 = null;
    const update = () => {
      const a = window.scrollY > 24, b = window.scrollY > 500;
      if (a !== a0) { header?.classList.toggle('is-scrolled', a); a0 = a; }
      if (b !== b0) {
        backTop?.classList.toggle('is-visible', b);
        floatTop?.classList.toggle('is-visible', b);
        b0 = b;
      }
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ===== 2. SUB-NAV PANEL ===== */
  const panelFor = key => document.querySelector(`.subnav-panel[data-panel="${key}"]`);
  const navItemsWithPanel = $$('.primary-nav > ul > li.has-menu[data-menu]');

  const closeAllPanels = () => {
    $$('.subnav-panel').forEach(p => p.classList.remove('is-open'));
    navItemsWithPanel.forEach(li => {
      li.classList.remove('is-open');
      li.querySelector('a')?.setAttribute('aria-expanded', 'false');
    });
  };

  const openPanel = (key) => {
    closeAllPanels();
    panelFor(key)?.classList.add('is-open');
    const li = document.querySelector(`.primary-nav > ul > li[data-menu="${key}"]`);
    li?.classList.add('is-open');
    li?.querySelector('a')?.setAttribute('aria-expanded', 'true');
  };

  navItemsWithPanel.forEach(li => {
    const key = li.dataset.menu;
    li.addEventListener('mouseenter', () => {
      if (!mobileMQ.matches) openPanel(key);
    });
    li.addEventListener('mouseleave', () => {
      if (!mobileMQ.matches) {
        setTimeout(() => {
          if (!li.matches(':hover') && !panelFor(key)?.matches(':hover')) {
            closeAllPanels();
          }
        }, 120);
      }
    });
    li.querySelector('a')?.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = li.classList.contains('is-open');
      if (isOpen) closeAllPanels();
      else openPanel(key);
    });
  });

  $$('.subnav-panel').forEach(panel => {
    panel.addEventListener('mouseleave', () => {
      if (!mobileMQ.matches) {
        const key = panel.dataset.panel;
        const li = document.querySelector(`.primary-nav > ul > li[data-menu="${key}"]`);
        setTimeout(() => {
          if (!panel.matches(':hover') && !li?.matches(':hover')) closeAllPanels();
        }, 120);
      }
    });
    panel.addEventListener('click', e => {
      if (e.target.closest('a')) closeAllPanels();
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.site-header')) closeAllPanels();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllPanels();
  });

  /* ===== 3. MOBILE MENU ===== */
  const closeMenu = () => {
    nav?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Buka menu navigasi');
    document.body.classList.remove('menu-open');
    $$('.has-menu.sub-open').forEach(el => el.classList.remove('sub-open'));
    closeAllPanels();
  };

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    nav?.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });

  nav?.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const item = link.parentElement;
    const isParentLink = item.classList.contains('has-menu') && item.firstElementChild === link;
    if (isParentLink && mobileMQ.matches && !item.dataset.menu) {
      event.preventDefault();
      const wasOpen = item.classList.contains('sub-open');
      $$('.has-menu.sub-open').forEach(el => el.classList.remove('sub-open'));
      if (!wasOpen) item.classList.add('sub-open');
      return;
    }
    if (mobileMQ.matches && !item.dataset.menu) closeMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav?.classList.contains('is-open')) {
      closeMenu();
      menuToggle?.focus();
    }
  });

  document.addEventListener('click', e => {
    if (nav?.classList.contains('is-open') &&
        !nav.contains(e.target) && !menuToggle?.contains(e.target)) {
      closeMenu();
    }
  });

  mobileMQ.addEventListener('change', e => { if (!e.matches) closeMenu(); });

  /* ===== 4. REVEAL ===== */
  const revealEls = $$('.reveal');
  if (hasIO && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        obs.unobserve(en.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px 20px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ===== 5. TAHUN ===== */
  const year = $('#currentYear');
  if (year) year.textContent = new Date().getFullYear();

  /* ===== 6. SUB-NAV ACTIVE STATE ===== */
  const subnavItems = $$('.subnav-item');
  subnavItems.forEach(item => {
    item.addEventListener('click', () => {
      const parentList = item.parentElement;
      parentList.querySelectorAll('.subnav-item').forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
    });
  });
})();