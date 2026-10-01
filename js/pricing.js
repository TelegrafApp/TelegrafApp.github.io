// Cost comparison: chat app per user + CRM per agent vs Telegraf flat.
(function () {
  var CHAT_PER_USER = 161442;
  var CRM_PER_AGENT = 400000;
  var CRM_MIN_AGENTS = 5;
  var US = 2499000;

  function rp(n) {
    return 'Rp' + Math.round(n).toLocaleString('id-ID');
  }
  function $(id) { return document.getElementById(id); }

  var buttons = document.querySelectorAll('.tl_calc_sizes button');

  function cost(users) {
    var chat = CHAT_PER_USER * users;
    var crm = CRM_PER_AGENT * Math.max(users, CRM_MIN_AGENTS);
    return { chat: chat, crm: crm, total: chat + crm };
  }

  // One fixed scale for every team size, so the bars grow with the team
  // while the flat Telegraf price stays put.
  var scale = US;
  for (var i = 0; i < buttons.length; i++) {
    scale = Math.max(scale, cost(+buttons[i].getAttribute('data-users')).total);
  }

  function render(users) {
    var c = cost(users);
    var chat = c.chat, crm = c.crm, combined = c.total;

    $('tl_calc_combined').textContent = rp(combined);
    $('tl_calc_chat').textContent = rp(chat);
    $('tl_calc_crm').textContent = rp(crm);
    $('tl_calc_us').textContent = rp(US);
    $('tl_calc_save').textContent = rp(combined - US);
    $('tl_calc_bar_chat').style.width = (chat / scale * 100) + '%';
    $('tl_calc_bar_crm').style.width = (crm / scale * 100) + '%';
    $('tl_calc_bar_us').style.width = (US / scale * 100) + '%';

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-users') == users);
    }
  }

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      render(+this.getAttribute('data-users'));
    });
  }
  render(10);
})();

// Top-of-page state on the homepage: html.tl-preview is on while the page
// sits at the top (pricing blurred under a veil that fades the bottom of the
// screen into the background, the hero square whole) and off once scrolled
// away (blur lifts, square dissolves). CSS transitions animate both ways, so
// fast scrolling stays smooth. A copy of the footer sits on the veil at the
// bottom of the screen. Clicking the blurred area scrolls to the plans.
// Without JS there is no blur and no veil.
(function () {
  var veil = document.querySelector('.tl_veil');
  var start = document.querySelector('.tl_pricing_title');
  if (!veil || !start) return;

  // Leave the top state past LEAVE px, come back under ENTER px; the gap
  // keeps it from flickering at the edge.
  var LEAVE = 24;
  var ENTER = 8;

  // Mouse-only copy: keyboard and screen reader users get the real footer.
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
    // Title's top edge in page coordinates, as seen from the top of the page.
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
    if (e.target.closest('.tl_page_footer')) return; // footer links work as usual
    document.getElementById('harga').scrollIntoView({ behavior: 'smooth' });
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', place);
  place();
})();
