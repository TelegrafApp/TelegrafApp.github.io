(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  var mq = window.matchMedia && matchMedia('(prefers-color-scheme: dark)');
  var animating = false;

  function onSystemChange(e) {
    try { localStorage.removeItem('tl-theme'); } catch (err) {}
    if (!animating) root.classList.toggle('tl-dark', e.matches);
  }
  if (mq) {
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }

  if (!btn) return;

  function save(dark) {
    try {
      if (mq && dark === mq.matches) localStorage.removeItem('tl-theme');
      else localStorage.setItem('tl-theme', dark ? 'dark' : 'light');
    } catch (e) {}
  }
  function clip(el, value) {
    el.style.clipPath = value;
    el.style.webkitClipPath = value;
  }

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

    var ov = document.createElement('div');
    ov.className = 'tl-reveal';
    ov.style.background = '#ffffff';
    var clone = document.querySelector('.tl_page_wrap').cloneNode(true);
    clone.id = 'tl-reveal-clone';
    clone.classList.add('tl-skin-light');
    clone.style.position = 'relative';
    clone.style.top = -window.pageYOffset + 'px';
    clone.style.left = -window.pageXOffset + 'px';
    ov.appendChild(clone);

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
