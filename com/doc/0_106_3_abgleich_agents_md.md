# Abgleich und Aktualisierung der AGENTS.md

**Datum:** 2026-09-24  
**Projekt:** Nodges  
**Version:** 0.106.3  
**Beteiligte:** conT (Antigravity auf [W:/](file:///W:/)), piCon (Pi im Container auf `/workspace`), User (Banixx)  

---

## 1. Ausgangslage und Diskrepanzen

Die bisherige Fassung von [W:/AGENTS.md](file:///W:/AGENTS.md) basierte noch auf einem fruehen Zwischenstand und wies im Vergleich zu [W:/bericht.md](file:///W:/bericht.md), [W:/setup.md](file:///W:/setup.md) und den aktuellen Systemgegebenheiten gravierende Luecken und veraltete Annahmen auf:

### 1.1 Fehlende Beruecksichtigung beider Harnesses
- **Bisherige AGENTS.md:** War einseitig auf den Pi-Container ausgerichtet (`/workspace`). Sie erwaehnte weder Antigravity noch das Multi-Harness-Konzept.
- **Aktueller Stand (bericht.md Teil F, setup.md Abschnitt 1):** Es existieren zwei aktive Instanzen, die physisch auf denselben Dateien arbeiten:
  - `piCon`: Pi-Coding-Agent im Docker-Container `pi-harness` unter `/workspace`.
  - `conT`: Antigravity-Agent auf Windows 11 ueber das zugeordnete Netzlaufwerk [W:/](file:///W:/) (`\\wsl.localhost\Ubuntu\home\unixusername\nodges`).
  - Der fruehere Windows-Host-Klon `winAnt` (`C:/Users/ich/Desktop/code/_projects/Nodges`) wurde am 2026-09-24 vollstaendig abgekoppelt.

### 1.2 Dateisystem und Single Source of Truth (SSoT)
- **Bisherige AGENTS.md:** Erklaerte lediglich `/workspace` als Mount, ohne klarzustellen, dass WSL2 ext4 (`/home/unixusername/nodges`) die alleinige lokale Wahrheitsquelle ist.
- **Aktueller Stand:** Da `piCon` und `conT` direkt auf denselben ext4-Dateien operieren, ist kein Zwischenschritt ueber Git fuer den Datenaustausch zwischen den Agenten erforderlich. Aenderungen sind sofort gegenseitig sichtbar.

### 1.3 Git- und Branch-Strategie
- **Bisherige AGENTS.md:** Keine Angabe zur Branch-Strategie oder zu Versionstags.
- **Aktueller Stand (bericht.md Teil D und F.5, setup.md Abschnitt 2):**
  - Der Branch `pi` wurde remote und lokal vollstaendig geloescht und in `main` ueberfuehrt.
  - Alle Harnesses arbeiten ausschliesslich auf `main`.
  - Git Push dient primaer als externes Backup auf GitHub und fuer Release-Tags (z.B. `v0.106.0`), nicht mehr als Synchronisationsbruecke zwischen den lokalen Agenten.

### 1.4 Status von `doc/` und `.gitignore`
- **Bisherige AGENTS.md:** Enthaelt keinen Hinweis auf die Dokumentationsstruktur oder die Freigabe von `doc/`.
- **Aktueller Stand (bericht.md Teil B Abschnitt 2 / Teil G):**
  - `doc/` wurde aus der `.gitignore` entfernt und vollstaendig freigegeben (Ballast um 258 Altdateien bereinigt).
  - Arbeitsberichte und Plaene von Antigravity werden gemaess Systemregel verbindlich in [W:/com/doc/](file:///W:/com/doc/) mit dem Versionspraefix (z.B. `0_106_3_...md`) abgelegt.
  - Uebergeordnete Leitdokumente liegen im Root ([W:/bericht.md](file:///W:/bericht.md), [W:/setup.md](file:///W:/setup.md), [W:/AGENTS.md](file:///W:/AGENTS.md)) sowie in [W:/docs/](file:///W:/docs/).

### 1.5 Zeilenenden und Berechtigungen
- **Bisherige AGENTS.md:** Fehlende Dokumentation zur Normalisierung der Zeilenenden.
- **Aktueller Stand (setup.md Abschnitt 3 und 4b):**
  - Root-`.gitattributes` erzwingt `eol=lf` fuer Textdateien.
  - Explizite Ausnahme fuer Windows-Skripte (`*.cmd`, `*.bat`, `*.ps1`) mit `eol=crlf`, damit der Container-Start ueber [W:/start_pi_container.cmd](file:///W:/start_pi_container.cmd) stabil bleibt.
  - `core.fileMode = false` und `safe.directory` sind gesetzt.

### 1.6 Formatregeln
- **Bisherige AGENTS.md:** Verwendete Unicode-Emojis in der Port-Tabelle (z.B. Haken und Kreuze), was der globalen Antigravity-Direktive (strikte Textform ohne Emojis) widerspricht.

---

## 2. Zielbild fuer die ueberarbeitete AGENTS.md

Die neue Fassung von [W:/AGENTS.md](file:///W:/AGENTS.md) muss:
1. Beide Harnesses gleichberechtigt und praezise anleiten (`piCon` und `conT`).
2. Die Pfad-Aequivalenz ([W:/](file:///W:/) <-> `/workspace/` <-> `/home/unixusername/nodges`) transparent darstellen.
3. Die gemeinsame Branch-Strategie (`main`), Backup-Zyklen und Tagging verbindlich vorschreiben.
4. Alle technischen Komponenten (Vite, LightRAG, Ports, Prozesspruefung) neutral und emoji-frei dokumentieren.
5. Die universellen Kommunikations- und Handlungsregeln (Deutsch, kein Sz, keine Emojis, direkte Beantwortung von Fragen im ersten Satz, keine voreiligen Code-Aenderungen bei Fragen) fest verankern.
