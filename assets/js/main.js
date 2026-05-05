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
      if (window.innerWidth > 1024) {
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
