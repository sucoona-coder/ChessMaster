'use strict';
// Backend local ChessMaster : Express + WS online + 2x Stockfish natifs
const path = require('node:path');
const express = require('express');
const cors = require('cors');
const http = require('node:http');
const { WebSocketServer } = require('ws');
const { Chess } = require('chess.js');
const { createEngines } = require('./engines');

const PORT = parseInt(process.env.PORT || '3000', 10);
const FRONT_DIR = path.resolve(__dirname, '..', 'frontend');

async function main() {
  const fs = require('node:fs');
  for (const f of ['stockfish-game.exe', 'stockfish-anal.exe']) {
    if (!fs.existsSync(path.resolve(__dirname, '..', 'engines', f))) {
      console.error(`\n  [ERREUR] engines/${f} introuvable.`);
      console.error('  Lance :  node scripts/download-stockfish.js');
      console.error('  (ou double-clique start-all.bat qui le fait automatiquement)\n');
      process.exit(1);
    }
  }
  const { game, anal } = await createEngines();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '256kb' }));
  app.use(express.static(FRONT_DIR));

  function validFen(fen) {
    try { new Chess(fen); return true; } catch { return false; }
  }

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      stockfish: 'Stockfish 19',
      gameReady: game.ready, analReady: anal.ready,
      game: { threads: game.threads, hash: game.hash },
      anal: { threads: anal.threads, hash: anal.hash },
      time: new Date().toISOString()
    });
  });

  // Coup du bot (instance GAME)
  app.post('/api/bestmove', async (req, res) => {
    try {
      const { fen, movetime = 800, depth = 0, skill, elo, multipv = 1 } = req.body || {};
      if (!fen || typeof fen !== 'string' || !validFen(fen))
        return res.status(400).json({ ok: false, error: 'FEN invalide' });
      // Adouci : max 2000ms / depth 18 pour rester battable
      const mt = Math.min(Math.max(parseInt(movetime) || 800, 50), 2000);
      const mpv = Math.min(Math.max(parseInt(multipv) || 1, 1), 3);
      const r = await game.go({ fen, movetime: mt, depth: Math.min(parseInt(depth) || 0, 18), multipv: mpv,
        skill: skill != null ? parseInt(skill) : undefined,
        elo: elo != null ? parseInt(elo) : undefined });
      // convertit pv UCI -> from/to
      const moves = (r.lines || []).map((l) => {
        const uci = l.pv && l.pv[0];
        if (!uci || uci.length < 4) return null;
        return { from: uci.slice(0, 2), to: uci.slice(2, 4),
          promotion: uci.length > 4 ? uci[4] : undefined,
          uci, score: l.score, mate: l.mate, depth: l.depth, pv: l.pv };
      }).filter(Boolean);
      res.json({ ok: true, bestmove: r.bestmove, moves, engine: 'stockfish19-game' });
    } catch (e) {
      res.status(500).json({ ok: false, error: String(e.message || e) });
    }
  });

  // Analyse position (instance ANAL, ne bloque pas le jeu)
  app.post('/api/analyse', async (req, res) => {
    try {
      const { fen, movetime = 1000, depth = 0, multipv = 3 } = req.body || {};
      if (!fen || typeof fen !== 'string' || !validFen(fen))
        return res.status(400).json({ ok: false, error: 'FEN invalide' });
      const mt = Math.min(Math.max(parseInt(movetime) || 1000, 100), 2500);
      const mpv = Math.min(Math.max(parseInt(multipv) || 3, 1), 5);
      const r = await anal.go({ fen, movetime: mt, depth: Math.min(parseInt(depth) || 0, 18), multipv: mpv });
      res.json({ ok: true, bestmove: r.bestmove, lines: r.lines, engine: 'stockfish19-anal' });
    } catch (e) {
      res.status(500).json({ ok: false, error: String(e.message || e) });
    }
  });

  app.post('/api/stop', (req, res) => {
    try { game.stop(); anal.stop(); } catch {}
    res.json({ ok: true });
  });

  // Validation FEN + coups legaux (utile editeur)
  app.post('/api/legal', (req, res) => {
    try {
      const { fen } = req.body || {};
      const c = new Chess(fen);
      res.json({ ok: true, fen: c.fen(), turn: c.turn(), moves: c.moves({ verbose: true }).slice(0, 300) });
    } catch (e) {
      res.status(400).json({ ok: false, error: 'FEN invalide' });
    }
  });

  const server = http.createServer(app);

  // ---- ONLINE local via WebSocket (remplace PeerJS cloud) ----
  // Protocole: {t:'create'} -> {t:'created', code}
  // {t:'join', code} -> rejoint, recoit {t:'start', color, fen}
  // {t:'move', from,to,promotion} -> valide via chess.js, broadcast {t:'move', ...san, fen}
  // {t:'resign'} {t:'chat', text} {t:'clock', w,b}
  const wss = new WebSocketServer({ server, path: '/online' });
  const rooms = new Map(); // code -> {w:null,b:null, chess:Chess, clocks:{w,b}, lastTick}
  const sockRoom = new Map(); // ws -> {code,color}

  function code6() {
    const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)];
    return s;
  }
  function send(ws, o) { try { ws.send(JSON.stringify(o)); } catch {} }
  function roomPeers(code) {
    const r = rooms.get(code);
    if (!r) return [];
    return [r.w, r.b].filter(Boolean);
  }
  function broadcast(code, o, except) {
    for (const p of roomPeers(code)) if (p !== except) send(p, o);
  }

  wss.on('connection', (ws) => {
    send(ws, { t: 'hello', ok: true });
    ws.on('message', (raw) => {
      let m;
      try { m = JSON.parse(raw.toString()); } catch { return; }
      if (m.t === 'create') {
        const time = parseInt(m.time) || 0; // secondes par joueur, 0 = illimite
        const code = code6();
        const chess = new Chess();
        rooms.set(code, { w: ws, b: null, chess, time, clocks: { w: time, b: time }, over: false });
        sockRoom.set(ws, { code, color: 'w' });
        send(ws, { t: 'created', code, color: 'w', fen: chess.fen(), time });
        return;
      }
      if (m.t === 'join') {
        const code = String(m.code || '').toUpperCase().trim();
        const r = rooms.get(code);
        if (!r) return send(ws, { t: 'error', error: 'Code introuvable' });
        if (r.b && r.b !== ws && r.b.readyState === 1) return send(ws, { t: 'error', error: 'Salle pleine' });
        r.b = ws;
        sockRoom.set(ws, { code, color: 'b' });
        send(ws, { t: 'joined', code, color: 'b', fen: r.chess.fen(), time: r.time });
        broadcast(code, { t: 'start', fen: r.chess.fen(), time: r.time });
        broadcast(code, { t: 'chat', from: 'system', text: 'Adversaire connecte. Blancs a vous.' });
        return;
      }
      const info = sockRoom.get(ws);
      if (!info) return;
      const r = rooms.get(info.code);
      if (!r) return;
      if (m.t === 'move') {
        if (r.over) return send(ws, { t: 'error', error: 'Partie terminée' });
        // tour correct ?
        if (r.chess.turn() !== info.color) return send(ws, { t: 'error', error: 'Pas votre tour' });
        try {
          const mv = r.chess.move({ from: m.from, to: m.to, promotion: m.promotion || 'q' });
          const payload = { t: 'move', from: mv.from, to: mv.to, promotion: mv.promotion,
            san: mv.san, fen: r.chess.fen(), turn: r.chess.turn(),
            over: r.chess.isGameOver(), checkmate: r.chess.isCheckmate(),
            draw: r.chess.isDraw(), stalemate: r.chess.isStalemate() };
          broadcast(info.code, payload, ws); // sans écho : l'envoyeur l'a déjà joué
          if (r.chess.isGameOver()) r.over = true;
        } catch (e) {
          send(ws, { t: 'error', error: 'Coup illegal' });
        }
        return;
      }
      if (m.t === 'resign') {
        r.over = true;
        broadcast(info.code, { t: 'resign', by: info.color }, ws);
        return;
      }
      if (m.t === 'rematch_accept') {
        // Nouvelle partie : on réinitialise la salle CÔTÉ SERVEUR sinon les
        // coups suivants seraient validés contre l'ancienne position.
        r.chess = new Chess();
        r.over = false;
        broadcast(info.code, { t: 'rematch_reset', fen: r.chess.fen(), time: r.time });
        return;
      }
      for (const relay of ['draw_offer', 'draw_accept', 'draw_decline', 'rematch_offer']) {
        if (m.t === relay) {
          if (relay === 'draw_accept') r.over = true;
          broadcast(info.code, { t: relay, by: info.color }, ws);
          return;
        }
      }
      if (m.t === 'chat') {
        const text = String(m.text || '').slice(0, 300);
        if (!text) return;
        broadcast(info.code, { t: 'chat', from: info.color, text }, ws); // l'envoyeur l'affiche déjà
        return;
      }
      if (m.t === 'fen') {
        // synchro hôte (optionnel)
        broadcast(info.code, { t: 'fen', fen: r.chess.fen() }, ws);
        return;
      }
    });
    ws.on('close', () => {
      const info = sockRoom.get(ws);
      sockRoom.delete(ws);
      if (!info) return;
      const r = rooms.get(info.code);
      if (!r) return;
      broadcast(info.code, { t: 'peer-left', color: info.color });
      // garde la salle 60s pour reconnexion
      setTimeout(() => {
        const rr = rooms.get(info.code);
        if (!rr) return;
        const alive = [rr.w, rr.b].some((s) => s && s.readyState === 1);
        if (!alive) rooms.delete(info.code);
      }, 60000);
    });
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log('');
    console.log('  ChessMaster LOCAL pret sur http://127.0.0.1:' + PORT);
    console.log('  Frontend : ' + FRONT_DIR);
    console.log('  WS online: ws://127.0.0.1:' + PORT + '/online');
    console.log('');
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
