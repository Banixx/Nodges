#!/usr/bin/env bash
# ========================================================
# Installiert das One-Page Dashboard in ein Zielprojekt
# Aufruf: bash install_to_project.sh /pfad/zum/zielprojekt
# ========================================================

set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "[FEHLER] Bitte Zielverzeichnis angeben: bash install_to_project.sh /zielverzeichnis"
    exit 1
fi

TARGET_DIR="$1"
mkdir -p "$TARGET_DIR"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "$SCRIPT_DIR/dashboard.html" "$TARGET_DIR/"
cp "$SCRIPT_DIR/dashboard.md" "$TARGET_DIR/"

echo "[ERFOLG] Dashboard erfolgreich nach $TARGET_DIR kopiert."
echo "- HTML: $TARGET_DIR/dashboard.html"
echo "- MD:   $TARGET_DIR/dashboard.md"
