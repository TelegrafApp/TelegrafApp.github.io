(function () {
  var frame = document.querySelector('.tl_frame');
  var hero = document.querySelector('.tl_hero');
  if (!frame || !hero) return;

  var WORDS = ['CRM', 'Group', 'Platform', 'Bot', 'Inbox', 'Omnichannel', 'Support', 'Process', 'Agents'];
  var HOLD = 2200;
  var SLIDE = 600;
  var GAP = 0.24;
  var FADE = [1, 1, 0.55, 0.3, 0.14];

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
  frame.classList.add('tl_reeled');

  var index = 0;
  var swapTimer;

  function offset(i) {
    var d = ((i - index) % n + n) % n;
    return d > n / 2 ? d - n : d;
  }

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
    var shift = box.left - heroBox.left;
    reel.style.left = -shift + 'px';
    reel.style.width = heroBox.width + 'px';

    var x = {};
    x[0] = W - pad - items[index].bold;
    var left = -gap, right = W + gap;
    for (var k = 1; k <= n / 2; k++) {
      var l = items[(index - k + n) % n], r = items[(index + k) % n];
      x[-k] = left - l.light; left = x[-k] - gap;
      x[k] = right; right += r.light + gap;
    }

    items.forEach(function (it, i) {
      var d = offset(i);
      var wraps = it.off !== null && Math.abs(d - it.off) > 1;
      if (wraps) it.el.style.transition = 'none';
      it.el.style.transform = 'translateX(' + (shift + x[d]) + 'px)';
      it.el.style.opacity = FADE[Math.abs(d)];
      if (wraps) { it.el.offsetWidth; it.el.style.transition = ''; }
      it.off = d;
    });
  }

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

  function refit() {
    reel.classList.remove('tl_ready');
    measure();
    layout();
    reel.offsetWidth;
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

  frame.addEventListener('click', function () {
    document.getElementById('harga').scrollIntoView({ behavior: 'smooth' });
  });

  items[0].el.classList.add('tl_on');
  refit();
  setTimeout(next, HOLD);
})();
