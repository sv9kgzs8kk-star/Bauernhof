# Unsere Spiele – Regeln für Claude

Pixel-Spiele für Kinder ab 4 Jahren, gehostet auf GitHub Pages und auf dem iPad als Home-Bildschirm-App gespielt. Die Kinder können noch nicht lesen. Der Vater (Michael) programmiert nicht selbst: Er testet auf dem iPad und entscheidet über GitHub (Issues, Pull Requests).

## Ordnerstruktur
```
index.html                  ← Startseite: leitet sofort in die STADT weiter (`START_WELT`, Michael: keine Kachel-Auswahl).
                              Kacheln je Welt (WELTEN-Liste) nur noch bei START_WELT = null
hof.html                    ← Bauernhof (Laufen/Fahren, Besucherin, Scheunen-Laden, Menü)
baustelle/index.html        ← Welt STADT (Kachel „STADT“, Ordner bleibt `baustelle/`): Bauhof als begehbare Karte, **nur zu Fuß** (Bauarbeiter; Bagger und Kipper stehen geparkt als Deko; Bauplatz `S` → Bau-Spiel des aktuellen Schritts)
                              mit Stadtplan: `F` Bauernhof (fertig, 0,8 s stehen → hof.html), `P` Feuerwache, `Q` Bahnhof (gesperrt,
                              Schild mit Schloss); Plätze rechts (`CITY_RIGHT`) oder unten (`CITY_BELOW`), je nach Bildschirm
baustelle/spiele/<name>/    ← Bau-Minispiele (HOF_URL = '../../index.html'): baggern/, beton/, mauer/, holz/, kran/, dach/, holzdach/, abriss/, holzabriss/, turm/
                              (Turm, nur Hochhaus `shape: 'T'`: Turmdrehkran hebt Fertigteil-Module (3 je Stockwerk) vom Tieflader; ein Tieflader = ein Stockwerk;
                              house.step 2 → EG + 1. OG, step 3 → 2. + 3. OG, dann bringt ein Tieflader den Landeplatz (`drawHelipad`), ein Hubschrauber landet (`drawHelicopter`). Zeichnen: `drawTower()`, `drawTowerModule()`, `drawTowerCraneMast/Top()`,
                              `drawLowLoader()`, Fenster-Plan `TOWER_WIN` (miss = fehlt noch).
                              Fenster/ (step 4 → 5): Hochhaus groß von vorne, 8 Teile (quadratisch, hoch, rund, breit, Tür) stehen hintereinander auf einem Glasgestell am Boden;
                              nur das vorderste in ein Loch gleicher Form ziehen (oder antippen, dann Loch); falsche Form → zurück aufs Gestell, passende Löcher blinken.
                              Bauarbeiter auf der Scherenbühne antippen: nimmt das vorderste, fährt hin, Bühne hoch, setzt ein, zurück. Hochkant: Gestell/Bühne vorne auf dem Gehweg.
                              Nach dem Landeplatz dreht der Kranausleger nach rechts, der Hubschrauber kommt von links. `towerWinPos()`, `towerWinRects()`.
                              Hochhaus hat `ready: false` bis Sprengung fertig ist, Test mit `?haustyp=3`.)
                              (Holzabriss, nur Holzhaus: Umzug → Schindeln wegwischen, fliegen in den Container → Autokran hebt 4 Binder auf einen Lastwagen →
                              Veranda und 6 Wände (je ganze Wand) auf Lastwagen mit 4 Plätzen, voll fährt er weg → Betonsockel mit dem Bagger zum Kipper.
                              `drawWoodHouse` kennt dafür `logs(e,r)`, `truss(i)`, `vroof`, `floor`.)
                              (Abriss: Schild „Neues Haus“ über dem Bauplatz (Zelle oy/ox+5), steht sobald das fertige Haus einmal betreten wurde (`house.seenInside`, nach Abriss wieder false), beim ersten Mal wackelt es und wird vorgelesen (`house.signIntro`); 0,8 s davor stehen → Karte Haus → Abrissbirne → neues Haus → Umzug (Möbel antippen → Kiste → Transporter),
                              Abrissbirne am Autokran (Kugel zur Seite ziehen und loslassen, Antippen geht auch), Schutt wegbaggern wie beim Graben (über Schuttfelder fahren, Schaufel voll → zum Kipper); danach `Hof.demolishHouse`: house.pick = true, maxType +1.
                              Leerer Bauplatz: zu Fuß drauf → Hauswahl-Karten (`HOUSE_TYPES` in bau.js, `Hof.pickHouse`). Möbel bleiben gespeichert.)
wohnhaus/index.html         ← Wohnhaus innen (HOF_URL = '../baustelle/index.html'): fertiges Haus (step 5) in der Stadt 0,8 s betreten,
                              einmal für `HOME_PRICE` Sterne freischalten (`save.home.unlocked`), dann Möbel aus der Leiste ins Zimmer ziehen.
                              Holzhaus (`WOOD`): L-förmig, Holzwände/-böden, unten Wohnzimmer mit Kamin (linker Flügel), Küche und Bad (rechter Flügel),
                              hinten rechts Garten; Leiter im Wohnzimmer = Dachboden (Etage `f: 1`, wie beim großen Haus)
                              Rustikal: Rundholz-Wände mit Stammköpfen, raue Dielen, Terrakotta (Küche), Schiefer (Bad), Natursteinkamin, Geweih, Pfannen, karierte Vorhänge.
                              Veranda vor dem rechten Flügel (`room.yb`, Tür vom Wohnzimmer, Geländer; oben sieht man ihr Vordach), Möbel darf man draufstellen. Kamin nur unten.
                              Hochhaus (`TOWER`): 4 Etagen (`f` 0–3): EG Eingangshalle (Steinboden, Briefkästen, Pförtnertresen, Pflanzkübel), 1 Wohnen, 2 Kinder (Spielzimmer),
                              3 Schlafen/Bad; Rückwand in der Fassadenfarbe der Etage (`TOWER_COLS`). Aufzug hinten in der Mitte (Schacht `kind: 'shaft'` ragt aus der Wand, silberne Türen gehen auf, `liftOpen`; davor die Haltestelle `stairs.lift`): Kind 0,3 s davor = Türen gehen auf (`calling`), erst dann Bedienfeld; Kind wird immer vor den Türen gezeichnet
                              mit Knöpfen in Etagenfarbe (EG Tür, sonst Zahl), Fahrt mit Türen, Anzeige und Pling (`panel`, `ride`). Dachterrasse kommt als Etage 4.
                              **Haustür** (alle Innenräume, unten): Kind 0,6 s in der Türöffnung stehen = raus in die Stadt (`room.door`); Hochhaus: Glastür genau gegenüber dem Aufzug, roter Läufer dazwischen.
                              **Schaukelstuhl** (alle Innenräume): Kind 0,5 s darauf stehen = setzt sich und schaukelt (`sit`), bis es woanders hinläuft.
                              **Möbel drehen** (alle Innenräume): zweimal schnell antippen = 90° drehen (`it.r` 0–3, `rotF()`/`rotRect()` in moebel.js, Pixel bleiben scharf).
                              (`save.home.items` = Liste `[{k,x,y}]`, mehrfach möglich; `Hof.unlockHome`, `Hof.setHome`). Drei Zimmer mit Innenwänden (großes Haus `TWO`: unten Wohnzimmer, Küche, Flur mit Treppe; oben Kinderzimmer, Schlafzimmer, Bad, Flur mit Treppe; Kind kurz auf der Treppe = Etage wechseln, Möbel mit `f: 1` stehen oben), Kind läuft per Antippen und ist immer vor den Möbeln, 0,8 s auf dem Bett = schlafen; Möbel und Kind in einfacher Größe (S = 1)
manifest.json, icon.png     ← start_url ./ NIE ändern (sonst App neu anlegen = Spielstand weg)
gemeinsam/sterne.js         ← Spielstand lesen/schreiben (nur hier!)
gemeinsam/basis.js          ← Grafik, Pixel-Symbole, Fahrzeuge, Sound, Vorlesen, Steuerung, Layout, Laden, goHof()
gemeinsam/basis.css         ← gemeinsames Aussehen
gemeinsam/feldspiel.js      ← Feld- und Wiesen-Spiele
gemeinsam/startseite.js     ← Knopf „zur Startseite“ (1 s halten) für die Hauptseite jeder Welt
gemeinsam/bau.js            ← Baustelle: Bauarbeiter, Bagger, Kipper, Boden-Kacheln, Bau-Wörter, HOUSE_TYPES (klein 1 Stockwerk / groß 2 Stockwerke:
                              mehr Mauerreihen, eine Kipperladung mehr), Umzugskiste, Transporter, Abrissbirne, Schutt
                              Jeder Haustyp hat eigene Bauschritte (`HOUSE_TYPES[].steps`, Seitennamen je `house.step`; die Stadt startet daraus das Spiel).
                              Haustyp 3 HOLZHAUS (`shape: 'L'`; `ready: false` würde einen Haustyp in der Hauswahl sperren):
                              Punktfundament (`woodHoles()`, `drawLOutline()`), baggern/beton füllen nur die Löcher. Testlink `?haustyp=2`.
                              Schritt 3 `spiele/holz/`: Holzton wählen (`WOOD_COLORS`, in `house.color`), 3 Stämme an je 2 Linien sägen (wischen/antippen),
                              dann Bohlen vom Stapel auf leuchtende Kanten des L ziehen (`logGeo()`, `drawLogWalls()`, 4 Reihen × 6 Kanten, Tür/Fenster vorne).
                              Schritt 4 `spiele/kran/` mit 4 Bindern auf dem L (`woodRoofGeo().trusses`). Schritt 5 `spiele/holzdach/`: Holzschindeln wischen
                              (6 Reihen, vorne 8 Felder, hinten 4; zwei Firste), dann 4 Pfosten der Veranda vor dem rechten Flügel antippen (`verandaGeo()`),
                              Vordach und Schaukelstuhl erscheinen. Zeichnen des Holzhauses überall mit `drawWoodHouse()` (Stadt, Kran, Holzdach, Abriss).
gemeinsam/moebel.js         ← Möbel (FURN, BY, KID) für Einrichten und Umzug
spiele/feld|wiese|schafe|kuehe|angeln|wald/index.html  ← Bauernhof-Minispiele
```
- Die App startet in der Stadt (ohne Startseiten-Knopf). `hof.html#stadt` (Bauernhof-Platz in der Stadt) und `hof.html#start` überspringen den ▶-Bildschirm. Der Knopf oben links im Hof führt zurück in die Stadt (`baustelle/index.html#hof`, Bauarbeiter steht neben dem Bauernhof-Platz). Vorlesen vor dem ersten Antippen wird gemerkt und danach nachgeholt (Ton braucht auf dem iPad ein Antippen).
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
   Hof-Karte (`HUB_MAP`): `g` ist das Tor zur Schafweide (→ Schafe hüten), `q` die Kuhweide unter dem Kuhstall, das Schild mit dem Stern über der Scheune zeigt den Laden, `a` der Angelsteg am Teich (→ Angeln), `W` der Waldweg (→ Bäume fällen), `H` die Haustür des Bauernhauses (→ `wohnhaus/index.html?bauernhaus`, gratis einrichten, Spielstand `save.farm.items`). Zu Fuß kann man überall hinlaufen (auch über Weiden, Ställe, Felder), nur nicht in Bäume (`T`) und den Teich (`o`); nur an den Eingängen passiert etwas. Tor, Melkstand und Scheune lösen erst aus, wenn der Bauer 0,8 s darauf stehen bleibt (`DOOR_WAIT`). Darüberlaufen löst nichts aus.
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
  2. Beton mit der Betonpumpe malen (Finger ziehen, ab 90 % läuft der Rest nach; Pumpe rechts neben der Grube, Betonmischer kommt von links, parkt darunter und füllt die Pumpe, Füllbalken unter dem Mischer; großes Haus 2 Mischer, der erste ist nach der Hälfte leer und fährt nach rechts weg) und Wände mit Steinen setzen (von schräg oben: zu Beginn Hausfarbe wählen (`HOUSE_COLORS` in bau.js, `house.color`, `Hof.setHouseColor`, Putzfarbe des fertigen Hauses), dann Steine von der Palette in leuchtende Lücken der Fassade ziehen oder Lücke antippen; 3 Reihen × 7 Spalten, Tür/Fenster aus `facadeHoles()`; **nichts fliegt durch die Luft**, Adrian dachte sonst, er müsse Steine fangen; Bauarbeiter antippen = er trägt einen Stein zur nächsten Lücke und geht zurück) (fertig: `spiele/beton`, `spiele/mauer`; Bauplatz-Zugang je Schritt über `STEP_GAME` in `baustelle/index.html`)
  3. Dachbinder mit dem **Autokran** vom Tieflader aufs Haus heben (Binder antippen oder Ausleger über den Tieflader ziehen = Haken nimmt ihn automatisch, dann mit dem Finger ziehen und über der leuchtenden Stelle loslassen oder Stelle antippen; kleines Haus 3, großes 6 Binder; ein Tieflader bringt höchstens 3, leer fährt er weg und ein neuer kommt), Richtfest (step 4), Dach durch Wischen decken, danach Fenster/Tür/Schornstein (step 5). Fertig: `spiele/kran`, `spiele/dach`. Alles im Hof-Raster (G-Zellen, scharfe Pixel, keine weichen Linien/Skalierung): Haus wie das Bauernhaus mit `drawHouseTop()`, Autokran mit `drawMobileCraneBody()`/`drawMobileCraneBoom()`/`drawRope()`, grobe Pixel in den Minispielen mit `snapF(R, 2)`, Balken mit `drawBeamTop()`/`pixLine()` (alle in `gemeinsam/bau.js`). Fertiges Haus (step 5) wird ohne Bauzaun/Schild als verputztes Wohnhaus mit Garten gezeigt.

  Danach kann man es einrichten (Möbel platzieren): Teil 1 fertig (`wohnhaus/`, ein Zimmer, 5 Möbel). Testlinks: `?haus=0` (zu und leer) bzw. `?haus=1` (offen und leer). Weitere Testparameter: `?haustyp=1` (großes Haus), `?moebel=1` (ein paar Möbel fürs Umzug-Testen).
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
