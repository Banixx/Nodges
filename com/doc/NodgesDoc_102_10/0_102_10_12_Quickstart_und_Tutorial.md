# 09 Quickstart und Tutorial

> **Visualisierung:** Siehe [12_QuickstartFlow_001.mmd](12_QuickstartFlow_001.mmd)

Dieses Tutorial führt Endbenutzer durch die ersten Schritte mit Nodges – von der Konfiguration der KI-Provider bis zur Navigation im 3D-Graphen.

---

## 1. Erstes Setup und Provider-Konfiguration

> **Visualisierung:** Siehe [12_ProviderSetupDetail_002.mmd](12_ProviderSetupDetail_002.mmd)

Nodges ist "Local-First" und "BYOK" (Bring Your Own Key). Das bedeutet, Sie müssen sich mit keinen proprietären Accounts anmelden.
1. **Einstellungen öffnen:** Klicken Sie im UI auf das Zahnrad-Symbol (Settings).
2. **Provider wählen:**
   - *Für Cloud:* Wählen Sie OpenRouter, OpenAI oder Anthropic. Tragen Sie Ihren persönlichen API-Key ein. Der Key wird sicher im `localStorage` Ihres Browsers gespeichert und verlässt Ihren Computer nur in Richtung des Providers.
   - *Für Lokal:* Wählen Sie "Local (Ollama)" oder "Local (LM Studio)". Stellen Sie sicher, dass Ihr lokaler Server (z.B. auf `http://localhost:11434`) läuft. Sie benötigen hierfür keinen API-Key.

---

## 2. Den ersten Graphen generieren (Build 10 Pipeline)

> **Visualisierung:** Siehe [12_PromptEngineering_006.mmd](12_PromptEngineering_006.mmd)

Die Magie von Nodges liegt in der agentischen Generierung.
1. Öffnen Sie das **Create Panel**.
2. Wählen Sie als Pipeline **"Build 10"**.
3. **Konfiguration:**
   - Belassen Sie Grounding fürs Erste auf "Keines" (für maximale LLM-Kreativität).
   - Setzen Sie QA auf "Generator + Kritiker" für hohe Datenqualität.
4. **Der Prompt:** Geben Sie im Textfeld ein Thema ein, z.B.: *"Zeichne mir das Ökosystem eines europäischen Waldes. Wer frisst wen? Wer lebt wo?"*
5. Klicken Sie auf **Generieren**. Lehnen Sie sich zurück, während die Toasts unten links Sie über die Phasen informieren (Ontologie wird erstellt -> Daten werden instanziiert).

---

## 3. Die Navigation im 3D-Raum

> **Visualisierung:** Siehe [12_KameraNavigationKontrollen_003.mmd](12_KameraNavigationKontrollen_003.mmd)

Sobald der Graph gerendert ist, nutzen Sie Maus oder Touchpad:
- **Rotieren (Orbit):** Linke Maustaste gedrückt halten und ziehen.
- **Zoomen:** Mausrad (Scrollen) oder Pinch-to-Zoom auf Touchpads.
- **Pannen (Verschieben):** Rechte Maustaste gedrückt halten und ziehen (oder Shift + Linke Maustaste).
- **Interaktion:** Klicken Sie auf einen Knoten, um das Info-Panel an der Seite zu öffnen und alle verborgenen Rohdaten (die `properties`) dieses spezifischen Knotens einzusehen.

---

## 4. Das Visual Mapping beherrschen

> **Visualisierung:** Siehe [12_VisualMappingMechanik_004.mmd](12_VisualMappingMechanik_004.mmd)

Der Graph sieht initial vielleicht noch unstrukturiert aus. Jetzt kommt die Decoupled UI ins Spiel. Öffnen Sie das **Mapping Panel**.

- **Größe ändern:** Suchen Sie im Dropdown für `Scale` nach numerischen Werten (z.B. `influence`, `weight`). Die Knoten skalieren sofort.
- **Farbe ändern:** Wählen Sie im Dropdown für `Color` eine kategoriale Eigenschaft (z.B. `species` oder `habitat`). Nodges färbt die Cluster automatisch ein.
- **Die Position sperren:** Das stärkste Tool. Wenn Sie im `Position` Dropdown "Lebensdauer" auswählen und den Schalter auf die `Y`-Achse legen, ordnen sich alle Knoten vertikal nach ihrem Alter an. Die Physik-Engine schaltet die Y-Achse ab, während X und Z weiterhin organisch floaten.

---

## 5. Eigene Dateien importieren (JSON)

> **Visualisierung:** Siehe [12_DragDropImportFlow_005.mmd](12_DragDropImportFlow_005.mmd)

Nodges ist nicht auf LLMs beschränkt. Sie können jederzeit standardisierte JSON-Dateien einlesen.
- Ziehen Sie einfach eine gültige `.json` Datei (welche dem Nodges Schema 5.0 entspricht) per Drag & Drop direkt in das Browserfenster. Das System validiert die Datei und rendert sie instantan.
