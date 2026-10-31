"use strict";
// ============ Vùng 1 mới: bơi và sức bền, cây ngược gió, bóng dưới trăng, thang lấy nốt + bãi bờ mềm ============
// Loaded after game.js (uses its globals) and before encounter.js.

// ---------- water & stamina ----------
const SWIM_SP=72;
function waterAt(x){ return pits.find(p=>x>p.x0&&x<p.x1)||null; }
function padAt(x){ return pads.find(p=>!p.gone&&x>p.x-p.w/2&&x<p.x+p.w/2)||null; }
function enterWater(W){ pl.swim=W; pl.vy=0; pl.y=W.w; pl.ground=false; pl.vx*=0.4; sfx("splash",0.9);
  for(let i=0;i<16;i++) dust.push({x:pl.x+R(-10,10),y:W.w,vx:R(-60,60),vy:-R(40,160),life:0.9,s:R(1,2.4),c:1}); }
function tryClimb(edgeX,side){
  let top=null; const pad=padAt(edgeX+side*8); if(pad) top=pad.top+pad.sink; else { const g=groundTopAt(edgeX+side*6); if(g!=null) top=g; }
  if(top==null||top<pl.swim.w-40||pl.sta<0.04) return false;
  pl.lock="climbout"; pl.lockT=0; pl.climb={x0:pl.x,x1:edgeX+side*16,yw:pl.swim.w,yt:top}; pl.face=side; pl.vx=0; sfx("splash",0.4); return true;
}
function swimUpdate(dt,dir){
  const W=pl.swim, night=clamp((pl.x+800)/6000,0,1);
  const rest = W.post && Math.abs(pl.x-W.post)<20;
  pl.vx+=clamp(dir*SWIM_SP*(0.55+0.45*pl.sta)-pl.vx,-240*dt,240*dt);
  let nx=pl.x+pl.vx*dt;
  // banks
  if(nx<W.x0+12){ nx=W.x0+12; if(dir<0&&tryClimb(W.x0,-1)) return; }
  if(nx>W.x1-12){ nx=W.x1-12; if(dir>0&&tryClimb(W.x1,1)) return; }
  // mud pads standing in the marsh act like little islands
  for(const p of pads){ if(p.gone)continue; const l=p.x-p.w/2-10, r=p.x+p.w/2+10;
    if(nx>l&&nx<r){ if(pl.x<=l){ nx=l; if(dir>0&&tryClimb(l+10,1)) return; } else if(pl.x>=r){ nx=r; if(dir<0&&tryClimb(r-10,-1)) return; } } }
  if(jumpBuf>0){ jumpBuf=0; // jumping out works only right next to something to grab
    const nearL=nx<W.x0+30, nearR=nx>W.x1-30; if(nearL&&tryClimb(W.x0,-1))return; if(nearR&&tryClimb(W.x1,1))return;
    for(const p of pads){ if(p.gone)continue; if(Math.abs(nx-(p.x-p.w/2))<30&&tryClimb(p.x-p.w/2,1))return; if(Math.abs(nx-(p.x+p.w/2))<30&&tryClimb(p.x+p.w/2,-1))return; } }
  pl.x=nx; pl.y=W.w; pl.vy=0; if(dir) pl.face=dir;
  const moving=Math.abs(pl.vx)>10;
  if(rest) pl.sta=Math.min(1,pl.sta+dt*0.32);   // clinging to the post: catch your breath
  else pl.sta-=dt*(moving?1/7:1/10)*(1+0.3*night);
  if(pl.sta<0.35&&Math.random()<dt*1.6) sfx("splash",0.15);
  if(pl.sta<=0){ pl.sta=0; kill("exhaust"); }
}
function climbUpdate(dt){ const c=pl.climb, k=clamp(pl.lockT/1.25,0,1);
  pl.x=lerp(c.x0,c.x1,easeIO2(k)); pl.y=k<0.34?c.yw:c.yt;
  if(k>=1){ pl.lock=null; pl.swim=null; pl.y=c.yt; pl.ground=true; pl.vy=0; pl.wetT=4.5; pl.climb=null; } }
const easeIO2=k=>k*k*(3-2*k);

// ---------- beat 3: palms that sway with the wind, and two that sway against it ----------
const GROVE=[3290,3400,3520,3640,3760,3880,3960];
// The giant is walking left, toward the boy, through the grove. Its legs look like palms but lean against the wind.
// Each leg lifts, swings 240 WU to the left and slams down. Pass under a lifted leg and it lands behind you.
const LEGS=[{x0:3610},{x0:3830}];
let walkOn=false;
function wind(){ return Math.sin(T*0.9)*0.6+Math.sin(T*0.37+1)*0.4; }
function resetLegs(){ walkOn=false; LEGS.forEach((L,i)=>{ L.x=L.x0; L.st="plant"; L.t=i*1.6; L.y=0; L.from=L.x; L.to=L.x; L.gone=false; L.alpha=1; }); }
function updateLegs(dt){
  if(!walkOn&&pl.x>3230&&pl.x<3980) walkOn=true;
  for(const L of LEGS){ if(L.gone)continue;
    if(!walkOn){ L.y=0; continue; }
    L.t+=dt; const d=Math.abs(pl.x-L.x);
    if(L.st==="plant"){ L.y=0; if(L.t>3.2){ L.st="tremble"; L.t=0; sfx("rustle",0.9); } }
    else if(L.st==="tremble"){ L.y=Math.sin(T*40)*1.5; if(Math.random()<0.6)dust.push({x:L.x+R(-30,30),y:-R(200,420),vx:R(-10,10),vy:R(30,80),life:1.5,s:R(1,2),c:2}); if(L.t>0.7){ L.st="lift"; L.t=0; L.from=L.x; L.to=L.x-240; sfx("rumble",0.5); } }
    else if(L.st==="lift"){ const k=clamp(L.t/1.0,0,1); L.y=-280*Math.sin(Math.PI*Math.min(1,k*1.15)); L.x=lerp(L.from,L.to,easeIO2(k));
      if(k>0.8&&L.y>-70&&!pl.dead&&Math.abs(pl.x-L.x)<62){ kill("crush"); if(hat)hat.crushed=true; }
      if(k>=1){ L.st="plant"; L.t=0; L.y=0; L.x=L.to; sfx("boom",0.85); cam.shake=2.6; for(let k2=0;k2<30;k2++)dust.push({x:L.x+R(-90,90),y:0,vx:R(-160,160),vy:-Math.random()*180,life:1.1,s:R(1.2,3),c:0});
        if(!pl.dead&&Math.abs(pl.x-L.x)<62){ kill("crush"); if(hat)hat.crushed=true; }
        if(L.x<3200){ L.st="fade"; L.t=0; } } }
    else if(L.st==="fade"){ L.alpha=Math.max(0,1-L.t/2.5); L.y=-L.t*60; if(L.alpha<=0) L.gone=true; } }
}
function legRects(){ const out=[]; for(const L of LEGS){ if(!L.gone&&L.st!=="fade"&&L.y>-80) out.push({x0:L.x-34,x1:L.x+34,y0:-900,y1:L.y,ref:"foot"}); } return out; }

// ---------- beat 5: shadows in moonlight ----------
const MOON0=4800, MOON1=5760;
let moonLit=1;
const msteps=[]; let mstepNext=2;
function moonCycle(){ const mc=(T%10)/10; return {mc,lit:clamp((Math.abs(mc-0.5)*2-0.3)/0.25,0,1)}; }
function inMoon(x){ return x>MOON0-200&&x<MOON1+200; }
function resetMoon(){ msteps.length=0; mstepNext=1.0; }
function mstepState(s){ const t=s.t; if(t<1.5)return{y:-900,ph:"warn",k:t/1.5}; if(t<1.75){const k=(t-1.5)/0.25;return{y:lerp(-900,0,k*k),ph:"slam",k};} if(t<3.0)return{y:0,ph:"plant"}; if(t<3.8){const k=(t-3)/0.8;return{y:lerp(0,-900,easeIO2(k)),ph:"lift"};} return{y:-900,ph:"gone"}; }
function updateMoon(dt){
  const m=moonCycle(); moonLit=inMoon(pl.x)?m.lit:1;
  if(pl.x>MOON0&&pl.x<MOON1&&!pl.dead){ mstepNext-=dt; if(mstepNext<=0){ mstepNext=2.4;
      // fair rule: a step only aims at the boy if its shadow will stay readable for the whole warning
      let minLit=1; for(let k=0;k<=6;k++){ const mc=((T+k*0.25)%10)/10; minLit=Math.min(minLit,clamp((Math.abs(mc-0.5)*2-0.3)/0.25,0,1)); }
      const off = minLit>0.5 ? pl.vx*1.6+R(-20,40) : (Math.random()<0.5?-1:1)*R(170,280);
      msteps.push({x:clamp(pl.x+off,MOON0+40,MOON1-20),t:0,last:""}); } }
  for(const s of msteps){ s.t+=dt; const st=mstepState(s);
    if(st.ph==="warn"&&s.last!=="warn") sfx("rumble",0.7);
    if((st.ph==="slam"&&st.y>-70||st.ph==="plant"&&s.last!=="plant")&&!pl.dead&&Math.abs(pl.x-s.x)<66){ kill("crush"); if(hat)hat.crushed=true; }
    if(st.ph==="plant"&&s.last!=="plant"){ sfx("boom",0.9); cam.shake=2.8; for(let k=0;k<30;k++)dust.push({x:s.x+R(-90,90),y:0,vx:R(-160,160),vy:-Math.random()*180,life:1.1,s:R(1.2,3),c:0}); for(const tr of trees) if(Math.random()<0.2) treeWarn(tr); }
    s.last=st.ph; }
  for(let i=msteps.length-1;i>=0;i--) if(mstepState(msteps[i]).ph==="gone") msteps.splice(i,1);
}
function mstepRects(){ const out=[]; for(const s of msteps){ const st=mstepState(s); if(st.y>-120) out.push({x0:s.x-34,x1:s.x+34,y0:-900,y1:st.y,ref:"foot"}); } return out; }

// ---------- beat 6: the sap ladder and the marsh of mud pads ----------
const LADDER_X=5880, LADDER_TOP=-372;
const pads=[]; const PAD_X=[6040,6195,6350,6505,6660,6815], PAD_SOFT=[false,true,false,false,true,false];
function resetPads(){ pads.length=0; PAD_X.forEach((x,i)=>pads.push({x,w:62,top:4,sink:0,soft:PAD_SOFT[i],t:0,gone:false})); }
function updatePads(dt){
  for(const p of pads){ if(p.gone)continue; const on=!pl.dead&&!pl.swim&&pl.ground&&Math.abs(pl.x-p.x)<p.w/2+4&&Math.abs(pl.y-(p.top+p.sink))<3;
    if(p.soft&&(on||p.t>0)){ p.t+=dt; if(p.t>0.45){ if(p.sink<0.5)sfx("splash",0.35); p.sink+=dt*34; if(on){pl.y=p.top+p.sink;} } if(p.sink>20){ p.gone=true; } } }
}
function padRects(){ return pads.filter(p=>!p.gone).map(p=>({x0:p.x-p.w/2,x1:p.x+p.w/2,y0:p.top+p.sink,y1:3000,ref:"pad"})); }
let viewT=0;
function ladderUpdate(dt){
  const L=pl.lock;
  if(L==="ladder"){ pl.x=damp(pl.x,LADDER_X-8,12,dt); pl.y=Math.max(LADDER_TOP,pl.y-dt*110); if(Math.random()<dt*3)sfx("step",0.6); if(pl.y<=LADDER_TOP){ pl.lock="top"; pl.lockT=0; viewT=0; sfx("rustle",0.6); } }
  else if(L==="top"){ viewT+=dt; pl.onTop=true; if(viewT>1.2&&(key.l||key.r||jumpBuf>0)){ jumpBuf=0; pl.lock="ladderdown"; } }
  else if(L==="ladderdown"){ pl.onTop=false; pl.y=Math.min(0,pl.y+dt*150); if(pl.y>=0){ pl.lock=null; pl.y=0; pl.ground=true; } }
}
function nearLadder(){ return pl.ground&&!pl.swim&&Math.abs(pl.x-LADDER_X)<24&&pl.y>-2; }

// ---------- per-frame hooks ----------
function v1Reset(){ resetLegs(); resetMoon(); resetPads(); pl.swim=null; pl.sta=1; pl.wetT=0; pl.onTop=false; viewT=0; }
function v1Update(dt){ updateLegs(dt); updateMoon(dt); updatePads(dt); if(pl.ground&&!pl.swim) pl.sta=Math.min(1,(pl.sta??1)+dt/2.4); pl.wetT=Math.max(0,(pl.wetT||0)-dt);
  if(pl.wetT>0&&Math.random()<dt*7) dust.push({x:pl.x+R(-8,8)+pl.face*4,y:pl.y-R(30,58),vx:R(-4,4),vy:R(10,30),life:0.8,s:R(0.8,1.4),c:1}); }
function v1Rects(){ return padRects().concat(legRects(),mstepRects()); }
function v1Fear(){ let f=0; for(const L of LEGS){ if(L.gone||!walkOn)continue; const d=Math.abs(pl.x-L.x); if(d<300) f=Math.max(f,(1-d/300)*(L.st==="plant"?0.4:1)); }
  for(const s of msteps){ const st=mstepState(s); if(st.ph==="warn"||st.ph==="slam") f=Math.max(f,1-Math.min(1,Math.abs(s.x-pl.x)/400)); }
  if(pl.swim&&pl.sta<0.4) f=Math.max(f,0.5); return f; }
function v1LookUp(){ return LEGS.some(L=>!L.gone&&(L.st==="lift"||L.st==="tremble")&&Math.abs(pl.x-L.x)<260) || msteps.some(s=>mstepState(s).ph==="warn"&&Math.abs(s.x-pl.x)<300); }

// ---------- drawing ----------
let footC2=null, ladderTint=null;
function drawV1Back(C){
  const x0=cam.x-VW*ZOOM/2-200, x1=cam.x+VW*ZOOM/2+200, w=wind();
  // grove: ordinary palms lean with the wind
  if(x1>3200&&x0<4050&&palmTint) for(const gx of GROVE){ ctx.save(); ctx.translate(gx,4); ctx.rotate(w*0.03); drawImgBottom(palmTint,0,0,470+(gx%7)*12,(gx/10|0)%2===1); ctx.restore(); }
  // the two legs of the Palm Walker lean against it
  if(IMG.pw_leg_a){ LEGS.forEach((L,i)=>{ if(L.gone||L.x<x0-200||L.x>x1+200)return; const img=i?IMG.pw_leg_b:IMG.pw_leg_a, h=900, wd=img.width*h/img.height*0.82;
      ctx.save(); ctx.translate(L.x,L.y+6); ctx.rotate(-w*0.04+(L.st==="lift"?-0.12*Math.sin(Math.PI*clamp(L.t,0,1)):0)); ctx.globalAlpha=0.97*L.alpha; ctx.drawImage(img,-wd/2,-h,wd,h); ctx.restore(); }); }
  // wind-blown leaves give the wind a direction
  if(x1>3150&&x0<4050&&Math.random()<0.5) leaves.push({x:cam.x-VW*ZOOM/2-20,y:-R(40,300),vx:R(60,120)*(w>0?1:0.4),vy:R(5,20),r:Math.random()*6,vr:R(-4,4),life:7});
  // sap ladder palm
  if(x1>LADDER_X-300&&x0<LADDER_X+300&&IMG.palm_ladder){ if(!ladderTint) ladderTint=tinted(IMG.palm_ladder,"#0b0d10"); drawImgBottom(ladderTint,LADDER_X+6,6,520); }
  // mud pads; from up high the firm ones catch the moonlight
  for(const p of pads){ if(p.gone||p.x<x0||p.x>x1)continue; const y=p.top+p.sink;
    ctx.fillStyle="#030304"; ctx.beginPath(); ctx.moveTo(p.x-p.w/2-4,40); ctx.quadraticCurveTo(p.x-p.w/2,y-2,p.x-p.w/4,y-1); ctx.lineTo(p.x+p.w/4,y-1); ctx.quadraticCurveTo(p.x+p.w/2,y-2,p.x+p.w/2+4,40); ctx.fill();
    ctx.beginPath(); for(let gx=p.x-p.w/2+4;gx<p.x+p.w/2-4;gx+=5){ ctx.moveTo(gx-1,y); ctx.lineTo(gx+Math.sin(T*1.6+gx)*0.8,y-3-((gx*7)%5)); ctx.lineTo(gx+1,y); } ctx.fill();
    if(pl.onTop&&!p.soft){ const a=0.55+0.25*Math.sin(T*2+p.x); ctx.save(); ctx.globalCompositeOperation="lighter"; ctx.strokeStyle=rgba(C.glow,a); ctx.lineWidth=1.6; ctx.beginPath(); ctx.ellipse(p.x,y+1,p.w*0.55,4,0,0,Math.PI*2); ctx.stroke(); ctx.restore(); } }
  // moonlight lies on the grass as a pale silver mist; the giant's foot shadows cut into it
  if(x1>MOON0-250&&x0<MOON1+250&&moonLit>0.02){ const xa=Math.max(x0,MOON0-250), xb=Math.min(x1,MOON1+250);
    ctx.save(); ctx.globalCompositeOperation="lighter"; const A=MOON0-250, B=MOON1+250;
    const hg=(al)=>{ const g=ctx.createLinearGradient(A,0,B,0); g.addColorStop(0,"rgba(150,165,190,0)"); g.addColorStop(250/(B-A),`rgba(150,165,190,${al})`); g.addColorStop(1-250/(B-A),`rgba(150,165,190,${al})`); g.addColorStop(1,"rgba(150,165,190,0)"); return g; };
    for(let r=0;r<11;r++){ ctx.fillStyle=hg(0.2*moonLit*Math.pow((r+1)/11,1.6)); ctx.fillRect(A,-110+r*10,B-A,10); }
    ctx.fillStyle=hg(0.35*moonLit); ctx.fillRect(A,-1,B-A,1.6); ctx.restore();
    for(const s of msteps){ const st=mstepState(s); if(st.ph!=="warn"&&st.ph!=="slam")continue; const k=st.ph==="warn"?st.k:1, a=Math.min(1,0.35+0.65*k)*moonLit; if(a<0.02)continue;
      ctx.save(); ctx.globalAlpha=a; ctx.fillStyle="#020203";
      const rw=34+46*k; const gg=ctx.createLinearGradient(0,-130,0,2); gg.addColorStop(0,"rgba(2,2,3,0)"); gg.addColorStop(1,"rgba(2,2,3,0.95)");
      ctx.fillStyle=gg; const lean=-40*(1-k); ctx.globalAlpha=a*0.42; // stacked soft passes, no hard edges
      for(const f of [1.25,1,0.8,0.6]){ ctx.beginPath(); ctx.moveTo(s.x-rw*f,2); ctx.quadraticCurveTo(s.x-rw*f*0.7+lean*0.5,-60,s.x-rw*f*0.35+lean,-130); ctx.lineTo(s.x+rw*f*0.35+lean,-130); ctx.quadraticCurveTo(s.x+rw*f*0.7+lean*0.5,-60,s.x+rw*f,2); ctx.fill(); }
      ctx.globalAlpha=a;
      ctx.fillStyle="#020203"; ctx.beginPath(); ctx.ellipse(s.x,1,rw,3+3*k,0,0,Math.PI*2); ctx.fill(); ctx.restore(); } }
}
function drawV1Feet(C){
  for(const s of msteps){ const st=mstepState(s); if(st.y<-880)continue; const img=IMG.pw_leg_a, h=820, w=img.width*h/img.height*0.85;
    if(!footC2){footC2=document.createElement("canvas");footC2.width=img.width;footC2.height=img.height;footC2.getContext("2d").drawImage(img,0,0);}
    dreamDraw(shimmerLayer(footC2,T,C.glow,0.1),s.x-w*0.5,st.y-h+6,w,h,T,st.y>-5?0.6:2.5); }
}
function drawBoyV1(C,glow){ // returns true if it drew the boy (swim, climb, ladder, exhaustion)
  const W=pl.swim;
  if(pl.dead&&pl.deadKind==="exhaust"){ const d=pl.deadT; drawSpr("boy_tread",4,pl.x,(W?W.w:16)+d*16,pl.face,Math.max(0,1-d/1.6),glow); return true; }
  if(pl.lock==="climbout"){ const k=clamp(pl.lockT/1.25,0,1), f=Math.min(5,Math.floor(k*6)); drawSpr("boy_climbout",f,pl.x,f<2?pl.climb.yw:pl.climb.yt,pl.face,1,glow); return true; }
  if(pl.lock==="ladder"||pl.lock==="ladderdown"||pl.lock==="top"){ const f=pl.lock==="top"?0:(Math.floor(-pl.y/8)%8+8)%8; drawSpr("boy_ladder",f,pl.x,pl.y+22,1,1,glow); return true; }
  if(W){ if(Math.abs(pl.vx)>10) drawSpr("boy_swim",Math.floor(T*(6+4*pl.sta))%8,pl.x,W.w,pl.face,1,glow);
    else { const b=pl.sta>0.6?0:pl.sta>0.35?2:4; drawSpr("boy_tread",b+(Math.floor(T*(pl.sta>0.35?2.5:4))%2),pl.x,W.w,pl.face,1,glow); } return true; }
  return false;
}
function drawV1Screen(C){ // screen-space: darkness when clouds cover the moon, the view from the treetop
  if(inMoon(pl.x)&&moonLit<1){ ctx.setTransform(S,0,0,S,0,0); ctx.fillStyle=`rgba(2,3,6,${0.42*(1-moonLit)})`; ctx.fillRect(0,0,VW,VH); }
  if(pl.lock==="top"&&IMG.V01_VIEW){ const a=clamp(viewT/1.2,0,1)*clamp((4.2-viewT)/1.2,0,1); if(a>0){ ctx.setTransform(S,0,0,S,0,0); const im=IMG.V01_VIEW, w=VW, h=Math.max(VH,w*im.height/im.width);
      const tmp=tintC(im,"#0a0c10","view"); ctx.globalAlpha=a*0.9; ctx.fillStyle=rgba(C.fog,1); ctx.fillRect(0,0,VW,VH); ctx.drawImage(tmp,0,(VH-h)/2,w,h); ctx.globalAlpha=1; } }
}
function drawMoonClouds(mx,my,C){ if(!inMoon(cam.x)||!IMG.sky_2)return; const m=moonCycle(); const off=(m.mc-0.5)*-1500;
  for(const [n,dy,sc] of [["sky_2",-6,1.1],["sky_3",14,0.8]]){ const im=IMG[n]; const w=im.width*sc*0.9, h=im.height*sc*0.9; ctx.drawImage(tintC(im,mixHex(C.hor,"#000000",0.55),n),mx+off*(n==="sky_2"?1:1.2)-w/2,my+dy-h/2,w,h); } }
