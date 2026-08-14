'use strict';
const PROGRAMS={sprint:{name:'Sprint',days:5},challenge:{name:'Challenge',days:10},relay:{name:'Relay',days:14},marathon:{name:'Marathon',days:30}};
const $=id=>document.getElementById(id);
function programInfo(name){const key=String(name||'relay').toLowerCase();return PROGRAMS[key]||PROGRAMS.relay;}
function average(values){const xs=values.filter(v=>v!==null&&v!==undefined&&!Number.isNaN(v));return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}
function change(a,b,unit){if(a===null||b===null||a===undefined||b===undefined)return '—';const d=b-a;return `${d>0?'+':''}${d.toFixed(1)}${unit}`;}
function parseEntries(txt){
 const blocks=txt.split(/\n(?=\s*FR2\s*\|)/i).map(b=>b.trim()).filter(Boolean),rows=[];
 blocks.forEach(b=>{
  const head=b.match(/FR2\s*\|\s*(?:(Sprint|Challenge|Relay|Marathon)\s*\|\s*)?([A-Za-z]{1,4})\s*\|\s*D\s*(\d+)/i);if(!head)return;
  const p=programInfo(head[1]||'Relay');
  const g=re=>b.match(re)||null;
  const f=g(/^\s*F\s+(\d{1,2}:\d{2})\s*(?:→|->|to)\s*(\d{1,2}:\d{2})/mi);
  const r=g(/^\s*R\s+(\d{1,2}:\d{2})\s*(?:→|->|to)\s*(\d{1,2}:\d{2})/mi);
  const e=g(/^\s*E\s+(\d+)\s*meals?.*?first\s*([YN]).*?between-?meals?\s*([YN])/mi);
  const x=g(/^\s*X\s+(\d+)\s*walks?.*?(\d+)\s*min.*?daylight\s*([YN])/mi);
  const s=g(/^\s*S\s+energy\s*(\d).*?clarity\s*(\d).*?sleep\s*(\d).*?hunger\s*(\d)/mi);
  const m=g(/^\s*M\s+([\d.]+|—)\s*lb\s*·\s*([\d.]+|—)\s*in(?:\s*·\s*([^\n]+))?/mi);
  const num=x=>x&&x!=='—'?Number(x):null;
  rows.push({program:p.name,totalDays:p.days,id:head[2].toUpperCase(),day:+head[3],fast:f?span(f[1],f[2]):null,close:f?f[1]:null,sleep:r?span(r[1],r[2]):null,bed:r?r[1]:null,meals:e?+e[1]:null,fruit:e?e[2].toUpperCase():null,graze:e?e[3].toUpperCase():null,walks:x?+x[1]:null,mins:x?+x[2]:null,sun:x?x[3].toUpperCase():null,en:s?+s[1]:null,cl:s?+s[2]:null,sq:s?+s[3]:null,hu:s?+s[4]:null,wt:m?num(m[1]):null,waist:m?num(m[2]):null,bp:m&&m[3]?m[3].trim():null,ok:!!(head&&f&&r&&e&&x&&s)});
 });
 return rows.sort((a,b)=>a.program.localeCompare(b.program)||a.id.localeCompare(b.id)||a.day-b.day);
}
function readPaste(){
 const rows=parseEntries($('paste').value),box=$('results');
 if(!rows.length){box.innerHTML='<p class="bad">No check-ins recognised. New entries start with <code>FR2 | Challenge | BO | D3</code>. Older <code>FR2 | BO | D3</code> Relay entries still work.</p>';return;}
 const people=[...new Set(rows.map(r=>`${r.program}|${r.id}`))];
 let sum='<div class="scroll"><table><thead><tr><th>Program</th><th>Person</th><th>Days</th><th>Avg fast</th><th>Avg sleep</th><th>Walks/day</th><th>Min/day</th><th>Fruit first</th><th>Energy</th><th>Hunger</th><th>Wt Δ</th><th>Waist Δ</th></tr></thead><tbody>';
 people.forEach(key=>{const [program,id]=key.split('|'),rs=rows.filter(r=>r.program===program&&r.id===id),total=rs[0].totalDays,fy=rs.filter(r=>r.fruit==='Y').length,d1=rs.find(r=>r.day===1),df=rs.find(r=>r.day===total);const af=average(rs.map(r=>r.fast)),as=average(rs.map(r=>r.sleep)),aw=average(rs.map(r=>r.walks)),am=average(rs.map(r=>r.mins)),ae=average(rs.map(r=>r.en)),ah=average(rs.map(r=>r.hu));sum+=`<tr><td>${program}</td><td class="id">${id}</td><td>${rs.length}/${total}</td><td>${hm(af===null?null:Math.round(af))}</td><td>${hm(as===null?null:Math.round(as))}</td><td>${aw===null?'—':aw.toFixed(1)}</td><td>${am===null?'—':Math.round(am)}</td><td>${fy}/${rs.length}</td><td>${ae===null?'—':ae.toFixed(1)}</td><td>${ah===null?'—':ah.toFixed(1)}</td><td>${change(d1?.wt,df?.wt,' lb')}</td><td>${change(d1?.waist,df?.waist,' in')}</td></tr>`;});
 sum+='</tbody></table></div>';
 let det='<h3 style="margin-top:22px">Every entry</h3><div class="scroll"><table><thead><tr><th>Program</th><th>ID</th><th>Day</th><th>Fast</th><th>Close</th><th>Sleep</th><th>Bed</th><th>Meals</th><th>Fruit</th><th>Graze</th><th>Walks</th><th>Min</th><th>Sun</th><th>E</th><th>C</th><th>S</th><th>H</th><th>Wt</th><th>Waist</th></tr></thead><tbody>';
 rows.forEach(r=>{det+=`<tr><td>${r.program}</td><td class="id">${r.id}</td><td>${r.day}/${r.totalDays}</td><td>${hm(r.fast)}</td><td>${pretty(r.close)}</td><td>${hm(r.sleep)}</td><td>${pretty(r.bed)}</td><td>${r.meals??'—'}</td><td>${r.fruit??'—'}</td><td>${r.graze??'—'}</td><td>${r.walks??'—'}</td><td>${r.mins??'—'}</td><td>${r.sun??'—'}</td><td>${r.en??'—'}</td><td>${r.cl??'—'}</td><td>${r.sq??'—'}</td><td>${r.hu??'—'}</td><td>${r.wt??'—'}</td><td>${r.waist??'—'}</td></tr>`;});det+='</tbody></table></div>';
 const bad=rows.filter(r=>!r.ok).length;box.innerHTML=`<h3>${rows.length} check-ins · ${people.length} participant-programs</h3>${bad?`<p class="bad">${bad} entry(s) were missing a required line and are partly blank.</p>`:'<p class="good">All recognised entries are complete.</p>'}${sum}${det}`;
}
$('readBtn').addEventListener('click',readPaste);
