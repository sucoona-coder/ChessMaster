/* ChessMaster — niveaux IA (constantes pures, sans dépendance) */
const DIFFICULTY={
1:{elo:800,depth:6,movetime:200,skill:1,jitter:0.35,desc:'Elo ~800 · Débutant (doux)'},
2:{elo:1200,depth:8,movetime:400,skill:5,jitter:0.2,desc:'Elo ~1200 · Facile'},
3:{elo:1600,depth:12,movetime:800,skill:10,jitter:0.08,desc:'Elo ~1600 · Moyen (défaut)'},
4:{elo:2000,depth:15,movetime:1200,skill:17,jitter:0,desc:'Elo ~2000 · Fort (bridé)'},
5:{elo:2400,depth:18,movetime:1500,skill:20,jitter:0,desc:'Elo ~2400 · Max doux (pas 3500)'}};
