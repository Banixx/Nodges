# Plan: UI-Bereinigung und "Relation Set"-Verwaltung im CreatePanel

> Version: 0.102.15 -- Stand: 28. Juli 2026

---

## 1. Uebersicht der geplanten UI-Anpassungen

Im `CreatePanel` werden folgende Bereinigungen und Erweiterungen vorgenommen:

1. **Entfernen des Titels "CREATE NEW":**
   In `index.html` wird das Element `<h4 class="section-header">Create New</h4>` entfernt.

2. **Entfernen der Nummerierung "1.":**
   In `CreatePanel.ts` wird die Beschriftung `1. LLM API Key & Anbieter (BYOK)` in `LLM API Key & Anbieter (BYOK)` geaendert.

3. **Kollabieren von "Netzwerk per KI generieren":**
   Der Bereich `Netzwerk per KI generieren` erhaelt einen Toggle-Pfeil (`▾` / `▴`) und wird kollabierbar gestaltet.

4. **Neuer Titel & Bereich "Relation Set":**
   Ein eigener kollabierbarer Bereich `Relation Set` wird hinzugefuegt:
   - Liste von erlaubten Beziehungen mit Checkboxen (an/aus).
   - "Laden" (Open) und "Speichern" (Save) Funktionalitaet aus dem Ordner `public/relationsets/`.
   - Umschalter fuer "Alle auswaehlen" / "Alle abwaehlen".

---

## 2. Erstellung der 3 Beispiellisten in `public/relationsets`

Folgende 3 JSON-Dateien werden im Ordner `public/relationsets/` angelegt:

1. **`schweizer_politik_relations.json`:**
   Enthaelt 12 speziell auf das Schweizer Politiksystem abgestimmte Beziehungen (`MITGLIED_VON`, `WAEHLT`, `LEITET`, `VERTRITT`, `ERMAECHTIGT`, `SCHLAEGT_VOR`, `GEHOERT_ZU`, `KONTROLLIERT`, `NACHBAR_VON`, `BEEINFLUSST`, `IST`, `UNTERSTUETZT`).

2. **`standard_generic_relations.json`:**
   Enthaelt allgemeine Grundbeziehungen fuer universelle Wissensgraphen (`IS_A`, `PART_OF`, `RELATED_TO`, `USES`, `CREATES`, `DEPENDS_ON`, `LOCATED_IN`).

3. **`organisation_und_struktur_relations.json`:**
   Enthaelt Beziehungen fuer Organigramme und Unternehmensstrukturen (`MANAGES`, `REPORTS_TO`, `WORKS_IN`, `COLLABORATES_WITH`, `OWNS`, `FUNDED_BY`).
