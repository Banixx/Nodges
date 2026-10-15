#!/usr/bin/env bash
# sync_com.sh — One-Way-Synchronisation von com/ nach C:/Users/ich/Desktop/code/_Nodges_Com_Sync

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DEST_WSL="/mnt/c/Users/ich/Desktop/code/_Nodges_Com_Sync"

# 1. Bevorzugt powershell.exe ueber Windows Host nutzen
if command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "W:/tools/sync_com.ps1"
    exit $?
fi

# 2. Fallback: rsync ueber WSL-Pfad
if [ -d "$DEST_WSL" ] && command -v rsync >/dev/null 2>&1; then
    echo "Fuehre rsync von $REPO_ROOT/com/ nach $DEST_WSL/ aus..."
    rsync -rtv --delete --exclude='~*' --exclude='*.tmp' --exclude='*.bak' --exclude='*.swp' "$REPO_ROOT/com/" "$DEST_WSL/"
    echo "Synchronisation via rsync erfolgreich."
    exit 0
fi

echo "FEHLER: Weder powershell.exe noch das Zielverzeichnis unter $DEST_WSL sind verfuegbar." >&2
exit 1
