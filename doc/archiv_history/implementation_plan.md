# Implementierungsplan: Standardisierung der Build 3 Kraftfelder und Attribut-Präfixe

Dieses Dokument beschreibt die geplanten Anpassungen, um die topodynamische Kraftfelder-Simulation (Build 3) gemäß Spezifikation umzusetzen und Fehler bei Attribut-Präfixen zu beheben.

## Proposed Changes

### Datenzugriff & Utilities

#### [MODIFY] [BuildFormatUtils.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/BuildFormatUtils.ts)
* Anpassung von `getEntityAttributeValue` und `setEntityAttributeValue`, so dass ein führender `"stateVector."` Präfix automatisch entfernt wird. Dies ermöglicht eine robuste Auswertung von Pfaden wie `stateVector.health_status` ohne Abstürze.

### Parser & Kraftfelder-Fluss

#### [MODIFY] [DataParser.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/DataParser.ts)
* Entfernen/Auskommentieren der Methode `migrateFields` in `normalizeData`. Kraftfelder werden fortan nicht mehr in unsichtbare Knoten umgewandelt und gelöscht, sondern verbleiben im `fields`-Array des Graphen.

### Worker & Layout-Engine

#### [MODIFY] [WorkerTypes.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/workers/WorkerTypes.ts)
* Erweiterung des `WorkerNode` Interface um die optionalen Felder `type` und `behavior`.

#### [MODIFY] [LayoutManager.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/core/LayoutManager.ts)
* Übergabe von `type` und `behavior` in `applyLayoutWithWorker` an den Worker.

#### [MODIFY] [layout-worker.ts](file:///C:/Users/ich/Desktop/code/_projects/Nodges/src/workers/layout-worker.ts)
* Implementierung der euklidischen Kraftfelder (`fields`) direkt im Worker unter Berücksichtigung des Einflussradius (`influenceRadius`) und der selektiven Filterung (`behavior`).

---

## Verification Plan

### Automated Tests
* Ausführen der bestehenden Test-Suite mit `npx vitest run`, um sicherzustellen, dass keine Regressionen auftreten.

### Manual Verification
* Laden der Build 3 Graphendateien im Browser und Verifizierung des Kraftfeld-Verhaltens (z. B. selektive Anziehung der Blätter nach oben).
