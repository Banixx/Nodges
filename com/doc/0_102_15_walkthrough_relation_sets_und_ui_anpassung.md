# Walkthrough: UI-Bereinigung und "Relation Set"-Modul im CreatePanel

> Version: 0.102.15 -- Stand: 28. Juli 2026

---

## 1. Durchgefuehrte Aenderungen

### UI-Bereinigungen
- **Titel `Create New` entfernt:** Das ueberfluessige Header-Element `<h4 class="section-header">Create New</h4>` im Create-Tab (`index.html`) wurde geloescht.
- **Nummerierung `1.` entfernt:** In `CreatePanel.ts` wurde `1. LLM API Key & Anbieter (BYOK)` zu `LLM API Key & Anbieter (BYOK)` bereinigt.
- **Kollaps-Funktion fuer `Netzwerk per KI generieren`:** Die Sektion besitzt nun einen visuellen Pfeil (`▾` / `▴`) und laesst sich per Klick auf die Kopfzeile auf- und zuklappen.

---

### Relation Set Modul
- **Neuer Bereich `Relation Set`:** Eine eigene kollabierbare Sektion `Relation Set` wurde im `CreatePanel` ergaenzt.
- **Laden & Speichern (Open & Save):**
  - Ein Dropdown-Menue bietet schnellen Zugriff auf vordefinierte Beziehungs-Sets.
  - Mit dem Button **`Laden`** wird das ausgewaehlte JSON-Set geladen.
  - Mit dem Button **`Speichern`** kann die aktuelle Beziehungsauswahl als JSON-Datei heruntergeladen werden.
- **Interaktive Liste mit Checkboxen:**
  - Jede Beziehung laesst sich per Checkbox ein- oder ausschalten (an/aus).
  - Es stehen Schnellwahltasten (**`Alle an`** / **`Alle aus`**) sowie ein Eingabefeld mit **`+ Hinzufuegen`** fuer benutzerdefinierte Beziehungstypen zur Verfuegung.
- **Integration in die KI-Generierung:**
  - Ueber die Methode `getActiveRelationLabels()` wird die Liste der aktiven Beziehungstypen automatisch als Extraktions-Regel an die LLM-Generierung uebergeben.

---

### Erstellte Beispiellisten unter `public/relationsets/`

1. [schweizer_politik_relations.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/relationsets/schweizer_politik_relations.json):
   Bezugs-Set mit 12 speziell auf das Schweizer Politiksystem abgestimmten Beziehungstypen (`MITGLIED_VON`, `WAEHLT`, `LEITET`, `VERTRITT`, `ERMAECHTIGT`, `SCHLAEGT_VOR`, `GEHOERT_ZU`, `KONTROLLIERT`, `NACHBAR_VON`, `BEEINFLUSST`, `IST`, `UNTERSTUETZT`).
2. [standard_generic_relations.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/relationsets/standard_generic_relations.json):
   Universelles Set fuer allgemeine Wissensgraphen (`IS_A`, `PART_OF`, `RELATED_TO`, `USES`, `CREATES`, `DEPENDS_ON`, `LOCATED_IN`, `CAUSES`).
3. [organisation_und_struktur_relations.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/relationsets/organisation_und_struktur_relations.json):
   Bezugs-Set fuer Organigramme und Firmenstrukturen (`MANAGES`, `REPORTS_TO`, `WORKS_IN`, `COLLABORATES_WITH`, `OWNS`, `FUNDED_BY`, `PARTNER_OF`).
