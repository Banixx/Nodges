# Bug-Fix Dokumentation: StateManager ServiceContainer Initialisierungsfehler

**Projekt-Version**: 0.102.14  
**Datum**: 25.07.2026  

## Fehlerbeschreibung

Beim Starten bzw. Neustarten von Nodges trat folgender Initialisierungsfehler auf:
`[Nodges ERROR] Initialisierungsfehler: Nodges konnte nicht vollstaendig initialisiert werden.`
`[Nodges Details] Error: [ServiceContainer] Service not found: StateManager`

Der Fehler wurde beim Aufruf von `initManagers()` in `App.ts` ausgeloest, als `BatchOperations` versuchte, den Service `'StateManager'` aus dem `ServiceContainer` abzurufen.

## Ursache

In [App.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts#L191) wurde der `StateManager` unter dem Interface-Namen `'IStateManager'` im `ServiceContainer` registriert (`container.register('IStateManager', stateManager)`).
[BatchOperations.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/BatchOperations.ts#L37) forderte den Service jedoch unter dem konkreten Klassennamen `'StateManager'` an (`container.get('StateManager')`), wodurch der `ServiceContainer` den Dienst nicht finden konnte.

## Loesung

1. **In [BatchOperations.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/utils/BatchOperations.ts#L37)**: Der Anfragename im `ServiceContainer` wurde von `'StateManager'` auf `'IStateManager'` angepasst.
2. **In [App.ts](file:///c:/Users/ich/Desktop/code/_projects/Nodges/src/App.ts#L191-L192)**: Der `StateManager` wird nun vorsorglich unter beiden Schluesseln (`'IStateManager'` und `'StateManager'`) registriert, um maximale Abwaertskompatibilitaet sicherzustellen.
