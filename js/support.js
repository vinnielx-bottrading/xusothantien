"use strict";
// ============ Ủng hộ: VietQR drawn in the game's own style ============
// The base payload is the user's static Vietcombank VietQR. Choosing an amount turns it into a
// dynamic VietQR (tag 01 = 12) with tag 54 (amount) and tag 62/08 (transfer note), CRC16 recomputed.
const VQR_BASE="00020101021138570010A00000072701270006970436011301110001826840208QRIBFTTA53037045802VN63040CDE";
const VQR_NOTE="Ung ho Xu So Than Tien";
const BANK={name:"Vietcombank",holder:"Nguyễn Hoàng Vinh",acct:"0111000182684"};
function crc16(str){ let c=0xFFFF; for(let i=0;i<str.length;i++){ c^=str.charCodeAt(i)<<8; for(let k=0;k<8;k++) c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF; } return c.toString(16).toUpperCase().padStart(4,"0"); }
function tlv(id,v){ return id+String(v.length).padStart(2,"0")+v; }
function parseTLV(s){ const out=[]; let i=0; while(i<s.length){ const id=s.substr(i,2), n=+s.substr(i+2,2); out.push([id,s.substr(i+4,n)]); i+=4+n; } return out; }
function vietqr(amount){
  const f=parseTLV(VQR_BASE).filter(([id])=>id!=="63");
  if(!amount) return VQR_BASE;
  const out=[];
  for(const [id,v] of f){
    if(id==="01"){ out.push(tlv("01","12")); continue; }
    out.push(tlv(id,v));
    if(id==="53") out.push(tlv("54",String(Math.round(amount))));
  }
  // insert note before CRC (after 58 country code)
  out.push(tlv("62",tlv("08",VQR_NOTE)));
  const body=out.join("")+"6304"; return body+crc16(body);
}
function drawQR(canvas,text,px){
  if(typeof qrcode!=="function"){ return false; }
  const q=qrcode(0,"M"); q.addData(text); q.make(); const n=q.getModuleCount(), quiet=3, cell=Math.max(2,Math.floor(px/(n+quiet*2)));
  const size=cell*(n+quiet*2); canvas.width=size; canvas.height=size; const c=canvas.getContext("2d");
  c.fillStyle="#ece6d6"; c.fillRect(0,0,size,size);
  c.fillStyle="#121316";
  for(let y=0;y<n;y++)for(let x=0;x<n;x++) if(q.isDark(y,x)) c.fillRect((x+quiet)*cell,(y+quiet)*cell,cell,cell);
  return true;
}
const fmtVND=v=>v.toLocaleString("vi-VN")+" đ";
function mountSupport(el,opts={}){
  el.innerHTML=`
  <div class="qcard${opts.compact?" compact":""}">
    <img class="qorn" src="a/orn_short.webp" alt="">
    <h3 class="qh">Ủng hộ Vinh làm game</h3>
    ${opts.compact?"":`<p class="qsub">Mỗi lần ủng hộ giúp cậu bé đi tiếp tới những vùng núi sau.</p>`}
    <div class="qframe"><canvas aria-label="Mã QR chuyển khoản ủng hộ"></canvas><img class="qfallback" src="a/qr_ung_ho.png" alt="Mã QR chuyển khoản ủng hộ" hidden></div>
    <div class="qamts" role="group" aria-label="Chọn số tiền">${[50000,100000,200000,1000000].map(v=>`<button type="button" data-v="${v}">${v>=1000000?"1 triệu":v/1000+"k"}</button>`).join("")}</div>
    <label class="qcustom">Số khác <input inputmode="numeric" placeholder="Nhập số tiền"></label>
    <div class="qbank"><span class="qbn">${BANK.name}</span><span class="qho">${BANK.holder}</span>
      <span class="qac"><span class="qnum">${BANK.acct.replace(/(\d{4})(\d{4})(\d+)/,"$1 $2 $3")}</span><button type="button" class="qcopy">Chép số</button></span></div>
    <p class="qnote" aria-live="polite">Quét bằng ứng dụng ngân hàng</p>
  </div>`;
  const cv=el.querySelector("canvas"), note=el.querySelector(".qnote"), inp=el.querySelector("input");
  const px=opts.compact?200:240;
  function render(amount){ const ok=drawQR(cv,vietqr(amount),px*2); if(!ok){ cv.hidden=true; el.querySelector(".qfallback").hidden=false; }
    note.textContent = amount ? `${fmtVND(amount)} · Nội dung: ${VQR_NOTE}` : "Quét bằng ứng dụng ngân hàng"; }
  el.querySelectorAll(".qamts button").forEach(b=>b.addEventListener("click",()=>{ el.querySelectorAll(".qamts button").forEach(x=>x.classList.remove("on")); b.classList.add("on"); inp.value=""; render(+b.dataset.v); }));
  let tm=0; inp.addEventListener("input",()=>{ clearTimeout(tm); tm=setTimeout(()=>{ const v=parseInt(inp.value.replace(/\D/g,""))||0; el.querySelectorAll(".qamts button").forEach(x=>x.classList.remove("on")); render(v>=1000?v:0); },350); });
  el.querySelector(".qcopy").addEventListener("click",async e=>{ const b=e.currentTarget; try{ await navigator.clipboard.writeText(BANK.acct); b.textContent="Đã chép"; }catch(_){ const r=document.createRange(); r.selectNodeContents(el.querySelector(".qnum")); const s=getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent="Đã chọn"; } setTimeout(()=>b.textContent="Chép số",1600); });
  render(0);
}
document.querySelectorAll(".qrbox").forEach(el=>mountSupport(el,{compact:el.dataset.compact==="1"}));
