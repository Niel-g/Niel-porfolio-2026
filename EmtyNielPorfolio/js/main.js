/**
 * EmtyNielPorfolio - Main Application Scripts
 * Features:
 * - YouTube Unlisted Video Modal Player
 * - Fullscreen Photography Lightbox
 * - 3D Mouse Parallax Depth Effect on Hero Cutout
 * - Copy to Clipboard Interaction
 * - Debounced Header Scroll Logic
 */

(function () {
  'use strict';

  // --- 1. Debounce Utility ---
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // --- 2. Header Glass on Scroll ---
  const header = document.getElementById('site-header');
  if (header) {
    const handleScroll = debounce(() => {
      if (window.scrollY > 30) {
        header.classList.add('header-glass', 'py-4');
        header.classList.remove('py-6');
      } else {
        header.classList.remove('header-glass', 'py-4');
        header.classList.add('py-6');
      }
    }, 15);
    window.addEventListener('scroll', handleScroll);
  }

  // --- 3. Mobile Navigation Drawer ---
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('hidden');
    });
  }

  window.closeMobileNav = function () {
    if (mobileNav) {
      mobileNav.classList.add('hidden');
    }
  };

  // --- 4. 3D Parallax Mouse Move on Hero Portrait ---
  const heroContainer = document.querySelector('.hero-depth-container');
  const heroCutout = document.querySelector('.hero-cutout-wrapper');
  const heroBgText = document.querySelector('.hero-bg-text');

  if (heroContainer && heroCutout && window.matchMedia('(pointer: fine)').matches) {
    heroContainer.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPercent = (clientX / innerWidth - 0.5) * 2; // -1 to 1
      const yPercent = (clientY / innerHeight - 0.5) * 2;

      // Slight perspective shift
      heroCutout.style.transform = `translate(${xPercent * 14}px, ${yPercent * 10}px) rotateY(${xPercent * 4}deg)`;
      if (heroBgText) {
        heroBgText.style.transform = `translate(calc(-50% + ${-xPercent * 8}px), calc(-50% + ${-yPercent * 6}px))`;
      }
    });

    heroContainer.addEventListener('mouseleave', () => {
      heroCutout.style.transform = 'translate(0px, 0px) rotateY(0deg)';
      if (heroBgText) {
        heroBgText.style.transform = 'translate(-50%, -50%)';
      }
    });
  }

  // --- 5. YouTube Video Modal Player ---
  const videoModal = document.getElementById('video-modal');
  const videoIframe = document.getElementById('video-iframe');

  window.openVideoModal = function (triggerEl) {
    const videoId = triggerEl.getAttribute('data-video-id');
    if (!videoModal || !videoIframe) return;

    if (!videoId || videoId === 'YOUR_YOUTUBE_VIDEO_ID_HERE') {
      alert('Paste your unlisted YouTube video ID into this card\'s data-video-id attribute!');
      return;
    }

    // Embed with autoplay and clean parameters
    videoIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    videoModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  window.closeVideoModal = function () {
    if (!videoModal || !videoIframe) return;
    videoModal.classList.add('hidden');
    videoIframe.src = '';
    document.body.style.overflow = '';
  };

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) window.closeVideoModal();
    });
  }

  // --- 6. Photography Lightbox Modal ---
  const photoModal = document.getElementById('photo-modal');
  const photoImg = document.getElementById('photo-modal-img');
  const photoTitle = document.getElementById('photo-modal-title');
  const photoCategory = document.getElementById('photo-modal-category');

  window.openPhotoModal = function (src, title, category) {
    if (!photoModal || !photoImg) return;

    photoImg.src = src;
    if (photoTitle) photoTitle.textContent = title || 'Artwork Still';
    if (photoCategory) photoCategory.textContent = category || 'Exhibition Exposure';

    photoModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  window.closePhotoModal = function () {
    if (!photoModal || !photoImg) return;
    photoModal.classList.add('hidden');
    photoImg.src = '';
    document.body.style.overflow = '';
  };

  if (photoModal) {
    photoModal.addEventListener('click', (e) => {
      if (e.target === photoModal) window.closePhotoModal();
    });
  }

  // Escape key closes any active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (videoModal && !videoModal.classList.contains('hidden')) window.closeVideoModal();
      if (photoModal && !photoModal.classList.contains('hidden')) window.closePhotoModal();
    }
  });

  // --- 7. Copy to Clipboard Utility ---
  window.copyContact = function (text, btnElement) {
    if (!navigator.clipboard || !btnElement) return;

    navigator.clipboard.writeText(text).then(() => {
      const originalHtml = btnElement.innerHTML;
      btnElement.innerHTML = `<span>Copied!</span><span class="text-[#D97706]">✓</span>`;
      btnElement.classList.add('border-[#D97706]/70');

      setTimeout(() => {
        btnElement.innerHTML = originalHtml;
        btnElement.classList.remove('border-[#D97706]/70');
      }, 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  // --- 8. Safe Image Error Fallback Handler ---
  window.handleImgError = function (imgEl) {
    if (!imgEl) return;
    imgEl.style.display = 'none';
    const fallback = imgEl.parentElement?.querySelector('[data-fallback="true"]');
    if (fallback) {
      fallback.classList.remove('hidden');
    }
  };

})();
