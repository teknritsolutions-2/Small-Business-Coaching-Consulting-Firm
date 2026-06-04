/* ============================== main.js ============================== */

/* ============================== Shared Site Scripts ============================== */
(function () {
  var THEME_KEY = 'northline-theme';
  var DIRECTION_KEY = 'northline-direction';
  var systemThemeQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  /* ============================== Shared Utilities ============================== */
  function getStoredValue(key) {
    try {
      return window.localStorage.getItem(key) || '';
    } catch (error) {
      return '';
    }
  }

  function setStoredValue(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      /* Local storage can fail in restricted environments. */
    }
  }

  /* ============================== Header Navigation ============================== */
  function closeMobileMenu(toggleButton, mobileMenu) {
    if (!toggleButton || !mobileMenu) {
      return;
    }

    toggleButton.setAttribute('aria-expanded', 'false');
    mobileMenu.hidden = true;
    document.body.classList.remove('menu-open');
  }

  function closeDesktopDropdowns(currentDropdown) {
    document.querySelectorAll('.nav-dropdown[open]').forEach(function (dropdown) {
      if (dropdown !== currentDropdown) {
        dropdown.removeAttribute('open');
      }
    });
  }

  function markCurrentLinks() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');

      if (!href || href.charAt(0) === '#' || href.indexOf('http') === 0 || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) {
        return;
      }

      if (href.split('/').pop() === currentPage) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function initNavigation() {
    var toggleButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    markCurrentLinks();

    document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
      dropdown.addEventListener('toggle', function () {
        if (dropdown.open) {
          closeDesktopDropdowns(dropdown);
        }
      });
    });

    if (!toggleButton || !mobileMenu) {
      return;
    }

    function isModifiedClick(event, link) {
      return event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.getAttribute('target') === '_blank' ||
        link.hasAttribute('download');
    }

    toggleButton.addEventListener('click', function () {
      var isOpen = toggleButton.getAttribute('aria-expanded') === 'true';
      toggleButton.setAttribute('aria-expanded', String(!isOpen));
      mobileMenu.hidden = isOpen;
      document.body.classList.toggle('menu-open', !isOpen);
    });

    mobileMenu.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href') || '';
        var targetHref = link.href || href;

        if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) {
          event.preventDefault();
          closeMobileMenu(toggleButton, mobileMenu);
          return;
        }

        if (isModifiedClick(event, link)) {
          return;
        }

        if (link.pathname === window.location.pathname && link.search === window.location.search && link.hash === window.location.hash) {
          event.preventDefault();
          closeMobileMenu(toggleButton, mobileMenu);
          return;
        }

        event.preventDefault();
        closeMobileMenu(toggleButton, mobileMenu);

        if (targetHref) {
          window.location.href = targetHref;
        }
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1180) {
        closeMobileMenu(toggleButton, mobileMenu);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMobileMenu(toggleButton, mobileMenu);
        closeDesktopDropdowns(null);
      }
    });

    document.addEventListener('click', function (event) {
      if (!mobileMenu.hidden && !mobileMenu.contains(event.target) && !toggleButton.contains(event.target)) {
        closeMobileMenu(toggleButton, mobileMenu);
      }

      if (!event.target.closest('.nav-dropdown')) {
        closeDesktopDropdowns(null);
      }
    });
  }

  /* ============================== Theme And Direction ============================== */
  function getStoredTheme() {
    var storedTheme = getStoredValue(THEME_KEY);
    return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : '';
  }

  function getSystemTheme() {
    return systemThemeQuery && systemThemeQuery.matches ? 'dark' : 'light';
  }

  function updateThemeButtons(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      var icon = button.querySelector('.material-symbols-outlined');

      if (icon) {
        icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
      }

      button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButtons(theme);
  }

  function updateDirectionButtons(direction) {
    document.querySelectorAll('[data-rtl-toggle]').forEach(function (button) {
      button.textContent = direction === 'rtl' ? 'LTR' : 'RTL';
      button.setAttribute('aria-label', direction === 'rtl' ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
    });
  }

  function applyDirection(direction) {
    document.documentElement.setAttribute('dir', direction);
    updateDirectionButtons(direction);

    document.dispatchEvent(new CustomEvent('northline:directionchange', {
      detail: { direction: direction }
    }));

    window.requestAnimationFrame(function () {
      window.dispatchEvent(new Event('resize'));
    });
  }

  function initPreferences() {
    applyTheme(getStoredTheme() || getSystemTheme());
    applyDirection(getStoredValue(DIRECTION_KEY) || 'ltr');

    if (systemThemeQuery) {
      var syncThemeWithSystem = function (event) {
        if (!getStoredTheme()) {
          applyTheme(event.matches ? 'dark' : 'light');
        }
      };

      if (typeof systemThemeQuery.addEventListener === 'function') {
        systemThemeQuery.addEventListener('change', syncThemeWithSystem);
      } else if (typeof systemThemeQuery.addListener === 'function') {
        systemThemeQuery.addListener(syncThemeWithSystem);
      }
    }

    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        var nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setStoredValue(THEME_KEY, nextTheme);
        applyTheme(nextTheme);
      });
    });

    document.querySelectorAll('[data-rtl-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        var nextDirection = document.documentElement.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
        setStoredValue(DIRECTION_KEY, nextDirection);
        applyDirection(nextDirection);
      });
    });
  }

  /* ============================== Shared Form Validation ============================== */
  function isEmail(value) {
    return /.+@.+\..+/.test(value);
  }

  function clearFieldState(field) {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('title');
  }

  function getErrorMessage(field) {
    if (field.type === 'checkbox') {
      return 'Please confirm this field before continuing.';
    }

    if (field.type === 'email') {
      return 'Please enter a valid email address.';
    }

    return 'Please complete this field.';
  }

  function fieldIsInvalid(field) {
    if (field.type === 'checkbox') {
      return !field.checked;
    }

    if (field.type === 'email') {
      return !isEmail(field.value.trim());
    }

    return !field.value.trim();
  }

  function isFallbackAction(form) {
    var action = (form.getAttribute('action') || '').trim();

    if (!action) {
      return true;
    }

    return action.indexOf('example.com') !== -1 || action.indexOf('/newsletter') !== -1 || form.hasAttribute('data-fallback-submit');
  }

  function getSuccessMessage(form) {
    return form.getAttribute('data-success-message') || 'Thank you. Your request has been received.';
  }

  function attachFieldHint(field) {
    if (!field.id) {
      field.id = 'field-' + Math.random().toString(36).slice(2, 9);
    }

    var hintId = field.id + '-hint';

    if (!field.getAttribute('aria-describedby')) {
      field.setAttribute('aria-describedby', hintId);
    }

    if (!document.getElementById(hintId) && field.parentNode) {
      var hint = document.createElement('span');
      hint.id = hintId;
      hint.className = 'sr-only';
      hint.textContent = field.required ? 'Required field' : 'Optional field';
      field.parentNode.appendChild(hint);
    }
  }

  function initFormValidation() {
    document.querySelectorAll('[data-validate]').forEach(function (form) {
      var requiredFields = Array.from(form.querySelectorAll('[required]'));

      requiredFields.forEach(function (field) {
        attachFieldHint(field);

        field.addEventListener('input', function () {
          clearFieldState(field);
        });

        field.addEventListener('change', function () {
          clearFieldState(field);
        });
      });

      form.addEventListener('submit', function (event) {
        var message = form.querySelector('.form-message');
        var invalidField = requiredFields.find(fieldIsInvalid);
        var successHref = form.getAttribute('data-submit-success-href');
        var shouldInterceptSuccess = Boolean(successHref) || isFallbackAction(form);

        if (message) {
          message.classList.remove('is-error', 'is-success');
        }

        requiredFields.forEach(clearFieldState);

        if (invalidField) {
          var errorMessage = getErrorMessage(invalidField);

          event.preventDefault();
          invalidField.setAttribute('aria-invalid', 'true');
          invalidField.setAttribute('title', errorMessage);

          if (message) {
            message.textContent = errorMessage;
            message.classList.add('is-error');
          }

          invalidField.focus();
          return;
        }

        if (!shouldInterceptSuccess) {
          return;
        }

        event.preventDefault();

        if (message) {
          message.textContent = getSuccessMessage(form);
          message.classList.add('is-success');
        }

        if (form.matches('.newsletter-form')) {
          form.reset();
        }

        if (successHref) {
          window.setTimeout(function () {
            window.location.href = successHref;
          }, 650);
        }
      });
    });
  }

  /* ============================== Page Loading And Reveal ============================== */
  function createPageLoader() {
    var loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.setAttribute('data-page-loader', '');
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.innerHTML = '<span class="page-loader__pulse" aria-hidden="true"></span><span class="sr-only">Loading page</span>';

    document.body.setAttribute('aria-busy', 'true');
    document.body.appendChild(loader);

    return loader;
  }

  function hidePageLoader(loader) {
    if (!loader) {
      return;
    }

    document.body.removeAttribute('aria-busy');
    loader.hidden = true;
  }

  function initReveal() {
    var revealItems = document.querySelectorAll('[data-reveal]');

    if (!revealItems.length) {
      return;
    }

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(function (item) {
        item.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ============================== Password Toggle ============================== */
  function initPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(function (button) {
      var field = button.closest('.password-field');
      var input = field ? field.querySelector('input[type="password"], input[type="text"]') : null;
      var icon = button.querySelector('.material-symbols-outlined');

      if (!input) {
        return;
      }

      button.addEventListener('click', function () {
        var isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';

        if (icon) {
          icon.textContent = isHidden ? 'visibility_off' : 'visibility';
        }

        button.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
      });
    });
  }

  function initScrollCarousels() {
    document.querySelectorAll('[data-scroll-carousel]').forEach(function (root) {
      var track = root.querySelector('[data-scroll-carousel-track]');
      if (!track) return;

      var prev = root.querySelector('[data-scroll-carousel-prev]');
      var next = root.querySelector('[data-scroll-carousel-next]');

      function getStep() {
        var first = track.querySelector(':scope > *');
        if (!first) return Math.round(track.clientWidth * 0.9);
        var rect = first.getBoundingClientRect();
        return Math.max(240, Math.min(Math.round(rect.width + 16), Math.round(track.clientWidth * 0.9)));
      }

      function scrollByDir(dir) {
        track.scrollBy({ left: dir * getStep(), behavior: 'smooth' });
      }

      if (prev) prev.addEventListener('click', function () { scrollByDir(-1); });
      if (next) next.addEventListener('click', function () { scrollByDir(1); });
    });
  }

  function initOverflowGuard() {
    if (!document.body.classList.contains('site-body') || document.body.classList.contains('page-dashboard-shell')) {
      return;
    }

    var clampSelectors = '.section, .hero-v2, .page-hero, .page-hero-omnis, .site-footer, .mobile-menu, .utility-bar';

    function clearOldClamps() {
      document.querySelectorAll('.overflow-clamped').forEach(function (node) {
        node.classList.remove('overflow-clamped');
      });
    }

    function clampOverflow() {
      clearOldClamps();

      var viewportWidth = document.documentElement.clientWidth;
      var nodes = document.body.querySelectorAll('*');

      nodes.forEach(function (node) {
        if (!(node instanceof HTMLElement) || node.hidden) {
          return;
        }

        var style = window.getComputedStyle(node);

        if (style.display === 'none' || style.visibility === 'hidden' || style.position === 'fixed') {
          return;
        }

        var rect = node.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
          return;
        }

        if (rect.right > viewportWidth + 1 || rect.left < -1) {
          var clampRoot = node.closest(clampSelectors);

          if (clampRoot) {
            clampRoot.classList.add('overflow-clamped');
          }
        }
      });
    }

    var runClamp = function () {
      window.requestAnimationFrame(clampOverflow);
    };

    runClamp();
    window.addEventListener('load', runClamp);
    window.addEventListener('resize', runClamp);
    window.addEventListener('orientationchange', runClamp);
  }

  /* ============================== Shared Bootstrap ============================== */
  function initMain() {
    var loader = createPageLoader();

    initNavigation();
    initPreferences();
    initFormValidation();
    initPasswordToggles();

    if (typeof window.initDashboard === 'function') {
      window.initDashboard();
    }

    initReveal();
    initScrollCarousels();
    initOverflowGuard();

    window.requestAnimationFrame(function () {
      hidePageLoader(loader);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMain);
  } else {
    initMain();
  }
})();

/* ============================== Motion Scripts ============================== */
/* GSAP + ScrollTrigger + Lenis motion system                                  */

(function () {

  /* ============================== Lenis Smooth Scroll ============================== */
  var lenis;

  function initLenis() {
    if (typeof Lenis === 'undefined') return;

    lenis = new Lenis({
      duration: 0.75,
      easing: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -8 * t); },
      smooth: true,
      smoothTouch: false,
      wheelMultiplier: 1.2,
      touchMultiplier: 1.5
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    /* Sync Lenis with GSAP ScrollTrigger */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    /* Pause Lenis while the mobile menu is open so the page can't scroll behind it */
    new MutationObserver(function () {
      if (document.body.classList.contains('menu-open')) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  /* ============================== Hero Entrance ============================== */
  function initHeroAnimations() {
    if (typeof gsap === 'undefined') return;

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (document.querySelector('.hero-alt')) {
      tl.from('.hero-alt .hero-v2__badge', { opacity: 0, y: 14, duration: 0.55 })
        .from('.hero-alt .hero-v2__heading', { opacity: 0, y: 40, duration: 0.85 }, '-=0.28')
        .from('.hero-alt .hero-v2__sub', { opacity: 0, y: 22, duration: 0.65 }, '-=0.45')
        .from('.hero-alt .hero-v2__actions', { opacity: 0, y: 18, duration: 0.55 }, '-=0.38')
        .from('.hero-alt__media-wide', {
          opacity: 0, y: 36, duration: 1, ease: 'power2.out'
        }, 0.2)
        .from('.hero-alt__metric', {
          opacity: 0, y: 22, duration: 0.5, stagger: 0.1, ease: 'power2.out'
        }, '-=0.75');
    } else if (document.querySelector('.hero-v2__badge')) {
      tl.from('.hero-v2__badge',   { opacity: 0, y: 16, duration: 0.6 })
        .from('.hero-v2__heading', { opacity: 0, y: 48, duration: 0.9 }, '-=0.3')
        .from('.hero-v2__sub',     { opacity: 0, y: 28, duration: 0.7 }, '-=0.5')
        .from('.hero-v2__actions', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
        .from('.hero-v2__stats .hero-v2__stat', {
          opacity: 0, y: 16, duration: 0.5, stagger: 0.12
        }, '-=0.3')
        .from('.hero-v2__media', {
          opacity: 0, x: 64, duration: 1.1, ease: 'power2.out'
        }, 0.25);
    }

  }

  /* ============================== Counter Animation ============================== */
  function initCounters() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      var obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: function () {
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = prefix + (Number.isInteger(target)
                ? Math.round(obj.val)
                : obj.val.toFixed(1)) + suffix;
            }
          });
        }
      });
    });
  }

  /* ============================== Section Reveal (Stagger) ============================== */
  function initScrollReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    /* Section intros - keep subtle so content order feels natural */
    gsap.utils.toArray('.section-intro--center, .section-intro').forEach(function (el) {
      gsap.from(el, {
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 96%', once: true },
        opacity: 0.98,
        y: 14,
        duration: 0.45,
        ease: 'power2.out'
      });
    });

    /* Staggered card groups */
    /* Note: .case-grid, .insight-list, .article-grid-v2 use initStaggeredCards - avoid double tweens */
    var cardGroups = [
      '.services-v2 .service-v2-card',
      '.steps-grid .step-card',
      '.testimonials-grid .testimonial-card',
      '.article-grid .article-card',
      '.courses-preview-grid .course-preview-card',
      '.pricing-teaser .pricing-teaser-card',
      '.team-preview-grid .team-preview-card',
      '.industries-grid .industry-card',
      '.about-preview__values .about-preview__value',
      '.case-stats__numbers .case-stat-item',
      '.service-grid .service-card'
    ];

    cardGroups.forEach(function (selector) {
      var cards = gsap.utils.toArray(selector);
      if (!cards.length) return;

      cards.forEach(function (card, i) {
        gsap.from(card, {
          immediateRender: false,
          scrollTrigger: { trigger: card, start: 'top 90%', once: true },
          opacity: 0,
          y: 52,
          duration: 0.7,
          delay: i * 0.1,
          ease: 'power2.out'
        });
      });
    });

    /* Trust strip items */
    gsap.utils.toArray('.trust-strip__item').forEach(function (el, i) {
      gsap.from(el, {
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 95%', once: true },
        opacity: 0,
        x: -20,
        duration: 0.5,
        delay: i * 0.08,
        ease: 'power2.out'
      });
    });

    /* CTA banner */
    if (document.querySelector('.cta-v2')) {
      var ctaTl = gsap.timeline({
        scrollTrigger: { trigger: '.cta-v2', start: 'top 85%', once: true }
      });
      ctaTl
        .from('.cta-v2__eyebrow', { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out' })
        .from('.cta-v2 h2',       { opacity: 0, y: 28, duration: 0.7, ease: 'power2.out' }, '-=0.3')
        .from('.cta-v2 p',        { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, '-=0.4')
        .from('.cta-v2__actions', { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out' }, '-=0.3');
    }

    /* Generic [data-reveal] fallback for non-homepage pages */
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      if (el.closest('.hero-v2')) return; /* hero handled separately */
      gsap.from(el, {
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 97%', once: true },
        opacity: 0.98,
        y: 10,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
  }

  /* ============================== Simple Button Hover ============================== */
  function initSimpleButtonHover() {
    /* Simple scale + glow on hover - no magnetic/dancing movement */
    document.querySelectorAll('.button').forEach(function (el) {
      el.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
      el.addEventListener('mouseenter', function () {
        el.style.transform = 'translateY(-2px)';
        el.style.boxShadow = '0 8px 24px rgba(23, 103, 130, 0.25)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '';
      });
    });
  }

  /* ============================== Marquee Speed Control ============================== */
  function initMarquee() {
    var tracks = document.querySelectorAll('.marquee-track');
    if (!tracks.length) return;

    tracks.forEach(function (track) {
      track.addEventListener('mouseenter', function () {
        track.style.animationPlayState = 'paused';
      });
      track.addEventListener('mouseleave', function () {
        track.style.animationPlayState = 'running';
      });
    });
  }

  /* ============================== Nav scroll state ============================== */
  function initNavScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var scrolled = false;

    window.addEventListener('scroll', function () {
      var isScrolled = window.scrollY > 48;
      if (isScrolled !== scrolled) {
        scrolled = isScrolled;
        header.classList.toggle('is-scrolled', scrolled);
      }
    }, { passive: true });
  }

  /* ============================== Line reveal on headings ============================== */
  function initHeadingLines() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('.hero-v2__heading').forEach(function (el) {
      /* Already handled by hero timeline - skip */
    });

    /* Inner page h1 headings */
    gsap.utils.toArray('.inner-hero h1, .page-hero h1').forEach(function (el) {
      gsap.from(el, {
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        opacity: 0,
        y: 32,
        duration: 0.85,
        ease: 'power3.out'
      });
    });
  }

  /* ============================== Image hover tilt ============================== */
  function initImageTilt() {
    document.querySelectorAll('.hero-v2__image-wrap, .media-frame--article').forEach(function (el) {
      if (typeof gsap === 'undefined') return;

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width  - 0.5;
        var y = (e.clientY - rect.top)  / rect.height - 0.5;
        gsap.to(el, {
          rotationY: x * 6,
          rotationX: -y * 6,
          transformPerspective: 800,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: true
        });
      });

      el.addEventListener('mouseleave', function () {
        gsap.to(el, {
          rotationX: 0, rotationY: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.4)',
          overwrite: true
        });
      });
    });
  }

  /* ============================== Parallax Sections ============================== */
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    /* Subtle scale on teal-mesh blobs */
    gsap.utils.toArray('.teal-mesh').forEach(function (mesh) {
      gsap.to(mesh, {
        scrollTrigger: {
          trigger: mesh.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2
        },
        scale: 1.15,
        rotate: 8,
        ease: 'none'
      });
    });
  }

  /* ============================== Text Reveal (Clean) ============================== */
  function initTextReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    /* Clean fade + slide-up on page-hero headings - no DOM splitting */
    gsap.utils.toArray('.page-hero-omnis h1').forEach(function (h1) {
      gsap.from(h1, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.1
      });
    });

    /* Fade in hero paragraphs */
    gsap.utils.toArray('.page-hero-omnis p').forEach(function (p) {
      gsap.from(p, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.3
      });
    });

    /* Fade in hero actions */
    gsap.utils.toArray('.page-hero-omnis .hero-actions').forEach(function (el) {
      gsap.from(el, {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        delay: 0.45
      });
    });

    /* Staggered reveal on stats-bar numbers */
    gsap.utils.toArray('.stats-bar__num').forEach(function (el) {
      gsap.from(el, {
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        scale: 0.6,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
      });
    });
  }

  /* Cursor follower REMOVED per user request */

  /* ============================== Staggered Card Entrance ============================== */
  function initStaggeredCards() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    /* Offer strip - stagger up */
    gsap.utils.toArray('.offer-strip').forEach(function (container) {
      var items = container.querySelectorAll('.offer-strip__item');
      if (!items.length) return;
      gsap.from(items, {
        immediateRender: false,
        scrollTrigger: { trigger: container, start: 'top 85%', once: true },
        y: 28,
        opacity: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: 'power2.out'
      });
    });

    /* Service rows stagger from left */
    gsap.utils.toArray('.service-rows').forEach(function (container) {
      var rows = container.querySelectorAll('.service-row');
      gsap.from(rows, {
        immediateRender: false,
        scrollTrigger: { trigger: container, start: 'top 85%', once: true },
        x: -40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });
    });

    /* Process timeline steps stagger up */
    gsap.utils.toArray('.process-timeline').forEach(function (container) {
      var steps = container.querySelectorAll('.process-timeline__step');
      gsap.from(steps, {
        immediateRender: false,
        scrollTrigger: { trigger: container, start: 'top 85%', once: true },
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out'
      });
    });

    /* Industries tags pop in */
    gsap.utils.toArray('.industries-tags').forEach(function (container) {
      var tags = container.querySelectorAll('.industries-tags__tag');
      gsap.from(tags, {
        immediateRender: false,
        scrollTrigger: { trigger: container, start: 'top 88%', once: true },
        scale: 0.7,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'back.out(1.4)'
      });
    });

    /* Article cards v2 slide up with stagger */
    gsap.utils.toArray('.article-grid-v2').forEach(function (container) {
      var cards = container.querySelectorAll('.article-card-v2');
      gsap.from(cards, {
        immediateRender: false,
        scrollTrigger: { trigger: container, start: 'top 85%', once: true },
        y: 48,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out'
      });
    });

    /* CTA full slide in */
    gsap.utils.toArray('.cta-full').forEach(function (el) {
      gsap.from(el, {
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    /* Pillar cards - stagger with scale */
    gsap.utils.toArray('.pillar-cards').forEach(function (container) {
      var cards = container.querySelectorAll('.pillar-card');
      gsap.from(cards, {
        immediateRender: false,
        scrollTrigger: { trigger: container, start: 'top 85%', once: true },
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out'
      });
    });

    /* Vertical steps - stagger from left */
    gsap.utils.toArray('.vertical-steps').forEach(function (container) {
      var steps = container.querySelectorAll('.vertical-step');
      gsap.from(steps, {
        immediateRender: false,
        scrollTrigger: { trigger: container, start: 'top 85%', once: true },
        x: -30,
        opacity: 0,
        duration: 0.65,
        stagger: 0.15,
        ease: 'power2.out'
      });
    });

    /* Testimonial wide - fade scale */
    gsap.utils.toArray('.testimonial-wide').forEach(function (el) {
      gsap.from(el, {
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        scale: 0.96,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    });

    /* Program grid tiles */
    gsap.utils.toArray('.program-grid').forEach(function (container) {
      var tiles = container.querySelectorAll('.program-tile');
      gsap.from(tiles, {
        immediateRender: false,
        scrollTrigger: { trigger: container, start: 'top 85%', once: true },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });
    });

    /* Featured story - content slides left, image slides right */
    gsap.utils.toArray('.featured-story').forEach(function (el) {
      var content = el.querySelector('.featured-story__content') || el.querySelector('.featured-story__copy');
      var media = el.querySelector('.featured-story__media');
      var stats = el.querySelector('.featured-story__stats');
      if (content) {
        gsap.from(content, {
          immediateRender: false,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          x: -40, opacity: 0, duration: 0.8, ease: 'power2.out'
        });
      }
      if (media) {
        gsap.from(media, {
          immediateRender: false,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          x: 40, opacity: 0, duration: 0.8, delay: 0.15, ease: 'power2.out'
        });
      }
      if (stats) {
        gsap.from(stats, {
          immediateRender: false,
          scrollTrigger: { trigger: el, start: 'top 70%', once: true },
          y: 30, opacity: 0, duration: 0.7, delay: 0.3, ease: 'power2.out'
        });
      }
    });

    /* Insight featured - image reveal */
    gsap.utils.toArray('.insight-featured').forEach(function (el) {
      gsap.from(el, {
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        y: 40, opacity: 0, duration: 0.8, ease: 'power2.out'
      });
    });

    /* Insight list items - stagger */
    gsap.utils.toArray('.insight-list').forEach(function (container) {
      var items = container.querySelectorAll('.insight-list__item');
      gsap.from(items, {
        immediateRender: false,
        scrollTrigger: { trigger: container, start: 'top 88%', once: true },
        x: -20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out'
      });
    });

    /* Case cards - stagger up */
    gsap.utils.toArray('.case-grid').forEach(function (container) {
      var cards = container.querySelectorAll('.case-card');
      if (!cards.length) return;
      gsap.from(cards, {
        immediateRender: false,
        scrollTrigger: { trigger: container, start: 'top 85%', once: true },
        y: 50, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out'
      });
    });
  }

  /* ============================== Boot ============================== */
  function initAnimations() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    initLenis();
    initNavScroll();
    initMarquee();

    /* Defer visual animations until after page paint */
    requestAnimationFrame(function () {
      initHeroAnimations();
      initScrollReveals();
      initCounters();
      initHeadingLines();
      initParallax();
      initTextReveal();
      initStaggeredCards();

      /* Simple hover effects - desktop only */
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        initSimpleButtonHover();
        initImageTilt();
      }

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }

})();
