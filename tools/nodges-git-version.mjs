#!/usr/bin/env node
// Versionsverwaltung fuer das Nodges-Repository.
// Liest und schreibt die Version an genau den vorgesehenen Stellen:
//   package.json        -> eine Stelle ("version" auf oberster Ebene)
//   package-lock.json   -> zwei Stellen (Kopf und packages."")
// Verschachtelte Versionsnummern von Abhaengigkeiten werden nie angefasst.
//
// Aufrufe:
//   node tools/nodges-git-version.mjs show
//   node tools/nodges-git-version.mjs bump patch
//   node tools/nodges-git-version.mjs bump minor
//   node tools/nodges-git-version.mjs check-release

import fs from 'node:fs';
import path from 'node:path';

const PKG = 'package.json';
const LOCK = 'package-lock.json';

// Wie viele "version"-Zeilen duerfen pro Datei ersetzt werden.
const MAX_TREFFER = new Map([
  [PKG, 1],
  [LOCK, 2],
]);

function dateiLesen(datei) {
  const voll = path.resolve(process.cwd(), datei);
  if (!fs.existsSync(voll)) {
    process.stderr.write(`FEHLER: ${datei} nicht gefunden (Bin ich im Repo-Root?)\n`);
    process.exit(1);
  }
  return fs.readFileSync(voll, 'utf8');
}

function aktuelleVersion() {
  return JSON.parse(dateiLesen(PKG)).version;
}

function teilePruefen(version) {
  const teile = version.split('.').map((teil) => Number(teil));
  if (teile.length !== 3 || teile.some((zahl) => !Number.isInteger(zahl) || zahl < 0)) {
    process.stderr.write(`FEHLER: ungueltige Versionsnummer "${version}"\n`);
    process.exit(1);
  }
  return teile;
}

// Ersetzt nur Zeilen der Form  "version": "<alt>"  im JSON-Rumpf,
// maximal so viele wie MAX_TREFFER erlaubt, und nur wenn der alte Wert identisch ist.
function versionSchreiben(alt, neu) {
  let gesamt = 0;

  for (const datei of [PKG, LOCK]) {
    const max = MAX_TREFFER.get(datei);
    const zeilen = dateiLesen(datei).split('\n');
    let treffer = 0;

    const ausgabe = zeilen.map((zeile) => {
      const fund = zeile.match(/^(\s*"version"\s*:\s*")([^"]*)(".*)$/);
      if (fund && fund[2] === alt && treffer < max) {
        treffer += 1;
        return `${fund[1]}${neu}${fund[3]}`;
      }
      return zeile;
    });

    if (treffer === 0) {
      process.stderr.write(
        `FEHLER: in ${datei} steht die Version "${alt}" nicht an der erwarteten Stelle.\n` +
          'Abbruch, es wurde nichts geschrieben.\n',
      );
      process.exit(1);
    }

    fs.writeFileSync(path.resolve(process.cwd(), datei), ausgabe.join('\n'));
    gesamt += treffer;
  }

  return gesamt;
}

const befehl = process.argv[2] ?? 'show';
const argument = process.argv[3] ?? '';

if (befehl === 'show') {
  process.stdout.write(`${aktuelleVersion()}\n`);
} else if (befehl === 'bump') {
  const alt = aktuelleVersion();
  const [haupt, neben, patch] = teilePruefen(alt);

  let neu;
  if (argument === 'patch') {
    neu = `${haupt}.${neben}.${patch + 1}`;
  } else if (argument === 'minor') {
    neu = `${haupt}.${neben + 1}.0`;
  } else if (argument === 'major') {
    neu = `${haupt + 1}.0.0`;
  } else {
    process.stderr.write(`FEHLER: unbekannte Stufe "${argument}". Erlaubt: patch, minor, major\n`);
    process.exit(1);
  }

  const anzahl = versionSchreiben(alt, neu);
  process.stdout.write(`${neu}\n`);
  process.stderr.write(`Version ${alt} -> ${neu} (${anzahl} Stelle(n) geschrieben)\n`);
} else if (befehl === 'check-release') {
  // Eine Version gilt als Meilenstein/Release, wenn der Patch-Anteil 0 ist (Minor oder Major).
  const version = aktuelleVersion();
  const [, , patch] = teilePruefen(version);
  if (patch !== 0) {
    process.stdout.write(`kein-release:${version}\n`);
    process.exit(1);
  }
  process.stdout.write(`release:${version}\n`);
} else if (befehl === 'check-major') {
  // Prueft, ob die aktuelle Version eine echte Major-Version ist (X.0.0).
  const version = aktuelleVersion();
  const [, neben, patch] = teilePruefen(version);
  if (neben === 0 && patch === 0) {
    process.stdout.write(`major:${version}\n`);
    process.exit(0);
  }
  process.stdout.write(`kein-major:${version}\n`);
  process.exit(1);
} else {
  process.stderr.write(
    'Aufruf: node tools/nodges-git-version.mjs show | bump patch | bump minor | bump major | check-release | check-major\n',
  );
  process.exit(1);
}
