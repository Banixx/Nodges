# Nodges Build 5 Plan: Robuster LLM-Generierungsworkflow

Dieses Dokument beschreibt den neuen, optimierten Workflow von der initialen Eingabe im `CreatePanel` bis zum fertig visualisierten Nodges-JSON. Er integriert Best Practices aus der professionellen Knowledge-Graph-Konstruktion, behebt Schwächen bisheriger Ansätze und fokussiert sich auf die Besonderheit von Nodges: **Wenige Knoten, aber eine hohe Dichte an tiefen Attributen**.

Der Kern des neuen Workflows ist die Abkehr von der "One-Shot-Generierung" hin zu einer sauberen **3-Schritt-Pipeline**, gesteuert durch "Competency Questions".

---

## Phasen des neuen Workflows

### Phase 1: Initialisierung & Competency Questions (Create Panel)
Der Nutzer konfiguriert den Datenauftrag. Anstatt direkt in die Ontologie zu springen, wird der *Zweck* des Netzwerks definiert.
*   **Eingaben:** Thema (Freitext), Dateien (PDFs, Text) oder URLs.
*   **Competency Questions (Kernfragen):** Das LLM leitet aus dem Thema 3-5 Kernfragen ab (z.B. "Welche Weinberge haben das höchste Klimarisiko?"). Diese Fragen sind der entscheidende Maßstab: Nur Attribute, die helfen, diese Fragen zu beantworten, werden später in die Ontologie aufgenommen.
*   **Quellenpriorität:** Das System definiert, dass hochgeladene Dokumente absolute Priorität über das "Weltwissen" des LLMs haben.

### Phase 2: Ontologie-Entwurf (Werte- und Visuell-Neutral)
Das LLM entwirft die Struktur des Netzwerks, ohne Daten zu erzeugen und **ohne** visuelle Zuweisungen.
*   **Aktion:** Gesteuert durch die Competency Questions definiert das LLM die Typen (Klassen) und deren spezifische Properties.
*   **Abgrenzungsregel (Attribut vs. Relation):** Wenn ein Wert auf eine andere Entität mit eigener Identität verweist (z.B. `betrieb_id`), MUSS es eine Relation (`BELONGS_TO`) sein. Wenn der Wert den Knoten nur selbst beschreibt (Zahl, Text), ist es ein Attribut.
*   **Ergebnis:** Ein JSON-Gerüst (`dataModel`) mit leeren `data.entities` und `data.relationships`.

### Phase 3: "Rückfragen" & Human-in-the-Loop
Ein zwingender Zwischenstopp, um die Qualität zu sichern.
*   **Aktion:** Das LLM präsentiert die Competency Questions und das abgeleitete Schema. Gibt es Mehrdeutigkeiten in den Texten? Fehlen Infos?
*   **Nutzerfreigabe:** Der Nutzer kann die Fragen anpassen oder das Schema bestätigen. So weiß der Nutzer vorab, *wie* tief das Netzwerk modelliert wird.

### Phase 4: Daten-Generierung & Semantisches Mapping
Erst nach Freigabe der Ontologie startet die Befüllung mit Daten. Das LLM agiert nun streng deterministisch.
*   **Aktion:** Das LLM extrahiert Entitäten und Relationen und **mappt** sie flach und wertneutral auf das fixierte Schema aus Phase 2.
*   **Regeln:** Strikte Quellenbindung (Priorität 1). Keine Erfindung neuer Attribute mehr.

### Phase 5: Visual Mapping (Der neue LLM-Schritt)
Dies ist ein komplett neuer, eigener Schritt, nachdem die Daten vorliegen.
*   **Aktion:** Das LLM analysiert das fertige `dataModel` *und* die befüllten Daten. Erst jetzt entscheidet es, welche der vielen Attribute visuell hervorgehoben werden sollen.
*   **Zuweisung:** Das LLM generiert die `visualMappings` (Color, Size, Geometry, Thickness) und bringt die restlichen Attribute in eine sinnvolle Reihenfolge für das Detail-Panel (Inspector).
*   **Vorteil:** Die visuelle Zuordnung passiert nicht blind am Anfang, sondern fundiert auf Basis der tatsächlichen Datenverteilung. Der User kann dies danach im Mapping-Panel jederzeit manuell überschreiben.

### Phase 6: Validierung (Auto-Check)
Ein programmatischer Kontrollschritt vor der JSON-Ausgabe.
*   **Prüfungen:** Sind alle Pflichtfelder vorhanden? Verweisen Kanten auf existierende Entitäten? Stimmen die Datentypen?
*   **Fehlerbehebung:** Kaputte Kantenverweise ("Dangling Edges") werden repariert oder eliminiert.

### Phase 7: JSON Erzeugung & Rendering
Das finale, geprüfte JSON wird ausgegeben.
*   **Aktion:** Die Datei wird lokal gespeichert (Auto-Save).
*   **Visualisierung:** Nodges übernimmt das Rendern in 3D/4D basierend auf der wasserdichten Struktur.

---

## Zusammenfassung der Vorteile für Build 5
1.  **Zielgerichtete Tiefe:** Durch die "Competency Questions" erzeugt das LLM genau die Attribute, die gebraucht werden – nicht zu sparsam, nicht wahllos.
2.  **Klare Trennung:** Die Entkopplung von Ontologie (Schritt 2), Daten (Schritt 4) und Visual Mapping (Schritt 5) verhindert Überforderung des LLMs und liefert deutlich konsistentere Netzwerke.
3.  **Human-in-the-Loop:** Der Nutzer lenkt das System über die Kernfragen und den Rückfragen-Schritt, bevor Rechenzeit für das große Daten-Mapping investiert wird.
