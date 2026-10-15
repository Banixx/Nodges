# Blaupause: Multi-Harness Kommunikations- und Kollaborations-Framework

> Version: 0.106.8  
> Stand: 27. September 2026  
> Ablage: `W:/com/setup/harness_chat_setup.md` (bzw. `/workspace/com/setup/harness_chat_setup.md`)  
> Beteiligte Harnesses: **conT** (Antigravity Windows 11) & **piCon** (Pi-Agent im Linux-Container)

---

## 1. Uebersicht und Zielsetzung

In einem Multi-Harness-Setup arbeiten zwei autonome KI-Agenten parallel auf demselben Dateisystem (ext4 Single Source of Truth via Netzlaufwerk `W:/` und Container-Mount `/workspace`). Um Missverstaendnisse, Code-Kollisionen und Informationsverlust zu vermeiden, bedarf es eines standardisierten, asynchronen Kommunikationsmusters ("Harness-Chat via Rapport").

Dieses Dokument dient als **verbindliche Blaupause** fuer die Durchfuehrung von Diskussions-, Planungs- und Umsetzungsprozessen zwischen den Harnesses.

---

## 2. Struktur einer Rapport-Datei (`rapport_<thema>.md`)

Fuer groessere Vorhaben oder Builds wird eine dezidierte Datei unter `com/plan/<thema>/rapport_<thema>.md` angelegt. Diese folgt zwingend einem einheitlichen Aufbau:

### Standard-Aufbau:

1. **Kopfbereich & Metadaten:**
   - Titel des Vorhabens / Builds.
   - Status (`In Vorbereitung`, `Aktiv in Diskussion`, `In Umsetzung`, `Abgeschlossen`).
   - Partner, Ablagepfad und Stand.
2. **Verlaufsprotokoll (tabellarisch zuoberst):**
   - Wer hat wann was gemacht?
   - Spalten: `Datum / Zeit`, `Harness` (conT / piCon), `Aktion / Schritt`, `Ergebnis / Artefakt`.
3. **Zweck und Gebrauchsanweisung:**
   - Kurze Erlaeuterung fuer Mensch und KI, wie die Datei gepflegt wird.
4. **Fachlicher Ausgangsstand & Kontext:**
   - Problemstellung, Anforderungen, Rechercheergebnisse.
5. **Fragen an das Partner-Harness:**
   - Konkret nummerierte Fragen mit Kontext, Code-Zeilen und technischer Zielsetzung.
6. **Ideen und Loesungsansaetze:**
   - Architekturentwuerfe, UI/UX-Konzepte, Backend-Vorschlaege.
7. **Arbeitsaufteilung & Naechste Schritte:**
   - Tabellarische Zuteilung der Aufgaben an conT bzw. piCon.
8. **Rueckmeldungen und Diskussionsbeitraege des Partners:**
   - Explizite Antworten auf die Fragen, Testergebnisse und Dokumentation durchgefuehrter Aenderungen.

---

## 3. Der asynchrone Kommunikationszyklus

Der Ablauf folgt vier wiederkehrenden Phasen:

```
+-------------------------------------------------------------------+
| 1. Frage / Entwurf (z.B. conT)                                   |
|    - Erstellt/erweitert rapport_<thema>.md                        |
|    - Aktualisiert tabellarisches Verlaufsprotokoll zuoberst       |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 2. Zustandsbasierte Uebergabe                                   |
|    - Auftrag und Status in com/todo.md aktualisieren              |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 3. Analyse & Umsetzung durch Partner (z.B. piCon)                |
|    - Liest rapport_<thema>.md                                     |
|    - Beantwortet Fragen unter "Rueckmeldungen & Diskussion"       |
|    - Fuehrt Code-Apassungen & Tests im eigenen Bereich durch      |
|    - Traegt Schritt in die Verlaufstabelle ein                    |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
| 4. Konsolidierung & Beschluss                                     |
|    - Finalisierung im Frontend / Gesamtsystem                     |
|    - Verbindliche Beschluesse wandern nach com/entscheidungen.md   |
+-------------------------------------------------------------------+
```

---

## 4. Regeln fuer die Harness-Kommunikation

1. **Dateisystem ist die Quelle:** Rapport-Dateien und `com/todo.md` halten den gemeinsamen Arbeitsstand fest; es gibt keinen aktiven Hintergrund-Ping.
2. **Status aktualisieren:** Nach einer Uebergabe wird der Auftrag in `com/todo.md` mit dem passenden Status versehen.
3. **Keine stillen Annahmen:** Wenn Schnittstellen oder DTOs geaendert werden, muessen Felder, Typen und Fallbacks explizit in der Rapport-Datei beschrieben werden (wie in Frage 2 von Build 14 geschehen).
4. **Schreib- und Sprachdisziplin:**
   - Sprache: Deutsch.
   - Kein Sz (immer "ss").
   - Absolutes Verbot von Emojis und Unicode-Emoticons.
   - Absolute Pfade mit Schraegstrichen (`/`) verwenden.
5. **Ergebnis-Dokumentation:**
   - Abgeschlossene Vorhaben werden in `com/doc/` archiviert (mit Versionspraefix).
   - Offene Todos werden kurz in `com/todo.md` gepflegt.
