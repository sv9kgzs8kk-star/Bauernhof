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
      house: { step: 0 }        // Baustelle Wohnhaus: erledigte Bauschritte (0–5)
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

  Hof.addHay = function (n) {
    Hof.load(); Hof.save.hay = Math.max(0, Hof.save.hay + n); Hof.persist();
    return Hof.save.hay;
  };

  Hof.load();

  // Nur in der Testversion (raw.githack.com): ?sterne=50 setzt Sterne, ?heu=10 setzt Heu, ?bau=0 setzt den Hausbau zurück – zum Ausprobieren.
  // In der echten App (github.io) hat das keine Wirkung.
  if (/githack\.com$/.test(location.hostname)) {
    const q = new URLSearchParams(location.search);
    if (q.has('sterne')) { Hof.save.stars = Math.max(0, parseInt(q.get('sterne'), 10) || 0); Hof.persist(); }
    if (q.has('heu')) { Hof.save.hay = Math.max(0, parseInt(q.get('heu'), 10) || 0); Hof.persist(); }
    if (q.has('bau')) { Hof.save.house = { step: Math.max(0, Math.min(5, parseInt(q.get('bau'), 10) || 0)) }; Hof.persist(); }   // Hausbau-Schritt setzen
  }
})();
