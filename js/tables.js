/* FASE 1 — modulo estratto dal precedente script.js. */

function renderTabelle(){
  const qualifica = AppState.anagrafica ? AppState.anagrafica.qualifica : 'Agente';
  const catRuolo = (MAPPA_GRADI[qualifica] || { cat:'truppa' }).cat;
  const NOMI_RUOLO = { truppa:'Agenti e Assistenti', sovr:'Sovrintendenti', isp:'Ispettori', funz:'Commissari/Funzionari' };
  const t = AppState.tabelle;
  const defs = window.TurniPSData?.TABELLE_PREDEFINITE || window.TABELLE_PREDEFINITE || {};
  const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const val = (obj, path) => path.split('.').reduce((a,k)=>a?.[k], obj);
  const row = (label, path, step='0.01', extra='') => {
    const current = val(t,path) ?? 0;
    const def = val(defs,path);
    const changed = def !== undefined && Number(current) !== Number(def);
    return `<div class="tabella-riga-v17" data-table-row data-label="${esc(label)}"><div class="tabella-label"><strong>${esc(label)}</strong><span class="tabella-stato ${changed?'modificato':'predefinito'}">${changed?'Modificato':'Predefinito'}</span></div><div class="tabella-edit"><input data-t="${esc(path)}" type="number" step="${step}" value="${esc(current)}" aria-label="${esc(label)}"><button type="button" class="tabella-reset-one" data-reset-table="${esc(path)}" title="Ripristina valore predefinito" ${def===undefined?'disabled':''}>↺</button></div>${extra?`<small>${esc(extra)}</small>`:''}</div>`;
  };
  const section=(id,title,icon,subtitle,body,cls='')=>`<section class="tabella-gruppo-v17 ${cls}" data-table-section="${id}"><button class="tabella-head-v17" type="button" aria-expanded="false"><span class="tabella-icon-v17">${icon}</span><span><strong>${title}</strong><small>${subtitle}</small></span><b>⌄</b></button><div class="tabella-body-v17" hidden>${body}</div></section>`;
  const bodyFisse = row('Stipendio annuo — in vigore (€)',`stipendiAnnuiAttuale.${qualifica}`)+row('Stipendio annuo — proiettato 2027 (€)',`stipendiAnnui2027.${qualifica}`)+row('Indennità pensionabile annua — in vigore (€)',`indennitaPensionabileAnnuaAttuale.${qualifica}`)+row('Indennità pensionabile annua — proiettata 2027 (€)',`indennitaPensionabileAnnua2027.${qualifica}`);
  const bodyStra = row('Diurno (€/h)',`straordinarioOrarioAttuale.${qualifica}.diurno`)+row('Notturno o festivo (€/h)',`straordinarioOrarioAttuale.${qualifica}.notturnoOFestivo`)+row('Notturno festivo (€/h)',`straordinarioOrarioAttuale.${qualifica}.notturnoFestivo`);
  const bodyStra27 = row('Diurno (€/h)',`straordinarioOrario2027.${qualifica}.diurno`)+row('Notturno o festivo (€/h)',`straordinarioOrario2027.${qualifica}.notturnoOFestivo`)+row('Notturno festivo (€/h)',`straordinarioOrario2027.${qualifica}.notturnoFestivo`);
  const bodyAssegno = row('Dopo 17 anni',`assegnoFunzioneAnnuo.${catRuolo}.soglia17`)+row('Dopo 27 anni',`assegnoFunzioneAnnuo.${catRuolo}.soglia27`)+row('Dopo 32 anni',`assegnoFunzioneAnnuo.${catRuolo}.soglia32`);
  const bodyInd = row('Turno notturno ordinario (€/h)',`indennitaTurnoNotturnoOraria`)+row('Presenza festiva/domenicale (€/turno)',`indennitaPresenzaFestivaTurno`)+row('Festività particolare (€/giorno)',`indennitaFestivitaParticolareGiorno`)+row('Compensazione riposo lavorato (€/giorno)',`indennitaCompensazioneRiposoLavorato`)+row('Ordine pubblico in sede (€/turno)',`indennitaOPInSede`)+row('Ordine pubblico fuori sede (€/turno)',`indennitaOPFuoriSede`)+row('Riduzione OP senza pernottamento (%)',`riduzioneOPSenzaPernottamento`,'1')+row('Servizio esterno (€/turno)',`indennitaServizioEsternoTurno`)+row('Controllo territorio serale (€/giorno)',`indennitaControlloTerritorioSeraleFlat`)+row('Controllo territorio notturno (€/giorno)',`indennitaControlloTerritorioNotturnoFlat`)+row('Reperibilità (€/turno)',`reperibilitaGiornaliera`)+row('Cambio turno (€/occorrenza)',`indennitaCambioTurno`)+row('Produttività collettiva (€/giorno)',`indennitaProduttivitaCollettiva`)+row('Missione — piena 4-8h (€/h)',`indennitaTrasfertaOraria`,'0.001')+row('Missione — ridotta oltre 8h (€/h)',`indennitaTrasfertaOrariaRidotta`,'0.001')+row('Quota sindacale (€/mese)',`sindacatoMensile`);
  const bodyFisc = row('Aliquota previdenziale (%)',`aliquotaPrevidenziale`)+row('No-tax area annua (€)',`noTaxAreaAnnua`,'1')+row('Detrazione lavoro dipendente (€/mese)',`detrazioneLavoroMensile`)+row('Detrazione coniuge (€/anno)',`detrazioneConiugeACaricoAnnua`)+row('Detrazione figlio over 21 (€/anno)',`detrazionePerFiglioOver21Annua`)+row('Trattamento integrativo (€/mese)',`trattamentoIntegrativoMensile`);
  const bodyBuono=row('Valore buono pasto (€)',`buonoPastoValore`);
  el('corpoTabelle').innerHTML = `<div class="tabelle-v17"><div class="tabelle-hero-v17"><div><span class="tabella-eyebrow">CENTRO PARAMETRI</span><h3>Tabelle per ${esc(qualifica)}</h3><p>Modifica solo i valori che vuoi personalizzare. Il cedolino utilizza questi parametri.</p></div><div class="tabella-hero-badge"><strong id="tabellaCountModificati">0</strong><small>modificati</small></div></div><div class="tabelle-toolbar-v17"><label class="tabella-search-v17"><span>⌕</span><input id="ricercaTabelle" type="search" placeholder="Cerca una voce…" autocomplete="off"></label><div class="tabella-filtri-v17" role="group" aria-label="Filtra tabelle"><button type="button" class="tabella-filtro-v17 attivo" data-table-filter="tutte">Tutte</button><button type="button" class="tabella-filtro-v17" data-table-filter="modificati">Modificate</button><button type="button" class="tabella-filtro-v17" data-table-filter="predefiniti">Predefinite</button></div></div><div class="tabella-notice-v17"><span>ⓘ</span><p><strong>Attenzione ai valori economici.</strong> I parametri modificati possono cambiare il netto stimato. Verifica sempre il cedolino ufficiale prima di usare i risultati.</p></div>${section('fisse','Voci fisse','💶','Stipendio e indennità pensionabile',bodyFisse)}${section('straordinario','Straordinario','⏱️','Tariffe orarie in vigore',bodyStra)}${section('straordinario27','Straordinario 2027','📅','Valori proiettati, non ancora in vigore',bodyStra27,'proiezione')}${section('assegno','Assegno di funzione','🎖️',`${NOMI_RUOLO[catRuolo]} — soglie di servizio`,bodyAssegno,catRuolo==='funz'?'attenzione':'')}${section('indennita','Indennità e trasferte','🚓','Servizi, missioni e accessorie',bodyInd)}${section('fiscale','Fiscale e previdenziale','🧾','Parametri utilizzati per la stima',bodyFisc)}${section('buono','Buono pasto','🍽️','Valore informativo',bodyBuono)}<div class="tabelle-v17-footer"><button type="button" class="btn-secondario" id="btnResetTabelleV17">↺ Ripristina tutto</button><span>Le modifiche restano in memoria solo dopo <strong>Salva</strong>.</span></div></div>`;

  const updateStatus=()=>{
    let changed=0;
    el('corpoTabelle').querySelectorAll('[data-table-row]').forEach(r=>{
      const input=r.querySelector('input[data-t]'); const def=val(defs,input.dataset.t); const is=def!==undefined && Number(input.value)!==Number(def);
      const badge=r.querySelector('.tabella-stato'); badge.className=`tabella-stato ${is?'modificato':'predefinito'}`; badge.textContent=is?'Modificato':'Predefinito'; r.dataset.state=is?'modificato':'predefinito'; if(is) changed++;
    }); el('tabellaCountModificati').textContent=changed;
  };
  el('corpoTabelle').querySelectorAll('.tabella-head-v17').forEach(b=>b.addEventListener('click',()=>{const open=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!open));b.nextElementSibling.hidden=open;b.querySelector('b').textContent=open?'⌄':'⌃';}));
  el('corpoTabelle').querySelectorAll('input[data-t]').forEach(i=>i.addEventListener('input',updateStatus));
  el('corpoTabelle').querySelectorAll('[data-reset-table]').forEach(b=>b.addEventListener('click',()=>{const d=val(defs,b.dataset.resetTable);if(d!==undefined){const i=el('corpoTabelle').querySelector(`input[data-t="${CSS.escape(b.dataset.resetTable)}"]`);if(i){i.value=d;updateStatus();}}}));
  el('corpoTabelle').querySelector('#ricercaTabelle').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();el('corpoTabelle').querySelectorAll('[data-table-row]').forEach(r=>r.classList.toggle('tabella-nascosta',q && !r.dataset.label.toLowerCase().includes(q)));});
  el('corpoTabelle').querySelectorAll('[data-table-filter]').forEach(b=>b.addEventListener('click',()=>{el('corpoTabelle').querySelectorAll('[data-table-filter]').forEach(x=>x.classList.remove('attivo'));b.classList.add('attivo');const f=b.dataset.tableFilter;el('corpoTabelle').querySelectorAll('[data-table-row]').forEach(r=>{const hide=f!=='tutte' && r.dataset.state!==(f==='modificati'?'modificato':'predefinito');r.classList.toggle('tabella-nascosta',hide);});}));
  el('btnResetTabelleV17').addEventListener('click',()=>{AppState.tabelle=JSON.parse(JSON.stringify(defs));renderTabelle();});
  updateStatus();
}

function leggiTabelleDaModale(){
  el('corpoTabelle').querySelectorAll('input[data-t]').forEach(input => {
    const percorso = input.dataset.t.split('.');
    let ref = AppState.tabelle;
    for(let i = 0; i < percorso.length - 1; i++) ref = ref[percorso[i]];
    ref[percorso[percorso.length - 1]] = Number(input.value) || 0;
  });
  salvaTabelleStorage();
}
