"use strict";
// ============ Cuối Vùng 1: Người Thốt Nốt đùa giỡn với cậu bé ============
// Phases: appear → steps → peer → swipe → wander → vanish. Dying in "steps" or "swipe" resumes that phase.
const ENC_PH=["appear","steps","peer","swipe","wander","vanish"];
const ENC_DUR={appear:7,steps:14.5,peer:10,swipe:12,wander:11,vanish:7.5};
const ARENA={x0:3995,x1:4300};
const WARN=1.5, SLAM=0.3, PLANT=1.8, LIFT=0.9;
let D=null, encSave=0;
function newDirector(){
  const resume=(cpIndex===7&&encSave>0);
  return {active:resume,ph:resume?encSave:0,t:0,steps:[],swipes:[],head:{x:0,y:-900,on:false},big:null,fg:null,done:false,musicOn:false,stepIdx:0,swipeIdx:0,lastPh:{}};
}
function stepState(st){ const t=D.t-st.t0; if(t<0)return{y:-900,ph:"wait",k:0};
  if(t<WARN)return{y:-900,ph:"warn",k:t/WARN}; if(t<WARN+SLAM){const k=(t-WARN)/SLAM;return{y:lerp(-900,0,k*k),ph:"slam",k};}
  if(t<WARN+SLAM+PLANT)return{y:0,ph:"plant",k:0}; if(t<WARN+SLAM+PLANT+LIFT){const k=(t-WARN-SLAM-PLANT)/LIFT;return{y:lerp(0,-900,k*k*(3-2*k)),ph:"lift",k};} return{y:-900,ph:"gone",k:0}; }
function footRects(){ const out=[]; if(!D||!D.active)return out; for(const s of D.steps){const st=stepState(s); if(st.y>-120){ out.push({x0:s.x-34,x1:s.x+34,y0:-900,y1:st.y,ref:"foot"}); out.push({x0:s.x-80,x1:s.x+80,y0:st.y-42,y1:st.y,ref:"foot"}); }} return out; }
const phName=()=>ENC_PH[D.ph];
function flick(t,seedK=0){ const q=Math.floor(t*12+seedK*7); const n=Math.sin(q*12.9898+seedK*78.233)*43758.5453; const r=n-Math.floor(n); return r<0.09?0.12:0.6+r*0.4; }
function encFear(){ if(!D||!D.active||D.done)return 0; const p=phName();
  let f={appear:0.45,steps:0.35,peer:0.9,swipe:0.55,wander:0.5,vanish:0.25}[p]||0;
  for(const s of D.steps){const st=stepState(s); if(st.ph==="warn"||st.ph==="slam") f=Math.max(f,1-Math.min(1,Math.abs(s.x-pl.x)/400));}
  for(const s of D.swipes){ if(s.ph==="track"||s.ph==="freeze") f=Math.max(f,0.9); } return f; }
function encLookUp(){ if(!D||!D.active||D.done)return false; const p=phName(); if(p==="peer"&&D.head.on)return true; if(p==="appear"&&D.t>2)return true;
  return D.steps.some(s=>{const st=stepState(s);return (st.ph==="warn"||st.ph==="slam")&&Math.abs(s.x-pl.x)<360;}) || D.swipes.some(s=>s.ph==="track"||s.ph==="freeze"); }

function updateDirector(dt){
  if(!D)return;
  if(!D.active){ if(pl.x>3780&&!pl.dead){ D.active=true; D.ph=0; D.t=0; } else return; }
  if(D.done){ return; }
  D.t+=dt; const p=phName();
  D.musicOn = !(p==="vanish"&&D.t>3);
  // ---- appear: it condenses out of the fog ahead, flickering in many images
  if(p==="appear"){ if(D.ax==null)D.ax=Math.max(4250,pl.x+330); D.big={x:D.ax+Math.sin(D.t*0.3)*20,h:1050,alpha:clamp(D.t/3,0,1),ghosts:3,step:0,layer:"behind"};
    if(D.t<0.1)sfx("rumble",0.6); if(Math.random()<dt*2)sfx("rustle",0.3); }
  // ---- steps: four steps around the boy, the last one aimed right at him
  if(p==="steps"){ D.big=null;
    const plan=[[0.4,170],[3.6,-150],[6.8,120],[10.0,0]];
    while(D.stepIdx<plan.length&&D.t>=plan[D.stepIdx][0]){ let off=plan[D.stepIdx][1]; if(off<0&&pl.x+off<ARENA.x0+30) off=-off+30; if(off>0&&pl.x+off>ARENA.x1-20) off=-off; const tx=clamp(pl.x+off,ARENA.x0+30,ARENA.x1-20); D.steps.push({x:tx,t0:D.t,last:"wait"}); D.stepIdx++; }
    for(const s of D.steps){ const st=stepState(s);
      if(st.ph==="warn"){ if(s.last!=="warn")sfx("rumble",0.9); cam.shake=Math.max(cam.shake,0.3+st.k*0.8); if(Math.random()<0.6)dust.push({x:s.x+R(-110,110),y:-330,vx:R(-10,10),vy:R(40,100),life:2,s:1+Math.random()*1.5,c:2}); }
      if((st.ph==="slam"&&st.y>-70||st.ph==="plant"&&s.last!=="plant")&&!pl.dead&&Math.abs(pl.x-s.x)<86){ kill("crush"); if(hat)hat.crushed=true; encSave=1; }
      if(st.ph==="plant"&&s.last!=="plant"){ sfx("boom"); cam.shake=3.2; for(let k=0;k<40;k++)dust.push({x:s.x+R(-110,110),y:0,vx:R(-190,190),vy:-Math.random()*220,life:1.2,s:1.2+Math.random()*3,c:0}); }
      s.last=st.ph; }
  }
  // ---- peer: it bends down from the sky, its crown hanging over the boy, arms closing around him
  if(p==="peer"){ D.steps=D.steps.filter(s=>stepState(s).ph!=="gone"); const H=D.head; H.on=true;
    const ty = D.t<2.6 ? lerp(-900,-210,easeIO(D.t/2.6)) : D.t<7.6 ? -210+Math.sin(D.t*1.3)*10 : lerp(-210,-950,easeIO((D.t-7.6)/2.4));
    H.y=ty; H.x=damp(H.x||pl.x+60,pl.x+40,0.9,dt);
    if(D.t>2.6&&D.t<2.7)sfx("rustle",0.8); }
  else D.head.on=false;
  // ---- grab: a claw-hand hovers over the boy, follows him playfully, freezes, then snatches
  if(p==="swipe"){ const plan=[0.6,4.4,8.2];
    while(D.swipeIdx<plan.length&&D.t>=plan[D.swipeIdx]){ D.swipes.push({tx:pl.x+R(-60,60),ty:-700,dir:D.swipeIdx%2?1:-1,t0:D.t,ph:"track",alpha:0}); D.swipeIdx++; }
    for(const s of D.swipes){ const t=D.t-s.t0; const TR=1.7, FR=0.6, ST=0.18, HOLD=0.7, RET=0.8;
      if(t<TR){ s.ph="track"; s.alpha=Math.min(1,t/0.5); s.tx=damp(s.tx,pl.x+Math.sin(t*4)*18,2.2,1/30); s.ty=lerp(-700,-140,easeIO(t/0.9))+Math.sin(t*3)*8; if(t<1/25){sfx("rustle",0.9);} }
      else if(t<TR+FR){ if(s.ph!=="freeze"){sfx("rumble",0.5);} s.ph="freeze"; s.ty=-148+Math.sin(t*60)*2; }
      else if(t<TR+FR+ST){ if(s.ph!=="strike")sfx("thud",0.9); s.ph="strike"; const k=(t-TR-FR)/ST; s.ty=lerp(-148,8,k*k);
        if(!pl.dead&&s.ty>-60&&Math.abs(pl.x-s.tx)<84){ kill("crush"); if(hat)hat.crushed=true; encSave=3; } }
      else if(t<TR+FR+ST+HOLD){ if(s.ph!=="hold"){ cam.shake=2.2; for(let k=0;k<26;k++)dust.push({x:s.tx+R(-90,90),y:0,vx:R(-150,150),vy:-Math.random()*160,life:1,s:1+Math.random()*2.5,c:0}); } s.ph="hold"; s.ty=8; }
      else { s.ph="ret"; const k=(t-TR-FR-ST-HOLD)/RET; s.ty=lerp(8,-760,easeIO(k)); s.alpha=Math.max(0,1-k*0.8); } }
  }
  else if(p!=="swipe") D.swipes=[];
  // ---- wander: it strolls around the boy, behind him, then right past the camera
  if(p==="wander"){ if(D.t<6.5){ const k=D.t/6.5; D.big={x:lerp(pl.x+560,pl.x-640,k),h:1000,alpha:0.8,ghosts:2,step:D.t*1.6,layer:"behind"}; D.fg=null; }
    else { D.big=null; const k=(D.t-6.5)/4.5; D.fg={x:lerp(pl.x-900,pl.x+900,k),step:D.t*1.8}; } }
  else D.fg=null;
  // ---- vanish: it stands ahead, then dissolves into mist, the eyes last
  if(p==="vanish"){ if(D.vx==null)D.vx=pl.x+280; D.big={x:D.vx,h:1050,alpha:clamp(1-(D.t-1.2)/4,0,1)*0.85,ghosts:Math.round(clamp(D.t,0,3)),step:0,layer:"behind",dissolve:clamp((D.t-1.2)/4,0,1),eyes:clamp(1-(D.t-5.5)/1.5,0,1)}; }
  // advance
  if(D.t>=ENC_DUR[p]){ if(p==="steps"||p==="swipe"){ /* wait until hazards are over */ }
    D.ph++; D.t=0; D.steps=p==="steps"?[]:D.steps; D.stepIdx=0; D.swipeIdx=0; if(D.ph>=ENC_PH.length){ D.done=true; D.big=null; encSave=0; } }
}
const easeIO=k=>{k=clamp(k,0,1);return k*k*(3-2*k);};
function encBarrier(){ return D&&D.active&&!D.done&&D.ph<4 ? ARENA.x1 : Infinity; }

// ---------- drawing ----------
function drawBigWalker(B,C){
  if(!IMG.pw_leg_a)return; const src=renderWalker(T,B.step||0); const sh=shimmerLayer(src,T,C.glow,0.16); const w=src.width*B.h/src.height, y0=6-B.h;
  for(let g=B.ghosts;g>=1;g--){ ctx.globalAlpha=B.alpha*0.22*flick(T,g); dreamDraw(sh,B.x-w/2+Math.sin(T*1.1+g*2.1)*46*g,y0+Math.sin(T*0.7+g)*8,w*1.02,B.h*1.02,T+g,5); }
  ctx.globalAlpha=B.alpha*flick(T,9)*(B.dissolve?1-B.dissolve*0.6:1); dreamDraw(sh,B.x-w/2,y0,w,B.h,T,3+(B.dissolve||0)*14); ctx.globalAlpha=1;
  const ex=B.x+w*0.02, ey=y0+B.h*0.13, ea=(B.eyes!=null?B.eyes:B.alpha)*(0.5+0.3*Math.sin(T*1.7));
  ctx.save(); ctx.globalCompositeOperation="lighter"; for(const dx of[-5,5]){const g=ctx.createRadialGradient(ex+dx,ey,0,ex+dx,ey,10);g.addColorStop(0,rgba(C.glow,ea));g.addColorStop(1,rgba(C.glow,0));ctx.fillStyle=g;ctx.fillRect(ex+dx-10,ey-10,20,20);} ctx.restore();
  const n=B.dissolve?8:2; ctx.fillStyle=rgba(C.glow,1);
  for(let i=0;i<n;i++) encMotes.push({x:B.x+R(-w*0.3,w*0.3),y:y0+Math.random()*B.h,vx:R(-6,14),vy:-R(8,26),life:1,s:R(0.8,2.2)});
}
const encMotes=[];
function drawEncBehind(C){ // called in the play layer before the ground
  if(!D||!D.active)return;
  if(D.big) drawBigWalker(D.big,C);
  ctx.fillStyle=rgba(C.glow,1); for(let i=encMotes.length-1;i>=0;i--){const m=encMotes[i];m.life-=0.01;m.x+=m.vx*0.016;m.y+=m.vy*0.016;if(m.life<=0){encMotes.splice(i,1);continue;}ctx.globalAlpha=m.life*0.4;ctx.fillRect(m.x,m.y,m.s,m.s);} ctx.globalAlpha=1;
}
let footC=null;
function drawEncPlay(C){ // after the player
  if(!D||!D.active)return;
  for(const s of D.steps){ const st=stepState(s); if(st.y<-880)continue; const img=IMG.pw_leg_a, h=820, w=img.width*h/img.height*0.85;
    if(!footC){footC=document.createElement("canvas");footC.width=img.width;footC.height=img.height;footC.getContext("2d").drawImage(img,0,0);}
    for(let g=2;g>=1;g--){ ctx.globalAlpha=0.18*flick(T,g+s.x); dreamDraw(shimmerLayer(footC,T,C.glow,0.1),s.x-w*0.5+Math.sin(T*2+g)*22*g,st.y-h+6,w,h,T+g,4); }
    ctx.globalAlpha=1; dreamDraw(shimmerLayer(footC,T,C.glow,0.1),s.x-w*0.5,st.y-h+6,w,h,T,st.y>-5?0.6:2.5);
    if(st.ph==="warn"||st.ph==="slam"){ const k=st.ph==="warn"?st.k:1; ctx.globalAlpha=0.4*k; ctx.fillStyle="#000"; ctx.fillRect(s.x-90*k,-2,180*k,3); ctx.globalAlpha=1; } }
  // bending head + arms
  const H=D.head; if(H.on&&H.y>-900&&IMG.pw_crown){ const a=0.85*flick(T,3);
    ctx.save(); ctx.globalAlpha=a;
    drawBone(ctx,IMG.pw_arm_b,PW.arm_b,H.x+150,-980,Math.PI/2-0.32+Math.sin(T*0.8)*0.03,860+H.y*0.15);
    drawBone(ctx,IMG.pw_arm_a,PW.arm_a,H.x-170,-980,Math.PI/2+0.3+Math.sin(T*0.7+1)*0.03,860+H.y*0.15);
    drawBone(ctx,IMG.pw_torso,PW.torso,H.x+10,H.y-560,Math.PI/2+0.05,420);
    drawBone(ctx,IMG.pw_crown,PW.crown,H.x+10,H.y-170,Math.PI/2+Math.sin(T*0.9)*0.08,260);
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation="lighter"; const ey=H.y+40, ea=0.55+0.3*Math.sin(T*2.1); for(const dx of[-9,9]){const g=ctx.createRadialGradient(H.x+10+dx,ey,0,H.x+10+dx,ey,14);g.addColorStop(0,rgba(C.glow,ea));g.addColorStop(1,rgba(C.glow,0));ctx.fillStyle=g;ctx.fillRect(H.x+dx-4,ey-14,28,28);} ctx.restore();
    if(Math.random()<0.6) encMotes.push({x:H.x+R(-120,120),y:H.y+R(-160,60),vx:R(-8,8),vy:-R(6,20),life:1,s:R(0.8,2)}); }
  // grabbing hands (arm comes down from the sky, slightly to the side)
  for(const s of D.swipes){ if(!IMG.pw_arm_a||s.alpha<=0)continue; const L=900, px=s.tx+s.dir*230, ang=Math.atan2(s.ty+L*0.0-(s.ty-L), 0)||Math.PI/2;
    const py=s.ty-Math.sqrt(Math.max(1,L*L-230*230)); const a2=Math.atan2(s.ty-py,s.tx-px);
    for(let g=2;g>=1;g--){ ctx.globalAlpha=s.alpha*0.2*flick(T,g+7); drawBone(ctx,IMG.pw_arm_a,PW.arm_a,px+Math.sin(T*2+g)*24*g,py,a2,L); }
    ctx.globalAlpha=s.alpha*(s.ph==="track"?0.75+0.25*flick(T,4):1); drawBone(ctx,IMG.pw_arm_a,PW.arm_a,px,py,a2,L); ctx.globalAlpha=1;
    if(s.ph==="track"||s.ph==="freeze"){ ctx.globalAlpha=0.35*s.alpha; ctx.fillStyle="#000"; ctx.fillRect(s.tx-80,-2,160,3); ctx.globalAlpha=1; } }
}
function drawEncFG(C){ // giant legs striding past the camera (foreground layer)
  if(!D||!D.fg||!IMG.pw_leg_a)return; const F=D.fg; const src=renderWalker(T,F.step); const h=1800, w=src.width*h/src.height;
  ctx.save(); ctx.globalAlpha=0.92; ctx.drawImage(src,F.x*1.45-w/2,84-h+180,w,h); ctx.restore();
}
