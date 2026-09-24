# Plan: Dev Create Sync & Doppelläufigkeit Beheben

## 1. Ursachenanalyse der "Doppelläufigkeit"
Die von dir beobachtete Doppelläufigkeit entsteht, weil die Pipeline aktuell auf zwei verschiedenen Ebenen parallel Dateien speichert:
1. **Ebene 1 (Server/Nodges):** Die `LLMService.ts` nutzt die Methode `_saveDebugFile`, um nach jedem Schritt stumm eine Datei in den Ordner `public/data/b10/` zu schreiben (Name: `b10_none_none...`).
2. **Ebene 2 (OS-Download):** Wenn "Dev create" aktiv ist, feuert die UI einen separaten OS-Download an (Name: `B10_GK_QK...`).
3. **Ebene 3 (Auto-Save):** Ganz am Ende versucht die `CreatePanel.ts` zusätzlich, den fertigen Graphen als `AI_Generation_...json` und das Logbuch als `AI_GenerationLog_...json` zu speichern (Fallback in den Download-Ordner, falls der Server nicht reagiert).

Das Resultat: Ein chaotischer Mix aus serverseitigen Logs, Downloads und verschiedenen Dateinamen für denselben Inhalt.

**Warum fehlten die Zwischenschritte?**
Wenn in Build 10 *Kein Grounding* und *Kein Critic* ausgewählt sind, hat die Pipeline buchstäblich keine Zwischenschritte. Die Generierung (Schritt 5) ist dann der erste und letzte Schritt, weshalb nur diese eine Datei auftaucht. Hättest du "Wikidata" gewählt, wären auch die Schritte 1-4 gekommen.

## 2. Lösungsstrategie
Wir räumen das Speicher-Chaos auf und zentralisieren das Naming.

### Schritt A: Einheitliche Nomenklatur im Kern
- Ich übergebe den von dir gewünschten Präfix (`[build]_G{K,W,R,S}_Q{K,G,H}_B{F,T,E}`) direkt in die `LLMService.ts`.
- Dadurch heißen die Dateien im `/b10/` Ordner auf dem Server ab sofort exakt gleich wie im Download-Ordner.

### Schritt B: Dev Create Bereinigung
- Der Schalter "Dev create" bleibt in der UI.
- Wenn er **inaktiv** ist: Die Pipeline speichert ihre Zwischenschritte trotzdem stumm im `/b10/` Ordner auf dem Server (für die UI Historie), stört den Nutzer aber nicht mit Downloads.
- Wenn er **aktiv** ist: Zusätzlich zum Server-Save wird für JEDEN Zwischenschritt (sofern vorhanden) ein echter OS-Download mit dem exakt gleichen Dateinamen angetriggert.

### Schritt C: Redundantes Auto-Save entfernen
- Das alte `AI_Generation_...json` Auto-Save am Ende der Datei in `CreatePanel.ts` wird bereinigt, da der fertige Graph ja durch Schritt 5 (oder 6) ohnehin schon perfekt benannt im `b10` Ordner liegt. Das verhindert den nervigen Spam an identischen Graphen.

## 3. Nächste Schritte
Bitte gib mir das Go, dann setze ich diesen Plan um und räume die Speicher-Logik von Build 10 komplett auf.
