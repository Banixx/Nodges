# 12 Quickstart und Tutorial

Dieses Tutorial fuehrt Anwender und Entwickler Schritt fuer Schritt durch die grundlegende Bedienung von Nodges in Version **0.106.8** – von der Konfiguration der Inferenz-Provider ueber die agentische Grapherstellung bis zur dynamischen 3D-Navigation und dem Visual Mapping.

---

## 1. Erstes Setup und Provider-Konfiguration

> **Visualisierung:** Siehe [12_QuickstartFlow_001.mmd](12_QuickstartFlow_001.mmd) und [12_ProviderSetupDetail_002.mmd](12_ProviderSetupDetail_002.mmd)

Nodges operiert nach dem Prinzip **BYOK ("Bring Your Own Key")** und ist vollstaendig Local-First-faehig. Es ist keine Registrierung bei zentralen Cloud-Diensten erforderlich:

1. **Einstellungsmenue oeffnen:** Klicken Sie in der oberen rechten Menueleiste auf das Einstellungen-Symbol (Settings).
2. **Inferenz-Provider konfigurieren:**
   - **Cloud-Modus:** Waehlen Sie *OpenRouter*, *OpenAI* oder *Anthropic* und hinterlegen Sie Ihren personlichen API-Key. Der Schluessel wird verschluesselt im lokalen Browserspeicher (`localStorage`) abgelegt und ausschliesslich fuer direkte API-Aufrufe an den Provider genutzt.
   - **Lokaler Modus (Local-First):** Waehlen Sie *Local (Ollama)* oder *LM Studio*. Stellen Sie sicher, dass Ihr lokaler Inferenz-Server laeuft (z. B. Ollama standardmaessig auf `http://localhost:11434`). Ein API-Key ist im lokalen Betrieb nicht erforderlich.

---

## 2. Den ersten Graphen generieren (Build 10 / CreatePanel)

> **Visualisierung:** Siehe [12_PromptEngineering_006.mmd](12_PromptEngineering_006.mmd)

Die Kernstaerke von Nodges liegt in der agentischen Wissensextraktion ueber das modulare `CreatePanel`:

1. Oeffnen Sie das **CreatePanel** ueber die Seitenleiste.
2. **Modulkonfiguration festlegen:**
   - *Inferenz-Quelle:* Waehlen Sie Ihren vorkonfigurierten Provider.
   - *Grounding-Strategie:* Waehlen Sie fuer freie Exploration "Keines" oder fuer verifizierte Fakten "Wikidata Live" bzw. "LightRAG".
   - *Qualitaetssicherung:* Aktivieren Sie "Generator + Kritiker" oder "Human-in-the-Loop", wenn Sie Daten vor dem Rendern pruefen moechten.
3. **Prompt eingeben:** Formulieren Sie Ihre Aufgabenstellung praezise, zum Beispiel:  
   *"Modelliere das europaeische Stromnetz mit Uebertragungsnetzbetreibern, Hauptkraftwerken, Speichern und Interkonnektoren. Zeige Abhaengigkeiten und Kapazitaeten."*
4. **Generierung ausloesen:** Klicken Sie auf **"Generieren"**. Die Toast-Benachrichtigungen informieren Sie ueber den zweistufigen Ablauf: Phase 1 (Ontologie-Design) gefolgt von Phase 2 (Instanziierung und Zod-Validierung).

---

## 3. Navigation und Raumorientierung in 3D

> **Visualisierung:** Siehe [12_KameraNavigationKontrollen_003.mmd](12_KameraNavigationKontrollen_003.mmd)

Nach dem Ladevorgang entfaltet sich der Graph im 3D-Raum:

- **Rotieren (Orbit):** Linke Maustaste gedrueckt halten und ueber den Canvas ziehen.
- **Verschieben (Pan):** Rechte Maustaste gedrueckt halten (oder `Shift` + linke Maustaste) und ziehen.
- **Zoomen:** Mausrad drehen oder Touchpad-Gesten nutzen. Der Zoom passt seine Geschwindigkeit automatisch an die Objektdistanz an.
- **Inspektion:** Klicken Sie auf einen beliebigen Knoten, um das Seiten-Panel zu oeffnen und saemtliche Attribute (`properties`) sowie verbundene Relationen einzusehen.
- **Fokus-Fahrt:** Ein Doppelklick auf einen Knoten animiert die Kamera in einer weichen Fly-To-Bewegung direkt vor das ausgewaehlte Element.

---

## 4. Das Visual Mapping beherrschen

> **Visualisierung:** Siehe [12_VisualMappingMechanik_004.mmd](12_VisualMappingMechanik_004.mmd)

Das `MappingPanel` erlaubt die freie Uebersetzung von Datenattributen in visuelle Kanaele:

- **Groesse (Scale):** Waehlen Sie im Dropdown fuer Skalierung eine kontinuierliche Metrik (z. B. "Kapazitaet" oder "Bedeutung"). Die Knoten passen ihren Radius in Echtzeit an.
- **Farbe (Color):** Mappen Sie eine kategoriale Eigenschaft (z. B. "Energietyp" oder "Land"), um das Netzwerk automatisch chromatisch zu clustern.
- **Achsensperrung (Position X / Y / Z):** Waehlen Sie ein Attribut wie "Baujahr" und legen Sie es auf die `X`-Achse. Die Physik-Engine sperrt fuer diese Dimension die Kraefte; die Knoten ordnen sich auf einer horizontalen Zeitachse an, waehrend sie auf Y und Z weiterhin topologisch floaten.

---

## 5. Eigene Datensaetze importieren (Drag & Drop)

> **Visualisierung:** Siehe [12_DragDropImportFlow_005.mmd](12_DragDropImportFlow_005.mmd)

Neben generativen KI-Pipelines unterstuetzt Nodges den direkten Import lokaler Graphdaten:
- Ziehen Sie eine standardkonforme `.json`-Datei (Schema 5.0 oder 5.2) per Drag & Drop direkt auf den Browser-Canvas.
- Der `DataParser` prueft und normalisiert das Dokument automatisch.
- Bei erfolgreicher Zod-Validierung wird die bisherige Szene bereinigt und der neue Graph instantan instanziiert.
