/* ==========================================================================
   Hirusha Sandeeptha — Portfolio 2026
   Motion system: GSAP + ScrollTrigger + Lenis
   ========================================================================== */
(function () {
  'use strict';

  var html = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var hasMotion = !!gsap && !!ScrollTrigger && !reduce;

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var lenis = null;
  var menuOpen = false;
  var modalOpen = false;
  var lastFocused = null;

  if (hasMotion) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* ------------------------------------------------------------------
     Clock — Colombo time, everywhere
  ------------------------------------------------------------------ */
  var clockTargets = $$('[data-clock]');
  var clockFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  function tickClock() {
    var parts = clockFormat.formatToParts(new Date());
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var full = (map.hour || '00') + ':' + (map.minute || '00') + ':' + (map.second || '00');
    var short = (map.hour || '00') + ':' + (map.minute || '00');
    clockTargets.forEach(function (el) {
      el.textContent = el.getAttribute('data-clock') === 'short' ? short : full;
    });
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ------------------------------------------------------------------
     Theme
  ------------------------------------------------------------------ */
  var themeToggle = $('#themeToggle');
  var themeColor = $('#themeColor');

  function applyTheme(theme, persist) {
    html.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    if (themeColor) themeColor.setAttribute('content', theme === 'dark' ? '#0D0D0C' : '#F0EDE5');
    if (persist) {
      try { localStorage.setItem('hs-theme', theme); } catch (e) {}
    }
  }

  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (document.startViewTransition && !reduce) {
        document.startViewTransition(function () { applyTheme(next, true); });
      } else {
        applyTheme(next, true);
      }
    });
  }

  /* ------------------------------------------------------------------
     Smooth scroll
  ------------------------------------------------------------------ */
  if (hasMotion) {
    if (typeof window.Lenis === 'function') {
      lenis = new window.Lenis({
        lerp: 0.09,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        smoothWheel: true
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
    }
    body.classList.add('is-locked');
  }

  function scrollToEl(target) {
    if (!target) return;
    var trigger = window.ScrollTrigger
      ? window.ScrollTrigger.getAll().filter(function (t) { return t.trigger === target; })[0]
      : null;
    var top = trigger ? trigger.start : target.getBoundingClientRect().top + window.scrollY;
    top = Math.max(0, top - 6);
    if (lenis) {
      lenis.scrollTo(top, {
        duration: 1.35,
        easing: function (t) { return 1 - Math.pow(1 - t, 4); }
      });
    } else {
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  /* ------------------------------------------------------------------
     Custom cursor
  ------------------------------------------------------------------ */
  if (fine && hasMotion) {
    html.classList.add('cursor-ready');
    var cursor = $('#cursor');
    var cursorDot = $('#cursorDot');
    var cursorRing = $('#cursorRing');
    var cursorLabel = $('#cursorLabel');
    cursor.classList.add('is-hidden');

    gsap.set([cursorDot, cursorRing], {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
    var dotX = gsap.quickTo(cursorDot, 'x', { duration: 0.08, ease: 'power2' });
    var dotY = gsap.quickTo(cursorDot, 'y', { duration: 0.08, ease: 'power2' });
    var ringX = gsap.quickTo(cursorRing, 'x', { duration: 0.38, ease: 'power3' });
    var ringY = gsap.quickTo(cursorRing, 'y', { duration: 0.38, ease: 'power3' });

    window.addEventListener('mousemove', function (e) {
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
      cursor.classList.remove('is-hidden');
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      cursor.classList.add('is-hidden');
    });

    document.addEventListener('mouseover', function (e) {
      var hit = e.target.closest('[data-cursor], a, button');
      if (!hit) {
        cursor.classList.remove('is-link', 'is-view');
        return;
      }
      var mode = hit.getAttribute('data-cursor');
      cursor.classList.toggle('is-view', !!mode);
      cursor.classList.toggle('is-link', !mode);
      if (mode && cursorLabel) {
        cursorLabel.textContent = mode === 'view' ? 'View' : 'Open';
      }
    });
  }

  /* ------------------------------------------------------------------
     Magnetic elements
  ------------------------------------------------------------------ */
  if (fine && hasMotion) {
    $$('[data-magnetic]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.22);
        yTo((e.clientY - r.top - r.height / 2) * 0.28);
      });
      el.addEventListener('mouseleave', function () {
        xTo(0); yTo(0);
      });
    });
  }

  /* ------------------------------------------------------------------
     Split text helpers
  ------------------------------------------------------------------ */
  function splitChars(el) {
    var text = el.textContent;
    el.textContent = '';
    var frag = document.createDocumentFragment();
    Array.from(text).forEach(function (ch) {
      if (ch === ' ') {
        frag.appendChild(document.createTextNode(' '));
        return;
      }
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      frag.appendChild(span);
    });
    el.appendChild(frag);
    return $$('.char', el);
  }

  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.trim()) nodes.push(n);
    }
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        var word = document.createElement('span');
        word.className = 'word';
        word.textContent = part;
        frag.appendChild(word);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return $$('.word', el);
  }

  /* ------------------------------------------------------------------
     Hero intro + preloader
  ------------------------------------------------------------------ */
  var preloader = $('#preloader');
  var intro = null;

  if (hasMotion) {
    var heroChars = [];
    $$('[data-split="chars"]').forEach(function (el) {
      heroChars = heroChars.concat(splitChars(el));
    });
    gsap.set(heroChars, { yPercent: 118, rotate: 4, opacity: 0 });

    intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    intro
      .from('.nav', { y: -26, opacity: 0, duration: 0.9, clearProps: 'transform' }, 0)
      .from('.hero-top .label', { y: 12, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.1)
      .to(heroChars, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.1, stagger: 0.032, ease: 'expo.out' }, 0.16)
      .from('.hero-eyebrow', { y: 14, opacity: 0, duration: 0.8 }, 0.34)
      .from('.hero-sub', { y: 18, opacity: 0, duration: 0.9 }, 0.52)
      .from('.hero-actions .btn', { y: 16, opacity: 0, duration: 0.8, stagger: 0.07 }, 0.64)
      .from('.portrait-stack', { y: 46, opacity: 0, duration: 1.15 }, 0.42)
      .from('.portrait-card', { scale: 1.06, duration: 1.4, ease: 'expo.out' }, 0.42)
      .from('.portrait-note', { y: 10, opacity: 0, duration: 0.7 }, 0.85)
      .from('.hero-foot', { y: 14, opacity: 0, duration: 0.8 }, 0.9)
      .from('.ticker', { yPercent: 100, opacity: 0, duration: 0.8, ease: 'power3.out' }, 1.0);

    var countEl = $('#preloaderCount');
    var barEl = $('#preloaderBar');
    var counter = { value: 0 };

    var loadTl = gsap.timeline({
      onComplete: function () {
        if (preloader) preloader.style.display = 'none';
        body.classList.remove('is-locked');
        if (lenis) lenis.start();
        ScrollTrigger.refresh();
      }
    });

    loadTl
      .to(counter, {
        value: 100,
        duration: 1.45,
        ease: 'power2.inOut',
        onUpdate: function () {
          var v = Math.round(counter.value);
          if (countEl) countEl.textContent = String(v).padStart(2, '0');
          if (barEl) barEl.style.transform = 'scaleX(' + (counter.value / 100) + ')';
        }
      })
      .to('.preloader-center, .preloader-top, .preloader-bottom', {
        opacity: 0,
        y: -12,
        duration: 0.4,
        stagger: 0.04,
        ease: 'power2.in'
      }, '+=0.05')
      .to(preloader, {
        yPercent: -100,
        duration: 0.95,
        ease: 'expo.inOut',
        onStart: function () {
          body.classList.remove('is-locked');
          if (lenis) lenis.start();
        }
      }, '-=0.1')
      .add(function () { intro.play(0); }, '-=0.55');

    // Safety net: never leave the page locked behind a failed animation.
    setTimeout(function () {
      if (preloader && preloader.style.display !== 'none') {
        preloader.style.display = 'none';
        body.classList.remove('is-locked');
        if (lenis) lenis.start();
        intro.progress(1);
        ScrollTrigger.refresh();
      }
    }, 6000);
  } else {
    if (preloader) preloader.style.display = 'none';
    body.classList.remove('is-locked');
    $$('[data-count]').forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveals
  ------------------------------------------------------------------ */
  if (hasMotion) {
    $$('[data-reveal]').forEach(function (el) {
      gsap.from(el, {
        y: 34,
        opacity: 0,
        duration: 1.05,
        ease: 'expo.out',
        onComplete: function () {
          gsap.set(el, { clearProps: 'transform,opacity' });
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 89%',
          once: true
        }
      });
    });

    var statement = $('#statement');
    if (statement) {
      var words = splitWords(statement);
      gsap.fromTo(words, { opacity: 0.55 }, {
        opacity: 1,
        ease: 'none',
        stagger: 0.06,
        scrollTrigger: {
          trigger: statement,
          start: 'top 80%',
          end: 'bottom 58%',
          scrub: 0.45
        }
      });
    }
  }

  /* ------------------------------------------------------------------
     Hero parallax + spotlight
  ------------------------------------------------------------------ */
  if (hasMotion) {
    var hero = $('.hero');
    var spot = $('#heroSpot');
    if (hero && spot && fine) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        spot.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(2) + '%');
        spot.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(2) + '%');
      }, { passive: true });
    }

    gsap.to('.hero-copy', {
      yPercent: -7,
      opacity: 0.35,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero-portrait', {
      yPercent: -13,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero-ghost', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ------------------------------------------------------------------
     Portrait tilt
  ------------------------------------------------------------------ */
  if (hasMotion && fine) {
    var tiltCard = $('[data-tilt]');
    if (tiltCard) {
      var stack = tiltCard.closest('.portrait-stack');
      if (stack) stack.style.perspective = '900px';
      var rotX = gsap.quickTo(tiltCard, 'rotateX', { duration: 0.7, ease: 'power3' });
      var rotY = gsap.quickTo(tiltCard, 'rotateY', { duration: 0.7, ease: 'power3' });
      tiltCard.addEventListener('mousemove', function (e) {
        var r = tiltCard.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        rotY(px * 7);
        rotX(-py * 7);
      });
      tiltCard.addEventListener('mouseleave', function () {
        rotX(0); rotY(0);
      });
    }
  }

  /* ------------------------------------------------------------------
     Counters
  ------------------------------------------------------------------ */
  if (hasMotion) {
    $$('[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var state = { value: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: function () {
          gsap.to(state, {
            value: target,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.round(state.value);
            }
          });
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Work — horizontal pin (desktop)
  ------------------------------------------------------------------ */
  if (hasMotion) {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', function () {
      var viewport = $('#workViewport');
      var track = $('#workTrack');
      var progress = $('#workProgress');
      var workSection = $('.work');
      if (!viewport || !track) return;

      if (workSection) workSection.classList.add('is-pinned');

      var distance = function () {
        return Math.max(0, track.scrollWidth - viewport.clientWidth);
      };

      var tween = gsap.to(track, {
        x: function () { return -distance(); },
        ease: 'none',
        scrollTrigger: {
          trigger: '.work',
          start: 'top top',
          end: function () { return '+=' + distance(); },
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.55,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            if (progress) gsap.set(progress, { scaleX: self.progress });
          }
        }
      });

      return function () {
        if (tween.scrollTrigger) tween.scrollTrigger.kill();
        tween.kill();
        gsap.set(track, { clearProps: 'transform' });
        if (workSection) workSection.classList.remove('is-pinned');
      };
    });

    // Keep measurements honest once the webfonts and photo settle.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ------------------------------------------------------------------
     Service preview
  ------------------------------------------------------------------ */
  if (hasMotion && fine) {
    var preview = $('#servicePreview');
    var panels = $$('.service-preview-panel');
    if (preview && panels.length) {
      var pvX = gsap.quickTo(preview, 'x', { duration: 0.55, ease: 'power3' });
      var pvY = gsap.quickTo(preview, 'y', { duration: 0.55, ease: 'power3' });

      var placePreview = function (e) {
        var w = preview.offsetWidth || 290;
        var h = preview.offsetHeight || 350;
        var x = window.innerWidth - w - 70;
        var y = Math.min(Math.max(e.clientY - h / 2, 20), window.innerHeight - h - 20);
        pvX(Math.max(20, x));
        pvY(y);
      };

      $$('.service').forEach(function (row) {
        row.addEventListener('mouseenter', function (e) {
          var key = row.getAttribute('data-preview');
          panels.forEach(function (p) {
            p.classList.toggle('is-active', p.getAttribute('data-panel') === key);
          });
          placePreview(e);
          preview.classList.add('is-visible');
        });
        row.addEventListener('mousemove', placePreview);
        row.addEventListener('mouseleave', function () {
          preview.classList.remove('is-visible');
        });
        row.addEventListener('click', function () {
          preview.classList.remove('is-visible');
        });
      });
    }
  }

  /* ------------------------------------------------------------------
     Navigation — scroll state, hide on scroll down
  ------------------------------------------------------------------ */
  if (hasMotion) {
    var nav = $('#nav');
    var progressBar = $('#scrollProgress');

    var navItems = $$('.nav-links a').map(function (link) {
      return { link: link, section: document.querySelector(link.getAttribute('href')) };
    }).filter(function (item) { return !!item.section; });

    var updateActiveNav = function () {
      var line = window.innerHeight * 0.4;
      var active = null;
      navItems.forEach(function (item) {
        var r = item.section.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) active = item;
      });
      navItems.forEach(function (item) {
        var isActive = item === active;
        item.link.classList.toggle('is-active', isActive);
        if (isActive) {
          item.link.setAttribute('aria-current', 'location');
        } else {
          item.link.removeAttribute('aria-current');
        }
      });
    };

    updateActiveNav();

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function (self) {
        var y = self.scroll();
        if (nav) {
          nav.classList.toggle('is-scrolled', y > 28);
          if (self.direction === 1 && y > 340 && !menuOpen && !modalOpen) {
            nav.classList.add('is-hidden');
          } else {
            nav.classList.remove('is-hidden');
          }
        }
        if (progressBar) gsap.set(progressBar, { scaleX: self.progress });
        updateActiveNav();
      }
    });
  }

  /* ------------------------------------------------------------------
     Mobile menu
  ------------------------------------------------------------------ */
  var menu = $('#mobileMenu');
  var menuBtn = $('#menuBtn');
  var menuBtnLabel = $('#menuBtnLabel');

  function openMenu() {
    if (!menu || !menuBtn) return;
    menuOpen = true;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    if (menuBtnLabel) menuBtnLabel.textContent = 'Close';
    body.classList.add('is-locked');
    if (lenis) lenis.stop();
    var pageMain = document.querySelector('main');
    var pageFooter = document.querySelector('.footer');
    if (pageMain) pageMain.inert = true;
    if (pageFooter) pageFooter.inert = true;
    if (hasMotion) {
      gsap.killTweensOf(menu);
      gsap.set(menu, { opacity: 1 });
      gsap.fromTo('.mobile-nav a',
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, stagger: 0.055, ease: 'expo.out', delay: 0.05 }
      );
      gsap.fromTo('.mobile-menu-foot',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.3 }
      );
    }
  }

  function closeMenu(instant) {
    if (!menu || !menuBtn) return;
    menuOpen = false;
    menuBtn.setAttribute('aria-expanded', 'false');
    if (menuBtnLabel) menuBtnLabel.textContent = 'Menu';

    var finish = function () {
      if (menuOpen) return;
      if (menu.contains(document.activeElement) && menuBtn) {
        menuBtn.focus({ preventScroll: true });
      }
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      if (!modalOpen) body.classList.remove('is-locked');
      if (lenis && !modalOpen) lenis.start();
      var main = document.querySelector('main');
      var footer = document.querySelector('.footer');
      if (main) main.inert = false;
      if (footer) footer.inert = false;
      if (hasMotion) gsap.set(menu, { clearProps: 'opacity' });
    };

    if (hasMotion && !instant) {
      gsap.killTweensOf('.mobile-nav a, .mobile-menu-foot');
      gsap.to('.mobile-nav a, .mobile-menu-foot', {
        y: -16,
        opacity: 0,
        duration: 0.22,
        stagger: 0.025,
        ease: 'power2.in'
      });
      gsap.to(menu, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: finish });
    } else {
      if (hasMotion) {
        gsap.killTweensOf(menu);
        gsap.killTweensOf('.mobile-nav a, .mobile-menu-foot');
      }
      finish();
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      if (menuOpen) closeMenu(); else openMenu();
    });
  }

  /* ------------------------------------------------------------------
     Anchors
  ------------------------------------------------------------------ */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (href === '#main') {
        target.focus({ preventScroll: true });
        scrollToEl(target);
        return;
      }
      if (menuOpen) closeMenu(true);
      scrollToEl(target);
      try { history.replaceState(null, '', href); } catch (err) {}
    });
  });

  /* ------------------------------------------------------------------
     Project modal
  ------------------------------------------------------------------ */
  var projects = {
    'cv-builder': {
      index: 'Project 01 / 06',
      github: 'https://github.com/hirushasandeeptha/CV-BUILDER',
      title: 'CV Builder',
      summary: 'A resume builder that turns a blank page into a clean, ATS-friendly CV — with live preview and templates that stay out of the way.',
      year: '2025',
      role: 'Design & frontend',
      type: 'Web application',
      highlights: [
        'Live preview that updates as you type, with no page reloads.',
        'Print-optimised templates that keep a consistent rhythm on paper.',
        'Local-first data so your details never leave the browser.'
      ]
    },
    'pdf-dark': {
      index: 'Project 02 / 06',
      github: 'https://github.com/hirushasandeeptha/pdf-dark-mode-tool',
      title: 'PDF Dark Mode',
      summary: 'A small Python utility that batch-inverts PDFs into a comfortable dark reading mode without destroying images or selectable text.',
      year: '2025',
      role: 'Tooling & scripting',
      type: 'Python utility',
      highlights: [
        'Processes an entire folder in one run.',
        'Preserves text selection and embedded images.',
        'Handles mixed light and dark source pages gracefully.'
      ]
    },
    'gold-tracker': {
      index: 'Project 03 / 06',
      github: 'https://github.com/hirushasandeeptha/gold-price-tracker',
      title: 'Gold Price Tracker',
      summary: 'A live dashboard for gold rates — current price, historical movement and the context behind the number, without the noise.',
      year: '2025',
      role: 'Frontend & API integration',
      type: 'Data dashboard',
      highlights: [
        'Pulls live rates from a public price API.',
        'Animated trend chart that stays readable on mobile.',
        'Lightweight, dependency-free front end.'
      ]
    },
    'pc-craft': {
      index: 'Project 04 / 06',
      github: 'https://github.com/hirushasandeeptha/PC-CRAFT',
      title: 'PC Craft',
      summary: 'A guided way to explore PC components and put together a build that actually makes sense — visually, not just as a spec sheet.',
      year: '2024',
      role: 'Design & build',
      type: 'Web experience',
      highlights: [
        'Component explorer with clear, plain-language specs.',
        'Responsive layout that keeps the build overview intact.',
        'A visual system built around the hardware itself.'
      ]
    },
    'lifevault': {
      index: 'Project 05 / 06',
      github: 'https://github.com/hirushasandeeptha/LifeVault',
      title: 'LifeVault',
      summary: 'A private space for the documents and details you never want to lose — organised, searchable and quiet by design.',
      year: '2024',
      role: 'Product & interface',
      type: 'Personal product',
      highlights: [
        'Private-by-design architecture with no unnecessary accounts.',
        'Fast retrieval through simple categories and search.',
        'Deliberately calm interface for sensitive information.'
      ]
    },
    'watermark': {
      index: 'Project 06 / 06',
      github: 'https://github.com/hirushasandeeptha/watermark-',
      title: 'Watermark Studio',
      summary: 'Drop in a set of images, add a watermark, export the batch — entirely in the browser, with nothing uploaded.',
      year: '2024',
      role: 'Tooling & interface',
      type: 'Browser tool',
      highlights: [
        'Batch watermarking with position and opacity controls.',
        'Canvas-based processing that keeps files on your device.',
        'Instant download of the whole set as individual files.'
      ]
    }
  };

  var modal = $('#modal');
  var modalPanel = $('#modalPanel');
  var modalArt = $('#modalArt');
  var modalBackdrop = $('.modal-backdrop');

  function fillModal(project) {
    $('#modalIndex').textContent = project.index;
    $('#modalTitle').textContent = project.title;
    $('#modalSummary').textContent = project.summary;
    $('#modalYear').textContent = project.year;
    $('#modalRole').textContent = project.role;
    $('#modalType').textContent = project.type;
    var list = $('#modalHighlights');
    list.innerHTML = '';
    project.highlights.forEach(function (h) {
      var li = document.createElement('li');
      li.textContent = h;
      list.appendChild(li);
    });
    var githubBtn = $('#modalGithubBtn');
    if (githubBtn) {
      githubBtn.href = project.github || 'https://github.com/hirushasandeeptha';
    }
  }

  function openProject(id) {
    var project = projects[id];
    if (!project || !modal || modalOpen) return;
    var card = document.querySelector('[data-project="' + id + '"]');
    var poster = card ? card.querySelector('.poster') : null;
    if (!poster) return;

    fillModal(project);

    modalArt.innerHTML = '';
    var clone = poster.cloneNode(true);
    var openChip = clone.querySelector('.poster-open');
    if (openChip) openChip.remove();
    modalArt.appendChild(clone);

    lastFocused = document.activeElement;
    modalOpen = true;
    modal.hidden = false;
    body.classList.add('is-locked');
    if (lenis) lenis.stop();
    var modalMain = document.querySelector('main');
    var modalFooter = document.querySelector('.footer');
    if (modalMain) modalMain.inert = true;
    if (modalFooter) modalFooter.inert = true;

    var closeBtn = modal.querySelector('.modal-close');

    if (hasMotion) {
      gsap.killTweensOf([modalPanel, modalBackdrop]);
      gsap.set(modalBackdrop, { opacity: 0 });
      gsap.set(modalPanel, { opacity: 0, y: 26, scale: 0.98 });
      gsap.timeline()
        .to(modalBackdrop, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
        .to(modalPanel, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' }, 0.02);
    } else {
      modalBackdrop.style.opacity = '1';
      modalPanel.style.opacity = '1';
      modalPanel.style.transform = 'none';
    }

    if (closeBtn) {
      window.setTimeout(function () { closeBtn.focus(); }, 60);
    }
  }

  function closeProject() {
    if (!modal || modal.hidden || !modalOpen) return;
    modalOpen = false;

    var done = function () {
      modal.hidden = true;
      modalArt.innerHTML = '';
      body.classList.remove('is-locked');
      if (lenis) lenis.start();
      var closedMain = document.querySelector('main');
      var closedFooter = document.querySelector('.footer');
      if (closedMain) closedMain.inert = false;
      if (closedFooter) closedFooter.inert = false;
      if (hasMotion) {
        gsap.set(modalPanel, { clearProps: 'opacity,transform' });
        gsap.set(modalBackdrop, { clearProps: 'opacity' });
      } else {
        modalPanel.style.opacity = '';
        modalPanel.style.transform = '';
        modalBackdrop.style.opacity = '';
      }
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    if (hasMotion) {
      gsap.killTweensOf([modalPanel, modalBackdrop]);
      gsap.timeline({ onComplete: done })
        .to(modalPanel, { opacity: 0, y: 18, scale: 0.985, duration: 0.28, ease: 'power2.in' })
        .to(modalBackdrop, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
    } else {
      done();
    }
  }

  $$('.work-card').forEach(function (card) {
    card.addEventListener('click', function () {
      openProject(card.getAttribute('data-project'));
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProject(card.getAttribute('data-project'));
      }
    });
  });

  if (modal) {
    $$('[data-close]', modal).forEach(function (el) {
      el.addEventListener('click', closeProject);
    });

    document.addEventListener('keydown', function (e) {
      if (!modalOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeProject();
        return;
      }
      if (e.key !== 'Tab') return;
      var focusables = $$('a[href], button:not([disabled])', modal).filter(function (el) {
        return el.getClientRects().length > 0;
      });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ------------------------------------------------------------------
     Esc closes menu
  ------------------------------------------------------------------ */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen && !modalOpen) closeMenu();
  });

  /* ------------------------------------------------------------------
     Cursor label cleanup when leaving work cards
  ------------------------------------------------------------------ */
  document.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget && cursor) cursor.classList.add('is-hidden');
  });

  /* ------------------------------------------------------------------
     Refresh after viewport changes settle
  ------------------------------------------------------------------ */
  if (hasMotion) {
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        ScrollTrigger.refresh();
      }, 180);
    });
  }
})();
