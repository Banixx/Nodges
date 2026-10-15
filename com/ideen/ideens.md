# Aggregierte Ideensammlung (ideens.md)

> **Status:** Aggregierter Stand aus `ideen.md` und neuen Notizen aus Google Drive (`Mdt`).  
> **Aktualisiert:** 2026-10-11  
> **Hinweis:** Ungepruefte Einfaelle, keine Verpflichtung. Dient der Abstimmung mit dem Benutzer vor Uebernahme in `W:/com/ideen.md` bzw. `entscheidungen.md`.

---

## 1. Neue Ideen aus Google Drive (Mdt-Notizen)

### 1.1 Ueberblendung mehrerer Systeme & Farb-Fokussierung
- **Konzept:** Wenn Systeme verschiedener Benutzer oder Quellen uebereinandergelegt werden, soll entweder komplett auf Schwarz-Weiss / Grautoene umgeschaltet werden oder eine einzelne Ebene erhaelt die exklusive Farbvisualisierung fuer den Ueberblendungsvergleich, waehrend der Rest abgedunkelt oder entfaerbt wird.
- **Quelle:** `W:/com/ideen/ein-gedanke-fuer-nodges.md`

### 1.2 Brainstem: Biologisch inspirierte Neuro-Architektur
- **Konzept:** Lebenslanges Lernen ueber Neuro-Modulatoren, Schlafzyklen (Slow-Wave Sleep) und SQLite-Backend. Analyse grammatischer und semantischer Sprachstrukturen statt reiner Faktenspeicherung.
- **Quelle:** `W:/com/ideen/README.md`

### 1.3 Lokale Backlinks, Tags & Suchmuster
- **Konzept:** Lokale Wikilink-Graphbeziehungen (`[[Notiztitel]]`) ohne Cloud/Server und Tagging-System.
- **Quelle:** `W:/com/ideen/Tags, Suche und Backlinks.md`

---

## 2. Bisherige Ideensammlung (Basis: `ideen.md`)

### 2.1 Konzeptionelle Ideen (Luhmann-Ansatz)
- **Beziehungsbasierte Raumordnung:** 3D-Positionierung primaer ueber Beziehungsdichte und Kantenstruktur (Force-Directed Graph).
- **Primat der Kanten:** Eigenstaendige Rollen und Zugehoerigkeiten als explizite Kanten modellieren statt als Attribut.
- **Zukuenftig (Property-to-Edge Promotion):** Automatische Inferenz von Kanten und Ankerknoten aus unvollstaendigen Quelldaten.

### 2.2 Technische Verbesserungen
- **A — Detailverbesserungen:** Debug-Logging bereinigen, toten Code entfernen, State typisieren, duplizierte Datenhaltung aufloesen, einheitliche Positions-API, Versionsfelder klaeren, Lint/Format, CI-Test-Job, Reduzierung von `any`, API-Key-Sicherheit.
- **B — Architektur-Verbesserungen:** `App.ts` entschlacken, Dependency Injection, Interfaces nutzen, duales Tracking konsolidieren, UI-Komponenten zerlegen, UI von `window.app` entkoppeln, Store-System, Persistenz abstrahieren, Render-Pipeline kapseln, Plugin-basiertes Layout, Transitions-Management, Three.js Mock-Tests.

### 2.3 Ideen zur Arbeitsweise & Harness
- Automatischer Index fuer `doc/`.
- Status im Plan-Dateinamen (`laeuft_...`, `fertig_...`).
- Zentrales Healthcheck-Skript (`scripts/healthcheck.sh`).
- Tag-Abfrage bei Meilensteinen.
