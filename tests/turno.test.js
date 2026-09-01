'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { caricaApp } = require('./helpers/load-app.js');

test('classificaTurno: turno semplice senza straordinario (13:00-19:00, 6 ore)', () => {
  const app = caricaApp();
  const turno = { data: '2026-08-27', oraInizio: '13:00', oraFine: '19:00' };
  const c = app.classificaTurno(turno);
  assert.equal(c.oreTotali, 6);
  assert.equal(app.totaleStraordinario(c), 0);
});

test('classificaTurno + totaleStraordinario: 6h base + 3h straordinario — regressione doppio conteggio', () => {
  // Caso reale segnalato dall'utente: turno 13:00-19:00 (6h) con 3h di straordinario dopo la fine.
  // Bug storico: "Totale giorno" veniva calcolato come oreTotali (già comprensivo dello
  // straordinario, quindi 9) + straordinario (3) = 12, invece di 9.
  const app = caricaApp();
  const turno = {
    data: '2026-08-27', oraInizio: '13:00', oraFine: '19:00',
    straordinarioDopoInizio: '19:00', straordinarioDopoFine: '22:00'
  };
  const c = app.classificaTurno(turno);
  const straordinario = app.totaleStraordinario(c);
  const oreOrdinarie = Math.max(0, Number(c.oreTotali || 0) - straordinario);
  const totaleGiorno = Number(c.oreTotali || 0);

  assert.equal(oreOrdinarie, 6, 'le ore ordinarie devono essere 6, non 9');
  assert.equal(straordinario, 3, 'lo straordinario deve essere 3');
  assert.equal(totaleGiorno, 9, 'il totale giorno deve essere 9 (6+3), non 12 (doppio conteggio)');
});

test('classificaTurno: turno notturno che attraversa la mezzanotte', () => {
  const app = caricaApp();
  const turno = { data: '2026-08-27', oraInizio: '19:00', oraFine: '01:00' };
  const c = app.classificaTurno(turno);
  assert.equal(c.oreTotali, 6);
});

test('classificaTurno: giorno di riposo restituisce zero ore', () => {
  const app = caricaApp();
  const c = app.classificaTurno({ data: '2026-08-27', riposo: true });
  assert.equal(c.oreTotali, 0);
});

test('classificaTurno: giorno di assenza restituisce zero ore', () => {
  const app = caricaApp();
  const c = app.classificaTurno({ data: '2026-08-27', assenzaTipo: 'ferie' });
  assert.equal(c.oreTotali, 0);
});

test('classificaTurno: stesso orario di inizio e fine viene interpretato come turno di 24 ore esatte (non genera errore)', () => {
  // Nota tecnica: con la logica attuale (riporto al giorno dopo se l'orario di fine
  // non è successivo a quello di inizio), la durata massima possibile è ESATTAMENTE 24h:
  // non è mai raggiungibile un valore superiore. Il controllo "oltre 24 ore" nel codice
  // è quindi difensivo ma di fatto irraggiungibile con i soli orari inizio/fine di oggi.
  const app = caricaApp();
  const c = app.classificaTurno({ data: '2026-08-27', oraInizio: '08:00', oraFine: '08:00' });
  assert.equal(c.errore, null);
  assert.equal(c.oreTotali, 24);
});

test('categoriaTurno: riconosce correttamente mattina/pomeriggio/sera/notte', () => {
  const app = caricaApp();
  assert.equal(app.categoriaTurno('07:00', '13:00', '2026-08-27'), 'mattina');
  assert.equal(app.categoriaTurno('13:00', '19:00', '2026-08-27'), 'pomeriggio');
  assert.equal(app.categoriaTurno('19:00', '01:00', '2026-08-27'), 'sera');
  assert.equal(app.categoriaTurno('00:00', '07:00', '2026-08-27'), 'notte');
});

test('formatOreMinuti: converte correttamente ore decimali in formato h:mm', () => {
  const app = caricaApp();
  assert.equal(app.formatOreMinuti(6), '6:00');
  assert.equal(app.formatOreMinuti(9), '9:00');
  assert.equal(app.formatOreMinuti(6.5), '6:30');
  assert.equal(app.formatOreMinuti(0), '0:00');
});
