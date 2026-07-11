# Nodges - Projektanalyse (Fragen)

Dieses Dokument beantwortet die Architektur- und Risikocluster-Fragen für die aktuelle Nodges Version (Build 5).

## Welche Teile des Projekts bergen aktuell das höchste Risiko für Fehler oder Regressionen?
Das höchste Risiko liegt in der LLM-Pipeline (`LLMService.ts`), da die asynchrone 3-Stufen-Generierung (Ontologie -> Daten -> Visual Mapping) stark von der Format-Treue des jeweiligen Modells abhängt. Ebenfalls riskant ist die Three.js Rendering-Engine bei extrem großen Netzwerken (Performance, Z-Fighting) sowie die komplexe State-Synchronisation der entkoppelten `MappingUI`.

## Wenn Sie dieses Projekt vereinfachen müssten, ohne die Funktionalität einzuschränken, wo würden Sie ansetzen und warum?
Die Konsolidierung der dreistufigen LLM-Pipeline in weniger Calls würde die Systemkomplexität reduzieren. Sobald LLMs zuverlässiger strukturiertes JSON ausgeben, könnten Ontologie und Daten-Generierung in einem robusten Zod-geführten Schritt kombiniert werden, um Latenz, Token-Kosten und Fehlerquellen durch inkonsistente Übergabestände zu minimieren.

## Welche Probleme sind noch nicht sichtbar, werden aber mit zunehmender Projektgröße auftreten?
Die WebGL-Performance (Three.js) wird bei einer Skalierung von 1.000 auf 100.000 Knoten drastisch einbrechen, falls `InstancedMesh` und Frustum Culling nicht optimal kalibriert sind. Zudem werden die Token-Kosten und Antwortzeiten der OpenRouter-Modelle bei immer umfangreicheren Graphen-Datenstrukturen unverhältnismäßig steigen.

## Welche aktuellen technischen Entscheidungen schränken Skalierbarkeit oder Wartbarkeit ein?
Die Entscheidung für Vanilla CSS (`index.css`) anstelle eines strukturierten Frameworks (wie Tailwind CSS) kann die Wartung einer wachsenden, komplexen UI langfristig erschweren. Weiterhin stellt die clientseitige Architektur (GitHub Pages) ohne dediziertes Backend eine massive Einschränkung für das sichere API-Key-Management dar (BYOK ist nur eine Notlösung).

## Welche Teile des Codes oder der Architektur sollten zuerst isoliert, dokumentiert oder getestet werden?
Die neue Build-5-Pipeline (Entkopplung der Typ-Dominanz) und die zugehörigen Zod-Schemas zur Validierung der LLM-Antworten müssen zwingend isoliert mit Unit-Tests abgedeckt werden. Ebenfalls höchste Priorität hat der `ErrorHandler`, um sicherzustellen, dass fehlschlagende LLM-Calls nicht stillschweigend die UI blockieren.

## Wo kann das tatsächliche Verhalten des Projekts von der ursprünglichen Absicht der Entwickler abweichen?
Nutzer könnten versuchen, Nodges als klassisches 2D-Diagramm-Tool für manuelle Layouts zu missbrauchen, was der Kernphilosophie (Metapherngesteuerte, automatische 3D-Kognition) widerspricht. Auch die LLMs könnten trotz System-Prompts in alte Muster verfallen und wieder typ-dominante Graphen erzeugen.

## Welche Muster, Abstraktionen oder Konventionen könnten die Gesamtkomplexität reduzieren?
Der flächendeckende, konsequente Einsatz des zentralen `ErrorHandler` für alle try-catch Blöcke reduziert Redundanz erheblich. Zudem würde ein zentraler State-Manager (wie Zustand) die aktuell komplexen Event-basierten Aktualisierungen zwischen `MappingUI`, `CreatePanel` und der Three.js-Scene stark vereinfachen.

## Wenn jemand anderes dieses Projekt morgen übernehmen müsste, welche Probleme würden zuerst auftreten?
Ein neuer Entwickler würde am Paradigmenwechsel von Build 5 (völlige Entkopplung der "Type"-Dominanz hin zu globalen Presets und gleichberechtigten Attributen) scheitern, wenn er die Dokumentation nicht verinnerlicht hat. Zudem wäre das lokale Setup der OpenRouter-Keys für das Testen der generativen Features eine unmittelbare Hürde.

## Welche Verbesserungen würden kurzfristig das beste Verhältnis von Aufwand zu Nutzen bieten?
Die Implementierung eines intelligenten Caching-Mechanismus (Session Storage oder Local Storage) für LLM-Antworten würde die Entwicklung beschleunigen und Kosten sparen. Ebenfalls extrem wirkungsvoll wäre ein automatischer Retry-Loop für das LLM, der bei Zod-Validierungsfehlern das Modell auffordert, spezifische JSON-Fehler selbst zu korrigieren.

## Was hindert dieses Projekt aktuell daran, ein produktionsreifes Niveau zu erreichen?
Die fehlende sichere Backend-Infrastruktur zur Kapselung der API-Keys hindert Nodges an einem echten, öffentlichen Release. Solange die Architektur rein clientseitig (GitHub Pages) ist und sensible Aufrufe direkt aus dem Browser erfolgen, bleibt das Tool sicherheitstechnisch auf ein Proof-of-Concept beschränkt, was aktuell den Bedarf an einem Proxy (wie im "plan_proxy") unterstreicht.
