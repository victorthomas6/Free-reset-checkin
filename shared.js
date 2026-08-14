'use strict';
function mins(t){if(!t)return null;const p=t.split(':').map(Number);if(p.length!==2||p.some(Number.isNaN))return null;return p[0]*60+p[1];}
function span(a,b){const x=mins(a),y=mins(b);if(x===null||y===null)return null;return ((y-x)+1440)%1440;}
function hm(n){return n===null||n===undefined||Number.isNaN(n)?'—':Math.floor(n/60)+'h '+String(Math.round(n%60)).padStart(2,'0')+'m';}
function pretty(t){if(!t)return '—';const p=t.split(':').map(Number);if(p.length!==2||p.some(Number.isNaN))return '—';const ap=p[0]<12?'am':'pm',hh=p[0]%12===0?12:p[0]%12;return hh+':'+String(p[1]).padStart(2,'0')+ap;}
