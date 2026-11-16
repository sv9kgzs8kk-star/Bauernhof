/* =====================================================================
   GEMEINSAME BASIS für Hof und alle Minispiele:
   Grafik, Sound, Steuerkreuz, Layout, Fahren auf Spuren, Szenen.
   Wird nach sterne.js und vor dem eigenen Spiel-Code eingebunden.
   Benötigt im HTML: <canvas id="game"></canvas>
   ===================================================================== */
const G = 24, T = 12;                        // Zelle (Spur) / Grafik-Kachel in Logik-Pixeln
const DIRS = { up:[0,-1,-Math.PI/2], down:[0,1,Math.PI/2], left:[-1,0,Math.PI], right:[1,0,0] };
const cvs = document.getElementById('game'), ctx = cvs.getContext('2d');
const bg = document.createElement('canvas'), bctx = bg.getContext('2d');
const $ = id => document.getElementById(id);
const show = id => $(id).classList.remove('hidden'), hide = id => $(id).classList.add('hidden');
let W, H, gc, gr, particles = [];

function rnd(a, b) { return a + Math.random() * (b - a); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
const approach = (v, t, s) => v < t ? Math.min(t, v + s) : Math.max(t, v - s);
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2*Math.PI; while (d < -Math.PI) d += 2*Math.PI; return d; };
const pick = a => a[(Math.random()*a.length)|0];
const bump = el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };
function spawn(x, y, vx, vy, life, col, grav=0) { particles.push({ x, y, vx, vy, life, col, grav }); }
function seeded(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- Steuerkreuz (wird automatisch in die Seite eingefügt) ---------- */
document.body.insertAdjacentHTML('beforeend', `
<div id="ctrl" class="hidden">
  <div id="pad">
    <div></div>
    <div class="pb" data-d="up"><svg viewBox="0 0 10 10"><path d="M5 1 L9 8 L1 8 Z" fill="#5a3d00"/></svg></div>
    <div></div>
    <div class="pb" data-d="left"><svg viewBox="0 0 10 10"><path d="M1 5 L8 1 L8 9 Z" fill="#5a3d00"/></svg></div>
    <div id="padcenter"></div>
    <div class="pb" data-d="right"><svg viewBox="0 0 10 10"><path d="M9 5 L2 1 L2 9 Z" fill="#5a3d00"/></svg></div>
    <div></div>
    <div class="pb" data-d="down"><svg viewBox="0 0 10 10"><path d="M5 9 L9 2 L1 2 Z" fill="#5a3d00"/></svg></div>
    <div></div>
  </div>
</div>`);

/* ---------- Sound ---------- */
let AC = null, master, engGain, eng, noiseBuf, muted = false;
function initAudio() {
  if (AC) { AC.resume && AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = muted ? 0 : 0.6; master.connect(AC.destination);
    eng = AC.createOscillator(); eng.type = 'sawtooth'; eng.frequency.value = 48;
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240;
    engGain = AC.createGain(); engGain.gain.value = 0;
    eng.connect(lp); lp.connect(engGain); engGain.connect(master); eng.start();
    noiseBuf = AC.createBuffer(1, AC.sampleRate * 0.12, AC.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random()*2-1;
    AC.resume && AC.resume();
  } catch (e) { AC = null; }
}
function tone(f, dur, type='square', vol=0.12, when=0, slideTo=null) {
  if (!AC) return;
  const t = AC.currentTime + when, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
function noise(freqLo, freqHi, vol=0.09, n=3) {
  if (!AC) return;
  for (let i = 0; i < n; i++) {
    const s = AC.createBufferSource(); s.buffer = noiseBuf;
    const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = rnd(freqLo, freqHi);
    const g = AC.createGain(); const t = AC.currentTime + i*0.06;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    s.connect(bp); bp.connect(g); g.connect(master); s.start(t);
  }
}
const sfx = {
  crunch() { noise(1500, 2600); },
  clod()   { noise(300, 700, .15); },
  plink()  { [0, .08, .16].forEach(w => tone(rnd(900, 1400), .06, 'sine', .06, w)); },
  honk()   { tone(392, .18, 'square', .1); tone(392, .25, 'square', .1, .25); },
  bonk()   { tone(140, .18, 'triangle', .25, 0, 70); },
  pour()   { tone(300, .6, 'triangle', .08, 0, 700); },
  load()   { tone(523, .12, 'square', .1); tone(784, .2, 'square', .1, .12); },
  win()    { [523,659,784,1047,784,1047].forEach((f,i)=>tone(f, .25, 'square', .1, i*.15)); },
  unlock() { [392,523,659,784,1047].forEach((f,i)=>tone(f, .18, 'triangle', .14, i*.09)); },
  enter()  { tone(330, .15, 'square', .08, 0, 660); },
  click()  { tone(660, .07, 'square', .07); },
  baa()    { const f = rnd(300, 380); tone(f, .12, 'sawtooth', .05, 0, f*.9); tone(f*.95, .3, 'sawtooth', .05, .1, f*.8); },
  bark()   { tone(520, .07, 'square', .09, 0, 320); tone(560, .07, 'square', .09, .12, 330); }
};
function setEngine(on, moving, base = 46) {
  if (!AC) return;
  engGain.gain.setTargetAtTime(on ? (moving ? 0.08 : 0.03) : 0, AC.currentTime, 0.1);
  eng.frequency.setTargetAtTime(moving ? base + 24 : base, AC.currentTime, 0.15);
}
document.querySelectorAll('.mute').forEach(b => b.addEventListener('click', e => {
  e.stopPropagation(); muted = !muted;
  document.querySelectorAll('.mute').forEach(x => x.textContent = muted ? '🔇' : '🔊');
  if (AC) master.gain.value = muted ? 0 : 0.6;
}));

/* ---------- Pixel-Grafik: Kacheln ---------- */
function makeTile(paint) {
  const c = document.createElement('canvas'); c.width = c.height = T;
  const g = c.getContext('2d'); const R = (col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  paint(R); return c;
}
const tiles = { grass: [], stubble: [], road: [], path: [], tilled: [], sown: [], sprout: [], straw: [] };
const CROPS = {
  wheat: { emoji: '🌾', grain: ['#f6d264','#e2b23c'], ripe: [], green: [] },
  corn:  { emoji: '🌽', grain: ['#ffb000','#f2c230'], ripe: [], green: [] },
  raps:  { emoji: '🌼', grain: ['#4a3a22','#2e2414'], ripe: [], green: [] },
};
const tilledBase = R => {
  R('#6b4a2b',0,0,T,T);
  for (let y=1;y<T;y+=3) R('#4f3520',0,y,T,1);
  for (let i=0;i<5;i++) R('#8a6440', rnd(0,T)|0, rnd(0,T)|0, 1, 1);
};
for (let v = 0; v < 6; v++) {
  tiles.grass.push(makeTile(R => {
    R('#5cae4a',0,0,T,T);
    for (let i=0;i<10;i++) R(Math.random()<.5?'#4f9a3f':'#72c45d', rnd(0,T)|0, rnd(0,T)|0, 1, 1);
  }));
  tiles.stubble.push(makeTile(R => {
    R('#c8a45e',0,0,T,T);
    for (let y=1;y<T;y+=3) for (let x=(y%2);x<T;x+=2) R('#a6843f',x,y,1,1);
    for (let i=0;i<3;i++) R('#ead08a', rnd(0,T-2)|0, rnd(0,T)|0, 2, 1);
  }));
  tiles.straw.push(makeTile(R => {
    R('#d8b56a',0,0,T,T);
    for (let i=0;i<8;i++) { const x = rnd(0,T-3)|0, y = rnd(0,T)|0; R(Math.random()<.5?'#f0d48c':'#b8944a', x, y, 3, 1); }
  }));
  tiles.road.push(makeTile(R => {
    R('#8d6c47',0,0,T,T); R('#76593a',0,3,T,2); R('#76593a',0,8,T,2);
    for (let i=0;i<4;i++) R(Math.random()<.5?'#a5845d':'#6a4f33', rnd(0,T)|0, rnd(0,T)|0, 1, 1);
  }));
  tiles.path.push(makeTile(R => {
    R('#b58e5e',0,0,T,T);
    for (let i=0;i<7;i++) R(Math.random()<.5?'#a07a4c':'#c9a676', rnd(0,T)|0, rnd(0,T)|0, 1, 1);
  }));
  tiles.tilled.push(makeTile(tilledBase));
  tiles.sown.push(makeTile(R => { tilledBase(R); for (let y=0;y<T;y+=3) for (let x=(rnd(0,2)|0);x<T;x+=3) R('#d9c27a',x,y,1,1); }));
  tiles.sprout.push(makeTile(R => { tilledBase(R); for (let y=0;y<T;y+=3) for (let x=(rnd(0,2)|0);x<T;x+=3) { R('#5fae38',x,y,1,2); R('#9be05a',x,y,1,1); } }));
  CROPS.wheat.ripe.push(makeTile(R => {
    R('#c9952a',0,0,T,T);
    for (let i=0;i<6;i++){ const x = i*2 + (Math.random()<.5?0:1), top = rnd(0,3)|0;
      R('#a87a1c', x, top+3, 1, T-top-3); R('#f6d264', x, top, 1, 3); R('#ffe9a0', x, top, 1, 1); }
  }));
  CROPS.wheat.green.push(makeTile(R => {
    R('#4f8f2f',0,0,T,T);
    for (let i=0;i<6;i++){ const x = i*2 + (Math.random()<.5?0:1), top = rnd(0,3)|0;
      R('#2f6b1f', x, top+2, 1, T-top-2); R('#8fd05a', x, top, 1, 2); }
  }));
  CROPS.corn.ripe.push(makeTile(R => {
    R('#5d8a2a',0,0,T,T);
    for (let x=1;x<T;x+=4){ R('#3f6d1e',x,0,1,T); R('#8fc04a',x+1,rnd(1,5)|0,2,1); R('#8fc04a',Math.max(0,x-1),rnd(6,10)|0,1,1);
      const cy = rnd(2,8)|0; R('#c79a1a',x+1,cy,2,3); R('#f2c230',x+1,cy,1,2); }
  }));
  CROPS.corn.green.push(makeTile(R => {
    R('#4f8f2f',0,0,T,T);
    for (let x=1;x<T;x+=4){ R('#2f6b1f',x,0,1,T); R('#8fd05a',x+1,rnd(1,5)|0,2,1); R('#8fd05a',Math.max(0,x-1),rnd(6,10)|0,1,1); }
  }));
  CROPS.raps.ripe.push(makeTile(R => {
    R('#7d7035',0,0,T,T);
    for (let i=0;i<4;i++) R('#6a5f2b', (rnd(0,T)|0), 0, 1, T);
    for (let i=0;i<12;i++) R('#a39446', rnd(0,T)|0, rnd(0,T)|0, 1, 1);
    for (let i=0;i<6;i++) R('#574d22', rnd(0,T)|0, rnd(0,T)|0, 1, 1);
  }));
  CROPS.raps.green.push(makeTile(R => {
    R('#5d9a2e',0,0,T,T);
    for (let i=0;i<16;i++) R(Math.random()<.5?'#ffe14a':'#ffd000', rnd(0,T)|0, rnd(0,T)|0, 1, 1);
    for (let i=0;i<4;i++) R('#fff59a', rnd(0,T)|0, rnd(0,T)|0, 1, 1);
  }));
}
const flowerTiles = ['#ff6b8a','#ffd23f','#ffffff','#b48cff'].map(col => makeTile(R => {
  R('#5cae4a',0,0,T,T);
  for (let i=0;i<8;i++) R('#4f9a3f', rnd(0,T)|0, rnd(0,T)|0, 1, 1);
  const x = rnd(2,8)|0, y = rnd(2,8)|0; R(col,x,y,1,1); R(col,x+2,y,1,1); R(col,x+1,y-1,1,1); R(col,x+1,y+1,1,1); R('#ffcc00',x+1,y,1,1);
}));

/* ---------- Pixel-Grafik: Fahrzeuge & Figuren ---------- */
function rotateSprite(base) {
  const S = base.width, h = S/2, O = 34, frames = [], shadows = [];
  const bd = base.getContext('2d').getImageData(0,0,S,S).data;
  for (let k = 0; k < 32; k++) {
    const a = k/32*Math.PI*2, ca = Math.cos(a), sa = Math.sin(a);
    const o = document.createElement('canvas'); o.width = o.height = O;
    const s = document.createElement('canvas'); s.width = s.height = O;
    const og = o.getContext('2d'), sg = s.getContext('2d');
    const id = og.createImageData(O,O), sd = sg.createImageData(O,O);
    for (let oy=0; oy<O; oy++) for (let ox=0; ox<O; ox++) {
      const cx = ox-O/2+0.5, cy = oy-O/2+0.5;
      const sx = Math.floor(cx*ca + cy*sa + h), sy = Math.floor(-cx*sa + cy*ca + h);
      if (sx<0||sy<0||sx>=S||sy>=S) continue;
      const si = (sy*S+sx)*4; if (bd[si+3] === 0) continue;
      const di = (oy*O+ox)*4;
      id.data[di]=bd[si]; id.data[di+1]=bd[si+1]; id.data[di+2]=bd[si+2]; id.data[di+3]=255;
      sd.data[di+3]=70;
    }
    og.putImageData(id,0,0); sg.putImageData(sd,0,0);
    frames.push(o); shadows.push(s);
  }
  return { frames, shadows };
}
function sprite(S, paint) {
  const b = document.createElement('canvas'); b.width = b.height = S;
  const g = b.getContext('2d'); paint((col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h);}); return b;
}
function paintTractor(R, ox, oy) {
  const P = (col,x,y,w,h) => R(col, x+ox, y+oy, w, h);
  P('#1a1a1a',2,1,7,4); P('#1a1a1a',2,17,7,4); P('#444',3,2,5,1); P('#444',3,18,5,1);
  P('#1a1a1a',14,3,4,3); P('#1a1a1a',14,16,4,3);
  P('#8e1f1f',6,6,14,10); P('#d83a3a',7,7,12,8); P('#ef6a6a',12,7,7,1);
  P('#333',13,8,1,1); P('#333',15,8,1,1);
  P('#8e1f1f',5,5,7,12); P('#f2f2f2',6,6,5,10); P('#cfcfcf',6,14,5,2);
  P('#ffcc00',19,9,1,4);
}
const frameIdx = a => ((Math.round(a/(2*Math.PI)*32) % 32) + 32) % 32;

// Tiere (Seitenansicht, 8×6 Pixel, werden doppelt groß gezeichnet)
const ANIMALS = [
  { id: 'huhn',    need: 3,  pal: { w:'#ffffff', r:'#e23b3b', y:'#ffb000', k:'#222', o:'#ff9a1f' },
    px: ['....r...','...wwky.','ww.www..','wwwwww..','.wwww...','..o.o...'] },
  { id: 'schaf',   need: 9,  pal: { w:'#f4f4f4', g:'#7a7a7a', k:'#222' },
    px: ['..www...','.wwwwwgg','wwwwwwgk','wwwwwwgg','.wwwww..','.k..k...'] },
  { id: 'schwein', need: 18, pal: { p:'#f7a8b8', d:'#d9708a', k:'#222' },
    px: ['......p.','.ppppppp','pppppppk','ppppppdd','.ppppp..','.d..d...'] },
  { id: 'kuh',     need: 30, pal: { w:'#ffffff', k:'#222', n:'#f7a8b8' },
    px: ['k.....kk','wwkkwwww','wkkwwwwk','wwwwkwnn','wwwwww..','.k..k...'] },
  { id: 'pferd',   need: 45, pal: { b:'#8b5a2b', m:'#3b2412', k:'#222' },
    px: ['.....mb.','m....mbb','bbbbbbbk','bbbbbb..','bbbbbb..','b.b..b.b'] },
];
function drawAnimalPix(a, x, y, flip, hop = 0, scale = 2) {
  const w = a.px[0].length;
  a.px.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === '.') return;
    const ii = flip ? w - 1 - i : i;
    R(a.pal[ch], Math.round(x) + ii*scale, Math.round(y) + j*scale - hop, scale, scale);
  }));
}

function R(col, x, y, w, h) { ctx.fillStyle = col; ctx.fillRect(x|0, y|0, w, h); }
const ARROW = ['..XXX..','..XXX..','..XXX..','XXXXXXX','.XXXXX.','..XXX..','...X...'];
function drawArrow(x, y) {
  ARROW.forEach((row, j) => [...row].forEach((ch, i) => { if (ch==='X') R('#5a3d00', x+i+1, y+j+1, 1, 1); }));
  ARROW.forEach((row, j) => [...row].forEach((ch, i) => { if (ch==='X') R('#ffd23f', x+i, y+j, 1, 1); }));
}
const DIG = { 0:['111','101','101','101','111'],1:['010','110','010','010','111'],2:['111','001','111','100','111'],
  3:['111','001','111','001','111'],4:['101','101','111','001','001'],5:['111','100','111','001','111'],
  6:['111','100','111','101','111'],7:['111','001','010','010','010'],8:['111','101','111','101','111'],9:['111','101','111','001','111'] };
const STAR = ['00100','01110','11111','01110','01010'];
function drawPix(rows, x, y, col) { rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '1') R(col, x+i, y+j, 1, 1); })); }
function drawNumber(n, x, y, col) { String(n).split('').forEach((d, i) => drawPix(DIG[d], x + i*4, y, col)); }
// Hindernisse: t Baum, r Stein, p Teich
function drawObstacle(g, o, x, y, pondL, pondR) {
  const B = (col,x2,y2,w,h)=>{g.fillStyle=col;g.fillRect(x+x2,y+y2,w,h);};
  if (o === 't') {
    B('rgba(0,0,0,.28)',5,17,17,5); B('#6b4423',10,14,4,7);
    B('#24561f',4,4,16,12); B('#24561f',6,2,12,16);
    B('#3f8f37',6,4,12,10); B('#3f8f37',8,3,8,13); B('#5cb64f',8,5,4,3); B('#5cb64f',13,9,2,2);
  } else if (o === 'r') {
    B('rgba(0,0,0,.28)',5,15,17,5); B('#4d4d4d',4,8,16,11); B('#8a8a8a',5,7,14,10); B('#b3b3b3',7,8,6,3); B('#6d6d6d',5,15,14,2);
  } else if (o === 'p') {
    B('#2f6fa8', pondL?0:2, 2, G-(pondL?0:2)-(pondR?0:2), G-4); B('#3b82c4', pondL?0:3, 3, G-(pondL?0:3)-(pondR?0:3), G-6);
    B('#7cc0f0',5,8,5,1); B('#7cc0f0',13,14,6,1); B('#7cc0f0',8,17,3,1);
  }
}

/* ---------- Layout (Spielfeld + Steuerkreuz) ---------- */
function layout(recompute = true) {
  const iw = innerWidth, ih = innerHeight, land = iw > ih;
  const cs = clamp(Math.min(iw, ih) * 0.42, 190, 300);
  const aw = land ? iw - cs : iw, ah = land ? ih : ih - cs;
  if (recompute) {
    const cp = Math.max(44, Math.min(aw, ah) / 8);
    gc = Math.max(8, Math.floor(aw / cp)); gr = Math.max(8, Math.floor(ah / cp));
    W = gc*G; H = gr*G; cvs.width = W; cvs.height = H; bg.width = W; bg.height = H;
  }
  const s = Math.min(aw / W, ah / H), cw = W*s, ch = H*s, cl = (aw - cw)/2, ct = (ah - ch)/2;
  Object.assign(cvs.style, { width: cw+'px', height: ch+'px', left: cl+'px', top: ct+'px' });
  document.querySelectorAll('.hud').forEach(h => Object.assign(h.style, { left: (cl+8)+'px', top: (ct+8)+'px', width: (cw-16)+'px' }));
  const c = $('ctrl');
  if (land) Object.assign(c.style, { left: aw+'px', top: '0px', width: cs+'px', height: ih+'px' });
  else Object.assign(c.style, { left: '0px', top: ah+'px', width: iw+'px', height: cs+'px' });
  Object.assign($('pad').style, { width: cs*0.9+'px', height: cs*0.9+'px' });
}

/* ---------- Steuerkreuz-Eingabe ---------- */
const pad = $('pad'), active = new Map();
let keyDir = null, held = null, padHint = true;
function dirAt(e) {
  const r = pad.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width/2), dy = e.clientY - (r.top + r.height/2);
  if (Math.hypot(dx, dy) < r.width*0.1) return null;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}
function refreshHeld() {
  held = keyDir;
  for (const d of active.values()) if (d) held = d;
  document.querySelectorAll('.pb').forEach(b => b.classList.toggle('on', b.dataset.d === held));
  if (held && padHint) { padHint = false; document.querySelectorAll('.pb').forEach(b => b.classList.remove('hint')); }
}
function clearHeld() { active.clear(); keyDir = null; refreshHeld(); }
function showPadHint() { padHint = true; document.querySelectorAll('.pb').forEach(b => b.classList.add('hint')); }
pad.addEventListener('pointerdown', e => {
  e.preventDefault(); initAudio();
  try { pad.setPointerCapture(e.pointerId); } catch (_) {}
  active.set(e.pointerId, dirAt(e)); refreshHeld();
});
pad.addEventListener('pointermove', e => { if (active.has(e.pointerId)) { active.set(e.pointerId, dirAt(e)); refreshHeld(); } });
const release = e => { active.delete(e.pointerId); refreshHeld(); };
['pointerup','pointercancel','lostpointercapture'].forEach(ev => pad.addEventListener(ev, release));
const KEYS = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };
addEventListener('keydown', e => { if (KEYS[e.key]) { keyDir = KEYS[e.key]; refreshHeld(); e.preventDefault(); } });
addEventListener('keyup', e => { if (KEYS[e.key] === keyDir) { keyDir = null; refreshHeld(); } });
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());

/* ---------- Fahren auf Spuren (Zelle für Zelle) ---------- */
function newMover(r, c, a) { return { r, c, a, moving: false, prog: 0, tr: r, tc: c, dir: null, shake: 0, bumpCd: 0, done: false }; }
const cellX = c => c*G + G/2, cellY = r => r*G + G/2;
function moverPos(m) {
  if (!m.moving) return { x: cellX(m.c), y: cellY(m.r) };
  return { x: cellX(m.c) + (cellX(m.tc)-cellX(m.c))*m.prog, y: cellY(m.r) + (cellY(m.tr)-cellY(m.r))*m.prog };
}
function moverTry(m, passable) {
  const [dx, dy] = DIRS[held], nr = m.r + dy, nc = m.c + dx;
  if (passable(nr, nc)) { Object.assign(m, { moving: true, prog: 0, tr: nr, tc: nc, dir: held, done: false }); return true; }
  if (m.bumpCd <= 0) { sfx.bonk(); m.shake = 0.25; m.bumpCd = 0.5; }
  return false;
}
function moverUpdate(m, dt, opts) {
  m.bumpCd -= dt; m.shake = Math.max(0, m.shake - dt);
  if (!m.moving && held) {
    const ta = DIRS[held][2], d = angDiff(ta, m.a);
    if (Math.abs(d) > 0.02) { m.a += clamp(d, -11*dt, 11*dt); if (Math.abs(angDiff(ta, m.a)) < 0.08) m.a = ta; }
    if (Math.abs(angDiff(ta, m.a)) < 0.02) { m.a = ta; moverTry(m, opts.passable); }
  } else if (m.moving) {
    m.prog += opts.speed * dt;
    opts.onProg && opts.onProg(m);
    if (m.prog >= 1) {
      const left = m.prog - 1;
      m.r = m.tr; m.c = m.tc; m.moving = false; m.prog = 0;
      if (opts.onArrive && opts.onArrive(m) === 'stop') return;
      if (held && held === m.dir && moverTry(m, opts.passable)) m.prog = left;
    }
  }
}
function drawMover(m, spr, time) {
  const p = moverPos(m), k = frameIdx(m.a);
  const sx = m.shake > 0 ? Math.round(Math.sin(time/20)*1.5) : 0;
  const bob = m.moving && Math.sin(time/60) > 0.5 ? 1 : 0;
  ctx.drawImage(spr.shadows[k], Math.round(p.x)-17+2+sx, Math.round(p.y)-17+3);
  ctx.drawImage(spr.frames[k], Math.round(p.x)-17+sx, Math.round(p.y)-17-bob);
}

/* ---------- Szenen & Hauptschleife ---------- */
let scene = null;
function go(next, arg) { if (scene && scene.exit) scene.exit(); clearHeld(); particles = []; scene = next; scene.enter(arg); }
function startLoop(first, arg) {
  addEventListener('resize', () => scene && scene.resize && scene.resize());
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last)/1000); last = now;
    scene.update(dt);
    for (const p of particles) { p.life -= dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += p.grav*dt; }
    particles = particles.filter(p => p.life > 0);
    scene.draw(now);
    for (const q of particles) R(q.col, q.x, q.y, 1, 1);
    requestAnimationFrame(loop);
  }
  go(first, arg);
  requestAnimationFrame(loop);
}
function confetti() {
  const cols = ['#ff4d4d','#ffd23f','#3fa9f5','#7ed957','#ff8ad8','#ffffff'];
  for (let i = 0; i < 160; i++) spawn(rnd(0,W), rnd(-H*.5,0), rnd(-15,15), rnd(10,40), rnd(2,4), pick(cols), 30);
}

/* ---------- Wörter & Vorlesen ---------- */
// Angezeigt wird immer in GROSSBUCHSTABEN, vorgelesen in normaler Schreibweise
// (sonst buchstabiert die Sprachausgabe manchmal „W-O-L-L-E“).
const WORDS = {
  wheat: ['WEIZEN', 'Weizen'], corn: ['MAIS', 'Mais'], raps: ['RAPS', 'Raps'],
  sheep: ['SCHAF', 'Schaf'], wool: ['WOLLE', 'Wolle'], field: ['FELD', 'Feld'],
  star: ['STERNE', 'Sterne'], thanks: ['DANKE', 'Danke!']
};
let deVoice = null;
function pickVoice() {
  try {
    const vs = speechSynthesis.getVoices();
    deVoice = vs.find(v => /^de/i.test(v.lang) && /Anna|Helena|Petra|Google/i.test(v.name)) || vs.find(v => /^de/i.test(v.lang)) || null;
  } catch (e) {}
}
try { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } catch (e) {}
function say(text) {
  if (muted) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE'; u.rate = 0.85; u.pitch = 1.1;
    if (deVoice) u.voice = deVoice;
    speechSynthesis.speak(u);
  } catch (e) {}
}
const sayWord = key => WORDS[key] && say(WORDS[key][1]);
// Elemente mit data-say="wool" lesen ihr Wort beim Antippen vor
document.addEventListener('click', e => { const el = e.target.closest('[data-say]'); if (el) sayWord(el.dataset.say); });
