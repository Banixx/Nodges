# Dokumentation: Antigravity Session-Limit & Struktur-Analyse

Dieses Dokument dient der detaillierten Dokumentation des aktuellen Verzeichniszustands und des "25-Session-Limit"-Bugs, um spaeter eine dauerhafte Loesung zu finden.

## 1. Systemstatus (Stand: 12.07.2026, 10:55 Uhr)

Das System befindet sich aktuell an der kritischen Grenze von **genau 25 aktiven Sessions**.

### Verzeichnis-Inventar:
- **Aktive Konversationen (`C:/Users/ich/.gemini/antigravity/conversations/`)**:
  - Anzahl `.pb` Dateien: **25**
- **Aktive Brain-Daten (`C:/Users/ich/.gemini/antigravity/brain/`)**:
  - Anzahl Ordner: **25** (zzgl. des Systemordners `tempmediaStorage`)
- **Archivierte Konversationen (`C:/Users/ich/Desktop/code/Antigravity_Archiv/conversations/`)**:
  - Anzahl `.pb.archive` Dateien: **151**
- **Archivierte Brain-Daten (`C:/Users/ich/Desktop/code/Antigravity_Archiv/brain/`)**:
  - Anzahl Ordner: **90**
- **Annotations-Verzeichnis (`C:/Users/ich/.gemini/antigravity/annotations/`)**:
  - Anzahl `.pbtxt` Dateien: **370**

### UI-Anzeige (Sidebar-Status, Stand 12.07.2026, 10:56 Uhr):
In der VS Code-Sidebar ("Workspaces") sind aktuell insgesamt **11 Sessions** sichtbar:
- **Workspace `Antigravity_Harness`**:
  - "Testing Connectivity an..." (vor 11 Std.)
- **Workspace `Nodges`**:
  - "Managing Antigravity S..." (aktuell)
  - "9" (vor 10 Min.)
  - "8" (vor 10 Min.)
  - "7" (vor 9 Min.)
  - "6" (vor 10 Min.)
  - "5" (vor 15 Min.)
  - "4" (vor 16 Min.)
  - "3" (vor 17 Min.)
  - "Archiving Legacy Chat ..." (vor 22 Min.)
  - "2" (vor 31 Min.)

Dies zeigt eine deutliche Diskrepanz: Obwohl 25 aktive Sessions auf der Festplatte liegen, zeigt das UI (selbst bei ausgeklapptem "See less") nur 11 Sessions an, die auf die beiden aktiven Workspaces aufgeteilt sind. Dies bestätigt, dass die restlichen 14 Sessions entweder nicht zu den geöffneten Workspaces passen oder bereits aus dem aktiven Index verbannt wurden.

---

## 2. Struktur-Analyse des Annotations-Verzeichnisses

Eine programmgesteuerte Analyse der 370 `.pbtxt`-Dateien in `C:/Users/ich/.gemini/antigravity/annotations/` ergab eine erhebliche Ansammlung verwaister (orphaned) Dateien:

| Kategorie | Anzahl Dateien | Beschreibung |
| :--- | :--- | :--- |
| **Aktive Zuordnungen** | 25 | Stimmen exakt mit den 25 aktiven `.pb` Dateien überein. |
| **Archivierte Zuordnungen** | 136 | Stimmen mit den im Archiv liegenden `.pb.archive` Dateien überein (von insgesamt 151). |
| **Vollstaendig verwaist** | 209 | Besitzen weder eine aktive noch eine archivierte Session-Datei auf der Festplatte. |

**Inhalt der `.pbtxt` Dateien**:
Die Dateien enthalten lediglich Metadaten wie den letzten Lese-Zeitpunkt des Nutzers, z.B.:
`last_user_view_time:{seconds:1783846526  nanos:347000000}`

---

## 3. Fehlerbeschreibung: Das 25-Session-Limit

### Symptom:
Wenn die Anzahl der aktiven `.pb` Dateien im Ordner `conversations/` das Limit von 25 überschreitet, kommt es zu einer Desynchronisation des internen Indexers. Nach einem Neustart der IDE (VS Code) oder dem Laden einer neuen Session werden im Seitenpanel ("Mission Control") fast alle historischen Chats ausgeblendet. Meist bleiben nur noch 2 Sessions sichtbar (die aktive und die letzte Cache-Session).

### Ursachenanalyse:
1. **Kein Live-Dateisystem-Scan**: Das UI liest die Liste der Sessions beim Start nicht direkt aus dem Ordner `conversations/` aus.
2. **Index-Abhängigkeit**: Der Client nutzt eine interne Index-Datenbank (möglicherweise in den binären Zuständen der Anwendung oder im Workspace-Cache). Wenn die Grenze von 25 überschritten wird, bricht die Synchronisation oder das Rendering des Indexes ab.
3. **Persistenz der Daten**: Es liegt **kein Datenverlust** vor. Die `.pb`-Dateien in `conversations/` und die Klartext-Gesprächsprotokolle (`overview.txt` in `brain/[ID]/.system_generated/logs/`) bleiben zu 100% intakt.
4. **Fehlgeschlagene manuelle Trigger**: Das manuelle Bewegen, Kopieren oder Editieren der `.pb`-Dateien triggert den Dateisystem-Watcher nicht ausreichend, um den Index im UI neu aufzubauen. Sobald Einträge aus dem internen Index gelöscht wurden, bleiben sie im UI verschwunden.

### Erkenntnisse nach Neustart bei exakt 25 Sessions:
Ein Neustart der IDE bei genau 25 physisch vorhandenen `.pb`-Dateien auf der Festplatte hat die Anzeige der 11 Sessions im UI **nicht** beschädigt. Alle 11 Sessions blieben unverändert und vollzählig erhalten. 

Dies lässt darauf schließen:
- Das reine Erreichen von 25 Sessions auf Betriebssystemebene zerstört den Index nach einem Neustart nicht sofort.
- Die kritische Desynchronisation in der Vergangenheit wurde primär dadurch ausgelöst, dass das PowerShell-Archivierungsskript `.pb`-Dateien im laufenden Betrieb der IDE verschoben und umbenannt hat, ohne dass der interne Indexer dies über eine API verarbeiten konnte. Die dadurch entstandenen verwaisten Referenzen im Index führten beim Neustart zum Absturz oder Reset der Index-Anzeige.

---

## 4. Validierter Workaround und Empfehlung

### Erfolgreicher Test (12.07.2026, 11:07 Uhr):
Die Offline-Archivierung wurde erfolgreich durchgeführt und verifiziert:
1. VS Code wurde komplett geschlossen.
2. Das Skript `archivieren.ps1` wurde in der externen PowerShell ausgeführt. Es hat 15 veraltete Sessions, zugehörige Brain-Ordner und `.pbtxt`-Annotationsdateien sauber verschoben.
3. Nach dem Neustart von VS Code blieben alle 11 aktiven Sessions in der Sidebar fehlerfrei erhalten. Der Index wurde nicht beschädigt.

### Empfehlung für zukünftige Archivierungen:
Der Workflow `/archiv_sessions` wurde gelöscht, um eine versehentliche Ausführung im laufenden Betrieb der IDE zu verhindern. Zukünftige Archivierungen sollten manuell bei komplett geschlossenem VS Code durchgeführt werden. Dabei müssen die `.pb`-Dateien, die `brain`-Ordner sowie die `.pbtxt`-Annotationsdateien synchron verschoben werden.

### Zu loesende Punkte fuer eine dauerhafte Behebung:
1. **Index-Ort lokalisieren**: Wo genau liegt der interne Index des Gemini-Clients, der die UI steuert?
2. **Re-Index erzwingen**: Wie kann man den Gemini-Client zwingen, den Ordner `conversations/` komplett neu einzulesen, falls der Index doch einmal korrupt wird?
3. **Bereinigung**: Die verbleibenden 209 verwaisten `.pbtxt`-Dateien im Annotations-Verzeichnis, die durch frühere unsaubere Löschungen entstanden sind, sollten einmalig bereinigt werden.
