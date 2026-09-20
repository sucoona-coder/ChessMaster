// Tests smoke : moteurs UCI + règles. Usage : cd backend && npm test
// (lance vraiment Stockfish 19, ~10-20 s).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Chess } from 'chess.js';
import enginesPkg from './engines.js';

const { createEngines } = enginesPkg;
const here = path.dirname(fileURLToPath(import.meta.url));

test('binaires Stockfish présents', () => {
  for (const f of ['stockfish-game.exe', 'stockfish-anal.exe']) {
    const p = path.resolve(here, '..', 'engines', f);
    assert.ok(fs.existsSync(p), f + ' manquant (lance node scripts/download-stockfish.js)');
    assert.ok(fs.statSync(p).size > 50 * 1024 * 1024, f + ' suspect');
  }
});

test('règles : roque, en passant, promotion', () => {
  const c = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  const sans = c.moves();
  assert.ok(sans.includes('O-O'), 'petit roque absent');
  assert.ok(sans.includes('O-O-O'), 'grand roque absent');
  const e = new Chess('rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3');
  assert.ok(e.moves().includes('exd6'), 'en passant absente');
  const p = new Chess('8/P7/8/8/8/1k6/8/4K3 w - - 0 1');
  p.move({ from: 'a7', to: 'a8', promotion: 'q' });
  assert.equal(p.get('a8').type, 'q');
});

test('moteurs UCI : handshake + meilleur coup', async () => {
  const { game, anal } = await createEngines();
  try {
    assert.equal(game.ready, true, 'GAME non prêt');
    assert.equal(anal.ready, true, 'ANAL non prêt');
    const r = await game.go({
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      movetime: 300, multipv: 1, skill: 5, elo: 1200
    });
    assert.ok(r.bestmove && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(r.bestmove), 'bestmove invalide: ' + r.bestmove);
    const a = await anal.go({
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
      movetime: 300, multipv: 2
    });
    assert.ok(a.lines.length >= 1, 'aucune ligne analyse');
    assert.equal(typeof a.lines[0].score, 'number');
  } finally {
    try { game.proc.kill(); } catch {}
    try { anal.proc.kill(); } catch {}
  }
});
