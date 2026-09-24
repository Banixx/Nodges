# Antigravity 2.3.1 Standalone App - Bug-Behebung und Workarounds

## 1. Verklemmte / Nicht anklickbare Sitzung ("Action Required" / "Stop Execution")

### Symptom
In der Google Antigravity 2.3.1 Standalone-Anwendung zeigt die linke Sidebar bei einer Sitzung das blaue "Action Required"-Label oder das "Stop Execution"-Symbol. Ein Mausklick auf die Sitzung wird durch das UI-Overlay blockiert.

### Ursachen
- Der UI-Renderer der Standalone App blockiert Klick-Events auf die Sidebar-Eintraege, wenn das "Action Required"-Hover-Tooltip ueberlagert.
- Der Agent wartet im Chat Canvas auf eine Freigabe, während die Navigation blockiert ist.

### Loesungen & Workarounds fuer die Standalone App

1. **App-UI Neu Laden (`Ctrl + R` oder `F5`)**
   - Druecken Sie in der Antigravity 2.3.1 Anwendung `Ctrl + R` (oder `F5`).
   - Dies veranlasst die Electron Standalone App zum Neuladen der Ansicht und hebt verklemmte Hover-Overlays sofort auf.

2. **Slash-Commands in der Prompt-Leiste**
   - **/clear** oder **/new**: Setzt den aktuellen Session-Zustand im Chat Canvas zurueck.
   - **/exit** oder **/quit**: Beendet die aktive Sitzung sauber.
   - **/keybindings**: Oeffnet den nativen Tastatur-Editor der Standalone App.
   - **/settings** oder **/config**: Oeffnet die nativen Einstellungen der App.

3. **Session-Lock im Dateisystem bereinigen**
   - Schliessen Sie die Antigravity 2.3.1 Standalone App.
   - Navigieren Sie zu den AppData-Verzeichnissen:
     - `C:/Users/ich/.gemini/antigravity/brain/`
     - `C:/Users/ich/AppData/Roaming/Antigravity/`
   - Loeschen Sie den Ordner der betroffenen Session-ID, um haengende Zustaende vollstaendig zu entfernen.

4. **Tastatur-Fokus & Freigabe**
   - Nutzen Sie `Tab` / `Shift + Tab`, um den Fokus direkt in das Chat-Canvas der Anwendung zu setzen.
   - Bei aktiven Dialogen druecken Sie `2` gefolgt von `Enter`, um "Allow for this session" ohne Mausklick zu gewaehren.
