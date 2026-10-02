(function () {
  var veil = document.querySelector('.tl_veil');
  var start = document.querySelector('.tl_pricing_title');
  if (!veil || !start) return;

  var LEAVE = 24;
  var ENTER = 8;

  var footer = document.querySelector('.tl_page_footer');
  if (footer) {
    var copy = footer.cloneNode(true);
    var ids = copy.querySelectorAll('[id]');
    for (var i = 0; i < ids.length; i++) ids[i].removeAttribute('id');
    var links = copy.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) links[i].setAttribute('tabindex', '-1');
    veil.appendChild(copy);
  }

  function place() {
    var top = start.getBoundingClientRect().top + window.pageYOffset - 16;
    var h = window.innerHeight - top;
    veil.style.height = Math.max(h, 0) + 'px';
    update();
  }

  var root = document.documentElement;
  var atTop = true;

  function update() {
    var y = window.pageYOffset;
    if (atTop && y > LEAVE) atTop = false;
    else if (!atTop && y < ENTER) atTop = true;
    root.classList.toggle('tl-preview', atTop);
  }

  veil.addEventListener('click', function (e) {
    if (e.target.closest('.tl_page_footer')) return;
    document.getElementById('harga').scrollIntoView({ behavior: 'smooth' });
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', place);
  place();
})();
