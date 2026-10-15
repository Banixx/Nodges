---
name: mdt
description: Prueft den Google-Drive-Ordner "Mdt" auf neue Notizen, korrigiert Rechtschreibfehler, ordnet sie lokal nach W:/com/todos/ bzw. W:/com/ideen/ ein, aggregiert todoss.md sowie ideens.md und bespricht Uebernahmen mit dem Benutzer.
---

# MDT (Markleaf / Mobile Drive Triage)

Dieser Skill verarbeitet Notizen aus dem Google-Drive-Ordner **Mdt** (erstellt ueber das Smartphone via Markleaf / Mobile) und fuehrt sie in das Nodges-Wissenssystem unter `W:/com/` ein.

**Drive-Ordner-ID:** `1xviS099lJrWk3IM6yxZW_HNhRBqV4G9r`  
**Web-URL:** `https://drive.google.com/drive/folders/1xviS099lJrWk3IM6yxZW_HNhRBqV4G9r`

---

## Ablauf beim Aufruf (`mdt`)

1. **Drive-Bestand pruefen:**
   - Den HTML-Inhalt des oeffentlichen Google-Drive-Ordners abrufen (`read_url_content` oder HTTP-Abruf).
   - Alle vorhandenen `.md`-Dateien und deren Drive-IDs ermitteln.
   - Mit dem lokalen Bestand in `W:/com/todos/` und `W:/com/ideen/` abgleichen, um nur neue oder geaenderte Notizen zu identifizieren.

2. **Herunterladen & Inhalt lesen:**
   - Neue Dateien temporaer herunterladen (`https://drive.google.com/uc?export=download&id=<FILE_ID>`).
   - Die Texte vollstaendig lesen und analysieren.

3. **Korrektur & thematische Zuordnung:**
   - **Tipp- und Rechtschreibfehler bereinigen:** Typo-Korrekturen (z. B. "Nchste Fritte" -> "Naechste Schritte", "Notches" -> "Nodges", "mehrer" -> "mehrerer").
   - **Thematische Zuordnung:**
     - **Aufgaben / To-Dos:** Handelt die Notiz von konkreten Arbeitsschritten, Tests oder Branches (z. B. "Bild 14 testen", "Branch erstellen"), gehoert eine bereinigte Kopie nach `W:/com/todos/`.
     - **Ideen / Konzepte:** Handelt die Notiz von Gedanken, UI-Ueberblendungen, Systemtheorie oder Architektur, gehoert eine bereinigte Kopie nach `W:/com/ideen/`.
   - **Wichtig (Einweg-Kopie):** Es werden ausschliesslich lokale Kopien erstellt. Keine Synchronisation zurueck in Google Drive; auf Google Drive wird nichts ueberschrieben oder geloescht.

4. **Aggregation verfassen (`todoss.md` und `ideens.md`):**
   - **`W:/com/todos/todoss.md` erstellen:** Enthaelt die bestehende `todo.md` kombiniert mit den neu hinzugekommenen Aufgabennotizen als zusammengefassten, aggregierten aktuellen Stand aller Todos.
   - **`W:/com/ideen/ideens.md` erstellen:** Enthaelt die bestehende `ideen.md` kombiniert mit den neu hinzugekommenen Ideen- und Konzeptnotizen als zusammengefassten, aggregierten aktuellen Stand aller Ideen.

5. **Bericht & Dialog mit dem Benutzer:**
   - Dem Benutzer Bericht erstatten ueber:
     - Welche neuen Dateien gefunden wurden.
     - Welche Korrekturen vorgenommen wurden.
     - Wo sie lokal abgelegt wurden (`todos/` oder `ideen/`).
     - Inhalt und Struktur der aggregierten Dateien `todoss.md` und `ideens.md`.
   - Vorschlaege unterbreiten und besprechen, was davon in die verbindliche Haupt-Matrix `W:/com/todo.md` einfließen soll und wie es um die neuen Ideen steht.
