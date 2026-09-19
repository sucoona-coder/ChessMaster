# ♟ ChessMaster Local

Jeu d'échecs complet en local : 2 joueurs, contre Stockfish **adouci**,
éditeur de position, analyse temps réel avec annotations, dessin sur
l'échiquier (flèches + surbrillances), Opening Explorer, et multijoueur
en réseau local. Aucune inscription, aucune donnée envoyée sur internet
(sauf le téléchargement initial de Stockfish et les CDN polices/lib).

> **Zéro installation manuelle de Stockfish.** Au premier lancement,
> `node scripts/download-stockfish.js` (appelé par les `.bat`)
> télécharge Stockfish 19 officiel (~78 Mo) et installe les 2 instances.
> Les binaires sont exclus de Git (`.gitignore`).

## Fonctionnalités

- **1 · Local 2 joueurs** + horloges (1+0, 3+0, 3+2, 10+0, ∞) et auto-flip
- **2 · Contre Stockfish** : 5 niveaux humains (Elo ~800 → ~2400),
  jitter de coups, délais humains, Threads/Hash bridés par défaut
- **3 · Éditeur** : palette, validation live (rois, pions, FEN),
  trait, import/export FEN, mise en jeu
- **Analyse** : double passe Stockfish (200ms + 600ms), annotations
  `! ? ?? ✗ ?! ✓ ⭐ #`, précision %, barre d'éval, courbe, Top-3 (MultiPV 3)
- **Opening Explorer** : nom/ECO/variante + continuations cliquables
- **Dessin** : clic droit + glisser = flèche (4 couleurs via
  Maj/Ctrl/Alt), clic droit = surbrillance, par position, touche Échap
- **En ligne local** (WebSocket, sans compte) : code de salle, chat,
  abandon, nulle, revanche, reconnexion 60 s
- **Thèmes** : plateau (Classic/Océan/Noyer/Ardoise) + sombre/clair,
  icônes SVG, toasts, raccourcis clavier, blindfold, plateau compact

## Prérequis

- Windows 10/11, [Node.js](https://nodejs.org/) ≥ 18, connexion internet
  (premier lancement uniquement : Stockfish + `npm install`).

## Lancement (3 façons)

**Double-clic (recommandé)**
1. `start-all.bat` → Stockfish auto → backend → ouvre http://127.0.0.1:3000/
2. `stop-all.bat` → tout arrêter. `start-backend.bat` → backend seul (logs).

**Terminal**
```bat
node scripts\download-stockfish.js
cd backend && npm install && cd ..
set SF_GAME_THREADS=2&& set SF_GAME_HASH=128&& set SF_ANAL_THREADS=2&& set SF_ANAL_HASH=128&& set PORT=3000
node backend\server.js
```
Puis ouvrir http://127.0.0.1:3000/

## Fonctionnement

```
navigateur (frontend vanilla : index.html + styles.css + app.js)
   │  POST /api/bestmove  → instance GAME (coups du bot)
   │  POST /api/analyse   → instance ANAL (évaluations, jamais bloquée par le jeu)
   │  WS /online          → salles locales (coups, chat, nulle, revanche)
   ▼
backend Node (Express + ws + chess.js)
   ├── engines/stockfish-game.exe  (Threads/Hash configurables)
   └── engines/stockfish-anal.exe  (Threads/Hash configurables)
```

- Pourquoi 2 moteurs ? Le calcul du bot ne doit jamais bloquer
  l'analyse temps réel (même principe que le projet d'origine).
- Niveaux doux : ` Skill Level` + `UCI_Elo` + profondeur/movetime
  plafonnés côté serveur (`depth ≤ 18`, `movetime ≤ 2000 ms`).
- Les dessins sont purement visuels (jamais envoyés, jamais analysés).

## Variables d'environnement (optionnel)

| Variable | Défaut | Effet |
|---|---|---|
| `PORT` | `3000` | Port HTTP + WebSocket |
| `SF_GAME_THREADS` / `SF_GAME_HASH` | `2` / `128` | Instance JEU |
| `SF_ANAL_THREADS` / `SF_ANAL_HASH` | `2` / `128` | Instance ANALYSE |

Mode pleine puissance (machine musclée) :
```bat
set SF_GAME_THREADS=8&& set SF_GAME_HASH=2048&& set SF_ANAL_THREADS=6&& set SF_ANAL_HASH=2048
```
Forcer le re-téléchargement : `node scripts\download-stockfish.js --force`

## Structure

```
start-all.bat / start-backend.bat / stop-all.bat
scripts/download-stockfish.js   # téléchargement auto Stockfish 19
backend/server.js               # Express + WS + API
backend/engines.js              # pilote UCI des 2 instances
backend/package.json
frontend/index.html | styles.css | app.js
engines/                        # binaires locaux (non versionnés)
```

## Référence d'origine

Idées et règles reprises du projet
https://github.com/sucoona-coder/chees (analyses, annotations,
ouvertures, horloges, éditeur, online), entièrement réécrit en
frontend + backend propres. Le dossier `_original/` (clone d'analyse)
est volontairement exclu de Git ; pour le récupérer :
`git clone https://github.com/sucoona-coder/chees.git _original`.

## Publication / vie privée

- Aucun secret, `.env`, clé API ou donnée personnelle dans le dépôt
  (vérifié : seules `PORT` et `SF_*` en variables d'option).
- Aucun binaire > 1 Mo versionné (Stockfish exclu via `.gitignore`).
- Licence du code : MIT (`LICENSE`). Mentions tierces :
  `THIRD-PARTY-NOTICES.md` (Stockfish GPLv3, chess.js, Express/ws/cors,
  polices, pièces SVG).
