# Leitfaden: Generierung komplexer Systeme für Nodges

Dieses Dokument beschreibt die Kernproblematik bei der LLM-gestützten Generierung von Netzwerk-Daten für Nodges (Build 4 Schema) und definiert die Lösungsstrategie für optimale Ergebnisse.

## 1. Die Zielsetzung
Das Ziel ist es, ein LLM (Large Language Model) dazu zu bringen, ein komplexes reales System (z.B. das politische System der Schweiz) als strukturierte, interaktive und visuell sprechende Netzwerk-Topologie im Nodges JSON-Format auszugeben. Das System muss semantisch tiefgründig und visuell differenzierbar sein.

## 2. Die Kernproblematik bei der Extraktion
Bisherige Ansaetze scheiterten an mangelnder Abstraktion und starrer Vererbung:
*   **Zu generisch:** Das LLM wirft Kanten und Knoten oft in viel zu flache Standardkategorien, ohne die tiefgreifenden, themenspezifischen Attribute herauszulesen, die das System eigentlich definieren.
*   **Starrer Attributszwang:** Wird das LLM gezwungen, bestimmte Attribute pauschal anzuwenden, fuehrt das zu fehlerhaften Zuweisungen bei Entitaeten, die dieses Attribut wesensgemaess gar nicht besitzen koennen.
*   **Falsche Hierarchien (Nesting):** Zusammenhaenge und Zugehoerigkeiten werden faelschlicherweise tief als Arrays oder Objekte in den Knoten-Eigenschaften verschachtelt, anstatt sie als das abzubilden, was sie in einem Graphen sind: Kanten (Edges).

## 3. Der universelle Extraktions- und Ontologie-Workflow
Das LLM muss zwingend als analytischer Parser und "Ontologie-Architekt" agieren, der flexibel auf beliebige Themen anwendbar ist:

### A. Erkennung von Entitaeten und Kanten (Die Basis)
Das LLM muss in der Lage sein, ein Thema in seine atomaren Bestandteile zu zerlegen. Es liest die Akteure/Objekte (Entitaeten) sowie deren vielfaeltige Beziehungen zueinander (Kanten) aus dem Text heraus und merkt sich diese als voneinander getrennte, flache Elemente. Verschachtelungen sind streng verboten; Jede Beziehung muss eine eigene `Edge` werden.

### B. Dynamische Typen und relevante Attribute
Das LLM leitet aus den erkannten Elementen eigene, inhaltlich sinnvolle Typen (Klassen) ab – sowohl fuer Entitaeten als auch fuer Kanten. 
Fuer jeden dieser Typen definiert es spezifische, relevante Attribute (Metadaten). Es muss verstehen, dass Kanten genauso wichtige Attribute tragen koennen (z.B. Intensitaet, Dauer, Art des Konflikts) wie die Knoten selbst.

### C. Handhabung von Varianzen (Null / Undefined)
Da das Schema streng typbasiert ist, koennen nicht alle Instanzen eines Typs jeden Wert sinnvoll fuellen. Das LLM muss bei der Datengenerierung den Umgang mit fehlenden Informationen beherrschen:
*   Wenn ein Attribut fuer einen bestimmten Knoten/Kante inhaltlich zwar moeglich ist, aber unbekannt bleibt, wird der Wert explizit auf `null` gesetzt.
*   Wenn ein Attribut gar nicht anwendbar ist (z.B. fehlend in der Typ-Definition), wird es im JSON komplett weggelassen (verhaelt sich im System wie `undefined`).

### D. Visuelle Uebersetzung (Das "visualMappings")
Die generierte Ontologie ist nur wertvoll, wenn das LLM diese typspezifischen Attribute konsequent in das `visualMappings`-Objekt uebersetzt. Typen und deren Kategorien muessen Form (`geometry`) und Farbe (`color`) steuern, waehrend Metriken und Gewichte die Groesse (`size`) und Kanten-Dicke (`thickness`) beeinflussen.

## 4. Fazit für den Prompt-Aufbau
Der System-Prompt muss dem LLM nicht starre Attribute vorkauen, sondern ihm die Rolle des **Architekten einer relationalen Datenbank** zuweisen. Es muss verstehen, dass die Schönheit und Tiefe der 3D-Visualisierung in Nodges direkt aus einer sauberen, flachen Trennung von Typen, typspezifischen Metadaten und starken semantischen Kanten resultiert.
