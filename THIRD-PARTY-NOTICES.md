# Mentions légales — logiciels tiers

Ce dépôt contient UNIQUEMENT du code original sous licence MIT (voir `LICENSE`).
Les logiciels tiers ci-dessous ne sont PAS inclus dans le dépôt :
ils sont téléchargés ou installés automatiquement au premier lancement.

## Stockfish 19 — GPLv3

- Rôle : moteur d'échecs (2 instances locales : coups + analyse).
- Auteurs : les développeurs Stockfish (voir https://github.com/official-stockfish/Stockfish/blob/master/AUTHORS).
- Licence : **GNU General Public License v3.0** (https://www.gnu.org/licenses/gpl-3.0.html).
- Source : https://github.com/official-stockfish/Stockfish (tag `sf_19`).
- Téléchargement automatique : `node scripts/download-stockfish.js`
  récupère `stockfish-windows-x86-64-universal.zip` depuis les releases
  officielles GitHub, dans `engines/` (dossier exclu de Git via `.gitignore`).
- Le binaire n'est ni modifié ni redistribué par ce dépôt.
- Le réseau neuronal embarqué (NNUE) fait partie de Stockfish et suit la même licence.

## chess.js — BSD-2-Clause

- Rôle : règles du jeu côté backend (validation FEN/coups).
- Auteur : Jeff Hlywa. Installé via `npm install` (jamais commité).
- Licence : BSD-2-Clause (voir le paquet `chess.js` sur npm).

## Express / ws / cors — MIT

- Rôle : serveur HTTP + WebSocket du backend. Installés via `npm install`.
- Licences : MIT (voir chaque paquet sur npm).

## chess.js 0.10.3 (CDN, frontend)

- Rôle : règles du jeu côté navigateur, chargé depuis cdnjs.
- Licence : BSD-2-Clause.

## Polices Fraunces + DM Sans (Google Fonts, frontend)

- Rôle : typographie, chargées depuis Google Fonts.
- Licence : SIL Open Font License 1.1.

## Pièces d'échecs SVG (style Cburnett, frontend)

- Rôle : rendu des pièces sur l'échiquier.
- Origine : jeu de pièces standard « Cburnett », traditionnellement
  sous licence GPLv3/BSD/GFDL (utilisé par Lichess, Wikimedia).
  Geste commercial : considérées comme un standard ouvert ; remplacées
  facilement si besoin (dossier `frontend/`, objet `PIECES` dans `app.js`).
