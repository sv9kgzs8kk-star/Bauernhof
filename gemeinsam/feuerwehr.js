/* =====================================================================
   FEUERWEHR – gemeinsam für die Wache (feuerwache/) und die Einsätze (feuerwache/spiele/einsatz/)
   Fahrzeuge von oben, Werkzeuge, Katze, Feuerwehranzug, Liste der Einsätze
   ===================================================================== */
Object.assign(WORDS, {
  lf: ['LÖSCHFAHRZEUG', 'Löschfahrzeug'], dlk: ['DREHLEITER', 'Drehleiter'], basket: ['KORB', 'Korb'], rw: ['RÜSTWAGEN', 'Rüstwagen'], alarm: ['ALARM', 'Alarm'], gear: ['FEUERWEHRANZUG', 'Feuerwehranzug'],
  ladder: ['LEITER', 'Leiter'], hose: ['SCHLAUCH', 'Schlauch'], cutter: ['RETTUNGSSCHERE', 'Rettungsschere'], chainsaw: ['KETTENSÄGE', 'Kettensäge'],
  cat: ['KATZE', 'Katze'], cattree: ['KATZE IM BAUM', 'Katze im Baum'], thanks: ['DANKE', 'Danke']
});
// Einsätze: welche Fahrzeuge ausrücken, welches Werkzeug hilft
const EINSAETZE = {
  katze: { word: 'cattree', veh: ['dlk'], tool: 'ladder', tools: ['ladder', 'hose', 'cutter', 'chainsaw'] },
};
const EINSATZ_KEYS = Object.keys(EINSAETZE);
// Feuerwehranzug fürs Kind (KID aus moebel.js): gelber Helm, dunkelblaue Jacke mit gelbem Streifen
const GEAR_PAL = { h: '#ffd23f', r: '#24346b', w: '#ffd23f', b: '#24346b', n: '#111' };

// Feuerwehrauto von oben. x0,y0 = linke obere Ecke, L = Länge, Wd = Breite.
// dir 'down': Fahrerhaus unten (steht in der Halle vor dem Tor), 'right': fährt nach rechts. on = Blaulicht an, glow = Schein drumherum
// deployed (nur Drehleiter): Leiter ist vom Dach weg (ausgefahren), Stützen stehen seitlich heraus
function drawFireTruck(F, x0, y0, L, Wd, key, dir = 'down', on = false, glow = false, deployed = false) {
  const P = dir === 'right' ? (c, u, v, du, dv) => F(c, Math.round(x0 + u), Math.round(y0 + v), du, dv) : (c, u, v, du, dv) => F(c, Math.round(x0 + v), Math.round(y0 + u), dv, du);
  const h = L, w = Wd, cab = Math.round(h * 0.26);
  P('rgba(0,0,0,.25)', 4, 3, h, w);
  for (const u of [Math.round(h * 0.15), Math.round(h * 0.45), h - cab + 4]) { P('#1b1b1b', u, -2, 10, 3); P('#1b1b1b', u, w - 1, 10, 3); }   // Räder
  P('#8e1f1f', 0, 0, h, w); P('#c0392b', 1, 1, h - 2, w - 2);
  P('#f2f2f2', h - cab - 3, 1, 2, w - 2); P('#ffd23f', h - cab - 1, 1, 1, w - 2);                                   // Streifen vor dem Fahrerhaus
  P('#a92f22', h - cab + 1, 2, cab - 7, w - 4); P('#1c3f6e', h - 6, 3, 4, w - 6); P('#6cc4f0', h - 6, 4, 1, w - 8);   // Fahrerhaus-Dach, Frontscheibe
  P('#333', h - cab + 3, -3, 3, 3); P('#333', h - cab + 3, w, 3, 3);                                               // Spiegel
  const lb = Math.round(w * 0.5), l0 = Math.round((w - lb) / 2);
  P('#333', h - cab + 2, l0, 4, lb); P(on ? '#3fa9f5' : '#1c5e9e', h - cab + 3, l0 + 1, 2, (lb >> 1) - 1); P(on ? '#1c5e9e' : '#3fa9f5', h - cab + 3, Math.round(w / 2), 2, (lb >> 1) - 1);
  if (glow) P(on ? 'rgba(63,169,245,.35)' : 'rgba(63,169,245,.15)', h - cab - 6, -8, 16, w + 16);
  const top = 3, bh = h - cab - 9;
  if (key === 'dlk') {                                 // Drehleiter: Drehkranz hinten, Leiterpaket nach vorne übers Fahrerhaus, Korb vorne
    if (deployed) for (const u of [8, h - cab - 8]) { P('#555', u, -9, 4, 9); P('#555', u, w, 4, 9); P('#333', u - 1, -11, 6, 3); P('#333', u - 1, w + 8, 6, 3); }   // Stützen
    const tu = top + Math.round(bh * 0.28), tr = Math.round(w * 0.32), c = Math.round(w / 2);
    P('#555', tu - tr, c - tr, 2 * tr, 2 * tr); P('#8a8f94', tu - tr + 2, c - tr + 2, 2 * tr - 4, 2 * tr - 4); P('#c0392b', tu - 3, c - 3, 6, 6);   // Drehkranz
    if (!deployed) {
      P('#7f8388', tu, c - 6, h - tu + 2, 12); P('#c8ccd0', tu, c - 5, h - tu + 2, 2); P('#c8ccd0', tu, c + 3, h - tu + 2, 2);
      for (let u = tu + 4; u < h; u += 5) P('#c8ccd0', u, c - 3, 1, 6);
      P('#e8e8e8', h - 2, c - 8, 6, 16); P('#9aa0a6', h - 2, c - 8, 6, 2); P('#9aa0a6', h - 2, c + 6, 6, 2);   // Korb ragt vorne heraus
    }
  } else if (key === 'lf') {                           // Löschfahrzeug: Leiter und Schlauchhaspel
    P('#9aa0a6', top, 4, bh, w - 8); P('#c8ccd0', top + 2, 6, bh - 4, 3); P('#c8ccd0', top + 2, w - 9, bh - 4, 3);
    for (let u = top + 5; u < top + bh - 3; u += 6) P('#c8ccd0', u, 9, 2, w - 18);
    const r = Math.round(w * 0.18), c = Math.round(w / 2);
    P('#555', top + bh - 2 * r - 4, c - r, 2 * r, 2 * r); P('#e8e2d0', top + bh - 2 * r - 2, c - r + 2, 2 * r - 4, 2 * r - 4); P('#555', top + bh - r - 6, c - 2, 4, 4);
  } else {                                             // Rüstwagen: Geräteboxen und Lichtmast
    const b3 = Math.round(bh / 3);
    for (let i = 0; i < 3; i++) { const u = top + i * b3; P('#e8e8e8', u + 1, 4, b3 - 3, w - 8); P('#b8b8b8', u + b3 - 3, 4, 1, w - 8); }
    P('#555', top + 4, Math.round(w / 2) - 3, 6, 6); P('#ffd23f', top + 5, Math.round(w / 2) - 2, 4, 4);
  }
  P('#ffd23f', Math.round(h * 0.3), 0, Math.round(h * 0.4), 1); P('#ffd23f', Math.round(h * 0.3), w - 1, Math.round(h * 0.4), 1);   // Warnstreifen
}

// Werkzeug-Bild (16×16 Raster, Pixelgröße s) für die Werkzeugleiste
function drawToolIcon(F, x, y, s, key) {
  const P = (c, a, b, w, h) => F(c, x + a * s, y + b * s, w * s, h * s);
  if (key === 'ladder') { P('#7f8388', 3, 0, 2, 16); P('#7f8388', 11, 0, 2, 16); P('#c8ccd0', 3, 0, 1, 16); P('#c8ccd0', 11, 0, 1, 16); for (let b = 2; b < 16; b += 4) P('#c8ccd0', 5, b, 6, 2); }
  else if (key === 'hose') {
    for (let b = 0; b < 16; b++) for (let a = 0; a < 16; a++) { const d = Math.hypot(a - 7.5, b - 7.5); if (d < 7.5 && d > 2.5) P(Math.floor(d) % 2 ? '#e8e2d0' : '#c8bfa4', a, b, 1, 1); }
    P('#555', 6, 6, 4, 4); P('#9aa0a6', 13, 12, 3, 3); P('#e8e2d0', 11, 11, 3, 2);
  } else if (key === 'cutter') {
    P('#222', 2, 1, 3, 7); P('#222', 9, 1, 3, 7); P('#555', 4, 0, 2, 3); P('#555', 8, 0, 2, 3);   // Backen
    P('#ffd23f', 5, 7, 4, 4); P('#222', 6, 8, 2, 2);                                            // Gelenk
    P('#ffd23f', 4, 11, 2, 5); P('#ffd23f', 8, 11, 2, 5); P('#e0b000', 4, 15, 6, 1);              // Griffe
  } else if (key === 'chainsaw') {
    P('#e67e22', 1, 5, 8, 7); P('#f39c33', 2, 6, 6, 2); P('#333', 2, 3, 5, 2); P('#333', 1, 3, 1, 4);   // Motor, Griff
    P('#9aa0a6', 9, 7, 7, 4); P('#c8ccd0', 9, 7, 7, 1); for (let a = 9; a < 16; a += 2) { P('#333', a, 6, 1, 1); P('#333', a, 11, 1, 1); }
  }
}

// Katze, sitzend (10×9), Pixelgröße s
const CAT_PX = ['.o..o.....', '.oooo.....', '.kooko....', '.oopoo...o', '..oooo...o', '.oooooo.oo', '.oowooooo.', '.oooooooo.', '.o.o..o.o.'];
const CAT_PAL = { o: '#f39c33', k: '#222', p: '#ff8fa3', w: '#fff3e0' };
function drawCat(F, x, y, s = 1, flip = false) {
  CAT_PX.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') F(CAT_PAL[ch], x + (flip ? 9 - i : i) * s, y + j * s, s, s); }));
}
// Kind von vorne (KID aus moebel.js) mit beliebiger Farbe; K = Pixelgröße, (x, y) = Fußmitte
function drawKidPal(F, x, y, pal, K = 2, flip = false, step = false, helmet = false) {
  const fr = step ? KID.b : KID.a, w = 10 * K, h = 13 * K, P = Object.assign({}, KID.pal, pal || {});
  F('rgba(0,0,0,.25)', Math.round(x - w / 2) + K, Math.round(y) - 2 * K, w, 2 * K);
  fr.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') F(P[ch], Math.round(x - w / 2) + (flip ? 9 - i : i) * K, Math.round(y - h) + j * K, K, K); }));
  if (helmet) { F('#e0b000', Math.round(x - w / 2) + 2 * K, Math.round(y - h) - K, 6 * K, K); F('#ffd23f', Math.round(x - w / 2), Math.round(y - h) + 2 * K, w, K); }
}
// Kleines Bild des Einsatzes (für die Alarm-Anzeige), etwa 30×24 Pixel
function drawEinsatzIcon(F, x, y, key) {
  if (key === 'katze') {
    F('#6b4423', x + 13, y + 14, 4, 10); F('#24561f', x + 4, y + 2, 22, 14); F('#3f8f37', x + 5, y + 3, 20, 12); F('#5cb64f', x + 7, y + 4, 8, 4);
    drawCat(F, x + 10, y - 4, 1);
  }
}
