@echo off
chcp 65001 >nul
cd /d "%~dp0backend"
echo [1/3] Verification Node...
node --version || (echo Node.js introuvable ! Telecharge-le sur https://nodejs.org/ & pause & exit /b 1)
echo [2/3] Stockfish (telechargement auto la 1ere fois)...
cd /d "%~dp0"
node scripts\download-stockfish.js || (echo Echec Stockfish. & pause & exit /b 1)
cd /d "%~dp0backend"
echo [3/3] Installation dependances (1ere fois seulement)...
if not exist "node_modules" call npm install
echo.
echo Demarrage backend + 2x Stockfish 19...
echo  GAME = stockfish-game.exe (coups du bot)
echo  ANAL = stockfish-anal.exe (evaluations)
echo  Reglages doux par defaut : Threads 2 / Hash 128 chacun
echo  (voir README pour le mode pleine puissance)
echo.
set SF_GAME_THREADS=2
set SF_GAME_HASH=128
set SF_ANAL_THREADS=2
set SF_ANAL_HASH=128
set PORT=3000
node server.js
pause
