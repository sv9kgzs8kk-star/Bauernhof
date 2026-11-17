/* Knopf „Zur Startseite“ für die Hauptseite jeder Welt (z. B. hof.html).
   Einbinden:  <script>window.START_URL = 'index.html';</script>
               <script src="gemeinsam/startseite.js?v=20261117a"></script>
   Optional:   window.START_POS = 'tl' | 'tr' | 'bl' | 'br'  (Ecke, Standard 'tl')
   Bedienung:  1 Sekunde gedrückt halten (Ring füllt sich), damit Kinder
               nicht aus Versehen die Welt verlassen.                       */
(function () {
  var URL = window.START_URL || 'index.html';
  var POS = window.START_POS || 'tl';
  var HALTEN = 1000;

  var css = document.createElement('style');
  css.textContent =
    '#startKnopf{position:fixed;z-index:9999;width:64px;height:64px;border:0;padding:0;' +
    'background:#fff;box-shadow:0 0 0 4px #2b2b2b,5px 5px 0 4px rgba(0,0,0,.35);' +
    'touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}' +
    '#startKnopf canvas{width:40px;height:40px;image-rendering:pixelated;position:absolute;left:12px;top:12px}' +
    '#startKnopf svg{position:absolute;inset:-10px;width:84px;height:84px;pointer-events:none}' +
    '#startKnopf circle{fill:none;stroke:#ffd23f;stroke-width:6;stroke-dasharray:239;stroke-dashoffset:239;' +
    'transform:rotate(-90deg);transform-origin:50% 50%}' +
    '#startKnopf.laeuft circle{transition:stroke-dashoffset ' + HALTEN + 'ms linear;stroke-dashoffset:0}';
  document.head.appendChild(css);

  var b = document.createElement('button');
  b.id = 'startKnopf';
  b.setAttribute('aria-label', 'Zur Startseite');
  var abst = 'calc(env(safe-area-inset-%s) + 14px)';
  if (POS.indexOf('t') >= 0) b.style.top = abst.replace('%s', 'top'); else b.style.bottom = abst.replace('%s', 'bottom');
  if (POS.indexOf('l') >= 0) b.style.left = abst.replace('%s', 'left'); else b.style.right = abst.replace('%s', 'right');

  var cv = document.createElement('canvas'); cv.width = 10; cv.height = 10;
  var c = cv.getContext('2d');
  [['#7ec850', 0, 0], ['#f5b700', 6, 0], ['#c0392b', 0, 6], ['#3498db', 6, 6]].forEach(function (q) {
    c.fillStyle = q[0]; c.fillRect(q[1], q[2], 4, 4);
  });
  b.appendChild(cv);
  b.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="38"/></svg>');

  var timer = null;
  function start(e) {
    e.preventDefault(); e.stopPropagation();
    if (timer) return;
    b.classList.add('laeuft');
    timer = setTimeout(function () { location.href = URL; }, HALTEN);
  }
  function stopp(e) {
    if (e) e.stopPropagation();
    clearTimeout(timer); timer = null; b.classList.remove('laeuft');
  }
  b.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (t) { b.addEventListener(t, stopp); });
  b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
  window.addEventListener('pageshow', function () { stopp(); });

  if (document.body) document.body.appendChild(b);
  else document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(b); });
})();
