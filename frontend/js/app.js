/* ChessMaster local — clone fidele de _original/game.html, moteur adouci, archi propre */
(function(){'use strict';
// ---------- Constantes visuel identique ----------
/* -> js/pieces.js */
/* -> js/pieces.js */
// ---------- Annotations comme l'original (stickers) ----------
/* -> js/annotations.js */
function cpToWin(cp){const c=Math.max(-3000,Math.min(3000,cp));return 50+50*(2/(1+Math.exp(-0.00368208*c))-1);}
function winToAccuracy(wb,wa){const loss=Math.max(0,wb-wa);return Math.max(0,Math.min(100,103.1668*Math.exp(-0.04354*loss)-3.1669));}
function classifyByCpDiff(diff,move,evalAfterCp,isTheory){if(chess.in_checkmate())return ANN.mate;if(move.promotion)return ANN.promo;if(move.san&&move.san.includes('O-O'))return ANN.castle;if(isTheory)return ANN.theory;let tol=1.0;if(Math.abs(evalAfterCp)>800)tol=1.5;const d=diff/tol;if(d<10)return ANN.best;if(d<30)return ANN.good;if(d<60)return ANN.correct;if(d<120)return ANN.inaccurate;if(d<250)return ANN.mistake;if(d<450)return ANN.blunder;return ANN.miss;}
function classifyFallbackByEval(before,after,move,isTheory){if(chess.in_checkmate())return ANN.mate;if(move.promotion)return ANN.promo;if(move.san&&move.san.includes('O-O'))return ANN.castle;if(isTheory)return ANN.theory;const sign=move.color==='w'?1:-1;const delta=(after-before)*sign;if(delta>=120)return ANN.best;if(delta>=40)return ANN.good;if(delta>-40)return ANN.correct;if(delta>-120)return ANN.inaccurate;if(delta>-260)return ANN.mistake;if(delta>-450)return ANN.blunder;return ANN.miss;}
function getMoveContext(move,ann,diff){const color=move.color==='w'?'Blancs':'Noirs';const adv=move.color==='w'?'Noirs':'Blancs';if(ann===ANN.blunder||ann===ANN.miss){if(move.captured&&diff>200)return 'Échange trop coûteux — perd du matériel.';if(diff>400)return 'Rate une tactique décisive.';return 'Cède un avantage majeur aux '+adv+'.';}if(ann===ANN.mistake)return move.captured?'Capture sous-optimale.':'Affaiblit la position des '+color+'.';if(ann===ANN.inaccurate)return 'Coup jouable mais imprécis.';if(ann===ANN.best){if(chess.in_check())return 'Attaque décisive !';if(move.captured)return 'Excellente capture !';return 'Meilleur coup de la position.';}if(ann===ANN.good)return 'Bon coup — position solide.';if(ann===ANN.correct)return 'Coup solide — position stable.';return '';}
function showAnnotationOnSquare(sq,ann){document.querySelectorAll('.sq-ann').forEach(e=>e.remove());if(!ann||!ann.sym)return;const el=document.querySelector('[data-sq="'+sq+'"]');if(!el)return;const b=document.createElement('div');b.className='sq-ann';b.textContent=ann.sym;b.style.background=ann.bg;b.style.color=ann.fg;el.appendChild(b);setTimeout(()=>{b.style.transition='opacity 0.6s';b.style.opacity='0';setTimeout(()=>b.remove(),600);},3800);}
function renderAnalysisCard(move,ann,sfAfterCp,diff,accuracy,isRefined){const card=$('analysis-card'),body=$('analysis-body');const PN={p:'pion',n:'cavalier',b:'fou',r:'tour',q:'dame',k:'roi'};const PA={p:'Le pion',n:'Le cavalier',b:'Le fou',r:'La tour',q:'La dame',k:'Le roi'};const piece=PA[move.piece]||'La pièce';const color=move.color==='w'?'Blancs':'Noirs';const captured=move.captured?' capture le '+(PN[move.captured]||'pièce')+' en '+move.to:' en '+move.to;const check=chess.in_check()?' Échec !':'';let main='';if(chess.in_checkmate())main='♛ Échec et mat — les '+color+' gagnent !';else if(ann===ANN.promo)main='Promotion en Dame sur '+move.to+' !';else if(ann===ANN.castle)main='Roque — roi en sécurité, tours actives.';else main=piece+captured+'.'+check+' '+getMoveContext(move,ann,diff,sfAfterCp);const isWhiteMove=move.color==='w';const evalWhite=isWhiteMove?-sfAfterCp:sfAfterCp;const pawns=(Math.abs(evalWhite)/100).toFixed(2);const sign=evalWhite>=0?'+':'';const evalColor=evalWhite>100?'var(--green)':evalWhite<-100?'var(--red2)':'var(--text2)';const accColor=accuracy>=85?'var(--green)':accuracy>=65?'var(--gold)':'var(--red2)';const diffPawns=(diff/100).toFixed(2);const refined=isRefined?'<span style="font-size:0.6rem;color:var(--green);margin-left:4px">● affiné</span>':'';const stats='<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;font-size:0.72rem;align-items:center"><span style="color:'+accColor+';font-weight:700">'+accuracy.toFixed(0)+'% précision</span><span style="color:'+evalColor+'">Éval : '+sign+pawns+'</span>'+(diff>=10?'<span style="color:var(--dimmer)">−'+diffPawns+' vs meilleur</span>':'')+refined+'</div>';const badge='<div class="ann-header"><div class="ann-symbol" style="background:'+ann.bg+';color:'+ann.fg+'">'+(ann.sym||'·')+'</div><div><div class="ann-move-name">'+move.san+'</div><div class="ann-label">'+ann.label+'</div></div></div>';card.className='panel has-result';body.innerHTML=badge+'<div style="margin-top:8px;font-size:.82rem">'+main+stats+'</div>';}
// ---------- Stockfish DOUX (plus fort plafonné) ----------
/* -> js/data-difficulty.js */
/* -> js/data-openings.js */
// ---------- Icônes SVG (remplace les emojis) ----------
/* -> js/icons.js */
function upgradeIcons(){
try{
// topbar
const tb=document.querySelectorAll('.game-topbar .topbar-btn');
const map=[ICONS.undo,ICONS.flip,ICONS.chart,ICONS.reset,ICONS.home];
tb.forEach((b,i)=>{if(i<map.length&&b.id!=='more-btn'){b.innerHTML=map[i];b.setAttribute('aria-label',b.title||'action');}});
const more=$('more-btn');if(more)more.innerHTML=ICONS.dots;
// theme + sound (texte géré par état, icône + label)
applyThemeIcon();applySoundIcon();
// nav
const navMap={'nav-s':ICONS.start,'nav-p':ICONS.prev,'nav-n':ICONS.next,'nav-e':ICONS.end};
Object.keys(navMap).forEach(id=>{const b=$(id);if(b)b.innerHTML=navMap[id];});
// game buttons (Annuler/Retourner/Nouvelle) — le bouton Effacer dessins est exclu
const gb=[...document.querySelectorAll('.game-btns .g-btn')].filter(b=>b.id!=='clear-draw-btn');
if(gb[0])gb[0].innerHTML=ICONS.undo+' Annuler';if(gb[1])gb[1].innerHTML=ICONS.flip+' Retourner';if(gb[2])gb[2].innerHTML=ICONS.reset+' Nouvelle partie';
// mode cards icons (remplace emoji par SVG, garde le style pastille)
const mc=document.querySelectorAll('.mode-card .icon');
const mcMap=[ICONS.swords,ICONS.pen,ICONS.bot,ICONS.globe];
mc.forEach((el,i)=>{if(mcMap[i])el.innerHTML=mcMap[i];});
// time buttons : icône horloge devant
document.querySelectorAll('.time-btn').forEach(b=>{if(!b.querySelector('svg'))b.innerHTML=ICONS.clock+' '+b.textContent.trim();});
// hint buttons
const hb=document.querySelectorAll('#hint-panel .g-btn');
if(hb[0])hb[0].innerHTML=ICONS.bulb+' Meilleur coup';if(hb[2])hb[2].innerHTML='Effacer';
// icônes déclaratives [data-ic]
document.querySelectorAll('[data-ic]').forEach(el=>{const n=el.dataset.ic;if(ICONS[n])el.innerHTML=ICONS[n];});
}catch(e){}}
function applyThemeIcon(){const b=$('theme-toggle-btn');if(!b)return;b.innerHTML=(currentTheme==='dark'?ICONS.sun:ICONS.moon)+'<span class="sr"></span>';}
function applySoundIcon(){const b=$('sound-fab');if(!b)return;b.innerHTML=(soundOn?ICONS.snd:ICONS.mute);}
// ---------- Etat ----------
let chess=new Chess(),gameMode='local',myColor='w';
let selSq=null,lastMove=null,boardFlipped=false,aiThinking=false,currentDiff=3;
let clocks={w:null,b:null},clockTimer=null,currentTC='unlimited';
let soundOn=true,AC=null,evalHistory=[],navSnaps=[],navCur=-1;
let ws=null,myRoomCode='',edPiece='wP',edTurn='w',edBoard=new Chess('8/8/8/8/8/8/8/8 w - - 0 1');
let moveAnns=[],analSeq=0;
/* -> js/data-clocks.js */
function toast(msg,ok){const box=$('toasts');if(!box)return;const d=document.createElement('div');d.className='toast '+(ok===false?'err':ok===true?'ok':'');d.textContent=msg;box.appendChild(d);setTimeout(()=>{d.style.opacity='0';setTimeout(()=>d.remove(),400);},2600);}
const $=id=>document.getElementById(id);
async function api(p,b,timeoutMs){const c=new AbortController();const to=setTimeout(()=>c.abort(),timeoutMs||20000);
try{const r=await fetch(p,{method:b?'POST':'GET',headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined,signal:c.signal});return r.json();}
catch(e){if(e&&e.name==='AbortError')throw new Error('timeout backend');throw e;}finally{clearTimeout(to);}}
// ---------- Screens ----------
window.showScreen=function(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');};
window.goOnline=function(){showScreen('online-screen');};
window.switchTab=function(t,el){document.querySelectorAll('.lobby-tab').forEach(b=>b.classList.remove('active'));(el||document.querySelector('.lobby-tab')).classList.add('active');$('tab-create').style.display=t==='create'?'block':'none';$('tab-join').style.display=t==='join'?'block':'none';};
window.startGame=function(mode){gameMode=mode;chess=new Chess();selSq=null;lastMove=null;evalHistory=[];moveAnns=[];analSeq++;lastGameOverKey=null;drawViewKey=null;if(draw.active)drawCancel();document.querySelectorAll('.sq-ann').forEach(e=>e.remove());navReset();
const badge=$('mode-badge');
if(mode==='online'){badge.className='topbar-badge badge-online';badge.textContent='En ligne';}
else if(mode==='ai'){badge.className='topbar-badge badge-ai-t';badge.textContent='vs Stockfish doux';}
else if(mode==='editor'){badge.className='topbar-badge badge-ai-t';badge.textContent='Éditeur';openEditor();}
else{badge.className='topbar-badge badge-local';badge.textContent='Local';}
$('difficulty-panel').style.display=mode==='ai'?'block':'none';
$('time-presets-panel').style.display=mode==='ai'?'none':'block';
$('online-info-card').style.display=mode==='online'?'block':'none';
$('editor-panel').style.display=mode==='editor'?'block':'none';
$('chat-mode-label').textContent=mode==='online'?'En ligne':mode==='ai'?'vs Stockfish':'Local';
showScreen('game-screen');initClocks();render();updateAll();updateExplorer([]);const _pv=$('pv-list');if(_pv)_pv.innerHTML='';const _ab=$('analysis-body');if(_ab)_ab.textContent='Faites votre premier coup pour recevoir l analyse IA…';
if(mode!=='online')addChatMsg('Nouvelle partie — bonne chance !','system');
if(mode==='ai')setDifficulty(currentDiff);};
window.resetGame=function(){const m=gameMode;startGame(m);};
// ---------- Board ----------
let suppressClick=false,inputLock=false;
const drag={active:false,pending:null,ghost:null,targets:[]};
function buildBoard(){const el=$('chess-board');el.innerHTML='';for(let r=0;r<8;r++)for(let f=0;f<8;f++){const rr=boardFlipped?7-r:r,ff=boardFlipped?7-f:f;const sq='abcdefgh'[ff]+(8-rr);const d=document.createElement('div');d.className='sq '+(((rr+ff)%2===0)?'light':'dark');d.dataset.sq=sq;d.onclick=()=>onSqClick(sq);el.appendChild(d);}
el.onpointerdown=dragDown;el.onpointermove=dragMove;el.onpointerup=dragUp;el.onpointercancel=dragCancel;
el.addEventListener('click',e=>{if(suppressClick){suppressClick=false;e.stopPropagation();e.preventDefault();}},true);
el.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();});
el.addEventListener('pointerdown',drawPointerDown);
el.addEventListener('pointermove',drawPointerMove);
el.addEventListener('pointerup',drawPointerUp);
el.addEventListener('pointercancel',drawPointerCancel);
ensureDrawLayer();}
// ----- Entrées dessin : bouton droit / stylet / appui long tactile -----
function drawPointerDown(e){if(draw.active)return;
if(e.pointerType==='mouse'||(e.pointerType==='pen'&&e.button!==0)){if(e.button!==2)return;const sqEl=e.target.closest('.sq');if(!sqEl)return;e.preventDefault();drawStart(sqEl.dataset.sq,drawColorFor(e),e.pointerId);draw.isTouch=false;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}return;}
if(e.pointerType==='touch'||e.pointerType==='pen'){const sqEl=e.target.closest('.sq');if(!sqEl)return;const sx=e.clientX,sy=e.clientY,pid=e.pointerId;
if(draw.timer)clearTimeout(draw.timer);
draw.timer=setTimeout(()=>{draw.timer=null;if(drag.active&&drag.pending&&drag.pending.id===pid){drag.pending=null;}drawStart(sqEl.dataset.sq,'green',pid);draw.isTouch=true;},600);
draw.sx=sx;draw.sy=sy;draw.pid=pid;}}
function drawPointerMove(e){if(draw.timer&&(e.pointerId===draw.pid)){if(Math.hypot(e.clientX-draw.sx,e.clientY-draw.sy)>10){clearTimeout(draw.timer);draw.timer=null;draw.pid=null;}return;}
if(!draw.active||e.pointerId!==draw.pid)return;const sq=sqFromPoint(e.clientX,e.clientY);if(sq)drawMoveTo(sq);}
function drawPointerUp(e){if(draw.timer&&e.pointerId===draw.pid){clearTimeout(draw.timer);draw.timer=null;draw.pid=null;return;}
if(!draw.active||e.pointerId!==draw.pid)return;try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{};const wasTouch=!!draw.isTouch;draw.isTouch=false;drawFinish(e);if(wasTouch){suppressClick=true;setTimeout(()=>{suppressClick=false;},80);}}
function drawPointerCancel(e){if(draw.timer&&e.pointerId===draw.pid){clearTimeout(draw.timer);draw.timer=null;draw.pid=null;return;}if(draw.active&&e.pointerId===draw.pid)drawCancel();}
function canControl(sq){const p=chess.get(sq);if(!p||p.color!==chess.turn())return false;if(gameMode==='editor'||chess.game_over())return false;if(gameMode==='online'&&chess.turn()!==myColor)return false;if(gameMode==='ai'&&chess.turn()===iaColor&&aiThinking)return false;if(gameMode==='ai'&&chess.turn()===iaColor)return false;return true;}
function dragDown(e){if(draw.active)return;if(e.pointerType==='mouse'&&e.button!==0)return;if(gameMode==='editor')return;const sqEl=e.target.closest('.sq');if(!sqEl)return;const sq=sqEl.dataset.sq;if(!canControl(sq))return;drag.pending={from:sq,x0:e.clientX,y0:e.clientY,id:e.pointerId};}
function dragMove(e){if(drag.active){moveGhost(e.clientX,e.clientY);hlDropTarget(e);return;}if(!drag.pending||e.pointerId!==drag.pending.id)return;if(Math.hypot(e.clientX-drag.pending.x0,e.clientY-drag.pending.y0)<6)return;startDrag(e);}
function startDrag(e){const from=drag.pending.from;const p=chess.get(from);if(!p)return;drag.active=true;suppressClick=false;const key=(p.color==='w'?'w':'b')+p.type.toUpperCase();
drag.ghost=document.createElement('div');drag.ghost.className='drag-ghost';drag.ghost.innerHTML=PIECES[key]||'';document.body.appendChild(drag.ghost);moveGhost(e.clientX,e.clientY);
const src=document.querySelector('[data-sq="'+from+'"]');if(src){src.classList.add('drag-src');const pw=src.querySelector('.piece-wrap');if(pw)pw.style.opacity='.25';}
const ms=chess.moves({verbose:true}).filter(m=>m.from===from);drag.targets=ms.map(m=>m.to);
ms.forEach(m=>{const el=document.querySelector('[data-sq="'+m.to+'"]');if(el)el.classList.add(m.captured?'drop-cap':'drop-ok');});
selSq=from;render();const s2=document.querySelector('[data-sq="'+from+'"]');if(s2)s2.classList.add('drag-src');}
function moveGhost(x,y){if(drag.ghost){drag.ghost.style.left=x+'px';drag.ghost.style.top=y+'px';}}
function hlDropTarget(e){document.querySelectorAll('.sq.drop-no').forEach(el=>el.classList.remove('drop-no'));}
function dragUp(e){if(!drag.active){drag.pending=null;return;}const from=drag.pending?drag.pending.from:null;const g=drag.ghost;drag.ghost=null;const wasActive=drag.active;drag.active=false;drag.pending=null;clearDragHL();if(g)g.remove();
if(!from)return;suppressClick=true;setTimeout(()=>{suppressClick=false;},50);
const el=document.elementFromPoint(e.clientX,e.clientY);const sqEl=el?el.closest('.sq'):null;const to=sqEl?sqEl.dataset.sq:null;
if(!to||to===from){selSq=null;render();return;}
attemptDrop(from,to);}
function dragCancel(){if(drag.ghost)drag.ghost.remove();drag.ghost=null;drag.active=false;drag.pending=null;clearDragHL();selSq=null;render();}
function clearDragHL(){document.querySelectorAll('.sq.drag-src,.sq.drop-ok,.sq.drop-cap,.sq.drop-no').forEach(el=>el.classList.remove('drag-src','drop-ok','drop-cap','drop-no'));document.querySelectorAll('.piece-wrap').forEach(el=>el.style.opacity='');drag.targets=[];}
function attemptDrop(from,to){if(inputLock||chess.game_over()){selSq=null;render();return;}
if(gameMode==='online'&&chess.turn()!==myColor){selSq=null;render();return;}
if(gameMode==='ai'&&chess.turn()===iaColor){selSq=null;render();return;}
const cand=chess.moves({verbose:true}).find(m=>m.from===from&&m.to===to);
if(!cand){const el=document.querySelector('[data-sq="'+to+'"]');if(el){el.classList.add('shake');setTimeout(()=>el.classList.remove('shake'),200);}selSq=null;render();return;}
if(cand.promotion){selSq=from;render();showPromo(cand.color).then(pr=>{if(pr)doMove(from,to,pr);else{selSq=null;render();}});return;}
doMove(from,to,'q');}
function animateMove(from,to,svg){try{if(!svg)return;const board=$('chess-board');const frect=board.getBoundingClientRect();const fEl=document.querySelector('[data-sq="'+from+'"]'),tEl=document.querySelector('[data-sq="'+to+'"]');if(!fEl||!tEl)return;const fr=fEl.getBoundingClientRect(),tr=tEl.getBoundingClientRect();const size=Math.min(fr.width,fr.height)*0.92;
const d=document.createElement('div');d.className='anim-piece';d.style.width=size+'px';d.style.height=size+'px';d.innerHTML=svg;
d.style.left=(fr.left-frect.left+(fr.width-size)/2)+'px';d.style.top=(fr.top-frect.top+(fr.height-size)/2)+'px';board.appendChild(d);
requestAnimationFrame(()=>{d.style.left=(tr.left-frect.left+(tr.width-size)/2)+'px';d.style.top=(tr.top-frect.top+(tr.height-size)/2)+'px';});
setTimeout(()=>d.remove(),200);}catch{}}
window.flipBoard=function(){if(drag.active)dragCancel();if(draw.active)drawCancel();boardFlipped=!boardFlipped;buildBoard();render();};
// ---------- Dessin sur l'échiquier (flèches + surbrillances, 100% visuel) ----------
const DRAW_COLORS={green:'129,182,76',gold:'201,162,39',cyan:'77,192,192',red:'230,80,80'};
const drawStore=new Map(); // cle position -> {arrows:[{from,to,color}],hls:[{sq,color}]}
let drawViewKey=null;
const draw={active:false,pid:null,from:null,color:'green',moved:false,preview:null,timer:null,sx:0,sy:0};
function normFenKey(fen){try{const p=fen.split(' ');return p[0]+' '+p[1];}catch{return String(fen);}}
function liveDrawKey(){try{return normFenKey(chess.fen());}catch{return 'start';}}
function viewDrawKey(){return drawViewKey||liveDrawKey();}
function drawEntry(key){let e=drawStore.get(key);if(!e){e={arrows:[],hls:[]};drawStore.set(key,e);}return e;}
function drawColorFor(e){if(e.altKey)return 'cyan';if(e.ctrlKey||e.metaKey)return 'red';if(e.shiftKey)return 'gold';return 'green';}
function sqXY(sq){const f='abcdefgh'.indexOf(sq[0]);const rank=parseInt(sq[1],10);const ri=8-rank;const c=boardFlipped?7-f:f;const r=boardFlipped?7-ri:ri;return {x:c+0.5,y:r+0.5,col:c,row:r};}
function ensureDrawLayer(){const board=$('chess-board');if(!board)return null;let svg=$('draw-layer');if(!svg||svg.parentNode!==board){if(svg&&svg.parentNode)svg.parentNode.removeChild(svg);svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='draw-layer';svg.setAttribute('viewBox','0 0 8 8');const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');Object.keys(DRAW_COLORS).forEach(k=>{const m=document.createElementNS('http://www.w3.org/2000/svg','marker');m.id='dh-'+k;m.setAttribute('markerWidth','4');m.setAttribute('markerHeight','4');m.setAttribute('refX','3.1');m.setAttribute('refY','2');m.setAttribute('orient','auto');m.setAttribute('markerUnits','strokeWidth');const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d','M0,0 L4,2 L0,4 Z');p.setAttribute('fill','rgba('+DRAW_COLORS[k]+',0.9)');m.appendChild(p);defs.appendChild(m);});svg.appendChild(defs);board.appendChild(svg);}return svg;}
function drawArrowEl(g,a,preview){const A=sqXY(a.from),B=sqXY(a.to);const dx=B.x-A.x,dy=B.y-A.y;const len=Math.hypot(dx,dy);if(len<0.3)return;const ux=dx/len,uy=dy/len;const col='rgba('+DRAW_COLORS[a.color]+',0.9)';
const x1=A.x+ux*0.28,y1=A.y+uy*0.28,x2=B.x-ux*0.42,y2=B.y-uy*0.42;
const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',A.x);c.setAttribute('cy',A.y);c.setAttribute('r',0.17);c.setAttribute('fill',col);if(preview)c.setAttribute('opacity','0.55');g.appendChild(c);
const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.setAttribute('stroke',col);l.setAttribute('stroke-width',0.15);l.setAttribute('stroke-linecap','round');l.setAttribute('marker-end','url(#dh-'+a.color+')');if(preview)l.setAttribute('opacity','0.55');g.appendChild(l);}
function drawHlEl(g,h,preview){const p=sqXY(h.sq);const r=document.createElementNS('http://www.w3.org/2000/svg','rect');r.setAttribute('x',p.col+0.03);r.setAttribute('y',p.row+0.03);r.setAttribute('width',0.94);r.setAttribute('height',0.94);r.setAttribute('rx',0.1);r.setAttribute('fill','rgba('+DRAW_COLORS[h.color]+','+(preview?0.25:0.38)+')');g.appendChild(r);}
function redrawDrawings(){const svg=ensureDrawLayer();if(!svg)return;const defs=svg.querySelector('defs');svg.innerHTML='';if(defs)svg.appendChild(defs);
const e=drawStore.get(viewDrawKey());const list=e||{arrows:[],hls:[]};
list.hls.forEach(h=>drawHlEl(svg,h,false));list.arrows.forEach(a=>drawArrowEl(svg,a,false));
if(draw.preview){if(draw.preview.kind==='hl')drawHlEl(svg,draw.preview,true);else drawArrowEl(svg,draw.preview,true);}}
function drawStart(from,color,pid){draw.active=true;draw.pid=pid;draw.from=from;draw.color=color;draw.moved=false;draw.preview=null;}
function drawMoveTo(sq){if(!draw.active||!draw.from)return;if(sq===draw.from){draw.moved=false;draw.preview=null;}else{draw.moved=true;draw.preview={kind:'arrow',from:draw.from,to:sq,color:draw.color};}redrawDrawings();}
function drawFinish(e){const dEntry=drawEntry(viewDrawKey());const color=draw.color,from=draw.from;const el=document.elementFromPoint(e.clientX,e.clientY);const sqEl=el?el.closest('.sq'):null;const to=sqEl?sqEl.dataset.sq:null;
draw.active=false;draw.pid=null;draw.preview=null;
if(!to||to===from){const i=dEntry.hls.findIndex(h=>h.sq===from&&h.color===color);if(i>=0)dEntry.hls.splice(i,1);else dEntry.hls.push({sq:from,color});}
else{const i=dEntry.arrows.findIndex(a=>a.from===from&&a.to===to&&a.color===color);if(i>=0)dEntry.arrows.splice(i,1);else dEntry.arrows.push({from,to,color});}
draw.from=null;redrawDrawings();}
function drawCancel(){if(draw.timer){clearTimeout(draw.timer);draw.timer=null;}draw.active=false;draw.pid=null;draw.from=null;draw.preview=null;redrawDrawings();}
window.clearDrawings=function(){const k=viewDrawKey();const e=drawStore.get(k);if(draw.preview)draw.preview=null;if(e&&(e.arrows.length||e.hls.length)){e.arrows=[];e.hls=[];redrawDrawings();}};
function sqFromPoint(x,y){const el=document.elementFromPoint(x,y);const sqEl=el?el.closest('#chess-board .sq'):null;return sqEl?sqEl.dataset.sq:null;}
function render(){const b=chess.board();document.querySelectorAll('#chess-board .sq').forEach(el=>{const sq=el.dataset.sq;const f='abcdefgh'.indexOf(sq[0]),r=8-parseInt(sq[1]);const p=b[r][f];el.classList.remove('hl-light','hl-dark','selected','can-move','can-capture');
if(lastMove&&(lastMove.from===sq||lastMove.to===sq))el.classList.add(((r+f)%2===0)?'hl-light':'hl-dark');
if(selSq===sq)el.classList.add('selected');
if(selSq){const ms=chess.moves({verbose:true}).filter(m=>m.from===selSq);const hit=ms.find(m=>m.to===sq);if(hit)el.classList.add(p?'can-capture':'can-move');}
el.innerHTML=p?'<span class="piece-wrap">'+PIECES[(p.color==='w'?'w':'b')+p.type.toUpperCase()]+'</span>':'';
if(f===0||r===7){const c=document.createElement('span');c.className='sq-coord';c.textContent=sq;el.appendChild(c);}});updateStatus();updateEvalBar();redrawDrawings();}
function updateStatus(){let t='Tour des '+(chess.turn()==='w'?'Blancs':'Noirs')+' — Sélectionnez une pièce';
try{
if(gameMode==='editor'){$('status-msg').textContent='Éditeur — cliquez une pièce puis une case (clic droit/sélection + case = effacer)';$('status-white').textContent='Édition';$('status-black').textContent='Édition';return;}
if(chess.in_checkmate())t='♛ Échec et mat ! '+(chess.turn()==='w'?'Victoire des Noirs':'Victoire des Blancs');
else if(chess.in_draw()||chess.in_stalemate())t='½ Partie nulle';
else if(chess.in_check())t='⚠ '+(chess.turn()==='w'?'Blancs':'Noirs')+' — ÉCHEC !';}catch(e){t='Position libre';}
$('status-msg').textContent=t;
try{$('status-white').textContent=chess.turn()==='w'?'À vous de jouer':'En attente…';
$('status-black').textContent=chess.turn()==='b'?'À vous de jouer':'En attente…';}catch{}
try{if(gameMode!=='editor'&&chess.game_over())maybeShowGameOver();}catch{}}
let lastGameOverKey=null;
function maybeShowGameOver(){let key=null;try{key=chess.fen();}catch{return;}
if(key===lastGameOverKey)return;showGameOver();lastGameOverKey=key;}
function updateEvalBar(){const last=evalHistory[evalHistory.length-1];const cp=last?last.after:0;const pct=50+Math.max(-47,Math.min(47,cp/1500*47));$('eval-bar').style.width=pct+'%';$('eval-num').textContent=(cp/100).toFixed(1);}
// ---------- Coups ----------
async function onSqClick(sq){if(suppressClick){suppressClick=false;return;}
if(gameMode==='editor')return edClick(sq);
if(inputLock)return;try{if(chess.game_over())return;}catch{}
if(gameMode==='online'&&chess.turn()!==myColor)return;
if(gameMode==='ai'&&chess.turn()==='b'&&aiThinking)return;
if(!selSq){const p=chess.get(sq);if(p&&p.color===chess.turn()){selSq=sq;render();sndSelect();}return;}
if(selSq===sq){selSq=null;render();return;}
const cand=chess.moves({verbose:true}).find(m=>m.from===selSq&&m.to===sq);
if(!cand){const p=chess.get(sq);if(p&&p.color===chess.turn()){selSq=sq;render();}else{selSq=null;render();}return;}
if(cand.promotion){showPromo(cand.color).then(pr=>doMove(selSq,sq,pr));return;}
doMove(selSq,sq,'q');}
function isTheoryNow(){const seq=chess.history().join(' ');for(const o of OPENINGS){if(seq===o.m||o.m.startsWith(seq))return true;}return false;}
function doMove(from,to,promo){if(inputLock)return;try{const beforeEval=quickEval();const mover=chess.get(from);const moverSvg=mover?PIECES[(mover.color==='w'?'w':'b')+mover.type.toUpperCase()]:null;const mv=chess.move({from,to,promotion:promo});lastMove={from:mv.from,to:mv.to};selSq=null;if(drag.active)dragCancel();navGoEnd();inputLock=true;setTimeout(()=>{inputLock=false;},180);
const mvIdx=chess.history().length-1;
if(mv.captured)sndCapture();else if(chess.in_checkmate())sndMate();else if(chess.in_check())sndCheck();else sndMove();
const afterEval=quickEval();const theory=isTheoryNow();
let ann=ANN.correct;if(chess.in_checkmate())ann=ANN.mate;else if(mv.promotion)ann=ANN.promo;else if(mv.san&&mv.san.includes('O-O'))ann=ANN.castle;else if(theory)ann=ANN.theory;
moveAnns[mvIdx]=ann;evalHistory[mvIdx]={before:beforeEval,after:afterEval,san:mv.san};showAnnotationOnSquare(mv.to,ann);stampIncrement(mv.color);navReset();updateAll();updateCaptured();checkAutoFlip();animateMove(mv.from,mv.to,moverSvg);requestAIAnalysis(mv,ann,beforeEval,afterEval,mvIdx);
if(gameMode==='online')wsSend({t:'move',from,to,promotion:promo});
if(gameMode==='ai'&&!chess.game_over()&&chess.turn()==='b')setTimeout(playAIMove,350+Math.random()*300);
else requestAnalysis();
}catch(e){selSq=null;render();}}
function quickEval(){const b=chess.board();const V={p:100,n:320,b:330,r:500,q:900,k:0};let s=0;b.forEach(row=>row.forEach(p=>{if(!p)return;const v=V[p.type]||0;s+=p.color==='w'?v:-v;}));return s;}
// ---------- IA douce ----------
window.setDifficulty=function(l){currentDiff=l;document.querySelectorAll('.diff-btn').forEach((b,i)=>b.classList.toggle('active',i+1===l));$('diff-desc').textContent=DIFFICULTY[l].desc;};
async function playAIMove(){if(chess.turn()!=='b'||chess.game_over())return;aiThinking=true;const d=DIFFICULTY[currentDiff];
$('depth-row').style.display='block';$('depth-bar').style.width='40%';$('engine-status').textContent='Stockfish doux réfléchit…';
const fenBefore=chess.fen();
try{const r=await api('/api/bestmove',{fen:fenBefore,movetime:d.movetime,depth:d.depth,skill:d.skill,elo:d.elo,multipv:1},Math.max(15000,d.movetime+12000));
if(chess.fen()!==fenBefore){aiThinking=false;return;}
if(!r.ok)throw new Error(r.error||'moteur');
let u=r.bestmove;
if(!u){aiThinking=false;$('depth-bar').style.width='0';toast('Moteur sans réponse — réessaie',false);return;}
// jitter humain : parfois coup aléatoire
if(Math.random()<d.jitter){const all=chess.moves({verbose:true});const rnd=all[Math.floor(Math.random()*all.length)];if(rnd)u=rnd.from+rnd.to+(rnd.promotion||'');}
doMove(u.slice(0,2),u.slice(2,4),u.length>4?u[4]:'q');
}catch(e){toast('Coup IA impossible ('+(e.message||'erreur')+')',false);}
aiThinking=false;$('depth-bar').style.width='0';}
// ---------- Analyse via ANAL ----------
async function requestAnalysis(){}
async function requestAIAnalysis(move,annPrelim,evalBefore,evalAfter,mvIdx){
const myId=++analSeq;const card=$('analysis-card'),body=$('analysis-body');
const loadBadge='<div class="ann-header"><div class="ann-symbol" style="background:'+annPrelim.bg+';color:'+annPrelim.fg+'">'+annPrelim.sym+'</div><div><div class="ann-move-name">'+move.san+'</div><div class="ann-label">'+annPrelim.label+'</div></div></div>';
body.innerHTML=loadBadge+'<div class="thinking"><div class="dots"><span></span><span></span><span></span></div>&nbsp;Stockfish analyse…</div>';
try{
const hist=chess.history({verbose:true});const tmp=new Chess();hist.slice(0,-1).forEach(m=>{try{tmp.move(m);}catch{}});
const fenBefore=tmp.fen(),fenAfter=chess.fen();const theory=isTheoryNow();
const r1=await api('/api/analyse',{fen:fenBefore,movetime:200,multipv:1});if(myId!==analSeq)return;
const r2=await api('/api/analyse',{fen:fenAfter,movetime:200,multipv:1});if(myId!==analSeq)return;
if(!r1.ok||!r2.ok||!r1.lines[0]||!r2.lines[0]){const fb=classifyFallbackByEval(evalBefore,evalAfter,move,theory);finishAnn(move,fb,evalAfter,Math.abs(evalAfter-evalBefore),80,false,myId,mvIdx);return;}
const sfB=r1.lines[0].score,sfA=r2.lines[0].score;
const diff=Math.max(0,sfB+sfA);
const ann1=classifyByCpDiff(diff,move,sfA,theory);
const acc=winToAccuracy(cpToWin(sfB),cpToWin(-sfA));
finishAnn(move,ann1,sfA,diff,acc,false,myId,mvIdx);pushAccuracy(move.color,acc);
if(myId!==analSeq)return;
await new Promise(r=>setTimeout(r,300));if(myId!==analSeq)return;
const r3=await api('/api/analyse',{fen:fenBefore,movetime:600,multipv:1});if(myId!==analSeq)return;
const r4=await api('/api/analyse',{fen:fenAfter,movetime:600,multipv:3});if(myId!==analSeq)return;
if(!r3.ok||!r4.ok||!r3.lines[0]||!r4.lines[0])return;renderPV(r4.lines);
const sfB2=r3.lines[0].score,sfA2=r4.lines[0].score;const diff2=Math.max(0,sfB2+sfA2);
const ann2=classifyByCpDiff(diff2,move,sfA2,theory);const acc2=winToAccuracy(cpToWin(sfB2),cpToWin(-sfA2));
if(Math.abs(diff2-diff)>=50||ann2!==ann1){finishAnn(move,ann2,sfA2,diff2,acc2,true,myId,mvIdx);pushAccuracy(move.color,acc2);}
}catch{}}
function finishAnn(move,ann,sfAfter,diff,acc,refined,myId,mvIdx){if(myId!==analSeq)return;
if(mvIdx!=null&&mvIdx>=0)moveAnns[mvIdx]=ann;else moveAnns[moveAnns.length-1]=ann;
renderAnalysisCard(move,ann,sfAfter,diff,acc,refined);showAnnotationOnSquare(move.to,ann);updateHistory();
if(evalHistory.length){evalHistory[evalHistory.length-1].after=(move.color==='w'?-sfAfter:sfAfter);drawGraph();updateEvalBar();}}
function drawGraph(){drawCurve($('eval-graph'),evalHistory.map(e=>e.after),80);}
function drawCurve(c,vals,h){if(!c)return;const ctx=c.getContext('2d');c.width=c.offsetWidth||300;ctx.clearRect(0,0,c.width,h);if(vals.length<2){return;}ctx.beginPath();vals.forEach((v,i)=>{const x=i/Math.max(1,vals.length-1)*c.width;const y=h/2-Math.max(-h/2+2,Math.min(h/2-2,v/1500*(h/2)));i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.strokeStyle='#81b64c';ctx.lineWidth=2;ctx.stroke();ctx.lineTo(c.width,h/2);ctx.lineTo(0,h/2);ctx.closePath();ctx.fillStyle='rgba(129,182,76,.12)';ctx.fill();}
function renderPV(lines){const box=$('pv-list');if(!box)return;box.innerHTML='';lines.slice(0,3).forEach((l,i)=>{const d=document.createElement('div');d.className='pv-line';const sc=(l.score>=0?'+':'')+(l.score/100).toFixed(2);const dep=l.depth!=null?'P'+l.depth:'';d.innerHTML='<span class="pv-score">'+sc+'</span><span class="pv-moves">'+(l.pv||[]).slice(0,10).join(' ')+'</span><span class="pop">'+dep+'</span>';d.title='Cliquer : surligner le premier coup'+(dep?' (profondeur '+l.depth+')':'');d.onclick=()=>{if(l.pv&&l.pv[0]){const u=l.pv[0];hintClear();hintHL(u.slice(0,2),u.slice(2,4),'rgba(129,182,76,0.7)');hintStatus('Variante '+(i+1)+' : '+u.slice(0,2)+'-'+u.slice(2,4));}};box.appendChild(d);});}
// ---------- Ouvertures ----------
function detectOpening(){const h=chess.history({verbose:true}).map(m=>m.from+m.to+(m.promotion||'')).join(' ');return null;}
function explorerData(sans){const seq=sans.join(' ');let best=null;for(const o of OPENINGS){if(seq===o.m||(seq&&o.m.startsWith(seq+' '))||(!seq&&o.m)){if(!best||o.m.length>best.m.length)best=o;}}
const contMap=new Map();for(const o of OPENINGS){if(seq&&!(o.m===seq||o.m.startsWith(seq+' ')))continue;const rest=o.m.slice(seq.length).trim().split(' ').filter(Boolean);if(!rest.length)continue;const nx=rest[0];if(!contMap.has(nx))contMap.set(nx,{count:0,eco:o.eco,name:o.n});contMap.get(nx).count++;}
const cont=[...contMap.entries()].sort((a,b)=>b[1].count-a[1].count).slice(0,6).map(([san,info])=>({san,...info}));
return {best,cont,seq};}
function updateOpeningDisplay(){updateExplorer(chess.history());const seq=chess.history().join(' ');let best=null;for(const o of OPENINGS){if(seq===o.m||seq.startsWith(o.m+' ')){if(!best||o.m.length>best.m.length)best=o;}}
if(!best||chess.history().length===0){$('op-eco').style.display='none';$('op-name').textContent=chess.history().length===0?'Position de départ':'Hors théorie';$('op-var').textContent=chess.history().length===0?'Faites votre premier coup':'Position inconnue';$('op-tip').style.display='none';}
else{$('op-eco').textContent=best.eco;$('op-eco').style.display='inline-block';$('op-name').textContent=best.n;$('op-var').textContent=best.v||'—';}}
function updateExplorer(sans){const nameEl=$('explorer-name'),ecoEl=$('explorer-eco'),mainEl=$('explorer-main'),contEl=$('explorer-continuations');if(!nameEl)return;
const {best,cont,seq}=explorerData(sans);
if(!sans.length){nameEl.textContent='Position de départ';ecoEl.style.display='none';mainEl.textContent='Jouez un coup pour explorer la théorie.';}
else if(!best){nameEl.textContent='Hors théorie';ecoEl.style.display='none';mainEl.textContent=seq;}
else{nameEl.textContent=best.n+(best.v?' · '+best.v:'');ecoEl.textContent=best.eco;ecoEl.style.display='inline-block';mainEl.textContent=seq;}
contEl.innerHTML='';if(navCur!==-1){const n=document.createElement('div');n.style.cssText='font-size:.72rem;color:var(--dim)';n.textContent='Navigation : revenez à la position live pour jouer une suite.';contEl.appendChild(n);}
cont.forEach(c=>{const b=document.createElement('button');b.className='explorer-move';b.innerHTML='<span><strong>'+c.san+'</strong></span><span class="pop">'+c.count+' ligne'+(c.count>1?'s':'')+' · '+c.eco+'</span>';b.onclick=()=>explorerPlay(c.san);contEl.appendChild(b);});
if(!cont.length&&sans.length){const n=document.createElement('div');n.style.cssText='font-size:.72rem;color:var(--dim)';n.textContent='Aucune suite théorique connue ici — fiez-vous à Stockfish.';contEl.appendChild(n);}}
window.explorerPlay=function(san){if(navCur!==-1){toast('Revenez à la position live (bouton fin) pour jouer',false);return;}
if(gameMode==='online'&&chess.turn()!==myColor){toast('Attendez le coup adverse',false);return;}
if(gameMode==='ai'&&chess.turn()===iaColor){toast('Au tour de Stockfish',false);return;}
if(chess.game_over()){toast('Partie terminée',false);return;}
const mv=chess.moves({verbose:true}).find(m=>m.san===san);
if(!mv){toast('Suite illégale dans cette position',false);return;}
if(mv.promotion){showPromo(mv.color).then(pr=>{if(pr)doMove(mv.from,mv.to,pr);});return;}
doMove(mv.from,mv.to,'q');};
function updateAll(){render();updateOpeningDisplay();updateHistory();renderClocks();drawGraph();
if(chess.game_over()){stopClock();}}
// ---------- Historique/nav ----------
function chip(a){if(!a||!a.sym)return '';return '<span class="ann-chip" style="background:'+a.bg+';color:'+a.fg+'">'+a.sym+'</span>';}
function updateHistory(){const h=chess.history();let s='';for(let i=0;i<h.length;i+=2){const wA=moveAnns[i],bA=moveAnns[i+1];s+='<div class="move-row"><span>'+(i/2+1)+'.</span><span class="move-san" onclick="navView('+(i)+')"> '+(h[i]||'')+' '+chip(wA)+'</span><span class="move-san" onclick="navView('+(i+1)+')"> '+(h[i+1]||'')+' '+chip(bA)+'</span></div>';}
$('move-history').innerHTML=s||'<span style="color:var(--dim)">Aucun coup.</span>';$('move-counter').textContent=h.length+' coups';navUpdateBtns();if(navCur===-1){const mh=$('move-history');mh.scrollTop=mh.scrollHeight;}}
function navBuild(){navSnaps=[];const t=new Chess();navSnaps.push({fen:t.fen(),idx:-1});chess.history({verbose:true}).forEach((m,i)=>{t.move(m);navSnaps.push({fen:t.fen(),idx:i});});}
function navReset(){navSnaps=[];navCur=-1;navUpdateBtns();}
function navShow(pos){if(drag.active)dragCancel();if(draw.active)drawCancel();navBuild();pos=Math.max(0,Math.min(navSnaps.length-1,pos));navCur=pos;const snap=navSnaps[pos];drawViewKey=normFenKey(snap.fen);const old=chess;chess=new Chess(snap.fen);render();const viewedSans=chess.history();chess=old;updateExplorer(viewedSans);showHistoryEval(snap.idx);document.querySelectorAll('.move-san').forEach(el=>el.classList.remove('nav-hl'));const all=document.querySelectorAll('.move-san');if(snap.idx>=0&&all[snap.idx])all[snap.idx].classList.add('nav-hl');navUpdateBtns();}
function showHistoryEval(idx){const body=$('analysis-body');if(!body)return;const pv=$('pv-list');if(pv)pv.innerHTML='';
if(idx<0||!evalHistory[idx]){body.innerHTML='<div style="font-size:.8rem;color:var(--dim)">Début de partie — revenez à la position live pour l analyse.</div>';return;}
const e=evalHistory[idx],a=moveAnns[idx];const sc=(e.after>=0?'+':'')+(e.after/100).toFixed(2);
body.innerHTML='<div class="ann-header"><div class="ann-symbol" style="background:'+(a?a.bg:'#444')+';color:'+(a?a.fg:'#fff')+'">'+(a?a.sym:'·')+'</div><div><div class="ann-move-name">'+e.san+'</div><div class="ann-label">'+(a?a.label:'')+' <span style="color:var(--dim)">● historique</span></div></div></div><div style="margin-top:8px;font-size:.8rem">Éval : <strong>'+sc+'</strong> — position consultée, sans relancer Stockfish.</div>';}
window.navView=function(i){if(i<0||i>=chess.history().length)return;navShow(i+1);};
window.navGo=function(p){if(!chess.history().length)return;navShow(p||0);};
window.navPrev=function(){navBuild();navShow(navCur<0?navSnaps.length-2:navCur-1);};
window.navNext=function(){navBuild();const t=navCur<0?navSnaps.length-1:navCur+1;if(t>=navSnaps.length-1){navGoEnd();return;}navShow(t);};
window.navGoEnd=function(){if(draw.active)drawCancel();navCur=-1;drawViewKey=null;render();updateExplorer(chess.history());document.querySelectorAll('.move-san').forEach(el=>el.classList.remove('nav-hl'));navUpdateBtns();};
function navUpdateBtns(){const atStart=navCur===0;const atEnd=navCur===-1;['nav-s','nav-p','nav-n','nav-e'].forEach(()=>{});const s=$('nav-s'),p=$('nav-p'),n=$('nav-n'),e=$('nav-e');if(s){if(atStart)s.setAttribute('disabled','');else s.removeAttribute('disabled');}if(p){if(atStart)p.setAttribute('disabled','');else p.removeAttribute('disabled');}if(n){if(atEnd)n.setAttribute('disabled','');else n.removeAttribute('disabled');}if(e){if(atEnd)e.setAttribute('disabled','');else e.removeAttribute('disabled');}}
// ---------- Horloges ----------
window.setTimeControl=function(tc){currentTC=tc;document.querySelectorAll('.time-btn').forEach(b=>b.classList.toggle('active',b.dataset.tc===tc));try{localStorage.setItem('cm_tc',tc);}catch{}initClocks();};
function initClocks(){stopClock();const c=TIME_CONFIGS[currentTC]||TIME_CONFIGS.unlimited;clocks={w:c.t,b:c.t,inc:c.inc};renderClocks();startClock();}
function renderClocks(){$('clock-white').textContent=clocks.w==null?'∞':fmt(clocks.w);$('clock-black').textContent=clocks.b==null?'∞':fmt(clocks.b);
$('clock-white').classList.toggle('low-clock',clocks.w!=null&&clocks.w<30);$('clock-black').classList.toggle('low-clock',clocks.b!=null&&clocks.b<30);
const active=clockTimer!=null;$('clock-white').classList.toggle('active-clock',active&&chess.turn()==='w');$('clock-black').classList.toggle('active-clock',active&&chess.turn()==='b');}
function fmt(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function startClock(){stopClock();if(clocks.w==null||gameMode==='ai')return;clockTimer=setInterval(()=>{const t=chess.turn();if(clocks[t]==null)return;clocks[t]--;if(clocks[t]<=0){clocks[t]=0;stopClock();renderClocks();showGameOver('Temps écoulé !','Victoire des '+(t==='w'?'Noirs':'Blancs')+' par temps','');}renderClocks();},1000);}
function stampIncrement(color){if(clocks.inc>0&&clocks[color]!=null)clocks[color]+=clocks.inc;}
function stopClock(){if(clockTimer)clearInterval(clockTimer);clockTimer=null;}
// ---------- Sons ----------
function tone(f,d,type,g){if(!soundOn)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),gn=AC.createGain();o.connect(gn);gn.connect(AC.destination);o.type=type||'sine';o.frequency.value=f;gn.gain.value=g||.08;o.start();o.stop(AC.currentTime+d);}catch{}}
function sndMove(){tone(580,.07,'square',.06);}function sndCapture(){tone(200,.08,'sawtooth',.1);}function sndCheck(){tone(900,.12);}function sndMate(){tone(300,.4);}function sndSelect(){tone(620,.04);}
window.toggleSound=function(){soundOn=!soundOn;try{localStorage.setItem('cm_sound',soundOn?'1':'0');}catch{}applySoundIcon();const hb=$('home-sound-btn');if(hb)hb.textContent='Son : '+(soundOn?'oui':'non');};
// ---------- Chat ----------
window.addChatMsg=function(t,type){const d=document.createElement('div');d.textContent=t;$('chat-messages').appendChild(d);};
window.sendChat=function(){const v=$('chat-input').value.trim();if(!v)return;addChatMsg('Moi: '+v);wsSend({t:'chat',text:v});$('chat-input').value='';};
// ---------- Export ----------
window.exportPGN=function(){try{navigator.clipboard.writeText(chess.pgn());}catch{}const el=$('engine-status');if(el)el.textContent='✓ PGN copié !';};
window.exportFEN=function(){try{navigator.clipboard.writeText(chess.fen());}catch{}$('fen-in').value=chess.fen();};
window.loadFenBox=function(){try{chess=new Chess($('fen-in').value.trim());lastMove=null;analSeq++;updateAll();toast('Position FEN chargée',true);}catch{toast('FEN invalide',false);}};
window.downloadPGN=function(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([chess.pgn()],{type:'text/plain'}));a.download='partie.pgn';a.click();};
function resetAnalysisPane(){const pv=$('pv-list');if(pv)pv.innerHTML='';const ab=$('analysis-body');if(ab)ab.textContent='Faites votre premier coup pour recevoir l analyse IA…';}
window.undoLast=function(){if(gameMode==='online'){toast('Annuler indisponible en ligne (partie synchronisée)',false);return;}const u1=chess.undo();if(u1){moveAnns.pop();evalHistory.pop();}if(gameMode==='ai'){const u2=chess.undo();if(u2){moveAnns.pop();evalHistory.pop();}}const h=chess.history({verbose:true});lastMove=h.length?{from:h[h.length-1].from,to:h[h.length-1].to}:null;analSeq++;document.querySelectorAll('.sq-ann').forEach(e=>e.remove());resetAnalysisPane();updateAll();addChatMsg('Coup annulé.');};
// ---------- Promo / fin ----------
function showPromo(){return new Promise(res=>{const ov=$('promo-overlay'),ch=$('promo-choices');ch.innerHTML='';['q','r','b','n'].forEach(p=>{const b=document.createElement('button');b.className='g-btn';b.style.fontSize='2rem';b.textContent={q:'♕',r:'♖',b:'♗',n:'♘'}[p];b.onclick=()=>{ov.classList.remove('open');res(p);};ch.appendChild(b);});ov.classList.add('open');});}
function showGameOver(i,t,s){$('go-icon').textContent=i||'♛';$('go-title').textContent=t||'Partie terminée';$('go-sub').textContent=s||chess.pgn().slice(-60);$('gameover-overlay').classList.add('open');}
window.closeGameOver=function(){$('gameover-overlay').classList.remove('open');};
window.showSummary=function(){const h=chess.history();const counts={};moveAnns.forEach(a=>{if(a)counts[a.label]=(counts[a.label]||0)+1;});
const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):null;const aw=avg(accW),ab=avg(accB);
$('sum-sub').textContent=h.length+' coups · '+(chess.in_checkmate()?'mat':chess.in_draw()||chess.in_stalemate()?'nulle':'en cours');
$('sum-stats').innerHTML='<div class="sum-cell"><div class="n">'+h.length+'</div><div class="t">Coups</div></div><div class="sum-cell"><div class="n">'+(aw==null?'—':aw+'%')+'</div><div class="t">Préc. Blancs</div></div><div class="sum-cell"><div class="n">'+(ab==null?'—':ab+'%')+'</div><div class="t">Préc. Noirs</div></div><div class="sum-cell"><div class="n">'+(counts['GAFFE']||0)+'</div><div class="t">Gaffes</div></div>';
let worst=null;const hist=chess.history();for(let i=0;i<moveAnns.length;i++){const a=moveAnns[i];if(a&&(a===ANN.blunder||a===ANN.miss)){worst={i,san:hist[i],ann:a};break;}}
if(!worst)for(let i=0;i<moveAnns.length;i++){const a=moveAnns[i];if(a===ANN.mistake){worst={i,san:hist[i],ann:a};break;}}
$('sum-detail').textContent=(Object.keys(counts).map(k=>k+': '+counts[k]).join(' · ')||'Jouez des coups pour générer le bilan.')
+(worst?(' — coup à revoir : '+(Math.floor(worst.i/2)+1)+'. '+worst.san+' ('+worst.ann.label+')'):' — aucun accroc majeur, propre !');
$('summary-overlay').classList.add('open');drawCurve($('summary-graph'),evalHistory.map(e=>e.after),100);};
window.openShortcuts=function(){$('shortcuts-modal').classList.add('open');};
window.closeShortcuts=function(){$('shortcuts-modal').classList.remove('open');};
window.openSettings=function(){syncSettingsUI();$('settings-modal').classList.add('open');};
window.closeSettings=function(){$('settings-modal').classList.remove('open');};
function syncSettingsUI(){const hb=$('home-sound-btn');if(hb)hb.textContent='Son : '+(soundOn?'oui':'non');const tb=$('set-theme-btn');if(tb)tb.textContent='Thème : '+(currentTheme==='dark'?'sombre':'clair');const bs=$('board-theme-sel');if(bs)bs.value=document.body.dataset.board||'classic';}
function buildLandingBoard(){const el=$('landing-board');if(!el||el.dataset.done)return;el.dataset.done='1';
const back=['R','N','B','Q','K','B','N','R'];
for(let r=0;r<8;r++)for(let f=0;f<8;f++){const d=document.createElement('div');d.className='lb-sq '+(((r+f)%2===0)?'l':'d');
let code=null;if(r===0)code='b'+back[f];else if(r===1)code='bP';else if(r===6)code='wP';else if(r===7)code='w'+back[f];
if(code&&PIECES[code]){const s=document.createElement('span');s.innerHTML=PIECES[code];d.appendChild(s);}
const sq='abcdefgh'[f]+(8-r);if(sq==='e4'||sq==='d4')d.classList.add('hl');
el.appendChild(d);}}
window.offerDraw=function(){if(gameMode!=='online'||!myRoomCode){toast('Crée ou rejoins une salle avant',false);return;}wsSend({t:'draw_offer'});toast('Proposition de nulle envoyée');};
window.askRematch=function(){if(gameMode!=='online'||!myRoomCode){startGame(gameMode);toast('Nouvelle partie relancée',true);return;}wsSend({t:'rematch_offer'});toast('Demande de revanche envoyée');};
function applyPersist(){try{const bt=localStorage.getItem('cm_board');if(bt){document.body.dataset.board=bt;const s=$('board-theme-sel');if(s)s.value=bt;}const tc=localStorage.getItem('cm_tc');if(tc&&TIME_CONFIGS[tc]){currentTC=tc;}const df=parseInt(localStorage.getItem('cm_diff')||'3');if(DIFFICULTY[df])currentDiff=df;const sn=localStorage.getItem('cm_sound');if(sn==='0'){soundOn=false;}}catch{}}
let confirmResolve=null;
function confirmModal(title,text){return new Promise(res=>{const ov=$('confirm-modal');if(!ov){res(false);return;}$('confirm-title').textContent=title;$('confirm-text').textContent=text;ov.classList.add('open');const done=v=>{ov.classList.remove('open');$('confirm-yes').onclick=null;$('confirm-no').onclick=null;confirmResolve=null;res(v);};confirmResolve=()=>done(false);$('confirm-yes').onclick=()=>done(true);$('confirm-no').onclick=()=>done(false);});}
function applyRemoteMove(m){if(drag.active)dragCancel();try{const beforeEval=quickEval();const mv=chess.move({from:m.from,to:m.to,promotion:m.promotion||'q'});const moverSvg=PIECES[(mv.color==='w'?'w':'b')+mv.piece.toUpperCase()];lastMove={from:mv.from,to:mv.to};selSq=null;navGoEnd();const mvIdx=chess.history().length-1;
if(mv.captured)sndCapture();else if(chess.in_checkmate())sndMate();else if(chess.in_check())sndCheck();else sndMove();
const afterEval=quickEval();const theory=isTheoryNow();let ann=ANN.correct;if(chess.in_checkmate())ann=ANN.mate;else if(mv.promotion)ann=ANN.promo;else if(mv.san&&mv.san.includes('O-O'))ann=ANN.castle;else if(theory)ann=ANN.theory;
moveAnns[mvIdx]=ann;evalHistory[mvIdx]={before:beforeEval,after:afterEval,san:mv.san};showAnnotationOnSquare(mv.to,ann);stampIncrement(mv.color);navReset();updateAll();updateCaptured();animateMove(mv.from,mv.to,moverSvg);requestAIAnalysis(mv,ann,beforeEval,afterEval,mvIdx);}catch(e){try{chess=new Chess(m.fen);moveAnns=[];evalHistory=[];lastMove=null;analSeq++;updateAll();}catch{}}}
window.setBoardTheme=function(v){document.body.dataset.board=v;try{localStorage.setItem('cm_board',v);}catch{}};
const _setDiff=setDifficulty;setDifficulty=function(l){_setDiff(l);try{localStorage.setItem('cm_diff',l);}catch{}};
window.closeSummary=function(){$('summary-overlay').classList.remove('open');};
// ---------- Éditeur ----------
function openEditor(){chess=edBoard;buildPalette();edRefreshUI();render();}
function buildPalette(){const el=$('ed-palette');el.innerHTML='';['wP','wN','wB','wR','wQ','wK','bP','bN','bB','bR','bQ','bK','X'].forEach(c=>{const b=document.createElement('button');b.className='ed-pitem'+(c===edPiece?' sel':'');b.title=c==='X'?'Effacer':c;b.innerHTML=c==='X'?ICONS.eraser:('<span>'+SYM[c]+'</span>');b.onclick=()=>{edPiece=c;buildPalette();};el.appendChild(b);});}
function edSquareOf(board,color,type){const b=board.board();for(let r=0;r<8;r++)for(let f=0;f<8;f++){const p=b[r][f];if(p&&p.color===color&&p.type===type)return 'abcdefgh'[f]+(8-r);}return null;}
function edValidate(board){const errs=[];const b=board.board();let kw=0,kb=0,pawnEdge=0;let n=0;
b.forEach(row=>row.forEach(p=>{if(!p)return;n++;if(p.type==='k')(p.color==='w'?kw++:kb++);}));
b[0].forEach(p=>{if(p&&(p.type==='p'))pawnEdge++;});b[7].forEach(p=>{if(p&&(p.type==='p'))pawnEdge++;});
if(kw!==1)errs.push('Roi blanc : '+kw+' (il en faut 1)');if(kb!==1)errs.push('Roi noir : '+kb+' (il en faut 1)');
if(pawnEdge)errs.push(pawnEdge+' pion(s) sur la 1re/8e rangée');if(!n)errs.push('Échiquier vide');
return {ok:!errs.length,errs,n,kw,kb};}
function edRefreshUI(){try{const fen=edBoard.fen().split(' ');fen[1]=edTurn;const inp=$('editor-fen-input');if(inp&&document.activeElement!==inp)inp.value=fen.join(' ');}catch{}
const w=$('ed-turn-w'),b=$('ed-turn-b');if(w)w.classList.toggle('active',edTurn==='w');if(b)b.classList.toggle('active',edTurn==='b');
const v=$('ed-valid');if(v){try{const r=edValidate(edBoard);v.textContent=r.ok?'Position valide — '+r.n+' pièces, trait '+(edTurn==='w'?'blancs':'noirs'):'Non jouable : '+r.errs.join(' · ');v.style.color=r.ok?'var(--green)':'var(--red2)';}catch{v.textContent='Position illisible';v.style.color='var(--red2)';}}}
function edClick(sq){if(edPiece==='X'){edBoard.remove(sq);}else{const color=edPiece[0]==='w'?'w':'b',type=edPiece[1].toLowerCase();
try{if(type==='k'){const old=edSquareOf(edBoard,color,'k');if(old&&old!==sq)edBoard.remove(old);}edBoard.put({type,color},sq);}catch{}}chess=edBoard;edRefreshUI();render();}
window.edSetTurn=function(c){edTurn=c;try{const f=edBoard.fen().split(' ');f[1]=c;edBoard=new Chess(f.join(' '));chess=edBoard;}catch{}edRefreshUI();render();};
window.edLoadFen=function(){try{const v=$('editor-fen-input').value.trim();if(!v)return;edBoard=new Chess(v);chess=edBoard;edTurn=edBoard.turn();edRefreshUI();render();toast('FEN chargé dans l’éditeur',true);}catch{toast('FEN invalide',false);}};
window.edStartFromPosition=function(){const r=edValidate(edBoard);if(!r.ok){toast('Position non jouable : '+r.errs[0],false);return;}
try{const f=edBoard.fen().split(' ');f[1]=edTurn;f[2]='-';f[3]='-';f[4]='0';f[5]='1';chess=new Chess(f.join(' '));gameMode='local';$('mode-badge').textContent='Local (éditeur)';moveAnns=[];evalHistory=[];analSeq++;drawViewKey=null;navReset();initClocks();render();updateAll();toast('Position mise en jeu',true);}catch{toast('Position invalide',false);}};
window.edSetStartPos=function(){edBoard=new Chess();chess=edBoard;edTurn='w';edRefreshUI();render();};
window.edCopyFen=function(){try{const f=edBoard.fen().split(' ');f[1]=edTurn;navigator.clipboard.writeText(f.join(' '));toast('FEN copié',true);}catch{}};
window.edClearBoard=function(){edBoard=new Chess('8/8/8/8/8/8/8/8 w - - 0 1');chess=edBoard;edRefreshUI();render();};
// ---------- Online WS ----------
let wsQueue=[];
function wsSend(o){const s=JSON.stringify(o);if(ws&&ws.readyState===1){try{ws.send(s);return true;}catch{}}wsQueue.push(s);wsConnect();return false;}
function initOnlineClocks(time){const s=parseInt(time)||0;clocks={w:s||null,b:s||null,inc:0};renderClocks();startClock();}
function wsUrl(){try{const h=location.hostname||'127.0.0.1';const p=location.port||'3000';return 'ws://'+h+':'+p+'/online';}catch{return 'ws://127.0.0.1:3000/online';}}
function wsConnect(){if(ws&&(ws.readyState===1||ws.readyState===0))return ws;wsQueue=wsQueue||[];try{ws=new WebSocket(wsUrl());}catch{toast('Serveur injoignable — lance start-backend.bat',false);return null;}
ws.onopen=()=>{const q=wsQueue;wsQueue=[];q.forEach(s=>{try{ws.send(s);}catch{}});};
ws.onclose=()=>{const hadRoom=!!myRoomCode;$('online-status-line').textContent='Déconnecté du serveur';$('conn-label').textContent='Déconnecté';if(hadRoom&&gameMode==='online')toast('Connexion perdue — rouvre la page ou recrée une salle',false);ws=null;};
ws.onerror=()=>{toast('Erreur réseau — vérifie start-backend.bat',false);};
ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch{return;}
if(m.t==='created'){myRoomCode=m.code;$('my-room-code').textContent=myRoomCode;$('oi-room-code').textContent=myRoomCode;$('online-status-line').textContent='Salle créée — attends adversaire';$('conn-label').textContent='Connecté (Blancs)';myColor='w';if(m.time!=null)initOnlineClocks(m.time);}
if(m.t==='joined'||m.t==='start'){if(m.code)myRoomCode=m.code;if(m.fen){try{chess=new Chess(m.fen);}catch{}}moveAnns=[];evalHistory=[];lastMove=null;analSeq++;navReset();if(m.color)myColor=m.color;if(m.time!=null)initOnlineClocks(m.time);$('online-status-line').textContent='Partie lancée !';$('conn-label').textContent='Connecté ('+(myColor==='w'?'Blancs':'Noirs')+')';updateAll();}
if(m.t==='move'){if(m.fen&&m.fen===chess.fen())return;applyRemoteMove(m);}
if(m.t==='chat')addChatMsg(m.from+': '+m.text);
if(m.t==='resign'){showGameOver('Abandon adverse','Tu gagnes.','');toast('Adversaire a abandonné',true);}
if(m.t==='draw_offer'){confirmModal('Nulle proposée','Adversaire propose la nulle. Accepter ?').then(ok=>{if(ok){wsSend({t:'draw_accept'});stopClock();showGameOver('Nulle acceptée','Partie nulle','');recordResult('draw');}else wsSend({t:'draw_decline'});});}
if(m.t==='draw_accept'){showGameOver('Nulle acceptée','Partie nulle','');toast('Nulle acceptée',true);}
if(m.t==='draw_decline'){toast('Nulle refusée',false);}
if(m.t==='rematch_offer'){confirmModal('Revanche ?','Adversaire demande une revanche.').then(ok=>{if(ok)wsSend({t:'rematch_accept'});});}
if(m.t==='rematch_reset'){startGame('online');if(m.time!=null)initOnlineClocks(m.time);toast('Revanche — nouvelle partie !',true);}
if(m.t==='error'){$('online-status-line').textContent='Online: '+m.error;toast(m.error,false);}};return ws;}
let lastRoomAt=0;
function roomGuard(){const now=Date.now();if(now-lastRoomAt<2000){toast('Patience — connexion en cours…',false);return false;}lastRoomAt=now;return true;}
window.createRoom=function(){if(!roomGuard())return;startGame('online');const t=parseInt(($('time-sel')||{}).value)||0;wsSend({t:'create',time:t});$('online-status-line').textContent='Connexion au serveur…';};
window.joinRoom=function(){const c=$('join-code-input').value.trim().toUpperCase();if(!c){toast('Entre un code de salon',false);return;}if(!roomGuard())return;startGame('online');wsSend({t:'join',code:c});$('online-status-line').textContent='Connexion à '+c+'…';};
window.copyRoomCode=function(){if(!myRoomCode){toast('Pas encore de code',false);return;}try{navigator.clipboard.writeText(myRoomCode);toast('Code copié : '+myRoomCode,true);}catch{toast('Copie impossible : '+myRoomCode,false);}};
// ---------- Divers ----------
let currentTheme='dark',blindfold=false,miniMode=false,hintLoading=false;
function applyTheme(t){currentTheme=t;document.body.classList.toggle('theme-light',t==='light');applyThemeIcon();}
window.toggleTheme=function(){applyTheme(currentTheme==='dark'?'light':'dark');try{localStorage.setItem('cm_theme',currentTheme);}catch{}};
function loadTheme(){try{const s=localStorage.getItem('cm_theme');if(s)applyTheme(s);}catch{}}
window.toggleMoreMenu=function(){const m=$('more-menu');m.style.display=m.style.display==='none'?'block':'none';};
document.addEventListener('click',e=>{const m=$('more-menu'),b=$('more-btn');if(m&&m.style.display==='block'&&!m.contains(e.target)&&e.target!==b&&!b.contains(e.target))m.style.display='none';});
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;if(!$('game-screen').classList.contains('active'))return;if(e.key==='ArrowLeft')navPrev();else if(e.key==='ArrowRight')navNext();else if(e.key==='ArrowUp')navGo(0);else if(e.key==='ArrowDown')navGoEnd();else if((e.key==='f'||e.key==='F')&&!e.ctrlKey)flipBoard();else if((e.key==='z'||e.key==='Z')&&e.ctrlKey){e.preventDefault();undoLast();}});
window.toggleBlindFold=function(){blindfold=!blindfold;document.body.classList.toggle('blindfold',blindfold);const b=$('blindfold-btn');if(b)b.style.color=blindfold?'var(--gold)':'';addChatMsg(blindfold?'Mode Blindfold actif — pièces masquées.':'Mode Blindfold désactivé.');};
window.toggleMiniMode=function(){miniMode=!miniMode;document.body.classList.toggle('mini-mode',miniMode);const b=$('mini-btn');if(b)b.style.color=miniMode?'var(--gold)':'';};
window.copyBoardSVG=function(){const b=chess.board(),sq=60,size=sq*8,L=['<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'">'];for(let r=0;r<8;r++)for(let f=0;f<8;f++){const ri=boardFlipped?7-r:r,fi=boardFlipped?7-f:f,light=(ri+fi)%2===0;L.push('<rect x="'+(f*sq)+'" y="'+(r*sq)+'" width="'+sq+'" height="'+sq+'" fill="'+(light?'#eee8d5':'#739556')+'"/>');const p=b[ri][fi];if(p){const s=SYM[(p.color==='w'?'w':'b')+p.type.toUpperCase()]||'';L.push('<text x="'+(f*sq+sq/2)+'" y="'+(r*sq+sq/2+2)+'" text-anchor="middle" dominant-baseline="middle" font-size="'+(sq*0.68)+'" fill="'+(p.color==='w'?'#fff':'#1a1a18')+'" font-family="serif">'+s+'</text>');}}L.push('</svg>');const svg=L.join('\n');const fl=$('copy-flash');if(fl){fl.className='copy-flash go';setTimeout(()=>fl.className='copy-flash',400);}try{navigator.clipboard.writeText(svg).then(()=>addChatMsg('Plateau copié en SVG !'));}catch{addChatMsg('Copie SVG impossible.');}};
window.importPGN=function(){$('pgn-file-input').click();};
window.handlePGNFile=function(e){const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const c=new Chess();if(!c.load_pgn(rd.result))throw 0;chess=c;moveAnns=[];evalHistory=[];lastMove=null;analSeq++;resetAnalysisPane();updateAll();addChatMsg('PGN importé — '+chess.history().length+' coups chargés.');}catch{addChatMsg('PGN invalide.');}};rd.readAsText(f);e.target.value='';};
// ---------- Mode cheat / indices (comme indices.js original, sans token en local) ----------
function hintStatus(t){$('hint-status').textContent=t;}
window.hintClear=function(){document.querySelectorAll('.sq').forEach(el=>{el.style.outline='';});$('hint-moves').innerHTML='';hintStatus('Prêt.');};
async function hintCall(n){if(chess.game_over())throw new Error('Partie terminée');const r=await api('/api/analyse',{fen:chess.fen(),movetime:1000,multipv:n});if(!r.ok||!r.lines.length)throw new Error('Aucun coup');return r.lines.map(l=>{const u=l.pv&&l.pv[0];return u?{from:u.slice(0,2),to:u.slice(2,4),score:l.score}:null;}).filter(Boolean);}
function hintHL(from,to,color){document.querySelectorAll('.sq').forEach(el=>{if(el.dataset.sq===from||el.dataset.sq===to){el.style.outline='3px solid '+color;el.style.outlineOffset='-3px';}});}
window.hintBestMove=async function(){if(hintLoading)return;hintClear();hintStatus('Stockfish analyse...');hintLoading=true;try{const m=await hintCall(1);hintLoading=false;if(!m.length){hintStatus('Aucun coup.');return;}hintHL(m[0].from,m[0].to,'rgba(201,162,39,0.85)');hintStatus('Meilleur: '+m[0].from+'-'+m[0].to+' ('+(m[0].score>=0?'+':'')+(m[0].score/100).toFixed(2)+')');}catch(e){hintLoading=false;hintStatus('Erreur: '+e.message);}};
window.hintTop3=async function(){if(hintLoading)return;hintClear();hintStatus('Top 3 en cours...');hintLoading=true;try{const m=await hintCall(3);hintLoading=false;const cols=['rgba(201,162,39,0.85)','rgba(64,200,200,0.85)','rgba(200,64,64,0.85)'];m.slice(0,3).forEach((x,i)=>{hintHL(x.from,x.to,cols[i]);const d=document.createElement('div');d.style.cssText='display:flex;gap:8px;font-size:.72rem;color:var(--text2)';d.innerHTML='<span><b>'+(i+1)+'. '+x.from+'-'+x.to+'</b></span><span style="margin-left:auto;color:'+(x.score>=0?'var(--green)':'var(--red2)')+'">'+(x.score>=0?'+':'')+(x.score/100).toFixed(2)+'</span>';$('hint-moves').appendChild(d);});hintStatus(m.length+' coups analysés');}catch(e){hintLoading=false;hintStatus('Erreur: '+e.message);}};
window.cheatClear=function(){};
async function health(){try{const h=await api('/api/health');$('engine-badge').textContent='Stockfish doux ×2 · prêt';$('engine-status').textContent='GAME T'+h.game.threads+'/H'+h.game.hash+' · ANAL T'+h.anal.threads+'/H'+h.anal.hash;const he=$('hero-engine');if(he)he.textContent='Moteurs prêts · GAME T'+h.game.threads+' / ANAL T'+h.anal.threads;const ed=$('engine-detail');if(ed)ed.textContent='En ligne : calcul T'+h.game.threads+'/H'+h.game.hash+' · analyse T'+h.anal.threads+'/H'+h.anal.hash+' — niveaux Elo 800 à 2400.';}catch{$('engine-badge').textContent='backend coupé — lance start-backend.bat';const he=$('hero-engine');if(he)he.textContent='Backend injoignable — lance start-all.bat';const ed=$('engine-detail');if(ed)ed.textContent='Backend injoignable.';}}
// ---------- Features poussées ----------
let accW=[],accB=[],sess={p:0,w:0,d:0},autoFlip=false;
function updateCaptured(){const b=chess.board();const start={p:8,n:2,b:2,r:2,q:1};const cur={w:{p:0,n:0,b:0,r:0,q:0},b:{p:0,n:0,b:0,r:0,q:0}};b.forEach(r=>r.forEach(p=>{if(p&&p.type!=='k')cur[p.color][p.type]++;}));const miss={w:[],b:[]};Object.keys(start).forEach(t=>{for(let i=0;i<start[t]-cur.w[t];i++)miss.w.push(t);for(let i=0;i<start[t]-cur.b[t];i++)miss.b.push(t);});
const S={p:'♟',n:'♞',b:'♝',r:'♜',q:'♛'};const V={p:1,n:3,b:3,r:5,q:9};
const scoW=miss.b.reduce((a,t)=>a+V[t],0),scoB=miss.w.reduce((a,t)=>a+V[t],0);
$('cap-white').textContent=miss.w.map(t=>S[t]).join(' ')||'—';$('cap-black').textContent=miss.b.map(t=>S[t]).join(' ')||'—';
$('adv-white').textContent=scoW-scoB>0?'+'+(scoW-scoB):'';$('adv-black').textContent=scoB-scoW>0?'+'+(scoB-scoW):'';}
function pushAccuracy(color,v){(color==='w'?accW:accB).push(v);let box=$('acc-section');if(!box){const p=document.createElement('div');p.className='panel';p.id='acc-section';p.innerHTML='<div class="section-label">Précision en direct</div><div class="acc-row"><div class="acc-pill">Blancs<div class="av c-green" id="acc-w">—</div></div><div class="acc-pill">Noirs<div class="av c-green" id="acc-b">—</div></div></div>';document.querySelector('.left-panel').appendChild(p);box=p;}box.style.display='block';const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):null;const aw=avg(accW),ab=avg(accB);const w=$('acc-w'),bb=$('acc-b');if(w&&aw!=null){w.textContent=aw+'%';w.className='av '+(aw>=85?'c-green':aw>=65?'c-gold':'c-red');}if(bb&&ab!=null){bb.textContent=ab+'%';bb.className='av '+(ab>=85?'c-green':ab>=65?'c-gold':'c-red');}}
function loadSess(){try{const s=JSON.parse(localStorage.getItem('cm_sess')||'{}');sess.p=s.p||0;sess.w=s.w||0;sess.d=s.d||0;}catch{}renderSess();}
function renderSess(){let box=$('sess-box');if(!box){const p=document.createElement('div');p.className='panel';p.id='sess-box';p.innerHTML='<div class="section-label">Session</div><div class="acc-row"><div class="acc-pill">Parties<div class="av" id="sess-p">0</div></div><div class="acc-pill">Victoires<div class="av c-green" id="sess-w">0</div></div><div class="acc-pill">Nulles<div class="av c-gold" id="sess-d">0</div></div></div>';document.querySelector('.left-panel').appendChild(p);box=p;}$('sess-p').textContent=sess.p;$('sess-w').textContent=sess.w;$('sess-d').textContent=sess.d;}
function recordResult(r){sess.p++;if(r==='win')sess.w++;if(r==='draw')sess.d++;try{localStorage.setItem('cm_sess',JSON.stringify(sess));}catch{}renderSess();}
function updateThreat(){let bar=$('threat-bar');if(!bar){const p=document.createElement('div');p.className='panel';p.innerHTML='<div class="threat-bar" id="threat-bar"></div>';document.querySelector('.right-panel').insertBefore(p,document.querySelector('.right-panel').firstChild);bar=$('threat-bar');}if(chess.game_over()){bar.className='threat-bar';return;}if(chess.in_check()){bar.className='threat-bar show';bar.innerHTML='<strong>Échec !</strong> Le roi est attaqué.';return;}const caps=chess.moves({verbose:true}).filter(m=>m.captured);if(caps.length){const V={q:9,r:5,b:3,n:3,p:1};const best=caps.reduce((a,b)=>(V[b.captured]||0)>(V[a.captured]||0)?b:a);if((V[best.captured]||0)>=3){const N={q:'Dame',r:'Tour',b:'Fou',n:'Cavalier',p:'Pion'};bar.className='threat-bar show';bar.innerHTML='Capture possible : <strong>'+N[best.captured]+'</strong> en '+best.to+'.';return;}}bar.className='threat-bar';}
function checkAutoFlip(){if(!autoFlip||gameMode!=='local')return;const t=chess.turn();if(t==='w'&&boardFlipped){boardFlipped=false;buildBoard();render();}else if(t==='b'&&!boardFlipped){boardFlipped=true;buildBoard();render();}}
const _updateAll=updateAll;updateAll=function(){_updateAll();updateCaptured();updateThreat();};
const _showGameOver=showGameOver;showGameOver=function(i,t,s){_showGameOver(i,t,s);if(/Victoire/.test(t||'')||/mat/i.test(t||''))recordResult('win');else if(/Nulle|Pat|Temps/.test(t||''))recordResult('draw');};
window.exportPGN=function(){const d=new Date().toISOString().slice(0,10);const pgn='[Event "ChessMaster Local"]\n[Date "'+d+'"]\n[White "'+$('name-white').textContent+'"]\n[Black "'+$('name-black').textContent+'"]\n[Result "*"]\n\n'+chess.pgn()+' *';try{navigator.clipboard.writeText(pgn);}catch{const el=$('engine-status');if(el)el.textContent='✓ PGN copié !';}};
// init
document.body.dataset.board=document.body.dataset.board||'classic';
applyPersist();buildBoard();buildPalette();render();initClocks();updateAll();loadTheme();loadSess();upgradeIcons();applySoundIcon();
try{const bt=localStorage.getItem('cm_board');if(bt){document.body.dataset.board=bt;const s=$('board-theme-sel');if(s)s.value=bt;}}catch{}
const bts=$('board-theme-sel');if(bts)bts.onchange=e=>setBoardTheme(e.target.value);
const hsb=$('home-sound-btn');if(hsb)hsb.textContent='Son : '+(soundOn?'oui':'non');
setDifficulty(currentDiff);
document.querySelectorAll('.time-btn').forEach(b=>b.classList.toggle('active',b.dataset.tc===currentTC));
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const more=$('more-menu');if(more&&more.style.display==='block'){more.style.display='none';return;}
const cf=$('confirm-modal');if(cf&&cf.classList.contains('open')){if(confirmResolve)confirmResolve();else cf.classList.remove('open');return;}
if($('settings-modal').classList.contains('open')){closeSettings();return;}
if($('shortcuts-modal').classList.contains('open')){closeShortcuts();return;}
if($('summary-overlay').classList.contains('open')){closeSummary();return;}
if($('gameover-overlay').classList.contains('open')){closeGameOver();return;}
if(draw.active){drawCancel();return;}
const k=viewDrawKey();const cur=drawStore.get(k);if(cur&&(cur.arrows.length||cur.hls.length)){cur.arrows=[];cur.hls=[];redrawDrawings();}});
document.querySelectorAll('#shortcuts-modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeShortcuts();}));
document.querySelectorAll('#settings-modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeSettings();}));
buildLandingBoard();syncSettingsUI();
health();setInterval(health,15000);
window.chessRef=()=>chess;
})();
