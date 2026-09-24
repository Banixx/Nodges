# Plan: Anpassung der Namensgebung beim Generieren

## Ziel
Entfernen des Wortes `Step` und Ersetzen des bisherigen ISO-Timestamps durch eine fortlaufende zweistellige Nummer sowie den zweistelligen Tag des Monats (`<fortlaufendeNummer>_<tagDesMonats>`).

## Betroffene Dateien
- [CreatePanel.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/ui/CreatePanel.ts)

## Beispielszenario
- Datum: 23. des Monats
- Erste Generierung in der Session (`counter = 01`)
- `B12_Step1_Rohdaten_${timestamp}.txt` -> `B12_01_Rohdaten_01_23.txt`
- `B12_Step2_Antwort_${timestamp}.json` -> `B12_02_Antwort_01_23.json`
- `B12_Graph_${timestamp}.json` -> `B12_Graph_01_23.json`
