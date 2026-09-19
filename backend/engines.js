'use strict';
// Gestionnaire UCI pour 2 instances Stockfish natives puissantes.
// game -> coups du bot | anal -> evaluations analyse
const { spawn } = require('node:child_process');
const path = require('node:path');

class UCIEngine {
  constructor(name, exePath, opts = {}) {
    this.name = name;
    this.exePath = exePath;
    this.threads = opts.threads || 4;
    this.hash = opts.hash || 1024;
    this.ready = false;
    this.queue = [];
    this.busy = false;
    this.proc = null;
    this.buffer = '';
    this.pending = null; // {resolve, lines:[], bestmove, multipv, timer}
  }

  start() {
    return new Promise((resolve, reject) => {
      try {
        this.proc = spawn(this.exePath, [], { stdio: ['pipe', 'pipe', 'pipe'] });
      } catch (e) { return reject(e); }
      this.proc.on('error', (e) => {
        console.error(`[${this.name}] spawn error`, e.message);
      });
      this.proc.stdout.on('data', (d) => this._onData(d));
      this.proc.stderr.on('data', (d) => {
        // Stockfish log sur stderr parfois
      });
      // init UCI
      const onReady = () => { this.ready = true; resolve(true); };
      const fail = setTimeout(() => {
        if (!this.ready) { console.warn(`[${this.name}] init timeout`); resolve(false); }
      }, 15000);
      this._initCb = () => { clearTimeout(fail); onReady(); };
      this._send('uci');
      // attend uciok puis configure puis isready
      this._waitFor('uciok', () => {
        this._send(`setoption name Threads value ${this.threads}`);
        this._send(`setoption name Hash value ${this.hash}`);
        this._send('setoption name Ponder value false');
        this._waitFor('readyok', () => { this._initCb(); }, 'isready');
        this._send('isready');
      });
    });
  }

  _waiters = [];
  _waitFor(token, cb, sendAfter) {
    this._waiters.push({ token, cb });
  }

  _send(cmd) {
    if (this.proc && this.proc.stdin.writable) {
      this.proc.stdin.write(cmd + '\n');
    }
  }

  _onData(chunk) {
    this.buffer += chunk.toString('utf8');
    let idx;
    while ((idx = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, idx).trim();
      this.buffer = this.buffer.slice(idx + 1);
      if (!line) continue;
      this._onLine(line);
    }
  }

  _onLine(line) {
    // waiters (uciok / readyok)
    for (let i = this._waiters.length - 1; i >= 0; i--) {
      if (line.includes(this._waiters[i].token)) {
        const w = this._waiters.splice(i, 1)[0];
        try { w.cb(line); } catch (e) { console.error(e); }
      }
    }
    if (!this.pending) return;
    const p = this.pending;
    if (line.startsWith('info') && line.includes(' score ') && line.includes(' pv ')) {
      // multipv ?
      let pvNum = 1;
      const mPv = line.match(/multipv (\d+)/);
      if (mPv) pvNum = parseInt(mPv[1], 10);
      const mScore = line.match(/score (cp|mate) (-?\d+)/);
      const mPvMoves = line.match(/ pv (.+)$/);
      const mDepth = line.match(/\bdepth (\d+)/);
      if (mScore && mPvMoves) {
        let score = 0;
        if (mScore[1] === 'cp') score = parseInt(mScore[2], 10);
        else { const m = parseInt(mScore[2], 10); score = m > 0 ? 100000 - m : -100000 - m; }
        p.lines[pvNum - 1] = {
          score,
          mate: mScore[1] === 'mate' ? parseInt(mScore[2], 10) : null,
          depth: mDepth ? parseInt(mDepth[1], 10) : null,
          pv: mPvMoves[1].trim().split(/\s+/)
        };
      }
    }
    if (line.startsWith('bestmove')) {
      const parts = line.split(/\s+/);
      const best = parts[1] && parts[1] !== '(none)' ? parts[1] : null;
      clearTimeout(p.timer);
      const res = { bestmove: best, lines: p.lines.filter(Boolean) };
      this.pending = null;
      this.busy = false;
      p.resolve(res);
      this._next();
    }
  }

  _next() {
    if (this.busy || !this.queue.length) return;
    const job = this.queue.shift();
    this._run(job);
  }

  _run(job) {
    this.busy = true;
    const { fen, movetime, depth, multipv, skill, elo, resolve, reject } = job;
    this.pending = { resolve, reject, lines: [], timer: null };
    // options de force
    if (typeof skill === 'number') this._send(`setoption name Skill Level value ${skill}`);
    if (typeof elo === 'number' && elo < 3200) {
      this._send('setoption name UCI_LimitStrength value true');
      this._send(`setoption name UCI_Elo value ${elo}`);
    } else {
      this._send('setoption name UCI_LimitStrength value false');
    }
    this._send(`setoption name MultiPV value ${multipv || 1}`);
    this._send('ucinewgame');
    this._send(`position fen ${fen}`);
    if (depth && depth > 0) this._send(`go depth ${depth}`);
    else this._send(`go movetime ${movetime || 800}`);
    // securite : timeout
    const maxWait = Math.max(15000, (movetime || 800) + 12000);
    this.pending.timer = setTimeout(() => {
      try { this._send('stop'); } catch {}
      setTimeout(() => {
        if (this.pending) {
          const p = this.pending;
          this.pending = null; this.busy = false;
          p.resolve({ bestmove: null, lines: p.lines.filter(Boolean), timeout: true });
          this._next();
        }
      }, 500);
    }, maxWait);
  }

  go(opts) {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...opts, resolve, reject });
      this._next();
    });
  }

  stop() {
    this.queue.length = 0;
    try { this._send('stop'); } catch {}
  }
}

function enginePath(file) {
  // backend/ -> ../engines/file
  return path.resolve(__dirname, '..', 'engines', file);
}

async function createEngines() {
  // Adouci par defaut : jouable humain, max raisonnable (voir README)
  const game = new UCIEngine('GAME', enginePath('stockfish-game.exe'), {
    threads: parseInt(process.env.SF_GAME_THREADS || '2', 10),
    hash: parseInt(process.env.SF_GAME_HASH || '128', 10)
  });
  const anal = new UCIEngine('ANAL', enginePath('stockfish-anal.exe'), {
    threads: parseInt(process.env.SF_ANAL_THREADS || '2', 10),
    hash: parseInt(process.env.SF_ANAL_HASH || '128', 10)
  });
  console.log('[engines] demarrage Stockfish 19 x2...');
  console.log('  GAME:', game.exePath, `Threads=${game.threads} Hash=${game.hash}`);
  console.log('  ANAL:', anal.exePath, `Threads=${anal.threads} Hash=${anal.hash}`);
  const [g, a] = await Promise.all([game.start(), anal.start()]);
  console.log(`[engines] ready game=${g} anal=${a}`);
  return { game, anal };
}

module.exports = { UCIEngine, createEngines };
