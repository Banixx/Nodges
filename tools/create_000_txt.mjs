import fs from 'node:fs';
import path from 'node:path';

const dir = 'W:/com/txt';
const files = [
  { file: '00_GESAMTSCHAU_NODGES_UEBERBLICK.txt', origin: 'Synthetisierte Gesamtschau / Management Summary', desc: 'Umfassende Zusammenfassung: Architektur, Kognition, Harnesses, Git-Workflow, Status' },
  { file: '01_AGENTS.txt', origin: 'AGENTS.md', desc: 'Zentrale Arbeitsregeln, Multi-Harness Architektur (conT & piCon), Single Source of Truth und COM-Bus' },
  { file: '02_00_start_hier.txt', origin: 'com/00_start_hier.md', desc: 'Verbindlicher Einstieg, Lesereihenfolge und Orientierung fuer alle Agenten' },
  { file: '03_entscheidungen.txt', origin: 'com/entscheidungen.md', desc: 'Bindende Benutzerbeschluesse mit Datum, Rang 1 der Dokumentenhierarchie' },
  { file: '04_todo.txt', origin: 'com/todo.md', desc: 'Aktueller Aufgabenstand, erledigte Schritte und offene Punkte' },
  { file: '05_fragen_an_user.txt', origin: 'com/fragen_an_user.md', desc: 'Offene Entscheidungsvorlagen und Fragen an den Benutzer Banixx' },
  { file: '06_setup.txt', origin: 'com/setup.md', desc: 'Technische Kurzanleitung, Container-, Git- und Setup-Referenz' },
  { file: '07_ideen.txt', origin: 'com/ideen.md', desc: 'Ungepruefte Ideensammlung und zukuenftige Ausbaustufen' },
  { file: '10_bericht_gesamtschau_und_historie.txt', origin: 'com/bericht.md', desc: 'Ausfuehrlicher Gesamtbericht, Historie aller Phasen und Multi-Harness Dialogprotokoll' },
  { file: '11_nodges_gesamtdokumentation_106_8.txt', origin: 'com/doc/Nodges_doc_106_8/NodgesDoc_106_8.md', desc: 'Grosse Gesamtdokumentation ueber alle 16 Kapitel (Architektur, Kognition, Pipeline, UI, Shader, Physik)' }
];

let doc = '';
doc += '================================================================================\n';
doc += 'NODGES KERN-SAMMELBAND (00 BIS 11)\n';
doc += 'Stand: 28. September 2026 | Nodges Version 0.106.27\n';
doc += 'Ablage: W:/com/txt/000_NODGES_KERN_00_BIS_11.txt\n';
doc += 'Enthaelt alle 10 zentralen Steuerungs- und Basisdokumente von 00 bis 11\n';
doc += 'in einem einzigen konsolidierten Dokument fuer schnellen LLM- und Lese-Zugriff.\n';
doc += '================================================================================\n\n';

doc += 'INHALTSVERZEICHNIS DER ENTHALTENEN QUELLEN:\n';
doc += '--------------------------------------------------------------------------------\n';
files.forEach((f, idx) => {
  const num = String(idx + 1).padStart(2, '0');
  doc += `[${num}/10] ${f.file.padEnd(42)} | Ursprung: ${f.origin}\n`;
  doc += `        Thema: ${f.desc}\n\n`;
});
doc += '================================================================================\n\n\n';

files.forEach((f, idx) => {
  const num = String(idx + 1).padStart(2, '0');
  const filePath = path.join(dir, f.file);
  const content = fs.readFileSync(filePath, 'utf8');

  doc += '################################################################################\n';
  doc += '================================================================================\n';
  doc += `>>> START QUELLE [${num}/10]: ${f.file}\n`;
  doc += `>>> DATEIPFAD:                 W:/com/txt/${f.file}\n`;
  doc += `>>> URSPRUNG:                  ${f.origin}\n`;
  doc += `>>> BESCHREIBUNG:              ${f.desc}\n`;
  doc += '================================================================================\n';
  doc += '################################################################################\n\n';
  
  doc += content.trim();
  doc += '\n\n';
  doc += '--------------------------------------------------------------------------------\n';
  doc += `<<< ENDE QUELLE [${num}/10]: ${f.file}\n`;
  doc += '--------------------------------------------------------------------------------\n\n\n\n';
});

const targetFile = path.join(dir, '000_NODGES_KERN_00_BIS_11.txt');
fs.writeFileSync(targetFile, doc, 'utf8');
const stats = fs.statSync(targetFile);
console.log('Erfolgreich erstellt:', targetFile, 'Groesse:', stats.size, 'Bytes');
