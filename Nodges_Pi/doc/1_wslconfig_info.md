# Dokumentation: Status von .wslconfig

Die Datei `C:/Users/ich/.wslconfig` existiert bereits auf dem System mit folgendem Inhalt:

```ini
[wsl2]
memory=14GB
processors=6
swap=4GB

[experimental]
autoMemoryReclaim=gradual
```

## Hinweis zum Auffinden im Windows Explorer
Dateien mit einem Punkt am Anfang (wie `.wslconfig`) gelten unter Windows als versteckt. Um sie im Explorer zu sehen, muss unter "Anzeigen" die Option "Ausgeblendete Elemente" aktiviert sein.

## Empfohlene Ergaenzung fuer Docker & Vite Netzwerkanbindung
Um den Netzwerk-Spiegelungsmodus (`networkingMode=mirrored`) zu aktivieren, wird der Abschnitt `[wsl2]` um eine Zeile ergaenzt:

```ini
[wsl2]
memory=14GB
processors=6
swap=4GB
networkingMode=mirrored

[experimental]
autoMemoryReclaim=gradual
```
