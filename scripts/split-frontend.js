'use strict';
// Découpe frontend/app.js en modules (scripts classiques, sans build).
// Constantes pures -> frontend/js/*.js | logique -> frontend/js/app.js (IIFE inchangée).
const fs = require('node:fs');
const path = require('node:path');
const dir = path.resolve(__dirname, '..', 'frontend');
const jsDir = path.join(dir, 'js');
fs.mkdirSync(jsDir, { recursive: true });
let src = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');

function extract(startMarker, endMarker, outFile, title) {
  const s = src.indexOf(startMarker);
  if (s < 0) throw new Error('marqueur introuvable: ' + startMarker);
  const e = src.indexOf(endMarker, s);
  if (e < 0) throw new Error('fin introuvable pour: ' + startMarker);
  const block = src.slice(s, e + endMarker.length);
  fs.writeFileSync(
    path.join(jsDir, outFile),
    '/* ChessMaster — ' + title + ' (constantes pures, sans dépendance) */\n' + block + '\n'
  );
  src = src.slice(0, s) + '/* -> js/' + outFile + ' */' + src.slice(e + endMarker.length);
  console.log('extrait:', outFile, block.length, 'octets');
}

extract('const PIECES={', "'};", 'pieces.js', 'pièces SVG');
// SYM rejoint pieces.js (même module)
{
  const s = src.indexOf('const SYM=');
  if (s < 0) throw new Error('marqueur introuvable: const SYM=');
  const e = src.indexOf('};', s);
  if (e < 0) throw new Error('fin introuvable pour SYM');
  const block = src.slice(s, e + 2);
  fs.appendFileSync(path.join(jsDir, 'pieces.js'), block + '\n');
  src = src.slice(0, s) + '/* -> js/pieces.js */' + src.slice(e + 2);
  console.log('extrait: SYM vers pieces.js');
}
extract('const ANN={', '}};', 'annotations.js', 'annotations (données)');
extract('const DIFFICULTY={', '}};', 'data-difficulty.js', 'niveaux IA');
extract('const OPENINGS=[', '}];', 'data-openings.js', 'ouvertures ECO');
extract('const ICONS={', "'};", 'icons.js', 'icônes SVG');
extract('const TIME_CONFIGS={', '};', 'data-clocks.js', 'contrôles du temps');

fs.writeFileSync(path.join(jsDir, 'app.js'), src);
fs.unlinkSync(path.join(dir, 'app.js'));
console.log('OK — js/app.js :', src.length, 'octets');
