# Setup Nodges — Multi-Harness Arbeitsumgebung

**Stand:** 2026-09-24 · **Verantwortlich:** piCon (Container) + winAnt (Antigravity)
**Dies ist die technische Kurzanleitung.** Der ausfuehrliche Bericht und Dialog steht in **`bericht.md`**.

---

## 1. Architektur (verbindlich: Variante B)

**Linux (WSL2) ist die alleinige Wahrheitsquelle (Single Source of Truth).**

```
EIN physischer Speicherort:  /home/unixusername/nodges   (WSL2, ext4)
   |
   +-- gemountet als /workspace          -> piCon (Container pi-harness)
   |
   +-- fuer Windows erreichbar als
       \\wsl.localhost\Ubuntu\home\unixusername\nodges
                                         -> winAnt (Antigravity)

GitHub (Banixx/Nodges) = Sicherung und Austausch, NICHT Arbeitsort.
```

**Alle Dienste laufen in Linux**, auch LightRAG. Es gibt kein separates Windows-Backend mehr.

| Dienst | Port | Wo |
|---|---|---|
| Vite / Nodges Dev-Server | 5173 | Container |
| LightRAG API | 8000 | Container (intern, nicht nach aussen veroeffentlicht) |
| Vite-Proxy auf LightRAG | 5173 `/lightrag-api` | Container |

**Veraltet / nicht mehr benutzen:** Der alte Windows-Checkout `C:\Users\ich\Desktop\code\_projects\Nodges` ist eine redundante Kopie. Nach Abschluss der Migration loeschen oder umbenennen.

---

## 2. Git-Regeln

| Was | Wert |
|---|---|
| Remote | `git@github.com:Banixx/Nodges.git` (SSH) |
| Arbeitsbranch (beide Harnesses) | **`pi`** |
| Zweiter Branch | `main` |
| Zugang piCon | SSH-Key `id_ed25519` (Kommentar `nodges-container`) |
| Zugang winAnt | HTTPS ueber Windows Credential Manager |

**Verifiziert:** `fetch`, `push` und `push --dry-run` laufen fehlerfrei (Lesen und Schreiben).

**Ablauf — zwingend:**
```
Datei aendern -> git add -> git commit (lokal) -> git push -> GitHub aktuell
```
Ein **Commit** wirkt nur im lokalen Checkout. **Push** laedt hoch. **Pull** holt in einen anderen Checkout.
GitHub wird **nicht** automatisch aktualisiert.

**Kein `git` mit Windows-Git auf dem UNC-Pfad ausfuehren** — die 9P-Bruecke ist sehr langsam. Git-Befehle gehoeren in die Linux-Seite (WSL oder Container).

---

## 3. Zeilenenden (verbindlich geregelt)

Es gibt eine **Root-`.gitattributes`**:

```
* text=auto eol=lf
```

plus `binary`-Ausnahmen fuer PNG/JPG/PDF/ZIP/WOFF. Damit gilt reposweit **LF**.

**Warum das noetig war:** Beim Freigeben von `doc/` meldete Git bei Dutzenden Dateien `CRLF will be replaced by LF`. Die Windows-Seite hatte CRLF geschrieben. Ohne diese Regel meldet Git Dateien als geaendert, deren Inhalt identisch ist.

---

## 4. Dokumentationsablage

| Datei | Zweck |
|---|---|
| **`bericht.md`** (Root) | Gemeinsamer Bericht und Dialog piCon + winAnt |
| **`setup.md`** (Root) | Diese technische Anleitung |
| `doc/` | Arbeitsdokumente von winAnt (mit Versionspraeefix, z. B. `0_106_0_...md`) |
| `docs/` | Weitere Projektdoku |

**Wichtig:** `doc/` ist seit 2026-09-24 **nicht mehr** in der `.gitignore` — es ist versioniert, damit beide Harnesses die Berichte sehen. Beim Freigeben wurde ein Secrets-Scan durchgefuehrt: sauber (nur Platzhalter, keine echten Schluessel).

**Ballast ist bereits bereinigt** (Commit `a844ac5`): `doc/archiv_history/` (252 Dateien), ein Windows-Duplikat („Kopie von …") und fuenf experimentelle `tuned1-5.json` wurden entfernt. `doc/` hat jetzt 333 statt 591 Dateien. Geloeschtes bleibt in der Git-Historie abrufbar.

---

## 5. Identitaet und Autorenschaft

Im Container ist gesetzt: `user.name = Pi Agent`, `user.email = pi-agent@localhost`.
Historisch committeten auch `Banixx`, `Nodges Bot`, `Arbreska Trun` und `bani`.

**Empfehlung von winAnt (noch nicht umgesetzt):** Git-Trailer im Commit, damit Banixx Repo-Owner bleibt und KI-Beitraege transparent sind:
```
Co-authored-by: Antigravity <antigravity@internal>
```

---

## 6. MCP und Werkzeuge

**Es wird kein GitHub-MCP verwendet.** Begruendung (Details in `bericht.md` Abschnitt 3):

- Pi (der Agent) hat **bewusst kein eingebautes MCP** — Erweiterungen sind als Extension oder Skill vorgesehen.
- Der Git-Weg funktioniert verifiziert. Mehr Werkzeuge = mehr Tokens = hoehere Kosten pro Anfrage, ohne Mehrwert fuer Standardsync.
- Bei Bedarf an Issues/Pull-Requests ist die **`gh` CLI** die schlankere Alternative (Node ist vorhanden, `api.github.com` ist erreichbar).

winAnt hat zwar 24 MCP-Werkzeuge verfuegbar, nutzt sie aber fuer Git-Sync **nicht** — ebenfalls aus Tokenspargruenden.

---

## 7. Checkliste fuer einen neuen Harness

1. Dieses `setup.md` lesen, dann `bericht.md` (Detailfragen).
2. `git fetch` und `git status` pruefen — **nie** auf veraltetem Stand arbeiten.
3. Immer ueber `\\wsl.localhost\Ubuntu\home\unixusername\nodges` arbeiten.
4. `git` nur in Linux ausfuehren.
5. Keine Secrets (`.env`, Schluessel) ins Repo — sie bleiben lokal und ignoriert.
6. Vor groesseren Schritten den Benutzer fragen; keine stillen Veraenderungen an fremder Arbeit.

Health-Checks im Container:
```bash
curl -s http://localhost:8000/health
curl -s http://localhost:5173/lightrag-api/health
```

---

## 8. Bekannte offene Punkte

- Windows-Altcopy `C:\...\Nodges` aufloesen (nach Migration).
- `docker-compose.yml` liegt noch ausserhalb des Repos in `C:\Users\ich\Desktop\code\_projects\Nodges_Pi`.
- Letzte Windows-Pfad-Referenz: `.devcontainer/devcontainer.json` (`C:/users/ich/desktop/code/ASSETS/`) — betrifft nur den VS-Code-Pfad, nicht den laufenden Container.
- Branch-Strategie `main` vs. `pi` endgueltig festlegen.
- LightRAG-Daten (`lightrag-backend/rag_storage/`) sind **nicht** versioniert — kein Backup ueber GitHub.

---

*Verfasst von **piCon** (Pi-Coding-Agent im Container `pi-harness`, WSL2 auf Windows 11), 2026-09-24.
Ergaenzungen durch **winAnt** (Antigravity) ausdruecklich erwuenscht.*
