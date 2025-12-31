# 14 Use-Cases und Einsatzszenarien

Dieses Dokument diskutiert praktische Anwendungsfälle für Nodges, basierend auf existierenden und potenziellen Datenstrukturen.

## 14.1 IT-Infrastruktur & Cloud-Architektur

Dies ist der klassische Use-Case für Nodges.
*   **Szenario**: Ein Unternehmen visualisiert seine Microservices-Landschaft (Kubernetes-Cluster).
*   **Nutzen**: 
    *   **Fehlersuche**: Ein roter, pulsierender Knoten zeigt sofort einen ausgefallenen Service.
    *   **Kaskadeneffekte**: Durch das Pfad-Highlighting sieht man, welche anderen Services von einem Ausfall betroffen sind.
    *   **Topologie-Check**: 3D zeigt, wenn Services über zu viele Hops miteinander kommunizieren (Latenz-Optimierung).

## 14.2 Cybersecurity: Attack-Graph Analyse

*   **Szenario**: Ein Security-Team analysiert einen Hackerangriff (Lateral Movement).
*   **Nutzen**: 
    *   **Pfad-Rekonstruktion**: Der `PATH`-Modus zeigt den Weg des Angreifers von der Firewall bis zum Datenbank-Server.
    *   **Blast-Radius**: Man sieht auf einen Blick, welche Knoten der Angreifer von seiner aktuellen Position aus theoretisch erreichen kann.
    *   **Mustererkennung**: Botnet-Strukturen haben oft spezifische geometrische Formen (Sterne oder dichte Cluster), die in 3D sofort ins Auge springen.

## 14.3 Wissensmanagement & Brainmapping

*   **Szenario**: Visualisierung eines internen Firmen-Wikis oder eines persönlichen "Zettelkastens".
*   **Nutzen**: 
    *   **Themen-Cluster**: Der `GROUP`-Modus färbt alle verwandten Themengebiete gleich ein.
    *   **Wissensexploration**: Man "fliegt" von einem Thema zum nächsten. Das regt assoziatives Denken an.
    *   **Daten-Beziehungen**: Im Info-Panel sieht man sofort die Metadaten zu einem Begriff (Autor, Datum, Quellen).

## 14.4 Biologie und Medizin

*   **Szenario**: Darstellung von Protein-Protein-Interaktionen oder neuronalen Netzwerken des Gehirns.
*   **Nutzen**: 
    *   **Räumliche Realität**: Da das Gehirn ein 3D-Objekt ist, ist eine 2D-Darstellung immer eine Verfälschung. Nodges kann die echten anatomischen Koordinaten der Neuronen nutzen.
    *   **Signalfluss**: Animierte Kanten-Pulses können den Fluss von Neurotransmittern simulieren.

## 14.5 Diskussion: Nicht vorhandene Files / Potential

Obwohl aktuell primär JSON-Files geladen werden, könnten zukünftige Versionen folgende "nicht-file"-basierte Use-Cases unterstützen:
*   **Live Packet Sniffing**: Einstöpseln in den Netzwerk-Traffic und Live-Rendering der Pakete als fliegende Punkte (PointClouds).
*   **Blockchain-Analyse**: Live-Visualisierung von Transaktionen in einem Block. Hierbei würde die Helix-Layout Engine die zeitliche Abfolge der Blöcke räumlich darstellen.

---
*Version: 1.0*
