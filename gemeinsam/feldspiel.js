/* =====================================================================
   FELD- UND WIESEN-SPIELE (Ernten, Grubbern, Säen / Mähen, Pressen, Einsammeln)
   Wird von spiele/feld/ und spiele/wiese/ eingebunden (nach sterne.js und basis.js).
   Die Seite braucht: mhud, seedpick, gpause, gwin (siehe spiele/feld/index.html).
   ===================================================================== */
const save = Hof.save, persist = Hof.persist;
const GROW_MS = 15000;                        // so lange wächst die Saat auf dem Hof
const FIELD_PRICE = [0, 0, 15, 30, 50, 80];   // Preis für Feld-Stufe 2…5
const MEADOW_PRICE = [0, 0, 20, 40, 70];      // Preis für Wiesen-Stufe 2…4

// Vorschaubild: wie groß ist das Feld / die Wiese
function drawAreaPreview(cv, n, meadow) {
  const g = cv.getContext('2d'), s = 44 / n;
  g.fillStyle = meadow ? '#8fcf6a' : '#5cae4a'; g.fillRect(0, 0, 48, 48);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    g.fillStyle = meadow ? '#3f8f37' : '#c9952a'; g.fillRect(2 + i*s, 2 + j*s, s - 1, s - 1);
    g.fillStyle = meadow ? '#9be05a' : '#f6d264'; g.fillRect(2 + i*s, 2 + j*s, s - 1, Math.max(1, s/4));
  }
}

const FieldGame = (() => {
  const MAXF = [null, [4,3], [5,4], [6,5], [7,6], [9,7]];   // max. Breite × Höhe des Feldes je Stufe
  const LV = [null,
    { f: .55, ob: 0, loads: 3, pond: false, shapes: ['rect'] },
    { f: .65, ob: 1, loads: 3, pond: false, shapes: ['rect','round','L'] },
    { f: .75, ob: 2, loads: 4, pond: false, shapes: ['round','L','notch','two'] },
    { f: .9,  ob: 3, loads: 4, pond: true,  shapes: ['L','notch','two','cross','round'] },
    { f: 1,   ob: 4, loads: 5, pond: true,  shapes: ['L','notch','two','cross','round'] },
  ];
  const MODES = {
    harvest:   { veh: COMBINE,      from: 'crop',   to: 'stub',   speed: 1.8, at: 0.2, fillCls: '',     vehName: 'combine' },
    cultivate: { veh: TRACTOR_GRUB, from: 'stub',   to: 'tilled', speed: 2.1, at: 0.5, fillCls: 'soil', vehName: 'tractor' },
    sow:       { veh: TRACTOR_SEED, from: 'tilled', to: 'sown',   speed: 2.1, at: 0.5, fillCls: 'seed', vehName: 'tractor' },
    // Wiese
    mow:       { veh: TRACTOR_MOW,    from: 'tall',  to: 'cut', speed: 2.2, at: 0.3, fillCls: '', vehName: 'tractor', meadow: true },
    press:     { veh: TRACTOR_BALER,  from: 'swath', to: 'cut', speed: 2.0, at: 0.5, fillCls: '', vehName: 'tractor', meadow: true },
    collect:   { veh: TRACTOR_LOADER, from: null,    to: null,  speed: 2.2, at: 0.5, fillCls: '', vehName: 'tractor', meadow: true },
  };
  const MEADOW_P = { f: .7, ob: 1, loads: 2, pond: false, shapes: ['rect','round','L'] };
  const MEADOW_MAX = [null, [4,3], [5,4], [6,5], [8,6]];          // Wiesen-Größe je Stufe
  const CARRY = 2;                                    // so viele Ballen trägt der Frontlader
  const TRUCKS = [['#e03b3b','#8e1f1f'],['#2a6fdb','#173f80'],['#f08c00','#9a5a00'],['#8e44ad','#5a2a6e'],['#16a085','#0b5e4e']];
  let mode, M, ground, obst, total, left, cap, fill, loads, totalLoads, state, veh, truck, trailer, honked, truckColor = 0, winTimer = null, refilling = false;
  let bales = [], pressCount = 0, carry = 0, loaded = 0, unloadT = 0;
  const crop = () => CROPS[save.field.crop] || CROPS.wheat;

  function makeLayout(level, P = LV[level], maxf = MAXF[level]) {
    const c0 = 1, c1 = gc-2, r0 = 1, r1 = gr-3, regW = c1-c0+1, regH = r1-r0+1;
    for (let attempt = 0; attempt < 200; attempt++) {
      const mask = [], ob = [];
      for (let r = 0; r < gr; r++) { mask.push(Array(gc).fill(false)); ob.push(Array(gc).fill('.')); }
      const [mw, mh] = maxf;               // feste Obergrenze, damit größere Bildschirme nicht schwerer werden
      const fw = clamp(Math.round(regW*P.f), 3, Math.min(regW, mw)), fh = clamp(Math.round(regH*P.f), 3, Math.min(regH, mh));
      const fx = c0 + ((Math.random()*(regW-fw+1))|0), fy = r0 + ((Math.random()*(regH-fh+1))|0);
      let shape = pick(P.shapes);
      if ((shape === 'two' && fw < 5) || ((shape === 'cross' || shape === 'round') && (fw < 4 || fh < 4))) shape = 'L';
      const mx = Math.random() < .5, my = Math.random() < .5;
      const inF = (i, j) => {
        const ii = mx ? fw-1-i : i, jj = my ? fh-1-j : j;
        switch (shape) {
          case 'round': return !((i===0||i===fw-1) && (j===0||j===fh-1));
          case 'L':     return !(ii >= fw - Math.floor(fw/2) && jj < Math.floor(fh/2));
          case 'notch': { const w = Math.max(1, Math.floor(fw/3)), s = Math.floor((fw-w)/2); return !(i >= s && i < s+w && jj < Math.floor(fh/2)); }
          case 'two':   return i !== Math.floor(fw/2);
          case 'cross': { const bw = Math.floor(fw/3), bh = Math.floor(fh/3); return !((i < bw || i >= fw-bw) && (j < bh || j >= fh-bh)); }
          default: return true;
        }
      };
      for (let j = 0; j < fh; j++) for (let i = 0; i < fw; i++) if (inF(i, j)) mask[fy+j][fx+i] = true;
      const start = { r: gr-2, c: 1 };
      const free = (r, c) => r >= r0 && r <= r1 && c >= 0 && c < gc && ob[r][c] === '.' && !(Math.abs(r-start.r) <= 1 && Math.abs(c-start.c) <= 1);
      let n = P.ob;
      if (P.pond && Math.random() < .7 && n > 0) for (let t = 0; t < 30; t++) {
        const r = r0 + ((Math.random()*regH)|0), c = (Math.random()*(gc-1))|0;
        if (free(r,c) && free(r,c+1)) { ob[r][c] = 'p'; ob[r][c+1] = 'p'; n--; break; }
      }
      for (let k = 0; k < n; k++) for (let t = 0; t < 30; t++) {
        const inField = Math.random() < .7, r = r0 + ((Math.random()*regH)|0), c = (Math.random()*gc)|0;
        if (!free(r,c) || inField !== mask[r][c]) continue;
        ob[r][c] = Math.random() < .5 ? 't' : 'r'; break;
      }
      const seen = new Set([start.r*100+start.c]), q = [start];
      while (q.length) {
        const { r, c } = q.shift();
        for (const [dx, dy] of Object.values(DIRS)) {
          const nr = r+dy, nc = c+dx;
          if (nr<0||nc<0||nr>=gr||nc>=gc||ob[nr][nc] !== '.'||seen.has(nr*100+nc)) continue;
          seen.add(nr*100+nc); q.push({ r: nr, c: nc });
        }
      }
      let count = 0, ok = true;
      for (let r = 0; r < gr; r++) for (let c = 0; c < gc; c++) if (mask[r][c] && ob[r][c] === '.') { count++; if (!seen.has(r*100+c)) ok = false; }
      if (ok && count >= P.loads * 2)
        return { gc, gr, level, start, mask: mask.map(row => row.map(b => b ? '1' : '0').join('')), obst: ob.map(row => row.join('')) };
    }
    return null;
  }
  function getMeadowLayout(fresh) {
    let L = save.meadow.layout;
    if (fresh || !L || L.gc !== gc || L.gr !== gr || L.level !== save.meadowLevel) {
      L = null; while (!L) L = makeLayout(save.meadowLevel, MEADOW_P, MEADOW_MAX[save.meadowLevel]);
      save.meadow.layout = L; save.meadow.bales = null; persist();
    }
    return L;
  }
  function getLayout(fresh) {
    let L = save.field.layout;
    if (fresh || !L || L.gc !== gc || L.gr !== gr || L.level !== save.level) {
      L = null; while (!L) L = makeLayout(save.level);
      save.field.layout = L; persist();
    }
    return L;
  }

  function drawCell(r, c) {
    const x = c*G, y = r*G, g = ground[r][c];
    const set = g === 'crop' ? crop().ripe : g === 'stub' ? tiles.stubble : g === 'tilled' ? tiles.tilled
              : g === 'sown' ? tiles.sown : g === 'road' ? tiles.road
              : g === 'tall' ? tiles.tall : g === 'cut' ? tiles.cut : g === 'swath' ? tiles.swath : tiles.grass;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) bctx.drawImage(pick(set), x+i*T, y+j*T);
    const B = (col,x2,y2,w,h)=>{bctx.fillStyle=col;bctx.fillRect(x+x2,y+y2,w,h);};
    if (g === 'crop') { B('rgba(0,0,0,.25)',0,G-1,G,1); B('rgba(0,0,0,.15)',G-1,0,1,G); }
    if (g === 'stub') { B('#a98745',0,G-1,G,1); B('#b8964f',G-1,0,1,G); }
    if (g === 'tilled' || g === 'sown') { B('#3e2a18',0,G-1,G,1); B('#4f3520',G-1,0,1,G); }
    if (g === 'tall') { B('rgba(0,0,0,.18)',0,G-1,G,1); B('rgba(0,0,0,.12)',G-1,0,1,G); }
    if (g === 'cut' || g === 'swath') { B('rgba(0,0,0,.08)',0,G-1,G,1); }
    const o = obst[r][c];
    if (o !== '.') drawObstacle(bctx, o, x, y, c > 0 && obst[r][c-1] === 'p', c < gc-1 && obst[r][c+1] === 'p');
  }

  const isWork = (r, c) => mode === 'collect' ? bales.some(b => b[0] === r && b[1] === c) : ground[r][c] === M.from && obst[r][c] === '.';
  const partner = () => mode === 'harvest' ? truck : (mode === 'sow' || mode === 'collect') ? trailer : null;
  const partnerCell = (r, c) => { const p = partner(); return p && r === gr-1 && ['arrive','park','pause'].includes(p.state) && (c === p.tx || c === p.tx+1); };
  const passable = (r, c) => r >= 0 && c >= 0 && r < gr && c < gc && obst[r][c] === '.' && !partnerCell(r, c);
  const nearPartner = () => { const p = partner(); return p && !veh.moving && veh.r >= gr-2 && veh.c >= p.tx-1 && veh.c <= p.tx+2; };
  const canUnload = () => mode === 'harvest' && (fill >= cap || (left === 0 && fill > 0));
  const needRefill = () => mode === 'sow' && fill <= 0 && left > 0;

  function enter(m) {
    mode = m; M = MODES[m];
    layout(true);
    const L = M.meadow ? getMeadowLayout(mode === 'mow') : getLayout(mode === 'cultivate');   // neue Saison = neue Form
    ground = []; obst = L.obst.map(row => row.split(''));
    // Startzustand der Zellen: Feld = from-Zustand; Wiese je nach Schritt
    const startCell = r => mode === 'press' ? (r % 2 === 0 ? 'swath' : 'cut') : mode === 'collect' ? 'cut' : M.from;
    for (let r = 0; r < gr; r++) { ground.push([]); for (let c = 0; c < gc; c++)
      // Hindernisse stehen auf Wiese, nicht im Getreide
      ground[r].push(r === gr-1 ? 'road' : (L.mask[r][c] === '1' && obst[r][c] === '.' ? startCell(r) : 'grass')); }
    bales = []; pressCount = 0; carry = 0; loaded = 0;
    if (mode === 'collect') {
      bales = (save.meadow.bales || []).filter(([r, c]) => ground[r] && ground[r][c] === 'cut');
      if (!bales.length) {                          // (falls die Bildschirmgröße sich geändert hat) neu verteilen
        const cells = []; for (let r = 0; r < gr; r++) for (let c = 0; c < gc; c++) if (ground[r][c] === 'cut' && r % 2 === 0) cells.push([r, c]);
        for (let i = 0; i < cells.length; i += 3) bales.push(cells[i]);
      }
    }
    for (let r = 0; r < gr; r++) for (let c = 0; c < gc; c++) drawCell(r, c);
    total = 0; for (let r = 0; r < gr; r++) for (let c = 0; c < gc; c++) if (isWork(r, c)) total++;
    left = total; honked = false; loads = 0; refilling = false;
    veh = newMover(L.start.r, L.start.c, -Math.PI/2); veh.unloading = false;
    truck = null; trailer = null;
    if (mode === 'harvest') { cap = Math.ceil(total / LV[save.level].loads); totalLoads = Math.ceil(total / cap); fill = 0; newTruck(); }
    if (mode === 'sow' || mode === 'collect') { const tx = Math.max(2, gc - 4); trailer = { tx, x: tx*G + 9, y: (gr-1)*G + 4, state: 'park' }; }
    if (mode === 'sow') { cap = Math.ceil(total / 3); fill = cap; }
    if (mode === 'collect') { cap = CARRY; fill = 0; totalLoads = bales.length; }
    setIco($('micon'), mode === 'cultivate' || mode === 'mow' ? 'tractor' : M.meadow ? 'hay' : save.field.crop);
    setIco($('mcounticon'), mode === 'collect' ? 'hay' : 'truck');
    $('mfill').className = 'fill ' + M.fillCls;
    $('mcount').classList.toggle('hidden', mode !== 'harvest' && mode !== 'collect');
    $('mlvl').textContent = M.meadow ? save.meadowLevel : save.level;
    hud();
    if (mode === 'sow') { state = 'pick'; hide('ctrl'); hide('mhud'); show('seedpick'); }
    else if (!shopDone && offerUpgrade()) state = 'shop';
    else play();
  }
  document.querySelectorAll('.seedcard').forEach(b => b.addEventListener('click', () => {
    initAudio(); sfx.click(); save.field.crop = b.dataset.crop; persist();
    setIco($('micon'), save.field.crop); hide('seedpick'); play();
  }));
  function play() { state = 'play'; clearHeld(); show('mhud'); show('ctrl'); }

  /* --- Laden: größeres Feld / größere Wiese (nur am Anfang eines Durchgangs, nur wenn bezahlbar) --- */
  let shopDone = false;
  function offerUpgrade() {
    const isM = !!M.meadow, start = isM ? mode === 'mow' : mode === 'harvest';
    const lvl = isM ? save.meadowLevel : save.level, prices = isM ? MEADOW_PRICE : FIELD_PRICE, max = isM ? 4 : 5;
    if (!start || lvl >= max || save.stars < prices[lvl + 1]) return false;
    hide('mhud');
    openShop({
      stats: () => [['star', save.stars, 'star', 'shopstar']],
      item: {
        word: isM ? WORDS.meadow[0] : WORDS.field[0], sayKey: isM ? 'meadow' : 'field',
        price: () => { const l = isM ? save.meadowLevel : save.level; return l >= max ? null : prices[l + 1]; },
        draw: el => { const l = isM ? save.meadowLevel : save.level;
          el.innerHTML = '<canvas width="48" height="48"></canvas>'; drawAreaPreview(el.firstChild, Math.min(max, l + 1) + 1, isM); }
      },
      canPlay: () => true,
      onBuy: () => {                                  // gekauft: sofort mit dem größeren Feld spielen
        if (isM) { save.meadowLevel++; save.meadow.layout = null; } else { save.level++; save.field.layout = null; }
        Hof.persist(); shopDone = true; hide('shop'); enter(mode);
      },
      onPlay: () => { shopDone = true; play(); },
      onHome: () => goHof(isM ? 'wiese' : 'feld')
    });
    return true;
  }
  $('pausebtn').addEventListener('click', () => { if (state !== 'play') return; state = 'pause'; clearHeld(); show('gpause'); });
  $('gresume').addEventListener('click', () => { hide('gpause'); state = 'play'; });

  function newTruck() {
    truckColor = (truckColor + 1) % TRUCKS.length;
    let tx;
    for (let t = 0; t < 30; t++) { tx = 1 + ((Math.random()*(gc-3))|0); if (!(veh.r === gr-1 && (veh.c === tx || veh.c === tx+1))) break; }
    truck = { tx, x: W + 10, y: (gr-1)*G + 4, park: tx*G + 7, fill: 0, state: 'arrive', timer: 0, col: TRUCKS[truckColor] };
  }
  function hud() {
    const pct = (mode === 'cultivate' || mode === 'mow' || mode === 'press') ? (total - left) / Math.max(1, total) : fill / cap;
    $('mfill').style.width = (100*pct) + '%';
    $('mpill').classList.toggle('alert', canUnload() || needRefill() || (mode === 'collect' && carry >= CARRY));
    $('mloads').textContent = mode === 'collect' ? loaded + '/' + totalLoads : loads + '/' + totalLoads;
  }
  function finish() {
    if (state === 'won') return;
    state = 'won'; clearHeld();
    const gain = M.meadow ? save.meadowLevel + 1 : save.level + 2;  // größeres Feld / größere Wiese = mehr Sterne
    Hof.addStars(gain);                          // liest frisch, zählt, speichert
    if (mode === 'mow') save.meadow.stage = 'mown';
    if (mode === 'press') { save.meadow.stage = 'baled'; save.meadow.bales = bales; }
    if (mode === 'collect') { save.meadow.stage = 'regrow'; save.meadow.at = Date.now(); save.meadow.bales = null; persist(); Hof.addHay(loaded); }
    if (mode === 'harvest') save.field.stage = 'stub';
    if (mode === 'cultivate') save.field.stage = 'tilled';
    if (mode === 'sow') { save.field.stage = 'sown'; save.field.sownAt = Date.now(); }
    persist();
    setTimeout(() => {
      hide('mhud'); hide('ctrl'); $('winstars').textContent = save.stars; $('wingain').textContent = gain;
      const showCrop = mode === 'harvest' || mode === 'sow' || mode === 'collect', key = mode === 'collect' ? 'hay' : save.field.crop;
      $('wincrop').classList.toggle('hidden', !showCrop);
      $('wincrop').dataset.say = key; setIco($('wincropemo'), key);
      $('wincropword').textContent = (mode === 'collect' ? '+' + loaded + ' ' : '') + WORDS[key][0];
      show('gwin'); sfx.win(); confetti();
      if (showCrop) setTimeout(() => sayWord(key), 1600);
      winTimer = setTimeout(() => goHof(M.meadow ? 'wiese' : 'feld'), 4000);
    }, (mode === 'harvest' || mode === 'collect') ? 0 : 500);
  }

  function work(m) {
    if (m.done || m.prog < M.at) return;
    m.done = true;
    const r = m.tr, c = m.tc;
    if (!isWork(r, c)) return;
    const px0 = cellX(c), py0 = cellY(r);
    if (mode === 'collect') {                       // Ballen aufnehmen (max. 2)
      if (carry >= CARRY) { if (!honked) { sfx.honk(); honked = true; } return; }
      bales = bales.filter(b => !(b[0] === r && b[1] === c)); carry++; fill = carry; honked = false; sfx.load();
      for (let i = 0; i < 10; i++) spawn(px0+rnd(-8,8), py0+rnd(-6,6), rnd(-15,15), rnd(-20,0), rnd(.3,.6), pick(['#e0c060','#f6e3a0']));
      hud(); return;
    }
    if (mode === 'mow' || mode === 'press') {
      ground[r][c] = mode === 'mow' ? (r % 2 === 0 ? 'swath' : 'cut') : 'cut';   // beim Mähen entstehen Heureihen
      drawCell(r, c); left--;
      if (mode === 'mow') { sfx.crunch(); for (let i = 0; i < 12; i++) spawn(px0+rnd(-10,10), py0+rnd(-10,10), rnd(-20,20), rnd(-20,20), rnd(.3,.7), pick(['#6fc25a','#9be05a','#3f8f37'])); }
      else {
        sfx.clod(); pressCount++;
        if (pressCount % 3 === 0 || left === 0) { bales.push([r, c]); tone(220, .12, 'square', .1, 0, 140); }   // Ballen fällt hinten raus
      }
      hud();
      if (left === 0) finish();
      return;
    }
    if (mode === 'harvest' && fill >= cap) { if (!honked) { sfx.honk(); honked = true; } return; }
    if (mode === 'sow' && fill <= 0) { if (!honked) { sfx.honk(); honked = true; } return; }
    ground[r][c] = M.to; drawCell(r, c); left--; honked = false;
    const px = cellX(c), py = cellY(r);
    if (mode === 'harvest') {
      fill++; sfx.crunch();
      for (let i = 0; i < 14; i++) spawn(px+rnd(-10,10), py+rnd(-10,10), rnd(-25,25), rnd(-25,25), rnd(.3,.8), pick(crop().grain.concat(['#c9952a'])));
    } else if (mode === 'cultivate') {
      sfx.clod();
      for (let i = 0; i < 12; i++) spawn(px+rnd(-10,10), py+rnd(-10,10), rnd(-15,15), rnd(-15,15), rnd(.3,.7), pick(['#4f3520','#8a6440','#6b4a2b']));
    } else {
      fill--; sfx.plink();
      for (let i = 0; i < 8; i++) spawn(px+rnd(-10,10), py+rnd(-10,10), 0, 0, rnd(.3,.6), pick(['#d9c27a','#fff3a8']));
    }
    hud();
    if (left === 0 && mode !== 'harvest') finish();
  }

  function update(dt) {
    if (state === 'play' && !veh.unloading && !refilling) {
      moverUpdate(veh, dt, { passable, speed: M.speed, onProg: m => {
        work(m);
        const p = moverPos(m);
        if (Math.random() < .25) spawn(p.x - Math.cos(m.a)*12, p.y - Math.sin(m.a)*12, rnd(-6,6), rnd(-6,6), .5, 'rgba(120,90,50,.6)');
      }});
      if (mode === 'harvest' && truck.state === 'park' && canUnload() && nearPartner()) { veh.unloading = true; sfx.pour(); }
      if (mode === 'sow' && fill < cap && left > 0 && nearPartner()) { refilling = true; sfx.pour(); }
      if (mode === 'collect' && carry > 0 && nearPartner()) {        // Ballen auf den Anhänger
        unloadT -= dt;
        if (unloadT <= 0) {
          carry--; fill = carry; loaded++; unloadT = 0.4; sfx.load(); bump($('mcount'));
          const p = moverPos(veh); for (let i = 0; i < 12; i++) spawn(p.x, p.y, (trailer.x + 13 - p.x)/.4 + rnd(-10,10), (trailer.y + 8 - p.y)/.4 + rnd(-10,10), .4, pick(['#e0c060','#f6e3a0']));
          hud();
          if (bales.length === 0 && carry === 0) finish();
        }
      } else unloadT = 0.2;
    }
    if (state === 'play' && veh.unloading) {
      const amt = Math.min(fill, cap*dt/1.4); fill -= amt; truck.fill += amt/cap;
      const p = moverPos(veh), tx = truck.x + 17, ty = truck.y + 8;
      for (let i = 0; i < 3; i++) { const sx = p.x+rnd(-2,2), sy = p.y+rnd(-2,2), ex = tx+rnd(-6,6), ey = ty+rnd(-4,4); spawn(sx, sy, (ex-sx)/.35, (ey-sy)/.35, .35, pick(crop().grain)); }
      if (fill <= 0.001) { fill = 0; veh.unloading = false; loads++; sfx.load(); bump($('mcount')); truck.state = 'pause'; truck.timer = 0.6; }
      hud();
    }
    if (state === 'play' && refilling) {
      fill = Math.min(cap, fill + cap*dt/1.2);
      const p = moverPos(veh), sx0 = trailer.x + 13, sy0 = trailer.y + 8;
      for (let i = 0; i < 3; i++) { const sx = sx0+rnd(-6,6), sy = sy0+rnd(-3,3), ex = p.x+rnd(-2,2), ey = p.y+rnd(-2,2); spawn(sx, sy, (ex-sx)/.35, (ey-sy)/.35, .35, pick(['#d9c27a','#fff3a8'])); }
      if (fill >= cap) { refilling = false; sfx.load(); }
      hud();
    }
    setEngine(state === 'play', veh.moving, mode === 'harvest' ? 46 : 58);
    if (state === 'pause' || !truck) return;
    const t = truck;
    if (t.state === 'arrive') { t.x = approach(t.x, t.park, 80*dt); if (t.x === t.park) t.state = 'park'; }
    else if (t.state === 'pause') { t.timer -= dt; if (t.timer <= 0) { t.state = 'leave'; t.v = 10; } }
    else if (t.state === 'leave') { t.v += 90*dt; t.x -= t.v*dt; if (t.x < -45) { if (left === 0 && fill === 0) { t.state = 'gone'; finish(); } else newTruck(); } }
  }
  function drawTruck(t) {
    const x = Math.round(t.x), y = Math.round(t.y);
    R('rgba(0,0,0,.25)', x+2, y+2, 34, 16);
    for (const wx of [3,16,27]) { R('#1a1a1a', x+wx, y-1, 5, 2); R('#1a1a1a', x+wx, y+15, 5, 2); }
    R(t.col[1], x, y+1, 10, 14); R(t.col[0], x+1, y+2, 8, 12);
    R('#9fe3ff', x+1, y+3, 2, 10); R('rgba(255,255,255,.5)', x+5, y+3, 3, 1);
    R('#333', x+11, y, 23, 16); R('#6b5236', x+12, y+1, 21, 14);
    if (t.fill > 0) {
      const f = Math.min(1, t.fill), w = Math.max(2, Math.round(21*f)), h = Math.max(2, Math.round(14*Math.sqrt(f)));
      const gx = x+12+Math.round((21-w)/2), gy = y+1+Math.round((14-h)/2), [c1, c2] = crop().grain;
      R(c2, gx, gy, w, h); R(c1, gx+1, gy+1, Math.max(1,w-3), Math.max(1,h-3));
    }
  }
  function drawTrailer(t) {
    const x = Math.round(t.x), y = Math.round(t.y);
    R('rgba(0,0,0,.25)', x+2, y+2, 28, 16);
    R('#1a1a1a', x+10, y-1, 6, 2); R('#1a1a1a', x+10, y+15, 6, 2);
    R('#555', x+26, y+7, 4, 2);
    R('#333', x, y, 26, 16); R('#7a5a3a', x+1, y+1, 24, 14);
    if (mode === 'collect') { for (let i = 0; i < Math.min(loaded, 6); i++) drawBale(x + 1 + (i % 2) * 11, y + 1 + ((i / 2) | 0) * 4 - (i >= 4 ? 4 : 0)); return; }
    for (const bx of [2, 14]) { R('#cfcfcf', x+bx, y+2, 10, 12); R('#f4f4f4', x+bx+1, y+3, 8, 10); R('#2a6fdb', x+bx+1, y+7, 8, 2); }
  }
  function draw(time) {
    ctx.drawImage(bg, 0, 0);
    if (truck && truck.state !== 'gone') drawTruck(truck);
    if (trailer) drawTrailer(trailer);
    for (const [r, c] of bales) drawBale(c*G + 5, r*G + 7);
    drawMover(veh, M.veh, time);
    if (mode === 'collect' && carry > 0) {           // Ballen auf dem Frontlader
      const p = moverPos(veh), fx = p.x + Math.cos(veh.a)*14, fy = p.y + Math.sin(veh.a)*14;
      for (let i = 0; i < carry; i++) drawBale(fx - 7, fy - 5 - i*6);
    }
    const bounce = Math.abs(Math.sin(time/180))*4;
    if (state === 'play' && truck && canUnload() && truck.state === 'park' && !veh.unloading) drawArrow(Math.round(truck.x + 14), Math.round(truck.y - 12 - bounce));
    if (state === 'play' && trailer && mode === 'collect' && carry >= CARRY) drawArrow(Math.round(trailer.x + 10), Math.round(trailer.y - 12 - bounce));
    if (state === 'play' && trailer && needRefill() && !refilling) drawArrow(Math.round(trailer.x + 10), Math.round(trailer.y - 12 - bounce));
  }
  function onPointer() { return state !== 'play'; }   // nur während des Spielens ein Ziel setzen
  function resize() { if (state === 'pick' || state === 'shop') enter(mode); else layout(false); }
  function exit() { setEngine(false, false); clearTimeout(winTimer); }
  return { enter, exit, update, draw, resize, onPointer };
})();


// Spielstand frisch lesen, wenn Safari die Seite aus dem Zwischenspeicher zurückholt
addEventListener('pageshow', e => { if (e.persisted) location.reload(); });
