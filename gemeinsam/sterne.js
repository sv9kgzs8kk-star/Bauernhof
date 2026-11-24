/* =====================================================================
   Gemeinsamer Spielstand für den Hof und alle Minispiele.
   Wird von jeder Seite eingebunden – nur hier wird gespeichert.
   ===================================================================== */
(function () {
  const KEY = 'bauernhof.spielstand';

  function standard() {
    return {
      stars: 0,                 // gesammelte Sterne (Währung)
      level: 1,                 // Feld-Stufe (1–5), wird mit Sternen gekauft
      meadowLevel: 1,           // Wiesen-Stufe (1–4), wird mit Sternen gekauft
      sheep: 0,                 // gekaufte Schafe (= Herde beim Schafe hüten)
      wool: 0,                  // Wolle im Lager
      hay: 0,                   // Heuballen in der Scheune (jede Wolle kostet 1 Ballen)
      visitor: null,            // wartende Besucherin { n: Anzahl, item: 'wool' | 'milk' }
      cows: 0,                  // gekaufte Kühe
      milk: 0,                  // Milch im Lager
      wide: {},                 // gekaufte breite Geräte: { harvest, cultivate, sow, mow: true }
      colors: { tractor: 'red', combine: 'green' },   // Fahrzeugfarben (kostenlos)
      field: { stage: 'ripe', crop: 'wheat', sownAt: 0, layout: null },
      meadow: { stage: 'tall', at: 0, layout: null, bales: null },  // Wiese: tall → mown → baled → regrow → tall
      fishParts: 0,             // Angeln: gefangene Fische zum nächsten Stern (0–4, 5 Fische = 1 Stern)
      woodParts: 0,             // Wald: gefällte Bäume zum nächsten Stern (0–4, 5 Bäume = 1 Stern)
      saw: false,               // Kettensäge gekauft
      trees: null,              // Wald: je Baum Zeitpunkt des Fällens (0 = steht)
      house: { step: 0, type: 0, maxType: 0, pick: false, built: 0, seenInside: false, signIntro: false, color: 'creme' },   // seenInside: fertiges Haus schon betreten (dann steht das Schild „Neues Haus“), signIntro: Schild schon einmal vorgestellt   // Baustelle Wohnhaus: erledigte Bauschritte (0–5), Haustyp, größter wählbarer Typ, Auswahl offen (nach Abriss), Anzahl Abrisse
      farm: { items: [] },
      fire: { step: 0 },                     // Feuerwache: erledigte Bauschritte (0–5), wie house.step                   // Bauernhaus innen: Möbel wie beim Wohnhaus [{ k, x, y }]
      home: { unlocked: false, items: [] }   // Wohnhaus innen: freigeschaltet? Möbel [{ k: 'bed', x, y } …] (x/y = 0–1 im Zimmer, mehrfach möglich)
    };
  }

  const Hof = window.Hof = { save: standard() };

  // Spielstand (neu) aus dem Speicher lesen. Das Objekt Hof.save bleibt dasselbe.
  Hof.load = function () {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    const d = standard();
    if (s && typeof s === 'object') {
      Object.assign(d, s);
      d.field = Object.assign(standard().field, s.field || {});
      d.meadow = Object.assign(standard().meadow, s.meadow || {});
      d.colors = Object.assign(standard().colors, s.colors || {});
      d.wide = Object.assign({}, s.wide || {});
      d.house = Object.assign(standard().house, s.house || {});
      d.home = Object.assign(standard().home, s.home || {});
      if (d.home.items && !Array.isArray(d.home.items) && typeof d.home.items === 'object')   // alte Form { bed: {x,y} } → Liste
        d.home.items = Object.entries(d.home.items).map(([k, p]) => ({ k, x: p.x, y: p.y }));
      if (!Array.isArray(d.home.items)) d.home.items = [];
      d.farm = Object.assign(standard().farm, s.farm || {}); if (!Array.isArray(d.farm.items)) d.farm.items = [];
    }
    Object.keys(Hof.save).forEach(k => delete Hof.save[k]);
    Object.assign(Hof.save, d);
    return Hof.save;
  };

  Hof.persist = function () {
    try { localStorage.setItem(KEY, JSON.stringify(Hof.save)); } catch (e) {}
  };

  // Sterne gutschreiben: erst frisch lesen, dann speichern (nie doppelt zählen)
  Hof.addStars = function (n) {
    Hof.load(); Hof.save.stars += n; Hof.persist();
    return Hof.save.stars;
  };

  // Sterne ausgeben. Gibt true zurück, wenn genug da waren.
  Hof.spend = function (n) {
    Hof.load();
    if (Hof.save.stars < n) return false;
    Hof.save.stars -= n; Hof.persist();
    return true;
  };

  Hof.addWool = function (n) {
    Hof.load(); Hof.save.wool = Math.max(0, Hof.save.wool + n); Hof.persist();
    return Hof.save.wool;
  };

  Hof.addMilk = function (n) {
    Hof.load(); Hof.save.milk = Math.max(0, Hof.save.milk + n); Hof.persist();
    return Hof.save.milk;
  };

  // Sternteil dazu (z. B. 'fishParts'): bei 5 Teilen gibt es 1 ganzen Stern. Gibt true zurück, wenn der Stern voll wurde.
  Hof.addPart = function (key) {
    Hof.load();
    const n = (Hof.save[key] || 0) + 1;
    if (n >= 5) { Hof.save[key] = 0; Hof.save.stars += 1; Hof.persist(); return true; }
    Hof.save[key] = n; Hof.persist(); return false;
  };

  // Haus abreißen: Möbel bleiben gespeichert (Umzugskiste), Bauplatz leer, ein größerer Haustyp kommt zur Auswahl dazu
  Hof.demolishHouse = function (stars, maxTypes) {
    Hof.load(); const h = Hof.save.house;
    h.maxType = Math.min(maxTypes - 1, Math.max(h.maxType | 0, (h.type | 0) + 1));
    h.step = 0; h.pick = true; h.built = (h.built | 0) + 1; h.seenInside = false;
    Hof.save.stars += stars; Hof.persist();
  };
  // Fertiges Haus betreten (danach steht das Schild „Neues Haus“) bzw. Schild vorgestellt
  Hof.markHouse = function (key) { Hof.load(); if (!Hof.save.house[key]) { Hof.save.house[key] = true; Hof.persist(); } };

  // Putzfarbe des Hauses (beim Mauern gewählt)
  Hof.setHouseColor = function (key) { Hof.load(); Hof.save.house.color = key; Hof.persist(); };

  // Neues Haus auf dem leeren Bauplatz auswählen (Bauen beginnt wieder mit der Grube)
  Hof.pickHouse = function (type) {
    Hof.load(); const h = Hof.save.house;
    h.type = Math.max(0, Math.min(h.maxType | 0, type | 0)); h.pick = false; h.step = 0; Hof.persist();
  };

  // Wohnhaus freischalten (die Sterne dafür vorher mit Hof.spend abziehen)
  Hof.unlockHome = function () {
    Hof.load(); Hof.save.home.unlocked = true; Hof.persist();
  };

  // Feuerwache freischalten (fertig gebaut, Sterne vorher mit Hof.spend abziehen); fire.unlocked fehlt in alten Spielständen = zu
  Hof.unlockFire = function () {
    Hof.load(); if (!Hof.save.fire || typeof Hof.save.fire !== 'object') Hof.save.fire = { step: 5 }; Hof.save.fire.unlocked = true; Hof.persist();
  };

  // Möbel im Wohnhaus speichern: Liste [{ k, x, y }] (x/y je 0–1 im Zimmer), gleiche Möbel dürfen mehrfach vorkommen
  Hof.setHome = function (list, where) {          // where = 'farm' für das Bauernhaus, sonst Wohnhaus
    Hof.load();
    Hof.save[where === 'farm' ? 'farm' : 'home'].items = list.slice(0, 60).map(i => Object.assign({ k: i.k, x: Math.round(i.x * 1000) / 1000, y: Math.round(i.y * 1000) / 1000 }, i.f ? { f: i.f } : {}, i.r ? { r: i.r & 3 } : {}));   // f = Etage (fehlt = unten), r = gedreht (0–3 × 90°)
    Hof.persist();
  };

  Hof.addHay = function (n) {
    Hof.load(); Hof.save.hay = Math.max(0, Hof.save.hay + n); Hof.persist();
    return Hof.save.hay;
  };

  Hof.load();

  // Nur in der Testversion (raw.githack.com): ?sterne=50 setzt Sterne, ?heu=10 setzt Heu, ?bau=0 setzt den Hausbau zurück, ?haus=0 das Wohnhaus – zum Ausprobieren.
  // In der echten App (github.io) hat das keine Wirkung.
  if (/githack\.com$/.test(location.hostname)) {
    const q = new URLSearchParams(location.search);
    if (q.has('sterne')) { Hof.save.stars = Math.max(0, parseInt(q.get('sterne'), 10) || 0); Hof.persist(); }
    if (q.has('heu')) { Hof.save.hay = Math.max(0, parseInt(q.get('heu'), 10) || 0); Hof.persist(); }
    if (q.has('bau')) { Object.assign(Hof.save.house, { step: Math.max(0, Math.min(5, parseInt(q.get('bau'), 10) || 0)), pick: false }); Hof.persist(); }   // Hausbau-Schritt setzen
    if (q.has('haustyp')) { const t = Math.max(0, parseInt(q.get('haustyp'), 10) || 0); Object.assign(Hof.save.house, { type: t, maxType: Math.max(t, Hof.save.house.maxType | 0) }); Hof.persist(); }   // Haustyp (0 klein, 1 groß)
    if (q.has('moebel')) { Hof.save.home.items = [{ k: 'bed', x: .9, y: .1 }, { k: 'sofa', x: .1, y: .5 }, { k: 'tv', x: .2, y: .05 }, { k: 'tub', x: .9, y: .9 }]; Hof.persist(); }   // ein paar Möbel fürs Umzug-Testen
    if (q.has('wache')) { Hof.save.house.towerDone = true; Hof.save.fire = Object.assign(Hof.save.fire || {}, { step: Math.max(0, Math.min(5, parseInt(q.get('wache'), 10) || 0)) }); Hof.persist(); }   // Feuerwache: freischalten und Bauschritt setzen
    if (q.has('haus')) { Hof.save.home = { unlocked: q.get('haus') === '1', items: [] }; Hof.persist(); }   // Wohnhaus: ?haus=0 zu und leer, ?haus=1 offen und leer
  }
})();
