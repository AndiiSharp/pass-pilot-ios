# Pass Pilot (iOS) – Stand 26.11.2026

Lern-App für den Einbürgerungstest und „Leben in Deutschland“. App-ID `de.lumvero.passpilot`, ASC-App 6839418885,
Name „Pass Pilot: Einbürgerungstest“, Capacitor 8.6 + Haptics, offline, keine Werbung/Käufe/Daten.

## Daten (geprüft)
- Amtlicher Gesamtfragenkatalog BAMF, Stand 07.05.2025 (PDF in `projekte\lid-refs\amtlich`), amtliches Werk (§ 5 UrhG, Anlage 1 EinbTestV).
- Deutscher Text, Englisch, Kurzerklärungen, Bilder: IndrajeetPatil/einbuergerungstest (MIT; Fotos CC BY-SA mit Nachweis).
- Übersetzungen TR/RU/FR/AR/UK/HI + ausführliche Erklärungen: leben-in-deutschland/leben-in-deutschland-app (MIT), auf amtliche
  Antwortreihenfolge umgestellt (`lid-refs\amtlich\merge.py`); 3 im Katalog 2025 geänderte Optionen neu übersetzt (`tools/build-data.py`).
- Antworten: 0 Abweichungen zwischen beiden Quellen; alle 44 Bildfragen per Augenschein geprüft; ein Fehler der Vorlage (Frage 21) korrigiert.
- 20 Vorlagen-Repos in `projekte\lid-refs`, REA-Analyse in `lid-refs\_rea`.

## App
Einführung (Sprache, Bundesland, Übersetzung, Ziel), smarte Lernrunden (Leitner), Themen, Suche, Fehler, Markiert, Bundesland,
Prüfungssimulation 33/60 Min mit Übersicht + Fortsetzen + Auswertung, Bestehenschance, Serie, Tagesziel, Countdown, 15 Erfolge,
UI in DE/EN/TR/AR(RTL)/UK/RU, Fragenübersetzung in 7 Sprachen, Vorlesen, Hell/Dunkel.

## Tests
`node tools/test-engine.mjs` (12.945 ok), `node tools/test-webkit.mjs` (154/154 ok), `node tools/test-demo.mjs en` (Rundgang ok).

## App Store Connect (erledigt)
Texte in 6 Sprachen (metadata5.json), 84 Store-Grafiken (aso/store5), Kategorien Bildung/Nachschlagewerke, 4+, kostenlos,
alle Länder außer China, Datenschutz „keine Daten“, Datenschutz-/Support-URL, Prüfhinweise (asc-info21.mjs pass), AFTER_APPROVAL.

## Offen
Repo AndiiSharp/pass-pilot-ios ist privat → Mac-Build startet nicht (Kontingent). Nach Freigabe öffentlich: Build (ios.yml),
Video (demo-video.yml, app=passpilot, secs=180), Video als Release-Asset, `asc-info21.mjs pass`, `asc-final2.mjs pass`, `asc-submit.mjs pass metadata5.json`.
