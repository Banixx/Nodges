# Antigravity Betriebsarten, Schnittstellen und Verwaltungs-Komponenten

| Betriebsart / Interface | Beschreibung | Synonyme / Alternative Begriffe |
|---|---|---|
| **Antigravity Chat UI** | Eigenstaendiges, fokussiertes Desktop-Chatfenster fuer die direkte Interaktion mit dem KI-Assistenten. | Chat-App, Standalone Chat Window, Chat View, Floating Assistant |
| **Antigravity IDE** | Vollstaendige grafische Entwicklungsumgebung mit integriertem Code-Editor, Dateibaum, Terminal und Tool-Visualisierung (basiert auf VS Code). | IDE-Modus, Full IDE, VS Code Extension / Integration, Main Workspace |
| **Antigravity CLI** | Kommandozeilenschnittstelle (`agy`) zur Steuerung und Automatisierung ueber das Terminal. | CLI-Modus, `agy` CLI, Command Line Interface, Terminal Client |

## Verwaltungs-Komponenten (Unterscheidung)

| Komponente | Beschreibung | Abgrenzung zu Chat UI |
|---|---|---|
| **Mission Control / Agent Manager** | Zentrale Übersicht und Verwaltungs-Dashboard zur Kontrolle, Überwachung und Steuerung von parallelen Subagenten, Hintergrund-Tasks und Automatisierungen. | Das Chat UI dient der Gesprächsführung; Mission Control dient der Steuerung und Überwachung aller laufenden Agenten und Hintergrundprozesse. |

## Software-Basis

Die Antigravity Desktop-Anwendung basiert auf der VS Code-Architektur. Das eigenständige Chat-Fenster und die Antigravity IDE sind zwei Ansichten / Modi innerhalb dieser Gesamtanwendung.
