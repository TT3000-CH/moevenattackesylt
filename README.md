# Möwenpik V4

Browsergame im Comicstyle für GitHub Pages.

## Neu in V4

- Hochgeladenes Lied als Musik integriert: `assets/moewenpik.mp3`
- Joystick rechts unten zum aerodynamischen Steuern
- Flügelschlagknopf links unten für zusätzlichen Auftrieb
- Touristen können sich aktiv wehren
- Leben links oben als Herzen
- Aerodynamischeres Flugmodell mit Trägheit, Sinkrate, Auftrieb, Rotation und Energiemanagement
- Level steigt alle 150 Punkte: mehr Tempo, mehr Touristen, häufigere Angriffe

## Steuerung

Mobile:
- Rechts unten: Joystick
- Links unten: Flügelschlag

Desktop:
- WASD oder Pfeiltasten zum Steuern
- Leertaste für Flügelschlag
- M für Musik ein/aus

## GitHub Pages Deployment

1. ZIP entpacken.
2. Alle Dateien und den Ordner `assets` ins Repository hochladen.
3. Wichtig: `index.html` muss direkt im Hauptordner des Repository liegen.
4. Settings → Pages → Deploy from branch → `main` → `/root`.
5. Nach dem Deployment die Seite mit `?v=4` neu laden, falls noch Cache sichtbar ist.
