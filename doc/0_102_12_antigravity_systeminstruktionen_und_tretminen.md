# Antigravity Systeminstruktionen und Tretminen

## 1. Übersicht der internen Systeminstruktionen

- **`<user_rules>` (User Rules)**: Globale Regeln aus `C:/Users/ich/.gemini/GEMINI.md`.
- **`<customizations>` (Customizations Framework)**:
  - Globale Anpassungen unter `C:/Users/ich/.gemini/config/` (Skills unter `C:/Users/ich/.gemini/config/skills/`, Plugins unter `C:/Users/ich/.gemini/config/plugins/`).
  - Projektspezifische Anpassungen unter `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/`.
- **`<workflows>` (Workflows)**: Schritt-fuer-Schritt-Anleitungen unter `C:/Users/ich/Desktop/code/_projects/Nodges/.agent/workflows/` sowie `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/workflows/`.
- **`<planning_mode>` (Planungsmodus)**: Erzwingt vor tiefgreifenden Aenderungen Erstellung von `C:/Users/ich/.gemini/antigravity-ide/brain/9abbd2f4-c67d-46c6-af63-dd8877542ec3/implementation_plan.md` und `C:/Users/ich/.gemini/antigravity-ide/brain/9abbd2f4-c67d-46c6-af63-dd8877542ec3/walkthrough.md`.
- **`<knowledge_items>` (Knowledge Base)**: KIs unter `C:/Users/ich/.gemini/antigravity-ide/knowledge/`.
- **`<artifacts>` (Artifakte)**: Arbeitsdokumente unter `C:/Users/ich/.gemini/antigravity-ide/brain/9abbd2f4-c67d-46c6-af63-dd8877542ec3/`.

## 2. Identifizierte Tretminen (Diskrepanzen & Fallstricke)

1. **Pfad-Abweichung bei globalen Regeln (AGENTS.md vs. GEMINI.md)**:
   - *Systemspezifikation*: Verweist auf `C:/Users/ich/.gemini/config/AGENTS.md`.
   - *Realitaet*: Die Datei existiert dort nicht. Aktiv geladen wird `C:/Users/ich/.gemini/GEMINI.md`.

2. **Ordnernamen-Mischung (`.agent` vs. `.agents`)**:
   - Im Projekt existieren sowohl `C:/Users/ich/Desktop/code/_projects/Nodges/.agent/workflows/` (z.B. `build_fix.md`) als auch `C:/Users/ich/Desktop/code/_projects/Nodges/.agents/workflows/` (z.B. `fragen.md`, `idee.md`).
   - *Gefahr*: Falsche Ordnerreferenzen fuehren dazu, dass Workflows vom System nicht gefunden werden.

3. **Dateisystem-Sperren durch geschuetzte Pfade**:
   - Direkte Lese- oder Auflistungsversuche von Ordnern wie `C:/Users/ich/.gemini/config` ueber Datei-Werkzeuge werden vom System-Sandbox-Schutz mit einem Rechtefehler blockiert.

4. **Strikte Einschraenkung im Planungsmodus**:
   - Sobald der Planungsmodus aktiv ist, sind jegliche Dateiaenderungen ausserhalb des Ordners `C:/Users/ich/Desktop/code/_projects/Nodges/doc/` ohne explizite Benutzerfreigabe verboten.

5. **Formatierungs- & Konventionsvorgaben**:
   - Absolute Pfade muessen zwingend Vorwaertsschraegstriche und Laufwerksbuchstaben verwenden (`C:/Users/ich/...`).
   - Das Zeichen "ß" darf nicht verwendet werden (Stattdessen "ss").
   - Emojis sind absolut verboten.
