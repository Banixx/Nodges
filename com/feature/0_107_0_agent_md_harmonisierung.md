# Feature: Harmonisierung der Agenten-Instruktionen (AgentMd)

Stand: 2026-10-07 · Harness: conT / piCon / dopi · Version: 0.107.0

## Ziel

Saemtliche Instruktions-, Regel- und Rollendateien (`AGENTS.md`, `GEMINI.md`, rollenspezifische Vorgaben) ueber alle drei Harnesses (`conT`, `piCon`, `dopi`) hinweg konsolidieren, Redundanzen eliminieren und sicherstellen, dass jedes Harness exakt die fuer seine Umgebung relevanten und bindenden Instruktionen ohne stoerende Quer-Effekte erhaelt.

## Ausgangslage & Befunde (Session-Analyse)

1. **conT & dopi (Antigravity Host):**
   - Beide haben sowohl `W:/` als auch `C:/Users/ich/Desktop/code/_projects/Nodges_Pi` im Workspace.
   - Antigravity laedt daher fuer beide Sessions sowohl `W:/AGENTS.md` als auch `Nodges_Pi/AGENTS.md`.
   - conT liest dadurch faelschlicherweise dopis Rollenregel ("Keine Eingriffe in Applikationscode").
   - Globale Regeln (Deutsch, Pfade, Fragemodus, keine Emojis) sind in `C:/Users/ich/.gemini/GEMINI.md` sowie in beiden `AGENTS.md` doppelt bzw. dreifach vorhanden.

2. **piCon (Pi-Agent im Linux-Container):**
   - Greift auf `/workspace` (`W:/`) zu und liest `W:/AGENTS.md`.
   - Sieht `C:/Users/ich/.gemini/GEMINI.md` und `Nodges_Pi/AGENTS.md` nicht.
   - Status und Inhalt von `/home/.pi/agent/` im Container muessen via Docker (`docker exec`) verifiziert werden, um zu klaeren, was piCon dort lokal laedt oder erbt.

## Arbeitspakete & Schritte

- [x] **Schritt 1: Bestandsaufnahme piCon (Container-Perspektive)** — erledigt durch dopi, 2026-10-07
  - Pruefung des Pi-Agent-Verzeichnisses `/home/.pi/agent/` im Container `pi-harness` per `docker exec`.
  - Feststellen, welche AGENTS.md, SYSTEM.md oder Konfigurationsdateien piCon beim Start tatsaechlich liest.
  - Ergebnis: piCon laedt `/home/.pi/agent/AGENTS.md` (562 Byte, global) und `/workspace/AGENTS.md` (= `W:/AGENTS.md`). Keine SYSTEM.md. `/home/.pi/user.md` wird nur per Verweis referenziert, nicht automatisch geladen und enthaelt veraltete Aussagen. Siehe [agenten_harnesses.mmd](AgentMd/agenten_harnesses.mmd).
- [ ] **Schritt 2: Soll-Konzept & Domaenenschnitt fuer die Instruktionen**
  - Schlanke Single Source of Truth in `W:/AGENTS.md` definieren (Kernregeln, Rollen, SSoT, Git-Workflow kurz, Leseauftrag `com/`).
  - Bereinigung von `C:/Users/ich/Desktop/code/_projects/Nodges_Pi/AGENTS.md`: Entkopplung oder Reduktion, damit conT nicht durch dopi-Einschraenkungen blockiert wird.
  - Harmonisierung der globalen Verhaltensregeln (Sprache, Pfade, Fragemodus, Emojis).
- [ ] **Schritt 3: Review & Abstimmung**
  - Rueckmeldung und Vorlage fuer den Benutzer zur Freigabe.
- [ ] **Schritt 4: Umsetzung & Verifikation**
  - Anpassung der betroffenen Dateien auf `W:/` und im Host-Verzeichnis `Nodges_Pi`.
  - Verifikation der Sichtbarkeit fuer alle drei Harnesses.

## Offene Fragen & Abstimmungen

- Siehe [W:/com/fragen_an_user.md](file:///W:/com/fragen_an_user.md) fuer offene Beschluesse.
- Entschieden 2026-10-08: `/home/.pi/user.md` entfaellt und ist geloescht; Verweis in `/home/.pi/agent/AGENTS.md` entfernt. Die Aussage in Schritt 1 (Ergebnis) zu `user.md` ist damit historisch.
