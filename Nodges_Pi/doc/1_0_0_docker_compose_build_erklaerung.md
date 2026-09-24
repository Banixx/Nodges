# Funktionsweise von `docker compose up -d --build`

## Wann wird welcher Befehl benoetigt?

1. **`docker compose up -d --build`**:
   - **Verwendungszweck**: Erstmaliges Erstellen des Images und Containers ODER erneutes Bauen nach Aenderungen am `Dockerfile`, an System-Abhaengigkeiten oder beim Einfuegen neuer Dateien im Build-Kontext.
   - **`--build`**: Erzwingt das Neu-Bauen des Images.
   - **`-d`**: Startet den Container im Detached-Modus (im Hintergrund).

2. **`docker compose up -d` (ohne `--build`)**:
   - **Verwendungszweck**: Regelmaessiges Starten. Docker nutzt das bereits erstellte Image und baut es nicht jedes Mal neu.

3. **`docker compose start`**:
   - **Verwendungszweck**: Startet bereits vorhandene, aber gestoppte Container direkt neu (sehr schnell, da kein Build- oder Erstellungsschritt stattfindet).

4. **`docker compose stop`**:
   - **Verwendungszweck**: Stoppt den laufenden Container, ohne ihn zu loeschen.

## Zusammenfassung

Nein, `--build` muss nicht jedes Mal verwendet werden. Fuer den normalen Alltag reicht `docker compose up -d` oder `docker compose start`. Der Schalter `--build` ist nur dann noetig, wenn sich das Dockerfile oder grundlegende Projekt-Konfigurationen geaendert haben.
