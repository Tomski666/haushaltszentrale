# Haushaltszentrale Prototyp

Klickbarer Prototyp für Validierungsgespräche. Nur fiktive Beispieldaten, keine echten Daten eingeben.

## Auf Netlify veröffentlichen

1. Bei app.netlify.com anmelden.
2. „Add new site“ > „Deploy manually“ wählen.
3. Den entpackten Ordner `haushaltszentrale` per Drag-and-drop in das Feld ziehen.
4. Unter „Site configuration“ > „Change site name“ einen neutralen Namen vergeben.

## Bedienung

- Oben rechts zwischen Elternteil und Kindern umschalten, um die Rollenstufen zu zeigen.
- Ben (14) hat Stufe 3 mit Gruppen, Lena (11) Stufe 2 ohne Gruppen, Mia (6) Stufe 1 ohne eigenen Zugang.
- Gruppe beitreten mit dem Demo-Code 482 913, eigene Gruppe gründen unter Gruppen.
- Sandra verwaltet die Klassenpflegschaft 6b und sieht dort Beitrittsanfragen und die Kontaktliste.
- Daten liegen nur im Browser (localStorage). Zurücksetzen unter Einstellungen.

## Neue Version hochladen

Im bestehenden Netlify-Projekt auf „Deploys“ gehen und den entpackten Ordner erneut in das Upload-Feld ziehen. Der Link bleibt gleich.

## Technik und Sicherheit

- Reines HTML, CSS und JavaScript, keine externen Bibliotheken, keine Verbindungen nach außen.
- `netlify.toml` setzt eine strikte Content Security Policy und weitere Sicherheitsheader.
- Suchmaschinen werden per `robots.txt`, Meta-Tag und Header ausgeschlossen.
- Kein Zugriffsschutz: Wer den Link kennt, kann den Prototyp öffnen. Link nur gezielt weitergeben.
