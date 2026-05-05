/* ============================== animations.js ============================== */
/* GSAP + ScrollTrigger + Lenis — Omnis-style motion system                  */

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

    /* Section intros — keep subtle so content order feels natural */
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
    /* Note: .case-grid, .insight-list, .article-grid-v2 use initStaggeredCards — avoid double tweens */
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
    /* Simple scale + glow on hover — no magnetic/dancing movement */
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
      /* Already handled by hero timeline — skip */
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

    /* Clean fade + slide-up on page-hero headings — no DOM splitting */
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

    /* Offer strip — stagger up */
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

    /* Pillar cards — stagger with scale */
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

    /* Vertical steps — stagger from left */
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

    /* Testimonial wide — fade scale */
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

    /* Featured story — content slides left, image slides right */
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

    /* Insight featured — image reveal */
    gsap.utils.toArray('.insight-featured').forEach(function (el) {
      gsap.from(el, {
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        y: 40, opacity: 0, duration: 0.8, ease: 'power2.out'
      });
    });

    /* Insight list items — stagger */
    gsap.utils.toArray('.insight-list').forEach(function (container) {
      var items = container.querySelectorAll('.insight-list__item');
      gsap.from(items, {
        immediateRender: false,
        scrollTrigger: { trigger: container, start: 'top 88%', once: true },
        x: -20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out'
      });
    });

    /* Case cards — stagger up */
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

      /* Simple hover effects — desktop only */
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
