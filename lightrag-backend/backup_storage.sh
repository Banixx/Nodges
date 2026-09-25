#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
STORAGE_DIR="$SCRIPT_DIR/rag_storage"

mkdir -p "$BACKUP_DIR"

if [ ! -d "$STORAGE_DIR" ]; then
    echo "Warnung: $STORAGE_DIR existiert nicht."
    exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TARGET_FILE="$BACKUP_DIR/rag_storage_$TIMESTAMP.tar.gz"

echo "Erstelle Backup von $STORAGE_DIR nach $TARGET_FILE..."
tar -czf "$TARGET_FILE" -C "$SCRIPT_DIR" rag_storage
echo "Backup erfolgreich erstellt: $TARGET_FILE ($(du -h "$TARGET_FILE" | cut -f1))"
