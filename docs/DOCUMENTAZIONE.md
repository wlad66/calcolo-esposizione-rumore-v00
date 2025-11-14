# Calcolatore Livello di Esposizione Rumore

Applicazione web professionale per il calcolo dell'esposizione al rumore secondo D.Lgs. 81/2008 e UNI EN 458:2016.

## Tecnologie Utilizzate

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Shadcn/ui** - Componenti UI
- **React Router** - Navigazione
- **Lucide React** - Icone

### Backend
- **FastAPI** (Python) - Framework web
- **PostgreSQL** - Database
- **JWT** - Autenticazione
- **Resend** - Invio email
- **bcrypt** - Hash password

### Deployment
- **Docker** - Containerizzazione
- **Dokploy** - Platform hosting

## Funzionalità Principali

### 1. Sistema di Autenticazione
- ✅ Registrazione utenti
- ✅ Login con JWT
- ✅ Recupero password via email
- ✅ Protezione route
- ✅ Multi-tenancy (isolamento dati per utente)

### 2. Gestione Aziende
- ✅ CRUD completo aziende
- ✅ Validazione P.IVA con algoritmo checksum completo
- ✅ Validazione Codice Fiscale con tabelle caratteri pari/dispari
- ✅ Feedback visivo real-time (icone verde/rosso)
- ✅ Ricerca e filtri
- ✅ Associazione valutazioni

### 3. Calcolo Esposizione Rumore
- ✅ Inserimento misurazioni multiple con validazione input
- ✅ Validazione range valori (LEQ: 0-140 dB, Durata: 0-480 min, Lpicco: 0-200 dB)
- ✅ Calcolo automatico LEX e Lpicco
- ✅ Classificazione rischio automatica
- ✅ Salvataggio e modifica valutazioni esistenti
- ✅ Storico valutazioni con funzione "Carica per modificare"
- ✅ Conferma eliminazione con dialog
- ✅ Loading states durante salvataggio/export

### 4. Valutazione DPI
- ✅ Database DPI integrato
- ✅ Calcolo attenuazione (metodi HML, SNR, ottava)
- ✅ Validazione input H, M, L e LEX con range values
- ✅ Verifica protezione adeguata
- ✅ Valori personalizzabili
- ✅ Salvataggio e modifica valutazioni esistenti

### 5. Export e Report
- ✅ Export CSV
- ✅ Generazione PDF
- ✅ Generazione Word
- ✅ Report completi con grafici

### 6. Pannello Amministratore
- ✅ Gestione utenti
- ✅ Statistiche per utente
- ✅ Eliminazione utenti e dati
- ✅ Protezione accessi

## Struttura Progetto

```
calcolo-esposizione-rumore-main/
├── backend/                    # Backend FastAPI
│   ├── main.py                # API principale
│   ├── auth.py                # Autenticazione JWT
│   ├── init_db.py             # Inizializzazione DB
│   ├── make_admin.py          # Script gestione admin
│   └── requirements.txt       # Dipendenze Python
│
├── src/                       # Frontend React
│   ├── components/            # Componenti riutilizzabili
│   │   ├── aziende/          # Componenti gestione aziende
│   │   ├── noise/            # Componenti calcolo rumore
│   │   └── ui/               # Componenti UI base
│   ├── contexts/             # Context React
│   │   └── AuthContext.tsx   # Context autenticazione
│   ├── data/                 # Database DPI
│   ├── lib/                  # Utility e API client
│   ├── pages/                # Pagine applicazione
│   │   ├── Index.tsx         # Home - Calcolo
│   │   ├── Aziende.tsx       # Gestione aziende
│   │   ├── Valutazioni.tsx   # Storico valutazioni
│   │   ├── Admin.tsx         # Pannello admin
│   │   ├── Login.tsx         # Login
│   │   ├── Register.tsx      # Registrazione
│   │   ├── ForgotPassword.tsx # Recupero password
│   │   └── ResetPassword.tsx  # Reset password
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
│
├── Dockerfile                # Configurazione Docker
└── package.json              # Dipendenze Node.js
```

## Database Schema

### Tabelle Principali

#### `users`
- Utenti dell'applicazione
- Campi: id, email, password_hash, nome, is_admin, created_at, last_login

#### `aziende`
- Anagrafica aziende
- Campi: id, ragione_sociale, partita_iva, codice_fiscale, indirizzo, user_id

#### `valutazioni_esposizione`
- Valutazioni esposizione rumore salvate
- Campi: id, azienda_id, user_id, mansione, reparto, lex, lpicco, classe_rischio

#### `misurazioni`
- Dettagli misurazioni per ogni valutazione
- Campi: id, valutazione_id, attivita, leq, durata, lpicco

#### `valutazioni_dpi`
- Valutazioni DPI salvate
- Campi: id, azienda_id, user_id, mansione, dpi_selezionato, h, m, l, pnr, leff

#### `password_reset_tokens`
- Token per recupero password
- Campi: id, user_id, token, expires_at, used

## Configurazione

### Variabili d'Ambiente (Backend)

```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=8000
HOST=0.0.0.0

# REQUIRED - Secret key per JWT
# Genera con: python -c 'import secrets; print(secrets.token_urlsafe(32))'
SECRET_KEY=your-secret-key-here-CHANGE-THIS

# CORS - Specificare origine frontend (NON usare * in produzione)
CORS_ORIGINS=http://yourdomain.com

# Email service
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@dominio.it

# Frontend URL per link recupero password
FRONTEND_URL=http://yourdomain.com
```

**IMPORTANTE**: Il file `backend/.env.example` contiene un template completo con tutte le variabili necessarie.

### Variabili d'Ambiente (Frontend)

```env
VITE_API_URL=http://backend-url
```

## Deploy

### Build Locale

```bash
# Frontend
npm install
npm run build

# Backend
cd backend
pip install -r requirements.txt
```

### Docker

```bash
# Build immagine
docker build -t calcolo-rumore .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  -e RESEND_API_KEY=re_... \
  calcolo-rumore
```

### Dokploy

1. Connetti repository GitHub
2. Configura variabili d'ambiente
3. Deploy automatico ad ogni push su `main`

## Script Utility

### Gestione Admin

```bash
# Nel container Docker o locale
python backend/make_admin.py
```

Permette di:
- Visualizzare tutti gli utenti
- Rendere un utente amministratore
- Rimuovere privilegi admin

## Sicurezza

- ✅ Password hashate con bcrypt
- ✅ Autenticazione JWT con SECRET_KEY obbligatoria
- ✅ Token recupero password monouso e con scadenza
- ✅ Validazione input lato client (HTML5 constraints)
- ✅ Validazione input lato server (FastAPI Pydantic)
- ✅ Protezione SQL injection (parametrized queries)
- ✅ CORS configurabile con warning se wildcard
- ✅ Isolamento dati multi-tenant
- ✅ Gestione errori migliorata (messaggi specifici per rete/timeout)
- ✅ Verifica ownership prima di modifiche/eliminazioni

## Miglioramenti Recenti

### Versione 2.0 - Dicembre 2025

#### Sicurezza
- **SECRET_KEY obbligatoria**: Rimossa pericolosa default, ora richiesta da variabile d'ambiente
- **CORS security**: Aggiunto warning se configurato con wildcard in produzione
- **Validazione P.IVA**: Implementato algoritmo checksum completo per Partita IVA italiana
- **Validazione CF**: Implementato algoritmo completo con tabelle caratteri pari/dispari per Codice Fiscale

#### UX Improvements
- **Loading states**: Spinner e testo dinamico durante salvataggio/export valutazioni
- **Feedback visivo**: Icone verde (CheckCircle) e rosso (AlertCircle) per validazione P.IVA/CF in tempo reale
- **Confirmation dialogs**: Dialog di conferma per tutte le operazioni di eliminazione (valutazioni, misurazioni, aziende)
- **Error messages**: Messaggi di errore specifici per problemi di rete, timeout, validazione

#### Funzionalità
- **Modifica valutazioni**: Possibilità di modificare valutazioni esistenti (esposizione e DPI)
  - Endpoint PUT `/api/esposizione/{id}` e `/api/dpi/{id}`
  - Metodi `aggiorna()` nell'API client frontend
  - Pulsante "Carica" nello storico che popola il form per la modifica
  - Cambio dinamico pulsante "Salva" → "Aggiorna"
- **Validazione input migliorata**:
  - LEQ: range 0-140 dB(A) con tooltip
  - Durata: range 0-480 minuti con tooltip
  - Lpicco: range 0-200 dB(C) con tooltip
  - H, M, L (DPI): range 0-50 dB
  - Tutti i campi numerici con step appropriati

#### File Creati/Modificati
- `backend/.env.example` - Template variabili d'ambiente
- `backend/auth.py` - SECRET_KEY obbligatoria
- `backend/main.py` - Endpoint PUT, warning CORS
- `src/lib/api.ts` - Metodi aggiorna(), error handling migliorato
- `src/pages/Index.tsx` - Loading states, edit tracking
- `src/pages/Valutazioni.tsx` - Passa ID per modifica
- `src/components/aziende/AziendaForm.tsx` - Validazione P.IVA/CF completa
- `src/components/noise/MeasurementRow.tsx` - Validazione input, confirmation dialog
- `src/components/noise/DPISelector.tsx` - Validazione input H/M/L/LEX

## Normativa di Riferimento

- **D.Lgs. 81/2008** - Testo Unico sulla Sicurezza sul Lavoro
- **UNI EN 458:2016** - Dispositivi di protezione individuale dell'udito

### Valori di Azione e Limite

- **Valore inferiore di azione**: LEX = 80 dB(A) o Lpicco = 135 dB(C)
- **Valore superiore di azione**: LEX = 85 dB(A) o Lpicco = 137 dB(C)
- **Valore limite di esposizione**: LEX = 87 dB(A) o Lpicco = 140 dB(C)

## Supporto

Per problemi o richieste:
- Email: info@aqrgroup.it
- Repository: https://github.com/wlad66/calcolo-esposizione-rumore-v00

## Licenza

Proprietario: AQR Group
