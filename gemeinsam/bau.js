/* =====================================================================
   BAUSTELLE – gemeinsame Grafik und Wörter (nach sterne.js und basis.js einbinden)
   Bauarbeiter, Bagger (von oben, drehbar), Kipper, Boden-Kacheln
   ===================================================================== */
Object.assign(WORDS, {
  site: ['BAUSTELLE', 'Baustelle'], digger: ['BAGGER', 'Bagger'], dig: ['BAGGERN', 'Baggern'],
  dirt: ['ERDE', 'Erde'], tipper: ['KIPPER', 'Kipper'], house: ['HAUS', 'Haus'], concrete: ['BETON', 'Beton'],
  pump: ['BETONPUMPE', 'Betonpumpe'], wall: ['MAUER', 'Mauer'], brick: ['STEIN', 'Stein'], builder: ['BAUARBEITER', 'Bauarbeiter'],
  crane: ['KRAN', 'Kran'], frame: ['DACHSTUHL', 'Dachstuhl'], richtfest: ['RICHTFEST', 'Richtfest!'], roof: ['DACH', 'Dach'], truss: ['DACHBINDER', 'Dachbinder']
});
const BAU_STARS_DIG = 3;                       // Sterne für die fertige Grube
const BAU_STARS_STEP = 3;                      // Sterne je weiterem Bauschritt (Beton, Mauer …)

// Bauarbeiter von oben (gelber Helm, orange Warnweste), schaut nach rechts
const BUILDER = rotateSprite(sprite(20, R => {
  R('#f1c27d',9,0,4,3); R('#f1c27d',9,17,4,3);                       // Hände
  R('#9a4a00',3,2,11,16); R('#f08c00',4,3,9,14); R('#fff3a8',4,6,9,1); R('#fff3a8',4,13,9,1);   // Weste
  R('#c48a00',5,5,11,10); R('#f5b700',6,6,9,8); R('#fff3a8',7,7,3,2); R('#c48a00',10,6,1,8);    // Helm
  R('#f5b700',16,8,2,4);                                               // Helmschirm
}));
// Bauarbeiter von vorne (für den Knopf)
const BUILDER_FRONT = { pal: { y:'#f5b700', d:'#c48a00', s:'#f1c27d', k:'#222', o:'#f08c00', w:'#fff3a8', b:'#2a5db0', n:'#5a3b1c' },
  px: ['..yyyyyy..','.yyyyyyyy.','dddddddddd','..ssssss..','..skssks..','..ssssss..','.oowwwwoo.','soooooooos','s.oowwoo.s','..bbbbbb..','..bb..bb..','.nn....nn.'] };

// Bagger von oben, schaut nach rechts (Ketten, Oberwagen, Ausleger mit Schaufel)
const EXCAVATOR = rotateSprite(sprite(28, R => {
  R('#1a1a1a',1,2,20,6); R('#1a1a1a',1,20,20,6);                      // Ketten
  for (let x = 2; x < 21; x += 3) { R('#555',x,3,1,4); R('#555',x,21,1,4); }
  R('#7a5a00',4,7,14,14); R('#c48a00',5,8,12,12); R('#f5b700',6,9,10,10); R('#ffe066',6,9,10,1);   // Oberwagen
  R('#555',3,10,3,8); R('#777',3,10,3,1);                              // Gegengewicht
  R('#c48a00',11,9,5,5); R('#9fe3ff',13,10,3,3); R('#e6f8ff',13,10,1,3);   // Fahrerhaus
  R('#c48a00',16,12,7,4); R('#f5b700',16,13,7,2);                      // Ausleger
  R('#444',22,9,4,10); R('#777',23,10,2,8); R('#aaa',26,9,1,10);       // Schaufel
}));

// Betonpumpe von oben, schaut nach rechts (Fahrerhaus vorne, Pumpenarm zusammengeklappt)
const PUMP = rotateSprite(sprite(32, R => {
  for (const x of [4, 11, 19]) { R('#1a1a1a',x,5,5,3); R('#1a1a1a',x,24,5,3); }
  R('#444',2,8,24,16); R('#777',3,9,22,14);
  R('#8e1f1f',24,7,7,18); R('#d83a3a',25,8,5,16); R('#9fe3ff',29,9,2,14); R('#e6f8ff',29,9,2,3);
  R('#999',4,11,9,10); R('#cfcfcf',5,12,7,8);                       // Drehturm
  R('#8e1f1f',7,13,19,6); R('#d83a3a',8,14,17,4); R('#ffffff',8,15,17,1);   // Arm, zusammengeklappt
  R('#222',24,15,2,2);
}));
// Kipper (Lastwagen mit Mulde) von oben, schaut nach links; fill 0..1 Erde in der Mulde
const TIPPERS = [['#e03b3b','#8e1f1f'],['#2a6fdb','#173f80'],['#f08c00','#9a5a00'],['#16a085','#0b5e4e']];
function drawTipper(x, y, fill, col) {
  x = Math.round(x); y = Math.round(y);
  R('rgba(0,0,0,.25)', x+2, y+2, 36, 16);
  for (const wx of [3, 18, 29]) { R('#1a1a1a', x+wx, y-1, 5, 2); R('#1a1a1a', x+wx, y+15, 5, 2); }
  R(col[1], x, y+1, 10, 14); R(col[0], x+1, y+2, 8, 12);
  R('#9fe3ff', x+1, y+3, 2, 10); R('rgba(255,255,255,.5)', x+5, y+3, 3, 1);
  R('#555', x+11, y, 25, 16); R('#888', x+12, y+1, 23, 14); R('#6f6f6f', x+12, y+1, 23, 2);
  if (fill > 0) {
    const f = Math.min(1, fill), w = Math.max(3, Math.round(21*f)), h = Math.max(3, Math.round(12*Math.sqrt(f)));
    const gx = x+13+Math.round((21-w)/2), gy = y+2+Math.round((12-h)/2);
    R('#4f3520', gx, gy, w, h); R('#6b4a2b', gx+1, gy+1, Math.max(1,w-3), Math.max(1,h-3)); R('#8a6440', gx+2, gy+1, Math.max(1, (w/3)|0), 1);
  }
}

// Boden-Kacheln für die Baustelle
const bauTiles = { gravel: [], site: [], dug: [] };
for (let v = 0; v < 4; v++) {
  bauTiles.gravel.push(makeTile(R => { R('#a8a29a',0,0,T,T); for (let i=0;i<10;i++) R(pick(['#8f8a82','#c4beb6','#7d7870']), rnd(0,T)|0, rnd(0,T)|0, 1, 1); }));
  bauTiles.site.push(makeTile(R => { R('#7ec850',0,0,T,T); for (let i=0;i<8;i++) R(pick(['#6fb846','#93d866','#8a6440']), rnd(0,T)|0, rnd(0,T)|0, 1, 1); }));
  bauTiles.dug.push(makeTile(R => { R('#4f3520',0,0,T,T); for (let i=0;i<9;i++) R(pick(['#3e2a18','#5e4128','#6b4a2b']), rnd(0,T)|0, rnd(0,T)|0, 1, 1); }));
}
// Kleiner Pixel-Knopf: Figur von vorne in ein 34×34-Canvas malen
function paintFront(canvas, fig) {
  const g = canvas.getContext('2d'); g.clearRect(0, 0, 34, 34);
  fig.px.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') { g.fillStyle = fig.pal[ch]; g.fillRect(7 + i*2, 5 + j*2, 2, 2); } }));
}

/* ---------- Pixel-Hilfen (scharfe Kanten, keine weichen Linien) ---------- */
// Linie aus Pixel-Blöcken (w×w) – für Kranausleger und schwebende Balken
function pixLine(F, x1, y1, x2, y2, w, col) {
  const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1))), o = Math.floor(w / 2);
  for (let i = 0; i <= n; i++) { const t = i / n; F(col, Math.round(x1 + (x2 - x1) * t) - o, Math.round(y1 + (y2 - y1) * t) - o, w, w); }
}

/* ---------- Wohnhaus von schräg oben (wie das Bauernhaus auf dem Hof) ---------- */
// F(col,x,y,w,h) zeichnet (R für das Spielbild, B für den Hintergrund). Grundriss x,y,w,h in Pixeln.
// o: { step 2..5, trusses 0..3, ridge, wreath 0..1, roof: Zeilen×Spalten (true = gedeckt), done, time }
const ROOF_ROWS = 6, ROOF_COLS = 8;
function houseGeo(x, y, w, h) {
  const rz = Math.round(h * 0.55), fz = h - rz;
  const roof = { x: x - 2, y: y - 3, w: w + 4, h: rz + 3 };
  const row = i => { const y0 = roof.y + roof.h - Math.round((i + 1) * roof.h / ROOF_ROWS), y1 = roof.y + roof.h - Math.round(i * roof.h / ROOF_ROWS); return [y0, y1 - y0]; };
  const col = c => { const x0 = roof.x + Math.round(c * roof.w / ROOF_COLS), x1 = roof.x + Math.round((c + 1) * roof.w / ROOF_COLS); return [x0, x1 - x0]; };
  const beam = i => x + Math.round(w * (i + 1) / 4);
  return { x, y, w, h, rz, fz, roof, row, col, beam };
}
function drawHouseTop(F, x, y, w, h, o = {}) {
  const g = houseGeo(x, y, w, h), st = o.step || 0, t = o.time || 0, done = o.done || st >= 5;
  const rz = g.rz, fz = g.fz;
  F('rgba(0,0,0,.25)', x + 3, y + 5, w + 1, h);
  // Bodenplatte
  F('#6a7076', x - 2, y - 2, w + 4, h + 4); F('#a2a8ae', x - 1, y - 1, w + 2, h + 2);
  if (st < 3) return g;
  // Fassade (vorne): Steine im Rohbau, fertig verputzt wie das Bauernhaus
  const doorW = Math.max(6, Math.round(w * 0.17)), doorX = x + Math.round((w - doorW) / 2), doorH = Math.max(6, fz - 3);
  const winW = Math.max(6, Math.round(w * 0.2)), winH = Math.max(4, Math.round(fz * 0.42)), winY = y + rz + Math.max(2, Math.round(fz * 0.22));
  const wins = [x + Math.round(w * 0.1), x + w - Math.round(w * 0.1) - winW];
  if (done) {
    F('#e9dcc0', x, y + rz, w, fz); F('#cdbf9f', x, y + h - 2, w, 2);
    F('#7a4a22', doorX, y + h - doorH, doorW, doorH); F('#a0673a', doorX + 1, y + h - doorH + 1, doorW - 2, 2); F('#ffcc00', doorX + doorW - 3, y + h - Math.round(doorH / 2), 1, 1);
    for (const wx of wins) { F('#5a3b1c', wx, winY, winW, winH); F('#9fe3ff', wx + 1, winY + 1, winW - 2, winH - 2); F('#5a3b1c', wx + Math.floor(winW / 2), winY + 1, 1, winH - 2); F('#5a3b1c', wx + 1, winY + Math.floor(winH / 2), winW - 2, 1);
      F('#ff6b8a', wx + 1, winY + winH, 2, 1); F('#ffd23f', wx + 4, winY + winH, 2, 1); }
  } else {
    F('#7a2218', x, y + rz, w, fz);
    for (let yy = y + rz, r = 0; yy < y + h; yy += 4, r++) for (let xx = x + (r % 2 ? 0 : 3); xx < x + w; xx += 6) F('#c0392b', xx, yy, Math.min(5, x + w - xx), 3);
    F('#2e1f10', doorX, y + h - doorH, doorW, doorH);
    for (const wx of wins) F('#2e1f10', wx, winY, winW, winH);
    // Mauerkrone von oben (Ring um den Innenraum)
    F('#8e2a20', x, y, w, 3); F('#8e2a20', x, y, 3, rz); F('#8e2a20', x + w - 3, y, 3, rz); F('#8e2a20', x, y + rz - 2, w, 2);
    F('#e06a5a', x, y, w, 1);
  }
  // Dachstuhl: Binder quer, Firstbalken längs
  const tr = st >= 4 ? 3 : (o.trusses || 0);
  const fullRoof = done || (o.roof && o.roof.every(r => r.every(Boolean)));
  if (!fullRoof) {
    for (let i = 0; i < tr; i++) { const bx = g.beam(i); F('#5a3b1c', bx - 2, y - 2, 5, rz + 3); F('#a0673a', bx - 1, y - 2, 3, rz + 3); F('#c9a067', bx - 1, y - 2, 1, rz + 3); }
    if (st >= 4 || o.ridge) { const ry = y + Math.round(rz / 2) - 2; F('#5a3b1c', x - 2, ry, w + 4, 5); F('#a0673a', x - 2, ry + 1, w + 4, 3); F('#c9a067', x - 2, ry + 1, w + 4, 1); }
  }
  // Ziegel
  for (let i = 0; i < ROOF_ROWS; i++) for (let c = 0; c < ROOF_COLS; c++) {
    if (!done && !(o.roof && o.roof[i][c])) continue;
    const [ry, rh] = g.row(i), [rx, rw] = g.col(c), back = i >= ROOF_ROWS / 2;
    F(back ? '#b23427' : '#c0392b', rx, ry, rw, rh); F(back ? '#93261f' : '#a93226', rx, ry + rh - 1, rw, 1);
    F('rgba(0,0,0,.12)', rx + rw - 1, ry, 1, rh - 1);
  }
  if (done) {
    const r = g.roof; F('#8e1f1f', r.x, r.y, r.w, 1); F('#8e1f1f', r.x, r.y + r.h - 1, r.w, 1); F('#8e1f1f', r.x, r.y, 1, r.h); F('#8e1f1f', r.x + r.w - 1, r.y, 1, r.h);
    const [my] = g.row(ROOF_ROWS / 2); F('#7a1a12', r.x, my + (g.row(ROOF_ROWS / 2)[1]) - 1, r.w, 2);   // First
    F('#555', x + w - Math.round(w * 0.2), y - 4, 5, 7); F('#777', x + w - Math.round(w * 0.2) - 1, y - 5, 7, 2);   // Schornstein
  }
  // Richtbaum mit bunten Bändern auf dem First
  if (o.wreath > 0 && !done) {
    const cx = x + Math.round(w / 2), cy = y + Math.round(rz / 2) - 1 - Math.round(4 * Math.min(1, o.wreath));
    F('rgba(0,0,0,.2)', cx - 3, cy + 4, 8, 2);
    F('#6b4423', cx, cy - 2, 2, 6); F('#24561f', cx - 4, cy - 7, 10, 6); F('#2e7a2a', cx - 3, cy - 6, 8, 4); F('#2e7a2a', cx - 2, cy - 10, 6, 4); F('#5cb64f', cx - 1, cy - 9, 2, 2);
    ['#e03b3b', '#ffd23f', '#3fa9f5', '#ff8ad8'].forEach((col, i) => F(col, cx - 4 + i * 3 + (Math.sin(t / 160 + i) > 0 ? 1 : 0), cy - 3, 1, 5 + (i % 2) * 2));
  }
  return g;
}
// Baukran von oben: Turm (tx,ty), Ausleger in Richtung a (Länge L), Gegenausleger mit Gewicht
function drawCraneTop(F, tx, ty, a, L, trolleyD) {
  const ca = Math.cos(a), sa = Math.sin(a);
  F('rgba(0,0,0,.2)', tx - 6, ty - 3, 16, 16);
  pixLine(F, tx + 4, ty + 6, tx + 4 + ca * L, ty + 6 + sa * L, 3, 'rgba(0,0,0,.18)');            // Schatten des Auslegers
  F('#7a5a00', tx - 7, ty - 7, 14, 14); F('#f5b700', tx - 6, ty - 6, 12, 12); pixLine(F, tx - 5, ty - 5, tx + 5, ty + 5, 1, '#c48a00'); pixLine(F, tx + 5, ty - 5, tx - 5, ty + 5, 1, '#c48a00');
  pixLine(F, tx, ty, tx - ca * 22, ty - sa * 22, 4, '#c48a00');                                    // Gegenausleger
  F('#555', Math.round(tx - ca * 22) - 4, Math.round(ty - sa * 22) - 4, 8, 8); F('#777', Math.round(tx - ca * 22) - 3, Math.round(ty - sa * 22) - 3, 6, 2);
  pixLine(F, tx, ty, tx + ca * L, ty + sa * L, 4, '#c48a00'); pixLine(F, tx, ty, tx + ca * L, ty + sa * L, 2, '#f5b700');
  for (let d = 6; d < L; d += 6) F('#7a5a00', Math.round(tx + ca * d), Math.round(ty + sa * d), 1, 1);
  F('#c48a00', tx - 4, ty - 4, 8, 8); F('#9fe3ff', tx - 2, ty - 3, 4, 3);                           // Führerhaus
  if (trolleyD != null) { const px = Math.round(tx + ca * trolleyD), py = Math.round(ty + sa * trolleyD); F('#333', px - 3, py - 3, 6, 6); F('#666', px - 2, py - 2, 4, 1); }
}
// Dachbinder von oben als Balken (Mitte cx,cy, Länge len, Winkel ang); lift 0..1 = Höhe (Schatten wandert)
function drawBeamTop(F, cx, cy, len, ang, lift = 0) {
  const ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, sh = Math.round(2 + lift * 6);
  pixLine(F, cx - ca + sh, cy - sa + sh, cx + ca + sh, cy + sa + sh, 4, 'rgba(0,0,0,.22)');
  pixLine(F, cx - ca, cy - sa, cx + ca, cy + sa, 5, '#5a3b1c'); pixLine(F, cx - ca, cy - sa, cx + ca, cy + sa, 3, '#a0673a'); pixLine(F, cx - ca, cy - sa, cx + ca, cy + sa, 1, '#c9a067');
}
// Tieflader von oben (fährt nach rechts), n Binder liegen längs auf der Ladefläche (Länge beamLen)
const FLATBED_SLOTS = [4, 9, 14];                    // y-Versatz der liegenden Binder
function drawFlatbedTop(F, x, y, n, beamLen) {
  F('rgba(0,0,0,.25)', x + 2, y + 2, 56, 18);
  for (const wx of [4, 14, 24, 48]) { F('#1a1a1a', x + wx, y - 1, 6, 2); F('#1a1a1a', x + wx, y + 17, 6, 2); }
  F('#444', x, y + 1, 44, 16); F('#777', x + 1, y + 2, 42, 14);
  F('#173f80', x + 44, y, 12, 18); F('#2a6fdb', x + 45, y + 1, 10, 16); F('#9fe3ff', x + 52, y + 2, 3, 14);
  for (let i = 0; i < n; i++) drawBeamTop(F, x + 22, y + FLATBED_SLOTS[i] + 1, beamLen, 0, 0);
}
