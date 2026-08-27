# Turni & Accessorio PS

App **PWA** per la gestione personale di turni, assenze e simulazione cedolino, pensata per operatori della Polizia di Stato.

> **Progetto indipendente, non ufficiale e non affiliato alla Polizia di Stato né ad alcun ente pubblico.**  
> I valori delle tabelle sono indicativi (fonti pubbliche). Verifica sempre sul cedolino ufficiale prima di decisioni economiche.

**Versione:** 1.0.42

---

## Funzionalità

- **Calendario turni** — inserimento manuale o sequenza automatica (es. turno in quinta)
- **Classificazione ore** — ordinarie, notturne, festive, domenicali, straordinari
- **Assenze** — saldi personalizzabili (congedo, permesso breve, ecc.)
- **Cedolino simulato** — competenze, stima fiscale e netto indicativo
- **Colori turni** — personalizzabili per categoria (colore su tutta la casella)
- **Backup** — export/import JSON locale; opzione backup Google Drive
- **Offline** — Service Worker, installabile come PWA
- **Tema** chiaro / scuro

---

## Avvio rapido (web / GitHub Pages)

1. Pubblica la root del repository su **GitHub Pages** (branch `main`, cartella `/`).
2. Apri l’URL del sito.
3. Dopo un aggiornamento: **hard refresh** (`Ctrl+Shift+R` / su mobile svuota cache del sito) per aggiornare il Service Worker.

In locale puoi aprire `index.html` con un server statico (consigliato, non `file://`):

```bash
npx serve .
# oppure
python3 -m http.server 8080
```

---

## Struttura del progetto

```text
index.html          # UI principale + caricamento moduli
style.css           # Stili (mobile-first, tema scuro)
script.js           # Inizializzazione e wiring eventi
sw.js               # Service Worker (cache app shell)
manifest.json       # Manifest PWA
package.json        # Dipendenze Capacitor
capacitor.config.json
icons/              # Icone PWA
js/
├── config.js       # Chiavi localStorage
├── state.js        # AppState
├── storage.js      # Adapter persistenza (TurniPSStorage)
├── utils.js
├── calendar.js     # Calendario e festività
├── shifts.js       # Turni, colori, editor
├── absences.js
├── sequence.js     # Sequenza automatica
├── payroll.js      # Motore cedolino
├── tables.js
├── profile.js      # Anagrafica
├── backup.js
├── ui.js
├── dashboard.js
├── statistics.js
├── data/tabelle-2026.js
└── …               # offline, security, audit, android, migrations
```

---

## Navigazione (schede)

Solo **icone** nella barra:

| Icona | Sezione        |
|-------|----------------|
| 📅    | Turni          |
| 🗂️    | Assenze        |
| 📊    | Tabelle        |
| 💶    | Cedolino       |
| 🌓    | Tema           |
| 📈    | Statistiche    |
| ⚙️    | Impostazioni   |

- **Anagrafica**, **Backup** e **Colori** si raggiungono da Impostazioni (o dal pulsante Colori nel calendario).
- Su **smartphone** il calendario mostra soprattutto le **sigle** (M, P, S, N, R, …).

---

## Colori turni

Apri **🎨 Colori turni** nel calendario.

| Categoria   | Predefinito        | Dove si vede      |
|-------------|--------------------|-------------------|
| Mattina     | arancione chiaro   | tutta la casella  |
| Pomeriggio  | giallo ambrato     | tutta la casella  |
| Sera        | viola chiaro       | tutta la casella  |
| Notte       | blu chiaro         | tutta la casella  |
| Riposo      | verde soft         | tutta la casella  |
| Assenze     | grigio             | tutta la casella  |

- Tocca il quadrato colore per cambiare.
- **✕** o **Fatto — torna al calendario** per chiudere la tavolozza.
- **↺ Ripristina predefiniti** per tornare ai colori di fabbrica.
- **☁ Esporta / Importa colori** — solo con **Backup Drive** a pagamento (1,99€); i colori viaggiano anche nel backup automatico su Drive.
- Il backup JSON locale gratuito non include i colori (restano sul dispositivo).
- I colori sono salvati in `localStorage` e restano dopo il refresh.

**Nota:** le **assenze** hanno il **numero del giorno barrato**; i riposi no.

---

## Dati e privacy

- I dati restano **solo sul dispositivo** (browser / app), nelle chiavi `simCedolino_*`.
- Fai **backup JSON** periodicamente da Impostazioni → Backup locale.
- Un cambio telefono o la cancellazione dati del browser **cancella** i turni se non hai un backup esterno.

---

## Android / PWABuilder

```bash
npm install
Genera il pacchetto Android con PWABuilder/TWA dopo aver verificato manifest e Service Worker
```

- `appId`: `it.turniaccessoriops.app`
- `webDir`: `.` (root del progetto)

---

## Sviluppo e fix recenti (V40.1)

Refactoring modulare (Fase 1) + correzioni UI:

- caricamento corretto di tutti i moduli `js/` da `index.html`
- backup visibile **solo** in Impostazioni
- barra navigazione a sole icone
- calendario mobile leggibile (sigle)
- colori turni applicati a celle e badge (variabili CSS)
- binding eventi null-safe

I file `README-FASE*.md` / `README-FIX.md` storici sono sostituiti da **questo unico README**.

---

## Disclaimer

Questa app è uno strumento di supporto personale. Non sostituisce NoiPA, il cedolino ufficiale o comunicazioni dell’amministrazione. L’autore non è responsabile di errori, omissioni o decisioni basate sui dati simulati.
