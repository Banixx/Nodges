# Beispiel: IT-Netzwerk- & Cybersecurity-Topologie in Nodges

Dieses Dokument zeigt ein IT-Netzwerkinfrastruktur- und Cybersecurity-Topologiemodell, das die Fähigkeiten von Nodges zur Darstellung dynamischer Netzwerkzustände, Sicherheitslevels und Angriffsvektoren nutzt.

## Visual Mappings im Cybersecurity-Beispiel

1. **Größe nach Rechenleistung (Linear):**
   Das Attribut `rechenleistung` (gemessen in CPU-Kernen) bestimmt die physische Knotengröße (`size`). Die große "Kundendatenbank" und die "DMZ Webserver" stechen als rechenstarke Knoten hervor, während Anwendergeräte wie die "HR-Workstation" entsprechend kleiner dargestellt werden.

2. **Farbe nach Sicherheitsniveau (Bipolar):**
   Das Attribut `sicherheitsniveau` reicht von `-1.0` (kompromittiert / infiziert / extrem unsicher) bis `1.0` (vollständig gehärtet / sicher).
   - Die `bipolar`-Funktion bildet diesen Bereich auf eine Farbskala zwischen Rot (`#c0392b`, für negative Werte) und Grün (`#27ae60`, für positive Werte) ab.
   - Der "Webserver" (`-0.8`) und die "Dev-Workstation" (`-0.4`) leuchten rot, da sie kompromittiert wurden. Die "Kundendatenbank" (`1.0`) leuchtet beruhigend grün.

3. **Glow-Effekt nach Angriffsstatus (Boolean):**
   Geräte, die aktuell unter direktem Angriff stehen oder Schadcode ausführen (`angriff_aktiv: true`), erhalten im 3D-Raum einen markanten, pulsierenden Leuchteffekt (`glow`). Im Modell sind dies der kompromittierte Webserver sowie die betroffene Dev-Workstation.

4. **Kantenbreite nach Bandbreite (Linear):**
   Die Dicke (`thickness`) einer Kante verhält sich proportional zur maximalen Bandbreite der Verbindung. Sehr dicke Verbindungen (z. B. 10 Gbps) liegen zwischen dem Hub/Router und der Datenbank, während die lokale DDoS-Verbindung des Angreifers relativ schmal dargestellt wird.

5. **Kantenkrümmung nach Latenz (Linear):**
   Die Krümmung (`curvature`) visualisiert die Latenz (Verzögerung) in Millisekunden. Interne LAN-Verbindungen mit extrem niedriger Latenz (z. B. 1-2 ms) sind nahezu schnurgerade Linien. Die Verbindung des externen Angreifers über ein Botnet ins Rechenzentrum (120 ms Latenz) wird als hoher Bogen dargestellt.

6. **Kantenanimation nach Aktivität (Pulsierend):**
   Das Attribut `aktivitaet` bestimmt die Frequenz des Pulsierens entlang der Verbindungen. Stark frequentierte Leitungen (z. B. der HTTP-Verkehr mit `aktivitaet: 0.9`) pulsieren sehr schnell, während schlafende Backups (`aktivitaet: 0.2`) ein extrem langsames Pulsieren aufweisen.

## JSON-Modellstruktur

Die zugrundeliegende JSON-Struktur (`public/data/Cybersecurity_Beispiel.json`):

```json
{
  "system": "Netzwerkinfrastruktur & IT-Sicherheit",
  "dataModel": {
    "entities": {
      "Netzwerkgeraet": {
        "properties": {
          "rechenleistung": { "type": "continuous", "range": [1.0, 128.0] },
          "sicherheitsniveau": { "type": "continuous", "range": [-1.0, 1.0] },
          "angriff_aktiv": { "type": "boolean" },
          "typ": { "type": "categorical", "values": ["Server", "Datenbank", "Router", "Arbeitsplatz", "Firewall"] }
        }
      }
    },
    "relationships": {
      "Datenverbindung": {
        "properties": {
          "bandbreite": { "type": "continuous", "range": [10.0, 10000.0] },
          "latenz": { "type": "continuous", "range": [1.0, 150.0] },
          "aktivitaet": { "type": "continuous", "range": [0.0, 1.0] }
        }
      }
    }
  },
  "visualMappings": {
    "defaultPresets": {
      "Netzwerkgeraet": {
        "size": { "source": "rechenleistung", "function": "linear", "domain": [1.0, 128.0], "range": [0.5, 2.2] },
        "color": { "source": "sicherheitsniveau", "function": "bipolar", "params": { "positive": "#27ae60", "negative": "#c0392b" } },
        "glow": { "source": "angriff_aktiv", "function": "categorical", "params": { "mapping": { "true": 1.0, "false": 0.0 } } }
      },
      "Datenverbindung": {
        "color": { "source": "constant", "function": "linear", "params": { "color": "#7f8c8d" } },
        "thickness": { "source": "bandbreite", "function": "linear", "domain": [10.0, 10000.0], "range": [0.04, 0.35] },
        "curvature": { "source": "latenz", "function": "linear", "domain": [1.0, 150.0], "range": [0.0, 0.5] },
        "animation": { "source": "aktivitaet", "function": "pulse", "params": { "frequency": 3.0 } }
      }
    }
  }
}
```
