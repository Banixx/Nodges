#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Pi-Agent: Sichere Branch-Setup Automatisierung
# Ausführung: In WSL2 (nicht im Container!)
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# --- 1. Umgebungsprüfungen ---
info "Prüfe Umgebung..."

if ! grep -qi microsoft /proc/version 2>/dev/null; then
    warn "Kein WSL2 erkannt. Dieses Skript ist für WSL2 optimiert."
    read -rp "Trotzdem fortfahren? (j/N) " ans
    [[ "$ans" =~ ^[Jj] ]] || exit 1
fi

command -v git >/dev/null 2>&1 || error "git nicht installiert: sudo apt-get install git"
command -v ssh >/dev/null 2>&1 || error "ssh nicht installiert: sudo apt-get install openssh-client"

# Docker-Prüfung (Docker Desktop, docker-ce oder docker.io sind alle OK)
if ! command -v docker >/dev/null 2>&1; then
    error "Docker nicht im PATH.\n  Option A: Docker Desktop starten (WSL-Integration aktivieren)\n  Option B: sudo apt-get install docker.io"
fi

if ! docker compose version >/dev/null 2>&1 && ! docker-compose version >/dev/null 2>&1; then
    error "docker compose nicht verfügbar. Bei docker.io: sudo apt-get install docker-compose-plugin"
fi

# Teste, ob Docker-Daemon erreichbar ist
if ! docker info >/dev/null 2>&1; then
    error "Docker-Daemon nicht erreichbar.\n  • Docker Desktop läuft?\n  • Oder: sudo systemctl start docker"
fi

# --- 2. Konfiguration abfragen ---
echo ""
echo "=========================================="
echo "  Pi-Agent: Branch-Setup"
echo "=========================================="
echo ""

read -rp "GitHub-Repo-URL (SSH oder HTTPS): " REPO_URL
[[ -z "$REPO_URL" ]] && error "Repo-URL erforderlich"

# HTTPS → SSH konvertieren (für SSH-Agent-Support im Container)
if [[ "$REPO_URL" == https://github.com/* ]]; then
    REPO_SSH=$(echo "$REPO_URL" | sed -E 's#https://github.com/##; s#/+$##; s#\.git$##; s#^#git@github.com:#; s#$#.git#')
    warn "HTTPS erkannt – konvertiere zu SSH für SSH-Agent-Support."
    info "  Alt: $REPO_URL"
    info "  Neu: $REPO_SSH"
    REPO_URL="$REPO_SSH"
fi

read -rp "Branch-Name für Pi [pi-feature]: " BRANCH_NAME
BRANCH_NAME="${BRANCH_NAME:-pi-feature}"

read -rp "Ziel-Pfad in WSL2 [~/nodges]: " TARGET_PATH
TARGET_PATH="${TARGET_PATH:-~/nodges}"
TARGET_PATH="$(eval echo "$TARGET_PATH")"

# Pfad-Validierung: Systemverzeichnisse verbieten
if [[ "$TARGET_PATH" == /dev/* || "$TARGET_PATH" == /sys/* || "$TARGET_PATH" == /proc/* || "$TARGET_PATH" == /run/* ]]; then
    error "Ungültiger Pfad: $TARGET_PATH\n  Dies ist ein Linux-Systemverzeichnis.\n  Bitte verwende einen Pfad unter deinem Home-Verzeichnis, z.B. ~/nodges"
fi

# Prüfe Schreibrechte im Parent
TARGET_PARENT=$(dirname "$TARGET_PATH")
if [[ ! -d "$TARGET_PARENT" ]]; then
    mkdir -p "$TARGET_PARENT" 2>/dev/null || error "Parent-Verzeichnis '$TARGET_PARENT' kann nicht erstellt werden.\n  Bitte verwende einen Pfad unter deinem Home-Verzeichnis, z.B. ~/nodges"
fi
if [[ ! -w "$TARGET_PARENT" ]]; then
    error "Keine Schreibrechte in '$TARGET_PARENT'.\n  Bitte verwende einen Pfad unter deinem Home-Verzeichnis, z.B. ~/nodges"
fi

read -rp "Custom-Verzeichnis in WSL2 für Agenten [~/.pi]: " CUSTOM_PATH
CUSTOM_PATH="${CUSTOM_PATH:-~/.pi}"
CUSTOM_PATH="$(eval echo "$CUSTOM_PATH")"
mkdir -p "$CUSTOM_PATH" 2>/dev/null || true

read -rp "OpenRouter API-Key (oder ENTER falls schon in .env): " OPENROUTER_KEY

# --- 3. UID/GID ermitteln ---
USER_ID=$(id -u)
GROUP_ID=$(id -g)
info "WSL-User: UID=$USER_ID, GID=$GROUP_ID"

# --- 4. SSH-Agent prüfen ---
info "Prüfe SSH-Agent..."

# Versuche automatisch zu starten, falls nicht aktiv
if [[ -z "${SSH_AUTH_SOCK:-}" ]] || ! ssh-add -l >/dev/null 2>&1; then
    warn "SSH-Agent nicht aktiv oder keine Keys geladen. Starte automatisch..."
    eval "$(ssh-agent -s 2>/dev/null)" >/dev/null 2>&1 || true
    for key in ~/.ssh/id_ed25519 ~/.ssh/id_rsa ~/.ssh/id_ecdsa ~/.ssh/id_ed25519_github; do
        if [[ -f "$key" ]]; then
            ssh-add "$key" 2>/dev/null && info "Key geladen: $key" && break
        fi
    done
fi

if ! ssh-add -l >/dev/null 2>&1; then
    error "Kein SSH-Key im Agent.\n  1. eval \$(ssh-agent -s)\n  2. ssh-add ~/.ssh/id_ed25519\n  3. Erstelle Key falls nötig: ssh-keygen -t ed25519 -C 'pi@local'"
fi

SSH_AUTH_SOCK="${SSH_AUTH_SOCK:-}"
info "SSH-Agent Socket: $SSH_AUTH_SOCK"

# --- 5. Git Worktree anlegen ---
info "Bereite Worktree vor: $TARGET_PATH"

if ! mkdir -p "$(dirname "$TARGET_PATH")" 2>/dev/null; then
    error "Konnte Verzeichnis nicht anlegen: $(dirname "$TARGET_PATH")\n  Prüfe Schreibrechte und verwende einen Pfad unter ~/, z.B. ~/dev/pi"
fi

BARE_DIR="$(dirname "$TARGET_PATH")/$(basename "$TARGET_PATH")-bare"

if [[ -d "$BARE_DIR" ]]; then
    warn "Bare-Repo existiert bereits: $BARE_DIR"
else
    git clone --bare "$REPO_URL" "$BARE_DIR"
fi

cd "$BARE_DIR"

# Remote aktualisieren (falls Bare schon existierte)
git fetch origin || true

# Branch anlegen, falls nicht existiert
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    info "Branch '$BRANCH_NAME' existiert bereits im Bare-Repo"
else
    # Prüfe ob auf origin existiert
    if git ls-remote --heads origin "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
        info "Branch existiert auf origin, erstelle lokal..."
        git branch "$BRANCH_NAME" "origin/$BRANCH_NAME" || git branch "$BRANCH_NAME"
    else
        info "Erstelle neuen Branch '$BRANCH_NAME' von origin/main (oder master)..."
        DEFAULT_BRANCH="main"
        git ls-remote --heads origin main >/dev/null 2>&1 || DEFAULT_BRANCH="master"
        git branch "$BRANCH_NAME" "origin/$DEFAULT_BRANCH"
    fi
fi

# Worktree erstellen/aktualisieren
if [[ -d "$TARGET_PATH" ]]; then
    warn "Worktree-Pfad existiert bereits: $TARGET_PATH"
else
    git worktree add "$TARGET_PATH" "$BRANCH_NAME"
fi

# Rechte korrigieren (WSL-User als Owner)
chown -R "$USER_ID:$GROUP_ID" "$TARGET_PATH" 2>/dev/null || true
chown -R "$USER_ID:$GROUP_ID" "$BARE_DIR" 2>/dev/null || true

info "Worktree bereit: $TARGET_PATH"
info "Aktueller Branch: $(cd "$TARGET_PATH" && git rev-parse --abbrev-ref HEAD)"

# --- 6. .env schreiben ---
info "Schreibe .env..."

cd "$SCRIPT_DIR"

# Bestehende .env auslesen, falls vorhanden
OLD_OPENROUTER=""
OLD_ANTHROPIC=""
OLD_OPENAI=""
if [[ -f .env ]]; then
    OLD_OPENROUTER=$(grep '^OPENROUTER_API_KEY=' .env | cut -d= -f2- || true)
    OLD_ANTHROPIC=$(grep '^ANTHROPIC_API_KEY=' .env | cut -d= -f2- || true)
    OLD_OPENAI=$(grep '^OPENAI_API_KEY=' .env | cut -d= -f2- || true)
fi

# Werte übernehmen oder neue verwenden
FINAL_OPENROUTER="${OPENROUTER_KEY:-${OLD_OPENROUTER:-}}"
FINAL_ANTHROPIC="${OLD_ANTHROPIC:-}"
FINAL_OPENAI="${OLD_OPENAI:-}"

cat > .env <<EOF
# Automatisch generiert durch setup-pi-branch.sh
# Zeitstempel: $(date -Iseconds)

# LLM API-Keys (nicht committen!)
OPENROUTER_API_KEY=${FINAL_OPENROUTER}
ANTHROPIC_API_KEY=${FINAL_ANTHROPIC}
OPENAI_API_KEY=${FINAL_OPENAI}

# Container-Sicherheit: Host-UID/GID für Non-Root
USER_ID=${USER_ID}
GROUP_ID=${GROUP_ID}

# NUR der Worktree-Pfad wird in den Container gemountet
REPO_PATH=${TARGET_PATH}

# Custom-Verzeichnis in WSL für AGENTS.md und eigene Dateien
CUSTOM_PATH=${CUSTOM_PATH}

# SSH-Agent vom WSL-Host (sicherer als Token im Container)
SSH_AUTH_SOCK=${SSH_AUTH_SOCK}

# Externe LightRAG-Instanz auf Windows-Host
LIGHT_RAG_URL=http://host.docker.internal:8000

# Fallback: GitHub PAT (nur wenn kein SSH verfügbar)
GITHUB_TOKEN=
EOF

chmod 600 .env
info ".env geschrieben und auf 600 gesetzt"

# --- 7. Container bauen ---
info "Baue und starte Container..."
docker compose down 2>/dev/null || true
if ! docker compose up --build -d; then
    error "docker compose up fehlgeschlagen"
fi

# --- 8. Sicherheitsvalidierung ---
info "Validiere Container-Sicherheit..."
sleep 3

# Prüfe User im Container
CONTAINER_USER=$(docker exec pi-harness id -un 2>/dev/null || echo "root")
if [[ "$CONTAINER_USER" == "root" ]]; then
    warn "Container läuft noch als root – Build läuft evtl. noch. Prüfe: docker logs pi-harness"
else
    info "Container läuft als User: $CONTAINER_USER"
fi

# Prüfe gemountete Pfade
MOUNTS=$(docker inspect pi-harness --format='{{range .Mounts}}{{.Source}} -> {{.Destination}} ({{.Mode}}){{println}}{{end}}' 2>/dev/null || true)
info "Gemountete Volumes:"
echo "$MOUNTS" | while read -r line; do
    [[ -n "$line" ]] && echo "  • $line"
done

# Prüfe, ob nur REPO_PATH gemountet ist
if echo "$MOUNTS" | grep -q "$TARGET_PATH"; then
    info "✓ Worktree korrekt gemountet"
else
    warn "Worktree-Pfad nicht im Mount gefunden – manuell prüfen"
fi

# Prüfe Git innerhalb des Containers
if docker exec pi-harness git -C /workspace status --short >/dev/null 2>&1; then
    info "✓ Git funktioniert im Container"
else
    warn "Git-Status im Container fehlgeschlagen – SSH-Agent/Key prüfen"
fi

# Prüfe SSH-Agent im Container
if docker exec pi-harness ssh-add -l >/dev/null 2>&1; then
    info "✓ SSH-Agent erreichbar im Container"
else
    warn "SSH-Agent im Container nicht erreichbar – Git-Push wird evtl. fehlschlagen"
fi

# --- 9. Abschluss ---
echo ""
echo "=========================================="
echo "  Setup abgeschlossen!"
echo "=========================================="
echo ""
echo "  Branch:      $BRANCH_NAME"
echo "  Worktree:    $TARGET_PATH"
echo "  Container:   pi-harness"
echo "  User im CTR: ${CONTAINER_USER}"
echo ""
echo "  Nützliche Befehle:"
echo "    docker logs -f pi-harness        # Logs ansehen"
echo "    docker exec -it pi-harness bash  # Shell im Container"
echo "    git -C $TARGET_PATH status       # Status vom WSL-Host"
echo ""
echo "  WICHTIG:"
echo "  • Der Container kann Code in '$BRANCH_NAME' committen & pushen"
echo "  • Prüfe regelmäßig auf github.com, was ankommt"
echo "  • .env ist auf 600 gesetzt und wird NICHT in Git committet"
echo ""
