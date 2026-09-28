# Start hier — Einstieg fuer jedes Harness

Dieses Verzeichnis **`com/`** ist der gemeinsame Wissensspeicher von piCon und conT (frueher auch winAnt).
Es liegt direkt im Projekt-Root und ist damit ueber `/workspace/com/` (piCon) wie ueber `W:\com\` (conT) erreichbar — **derselbe physische Ort**.

## Lesereihenfolge beim Arbeitsbeginn

1. **`AGENTS.md`** (im Root, eine Ebene hoeher) — die verbindlichen Arbeitsregeln.
2. **`todo.md`** — was gerade offen ist. Kurz halten, vor jeder Aufgabe lesen.
3. **`feature/`** — laufende Vorhaben und Features. Nur die **Dateinamen** reichen zum Ueberblick; Inhalt nur bei Bedarf.
4. **`entscheidungen.md`** — Beschluesse des Benutzers. Diese sind bindend und haben Vorrang vor Vermutungen.
5. **`fragen_an_user.md`** — offene Fragen und Entscheidungsvorlagen fuer den Benutzer (bei "fragen"-Abfragen).
6. **`ideen.md`** — ungepruefte Einfaelle. Keine Verpflichtung.
7. **`bericht.md`** und **`setup.md`** — die ausfuehrlichen Gesamtdokumente (Historie bzw. Technik). Nur bei Detailfragen, nicht komplett einlesen.
8. **`doc/`** — das Archiv aller bisherigen Berichte (273 Dateien). Gezielt suchen, nicht pauschal lesen.

> Wichtig: Die Dateien in `com/` sind bewusst **klein und steuernd**. Ein Harness soll sie vollstaendig einlesen koennen.
> Alles Umfangreiche gehoert nach `com/doc/` mit Versionspraefix.

## Aufbau

```
com/
  00_start_hier.md    <- dieses File: Einstieg und Lesereihenfolge
  todo.md             <- offene Punkte (sollte vor jeder Aufgabe gelesen werden)
  feature/            <- laufende Vorhaben und Features, ein Ordner/File je Vorhaben
  entscheidungen.md   <- Beschluesse des Benutzers (bindend)
  fragen_an_user.md   <- offene Fragen fuer den Benutzer (Orientierung bei "fragen")
  ideen.md            <- Ideensammlung, ungeprueft
  bericht.md          <- Gesamtbericht und Dialogprotokoll (Historie)
  setup.md            <- technische Kurzanleitung Setup/Git
  setup/              <- Setup-Dokumente und Vorlagen (z.B. dashboard_template)
  doc/                <- Archiv: alle bisherigen Berichte (versioniert, 273 Dateien)
```

## Wann schreibe ich was? (Empfehlung, keine Pflicht)

| Situation | Zielort |
|---|---|
| Ergebnis eines Arbeitsauftrags, Analyse, Bericht | `com/doc/0_106_3_mein_thema.md` (Versionspraefix aus `package.json`) |
| Etwas bleibt offen, naechster Schritt unklar | `com/todo.md` |
| Es gibt ein absehbares Vorhaben mit mehreren Schritten | eigene Datei oder Ordner in `com/feature/` |
| Der Benutzer hat etwas beschlossen | `com/entscheidungen.md` (mit Datum und wenn moeglich Commit/Tag) |
| Eine Frage oder Entscheidungsvorlage fuer den Benutzer | `com/fragen_an_user.md` (wird bei Benutzer-Prompt "fragen" konsultiert) |
| Ein Einfall, noch ungeprueft | `com/ideen.md` |
| Zusammenfassung groesserer Zusammenhaenge | Anhang an `bericht.md` (neuer Teil H, I, ...) |

Namenskonvention fuer neue Dateien in `doc/`: bereinigte Version aus `package.json` als Praefix, Punkte durch Unterstriche ersetzt — aus `0.106.3` wird `0_106_3_`.

## Wer schreibt mit?

- **piCon** (Pi im Container, `/workspace`) legt Berichte, Todos und Entscheidungen hier ab.
- **conT** (Antigravity auf `W:\`) arbeitet auf denselben Dateien und kann direkt ergaenzen.
- Querverweise sollten doppelt lesbar sein: `/workspace/com/...` **und** `W:\com\...`.
