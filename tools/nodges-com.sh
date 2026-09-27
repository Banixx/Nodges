#!/usr/bin/env bash
#
# nodges-com.sh — der Cross-Harness-Bus fuer com/ (piCon-Seite).
#
# Der Waechter (tools/watch_com.mjs) merkt jede Aenderung in com/ und schreibt
# sie nach com/.bus/events.log. Dieses Skript ist die Fernbedienung dafuer.
#
#   start                 Waechter im Hintergrund starten (einmalig noetig)
#   stop                  Waechter anhalten
#   status                laeuft er? Wie viele Ereignisse sind noch ungelesen?
#   read [--peek]         neue Ereignisse zeigen und als gelesen markieren
#   ack                   alles als gelesen markieren, ohne Ausgabe
#   ping <ziel> <text>    gezielten Weckruf ablegen (conT, piCon oder all)
#   watch                 Live-Mitschrift der Ereignisse (Abbruch mit Strg+C)
#   help                  diese Hilfe
#
# Ablageort: Protokoll und Pings liegen unter tools/com-bus/, nicht in com/ — darum
# kann sich das Protokoll nicht selbst melden. conT arbeitet mit W:/tools/watch_com.ps1.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COM="${NODGES_COM_DIR:-$ROOT/com}"
BUS="${NODGES_COM_BUS:-$ROOT/tools/com-bus}"   # ausserhalb von com/ — kein Rueckkoppeln
PROTOKOLL="$BUS/events.log"
GESEHEN="$BUS/piCon.seen"   # Zaehlerstand: wie viele Zeilen schon gemeldet wurden
PID_DATEI="${NODGES_COM_PID:-/tmp/nodges-com-watch.pid}"
DAEMON_LOG="/tmp/nodges-com-watch.log"
WAECHTER="$ROOT/tools/watch_com.mjs"

if [ -t 1 ]; then
  VIOLETT=$'\033[38;5;141m'
  ROSA=$'\033[38;5;213m'
  RESET=$'\033[0m'
else
  VIOLETT=""; ROSA=""; RESET=""
fi

sichtbar() {
  while IFS= read -r z; do
    case "$z" in
      \#*) printf '%s%s%s\n' "$VIOLETT" "$z" "$RESET" ;;
      *PING*) printf '%s%s%s\n' "$ROSA" "$z" "$RESET" ;;
      *) printf '%s\n' "$z" ;;
    esac
  done
}

anzahl_zeilen() {
  [ -f "$PROTOKOLL" ] && wc -l < "$PROTOKOLL" | tr -d ' ' || echo 0
}

gelesen() {
  [ -f "$GESEHEN" ] && cat "$GESEHEN" | tr -d ' \n' || echo 0
}

laeuft() {
  if [ -f "$PID_DATEI" ]; then
    local pid
    pid="$(cat "$PID_DATEI" 2>/dev/null | tr -d ' \n')"
    if [ -n "$pid" ] && [ -d "/proc/$pid" ]; then
      echo "$pid"
      return 0
    fi
  fi
  echo ""
}

case "${1:-help}" in

  help|--help|-h)
    sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
    ;;

  start)
    pid="$(laeuft)"
    if [ -n "$pid" ]; then
      echo "${VIOLETT}COM-Waechter laeuft bereits${RESET} (PID $pid)."
      exit 0
    fi
    if [ ! -f "$WAECHTER" ]; then
      echo "FEHLER: $WAECHTER fehlt." >&2
      exit 1
    fi
    mkdir -p "$BUS"
    nohup node "$WAECHTER" >> "$DAEMON_LOG" 2>&1 &
    disown 2>/dev/null || true
    for _ in 1 2 3 4 5 6 7 8 9 10; do
      pid="$(laeuft)"
      [ -n "$pid" ] && break
      sleep 0.4
    done
    if [ -n "$pid" ]; then
      echo "${VIOLETT}COM-Waechter gestartet${RESET} (PID $pid) — Protokoll: $PROTOKOLL"
    else
      echo "FEHLER: Waechter ist nicht hochgekommen. Siehe $DAEMON_LOG" >&2
      tail -n 15 "$DAEMON_LOG" 2>/dev/null
      exit 1
    fi
    ;;

  stop)
    pid="$(laeuft)"
    if [ -z "$pid" ]; then
      echo "COM-Waechter laeuft nicht."
      rm -f "$PID_DATEI"
      exit 0
    fi
    kill "$pid" 2>/dev/null
    sleep 0.5
    kill -9 "$pid" 2>/dev/null || true
    rm -f "$PID_DATEI"
    echo "${VIOLETT}COM-Waechter gestoppt.${RESET}"
    ;;

  restart)
    bash "$ROOT/tools/nodges-com.sh" stop
    bash "$ROOT/tools/nodges-com.sh" start
    ;;

  status)
    pid="$(laeuft)"
    if [ -n "$pid" ]; then
      echo "${VIOLETT}COM-Waechter:${RESET} laeuft (PID $pid)"
    else
      echo "${ROSA}COM-Waechter:${RESET} laeuft NICHT — starten mit: bash tools/nodges-com.sh start"
    fi
    echo "Bus:            $PROTOKOLL"
    alle="$(anzahl_zeilen)"
    neu=$(( alle - $(gelesen) ))
    [ "$neu" -lt 0 ] && neu=0
    if [ "$neu" -gt 0 ]; then
      echo "${ROSA}$neu neue Ereignisse${RESET} (gesehen: $(gelesen), insgesamt: $alle)"
    else
      echo "Keine neuen Ereignisse (insgesamt: $alle)."
    fi
    if [ -f "$PROTOKOLL" ]; then
      echo "Die letzten Zeilen:"
      tail -n 5 "$PROTOKOLL" 2>/dev/null | sichtbar
    fi
    ;;

  read)
    [ -f "$PROTOKOLL" ] || { echo "Noch kein Protokoll. Waechter starten? bash tools/nodges-com.sh start"; exit 0; }
    gesehen="$(gelesen)"
    neu="$(tail -n +$(( gesehen + 1 )) "$PROTOKOLL" 2>/dev/null | grep -v '^#')"
    if [ -z "$neu" ]; then
      echo "${VIOLETT}Nichts Neues in com/.${RESET}"
    else
      echo "${VIOLETT}Neues im COM-Bus:${RESET}"
      echo "$neu" | sed -E "s/(PING)/${ROSA}\1${RESET}/"
    fi
    if [ "${2:-}" != "--peek" ]; then
      anzahl_zeilen > "$GESEHEN"
    fi
    ;;

  ack)
    anzahl_zeilen > "$GESEHEN"
    echo "Alles als gelesen markiert ($(anzahl_zeilen) Zeilen)."
    ;;

  ping)
    ziel="${2:-all}"
    shift 2 2>/dev/null || true
    text="${*:-}"
    [ -z "$text" ] && { echo 'FEHLER: Text fehlt. So geht es: bash tools/nodges-com.sh ping conT "bitte Datei X lesen"'; exit 1; }
    mkdir -p "$BUS"
    zieldatei="$BUS/ping-$ziel.md"
    {
      echo "# PING von piCon an $ziel — $(date '+%Y-%m-%d %H:%M:%S')"
      echo "$text"
    } > "$zieldatei"
    echo "${ROSA}PING abgelegt:${RESET} $zieldatei"
    ;;

  watch)
    [ -f "$PROTOKOLL" ] || touch "$PROTOKOLL"
    echo "${VIOLETT}Live-Mitschrift von com/ — Abbruch mit Strg+C${RESET}"
    tail -n +1 -f "$PROTOKOLL" | while IFS= read -r zeile; do
      case "$zeile" in
        \#*) echo "${VIOLETT}$zeile${RESET}" ;;
        *PING*) echo "${ROSA}$zeile${RESET}" ;;
        *) echo "$zeile" ;;
      esac
    done
    ;;

  *)
    echo "Unbekannter Befehl: $1"
    "$0" help
    exit 1
    ;;
esac
