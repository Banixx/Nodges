# Hierarchische und persistente Mapping-UI in Nodges

Dieses Dokument beschreibt die Implementierung und Funktionsweise der hierarchischen Mapping-UI für verschachtelte Attribute in Nodges (Build 3).

## 1. Übersicht & Motivation

In vorherigen Versionen wurden alle Unterattribute eines übergeordneten Objekts (z. B. `gravitation.anziehungskraft`, `gravitation.abstossungskraft`) in einer verschachtelten Liste innerhalb der Haupt-Kachel gerrendered. Dies führte zu visuellen Problemen, da die Verbindungslinien (Bezier-Kurven) bei Scroll- oder Auf-/Zuklapp-Vorgängen nicht sauber mit den Snapdots mitwanderten.

Durch die Umstellung auf eine flache Geschwister-Struktur werden verschachtelte Attribute nun als eigenständige Kacheln direkt unter ihrem übergeordneten Parent-Element im DOM gerendert.

## 2. Implementierungsdetails

### 2.1 DOM-Struktur für Unterattribute
Die Unterattribute werden als eigenständige Geschwister (`.mapping-sub-item`) unter dem Haupt-Element in `this.leftColumn` eingefügt:
- **Einzug (Margin-Left)**: `15px` sorgt für die visuelle Hierarchie.
- **Linke Border**: Eine farbige Border (`var(--accent, #ffa500)`) verdeutlicht die Zugehörigkeit zum Parent.
- **Snapdots**: Jedes Unterattribut besitzt seinen eigenen vollwertigen Snapdot, der exakt positioniert wird.

### 2.2 Einklapp- und Aufklapp-Logik (Persistenz)
Um eine optimale Usability zu garantieren, gelten folgende Regeln für das Auf- und Einklappen von Attribut-Kacheln:
1. **Benutzerauswahl**: Klickt der Benutzer auf ein nicht-gemapptes Attribut, werden alle anderen nicht-gemappten Attribute eingeklappt. Das ausgewählte Attribut klappt auf.
2. **Aktive Verbindungen (Mappings)**: Besitzt ein Attribut oder eines seiner Unterattribute eine aktive Verbindung (Mapping), bleibt diese Gruppe permanent im UI geöffnet und sichtbar. Sie klappt beim Auswählen anderer Attribute nicht automatisch ein.
3. **Zustandserhalt**: Der Zustand wird über zwei Sets (`userExpandedAttributes` und `userCollapsedAttributes`) verwaltet. Dadurch bleibt der Einklappzustand auch beim Neuzeichnen der Spalten (`renderColumns`) vollständig erhalten.

### 2.3 Kurven-Rendering Fallback
Falls ein gemapptes Unterattribut manuell eingeklappt wird, fällt die Verbindungslinie automatisch auf den Snapdot des übergeordneten Parent-Attributs zurück. Dies verhindert, dass Verbindungslinien im Nirgendwo enden oder unsichtbar werden.

---

## 3. Visuelle Verifikation

Der folgende Screenshot zeigt die finale Umsetzung in der Anwendung:

![Hierarchical Mapping UI in Action](file:///C:/Users/ich/Desktop/code/_projects/Nodges/doc/mapping_verified.png)
