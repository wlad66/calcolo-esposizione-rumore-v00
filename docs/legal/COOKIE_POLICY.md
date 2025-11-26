# COOKIE POLICY
## SafetyProSuite - Calcolo Esposizione Rumore

**Ultimo aggiornamento**: 26 Novembre 2025

---

## 1. INTRODUZIONE

La presente Cookie Policy descrive come TOKEM LLC ("**noi**", "**nostro**" o "**Azienda**") utilizza i cookie e tecnologie simili sul sito web **safetyprosuite.com** e sull'applicazione web SafetyProSuite.

Questa policy è parte integrante della **Privacy Policy** e dei **Termini e Condizioni di Servizio**.

Continuando a navigare o utilizzare il Servizio, Lei acconsente all'uso dei cookie secondo quanto descritto in questa policy, salvo ove sia richiesto il Suo consenso esplicito.

---

## 2. COSA SONO I COOKIE

### 2.1 Definizione

I **cookie** sono piccoli file di testo che i siti web visitati inviano al browser dell'utente, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla visita successiva.

I cookie sono utilizzati per diverse finalità: esecuzione di autenticazioni informatiche, monitoraggio di sessioni, memorizzazione di informazioni su configurazioni specifiche riguardanti gli utenti, e molto altro.

### 2.2 Tipi di Cookie

#### A) In base alla durata:

- **Cookie di sessione**: Temporanei, memorizzati solo durante la sessione di navigazione e cancellati automaticamente alla chiusura del browser.

- **Cookie persistenti**: Rimangono memorizzati sul dispositivo dell'utente per un periodo di tempo prestabilito (da pochi minuti a diversi anni), anche dopo la chiusura del browser.

#### B) In base alla provenienza:

- **Cookie di prima parte (First-party)**: Impostati direttamente dal sito web che l'utente sta visitando (safetyprosuite.com).

- **Cookie di terza parte (Third-party)**: Impostati da domini diversi dal sito visitato (es. Google Analytics, servizi di pagamento).

#### C) In base alla finalità:

- **Cookie tecnici (essenziali)**: Necessari per il funzionamento del sito.
- **Cookie di preferenze**: Memorizzano le preferenze dell'utente.
- **Cookie analitici**: Raccolgono informazioni aggregate sull'uso del sito.
- **Cookie di marketing**: Utilizzati per tracciare i visitatori e mostrare pubblicità personalizzata.

---

## 3. COOKIE UTILIZZATI DA SAFETYPROSUITE

### 3.1 Cookie Tecnici (Strettamente Necessari)

Questi cookie sono **essenziali** per il funzionamento del Servizio e **non richiedono il Suo consenso** ai sensi dell'Art. 122 del Codice Privacy italiano e della Direttiva ePrivacy.

| Nome Cookie | Tipo | Durata | Finalità | Dominio |
|-------------|------|--------|----------|---------|
| `auth_token` | First-party | Sessione o "Remember me" (30 giorni) | Token JWT per autenticazione utente. Memorizza le credenziali di login per mantenere la sessione attiva. | safetyprosuite.com |
| `session_id` | First-party | Sessione | Identificatore univoco della sessione di navigazione. Necessario per tracciare lo stato dell'applicazione (es. step del wizard di valutazione). | safetyprosuite.com |
| `csrf_token` | First-party | Sessione | Token di protezione Cross-Site Request Forgery (CSRF). Previene attacchi informatici. | safetyprosuite.com |
| `cookie_consent` | First-party | 12 mesi | Memorizza le preferenze dell'utente sui cookie (accettazione/rifiuto). | safetyprosuite.com |

**Nota**: Senza questi cookie, il Servizio non può funzionare correttamente (non sarebbe possibile effettuare il login, salvare valutazioni, o proteggere l'account).

### 3.2 Cookie di Preferenze (Funzionali)

Questi cookie **non sono strettamente necessari**, ma migliorano l'esperienza utente. Richiedono il **consenso esplicito**.

| Nome Cookie | Tipo | Durata | Finalità | Dominio |
|-------------|------|--------|----------|---------|
| `user_preferences` | First-party | 12 mesi | Memorizza le preferenze dell'interfaccia utente (tema scuro/chiaro, lingua, unità di misura dB(A)/dB(C), layout dashboard). | safetyprosuite.com |
| `recent_companies` | First-party | 30 giorni | Memorizza gli ultimi ID di aziende visualizzate per accesso rapido. | safetyprosuite.com |

**Conseguenze del rifiuto**: Il Servizio continuerà a funzionare, ma Le verrà richiesto di impostare le preferenze ad ogni accesso.

### 3.3 Cookie Analitici (Statistiche)

Utilizzati per raccogliere informazioni aggregate sull'uso del Servizio, al fine di migliorare funzionalità e UX. Richiedono il **consenso esplicito** (salvo se anonimizzati secondo Garante Privacy).

#### Google Analytics 4 (GA4)

| Nome Cookie | Tipo | Durata | Finalità | Dominio |
|-------------|------|--------|----------|---------|
| `_ga` | Third-party | 2 anni | Identificatore univoco dell'utente (pseudonimo). Conta visitatori unici. | .safetyprosuite.com |
| `_ga_<container-id>` | Third-party | 2 anni | Mantiene lo stato della sessione di Google Analytics. | .safetyprosuite.com |
| `_gid` | Third-party | 24 ore | Identificatore per distinguere utenti in sessioni brevi. | .safetyprosuite.com |

**Configurazione Privacy-Friendly**:
- **IP anonimizzato**: Gli ultimi ottetti dell'indirizzo IP sono rimossi prima dell'elaborazione.
- **Nessuna condivisione con Google Ads**: I dati analytics **non** sono condivisi per pubblicità.
- **Dati aggregati**: Raccogliamo solo statistiche generali (es. "500 utenti hanno creato una valutazione questa settimana"), mai dati individuali identificabili.

**Informazioni raccolte**:
- Pagine visitate, tempo di permanenza
- Dispositivo utilizzato (desktop/mobile/tablet), browser, sistema operativo
- Sorgente di traffico (es. da quale motore di ricerca)
- Azioni eseguite (es. "click su pulsante Crea Valutazione")

**Privacy Policy di Google**: https://policies.google.com/privacy

**Opt-out da Google Analytics**: Installare il plugin https://tools.google.com/dlpage/gaoptout

### 3.4 Cookie di Marketing e Tracciamento

**ATTUALMENTE NON UTILIZZIAMO** cookie di marketing o retargeting pubblicitario.

In futuro, se dovessimo introdurre tali cookie (es. per campagne pubblicitarie su Google Ads o Facebook):
- Richiederemo il **consenso esplicito e preventivo**
- Aggiorneremo questa Cookie Policy con dettagli specifici
- Forniremo strumenti granulari per gestire il consenso

---

## 4. ALTRE TECNOLOGIE DI TRACCIAMENTO

Oltre ai cookie, utilizziamo:

### 4.1 Local Storage e Session Storage

**Cosa sono**: Spazi di archiviazione locale nel browser (non inviati al server ad ogni richiesta, a differenza dei cookie).

**Utilizzo in SafetyProSuite**:
- **localStorage**: Memorizza temporaneamente dati di bozze di valutazioni non salvate (per evitare perdita dati in caso di chiusura accidentale del browser).
- **sessionStorage**: Cache temporanea di dati durante la sessione (es. elenco aziende caricato, per evitare richieste ripetute al server).

**Dati memorizzati**: Solo dati tecnici e funzionali, **nessun dato personale sensibile**.

**Gestione**: Lei può cancellare Local/Session Storage tramite le impostazioni del browser (Strumenti → Elimina dati di navigazione → Storage locale).

### 4.2 Web Beacons (Pixel Tracking)

**Non utilizziamo attualmente** pixel tracking per email marketing o analytics avanzati.

### 4.3 Fingerprinting

**Non utilizziamo** tecniche di fingerprinting del dispositivo (che identificano l'utente tramite configurazione hardware/software unica).

---

## 5. COOKIE DI TERZE PARTI

Alcuni servizi integrati in SafetyProSuite possono impostare cookie di terza parte:

### 5.1 Servizi di Pagamento

| Servizio | Cookie | Finalità | Privacy Policy |
|----------|--------|----------|----------------|
| **Stripe** | `__stripe_sid`, `__stripe_mid` | Prevenzione frodi, elaborazione pagamenti sicuri (certificato PCI-DSS). | https://stripe.com/privacy |
| **PayPal** | `ts_c`, `tsrce` | Autenticazione sicura, gestione transazioni. | https://www.paypal.com/privacy |

**Nota**: Questi cookie sono impostati **solo durante il processo di pagamento** e sono essenziali per la sicurezza delle transazioni.

### 5.2 CDN e Servizi di Sicurezza

| Servizio | Cookie | Finalità | Privacy Policy |
|----------|--------|----------|----------------|
| **Cloudflare** | `__cfduid`, `cf_clearance` | Protezione da attacchi DDoS, distribuzione contenuti (CDN), sicurezza. | https://www.cloudflare.com/privacypolicy/ |

**Nota**: I cookie Cloudflare **non** raccolgono dati personali identificabili e sono necessari per proteggere il Servizio da attacchi informatici.

### 5.3 Servizi di Assistenza (se abilitati)

Se in futuro integrassimo servizi di live chat o help desk (es. Intercom, Zendesk), aggiorneremo questa sezione.

---

## 6. GESTIONE DEI COOKIE E CONSENSO

### 6.1 Banner Cookie (Primo Accesso)

Al primo accesso a SafetyProSuite, Le verrà mostrato un **banner informativo sui cookie** con le seguenti opzioni:

- **"Accetta tutti"**: Autorizza tutti i cookie (tecnici, preferenze, analytics).
- **"Rifiuta cookie non essenziali"**: Autorizza solo cookie tecnici strettamente necessari.
- **"Personalizza"**: Gestione granulare per categoria di cookie.

### 6.2 Gestione Preferenze Cookie

Lei può modificare in qualsiasi momento le Sue preferenze sui cookie tramite:

**Opzione 1: Pannello Impostazioni nell'Applicazione**
1. Acceda al Suo Account
2. Vada su **Impostazioni** → **Privacy e Cookie**
3. Clicchi su **"Gestisci Preferenze Cookie"**
4. Attivi/disattivi le categorie di cookie secondo le Sue preferenze
5. Salvi le modifiche

**Opzione 2: Link Footer**
In fondo ad ogni pagina: **"Gestisci Cookie"**

**Opzione 3: Impostazioni del Browser**
Tutti i browser consentono di gestire i cookie tramite le impostazioni. Di seguito i link per i browser più comuni:

- **Google Chrome**: Impostazioni → Privacy e sicurezza → Cookie e altri dati dei siti
  https://support.google.com/chrome/answer/95647

- **Mozilla Firefox**: Opzioni → Privacy e sicurezza → Cookie e dati dei siti web
  https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie

- **Safari**: Preferenze → Privacy → Gestisci dati siti web
  https://support.apple.com/it-it/guide/safari/sfri11471/mac

- **Microsoft Edge**: Impostazioni → Cookie e autorizzazioni sito
  https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09

**Modalità di navigazione in incognito/privata**: In questa modalità, i cookie di sessione vengono cancellati automaticamente alla chiusura del browser. **Nota**: Alcune funzionalità di SafetyProSuite potrebbero non funzionare correttamente in modalità incognito.

### 6.3 Conseguenze del Rifiuto

| Categoria Cookie Rifiutata | Conseguenze |
|---------------------------|-------------|
| **Cookie tecnici** | **Non è possibile rifiutarli**. Senza cookie tecnici il Servizio non funziona (impossibile effettuare login). |
| **Cookie di preferenze** | Il Servizio funziona, ma dovrai reimpostare le preferenze (tema, lingua) ad ogni accesso. |
| **Cookie analytics** | Nessun impatto sull'uso del Servizio. Ci aiuteresti di meno a migliorare l'esperienza utente. |
| **Cookie marketing** | Nessun impatto (attualmente non utilizzati). |

---

## 7. COOKIE E DISPOSITIVI MOBILI

Se accedi a SafetyProSuite tramite **app mobile** (iOS/Android) o **browser mobile**:

- I cookie funzionano allo stesso modo dei browser desktop.
- Puoi gestire i cookie tramite le impostazioni del browser mobile.
- L'app può utilizzare **identificatori di dispositivo** (es. IDFA su iOS, Advertising ID su Android) solo se abilitati dall'utente nelle impostazioni di sistema.

**Nota**: SafetyProSuite è attualmente solo web-based (progressive web app - PWA), non ha app native su App Store/Play Store.

---

## 8. DO NOT TRACK (DNT)

Il segnale **"Do Not Track" (DNT)** è un'impostazione del browser che richiede ai siti web di non tracciare l'utente.

**Comportamento di SafetyProSuite**:
- Se il Suo browser invia il segnale DNT, rispettiamo tale preferenza per i **cookie non essenziali** (analytics, marketing).
- I **cookie tecnici** rimangono necessari per il funzionamento del Servizio (conformemente alla normativa).

**Come abilitare DNT**:
- **Chrome**: Impostazioni → Privacy → Invia richiesta "Do Not Track"
- **Firefox**: Opzioni → Privacy → Richiedi ai siti web di non effettuare alcun tracciamento
- **Safari**: Preferenze → Privacy → Blocca tutti i cookie (opzione più restrittiva)

---

## 9. TRASFERIMENTO DATI EXTRA-UE

Alcuni cookie di terza parte (es. Google Analytics, Stripe) comportano il trasferimento di dati verso gli **Stati Uniti** o altri paesi extra-UE.

**Garanzie adottate** (Art. 46 GDPR):
- **Standard Contractual Clauses (SCC)** approvate dalla Commissione Europea
- **EU-US Data Privacy Framework** per fornitori certificati
- **Valutazione del rischio** secondo le Linee Guida EDPB (Transfer Impact Assessment)

Per maggiori dettagli, vedi la **Privacy Policy**, sezione "Trasferimenti Extra-UE".

---

## 10. MODIFICHE ALLA COOKIE POLICY

Potremmo aggiornare questa Cookie Policy per riflettere:
- Modifiche legislative (es. nuove normative europee)
- Introduzione di nuovi cookie o tecnologie
- Feedback degli utenti

**Comunicazione delle modifiche**:
- Notifica nel banner cookie al successivo accesso
- Email agli utenti registrati (per modifiche sostanziali)
- Data "Ultimo aggiornamento" in cima al documento

**Cronologia versioni**: Le versioni precedenti sono disponibili su richiesta a privacy@safetyprosuite.com.

---

## 11. TABELLA RIEPILOGATIVA DI TUTTI I COOKIE

| Nome Cookie | Tipo | Prima/Terza Parte | Durata | Categoria | Consenso Richiesto | Finalità |
|-------------|------|-------------------|--------|-----------|-------------------|----------|
| `auth_token` | HTTP | Prima | 30 giorni | Tecnico | ❌ No | Autenticazione utente |
| `session_id` | HTTP | Prima | Sessione | Tecnico | ❌ No | Gestione sessione |
| `csrf_token` | HTTP | Prima | Sessione | Tecnico | ❌ No | Sicurezza CSRF |
| `cookie_consent` | HTTP | Prima | 12 mesi | Tecnico | ❌ No | Memorizza preferenze cookie |
| `user_preferences` | LocalStorage | Prima | 12 mesi | Preferenze | ✅ Sì | Impostazioni UI |
| `recent_companies` | LocalStorage | Prima | 30 giorni | Preferenze | ✅ Sì | Accesso rapido aziende |
| `_ga` | HTTP | Terza (Google) | 2 anni | Analytics | ✅ Sì | Google Analytics - ID utente |
| `_ga_<id>` | HTTP | Terza (Google) | 2 anni | Analytics | ✅ Sì | Google Analytics - Stato sessione |
| `_gid` | HTTP | Terza (Google) | 24 ore | Analytics | ✅ Sì | Google Analytics - ID breve |
| `__stripe_sid` | HTTP | Terza (Stripe) | 30 minuti | Pagamento | ❌ No (essenziale per pagamento) | Stripe - Sessione pagamento |
| `__stripe_mid` | HTTP | Terza (Stripe) | 1 anno | Pagamento | ❌ No (antifrode) | Stripe - Identificativo merchant |
| `__cfduid` | HTTP | Terza (Cloudflare) | 30 giorni | Sicurezza | ❌ No (sicurezza) | Cloudflare - Protezione DDoS |

**Legenda**:
- ✅ Sì = Consenso esplicito richiesto (può rifiutare)
- ❌ No = Cookie tecnico/essenziale (non richiede consenso)

---

## 12. DOMANDE FREQUENTI (FAQ)

### Q1: Cosa succede se rifiuto tutti i cookie?
**R**: Puoi rifiutare solo i cookie **non essenziali** (preferenze, analytics). I cookie **tecnici** rimangono necessari per il funzionamento (login, sicurezza). Se blocchi anche quelli tramite il browser, il Servizio non funzionerà.

### Q2: I cookie contengono password in chiaro?
**R**: **Assolutamente no**. Il cookie `auth_token` contiene un token JWT crittografato, **mai** la password. Le password sono hashate con bcrypt e mai memorizzate in chiaro.

### Q3: SafetyProSuite traccia la mia posizione GPS?
**R**: **No**. Non utilizziamo geolocalizzazione precisa. L'indirizzo IP (visibile nei log server) può indicare solo la città approssimativa, ed è utilizzato solo per sicurezza (es. rilevare accessi sospetti).

### Q4: Posso scaricare i dati raccolti dai cookie sul mio account?
**R**: I cookie stessi contengono solo identificatori tecnici. I **dati del Suo account** (valutazioni, aziende) sono esportabili tramite la funzione "Esporta i miei dati" nelle Impostazioni (diritto alla portabilità GDPR).

### Q5: I cookie rallentano il browser?
**R**: I cookie sono file molto piccoli (pochi kilobyte). L'impatto sulle prestazioni è trascurabile. Se il browser è lento, è più probabile dipenda da estensioni installate o cache eccessiva.

### Q6: SafetyProSuite utilizza cookie di profilazione?
**R**: **No**. Non creiamo profili individuali per marketing. Google Analytics raccoglie dati aggregati e anonimi solo per statistiche d'uso (es. "quante persone usano la funzione X?"), non per targetizzare pubblicità.

---

## 13. GLOSSARIO

- **Cookie**: File di testo salvato dal browser sul dispositivo dell'utente.
- **Sessione**: Periodo di interazione continua con il sito web, fino alla chiusura del browser.
- **IP anonimizzato**: Indirizzo IP con ultimi cifre rimossi (es. 192.168.1.XXX invece di 192.168.1.123).
- **JWT (JSON Web Token)**: Standard per token di autenticazione sicuri e firmati crittograficamente.
- **CSRF (Cross-Site Request Forgery)**: Attacco informatico che induce l'utente a eseguire azioni non volute.
- **PCI-DSS**: Standard di sicurezza per la gestione di dati di carte di credito.
- **CDN (Content Delivery Network)**: Rete di server distribuiti che velocizza il caricamento dei contenuti.

---

## 14. CONTATTI

Per domande sui cookie o per esercitare i Suoi diritti:

**Data Protection Officer (DPO)**
Email: privacy@safetyprosuite.com

**Assistenza Tecnica**
Email: info@safetyprosuite.com

**Indirizzo Postale**
TOKEM LLC
5500 BENTGRASS DR UNIT 301
34235 SARASOTA (FL) - U.S.A.

**Autorità di Controllo (per reclami)**
- **UE**: Garante per la Protezione dei Dati Personali del Suo Stato membro
- **Italia**: www.garanteprivacy.it

---

*Utilizzando SafetyProSuite e cliccando "Accetta" nel banner cookie, Lei acconsente all'uso dei cookie secondo quanto descritto in questa Cookie Policy.*

**Data ultimo aggiornamento**: 26 Novembre 2025
**Versione**: 1.0
