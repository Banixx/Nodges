# Analyse: Pi-Harness Commit und Checkout-Struktur

## 1. Ueberblick und Befund

Im Pi-Harness (Container `pi-harness` unter WSL2) wurde lokal ein Commit erstellt:
- **Commit-Hash**: `3068512ab425731421d4df98beb2602bac55cd49`
- **Autor**: `Pi Agent <pi-agent@localhost>`
- **Datum**: 2026-09-24 11:20:06 UTC
- **Commit-Message**: `docs: Multi-Harness-Setup (piCon + Antigravity) als gemeinsames Arbeitsdokument`
- **Geaenderte Datei**: `docs/setup-multi-harness.md` (+272 Zeilen)

Dieser Commit wurde bisher **nicht** zu GitHub (`origin/pi`) gepusht. Daher ist `origin/pi` auf GitHub weiterhin auf Commit `80236c5`.

---

## 2. Warum handelt es sich um zwei getrennte Checkouts?

Es existieren auf diesem Rechner zwei vollstaendig unabhaengige lokale Git-Klone:

1. **Checkout A (Windows Host / Antigravity)**:
   - Pfad: `C:/Users/ich/Desktop/code/_projects/Nodges`
   - Dateisystem: Windows NTFS
   - Git Remote: `https://github.com/Banixx/Nodges.git` (HTTPS via Windows Credential Manager)
   - Aktueller Branch: `pi` auf Commit `80236c5`
   - Lokaler Status: Modifikationen an `package.json`, `package-lock.json`, `vitest.config.ts`, untracked Playwright E2E-Dateien

2. **Checkout B (WSL2 Linux / Pi-Harness)**:
   - Pfad Host/WSL: `//wsl.localhost/Ubuntu/home/unixusername/nodges` bzw. `/home/unixusername/nodges`
   - Pfad Container: `/workspace` (gemountet via `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/docker-compose.yml` ueber die Umgebungsvariable `REPO_PATH`)
   - Dateisystem: Linux ext4
   - Git Remote: `git@github.com:Banixx/Nodges.git` (SSH)
   - Aktueller Branch: `pi` auf Commit `3068512` (1 Commit voraus gegenueber `origin/pi`)
   - Lokaler Status: Unstaged Verschiebung von `git-analyse/` nach `docs/git-analyse/`

Da es sich um zwei physisch getrennte Verzeichnisse und `.git`-Repositories handelt, sind Aenderungen und Commits in Checkout B fuer Checkout A erst sichtbar, wenn:
1. Checkout B den Commit zu GitHub pusht (`git push origin pi`) und Checkout A diesen abholt (`git pull origin pi`), ODER
2. Checkout A den WSL-Pfad direkt als Remote einbindet und pullt.

---

## 3. Inhalt von docs/setup-multi-harness.md (Zusammenfassung)

Der Pi-Agent hat in `docs/setup-multi-harness.md` das Verhaeltnis der beiden Systeme analysiert:
- **Zwei getrennte Checkouts**: Synchronisation erfolgt ausschliesslich ueber Git (`push`/`pull`).
- **Compose-Datei ausserhalb**: `C:/Users/ich/Desktop/code/_projects/Nodges_Pi` liegt ausserhalb des Repos, waehrend `/workspace/Nodges_Pi` nur ein statischer Snapshot ist.
- **MCP vs. Git**: Pi-Agent argumentiert gegen ein GitHub-MCP fuer Pi, da Git ueber SSH bereits funktioniert und Pi MCP bewusst nicht im Kern fuehrt.
- **Dokumentationsordner-Konflikt**: `doc/` wird von `.gitignore` ausgeschlossen, waehrend Antigravitys Regeln Dokumente in `doc/` vorschreiben. Pi schlaegt `docs/` vor.
- **Offene Fragen an Antigravity**: Pi-Agent hat 7 konkrete Fragen zur Abstimmung formuliert.

---

## 4. Antworten auf die 7 Fragen des Pi-Agenten

1. **Wie greift Antigravity auf GitHub zu?**
   Antigravity nutzt die native Git-CLI ueber HTTPS (`https://github.com/Banixx/Nodges.git`) mit Authentifizierung ueber den Windows Credential Manager. Push und Pull funktionieren verifiziert.
2. **Auf welchem Branch arbeitet Antigravity?**
   Aktuell auf `pi`. Push und Pull zielen auf `origin/pi`.
3. **Sieht Antigravity das Dokument?**
   Im lokalen Windows-Git-Verlauf noch nicht, da `git push` im Pi-Harness noch ausstand. Ueber den direkten Zugriff auf das WSL2-Dateisystem (`//wsl.localhost/Ubuntu/home/unixusername/nodges`) kann Antigravity die Datei jedoch sofort einsehen.
4. **Arbeitsverzeichnis von Antigravity**:
   Ausschliesslich `C:/Users/ich/Desktop/code/_projects/Nodges`.
5. **Zugriff auf MCP-Werkzeuge fuer GitHub**:
   Antigravity hat einen GitHub-MCP-Server zur Verfuegung (fuer Issue- und PR-Abfragen, Suche). Fuer regulaere Datei- und Code-Sync-Operationen wird jedoch standardmaessig die Git-Kommandozeile bevorzugt.
6. **Ablageort fuer Dokumentationen**:
   Antigravity speichert nach Benutzerregel in `C:/Users/ich/Desktop/code/_projects/Nodges/doc/` mit Versionspraefix (z.B. `0_106_0_...md`). Da `doc/` in `.gitignore` ignoriert wird, gelangen diese Dokumente nicht nach GitHub. Eine Harmonisierung (z.B. `docs/` als gemeinsamer getrackter Standard oder Entfernung von `doc/` aus `.gitignore`) ist zwingend erforderlich.
7. **Identitaet / Autor**:
   Antigravity committet als der auf Windows konfigurierte Benutzer `Banixx`, waehrend Pi-Agent als `Pi Agent <pi-agent@localhost>` auftritt.

---

## 5. Empfohlene Synchronisationsschritte

1. **Freigabe und Push im Pi-Harness**:
   Der Commit `3068512` (sowie die Verschiebung von `git-analyse/` nach `docs/git-analyse/`) kann im WSL-Checkout zu `origin/pi` gepusht werden.
2. **Pull im Windows-Checkout**:
   Nach dem Push kann Antigravity in `C:/Users/ich/Desktop/code/_projects/Nodges` ein `git pull origin pi` durchfuehren (nach vorherigem Stashen oder Committen der lokalen Playwright-Aenderungen).
3. **Bereinigung der .gitignore**:
   Ermoeglichung des Trackings gemeinsamer Dokumente, damit beide Seiten vollen Zugriff auf alle Berichte haben.
