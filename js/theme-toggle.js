// Day/night theme: wires up the #theme-toggle button with a circular reveal
// centred on the button. Each page's <head> applies the saved (or system)
// theme before first paint.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function save(dark) {
    try { localStorage.setItem('tl-theme', dark ? 'dark' : 'light'); } catch (e) {}
  }
  function clip(el, value) {
    el.style.clipPath = value;
    el.style.webkitClipPath = value;
  }

  var animating = false;
  btn.addEventListener('click', function () {
    if (animating) return;
    animating = true;

    var nextDark = !root.classList.contains('tl-dark');
    var r = btn.getBoundingClientRect();
    var px = r.left + r.width / 2;
    var py = r.top + r.height / 2;
    var mx = Math.max(px, window.innerWidth - px);
    var my = Math.max(py, window.innerHeight - py);
    var at = 'px at ' + px + 'px ' + py + 'px)';
    var cFull = 'circle(' + Math.round(Math.sqrt(mx * mx + my * my)) + at;
    var cZero = 'circle(0' + at;

    // A light copy of the page in a viewport-fixed overlay, clipped to a
    // circle that grows from or shrinks into the button.
    var ov = document.createElement('div');
    ov.className = 'tl-reveal';
    ov.style.background = '#ffffff';
    var clone = document.querySelector('.tl_page_wrap').cloneNode(true);
    clone.id = 'tl-reveal-clone';
    clone.classList.add('tl-skin-light');
    // Shift the copy so it lines up with the part of the page in view.
    clone.style.position = 'relative';
    clone.style.top = -window.pageYOffset + 'px';
    clone.style.left = -window.pageXOffset + 'px';
    ov.appendChild(clone);

    // Day -> night: the light closes into the button over the dark page.
    // Night -> day: the light opens from the button over the dark page.
    clip(ov, nextDark ? cFull : cZero);
    document.body.appendChild(ov);
    if (nextDark) { root.classList.add('tl-dark'); save(true); }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        ov.style.transition = 'clip-path .5s cubic-bezier(.2,.7,.2,1)';
        clip(ov, nextDark ? cZero : cFull);
      });
    });

    var finished = false;
    function done() {
      if (finished) return;
      finished = true;
      root.classList.toggle('tl-dark', nextDark);
      save(nextDark);
      ov.remove();
      animating = false;
    }
    ov.addEventListener('transitionend', done);
    setTimeout(done, 750);
  });
})();
