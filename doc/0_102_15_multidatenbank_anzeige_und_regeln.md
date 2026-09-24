# Erweiterung: Status-Anzeige der aktiven Datenbank & Listenansicht

## 1. Anzeige der geladenen Datenbank
Im Dateipanel unter **Datenbank-Verwaltung** wird nun eine prominente Status-Karte angezeigt:
- **Aktuell geladene Datenbank:** Zeigt den Namen der aktiven Datenbank (z.B. `Hauptdatenbank (Default)` oder `Projekt 2`).
- **Typ-Badge:** Kennzeichnet sofort, ob es sich um eine `JSON`-Graphdatenbank oder eine `LightRAG`-Wissensdatenbank handelt.

## 2. Listenansicht der verfuegbaren Datenbanken
Direkt unter den Hauptaktionen wird die Liste **Verfuegbare Datenbanken** angezeigt:
- Listet alle auf der Festplatte verfuegbaren Datenbank-Dateien aus `public/data/databases/` sowie alle LightRAG-Datenbanken aus `rag_storage/databases/`.
- Pro Datenbank-Eintrag:
  - Name und Pfad auf der Festplatte.
  - Button `Laden` zum Aktivieren einer anderen Datenbank (falls nicht aktiv).
  - Badge `Aktiv` fuer die derzeit geladene Datenbank.

## 3. Angepasste Verhaltensregeln
- **Keine automatische Konvertierung aller JSON-Dateien:** Allgemeine Rohdateien aus `public/data/b10/`, `public/data/b12/` etc. werden nicht als Datenbanken gelistet. Nur explizite Datenbanken in `public/data/databases/` und LightRAG-Ordner werden erfasst.
- **Kein automatisches Speichern beim Datenbankwechsel:** Beim Umschalten wird die gewaehlte Datenbank ohne automatisches Ueberschreiben der vorherigen geladen (Speichern erfolgt ausschliesslich bei Klick auf `DB Speichern`).
