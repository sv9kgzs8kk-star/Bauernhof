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
      field: { stage: 'ripe', crop: 'wheat', sownAt: 0, layout: null },
      meadow: { stage: 'tall', at: 0, layout: null, bales: null }   // Wiese: tall → mown → baled → regrow → tall
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

  Hof.addHay = function (n) {
    Hof.load(); Hof.save.hay = Math.max(0, Hof.save.hay + n); Hof.persist();
    return Hof.save.hay;
  };

  Hof.load();
})();
