#!/bin/bash
# AUTO UNICODE CLEANER - Bereinigt automatisch Unicode-Verstoesse

echo "[CLEANER] Auto Unicode Cleaner gestartet"

# Sichere Ersetzungen fuer haeufige Unicode-Zeichen (ASCII-only)
clean_unicode_patterns() {
    local file="$1"
    
    # Remove common Unicode patterns with sed
    sed -i 's/[^\x00-\x7F]//g' "$file"
    
    # Specific replacements for common German characters
    sed -i 's/ä/ae/g; s/ö/oe/g; s/ü/ue/g' "$file"
    sed -i 's/Ä/Ae/g; s/Ö/Oe/g; s/Ü/Ue/g' "$file"
    sed -i 's/ß/ss/g' "$file"
}

# Funktion: Bereinige Datei
clean_file() {
    local file="$1"
    local backup_created=false
    
    echo "[CLEAN] Pruefe $file..."
    
    # Pruefe ob Unicode vorhanden
    if grep -P '[^\x00-\x7F]' "$file" >/dev/null 2>&1; then
        echo "[FOUND] Unicode-Zeichen in $file gefunden"
        
        # Erstelle Backup
        if [ "$backup_created" = false ]; then
            cp "$file" "backups/$(basename "$file")_before_clean_$(date +%Y%m%d_%H%M%S)"
            echo "[BACKUP] Backup erstellt fuer $file"
            backup_created=true
        fi
        
        # Fuehre Bereinigung durch
        clean_unicode_patterns "$file"
        
        echo "[CLEANED] $file bereinigt"
    else
        echo "[OK] $file ist sauber"
    fi
}

# Bereinige alle wichtigen Dateien
FILES_TO_CLEAN=(
    "main.js"
    "index.html"
    "src/core/LayoutManager.js"
    "src/core/StateManager.js"
    "src/core/UIManager.js"
    "src/core/EventManager.js"
    "automated_performance_test.html"
)

for file in "${FILES_TO_CLEAN[@]}"; do
    if [ -f "$file" ]; then
        clean_file "$file"
    fi
done

echo "[COMPLETE] Unicode-Bereinigung abgeschlossen"

# Finale Validierung
./unicode_prevention.sh
if [ $? -eq 0 ]; then
    echo "[SUCCESS] Alle Dateien sind jetzt Unicode-frei!"
else
    echo "[WARNING] Einige Unicode-Zeichen konnten nicht automatisch bereinigt werden"
fi
