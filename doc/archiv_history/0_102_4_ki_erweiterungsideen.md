# Erweiterungsideen für Nodges Knowledge Items (KIs)

Basierend auf professionellen Softwarearchitektur-Standards und den spezifischen Anforderungen des Nodges-Projekts (LLM-Daten, starke visuelle Ästhetik) fehlen in unserem aktiven Gedächtnis noch vier essenzielle KIs, um das System vollständig abzusichern:

## 1. `ki_nodges_design_system` (UX/UI & Ästhetik)
Da für Nodges der "Wow-Faktor" absolute Priorität hat, reicht es nicht, nur "Glassmorphismus" in die Philosophie zu schreiben.
- **Inhalt**: Die genauen Farbpaletten (HSL-Werte), definierte CSS-Variablen, Typografie-Regeln (z.B. Inter/Roboto), zwingende Animations-Dauern für Transitions und die exakten Schatten-Werte für den Glass-Effekt.
- **Warum wichtig**: So erfinde ich beim Generieren neuer UI-Komponenten keine neuen Farben, sondern nutze exakt die bestehenden Tokens aus der `index.css`.

## 2. `ki_nodges_llm_pipeline` (Daten-Generierung)
Nodges hängt massgeblich davon ab, dass LLMs saubere Graphen-Daten liefern.
- **Inhalt**: Der genaue 3-Stufen-Workflow (Ontologie -> Daten -> Visual Mapping). Welche Prompts liegen wo (z.B. in `public/prompts/`), welche Modelle werden bevorzugt, und wie wird Zero Data Retention sichergestellt.
- **Warum wichtig**: Garantiert, dass jede zukünftige Automatisierung zur Datengenerierung den strengen JSON-Schemas folgt und Datenschutz-Vorgaben einhält.

## 3. `ki_nodges_testing_und_qa` (Qualitätssicherung)
- **Inhalt**: Wie wird getestet? Welche Edge-Cases im 3D-Rendering (z.B. tausende Nodes, verschwindende Kanten) müssen beachtet werden? Wie wird die Vitest-Umgebung gestartet?
- **Warum wichtig**: Zwingt mich dazu, nach jeder Code-Änderung genau diese Kantenfälle zu überprüfen, anstatt nur auf Fehlerfreiheit beim Kompilieren zu achten.

## 4. `ki_nodges_deployment` (Release & Hosting)
- **Inhalt**: Wie wird die App gebaut (`npm run build`), wo wird sie gehostet (GitHub Pages), und wie ist die GitHub Actions Pipeline konfiguriert?
- **Warum wichtig**: Verhindert Versionskonflikte und Pfad-Fehler (wie z.B. fehlerhafte Base-URLs), wenn wir das Projekt für die Öffentlichkeit kompilieren.
