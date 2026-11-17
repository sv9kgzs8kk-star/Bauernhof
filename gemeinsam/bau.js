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

/* ---------- Bühne für Bau-Szenen: festes Raster, auf den Bildschirm vergrößert ---------- */
// paint(B, x0, x1, y0, y1) malt den Hintergrund in Bühnen-Koordinaten. Gibt { S, OX, OY, toStage, sp } zurück.
function bauStage(DW, DH, yFrac, paint) {
  layout(true);
  const m = Math.min(W / DW, H / DH), st = {};
  st.S = m >= 2 ? Math.floor(m) : m;
  st.OX = Math.round((W - DW*st.S) / 2); st.OY = Math.round((H - DH*st.S) * yFrac);
  st.toStage = (x, y) => [(x - st.OX) / st.S, (y - st.OY) / st.S];
  st.sp = (x, y, vx, vy, life, col, grav = 0) => spawn(st.OX + x*st.S, st.OY + y*st.S, vx*st.S, vy*st.S, life, col, grav*st.S);
  const B = (col,x,y,w,h)=>{bctx.fillStyle=col;bctx.fillRect(x,y,w,h);};
  bctx.imageSmoothingEnabled = false;
  bctx.setTransform(st.S, 0, 0, st.S, st.OX, st.OY);
  paint(B, Math.floor(-st.OX/st.S) - 1, Math.ceil((W-st.OX)/st.S) + 1, Math.floor(-st.OY/st.S) - 1, Math.ceil((H-st.OY)/st.S) + 1);
  bctx.setTransform(1, 0, 0, 1, 0, 0);
  return st;
}
function bauSkyGround(B, x0, x1, y0, y1, ground) {
  B('#9fe3ff', x0, y0, x1-x0, ground - y0); B('#c8f0ff', x0, y0, x1-x0, 16 - y0);
  B('#ffffff', 14, 10, 18, 3); B('#ffffff', 18, 8, 9, 2); B('#ffffff', 130, 14, 22, 3); B('#ffffff', 136, 12, 10, 2);
  for (let x = x0 - (x0 % T) - T; x < x1; x += T) for (let y = ground; y < y1; y += T) bctx.drawImage(pick(bauTiles.gravel), x, y);
  B('#8f8a82', x0, ground, x1-x0, 1);
}

/* ---------- Wohnhaus schräg von vorne (Kran, Dach) ---------- */
// Vorderseite (Giebel mit Tür) links, Seitenwand nach hinten rechts oben. d = Tiefe 0 (vorne) … 1 (hinten)
const H34 = { x0: 60, x1: 124, yb: 114, yt: 70, apex: 44, ax: 92, dx: 48, dy: -24, ROWS: 5, COLS: 8 };
const TRUSS_DEPTH = [1, 0.5, 0];                     // Reihenfolge beim Aufstellen: hinten zuerst
const p34 = (x, y, d) => [x + d*H34.dx, y + d*H34.dy];
function poly(col, pts) { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); }
function drawTruss34(d, col = '#a0673a', alpha = 1) {
  const h = H34, [ax, ay] = p34(h.ax, h.apex, d), [lx, ly] = p34(h.x0 - 3, h.yt + 1, d), [rx, ry] = p34(h.x1 + 3, h.yt + 1, d);
  ctx.globalAlpha = alpha; ctx.lineCap = 'square';
  ctx.strokeStyle = '#5a3b1c'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(ax, ay); ctx.lineTo(rx, ry); ctx.closePath(); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(ax, ay); ctx.lineTo(rx, ry); ctx.closePath(); ctx.stroke();
  ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo((lx+rx)/2, (ly+ry)/2);
  ctx.moveTo((lx+ax)/2, (ly+ay)/2); ctx.lineTo((lx+rx)/2, (ly+ry)/2 - 4); ctx.lineTo((rx+ax)/2, (ry+ay)/2); ctx.stroke();
  ctx.globalAlpha = 1;
}
// Ein Dachziegel-Feld auf der rechten Dachseite: Reihe r (0 = Traufe), Spalte c (Tiefe)
function roofCell(r, c, side = 1) {
  const h = H34, ex = side > 0 ? h.x1 + 3 : h.x0 - 3, E0 = [ex, h.yt + 1], R0 = [h.ax, h.apex - 1];
  const P = (u, v) => [E0[0] + u*(R0[0]-E0[0]) + v*h.dx, E0[1] + u*(R0[1]-E0[1]) + v*h.dy];
  const u0 = r / h.ROWS, u1 = (r + 1) / h.ROWS, v0 = c / h.COLS, v1 = (c + 1) / h.COLS;
  return [P(u0, v0), P(u0, v1), P(u1, v1), P(u1, v0)];
}
// o: { trusses 0..3, wreath 0..1, roof: Array ROWS×COLS (true = gedeckt), done: Fenster/Tür/Schornstein, time }
function drawHouse34(o = {}) {
  const h = H34, t = o.time || 0, trusses = o.trusses || 0, roof = o.roof;
  const rowFull = r => roof && roof[r].every(Boolean);
  const allRoof = roof && roof.every(row => row.every(Boolean));
  // Schatten und Bodenplatte
  poly('rgba(0,0,0,.18)', [[h.x0-4, h.yb+2], [h.x1+6, h.yb+2], p34(h.x1+6, h.yb+2, 1), p34(h.x0-4, h.yb+2, 1)]);
  poly('#7d838a', [[h.x0-4, h.yb], [h.x1+4, h.yb], p34(h.x1+4, h.yb, 1), p34(h.x0-4, h.yb, 1)]);
  ctx.fillStyle = '#6a7076'; ctx.fillRect(h.x0-4, h.yb, h.x1-h.x0+8, 3);
  // Seitenwand (Steine, Fenster)
  poly('#a83226', [[h.x1, h.yt], [h.x1, h.yb], p34(h.x1, h.yb, 1), p34(h.x1, h.yt, 1)]);
  ctx.strokeStyle = 'rgba(216,200,168,.7)'; ctx.lineWidth = 0.7;
  for (let y = h.yt + 11; y < h.yb; y += 11) { const [a, b] = p34(h.x1, y, 1); ctx.beginPath(); ctx.moveTo(h.x1, y); ctx.lineTo(a, b); ctx.stroke(); }
  for (const d of [0.22, 0.62]) {
    const q = [p34(h.x1, 80, d), p34(h.x1, 80, d + 0.2), p34(h.x1, 94, d + 0.2), p34(h.x1, 94, d)];
    poly('#5a3b1c', q);
    if (o.done) { const k = 1.2; poly('#9fe3ff', [p34(h.x1, 81, d + 0.02), p34(h.x1, 81, d + 0.18), p34(h.x1, 93, d + 0.18), p34(h.x1, 93, d + 0.02)]); poly('#e6f8ff', [p34(h.x1, 81, d + 0.02), p34(h.x1, 81, d + 0.07), p34(h.x1, 93, d + 0.07), p34(h.x1, 93, d + 0.02)]); }
    else poly('#2e1f10', [p34(h.x1, 81, d + 0.02), p34(h.x1, 81, d + 0.18), p34(h.x1, 93, d + 0.18), p34(h.x1, 93, d + 0.02)]);
  }
  // Vorderwand (Giebelseite) mit Tür und zwei Fenstern
  ctx.fillStyle = '#7a2218'; ctx.fillRect(h.x0, h.yt, h.x1-h.x0, h.yb-h.yt);
  ctx.fillStyle = '#c0392b'; ctx.fillRect(h.x0+1, h.yt+1, h.x1-h.x0-2, h.yb-h.yt-2);
  ctx.fillStyle = 'rgba(216,200,168,.8)';
  for (let y = h.yt + 11, i = 0; y < h.yb; y += 11, i++) { ctx.fillRect(h.x0, y, h.x1-h.x0, 1); for (let x = h.x0 + (i % 2 ? 6 : 12); x < h.x1; x += 12) ctx.fillRect(x, y - 10, 1, 10); }
  const holes = [[66, 78, 12, 12], [106, 78, 12, 12], [86, 90, 12, 24]];
  holes.forEach(([x, y, w, hh], i) => {
    ctx.fillStyle = '#5a3b1c'; ctx.fillRect(x - 1, y - 1, w + 2, hh + 1);
    if (!o.done) { ctx.fillStyle = '#2e1f10'; ctx.fillRect(x, y, w, hh); return; }
    if (i < 2) { ctx.fillStyle = '#9fe3ff'; ctx.fillRect(x, y, w, hh); ctx.fillStyle = '#e6f8ff'; ctx.fillRect(x, y, 3, hh); ctx.fillStyle = '#5a3b1c'; ctx.fillRect(x + w/2, y, 1, hh); ctx.fillRect(x, y + hh/2, w, 1); ctx.fillStyle = '#ff6b8a'; ctx.fillRect(x, y + hh, w, 2); }
    else { ctx.fillStyle = '#7a4a22'; ctx.fillRect(x, y, w, hh); ctx.fillStyle = '#a0673a'; ctx.fillRect(x + 2, y + 2, w - 4, 8); ctx.fillRect(x + 2, y + 12, w - 4, 9); ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + w - 4, y + 13, 2, 2); }
  });
  // Dachstuhl
  for (let k = 0; k < trusses; k++) drawTruss34(TRUSS_DEPTH[k]);
  if (trusses >= 3) { const [bx, by] = p34(h.ax, h.apex, 1); ctx.strokeStyle = '#5a3b1c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(h.ax, h.apex); ctx.lineTo(bx, by); ctx.stroke(); ctx.strokeStyle = '#a0673a'; ctx.lineWidth = 1.6; ctx.stroke(); }
  // Dach: linke Seite (wächst mit), Giebel vorne, rechte Seite (wird gewischt)
  if (roof) {
    for (let r = 0; r < h.ROWS; r++) if (rowFull(r)) for (let c = 0; c < h.COLS; c++) poly(r % 2 ? '#a3302a' : '#b5372f', roofCell(r, c, -1));
    if (allRoof) poly('#c9a067', [[h.x0-1, h.yt], [h.ax, h.apex+1], [h.x1+1, h.yt]]);
    for (let r = 0; r < h.ROWS; r++) for (let c = 0; c < h.COLS; c++) {
      if (!roof[r][c]) continue;
      const q = roofCell(r, c, 1);
      poly('#7a1c16', q); poly((r + c) % 2 ? '#d0453a' : '#c0392b', [q[0], q[1], [q[2][0], q[2][1] + 0.8], [q[3][0], q[3][1] + 0.8]]);
    }
  }
  if (o.done) { const [cx, cy] = p34(108, 52, 0.6); ctx.fillStyle = '#555'; ctx.fillRect(cx, cy - 12, 6, 12); ctx.fillStyle = '#777'; ctx.fillRect(cx - 1, cy - 13, 8, 2); }
  // Richtbaum mit Bändern auf dem First
  if (o.wreath > 0) {
    const [wx, wy0] = p34(h.ax, h.apex, 0.5), wy = wy0 - 14 * Math.min(1, o.wreath);
    ctx.fillStyle = '#6b4423'; ctx.fillRect(wx - 1, wy, 2, 12);
    ctx.fillStyle = '#2e7a2a'; ctx.fillRect(wx - 6, wy - 7, 12, 6); ctx.fillRect(wx - 4, wy - 12, 8, 6); ctx.fillRect(wx - 2, wy - 15, 4, 4);
    ctx.fillStyle = '#5cb64f'; ctx.fillRect(wx - 2, wy - 11, 2, 3);
    ['#e03b3b', '#ffd23f', '#3fa9f5', '#ff8ad8'].forEach((col, i) => { const sw = Math.sin(t / 150 + i) * 2.5; ctx.fillStyle = col; ctx.fillRect(wx - 5 + i * 3 + sw, wy - 3, 1.5, 8 + (i % 2) * 3); });
  }
}
// Tieflader mit Dachbindern (von der Seite), n = Anzahl noch geladener Binder
function drawFlatbed(x, y, n) {
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x, y + 1, 54, 3);
  ctx.fillStyle = '#2a6fdb'; ctx.fillRect(x + 40, y - 18, 14, 14); ctx.fillStyle = '#9fe3ff'; ctx.fillRect(x + 46, y - 16, 6, 5);
  ctx.fillStyle = '#555'; ctx.fillRect(x, y - 8, 42, 4); ctx.fillStyle = '#888'; ctx.fillRect(x, y - 8, 42, 1);
  for (const wx of [6, 16, 46]) { ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x + wx - 1, y - 4, 8, 5); ctx.fillStyle = '#888'; ctx.fillRect(x + wx + 2, y - 2, 2, 2); }
  for (let i = 0; i < n; i++) {                    // liegende Binder (kleine Dreiecke) gestapelt
    const bx = x + 4 + i * 3, by = y - 9 - i * 4;
    ctx.strokeStyle = '#5a3b1c'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 17, by - 9); ctx.lineTo(bx + 34, by); ctx.closePath(); ctx.stroke();
    ctx.strokeStyle = '#a0673a'; ctx.lineWidth = 1.4; ctx.stroke();
  }
}
