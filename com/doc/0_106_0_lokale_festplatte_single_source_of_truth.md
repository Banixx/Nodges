# Architektur-Konzept: Lokale Windows-Festplatte und lokales Git als Single Source of Truth

## 1. Grundsatz und Datenfluss

Wenn die lokale Windows-Festplatte (`C:/Users/ich/Desktop/code/_projects/Nodges`) die alleinige Fuehrungsinstanz (Single Source of Truth) ist, gilt ein klarer zweistufiger Ablauf:

```
[Agenten: Antigravity / Pi-Container]
                 │
                 ▼ (1. Schreiben / Bearbeiten)
[Lokale Festplatte: C:/Users/ich/Desktop/code/_projects/Nodges]
                 │
                 ▼ (2. git add & git commit)
[Lokales Git-Repository: .git auf Festplatte]
                 │
                 ▼ (3. git push - optional / Backup)
[GitHub Remote]
```

1. **Vom Harness auf die Festplatte**:
   Wenn ein Agent Code aendert, landet die Datei sofort als echter Text direkt auf der Festplatte im Dateisystem.
2. **Von der Festplatte ins lokale Git**:
   Erst durch `git add` und `git commit` wird dieser Zustand im lokalen Git festgehalten. Das lokale Git ist ab diesem Moment der offizielle Versionsstand.
3. **Zu GitHub**:
   GitHub ist in diesem Modell nur noch ein ausgelagertes Backup oder ein Spiegel, nicht mehr die fuehrende Schaltstelle.

---

## 2. Wie bindet man den Pi-Harness an diese Single Source of Truth an?

Bislang mountet der Pi-Container das WSL2-Verzeichnis:
`REPO_PATH=\\wsl.localhost\Ubuntu\home\unixusername\nodges`

Um die Windows-Festplatte zur alleinigen Quelle zu machen, muss der Container direkt diesen Windows-Ordner nutzen:
`REPO_PATH=C:\Users\ich\Desktop\code\_projects\Nodges`

### Vorteile:
- Es existiert nur noch **ein einziger** Ordner und **ein einziges** `.git`.
- Wenn Antigravity eine Datei speichert, sieht der Pi-Container sie im selben Bruchteil einer Sekunde (und umgekehrt).
- Kein Push/Pull zwischen den beiden Agenten mehr noetig.

### Wichtige technische Leitplanken bei diesem Modell:
1. **node_modules & Python venv**:
   Windows und Linux benoetigen unterschiedliche kompilierte Dateien. Diese duerfen nicht gemeinsam auf NTFS liegen, sondern muessen als isolierte Docker-Volumes im Container laufen.
2. **Git-Sperren (index.lock)**:
   Da beide Agenten denselben `.git`-Ordner nutzen, duerfen sie nicht exakt in derselben Sekunde einen Git-Befehl absetzen.
3. **I/O-Geschwindigkeit**:
   WSL2 greift ueber das 9P-Protokoll auf Windows NTFS zu, was fuer Dateizugriffe im Container etwas langsamer ist als natives Linux-ext4.
