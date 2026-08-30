
function inizializzaImpostazioni(){
  const host = el('impostazioniBackupContainer');
  if(!host) return;
  ['sezioneBackup','sezioneBackupDrive'].forEach(id => {
    const n = el(id);
    if(!n) return;
    n.hidden = false;
    n.removeAttribute('hidden');
    if(n.parentElement !== host) host.appendChild(n);
  });
  const panel = el('impostazioniBackupPanel');
  if(panel) panel.hidden = true;
}
function mostraImpostazioniBackup(id){
  mostraScheda('impostazioni');
  inizializzaImpostazioni();
  const panel=el('impostazioniBackupPanel');
  if(panel) panel.hidden=false;
  const target=el(id);
  if(target){
    target.hidden = false;
    target.removeAttribute('hidden');
    target.style.display='block';
    target.scrollIntoView({behavior:'smooth',block:'start'});
  } else if(panel){
    panel.scrollIntoView({behavior:'smooth',block:'start'});
  }
}
'use strict';

function on(id, event, handler){
  const n = el(id);
  if(n) n.addEventListener(event, handler);
}


/* =========================================================
   SIMULATORE CEDOLINO — FASE 1
   Anagrafica + Calendario + Motore di classificazione ore
   ========================================================= */

const {
  CHIAVE_ANAGRAFICA,
  CHIAVE_TURNI,
  CHIAVE_TEMA,
  CHIAVE_TABELLE,
  CHIAVE_CONGUAGLI,
  CHIAVE_STORICO,
  CHIAVE_ASSENZE,
  CHIAVE_SEQUENZA,
  CHIAVE_NOTE_GIORNI,
  CHIAVE_SEQUENZA_ANCORA,
  CHIAVE_SEQUENZA_ULTIMO_GIORNO,
  CHIAVE_ULTIMO_BACKUP,
  CHIAVE_ASPETTATIVA_MIGRATA,
  CHIAVE_DISCLAIMER_MOSTRATO,
  CHIAVE_COLORI_TURNI
} = TurniPSConfig.keys;

// Espone le chiavi in scope globale condiviso (moduli classic script)
Object.assign(window, {
  CHIAVE_ANAGRAFICA, CHIAVE_TURNI, CHIAVE_TEMA, CHIAVE_TABELLE, CHIAVE_CONGUAGLI,
  CHIAVE_STORICO, CHIAVE_ASSENZE, CHIAVE_SEQUENZA, CHIAVE_NOTE_GIORNI,
  CHIAVE_SEQUENZA_ANCORA, CHIAVE_SEQUENZA_ULTIMO_GIORNO, CHIAVE_ULTIMO_BACKUP,
  CHIAVE_ASPETTATIVA_MIGRATA, CHIAVE_DISCLAIMER_MOSTRATO, CHIAVE_COLORI_TURNI
});

AppState.coloriTurni = caricaColoriTurni();

// Migrazioni prima del caricamento dei dati: garantisce che lo schema persistente sia aggiornato.
if(typeof turniPSRunMigrations==='function') turniPSRunMigrations();


/* ---------------------------------------------------------
   TABELLE UFFICIALI PREDEFINITE (FASE 2)
   Valori indicativi da fonti pubbliche (CCNL 2022-2024,
   Legge di Bilancio 2026) — l'utente li verifica e corregge
   dal pannello "Tabelle Ufficiali".
   --------------------------------------------------------- */
const TABELLE_PREDEFINITE = TurniPSData.TABELLE_PREDEFINITE;

AppState.anagrafica = caricaAnagrafica();
AppState.turni = caricaTurni(); // oggetto { 'YYYY-MM-DD': turnoData }
AppState.tabelle = caricaTabelle();
AppState.conguagliPerMese = caricaConguagli(); // oggetto { 'YYYY-MM': importo }
AppState.storico = caricaStorico(); // oggetto { 'YYYY-MM': { totaleLordo, netto } }

idContatore = 1; // già dichiarato in utils.js
// L'id deve restare unico anche quando si aggiunge una voce a un elenco già salvato in sessioni precedenti
// (dove idContatore riparte da 1): un id solo numerico rischiava di ripetersi e far confondere due voci diverse.


AppState.assenze = caricaAssenze(); // array [{ id, nome, valore, unita, personalizzata }]
TurniPSStorage.setItem(CHIAVE_ASSENZE, JSON.stringify(AppState.assenze)); // persiste subito l'eventuale merge di nuove voci predefinite

AppState.noteGiorni = caricaNoteGiorni(); // { 'AAAA-MM-GG': 'testo nota' }
AppState.sequenzaTurni = caricaSequenza(); // array di chiavi MODELLI_TURNO, es. ['sera01','pomeriggio','mattina','notte01','riposo']


// Addizionale regionale IRPEF 2026 — fonte: elenco ufficiale aliquote regionali (CSV fornito dall'utente).
// Nota: Puglia e Molise avevano nel CSV due set di aliquote diverse per la stessa fascia di reddito senza
// un campo che li distinguesse chiaramente; è stato usato il primo set indicato, da verificare se non corrisponde.


const oggi = new Date();
let meseCorrente = oggi.getMonth(); // 0-11
let annoCorrente = oggi.getFullYear();
let giornoSelezionato = null;
let turnoCopiato = null; // clipboard in memoria, non persistito

/* ---------------------------------------------------------
   FESTIVITÀ — Pasqua (algoritmo di Gauss) + festività fisse
   --------------------------------------------------------- */



// Categorizza il turno in base alla fascia oraria in cui ricadono la MAGGIOR PARTE
// delle ore svolte (non solo l'orario di inizio) — es. un turno 23:00-07:00 risulta
// "notte" perché la maggioranza delle ore ricade in quella fascia, non "sera".

// Sigle mostrate sulla cella del calendario per le assenze, fornite dall'utente
// (per le voci non elencate esplicitamente, o personalizzate, si usa un fallback dalle prime lettere del nome)


// festività "fisse" (non domenica): Capodanno, Epifania, Pasqua, Pasquetta, 25 aprile, 1 maggio, 2 giugno, Ferragosto, Ognissanti, Immacolata, Natale, S.Stefano


/* ---------------------------------------------------------
   MOTORE DI CLASSIFICAZIONE ORE
   Analizza una finestra temporale minuto per minuto e la
   suddivide in 5 categorie mutuamente esclusive:
   ordinarie / notturne / festive / domenicali / notturne-festive
   --------------------------------------------------------- */



/**
 * Classifica un turno completo: ore ordinarie del turno + straordinario
 * prima/dopo, riconoscendo automaticamente fascia notturna e festività.
 */


/* ---------------------------------------------------------
   PERSISTENZA
   --------------------------------------------------------- */

/* ---------------------------------------------------------
   MOTORE COMPETENZE — genera automaticamente le voci
   economiche da AppState.anagrafica + ore classificate + AppState.tabelle
   --------------------------------------------------------- */


// Produttività collettiva: si liquida una volta sola a luglio, sui giorni di presenza effettiva
// dell'intero anno solare precedente (non del mese in corso).


/* ---------------------------------------------------------
   MOTORE FISCALE — a cascata, come NoiPA
   --------------------------------------------------------- */


// Ricostruisce cosa arriva effettivamente sul conto in un dato mese: lo stipendio base si accredita
// il mese successivo a quello lavorato, le indennità accessorie con un mese di ritardo ulteriore.
// La tredicesima invece NON è sfasata: si accredita a dicembre stesso.
// Il calcolo fiscale (contributi/IRPEF/addizionali) qui è una STIMA: nella realtà NoiPA emette due
// cedolini separati (stipendio e accessorio) con trattamento fiscale proprio; qui viene sommato
// il lordo delle due componenti e applicato un unico calcolo, come approssimazione.



/* ---------------------------------------------------------
   UI — TABELLE UFFICIALI
   --------------------------------------------------------- */


/* ---------------------------------------------------------
   UI — ASSENZE DAL SERVIZIO (elenco personalizzabile)
   --------------------------------------------------------- */
/* ---------------------------------------------------------
   UI — SEQUENZA AUTOMATICA TURNI (personalizzabile)
   --------------------------------------------------------- */


/* ---------------------------------------------------------
   COPIA / INCOLLA TURNO — singolo giorno e settimana precedente
   --------------------------------------------------------- */


// Il permesso breve si può consumare in due modi: come assenza a giornata intera (assenzaTipo, come le altre
// AppState.assenze orarie) oppure come permesso parziale dentro un turno lavorato normalmente (campoPermessoBreveAttivo).
// Questa funzione somma entrambe le fonti per il saldo annuo.
// "Ore rimanenti" di Permesso breve: si scala SOLO quando si prende il permesso, e resta scalato
// per sempre — recuperare l'ora lavorandola in seguito non restituisce il "diritto" di prenderne altro,
// serve solo a non perdere la retribuzione di quell'ora (vedi calcolaOreDaRecuperareAnno/OreRecuperateAnno).

// Ore di permesso breve prese ma non ancora recuperate lavorandole (debito residuo verso l'amministrazione).

// Ore di permesso breve già recuperate lavorandole (totale cumulativo dell'anno, non scala mai le ore rimanenti).

// Congedo ordinario: i giorni non goduti al 31/12 si sommano allo spettante del nuovo anno (riporto).
// Uso l'anno più vecchio con AppState.turni salvati come base del calcolo: non conosciamo l'anno di assunzione reale,
// quindi il riporto viene ricostruito solo a partire da lì (limite noto, spiegato in app).


// Elenco (FIFO) delle date di AppState.turni che hanno generato credito per una voce automatica (Recupero riposo/festivo)
// ancora disponibili: le prime date guadagnate sono considerate le prime consumate.


/* ---------------------------------------------------------
   UI — CEDOLINO SIMULATO
   --------------------------------------------------------- */


/* ---------------------------------------------------------
   UI — MODALE TURNO
   --------------------------------------------------------- */


/* ---------------------------------------------------------
   UI — MODALE ANAGRAFICA
   --------------------------------------------------------- */
/* ---------------------------------------------------------
   BADGE GRADO — mostrina semplificata in SVG per qualifica
   (rappresentazione indicativa per categoria, non riproduzione
   ufficiale dei gradi) — truppa: barre rosse; sovrintendenti:
   rombi oro; ispettori: pentagoni oro; funzionari: stelle oro
   --------------------------------------------------------- */
// Parametro stipendiale per qualifica — fonte: tabella incrementi CCNL 2025/2027 (PDF condiviso dall'utente, gennaio 2027)


/* ---------------------------------------------------------
   TEMA
   --------------------------------------------------------- */


/* ---------------------------------------------------------
   INIZIALIZZAZIONE
   --------------------------------------------------------- */
/* ---------------------------------------------------------
   BACKUP — esportazione/importazione completa dei dati
   --------------------------------------------------------- */



// Restituisce lo stesso oggetto dati usato per il backup manuale, riusato anche dal backup su Drive


// ============================================================================
// BACKUP AUTOMATICO SU GOOGLE DRIVE (funzione a pagamento, 1,99€ una tantum)
// ============================================================================
// ATTENZIONE: sostituisci questo segnaposto con il tuo Client ID reale ottenuto
// da Google Cloud Console (vedi setup-google-cloud.md). Senza un Client ID valido
// questa funzione non può attivarsi, ma il resto dell'app funziona normalmente.


 // ogni quanti giorni ritentare il backup automatico

let servizioPlayBilling = null;
let tokenClientGoogle = null;
let tokenAccessoDriveCorrente = null;

// --- Play Billing: verifica se l'utente ha già comprato la funzione ---


// --- Login Google e accesso a Drive (solo file creati da questa app, scope non invasivo) ---



// --- Upload effettivo su Drive: crea o aggiorna un unico file di backup ---



// --- Controllo automatico all'apertura dell'app: se sono passati troppi giorni, ritenta da solo ---


/* ---------------------------------------------------------
   AVVISO / CONFERMA — sostituiscono alert()/confirm() nativi,
   che in alcuni contesti (anteprima in-app, webview) possono
   non mostrarsi e far fallire silenziosamente l'operazione.
   --------------------------------------------------------- */


function inizializza(){
  if(window.TurniPSDataGuard && !TurniPSDataGuard.validate(AppState)) Object.assign(AppState, TurniPSDataGuard.normalize(AppState));
  applicaTema(TurniPSStorage.getItem(CHIAVE_TEMA) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'scuro' : 'chiaro'));
  applicaColoriTurni();
  if(!TurniPSStorage.getItem(CHIAVE_DISCLAIMER_MOSTRATO)){
    mostraAvviso(
      'Questa è un\'app indipendente, non ufficiale e non affiliata alla Polizia di Stato né ad alcun ente pubblico. I valori delle AppState.tabelle sono presi da fonti pubbliche online (siti sindacali, normativa pubblicata) e possono contenere errori o non essere aggiornati. L\'autore declina ogni responsabilità per incongruenze, errori o danni derivanti dall\'uso dell\'app: verifica sempre i dati sul tuo cedolino ufficiale prima di prendere decisioni.',
      'Prima di iniziare'
    );
    TurniPSStorage.setItem(CHIAVE_DISCLAIMER_MOSTRATO, '1');
  }
  aggiornaRiassuntoAnagrafica();
  renderCalendario();
  renderAvvisiApp();
  aggiornaStatoBackup();
  renderSezioneBackupDrive();
  if(typeof inizializzaOffline==='function') inizializzaOffline();
  inizializzaPlayBilling().then(() => renderSezioneBackupDrive());
  // Piccolo ritardo perché la libreria Google (caricata con "defer") abbia il tempo di essere pronta
  setTimeout(() => {
    inizializzaGoogleIdentity();
    controllaBackupDriveAutomatico();
  }, 800);
  if(Object.keys(AppState.turni).length > 0){
    const dataUltimoBackup = TurniPSStorage.getItem(CHIAVE_ULTIMO_BACKUP);
    const giorniPassati = dataUltimoBackup ? Math.floor((new Date() - new Date(dataUltimoBackup)) / 86400000) : Infinity;
    if(giorniPassati >= 30){
      mostraAvviso(dataUltimoBackup
        ? `Sono passati ${giorniPassati} giorni dall'ultimo backup. I tuoi dati vivono solo su questo dispositivo: se lo perdi o cambi telefono senza aver esportato un backup recente, li perdi. Vai su Backup Dati (in fondo a ogni pagina) per esportarne uno nuovo.`
        : `Non hai mai fatto un backup dei tuoi dati. Vivono solo su questo dispositivo: vai su Backup Dati (in fondo a ogni pagina) per esportarne uno.`);
    }
  }

  let timeoutNotaGiorno;
  const _campoNota = el('campoNotaGiorno');
  if(_campoNota) _campoNota.addEventListener('input', () => {
    if(!giornoSelezionato) return;
    clearTimeout(timeoutNotaGiorno);
    timeoutNotaGiorno = setTimeout(() => {
      const testo = el('campoNotaGiorno').value;
      if(testo) AppState.noteGiorni[giornoSelezionato] = testo;
      else delete AppState.noteGiorni[giornoSelezionato];
      salvaNoteGiorniStorage();
    }, 400);
  });

  if(!AppState.anagrafica) mostraScheda('anagrafica');

  el('btnMesePrec').addEventListener('click', () => {
    meseCorrente--; if(meseCorrente < 0){ meseCorrente = 11; annoCorrente--; }
    renderCalendario();
    el('contenitoreCedolino').hidden = true;
  });
  el('btnMeseSucc').addEventListener('click', () => {
    meseCorrente++; if(meseCorrente > 11){ meseCorrente = 0; annoCorrente++; }
    renderCalendario();
    el('contenitoreCedolino').hidden = true;
  });

  el('etichettaMese').addEventListener('click', () => {
    el('campoVaiMese').value = meseCorrente;
    el('campoVaiAnno').value = annoCorrente;
    el('overlayVaiAMese').hidden = false;
  });
  el('btnChiudiVaiAMese').addEventListener('click', () => { el('overlayVaiAMese').hidden = true; });
  el('overlayVaiAMese').addEventListener('click', e => { if(e.target.id === 'overlayVaiAMese') el('overlayVaiAMese').hidden = true; });
  el('btnVaiAMese').addEventListener('click', () => {
    const meseScelto = Number(el('campoVaiMese').value);
    const annoScelto = Number(el('campoVaiAnno').value);
    if(!annoScelto) return;
    meseCorrente = meseScelto; annoCorrente = annoScelto;
    renderCalendario();
    el('contenitoreCedolino').hidden = true;
    el('overlayVaiAMese').hidden = true;
  });
  el('btnVaiOggi').addEventListener('click', () => {
    const adesso = new Date();
    meseCorrente = adesso.getMonth(); annoCorrente = adesso.getFullYear();
    giornoSelezionato = dataISO(adesso);
    renderCalendario();
    el('contenitoreCedolino').hidden = true;
    el('overlayVaiAMese').hidden = true;
  });

  const btnOggiCalendario = el('btnOggiCalendario');
  if(btnOggiCalendario){
    btnOggiCalendario.addEventListener('click', () => {
      const adesso = new Date();
      meseCorrente = adesso.getMonth();
      annoCorrente = adesso.getFullYear();
      giornoSelezionato = dataISO(adesso);
      renderCalendario();
      el('contenitoreCedolino').hidden = true;
    });
  }
  const btnColoriHeader = el('btnApriColoriHeader');
  if(btnColoriHeader){
    btnColoriHeader.addEventListener('click', () => {
      const btn = el('btnApriColoriTurni');
      if(btn) btn.click();
      setTimeout(() => el('pannelloColoriTurni')?.scrollIntoView({behavior:'smooth', block:'nearest'}), 80);
    });
  }

  on('btnImpostazioni','click', () => mostraScheda('impostazioni'));
  on('btnImpostazioniBottom','click', () => mostraScheda('impostazioni'));
  on('btnStatisticheBottom','click', () => mostraScheda('statistiche'));
  on('settingsAnagrafica','click', () => mostraScheda('anagrafica'));
  on('settingsTabelle','click', () => mostraScheda('tabelle'));
  on('settingsColori','click', () => {
    mostraScheda('turni');
    setTimeout(() => { const b=el('btnApriColoriTurni'); if(b && el('pannelloColoriTurni') && el('pannelloColoriTurni').hidden) b.click(); el('pannelloColoriTurni')?.scrollIntoView({behavior:'smooth',block:'center'}); }, 80);
  });
  on('settingsTema','click', () => applicaTema(document.body.dataset.tema === 'scuro' ? 'chiaro' : 'scuro'));
  on('settingsBackup','click', () => mostraImpostazioniBackup('sezioneBackup'));
  on('settingsDrive','click', () => mostraImpostazioniBackup('sezioneBackupDrive'));
  on('btnChiudiSettingsBackup','click', () => { const p=el('impostazioniBackupPanel'); if(p) p.hidden = true; });

  el('btnAnagrafica').addEventListener('click', () => mostraScheda('anagrafica'));
  on('btnStatistiche','click', () => mostraScheda('statistiche'));
  on('btnAggiornaStatistiche','click', renderStatistiche);
  on('campoAnnoStatistiche','change', renderStatistiche);
  el('btnSalvaAnagrafica').addEventListener('click', salvaAnagraficaDaModale);
  el('btnCancellaAnagrafica').addEventListener('click', () => {
    mostraConferma(
      'Questo cancellerà i dati anagrafici salvati (qualifica, anni di servizio, sede, regione, ecc.) e riporterà il form ai valori predefiniti. Turni, assenze, tabelle e cedolini generati non vengono toccati. Continuare?',
      cancellaAnagrafica
    );
  });
  el('campoQualifica').addEventListener('change', aggiornaVisualizzazioneParametro);

  el('btnTabelle').addEventListener('click', () => mostraScheda('tabelle'));
  el('btnSalvaTabelle').addEventListener('click', () => {
    leggiTabelleDaModale();
    mostraScheda('turni');
    aggiornaRiepilogoMensile();
    if(!el('contenitoreCedolino').hidden) renderCedolino();
  });
  el('btnResetTabelle').addEventListener('click', () => {
    AppState.tabelle = clonaTabelleConSoglie(TABELLE_PREDEFINITE);
    renderTabelle();
  });

  el('btnAggiungiAssenza').addEventListener('click', () => {
    AppState.assenze.push({ id: nuovoId(), nome:'Nuova voce', valore:0, unita:'gg', personalizzata:true });
    salvaAssenzeStorage();
    renderAssenze();
  });

  function popolaAzioniRapide(){
    const host = el('azioniRapideAssenze');
    if(!host) return;
    host.innerHTML = (AppState.assenze || []).map(a =>
      `<option value="assenza:${escapeHtml(a.id)}">🗂️ ${escapeHtml(a.nome)}</option>`
    ).join('');
  }

  function preparaAzioneRapida(azione){
    if(!azione) return;
    if(!giornoSelezionato){
      mostraAvviso('Seleziona prima un giorno del calendario.');
      el('azioneRapidaCalendario').value = '';
      return;
    }
    apriModaleTurno(giornoSelezionato);
    const setCheck = (id, value=true) => { const x=el(id); if(x) x.checked=value; };
    if(azione.startsWith('assenza:')){
      const id = azione.slice(8);
      const x=el('campoAssenzaTipo'); if(x) x.value=id;
      setCheck('campoRiposo',false);
      aggiornaVisibilitaCampiOrario(); aggiornaAnteprima();
    } else if(azione==='straordinario'){
      el('campoStrPrimaInizio')?.focus();
    } else if(azione==='permessoBreve'){
      setCheck('campoPermessoBreveAttivo');
      el('campiPermessoBreve').style.display='';
      el('campoPermessoBreveInizio')?.focus();
    } else if(azione==='recuperoPermessoBreve'){
      setCheck('campoRecuperoPermessoBreveAttivo');
      el('campiRecuperoPermessoBreve').style.display='';
      el('campoRecuperoPermessoBreveInizio')?.focus();
    } else {
      const map={missione:'campoMissione',reperibilita:'campoReperibilita',servizioEsterno:'campoServizioEsterno',ordinePubblico:'campoOrdinePubblico',controlloTerritorio:'campoControlloTerritorio',cambioTurno:'campoCambioTurno',compensazioneRiposo:'campoCompensazioneRiposo',recuperoFestivo:'campoRecuperoFestivo',buonoPasto:'campoBuonoPasto',aggiornamentoProfessionale:'campoAggiornamentoProfessionale',addestramentoTiro:'campoAddestramentoTiro'};
      const id=map[azione];
      if(id){
        setCheck(id);
        const target=el(id);
        target?.scrollIntoView({behavior:'smooth',block:'center'});
        target?.focus({preventScroll:true});
        if(azione==='missione' || azione==='ordinePubblico') target.dispatchEvent(new Event('change'));
      }
    }
    el('azioneRapidaCalendario').value='';
  }

  popolaAzioniRapide();
  on('filtroCalendarioSelect','change', e => impostaFiltroCalendario(e.target.value));
  on('azioneRapidaCalendario','change', e => preparaAzioneRapida(e.target.value));

  on('settingsSequenza','click', () => {
    mostraScheda('impostazioni');
    const seq = el('sezioneSequenza');
    const host = el('sezioneSequenzaHost');
    if(host && seq && seq.parentElement !== host) host.appendChild(seq);
    if(seq) seq.hidden = false;
    renderSequenza();
    seq?.scrollIntoView({behavior:'smooth', block:'start'});
  });
  on('btnChiudiSequenza','click', () => {
    const seq = el('sezioneSequenza');
    if(seq) seq.hidden = true;
  });
  on('btnRitornaGeneratoreV44','click', () => {
    const dettagli = el('sezioneSequenza')?.querySelector('.opzioni-avanzate-sequenza');
    if(dettagli) dettagli.open = false;
    el('sezioneSequenza')?.scrollIntoView({behavior:'smooth', block:'start'});
  });
  el('btnAggiungiStepSequenza').addEventListener('click', () => {
    AppState.sequenzaTurni.push({ tipo:'riposo' });
    renderSequenza();
  });
  el('btnGeneraSequenza').addEventListener('click', () => generaSequenzaTurni());
  el('btnContinuaSequenza').addEventListener('click', continuaSequenzaTurni);

  function aggiornaInterfacciaGeneratoreSemplice(){
    const preset=el('campoSequenzaDurataPreset');
    const custom=el('contenitoreGiorniPersonalizzati');
    if(preset && custom) custom.hidden = preset.value !== 'personalizzato';
    aggiornaAnteprimaSequenzaSemplice();
  }

  on('btnApplicaModelloSemplice','click',()=>{
    const scelta=el('selettoreModelloSemplice')?.value;
    if(scelta==='quinta') el('btnModelloTurnoInQuinta')?.click();
    else if(scelta==='quinta10') mostraConferma('Questo sostituirà la sequenza con il modello in quinta di 10 giorni. Continuare?', applicaModelloTurnoInQuinta10);
    else if(scelta==='corta') el('btnModelloSettimanaCorta')?.click();
    else if(scelta==='lunga') el('btnModelloSettimanaLunga')?.click();
    else {
      const dettagli=el('sezioneSequenza')?.querySelector('.opzioni-avanzate-sequenza');
      if(dettagli) dettagli.open=true;
      mostraAvviso('Modalità personalizzata: apri le Opzioni avanzate e imposta i turni giorno per giorno.');
    }
  });

  on('selettoreModelloSemplice','change',()=>{
    const scelta=el('selettoreModelloSemplice')?.value;
    if(scelta!=='personalizzata') aggiornaAnteprimaSequenzaSemplice();
  });

  function aggiornaGiorniDaPreset(){
    const preset = el('campoSequenzaDurataPreset').value;
    if(preset === 'personalizzato') return; // il numero resta quello digitato dall'utente
    const dataInizioStr = el('campoSequenzaDataInizio').value || dataISO(new Date());
    const inizio = new Date(dataInizioStr + 'T00:00:00');
    const fine = new Date(inizio);
    if(preset === 'settimana') fine.setDate(fine.getDate() + 7);
    else if(preset === 'mese') fine.setMonth(fine.getMonth() + 1);
    else if(preset === 'mese3') fine.setMonth(fine.getMonth() + 3);
    else if(preset === 'mese6') fine.setMonth(fine.getMonth() + 6);
    else if(preset === 'mese9') fine.setMonth(fine.getMonth() + 9);
    else if(preset === 'anno') fine.setFullYear(fine.getFullYear() + 1);
    const giorni = Math.round((fine - inizio) / 86400000);
    el('campoSequenzaGiorni').value = Math.min(giorni, 366);
  }
  el('campoSequenzaDurataPreset').addEventListener('change', () => { aggiornaGiorniDaPreset(); aggiornaInterfacciaGeneratoreSemplice(); });
  el('campoSequenzaDataInizio').addEventListener('change', () => { aggiornaGiorniDaPreset(); aggiornaAnteprimaSequenzaSemplice(); });
  el('campoSequenzaGiorni').addEventListener('input', () => { el('campoSequenzaDurataPreset').value = 'personalizzato'; aggiornaInterfacciaGeneratoreSemplice(); });
  aggiornaInterfacciaGeneratoreSemplice();

  el('btnModelloTurnoInQuinta').addEventListener('click', () => {
    mostraConferma(
      'Questo sostituirà tutti i passaggi attuali della sequenza con il turno in quinta predefinito (Sera, Pomeriggio, Mattina, Notte, Riposo). Continuare?',
      applicaModelloTurnoInQuinta
    );
  });
  el('btnModelloSettimanaCorta').addEventListener('click', () => {
    mostraConferma(
      'Questo sostituirà tutti i passaggi attuali della sequenza con il modello settimana corta (7 righe). Continuare?',
      applicaModelloSettimanaCorta
    );
  });
  el('btnModelloSettimanaLunga').addEventListener('click', () => {
    mostraConferma(
      'Questo sostituirà tutti i passaggi attuali della sequenza con il modello settimana lunga (7 righe). Continuare?',
      applicaModelloSettimanaLunga
    );
  });

  el('btnCopiaTurno').addEventListener('click', copiaTurnoCorrente);
  el('btnIncollaTurno').addEventListener('click', incollaTurnoCorrente);
  el('btnCancellaTurniMese').addEventListener('click', cancellaTurniMese);
  el('btnCancellaStorico').addEventListener('click', cancellaStorico);

  el('btnEsportaBackup').addEventListener('click', esportaBackup);
  el('btnImportaBackup').addEventListener('click', () => el('campoImportaBackup').click());
  on('btnAnnullaRipristino','click', () => {
    mostraConferma(
      'Vuoi annullare l’ultimo ripristino e recuperare i dati che erano presenti prima di importare il backup?',
      annullaUltimoRipristino,
      'Annulla ripristino'
    );
  });
  el('campoImportaBackup').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(file){
      try{
        const dati = await leggiBackup(file);
        mostraAnteprimaBackup(file, dati);
        mostraConferma(
          "Il ripristino sostituirà i dati attuali presenti nell'app. Prima di continuare assicurati di avere un backup recente dei dati attuali. Continuare?",
          () => importaBackup(file, dati),
          'Ripristina backup'
        );
      }catch(err){
        const preview=el('backupAnteprima'); if(preview) preview.hidden=true;
        mostraAvviso('Il file selezionato non è un backup valido o è danneggiato.');
      }
    }
    e.target.value = '';
  });

  el('btnGeneraCedolino').addEventListener('click', renderCedolino);
  el('btnGeneraAccreditoConto').addEventListener('click', renderAccreditoConto);
  el('btnStampaCedolino').addEventListener('click', () => window.print());
  el('btnNascondiCedolino').addEventListener('click', () => {
    el('contenitoreCedolino').hidden = true;
    el('contenitoreCedolino').innerHTML = '';
    el('btnStampaCedolino').hidden = true;
    el('btnNascondiCedolino').hidden = true;
  });
  el('btnCancellaAccreditoConto').addEventListener('click', () => {
    el('contenitoreAccreditoConto').hidden = true;
    el('contenitoreAccreditoConto').innerHTML = '';
    el('btnCancellaAccreditoConto').hidden = true;
  });

  el('campoAnnoRiepilogo').value = annoCorrente;
  el('btnCalcolaRiepilogoAnnuale').addEventListener('click', () => {
    const anno = Number(el('campoAnnoRiepilogo').value) || annoCorrente;
    renderRiepilogoAnnuale(anno);
  });
  el('btnCancellaRiepilogoAnnuale').addEventListener('click', () => {
    el('contenitoreRiepilogoAnnuale').hidden = true;
    el('btnCancellaRiepilogoAnnuale').hidden = true;
  });
  el('campoConguagliMese').addEventListener('input', () => {
    AppState.conguagliPerMese[chiaveMese(annoCorrente, meseCorrente)] = Number(el('campoConguagliMese').value) || 0;
    salvaConguagliStorage();
  });
  renderStorico();

  function chiudiPannelloColori(){
    const p = el('pannelloColoriTurni');
    if(p) p.hidden = true;
  }
  function aggiornaPulsantiColoriDrive(){
    const attivo = typeof backupDriveAttivo === 'function' && backupDriveAttivo();
    ['btnEsportaColoriTurni','btnImportaColoriTurni'].forEach(id => {
      const b = el(id);
      if(!b) return;
      b.classList.toggle('btn-premium-bloccato', !attivo);
      b.title = attivo
        ? (id.indexOf('Esporta')>=0 ? 'Esporta i colori su file' : 'Importa colori da file')
        : 'Funzione a pagamento: attiva Backup Drive (1,99€)';
    });
  }
  function apriPannelloColori(){
    const p = el('pannelloColoriTurni');
    if(!p) return;
    p.hidden = false;
    renderColoriTurni();
    aggiornaPulsantiColoriDrive();
    p.scrollIntoView({behavior:'smooth', block:'nearest'});
  }
  el('btnApriColoriTurni').addEventListener('click', () => {
    const p = el('pannelloColoriTurni');
    if(!p) return;
    if(p.hidden) apriPannelloColori();
    else chiudiPannelloColori();
  });
  on('btnChiudiColoriTurni','click', chiudiPannelloColori);
  on('btnChiudiColoriTurni2','click', chiudiPannelloColori);
  on('btnEsportaColoriTurni','click', () => {
    if(typeof esportaBackupColori === 'function') esportaBackupColori();
  });
  on('btnImportaColoriTurni','click', () => {
    const inp = el('campoImportaColoriTurni');
    if(inp) inp.click();
  });
  on('campoImportaColoriTurni','change', (e) => {
    const file = e.target && e.target.files && e.target.files[0];
    if(file && typeof importaBackupColori === 'function') importaBackupColori(file);
    if(e.target) e.target.value = '';
  });
  el('btnRipristinaColoriTurni').addEventListener('click', () => {
    mostraConferma('Questo riporta tutti i colori dei turni ai valori predefiniti. Continuare?', () => {
      AppState.coloriTurni = {};
      CATEGORIE_COLORABILI.forEach(c => { AppState.coloriTurni[c.chiave] = c.predefinito; });
      salvaColoriTurniStorage();
      applicaColoriTurni();
      renderColoriTurni();
      if(typeof renderCalendario === 'function') renderCalendario();
    });
  });

  el('btnChiudiTurno').addEventListener('click', () => { el('pannelloTurno').hidden = true; });

  el('campoRiposo').addEventListener('change', () => {
    if(el('campoRiposo').checked) el('campoAssenzaTipo').value = '';
    aggiornaVisibilitaCampiOrario(); aggiornaAnteprima();
  });
  el('campoAssenzaTipo').addEventListener('change', () => {
    if(el('campoAssenzaTipo').value) el('campoRiposo').checked = false;
    aggiornaVisibilitaCampiOrario(); aggiornaAnteprima();
  });
  el('campoRCOraInizio').addEventListener('input', aggiornaAnteprima);
  el('campoRCOraFine').addEventListener('input', aggiornaAnteprima);

  // Precompilo "alle" dello straordinario prima con l'inizio del turno (di solito coincidono),
  // e "dalle" dello straordinario dopo con la fine del turno — solo se il campo è ancora vuoto.
  el('campoOraInizio').addEventListener('change', () => {
    if(!el('campoStrPrimaFine').value) el('campoStrPrimaFine').value = el('campoOraInizio').value;
  });
  el('campoOraFine').addEventListener('change', () => {
    if(!el('campoStrDopoInizio').value) el('campoStrDopoInizio').value = el('campoOraFine').value;
  });

  el('campoMissione').addEventListener('change', () => {
    const attiva = el('campoMissione').checked;
    el('campoDurataMissioneBox').style.display = attiva ? '' : 'none';
    if(attiva && Number(el('campoDurataMissione').value) === 0){
      // precompilo con le ore totali del turno come punto di partenza, modificabile
      const t = leggiTurnoDalModale();
      const c = classificaTurno(t);
      if(c.oreTotali > 0) el('campoDurataMissione').value = c.oreTotali;
    }
  });

  el('campoOrdinePubblico').addEventListener('change', () => {
    const attivo = el('campoOrdinePubblico').checked;
    el('campoOrdinePubblicoBox').style.display = attivo ? '' : 'none';
    el('campoOPPernottamentoBox').style.display = (attivo && el('campoOPSede').value === 'fuori') ? '' : 'none';
  });
  el('campoOPSede').addEventListener('change', () => {
    el('campoOPPernottamentoBox').style.display = el('campoOPSede').value === 'fuori' ? '' : 'none';
  });

  el('campoModelloTurno').addEventListener('change', () => {
    const scelta = el('campoModelloTurno').value;
    if(!scelta) return;
    if(scelta === 'riposo'){
      el('campoRiposo').checked = true;
      el('campoAssenzaTipo').value = '';
    } else {
      el('campoRiposo').checked = false;
      el('campoAssenzaTipo').value = '';
      el('campoOraInizio').value = MODELLI_TURNO[scelta].oraInizio;
      el('campoOraFine').value = MODELLI_TURNO[scelta].oraFine;
    }
    aggiornaVisibilitaCampiOrario();
    aggiornaAnteprima();
  });
  ['campoOraInizio','campoOraFine','campoStrPrimaInizio','campoStrPrimaFine','campoStrDopoInizio','campoStrDopoFine','campoSecondoOraInizio','campoSecondoOraFine'].forEach(id => {
    el(id).addEventListener('input', aggiornaAnteprima);
  });
  el('campoCompensaStraordinario').addEventListener('change', aggiornaAnteprima);
  el('campoPermessoBreveAttivo').addEventListener('change', () => {
    el('campiPermessoBreve').style.display = el('campoPermessoBreveAttivo').checked ? '' : 'none';
    aggiornaAnteprima();
  });
  el('campoPermessoBreveInizio').addEventListener('input', aggiornaAnteprima);
  el('campoPermessoBreveFine').addEventListener('input', aggiornaAnteprima);
  el('campoRecuperoPermessoBreveAttivo').addEventListener('change', () => {
    el('campiRecuperoPermessoBreve').style.display = el('campoRecuperoPermessoBreveAttivo').checked ? '' : 'none';
    aggiornaAnteprima();
  });
  el('campoRecuperoPermessoBreveInizio').addEventListener('input', aggiornaAnteprima);
  el('campoRecuperoPermessoBreveFine').addEventListener('input', aggiornaAnteprima);
  el('campoSecondoAttivo').addEventListener('change', () => {
    el('campiSecondoSegmento').style.display = el('campoSecondoAttivo').checked ? '' : 'none';
    aggiornaAnteprima();
  });

  el('btnSalvaTurno').addEventListener('click', () => {
    AppState.turni[giornoSelezionato] = leggiTurnoDalModale();
    salvaTurniStorage();
    el('pannelloTurno').hidden = true;
    renderCalendario();
    if(typeof renderStatistiche==='function' && !el('vistaStatistiche')?.hidden) renderStatistiche();
  });
  el('tabTurni').addEventListener('click', () => mostraScheda('turni'));
  el('tabCedolino').addEventListener('click', () => mostraScheda('cedolino'));
  el('tabAssenze').addEventListener('click', () => mostraScheda('assenze'));
  on('btnNavStatistiche','click', () => mostraScheda('statistiche'));
  on('btnNavImpostazioni','click', () => mostraScheda('impostazioni'));
  on('btnImpostazioni','click', () => mostraScheda('impostazioni'));
  on('btnStatistiche','click', () => mostraScheda('statistiche'));


  el('btnFabTurno').addEventListener('click', () => {
    if(giornoSelezionato) apriModaleTurno(giornoSelezionato);
  });

  el('btnRimuoviTurno').addEventListener('click', () => {
    delete AppState.turni[giornoSelezionato];
    salvaTurniStorage();
    el('pannelloTurno').hidden = true;
    renderCalendario();
  });
}

document.addEventListener('DOMContentLoaded', inizializza);

/* ---------------------------------------------------------
   PWA — registrazione service worker (offline + installabile)
   --------------------------------------------------------- */
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Service worker non registrato:', e));
  });
}
