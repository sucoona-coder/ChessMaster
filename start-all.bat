@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ChessMaster Local — demarrage complet
echo.
echo [1/2] Stockfish (telechargement auto la 1ere fois, ~78 Mo)...
node scripts\download-stockfish.js || (echo Echec Stockfish. & pause & exit /b 1)
if not exist "backend\node_modules" (
  echo [2/2] Installation backend...
  cd backend
  call npm install
  cd /d "%~dp0"
)
echo Lancement backend dans une nouvelle fenetre...
start "ChessMaster Backend" cmd /k "cd /d ""%~dp0backend"" && set SF_GAME_THREADS=2 && set SF_GAME_HASH=128 && set SF_ANAL_THREADS=2 && set SF_ANAL_HASH=128 && set PORT=3000 && node server.js"
echo Attente 4s...
timeout /t 4 /nobreak >nul
echo Ouverture navigateur...
start http://127.0.0.1:3000/
echo.
echo Pret ! Laisse la fenetre Backend ouverte.
echo Pour arreter : lance stop-all.bat
pause
