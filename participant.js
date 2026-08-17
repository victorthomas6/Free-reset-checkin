'use strict';
const PROGRAMS={sprint:{name:'Sprint',days:5},challenge:{name:'Challenge',days:10},relay:{name:'Relay',days:14},marathon:{name:'Marathon',days:30}};
const S={meals:2,walks:0,mins:0,fruit:1,snack:0,sun:0,energy:3,clarity:3,sleep:3,hunger:3};
const SCALES=[['energy','Energy','drained','strong'],['clarity','Clarity','foggy','sharp'],['sleep','Sleep quality','restless','deep'],['hunger','Hunger between meals','none','constant']];
const $=id=>document.getElementById(id);
$('scales').innerHTML=SCALES.map(([k,lab,lo,hi])=>`<div class="scalerow"><label>${lab}</label><div class="scale" id="sc_${k}" role="group" aria-label="${lab}">${[1,2,3,4,5].map(n=>`<button type="button" data-scale="${k}" data-value="${n}" aria-pressed="${n===3}" aria-label="${lab} ${n}">${n}</button>`).join('')}</div><div class="ends"><span>${lo}</span><span>${hi}</span></div></div>`).join('');
function val(id){const e=$(id);return e?e.value:'';}
function currentProgram(){return PROGRAMS[val('program')]||PROGRAMS.relay;}
function todayLocal(){const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
function prettyDate(iso){if(!iso)return '—';const m=iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return iso;const d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));return d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});}
function renderDayOptions(total){const sel=$('day'),prior=Number(sel.value)||1,keep=Math.max(1,Math.min(total,prior));sel.innerHTML=Array.from({length:total},(_,i)=>`<option value="${i+1}">Day ${i+1}</option>`).join('');sel.value=String(keep);}
function bump(k,n){const max=k==='mins'?300:9;S[k]=Math.max(0,Math.min(max,S[k]+n));$(k+'V').textContent=S[k];build();}
function setYN(k,v){S[k]=v;$(k+'Y').setAttribute('aria-pressed',String(v===1));$(k+'N').setAttribute('aria-pressed',String(v===0));build();}
function setScale(k,n){S[k]=n;document.querySelectorAll('#sc_'+k+' button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i+1===n)));build();}
function syncProgram(){
 const p=currentProgram(),sel=$('day');
 if(Number(sel.dataset.total)!==p.days){renderDayOptions(p.days);sel.dataset.total=String(p.days);}
 const day=Math.max(1,Math.min(p.days,Number(val('day'))||1)); if(String(day)!==sel.value)sel.value=String(day);
 $('dayOf').textContent=`Day ${day} of ${p.days}`;
 $('brand').textContent=`FREE Reset · ${p.name}`; $('footerProgram').textContent=`FREE Reset · daily intake · ${p.name}`;
 $('measWhy').textContent=`Day 1 and day ${p.days} only — this is what makes before-and-after real`;
}
function build(){
 syncProgram(); const p=currentProgram();
 const lastBite=val('lastBite'),firstBite=val('firstBite'),bed=val('bed'),wake=val('wake');
 const fw=span(lastBite,firstBite),sl=span(bed,wake);
 $('fastV').textContent=hm(fw); const lb=mins(lastBite); $('fastT').textContent=lb!==null&&lb<=18*60&&lb>12*60?'Table closed by 6pm':'Table closed after 6pm';
 $('sleepV').textContent=hm(sl); const bm=mins(bed); $('sleepT').textContent=bm!==null&&bm>=20*60&&bm<=22*60?'Lights out by 10pm':'Past the 10pm target';
 const day=String(Math.max(1,Math.min(p.days,Number(val('day'))||1))); if(val('day')!==day)$('day').value=day;
 const showMeas=day==='1'||day===String(p.days); $('measBlock').classList.toggle('hidden',!showMeas);
 let out=`FR2 | ${p.name} | ${(val('pid')||'??').toUpperCase()} | D${day}/${p.days} | ${val('checkDate')||'—'}\n`;
 out+=`F ${lastBite||'—'} → ${firstBite||'—'}  (${hm(fw)})\n`;
 out+=`R ${bed||'—'} → ${wake||'—'}  (${hm(sl)})\n`;
 out+=`E ${S.meals} meals · fruit first ${S.fruit?'Y':'N'} · between-meals ${S.snack?'Y':'N'}\n`;
 out+=`X ${S.walks} walks · ${S.mins} min · daylight ${S.sun?'Y':'N'}\n`;
 out+=`S energy ${S.energy} · clarity ${S.clarity} · sleep ${S.sleep} · hunger ${S.hunger}`;
 if(showMeas&&(val('wt')||val('waist')||val('bp')))out+=`\nM ${val('wt')||'—'} lb · ${val('waist')||'—'} in${val('bp')?` · ${val('bp')}`:''}`;
 const note=val('note').trim(); if(note)out+=`\n“${note.replace(/[\r\n]+/g,' ')}”`;
 $('output').textContent=out;
}
async function copyOut(){const txt=$('output').textContent;const done=()=>{const b=$('copyBtn');const old=b.textContent;b.textContent='Copied';setTimeout(()=>b.textContent=old,1600);};try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(txt);done();return;}}catch(e){}const ta=document.createElement('textarea');ta.value=txt;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done();}catch(e){$('copyHint').textContent='Select the text above and copy it manually.';}ta.remove();}
function sendWhatsApp(){const txt=encodeURIComponent($('output').textContent);window.location.href=`https://wa.me/?text=${txt}`;}
async function shareOut(){const txt=$('output').textContent;if(navigator.share){try{await navigator.share({title:'FREE Reset Daily Check-In',text:txt});return;}catch(e){if(e&&e.name==='AbortError')return;}}await copyOut();$('copyHint').textContent='Sharing is unavailable here, so the check-in was copied instead.';}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.bump)bump(b.dataset.bump,Number(b.dataset.amount));if(b.dataset.yn)setYN(b.dataset.yn,Number(b.dataset.value));if(b.dataset.scale)setScale(b.dataset.scale,Number(b.dataset.value));});
['pid','day','program','checkDate','lastBite','firstBite','bed','wake','wt','waist','bp','note'].forEach(id=>$(id).addEventListener('input',build));
$('program').addEventListener('change',build); $('copyBtn').addEventListener('click',copyOut);$('waBtn').addEventListener('click',sendWhatsApp);$('shareBtn').addEventListener('click',shareOut);
if(!navigator.share)$('shareBtn').textContent='Share / Copy';
if(!$('checkDate').value)$('checkDate').value=todayLocal();
build();
