#!/bin/bash
# UNICODE PREVENTION SYSTEM - Verhindert Unicode-Verstoesse in Echtzeit

echo "[SECURITY] Unicode Prevention System aktiviert"

# 1. Ueberwache alle wichtigen Dateien auf Unicode
WATCH_FILES=(
    "main.js"
    "index.html" 
    "src/core/LayoutManager.js"
    "src/core/StateManager.js"
    "src/core/UIManager.js"
    "src/core/EventManager.js"
    "automated_performance_test.html"
    "ROVO_DEV_RULES.md"
)

# 2. Funktion: Unicode-Check
check_unicode_violations() {
    local file="$1"
    if [ -f "$file" ]; then
        # Suche nach Unicode-Zeichen (nicht ASCII)
        if grep -P '[^\x00-\x7F]' "$file" >/dev/null 2>&1; then
            echo "[CRITICAL] Unicode-Verstoss gefunden in: $file"
            
            # Zeige die problematischen Zeilen
            echo "[DETAILS] Problematische Zeichen:"
            grep -P '[^\x00-\x7F]' "$file" | head -5
            
            # Automatisches Backup vor Bereinigung
            cp "$file" "backups/$(basename "$file")_unicode_violation_$(date +%Y%m%d_%H%M%S)"
            echo "[BACKUP] Backup erstellt fuer $file"
            
            return 1
        fi
    fi
    return 0
}

# 3. Pruefe alle ueberwachten Dateien
violations_found=0
for file in "${WATCH_FILES[@]}"; do
    if ! check_unicode_violations "$file"; then
        violations_found=$((violations_found + 1))
    fi
done

# 4. Spezielle ss-Erkennung
echo "[CHECK] Suche nach ss-Zeichen..."
for file in "${WATCH_FILES[@]}"; do
    if [ -f "$file" ] && grep -F 'ss' "$file" >/dev/null 2>&1; then
        echo "[CRITICAL] ss-Zeichen gefunden in: $file"
        grep -n 'ss' "$file"
        violations_found=$((violations_found + 1))
    fi
done

# 5. Emoji/Icon-Erkennung
echo "[CHECK] Suche nach Emojis/Icons..."
for file in "${WATCH_FILES[@]}"; do
    if [ -f "$file" ] && grep -E '[\xF0-\xF7][\x80-\xBF][\x80-\xBF][\x80-\xBF]' "$file" >/dev/null 2>&1; then
        echo "[CRITICAL] Emoji/Icon gefunden in: $file"
        grep -n -E '[\xF0-\xF7][\x80-\xBF][\x80-\xBF][\x80-\xBF]' "$file"
        violations_found=$((violations_found + 1))
    fi
done

# 6. Ergebnis
if [ $violations_found -gt 0 ]; then
    echo "[ALARM] $violations_found Unicode-Verstoesse gefunden!"
    echo "[ACTION] Sofortige Bereinigung erforderlich!"
    exit 1
else
    echo "[OK] Keine Unicode-Verstoesse gefunden"
    exit 0
fi