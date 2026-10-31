"use strict";
// ============ Xứ Sở Thần Tiên · bản thử Mở đầu + Vùng 1 ============
// ---------- assets ----------
const NAMES = ["BG_FAR_01","BG_FAR_03","BG_MID_01","BG_MID_02","BG_MID_03","BG_MID_04","BG_MID_05","FG_02_blur","FG_03_blur","LANDMARK","PROP_HUT","PROP_LOG",
 "pw_leg_a","pw_leg_b","pw_torso","pw_crown","pw_arm_a","pw_arm_b",
 "palm_0","palm_1","palm_2","palm_3","palm_4","palm_5","palm_6","palm_7","palm_8","palm_9",
 "kit_0","kit_1","kit_2","kit_3","kit_4","kit_5","kit_6","kit_7","kit_8","kit_9",
 "fruit_l","fruit_m","fruit_s","fruit_crack","cart_body","cart_wheel",
 "hat_0","hat_1","hat_2","hat_3","hat_4","hat_5","hat_6",
 "grass_0","grass_1","grass_2","grass_3","grass_4","grass_5","grass_6","grass_7","grass_8","grass_9",
 "crate_0","crate_1","crate_2","crate_put","jar_0","jar_1","jar_2","HOUSE","V00_MID_01","V00_MID_02","V00_FG_01","MENU_MID","V01_CANAL","V01_VIEW","palm_ladder","sky_1","sky_2","sky_3"]
 .concat(Object.keys(window.SPR));
const IMG = {};
const loadmsg = document.getElementById("loadmsg");
function loadAll(){
  let n=0;
  return Promise.all(NAMES.map(k=>new Promise(res=>{const im=new Image();
    im.onload=()=>{IMG[k]=im;n++;loadmsg.textContent=`Đang tải ${n}/${NAMES.length}`;res();};
    im.onerror=()=>{n++;res();}; im.src="a/"+k+".webp";})));
}
function tinted(img,color){const c=document.createElement("canvas");c.width=img.width;c.height=img.height;const x=c.getContext("2d");x.drawImage(img,0,0);x.globalCompositeOperation="source-in";x.fillStyle=color;x.fillRect(0,0,c.width,c.height);return c;}

// ---------- utils ----------
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, damp=(a,b,r,dt)=>a+(b-a)*(1-Math.exp(-r*dt));
let seed=7; const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
const R=(a,b)=>a+Math.random()*(b-a);
function mixHex(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const A=p(a),B=p(b);return "#"+A.map((v,i)=>Math.round(lerp(v,B[i],t)).toString(16).padStart(2,"0")).join("");}
function rgba(hex,a){const v=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));return `rgba(${v[0]},${v[1]},${v[2]},${a})`;}

// ---------- canvas ----------
const cv=document.getElementById("g"), ctx=cv.getContext("2d");
let W=0,H=0,DPR=1,S=1,VW=0,VH=430;
function resize(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;VH=Math.max(430,Math.min(760,440*H/Math.max(1,W)));S=H*DPR/VH;VW=W*DPR/S;}
addEventListener("resize",resize); resize();

// ---------- input ----------
const key={l:0,r:0,j:0,a:0}; let jumpBuf=0, anyKey=0;
const KM={ArrowLeft:"l",KeyA:"l",ArrowRight:"r",KeyD:"r",Space:"j",ArrowUp:"j",KeyW:"j",ShiftLeft:"a",ShiftRight:"a",KeyE:"a",KeyF:"a"};
addEventListener("keydown",e=>{const k=KM[e.code];if(!k)return;if(started)e.preventDefault();if(k==="j"&&!key.j)jumpBuf=0.14;key[k]=1;anyKey=1;});
addEventListener("keyup",e=>{const k=KM[e.code];if(k)key[k]=0;});
if(matchMedia("(pointer:coarse)").matches) document.getElementById("touch").style.display="flex";
[["tl","l"],["tr","r"],["tj","j"],["ta","a"]].forEach(([id,k])=>{const b=document.getElementById(id);
  const on=e=>{e.preventDefault();if(k==="j"&&!key.j)jumpBuf=0.14;key[k]=1;anyKey=1;b.classList.add("on");},off=e=>{e.preventDefault();key[k]=0;b.classList.remove("on");};
  b.addEventListener("pointerdown",on);b.addEventListener("pointerup",off);b.addEventListener("pointercancel",off);b.addEventListener("pointerleave",off);});

// ---------- audio: synth ambience + optional music files ----------
let AC=null, master=null, cricketG=null, windG=null;
function noiseBuf(sec){const b=AC.createBuffer(1,AC.sampleRate*sec,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b;}
function audioStart(){
  if(AC)return; try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  master=AC.createGain();master.gain.value=0.7;master.connect(AC.destination);
  const n=AC.createBufferSource();n.buffer=noiseBuf(4);n.loop=true;const lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=380;
  windG=AC.createGain();windG.gain.value=0.1;n.connect(lp);lp.connect(windG);windG.connect(master);n.start();
  const lfo=AC.createOscillator();lfo.frequency.value=0.07;const lg=AC.createGain();lg.gain.value=160;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
  cricketG=AC.createGain();cricketG.gain.value=0;cricketG.connect(master);
}
function sfx(type,vol=1){
  if(!AC)return;const t=AC.currentTime;const g=AC.createGain();g.connect(master);
  if(type==="step"){const s=AC.createBufferSource();s.buffer=noiseBuf(0.08);const f=AC.createBiquadFilter();f.type="bandpass";f.frequency.value=1800+Math.random()*900;f.Q.value=1.2;s.connect(f);f.connect(g);g.gain.setValueAtTime(0.05*vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.07);s.start(t);}
  else if(type==="thud"||type==="boom"){const o=AC.createOscillator();const big=type==="boom";o.frequency.setValueAtTime(big?70:140,t);o.frequency.exponentialRampToValueAtTime(big?28:55,t+(big?0.9:0.25));o.connect(g);g.gain.setValueAtTime((big?0.9:0.25)*vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+(big?1.2:0.3));o.start(t);o.stop(t+1.3);
    const s=AC.createBufferSource();s.buffer=noiseBuf(0.5);const f=AC.createBiquadFilter();f.type="lowpass";f.frequency.value=big?500:900;const g2=AC.createGain();s.connect(f);f.connect(g2);g2.connect(master);g2.gain.setValueAtTime((big?0.5:0.12)*vol,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.4);s.start(t);}
  else if(type==="splash"){const s=AC.createBufferSource();s.buffer=noiseBuf(0.8);const f=AC.createBiquadFilter();f.type="bandpass";f.frequency.value=900;f.Q.value=0.6;s.connect(f);f.connect(g);g.gain.setValueAtTime(0.35*vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.7);s.start(t);}
  else if(type==="rumble"){const s=AC.createBufferSource();s.buffer=noiseBuf(2);const f=AC.createBiquadFilter();f.type="lowpass";f.frequency.value=110;s.connect(f);f.connect(g);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.6*vol,t+1.3);g.gain.exponentialRampToValueAtTime(0.001,t+1.8);s.start(t);}
  else if(type==="rustle"){const s=AC.createBufferSource();s.buffer=noiseBuf(1.2);const f=AC.createBiquadFilter();f.type="highpass";f.frequency.value=2500;s.connect(f);f.connect(g);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.1*vol,t+0.3);g.gain.exponentialRampToValueAtTime(0.001,t+1.1);s.start(t);}
  else if(type==="glass"){for(let i=0;i<5;i++){const o=AC.createOscillator();o.type="triangle";o.frequency.value=2400+Math.random()*2600;const gg=AC.createGain();o.connect(gg);gg.connect(master);const tt=t+i*0.03;gg.gain.setValueAtTime(0.06*vol,tt);gg.gain.exponentialRampToValueAtTime(0.001,tt+0.35);o.start(tt);o.stop(tt+0.4);}}
  else if(type==="scream"){ // distant child's cry, formant-ish
    const o=AC.createOscillator();o.type="sawtooth";o.frequency.setValueAtTime(820,t);o.frequency.linearRampToValueAtTime(980,t+0.25);o.frequency.exponentialRampToValueAtTime(520,t+1.1);
    const vib=AC.createOscillator();vib.frequency.value=7;const vg=AC.createGain();vg.gain.value=18;vib.connect(vg);vg.connect(o.frequency);
    const f1=AC.createBiquadFilter();f1.type="bandpass";f1.frequency.value=1100;f1.Q.value=4;const f2=AC.createBiquadFilter();f2.type="bandpass";f2.frequency.value=2600;f2.Q.value=6;
    const mix=AC.createGain();o.connect(f1);o.connect(f2);f1.connect(mix);f2.connect(mix);const lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=3000;mix.connect(lp);lp.connect(g);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.32*vol,t+0.06);g.gain.setValueAtTime(0.3*vol,t+0.6);g.gain.exponentialRampToValueAtTime(0.001,t+1.2);
    o.start(t);vib.start(t);o.stop(t+1.25);vib.stop(t+1.25);}
  else if(type==="cricket"){for(let i=0;i<3;i++){const o=AC.createOscillator();o.frequency.value=4300+Math.random()*300;const gg=AC.createGain();o.connect(gg);gg.connect(cricketG);const tt=t+i*0.06;gg.gain.setValueAtTime(0,tt);gg.gain.linearRampToValueAtTime(0.05,tt+0.01);gg.gain.linearRampToValueAtTime(0,tt+0.04);o.start(tt);o.stop(tt+0.05);}}
}
const screamA=new Audio("a/sfx/XS_SFX_SCREAM_01.mp3"); screamA.preload="auto"; screamA.addEventListener("error",()=>{screamA.dead=true;});
let hushT=0;
function playScream(){
  if(!screamA.dead){ screamA.volume=0.8; screamA.currentTime=0; screamA.play().catch(()=>hush()); }
  else hush();
}
function hush(){ // no recording: crickets stop dead, birds burst out of the grass, a soft thud far away
  hushT=3.2; sfx("rustle",1.2); setTimeout(()=>sfx("thud",0.5),180); setTimeout(()=>sfx("rustle",0.7),420);
  for(let i=0;i<9;i++) dust.push({x:GRASS_X+R(-60,60),y:-40-R(0,40),vx:R(-80,120),vy:-R(60,160),life:2.2,s:R(1.5,3),c:0});
}
// music: drop MP3 files in a/music/ with these names; missing files are skipped silently
const MUSIC={menu:"a/music/XS_MUSIC_MENU_01.mp3",journey:"a/music/XS_MUSIC_JOURNEY_01.mp3",rest:"a/music/XS_MUSIC_REST_01.mp3",danger:"a/music/XS_MUSIC_DANGER_01.mp3"};
const tracks={}; let musicWant="menu";
function curMusic(){ if(musicWant==="journey"&&typeof D!=="undefined"&&D&&D.active&&!D.done&&D.musicOn) return "danger"; return musicWant; }
for(const k in MUSIC){const a=new Audio();a.src=MUSIC[k];a.loop=true;a.preload="auto";a.volume=0;a.addEventListener("error",()=>{a.dead=true;});tracks[k]=a;}
function musicTick(dt){ for(const k in tracks){const a=tracks[k]; if(a.dead)continue; const target=(k===curMusic())?(k==="journey"?0.4:k==="danger"?0.7:0.55):0; a.volume=clamp(damp(a.volume,target,1.4,dt),0,1); if(target>0&&a.paused&&a.userOk){a.play().catch(()=>{});} if(target===0&&a.volume<0.01&&!a.paused)a.pause(); } }
function unlockMusic(){ for(const k in tracks){tracks[k].userOk=true;} }
addEventListener("pointerdown",unlockMusic,{once:true}); addEventListener("keydown",unlockMusic,{once:true});

// ---------- sprites ----------
const SPR=window.SPR;
function drawSpr(k,i,x,y,face,alpha=1,glow=null){
  const A=SPR[k], img=IMG[k]; if(!A||!img)return; const f=A.f[Math.max(0,Math.min(A.f.length-1,i|0))]; const s=A.s;
  ctx.save(); ctx.translate(x,y); ctx.scale(face*s,s); ctx.globalAlpha*=alpha;
  if(glow){ctx.shadowColor=glow;ctx.shadowBlur=5*DPR;}
  ctx.drawImage(img,f[0],f[1],f[2],f[3],-f[4],-f[5],f[2],f[3]); ctx.restore();
}
const nFr=k=>SPR[k]?SPR[k].f.length:1;

// ---------- level (WU, y down, ground y=0) ----------
const EO=3420; // the ending encounter sits EO further right than in the first prototype
const END_X=4800+EO, HOME_X=-1440, GRASS_X=-230, JAR_X=-250;
const solids=[ {x0:-2400,x1:700,y0:0}, {x0:700,x1:765,y0:26,shallow:true}, {x0:765,x1:950,y0:0}, {x0:1045,x1:1200,y0:0},
  {x0:1325,x1:1850,y0:0}, {x0:1850,x1:2350,y0:-125}, {x0:2350,x1:2480,y0:0}, {x0:3120,x1:5960,y0:0}, {x0:6900,x1:9800,y0:0} ];
const pits=[{x0:950,x1:1045,w:16},{x0:1200,x1:1325,w:16},{x0:2480,x1:3120,w:16,post:2800},{x0:5960,x1:6900,w:16,marsh:true}];
const shallow={x0:700,x1:765,w:14};
const CPS=[{x:-800},{x:-240},{x:1080},{x:1960},{x:2400},{x:3170},{x:3990},{x:4740},{x:5800},{x:6960},{x:3990+EO}];
const ENC_CP=10;
const HUT={x0:4560,x1:4700,roof:-74};
const TREES=[4120,4290,4460];
let ZOOM=1;
let cart, log, falling, fallen, leaves, trees, intro, cpIndex=0;
function resetLevel(cp){
  cart={x:1560,y:0,w:120,h:44,rot:0}; if(cp>=3) cart.x=1850-120;
  log={x:-99999,y:0,w:200,h:20,state:"ground"};
  falling=[]; fallen=[]; leaves=[];
  trees=TREES.map((x,i)=>({x,next:R(1.2,3.5)+i*0.7,warn:-1,shake:0}));
  D=newDirector(); if(typeof v1Reset==="function") v1Reset();
  return CPS[cp].x;
}

// ---------- intro state machine ----------
// cam_sis → carry → putdown → scream → startle → free run → jar (kneel) → orb leaves → journey
intro={phase:"menu",t:0,sisX:-430,sisMode:"firefly",sisT:0,crate:null,jar:0,orbX:JAR_X,orbY:-40,orbOn:false,scream:false};
function introReset(){ Object.assign(intro,{phase:"cam_sis",t:0,sisX:-430,sisMode:"firefly",sisT:0,crate:null,jar:0,orbX:JAR_X,orbY:-40,orbOn:false,scream:false}); }

// ---------- dressing ----------
function groundTopAt(x){let best=null;for(const s of solids){if(x>=s.x0&&x<s.x1)best=s.y0;} if(typeof pads!=="undefined"){const pd=pads.find(p=>!p.gone&&x>p.x-p.w/2&&x<p.x+p.w/2); if(pd)best=pd.top+pd.sink;}if(log&&log.state==="bridge"&&x>=log.x&&x<=log.x+log.w)best=Math.min(best??0,-20);return best;}
const polyCache=new Map();
function groundPoly(s){ if(polyCache.has(s))return polyCache.get(s); let sd=Math.floor(Math.abs(s.x0)*7+13)%2147483646+1; const r=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
  const pts=[]; const dep=s.y0+900; pts.push([s.x0-1,dep]); for(let y=dep;y>s.y0;y-=10+r()*14){pts.push([s.x0+(y-s.y0<80?r()*5:r()*9),y]);}
  pts.push([s.x0+1,s.y0+1]); for(let x=s.x0+6;x<s.x1-6;x+=12+r()*16){pts.push([x,s.y0+(r()-.5)*1.2]);} pts.push([s.x1-1,s.y0+1]);
  for(let y=s.y0+6;y<dep;y+=10+r()*14){pts.push([s.x1-(y-s.y0<80?r()*5:r()*9),y]);} pts.push([s.x1+1,dep]); polyCache.set(s,pts); return pts; }
const blades=[]; seed=11;
for(const s of solids){if(s.shallow)continue;for(let x=s.x0;x<s.x1;x+=2+rnd()*3)blades.push({x,y:s.y0,h:3+rnd()*rnd()*14,l:(rnd()-.5)*0.6,w:0.8+rnd()*1.4});}
const kitFar=[],kitMid=[]; seed=29;
for(let x=-2400;x<10000;x+=60+rnd()*140) kitFar.push({x,n:"palm_"+Math.floor(rnd()*10),s:0.18+rnd()*0.16,fl:rnd()<.5});
for(let x=-500;x<10000;x+=140+rnd()*260){const p=rnd()<0.75?"palm_"+Math.floor(rnd()*10):"kit_"+Math.floor(rnd()*10);kitMid.push({x,n:p,s:p[0]==="p"?0.42+rnd()*0.28:0.3+rnd()*0.12,fl:rnd()<.5});}
for(let x=-2300;x<-600;x+=260+rnd()*300) kitMid.push({x,n:"palm_"+Math.floor(rnd()*10),s:0.4+rnd()*0.25,fl:rnd()<.5});
const SET=[ {n:"V00_MID_01",x:-1250,h:380,g:0.776},{n:"V00_MID_02",x:-260,h:380,g:0.738},
  {n:"LANDMARK",x:380,h:440,g:0.876},{n:"BG_MID_02",x:1080,h:360,g:0.822},{n:"BG_MID_03",x:1800,h:360,g:0.761},
  {n:"V01_CANAL",x:2800,h:360,g:0.758},{n:"BG_MID_04",x:4300,h:390,g:0.806},{n:"BG_MID_01",x:5300,h:340,g:0.827},{n:"BG_MID_05",x:3900+EO,h:360,g:0.778}];
const MID_GROUND=40;
const FGS=[{n:"FG_03_blur",x:-700},{n:"FG_03_blur",x:420},{n:"FG_02_blur",x:1500},{n:"FG_03_blur",x:2480,fl:true},{n:"FG_02_blur",x:3350,fl:true},{n:"FG_03_blur",x:4300},{n:"FG_02_blur",x:5100},{n:"FG_03_blur",x:6000,fl:true},{n:"FG_02_blur",x:6800},{n:"FG_03_blur",x:7700},{n:"FG_02_blur",x:8500,fl:true}];
// tall grass in the play layer where the sister vanishes, plus scattered tufts
const tufts=[]; seed=77;
for(let i=0;i<9;i++) tufts.push({x:GRASS_X-90+i*24+rnd()*10,n:"grass_"+[1,4,7,1,8,4,1,7,0][i],s:0.55+rnd()*0.3,fl:rnd()<.5,front:true});
for(let x=-2300;x<9600;x+=90+rnd()*220){ if(x>GRASS_X-160&&x<GRASS_X+160)continue; if(pits.some(p=>x>p.x0-20&&x<p.x1+20))continue; tufts.push({x,n:"grass_"+[0,2,3,5,6,8,9][Math.floor(rnd()*7)],s:0.18+rnd()*0.16,fl:rnd()<.5}); }

// fx
let cloudSpr=[], grain=null, mistTex=null, stars=[];
function makeFx(){
  for(let i=0;i<6;i++){const c=document.createElement("canvas");c.width=520;c.height=170;const x=c.getContext("2d");
    for(let k=0;k<26;k++){const cx=60+Math.random()*400,cy=95+(Math.random()-.5)*50,r=26+Math.random()*60;const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,"rgba(255,255,255,.55)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,520,170);}
    cloudSpr.push(c);}
  grain=document.createElement("canvas");grain.width=grain.height=256;const gx=grain.getContext("2d"),id=gx.createImageData(256,256);
  for(let i=0;i<id.data.length;i+=4){const v=Math.random()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=22;}gx.putImageData(id,0,0);
  mistTex=document.createElement("canvas");mistTex.width=1024;mistTex.height=160;const mx=mistTex.getContext("2d");
  for(let k=0;k<90;k++){const cx=Math.random()*1024,cy=80+(Math.random()-.5)*60,r=30+Math.random()*90;for(const dx of[-1024,0,1024]){const g=mx.createRadialGradient(cx+dx,cy,0,cx+dx,cy,r);g.addColorStop(0,"rgba(255,255,255,.16)");g.addColorStop(1,"rgba(255,255,255,0)");mx.fillStyle=g;mx.fillRect(0,0,1024,160);}}
  for(let i=0;i<160;i++)stars.push({x:Math.random(),y:Math.random()*0.55,r:Math.random()<.1?1.4:0.7,tw:Math.random()*6});
}

// ---------- Palm Walker (assembled, dissolving) ----------
const PW={leg_a:{p:[0.6,0.03],e:[0.5,0.98]},leg_b:{p:[0.36,0.03],e:[0.5,0.98]},torso:{p:[0.51,0.97],e:[0.62,0.03]},crown:{p:[0.45,0.96],e:[0.45,0.05]},arm_a:{p:[0.89,0.02],e:[0.3,0.98]},arm_b:{p:[0.2,0.02],e:[0.6,0.98]}};
let pwBuf=null;
function drawBone(c,img,cfg,ax,ay,ang,len){const w=img.width,h=img.height,vx=(cfg.e[0]-cfg.p[0])*w,vy=(cfg.e[1]-cfg.p[1])*h,na=Math.atan2(vy,vx),nl=Math.hypot(vx,vy),s=len/nl;
  c.save();c.translate(ax,ay);c.rotate(ang-na);c.scale(s,s);c.drawImage(img,-cfg.p[0]*w,-cfg.p[1]*h);c.restore();}
function renderWalker(t,step,pose){ // pose: {armA,armB,crown} extra radians (menu puppet twitches)
  pose=pose||{}; const B=pwBuf,c=B.getContext("2d"); c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,B.width,B.height);
  const hipX=B.width*0.5,hipY=B.height-400; const sw=Math.sin(step)*0.16,lift=Math.max(0,Math.sin(step)),lift2=Math.max(0,-Math.sin(step));
  drawBone(c,IMG.pw_leg_b,PW.leg_b,hipX-8,hipY-lift2*24,Math.PI/2-sw,400-lift2*20);
  drawBone(c,IMG.pw_arm_b,PW.arm_b,hipX+30,hipY-180,Math.PI/2+0.15+Math.sin(t*0.7)*0.05+(pose.armB||0),330);
  drawBone(c,IMG.pw_torso,PW.torso,hipX,hipY+6,-Math.PI/2+Math.sin(step*2)*0.02,230);
  drawBone(c,IMG.pw_crown,PW.crown,hipX+12,hipY-220,-Math.PI/2+Math.sin(t*0.9)*0.06+(pose.crown||0),165);
  drawBone(c,IMG.pw_leg_a,PW.leg_a,hipX+8,hipY-lift*24,Math.PI/2+sw,400-lift*20);
  drawBone(c,IMG.pw_arm_a,PW.arm_a,hipX-26,hipY-185,Math.PI/2-0.12+Math.sin(t*0.6+1)*0.05+(pose.armA||0),320);
  return B;
}
function dreamDraw(src,x,y,w,h,t,amt){const strips=Math.max(24,Math.floor(h/7)),sh=src.height/strips,dh=h/strips;
  for(let i=0;i<strips;i++){const yy=i/strips;const off=Math.sin(yy*9+t*1.3)*amt*(0.4+yy*0.6)+Math.sin(yy*31-t*2.1)*amt*0.25;ctx.drawImage(src,0,i*sh,src.width,sh+0.5,x+off,y+i*dh,w,dh+0.6);}}
let shimmer=null;
function shimmerLayer(src,t,col,amt=0.22){ if(!shimmer)shimmer=document.createElement("canvas"); shimmer.width=src.width;shimmer.height=src.height;const c=shimmer.getContext("2d");
  c.drawImage(src,0,0);c.globalCompositeOperation="source-atop";const g=c.createLinearGradient(0,0,0,src.height);const p=(t*0.08)%1;
  for(let i=0;i<=10;i++){const s=(i/10+p)%1;g.addColorStop(i/10,rgba(col,(Math.sin(s*Math.PI*2)*0.5+0.5)*amt));}
  c.fillStyle=g;c.fillRect(0,0,src.width,src.height);c.globalCompositeOperation="source-over";return shimmer;}
const motes=[];

// ---------- player ----------
const pl={x:-800,y:0,vx:0,vy:0,face:-1,ground:true,coyote:0,idle:0,dead:false,deadT:0,deadKind:"",push:null,pull:false,fear:0,hes:0,lookUp:0,sit:0,
  anim:"idle",at:0,lock:null,lockT:0,carry:false,landT:0,stepSnd:0};
let hat=null;
const SPEED=180,G=1000,JV=457;
function rectHit(ax0,ay0,ax1,ay1,bx0,by0,bx1,by1){return ax0<bx1&&ax1>bx0&&ay0<by1&&ay1>by0;}
function allBoxes(){ const b=[{x0:cart.x,x1:cart.x+cart.w,y0:cart.y-cart.h,y1:cart.y,ref:cart},{x0:log.x,x1:log.x+log.w,y0:log.y-log.h,y1:log.y,ref:log}];
  if(intro.crate) b.push({x0:intro.crate.x-12,x1:intro.crate.x+12,y0:-(window.CRATE?CRATE.h:20),y1:0,ref:"crate"}); return b.concat(footRects(), typeof legRects==="function"?legRects().concat(mstepRects()):[]); }
function solidRects(){return solids.map(s=>({x0:s.x0,x1:s.x1,y0:s.y0,y1:3000})).concat(typeof padRects==="function"?padRects():[]);}
function movePushable(o,dx){const nx=o.x+dx;for(const r of solidRects()){if(rectHit(nx,o.y-o.h+1,nx+o.w,o.y-1,r.x0,r.y0,r.x1,r.y1))return 0;} if(o===cart&&nx+o.w>1850)return Math.max(0,1850-o.w-o.x); o.x=nx;return dx;}

function kill(kind){ if(pl.dead)return; pl.dead=true;pl.deadT=0;pl.deadKind=kind;pl.vx*=0.3; pl.lock=null;
  const gt0=groundTopAt(pl.x); pl.landedDead=(kind==="drown"||kind==="exhaust"||!!pl.swim)||(pl.ground&&gt0!=null&&pl.y>=gt0-1); pl.landT2=pl.landedDead?0:-1; if(!pl.landedDead){ pl.vy=Math.min(pl.vy*0.25,-70); pl.vx=pl.vx*0.6+R(-25,25); pl.spin=0; }
  hat={x:pl.x+pl.face*2,y:pl.y-(pl.swim?20:60),vx:(Math.random()-.5)*120+pl.vx*0.4,vy:(kind==="drown"||kind==="exhaust")?-90:-280,r:0,vr:(Math.random()<.5?-1:1)*R(6,11),state:"fly",crushed:false};
  if(kind==="drown")sfx("splash"); else if(kind==="exhaust"){ sfx("splash",0.5); } else sfx("thud",1.4);
  for(let i=0;i<26;i++)dust.push({x:pl.x,y:pl.y-(kind==="drown"?0:30),vx:(Math.random()-.5)*160,vy:-Math.random()*180,life:1,s:1+Math.random()*2.5,c:kind==="drown"?1:0});
}
let deaths=0;
function respawn(){ const cx=resetLevel(cpIndex); Object.assign(pl,{x:cx,y:groundTopAt(cx)??0,vx:0,vy:0,dead:false,face:1,push:null,carry:false,lock:null,anim:"idle",at:0,sit:0,idle:0,swim:null,sta:1,wetT:0,runT:0,onTop:false}); hat=null; fade=1;
  if(cpIndex<=1&&intro.phase!=="journey"){ /* intro passed checkpoint: keep intro props */ }
}

// ---------- particles ----------
const dust=[], flies=[], sisFlies=[];
for(let i=0;i<70;i++)flies.push({x:-2300+Math.random()*11800,y:-20-Math.random()*160,p:Math.random()*9,s:0.6+Math.random()*0.6});
for(let i=0;i<22;i++)sisFlies.push({a:Math.random()*6.28,r:R(14,60),y:R(-80,-20),sp:R(0.3,0.9),p:Math.random()*9});

// ---------- camera ----------
const cam={x:-430,y:-118,shake:0};
let fade=0, started=false, ended=false, T=0, paused=false;

// ---------- falling fruit (random, stays on the ground) ----------
function treeWarn(tr){ if(tr.warn>=0)return; tr.warn=0; tr.dropX=tr.x+R(-26,26); sfx("rustle",Math.max(0.15,1-Math.abs(tr.x-pl.x)/600)); }
function updateFruit(dt){
  for(const tr of trees){
    if(tr.warn<0){ tr.next-=dt; if(tr.next<=0&&Math.abs(tr.x-pl.x)<900) treeWarn(tr); }
    else { tr.warn+=dt; tr.shake=1;
      if(Math.random()<dt*14) leaves.push({x:tr.dropX+R(-30,30),y:-300+R(-30,10),vx:R(-14,14),vy:R(20,45),r:Math.random()*6,vr:R(-3,3),life:2.6});
      if(tr.warn>R(0.95,1.35)){ tr.warn=-1; tr.shake=0; tr.next=R(1.6,4.8); falling.push({x:tr.dropX,y:-300,vy:0,size:Math.random()<0.6?"l":"m",r:0}); } }
  }
  for(let i=falling.length-1;i>=0;i--){ const f=falling[i]; f.vy+=2400*dt; f.y+=f.vy*dt; f.r+=dt*2;
    const h=f.size==="l"?50:34;
    if(!pl.dead&&rectHit(f.x-17,f.y-h*0.7,f.x+17,f.y,pl.x-10,pl.y-62,pl.x+10,pl.y)) { kill("crush"); if(hat&&Math.abs(hat.x-f.x)<30)hat.crushed=true; }
    const roof=(f.x>HUT.x0+10&&f.x<HUT.x1-10)?HUT.roof:null; const floor=roof??(groundTopAt(f.x)??0);
    if(f.y>=floor){ f.y=floor; falling.splice(i,1); sfx("thud",Math.max(0.15,1-Math.abs(f.x-pl.x)/700));
      for(let k=0;k<10;k++)dust.push({x:f.x,y:floor,vx:R(-70,70),vy:-Math.random()*90,life:0.8,s:1+Math.random()*2,c:0});
      cam.shake=Math.max(cam.shake,1.1*Math.max(0,1-Math.abs(f.x-pl.x)/500));
      if(fallen.length>36) fallen.shift();
      if(roof===null) fallen.push({x:f.x,y:floor,kind:Math.random()<0.45?"crack":f.size,flip:Math.random()<.5,rot:R(-0.25,0.25)}); }
  }
  for(let i=leaves.length-1;i>=0;i--){const l=leaves[i];l.life-=dt;l.x+=l.vx*dt+Math.sin(T*3+l.r)*6*dt;l.y+=l.vy*dt;l.r+=l.vr*dt;if(l.life<=0||l.y>2)leaves.splice(i,1);}
}

// ---------- intro update ----------
function updateIntro(dt){
  intro.t+=dt; intro.sisT+=dt;
  const I=intro;
  if(I.phase==="cam_sis"){ if(I.t>4.2){I.phase="carry";I.t=0;} }
  if(I.phase==="carry"){ // sister wanders to the grass while the camera is away
    if(I.t>3&&I.sisMode==="firefly"){I.sisMode="run";}
    if(I.sisMode==="run"){ I.sisX+=58*dt; if(I.sisX>GRASS_X+30){I.sisMode="gone";} }
    if(pl.x<HOME_X+70&&pl.carry&&!pl.lock){ pl.lock="putdown"; pl.lockT=0; pl.vx=0; }
  }
  if(I.phase==="scream"){ if(I.t>0.55&&!I.scream){I.scream=true;playScream();} if(I.t>1.1){I.phase="startle";I.t=0;pl.lock="startle";pl.lockT=0;} }
  if(I.phase==="run"){ if(pl.x>JAR_X-40){ I.phase="jar";I.t=0;pl.lock="kneel";pl.lockT=0;pl.vx=0;pl.face=1; sfx("glass",0.5);} }
  if(I.phase==="jar"){ if(I.t>1.6&&!I.orbOn){I.orbOn=true;} if(I.orbOn){I.orbY=lerp(I.orbY,-90,dt*0.8);I.orbX+=dt*(I.t>3.2?40:6);} }
  if(I.phase==="leave"){ I.orbX+=dt*70; I.orbY=-90+Math.sin(T*1.3)*10; if(I.orbX>pl.x+900){I.phase="journey";} }
  if(I.phase==="journey"){ I.orbX=pl.x+520; }
}

// ---------- main update ----------
function update(dt){
  T+=dt;
  if(!started){ menuUpdate(dt); return; }
  updateIntro(dt); updateFruit(dt); updateDirector(dt); v1Update(dt);
  if(log.state==="ground"&&log.x+log.w>=3798){log.state="tip";sfx("rustle",0.7);}
  if(log.state==="tip"){log.x=damp(log.x,3775,6,dt);if(Math.abs(log.x-3775)<1){log.x=3775;log.state="bridge";sfx("thud",0.8);cam.shake=0.8;}}
  if(ended){ pl.vx=damp(pl.vx,0,4,dt); pl.x+=pl.vx*dt; animate(dt); updateCam(dt); return; }
  if(pl.dead){ pl.deadT+=dt; if(pl.deadKind==="drown"){pl.vy=Math.min(pl.vy+300*dt,60);pl.y+=pl.vy*dt;}
    else if(!pl.landedDead){ // the lifeless body drifts down slowly, like a leaf, before it touches the ground
      pl.vy=Math.min(pl.vy+330*dt,210); pl.vx*=Math.pow(0.6,dt); pl.x+=pl.vx*dt; pl.y+=pl.vy*dt; pl.spin=(pl.spin||0)+dt*1.4;
      const pit=pits.find(q=>pl.x>q.x0+4&&pl.x<q.x1-4);
      if(pit&&pl.y>=pit.w-4){ pl.deadKind="drown"; pl.landedDead=true; pl.landT2=pl.deadT; pl.vy=40; sfx("splash"); }
      else { const gt=groundTopAt(pl.x)??0; if(pl.y>=gt){ pl.y=gt; pl.landedDead=true; pl.landT2=pl.deadT; sfx("thud",0.9); cam.shake=Math.max(cam.shake,1.2);
        for(let i=0;i<18;i++)dust.push({x:pl.x+R(-14,14),y:gt,vx:R(-70,70),vy:-Math.random()*70,life:1,s:1+Math.random()*2,c:0}); } } }
    updateHat(dt);
    const since=pl.landedDead?pl.deadT-pl.landT2:0, hold=pl.deadKind==="exhaust"?2.6:pl.landT2>0?1.9:1.6;
    if(pl.landedDead&&since>hold){ respawn(); deaths++; if(deaths%5===0){ openUI("lost"); fade=0; } }
    fade=pl.landedDead?clamp((since-(hold-0.55))/0.5,0,1):0; animate(dt); updateCam(dt); return; }
  fade=Math.max(0,fade-dt*1.6);
  if(pl.lock==="climbout"){ pl.lockT+=dt; climbUpdate(dt); animate(dt); updateCam(dt); return; }
  if(pl.lock==="ladder"||pl.lock==="top"||pl.lock==="ladderdown"){ jumpBuf-=dt; ladderUpdate(dt); pl.lockT+=dt; animate(dt); updateCam(dt); return; }
  const canMove = intro.phase!=="cam_sis" && !pl.lock;
  const dir = canMove ? (key.r?1:0)-(key.l?1:0) : 0;
  if(pl.swim){ jumpBuf-=dt; swimUpdate(dt,dir); if(!pl.dead){ pl.fear=damp(pl.fear,v1Fear(),3,dt); } animate(dt); updateCam(dt); return; }
  if(canMove&&nearLadder()&&(key.a||(jumpBuf>0&&Math.abs(pl.vx)<40))){ jumpBuf=0; pl.lock="ladder"; pl.lockT=0; pl.vx=0; pl.face=1; animate(dt); updateCam(dt); return; }
  const boxes=allBoxes(); pl.push=null; pl.pull=false;
  const maxSp = pl.carry?78:SPEED; let target=dir*maxSp;
  if(pl.ground&&!pl.carry){ for(const b of boxes){ const o=b.ref; if(o!==cart&&!(o===log&&log.state==="ground"))continue;
      const touchR=Math.abs((pl.x+11)-o.x)<3, touchL=Math.abs((pl.x-11)-(o.x+o.w))<3, vOver=pl.y>o.y-o.h+4&&pl.y-60<o.y; if(!vOver)continue;
      if(dir>0&&touchR){pl.push=o;target=75;} else if(dir<0&&touchL){pl.push=o;target=-75;}
      else if(key.a&&dir<0&&touchR){pl.push=o;pl.pull=true;target=-58;} else if(key.a&&dir>0&&touchL){pl.push=o;pl.pull=true;target=58;} } }
  const acc=pl.ground?(dir===0?1700:1300):800; pl.vx+=clamp(target-pl.vx,-acc*dt,acc*dt);
  if(dir!==0&&!pl.pull)pl.face=dir;
  jumpBuf-=dt; pl.coyote-=dt;
  if(canMove&&jumpBuf>0&&(pl.ground||pl.coyote>0)&&!pl.pull&&!pl.carry){pl.vy=-JV;pl.ground=false;pl.coyote=0;jumpBuf=0;pl.sit=0;pl.idle=0;sfx("step",2);}
  pl.vy+=G*(pl.vy>0?1.28:1)*dt; if(pl.vy>950)pl.vy=950;
  let dx=pl.vx*dt;
  if(pl.push){const m=movePushable(pl.push,dx); if(pl.push===cart)cart.rot+=m/22; if(Math.abs(m)<Math.abs(dx)*0.5&&!pl.pull)dx=m;}
  if(pl.carry&&pl.x+dx>-560) dx=Math.min(dx,-560-pl.x);
  { const bx=encBarrier()-11; if(pl.x+dx>bx) dx=Math.min(dx,Math.max(0,bx-pl.x)); }
  pl.x+=dx;
  const rects=solidRects().concat(allBoxes().filter(b=>!(b.ref===log&&log.state==="tip")));
  for(const r of rects){ if(rectHit(pl.x-11,pl.y-63,pl.x+11,pl.y-1,r.x0,r.y0,r.x1,r.y1)){ if(r.ref&&r.ref===pl.push&&pl.pull)continue;
      if(pl.ground&&r.y0<pl.y&&r.y0>=pl.y-22&&r.ref!==pl.push&&r.ref!=="foot"&&r.ref!==cart&&!(r.ref===log&&log.state==="ground")){ let free=true; for(const q of rects){if(q!==r&&rectHit(pl.x-11,r.y0-63,pl.x+11,r.y0-1,q.x0,q.y0,q.x1,q.y1))free=false;} if(free){pl.y=r.y0;continue;} }
      if(dx>0)pl.x=r.x0-11; else if(dx<0)pl.x=r.x1+11; else pl.x+=(pl.x<(r.x0+r.x1)/2?-1:1); pl.vx=0; } }
  const wasGround=pl.ground, vyB=pl.vy; pl.y+=pl.vy*dt; pl.ground=false;
  for(const r of rects){ if(rectHit(pl.x-10,pl.y-63,pl.x+10,pl.y,r.x0,r.y0,r.x1,r.y1)){ if(pl.vy>=0&&pl.y-pl.vy*dt<=r.y0+2){pl.y=r.y0;pl.vy=0;pl.ground=true;} else if(pl.vy<0){pl.y=r.y1+63;pl.vy=0;} } }
  if(!pl.ground&&wasGround&&pl.vy>=0)pl.coyote=0.1;
  if(pl.ground&&!wasGround){ pl.landT=0.16; sfx("step",2.2); if(vyB>500)for(let i=0;i<8;i++)dust.push({x:pl.x,y:pl.y,vx:R(-60,60),vy:-Math.random()*60,life:0.6,s:1+Math.random(),c:0}); }
  for(const p of pits){ if(pl.x>p.x0+4&&pl.x<p.x1-4&&pl.y>=p.w-2&&!padAt(pl.x)){ enterWater(p); break; } }
  if(pl.y>400)kill("drown");
  if(["run","jar","leave","journey"].includes(intro.phase)) for(let i=CPS.length-1;i>cpIndex;i--){ if(pl.x>=CPS[i].x){cpIndex=i;break;} }
  if(pl.x>END_X&&!ended&&(!D||D.done||!D.active)){ended=true;musicWant="rest";setTimeout(()=>document.getElementById("end").classList.remove("hide"),1400);}
  // emotion inputs
  let fear=0; for(const tr of trees){const d=Math.abs(tr.x-pl.x); if(d<240)fear=Math.max(fear,(1-d/240)*(tr.warn>=0?1:0.45));}
  fear=Math.max(fear,encFear(),v1Fear());
  pl.lookUp=damp(pl.lookUp,(encLookUp()||v1LookUp())?1:0,4,dt);
  if(Math.abs(pl.vx)>125&&pl.ground) pl.runT=(pl.runT||0)+dt; else pl.runT=Math.max(0,(pl.runT||0)-dt*0.6);
  let hes=0; if(pl.ground&&Math.abs(pl.vx)<20){ for(const p of pits){const e=pl.face>0?p.x0:p.x1;const d=(e-pl.x)*pl.face;if(d>0&&d<42)hes=1;} }
  pl.fear=damp(pl.fear,fear,3,dt); pl.hes=damp(pl.hes,hes,5,dt);
  if(pl.ground&&dir===0&&Math.abs(pl.vx)<5&&fear<0.1&&hes<0.1&&!pl.lock&&!pl.carry&&intro.phase==="journey") pl.idle+=dt; else pl.idle=0;
  if(AC){ const prog=clamp((pl.x+800)/(END_X+800),0,1); hushT=Math.max(0,hushT-dt); cricketG.gain.value=hushT>0?0:lerp(0.15,0.6,prog); if(hushT<=0&&Math.random()<dt*(0.6+2*prog))sfx("cricket"); windG.gain.value=0.08+pl.fear*0.05; }
  animate(dt); updateCam(dt);
}
function updateHat(dt){ if(!hat)return; if(hat.state==="fly"){ hat.vy+=900*dt; hat.x+=hat.vx*dt; hat.y+=hat.vy*dt; hat.r+=hat.vr*dt;
    const pit=pits.find(p=>hat.x>p.x0&&hat.x<p.x1); const gt=pit?pit.w:(groundTopAt(hat.x)??0);
    if(hat.y>=gt-1&&hat.vy>0){ hat.y=gt-1; hat.state=pit?"float":"rest"; hat.vx*=pit?0.15:0; } }
  else if(hat.state==="float"){ const p=pits.find(q=>hat.x>q.x0+6&&hat.x<q.x1-6); if(p){hat.x+=(Math.sin(T*0.8)*4+5)*dt; hat.y=p.w-1;} hat.bob=Math.sin(T*2.2)*0.8; } }

// ---------- animation (sprite sheets) ----------
function setAnim(a){ if(pl.anim!==a){pl.anim=a;pl.at=0;} }
function animate(dt){
  pl.at+=dt; pl.landT-=dt;
  if(pl.dead){ setAnim(pl.deadKind==="drown"?"boy_drown":"boy_crush"); return; }
  if(pl.lock&&!["putdown","startle","kneel"].includes(pl.lock)) return;
  if(pl.lock){ pl.lockT+=dt; const k={putdown:"boy_putdown",startle:"boy_startle",kneel:"boy_kneel"}[pl.lock]; setAnim(k);
    const dur=nFr(k)/ (pl.lock==="kneel"?2.6:pl.lock==="startle"?6.5:5);
    if(pl.lockT>=dur){ const was=pl.lock; pl.lock=null; setAnim("boy_idle");
      if(was==="putdown"){ pl.carry=false; intro.crate={x:pl.x+pl.face*(window.CRATE?CRATE.dx:11),flip:pl.face<0}; intro.phase="scream"; intro.t=0; }
      if(was==="startle"){ pl.face=1; intro.phase="run"; intro.t=0; }
      if(was==="kneel"){ intro.phase="leave"; intro.t=0; musicWant="journey"; } }
    return; }
  const sp=Math.abs(pl.vx);
  if(!pl.ground){ setAnim("boy_jump"); return; }
  if(pl.landT>0){ setAnim("boy_land"); return; }
  if(pl.carry){ setAnim(sp>8?"boy_carry":"boy_carry_idle"); return; }
  if(pl.push&&!pl.pull){ setAnim("boy_push"); return; }
  if(pl.pull){ setAnim("boy_pull"); return; }
  if(sp>125){ setAnim("boy_run"); return; }
  if(sp>12){ setAnim("boy_walk"); return; }
  if(pl.idle>8){ setAnim("boy_sit"); return; }
  if(pl.wetT>0){ setAnim("boy_wet"); return; }
  if(pl.runT>7||(pl.sta!=null&&pl.sta<0.55)){ setAnim("boy_tired"); return; }
  if(pl.lookUp>0.5){ setAnim("boy_lookup"); return; }
  if(pl.fear>0.35){ setAnim("boy_fear"); return; }
  if(pl.hes>0.5){ setAnim("boy_edge"); return; }
  setAnim("boy_idle");
}
function boyFrame(){ // returns [sheet, frame]
  const a=pl.anim, t=pl.at, sp=Math.abs(pl.vx);
  switch(a){
    case "boy_jump": { const v=pl.vy; return ["boy_jump", v<-260?2: v<-60?3: v<120?4: 5]; }
    case "boy_land": return ["boy_jump",6];
    case "boy_run": pl.cyc=(pl.cyc||0)+0; return ["boy_run",Math.floor(T*sp/14)%8];
    case "boy_walk": return ["boy_walk",Math.floor(T*sp/8.5)%8];
    case "boy_carry": return ["boy_carry",Math.floor(T*sp/8.5)%8];
    case "boy_carry_idle": return ["boy_carry",0];
    case "boy_push": return ["boy_push",Math.floor(T*7)%8];
    case "boy_pull": return ["boy_pull",Math.floor(T*6)%8];
    case "boy_sit": return ["boy_sit", t<1.6? Math.min(4,Math.floor(t/0.4)) : 4+Math.floor((t-1.6)*1.6)%4];
    case "boy_fear": return ["boy_fear",Math.floor(t*5)%6];
    case "boy_edge": return ["boy_edge",Math.floor(t*4)%6];
    case "boy_lookup": return ["boy_lookup",Math.min(5,Math.floor(t*5))];
    case "boy_crush": if(!pl.landedDead) return ["boy_crush",Math.min(1,Math.floor(t*3))]; return ["boy_crush", pl.landT2>0 ? Math.min(5,2+Math.floor((pl.deadT-pl.landT2)*8)) : Math.min(5,Math.floor(t*9))];
    case "boy_drown": return ["boy_drown",Math.min(5,Math.floor(t*5))];
    case "boy_putdown": return ["boy_putdown",Math.min(5,Math.floor(t*5))];
    case "boy_startle": return ["boy_startle",Math.min(5,Math.floor(t*6.5))];
    case "boy_kneel": return ["boy_kneel",Math.min(5,Math.floor(t*2.6))];
    case "boy_wet": return ["boy_tired",Math.floor(t*7)%3];
    case "boy_tired": return ["boy_tired",3+Math.floor(t*2.5)%3];
    default: return ["boy_idle",Math.floor(t*4.5)%6];
  }
}

function updateCam(dt){
  let tx;
  if(!started){ tx=-430; }
  else if(intro.phase==="cam_sis") tx=intro.t<2.6? -430 : -430;
  else tx=pl.x+pl.face*40+pl.vx*0.25;
  if(intro.phase==="jar"||intro.phase==="leave") tx=lerp(pl.x+60,intro.orbX,0.35);
  cam.x=damp(cam.x,tx,intro.phase==="carry"&&intro.t<2?1.2:2.6,dt);
  if(pl.lock==="top"){ tx=6300; }
  ZOOM=damp(ZOOM,pl.lock==="top"?1.9:1,1.4,dt);
  if(pl.lock==="top"||pl.lock==="ladder") cam.x=damp(cam.x,tx,1.0,dt);
  cam.y=damp(cam.y,(pl.lock==="top"?-200:Math.min(pl.y,0)-118),2.2,dt); cam.shake=damp(cam.shake,0,3.5,dt);
}

// ---------- render helpers ----------
function skyCols(p){const k=clamp((p-0.02)/0.6,0,1);return{top:mixHex("#1a1f29","#05070c",k),mid:mixHex("#3f4249","#141a26",k),hor:mixHex("#8c8476","#3d4655",k),fog:mixHex("#7f7b72","#4b5463",k),glow:mixHex("#e8c991","#c3cfdd",k),night:k};}
function layerT(f,fy){const z=1+(ZOOM-1)*Math.min(1,f),sx=-(cam.x*f)+VW*z/2,sy=-(cam.y*fy)+VH*z*0.5;ctx.setTransform(S/z,0,0,S/z,0,0);ctx.translate(sx+(Math.random()-.5)*cam.shake*f,sy+(Math.random()-.5)*cam.shake*f);}
function fogRect(col,aTop,aBot){ctx.setTransform(S,0,0,S,0,0);const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,rgba(col,aTop));g.addColorStop(1,rgba(col,aBot));ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);}
function drawImgBottom(img,x,y,h,flip,rot=0){if(!img)return;const w=img.width*h/img.height;ctx.save();ctx.translate(x,y);if(rot)ctx.rotate(rot);if(flip)ctx.scale(-1,1);ctx.drawImage(img,-w/2,-h,w,h);ctx.restore();}
let mistTint={c:null,col:""};
function mistTexTint(col){if(mistTint.col===col)return mistTint.c;const c=mistTint.c||document.createElement("canvas");c.width=mistTex.width;c.height=mistTex.height;const x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);x.drawImage(mistTex,0,0);x.globalCompositeOperation="source-in";x.fillStyle=col;x.fillRect(0,0,c.width,c.height);mistTint={c,col};return c;}
function drawMist(col,yS,alpha,speed,scale){ctx.setTransform(S,0,0,S,0,0);ctx.globalAlpha=alpha;const tw=VW*1.2;const off=((T*speed+cam.x*0.2*speed/10)%tw+tw)%tw;const h=70*scale;for(let x=-off-tw;x<VW+tw;x+=tw)ctx.drawImage(mistTexTint(col),x,yS-h/2,tw,h);ctx.globalAlpha=1;}
const tintCache={};
function tintC(spr,col,i){const k=i+col;if(tintCache[k])return tintCache[k];for(const q in tintCache)if(q.startsWith(i+"#"))delete tintCache[q];return tintCache[k]=tinted(spr,col);}
function orb(x,y,s){ctx.save();ctx.globalCompositeOperation="lighter";const r=26*s;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,"rgba(255,232,170,0.95)");g.addColorStop(0.18,"rgba(240,200,121,0.55)");g.addColorStop(1,"rgba(240,200,121,0)");ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();}
function firefly(x,y,a){ if(a<0.03)return; const g=ctx.createRadialGradient(x,y,0,x,y,6); g.addColorStop(0,`rgba(244,220,150,${0.85*a})`); g.addColorStop(1,"rgba(244,220,150,0)"); ctx.fillStyle=g; ctx.fillRect(x-6,y-6,12,12); }

function drawSky(C){
  ctx.setTransform(S,0,0,S,0,0);
  let g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,C.top);g.addColorStop(0.55,C.mid);g.addColorStop(0.86,C.hor);g.addColorStop(1,C.hor);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  if(C.night>0.1){for(const s of stars){ctx.globalAlpha=(C.night-0.1)*(0.5+0.5*Math.sin(T*1.3+s.tw))*0.9;ctx.fillStyle="#e9eef5";ctx.fillRect(s.x*VW,s.y*VH,s.r,s.r);}ctx.globalAlpha=1;}
  const mx=VW*0.72-cam.x*0.01,my=lerp(VH*0.6,VH*0.2,C.night);
  g=ctx.createRadialGradient(mx,my,0,mx,my,180);g.addColorStop(0,rgba(C.glow,0.5));g.addColorStop(1,rgba(C.glow,0));ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle=rgba(C.glow,0.95*(0.25+0.75*moonLit));ctx.beginPath();ctx.arc(mx,my,lerp(16,11,C.night),0,Math.PI*2);ctx.fill(); drawMoonClouds(mx,my,C);
  ctx.save();ctx.globalCompositeOperation="lighter";for(let i=0;i<5;i++){const a=-0.35+i*0.17+Math.sin(T*0.07+i)*0.03;ctx.fillStyle=rgba(C.glow,0.025);ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx+Math.cos(Math.PI/2+a-0.04)*900,my+Math.sin(Math.PI/2+a-0.04)*900);ctx.lineTo(mx+Math.cos(Math.PI/2+a+0.04)*900,my+Math.sin(Math.PI/2+a+0.04)*900);ctx.fill();}ctx.restore();
  for(let i=0;i<9;i++){const spr=cloudSpr[i%cloudSpr.length];const f=0.02+(i%3)*0.015;const w=420+(i%4)*120;const x=((i*313+T*(3+i%3*2)-cam.x*f)%(VW+w*2)+VW+w*2)%(VW+w*2)-w;const y=VH*(0.08+(i%5)*0.07);ctx.globalAlpha=0.35+0.15*(i%2);ctx.drawImage(tintC(spr,C.hor,i),x,y,w,w*0.33);}ctx.globalAlpha=1;
}

// ---------- world render ----------
function render(){
  if(!started){ renderMenu(); return; }
  const prog=clamp((pl.x+1600)/(END_X+1600),0,1), C=skyCols(prog);
  drawSky(C);
  // L0 far
  layerT(0.06,0.05); const farA=IMG.BG_FAR_01, farB=IMG.BG_FAR_03, fh=300;
  if(farA){const fw=farA.width*fh/farA.height;const base=cam.x*0.06;for(let x=Math.floor((base-VW)/fw)*fw;x<base+VW+fw;x+=fw)ctx.drawImage(farA,x-fw/2,90-fh,fw,fh);
    if(farB&&pl.x>600&&pl.x<2600){ctx.globalAlpha=0.9*clamp((pl.x-600)/400,0,1)*(1-clamp((pl.x-1900)/700,0,1));const bw=farB.width*fh/farB.height;ctx.drawImage(farB,1100*0.06-bw/2,90-fh,bw,fh);ctx.globalAlpha=1;}}
  fogRect(C.fog,0.18,0.62); drawMist(C.fog,VH*0.5-cam.y*0.05+40,0.55,6,1.4);
  // L1 far palms + walker
  layerT(0.22,0.2);
  for(const k of kitFar){const lx=k.x*0.22;if(Math.abs(lx-cam.x*0.22)>VW)continue;const im=IMG[k.n];if(im)drawImgBottom(im,lx,80,im.height*k.s*0.55,k.fl);}
  ctx.fillStyle="#000";ctx.fillRect(cam.x*0.22-VW,78,VW*2,400);
  drawWalkerFar(C);
  fogRect(C.fog,0.05,0.45); drawMist(C.fog,VH*0.5-cam.y*0.2+70,0.5,11,1.2);
  // L2 set pieces
  layerT(0.55,0.5);
  for(const s of SET){const img=IMG[s.n];if(!img)continue;const lx=s.x*0.55,h=s.h,w=img.width*h/img.height;if(Math.abs(lx-cam.x*0.55)>VW+w)continue;ctx.drawImage(img,lx-w/2,MID_GROUND-s.g*h,w,h);}
  for(const k of kitMid){const lx=k.x*0.55;if(Math.abs(lx-cam.x*0.55)>VW*0.8)continue;const img=IMG[k.n];if(img)drawImgBottom(img,lx,MID_GROUND+3,img.height*k.s,k.fl);}
  ctx.fillStyle="#000";ctx.fillRect(cam.x*0.55-VW,MID_GROUND,VW*2,600);
  if(intro.phase==="journey"){const ox=intro.orbX*0.55+Math.sin(T*0.7)*20,oy=-70+Math.sin(T*1.1)*12;orb(ox,oy,0.55);}
  fogRect(C.fog,0.06,0.36); drawMist(C.fog,VH*0.5-cam.y*0.5+40,0.45,16,1); drawMist(C.fog,VH*0.5-cam.y*0.8+4,0.4,20,0.9);
  // L3 play
  layerT(1,1); drawPlay(C);
  drawMist(C.fog,VH*0.5-cam.y+14,0.14,26,0.6);
  // L4 foreground
  layerT(1.45,1.3);
  for(const f of FGS){const img=IMG[f.n];if(!img)continue;const lx=f.x*1.45,h=VH*1.05*(f.h||1),w=img.width*h/img.height;if(Math.abs(lx-cam.x*1.45)>VW+w)continue;ctx.save();ctx.translate(lx,0);if(f.fl)ctx.scale(-1,1);if(f.n==="V00_FG_01")ctx.globalAlpha=0.95;ctx.drawImage(img,-w/2,84-h,w,h);ctx.restore();}
  layerT(1.45,1.3); drawEncFG(C);
  // home framing (screen-space so its edges never show)
  const ha=clamp(1-Math.abs(cam.x-(-1250))/650,0,1); const fim=IMG.V00_FG_01;
  if(ha>0&&fim){ ctx.setTransform(S,0,0,S,0,0); const w=VW*1.12, h=Math.max(VH*1.04,w*fim.height/fim.width); ctx.globalAlpha=ha; ctx.drawImage(fim,(VW-w)/2-(cam.x+1250)*0.08,VH-h+6,w,h); ctx.globalAlpha=1; }
  drawV1Screen(C);
  // fireflies
  layerT(0.9,0.9); ctx.globalCompositeOperation="lighter";
  for(const f of flies){const x=f.x*0.9+Math.sin(T*0.6*f.s+f.p)*30,y=f.y+Math.sin(T*0.9*f.s+f.p*2)*14;firefly(x,y,(0.5+0.5*Math.sin(T*2.3*f.s+f.p))*clamp(0.35+C.night*1.2,0,1));}
  ctx.globalCompositeOperation="source-over";
  post();
}
function post(){
  ctx.setTransform(S,0,0,S,0,0);
  const g=ctx.createRadialGradient(VW/2,VH*0.55,VH*0.25,VW/2,VH*0.55,VW*0.75);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,0.78)");ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  ctx.setTransform(1,0,0,1,0,0);const gp=ctx.createPattern(grain,"repeat");ctx.save();ctx.translate(Math.random()*256,Math.random()*256);ctx.fillStyle=gp;ctx.globalCompositeOperation="overlay";ctx.fillRect(-256,-256,cv.width+512,cv.height+512);ctx.restore();
  if(fade>0){ctx.fillStyle=`rgba(3,4,5,${fade})`;ctx.fillRect(0,0,cv.width,cv.height);}
}
function drawWalkerFar(C){
  const vA=clamp((pl.x-1300)/300,0,1)*(1-clamp((pl.x-2500)/250,0,1)), vB=clamp((pl.x-3950)/300,0,1)*(1-clamp((pl.x-4800)/250,0,1)), vis=Math.max(vA,vB); if(vis<=0||!IMG.pw_leg_a)return;
  const base=vA>vB?1700:4400, wx=base+(pl.x-base+250)*0.55+T*6, lx=wx*0.22, step=T*0.55;
  // its steps shake the palms in the grove
  const s=Math.sin(step); if(walkFarPrev<0&&s>=0||walkFarPrev>0&&s<=0){ if(Math.abs(pl.x-4290)<500){cam.shake=Math.max(cam.shake,0.6); for(const tr of trees) if(Math.random()<0.35) treeWarn(tr);} } walkFarPrev=s;
  const src=renderWalker(T,step), sh=shimmerLayer(src,T,C.glow), h=660, w=src.width*h/src.height, y0=84-h-Math.max(0,s)*6;
  ctx.globalAlpha=0.92*vis; dreamDraw(sh,lx-w/2,y0,w,h,T,4); ctx.globalAlpha=1;
  ctx.save();ctx.globalCompositeOperation="lighter";const ex=lx+6,ey=y0+h*0.2+Math.sin(T*0.9)*2,a=vis*(0.35+0.25*Math.sin(T*1.7));for(const dx of[-3,3]){const gg=ctx.createRadialGradient(ex+dx,ey,0,ex+dx,ey,6);gg.addColorStop(0,rgba(C.glow,a));gg.addColorStop(1,rgba(C.glow,0));ctx.fillStyle=gg;ctx.fillRect(ex+dx-6,ey-6,12,12);}ctx.restore();
  if(Math.random()<0.9)for(let i=0;i<2;i++)motes.push({x:lx+(Math.random()-.5)*w*0.6,y:y0+Math.random()*h,vx:R(-2,6),vy:-6-Math.random()*10,life:1,s:0.6+Math.random()*1.2});
  ctx.fillStyle=rgba(C.glow,1);for(let i=motes.length-1;i>=0;i--){const m=motes[i];m.life-=0.008;m.x+=m.vx*0.016;m.y+=m.vy*0.016;if(m.life<=0){motes.splice(i,1);continue;}ctx.globalAlpha=m.life*0.35*vis;ctx.fillRect(m.x,m.y,m.s,m.s);}ctx.globalAlpha=1;
}
let walkFarPrev=0, palmTint=null;

function drawPlay(C){
  const x0=cam.x-VW*ZOOM/2-80,x1=cam.x+VW*ZOOM/2+80;
  drawEncBehind(C);
  ctx.fillStyle="#020203";
  for(const s of solids){if(s.x1<x0||s.x0>x1)continue;const poly=groundPoly(s);ctx.beginPath();poly.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();}
  ctx.beginPath();for(const b of blades){if(b.x<x0||b.x>x1)continue;const sw=Math.sin(T*1.6+b.x*0.05)*1.2*b.h/12;ctx.moveTo(b.x-b.w,b.y+0.5);ctx.lineTo(b.x+b.l*b.h+sw,b.y-b.h);ctx.lineTo(b.x+b.w,b.y+0.5);}ctx.fill();
  for(const t of tufts){ if(t.front||t.x<x0||t.x>x1)continue; const im=IMG[t.n]; if(im) drawImgBottom(im,t.x,2,im.height*t.s,t.fl,Math.sin(T*1.2+t.x)*0.02); }
  drawV1Back(C);
  for(const p of pits){ if(p.post&&p.post>x0&&p.post<x1){ ctx.fillStyle="#030304"; ctx.fillRect(p.post-5,p.w-46,10,80); ctx.fillRect(p.post-8,p.w-48,16,4); } }
  // home
  if(x0<HOME_X+200&&IMG.HOUSE) drawImgBottom(IMG.HOUSE,HOME_X-60,4,175,true);
  if(intro.crate&&IMG.crate_put) drawImgBottom(IMG.crate_put,intro.crate.x,1,window.CRATE?CRATE.h:20,intro.crate.flip);
  if(x1>-1100&&x0<-900&&IMG.crate_put) drawImgBottom(IMG.crate_put,-1000,1,window.CRATE?CRATE.h:20,true);
  // jar
  if(intro.phase!=="cam_sis"&&intro.phase!=="carry"&&intro.sisMode==="gone"){ const im=IMG.jar_2; if(im) drawImgBottom(im,JAR_X,1,13); }
  // sister (behind tall grass)
  drawSister();
  for(const t of tufts){ if(!t.front||t.x<x0||t.x>x1)continue; const im=IMG[t.n]; if(im) drawImgBottom(im,t.x,3,im.height*t.s*0.42,t.fl,Math.sin(T*1.1+t.x*0.3)*0.035); }
  // hut + fruit palms
  if(IMG.PROP_HUT) drawImgBottom(IMG.PROP_HUT,(HUT.x0+HUT.x1)/2,0,132);
  for(const tr of trees){ if(!palmTint)break; const sx=tr.shake?Math.sin(T*40)*1.6:0; ctx.save(); ctx.translate(tr.x+6,4); ctx.rotate(sx*0.004); drawImgBottom(palmTint,0,0,440,(tr.x/10|0)%2===1); ctx.restore(); }
  for(const f of fallen){ const im=f.kind==="crack"?IMG.fruit_crack:f.kind==="l"?IMG.fruit_l:IMG.fruit_m; if(im) drawImgBottom(im,f.x,f.y+2,f.kind==="crack"?22:f.kind==="l"?30:22,f.flip,f.rot); }
  for(const f of falling){ const im=f.size==="l"?IMG.fruit_l:IMG.fruit_m; if(im) drawImgBottom(im,f.x,f.y,f.size==="l"?50:34,false,Math.sin(f.r)*0.2); }
  ctx.fillStyle="#08090a"; for(const l of leaves){ ctx.save(); ctx.translate(l.x,l.y); ctx.rotate(l.r); ctx.globalAlpha=Math.min(1,l.life); ctx.fillRect(-3,-0.7,6,1.4); ctx.restore(); } ctx.globalAlpha=1;
  // cart, log
  if(IMG.cart_body){const bw=cart.w+30;drawImgBottom(IMG.cart_body,cart.x+cart.w/2-14,cart.y-14,bw*IMG.cart_body.height/IMG.cart_body.width);ctx.save();ctx.translate(cart.x+cart.w*0.62,cart.y-20);ctx.rotate(cart.rot);const r=21;ctx.drawImage(IMG.cart_wheel,-r,-r,r*2,r*2);ctx.restore();}
  if(IMG.PROP_LOG){const h=log.w*IMG.PROP_LOG.height/IMG.PROP_LOG.width;ctx.drawImage(IMG.PROP_LOG,log.x-8,log.y-h+3,log.w+16,h);}
  // player (thin moonlight rim so he reads against black shapes)
  const [k,i]=boyFrame(); const glow=rgba(C.glow,0.35);
  if(!drawBoyV1(C,glow)&&!(pl.deadKind==="drown"&&pl.dead&&pl.deadT-(pl.landT2>0?pl.landT2:0)>1.2)) drawSpr(k,i,pl.x,pl.y,pl.face,1,glow);
  // hat after death
  if(hat) drawHat();
  drawEncPlay(C); drawV1Feet(C);
  // pit water
  for(const p of pits.concat([shallow])){ if(p.x1<x0||p.x0>x1)continue; const wy=p.w+Math.sin(T*1.4+p.x0)*0.8; ctx.fillStyle="rgba(2,2,3,0.88)"; if(p!==shallow)ctx.fillRect(p.x0,wy,p.x1-p.x0,900); else ctx.fillRect(p.x0,wy,p.x1-p.x0,26-p.w);
    ctx.strokeStyle=rgba(C.glow,0.35);ctx.lineWidth=0.8;ctx.beginPath();for(let x=p.x0;x<=p.x1;x+=4){const y=wy+Math.sin(x*0.25+T*2.4)*0.5;x===p.x0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke(); ctx.globalAlpha=0.12;ctx.fillStyle=C.glow;ctx.fillRect(p.x0,wy+1,p.x1-p.x0,2);ctx.globalAlpha=1; }
  if(hat&&hat.state==="float") drawHat();
  // intro fireflies + orb
  drawIntroLights();
  // dust
  for(let i=dust.length-1;i>=0;i--){const d=dust[i];d.life-=0.016;d.vy+=(d.c===2?20:300)*0.016;d.x+=d.vx*0.016;d.y+=d.vy*0.016;if(d.life<=0){dust.splice(i,1);continue;}ctx.globalAlpha=Math.min(1,d.life)*(d.c===1?0.6:d.c===2?0.4:0.8);ctx.fillStyle=d.c===1?rgba(C.glow,0.7):d.c===2?rgba(C.fog,1):"#08090a";ctx.fillRect(d.x,d.y,d.s,d.s);}
  ctx.globalAlpha=1;
}
function drawHat(){ const h=hat; let im, ht=12;
  if(h.state==="fly"){ const k=Math.floor((h.r%(Math.PI*2)+Math.PI*2)%(Math.PI*2)/(Math.PI/2)); im=IMG["hat_"+[1,2,3,1][k]]; ht=16; }
  else if(h.state==="rest") im=IMG[h.crushed?"hat_6":"hat_4"];
  else { im=IMG.hat_5; ht=10; }
  if(!im)return; drawImgBottom(im,h.x,h.y+(h.state==="float"?4+(h.bob||0):1),ht,pl.face<0,h.state==="fly"?Math.sin(h.r)*0.3:0); }
function drawSister(){
  const I=intro; if(I.sisMode==="gone")return; const x=I.sisX;
  if(I.sisMode==="firefly") drawSpr("sis_firefly",Math.floor(I.sisT*6)%8,x,0,1,1,"rgba(232,201,145,0.3)");
  else drawSpr("sis_run",Math.floor(I.sisT*11)%8,x,0,1,1,"rgba(232,201,145,0.3)");
}
function drawIntroLights(){
  const I=intro; ctx.save(); ctx.globalCompositeOperation="lighter";
  if(I.sisMode!=="gone"){ for(const f of sisFlies){ const x=I.sisX+Math.cos(f.a+T*f.sp)*f.r, y=f.y+Math.sin(T*f.sp*1.7+f.p)*14; firefly(x,y,0.5+0.5*Math.sin(T*3+f.p)); } orb(I.sisX+60+Math.sin(T*1.5)*10,-62+Math.sin(T*2.1)*8,0.9); }
  if(I.phase==="jar"||I.phase==="leave"){ for(const f of sisFlies){ const k=clamp(I.t/3,0,1); const x=lerp(JAR_X+Math.cos(f.a+T)*8,I.orbX+Math.cos(f.a+T*f.sp)*f.r*0.4,k), y=lerp(-4-Math.random()*4,I.orbY+Math.sin(T*f.sp+f.p)*10,k); firefly(x,y,0.7); } }
  if(I.orbOn||I.phase==="leave") orb(I.orbX,I.orbY,1.1);
  ctx.restore();
}

// ---------- WELCOME SCREEN: puppet-show layers ----------
const menuPalms=[]; seed=303;
for(let i=0;i<11;i++){ const left=i<5; menuPalms.push({x:left?R(-0.05,0.3):R(0.62,1.05),n:"palm_"+[0,1,2,3,5,6,7,8,0,1,3][i],h:R(0.42,0.75),fl:rnd()<.5,ph:rnd()*6,amp:R(0.012,0.03),spd:R(0.4,0.9)}); }
const menuGrass=[]; for(let i=0;i<14;i++) menuGrass.push({x:i/13+R(-0.03,0.03),n:"grass_"+[0,1,2,4,5,7,8][i%7],h:R(0.12,0.24),ph:rnd()*6,fl:rnd()<.5});
let menuTw={next:6,kind:null,t:0};
function menuUpdate(dt){ menuTw.next-=dt; if(menuTw.next<=0&&!menuTw.kind){ menuTw.kind=["armA","crown","armB"][Math.floor(Math.random()*3)]; menuTw.t=0; } if(menuTw.kind){ menuTw.t+=dt; if(menuTw.t>2.4){menuTw.kind=null;menuTw.next=R(12,20);} } }
function stepT(t,fps=8){ return Math.floor(t*fps)/fps; } // puppet-like stepped time
function renderMenu(){
  const C=skyCols(0.75); cam.x=0; cam.y=-118; drawSky(C);
  ctx.setTransform(S,0,0,S,0,0);
  const tq=stepT(T,8), GY=VH*0.8;
  // far mountains
  if(IMG.BG_FAR_01){ const im=IMG.BG_FAR_01, h=VH*0.62, w=im.width*h/im.height; ctx.save(); ctx.translate(Math.sin(tq*0.15)*3,0); for(let x=-w*0.3;x<VW+w;x+=w) ctx.drawImage(im,x,GY-h*0.78,w,h); ctx.restore(); }
  fogRect(C.fog,0.12,0.55); drawMist(C.fog,GY-40,0.5,5,1.4);
  // mid: palms as rod puppets swaying around their base, the Palm Walker hidden among them
  ctx.setTransform(S,0,0,S,0,0);
  const walkerX=VW*0.8, walkerH=VH*0.95;
  const tw=menuTw.kind?Math.sin(Math.min(1,menuTw.t/0.6)*Math.PI/2)*(menuTw.t>1.6?Math.max(0,1-(menuTw.t-1.6)/0.8):1):0;
  const pose={armA:menuTw.kind==="armA"?-0.55*tw:0,armB:menuTw.kind==="armB"?-0.45*tw:0,crown:menuTw.kind==="crown"?-0.28*tw:0};
  if(IMG.pw_leg_a){ const src=renderWalker(tq*0.5,0,pose), sh=shimmerLayer(src,T,C.glow,0.18), w=src.width*walkerH/src.height; ctx.globalAlpha=0.9; dreamDraw(sh,walkerX-w/2,GY+6-walkerH,w,walkerH,tq,3); ctx.globalAlpha=1;
    ctx.save();ctx.globalCompositeOperation="lighter"; const ey=GY+6-walkerH+walkerH*0.2, a=0.25+0.2*Math.sin(T*1.3)+tw*0.4; for(const dx of[-3,3]){const g=ctx.createRadialGradient(walkerX+6+dx,ey,0,walkerX+6+dx,ey,7);g.addColorStop(0,rgba(C.glow,a));g.addColorStop(1,rgba(C.glow,0));ctx.fillStyle=g;ctx.fillRect(walkerX+dx-1,ey-7,14,14);} ctx.restore(); }
  for(const p of menuPalms){ const im=IMG[p.n]; if(!im)continue; const h=VH*p.h, w=im.width*h/im.height; ctx.save(); ctx.translate(p.x*VW,GY+4); ctx.rotate(Math.sin(tq*p.spd+p.ph)*p.amp + (Math.sin(tq*7+p.ph)>0.97?0.02:0)); if(p.fl)ctx.scale(-1,1); ctx.drawImage(im,-w/2,-h,w,h); ctx.restore(); }
  ctx.fillStyle="#020203"; ctx.fillRect(0,GY,VW,VH);
  fogRect(C.fog,0.02,0.22); drawMist(C.fog,GY-6,0.42,12,1);
  ctx.setTransform(S,0,0,S,0,0);
  // boy on the bank, breathing, the light far ahead
  const bx=VW*0.24; drawSpr("boy_menu",Math.floor(tq*2.2)%4,bx,GY,1,1,rgba(C.glow,0.35));
  orb(VW*0.5+Math.sin(T*0.6)*14, GY-VH*0.2+Math.sin(T*0.9)*8, 1.1);
  ctx.globalCompositeOperation="lighter"; for(const f of flies.slice(0,20)){ const x=((f.x+2300)/7400)*VW+Math.sin(T*0.6*f.s+f.p)*20, y=GY-30+f.y*0.6+Math.sin(T*0.9*f.s+f.p*2)*10; firefly(x,y,0.5+0.5*Math.sin(T*2.3*f.s+f.p)); } ctx.globalCompositeOperation="source-over";
  // foreground grass puppets, slightly jittery
  for(const g of menuGrass){ const im=IMG[g.n]; if(!im)continue; const h=VH*g.h, w=im.width*h/im.height; ctx.save(); ctx.translate(g.x*VW,VH+4); ctx.rotate(Math.sin(tq*1.4+g.ph)*0.05); if(g.fl)ctx.scale(-1,1); ctx.drawImage(im,-w/2,-h,w,h); ctx.restore(); }
  post();
}

// ---------- loop ----------
let last=0;
function frame(ts){ const dt=Math.min(0.033,(ts-last)/1000||0.016); last=ts; if(!paused)update(dt); musicTick(dt); render(); requestAnimationFrame(frame); }
function prepare(){
  makeFx(); palmTint=tinted(IMG.palm_8,"#111419");
  pwBuf=document.createElement("canvas"); pwBuf.width=380; pwBuf.height=900;
  cpIndex=0; resetLevel(0);
  Object.assign(pl,{x:-800,y:0,face:-1,carry:true});
}
const startBtn=document.getElementById("start");
loadAll().then(()=>{ prepare(); loadmsg.hidden=true; startBtn.hidden=false; startBtn.focus(); requestAnimationFrame(frame); });
function begin(){ if(started)return; started=true; document.getElementById("title").classList.add("hide"); document.getElementById("pauseBtn").hidden=false; audioStart(); unlockMusic(); musicWant="rest"; introReset(); cam.x=-430; fade=1; setTimeout(()=>{fade=0.9;},10); }
startBtn.addEventListener("click",begin);
addEventListener("keydown",e=>{ if(!started&&!startBtn.hidden&&e.code==="Enter")begin(); });

// ---------- menus ----------
const $=id=>document.getElementById(id);
function anyOpen(){ return ["pause","lost","donate"].some(k=>!$(k).classList.contains("hide")); }
function openUI(id){ $(id).classList.remove("hide"); if(started){paused=true; musicWant="rest"; if(AC&&AC.state==="running")AC.suspend();} }
function closeUI(id){ $(id).classList.add("hide"); if(!anyOpen()&&started&&!ended){ paused=false; musicWant=intro.phase==="journey"?"journey":"rest"; if(AC)AC.resume(); } }
$("pauseBtn").addEventListener("click",()=>openUI("pause"));
addEventListener("keydown",e=>{ if(e.code!=="Escape"&&e.code!=="KeyP")return; if(!$("donate").classList.contains("hide")){closeUI("donate");return;} if(!started||ended)return; if($("pause").classList.contains("hide"))openUI("pause"); else closeUI("pause"); });
$("resume").addEventListener("click",()=>closeUI("pause"));
$("retryCP").addEventListener("click",()=>{ closeUI("pause"); if(intro.phase!=="journey"&&cpIndex===0){ restartAll(); } else respawn(); });
$("retryAll").addEventListener("click",()=>{ closeUI("pause"); restartAll(); });
$("lostRetry").addEventListener("click",()=>closeUI("lost"));
function restartAll(){ cpIndex=0; deaths=0; resetLevel(0); Object.assign(pl,{x:-800,y:0,vx:0,vy:0,face:-1,carry:true,dead:false,lock:null,anim:"idle",at:0}); hat=null; introReset(); cam.x=-430; fade=1; musicWant="rest"; }
$("again").addEventListener("click",()=>{ $("end").classList.add("hide"); ended=false; paused=false; restartAll(); });
document.querySelectorAll(".b-donate").forEach(b=>b.addEventListener("click",()=>openUI("donate")));
$("dn-close").addEventListener("click",()=>closeUI("donate"));
document.querySelectorAll(".b-vlg").forEach(a=>a.addEventListener("click",e=>{ if(window.VLG&&typeof VLG.more==="function"){ e.preventDefault(); VLG.more(); } }));
window.__dbg={pl,cam,intro,setCP:i=>{cpIndex=i;intro.phase=i>=1?"journey":intro.phase;encSave=0;intro.sisMode=i>=1?"gone":intro.sisMode;respawn();},key,begin,D:()=>D};
