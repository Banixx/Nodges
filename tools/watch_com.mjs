#!/usr/bin/env node
//
// watch_com.mjs — der COM-Waechter von piCon (Linux-Seite).
//
// Das Linux-Gegenstueck zu W:/tools/watch_com.ps1 (conT). Weil im Container
// keine inotify-Tools installiert sind, nutzt dieses Skript Node-eigenes
// fs.watch() (inotify unter der Haube) und faellt bei Bedarf auf kurzes
// Abfragen (Polling) zurueck.
//
// WICHTIG — Aufteilung der Orte (keine Rueckkopplung):
//   Ueberwacht wird NUR  /workspace/com        (der Inhalt, versioniert)
//   Protokoll+Pings nach /workspace/tools/com-bus  (die Klingel, lokal)
// Weil der Bus ausserhalb von com/ liegt, meldet das Protokoll sich nicht
// selbst zurueck. Genau das war der Fehler beim ersten Anlauf.
//
// Die Erweiterung /home/.pi/agent/extensions/nodges-com.ts liest die Liste und
// meldet Neues automatisch im naechsten Prompt — der eigentliche Weckruf.
//
// Bedient wird das hier ueber: bash tools/nodges-com.sh start|stop|status|read|ack|ping|watch

import fs from 'node:fs';
import path from 'node:path';

const COM = process.env.NODGES_COM_DIR || '/workspace/com';
const BUS = process.env.NODGES_COM_BUS || '/workspace/tools/com-bus';
const ROLLE = 'piCon';
const PROTOKOLL = path.join(BUS, 'events.log');
const PID_DATEI = process.env.NODGES_COM_PID || path.join(BUS, 'nodges-com-watch.pid');
const POLL_MS = 1500; // nur als Ersatz, wenn fs.watch nicht greift
const RUHE_MS = 500;  // dieselbe Datei wird in diesem Fenster nur einmal gemeldet

const BASIS = path.dirname(COM); // Ereignispfade werden relativ dazu angegeben

const FARBIG = Boolean(process.stdout.isTTY);
const VIOLETT = FARBIG ? '\x1b[38;5;141m' : '';
const ROSA = FARBIG ? '\x1b[38;5;213m' : '';
const RESET = FARBIG ? '\x1b[0m' : '';

// Tempraere Kruessel verschiedener Editoren werden nicht gemeldet.
const ENDE_RAUS = /(~|\.tmp|\.bak|\.swp?|\.swx|\.orig|\.part|\.crswap)$/;
const NAME_RAUS = /^(\.DS_Store|4913)$/;
const PING_MUSTER = /^ping-(all|picon)\.md$/i;

const meldeZeit = new Map();  // relativer Pfad -> Zeitpunkt der letzten Meldung
const kennungen = new Map();  // relativer Pfad -> groesse:mtime (nur Abfrage-Modus)

function pad(n) {
  return String(n).padStart(2, '0');
}

function zeitstempel() {
  try {
    return new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Berlin' }).replace('T', ' ');
  } catch {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
}

function busBereit() {
  fs.mkdirSync(BUS, { recursive: true });
  if (!fs.existsSync(PROTOKOLL)) fs.writeFileSync(PROTOKOLL, '');
}

function schreibZeile(text) {
  fs.appendFileSync(PROTOKOLL, text + '\n');
}

// Manche Editoren leeren die Datei erst und fuellen sie danach. Dann steht beim
// ersten Blick 0 B drin. Wir schauen hoechstens 60 ms noch einmal hin.
function groesseGeduldig(absolut) {
  let bytes = null;
  for (const _ of [0, 1, 2, 3]) {
    try {
      bytes = fs.statSync(absolut).size;
    } catch {
      return null;
    }
    if (bytes) return bytes;
    Atomics.wait ? Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20) : null;
  }
  return bytes; // 0 oder null
}

function relativ(absolut) {
  return path.relative(BASIS, absolut).replace(/\\/g, '/');
}

// Pings liegen im Bus; ihr Name entscheidet, ob sie an piCon (oder alle) gehen.
function pingDatei(absolut) {
  if (path.dirname(absolut) !== BUS) return false;
  return PING_MUSTER.test(path.basename(absolut));
}

// 'datei' = normale Aenderung in com/, null = ignorieren.
function meldeGrund(absolut) {
  const rel = relativ(absolut);
  const teile = rel.split('/');
  const STAMM = COM.split('/').pop();
  if (teile[0] !== STAMM) return null; // liegt ausserhalb von com/ -> uninteressant
  const datei = teile[teile.length - 1];
  if (ENDE_RAUS.test(datei) || NAME_RAUS.test(datei)) return null;
  if (datei.startsWith('.')) return null; // versteckte Helfer
  return 'datei';
}

function ersteZeile(absolut) {
  return pingText(absolut);
}

// Der gesamte brauchbare Text einer Ping-Datei: Ueberschrift-Zeilen (#) fallen
// weg, der Rest wird zu einer Zeile verbunden. Der Text muss in die
// Protokollzeile, weil die Datei danach geloescht wird und die Erweiterung
// sie beim Lesen nicht mehr findet.
function pingText(absolut) {
  try {
    const treffer = fs.readFileSync(absolut, 'utf8')
      .split('\n')
      .map((z) => z.trim())
      .filter((z) => z.length > 0 && !z.startsWith('#'));
    return treffer.length ? treffer.join(' ').replace(/\s+/g, ' ').slice(0, 500) : '';
  } catch {
    return '';
  }
}

function melden(art, absolut) {
  const rel = relativ(absolut);
  const istPing = pingDatei(absolut);
  const istDatei = meldeGrund(absolut) === 'datei';
  if (!istPing && !istDatei) return;

  const jetzt = Date.now();
  if (jetzt - (meldeZeit.get(rel) || 0) < RUHE_MS) return; // Speicherwelle, nur einmal
  meldeZeit.set(rel, jetzt);

  if (istPing) {
    // Erst lesen, dann die Klingel abnehmen: ein Ping meldet sich nur einmal.
    const betreff = ersteZeile(absolut);
    try {
      fs.unlinkSync(absolut);
    } catch {}
    schreibZeile(`${zeitstempel()}  PING      ${path.basename(absolut)}  ${betreff || '(leer)'}`);
    console.log(`${ROSA}PING an ${ROLLE}:${RESET} ${betreff || path.basename(absolut)}`);
    return;
  }

  const bytes = groesseGeduldig(absolut);
  const groessenText = bytes === null ? '(weg)' : `(${bytes} B)`;
  schreibZeile(`${zeitstempel()}  ${art.padEnd(9)} ${rel}  ${groessenText}`);
  const farbe = art === 'erstellt' ? VIOLETT : ROSA;
  console.log(`${farbe}COM_UPDATE:${RESET} ${rel} ${art} ${groessenText}`);
}

function dateienSammeln() {
  try {
    return fs.readdirSync(COM, { recursive: true, withFileTypes: true })
      .filter((eintrag) => eintrag.isFile())
      .map((eintrag) => path.join(eintrag.parentPath || eintrag.path, eintrag.name));
  } catch {
    return [];
  }
}

function pingDateienSammeln() {
  try {
    return fs.readdirSync(BUS, { withFileTypes: true })
      .filter((eintrag) => eintrag.isFile() && PING_MUSTER.test(eintrag.name))
      .map((eintrag) => path.join(BUS, eintrag.name));
  } catch {
    return [];
  }
}

function watchModus() {
  const waechter = fs.watch(COM, { recursive: true }, (ereignis, dateiname) => {
    if (!dateiname) return;
    const absolut = path.join(COM, dateiname);
    let istDatei = false;
    try {
      istDatei = fs.statSync(absolut).isFile();
    } catch {}
    const art = ereignis === 'rename' ? (istDatei ? 'erstellt' : 'verschoben') : 'geandert';
    melden(art, absolut);
  });

  waechter.on('error', (fehler) => {
    schreibZeile(`${zeitstempel()}  HINWEIS    Waechter-Fehler: ${fehler.message} — wechsle auf Abfragen.`);
    try {
      waechter.close();
    } catch {}
    pollModus();
  });

  console.log(`${VIOLETT}COM-Waechter laeuft${RESET} (flink, ueber inotify) auf ${COM}`);
  console.log(`Protokoll und Pings: ${BUS}`);
}

let pollTimer = null;
let busTimer = null;

// Pings liegen ausserhalb von com/ und brauchen deshalb einen eigenen Blick.
function pingSaeuberung() {
  if (busTimer) return;
  busTimer = setInterval(() => {
    for (const ping of pingDateienSammeln()) melden('ping', ping);
  }, POLL_MS);
}

function pollModus() {
  if (pollTimer) return;
  console.log(`${VIOLETT}COM-Waechter laeuft${RESET} (Abfrage alle ${POLL_MS} ms) auf ${COM}`);
  pollTimer = setInterval(() => {
    for (const absolut of dateienSammeln()) {
      try {
        const st = fs.statSync(absolut);
        const kennung = `${st.size}:${Math.floor(st.mtimeMs)}`;
        const alt = kennungen.get(absolut);
        if (alt !== kennung) melden(alt === undefined ? 'erstellt' : 'geandert', absolut);
        kennungen.set(absolut, kennung);
      } catch {}
    }
  }, POLL_MS);
}

function stoppen() {
  if (pollTimer) clearInterval(pollTimer);
  if (busTimer) clearInterval(busTimer);
  schreibZeile(`# --- Waechter ${ROLLE} gestoppt ${zeitstempel()}`);
  try {
    fs.unlinkSync(PID_DATEI);
  } catch {}
  process.exit(0);
}

async function start() {
  if (!fs.existsSync(COM)) {
    console.error(`FEHLER: ${COM} fehlt.`);
    process.exit(1);
  }
  busBereit();
  await new Promise((fertig) => fs.writeFile(PID_DATEI, String(process.pid), fertig));
  schreibZeile(`# --- Waechter ${ROLLE} gestartet ${zeitstempel()} (PID ${process.pid})`);
  pingSaeuberung();
  try {
    watchModus();
  } catch (fehler) {
    schreibZeile(`${zeitstempel()}  HINWEIS    fs.watch nicht verfuegbar (${fehler.message}) — Abfrage-Modus.`);
    pollModus();
  }
}

process.on('SIGTERM', stoppen);
process.on('SIGINT', stoppen);

start();
