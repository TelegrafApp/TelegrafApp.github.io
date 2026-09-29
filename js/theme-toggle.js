// Day/night theme: applies the saved (or system) theme and wires up the
// #theme-toggle button with a circular reveal centred on the button.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  var KEY = 'tl-theme';

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var startDark = saved ? (saved === 'dark') :
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (startDark) root.classList.add('tl-dark');

  if (!btn) return;

  function isDark() { return root.classList.contains('tl-dark'); }
  function bg(theme) { return theme === 'dark' ? '#12181f' : '#ffffff'; }

  var animating = false;
  btn.addEventListener('click', function () {
    if (animating) return;
    animating = true;

    var nextDark = !isDark();
    var r = btn.getBoundingClientRect();
    var px = r.left + r.width / 2;
    var py = r.top + r.height / 2;
    var mx = Math.max(px, window.innerWidth - px);
    var my = Math.max(py, window.innerHeight - py);
    var radius = Math.round(Math.sqrt(mx * mx + my * my));
    var cFull = 'circle(' + radius + 'px at ' + px + 'px ' + py + 'px)';
    var cZero = 'circle(0px at ' + px + 'px ' + py + 'px)';
    var EASE = 'clip-path .5s cubic-bezier(.2,.7,.2,1)';

    var ov = document.createElement('div');
    ov.className = 'tl-reveal';
    ov.style.background = bg('light');

    var clone = document.querySelector('.tl_page_wrap').cloneNode(true);
    clone.id = 'tl-reveal-clone';
    var cb = clone.querySelector('#theme-toggle');
    if (cb) cb.parentNode.removeChild(cb); // don't double up the fixed button
    clone.classList.add('tl-skin-light');
    // The overlay is fixed to the viewport; shift the copy so it lines up
    // with the part of the page currently scrolled into view.
    clone.style.position = 'relative';
    clone.style.top = -window.pageYOffset + 'px';
    clone.style.left = -window.pageXOffset + 'px';
    ov.appendChild(clone);

    var finished = false;
    function done() {
      if (finished) return;
      finished = true;
      root.classList.toggle('tl-dark', nextDark);
      try { localStorage.setItem(KEY, nextDark ? 'dark' : 'light'); } catch (e) {}
      if (ov.parentNode) ov.parentNode.removeChild(ov);
      animating = false;
    }
    function go(target) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          ov.style.transition = EASE;
          ov.style.clipPath = target;
          ov.style.webkitClipPath = target;
        });
      });
    }

    if (nextDark) {
      // DAY -> NIGHT : the light closes into the button (dark already underneath).
      ov.style.clipPath = cFull;
      ov.style.webkitClipPath = cFull;
      document.body.appendChild(ov);
      root.classList.add('tl-dark'); // hidden behind the full light lens
      try { localStorage.setItem(KEY, 'dark'); } catch (e) {}
      go(cZero);
    } else {
      // NIGHT -> DAY : light opens from the button and spreads to the rest.
      ov.style.clipPath = cZero;
      ov.style.webkitClipPath = cZero;
      document.body.appendChild(ov);
      go(cFull);
    }

    ov.addEventListener('transitionend', done);
    setTimeout(done, 750);
  });
})();
