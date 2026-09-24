# Antigravity Zugriffsrechte: Desktop vs. .gemini Ordner

## 1. Zugriffsrechte im Detail

### A) Bereich `C:/Users/ich/Desktop/code/_projects/Nodges/` (Workspace)
- **Status**: Voller Lese- und Schreibzugriff.
- **Funktionen**: Dateien erstellen (`write_to_file`), bearbeiten (`replace_file_content`), Ordner auflisten (`list_dir`), Code durchsuchen (`grep_search`).

### B) Bereich `C:/Users/ich/.gemini/`
- **Konfigurationsordner `C:/Users/ich/.gemini/config/`**:
  - Ordnerauflistung (`list_dir`) ist durch die hartcodierte System-Schutzregel blockiert (`Permission denied ... Matches hardcoded system protection boundary rule`).
- **Datei `C:/Users/ich/.gemini/GEMINI.md`**:
  - Auf diese spezifische Datei existiert direkter Lesezugriff (`view_file`), und die darin definierten Regeln werden vom Antigravity-Laufzeitsystem automatisch geladen.
