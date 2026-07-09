(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Scroll progress bar ── */
  function initScrollProgress() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = h > 0 ? (window.scrollY / h) * 100 + '%' : '0%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── Nav shrink on scroll ── */
  function initNavScroll() {
    var nav = document.getElementById('siteNav');
    if (!nav) return;
    function onScroll() {
      nav.classList.toggle('nav-scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Active nav section highlight ── */
  function initActiveNav() {
    var nav = document.getElementById('siteNav');
    if (!nav) return;
    var links = nav.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      if (id) {
        if (!map[id]) map[id] = [];
        map[id].push(a);
      }
    });

    var sections = Object.keys(map)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if (!sections.length) return;

    var current = '';
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) current = entry.target.id;
        });
        Object.keys(map).forEach(function (id) {
          map[id].forEach(function (a) {
            a.classList.toggle('active', id === current);
          });
        });
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ── Hero entrance ── */
  function initHeroEnter() {
    if (reduced) return;
    var els = document.querySelectorAll('.hero-enter');
    if (!els.length) return;
    requestAnimationFrame(function () {
      els.forEach(function (el) { el.classList.add('play'); });
    });
  }

  /* ── Scroll reveal ── */
  function initReveal() {
    var selectors = [
      '.section-header',
      '.prop-card',
      '.safety-bar',
      '.activity-card',
      '.package-card',
      '.place-card-photo',
      '.about-images',
      '.about-text',
      '.feedback-card',
      '.booking-trust',
      '.booking-card',
      '.faq-item',
      '.contact-info',
      '.map-card',
      '.page-head',
      '.g-card',
      'main.terms-body'
    ];

    var nodes = [];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (nodes.indexOf(el) === -1) nodes.push(el);
      });
    });

    if (!nodes.length) return;

    if (reduced) {
      nodes.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var staggerGroups = {};
    nodes.forEach(function (el) {
      el.classList.add('reveal');
      var parent = el.parentElement;
      var key = parent ? parent.className + parent.tagName : 'root';
      if (!staggerGroups[key]) staggerGroups[key] = [];
      staggerGroups[key].push(el);
    });

    Object.keys(staggerGroups).forEach(function (key) {
      staggerGroups[key].forEach(function (el, i) {
        if (i > 0 && i <= 5) el.classList.add('reveal-delay-' + Math.min(i, 5));
      });
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    nodes.forEach(function (el) { observer.observe(el); });
  }

  /* ── Lazy-load below-fold images ── */
  function initLazyImages() {
    document.querySelectorAll('img:not([loading])').forEach(function (img) {
      var inHero = img.closest('.hero') || img.closest('nav') || img.closest('#siteNav');
      if (!inHero && img.src && !img.src.includes('logo')) {
        img.loading = 'lazy';
        img.decoding = 'async';
      }
    });
  }

  /* ── WhatsApp one-time pulse ── */
  function initWaPulse() {
    if (reduced) return;
    var wa = document.querySelector('.wa-float');
    if (!wa) return;
    try {
      if (sessionStorage.getItem('oea_wa_pulse')) return;
      sessionStorage.setItem('oea_wa_pulse', '1');
    } catch (e) { return; }
    setTimeout(function () { wa.classList.add('wa-pulse'); }, 2500);
  }

  /* ── Subpage sticky header shadow ── */
  function initSubpageHeader() {
    var hdr = document.querySelector('header.subpage-header');
    if (!hdr) return;
    window.addEventListener('scroll', function () {
      hdr.classList.toggle('header-scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ── Subpage hero enter (play, 404) ── */
  function initSubpageEnter() {
    if (reduced || document.querySelector('.hero-enter')) return;
    ['h1', '.page-head', '.code', '.sub'].forEach(function (sel, i) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el.closest('nav') || el.closest('header')) return;
        el.classList.add('hero-enter', 'hero-enter-' + Math.min(i + 1, 4));
      });
    });
    initHeroEnter();
  }

  function boot() {
    initScrollProgress();
    initNavScroll();
    initActiveNav();
    initHeroEnter();
    initReveal();
    initLazyImages();
    initWaPulse();
    initSubpageHeader();
    initSubpageEnter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
