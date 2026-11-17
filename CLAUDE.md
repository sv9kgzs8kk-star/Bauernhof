# Unsere Spiele – Regeln für Claude

Pixel-Spiele für Kinder ab 4 Jahren, gehostet auf GitHub Pages und auf dem iPad als Home-Bildschirm-App gespielt. Die Kinder können noch nicht lesen. Der Vater (Michael) programmiert nicht selbst: Er testet auf dem iPad und entscheidet über GitHub (Issues, Pull Requests).

## Ordnerstruktur
```
index.html                  ← Startseite: Kacheln je Welt (WELTEN-Liste, aktiv:false = versteckt;
                              nur eine aktive Welt → direkte Weiterleitung)
hof.html                    ← Bauernhof (Laufen/Fahren, Besucherin, Scheunen-Laden, Menü)
baustelle/index.html        ← Welt BAUSTELLE: Bauhof als begehbare Karte (Bauarbeiter, Bagger, Bauplatz `S`)
baustelle/spiele/<name>/    ← Bau-Minispiele (HOF_URL = '../../index.html'): baggern/, beton/, mauer/, kran/, dach/
manifest.json, icon.png     ← start_url ./ NIE ändern (sonst App neu anlegen = Spielstand weg)
gemeinsam/sterne.js         ← Spielstand lesen/schreiben (nur hier!)
gemeinsam/basis.js          ← Grafik, Pixel-Symbole, Fahrzeuge, Sound, Vorlesen, Steuerung, Layout, Laden, goHof()
gemeinsam/basis.css         ← gemeinsames Aussehen
gemeinsam/feldspiel.js      ← Feld- und Wiesen-Spiele
gemeinsam/startseite.js     ← Knopf „zur Startseite“ (1 s halten) für die Hauptseite jeder Welt
gemeinsam/bau.js            ← Baustelle: Bauarbeiter, Bagger, Kipper, Boden-Kacheln, Bau-Wörter
spiele/feld|wiese|schafe|kuehe|angeln|wald/index.html  ← Bauernhof-Minispiele
```
- Vom Hof ins Spiel über `PAGES` in `hof.html`. Zurück mit `goHof('<name>')`, die Seiten setzen `window.HOF_URL = '../../hof.html'`.
- Neue Welten bekommen einen eigenen Ordner (z. B. `stadt/index.html`, Minispiele in `stadt/spiele/<name>/`). Auf der Startseite werden sie in `WELTEN` eingetragen.
- Neue Minispiele binden `sterne.js`, `basis.js` und `basis.css` mit `?v=JJJJMMTTx` ein. Bei jeder Änderung an `gemeinsam/` die Versionsnummer in **allen** Seiten erhöhen.

## Regeln beim Programmieren
1. Nur relative Links, keine externen Dateien oder CDNs. Alles muss offline aus dem Repository laufen.
2. Den Spielstand nur über `Hof.addStars/spend/addWool/addHay/addMilk` (bzw. neue Funktionen in `sterne.js`) ändern. Der Schlüssel `bauernhof.spielstand` gilt für **alle** Welten, damit die Sterne gemeinsam zählen.
3. **Spielstand nur erweitern, nie umbauen oder umbenennen.** Neue Felder brauchen einen Standardwert, wenn sie fehlen. Bestehende Sterne der Kinder dürfen nie verloren gehen.
4. Jede Seite hat einen Haus-Knopf. Die App hat keinen Zurück-Knopf.
5. Wörter in GROSSBUCHSTABEN anzeigen und normal vorlesen (`WORDS`, `say()`/`sayWord()`).
6. Pixel-Symbole statt Emojis (`<i class="ico" data-ico="…">`, `setIco()`).
7. Anzeigen und Knöpfe bekommen die Klasse `.hud`, in Spielen zusätzlich `gamehud`. Ausnahme Hof: `#hubhud` liegt über dem Spielfeld (oben die Zähler neben dem Startseiten-Knopf, links darunter Fahrzeuge und Zahnrad). Beim Antippen gibt es dort keinen Bedienbereich, nur beim Steuerkreuz.
   Hof-Karte (`HUB_MAP`): `g` ist das Tor zur Schafweide (→ Schafe hüten), `q` die Kuhweide unter dem Kuhstall, das Schild mit dem Stern über der Scheune zeigt den Laden, `a` der Angelsteg am Teich (→ Angeln), `W` der Waldweg (→ Bäume fällen). Tor, Melkstand und Scheune lösen erst aus, wenn der Bauer 0,8 s darauf stehen bleibt (`DOOR_WAIT`). Darüberlaufen löst nichts aus.
8. `openShop()` nur zeigen, wenn man etwas kaufen kann oder etwas fehlt. Ausnahme: Feld und Wiese zeigen zu Beginn jedes Durchgangs (Ernten bzw. Mähen) immer das nächstgrößere Feld, auch wenn es noch zu teuer ist.
13. Feld- und Wiesenform bleiben einen ganzen Durchgang gleich (`newCycle` in `feldspiel.js`), je Bildschirmausrichtung gemerkt.
9. Fahrspiele beherrschen Steuerkreuz **und** Antippen (`moverUpdate()`).
10. Fehler erscheinen als rote Zeile unten.
11. Kein Scheitern: Es gibt kein „verloren“, höchstens eine lustige Animation und einen neuen Versuch.
12. **Sternteile:** Bei Angeln und Wald gibt es 1 Stern für 5 Fänge (`Hof.addPart('fishParts'|'woodParts')`). Angezeigt wird das mit `drawStarParts()`/`paintStarCanvas()`, einem Stern aus 5 Zacken. Der Fortschritt bleibt gespeichert und ist auch im Hof zu sehen.
14. Eine Spielrunde dauert höchstens 3–5 Minuten. Große Bauaufträge speichern den Fortschritt und lassen sich in Etappen spielen.

## Vision (vom Vater festgelegt)
- **Stadt/Bauhof als Herzstück:** Man startet am Bauhof und baut nach und nach eine Stadt: Gebäude (Wohnhaus, Bahnhof, Feuerwache …), Straßen, Brücken, Bahnstrecken. Ein fertig gebautes Gebäude lässt sich gegen Sterne freischalten und wird dann zu einer eigenen spielbaren Welt.
- **Erstes Gebäude: Wohnhaus.** Der Fortschritt liegt in `save.house.step` (0 = Grube fehlt, 1 = Grube fertig … 5 = Haus fertig). Gebaut wird in Etappen, alles im Stil des Hofs (schräg von oben, fahren/antippen statt nur zuschauen):
  1. Grube baggern wie Ernten, mit Kipper (fertig)
  2. Beton mit der Betonpumpe malen (Finger ziehen, ab 90 % läuft der Rest nach) und Wände mit Steinen setzen (Steine in leuchtende Lücken ziehen oder Lücke antippen) (fertig: `spiele/beton`, `spiele/mauer`; Bauplatz-Zugang je Schritt über `STEP_GAME` in `baustelle/index.html`)
  3. Dachbinder mit dem Kran vom Tieflader aufs Haus heben (Binder antippen, dann leuchtende Stelle), Richtfest (step 4), Dach durch Wischen decken, danach Fenster/Tür/Schornstein (step 5). Fertig: `spiele/kran`, `spiele/dach`. Das Haus ist schräg von vorne gezeichnet: `drawHouse34()` in `gemeinsam/bau.js`.

  Danach kann man es einrichten (Möbel platzieren).
- **Bauaufträge** bestehen aus Schritten mit wiederverwendbaren Mechaniken: GRABEN (Bagger, Zellen abtragen), GIESSEN (Betonmischer, Schalung füllen), STAPELN (Steine nach Muster setzen), HEBEN (Kran, Teil an markierte Stelle), BELEGEN (Fläche reihenweise füllen: Ziegel, Schotter, Schienen), ZUORDNEN (Fenster/Türen in Öffnungen). Ein Auftrag ist eine Datenliste von Schritten, keine eigene Seite pro Schritt.
- **Der Bauernhof bleibt einzeln spielbar**, so wie er ist, bis die Stadt so weit ist.
- Später weitere Welten: Feuerwache, Rettungswache, Polizei, Krankenhaus, Bahnhof, Flughafen.

## Arbeitsweise (nächtlicher Lauf)
- Labels:
  - `vorschlag`: Idee, noch nicht entschieden
  - `freigegeben`: bauen
  - `in-arbeit`: wird gerade gebaut
  - `claude`: Pull Request von Claude
- **Nie direkt auf `main` pushen.** Jede Änderung kommt über einen Pull Request mit dem Label `claude`. Michael testet auf dem iPad und führt den PR selbst zusammen. Das ist die Freigabe zum Live-Schalten.
- Es ist immer höchstens **ein** offener `claude`-PR erlaubt. Solange einer offen ist, werden nur Kommentare dazu eingearbeitet und keine neuen Features gebaut.
- Zweignamen ohne Schrägstrich: `feature-<nummer>-<kurzname>`.
- Die PR-Beschreibung ist auf Deutsch, für Nicht-Programmierer geschrieben und hat drei Teile:
  - **Was ist neu**
  - **Testversion**: Link `https://raw.githack.com/sv9kgzs8kk-star/Bauernhof/<commit-sha>/<seite>` mit der **vollständigen Commit-SHA** des letzten Commits, nicht dem Zweignamen. Zweig-Links zwischenspeichert der Dienst und zeigt dann alte Stände. Nach jeder Nachbesserung den Link in der PR-Beschreibung aktualisieren und im Kommentar den neuen Link nennen.
  - **Bitte auf dem iPad testen** (nummerierte Schritte)

  Dazu `Closes #<issue>`. Michael öffnet die Testversion in Safari, nicht in der Home-Bildschirm-App. Die Testversion hat einen eigenen Spielstand, dafür startet man dort mit 0 Sternen. Für Testschritte, die Sterne oder Heu brauchen, den Link mit `?sterne=50&heu=10` versehen; Baustellen-Links mit `?bau=0` (setzt den Hausbau zurück, sonst bleibt der Stand aus früheren Tests stehen). Das wirkt nur auf raw.githack.com, nicht in der echten App.
- Vor dem PR mit Headless-Chrome testen (`/usr/bin/google-chrome` über Playwright, lokaler `python3 -m http.server`). Alle geänderten Seiten laden, es dürfen keine JS-Fehler auftreten, Screenshots ansehen.
- GitHub nur über die REST-API (`gh api repos/sv9kgzs8kk-star/Bauernhof/...`). GraphQL ist gesperrt, `gh pr create` funktioniert also nicht.
- Neue Vorschläge sind klein genug für eine Nacht und mindestens einer davon verbessert etwas Bestehendes, statt nur Neues hinzuzufügen.
