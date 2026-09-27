# Stichproben- und Zustandsanalyse der com/-Ordnerstruktur

Dokumentversion: 0.106.8
Datum: 2026-09-27
Gueltigkeitsbereich: W:/com (Quelle) und C:/Users/ich/Desktop/code/_Nodges_Com_Sync (Ziel)

## 1. Uebersicht der Ordnerzustaende

Die folgende Tabelle zeigt die Verteilung von Dateien und Dateigroessen in [W:/com](file:///W:/com) im Vergleich zum Synchronisationsziel [C:/Users/ich/Desktop/code/_Nodges_Com_Sync](file:///C:/Users/ich/Desktop/code/_Nodges_Com_Sync).

| Relativer Pfad | Quelle: Dateien | Ziel: Dateien | Quelle: Bytes | Ziel: Bytes | Status / Zustand |
|---|---|---|---|---|---|
| `com/` (Wurzel) | 6 (+1 Link) | 6 | 86.051 B | 86.051 B | **Synchron** (100% identisch; Linux-Symlink ausgefiltert) |
| `com/doc/` | 268 | 268 | 1.697.624 B | 1.697.624 B | **Synchron** (Vollstaendiges Dokumentenarchiv) |
| `com/doc/git-analyse/` | 2 | 2 | 23.162 B | 23.162 B | **Synchron** (Git-Historienanalyse) |
| `com/doc/git-analyse/mmd/` | 6 | 6 | 3.723 B | 3.723 B | **Synchron** (Mermaid-Diagramme) |
| `com/doc/nodges_by_self/` | 7 | 7 | 16.706 B | 16.706 B | **Synchron** (System- und Architekturreferenz) |
| `com/doc/Nodges_doc_106_8/` | 69 | 69 | 374.172 B | 374.172 B | **Synchron** (Dokumente und Diagramme Version 106.8) |
| `com/doc/NodgesDoc_102_10/` | 85 | 85 | 607.714 B | 607.714 B | **Synchron** (Archivierte Dokumentation Version 102) |
| `com/plan/` | 2 | 2 | 6.801 B | 6.801 B | **Synchron** (Planungsdokumente) |
| `com/plan/build14/` | 2 | 2 | 10.993 B | 10.993 B | **Synchron** (Aktuelle LightRAG- & Build-14-Rapporte) |
| `com/plan/Konzeptionelles/` | 7 | 7 | 105.261 B | 105.261 B | **Synchron** (Konzeptdokumente) |
| `com/setup/` | 1 | 1 | 164 B | 164 B | **Synchron** (Setup-Erkenntnisse) |
| `com/Nodges_doc_106_8/` | 0 (+1 Link) | 0 | 0 B | 0 B | **Synchron** (Enthaelt nur relativen Linux-Symlink) |
| **Gesamt** | **454 Dateien** | **454 Dateien** | **2.842.371 B** | **2.842.371 B** | **100% Uebereinstimmung** |

## 2. Stichproben-Hashvergleich (SHA-256 Integritaet)

Zur Verifikation der Datenintegritaet wurden repraesentative Dateien aus unterschiedlichen Ordnern auf SHA-256-Ebene geprueft:

| Datei | SHA-256 Hash Quelle (W:) | SHA-256 Hash Ziel (Sync) | Integritaet |
|---|---|---|---|
| `00_start_hier.md` | `AC055BAED7CC...` | `AC055BAED7CC...` | **Identisch** |
| `bericht.md` | `55C445DD4947...` | `55C445DD4947...` | **Identisch** |
| `todo.md` | `1DAC97A1DB54...` | `1DAC97A1DB54...` | **Identisch** |
| `doc/0_106_8_autostart_und_betrieb_com_sync.md` | `0529C4059173...` | `0529C4059173...` | **Identisch** |
| `doc/NodgesDoc_102_10/00_index_nodges_V4.md` | `4B584CE9569A...` | `4B584CE9569A...` | **Identisch** |
| `doc/Nodges_doc_106_8/01_MetaphernBibliothek_002.mmd` | `A17FB857E467...` | `A17FB857E467...` | **Identisch** |
| `plan/build14/rapport_build14.md` | `6A74328E251E...` | `6A74328E251E...` | **Identisch** |

## 3. Besonderheit bezueglich Symlinks
In `W:/com` existieren zwei von Linux angelegte relative symbolische Links (`nodges_docs_102_10` und `Nodges_doc_106_8/Nodges_doc_106_8`). Diese verweisen auf Linux-Ebene relativ auf andere Verzeichnisse. Sie werden durch den Parameter `/XJ` in `robocopy` bewusst uebersprungen, da Windows NTFS relative Linux-Pfade nicht aufloesen kann und dies zu Leseabbruechen fuehren wuerde. Alle echten Zieldateien in `com/doc/` sind vollstaendig vorhanden.
