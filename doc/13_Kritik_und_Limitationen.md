# 13 Kritik, Limitationen und Open Issues

Keine Software ist perfekt. Dieses Dokument setzt sich kritisch mit der aktuellen Architektur von Nodges auseinander und benennt bekannte Engpässe und konzeptionelle Schwächen.

## 13.1 Architektonische Kritik: Der "Manager-Overhead"

Das aktuelle Manager-Pattern sorgt für Ordnung, führt aber zu einer hohen Fragmentierung.
*   **Problem**: Um ein neues Feature hinzuzufügen (z.B. "Node-Labels"), müssen oft 4-5 Dateien gleichzeitig geändert werden (`App.ts`, `NodeManager.ts`, `StateManager.ts`, `UIManager.ts` und `types.ts`).
*   **Potential**: Überlegung, ob ein **Entity Component System (ECS)** für die 3D-Objekte flexibler wäre, als starre Manager-Klassen.

## 13.2 Technische Limitationen (Bottlenecks)

### 1. Das "Single-Threaded" UI-Problem
Trotz Web Workers für das Layout läuft das Haupt-Rendering und das Management im Main-Thread von JavaScript.
*   **Symptom**: Wenn 50.000 Knoten im Scene-Graph sind, wird allein die Verwaltung dieser Objekte (Matrix-Updates) so langsam, dass das UI "laggy" wird, selbst wenn die GPU noch Reserven hat.
*   **Lösung**: Verlagerung von mehr Logik in Shader (GPGPU) oder Nutzung von `OffscreenCanvas`.

### 2. Transparenz-Sortierung
WebGL hat bauartbedingte Probleme mit vielen transparenten Objekten hintereinander (Depth Sorting).
*   **Symptom**: Wenn viele Glow-Effekte übereinander liegen, "flackern" die Ränder oder Objekte werden in der falschen Reihenfolge gezeichnet.
*   **Kritik**: Wir nutzen aktuell nur Standard-Sortierung, was bei sehr dichten Graphen zu visuellen Artefakten führt.

## 13.3 Daten-Kritik: Die "Format-Schizophrenie"

Nodges schleppt aktuell zwei Formate mit sich herum (Legacy & Future).
*   **Kritik**: Der Code enthält viele `if (isLegacy) { ... } else { ... }` Verzweigungen. Das macht den Parser schwer wartbar und fehleranfällig. 
*   **Empfehlung**: Ein harter "Breaking Change" hin zu einem reinem Future-Format, mit einem separaten Konverter-Tool für alte Dateien.

## 13.4 UX-Kritik

*   **Mobile Experience**: Die App ist auf Mausbedienung optimiert. Auf Tablets ist die Navigation ("Pinch-to-Zoom") und das Selektieren von kleinen Knoten aktuell eine Qual.
*   **Label-Management**: Bei dichten Graphen überlagern sich Text-Labels so stark, dass sie unlesbar werden. Hier fehlt ein intelligentes "Label-Occlusion" System, das unwichtige Texte automatisch ausblendet.

---
*Status: Selbstkritische Analyse*
