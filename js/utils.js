/* FASE 1 — modulo estratto dal precedente script.js. */

var idContatore = (typeof idContatore !== 'undefined') ? idContatore : 1;
function nuovoId(){ return 'a' + Date.now().toString(36) + (idContatore++).toString(36) + Math.random().toString(36).slice(2, 6); }

function chiaveMese(anno, mese){ return `${anno}-${String(mese + 1).padStart(2,'0')}`; }

function dataISO(d){
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function round2(n){ return Math.round(n * 100) / 100; }

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function euro(n){
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString('it-IT', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' €';
}

function formattaDataBreve(iso){
  const [a, m, g] = iso.split('-');
  return `${g}/${m}/${a}`;
}

const el = id => document.getElementById(id);
