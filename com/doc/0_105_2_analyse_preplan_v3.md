# Analyse und Bewertung: Pre-Plan v3 (Nodges Diagnose & Refactoring)

Dokumentenversion: 0.105.2
Referenzierte Datei: C:/Users/ich/Desktop/code/_projects/Nodges/Pre-Plan_v3_Nodges_Diagnose_Refactoring.md
Datum: 2026-09-22

---

## 1. Ueberblick und Einordnung

Der Pre-Plan v3 beschreibt eine strukturierte Vorgehensweise fuer die Diagnose, Bereinigung und das Refactoring der Nodges-Codebasis durch ein autonomes System (Pi Code Harness). Im Vergleich zu Vorversionen zeichnet sich v3 durch eine defensive Sicherheitsarchitektur mit expliziten STOPP-Freigabepunkten (Phase 0, 0b, 2, 4) und eine empirische Diagnosestrategie (Phase 1 vor Phase 2/4) aus.

---

## 2. Abgleich mit dem realen Projektzustand

Eine Pruefung des aktuellen Arbeitsstands im Projektverzeichnis liefert folgende Befunde:

### 2.1 Git- und Branch-Status (Phase 0 / 0b)
- **Aktueller Branch:** `pi` (verbunden mit `origin/pi`).
- **Pre-Plan Datei:** `Pre-Plan_v3_Nodges_Diagnose_Refactoring.md` liegt als untracked Datei im Projekt-Root.
- **Remote:** Verweist auf `https://github.com/Banixx/Nodges.git`.
- **Befund:** Der Pre-Plan referenziert primaer Arbeiten bezueglich `main`. Da lokal auf `pi` gearbeitet wird, muss geklaert werden, ob der Sicherheits-Branch/Fork von `main` oder von `pi` abgezweigt werden soll.

### 2.2 Status von TypeScript, Tests und Build (Phase 1)
Die in Phase 1 geforderten Ueberpruefungen wurden lesend ausgefuehrt:
- `npx tsc --noEmit`: Beendet mit Exit-Code 0. Keine Typfehler vorhanden.
- `npm run test -- --run`: 18 Test-Suites (238 Tests) erfolgreich durchgelaufen, 1 Suite (1 Test) uebersprungen, 0 Fehler.
- `npm run build`: Erfolgreich in 18.67 Sekunden compiliert.
- **Befund:** Die Codebasis befindet sich syntaktisch und typentechnisch in einem voll funktionsfaehigen Zustand. Es gibt keinen akuten Compile- oder Test-Bruch.

### 2.3 Datenbestaende und Speicherlast (Phase 2)
- Die im Plan genannten Mega-Dateien liegen unter `C:/Users/ich/Desktop/code/_projects/Nodges/public/data/generated/`:
  - `beautiful_sphere.json`: 15.233.474 Bytes (~15,2 MB, ca. 585.000 Zeilen).
  - `temporal_500_nodes.json`: 9.430.436 Bytes (~9,4 MB, ca. 365.000 Zeilen).
- Fehlerdumps im selben Verzeichnis:
  - 5x `LLM_ERROR_RAW_*.txt` (150 KB bis 375 KB).
  - 1x `LLM_ERROR_STRUCTURE_1784553275935.json` (84 KB).
- Alle diese Dateien sind im Git-Index getrackt (`git ls-files`).

### 2.4 Kritischer architektonischer Befund: Vite Glob-Import
- In `C:/Users/ich/Desktop/code/_projects/Nodges/src/ui/FilePanelUI.ts` (Zeile 535) befindet sich folgender Aufruf:
  ```ts
  const dataFiles = import.meta.glob('/public/data/**/*.json');
  ```
- **Auswirkung:** Vite wertet diesen Glob zur Build-Zeit statisch aus und buendelt jede gefundene JSON-Datei als separates JavaScript-Modul in den `dist/assets/`-Ordner.
- **Ergebnis beim Build:**
  - `dist/assets/beautiful_sphere-*.js`: 5,58 MB JavaScript
  - `dist/assets/temporal_500_nodes-*.js`: 3,40 MB JavaScript
- **Fazit:** Die Dateien belasten nicht nur die Festplatte und den Browser-RAM beim Laden, sondern blaehen auch den statischen Build massiv auf.

### 2.5 Vite Base-Pfad
- In `C:/Users/ich/Desktop/code/_projects/Nodges/vite.config.ts` ist aktuell `base: './'` konfiguriert.
- Der Pre-Plan schlaegt `base: '/Nodges/'` fuer GitHub Pages vor.
- **Hinweis:** Ein relativer Pfad (`./`) hat den Vorteil, sowohl lokal, im Container als auch in Unterverzeichnissen ohne Code-Aenderungen zu funktionieren, sofern keine absoluten Pfadaufrufe im Quellcode hartkodiert sind. Eine Umstellung auf `/Nodges/` wuerde lokale Preview-Server ausserhalb des Repopfads brechen.

### 2.6 Default-Datensatz beim App-Start
- In `C:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts` (Zeile 419) ist `loadDefaultData()` derzeit leer:
  ```ts
  async loadDefaultData() {
      console.log('No default data loaded.');
  }
  ```
- Die App laedt beim Start somit keine Daten automatisch.

---

## 3. Bewertung des Pre-Plans v3

### 3.1 Staerken des Plans
1. **Defensive Leitplanken:** Klare Trennung zwischen Pruefen, Melden und Ausfuehren. Keine unkontrollierten Eingriffe.
2. **Phase 1 vor Phase 2:** Das Vorziehen der realen Diagnose verhindert das Beheben von Phantom-Fehlern.
3. **Schutz vor Kontext-Ueberlauf:** Das Verbot, Mega-JSONs vollstaendig in den LLM-Kontext zu laden, ist essenziell fuer Kosteneffizienz und Stabilitaet.
4. **Architekturfokus:** Die Aufteilung in Data-, Render- und UI-Layer adressiert direkt die monolithische Struktur von `src/App.ts` (1.488 Zeilen).

### 3.2 Ergaenzungs- und Praezisierungsbedarf

1. **Entschaerfung von `import.meta.glob`:**
   Das Loeschen der Mega-Dateien loest das Problem nur temporaer. Sobald neue Testdaten in `public/data/` generiert werden, saugt `FilePanelUI.ts` diese erneut in den Build. Hier muss der Glob-Import ersetzt oder auf Metadaten/Indexdateien beschraenkt werden.
2. **Gitignore-Erweiterung:**
   `public/data/generated/` sollte in `C:/Users/ich/Desktop/code/_projects/Nodges/.gitignore` aufgenommen werden, um das unbeabsichtigte Einchecken kuenftiger Generierungsergebnisse und Fehler-Logs zu unterbinden.
3. **Branch-Basis festlegen:**
   Es muss verbindlich festgelegt werden, ob von `origin/main` oder `origin/pi` ausgegangen wird.
4. **DevContainer-Kontext:**
   Gemaess `AGENTS.md` laeuft das Projekt in einem DevContainer (Port 5173 belegt durch Container-CMD, LightRAG auf Port 8000, keine Standard-Tools wie `ps`/`pkill`). Der Harness muss diese Gegebenheiten beruecksichtigen.

---

## 4. Empfohlene naechste Schritte

1. Freigabe fuer Phase 0 (Festlegung der Basis: `main` vs. `pi`).
2. Durchfuehrung der Sicherungsmassnahmen gemaess Phase 0b (Fork / Branch-Schutz).
3. Gezielte Bereinigung gemaess Phase 2 (Loeschen der Mega-Dateien und Log-Dumps aus `public/data/generated/` sowie Anpassung von `.gitignore`).
4. Behebung des Glob-Imports in `src/ui/FilePanelUI.ts`.
5. Planung des Drei-Layer-Refactorings fuer `src/App.ts`.
