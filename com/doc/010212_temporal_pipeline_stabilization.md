# Stabilisierung der temporalen Visualisierungs-Pipeline

Dieses Dokument beschreibt die Loesung fuer die Probleme bei der temporalen Wiedergabe und der Daten-Normalisierung fuer temporale Objekte in Nodges (Build 10).

## 1. Problemstellung & Diagnose

Bei der Wiedergabe von temporalen Datensaetzen (wie den von Grok generierten roemischen Geschichtsdaten oder dem Korallenriff-Datensatz) traten zwei Hauptprobleme auf:

1. **Wiedergabe-Stopp ("Play tut nichts"):** 
   In `App.ts` wurde die zeitliche Veraenderung pro Frame starr mit `deltaTime * speed * 1000` berechnet. Fuer Unix-Zeitstempel (Millisekunden) ist dies sinnvoll, aber fuer Datensaetze mit Jahren als Zeiteinheit (z.B. -753 bis 476, Bereich von ca. 1200 Jahren, oder Korallenriff 1950 bis 1990, Bereich von 40 Jahren) fuehrte dies dazu, dass die gesamte Timeline in wenigen Frames (weniger als 100 ms) komplett bis zum Ende durchgespielt und gestoppt wurde. Fuer den User sah es so aus, als ob das Druecken auf Play keinerlei Effekt haette.
   
2. **Schema-Inkompatibilitaet (Fehlendes `temporal` Objekt):**
   Grok-Generierungen nutzten oft flache temporale Felder wie `startYear` und `endYear` direkt auf den Entitaeten und Beziehungen, anstatt sie in das verschachtelte `temporal`-Objekt (`validFrom`, `validTo`, `history`) zu kapseln. Da das System strikt das `temporal`-Objekt zur Steuerung der Sichtbarkeit und Interpolation erwartet, wurden diese Entitaeten als statisch behandelt und nicht auf der Zeitachse animiert.

---

## 2. Implementierte Loesungen

### A. Dynamische Zeit-Schritt-Skalierung
Um eine konsistente Wiedergabedauer fuer alle Zeiteinheiten (Unix-Millisekunden, Jahre, Sekunden) zu garantieren, wurde der Zeitschritt in `App.ts` dynamisch an die Spanne (`maxTimestamp - minTimestamp`) des geladenen Graphen angepasst:
- Der State wurde um `minTimestamp` und `maxTimestamp` erweitert.
- Diese Werte werden beim Einlesen der Daten im `TimePlayerUI` ermittelt und im globalen State synchronisiert.
- In `App.ts` wird die Schrittweite bei Play so berechnet, dass der Durchlauf der gesamten Timeline bei 1.0-facher Geschwindigkeit genau **15 Sekunden** dauert, unabhaengig von den verwendeten Zeiteinheiten.

```typescript
// Auszug aus App.ts
let step = deltaTime * speed * 1000; // Fallback
if (state.minTimestamp !== null && state.maxTimestamp !== null) {
    const range = state.maxTimestamp - state.minTimestamp;
    if (range > 0) {
        const baseDurationSeconds = 15;
        step = (range / baseDurationSeconds) * deltaTime * speed;
    }
}
const newTime = state.currentTimestamp + step;
```

### B. Automatisierte Temporal-Normalisierung in `DataParser`
Um Datensaetze mit flachen temporalen Eigenschaften vollstaendig kompatibel zu machen, wurde in `DataParser.ts` (vor der Zod-Validierung) ein Normalisierungs-Schritt integriert:
- Es wird nach flachen Feldern gesucht (`startYear`, `endYear`, `startTime`, `endTime`, `validFrom`, `validTo`, `start`, `end`).
- Falls diese vorhanden sind, aber kein `temporal`-Objekt existiert, synthetisiert der Parser automatisch ein standardkonformes `temporal`-Objekt.
- Der Parser ignoriert `start`/`end` bei Beziehungen, falls diese als Knoten-Referenzen (IDs) dienen.

```typescript
// Auszug aus DataParser.ts
if (validFrom !== null || validTo !== null) {
    item.temporal = {
        validFrom: validFrom,
        validTo: validTo,
        history: []
    };
}
```

### C. Type-Safety Updates
- Das `IEdgeManager` Interface in `src/core/interfaces.ts` deklariert nun optional `updateTemporalState(timestamp: number | null): void`.
- In `App.ts` wurde der `as any` Cast beim Aufruf von `updateTemporalState` auf `edgeObjectsManager` entfernt, um die Typsicherheit zu gewaehrleisten.

---

## 3. Validierung & Testing

- Ein neuer Unit-Test in `src/tests/DataParser.test.ts` wurde hinzugefuegt, um die Synthese flacher temporaler Felder in das verschachtelte `temporal`-Objekt abzusichern.
- Die Unit-Tests wurden erfolgreich ausgefuehrt (`DataParser.test.ts` verzeichnet 17 bestandene Tests).
