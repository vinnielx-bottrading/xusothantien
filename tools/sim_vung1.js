const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.log('E',e.message));
await p.goto('http://127.0.0.1:8766/test.html');await p.waitForSelector('#start:not([hidden])');await p.click('#start');await p.waitForTimeout(300);
await p.evaluate(()=>{paused=true;});
const run=async(name,fn)=>console.log(name,await p.evaluate(fn));
await run('canal-full',()=>{__dbg.setCP(4);const k=__dbg.key;let rested=0;for(let i=0;i<1600;i++){ if(pl.swim&&Math.abs(pl.x-2800)<10&&rested<110){k.r=0;rested++;} else k.r=1; update(1/30); if(pl.dead)return 'DEAD '+pl.x; if(pl.x>3170&&!pl.swim&&!pl.lock)return 'ok '+i+' wet '+pl.wetT.toFixed(1);}return 'stuck '+pl.x+' '+pl.lock;});
await run('legs-walk',()=>{__dbg.setCP(5);const k=__dbg.key;k.r=1;const log=[];for(let i=0;i<900;i++){update(1/30); if(i%20==0)log.push((pl.x|0)+':'+LEGS.map(L=>L.st[0]).join(''));if(pl.dead){k.r=0;return 'DEAD '+(pl.x|0)+' '+log.join(' ');} if(pl.x>3990){k.r=0;return 'ok '+i;}}k.r=0;return 'stuck '+log.slice(-8).join(' ');});
await run('legs-smart',()=>{__dbg.setCP(5);const k=__dbg.key;for(let i=0;i<1500;i++){ // wait well left of the leg; dash under it while it is lifted high
  const L=LEGS.find(L=>!L.gone&&pl.x<L.x+70); if(!L){k.r=1;} else if(L.st==='tremble'||L.st==='lift'){k.r=1;} else { k.r = (pl.x<L.x-330)?1:0; }
  update(1/30); if(pl.dead){k.r=0;return 'DEAD '+(pl.x|0);} if(pl.x>3990){k.r=0;return 'ok '+i;}}k.r=0;return 'stuck '+(pl.x|0)+' '+LEGS.map(L=>L.st).join(',');});
await run('moon',()=>{__dbg.setCP(7);const k=__dbg.key;k.r=1;let n=0;for(let i=0;i<3000;i++){ const danger=msteps.some(s=>{const st=mstepState(s);return (st.ph==='warn'&&moonLit>0.3&&s.x-pl.x>-80&&s.x-pl.x<340)||((st.ph==='plant')&&s.x-pl.x>0&&s.x-pl.x<90);}); k.r=danger?0:1; update(1/30); if(pl.dead){n++; for(let j=0;j<90&&pl.dead;j++)update(1/30);} if(pl.x>5800){k.r=0;return 'reached deaths='+n+' i='+i;}}k.r=0;return 'stuck '+(pl.x|0)+' deaths='+n;});
await run('ladder',()=>{__dbg.setCP(8);const k=__dbg.key;pl.x=5880;for(let i=0;i<5;i++)update(1/30);k.a=1;update(1/30);k.a=0;const log=[];for(let i=0;i<200;i++){update(1/30);if(i%20==0)log.push(pl.lock+':'+(pl.y|0)+' z'+ZOOM.toFixed(2));}k.r=1;for(let i=0;i<120;i++)update(1/30);k.r=0;log.push('after '+pl.lock+' y'+(pl.y|0)+' z'+ZOOM.toFixed(2));return log.join(' ');});
await run('marsh',()=>{__dbg.setCP(8);const k=__dbg.key;const log=[];k.r=1;for(let i=0;i<2000;i++){ // hop: jump whenever at right edge of a pad or bank
  const pd=padAt(pl.x); const edge = pl.ground && ((pd&&pl.x>pd.x+pd.w/2-14)||(!pd&&pl.x>5940&&pl.x<5960)); if(edge) jumpBuf=0.14;
  update(1/30); if(i%25==0)log.push((pl.x|0)+(pl.swim?'S'+pl.sta.toFixed(2):'')+(pd?'P':'')); if(pl.dead){k.r=0;return 'DEAD '+(pl.x|0)+' '+log.join(' ');} if(pl.x>6960&&!pl.swim){k.r=0;return 'ok '+i;}}k.r=0;return 'stuck '+log.slice(-10).join(' ');});
await run('enc',()=>{__dbg.setCP(10);const k=__dbg.key;k.r=1;for(let i=0;i<60;i++)update(1/30);k.r=0;return 'D active '+D.active+' x'+(pl.x|0)+' ph'+D.ph;});
await b.close();})();
