# Erklaerung: Was bedeutet origin in Git?

## Kernaussage

Nein, `origin` heisst nicht lokal, sondern ist der Standard-Spitzname (Alias) fuer den entfernten Server im Internet – in deinem Fall das Repository auf GitHub.

## Begriffserklaerung

| Begriff | Was ist das? | Wo liegt das? |
|---|---|---|
| **`pi`** | Dein **lokaler Branch** | Direkt auf deiner lokalen Festplatte. Hier arbeitest du, bearbeitest Dateien und erstellst Commits. |
| **`origin`** | Der **Remote-Server** | Die Adresse von GitHub (`https://github.com/Banixx/Nodges.git`). |
| **`origin/pi`** | Der **Remote-Tracking-Branch** | Ein lokaler "Schattenzeiger" (Lesezeichen). Er merkt sich, auf welchem Stand der Branch `pi` auf GitHub beim letzten Kontakt (`fetch`/`pull`/`push`) war. |

## Warum gibt es diese Trennung?

Git ist ein **dezentrales** Versionskontrollsystem. Du kannst komplett ohne Internetverbindung arbeiten:

1. **Lokales Arbeiten (`pi`)**:
   - Wenn du eine Datei aenderst und `git commit` machst, bewegt sich zunaechst nur dein lokaler Branch `pi` vorwaerts.
   - GitHub weiss davon noch nichts. Git sagt dir dann:  
     *`Your branch is ahead of 'origin/pi' by 1 commit.`*  
     (Bedeutet: Dein lokaler `pi` ist weiter als der Stand auf GitHub).

2. **Hochladen (`git push`)**:
   - Erst mit `git push` uebertraegst du deinen neuen Commit an GitHub (`origin`).
   - Sobald das erledigt ist, stehen sowohl dein lokaler `pi` als auch `origin/pi` wieder auf demselben Commit.

3. **Herunterladen (`git fetch` / `git pull`)**:
   - Wenn der Pi-Agent im Container etwas nach GitHub hochlaedt, erfaehrt dein Windows-Git davon erst bei einer Abfrage.
   - `git fetch` aktualisiert den Zeiger `origin/pi` auf deiner Festplatte. Git meldet:  
     *`Your branch is behind 'origin/pi' by 2 commits.`*  
     (Bedeutet: Auf GitHub gibt es 2 neue Commits, die du lokal noch nicht hast).
   - `git pull` holt diese Aenderungen ab und bringt deinen lokalen Branch `pi` auf den gleichen Stand.

## Zusammenfassung
* **`origin`** = Der entfernte Server (GitHub).
* **`pi`** = Dein Arbeitszweig auf deinem PC.
* **`origin/pi`** = Das Abbild dessen, was auf GitHub liegt.
