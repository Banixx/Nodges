# Dynamische Ontologie vs. Starre Facettierung

Der Abgleich mit dem aktuellen Entwicklungsstand (Referenz: Gemini-Analyse) zeigt, dass der Ansatz einer **starren, vorgegebenen Facettierung** (wie zuvor vorgeschlagen) fuer komplexe Systeme fehleranfaellig ist.

## 1. Kritik an der starren Facettierung
*   **Blinde Attribut-Vererbung:** Wenn wir erzwingen, dass jede Entitaet "Akteurstyp", "Staatsfunktion" und "Partei" als Attribut haben muss, entstehen unlogische Konstrukte (z.B. wuerde die Institution "Bundesrat" ploetzlich ein Partei-Attribut erhalten, obwohl nur die Personen im Bundesrat einer Partei angehoeren).
*   **Einschraenkung des LLM:** Ein starr vorgegebenes Raster verhindert, dass das LLM organisch neue, relevante Ebenen aus einem unbekannten Text extrahiert.

## 2. Der verbesserte Ansatz: Flache Strukturen & Semantische Kanten
Anstatt Dimensionen als Attribute in die Nodes zu zwingen, lagern wir die Strukturierung in das Netzwerk selbst (die Edges) und in dynamische Typen aus.

### Die 4 Pfeiler des neuen Workflows:
1.  **Entitaeten identifizieren:** Das LLM extrahiert zunaechst alle relevanten Akteure (z.B. "Bundesrat", "Albert Roesti", "SVP").
2.  **Typen dynamisch ableiten (Ontologie):** Das LLM teilt diese Entitaeten in selbst erkannte Klassen ein (z.B. `Institution`, `Person`, `Partei`).
3.  **Dynamische Attribute:** Attribute werden nur dort vergeben, wo sie ontologisch Sinn machen. Eine `Person` erhaelt das Attribut "Partei", eine `Institution` jedoch nicht.
4.  **Relationen spannen (Semantische Kanten):** Anstatt Verschachtelungen im JSON zu bauen, werden Beziehungen ueber Kanten geloest. Z.B. "Albert Roesti" `BELONGS_TO` "Bundesrat".

## 3. Konsequenz fuer den Build-Prompt
Wir duerfen dem LLM keine starren Dimensionen mehr vorschreiben, sondern muessen es anweisen, als "Ontologie-Architekt" zu agieren. Das LLM soll Entitaets-Klassen (Types) selbst definieren und die Attribute strikt pro Typ trennen. Die Komplexitaet (die "Blickwinkel") entsteht dann durch das Verweben dieser unterschiedlichen Typen ueber semantische Kanten.
