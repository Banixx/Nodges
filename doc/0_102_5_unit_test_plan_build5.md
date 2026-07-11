# Unit-Test und Isolierungs-Plan für Build 5 Pipeline

Das Ziel ist es, die Zod-Schemas (Typ-Entkopplung), die LLM-Pipeline sowie den ErrorHandler im Nodges Projekt mittels isolierten Unit-Tests vollständig abzudecken. Dadurch wird sichergestellt, dass fehlerhafte LLM-Antworten die Anwendung nicht einfrieren und das neue, flexiblere Datenmodell ohne strenge Typ-Dominanz korrekt validiert wird.

## Proposed Changes

### Tests
- **`src/tests/types.test.ts`** [NEW]
  - Isolierte Tests für die Zod-Schemas (`EntityDataSchema`, `RelationshipDataSchema`, `GraphDataSchema`).
  - Überprüfung der Build-5-Anforderungen (z.B. dass `type` optional ist).
  - Validierung von typischen LLM-Antwort-Strukturen und Fehlerfällen (fehlende Pflichtfelder, invalide Formate).
- **`src/tests/LLMService.test.ts`** [NEW]
  - Tests für die Daten-Generierung und Pipeline-Schritte.
  - Mocking der API-Aufrufe, um Netzwerkfehler und LLM-Fehlantworten zu simulieren.
  - Überprüfung, ob Validierungsfehler der Zod-Schemas im Catch-Block korrekt an den `ErrorHandler` delegiert werden (Integrationstest-Anteil).
- **`src/tests/ErrorHandler.test.ts`** [NEW]
  - Tests der Fehler-Verarbeitung und Weitergabe.
  - Mocking von `NotificationService`, um zu verifizieren, dass die korrekte UI-Toast-Notification ausgelöst wird.
  - Sicherstellung, dass `wrapAsync` und `wrapSync` Methoden Fehler fangen und Fallback-Werte liefern, ohne die UI stillschweigend zu blockieren.

### Source Code Anpassungen
Falls während des Testens Schwachstellen im ErrorHandler (z.B. fehlen einer dedizierten ErrorCategory wie `llm_pipeline` oder `network`) oder der LLMService-Klasse auffallen, werden diese geringfügig optimiert, um Robustheit zu gewährleisten.

## Verification Plan

### Automated Tests
1. Ausführen von `npm test` um alle existierenden und neuen Tests laufen zu lassen.
2. Ausführen von `npm run test:coverage` um sicherzustellen, dass die betroffenen Module eine hohe Test-Abdeckung aufweisen.

### Manual Verification
- Simulation einer fehlerhaften API-Response in der GUI.
- Verifizieren, ob die Toast-Notification ("LLM Fehler...") erscheint und die GUI weiterhin interaktiv bleibt.
