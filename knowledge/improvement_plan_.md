# Nodges Architektur-Verbesserungsplan
  
**Erstellt:** 2026-01-11  
**Basierend auf:** Projektanalysen von Opus und Gemini High, sowie Code-Verifikation  
**Ziel:** Langfristig wartbare und erweiterbare Architektur
  
---
  
## 1. Zusammenfassung der Kernprobleme
  
Die Analyse der Knowledge-Base und des Quellcodes hat folgende architektonische Schwachstellen identifiziert:
  
### 1.1 Doppeltes Event-/State-System
  
| Problem | Auswirkung |
|---------|-----------|
| `CentralEventManager` (Pub/Sub) und `StateManager` (Observer) laufen parallel | Manager abonnieren beide Systeme, was zu doppelten Trigger-Ketten führt |
| CEM aktualisiert SM direkt (`setHoveredObject`) | Unklar, wer der "Single Source of Truth" ist |
| `InteractionManager` ruft Highlights manuell auf, obwohl SM bereits triggert | Highlight-Logik wird zweimal ausgeführt |
  
> [!CAUTION]
> **Stale-State-Risiko:** Events vom CEM können vor der vollständigen State-Propagation im SM eintreffen, was zu inkonsistenten UI-Zuständen führt.
  
### 1.2 Tight Coupling in App.ts
  
- `App.ts` (546 Zeilen) ist der zentrale Orchestrator und instanziiert **alle 20+ Manager** direkt
- Manager haben bis zu 8 Abhängigkeiten im Konstruktor (z.B. `InteractionManager`)
- Keine Dependency Injection → Mocking und isoliertes Testen unmöglich
- Globales `window.app`-Pattern erschwert Modularisierung
  
### 1.3 TypeScript-Hygiene
  
| Fundort | Anzahl `@ts-ignore` |
|---------|---------------------|
| CentralEventManager.ts | 4 |
| App.ts | 5 |
| InteractionManager.ts | 1 |
| StateManager.ts | 1 |
| RaycastManager.ts | 3 |
| LayoutManager.ts | 1 |
| **Summe** | **15** |
  
Jedes `@ts-ignore` maskiert einen potenziellen Laufzeitfehler.
  
### 1.4 Zod-Schema Schwächen
  
```typescript
// types.ts:87, 96
EntityDataSchema.passthrough(); // Allow extra properties!
RelationshipDataSchema.passthrough(); // Allow extra properties!
```
  
- `passthrough()` erlaubt beliebige, unvalidierte Properties
- Fehlerhafte JSON-Strukture werden "leise" akzeptiert
  
### 1.5 Monolithischer InteractionManager
  
- `InteractionManager.ts` hat **814 Zeilen** und 46+ Methoden
- Vereint: Selektion, Hover, Box-Selection, Kontextmenü, Node-Erstellung, Edge-Erstellung, Keyboard-Handler
- Verstößt gegen das Single Responsibility Principle (SRP)
  
### 1.6 Fehlende Basisinfrastruktur
  
| Fehlt | Konsequenz |
|-------|-----------|
| Test-Suite | Keine Regressionserkennung |
| CI/CD Pipeline | Manuelle Qualitätssicherung |
| Memory-Dispose bei `clearScene()` | Potenzielle Memory-Leaks bei Three.js-Objekten |
| Undo/Redo | Keine Möglichkeit, Aktionen rückgängig zu machen |
| Error-Boundary | Fehler crashen die App ohne User-Feedback |
  
---
  
## 2. Priorisierte Maßnahmen
  
### Priorität 1: Fundament stabilisieren (Kritisch)
  
#### 2.1.1 TypeScript-Hygiene herstellen
  
**Aufwand:** 4-6h  
**Nutzen:** Verhindert versteckte Laufzeitfehler
  
- [ ] Alle 15 `@ts-ignore` entfernen und durch typsichere Lösungen ersetzen
- [ ] `strict: true` in `tsconfig.json` aktivieren oder verifizieren
- [ ] `any`-Typen in Manager-Konstruktoren durch konkrete Interfaces ersetzen
  
#### 2.1.2 Zod-Schemas strikter machen
  
**Aufwand:** 2-3h  
**Nutzen:** Ungültige Daten werden beim Import erkannt
  
- [ ] `passthrough()` durch explizite optionale Felder ersetzen
- [ ] Custom Error Messages für Validierungsfehler hinzufügen
- [ ] Unit-Tests für Schema-Validierung schreiben
  
#### 2.1.3 Memory-Management implementieren
  
**Aufwand:** 2-4h  
**Nutzen:** Verhindert Memory-Leaks bei großen Graphen
  
- [ ] In `App.clearScene()`: Explizites `geometry.dispose()` und `material.dispose()` für alle Three.js-Objekte
- [ ] In `NodeManager.clear()` und `EdgeObjectsManager.dispose()`: Analog
  
---
  
### Priorität 2: Event-System konsolidieren (Architektur)
  
#### 2.2.1 Klare Verantwortlichkeiten definieren
  
**Aufwand:** 8-12h  
**Nutzen:** Eliminiert Synchronisationsprobleme und doppelte Trigger
  
**Ziel-Architektur:**
  
```
DOM-Events → CEM (nur Roh-Events) → InteractionManager (entscheidet State-Änderung) → StateManager (Single Source of Truth) → Alle Consumer (HM, UIM, LM)
```
  
**Schritte:**
  
- [ ] `CentralEventManager` auf reine Input-Erfassung reduzieren (Maus-Koordinaten, Tastatur-Codes)
- [ ] Fachliche Logik (z.B. "Welches Objekt wurde selektiert?") in `InteractionManager` verschieben
- [ ] Alle direkten `stateManager.set*()`-Aufrufe im CEM entfernen
- [ ] `InteractionManager.selectObject()`: Manuellen `highlightManager.updateHighlights()`-Aufruf entfernen
  
#### 2.2.2 Event-Typen formalisieren
  
**Aufwand:** 4-6h  
**Nutzen:** Type-Safety für Events
  
- [ ] TypeScript-Interface für alle Event-Payloads erstellen:
  
```typescript
interface ClickEvent { 
  clickedObject: THREE.Object3D | null; 
  button: number;
  modifiers: { ctrl: boolean; shift: boolean };
}
```
  
- [ ] Generische `subscribe<T>(event: string, callback: (data: T) => void)` Signatur
  
---
  
### Priorität 3: InteractionManager refactoren (SRP)
  
#### 2.3.1 Manager aufteilen
  
**Aufwand:** 12-16h  
**Nutzen:** Einfachere Wartung, isoliertes Testen möglich
  
| Neuer Manager | Verantwortlichkeit | Quell-Methoden |
|--------------|-------------------|----------------|
| `SelectionManager` (existiert teilweise) | Single/Multi-Selektion, Box-Selection | `selectObject`, `deselectAll`, `handleClick` |
| `HoverManager` | Hover-Effekte, Tooltips | `handleHoverStart`, `handleHoverEnd`, `showTooltip` |
| `InputEventRouter` | Keyboard/Maus-Events an Fachlogik weiterleiten | `handleKeyDown`, `handleMouseDown`, `handleContextMenu` |
| `CreationManager` | Node/Edge-Erstellung | `createNewNode`, `finishEdgeCreation`, `cancelEdgeCreation` |
  
- [ ] Schritt 1: `SelectionManager` erweitern (nutzt bereits existierende Basis)
- [ ] Schritt 2: `HoverManager` neu erstellen
- [ ] Schritt 3: `CreationManager` extrahieren
- [ ] Schritt 4: `InteractionManager` auf Orchestrierung reduzieren
  
---
  
### Priorität 4: Dependency Injection einführen (Optional, Langfristig)
  
#### 2.4.1 Container-Pattern implementieren
  
**Aufwand:** 16-24h  
**Nutzen:** Testbarkeit, Austauschbarkeit von Komponenten
  
- [ ] Einfachen DI-Container erstellen (oder leichtgewichtige Lib wie `tsyringe` nutzen)
- [ ] Manager-Registrierung in `App.ts` durch Container ersetzen:
  
```typescript
container.register('stateManager', StateManager);
container.register('nodeManager', NodeManager, ['stateManager']);
```
  
- [ ] `window.app`-Pattern durch Container-Zugriff ersetzen
  
---
  
### Priorität 5: Test-Infrastruktur aufbauen
  
#### 2.5.1 Unit-Tests für Kernlogik
  
**Aufwand:** 8-12h  
**Nutzen:** Regressionserkennung, Dokumentation
  
- [ ] Vitest oder Jest einrichten
- [ ] Tests für:
  - `types.ts` (Zod-Schema-Validierung)
  - `VisualMappingEngine` (Mapping-Funktionen)
  - `DataParser` (Legacy/Future Format Parsing)
  - `StateManager` (State-Updates)
  
#### 2.5.2 E2E-Tests für kritische Flows
  
**Aufwand:** 8-12h  
**Nutzen:** Sicherstellung der Kernfunktionalität
  
- [ ] Playwright oder Cypress einrichten
- [ ] Tests für:
  - Daten laden → Graph rendern
  - Node selektieren → Info-Panel zeigt Daten
  - Visual Mapping ändern → Farben aktualisieren
  
---
  
## 3. Empfohlene Umsetzungsreihenfolge
  

![](../assets/91c23551a36a64329472b4f9e3fcdd430.png?0.001608136676284344)  
  
### Zusammenfassung der Reihenfolge
  
| Phase | Fokus | Geschätzter Aufwand | Kritikalität |
|-------|-------|---------------------|-------------|
| **1** | TypeScript-Hygiene, Schemas, Memory | 8-12h | Hoch (Fundament) |
| **2** | Event-System konsolidieren | 12-18h | Hoch (Architektur) |
| **3** | InteractionManager refactoren | 12-16h | Mittel (Wartbarkeit) |
| **4** | Test-Infrastruktur | 16-24h | Mittel (Qualität) |
| **5** | Dependency Injection | 16-24h | Niedrig (Optional) |
  
---
  
## 4. Quick Wins (Sofort umsetzbar)
  
Diese Maßnahmen bieten hohen Nutzen bei geringem Aufwand:
  
| Maßnahme | Aufwand | Nutzen |
|----------|---------|--------|
| README.md mit Architektur-Diagramm erstellen | 1-2h | Onboarding beschleunigen |
| Konsistente Kommentarsprache (→ Englisch) | 2h | Code-Konsistenz |
| `highlightManager.updateHighlights()` aus `InteractionManager.selectObject()` entfernen | 10min | Doppelte Execution eliminieren |
  
---
  
> [!TIP]
> **Empfohlener erster Schritt:**  
> Beginne mit der TypeScript-Hygiene (Entfernen der 15 `@ts-ignore`). Dies deckt oft versteckte Typprobleme auf und zeigt, wo weitere Architekturarbeiten nötig sind.
  
---
  
*Dieser Plan ist ein lebendes Dokument. Nach Abschluss jeder Phase sollte er überprüft und angepasst werden.*
  