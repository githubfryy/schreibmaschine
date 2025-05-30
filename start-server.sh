#!/bin/bash
echo "Starte lokalen Webserver für Schreibmaschine..."
echo "App wird verfügbar sein unter: http://localhost:8000"
python -m http.server 8000
