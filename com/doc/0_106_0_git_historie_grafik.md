# Grafische Darstellung der Git-Historie (Nodges)

## Kernaussage

Ja, hier ist die grafische Darstellung der Git-Historie von Nodges, welche die Entwicklung ueber den Branch `pi`, den Merge mit `main` und den aktuellen gemeinsamen Stand (`80236c5`) abbildet.

## Git-Flussdiagramm

```mermaid
flowchart TD
    c_1d177e5["1d177e5 - Version 0.103 (Gemeinsame Basis)"]

    subgraph PiBranch["Entwicklungsstrang: pi (Container & LightRAG)"]
        c_5b355b9["5b355b9 - 0.103.1 von Pi"]
        c_91138a5["91138a5 - Version 104"]
        c_cfe5658["cfe5658 - zwuetschged"]
        c_d8bef5b["d8bef5b - Version 0.105.0"]
        c_2e44e67["2e44e67 - Version 0.105.1"]
        c_346d9c2["346d9c2 - 0.105 zueglete"]
        c_2b3a97b["2b3a97b - key restriction"]
        c_10d6c50["10d6c50 - LightRAG im Container"]
        c_d4391c0["d4391c0 - Stand 0.105.1"]
        c_69163fc["69163fc - Version 0.106.0: LLM Netzwerk-Diagnose"]
        c_20acf62["20acf62 - Testdaten, Build 13 & Berichte"]
    end

    subgraph MainBranch["Paralleler Strang: main (Driveupload Fix)"]
        c_476bf6c["476bf6c - chore: stop tracking .tmp.driveupload"]
    end

    c_d6416a6["d6416a6 - Merge origin/main in pi"]
    c_80236c5["80236c5 - Plan v4: Diagnose & Refactoring\n(Aktueller HEAD: main & pi)"]

    c_1d177e5 --> c_5b355b9
    c_5b355b9 --> c_91138a5
    c_91138a5 --> c_cfe5658
    c_cfe5658 --> c_d8bef5b
    c_d8bef5b --> c_2e44e67
    c_2e44e67 --> c_346d9c2
    c_346d9c2 --> c_2b3a97b
    c_2b3a97b --> c_10d6c50
    c_10d6c50 --> c_d4391c0
    c_d4391c0 --> c_69163fc
    c_69163fc --> c_20acf62

    c_1d177e5 --> c_476bf6c

    c_20acf62 --> c_d6416a6
    c_476bf6c --> c_d6416a6

    c_d6416a6 --> c_80236c5
```

## Erklaerung der Phasen

1. **Gemeinsamer Ausgangspunkt (`1d177e5` - Stand 0.103)**:
   - Bis zu diesem Punkt lief die urspruengliche Entwicklung auf `main`.

2. **Hauptentwicklung auf Branch `pi`**:
   - Ab `5b355b9` fand die Hauptarbeit fuer den Container, die Docker-Harness-Bereitstellung, LightRAG im Container und die Build-13-Erweiterungen im Branch `pi` statt.
   - Versionen stiegen schrittweise ueber `0.104`, `0.105.0`, `0.105.1` bis `0.106.0`.

3. **Pflege auf `main` (`476bf6c`)**:
   - Einziger zwischenzeitlicher Commit auf `main` war das Bereinigen des temporaeren `.tmp.driveupload`-Ordners.

4. **Wiedervereinigung (`d6416a6` & `80236c5`)**:
   - `d6416a6`: Der Stand von `main` wurde komplett in `pi` integriert.
   - `80236c5`: Hinzufuegen von Plan v4.
   - Anschliessend wurde `main` per Fast-Forward auf denselben Commit `80236c5` vorgezogen.
   - Ergebnis: Beide Branches (`main` und `pi`) stehen heute auf exakt derselben Spitze.
