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
  { key: 'small', word: 'house',    floors: 1, loads: 3, trusses: 3, steps: ['baggern', 'beton', 'mauer', 'kran', 'dach'] },
  { key: 'big',   word: 'bighouse', floors: 2, loads: 4, trusses: 6, steps: ['baggern', 'beton', 'mauer', 'kran', 'dach'] },
  // Holzhaus (Blockhaus in L-Form): Punktfundament, Bohlen, 4 Binder mit dem Autokran, Schindeldach und Veranda (#39–#41)
  { key: 'wood',  word: 'woodhouse', floors: 1, loads: 2, trusses: 4, shape: 'L', steps: ['baggern', 'beton', 'holz', 'kran', 'holzdach'] },
  // Hochhaus: 4 Stockwerke aus je 3 Fertigteil-Modulen, Turmdrehkran (Schritt 2: EG + 1. OG, Schritt 3: 2. + 3. OG + Landeplatz), dann Fenster/Tür
  // (ready: false würde einen Haustyp in der Hauswahl sperren)
  { key: 'tower', word: 'tower', floors: 4, loads: 4, trusses: 0, shape: 'T', steps: ['baggern', 'beton', 'turm', 'turm', 'fenster'] },
];
Object.assign(WORDS, { woodhouse: ['HOLZHAUS', 'Holzhaus'], holes: ['FUNDAMENT', 'Fundament'], tower: ['HOCHHAUS', 'Hochhaus'], towercrane: ['TURMKRAN', 'Turmkran'], storey: ['STOCKWERK', 'Stockwerk'],
  window: ['FENSTER', 'Fenster'], helipad: ['LANDEPLATZ', 'Landeplatz'], heli: ['HUBSCHRAUBER', 'Hubschrauber'] });
// L-Form im Grube-Rechteck (pit = { r0, c0, w, h }): links ganz, rechts nur die untere Hälfte
const lShape = pit => { const cs = Math.ceil(pit.w / 2), hs = Math.floor(pit.h / 2); return { cs, hs, has: (r, c) => c < cs || r >= hs }; };
// Punktfundament: Löcher an den Ecken der L-Form (relativ zur Grube)
function woodHoles(pit) {
  const { cs, hs } = lShape(pit), w = pit.w, h = pit.h, seen = new Set(), out = [];
  for (const [r, c] of [[0, 0], [0, cs - 1], [hs, cs - 1], [hs, w - 1], [h - 1, w - 1], [h - 1, 0], [h - 1, cs - 1]]) {
    const k = r + ',' + c; if (seen.has(k)) continue; seen.add(k); out.push({ r: pit.r0 + r, c: pit.c0 + c });
  }
  return out;
}
// L-Umriss mit Schnur und Pflöcken (für Baggern, Beton und die Stadt)
function drawLOutline(F, pit, G2) {
  const { cs, hs } = lShape(pit), x0 = pit.c0 * G2 + 4, y0 = pit.r0 * G2 + 4, X = (c) => pit.c0 * G2 + c * G2, Y = (r) => pit.r0 * G2 + r * G2;
  const pts = [[x0, y0], [X(cs) - 4, y0], [X(cs) - 4, Y(hs) + 4], [X(pit.w) - 4, Y(hs) + 4], [X(pit.w) - 4, Y(pit.h) - 4], [x0, Y(pit.h) - 4]];
  for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
    if (ax === bx) for (let y = Math.min(ay, by); y < Math.max(ay, by); y += 6) F('rgba(255,255,255,.8)', ax, y, 1, 3);
    else for (let x = Math.min(ax, bx); x < Math.max(ax, bx); x += 6) F('rgba(255,255,255,.8)', x, ay, 3, 1); }
  for (const [px, py] of pts) { F('#d35400', px - 1, py - 1, 3, 3); F('#fff', px - 1, py - 1, 3, 1); }
}
// Kleines Holzhaus-Bild (Karten, Schild): Blockhaus mit Bohlen, Satteldach und Veranda
function drawWoodHouseIcon(F, x, y, w, h) {
  const rz = Math.round(h * 0.45), lw = Math.round(w * 0.62);
  F('rgba(0,0,0,.25)', x + 2, y + 3, w, h);
  F('#5a3b1c', x, y + rz, lw, h - rz);
  for (let yy = y + rz + 1, i = 0; yy < y + h - 1; yy += 3, i++) { F(i % 2 ? '#a0673a' : '#b97f45', x + 1, yy, lw - 2, 2); F('#7a4a22', x - 2, yy, 3, 2); F('#7a4a22', x + lw - 1, yy, 3, 2); }
  F('#5a3b1c', x + Math.round(lw / 2) - 3, y + h - 9, 6, 8); F('#9fe3ff', x + 4, y + rz + 4, 6, 5); F('#5a3b1c', x + 4, y + rz + 4, 6, 1);
  F('#7a2218', x - 2, y, lw + 4, rz); for (let yy = y + 1; yy < y + rz; yy += 3) F('#a8301f', x - 1, yy, lw + 2, 2);
  F('#c98a4f', x + lw, y + rz + 2, w - lw, h - rz - 2); for (let xx = x + lw + 2; xx < x + w; xx += 4) F('#7a4a22', xx, y + rz + 2, 1, h - rz - 2);   // Veranda
  F('#5a3b1c', x + lw, y + rz - 2, w - lw, 3); F('#5a3b1c', x + w - 2, y + rz, 2, h - rz);
}
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

// ---------- Holzhaus: Blockbohlen in L-Form ----------
Object.assign(WORDS, { plank: ['BOHLE', 'Bohle'], log: ['BAUMSTAMM', 'Baumstamm'],
  wood_hell: ['HELL', 'Hell'], wood_honig: ['HONIG', 'Honig'], wood_dunkel: ['DUNKEL', 'Dunkel'], wood_rot: ['ROT', 'Rot'] });
// Holztöne (beim Bohlen-Legen gewählt, gespeichert in house.color): dunkel, mittel, hell, Hirnholz
const WOOD_COLORS = [
  { key: 'wood_hell',   c: ['#8a6a3c', '#d9b77c', '#efd6a4', '#c49a5a'] },
  { key: 'wood_honig',  c: ['#6e4520', '#c48a4a', '#e0ac6c', '#a8703a'] },
  { key: 'wood_dunkel', c: ['#3e2410', '#7a4a22', '#9a6436', '#5a3418'] },
  { key: 'wood_rot',    c: ['#5a1410', '#a8301f', '#c95a44', '#7a2218'] },
];
const woodColor = key => WOOD_COLORS.find(w => w.key === (key || (typeof Hof !== 'undefined' && Hof.save && Hof.save.house && Hof.save.house.color))) || WOOD_COLORS[1];
const LOG_ROWS = 4;
// L-Grundriss als Wandkanten: links ganz hoch, rechts nur die untere Hälfte. Vorne (Süden) Tür und Fenster.
function logGeo(x, y, w, h, gw = 14) {
  const cw = Math.round(w * 0.5), ym = y + Math.round(h * 0.48), x1 = x + w, y1 = y + h;
  const door = { a: x + Math.round(cw * 0.5 - gw / 2), b: x + Math.round(cw * 0.5 + gw / 2), rows: 3 };
  const win = { a: x + cw + Math.round((w - cw) * 0.5 - gw * 0.6), b: x + cw + Math.round((w - cw) * 0.5 + gw * 0.6), from: 1, to: 2 };
  const edges = [
    { k: 'h', a: x, b: x + cw, at: y, back: true },      // hinten links
    { k: 'h', a: x + cw, b: x1, at: ym, back: true },    // hinten rechts
    { k: 'v', a: y, b: ym, at: x + cw },                 // Innenecke
    { k: 'v', a: y, b: y1, at: x },                      // links
    { k: 'v', a: ym, b: y1, at: x1 },                    // rechts
    { k: 'h', a: x, b: x1, at: y1, front: true },        // vorne (Tür, Fenster)
  ];
  return { x, y, w, h, cw, ym, x1, y1, edges, door, win, inside: (px, py) => px > x && px < x1 && py > y && py < y1 && (px < x + cw || py > ym) };
}
// Bohlen zeichnen: placed(e, r) sagt, ob Bohle r der Kante e liegt. Höhere Reihen etwas weiter oben (schräg von oben).
function drawLogWalls(F, g, placed, colKey, rows = LOG_ROWS, rh = 4, lt = 6, floor = true) {
  const hl = lt >> 1;
  const c = woodColor(colKey).c;
  // Holzboden im Inneren
  if (floor) { F('#b98a52', g.x, g.y, g.cw, g.h); F('#b98a52', g.x + g.cw, g.ym, g.w - g.cw, g.h - (g.ym - g.y)); }
  if (floor) for (let yy = g.y + 3; yy < g.y1; yy += 5) { F('#a07040', g.x, yy, g.cw, 1); if (yy > g.ym) F('#a07040', g.x + g.cw, yy, g.w - g.cw, 1); }
  for (let r = 0; r < rows; r++) {
    const off = r * rh, over = Math.max(3, hl);
    const order = [0, 1, 2, 3, 4, 5];
    for (const ei of order) {
      if (!placed(ei, r)) continue;
      const e = g.edges[ei];
      if (e.k === 'h') {
        const ext = r % 2 === 0 ? over : 0, ya = e.at - off;   // Ecken: Bohlen überkreuzen sich abwechselnd
        let parts = [[e.a - ext, e.b + ext]];
        if (e.front && r < g.door.rows) parts = parts.flatMap(([a, b]) => [[a, g.door.a], [g.door.b, b]]);
        if (e.front && r >= g.win.from && r <= g.win.to) parts = parts.flatMap(([a, b]) => (a < g.win.a && b > g.win.b) ? [[a, g.win.a], [g.win.b, b]] : [[a, b]]);
        for (const [a, b] of parts) { if (b - a < 2) continue;
          F('rgba(0,0,0,.18)', a + 1, ya + hl, b - a, 2);
          F(c[0], a, ya - hl, b - a, lt); F(c[1], a, ya - hl + 1, b - a, lt - 2); F(c[2], a, ya - hl + 1, b - a, Math.max(1, lt >> 2));
          F(c[3], a, ya - hl + 1, Math.max(2, hl), lt - 2); F(c[3], b - Math.max(2, hl), ya - hl + 1, Math.max(2, hl), lt - 2); }
      } else {
        const ext = r % 2 === 1 ? over : 0, xa = e.at;
        F(c[0], xa - hl, e.a - ext - off - hl, lt, e.b - e.a + 2 * ext + hl); F(c[1], xa - hl + 1, e.a - ext - off - hl + 1, lt - 2, e.b - e.a + 2 * ext + hl - 2); F(c[2], xa - hl + 1, e.a - ext - off - hl + 1, Math.max(1, lt >> 2), e.b - e.a + 2 * ext + hl - 2);
        F(c[3], xa - hl + 1, e.a - ext - off - hl + 1, lt - 2, Math.max(2, hl));
      }
    }
  }
  // Tür und Fenster: dunkle Öffnung in der Vorderwand, sobald die Reihe darüber liegt
  if (placed(5, 0)) F('#2e1f10', g.door.a, g.y1 - hl - (g.door.rows - 1) * rh, g.door.b - g.door.a, (g.door.rows - 1) * rh + lt);
  if (placed(5, g.win.from)) F('#2e1f10', g.win.a, g.y1 - hl - g.win.to * rh, g.win.b - g.win.a, (g.win.to - g.win.from + 1) * rh);
}

// ---------- Holzhaus: Dachbinder, Schindeldach mit zwei Firsten, Veranda (#41) ----------
Object.assign(WORDS, { shingle: ['SCHINDELN', 'Schindeln'], veranda: ['VERANDA', 'Veranda'], post: ['PFOSTEN', 'Pfosten'],
  container: ['CONTAINER', 'Container'], beams: ['BALKEN', 'Balken'], lorry: ['LASTWAGEN', 'Lastwagen'],
  rocker: ['SCHAUKELSTUHL', 'Schaukelstuhl'], fireplace: ['KAMIN', 'Kamin'], attic: ['DACHBODEN', 'Dachboden'], ladder: ['LEITER', 'Leiter'] });
// Höhe der Blockwand (so weit liegt die Wandkrone über dem Grundriss)
const logWallUp = (rows = LOG_ROWS, rh = 4, lt = 6) => (rows - 1) * rh + (lt >> 1);
// Dach in L-Form, um "up" Pixel angehoben: vorne 3 Reihen über die ganze Breite (8 Felder), hinten 3 Reihen nur über dem linken Flügel (4 Felder).
// Linker Flügel: First längs (senkrecht), rechter Flügel: First quer. Reihe 0 = ganz vorne.
const WROOF_ROWS = 6;
function woodRoofGeo(g, up, ov = 3) {
  const L = g.x - ov, Rr = g.x1 + ov, Rl = g.x + g.cw + ov, yTop = g.y - up - ov, yMid = g.ym - up - ov, yBot = g.y1 - up + ov;
  const rows = [];
  for (let i = 0; i < 3; i++) rows.push({ y: Math.round(yBot - (i + 1) * (yBot - yMid) / 3), y2: Math.round(yBot - i * (yBot - yMid) / 3), x0: L, x1: Rr, n: 8 });
  for (let i = 0; i < 3; i++) rows.push({ y: Math.round(yMid - (i + 1) * (yMid - yTop) / 3), y2: Math.round(yMid - i * (yMid - yTop) / 3), x0: L, x1: Rl, n: 4 });
  const cell = (i, c) => { const r = rows[i], a = Math.round(r.x0 + c * (r.x1 - r.x0) / r.n), b = Math.round(r.x0 + (c + 1) * (r.x1 - r.x0) / r.n); return [a, r.y, b - a, r.y2 - r.y]; };
  const ridgeX = g.x + Math.round(g.cw / 2), ridgeY = Math.round((g.ym + g.y1) / 2) - up;
  // 4 Dachbinder: 2 quer über den linken Flügel (hinten), 2 längs über den rechten Flügel
  const rw = g.x1 - g.x - g.cw, trusses = [
    { x: ridgeX, y: Math.round(g.y + (g.ym - g.y) * 0.3) - up, len: g.cw + 2 * ov, ang: 0 },
    { x: ridgeX, y: Math.round(g.y + (g.ym - g.y) * 0.85) - up, len: g.cw + 2 * ov, ang: 0 },
    { x: Math.round(g.x + g.cw + rw * 0.4), y: ridgeY, len: g.y1 - g.ym + 2 * ov, ang: Math.PI / 2 },
    { x: Math.round(g.x + g.cw + rw * 0.8), y: ridgeY, len: g.y1 - g.ym + 2 * ov, ang: Math.PI / 2 },
  ];
  return { rows, cell, ridgeX, ridgeY, trusses, L, Rr, Rl, yTop, yMid, yBot, up, ov };
}
// Veranda vor dem rechten Flügel (vorne, gut zu sehen): Holzboden, 4 Pfosten (Löcher vorne), Geländer, Schaukelstuhl, Vordach
function verandaGeo(g, up) {
  const x0 = g.x + g.cw + 3, x1 = g.x1 + 1, y0 = g.y1 + 2, d = Math.max(6, Math.round((g.y1 - g.ym) * 0.6)), y1 = y0 + d, w = x1 - x0;
  return { x0, x1, y0, y1, ph: Math.max(4, Math.round(up * 0.6)), posts: [[x0 + 1, y1 - 1], [x0 + Math.round(w / 3), y1 - 1], [x0 + Math.round(w * 2 / 3), y1 - 1], [x1 - 2, y1 - 1]],
    chair: [x0 + Math.round(w * 0.83), y0 + Math.round(d * 0.58)] };
}
function drawRocker(F, x, y, t, s = 1) {
  const k = Math.round(Math.sin(t / 400) * s);
  F('rgba(0,0,0,.2)', x - 5 * s, y + 6 * s, 12 * s, 2 * s);
  F('#5a3418', x - 6 * s, y + 5 * s + k, 13 * s, s); F('#5a3418', x - 6 * s, y + 6 * s - k, 13 * s, s);   // Kufen
  F('#7a4a22', x - 4 * s, y - 6 * s + k, 9 * s, 4 * s); F('#a0673a', x - 3 * s, y - 5 * s + k, 7 * s, 2 * s);   // Lehne
  F('#7a4a22', x - 4 * s, y - 2 * s, 9 * s, 6 * s); F('#c0392b', x - 3 * s, y - s, 7 * s, 4 * s); F('#e06a5a', x - 3 * s, y - s, 7 * s, s);   // Sitz mit Kissen
}
// Holzhaus von schräg oben. g = logGeo(…). o: { rh, lt, color, trusses: Anzahl Binder, ridge, roof(i, c) oder true, deck, posts: Anzahl Pfosten, chair, wreath, time }
function drawWoodHouse(F, g, o = {}) {
  const rh = o.rh || 4, lt = o.lt || 6, up = logWallUp(LOG_ROWS, rh, lt), t = o.time || 0;
  const rg = woodRoofGeo(g, up, Math.max(2, lt >> 1)), vg = verandaGeo(g, up);
  const full = o.roof === true || (typeof o.roof === 'function' && rg.rows.every((r, i) => Array.from({ length: r.n }, (_, c) => o.roof(i, c)).every(Boolean)));
  if (o.deck) {                                       // Veranda-Boden
    F('rgba(0,0,0,.2)', vg.x0 + 2, vg.y0 + 2, vg.x1 - vg.x0, vg.y1 - vg.y0);
    F('#5a3418', vg.x0, vg.y0, vg.x1 - vg.x0, vg.y1 - vg.y0 + 1);
    for (let y = vg.y0, i = 0; y < vg.y1; y += 3, i++) F(i % 2 ? '#c98a4f' : '#b97f45', vg.x0 + 1, y, vg.x1 - vg.x0 - 2, 2);
  }
  drawLogWalls(F, g, o.logs || (() => true), o.color, LOG_ROWS, rh, lt, o.floor !== false);   // Abriss: o.logs(e, r) = Bohle steht noch
  const np = o.posts || 0;
  if (!full) {                                        // Dachstuhl
    const nt = Math.min(rg.trusses.length, o.trusses || 0);
    if (o.ridge) {
      const ry = rg.ridgeY, rx = rg.ridgeX;
      F('#5a3b1c', rx - 2, rg.yTop, 5, rg.yBot - rg.yTop); F('#a0673a', rx - 1, rg.yTop, 3, rg.yBot - rg.yTop);
      F('#5a3b1c', rx, ry - 2, rg.Rr - rx, 5); F('#a0673a', rx, ry - 1, rg.Rr - rx, 3);
    }
    for (let i = 0; i < nt; i++) { if (o.truss && !o.truss(i)) continue; const b = rg.trusses[i]; drawBeamTop(F, b.x, b.y, b.len, b.ang, 0); }   // Abriss: o.truss(i) = Binder liegt noch
  }
  // Holzschindeln: links vom First dunkler (linker Flügel), hinter dem First dunkler (rechter Flügel)
  const lc = woodColor(o.color).c;
  for (let i = 0; i < WROOF_ROWS; i++) for (let c = 0; c < rg.rows[i].n; c++) {
    if (!full && !(o.roof && o.roof(i, c))) continue;
    const [x, y, w, h] = rg.cell(i, c), cx = x + w / 2, cy = y + h / 2;
    const dark = cx < g.x + g.cw ? cx < rg.ridgeX : cy < rg.ridgeY;
    F(dark ? '#6e5a44' : '#8f7656', x, y, w, h); F(dark ? '#7f6a52' : '#a88d6a', x, y, w, 1); F(dark ? '#4f3f2e' : '#5e4c38', x, y + h - 1, w, 1);
    const hm = h >> 1; if (hm > 3) F(dark ? '#57462f' : '#6e5a44', x, y + hm, w, 1);
    for (let xx = x + (i % 2 ? 2 : 4); xx < x + w - 1; xx += 5) { F(dark ? '#57462f' : '#6e5a44', xx, y + 1, 1, hm > 3 ? hm - 1 : h - 2); if (hm > 3) F(dark ? '#57462f' : '#6e5a44', xx + 2 < x + w - 1 ? xx + 2 : xx, y + hm + 1, 1, h - hm - 2); }   // einzelne Schindeln, versetzt
  }
  if (full) {                                          // Firste, Kamin aus Stein
    F('#3e2f20', rg.ridgeX - 1, rg.yTop, 3, rg.yBot - rg.yTop); F('#3e2f20', rg.ridgeX, rg.ridgeY - 1, rg.Rr - rg.ridgeX, 3);
    F(lc[0], rg.L, rg.yTop, 1, rg.yBot - rg.yTop); F(lc[0], rg.L, rg.yBot - 1, rg.Rr - rg.L, 1);
    const kx = rg.ridgeX - Math.round(g.cw * 0.3), ky = rg.yTop + Math.round((rg.yMid - rg.yTop) * 0.4), ks = Math.max(4, lt - 2);
    F('rgba(0,0,0,.25)', kx + 2, ky + 2, ks, ks); F('#6a6058', kx, ky - 3, ks, ks + 3); F('#9a9088', kx + 1, ky - 2, ks - 2, 2); F('#2a2420', kx + 1, ky - 3, ks - 2, 1);
    if (o.smoke !== false) for (let k = 0; k < 3; k++) { const p = ((t / 900) + k / 3) % 1; F(`rgba(230,230,230,${(0.6 * (1 - p)).toFixed(2)})`, Math.round(kx + 1 + p * 6), Math.round(ky - 5 - p * 14), 3, 3); }
  }
  if (o.deck) {                                       // Pfosten, Geländer (Lücke in der Mitte = Eingang), Vordach
    const P = vg.posts, ph = vg.ph, pw = Math.max(2, lt >> 1), has = i => i < np;
    if (o.chair) drawRocker(F, vg.chair[0], vg.chair[1], t, Math.max(1, Math.round(lt / 6)));   // hinter dem Geländer
    const rail = (a, b) => { for (const f of [0.35, 0.7]) F('#7a4a22', a[0], a[1] - Math.round(ph * f), b[0] - a[0], Math.max(1, pw - 2)); };
    for (const [a, b] of [[0, 1], [2, 3]]) if (has(a) && has(b)) rail(P[a], P[b]);
    for (let i = 0; i < np; i++) { const [px, py] = P[i]; F('rgba(0,0,0,.2)', px - 1, py, pw + 2, 2); F('#5a3418', px - (pw >> 1), py - ph, pw, ph + 1); F('#c98a4f', px - (pw >> 1), py - ph, Math.max(1, pw - 1), ph); }
    if (np >= P.length && o.vroof !== false) {
      const top = P[0][1] - ph, bh = Math.max(3, Math.round(ph * 0.4));
      F('#4f3f2e', vg.x0 - 2, top - bh, vg.x1 - vg.x0 + 4, bh + 1); F('#8f7656', vg.x0 - 1, top - bh, vg.x1 - vg.x0 + 2, bh - 1); F('#a88d6a', vg.x0 - 1, top - bh, vg.x1 - vg.x0 + 2, 1);
      for (let xx = vg.x0 + 2; xx < vg.x1; xx += 5) F('#6e5a44', xx, top - bh + 1, 1, bh - 2);
    }
  }
  if (o.wreath > 0 && !full) {                         // Richtbaum
    const cx = rg.ridgeX, cy = rg.ridgeY - 2 - Math.round(4 * Math.min(1, o.wreath));
    F('#6b4423', cx, cy - 2, 2, 6); F('#24561f', cx - 4, cy - 7, 10, 6); F('#2e7a2a', cx - 3, cy - 6, 8, 4); F('#2e7a2a', cx - 2, cy - 10, 6, 4); F('#5cb64f', cx - 1, cy - 9, 2, 2);
    ['#e03b3b', '#ffd23f', '#3fa9f5', '#ff8ad8'].forEach((col, i) => F(col, cx - 4 + i * 3 + (Math.sin(t / 160 + i) > 0 ? 1 : 0), cy - 3, 1, 5 + (i % 2) * 2));
  }
  return { rg, vg, up };
}
// Holzstapel (Brennholz für den Kamin), von schräg oben
function drawWoodPile(F, x, y, n = 3) {
  F('rgba(0,0,0,.2)', x + 1, y + 2, n * 4 + 2, 9);
  for (let r = 0; r < 2; r++) for (let i = 0; i < n - r; i++) { const xx = x + i * 4 + r * 2, yy = y + 4 - r * 4; F('#5a3418', xx, yy, 4, 4); F('#c98a4f', xx + 1, yy + 1, 2, 2); }
}


/* ---------- Hochhaus (Haustyp 4): 4 Stockwerke × 3 Fertigteil-Module, von schräg oben ----------
   Ein Modul: Grundfläche w × d am Boden (x, gy), Höhe fh, liegt auf Höhe e (so viel weiter oben gezeichnet).
   Oben die Deckenplatte, darunter die Vorderwand mit Fenstern. Stockwerk k (0 = EG), Modul m (0 links, 1 Mitte, 2 rechts). */
const TOWER_FLOORS = 4, TOWER_MODS = 3;
const TOWER_COLS = [                                   // Fassade je Stockwerk: Grund, hell, dunkel
  ['#b8b2a6', '#d0cbc0', '#8f897e'],                   // EG: Naturstein
  ['#7fb2e0', '#a8cdf0', '#5a8cbc'],                   // 1. OG blau
  ['#8cc66e', '#b0dc96', '#6aa04e'],                   // 2. OG grün
  ['#f2b25c', '#f8cc88', '#c98a3a'],                   // 3. OG orange
];
// Fenster je Modul: Form (sq, tall, round, wide; EG Mitte: door) und ob es beim Fenster-Einbauen noch fehlt (miss)
const TOWER_WIN = [
  [[{ s: 'wide', miss: true }], [{ s: 'door', miss: true }], [{ s: 'wide' }]],
  [[{ s: 'sq' }, { s: 'tall', miss: true }], [{ s: 'sq' }, { s: 'sq' }], [{ s: 'round', miss: true }, { s: 'sq' }]],
  [[{ s: 'tall' }, { s: 'tall' }], [{ s: 'round', miss: true }, { s: 'round' }], [{ s: 'sq' }, { s: 'wide', miss: true }]],
  [[{ s: 'round' }, { s: 'sq', miss: true }], [{ s: 'tall', miss: true }, { s: 'tall' }], [{ s: 'sq' }, { s: 'round' }]],
];
// Form eines Fensters (Rechtecke relativ zur Mitte, u = Maßstab), für Fassade und später für die Fenster-Teile
function towerWinRects(s, u) {
  const r = (w, h) => [[-Math.round(w * u / 2), -Math.round(h * u / 2), Math.max(2, Math.round(w * u)), Math.max(2, Math.round(h * u))]];
  if (s === 'tall') return r(5, 9);
  if (s === 'wide') return r(12, 6);
  if (s === 'door') return [[-Math.round(4 * u), -Math.round(5 * u), Math.max(3, Math.round(8 * u)), Math.max(4, Math.round(11 * u))]];
  if (s === 'round') {                                // Kreis aus Pixelzeilen (bei kleinem Maßstab ein Plus)
    const a = Math.max(3, Math.round(8 * u)), r = a / 2, out = [];
    if (a < 6) return [[-1, -Math.floor(a / 2), 2, a], [-Math.floor(a / 2), -1, a, 2]];
    for (let j = 0; j < a; j++) { const yy = j + 0.5 - r, hw = Math.round(Math.sqrt(Math.max(0, r * r - yy * yy))); if (hw > 0) out.push([-hw, Math.round(j - r), 2 * hw, 1]); }
    out.sort((p, q) => q[2] - p[2]); return out;     // breiteste Zeile zuerst (für den Glanzpunkt)
  }
  return r(7, 7);
}
function drawTowerWin(F, cx, cy, s, u, state) {      // state: 'glass' | 'hole' | 'ghost'
  const rs = towerWinRects(s, u);
  if (state === 'hole') { for (const [x, y, w, h] of rs) F('#2a2a30', cx + x, cy + y, w, h); if (s !== 'round') F('rgba(255,255,255,.35)', cx + rs[0][0], cy + rs[0][1], rs[0][2], 1); return; }
  for (const [x, y, w, h] of rs) F(s === 'door' ? '#5a3b1c' : '#ffffff', cx + x - 1, cy + y - 1, w + 2, h + 2);
  for (const [x, y, w, h] of rs) F(s === 'door' ? '#8a5a2e' : '#9fd3f5', cx + x, cy + y, w, h);
  const [x, y, w, h] = rs[0];
  if (s === 'door') { F('#9fd3f5', cx + x + 1, cy + y + 1, w - 2, Math.round(h / 3)); F('#ffd23f', cx + x + w - 2, cy + y + Math.round(h / 2), 1, 1); }
  else { F('#d6efff', cx + x, cy + y, Math.max(1, Math.round(w / 3)), Math.max(1, Math.round(h / 3))); if (w > 5 && s !== 'round') F('#ffffff', cx + x + Math.floor(w / 2), cy + y, 1, h); }
}
// Mitte von Fenster i in Modul (k, m), Modul links bei x, Grundfläche bei gy, auf Höhe e
function towerWinPos(x, gy, w, d, fh, k, m, i, e = k * fh) {
  const n = TOWER_WIN[k][m].length, fy = Math.round(gy - e - fh) + d, u = fh / 16;
  return [Math.round(x + w * (i + 1) / (n + 1)), Math.round(fy + fh / 2 - (TOWER_WIN[k][m][i].s === 'door' ? -u : u))];
}
// ein Modul zeichnen. o: { win(i) → true = Fenster i ist drin, top: Dach (Brüstung), lift: Aufzugsaufbau }
function drawTowerModule(F, x, gy, w, d, fh, k, m, e = 0, o = {}) {
  const c = TOWER_COLS[k], ty = Math.round(gy - e - fh), fy = ty + d, u = fh / 16;
  F('rgba(0,0,0,.18)', x + w, fy, 2, fh);                                          // Schatten rechts
  F(c[0], x, fy, w, fh); F(c[1], x, fy, w, 1); F(c[2], x + w - 1, fy, 1, fh);      // Vorderwand
  F('#6d6a64', x, fy + fh - Math.max(1, Math.round(2 * u)), w, Math.max(1, Math.round(2 * u)));   // Geschossdecke
  const wins = TOWER_WIN[k][m];
  wins.forEach((wv, i) => {
    const [cx, cy] = towerWinPos(x, gy, w, d, fh, k, m, i, e);
    const inside = !wv.miss || (o.win ? o.win(i) : o.allWin);
    if (fh < 9) { F(inside ? '#9fd3f5' : '#2a2a30', cx - 1, cy - 1, 2, 2); return; }
    drawTowerWin(F, cx, cy, wv.s, u, inside ? 'glass' : 'hole');
  });
  if (k > 0 && m === 1 && fh >= 9) {                                              // Balkon in der Mitte
    const bw = w - Math.round(8 * u), bx = x + Math.round(4 * u), by = fy + fh - Math.round(5 * u);
    F(c[2], bx, by, bw, Math.max(2, Math.round(3 * u))); F('#ffffff', bx, by, bw, 1);
  }
  F(c[2], x, ty, w, d); F('#a9adb1', x + 2, ty + 2, w - 4, d - 4);                // Deckenplatte mit Rand in der Stockwerksfarbe
  F('rgba(0,0,0,.12)', x + Math.round(w / 2), ty + 1, 1, d - 2);
  if (o.top) { F('#c4c7ca', x, ty, w, 2); F('#c4c7ca', x, ty, 2, d); F('#c4c7ca', x + w - 2, ty, 2, d); F('#7a7e82', x, ty + d - 2, w, 2); }   // Brüstung
  if (o.lift) { const lw = Math.round(w * 0.5), lh = Math.round(d * 0.4), lx = x + Math.round((w - lw) / 2), ly = ty + Math.round(d * 0.2), up = Math.max(2, Math.round(fh * 0.4));
    F('#7a7e82', lx, ly - up + lh, lw, up); F('#9da1a5', lx, ly - up, lw, lh); F('#5a5e62', lx + 2, ly - up + lh + 1, lw - 4, up - 2); }
}
// ganzes (oder halb gebautes) Hochhaus: g = { x, y, w, d, fh } (Grundfläche), o.has(k, m) = Modul steht, o.win(k, m, i), o.allWin, o.slab
function drawTower(F, g, o = {}) {
  const mw = Math.round(g.w / TOWER_MODS), has = o.has || (() => true);
  if (o.slab !== false) { F('#7d8185', g.x - 2, g.y - 2, g.w + 4, g.d + 4); F('#a2a8ae', g.x - 1, g.y - 1, g.w + 2, g.d + 2); }   // Bodenplatte
  for (let k = 0; k < TOWER_FLOORS; k++) for (let m = 0; m < TOWER_MODS; m++) {
    if (!has(k, m)) continue;
    const top = k === TOWER_FLOORS - 1 || !has(k + 1, m);
    drawTowerModule(F, g.x + m * mw, g.y, m === TOWER_MODS - 1 ? g.w - 2 * mw : mw, g.d, g.fh, k, m, k * g.fh,
      { win: o.win ? i => o.win(k, m, i) : null, allWin: o.allWin, top: top && k === TOWER_FLOORS - 1, lift: top && k === TOWER_FLOORS - 1 && m === 1 && !o.helipad });
  }
  if (o.helipad) drawHelipad(F, g.x, g.y - TOWER_FLOORS * g.fh, g.w, g.d, o.time);
}
// Hubschrauber-Landeplatz (liegt oben auf dem Dach): dunkle Platte, weißer Kreis, gelbes H
function drawHelipad(F, x, y, w, d, time) {
  const s = Math.min(w, d) - 4, px = Math.round(x + (w - s) / 2), py = Math.round(y + (d - s) / 2);
  F('#3a3d40', px, py, s, s); F('#4a4d50', px + 1, py + 1, s - 2, s - 2);
  const r = s / 2 - 3, cx = px + s / 2, cy = py + s / 2;
  for (let a = 0; a < 32; a++) { const t = a / 32 * Math.PI * 2; F('#ffffff', Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), 1, 1); }
  const hh = Math.round(s * 0.42), hw = Math.round(s * 0.3), bw = Math.max(1, Math.round(s / 14));
  F('#ffd23f', Math.round(cx - hw / 2), Math.round(cy - hh / 2), bw, hh); F('#ffd23f', Math.round(cx + hw / 2) - bw, Math.round(cy - hh / 2), bw, hh); F('#ffd23f', Math.round(cx - hw / 2), Math.round(cy) - Math.floor(bw / 2), hw, bw);
  if (time && Math.floor(time / 500) % 2) for (const [qx, qy] of [[px, py], [px + s - 2, py], [px, py + s - 2], [px + s - 2, py + s - 2]]) F('#ff4040', qx, qy, 2, 2);   // Lichter blinken
}
// kleines Hochhaus-Bild (Hauswahl, Schild, Stadt): Grundfläche unten bei (x, y + h)
function drawTowerIcon(F, x, y, w, h, o = {}) {
  const d = Math.round(w * 0.36), fh = Math.max(4, Math.floor((h - d) / TOWER_FLOORS));
  drawTower(F, { x, y: y + h - d, w, d, fh }, Object.assign({ allWin: true, slab: false }, o));
}

/* ---------- Turmdrehkran (Hochhaus), von schräg oben ----------
   Fuß am Boden (mx, my), Turm MH hoch, Ausleger dreht sich zur Laufkatze über dem Bodenpunkt (hx, hy).
   Alles in grober Pixel-Optik: gelbe Gitterstücke, Führerhaus, Gegenausleger mit Betongewichten, Spitze mit Abspannseilen. */
function drawTowerCraneMast(F, mx, my, MH, fresh = 0) {
  F('rgba(0,0,0,.25)', mx - 9, my - 3, 22, 10);
  F('#7d8185', mx - 10, my - 5, 20, 10); F('#a2a8ae', mx - 9, my - 4, 18, 8);   // Betonfundament
  for (const [fx, fy] of [[-8, -4], [5, -4], [-8, 2], [5, 2]]) F('#5a5e62', mx + fx, my + fy, 3, 3);
  const top = my - MH, x0 = mx - 4;
  for (let y = my - 1, i = 0; y > top; y -= 6, i++) {                            // Gitterstücke (Turmstücke)
    const hgt = Math.min(6, y - top), hi = fresh > 0 && y - 6 <= top + 6;
    const col = hi ? '#fff3b0' : '#f5b700', dk = '#8a6a00';
    F(dk, x0, y - hgt, 1, hgt); F(dk, x0 + 7, y - hgt, 1, hgt);
    F(col, x0 + 1, y - hgt, 1, hgt); F(col, x0 + 6, y - hgt, 1, hgt);
    F(col, x0 + 1, y - 1, 6, 1);
    for (let j = 0; j < hgt; j++) F(col, x0 + 1 + Math.round((i % 2 ? j : hgt - 1 - j) * 5 / 6), y - 1 - j, 1, 1);   // Diagonale
  }
}
function drawTowerCraneTop(F, mx, my, MH, hx, hy, L, time) {
  const tx = mx, ty = my - MH, dx = hx - mx, dy = hy - my, dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl;
  const ex = tx + ux * L, ey = ty + uy * L, cx = tx - ux * 20, cy = ty - uy * 20;   // Auslegerende, Gegenausleger
  const px = -uy, py = ux;                                                            // quer zum Ausleger
  // Schatten des Auslegers am Boden (zeigt, wohin er zeigt)
  pixLine(F, mx, my, mx + ux * L, my + uy * L, 2, 'rgba(0,0,0,.10)');
  // Gegenausleger mit Betongewichten
  pixLine(F, tx, ty, cx, cy, 4, '#8a6a00'); pixLine(F, tx, ty, cx, cy, 2, '#f5b700');
  F('#4a4e52', Math.round(cx - 6), Math.round(cy - 5), 12, 10); F('#7a7e82', Math.round(cx - 5), Math.round(cy - 4), 10, 8); F('#9da1a5', Math.round(cx - 5), Math.round(cy - 4), 10, 2); F('#4a4e52', Math.round(cx - 1), Math.round(cy - 4), 1, 8);
  // Ausleger: kräftiger gelber Gitterträger (dunkler Rand, helle Mitte, Querstreben)
  pixLine(F, tx, ty, ex, ey, 4, '#8a6a00'); pixLine(F, tx, ty, ex, ey, 2, '#f5b700');
  for (let t = 5; t < L - 2; t += 5) { const qx = tx + ux * t, qy = ty + uy * t; F('#8a6a00', Math.round(qx), Math.round(qy), 1, 1); }
  F('#8a6a00', Math.round(ex) - 2, Math.round(ey) - 2, 4, 4); F('#f5b700', Math.round(ex) - 1, Math.round(ey) - 1, 2, 2);
  // Spitze mit Abspannung
  F('#8a6a00', tx - 1, ty - 12, 3, 12); F('#f5b700', tx, ty - 12, 1, 12);
  pixLine(F, tx, ty - 12, tx + ux * L * 0.6, ty + uy * L * 0.6, 1, '#555'); pixLine(F, tx, ty - 12, cx, cy, 1, '#555');
  // Führerhaus
  F('#8a6a00', tx - 5, ty - 3, 10, 7); F('#f5b700', tx - 4, ty - 2, 8, 5); F('#9fd3f5', tx + (ux > 0 ? 1 : -3), ty - 1, 3, 2);
  if (time && Math.floor(time / 600) % 2) F('#ff4040', Math.round(ex) - 1, Math.round(ey) - 1, 2, 2);   // Warnlicht am Auslegerende
}
// Laufkatze am Ausleger (über dem Bodenpunkt), Seil nach unten zur Last
function drawTowerTrolley(F, hx, hy, MH, ropeTo) {
  const x = Math.round(hx), y = Math.round(hy - MH);
  for (let yy = y + 3; yy < ropeTo - 1; yy += 2) F('#333', x, yy, 1, 1);
  F('#333', x - 3, y - 1, 7, 4); F('#777', x - 2, y, 5, 2);
}
// Tieflader (Sattelzug) mit Platz für 3 Module, Fahrerhaus rechts (fährt nach rechts). Ladefläche: Bodenfläche x, gy, len × d
function drawLowLoader(F, x, gy, len, d) {
  x = Math.round(x);
  F('rgba(0,0,0,.25)', x + 2, gy + 3, len + 18, d);
  for (const wx of [4, 12, len - 16, len - 8]) { F('#1a1a1a', x + wx, gy - 2, 6, 2); F('#1a1a1a', x + wx, gy + d, 6, 2); }
  F('#3a3d40', x, gy, len, d); F('#55595d', x + 1, gy + 1, len - 2, d - 2);
  for (let i = 4; i < len - 2; i += 8) F('#4a4d50', x + i, gy + 1, 1, d - 2);
  F('#d35400', x, gy, 2, d); F('#ffd23f', x, gy + 2, 2, 3); F('#ffd23f', x, gy + d - 5, 2, 3);   // Heck mit Warnstreifen
  const cx = x + len + 2;                                                                       // Zugmaschine
  F('#1a1a1a', cx + 2, gy + 4, 5, 2); F('#1a1a1a', cx + 2, gy + d - 6, 5, 2);
  F('#173f80', cx, gy + 4, 16, d - 8); F('#2a6fdb', cx + 1, gy + 5, 14, d - 10); F('#9fe3ff', cx + 11, gy + 6, 3, d - 12); F('#ffffff', cx + 2, gy + 5, 8, 1);
}

// Hubschrauber von oben (Rotor dreht sich), Mitte x, y; a = Richtung (0 = nach rechts)
function drawHelicopter(F, x, y, time, a = 0, spin = 1, k = 1.6) {
  x = Math.round(x); y = Math.round(y);
  const cx = Math.cos(a) * k, sx = Math.sin(a) * k, P = (dx, dy) => [Math.round(x + dx * cx - dy * sx), Math.round(y + dx * sx + dy * cx)];
  F('rgba(0,0,0,.2)', x - 8 * k, y + 6 * k, 16 * k, 4 * k);                                       // Schatten
  for (const d of [-5, 5]) { const [ax, ay] = P(-6, d), [bx, by] = P(6, d); pixLine(F, ax, ay, bx, by, 2, '#333'); }   // Kufen
  for (let t = -15; t <= -4; t++) { const [qx, qy] = P(t, 0); F('#c0392b', qx - 1, qy - 1, 3, 3); }   // Heckausleger
  { const [qx, qy] = P(-16, 0); F('#333', qx - 1, qy - 4, 3, 9); }
  for (let dy = -4; dy <= 4; dy += 0.5) for (let dx = -6; dx <= 6; dx += 0.5) if (dx * dx / 36 + dy * dy / 16 <= 1) { const [qx, qy] = P(dx, dy); F(dx > 2.5 ? '#9fd3f5' : dy < -2 ? '#ff7b6b' : '#e74c3c', qx, qy, 2, 2); }
  const r = (time || 0) / 1000 * 25 * spin, L = 14 * k;
  for (const o of [0, Math.PI / 2]) { const ca = Math.cos(r + o), sa = Math.sin(r + o); pixLine(F, x - ca * L, y - sa * L, x + ca * L, y + sa * L, 2, 'rgba(30,30,30,.75)'); }
  F('#222', x - 2, y - 2, 4, 4);
}
