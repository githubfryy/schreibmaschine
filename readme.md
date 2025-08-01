# 🖋️ Schreibmaschine

Eine kollaborative Schreibapp für kreative Schreibwerkstätten - lokal-first und offline-fähig via Docker.

## ✨ Features

- **Local-first**: Funktioniert offline im LAN via Docker
- **Workshop-basiert**: Unterstützt mehrere Workshops mit Schreibgruppen
- **Kollaborativ**: Echtzeit-Zusammenarbeit für kreative Schreibübungen
- **Benutzerfreundlich**: Einfach für nicht-technische Teilnehmer

## 🚀 Quick Start

```bash
# Entwicklungsserver starten
bun run dev

# Validierung (für Entwickler)
bun run test:static

# Datenbank neu aufsetzen
bun run db:migrate && bun run db:seed
```

**Beispiel-URLs nach dem Start:**
- [Willkommensseite](http://localhost:3000/)
- [Beispiel-Lobby](http://localhost:3000/fruehling_2025/zusammen_schreiben/vorraum)
- [API-Status](http://localhost:3000/health)

## 🏗️ Technischer Stack

- **Backend**: Bun 1.2.19 + Elysia.js 1.3.8
- **Frontend**: Modern HTML/CSS + Alpine.js (geplant) 
- **Datenbank**: SQLite (lokal-first)
- **Templating**: Eigenes Mustache-System
- **Echtzeit**: Server-Sent Events (SSE)

## 📁 Projektstruktur

```
src/views/          # HTML-Templates
public/css/         # Stylesheets
src/routes/         # API & Seitenrouten
src/services/       # Geschäftslogik
test-templates.js   # Offline-Template-Tests
```

## 🧪 Entwicklung

### Workflow
1. **Du startest den Server**: `bun run dev`
2. **Claude validiert statisch**: `bun run test:static`
3. **Templates funktionieren offline**: `bun run test:templates`

### Verfügbare Skripte
- `bun run dev` - Entwicklungsserver (manuell starten)
- `bun run test:static` - Vollständige Validierung
- `bun run build` - Produktions-Build
- `bun run db:seed` - Beispieldaten laden

## 📋 Status

### ✅ Fertig
- Datenbank-Schema und Beispieldaten
- REST-API für Workshops und Teilnehmer
- URL-Routing (semantisch + kurz)
- HTML-Template-System
- Lobby-System mit Authentifizierung
- Claude Code Integration gelöst

### 🚧 In Arbeit
- Session-Management und Online-Status
- Server-Sent Events für Echtzeit-Updates
- Flexibles Aktivitätssystem
- Admin-Interface

## 📖 Weitere Dokumentation

- [`CLAUDE.md`](./CLAUDE.md) - Vollständige Projektdokumentation
- [`DEVELOPMENT.md`](./DEVELOPMENT.md) - Entwicklungs-Workflow
- [`TODO.md`](./TODO.md) - Aktuelle Aufgaben

## 🤝 Beitragen

Dieses Projekt wird mit Claude Code entwickelt. Weitere Details zum Workflow findest du in der `DEVELOPMENT.md`.