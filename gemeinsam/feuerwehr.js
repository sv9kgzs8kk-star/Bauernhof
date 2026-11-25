/* =====================================================================
   FEUERWEHR – gemeinsam für die Wache (feuerwache/) und die Einsätze (feuerwache/spiele/einsatz/)
   Fahrzeuge von oben, Werkzeuge, Katze, Feuerwehranzug, Liste der Einsätze
   ===================================================================== */
Object.assign(WORDS, {
  lf: ['LÖSCHFAHRZEUG', 'Löschfahrzeug'], dlk: ['DREHLEITER', 'Drehleiter'], basket: ['KORB', 'Korb'], rw: ['RÜSTWAGEN', 'Rüstwagen'], alarm: ['ALARM', 'Alarm'], gear: ['FEUERWEHRANZUG', 'Feuerwehranzug'],
  ladder: ['LEITER', 'Leiter'], hose: ['SCHLAUCH', 'Schlauch'], cutter: ['RETTUNGSSCHERE', 'Rettungsschere'], chainsaw: ['KETTENSÄGE', 'Kettensäge'],
  cat: ['KATZE', 'Katze'], cattree: ['KATZE IM BAUM', 'Katze im Baum'], thanks: ['DANKE', 'Danke'],
  binfire: ['MÜLLTONNE BRENNT', 'Mülltonne brennt'], housefire: ['HAUS BRENNT', 'Haus brennt'], smallfire: ['KLEINES HAUS BRENNT', 'Kleines Haus brennt'], treeroad: ['BAUM AUF DER STRASSE', 'Baum auf der Straße'], crash: ['AUTOUNFALL', 'Autounfall'], ballroof: ['BALL AUF DEM DACH', 'Ball auf dem Dach'], astcar: ['AST AUF AUTO', 'Ast auf Auto'], branch: ['AST', 'Ast'], amb: ['KRANKENWAGEN', 'Krankenwagen'], tow: ['ABSCHLEPPWAGEN', 'Abschleppwagen'], plaster: ['PFLASTER', 'Pflaster'], crane: ['KRAN', 'Kran'], ball: ['BALL', 'Ball'], car: ['AUTO', 'Auto'], tree: ['BAUM', 'Baum'], wood: ['HOLZ', 'Holz'], fire: ['FEUER', 'Feuer'], bin: ['MÜLLTONNE', 'Mülltonne']
});
// Einsätze: welche Fahrzeuge ausrücken, welches Werkzeug hilft
const EINSAETZE = {
  katze: { word: 'cattree', veh: ['dlk'], tool: 'ladder', tools: ['ladder', 'hose', 'cutter', 'chainsaw'] },
  haus: { word: 'housefire', veh: ['lf', 'dlk'], tool: 'hose', tools: ['ladder', 'hose', 'cutter', 'chainsaw'] },    // Mehrfamilienhaus: Löschfahrzeug + Drehleiter, erst Feuer unter der Person, Person retten, dann Rest löschen
  ball: { word: 'ballroof', veh: ['dlk'], tool: 'ladder', tools: ['ladder', 'hose', 'cutter', 'chainsaw'] },    // kleiner Einsatz: Ball auf dem Dach (Drehleiter)
  unfall: { word: 'crash', veh: ['lf'], tool: 'cutter', tools: ['ladder', 'hose', 'cutter', 'chainsaw'] },   // Autounfall: Tür klemmt (Rettungsschere ist im Löschfahrzeug)
  baum: { word: 'treeroad', veh: ['lf'], tool: 'chainsaw', tools: ['ladder', 'hose', 'cutter', 'chainsaw'] }, // umgestürzter Baum (Kettensäge ist im Löschfahrzeug)
  ast: { word: 'astcar', veh: ['lf'], tool: 'chainsaw', tools: ['ladder', 'hose', 'cutter', 'chainsaw'] },    // Ast auf Auto: erst Kettensäge, dann Rettungsschere (Fahrerin eingeklemmt)
  klein: { word: 'smallfire', veh: ['lf'], tool: 'hose', tools: ['ladder', 'hose', 'cutter', 'chainsaw'] },   // kleines Haus brennt: ein Fenster, dauert länger als die Mülltonne
  muell: { word: 'binfire', veh: ['lf'], tool: 'hose', tools: ['ladder', 'hose', 'cutter', 'chainsaw'] },   // kleines Feuer: Mülltonne am Gehweg (Löschfahrzeug)
};
const EINSATZ_KEYS = Object.keys(EINSAETZE);
// Feuerwehranzug fürs Kind (KID aus moebel.js): gelber Helm, dunkelblaue Jacke mit gelbem Streifen
const GEAR_PAL = { h: '#ffd23f', r: '#24346b', w: '#ffd23f', b: '#24346b', n: '#111' };

// Feuerwehrauto von der Seite (Einsätze, Michael: einheitliche Perspektive). x = hinten links, by = Unterkante der Räder, L = Länge, fährt nach rechts.
// key 'lf' = Löschfahrzeug (hoher Aufbau mit Rollläden, Steckleiter auf dem Dach), 'dlk' = Drehleiter (niedriger Aufbau, Drehkranz hinten,
// Leiterpaket übers Fahrerhaus, Korb vorne); deployed = Stützen unten, Leiter nicht gezeichnet (die zeichnet das Spiel vom Drehkranz zum Korb).
// Drehkranz der Drehleiter liegt bei (x + round(L * 0.32), by - 27).
function drawFireTruckSide(F, x, by, L, key, on = false, deployed = false) {
  x = Math.round(x); by = Math.round(by);
  const dlk = key === 'dlk', cx = x + L - 25, bodyTop = dlk ? by - 23 : by - 30, active = on !== null;
  F('rgba(0,0,0,.25)', x + 2, by - 2, L - 2, 3);
  if (dlk && deployed) for (const sx of [x + 5, x + L - 31]) { F('#555', sx, by - 12, 4, 14); F('#333', sx - 2, by + 1, 8, 2); F('#ffd23f', sx, by - 8, 4, 2); }   // Stützen
  F('#333', x + 2, by - 11, L - 4, 3);                                                     // Fahrgestell
  // Aufbau
  F('#7a1a12', x, bodyTop, L - 25, by - 9 - bodyTop); F('#c0392b', x + 1, bodyTop + 1, L - 27, by - 11 - bodyTop); F('#e0604c', x + 1, bodyTop + 1, L - 27, 1);
  if (!dlk) { const n = 3, pw = Math.floor((L - 33) / n);                                  // Rollläden der Geräteräume
    for (let i = 0; i < n; i++) { const px = x + 3 + i * (pw + 1); F('#9aa0a6', px, bodyTop + 4, pw, by - 17 - bodyTop); for (let yy = bodyTop + 5; yy < by - 13; yy += 2) F('#c8ccd0', px, yy, pw, 1); F('#555', px + Math.round(pw / 2) - 1, by - 15, 3, 1); }
    F('#c8ccd0', x + 3, bodyTop - 3, L - 31, 1); F('#c8ccd0', x + 3, bodyTop - 1, L - 31, 1);   // Steckleiter auf dem Dach
    for (let lx = x + 5; lx < x + L - 29; lx += 5) F('#9aa0a6', lx, bodyTop - 3, 1, 3);
  } else { for (let i = 0; i < 3; i++) { const px = x + 3 + i * 16; F('#b8bcc0', px, bodyTop + 3, 14, by - 16 - bodyTop); F('#555', px + 6, by - 15, 3, 1); } }   // Geräteklappen
  F('#ffd23f', x, by - 13, L - 25, 1); F('#f2f2f2', x, by - 12, L - 25, 1);               // Warnstreifen
  F('#555', x - 1, by - 12, 2, 3);                                                         // Trittstufe hinten
  // Fahrerhaus (vorne rechts): schräge Scheibe, Seitenfenster, Tür
  const ct = by - 28;
  for (let yy = ct; yy < by - 9; yy++) { const slope = yy < by - 18 ? Math.round((by - 18 - yy) * 0.45) : 0; F(yy === ct ? '#e0604c' : '#c0392b', cx, yy, 25 - slope, 1); }
  F('#7a1a12', cx, ct, 1, by - 9 - ct);
  for (let yy = ct + 3; yy < by - 19; yy++) { const slope = Math.round((by - 18 - yy) * 0.45); F('#1c2430', cx + 17, yy, 7 - slope, 1); F('#3d8fc9', cx + 18, yy, 5 - slope, 1); }   // Windschutzscheibe
  F('#1c2430', cx + 3, ct + 3, 12, 7); F('#3d8fc9', cx + 4, ct + 4, 10, 5); F('#6cc4f0', cx + 4, ct + 4, 4, 5); F('#d6f2ff', cx + 9, ct + 4, 1, 3);   // Seitenfenster
  F('#7a1a12', cx + 2, ct + 3, 1, by - 12 - ct - 3); F('#7a1a12', cx + 16, ct + 3, 1, by - 12 - ct - 3); F('#333', cx + 12, by - 17, 3, 1);   // Tür
  F('#f2f2f2', cx + 3, by - 15, 12, 1);
  F('#3a3a3a', x + L - 3, by - 12, 3, 3); F('#fff6c0', x + L - 2, by - 16, 2, 3); F('#e03b3b', x, by - 17, 1, 3);   // Stoßstange, Scheinwerfer, Rücklicht
  // Blaulichter: Balken auf dem Fahrerhaus, eins hinten
  const lamp = (lx, ly, lit) => { F('#163a63', lx, ly, 6, 3); F(lit ? '#5cc0ff' : '#1c5e9e', lx + 1, ly, 4, 2); if (lit) F('rgba(92,192,255,.35)', lx - 2, ly - 2, 10, 6); };
  F('#333', cx + 5, ct - 1, 14, 1); lamp(cx + 5, ct - 3, active && on); lamp(cx + 13, ct - 3, active && !on); lamp(x + 2, bodyTop - (dlk ? 3 : 6), active && !on);
  if (dlk) {                                           // Drehkranz hinten, Leiterpaket nach vorne übers Fahrerhaus, Korb vorne
    const tx = x + Math.round(L * 0.32);
    F('#555', tx - 8, by - 26, 16, 3); F('#8a8f94', tx - 6, by - 27, 12, 2); F('#c0392b', tx - 3, by - 30, 6, 4);
    if (!deployed) { const x1 = x + L - 3;
      for (let lx = tx; lx < x1; lx++) { const yy = by - 31 - Math.round((lx - tx) * 0.04); F('#7f8388', lx, yy, 1, 4); F('#c8ccd0', lx, yy, 1, 1); F('#c8ccd0', lx, yy + 3, 1, 1); if ((lx - tx) % 5 === 0) F('#c8ccd0', lx, yy, 1, 4); }
      F('#9aa0a6', x1 - 2, by - 38, 9, 7); F('#e8e8e8', x1 - 1, by - 37, 7, 5); F('#c0392b', x1 - 1, by - 35, 7, 1); }   // Korb
  }
  // Räder
  for (const wx of dlk ? [x + 11, x + 24, x + L - 15] : [x + 14, x + L - 15]) { F('#1b1b1b', wx - 5, by - 11, 10, 11); F('#1b1b1b', wx - 6, by - 10, 12, 9); F('#9aa0a6', wx - 2, by - 7, 4, 4); F('#555', wx - 1, by - 6, 2, 2); }
}

// Feuerwehrauto von oben. x0,y0 = linke obere Ecke, L = Länge, Wd = Breite.
// dir 'down': Fahrerhaus unten (steht in der Halle vor dem Tor), 'right': fährt nach rechts.
// on = Blaulicht-Takt (true/false wechseln = blinkt; null = Blaulichter aus), glow = blauer Schein drumherum
// deployed (nur Drehleiter): Leiter ist vom Dach weg (ausgefahren), Stützen stehen seitlich heraus
// Michael: richtige Windschutzscheibe, Blaulichter an den 4 Ecken, rund statt eckig
function drawFireTruck(F, x0, y0, L, Wd, key, dir = 'down', on = false, glow = false, deployed = false) {
  const P = dir === 'right' ? (c, u, v, du, dv) => F(c, Math.round(x0 + u), Math.round(y0 + v), du, dv) : (c, u, v, du, dv) => F(c, Math.round(x0 + v), Math.round(y0 + u), dv, du);
  const h = L, w = Wd, cab = Math.round(h * 0.26), s = clamp(Math.round(w * 0.13), 4, 7);   // s = Größe eines Blaulichts
  const ws = Math.max(5, Math.round(cab * 0.42)), u0 = h - 2 - ws;                         // Windschutzscheibe: ws tief, beginnt bei u0
  P('rgba(0,0,0,.25)', 4, 3, h, w);
  if (glow) P(on ? 'rgba(63,169,245,.45)' : 'rgba(63,169,245,.22)', -6, -7, h + 12, w + 14);
  for (const u of [Math.round(h * 0.15), Math.round(h * 0.45), h - cab + 4]) { P('#1b1b1b', u, -2, 10, 3); P('#1b1b1b', u, w - 1, 10, 3); }   // Räder
  P('#7a1a12', 0, 0, h, w); P('#c0392b', 1, 1, h - 2, w - 2); P('#e0604c', 1, 1, h - 2, 1); P('#a93226', 1, w - 3, h - 2, 2);   // Aufbau mit Licht- und Schattenkante
  P('#555', 0, 2, 2, w - 4);                                                                                        // Trittbrett hinten
  P('#f2f2f2', h - cab - 3, 1, 2, w - 2); P('#ffd23f', h - cab - 1, 1, 1, w - 2);                                   // Streifen vor dem Fahrerhaus
  P('#b23527', h - cab + 1, 2, u0 - (h - cab + 1) - 1, w - 4); P('#cf4a3a', h - cab + 1, 2, 1, w - 4);              // Fahrerhaus-Dach
  // Windschutzscheibe: dunkler Rahmen, blaues Glas, zwei helle Spiegelungen schräg, Scheibenwischer
  P('#1c2430', u0 - 1, 2, ws + 1, w - 4); P('#3d8fc9', u0, 3, ws - 1, w - 6); P('#6cc4f0', u0, 3, Math.max(1, ws >> 1), w - 6);
  for (let i = 0; i < ws - 1; i++) { P('#d6f2ff', u0 + i, 5 + (ws - 2 - i), 1, 2); if (w > 30) P('#bfe9ff', u0 + i, 10 + (ws - 2 - i), 1, 1); }
  P('#222', u0 + ws - 2, Math.round(w * 0.28), 1, Math.round(w * 0.16)); P('#222', u0 + ws - 2, Math.round(w * 0.58), 1, Math.round(w * 0.16));
  P('#3a3a3a', h - 2, 1, 2, w - 2); P('#fff6c0', h - 2, 2, 2, 3); P('#fff6c0', h - 2, w - 5, 2, 3);                 // Stoßstange, Scheinwerfer
  P('#333', u0 - 2, -3, 3, 3); P('#333', u0 - 2, w, 3, 3);                                                         // Spiegel
  // Blaulichter an den 4 Ecken (abgerundet): vorne direkt hinter der Scheibe, hinten an den Ecken; blinken über Kreuz
  const lamp = (u, v, lit) => {
    P('#163a63', u, v + 1, s, s - 2); P('#163a63', u + 1, v, s - 2, s);
    const c = lit ? '#5cc0ff' : '#1c5e9e'; P(c, u + 1, v + 2, s - 2, s - 4); P(c, u + 2, v + 1, s - 4, s - 2);
    P(lit ? '#e6f6ff' : '#3f7fbf', u + 1 + (s > 5 ? 1 : 0), v + 1 + (s > 5 ? 1 : 0), 1, 1);
    if (lit) P('rgba(92,192,255,.35)', u - 2, v - 2, s + 4, s + 4);
  };
  const active = on !== null, fu = u0 - s - 2;
  const top = s + 4, bh = h - cab - 6 - top;
  if (key === 'dlk') {                                 // Drehleiter: Drehkranz hinten, Leiterpaket nach vorne übers Fahrerhaus, Korb vorne
    if (deployed) for (const u of [8, h - cab - 8]) { P('#555', u, -9, 4, 9); P('#555', u, w, 4, 9); P('#333', u - 1, -11, 6, 3); P('#333', u - 1, w + 8, 6, 3); }   // Stützen
    const tu = top + Math.round(bh * 0.28), tr = Math.round(w * 0.32), c = Math.round(w / 2);
    for (let i = -tr; i < tr; i++) { const q = Math.round(Math.sqrt(tr * tr - (i + 0.5) ** 2));   // Drehkranz rund
      P('#555', tu + i, c - q, 1, 2 * q); if (q > 2) P(i < -tr / 3 ? '#a8adb2' : '#8a8f94', tu + i, c - q + 2, 1, 2 * q - 4); }
    P('#c0392b', tu - 3, c - 3, 6, 6);
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
  lamp(fu, 2, active && on); lamp(fu, w - 2 - s, active && !on); lamp(2, 2, active && !on); lamp(2, w - 2 - s, active && on);
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
  } else if (key === 'haus') {                         // Mehrfamilienhaus: 3 Etagen, graues Dach, Flammen
    F('#e6d3b0', x + 6, y + 2, 18, 22); F('#6f757d', x + 4, y - 1, 22, 3);
    for (const [wx, wy] of [[8, 5], [14, 5], [20, 5], [8, 12], [20, 12], [8, 18], [20, 18]]) F('#6cc4f0', x + wx, y + wy, 3, 3);
    F('#6b4423', x + 14, y + 18, 3, 6); F('#e74c3c', x + 13, y + 9, 6, 7); F('#ffd23f', x + 15, y + 11, 2, 4); F('#e74c3c', x + 19, y + 2, 5, 5); F('#ffd23f', x + 20, y + 4, 2, 2);
    F('rgba(90,90,90,.8)', x + 16, y - 6, 6, 4);
  } else if (key === 'klein') {                        // kleines Haus mit einem brennenden Fenster
    F('#f0e4c8', x + 4, y + 12, 22, 12); F('#b5442e', x + 2, y + 8, 26, 4); F('#b5442e', x + 6, y + 5, 18, 3); F('#8a5a3b', x + 20, y + 2, 3, 5);
    F('#6cc4f0', x + 19, y + 15, 5, 4); F('#6b4423', x + 13, y + 16, 4, 8);
    F('#e74c3c', x + 5, y + 11, 7, 8); F('#ff8a3c', x + 6, y + 13, 5, 6); F('#ffd23f', x + 7, y + 15, 3, 4); F('rgba(90,90,90,.8)', x + 6, y + 4, 5, 4);
  } else if (key === 'ball') {
    F('#f2e6c8', x + 4, y + 12, 22, 12); F('#4f79b0', x + 2, y + 8, 26, 4); F('#4f79b0', x + 6, y + 4, 18, 4); F('#8a4a2b', x + 20, y + 1, 4, 6);   // Haus, Dach, Schornstein
    F('#e74c3c', x + 13, y - 1, 6, 3); F('#ffffff', x + 13, y + 2, 6, 2); F('#3fa9f5', x + 14, y + 4, 4, 1);   // Ball
  } else if (key === 'unfall') {
    F('#4a4d50', x + 25, y - 2, 2, 22); F('#ffe9a8', x + 25, y - 3, 4, 2);                                   // Laterne
    F('#c0453a', x + 2, y + 10, 22, 8); F('#c0453a', x + 7, y + 5, 12, 6); F('#9fe3ff', x + 9, y + 6, 8, 3);   // Auto
    F('#5a1a12', x + 22, y + 11, 2, 5); F('#ff9f1a', x + 2, y + 12, 2, 2); F('#222', x + 5, y + 17, 4, 4); F('#222', x + 17, y + 17, 4, 4);
  } else if (key === 'baum') {
    F('#555', x, y + 16, 30, 8); F('#ffffff', x + 3, y + 19, 4, 1); F('#ffffff', x + 12, y + 19, 4, 1); F('#ffffff', x + 21, y + 19, 4, 1);   // Straße
    F('#6b4423', x + 2, y + 13, 18, 5); F('#4a2e14', x + 2, y + 13, 18, 1); F('#24561f', x + 17, y + 6, 12, 12); F('#3f8f37', x + 18, y + 7, 10, 9);   // Stamm, Krone
  } else if (key === 'ast') {
    F('#2e9e5b', x + 2, y + 13, 24, 7); F('#2e9e5b', x + 7, y + 8, 13, 6); F('#9fe3ff', x + 9, y + 9, 9, 3); F('#222', x + 5, y + 19, 4, 4); F('#222', x + 19, y + 19, 4, 4);   // Auto
    F('#6b4423', x + 20, y + 2, 10, 3); F('#6b4423', x + 12, y + 5, 10, 3); F('#4a2e14', x + 12, y + 7, 10, 1);   // Ast quer übers Dach
    F('#24561f', x + 3, y + 2, 11, 8); F('#3f8f37', x + 5, y + 3, 7, 5);   // Blätter
  } else if (key === 'muell') {
    F('#4a4d50', x + 9, y + 10, 13, 14); F('#6a6e72', x + 10, y + 11, 11, 12); F('#333', x + 8, y + 9, 15, 2);   // Tonne
    F('#e74c3c', x + 10, y + 1, 11, 8); F('#ff8a3c', x + 12, y + 3, 7, 6); F('#ffd23f', x + 14, y + 5, 3, 4); F('#e74c3c', x + 13, y - 2, 4, 3);   // Flammen
  }
}
// Flammen (Fußpunkt-Mitte x, y; Breite w, Höhe h; k 0..1 = Stärke), flackern über time
function drawFlames(F, x, y, w, h, k, time) {
  if (k <= 0) return;
  const n = Math.max(3, Math.round(w / 6)), cols = ['#e74c3c', '#ff8a3c', '#ffd23f'];
  for (let i = 0; i < n; i++) {
    const fx = x - w / 2 + (i + 0.5) * w / n, f = 0.65 + 0.35 * Math.sin(time / 90 + i * 1.7) + 0.15 * Math.sin(time / 37 + i), fh = Math.max(3, h * k * f * (i % 2 ? 0.8 : 1)), fw = Math.max(3, w / n + 2);
    cols.forEach((c, j) => { const hh = fh * (1 - j * 0.3), ww = Math.max(1, fw * (1 - j * 0.35)); F(c, Math.round(fx - ww / 2), Math.round(y - hh), Math.round(ww), Math.round(hh)); });
  }
}
