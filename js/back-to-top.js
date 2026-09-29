// telegram.org-style "go up" strip down the left edge; shown once the page is
// scrolled, clicking it glides back to the top. Styles live in subpage.css.
(function () {
  var SHOW_AFTER = 400;
  var MIN_WIDTH = 96;  // narrowest strip that still fits the label
  var GAP = 24;        // space kept between the strip and the page content

  var content = document.querySelector('.tl_legal_wrap, .tl_pricing_wrap');

  var wrap = document.createElement('a');
  wrap.className = 'back_to_top_wrap';
  wrap.href = '#';
  wrap.setAttribute('aria-label', 'Kembali ke atas');
  wrap.innerHTML =
    '<div class="back_to_top">' +
      '<svg class="tl_to_top_ic" viewBox="0 0 16 9" aria-hidden="true">' +
        '<path d="M1.5 7.5 8 1.5l6.5 6"/>' +
      '</svg>Ke atas' +
    '</div>';
  document.body.appendChild(wrap);

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  wrap.addEventListener('click', function (e) {
    e.preventDefault();
    try {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    } catch (err) {
      window.scrollTo(0, 0);
    }
    wrap.blur();
  });

  // The hit area covers the empty margin left of the content, so the pointer
  // doesn't have to reach the window edge; the visible strip stays narrow.
  // Too little margin: no strip.
  function onResize() {
    var room = content ? content.getBoundingClientRect().left - GAP : MIN_WIDTH;
    wrap.classList.toggle('back_to_top_no_room', room < MIN_WIDTH);
    wrap.style.width = Math.max(room, MIN_WIDTH) + 'px';
  }

  function onScroll() {
    wrap.classList.toggle('back_to_top_shown', window.pageYOffset > SHOW_AFTER);
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll, { passive: true });
  onResize();
  onScroll();
})();
