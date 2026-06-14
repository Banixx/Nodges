# Ebenen-Filterung in Nodges: Walkthrough & Dokumentation

Diese Anleitung beschreibt, wie die Ebenen-Filterung in Nodges implementiert wurde und wie sie mit der bereitgestellten Demo-Datei `ebenen_demo.json` verwendet werden kann.

## 1. Übersicht und Funktionsweise
Die Ebenen-Filterung ermöglicht es, komplexe 3D-Netzwerke in logische Schichten (Layer) zu unterteilen und diese gezielt zu steuern:
- **Sichtbarkeit (Visibility)**: Jede Ebene kann über Checkboxen ein- und ausgeblendet werden. Ein Ausblenden einer Ebene blendet alle zugehörigen Knoten (durch Skalierung auf `0`) sowie alle Kanten, die mit diesen Knoten verbunden sind, vollständig aus.
- **Deckkraft (Opacity)**: Die Deckkraft jeder Ebene lässt sich über Slider stufenlos zwischen `0.0` (vollständig transparent) und `1.0` (voll deckend) einstellen. Die Knoten werden durch Farbmultiplikation abgedunkelt (Simulierung von Transparenz auf `InstancedMesh`-Ebene), und Kanten werden transparent gerendert.

---

## 2. Verwendung mit der Demo-Datei
Die Demo-Datei `ebenen_demo.json` repräsentiert eine mehrschichtige Microservice-Architektur mit vier Ebenen:

| Ebene | Name | Beschreibung | Knoten in der Demo |
| :--- | :--- | :--- | :--- |
| **Ebene 1** | Frontend | Benutzerschnittstellen | `Web-Client`, `Mobile App` |
| **Ebene 2** | API-Gateway | Routing und Authentifizierung | `API Gateway` |
| **Ebene 3** | Services | Logische Backend-Dienste | `Auth Service`, `User Service`, `Order Service` |
| **Ebene 4** | Datenbanken | Datenhaltungsschichten | `User DB`, `Order DB` |

### Schritt-für-Schritt-Anleitung:
1. **Demo-Datei laden**:
   - Öffne das **File**-Panel in der reception Seitenleiste.
   - Entferne eventuell geladene Dateien und füge `ebenen_demo.json` ("Ebenen Demo") aus der Liste der verfügbaren Dateien hinzu.
2. **Ebenen-Panel öffnen**:
   - Klicke auf den **Ebenen**-Tab (befindet sich auf der rechten Seite zwischen **System** und **File**).
3. **Sichtbarkeit steuern**:
   - Deaktiviere die Checkbox für **Ebene 4 (Datenbanken)**. Du wirst sehen, dass die Datenbank-Knoten und alle zu ihnen führenden Verbindungen sofort ausgeblendet werden.
4. **Deckkraft anpassen**:
   - Bewege den Slider für **Ebene 2 (API-Gateway)** nach links. Der Gateway-Knoten und die mit ihm verbundenen Linien verblassen stufenlos.

---

## 3. Technische Umsetzung
Die Steuerung basiert auf dem reaktiven `StateManager`-System von Nodges:
- **State**: Die Eigenschaften `layerXVisible` (Boolean) und `layerXOpacity` (Number) sind im globalen Zustand definiert und der Kategorie `DATA` zugeordnet.
- **UI-Bindung (`LayersPanel.ts`)**: Lauscht auf Änderungen der HTML-Inputs und aktualisiert den State.
- **Knoten-Rendering (`NodeManager.ts`)**: Berechnet im `updateNodes`-Durchlauf für jeden Knoten die Skalierung basierend auf der Sichtbarkeit und Deckkraft seiner Ebene:
  $$\text{finalScale} = \text{baseScale} \times \text{layerOpacity} \quad (\text{oder } 0, \text{ falls unsichtbar})$$
- **Kanten-Rendering (`EdgeObjectsManager.ts`)**: Blendet Kanten aus, falls einer der verbundenen Knoten unsichtbar ist, und multipliziert die Deckkraft des Kantenmaterials mit dem Minimum der Deckkrafte der verbundenen Knotenebenen:
  $$\text{finalOpacity} = \text{baseOpacity} \times \min(\text{opacity}_{\text{start}}, \text{opacity}_{\text{end}})$$
