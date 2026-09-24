# Erklaerung der Diskrepanz zwischen Docker CLI und Docker Desktop

## Ursache der unterschiedlichen Anzeigen

1. **Verhalten der Docker CLI (`docker container ls`)**:
   - Der Befehl `docker container ls` (bzw. `docker ps`) zeigt in der Konsole **standardmaessig nur aktuell laufende Container** an.
   - Da der Container `pi-harness` aktuell gestoppt ist, bleibt die Liste in der Konsole leer.
   - Um auch gestoppte Container in der Konsole anzuzeigen, muss der Schalter `-a` verwendet werden:
     ```powershell
     docker container ls -a
     # oder
     docker ps -a
     ```

2. **Verhalten von Docker Desktop**:
   - Auf dem Screenshot in Docker Desktop ist zu sehen, dass die Option **"Only show running containers"** ausgeschaltet (grau) ist.
   - Dadurch listet Docker Desktop alle vorhandenen Container auf – sowohl laufende als auch gestoppte.
   - Oben im Screenshot steht explizit: *No containers are running*, und der Status-Kreis neben `pi-harness` ist grau (gestoppt).

## Zusammenfassung

Der Container `pi-harness` existiert auf dem System, ist aber im Zustand **gestoppt** (Exited). Daher erscheint er in Docker Desktop (wo alle Container angezeigt werden), aber nicht bei einfachen `docker ps` Befehlen in der CLI (wo nur aktive Container gefiltert werden).
