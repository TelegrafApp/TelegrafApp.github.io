// Hero frame: the word under "Chat" cycles through business chat features,
// each change scrambling through symbols before the new word settles in,
// left to right. With reduced motion the words simply swap.
(function () {
  var el = document.querySelector('.tl_frame_word');
  if (!el) return;

  var WORDS = ['CRM', 'Group', 'Platform', 'Bot', 'Inbox', 'Omnichannel', 'Support', 'Process', 'Agents'];
  var GLYPHS = '%^{}*#@&$!?<>/[]~+=';
  var HOLD = 2200;     // ms a word stays put
  var SCRAMBLE = 700;  // ms for the next word to settle
  var TICK = 45;       // ms between scrambled frames

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var index = 0;

  function glyph() {
    return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
  }

  function scrambleTo(word, done) {
    var len = Math.max(el.textContent.length, word.length);
    var start = Date.now();
    (function frame() {
      var t = Date.now() - start;
      var out = '';
      for (var i = 0; i < len; i++) {
        // Letter i settles once the sweep reaches it; until then it's noise.
        var settle = SCRAMBLE * 0.35 + SCRAMBLE * 0.65 * (i / len);
        if (t >= settle) out += word.charAt(i);
        else if (i < word.length || t < SCRAMBLE * 0.5) out += glyph();
      }
      el.textContent = out;
      if (t < SCRAMBLE) setTimeout(frame, TICK);
      else { el.textContent = word; done(); }
    })();
  }

  function next() {
    index = (index + 1) % WORDS.length;
    if (reduceMotion) {
      el.textContent = WORDS[index];
      setTimeout(next, HOLD + SCRAMBLE);
    } else {
      scrambleTo(WORDS[index], function () { setTimeout(next, HOLD); });
    }
  }

  el.textContent = WORDS[0];
  setTimeout(next, HOLD);
})();
