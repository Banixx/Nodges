# Ideensammlung

Ungepruefte Einfaelle. Keine Verpflichtung, keine Reihenfolge. Wird erst durch eine Entscheidung des Benutzers
(oder einen Eintrag in `plan/`) verbindlich.

- **Automatischer `00_index` in `doc/`:** Ein Skript, das beim Commit alle Dateien mit Versionspraefix in eine Indexdatei schreibt. Wuerde das manuelle Suchen im 273-Dateien-Archiv ersparen.
- **`plan/`-Status im Dateinamen:** Laufende Plaene als `plan/laeuft_0_106_3_x.md` und abgeschlossene als `plan/fertig_...`, damit der Ordner nicht aufgeraeumt werden muss. Alternative: Unterordner `archiv/`.
- **Health-Check-Skript:** Eine Datei `scripts/healthcheck.sh`, die alle drei Pruefungen (`curl localhost:8000/health`, `curl localhost:5173/lightrag-api/health`, Vite auf 5173) in einem Durchlauf ausgibt.
- **Tag bei jedem Meilenstein nicht manuell:** `sgc` koennte optional fragen, ob zusaetzlich ein Tag gesetzt werden soll, statt es spaeter separat zu machen.
- Idee aus `com/doc/idee_nodges.md` bei Gelegenheit gegen die aktuelle Vision in `vision_104.md` abgleichen — die dortigen Saetze sind teils aelter.

*(Aeltere Ideen finden sich in `com/doc/idee_nodges.md` und `com/doc/14_verbesserungsvorschlaege_nodges_V4.md`.)*
