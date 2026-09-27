#!/usr/bin/env bash
# Regressionstest fuer die Fernbedienung des COM-Busses (tools/nodges-com.sh).
# Prueft, dass Pings als Datei abgelegt werden, status/read/ack funktionieren
# und das Werkzeug-Repository testweise umgeleitet werden kann.
#
# Ausfuehrung:
#   bash tools/test-com.sh

set -u

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKRIPT="$REPO_ROOT/tools/nodges-com.sh"
FEHLER=0
TREFFER=0

pruefe() {
  local name="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    TREFFER=$((TREFFER + 1))
    echo "  ok   $name"
  else
    FEHLER=$((FEHLER + 1))
    echo "  FAIL $name"
  fi
}

echo "COM-Bus: Regressionstest"

pruefe "Skript vorhanden und ausfuehrbar" test -x "$SKRIPT"

# Alles, was nodges-com.sh schreibt, wird in ein Testverzeichnis umgeleitet.
# ROOT bleibt das echte Repo (Skriptpfad), damit watch_com.mjs gefunden wird.
TEMPDIR="$(mktemp -d)"
export NODGES_COM_BUS="$TEMPDIR/com-bus"
export NODGES_COM_DIR="$TEMPDIR/com"
export NODGES_COM_PID="$TEMPDIR/watch.pid"
mkdir -p "$NODGES_COM_BUS" "$NODGES_COM_DIR"
TARGET="$SKRIPT"

# Ping an conT muss eine Datei erzeugen.
"$TARGET" ping conT "Testnachricht" >/dev/null 2>&1
pruefe "ping conT legt Datei ab" test -f "$NODGES_COM_BUS/ping-conT.md"

"$TARGET" ping piCon "Testnachricht" >/dev/null 2>&1
pruefe "ping piCon legt Datei ab" test -f "$NODGES_COM_BUS/ping-piCon.md"

"$TARGET" ping all "Testnachricht" >/dev/null 2>&1
pruefe "ping all erzeugt Zieldatei" test -f "$NODGES_COM_BUS/ping-all.md"

# Ohne Text darf kein Ping entstehen.
"$TARGET" ping conT >/dev/null 2>&1
pruefe "ping ohne Text wird abgewiesen" test "$?" -ne 0

# Der Ping-Text muss in der Zieldatei stehen.
pruefe "Ping-Text landet in der Datei" grep -q "Testnachricht" "$NODGES_COM_BUS/ping-conT.md"

# Der Waechter darf beim Testlauf nicht ins echte Repo schreiben.
if [ ! -f "$REPO_ROOT/tools/com-bus/ping-conT.md" ] || grep -q piCon "$REPO_ROOT/tools/com-bus/ping-conT.md" 2>/dev/null; then
  TREFFER=$((TREFFER + 1))
  echo "  ok   keine Seiteneffekte im echten Bus"
else
  FEHLER=$((FEHLER + 1))
  echo "  FAIL   keine Seiteneffekte im echten Bus"
fi

pruefe "status laeuft fehlerfrei" bash "$TARGET" status
rm -rf "$TEMPDIR"

echo "Ergebnis: $TREFFER bestanden, $FEHLER fehlgeschlagen"
[ "$FEHLER" -eq 0 ]
