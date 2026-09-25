# Bereinigungsbericht: Abkopplung von winAnt und Bereinigung von bericht.md

**Datum:** 2026-09-25  
**Projekt:** Nodges  
**Version:** 0.106.5  
**Autor:** conT (Antigravity auf Netzlaufwerk W:/)

---

## 1. Anlass und Zielsetzung

Auf Anweisung des Benutzers (*„bereinige bericht.md winnat ist definitiv vegangenheit"*) wurde die zentrale Dokumentations- und Dialogdatei [W:/com/bericht.md](file:///W:/com/bericht.md) grundlegend ueberarbeitet und bereinigt.

Der fruehere Windows-Host-Workspace **winAnt** (`C:/Users/ich/Desktop/code/_projects/Nodges`) und dessen Zwischenmodelle (wie Git-Synchronisation ueber den Branch `pi`, manueller `sgc`/`sgp`-Workflow, Dual-Harness-Konzept) waren in Teilen der Datei noch im Praesens formuliert oder als gleichberechtigte Gegenwartsstrukturen dargestellt. Dies fuehrte zu Unklarheiten hinsichtlich der verbindlichen Systemarchitektur.

---

## 2. Durchgefuehrte Bereinigungen in W:/com/bericht.md

### 2.1 Dokumentenkopf und Autorenangabe
- **Aktive Parteien:** [W:/com/bericht.md](file:///W:/com/bericht.md) weist nun eingangs ausschliesslich **piCon** (Docker-Container `/workspace`) und **conT** (Antigravity ueber Netzlaufwerk `W:/`) als aktive Partner aus.
- **Status winAnt:** winAnt wurde explizit als **definitiv Vergangenheit und abgekoppelt** deklariert (Beschluss vom 2026-09-24).
- **Single Source of Truth:** Klarstellung, dass ein einziger physischer Arbeitsort auf WSL2 ext4 (`/home/unixusername/nodges`) existiert und kein Git-Sync zwischen piCon und conT stattfindet.

### 2.2 Teil A — Historischer Setup-Befund
- **Historische Einordnung:** Die fruehere Problemanalyse (drei Checkouts A, B, Container) wurde als historischer Vorstufenbefund gekennzeichnet.
- **Checkout A:** Das alte Verzeichnis von winAnt wurde als abgekoppelt markiert; Checkout B ist die alleinige SSoT.
- **Beschlussfassung:** Zielbildvorschlaege wurden mit den tatsaechlich umgesetzten Beschluessen (Variante B, Root-`.gitattributes`, Freigabe von `doc/`, `main` als alleiniger Branch) synchronisiert.

### 2.3 Teil B — Historisches Dialogprotokoll
- **Statusbanner:** Deutlicher Hinweis, dass die Diskussionen um den Branch `pi` und das Dual-Harness-Modell historisch sind.
- **Teilnehmerliste:** `winAnt` ist als abgekoppelt durchgestrichen; `conT` ist als aktiver Nachfolger auf `W:/` gefuehrt.
- **Massnahmenplan (Abschnitt 5):** Dual-Harness-Festlegung als obsolet und fruehere Workflows (`sgc`/`sgp`) als abgeloest markiert.
- **Abschnitt 6.3 (Frueherer Dual-Harness-Workflow):** Explizit als veraltet und nicht mehr gueltig gekennzeichnet.

### 2.4 Teil C, D und E — Konsolidierung, Branch-Wechsel und UNC-Absturz
- **Teil C:** Rueckfragen von winAnt als historisch beantwortet dokumentiert. Die dauerhafte CRLF-Regel fuer Windows-Skripte bleibt hervorgehoben.
- **Teil D:** Tag-Erstellung durch conT/piCon aktualisiert; `conT` ueber Netzlaufwerk `W:/` sauber verankert.
- **Teil E:** Das Scheitern des direkten UNC-Pfads in winAnt und der daraus resultierende Durchbruch von conT (ueber Netzlaufwerk `W:/`) wurden praezisiert. Die damaligen offenen Fragen wurden mit dem Verweis auf den Beschluss in Teil F als aufgeloest dokumentiert.

### 2.5 Teil F bis I — Der aktuelle operative Stand
- **Teil F:** Bestaetigung der vollstaendigen Abkopplung von winAnt und Loeschung des Branches `pi`.
- **Teil G & H:** Fortfuehrung der Dokumentation fuer Version 0.106.3 (`Nodges_Pi/doc/`) und Version 0.106.4 (Testinfrastruktur und Biome).
- **Teil I (Neu ergaenzt):** Dokumentation des aktuellen Git-Workflow-Standards (`tools/nodges-git.sh` mit `status`, `save`, `release`, `hooks`) und der Pre-Push-Schutzmechanismen (`git-hooks/pre-push`).

---

## 3. Begleitende Pruefung in W:/com/setup.md

In [W:/com/setup.md](file:///W:/com/setup.md) wurde in Abschnitt 8 eine veraltete offene Frage (*„Soll winAnt ebenfalls auf W:\ umgestellt werden..."*) entfernt, da der Beschluss zur Abkopplung bereits feststand.

---

## 4. Fazit und aktueller Systemzustand

Die Dokumentation in `com/` spiegelt nun konsistent und widerspruchsfrei die Realitaet wider:
1. **Single Source of Truth (ext4):** `/home/unixusername/nodges`
2. **Aktive Harnesses:** `piCon` (Container `/workspace`) und `conT` (Windows Host `W:/`)
3. **Alleiniger Branch:** `main`
4. **Git-Workflow:** `tools/nodges-git.sh` (`save` = lokal sichern, `release` = Minor-Tag & Push nach GitHub)
5. **winAnt:** Vollstaendig abgekoppelt, definitiv Vergangenheit.
