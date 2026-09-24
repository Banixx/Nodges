# Faehigkeiten von Antigravity bezueglich des GitHub-Repositories von Nodges

Dieses Dokument fasst zusammen, welche Faehigkeiten und Schnittstellen Antigravity aus dieser Umgebung heraus fuer die Interaktion mit dem GitHub-Repository `https://github.com/Banixx/Nodges.git` besitzt.

## 1. GitHub MCP-Server (`github-mcp-server`) - Verifiziert und Aktiv

Der GitHub MCP-Server ist in dieser Sitzung ueber `call_mcp_tool` voll einsatzbereit und als Benutzer `Banixx` authentifiziert. Folgende Faehigkeiten stehen direkt zur Verfuegung:

- **Benutzer & Account:** `get_me` (Profil, Repositories, Metadaten).
- **Branches & Commits:** `list_branches` (z.B. Remote-Branches `main` und `pi`), `list_commits` (Commit-Verlauf mit Filtern nach Pfad, Autor, Zeit), `get_commit`.
- **Dateien direkt von GitHub laden:** `get_file_contents` (liest Dateien beliebiger Branches direkt vom Server, ohne sie lokal auschecken zu muessen).
- **Issues & Pull Requests:** `list_issues`, `issue_read`, `list_issue_fields`, `list_issue_types`, `list_pull_requests`, `pull_request_read`.
- **Releases & Tags:** `list_releases`, `get_latest_release`, `get_release_by_tag`, `list_tags`, `get_tag`, `get_label`.
- **GitHub-Suche:** `search_code`, `search_commits`, `search_issues`, `search_pull_requests`, `search_repositories`, `search_users`.

## 2. Lokale Git-Steuerung ueber die Windows-Shell (Schreibend & Synchronisation)

Antigravity verfuegt ueber volle Shell-Ausfuehrungsrechte im lokalen Projektordner `C:/Users/ich/Desktop/code/_projects/Nodges`. Da der Git Credential Manager (`manager`) eingerichtet ist und `origin` auf `https://github.com/Banixx/Nodges.git` zeigt, sind saemtliche Standard-Git-Operationen moeglich:

- **Lesend:**
  - `git fetch` zum Abrufen neuer Commits, Tags und Branches von GitHub.
  - `git pull` zum Aktualisieren des lokalen Arbeitsstands.
  - `git log origin/main..HEAD` bzw. `git status` zum Vergleichen des lokalen Stands mit dem Stand auf GitHub.
  - `git diff` zur Pruefung von Aenderungen gegenueber Remote-Branches.
- **Schreibend:**
  - `git push` zum Hochladen von lokalen Commits in Remote-Branches auf GitHub.
  - Anlegen neuer Branches und Pushen zum Remote (`git push -u origin <branch>`).
  - Loeschen von Remote-Branches (`git push origin --delete <branch>`).
  - Erstellen und Pushen von Git-Tags/Releases (`git push --tags`).

## 3. Automatisierte Workflows und Skills

- **SGC-Skill (`sgc`):**
  - Der Skill [SKILL.md](file:///C:/Users/ich/Desktop/code/_projects/Nodges/.agents/skills/sgc/SKILL.md) fuehrt automatisiert Versionserhoehungen in [package.json](file:///C:/Users/ich/Desktop/code/_projects/Nodges/package.json) durch, staged alle Dateien (`git add .`), erstellt einen standardisierten Commit und pusht diesen direkt auf GitHub.

## 4. Direkter Zugriff ueber Web- und REST-APIs

- Antigravity kann ueber Werkzeuge wie `read_url_content` oder Shell-Aufrufe (`curl`, `Invoke-RestMethod`) direkt mit der GitHub REST API kommunizieren.
