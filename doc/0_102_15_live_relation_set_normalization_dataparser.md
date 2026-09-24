# Live Relation Set Normalisierung in DataParser & Erlaeuterung

> Version: 0.102.15 -- Stand: 29. Juli 2026

---

## 1. Warum auf dem letzten Screenshot noch 65 Werte zu sehen waren

Wenn Sie eine JSON-Datei (wie `B12_Graph_01_28.json` oder `B12_02_Antwort_01_28.json`) in Nodges ueber die Dateiauswahl/Preset laden, liest `DataParser.ts` die Kanten direkt aus der Datei. Bisher wurden die Kanten beim Laden nicht automatisch an das aktive Relation Set angepasst, weshalb in der UI weiterhin alle 65 rohen Kanten-Strings aus der jeweiligen Datei angezeigt wurden.

---

## 2. Der finale Fix: Automatische Live-Normalisierung in `DataParser.ts`

1. **Einspeisung beim Laden jeder Datei:**
   `DataParser.parse()` prueft jetzt beim Laden **jeder beliebigen JSON-Datei** die aktiven Haekchen des Relation Sets im CreatePanel.
   Jede Kante (z.B. `enables,grants`, `collaborate,convene,legislate`, `affiliation`, `member of`) wird sofort und automatisch auf den am besten passenden erlaubten Begriff aus Ihrem aktiven Relation Set gemappt (`ermächtigt`, `schlägt vor`, `gehört zu`, `mitglied von`).
2. **Reaktiver Live-Update beim Umschalten:**
   Sobald Sie im Relation Set Panel ein anderes Preset waehlen oder ein Haekchen aktivieren/deaktivieren, wird der aktuell geladene Graph sofort in Echtzeit neu durch `DataParser` normalisiert und das Mapping-Panel aktualisiert.

---

## 3. Wie Sie das Ergebnis direkt ueberpruefen

1. Laden Sie eine beliebige JSON-Datei in Nodges (z.B. `B12_Graph_01_28.json`).
2. Oeffnen Sie das `Relation Set`-Panel im Erstellen-Tab.
3. Wählen Sie das Preset **Schweizer Politik & Governance** oder schalten Sie Häkchen an/aus.
4. Schauen Sie im Mapping-Panel unter **Edges -> relation**: Aus den 65 Roh-Strings werden sofort exakt und ausschliesslich Ihre aktivierten Beziehungskategorien!
