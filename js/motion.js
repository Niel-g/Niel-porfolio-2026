/**
 * motion.js — Design upgrade: Lenis smooth scroll + GSAP choreography
 *
 * Behavior system (Lando-style):
 *   - Lenis momentum smooth scrolling with gliding anchor navigation
 *   - SplitText char reveals on display headlines
 *   - Staggered section choreography via ScrollTrigger ([data-reveal] groups)
 *
 * Accessibility contract:
 *   - With JS disabled or prefers-reduced-motion, NOTHING is hidden:
 *     every animation is a gsap.from(), so the final readable state is the default.
 *   - reduced-motion exits before any animation is created.
 *   - split.revert() restores original text nodes for assistive tech.
 */
(function () {
  'use strict';

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

  /* ---------- 2. Split-text headline reveals ---------- */
  // Headline-length copy only (< 8 words), per ui-ux-pro-max guidance.
  var splitTargets = [
    '.hero-stroke-text',
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
      scrollTrigger: { trigger: el, start: 'top 92%' },
      onComplete: function () { split.revert(); }
    });
  });

  /* ---------- 3. Section choreography ---------- */
  // Each [data-reveal] container staggers its direct children on viewport enter.
  document.querySelectorAll('[data-reveal]').forEach(function (group) {
    if (!group.children.length) return;
    var isHero = group.closest('#hero');
    var config = {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out'
    };
    if (!isHero) {
      config.scrollTrigger = { trigger: group, start: 'top 85%' };
    }
    gsap.from(group.children, config);
  });

  /* ---------- 4. Scroll-linked hero depth (scroll scrub, desktop only) ---------- */
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
