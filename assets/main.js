(function () {
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var y = d.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Header state + scroll progress
  var header = d.querySelector('header');
  var bar = d.querySelector('.progress');
  var ticking = false;
  function onScroll() {
    var st = window.scrollY || root.scrollTop;
    if (header) header.classList.toggle('scrolled', st > 20);
    if (bar) {
      var h = root.scrollHeight - root.clientHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? st / h : 0) + ')';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Mobile menu
  var menuBtn = d.getElementById('menuBtn');
  var navLinks = d.getElementById('navLinks');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll reveal
  var items = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Marquee: duplicate content for a seamless loop
  var track = d.querySelector('.marquee-track');
  if (track) track.innerHTML += track.innerHTML;

  // Cursor spotlight
  var sp = d.querySelector('.spotlight');
  if (sp && !reduce && window.matchMedia('(pointer: fine)').matches) {
    var raf = false, mx = 0, my = 0;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!raf) {
        raf = true;
        requestAnimationFrame(function () {
          root.style.setProperty('--mx', mx + 'px');
          root.style.setProperty('--my', my + 'px');
          raf = false;
        });
      }
    }, { passive: true });
  }

  // Copy email
  var copyBtn = d.getElementById('copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var done = function (t) {
        copyBtn.textContent = t;
        setTimeout(function () { copyBtn.textContent = 'Copy email'; }, 2000);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText('muyunda.nalukui@cs.unza.zm').then(
          function () { done('Copied'); }, function () { done('Copy failed'); });
      } else { done('Copy failed'); }
    });
  }

  // Screenshot placeholders: if an image file is missing, show a labelled box
  function placeholder(img) {
    if (img.dataset.done) return;
    img.dataset.done = '1';
    var box = d.createElement('div');
    var path = (img.getAttribute('src') || '').replace(/^(\.\.\/)+/, '');
    box.className = 'ph';
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', 'Screenshot placeholder: ' + img.alt);
    box.textContent = 'Screenshot placeholder. Add ' + path;
    img.replaceWith(box);
  }
  d.querySelectorAll('img[data-shot]').forEach(function (img) {
    img.addEventListener('error', function () { placeholder(img); });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) placeholder(img);
  });
})();