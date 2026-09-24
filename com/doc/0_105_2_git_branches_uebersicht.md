# Uebersicht und Bedeutung der Git-Branches in Nodges

## Uebersicht

Im Repository existieren drei wesentliche Branches auf GitHub sowie die symbolische HEAD-Referenz, was bei der Anzeige ueber Git vier Eintraege ergibt:

1. **`pi`** (Aktueller Arbeits-Branch fuer Container und Pi-Agent)
2. **`main`** (Hauptzweig des Repositories)
3. **`feature/multi-build`** (Aelterer Feature-Branch)
4. **`origin/HEAD`** (Standard-Verweis auf `origin/main`)

## Detailbeschreibung der Branches

### 1. `pi` (Aktiv im Container)
* **Zweck**: Dies ist der Entwicklungs-Branch, auf dem der Pi-Agent und die Docker-Umgebung laufen.
* **Aktueller Stand**: Version 0.105.1 / 0.105.2.
* **Besonderheiten**: Enthaelt die Anpassungen fuer LightRAG im Docker-Container ([start-lightrag.sh](file:///C:/Users/ich/Desktop/code/_projects/Nodges/.devcontainer/start-lightrag.sh)), Start-Skripte und die Container-Konfiguration.
* **Verwendung**: Dies ist der Branch, der im `pi-harness`-Container ausgecheckt ist und auf dem aktuell gearbeitet wird.

### 2. `main` (Urspruenglicher Haupt-Branch)
* **Zweck**: Der urspruengliche Hauptentwicklungszweig des Projekts vor Einfuehrung des Pi-Containers.
* **Stand**: Version 0.103.
* **Verwendung**: Dient als stabiler Referenz-Branch. Entwicklungen aus `pi` koennen spaeter in `main` gemergt werden.

### 3. `feature/multi-build` (Historischer Feature-Branch)
* **Zweck**: Experimenteller Branch fuer Multi-Build-Unterstuetzung (Build 5).
* **Stand**: Version 0.102.3.
* **Verwendung**: Historischer Stand, aktuell inaktiv.

### 4. `remotes/origin/HEAD` (Symbolische Referenz)
* Zeigt standardmaessig auf `origin/main`, um anzugeben, welcher Branch beim Klonen ohne Angabe eines Branch-Namens standardmaessig ausgecheckt wird.

## Anzeige bei `git branch -a` bzw. `git branch -r`

Wird im Container (`/workspace`) oder in WSL2 `git branch -a` aufgerufen, sieht die Ausgabe typischerweise so aus:

```text
  main
* pi
  remotes/origin/HEAD -> origin/main
  remotes/origin/feature/multi-build
  remotes/origin/main
  remotes/origin/pi
```

Auf Remote-Ebene (`git branch -r`) sind es exakt die 4 Zeilen:
* `origin/HEAD -> origin/main`
* `origin/feature/multi-build`
* `origin/main`
* `origin/pi`

## Empfehlung

Fuer alle aktuellen Arbeiten im Pi-Container sollte weiterhin auf dem Branch **`pi`** gearbeitet werden, da nur dort die Container-spezifischen Anpassungen und die aktuelle Version (0.105.x) vorhanden sind.
