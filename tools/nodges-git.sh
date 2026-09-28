#!/usr/bin/env bash
#
# nodges-git.sh — der einheitliche Git-Workflow fuer piCon und conT.
#
#   status   zeigt Stand: Branch, Version, Tag, Abstand zu origin/main, offene Dateien
#   save     Patch-Version +1, alles sichern, lokaler Commit — KEIN Push
#   release  Minor-Version (Patch auf 0), lokales Tag — KEIN Push
#   major    Major-Version (X.0.0), Tag, Push nach origin/main — NUR nach Rueckfrage an den Benutzer
#            E2E-Gate (Beschluss F-02, Option A): Pflicht auf dem Windows-Host (conT),
#            im Container (piCon) uebersprungen. NODGES_SKIP_E2E=1 / NODGES_FORCE_E2E=1 steuern das.
#   hooks    richtet die versionierten Git-Hooks ein (core.hooksPath)
#
# Commits tragen einen Harness-Trailer (Beschluss F-01, Option A):
#   Harness: conT  bzw.  Harness: piCon
# Das Harness wird aus NODGES_HARNESS oder dem Betriebssystem erkannt.
#
# Dieses Skript ist die einzige verbindliche Quelle fuer das Ritual. Die Skills beider
# Harnesses rufen es auf und interpretieren nichts selbst. Damit handeln conT und piCon
# immer identisch — und Aenderungen am Ablauf gelten sofort fuer beide Seiten.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SOLL_BRANCH="main"
VERSION_WERKZEUG="tools/nodges-git-version.mjs"
HOOK_ORDNER="git-hooks"

rot() { printf '%s\n' "$*"; }

fehler() {
  printf 'FEHLER: %s\n' "$*" >&2
  exit 1
}

hinweis() { printf '%s\n' "$*"; }

brauchbar() {
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fehler "kein Git-Repository: $ROOT"
  command -v node >/dev/null 2>&1 || fehler "node nicht gefunden"

  local branch
  branch="$(git symbolic-ref --quiet --short HEAD || echo '(kein Branch)')"
  [ "$branch" = "$SOLL_BRANCH" ] || fehler "Branch ist '$branch', erwartet wird '$SOLL_BRANCH'"

  [ -f "$VERSION_WERKZEUG" ] || fehler "$VERSION_WERKZEUG fehlt"
  [ -f package.json ] && [ -f package-lock.json ] || fehler "package.json oder package-lock.json fehlt"
}

laufendes_git() {
  for ordner in rebase-merge rebase-apply MERGE_HEAD CHERRY_PICK_HEAD; do
    [ -e ".git/$ordner" ] && fehler "ein Git-Vorgang laeuft noch (.git/$ordner) — erst beenden"
  done
  return 0
}

version() { node "$VERSION_WERKZEUG" show; }

abstand_zu_github() {
  if git rev-parse --verify --quiet origin/main >/dev/null 2>&1; then
    printf '%s\n' "$(git rev-list --count origin/main..HEAD)"
  else
    printf 'unbekannt\n'
  fi
}

offene_dateien() { git status --porcelain | wc -l | tr -d ' '; }

# Ermittelt das Harness fuer den Commit-Trailer (F-01). Explizit per NODGES_HARNESS
# uebersteuerbar; sonst gilt: Windows-Shell (Git Bash/MSYS/Cygwin) = conT, sonst piCon.
harness_name() {
  if [ -n "${NODGES_HARNESS:-}" ]; then
    printf '%s\n' "$NODGES_HARNESS"
    return
  fi
  case "$(uname -s 2>/dev/null || printf unknown)" in
    MINGW*|MSYS*|CYGWIN*) printf 'conT\n' ;;
    *) printf 'piCon\n' ;;
  esac
}

# ---------------------------------------------------------------------------
case "${1:-}" in

status)
  brauchbar
  v="$(version)"
  hinten="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo unbekannt)"
  vorne="$(git rev-list --count HEAD..origin/main 2>/dev/null || echo unbekannt)"
  tag="$(git describe --tags --abbrev=0 2>/dev/null || echo '(kein Tag)')"
  hinweis "Branch:        $(git symbolic-ref --short HEAD)"
  hinweis "Version:       $v"
  hinweis "Letztes Tag:   $tag"
  hinweis "Commit:        $(git rev-parse --short HEAD)  $(git log -1 --pretty=%s)"
  hinweis "Nicht auf GitHub (lokal voraus): $hinten Commit(s)"
  hinweis "Nicht hier (GitHub voraus):      $vorne Commit(s)"
  hinweis "Offene Dateien: $(offene_dateien)"
  if [ "$hinten" != "0" ] && [ "$hinten" != "unbekannt" ]; then
    hinweis ""
    hinweis "Hinweis: Diese Commits liegen nur lokal. 'release' setzt einen lokalen Meilenstein; 'major' bringt sie nach Rueckfrage nach GitHub."
  fi
  ;;

save)
  brauchbar
  laufendes_git
  if [ "$(offene_dateien)" = "0" ]; then
    hinweis "Nichts zu sichern — der Arbeitsbaum ist sauber. Kein Commit erzeugt."
    exit 0
  fi

  hinweis "Aenderungen im Arbeitsbaum vor dem Sichern:"
  git status --short

  alt="$(version)"
  neu="$(node "$VERSION_WERKZEUG" bump patch | tail -n 1)"

  git add -A
  git commit -m "$neu" -m "Harness: $(harness_name)" || fehler "Commit abgelehnt (siehe Meldung darueber)"

  hinweis ""
  hinweis "Lokal gesichert: $alt -> $neu  (Commit $(git rev-parse --short HEAD))"
  hinweis "Harness-Trailer: $(harness_name)"
  hinweis "Nicht auf GitHub: $(abstand_zu_github) Commit(s) — gewollt, 'release' schiebt sie spaeter."
  ;;

release)
  brauchbar
  laufendes_git

  har="$(harness_name)"

  checks="${2:-}"
  if [ "$checks" != "--skip-checks" ]; then
    hinweis "Pruefe Typen und Unit-Tests vor dem Release ..."
    if git rev-parse --verify --quiet HEAD >/dev/null 2>&1; then
      npm run typecheck || fehler "Typecheck fehlgeschlagen — kein Release. (--skip-checks ueberspringt das)"
      npm test -- --run || fehler "Unit-Tests fehlgeschlagen — kein Release. (--skip-checks ueberspringt das)"
    fi

    # E2E-Gate (Beschluss F-02, Option A): volles E2E nur auf dem Windows-Host (conT).
    # Im Container (piCon) fehlen die Chromium-Systembibliotheken, dort wird uebersprungen.
    # NODGES_SKIP_E2E=1 erzwingt das Ueberspringen; NODGES_FORCE_E2E=1 erzwingt E2E auch im Container.
    if [ "${NODGES_SKIP_E2E:-}" = "1" ] || { [ "$har" != "conT" ] && [ "${NODGES_FORCE_E2E:-}" != "1" ]; }; then
      hinweis "E2E-Tests uebersprungen (Harness: $har)."
    else
      hinweis "Pruefe E2E-Tests (Playwright) ..."
      npm run test:e2e || fehler "E2E-Tests fehlgeschlagen — kein Release. (--skip-checks ueberspringt das)"
    fi

    hinweis "Pruefungen bestanden."
  fi

  alt="$(version)"
  neu="$(node "$VERSION_WERKZEUG" bump minor | tail -n 1)"

  git add -A
  git commit -m "$neu" -m "Harness: $har" || fehler "Commit abgelehnt (siehe Meldung darueber)"

  tag="v$neu"
  if git rev-parse --verify --quiet "refs/tags/$tag" >/dev/null 2>&1; then
    fehler "Tag $tag existiert schon"
  fi
  git tag -a "$tag" -m "$neu"

  hinweis ""
  hinweis "Lokales Release fertig: $alt -> $neu"
  hinweis "Tag: $tag (lokal angelegt)"
  hinweis "Commit: $(git rev-parse --short HEAD)"
  hinweis "KEIN Push nach GitHub: Gemaess Benutzerbeschluss gehen nur Major-Releases nach GitHub."
  hinweis "Nicht auf GitHub: $(abstand_zu_github) Commit(s) — gewollt."
  ;;

major)
  brauchbar
  laufendes_git

  har="$(harness_name)"

  # Sicherheitsabfrage gemaess Benutzerbeschluss
  bestaetigt="${2:-}"
  if [ "$bestaetigt" != "--bestaetigt-durch-user" ]; then
    rot "ABBRUCH: Ein Major-Release mit Push nach GitHub darf NUR NACH RUECKFRAGE AN DEN BENUTZER erfolgen."
    rot "Wenn der Benutzer zugestimmt hat, fuehre aus:"
    rot "  tools/nodges-git.sh major --bestaetigt-durch-user"
    exit 1
  fi

  checks="${3:-}"
  if [ "$checks" != "--skip-checks" ]; then
    hinweis "Pruefe Typen, Unit-Tests und E2E vor dem Major-Release ..."
    if git rev-parse --verify --quiet HEAD >/dev/null 2>&1; then
      npm run typecheck || fehler "Typecheck fehlgeschlagen — kein Major-Release."
      npm test -- --run || fehler "Unit-Tests fehlgeschlagen — kein Major-Release."
    fi

    if [ "${NODGES_SKIP_E2E:-}" = "1" ] || { [ "$har" != "conT" ] && [ "${NODGES_FORCE_E2E:-}" != "1" ]; }; then
      hinweis "E2E-Tests uebersprungen (Harness: $har)."
    else
      hinweis "Pruefe E2E-Tests (Playwright) ..."
      npm run test:e2e || fehler "E2E-Tests fehlgeschlagen — kein Major-Release."
    fi

    hinweis "Pruefungen bestanden."
  fi

  alt="$(version)"
  neu="$(node "$VERSION_WERKZEUG" bump major | tail -n 1)"

  git add -A
  git commit -m "$neu" -m "Harness: $har" || fehler "Commit abgelehnt (siehe Meldung darueber)"

  tag="v$neu"
  if git rev-parse --verify --quiet "refs/tags/$tag" >/dev/null 2>&1; then
    fehler "Tag $tag existiert schon"
  fi
  git tag -a "$tag" -m "$neu"

  hinweis "Sende Major-Release $tag an GitHub ..."
  git push origin main
  git push origin "$tag"

  hinweis ""
  hinweis "Major-Release erfolgreich veroeffentlicht: $alt -> $neu"
  hinweis "Tag: $tag"
  hinweis "Commit: $(git rev-parse --short HEAD)"
  hinweis "GitHub ist jetzt auf diesem Stand."
  ;;

hooks)
  brauchbar
  [ -d "$HOOK_ORDNER" ] || fehler "Ordner $HOOK_ORDNER fehlt"
  chmod +x "$HOOK_ORDNER"/* 2>/dev/null || true
  git config core.hooksPath "$HOOK_ORDNER"
  hinweis "core.hooksPath = $(git config core.hooksPath)"
  hinweis "Damit gelten die Hooks fuer piCon und conT gleichermassen (gemeinsame .git)."
  ;;

*)
  rot "Aufruf: tools/nodges-git.sh <status|save|release|major|hooks>"
  rot ""
  rot "  status   Stand anzeigen, nichts veraendern"
  rot "  save     Patch +1, lokaler Commit, kein Push"
  rot "  release  Minor (Patch 0), lokales Tag, KEIN Push   [ --skip-checks ]"
  rot "  major    Major (X.0.0), Tag, Push nach GitHub      --bestaetigt-durch-user [ --skip-checks ]"
  rot "           (Push nach GitHub nur nach expliziter Benutzer-Rueckfrage)"
  rot "  hooks    versionierte Git-Hooks einrichten"
  exit 1
  ;;

esac
