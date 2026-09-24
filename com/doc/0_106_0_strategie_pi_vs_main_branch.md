# Strategievergleich: Bei pi bleiben oder pi zu main machen?

## Kernaussage und Empfehlung

Es ist sehr empfehlenswert, `main` auf den Stand von `pi` zu bringen, da `pi` alle bisherigen Commits von `main` bereits vollstaendig enthaelt und `main` somit per Fast-Forward ohne jegliche Merge-Konflikte aktualisiert werden kann.

## Technische Ausgangslage

Eine Pruefung der Commit-Historie zeigt:
* `git log pi..main` ist **leer**.
* Das bedeutet: Auf `main` gibt es keine Aenderungen, die nicht schon in `pi` enthalten sind.
* `pi` ist dem Stand von `main` um 14 Commits voraus (unter anderem Version `0.106.0`, In-Container LightRAG, Testdaten, Plan v4).

---

## Die beiden Optionen im Vergleich

### Option 1: `main` auf den Stand von `pi` aktualisieren (Empfohlen)

Hierbei wird `main` auf den identischen Commit `80236c5` wie `pi` gebracht.

* **Vorteile**:
  * Auf GitHub zeigt der Standard-Branch `main` sofort das aktuelle Projekt (Version `0.106.0`).
  * Jeder, der das Repository ohne Angabe eines Branches klont, erhaelt direkt den aktuellen, lauffaehigen Stand.
  * Saubere Open-Source- und Git-Best-Practice.
* **Wie es danach weitergeht**:
  * **Variante 1A (Zwei-Zweige-Modell / Standard Git-Flow)**: Du behaeltst `pi` als Entwicklungszweig im Container. Immer wenn ein Meilenstein fertig ist, wird `pi` kurz in `main` gemergt.
  * **Variante 1B (Ein-Zweig-Modell)**: Sowohl Windows als auch der Container wechseln auf `main`, und `pi` wird geloescht. Alles laeuft nur noch ueber `main`.

### Option 2: Nur bei `pi` bleiben

Hierbei bleibt `main` unberuehrt auf dem alten Stand `0.103`.

* **Vorteile**:
  * Im Moment kein zusaetzlicher Befehl noetig.
* **Nachteile**:
  * Auf GitHub ist weiterhin `main` die Standard-Startseite, wodurch Besucher oder neue Klone ein veraltetes Projekt sehen (ausser man stellt in den GitHub-Settings den Default-Branch explizit von `main` auf `pi` um).
  * `main` veraltet immer weiter.

---

## Konkreter Ablauf fuer Option 1 (Fast-Forward-Merge)

Falls du `main` aktualisieren moechtest, sind die Befehle denkbar einfach:

```powershell
# 1. Auf main wechseln
git checkout main

# 2. Konfliktfrei per Fast-Forward auf den Stand von pi bringen
git merge --ff-only pi

# 3. Den aktualisierten main-Branch zu GitHub pushen
git push origin main

# 4. Wieder zurueck auf pi wechseln (falls pi als Arbeitsbranch bleibt)
git checkout pi
```
