# Ce dossier reçoit les binaires Stockfish au premier lancement.

Rien à faire à la main : `start-all.bat` (ou `node scripts/download-stockfish.js`)
télécharge Stockfish 19 (~78 Mo) depuis les releases officielles GitHub
et installe ici :
- `stockfish-game.exe` → instance JEU (coups du bot)
- `stockfish-anal.exe` → instance ANALYSE (évaluations)

Ces fichiers sont exclus de Git (voir `.gitignore`) et couverts par la
licence GPLv3 de Stockfish (voir `THIRD-PARTY-NOTICES.md`).
