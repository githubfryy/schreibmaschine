# Installationsanleitung für Schreibmaschine

## Lokale Installation

1. Klonen Sie das Repository:
   ```
   git clone https://github.com/ihr-username/schreibmaschine.git
   cd schreibmaschine
   ```

2. Starten Sie einen lokalen Webserver (z.B. mit Python):
   ```
   python -m http.server 8000
   ```

3. Öffnen Sie die App im Browser:
   ```
   http://localhost:8000
   ```

## Deployment mit GitHub und Cloudflare Pages

1. Erstellen Sie ein GitHub-Repository und pushen Sie den Code:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/ihr-username/schreibmaschine.git
   git push -u origin main
   ```

2. Melden Sie sich bei Cloudflare an und erstellen Sie ein neues Cloudflare Pages-Projekt:
   - Verbinden Sie Ihr GitHub-Repository
   - Wählen Sie das Repository aus
   - Konfigurieren Sie den Build:
     - Build-Befehl: (leer lassen)
     - Build-Ausgabeverzeichnis: `/`
   - Klicken Sie auf "Save and Deploy"

3. Konfigurieren Sie Ihre benutzerdefinierte Domain (schreibmaschine.fryy.de):
   - Gehen Sie zu den Domain-Einstellungen des Projekts
   - Fügen Sie Ihre benutzerdefinierte Domain hinzu
   - Folgen Sie den Anweisungen, um DNS-Einträge zu konfigurieren

## Eigene Prompt-Sets erstellen

Prompt-Sets sind Markdown-Dateien im Format:

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

Legen Sie neue Prompt-Sets im Verzeichnis `prompts/` ab.
