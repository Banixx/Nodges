/**
 * export_com_txt.mjs — Exportiert die zentralen Dateien, Gesamtschau, Arbeitspapiere
 * und die 10 neuesten Dokumente als .txt-Dateien nach com/txt/.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TXT_DIR = path.join(ROOT, 'com', 'txt');

if (!fs.existsSync(TXT_DIR)) {
  fs.mkdirSync(TXT_DIR, { recursive: true });
}

const fileDefinitions = [
  // Kategorie A: Zentrale Dokumente
  {
    target: '01_AGENTS.txt',
    source: 'AGENTS.md',
    desc: 'Zentrale Arbeitsregeln, Multi-Harness Architektur (conT & piCon), Single Source of Truth und COM-Bus'
  },
  {
    target: '02_00_start_hier.txt',
    source: 'com/00_start_hier.md',
    desc: 'Verbindlicher Einstieg, Lesereihenfolge und Orientierung fuer alle Agenten'
  },
  {
    target: '03_entscheidungen.txt',
    source: 'com/entscheidungen.md',
    desc: 'Bindende Benutzerbeschluesse mit Datum, Rang 1 der Dokumentenhierarchie'
  },
  {
    target: '04_todo.txt',
    source: 'com/todo.md',
    desc: 'Aktueller Aufgabenstand, erledigte Schritte und offene Punkte'
  },
  {
    target: '05_fragen_an_user.txt',
    source: 'com/fragen_an_user.md',
    desc: 'Offene Entscheidungsvorlagen und Fragen an den Benutzer Banixx'
  },
  {
    target: '06_setup.txt',
    source: 'com/setup.md',
    desc: 'Technische Kurzanleitung, Container-, Git- und Setup-Referenz'
  },
  {
    target: '07_ideen.txt',
    source: 'com/ideen.md',
    desc: 'Ungepruefte Ideensammlung und zukuenftige Ausbaustufen'
  },

  // Kategorie B: Gesamtschau & konzeptionelle Arbeitspapiere
  {
    target: '10_bericht_gesamtschau_und_historie.txt',
    source: 'com/bericht.md',
    desc: 'Ausfuehrlicher Gesamtbericht, Historie aller Phasen und Multi-Harness Dialogprotokoll (58 KB)'
  },
  {
    target: '11_nodges_gesamtdokumentation_106_8.txt',
    source: 'com/doc/Nodges_doc_106_8/NodgesDoc_106_8.md',
    desc: 'Grosse Gesamtdokumentation ueber alle 16 Kapitel (Architektur, Kognition, Pipeline, UI, Shader, Physik) (101 KB)'
  },
  {
    target: '12_multi_harness_setup_und_kommunikation.txt',
    source: 'com/setup/multi_harness_setup_und_kommunikation.md',
    desc: 'Technische Spezifikation der Multi-Harness-Kommunikation und Infrastruktur'
  },
  {
    target: '13_build14_spezifikation_lightrag.txt',
    source: 'com/feature/build14/build14-spezifikation.md',
    desc: 'Fachliche Spezifikation fuer Build 14 (LightRAG Backend, DTOs, Graph-Slicing)'
  },
  {
    target: '14_setup_llm_orientierung.txt',
    source: 'com/feature/Konzeptionelles/setup-llm-orientierung.md',
    desc: 'Konzeptionelles Arbeitspapier zur Orientierung grosser Sprachmodelle im Nodges-Graph'
  },
  {
    target: '15_markt_und_datavisualiser_konzept.txt',
    source: 'com/feature/Konzeptionelles/markt_datavisualiser.md',
    desc: 'Konzeptionelles Arbeitspapier Marktueberblick und 3D-Datenvisualisierung'
  },

  // Kategorie C: Die 10 neuesten Arbeitsberichte & Feature-Rapporte
  {
    target: '20_doc_0_106_23_test5_pong1_bericht.txt',
    source: 'com/doc/0_106_23_test5_pong1_bericht.md',
    desc: 'Ergebnisbericht piCon zu Feature test5 (Philosophie von Nodges, Kognition, VDB & Local-First)'
  },
  {
    target: '21_doc_0_106_23_test_infrastruktur_bericht.txt',
    source: 'com/doc/0_106_23_test_infrastruktur_und_com_bus_mechanismen_bericht.md',
    desc: 'Abschlussbericht conT zu Test-Infrastruktur Harmonisierung und COM-Bus Mechanismen'
  },
  {
    target: '22_doc_0_106_13_build14_dashboard_bericht.txt',
    source: 'com/doc/0_106_13_build14_dashboard_und_tooling_bericht.md',
    desc: 'Arbeitsbericht zu Build 14 Dashboard, One-Page Visualisierung und Backend-DTOs'
  },
  {
    target: '23_doc_0_106_21_pi_harness_model_liste.txt',
    source: 'com/doc/0_106_21_pi_harness_model_liste.md',
    desc: 'Referenzliste der im Pi-Agenten verfuegbaren LLM-Modelle und Konfigurationen'
  },
  {
    target: '24_feature_test5_rapport_philosophie.txt',
    source: 'com/feature/test5/rapport_test5.md',
    desc: 'Multi-Harness-Rapport test5: Philosophie von Nodges, Kognitionspsychologie und Local-First'
  },
  {
    target: '25_feature_test5_dashboard.txt',
    source: 'com/feature/test5/dashboard.md',
    desc: 'One-Page Dashboard zu Feature test5 (Philosophie, Ziele, Metriken)'
  },
  {
    target: '26_feature_test_infrastruktur_rapport.txt',
    source: 'com/feature/test_infrastruktur/rapport_test_infrastruktur.md',
    desc: 'Vollstaendiger Multi-Harness-Rapport (14 Abschnitte) zur Test-Infrastruktur (L0-L3)'
  },
  {
    target: '27_feature_test_infrastruktur_dashboard.txt',
    source: 'com/feature/test_infrastruktur/dashboard.md',
    desc: 'One-Page Dashboard zur Test-Infrastruktur (100% abgeschlossen)'
  },
  {
    target: '28_feature_git_hooks_rapport.txt',
    source: 'com/feature/git_hooks/rapport_git_hooks.md',
    desc: 'Rapport zur Einfuehrung und Verifikation der Git-Hooks (pre-commit, pre-push)'
  },
  {
    target: '29_feature_git_hooks_dashboard.txt',
    source: 'com/feature/git_hooks/dashboard.md',
    desc: 'One-Page Dashboard zum Feature Git-Hooks'
  },
  {
    target: '30_feature_build14_rapport.txt',
    source: 'com/feature/build14/rapport_build14.md',
    desc: 'Multi-Harness-Rapport zu Build 14 (LightRAG Backend-Ingestion & DTO-Pipeline)'
  },
  {
    target: '31_feature_build14_dashboard.txt',
    source: 'com/feature/build14/dashboard.md',
    desc: 'One-Page Dashboard zum Feature Build 14'
  }
];

const results = [];
let allInOneContent = '';

allInOneContent += '================================================================================\n';
allInOneContent += 'NODGES GESAMTBAND (ALL-IN-ONE TEXT-EXPORT)\n';
allInOneContent += 'Stand: 28. September 2026 | Version: 0.106.27\n';
allInOneContent += 'Enthaelt die zentralen Steuerungsdateien, Gesamtdokumentation, Spezifikationen,\n';
allInOneContent += 'Arbeitspapiere sowie die 10 neuesten Arbeitsberichte und Feature-Rapporte.\n';
allInOneContent += '================================================================================\n\n';

for (const def of fileDefinitions) {
  const srcPath = path.join(ROOT, def.source);
  const tgtPath = path.join(TXT_DIR, def.target);

  if (!fs.existsSync(srcPath)) {
    console.warn(`WARNUNG: Quelldatei nicht gefunden: ${def.source}`);
    continue;
  }

  const raw = fs.readFileSync(srcPath, 'utf8');
  const stats = fs.statSync(srcPath);

  let header = '';
  header += '================================================================================\n';
  header += `DATEI:        ${def.target}\n`;
  header += `QUELLE:       ${def.source}\n`;
  header += `BESCHREIBUNG: ${def.desc}\n`;
  header += `STAND:        28. September 2026\n`;
  header += `GROESSE:      ${stats.size} Bytes\n`;
  header += '================================================================================\n\n';

  const fullContent = header + raw;
  fs.writeFileSync(tgtPath, fullContent, 'utf8');

  allInOneContent += '\n\n';
  allInOneContent += '################################################################################\n';
  allInOneContent += `### ABSCHNITT: ${def.target}\n`;
  allInOneContent += `### QUELLE:    ${def.source}\n`;
  allInOneContent += `### THEMA:     ${def.desc}\n`;
  allInOneContent += '################################################################################\n\n';
  allInOneContent += raw;
  allInOneContent += '\n';

  results.push({
    file: def.target,
    source: def.source,
    desc: def.desc,
    size: stats.size
  });
}

// 1. All-in-One Datei schreiben
const allInOnePath = path.join(TXT_DIR, 'NODGES_GESAMTBAND_ALL_IN_ONE.txt');
fs.writeFileSync(allInOnePath, allInOneContent, 'utf8');

// 2. Synthetisierte Gesamtschau / Management Summary
const ueberblickContent = `================================================================================
GESAMTSCHAU NODGES: ARCHITEKTUR, PHILOSOPHIE, HARNESSES & STATUS
Stand: 28. September 2026 | Nodges Version 0.106.27
Ablage: com/txt/00_GESAMTSCHAU_NODGES_UEBERBLICK.txt
================================================================================

1. PROJEKTIDENTITAET & PHILOSOPHIE
--------------------------------------------------------------------------------
Nodges ist ein kognitionspsychologisch fundierter 3D-Netzwerk-Visualisierer auf Basis
von Three.js (Frontend) und LightRAG (Backend).
Kernprinzipien:
* Spatial Literacy & Cognitive Offloading: Nutzung des menschlichen Raeumlichkeits-
  sinns (3D-Raum, Groesse, Farbe, Dynamik/Textur), um komplexe semantische Netze
  ohne visuelle Ueberlastung erfassbar zu machen.
* Local-First & Datensouveraenitaet: Saemtliche Wissensgraphen, Vektorspeicher (VDB)
  und Graph-Datenbanken verbleiben lokal auf dem Host/Container (keine ungefragte Cloud-Ablage).
* Single Source of Truth (SSoT): Es gibt genau einen physischen Arbeitsort:
  /home/unixusername/nodges (WSL2 ext4). Windows 11 greift ueber das Netzlaufwerk
  W:/ darauf zu, der Docker-Container ueber /workspace. Kein Git-Sync fuer lokale Arbeit.

2. HARNESS-ROLLEN & MULTI-HARNESS-VERBUND
--------------------------------------------------------------------------------
* conT (Host / Windows 11 / Antigravity):
  Verantwortlich fuer UI, 3D-Canvas, Three.js Rendering, Dokumentation und E2E-Tests.
  Bedient L0 (TypeScript, Biome, Knip) und L2 (Playwright mit SwiftShader).
* piCon (Linux-Docker-Container 'pi-harness' / /workspace):
  Verantwortlich fuer Container-Dienste, Vite-Devserver, LightRAG-Backend, Python-Venv
  und Skripte. Bedient L1 (Vitest Unit-Tests) und L3 (Pytest Backend-Tests).
* dopi (Docker & Host-Orchestrator, Bedarfsharness):
  Host-Docker-Setup, Docker Compose, Container-Lifecycle. Kein Dauerturnus.
* Der COM-Bus (tools/com-bus/):
  Ereignisbasierter Kommunikations- und Ping-Bus. Dateiaenderungen in com/ werden sofort
  in events.log erfasst. Pings wecken das Partner-Harness autonom ueber Hintergrund-Waechter.

3. GIT-STRATEGIE & QUALITAETSSTUFEN (L0 BIS L3)
--------------------------------------------------------------------------------
* Primaerer Arbeitsbranch: 'main' (Branch 'pi' ist geloescht).
* 'save' (tools/nodges-git.sh save): Patch-Version +1, lokaler Commit, kein Push.
* 'release' (tools/nodges-git.sh release --bestaetigt-durch-user): Minor-Release,
  prueft L0 (Typecheck), L1 (Unit-Tests via Container-Bruecke) und L2 (E2E),
  setzt lokales Git-Tag (z.B. v0.107.0). KEIN Push nach GitHub.
* 'major' (tools/nodges-git.sh major --bestaetigt-durch-user): Nur nach expliziter
  Rueckfrage an den Benutzer geht ein Major-Release (X.0.0) nach GitHub (origin/main).
* Qualitaetsstufen:
  - L0 (Statisch): TypeScript ('tsc --noEmit'), Biome Linter/Formatter, Knip Export-Scan.
  - L1 (Unit-Tests): 246 Vitest-Tests in 20 Testdateien (243 passed, 3 skipped), verbleibt im Container.
  - L2 (E2E Browser): 4 Playwright-Suiten (Canvas, Sidebar-Tabs, Graph, OrbitControls) auf Windows-Host.
  - L3 (Backend): 27 Pytest-Tests in lightrag-backend/tests/test_api.py (CRUD, Traversal-Schutz).

4. AKTUELLE FEATURES & VORHABEN (STAND 28.09.2026)
--------------------------------------------------------------------------------
* test_infrastruktur (com/feature/test_infrastruktur/):
  Erfolgreich abgeschlossen (100%). L1 fest an Container gebunden; conT ueber
  pruefe_unit_tests() in tools/nodges-git.sh entkoppelt; CI-Luecke fuer L3 in verify.yml geschlossen.
* git_hooks (com/feature/git_hooks/):
  Erfolgreich eingerichtet (100%). Pre-commit schuetzt Secrets; Pre-push blockiert
  jeden Push ausser Major-Releases.
* build14 (com/feature/build14/):
  LightRAG Backend-Ingestion, standardisierte DTOs (weight, keywords, description, sources),
  Seeds via entities_vdb.query, BFS-Subgraphen statt Vollgraph-Hardslicing.
* test5 (com/feature/test5/):
  Philosophie von Nodges, Kognitionspsychologie und Systemphilosophie (in Bearbeitung).

5. DATEISTRUKTUR DES TEXT-ARCHIVS (com/txt/)
--------------------------------------------------------------------------------
Alle Dateien liegen unter com/txt/ als reine, plattformunabhaengige .txt-Dateien vor:
- 00_GESAMTSCHAU_NODGES_UEBERBLICK.txt  : Diese zusammenfassende Gesamtschau
- INDEX_DATEIEN.txt                     : Vollstaendiges Verzeichnis aller 25 Textdokumente
- NODGES_GESAMTBAND_ALL_IN_ONE.txt      : Vollstaendiger Text-Gesamtband (alle Dateien in einer)
- 01_AGENTS.txt bis 07_ideen.txt        : Die 7 zentralen Steuerungsdateien
- 10_bericht_... bis 15_markt_...       : Die 6 konzeptionellen Gesamtschau- und Spezifikationspapiere
- 20_doc_... bis 31_feature_...         : Die 12 neuesten Feature-Rapporte und Berichte
`;

fs.writeFileSync(path.join(TXT_DIR, '00_GESAMTSCHAU_NODGES_UEBERBLICK.txt'), ueberblickContent, 'utf8');

// 3. INDEX_DATEIEN.txt schreiben
let indexContent = '';
indexContent += '================================================================================\n';
indexContent += 'INDEX DER EXPORTIERTEN TEXTDATEIEN (com/txt/)\n';
indexContent += 'Stand: 28. September 2026 | Nodges Version 0.106.27\n';
indexContent += `Gesamtanzahl Dokumente: ${results.length + 3} Dateien\n`;
indexContent += '================================================================================\n\n';

indexContent += 'UEBERSICHTS- UND SAMMELDATEIEN:\n';
indexContent += '--------------------------------------------------------------------------------\n';
indexContent += '00_GESAMTSCHAU_NODGES_UEBERBLICK.txt\n';
indexContent += '  Umfassende Zusammenfassung: Architektur, Kognition, Harnesses, Git-Workflow, Status\n\n';
indexContent += 'NODGES_GESAMTBAND_ALL_IN_ONE.txt\n';
indexContent += '  Alle 25 Dokumente vollstaendig zusammenhaengend in einer einzigen Textdatei (fuer LLM-Ingestion)\n\n';
indexContent += 'INDEX_DATEIEN.txt\n';
indexContent += '  Dieses Verzeichnis aller exportierten Dateien\n\n';

indexContent += 'EINZELDOKUMENTE:\n';
indexContent += '--------------------------------------------------------------------------------\n';
for (const r of results) {
  indexContent += `${r.file.padEnd(46)} | ${(Math.round(r.size / 1024) + ' KB').padStart(7)} | ${r.desc}\n`;
  indexContent += `  -> Original: ${r.source}\n\n`;
}

fs.writeFileSync(path.join(TXT_DIR, 'INDEX_DATEIEN.txt'), indexContent, 'utf8');

console.log(`Erfolg: ${results.length} Dokumente + 3 Uebersichtsdateien in ${TXT_DIR} erstellt.`);
