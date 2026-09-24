# Konzept: Numerische Normalisierung von Textattributen fuer numerische Visualisierungen (Wertebereich 0 bis 100)

## Problembeschreibung
Mehrere Visualisierungseigenschaften im Mapping-Panel (wie **Groesse**, **Position X/Y/Z**, **Leuchten**, **Anziehungskraft**, **Abstossungskraft**, **Traegheit**, **Dicke** etc.) benoetigen zwingend numerische Werte fuer die Darstellung.

Wird aktuell ein Textattribut (z. B. `entity_type`, `name`, `source_id`) auf eine solche numerische Eigenschaft gemappt, scheitert die direkte Umwandlung (`Number("Person")` -> `NaN`). Die Engine faellt auf `0` zurueck, wodurch alle Objekte denselben Wert `0` (z. B. minimale Groesse, Position 0 oder kein Leuchten) erhalten.

## Loesungskonzept

### 1. Universelle Text-zu-Zahl Umwandlung (0 bis 100)
Jedes Textattribut wird beim Mapping auf eine numerische Visualisierungseigenschaft in einen skalierbaren Zahlenwert im festen Bereich von **0 bis 100** umgewandelt:

- **Fuer kategoriale Textattribute (z. B. `entity_type` mit Kategorien "Person", "Organisation", "Ort")**:
  - Alle eindeutigen Kategorien im Datensatz werden sortiert.
  - Den Kategorien werden gleichmaessig verteilte Werte zwischen `0` und `100` zugewiesen (z. B. 3 Kategorien: `0`, `50`, `100`).

- **Fuer individuelle Textattribute (z. B. eindeutige Namen/Pfade)**:
  - Ueber ein deterministisches Hashing-Verfahren wird jedem Textstring ein fester Wert im Bereich `0` bis `100` zugeordnet.

### 2. Weiternutzung fuer alle numerischen Visualisierungseigenschaften
Sobald ein Textattribut in den Bereich `0 bis 100` konvertiert wurde, kann dieser Wert fuer jede beliebige numerische Eigenschaft im System verwendet werden:
- **Groesse**: Skalierung von `0..100` auf `MIN_SIZE .. MAX_SIZE`.
- **Position X / Y / Z**: Skalierung von `0..100` auf den gewuenschten Achsenbereich.
- **Leuchten / Glow**: Skalierung von `0..100` auf `0.0 .. 1.0`.
- **Anziehungskraefte / Traegheit**: Skalierung von `0..100` auf die physikalischen Parameter.
- **Dicke / Opazitaet / Kruemmung (Kanten)**: Skalierung von `0..100` auf die jeweiligen Kantenparameter.
