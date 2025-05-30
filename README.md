# Schreibmaschine

Eine einfache Web-App für kreatives Schreiben in kleinen Gruppen.

## Über das Projekt

Die "Schreibmaschine" ist ein Tool für kreative Schreibgruppen. Sie zeigt Prompts an, läuft mit einem Timer und hilft dabei, den kreativen Schreibprozess zu strukturieren.

## Funktionen

- Anfangsprompts und Ereignisprompts für kreatives Schreiben
- Verschiedene Timer-Modi (konstant, variabel, zufällig)
- Session-Code-System für einfaches Teilen mit Teilnehmern
- Versteckbarer Timer
- Verschiedene thematische Prompt-Sets

## Nutzung

### Als Admin/Gruppenleitung

1. Öffne `admin.html`
2. Wähle ein Prompt-Set aus dem Dropdown
3. Konfiguriere den Timer-Modus:
   - Fixed: Konstante Zeit (z.B. "10" für 10 Minuten)
   - Variable: Verschiedene Zeiten (z.B. "5,8,10,8" für abwechselnde Intervalle)
   - Random: Zufällige Zeit zwischen Min-Max (z.B. "5-12")
4. Klicke auf "Session erstellen"
5. Teile den generierten 6-stelligen Code mit den Teilnehmern

### Als Teilnehmer

1. Öffne `index.html`
2. Gib den 6-stelligen Session-Code ein
3. Folge den angezeigten Prompts und schreibe deine Geschichte

## Eigene Prompt-Sets erstellen

Prompt-Sets sind einfache Markdown-Dateien im Format:

```markdown
# Anfangsprompts

- Prompt 1
- Prompt 2
- ...

# Ereignisprompts

- Ereignis 1
- Ereignis 2
- ...
```

Lege neue Prompt-Sets im Verzeichnis `prompts/` ab (z.B. `prompts/mein-set.md`).

## Lokale Entwicklung

Für die lokale Entwicklung kann ein einfacher HTTP-Server verwendet werden:

```bash
python -m http.server 8000
```

Dann im Browser öffnen: `http://localhost:8000`

## Deployment

Die App kann auf jedem statischen Webhosting-Dienst gehostet werden (GitHub Pages, Cloudflare Pages, Netlify, etc.).

## Technischer Stack

- HTML, CSS, JavaScript (vanilla)
- Keine Frameworks oder Bibliotheken, außer marked.js zum Parsen von Markdown
- LocalStorage zur Datenspeicherung

## Lizenz

MIT
