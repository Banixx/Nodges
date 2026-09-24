# Abspaltpunkt und Branch-Vergleichs-Strategie

Dokumentation zur Herkunft des Branches `refactor/pi-stabilization`, zum genauen Verzweigungspunkt und zum Vorgehen fuer parallele Varianten.

---

## 1. Exakter Abspaltpunkt von `refactor/pi-stabilization`

Der Branch `refactor/pi-stabilization` hat sich an folgendem Punkt abgespalten:

- **Commit-Hash**: `d4391c01546c3d5123bcbdb0999ac505f61dea41` (Kurz: `d4391c0`)
- **Commit-Nachricht**: `0.105.1`
- **Datum**: Dienstag, 22. September 2026, 08:18:26 UTC
- **Autor**: Pi Agent
- **Zugehoeriger Branch**: Dies ist der Kopf (`HEAD`) des Branches `pi` (identisch mit `origin/pi`).

Seit diesem Punkt wurden auf `refactor/pi-stabilization` 6 zusaetzliche Commits durchgefuehrt:
1. `54a5f9e` (*cleanup: remove large generated json files and error dumps from public data*)
2. `1c918f1` (*chore: add generated graph data and temporary dumps to .gitignore*)
3. `2df4044` (*perf: defuse glob import in FilePanelUI and load small default graph on app start*)
4. `8d60d9b` (*cleanup: remove unused deno-proxy and legacy layout-worker.js*)
5. `ca41a9d` (*refactor: extract DataManager and RenderEngine from App.ts into 3-layer architecture*)
6. `4691500` (*+mmd*)

---

## 2. Antwort auf die Frage zum Branch-Vergleich

**Ja**, genau fuer diesen Anwendungsfall ist das Branching-Modell von Git ausgelegt:

1. **Vollstaendige Isolation**:
   - Wenn von Commit `d4391c0` (oder direkt vom Branch `pi`) ein neuer Branch erstellt wird (z.B. `refactor/pi-variante2`), bleibt `refactor/pi-stabilization` im aktuellen Zustand komplett unberuehrt.
2. **Spaeterer Vergleich**:
   - Beide Varianten koennen jederzeit miteinander verglichen werden, beispielsweise per Befehl:
     ```bash
     git diff refactor/pi-stabilization refactor/pi-variante2
     ```
   - Auch grafische Diffs in VS Code oder anderen Git-Werkzeugen sind direkt moeglich.
3. **Entscheidungsfindung & Zusammenfuehrung**:
   - Nach dem Testen kann die favorisierte Variante in `pi` oder `main` gemergt werden (`git merge`), waehrend die andere Variante entweder verworfen oder zu Dokumentationszwecken als Branch erhalten bleibt.

---

## 3. Befehle zum Erstellen des neuen Zweigs (sobald gewuenscht)

Um an den Ausgangspunkt `d4391c0` zurueckzukehren und einen neuen Branch anzulegen:

```bash
# Neuer Branch ausgehend vom Stand d4391c0 (Branch pi)
git checkout -b <neuer-branch-name> d4391c0
```
