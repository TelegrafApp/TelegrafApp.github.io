// Hero square dissolve: splits the square into N x N blocks, each showing its
// own piece of the gradient, so CSS can fade them out one by one (see
// .tl_tiles in index.html). The fading is driven by html.tl-preview, which
// js/pricing.js switches off once the page leaves the top.
(function () {
  var frame = document.querySelector('.tl_frame');
  if (!frame) return;

  var N = 2; // blocks per side

  var wrap = document.createElement('div');
  wrap.className = 'tl_tiles';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.style.setProperty('--n', N);
  wrap.style.setProperty('--last', N * N - 1);
  // Order: column by column from the left, top to bottom, so the top-left
  // block goes first and the bottom-right one last.
  for (var y = 0; y < N; y++) {
    for (var x = 0; x < N; x++) {
      var el = document.createElement('i');
      el.style.setProperty('--x', x);
      el.style.setProperty('--y', y);
      el.style.setProperty('--r', x * N + y);
      wrap.appendChild(el);
    }
  }
  frame.insertBefore(wrap, frame.firstChild);
  // When every block is back in (the last starts after (N*N - 1) * 70ms and
  // takes 240ms); the glow waits for it.
  frame.style.setProperty('--tl-blocks-back', ((N * N - 1) * 70 + 240) + 'ms');
  frame.classList.add('tl_tiled'); // the blocks now paint the square
})();
