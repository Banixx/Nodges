/**
 * InteractionManager - Re-Export aus neuem interaction/-Verzeichnis
 * Diese Datei existiert fuer Abwaertskompatibilitaet bestehender Imports.
 *
 * Die eigentliche Implementierung wurde in spezialisierte Handler aufgeteilt:
 * - src/core/interaction/InteractionManager.ts (Fassade)
 * - src/core/interaction/HoverHandler.ts
 * - src/core/interaction/SelectionHandler.ts
 * - src/core/interaction/DragHandler.ts
 * - src/core/interaction/KeyboardHandler.ts
 * - src/core/interaction/ContextMenuHandler.ts
 * - src/core/interaction/NodeCreationHandler.ts
 */
export { InteractionManager } from './interaction/InteractionManager';
