// Hero frame: every business word sits on one line through the square, on
// the baseline of the word under "Chat". The current word sits inside the
// square in black; the rest run off to both sides in grey, fading toward the
// edges. Every few seconds the line slides one word to the left. With reduced
// motion the words step without sliding.
(function () {
  var frame = document.querySelector('.tl_frame');
  var hero = document.querySelector('.tl_hero');
  if (!frame || !hero) return;

  var WORDS = ['CRM', 'Group', 'Platform', 'Bot', 'Inbox', 'Omnichannel', 'Support', 'Process', 'Agents'];
  var HOLD = 2200;   // ms a word stays put
  var SLIDE = 600;   // ms for the line to slide one word (matches the CSS)
  var GAP = 0.24;    // space between words, as a share of the square's width
  var FADE = [1, 1, 0.55, 0.3, 0.14]; // opacity by distance from the square

  var n = WORDS.length;
  var reel = document.createElement('span');
  reel.className = 'tl_reel';
  reel.setAttribute('aria-hidden', 'true');
  var items = WORDS.map(function (w) {
    var b = document.createElement('b');
    b.textContent = w;
    reel.appendChild(b);
    return { el: b, off: null, bold: 0, light: 0 };
  });
  frame.appendChild(reel);
  frame.classList.add('tl_reeled'); // hides the static word

  var index = 0;
  var swapTimer;

  // Signed distance of word i from the current one, in -4..4.
  function offset(i) {
    var d = ((i - index) % n + n) % n;
    return d > n / 2 ? d - n : d;
  }

  // Word widths at both weights (they scale with the square). A hidden copy
  // does the measuring, so the visible words never flip style.
  var ruler = document.createElement('b');
  ruler.style.visibility = 'hidden';
  reel.appendChild(ruler);
  function measure() {
    items.forEach(function (it) {
      ruler.textContent = it.el.textContent;
      ruler.className = 'tl_on';
      it.bold = ruler.offsetWidth;
      ruler.className = '';
      it.light = ruler.offsetWidth;
    });
  }

  function layout() {
    var heroBox = hero.getBoundingClientRect();
    var box = frame.getBoundingClientRect();
    var W = box.width;
    var pad = parseFloat(getComputedStyle(frame).paddingRight) || 0;
    var gap = W * GAP;
    // The reel spans the hero's width; positions below are from the square's
    // left edge, shifted by where the square sits in the reel.
    var shift = box.left - heroBox.left;
    reel.style.left = -shift + 'px';
    reel.style.width = heroBox.width + 'px';

    var x = {};
    x[0] = W - pad - items[index].bold;          // right-aligned inside
    var left = -gap, right = W + gap;
    for (var k = 1; k <= n / 2; k++) {
      var l = items[(index - k + n) % n], r = items[(index + k) % n];
      x[-k] = left - l.light; left = x[-k] - gap;
      x[k] = right; right += r.light + gap;
    }

    items.forEach(function (it, i) {
      var d = offset(i);
      // A word wrapping from one end to the other jumps instead of sliding
      // across the square.
      var wraps = it.off !== null && Math.abs(d - it.off) > 1;
      if (wraps) it.el.style.transition = 'none';
      it.el.style.transform = 'translateX(' + (shift + x[d]) + 'px)';
      it.el.style.opacity = FADE[Math.abs(d)];
      if (wraps) { it.el.offsetWidth; it.el.style.transition = ''; }
      it.off = d;
    });
  }

  // The word turns black and bold about when it crosses into the square, and
  // the old one turns grey as it leaves.
  function restyle(delay) {
    clearTimeout(swapTimer);
    swapTimer = setTimeout(function () {
      items.forEach(function (it, i) { it.el.classList.toggle('tl_on', i === index); });
    }, delay);
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function next() {
    index = (index + 1) % n;
    layout();
    restyle(reduceMotion ? 0 : SLIDE / 2);
    setTimeout(next, HOLD + SLIDE);
  }

  // The square's size follows the viewport (including its height), so lay out
  // again whenever it or the hero changes size. Placing (first load, resize,
  // fonts arriving) snaps; only the timed step slides, so the words always
  // come in from the right.
  function refit() {
    reel.classList.remove('tl_ready');
    measure();
    layout();
    reel.offsetWidth; // apply the new places before transitions come back
    reel.classList.add('tl_ready');
  }
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(refit);
    ro.observe(frame);
    ro.observe(hero);
  } else {
    window.addEventListener('resize', refit);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refit);
  }

  items[0].el.classList.add('tl_on');
  refit();
  setTimeout(next, HOLD);
})();
