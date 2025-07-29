#!/bin/bash
# ROVO DEV MONITOR - Ueberwacht RovoDev-Aktivitaeten in Echtzeit

echo "[MONITOR] RovoDev Ueberwachungssystem gestartet"

# Ueberwache Dateiaenderungen mit inotify
monitor_files() {
    echo "[WATCH] Ueberwache kritische Dateien..."
    
    # Wichtige Dateien ueberwachen
    inotifywait -m -e modify,create,delete \
        main.js \
        index.html \
        src/core/ \
        automated_performance_test.html \
        ROVO_DEV_RULES.md \
        2>/dev/null | while read path action file; do
        
        echo "[EVENT] $action auf $path$file um $(date)"
        
        # Sofortige Unicode-Pruefung nach Aenderung
        if [[ "$action" == "MODIFY" ]]; then
            ./unicode_prevention.sh
            if [ $? -ne 0 ]; then
                echo "[CRITICAL] Unicode-Verstoss nach RovoDev-Aktion!"
                echo "[ACTION] Automatisches Backup und Warnung"
            fi
        fi
        
        # Pruefe auf leere Dateien (Datei-Zerstoerung)
        if [[ "$file" == *.js ]] && [[ "$action" == "MODIFY" ]]; then
            if [ ! -s "$path$file" ]; then
                echo "[ALARM] DATEI WURDE GELEERT: $path$file"
                echo "[RECOVERY] Automatische Wiederherstellung erforderlich!"
            fi
        fi
    done
}

# Starte Ueberwachung im Hintergrund
monitor_files &
MONITOR_PID=$!

echo "[INFO] Monitor laeuft mit PID: $MONITOR_PID"
echo "[INFO] Stoppen mit: kill $MONITOR_PID"

# Halte Script am Leben
wait $MONITOR_PID