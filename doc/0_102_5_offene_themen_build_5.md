# Offene Themen & Baustellen (Nodges Build 5)

Dieses Dokument enthält die Agenda für die nächsten Sessions, basierend auf den Kontexten vor dem Antigravity-Neustart.

## Wie starte ich eine neue Session?
Um an einem dieser Punkte weiterzuarbeiten, öffne eine frische Antigravity-Session und schreibe:
> *"Lies dir als Kontext bitte das Dokument `doc/0_102_5_offene_themen_build_5.md` durch und lass uns mit Thema X weitermachen."*
(Alternativ kannst du auch den `/such "Thema X"` Workflow nutzen, um alte Gedankengänge aus dem Brain auszugraben).

---

## Themen-Liste

### 1. Optimierung der LLM Pipeline (Robustheit & JSON)
* **Ziel:** Die KI-Pipeline absturzsicher machen.
* **Details:** Modelle liefern teils fehlerhaftes JSON. Einbau eines Regex-basierten JSON-Extraktors, Nutzung der nativen `json_schema` Funktion von OpenRouter. Schutz ("Null-Guards") im `CreatePanel` einbauen.

### 2. Refining Model Selection UI
* **Ziel:** Verbesserte Benutzeroberfläche zur Modellauswahl.
* **Details:** Das bisherige Dropdown-Menü durch ein durchsuchbares Input-Feld ersetzen (inkl. Keyboard-Navigation). Fünf neue Modelle von OpenRouter hinzufügen.

### 3. Testing & QA Strategie (Build 5)
* **Ziel:** Stabilität des neuen "Build 5" absichern.
* **Details:** Aufbau einer sauberen Testumgebung (Vitest) für die Zod-Validierungs-Schemas und die Pipeline. Der zentrale `ErrorHandler` muss nahtlos integriert werden, um stumme Fehler abzufangen.

### 4. Architektur-Risiken (Build 5 Abschluss)
* **Ziel:** Code-Architektur bereinigen.
* **Details:** Die konzeptionelle Entkopplung zwischen dem reinen Datenmodell und der visuellen Repräsentation abschließen. Die Risikoanalyse (`Architecture_Risks.md`) finalisieren.

### 5. Sicheres BYOK Deployment (Bring Your Own Key)
* **Ziel:** Das Projekt über GitHub Pages hosten.
* **Details:** Eine externe Lösung finden (z.B. Google Proxy oder lokale Eingabe), damit sich Nutzer sicher authentifizieren können, ohne dass API-Keys im Code landen.
