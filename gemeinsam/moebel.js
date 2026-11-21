/* =====================================================================
   MÖBEL – gemeinsam für Wohnhaus/Bauernhaus (Einrichten) und den Umzug beim Abriss
   ===================================================================== */
Object.assign(WORDS, {
  bed: ['BETT', 'Bett'], table: ['TISCH', 'Tisch'], chair: ['STUHL', 'Stuhl'], sofa: ['SOFA', 'Sofa'], lamp: ['LAMPE', 'Lampe'],
  fridge: ['KÜHLSCHRANK', 'Kühlschrank'], stove: ['HERD', 'Herd'], tub: ['BADEWANNE', 'Badewanne'], toilet: ['KLO', 'Klo'],
  closet: ['SCHRANK', 'Schrank'], plant: ['PFLANZE', 'Pflanze'], tv: ['FERNSEHER', 'Fernseher'], rug: ['TEPPICH', 'Teppich'],
  train: ['EISENBAHN', 'Eisenbahn'], sleep: ['SCHLAFEN', 'Schlafen'],
  rocker: ['SCHAUKELSTUHL', 'Schaukelstuhl'], chest: ['TRUHE', 'Truhe'], woodpile: ['HOLZSTAPEL', 'Holzstapel'], fur: ['FELL', 'Fell']
});
// Möbel von schräg oben: Breite/Höhe in Pixeln (vor der Vergrößerung S), Zeichnen ab linker oberer Ecke. flat = liegt am Boden (wird zuerst gezeichnet)
const FURN = [
  { key: 'bed', w: 28, h: 38, draw(F, x, y) {
      F('#5a3b1c', x, y, 28, 38); F('#a0673a', x + 1, y + 1, 26, 5); F('#c9a067', x + 1, y + 1, 26, 1);
      F('#ffffff', x + 3, y + 6, 22, 29); F('#e6eef2', x + 3, y + 6, 22, 1);
      F('#f6f1e4', x + 5, y + 8, 18, 7); F('#d9d2c0', x + 5, y + 14, 18, 1);
      F('#2a6fdb', x + 2, y + 17, 24, 19); F('#6aa0f0', x + 2, y + 17, 24, 3); F('#173f80', x + 2, y + 35, 24, 1);
      for (let i = 0; i < 4; i++) F('#ffd23f', x + 5 + i * 5, y + 24 + (i % 2) * 5, 2, 2);
    } },
  { key: 'sofa', w: 46, h: 24, draw(F, x, y) {
      F('#7a1a12', x, y, 46, 24); F('#c0392b', x + 1, y + 1, 44, 8); F('#e06a5a', x + 1, y + 1, 44, 2);
      F('#a93226', x + 1, y + 9, 6, 14); F('#a93226', x + 39, y + 9, 6, 14);
      F('#d9534a', x + 7, y + 9, 15, 13); F('#d9534a', x + 24, y + 9, 15, 13); F('#ef8a80', x + 7, y + 9, 32, 1); F('#7a1a12', x + 22, y + 9, 2, 13);
      F('#ffd23f', x + 9, y + 3, 7, 5); F('#3fa9f5', x + 30, y + 3, 7, 5);
    } },
  { key: 'tv', w: 26, h: 20, draw(F, x, y, on, t) {
      F('#5a3b1c', x, y + 12, 26, 8); F('#7a4a22', x + 1, y + 13, 24, 3);
      F('#222', x + 2, y, 22, 14); F(Math.floor(t / 600) % 2 ? '#3fa9f5' : '#5cb64f', x + 4, y + 2, 18, 10); F('#ffd23f', x + 14, y + 4, 4, 4); F('#ffffff', x + 6, y + 8, 6, 2);
    } },
  { key: 'table', w: 32, h: 24, draw(F, x, y) {
      F('#5a3b1c', x + 2, y + 18, 3, 6); F('#5a3b1c', x + 27, y + 18, 3, 6);
      F('#7a4a22', x, y, 32, 19); F('#c98a4f', x + 1, y + 1, 30, 16); F('#e0a868', x + 1, y + 1, 30, 2); F('#a0673a', x + 1, y + 9, 30, 1);
      F('#ffffff', x + 6, y + 5, 7, 6); F('#e03b3b', x + 8, y + 7, 3, 2); F('#3fa9f5', x + 21, y + 4, 4, 7); F('#9fe3ff', x + 22, y + 5, 1, 4);
    } },
  { key: 'chair', w: 16, h: 20, draw(F, x, y) {
      F('#5a3b1c', x + 1, y + 15, 2, 5); F('#5a3b1c', x + 13, y + 15, 2, 5);
      F('#7a4a22', x, y, 16, 6); F('#a0673a', x + 1, y + 1, 14, 3);
      F('#7a4a22', x, y + 6, 16, 10); F('#c98a4f', x + 1, y + 7, 14, 8); F('#e0a868', x + 1, y + 7, 14, 1); F('#e03b3b', x + 3, y + 9, 10, 4);
    } },
  { key: 'lamp', w: 16, h: 24, draw(F, x, y, on) {
      F('#555', x + 4, y + 21, 8, 3); F('#777', x + 7, y + 10, 2, 12);
      F('#c48a00', x + 1, y + 1, 14, 11); F(on ? '#ffe066' : '#e0c060', x + 2, y + 2, 12, 9); F(on ? '#fff8c0' : '#f0dc90', x + 3, y + 3, 5, 3);
    } },
  { key: 'fridge', w: 18, h: 30, draw(F, x, y) {
      F('#8f9aa3', x, y, 18, 30); F('#e8eef2', x + 1, y + 1, 16, 6); F('#ffffff', x + 1, y + 7, 16, 22); F('#cfd8de', x + 1, y + 15, 16, 1);
      F('#8f9aa3', x + 13, y + 9, 2, 5); F('#8f9aa3', x + 13, y + 18, 2, 7); F('#e03b3b', x + 4, y + 10, 3, 3); F('#ffd23f', x + 5, y + 20, 3, 3);
    } },
  { key: 'stove', w: 20, h: 22, draw(F, x, y) {
      F('#8f9aa3', x, y, 20, 22); F('#e8eef2', x + 1, y + 1, 18, 11);
      for (const [a, b] of [[3, 2], [11, 2], [3, 7], [11, 7]]) { F('#333', x + a, y + b, 6, 4); F('#555', x + a + 1, y + b + 1, 4, 2); }
      F('#ffffff', x + 1, y + 12, 18, 9); F('#333', x + 3, y + 14, 14, 5); F('#e08a2c', x + 4, y + 16, 12, 2);
    } },
  { key: 'tub', w: 40, h: 22, flat: true, draw(F, x, y) {
      F('#8f9aa3', x, y, 40, 22); F('#ffffff', x + 1, y + 1, 38, 20); F('#cfd8de', x + 1, y + 19, 38, 2);
      F('#7cc0f0', x + 4, y + 4, 32, 13); F('#9fe3ff', x + 6, y + 5, 10, 2); F('#ffffff', x + 22, y + 8, 4, 3); F('#ffffff', x + 27, y + 10, 3, 2);
      F('#ffd23f', x + 12, y + 9, 5, 4); F('#e08a2c', x + 16, y + 10, 2, 1);                                    // Quietscheente
      F('#8f9aa3', x + 36, y + 8, 3, 6);
    } },
  { key: 'toilet', w: 14, h: 20, draw(F, x, y) {
      F('#8f9aa3', x + 1, y, 12, 7); F('#ffffff', x + 2, y + 1, 10, 5);
      F('#8f9aa3', x, y + 7, 14, 13); F('#ffffff', x + 1, y + 8, 12, 11); F('#cfe6f2', x + 4, y + 10, 6, 6);
    } },
  { key: 'closet', w: 30, h: 24, draw(F, x, y) {
      F('#5a3b1c', x, y, 30, 24); F('#a0673a', x + 1, y + 1, 28, 6); F('#c9a067', x + 1, y + 1, 28, 1);
      F('#7a4a22', x + 1, y + 7, 28, 16); F('#a0673a', x + 2, y + 8, 12, 14); F('#a0673a', x + 16, y + 8, 12, 14);
      F('#ffd23f', x + 12, y + 14, 1, 3); F('#ffd23f', x + 17, y + 14, 1, 3);
    } },
  { key: 'plant', w: 14, h: 22, draw(F, x, y) {
      F('#a0522d', x + 3, y + 14, 8, 8); F('#c9713f', x + 3, y + 14, 8, 2);
      F('#2e7a2a', x + 1, y + 4, 12, 10); F('#3f8f37', x + 3, y + 1, 8, 6); F('#5cb64f', x + 4, y + 3, 3, 3); F('#5cb64f', x + 8, y + 8, 3, 2); F('#ff6b8a', x + 9, y + 3, 2, 2);
    } },
  { key: 'rug', w: 44, h: 28, flat: true, draw(F, x, y) {
      F('#7a1a12', x, y, 44, 28); F('#3fa9f5', x + 2, y + 2, 40, 24); F('#ffd23f', x + 5, y + 5, 34, 18); F('#e03b3b', x + 8, y + 8, 28, 12); F('#ffffff', x + 18, y + 12, 8, 4);
    } },
  { key: 'train', w: 40, h: 26, flat: true, draw(F, x, y, on, t) {
      F('#5cb64f', x, y, 40, 26);                                                                                    // Spielmatte
      F('#8a6440', x + 3, y + 3, 34, 20); F('#5cb64f', x + 7, y + 7, 26, 12);                                          // Gleisoval
      F('#c4c9ce', x + 3, y + 3, 34, 1); F('#c4c9ce', x + 3, y + 22, 34, 1); F('#c4c9ce', x + 3, y + 3, 1, 20); F('#c4c9ce', x + 36, y + 3, 1, 20);
      const per = 2 * (30 + 16), k = Math.floor(t / 40) % per, p = k < 30 ? [4 + k, 3] : k < 46 ? [33, 3 + (k - 30)] : k < 76 ? [33 - (k - 46), 19] : [4, 19 - (k - 76)];
      F('#222', x + p[0] - 1, y + p[1] - 1, 6, 5); F('#e03b3b', x + p[0], y + p[1], 4, 3); F('#ffd23f', x + p[0] + 1, y + p[1], 1, 1);   // Lok
      F('#ffffff', x + 16, y + 10, 8, 6); F('#e03b3b', x + 16, y + 9, 8, 2);                                           // Bahnhof
    } },
  // rustikale Möbel (Holzhaus, passen aber überall)
  { key: 'rocker', w: 18, h: 24, draw(F, x, y) {
      F('#5a3b1c', x + 1, y + 21, 16, 3); F('#7a4a22', x + 2, y + 21, 14, 1);                                         // Kufen
      F('#5a3b1c', x, y, 18, 8); for (let i = 0; i < 4; i++) F('#a0673a', x + 2 + i * 4, y + 1, 2, 6);               // Lehne mit Stäben
      F('#5a3b1c', x, y + 8, 18, 13); F('#a0673a', x + 1, y + 9, 16, 11); F('#c0392b', x + 3, y + 10, 12, 8); F('#ffffff', x + 5, y + 12, 2, 2); F('#ffffff', x + 11, y + 15, 2, 2);   // Sitz mit Kissen
    } },
  { key: 'chest', w: 26, h: 18, draw(F, x, y) {
      F('#3e2410', x, y, 26, 18); F('#7a4a22', x + 1, y + 1, 24, 7); F('#9a6436', x + 1, y + 1, 24, 2);
      F('#5a3418', x + 1, y + 8, 24, 9); F('#8a8078', x + 4, y, 2, 18); F('#8a8078', x + 20, y, 2, 18); F('#ffd23f', x + 11, y + 7, 4, 4); F('#3e2410', x + 12, y + 9, 2, 1);
    } },
  { key: 'woodpile', w: 24, h: 18, draw(F, x, y) {
      for (const [a, b] of [[0, 10], [8, 10], [16, 10], [4, 4], [12, 4], [8, -2]]) { F('#5a3418', x + a, y + b + 2, 8, 8); F('#c9a067', x + a + 1, y + b + 3, 6, 6); F('#a8803c', x + a + 3, y + b + 5, 2, 2); }
    } },
  { key: 'fur', w: 40, h: 26, flat: true, draw(F, x, y) {
      F('#5a3418', x + 6, y + 4, 28, 18); F('#5a3418', x, y + 2, 8, 6); F('#5a3418', x + 32, y + 2, 8, 6); F('#5a3418', x, y + 18, 8, 6); F('#5a3418', x + 32, y + 18, 8, 6);   // Pfoten
      F('#7a4a22', x + 8, y + 6, 24, 14); F('#8a5a2e', x + 10, y + 8, 20, 10); F('#5a3418', x + 15, y, 10, 6); F('#7a4a22', x + 16, y + 1, 8, 4); F('#222', x + 17, y + 2, 1, 1); F('#222', x + 22, y + 2, 1, 1);   // Kopf
    } },
];
// Gedrehte Möbel: 0–3 × 90° im Uhrzeigersinn. Jedes Rechteck wird gedreht, die Pixel bleiben scharf.
const ROT_CACHE = {};
function rotRect(f, r, x, y, w, h) {
  if (r === 1) return [f.h - y - h, x, h, w];
  if (r === 2) return [f.w - x - w, f.h - y - h, w, h];
  if (r === 3) return [y, f.w - x - w, h, w];
  return [x, y, w, h];
}
function rotF(f, r) {
  r = (r | 0) & 3; if (!r || !f) return f;
  const id = f.key + r; if (ROT_CACHE[id] && ROT_CACHE[id].W === (r % 2 ? f.H : f.W)) return ROT_CACHE[id];
  const o = { key: f.key, flat: f.flat, base: f, r, w: r % 2 ? f.h : f.w, h: r % 2 ? f.w : f.h, W: r % 2 ? f.H : f.W, H: r % 2 ? f.W : f.H,
    draw(F, x0, y0, on, t) { f.draw((col, x, y, w, h) => { const q = rotRect(f, r, x, y, w, h); F(col, x0 + q[0], y0 + q[1], q[2], q[3]); }, 0, 0, on, t); } };
  return ROT_CACHE[id] = o;
}
const BY = Object.fromEntries(FURN.map(f => [f.key, f]));
// Kind von vorne (läuft durchs Haus), 10×13 Pixel, zwei Schritt-Bilder
const KID = { pal: { h: '#6b3e1e', s: '#f1c27d', k: '#222', r: '#e03b3b', w: '#ffffff', b: '#2a5db0', n: '#5a3b1c' },
  a: ['..hhhhhh..','.hhhhhhhh.','.hsssssss.','.hskssks..','..ssssss..','.rrrrrrrr.','srrrwwrrrs','s.rrrrrr.s','..bbbbbb..','..bb..bb..','..bb..bb..','.nn....nn.','..........'],
  b: ['..hhhhhh..','.hhhhhhhh.','.hsssssss.','.hskssks..','..ssssss..','.rrrrrrrr.','srrrwwrrrs','s.rrrrrr.s','..bbbbbb..','..bb..bb..','..bb...bb.','.nn.....nn','..........'] };

