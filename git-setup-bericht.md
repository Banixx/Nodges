# Git-Setup Bericht (Nodges)

Stand: geprüft im Container (`/workspace`)

## Die drei Ebenen

| Ebene | Pfad | Rolle |
|---|---|---|
| GitHub (zentral) | `github.com/Banixx/Nodges` | Gemeinsamer Tauschpunkt (kein "echtes" Zentrum, nur Sync-Knoten) |
| Windows-Host | `C:\Users\ich\Desktop\code\_projects\...` | Lokale Arbeitskopie 1, per Git mit GitHub verbunden |
| Pi-Container | `/workspace` | Lokale Arbeitskopie 2, eigene Git-Historie, **dasselbe** Remote |

## Geprüfte Fakten (Container)

- Remote `origin`: `git@github.com:Banixx/Nodges.git` (fetch + push)
- Aktiver Branch: `pi` (nicht `main`)
- Branches: `main`, `pi` (lokal); Remote: `origin/main`, `origin/pi`, `origin/feature/multi-build`
- Letzte Commits auf `pi`: `d4391c0` (0.105.1), `10d6c50` (LightRAG im Container...), `2b3a97b` (key restriction)

## Bedeutung

- Der Container hat **kein eigenes GitHub-Repo**, sondern ist mit demselben verbunden wie der Windows-Host.
- Es existieren **zwei unabhängige lokale Repositories** (Arbeitskopien), die nur über GitHub synchronisiert werden.
- Änderungen werden lokal committet und per `git push` hochgeladen bzw. per `git pull` von der anderen Seite geholt.

## Arbeitsablauf (empfohlen)

1. Im Container: arbeiten → `git commit` → `git push origin pi`
2. Auf Windows: `git pull` (falls dort `main` genutzt wird, vorher Merge bzw. Pull Request über GitHub)
3. Umgekehrt analog: Host committet/pusht → Container macht `git pull`

## Hinweise

- Branch `pi` dient der Container-seitigen Arbeit, `main` bleibt der stabile Zweig.
- Merge = Zusammenführung zweier Änderungsstränge; nötig, wenn beide Seiten an derselben Historie hängen.
- Remote-URL nutzt SSH (`git@github.com:`), d.h. im Container muss ein gültiger SSH-Key hinterlegt sein (war laut Commits offenbar der Fall).
