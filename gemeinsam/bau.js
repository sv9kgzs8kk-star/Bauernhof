/* =====================================================================
   BAUSTELLE – gemeinsame Grafik und Wörter (nach sterne.js und basis.js einbinden)
   Bauarbeiter, Bagger (von oben, drehbar), Kipper, Boden-Kacheln
   ===================================================================== */
Object.assign(WORDS, {
  site: ['BAUSTELLE', 'Baustelle'], digger: ['BAGGER', 'Bagger'], dig: ['BAGGERN', 'Baggern'],
  dirt: ['ERDE', 'Erde'], tipper: ['KIPPER', 'Kipper'], house: ['HAUS', 'Haus'], concrete: ['BETON', 'Beton']
});
const BAU_STARS_DIG = 3;                       // Sterne für die fertige Grube

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
