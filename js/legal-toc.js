// "On this page" rail for the legal pages: built from the section headings,
// pinned to the right edge of the window, and following the scroll.
// Only the current section's sub-sections are listed. Styles live in legal.css.
(function () {
  var content = document.querySelector('.tl_legal_wrap');
  if (!content) return;

  var GAP = 32;        // least space kept between the text and the rail
  var EDGE = 24;       // right inset, in line with the theme toggle
  var MIN_WIDTH = 160; // narrowest rail that still reads; less and it hides
  var MAX_WIDTH = 260;
  var MIN_TOP = 25;    // first line level with the "Ke atas" label
  var ACTIVE_AT = 120; // a heading this close to the top counts as current

  var headings = content.querySelectorAll(
    'h2.tl_legal_heading[id], h3.tl_legal_subheading[id]');
  if (!headings.length) return;

  var nav = document.createElement('nav');
  nav.className = 'tl_toc';
  nav.setAttribute('aria-label', 'Daftar isi');
  var root = document.createElement('ul');
  nav.appendChild(root);

  // One entry per heading: { heading, link, section (the top-level <li>) }.
  var entries = [];
  var section = null;
  var sub = null;

  for (var i = 0; i < headings.length; i++) {
    var h = headings[i];
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.title = h.textContent;
    li.appendChild(a);

    if (h.tagName === 'H2' || !section) {
      section = li;
      sub = null;
      root.appendChild(li);
    } else {
      if (!sub) {
        sub = document.createElement('ul');
        sub.className = 'tl_toc_sub';
        section.appendChild(sub);
      }
      sub.appendChild(li);
    }
    entries.push({ heading: h, link: a, section: section });
  }
  document.body.appendChild(nav);

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  nav.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    try {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    } catch (err) {
      target.scrollIntoView();
    }
    if (history.replaceState) history.replaceState(null, '', a.getAttribute('href'));
    a.blur();
    // A section near the end can't scroll up to the top, so the scroll
    // position alone would light up a later one. Hold the clicked entry
    // until the reader scrolls on their own.
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].link === a) { clicked = entries[i]; break; }
    }
    setActive(clicked);
  });

  var clicked = null;
  function release() { clicked = null; }
  window.addEventListener('wheel', release, { passive: true });
  window.addEventListener('touchstart', release, { passive: true });
  window.addEventListener('keydown', release);
  window.addEventListener('mousedown', function (e) {
    if (!nav.contains(e.target)) release();
  });

  var current = null;
  function setActive(entry) {
    if (entry === current) return;
    if (current) {
      current.link.classList.remove('tl_toc_active');
      current.section.classList.remove('tl_toc_open');
    }
    current = entry;
    if (!entry) return;
    entry.link.classList.add('tl_toc_active');
    entry.section.classList.add('tl_toc_open');

    // Keep the highlighted line visible when the rail itself scrolls.
    var l = entry.link.offsetTop;
    if (l < nav.scrollTop || l > nav.scrollTop + nav.clientHeight - 30) {
      nav.scrollTop = l - nav.clientHeight / 3;
    }
  }

  function onScroll() {
    // The last sections are too short to scroll up to ACTIVE_AT. Over the
    // final half screen of scrolling the line slides down to the bottom of
    // the window, so each of them still takes its turn, the last one at the
    // very end of the page.
    var h = window.innerHeight;
    var left = document.documentElement.scrollHeight - window.pageYOffset - h;
    var ramp = h / 2;
    var line = ACTIVE_AT;
    if (left < ramp) line += (h - ACTIVE_AT) * (1 - Math.max(left, 0) / ramp);

    var found = null;
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].heading.getBoundingClientRect().top > line) break;
      found = entries[i];
    }
    setActive(clicked || found || entries[0]);

    // Starts level with the page title, then stays pinned near the top.
    var top = Math.max(content.getBoundingClientRect().top, MIN_TOP);
    nav.style.top = top + 'px';
    nav.style.maxHeight = (window.innerHeight - top - 24) + 'px';
  }

  function onResize() {
    var room = window.innerWidth - content.getBoundingClientRect().right - GAP - EDGE;
    nav.classList.toggle('tl_toc_no_room', room < MIN_WIDTH);
    nav.style.width = Math.min(room, MAX_WIDTH) + 'px';
    onScroll();
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll, { passive: true });
  onResize();
})();
