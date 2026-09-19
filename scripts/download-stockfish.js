'use strict';
// Télécharge Stockfish 19 (Windows x86-64) au premier lancement si absent.
// Idempotent : ne fait rien si les 2 .exe sont déjà présents.
// Usage : node scripts/download-stockfish.js [--force]
// Sans dépendance npm (utilise curl.exe + Expand-Archive de Windows).
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const TAG = 'sf_19';
const ZIP_URL = `https://github.com/official-stockfish/Stockfish/releases/download/${TAG}/stockfish-windows-x86-64-universal.zip`;
const INNER_EXE = 'stockfish/stockfish-windows-x86-64-universal.exe';

const ROOT = path.resolve(__dirname, '..');
const ENGINES = path.join(ROOT, 'engines');
const GAME_EXE = path.join(ENGINES, 'stockfish-game.exe');
const ANAL_EXE = path.join(ENGINES, 'stockfish-anal.exe');
const ZIP = path.join(ENGINES, 'stockfish-download.zip');
const EXTRACT = path.join(ENGINES, '_dl');

function log(m) { console.log('[stockfish] ' + m); }

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit' });
}

function main() {
  const force = process.argv.includes('--force');
  fs.mkdirSync(ENGINES, { recursive: true });

  if (!force && fs.existsSync(GAME_EXE) && fs.existsSync(ANAL_EXE)) {
    log('déjà installé (stockfish-game.exe + stockfish-anal.exe). Rien à faire.');
    return;
  }

  log('téléchargement Stockfish 19 depuis ' + ZIP_URL);
  log('(environ 78 Mo — une seule fois, exclus du dépôt Git)');
  try {
    if (fs.existsSync(ZIP)) fs.unlinkSync(ZIP);
    // curl.exe : suit les redirections GitHub, affiche la progression
    run('curl.exe', ['-L', '--fail', '-o', ZIP, ZIP_URL]);
  } catch (e) {
    console.error("[stockfish] ÉCHEC du téléchargement. Vérifie ta connexion puis relance.");
    console.error("URL manuelle : " + ZIP_URL);
    process.exit(1);
  }

  const size = fs.statSync(ZIP).size;
  if (size < 10 * 1024 * 1024) {
    console.error(`[stockfish] Archive suspecte (${size} octets). Suppression.`);
    fs.unlinkSync(ZIP);
    process.exit(1);
  }
  log(`archive reçue (${(size / 1024 / 1024).toFixed(1)} Mo), extraction…`);

  try {
    if (fs.existsSync(EXTRACT)) fs.rmSync(EXTRACT, { recursive: true, force: true });
    // Extraction via PowerShell (Windows 10/11 natif)
    const ps = `Expand-Archive -Path '${ZIP}' -DestinationPath '${EXTRACT}' -Force`;
    const r = spawnSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error('Expand-Archive a échoué');
    const inner = path.join(EXTRACT, INNER_EXE);
    if (!fs.existsSync(inner)) throw new Error('binaire introuvable dans l’archive (' + INNER_EXE + ')');
    fs.copyFileSync(inner, GAME_EXE);
    fs.copyFileSync(inner, ANAL_EXE);
    log('installé :');
    log('  - engines/stockfish-game.exe (instance JEU)');
    log('  - engines/stockfish-anal.exe (instance ANALYSE)');
  } catch (e) {
    console.error('[stockfish] ÉCHEC extraction : ' + (e.message || e));
    process.exit(1);
  } finally {
    try { if (fs.existsSync(ZIP)) fs.unlinkSync(ZIP); } catch {}
    try { if (fs.existsSync(EXTRACT)) fs.rmSync(EXTRACT, { recursive: true, force: true }); } catch {}
  }

  // Vérification UCI
  try {
    const check = spawnSync(GAME_EXE, [], { input: 'uci\nquit\n', encoding: 'utf8', timeout: 15000 });
    const out = (check.stdout || '').split('\n').slice(0, 3).join(' | ');
    if (/Stockfish/i.test(out)) log('vérification UCI OK : ' + out.trim());
    else log('avertissement : réponse UCI inattendue, le backend réessayera au démarrage.');
  } catch {
    log('avertissement : vérification UCI impossible, le backend réessayera au démarrage.');
  }
  log('terminé.');
}

main();
