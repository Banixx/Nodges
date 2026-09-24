# Rendering Pipeline Debugging & Fixes

## Problembeschreibung
Der User berichtete, dass bei lokalen Generierungen (Build 6) das Mapping Panel sich kurz füllte, ein System in der Szene kurz aufblitzte und danach die Szene sowie das Mapping Panel komplett leer waren. Es wurde keine automatische Backup-Datei zum Download angeboten. Online trat dieses Problem nicht auf.

## Ursachenanalyse

1. **Vite Dev Server Hot-Reload (Das Verschwinden der UI)**
   Die Auto-Save-Funktion in `CreatePanel.ts` sendet nach der Generierung die Graphen-Daten an den lokalen API-Endpunkt `/api/save_graph`, welcher die Daten im Verzeichnis `public/data/generated/` ablegt. Da der lokale Vite-Development-Server dieses Verzeichnis standardmäßig überwacht (File Watcher), registrierte er die neu erstellte Datei und löste sofort einen kompletten **Page Reload** (HMR / Full Reload) aus. Dies führte zum Zurücksetzen der gesamten Applikation, wodurch die Szene und das Mapping Panel direkt nach der erfolgreichen Generierung geleert wurden.

2. **Kollabieren von Knoten (Visueller Glitch in der Pipeline)**
   Bei genauer Untersuchung von `NodeManager.ts` wurde festgestellt, dass bei fehlenden Mapping-Anweisungen für `visual.positionX/Y/Z` die Instanzierung hart auf `(0, 0, 0)` zurückfiel. Wenn also der LayoutManager übersprungen wurde (weil LLM-Daten bereits physische Positionen enthielten), aber keine visuellen Positionen aktiv gemappt waren, kollabierten alle Knoten zu einem einzigen Punkt im Ursprung der Szene, anstatt die echten vom LLM generierten Koordinaten (`entity.position`) als Fallback zu nutzen.

## Implementierte Fixes

1. **Vite Watcher Konfiguration (`vite.config.ts`)**
   Das Verzeichnis `public/data/generated` wurde explizit aus dem Vite File Watcher ausgeschlossen:
   ```typescript
   watch: {
       usePolling: true,
       interval: 500,
       ignored: ['**/public/data/generated/**'],
   }
   ```
   Dies verhindert den störenden Browser-Reload beim lokalen Entwickeln.

2. **NodeManager Position Fallback (`src/core/NodeManager.ts`)**
   Die strikten Fallbacks auf `0` wurden so umgebaut, dass sie nun ordnungsgemäß auf die echten Knotenpositionen (`entity.position.x/y/z`) zugreifen, falls keine dedizierte visuelle Position aus dem `VisualMappingEngine` vorliegt:
   ```typescript
   // Position mapped override (strict 0,0,0 fallback changed to entity.position)
   const x = visual.positionX !== undefined ? visual.positionX : (entity.position?.x || 0);
   const y = visual.positionY !== undefined ? visual.positionY : (entity.position?.y || 0);
   const z = visual.positionZ !== undefined ? visual.positionZ : (entity.position?.z || 0);
   ```

## Ergebnis
Das Aufblitzen und Verschwinden der Visualisierung in der lokalen Entwicklungsumgebung wurde behoben. Die Generierungsergebnisse verbleiben nun in der Szene und können ordnungsgemäß im Mapping Panel editiert werden. Physische LLM-Positionen werden bei Fehlen von visuellem Mapping nicht mehr mit `0,0,0` überschrieben.
