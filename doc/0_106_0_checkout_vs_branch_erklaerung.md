# Git-Klarstellung: Checkout vs. Branch und aktueller Standort

## 1. Unterschied zwischen Checkout und Branch

- **Branch (Entwicklungszweig):**
  Ein logischer Zeiger in Git auf eine bestimmte Commit-Abfolge (z.B. `pi` oder `main`).
- **Checkout (Arbeitskopie / Verzeichnis auf der Festplatte):**
  Ein physischer Dateiordner auf der Festplatte, in dem Git die Dateien des ausgewaehlten Branches bereitstellt.

Ein Checkout ist also **nicht** der Branch selbst, sondern der physische Ordner, in den ein bestimmter Branch ausgecheckt wurde.

---

## 2. Wer ist wo? (Aktuelle Zuteilung)

| Instanz | Physischer Ort (Checkout) | Dateisystem | Ausgecheckter Branch | Letzter lokaler Commit |
|---|---|---|---|---|
| **Antigravity (winAnt)** | `C:/Users/ich/Desktop/code/_projects/Nodges` | Windows (NTFS) | `pi` | `80236c5` (Plan v4) |
| **Pi-Agent (piCon)** | `//wsl.localhost/Ubuntu/home/unixusername/nodges` (Container: `/workspace`) | Linux WSL2 (ext4) | `pi` | `3068512` (Multi-Harness-Doku) |
| **GitHub (origin)** | Remote-Server (`github.com/Banixx/Nodges`) | Cloud | `pi` (und `main`) | `80236c5` (Plan v4) |

---

## 3. Kernursache

Beide Instanzen stehen auf demselben Branch (`pi`), aber in **zwei getrennten Dateiordnern**.
Weil Pi seinen neuen Commit `3068512` nur in seinem lokalen Ordner unter WSL2 gespeichert und noch nicht zu GitHub gepusht hat, ist er im Windows-Ordner noch nicht sichtbar.
