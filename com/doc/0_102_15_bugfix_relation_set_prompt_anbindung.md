# Bugfix: Anbindung des Relation Sets an die KI-Generierung & Erlaeuterung

> Version: 0.102.15 -- Stand: 29. Juli 2026

---

## 1. Ursache fuer die 65 Kantenbezeichnungen auf dem Screenshot

Auf Ihrem Screenshot war im Edges-Tab zu sehen, dass `relation` weiterhin `104 • 65 Werte (Text)` anzeigte. Dies hat zwei Gruende:

1. **Datei-Auswahl:** Auf dem Screenshot war die **unbereinigte Original-Datei** `B12_Graph_01_28.json` geladen (welche 104 Kanten und 65 Roh-Strings enthaelt).
   - *Loesung:* Um die auf 5 saubere Kategorien reduzierten Kanten zu sehen, laden Sie bitte z.B. [B12_Graph_01_28_tuned2.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/data/b12/B12_Graph_01_28_tuned2.json) oder [B12_Graph_01_28_tuned5.json](file:///c:/Users/ich/Desktop/code/_projects/Nodges/public/data/b12/B12_Graph_01_28_tuned5.json).

2. **Fehlende Prompt-Einspeisung bei Neu-Generierung:** Das neue "Relation Set"-Panel zeigte zwar die Checkboxen im UI an, aber die Methode `getActiveRelationLabels()` wurde in `CreatePanel.ts` noch nicht in den Prompt der Generierungsfunktion `handleGenerate()` eingespeist.

---

## 2. Durchgefuehrter Fix

In `CreatePanel.ts` wurde die Prompt-Vorbereitung erweitert:
```typescript
const activeRelLabels = this.getActiveRelationLabels();
if (activeRelLabels.length > 0) {
    prompt += `\n\nWICHTIG: Verwende fuer das Feld 'relation' (Kanten/Beziehungen) AUSSCHLIESSLICH einen der folgenden erlaubten Begriffe aus dem aktiven Relation Set: [${activeRelLabels.join(', ')}]. Freie Erfindungen oder kommagetrennte Aufzaehlungen sind strikt verboten.`;
}
```

---

## 3. Auswirkung

- Wenn Sie nun im CreatePanel eine neue KI-Generierung ausfuehren, werden **nur noch die angehakten Beziehungstypen** aus dem aktiv gewaehlten Relation Set an das LLM gesendet.
- Das LLM waehlt fuer jede Kante exakt aus diesen erlaubten Begriffen aus.
