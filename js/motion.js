/**
 * motion.js — Design upgrade: Lenis smooth scroll + GSAP choreography
 *
 * Behavior system (Lando-style):
 *   - Intro loader coordination (hero choreography waits for 'intro:done')
 *   - Lenis momentum smooth scrolling with gliding anchor navigation
 *   - SplitText char reveals on display headlines
 *   - Staggered section choreography via ScrollTrigger ([data-reveal] groups)
 *   - Light "finale": About → Contact morph to warm cream while scrolling,
 *     with a liquid rounded-curve settle on the About section
 *
 * Accessibility contract:
 *   - With JS disabled or prefers-reduced-motion, NOTHING is hidden:
 *     every animation is a gsap.from(), so the final readable state is the default.
 *   - reduced-motion exits before any animation is created; the loader is
 *     skipped entirely (head gate + CSS) and the theme flip still works
 *     (instant, no transition under the reduced-motion media query).
 *   - split.revert() restores original text nodes for assistive tech.
 */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- 0. Light finale theme flip (independent of GSAP) ---------- */
  // Runs for everyone, including reduced-motion users: .theme-light toggles
  // the CSS variables; transition speed is scoped to the one-shot
  // .theme-morph class (0s under prefers-reduced-motion).
  var aboutEl = document.getElementById('about');
  if (aboutEl && 'IntersectionObserver' in window) {
    var morphTimer = null;
    function setTheme(light) {
      root.classList.add('theme-morph');
      root.classList.toggle('theme-light', light);
      if (morphTimer) clearTimeout(morphTimer);
      morphTimer = setTimeout(function () {
        root.classList.remove('theme-morph');
      }, 950);
    }
    // Flip as About's top edge rises past ~65% of the viewport; flip back
    // when it sinks below the same line while scrolling up.
    var themeFlip = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        setTheme(en.isIntersecting);
      });
    }, { rootMargin: '0px 0px -35% 0px', threshold: 0 });
    themeFlip.observe(aboutEl);
  }

  /* ---------- Intro loader coordination ---------- */
  // The inline controller (index.html) owns the loader: it skips for
  // reduced-motion / repeat visits, then sets window.__introDone and
  // dispatches 'intro:done' as the curtain starts lifting.
  var introDone = window.__introDone === true;
  function whenIntro(fn) {
    if (introDone) { fn(); return; }
    document.addEventListener('intro:done', function () {
      introDone = true;
      fn();
    }, { once: true });
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof window.gsap === 'undefined') return;

  var gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  var hasSplit = typeof window.SplitText === 'function';
  if (hasSplit) gsap.registerPlugin(window.SplitText);

  var EASE = 'expo.out';

  /* Mobile simplification (Scroll-Triggered Storytelling guidance):
     touch devices get shorter travel, no 3D char rotation, quicker reveals */
  var coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var SPLIT = coarse
    ? { y: 14, rotateX: 0, duration: 0.45 }
    : { y: 20, rotateX: -40, duration: 0.6 };

  /* ---------- 1. Lenis smooth scroll ---------- */
  if (typeof window.Lenis === 'function') {
    var lenis = new window.Lenis({
      autoRaf: true,
      lerp: 0.1,
      wheelMultiplier: 1
    });

    // Hold scroll while the intro curtain is up (the controller blocks
    // keyboard/native gestures; this covers Lenis' hijacked wheel events)
    if (!introDone) {
      lenis.stop();
      document.addEventListener('intro:done', function () { lenis.start(); }, { once: true });
    }

    // Anchor links glide to their target instead of jumping
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (href.length > 1) {
          var target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -72, duration: 1.4 });
          }
        }
      });
    });

    // Freeze scroll while a modal overlay (video / photo) is open
    var modals = document.querySelectorAll('#video-modal, #photo-modal');
    if (modals.length && 'MutationObserver' in window) {
      var modalObserver = new MutationObserver(function () {
        var anyOpen = Array.prototype.some.call(modals, function (m) {
          return !m.classList.contains('hidden');
        });
        if (anyOpen) { lenis.stop(); } else { lenis.start(); }
      });
      modals.forEach(function (m) {
        modalObserver.observe(m, { attributes: true, attributeFilter: ['class'] });
      });
    }
  }

  /* ---------- 2. Split-text headline reveals (scroll-triggered sections) ---------- */
  // Headline-length copy only (< 8 words), per ui-ux-pro-max guidance.
  // The hero headline is handled in beginHero() so it waits for the loader.
  var splitTargets = [
    '#manipulation h2',
    '#photography h2',
    '#video h2'
  ];

  splitTargets.forEach(function (selector) {
    var el = document.querySelector(selector);
    if (!el || !hasSplit) return;
    var split = new SplitText(el, { type: 'chars' });
    gsap.from(split.chars, {
      opacity: 0,
      y: SPLIT.y,
      rotateX: SPLIT.rotateX,
      duration: SPLIT.duration,
      stagger: 0.015,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onComplete: function () { split.revert(); }
    });
  });

  /* ---------- 3. Section choreography ---------- */
  // [data-reveal] groups stagger their children on viewport enter.
  // Small groups (section headers, 2-col layouts) animate as one unit;
  // large card grids reveal per-card via ScrollTrigger.batch so each card
  // animates exactly as IT enters the viewport — no "arrive mid-fade" on
  // the lower rows when scrolling fast. Reveals play once (no replay
  // flicker when scrolling back up).
  var heroGroups = [];
  document.querySelectorAll('[data-reveal]').forEach(function (group) {
    if (!group.children.length) return;
    if (group.closest('#hero')) { heroGroups.push(group); return; }

    if (group.children.length > 2) {
      var cards = Array.prototype.slice.call(group.children);
      // Cards already scrolled past (above the viewport) never "enter",
      // so settle them instantly — they can't be left invisible after a
      // mid-page reload or an anchor jump.
      var animatable = cards.filter(function (card) {
        if (card.getBoundingClientRect().top < 0) {
          gsap.set(card, { opacity: 1, y: 0 });
          return false;
        }
        return true;
      });
      if (!animatable.length) return;
      gsap.set(animatable, { opacity: 0, y: 24 });
      ScrollTrigger.batch(animatable, {
        start: 'top 88%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            overwrite: true
          });
        }
      });
      return;
    }

    gsap.from(group.children, {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: { trigger: group, start: 'top 85%', once: true }
    });
  });

  /* ---------- 4. Hero choreography — starts as the curtain lifts ---------- */
  function beginHero() {
    heroGroups.forEach(function (group) {
      gsap.from(group.children, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out'
      });
    });

    var heroHeadline = document.querySelector('.hero-stroke-text');
    if (heroHeadline && hasSplit) {
      var split = new SplitText(heroHeadline, { type: 'chars' });
      gsap.from(split.chars, {
        opacity: 0,
        y: SPLIT.y,
        rotateX: SPLIT.rotateX,
        duration: SPLIT.duration,
        stagger: 0.015,
        ease: EASE,
        scrollTrigger: { trigger: heroHeadline, start: 'top 92%', once: true },
        onComplete: function () { split.revert(); }
      });
    }
  }
  whenIntro(beginHero);

  /* ---------- 5. Liquid finale settle — About's rounded top eases flat ---------- */
  if (aboutEl && window.ScrollTrigger) {
    gsap.fromTo(aboutEl,
      { borderTopLeftRadius: '120px', borderTopRightRadius: '120px' },
      {
        borderTopLeftRadius: '28px',
        borderTopRightRadius: '28px',
        ease: 'none',
        scrollTrigger: { trigger: aboutEl, start: 'top 90%', end: 'top 30%', scrub: true }
      });
  }

  /* ---------- 6. Scroll-linked hero depth (scroll scrub, desktop only) ---------- */
  // Deepens the existing 3D hero: background type drifts slower than content.
  var heroBg = document.querySelector('.hero-bg-text');
  if (heroBg && window.ScrollTrigger && window.matchMedia('(pointer: fine)').matches) {
    gsap.to(heroBg, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }
})();
