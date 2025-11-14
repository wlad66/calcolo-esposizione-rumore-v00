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
- ✅ Validazione P.IVA e CF
- ✅ Ricerca e filtri
- ✅ Associazione valutazioni

### 3. Calcolo Esposizione Rumore
- ✅ Inserimento misurazioni multiple
- ✅ Calcolo automatico LEX e Lpicco
- ✅ Classificazione rischio automatica
- ✅ Salvataggio valutazioni
- ✅ Storico valutazioni

### 4. Valutazione DPI
- ✅ Database DPI integrato
- ✅ Calcolo attenuazione (metodi HML, SNR, ottava)
- ✅ Verifica protezione adeguata
- ✅ Valori personalizzabili

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
CORS_ORIGINS=*
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@dominio.it
FRONTEND_URL=http://yourdomain.com
```

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
- ✅ Autenticazione JWT
- ✅ Token recupero password monouso e con scadenza
- ✅ Validazione input lato server
- ✅ Protezione SQL injection (parametrized queries)
- ✅ CORS configurabile
- ✅ Isolamento dati multi-tenant

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
