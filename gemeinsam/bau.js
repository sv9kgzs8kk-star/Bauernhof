/* =====================================================================
   BAUSTELLE – gemeinsame Grafik und Wörter (nach sterne.js und basis.js einbinden)
   Bauarbeiter, Bagger (von oben, drehbar), Kipper, Boden-Kacheln
   ===================================================================== */
Object.assign(WORDS, {
  site: ['BAUSTELLE', 'Baustelle'], digger: ['BAGGER', 'Bagger'], dig: ['BAGGERN', 'Baggern'],
  dirt: ['ERDE', 'Erde'], tipper: ['KIPPER', 'Kipper'], house: ['HAUS', 'Haus'], concrete: ['BETON', 'Beton'],
  pump: ['BETONPUMPE', 'Betonpumpe'], wall: ['MAUER', 'Mauer'], brick: ['STEIN', 'Stein'], builder: ['BAUARBEITER', 'Bauarbeiter'],
  crane: ['KRAN', 'Kran'], frame: ['DACHSTUHL', 'Dachstuhl'], richtfest: ['RICHTFEST', 'Richtfest!'], roof: ['DACH', 'Dach'], truss: ['DACHBINDER', 'Dachbinder'],
  demolish: ['ABRISS', 'Abriss'], ball: ['ABRISSBIRNE', 'Abrissbirne'], box: ['UMZUGSKISTE', 'Umzugskiste'], van: ['TRANSPORTER', 'Transporter'],
  rubble: ['SCHUTT', 'Schutt'], bighouse: ['GROSSES HAUS', 'Großes Haus'], move: ['UMZUG', 'Umzug']
});
// Haustypen: nach jedem Bau mit Abriss kommt der nächste dazu (save.house.maxType). floors = Stockwerke (mehr Mauerreihen, Fenster)
const HOUSE_TYPES = [
  { key: 'small', word: 'house',    floors: 1, loads: 3, trusses: 3 },
  { key: 'big',   word: 'bighouse', floors: 2, loads: 4, trusses: 6 },
];
const houseType = () => { const h = typeof Hof !== 'undefined' && Hof.save && Hof.save.house; return HOUSE_TYPES[Math.min(HOUSE_TYPES.length - 1, Math.max(0, (h && h.type) | 0))]; };
const houseFloors = () => houseType().floors;
// Putzfarben (beim Mauern gewählt, save.house.color): Grund, hell, dunkel (Kanten/Sockel), Rand
const HOUSE_COLORS = [
  { key: 'creme', word: ['WEISS', 'Weiß'],     base: '#e9dcc0', light: '#f6ecd4', dark: '#cdbf9f', edge: '#b8a888', dots: ['#ddd0b0', '#f3e8cc'], brick: ['#8f8270', '#d6cbb4', '#ece4d2'] },
  { key: 'gelb',  word: ['GELB', 'Gelb'],      base: '#f2d46b', light: '#fbe8a0', dark: '#d4b44a', edge: '#b0922e', dots: ['#e6c55a', '#f8e08a'], brick: ['#8a6a10', '#e0b030', '#f2cc5a'] },
  { key: 'blau',  word: ['BLAU', 'Blau'],      base: '#9cc8ec', light: '#c4e0f6', dark: '#7aa8d0', edge: '#5d8ab4', dots: ['#8ab9e0', '#b4d6f2'], brick: ['#2a4f80', '#4f86c6', '#7aa8e0'] },
  { key: 'rosa',  word: ['ROSA', 'Rosa'],      base: '#f2b8c6', light: '#fad6df', dark: '#d896a8', edge: '#b8788a', dots: ['#e8a8b8', '#f6c8d4'], brick: ['#8a3a52', '#d6708e', '#eb98ae'] },
  { key: 'gruen', word: ['GRÜN', 'Grün'],      base: '#b6dc96', light: '#d4ecbe', dark: '#94bc74', edge: '#76985a', dots: ['#a6d084', '#c6e4aa'], brick: ['#2e5a1e', '#5ca040', '#84c262'] },
];
HOUSE_COLORS.forEach(c => { WORDS['col_' + c.key] = c.word; });
const houseColor = key => HOUSE_COLORS.find(c => c.key === (key || (typeof Hof !== 'undefined' && Hof.save && Hof.save.house && Hof.save.house.color))) || HOUSE_COLORS[0];
// Grobe Pixel: zeichnet über F, rastet aber alles auf ein P×P-Raster ein (Haus, Kran, Transporter wirken wie Hof-Pixelgrafik)
function snapF(F, P = 2) {
  return (col, x, y, w, h) => { const x0 = Math.floor(x / P) * P, y0 = Math.floor(y / P) * P, x1 = Math.ceil((x + w) / P) * P, y1 = Math.ceil((y + h) / P) * P; F(col, x0, y0, Math.max(P, x1 - x0), Math.max(P, y1 - y0)); };
}
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
function houseGeo(x, y, w, h, floors) {
  floors = floors || houseFloors();
  const rz = Math.round(h * (floors > 1 ? 0.4 : 0.55)), fz = h - rz;
  const roof = { x: x - 2, y: y - 3, w: w + 4, h: rz + 3 };
  const row = i => { const y0 = roof.y + roof.h - Math.round((i + 1) * roof.h / ROOF_ROWS), y1 = roof.y + roof.h - Math.round(i * roof.h / ROOF_ROWS); return [y0, y1 - y0]; };
  const col = c => { const x0 = roof.x + Math.round(c * roof.w / ROOF_COLS), x1 = roof.x + Math.round((c + 1) * roof.w / ROOF_COLS); return [x0, x1 - x0]; };
  const nT = HOUSE_TYPES[Math.min(HOUSE_TYPES.length - 1, floors - 1)].trusses;
  const beam = i => x + Math.round(w * (i + 1) / (nT + 1));
  return { x, y, w, h, rz, fz, roof, row, col, beam, floors, nT };
}
// Tür und Fenster der Fassade (gleich für Zeichnen und Mauer-Spiel)
function facadeHoles(g) {
  const { x, y, w, h, rz } = g, fl = g.floors || 1, fz = Math.round(g.fz / fl);   // fz = Höhe eines Stockwerks
  const doorW = Math.max(6, Math.round(w * 0.17)), doorX = x + Math.round((w - doorW) / 2), doorH = Math.max(6, fz - 3);
  const winW = Math.max(6, Math.round(w * 0.2)), winH = Math.max(4, Math.round(fz * 0.42)), winY = y + h - fz + Math.max(2, Math.round(fz * 0.22));
  const wins = [x + Math.round(w * 0.1), x + w - Math.round(w * 0.1) - winW];
  const winList = wins.map(wx => [wx, winY]);
  for (let f = 1; f < fl; f++) {                       // obere Stockwerke: drei Fenster
    const wy = y + h - (f + 1) * fz + Math.max(2, Math.round(fz * 0.22));
    winList.push([x + Math.round(w * 0.1), wy], [doorX + Math.round((doorW - winW) / 2), wy], [x + w - Math.round(w * 0.1) - winW, wy]);
  }
  const rects = [[doorX, y + h - doorH, doorW, doorH], ...winList.map(([wx, wy]) => [wx, wy, winW, winH])];
  return { doorW, doorX, doorH, winW, winH, winY, wins, winList, rects };
}
function drawHouseTop(F, x, y, w, h, o = {}) {
  const g = houseGeo(x, y, w, h, o.floors), st = o.step || 0, t = o.time || 0, done = o.done || st >= 5;
  const rz = g.rz, fz = g.fz;
  F('rgba(0,0,0,.25)', x + 3, y + 5, w + 1, h);
  // Bodenplatte
  F('#6a7076', x - 2, y - 2, w + 4, h + 4); F('#a2a8ae', x - 1, y - 1, w + 2, h + 2);
  if (st < 3) return g;
  // Fassade (vorne): Steine im Rohbau, fertig verputzt wie das Bauernhaus
  const { doorW, doorX, doorH, winW, winH, winList } = facadeHoles(g);
  if (done) {
    const pc = houseColor(o.color);                    // Putzfarbe
    F(pc.edge, x - 1, y + rz, w + 2, fz + 1); F(pc.base, x, y + rz, w, fz); F(pc.light, x, y + rz, w, 1); F(pc.dark, x, y + h - 2, w, 2);
    for (let i = 0, k = Math.round(x * 7 + y * 3); i < w * fz / 26; i++) { k = (k * 9301 + 49297) % 233280; F(k % 3 ? pc.dots[0] : pc.dots[1], x + 1 + k % (w - 3), y + rz + 2 + (k >> 4) % Math.max(1, fz - 5), 2, 1); }   // Putz
    for (let f = 1; f < g.floors; f++) F(pc.dark, x, y + h - Math.round(fz * f / g.floors) - 1, w, 2);   // Stockwerk-Kante
    F('#5a3b1c', doorX - 1, y + h - doorH - 1, doorW + 2, doorH + 1); F('#7a4a22', doorX, y + h - doorH, doorW, doorH);
    F('#a0673a', doorX + 1, y + h - doorH + 1, doorW - 2, Math.max(1, Math.round(doorH * 0.4) - 1)); F('#a0673a', doorX + 1, y + h - Math.round(doorH * 0.55), doorW - 2, Math.round(doorH * 0.45) - 1);
    F('#ffcc00', doorX + doorW - 3, y + h - Math.round(doorH / 2), 2, 2); F('#8f9aa3', doorX - 2, y + h, doorW + 4, 2);
    for (const [wx, winY] of winList) { F('#5a3b1c', wx - 1, winY - 1, winW + 2, winH + 2); F('#ffffff', wx, winY, winW, winH); F('#6cc4f0', wx + 1, winY + 1, winW - 2, winH - 2); F('#9fe3ff', wx + 1, winY + 1, winW - 2, Math.round(winH / 2) - 1);
      F('#e6f8ff', wx + 2, winY + 2, 2, 2); F('#ffffff', wx + Math.floor(winW / 2), winY + 1, 1, winH - 2); F('#ffffff', wx + 1, winY + Math.floor(winH / 2), winW - 2, 1);
      F(pc.dark, wx - 2, winY + winH + 1, winW + 4, 2); F('#2e7a2a', wx, winY + winH + 3, winW, 2); F('#ff6b8a', wx + 1, winY + winH + 2, 2, 1); F('#ffd23f', wx + Math.round(winW / 2), winY + winH + 2, 2, 1); F('#ff6b8a', wx + winW - 3, winY + winH + 2, 2, 1); }
  } else {
    const bc = houseColor(o.color).brick;             // Steine in der gewählten Hausfarbe
    F(bc[0], x, y + rz, w, fz);
    for (let yy = y + rz, r = 0; yy < y + h; yy += 6, r++) for (let xx = x + (r % 2 ? -5 : 0); xx < x + w; xx += 10) { const x0 = Math.max(x, xx); F(bc[1], x0, yy, Math.min(xx + 8, x + w) - x0, 4); F(bc[2], x0, yy, Math.min(xx + 8, x + w) - x0, 2); }   // Ziegel groß genug für grobe Pixel
    F('#2e1f10', doorX, y + h - doorH, doorW, doorH);
    for (const [wx, winY] of winList) F('#2e1f10', wx, winY, winW, winH);
    // Mauerkrone von oben (Ring um den Innenraum)
    F(bc[0], x, y, w, 3); F(bc[0], x, y, 3, rz); F(bc[0], x + w - 3, y, 3, rz); F(bc[0], x, y + rz - 2, w, 2);
    F(bc[2], x, y, w, 1);
  }
  // Dachstuhl: Binder quer, Firstbalken längs
  const tr = st >= 4 ? g.nT : (o.trusses || 0);
  const fullRoof = done || (o.roof && o.roof.every(r => r.every(Boolean)));
  if (!fullRoof) {
    for (let i = 0; i < tr; i++) { const bx = g.beam(i); F('#5a3b1c', bx - 2, y - 2, 5, rz + 3); F('#a0673a', bx - 1, y - 2, 3, rz + 3); F('#c9a067', bx - 1, y - 2, 1, rz + 3); }
    if (st >= 4 || o.ridge) { const ry = y + Math.round(rz / 2) - 2; F('#5a3b1c', x - 2, ry, w + 4, 5); F('#a0673a', x - 2, ry + 1, w + 4, 3); F('#c9a067', x - 2, ry + 1, w + 4, 1); }
  }
  // Ziegel
  for (let i = 0; i < ROOF_ROWS; i++) for (let c = 0; c < ROOF_COLS; c++) {
    if (!done && !(o.roof && o.roof[i][c])) continue;
    const [ry, rh] = g.row(i), [rx, rw] = g.col(c), back = i >= ROOF_ROWS / 2;
    F(back ? '#a8301f' : '#c0392b', rx, ry, rw, rh); F(back ? '#c24a38' : '#d9533f', rx, ry, rw, 1);
    F(back ? '#7a2218' : '#8e2a20', rx, ry + rh - 1, rw, 1); F(back ? '#8e2a20' : '#a93226', rx + rw - 1, ry, 1, rh - 1);
    if (i % 2) F(back ? '#8e2a20' : '#a93226', rx + Math.floor(rw / 2), ry, 1, rh - 1);   // versetzte Ziegel
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
const flatbedSlot = (i, total) => total > 3 ? 4 + i * 5 : FLATBED_SLOTS[i];   // großes Haus: 6 Binder, längere Ladefläche nach unten
function drawFlatbedTop(F, x, y, n, beamLen, total = 3) {
  const hgt = total > 3 ? total * 5 + 3 : 16;
  F('rgba(0,0,0,.25)', x + 2, y + 2, 56, hgt + 2);
  for (const wx of [4, 14, 24, 48]) { F('#1a1a1a', x + wx, y - 1, 6, 2); F('#1a1a1a', x + wx, y + hgt + 1, 6, 2); }
  F('#444', x, y + 1, 44, hgt); F('#777', x + 1, y + 2, 42, hgt - 2);
  F('#173f80', x + 44, y, 12, 18); F('#2a6fdb', x + 45, y + 1, 10, 16); F('#9fe3ff', x + 52, y + 2, 3, 14);
  for (let i = 0; i < n; i++) drawBeamTop(F, x + 22, y + flatbedSlot(i, total) + 1, beamLen, 0, 0);
}

// Umzugskiste von schräg oben (n = 0–1 wie voll, closed = Deckel zu)
function drawMoveBox(F, x, y, closed) {
  F('rgba(0,0,0,.25)', x + 2, y + 3, 22, 18);
  F('#8a5a2b', x, y, 22, 18); F('#c98a4f', x + 1, y + 1, 20, 7); F('#b07438', x + 1, y + 8, 20, 9);
  if (closed) { F('#d9a066', x + 1, y + 1, 20, 7); F('#e8e0c8', x + 9, y + 1, 4, 7); F('#e8e0c8', x + 9, y + 8, 4, 2); }
  else { F('#5a3b1c', x + 2, y + 2, 18, 5); F('#d9a066', x - 3, y + 1, 4, 6); F('#d9a066', x + 21, y + 1, 4, 6); }
  F('#5a3b1c', x + 3, y + 11, 5, 1); F('#5a3b1c', x + 3, y + 13, 7, 1);
}
// Kleintransporter von der Seite (fährt nach rechts), weiß mit blauem Streifen; open = Ladetür hinten offen; k = Vergrößerung
const VAN_W = 46, VAN_H = 23;
function drawVan(F, x, y, open, k = 2) {
  x = Math.round(x); y = Math.round(y);
  const V = (col, a, b, w, h) => F(col, x + a * k, y + b * k, w * k, h * k);
  V('rgba(0,0,0,.25)', 2, 20, 44, 3);
  V('#6a747c', 0, 0, 34, 20); V('#ffffff', 1, 1, 32, 18); V('#e6eef2', 1, 15, 32, 4); V('#2a6fdb', 1, 10, 32, 3); V('#173f80', 1, 13, 32, 1);   // Laderaum
  V('#6a747c', 34, 5, 12, 15); V('#ffffff', 35, 6, 10, 13); V('#9fe3ff', 37, 7, 8, 5); V('#e6f8ff', 38, 8, 2, 2); V('#2a6fdb', 34, 12, 12, 3);   // Fahrerhaus
  V('#8f9aa3', 40, 14, 3, 1); V('#ffd23f', 45, 15, 1, 2); V('#e03b3b', 0, 15, 1, 3); V('#333', 44, 18, 2, 2);
  for (const wx of [5, 33]) { V('#1a1a1a', wx, 17, 9, 6); V('#777', wx + 2, 19, 5, 2); V('#aaa', wx + 3, 19, 2, 1); }
  V('#ffd23f', 10, 4, 6, 4); V('#e03b3b', 18, 4, 6, 4); V('#5cb64f', 26, 4, 4, 4);   // bunte Kisten-Aufkleber
  if (open) { V('#5a3b1c', 1, 2, 12, 16); V('#3a2a10', 1, 2, 12, 2); V('#ffffff', -6, 1, 6, 18); V('#8f9aa3', -6, 1, 1, 18); }
}
// Abrissbirne (von oben: Kugel mit Schatten, h = Höhe über dem Boden)
function drawBall(F, x, y, h) {
  x = Math.round(x); y = Math.round(y);
  F('rgba(0,0,0,.25)', x - 4 + h, y - 2 + h, 9, 7);
  F('#222', x - 5, y - 5, 10, 10); F('#444', x - 4, y - 4, 8, 8); F('#6a6a6a', x - 3, y - 3, 3, 2);
}
// Schutthaufen (von oben)
function drawRubble(F, x, y, w, h, seed) {
  F('#8a7a66', x, y, w, h);
  let k = seed * 9301 + 49297;
  const rn = () => (k = (k * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < w * h / 40; i++) {
    const rx = x + Math.floor(rn() * (w - 4)), ry = y + Math.floor(rn() * (h - 3));
    const col = ['#c0392b', '#9a9a9a', '#6a6058', '#b5a58a', '#7a2218'][Math.floor(rn() * 5)];
    F(col, rx, ry, 3 + Math.floor(rn() * 3), 2 + Math.floor(rn() * 2));
  }
}

// ---------- Autokran (schräg von oben): Fahrzeug längs (Fahrerhaus oben), Drehteller hinten, Ausleger zur Spitze ----------
// x,y = Mitte des Drehtellers am Boden; dir = 1 Fahrerhaus nach unten, -1 nach oben
function drawMobileCraneBody(F, x, y, dir = 1) {
  x = Math.round(x); y = Math.round(y);
  const by = dir > 0 ? y - 12 : y - 40;              // Fahrzeug 26 breit, 52 lang
  F('rgba(0,0,0,.25)', x - 11, by + 4, 28, 52);
  for (const sy of [by + 6, by + 42]) { F('#555', x - 20, sy, 40, 3); F('#e03b3b', x - 22, sy - 1, 4, 5); F('#e03b3b', x + 18, sy - 1, 4, 5); F('#888', x - 22, sy + 4, 4, 2); F('#888', x + 18, sy + 4, 4, 2); }   // Stützen
  for (const wy of [10, 20, 30, 40]) { F('#1a1a1a', x - 14, by + wy, 3, 7); F('#1a1a1a', x + 11, by + wy, 3, 7); }
  F('#7a5a00', x - 12, by, 24, 52); F('#f5b700', x - 11, by + 1, 22, 50); F('#ffd84a', x - 11, by + 1, 22, 2);
  for (let i = 0; i < 6; i++) F(i % 2 ? '#1a1a1a' : '#f5b700', x - 11 + i * 4, by + (dir > 0 ? 49 : 1), 4, 2);   // Warnstreifen
  const cy = dir > 0 ? by + 38 : by + 2;            // Fahrerhaus
  F('#c48a00', x - 10, cy, 20, 12); F('#9fe3ff', x - 8, dir > 0 ? cy + 7 : cy + 1, 16, 4); F('#e6f8ff', x - 7, dir > 0 ? cy + 8 : cy + 2, 3, 1);
}
// Drehteller und Ausleger: Fuß (x,y) mit Höhe 12, Spitze am Boden über (tx,ty) in Höhe th (gezeichnet bei ty - th)
function drawMobileCraneBoom(F, x, y, tx, ty, th) {
  const bx = x, by = y - 12, sx = tx, sy = ty - th;
  pixLine(F, x + 3, y + 3, tx + 3, ty + 3, 3, 'rgba(0,0,0,.08)');                  // Schatten am Boden
  F('#555', bx - 9, by - 2, 18, 16); F('#c48a00', bx - 8, by - 1, 16, 14); F('#f5b700', bx - 7, by, 14, 6); F('#9fe3ff', bx + 2, by + 1, 4, 3);
  pixLine(F, bx, by, sx, sy, 6, '#7a5a00'); pixLine(F, bx, by, sx, sy, 4, '#f5b700'); pixLine(F, bx, by, sx, sy, 1, '#ffd84a');
  const L = Math.hypot(sx - bx, sy - by), n = Math.floor(L / 10);
  for (let i = 1; i < n; i++) { const u = i / n; F('#c48a00', Math.round(bx + (sx - bx) * u) - 1, Math.round(by + (sy - by) * u) - 1, 3, 3); }
  F('#7a5a00', Math.round(sx) - 3, Math.round(sy) - 3, 7, 6); F('#bbb', Math.round(sx) - 1, Math.round(sy) - 2, 3, 3);   // Rolle an der Spitze
}
// Seil von der Auslegerspitze (sx,sy) nach unten zum Haken/Last (lx,ly), Haken klein
function drawRope(F, sx, sy, lx, ly) {
  pixLine(F, sx, sy, lx, ly, 1, '#333');
  F('#555', Math.round(lx) - 2, Math.round(ly) - 2, 5, 4); F('#ffd23f', Math.round(lx) - 1, Math.round(ly) - 1, 3, 2);
}
