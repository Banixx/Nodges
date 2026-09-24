# Anleitung zum Testen des Temporal-Objekts

Um das temporale Verhalten (Zeitstrahl, Keyframe-Animationen, Ein-/Ausblenden von Knoten und Kanten) zu testen, muss die JSON-Struktur der Graphdaten korrekte `temporal`-Eigenschaften enthalten.

## Anpassung der Prompts
Die System-Prompts und Beispiel-Strukturen fuer **Build 6** und **Build 10** wurden erweitert:
* `C:/Users/ich/Desktop/code/_projects/Nodges/src/prompts/build_6_prompt.md`
* `C:/Users/ich/Desktop/code/_projects/Nodges/src/prompts/build_10_prompt.md`
* `C:/Users/ich/Desktop/code/_projects/Nodges/src/utils/LLMService.ts` (Beispiel-JSONs fuer Build 6 und Build 10)

Das LLM kennt nun die exakte Struktur des `temporal`-Objekts (inklusive `validFrom`, `validTo` und `history`).

---

## Empfohlene Test-Prompts fuer die UI

Nutzen Sie einen der folgenden Prompts im Erstellungs-Panel (Build 6 oder Build 10), um das LLM explizit zur Generierung temporaler Daten zu zwingen:

### Test-Prompt 1: Römische Geschichte (Epochen)
> "Die Geschichte Roms. Nutze explizit das optionale temporal-Objekt mit validFrom und validTo fuer die Knoten und Kanten, um Epochen und die Lebensdauer von historischen Personen abzubilden. Fuege auch ein history-Array fuer Aenderungen an Attributen hinzu."

### Test-Prompt 2: Zweiter Weltkrieg (Ereignisse)
> "Der zweite Weltkrieg als Graph. Nutze das temporal-Objekt fuer alle Knoten und Beziehungen (Bündnisse, Schlachten), um die zeitliche Entwicklung zwischen 1939 und 1945 zu visualisieren. Veraendere die Wichtigkeit einiger Laender ueber das history-Array."

---

## Pruefung in der Anwendung
Sobald der Graph geladen ist:
1. Erscheint am unteren Bildschirmrand die **TimePlayer-Leiste** (Play/Pause, Slider, Geschwindigkeitsauswahl).
2. Ticks auf dem Zeitstrahl zeigen die Zeitpunkte an, an denen sich Eigenschaften aendern oder Knoten gueltig werden.
3. Beim Bewegen des Sliders blenden sich Knoten/Kanten gemaess `validFrom`/`validTo` ein und aus.
