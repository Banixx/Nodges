# Analyse und Umsetzungsplan: CreatePanel Generierungs-Buttons

## 1. Aktueller Zustand

Im `CreatePanel` (Datei `c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/CreatePanel.ts`) stehen zwei Buttons nebeneinander zur Verfuegung:

- **Links**: `Neu Generieren` (`regenerateBtn`)
- **Rechts**: `Modifizieren` (`modifyBtn`)

### Lade-Verhalten (`setLoading(true)`):
- **Neu Generieren**: Waehrend des Ladevorgangs wird der Text auf `Verarbeite...` gesetzt und der Button deaktiviert.
- **Modifizieren**: Waehrend des Ladevorgangs bleibt der Button deaktiviert und sein Text wird geleert (`""`), sodass dort kein Text angezeigt wird.
- **Nach Abschluss (`setLoading(false)`)**: Die Zustaende werden wieder auf `Neu Generieren` und `Modifizieren` zurueckgesetzt.

---

## 2. Daten-Lade-Logik

- **Neu Generieren**: Ersetzt den bestehenden Graphen vollstaendig durch die neu generierten Daten (`append = false`).
- **Modifizieren**: Fuegt die neu generierten Elemente an den bestehenden Graphen an bzw. fuehrt eine funktionale Modifikation durch (`append = true`).
