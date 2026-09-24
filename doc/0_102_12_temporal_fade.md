# Temporale Visualisierung: Fade-In & Fade-Out

## Ziel
Implementierung eines aufrollbaren Einstellungs-Panels in der `TimePlayerUI`, das es erlaubt, die Fade-Effekte für Nodes und Edges bei zeitlichen Übergängen einzustellen.

## Änderungen
1. **State Management (`StateManager.ts`)**
   - Hinzugefügt: `temporalFadeEnabled` (Standard: true) und `temporalFadeDuration` (Standard: 5.0).
2. **Knoten-Skalierung (`NodeManager.ts`)**
   - Die Sichtbarkeit von Knoten innerhalb der `updateTemporalState`-Methode berücksichtigt nun die Fade-Dauer. 
   - Ein Knoten, dessen `validFrom` in der Zukunft, aber innerhalb der `temporalFadeDuration` liegt, wird sanft durch Erhöhung der Skalierung (Scale) eingeblendet.
   - Ein Knoten, dessen `validTo` in der Vergangenheit, aber innerhalb der Fade-Dauer liegt, wird durch Skalierung (auf 0) ausgeblendet.
3. **Kanten-Transparenz (`EdgeObjectsManager.ts`)**
   - Die Sichtbarkeit von Kanten innerhalb der `updateTemporalState`-Methode berücksichtigt die Fade-Dauer.
   - Der errechnete `fadeMultiplier` wird auf die Opazität der `THREE.MeshPhongMaterial` (Kante) übertragen. Ist der Multiplikator < 1.0, wird die Kante transparent gerendert.
4. **Benutzeroberfläche (`TimePlayerUI.ts` & `main.css`)**
   - Das Einstellungs-Panel (`.tp-settings-panel`) wurde nach dem visuellen Vorbild des Mapping-Panels umgestaltet (inkl. Glassmorphism, `.mapping-header` und einklappbarer Mechanik).
   - Das Panel ist nun direkt über der Zeitleiste zentriert und kann über einen Pfeil (▲/▼) in der Kopfzeile nach oben ausgerollt werden. 
   - Enthält Toggle-Switch (Nodges-Styling) für Fade-Aktivierung und Slider für Fade-Dauer (0 - 50 Einheiten).
   - Die UI ist reaktiv an den `StateManager` gebunden.

## Hinweise
- InstancedMeshes (wie bei Knoten genutzt) handhaben per-instance Transparenz standardmäßig nicht gut, ohne tiefere Shader-Eingriffe. Die Skalierungs-Lösung erzeugt stattdessen einen visuell sehr klaren "Pop/Zoom"-Effekt beim Ein-/Ausfaden.
- Für Kanten, die individuelle `Mesh`-Instanzen sind, konnte problemlos Material-Transparenz (Opacity) für weiches Ausfaden eingesetzt werden.
