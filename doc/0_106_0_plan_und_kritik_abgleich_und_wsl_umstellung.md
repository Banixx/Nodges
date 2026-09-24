# Plan und kritische Wuerdigung: Abgleich der Arbeitsstaende und Umstellung auf WSL2 als Single Source of Truth

## 1. Executive Summary und Direktbefund

Vor einer Umstellung auf das WSL2-Dateisystem muss ein vollstaendiger Abgleich (Reconciliation) erfolgen, da sich Windows und WSL2 zwar auf demselben Git-Commit (`fbbcb1b`) befinden, im uncommitteten Arbeitsbereich (Working Tree) jedoch gravierende Unterschiede aufweisen:
1. **Windows enthaelt**: Die neuen E2E-Playwright-Tests (`e2e/`, `playwright.config.ts`, Anpassungen in `package.json` und `vitest.config.ts`) sowie ueber 80 Analyse-Dokumente im Ordner `doc/`.
2. **WSL2 enthaelt**: Die Restrukturierung der Git-Analyse nach `docs/git-analyse/`, waehrend der dortige Ordner `doc/` veraltet ist (nur 23 Dokumente von August 2026).

---

## 2. Der 4-Phasen-Plan fuer Abgleich und Teststellung

### Phase 1: Bestandsaufnahme und Sicherung der lokalen Arbeitsstaende
1. **Git-Status erfassen**:
   - Windows: Verifizieren der geaenderten Dateien (`package.json`, `vitest.config.ts`, `e2e/`).
   - WSL2: Verifizieren der uncommitteten Aenderungen (`docs/git-analyse/`).
2. **Dokumentations-Inventar abgleichen**:
   - Die ueber 60 Dokumente, die in Windows unter `C:/Users/ich/Desktop/code/_projects/Nodges/doc/` liegen, aber in WSL2 fehlen, muessen nach `//wsl.localhost/Ubuntu/home/unixusername/nodges/doc/` uebertragen werden, damit kein Analysewissen verloren geht.

### Phase 2: Zusammenfuehrung und Bereinigung im Git
1. **Windows-Arbeitsstand uebernehmen**:
   - Die Playwright-Erweiterungen (`e2e/`, `playwright.config.ts`, `package.json`, `vitest.config.ts`) werden sauber committet.
2. **WSL-Aenderungen einpflegen**:
   - Die Verschiebung von `git-analyse/` nach `docs/git-analyse/` im WSL-Checkout wird committet.
3. **Harmonisierung ueber origin/pi**:
   - Beide Staende werden zusammengefuehrt, sodass sowohl GitHub (`origin/pi`), Windows als auch WSL2 den absolut identischen Git-Stand besitzen.

### Phase 3: Technische Vorbereitung fuer Antigravity auf WSL2
1. **Git Safe Directory fuer UNC registrieren**:
   - Windows-Befehl: `git config --global --add safe.directory "%(prefix)///wsl.localhost/Ubuntu/home/unixusername/nodges"`.
2. **Gitattributes etablieren**:
   - Sicherstellen, dass Zeilenenden (`* text=auto eol=lf`) Linux-kompatibel bleiben.
3. **Dokumentationsordner-Regel klaeren**:
   - Klaerung von `doc/` vs. `docs/` in `.gitignore`, damit Dokumente kuenftig fuer beide Agenten dauerhaft im Repo sichtbar sind.

### Phase 4: Praxistest und Evaluierung (Antigravity auf WSL2)
1. **Lesen und Schreiben pruefen**:
   - Antigravity liest und modifiziert Testdateien direkt auf `//wsl.localhost/Ubuntu/home/unixusername/nodges`.
2. **Laufzeit- und Build-Befehle testen**:
   - Vergleich: Ausfuehrung von Tests ueber Windows-PowerShell vs. Ausfuehrung ueber die WSL-Bruecke (`wsl -e npm test`).
3. **Vite HMR und Container-Reaktion validieren**:
   - Pruefen, ob Dateiaenderungen von Antigravity im Container sofort den Hot-Reload auf Port 5173 ausloesen.

---

## 3. Kritische Wuerdigung und Hinterfragung des Plans

### Punkt 1: IDE- und Workspace-Bindung von Antigravity
- **Kritische Frage**: Kann Antigravity als Agent einfach den Speicherort wechseln?
- **Erkenntnis**: Der Primaer-Workspace von Antigravity ist in den Sitzungseinstellungen an `C:/Users/ich/Desktop/code/_projects/Nodges` gebunden. Antigravity kann zwar problemlos jede Datei unter `//wsl.localhost/...` mit absoluten Pfaden lesen und schreiben, fuer ein vollstaendiges Arbeiten als Hauptverzeichnis muesste die IDE/Session jedoch idealerweise direkt auf dem WSL-Pfad geoeffnet werden.

### Punkt 2: Kollision von Windows-Tools mit Linux-Dateien
- **Kritische Frage**: Was passiert, wenn Antigravity von Windows aus `npm install` oder `npx playwright` aufruft?
- **Gefahr**: Wenn Windows-Node.js im Linux-Dateisystem ausgefuehrt wird, versucht Windows, `node_modules` mit Windows-Binaries zu befuellen. Dies kann die Linux-Binaries des Pi-Containers beschaedigen.
- **Konsequenz**: Saemtliche Build-, Test- und npm-Befehle muessen konsequent ueber `wsl -e ...` oder direkt im Pi-Container ausgefuehrt werden, niemals ueber natives Windows-npm im WSL-Verzeichnis!

### Punkt 3: Performance ueber die UNC-Netzwerkbruecke
- **Kritische Frage**: Ist Antigravity auf Windows ueber `\\wsl.localhost` spuerbar langsamer?
- **Erkenntnis**: Das Lesen und Schreiben einzelner Dateien durch den KI-Agenten dauert nur wenige Millisekunden mehr. Fuer den Agenten gibt es keine spuerbare Verzoegerung. Der riesige Performancegewinn entsteht im Gegenzug im Container, da Vite, LightRAG und TypeScript nativ auf Linux ext4 laufen.

### Punkt 4: Die Dokumenten-Divergenz (doc/ vs. docs/)
- **Kritische Frage**: Was geschieht mit den bestehenden Analysen?
- **Gefahr**: Wenn einfach auf WSL gewechselt wird, fehlen Antigravity ploetzlich ueber 60 Dokumente aus den letzten Wochen, da diese in WSL nie angelegt wurden.
- **Konsequenz**: Ein physischer Abgleich des `doc/`-Ordners vor der Umstellung ist absolut zwingend.

---

## 4. Fazit

Der Plan ist technisch tragfaehig und loest die Doppelgleisigkeit endgueltig auf. Die wichtigste Verhaltensregel lautet: Antigravity darf Quellcode im WSL-Verzeichnis direkt editieren, saemtliche Befehle (Builds, Tests, Paketinstallationen) muessen jedoch zwingend ueber die Linux-Umgebung (`wsl -e`) delegiert werden.
