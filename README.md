# 🔊 Calcolatore Esposizione Rumore

> Applicazione web professionale per il calcolo dell'esposizione al rumore secondo **D.Lgs. 81/2008** e **UNI EN 458:2016**

[![Production](https://img.shields.io/badge/Production-Online-success)](https://rumore.safetyprosuite.com)
[![License](https://img.shields.io/badge/License-Proprietary-blue)]()
[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green?logo=fastapi)](https://fastapi.tiangolo.com/)

---

## 🌐 Applicazione Live

**Produzione:** [https://rumore.safetyprosuite.com](https://rumore.safetyprosuite.com) 🔒

---

## 📋 Descrizione

Sistema web completo per la valutazione dell'esposizione al rumore occupazionale conforme alla normativa italiana sulla sicurezza sul lavoro. L'applicazione permette a professionisti della sicurezza, consulenti acustici e responsabili RSPP di:

- Calcolare il livello di esposizione giornaliera (LEX) e il livello di picco (Lpicco)
- Valutare l'efficacia dei dispositivi di protezione individuale (DPI) uditivi
- Generare report professionali in formato CSV, PDF e Word
- Archiviare e gestire documentazione tecnica
- Gestire anagrafica aziende con validazione fiscale italiana

---

## ✨ Funzionalità Principali

### 🎯 Calcolo Esposizione Rumore
- ✅ Inserimento misurazioni multiple con durata personalizzata
- ✅ Calcolo automatico **LEX** e **Lpicco** secondo D.Lgs. 81/2008
- ✅ Classificazione automatica del rischio (verde/giallo/rosso)
- ✅ Storico completo delle valutazioni con funzione modifica

### 🎧 Valutazione DPI Uditivi
- ✅ Database integrato con 20+ DPI commerciali (3M E-A-R, Peltor, ecc.)
- ✅ Calcolo attenuazione con metodi **HML**, **SNR** e **analisi per bande di ottava**
- ✅ Verifica automatica dell'adeguatezza della protezione
- ✅ Supporto valori personalizzati

### 🏢 Gestione Aziende
- ✅ CRUD completo anagrafica aziende
- ✅ Validazione **Partita IVA** (algoritmo checksum completo)
- ✅ Validazione **Codice Fiscale** (tabelle caratteri pari/dispari)
- ✅ Feedback visivo real-time su validità dati

### 📄 Export e Reportistica
- ✅ Export **CSV** per analisi dati
- ✅ Generazione **PDF** professionale con grafici
- ✅ Generazione **Word** (.docx) editabile
- ✅ Report completi con branding personalizzato

### 🔐 Sicurezza e Autenticazione
- ✅ Sistema autenticazione **JWT** (validità 7 giorni)
- ✅ Password hashate con **bcrypt**
- ✅ Recupero password via email con template professionale
- ✅ **Multi-tenancy** con isolamento completo dati per utente

### 💾 Archiviazione Documenti
- ✅ Upload su **Backblaze B2** (storage S3-compatible)
- ✅ Gestione permessi per utente
- ✅ Download e visualizzazione documenti archiviati

### 👨‍💼 Pannello Amministratore
- ✅ Gestione utenti con statistiche
- ✅ Eliminazione utenti e dati associati
- ✅ Monitoraggio attività

---

## 🚀 Quick Start

### Prerequisiti

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/))

### 1️⃣ Clone Repository

```bash
git clone https://github.com/wlad66/calcolo-esposizione-rumore-v00.git
cd calcolo-esposizione-rumore-v00
```

### 2️⃣ Setup Frontend

```bash
# Installa dipendenze
npm install

# Avvia dev server (http://localhost:5173)
npm run dev
```

### 3️⃣ Setup Backend

```bash
# Naviga in backend
cd backend

# Crea virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Installa dipendenze
pip install -r requirements.txt

# Configura variabili d'ambiente
cp .env.example .env
# Modifica .env con le tue credenziali

# Inizializza database
python init_db.py

# Avvia server (http://localhost:8000)
uvicorn main:app --reload
```

### 4️⃣ Accedi all'Applicazione

Apri il browser su **http://localhost:5173**

---

## 🛠️ Stack Tecnologico

### Frontend
- **Framework:** React 18.3 + TypeScript
- **Build Tool:** Vite 5.4
- **UI Library:** Shadcn/ui (Radix UI primitives)
- **Styling:** TailwindCSS 3.4
- **Routing:** React Router 6
- **Icons:** Lucide React
- **Charts:** Recharts
- **Export:** jsPDF + docx

### Backend
- **Framework:** FastAPI 0.109 (Python 3.11)
- **Server:** Uvicorn (ASGI)
- **Database:** PostgreSQL 15
- **ORM:** Direct SQL (psycopg2)
- **Auth:** JWT (python-jose + bcrypt)
- **Email:** SMTP (Hostinger)
- **Storage:** Boto3 (Backblaze B2)
- **Payments:** Stripe SDK

### Infrastructure
- **Containerization:** Docker
- **Platform:** Dokploy (Docker Swarm)
- **Reverse Proxy:** Nginx
- **SSL/TLS:** Let's Encrypt
- **VPS:** Ubuntu/Debian

---

## 📚 Documentazione

Documentazione completa disponibile in [`/docs`](./docs):

| Documento | Descrizione | Target |
|-----------|-------------|--------|
| **[DOCUMENTAZIONE.md](./docs/DOCUMENTAZIONE.md)** | Overview funzionalità, architettura e deployment | Business, PM, Overview |
| **[MANUALE_TECNICO.md](./docs/MANUALE_TECNICO.md)** | Guida operativa completa per sviluppatori | Sviluppatori, DevOps |
| **[PIANO_PRICING.md](./docs/PIANO_PRICING.md)** | Strategia prezzi e piani abbonamento | Business |
| **[STRIPE_SETUP_GUIDE.md](./docs/STRIPE_SETUP_GUIDE.md)** | Configurazione pagamenti Stripe | DevOps |

### 📖 Link Rapidi

- **Setup Sviluppo:** [MANUALE_TECNICO.md § 4](./docs/MANUALE_TECNICO.md#4-setup-ambiente-di-sviluppo)
- **Deploy VPS:** [MANUALE_TECNICO.md § 7](./docs/MANUALE_TECNICO.md#7-deploy-su-vps)
- **Troubleshooting:** [MANUALE_TECNICO.md § 10](./docs/MANUALE_TECNICO.md#10-manutenzione-e-troubleshooting)
- **Database Schema:** [MANUALE_TECNICO.md § 5](./docs/MANUALE_TECNICO.md#5-database)
- **API Endpoints:** [MANUALE_TECNICO.md § 12.1](./docs/MANUALE_TECNICO.md#121-endpoints-api-completi)

---

## 🗂️ Struttura Progetto

```
calcolo-esposizione-rumore-main/
│
├── backend/                    # Backend FastAPI
│   ├── main.py                # API principale (1600+ righe)
│   ├── auth.py                # Autenticazione JWT
│   ├── storage.py             # Backblaze B2 integration
│   ├── stripe_service.py      # Stripe operations
│   ├── subscriptions.py       # Subscription management
│   ├── requirements.txt       # Python dependencies
│   └── migrations/            # SQL migrations
│
├── src/                       # Frontend React
│   ├── pages/                # Route pages
│   ├── components/           # Reusable components
│   ├── contexts/             # React Context
│   ├── lib/                  # API client + utilities
│   ├── data/                 # DPI database
│   └── utils/                # Business logic
│
├── docs/                      # Documentation
│   ├── MANUALE_TECNICO.md    # Technical manual
│   ├── DOCUMENTAZIONE.md     # Feature documentation
│   └── legal/                # Legal documents
│
├── Dockerfile                # Multi-stage build
├── package.json              # Frontend dependencies
├── vite.config.ts            # Vite configuration
└── tailwind.config.ts        # TailwindCSS config
```

---

## 🔧 Configurazione

### Variabili d'Ambiente Essenziali

Crea `backend/.env` con:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rumore_db

# Security (REQUIRED)
SECRET_KEY=<genera_con_secrets.token_urlsafe(32)>

# SMTP Email
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@safetyprosuite.com
SMTP_PASSWORD=your_password
SMTP_FROM_EMAIL=noreply@safetyprosuite.com
SMTP_FROM_NAME=Safety Pro Suite

# Frontend URL
FRONTEND_URL=http://localhost:5173

# CORS
CORS_ORIGINS=http://localhost:5173
```

Vedi [`backend/.env.example`](./backend/.env.example) per configurazione completa.

---

## 🐳 Deploy con Docker

### Build Immagine

```bash
docker build -t calcolo-rumore .
```

### Run Container

```bash
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  -e SECRET_KEY=... \
  -e SMTP_HOST=smtp.hostinger.com \
  -e SMTP_PORT=465 \
  -e SMTP_USER=noreply@safetyprosuite.com \
  -e SMTP_PASSWORD=... \
  calcolo-rumore
```

### Deploy su VPS

Guida completa: [MANUALE_TECNICO.md § 7](./docs/MANUALE_TECNICO.md#7-deploy-su-vps)

---

## 📊 Database Schema

### Tabelle Principali

- **users** - Utenti dell'applicazione
- **aziende** - Anagrafica aziende
- **valutazioni_esposizione** - Valutazioni rumore salvate
- **misurazioni** - Dettagli misurazioni
- **valutazioni_dpi** - Valutazioni DPI salvate
- **documenti** - Documenti archiviati (Backblaze B2)
- **subscription_plans** - Piani abbonamento
- **user_subscriptions** - Abbonamenti utenti

Schema completo: [MANUALE_TECNICO.md § 5](./docs/MANUALE_TECNICO.md#5-database)

---

## 🔐 Sicurezza

- ✅ Password hashate con **bcrypt** (cost factor 12)
- ✅ Autenticazione **JWT** con SECRET_KEY obbligatoria
- ✅ Token reset password monouso con scadenza 1 ora
- ✅ Validazione input client-side (HTML5) + server-side (Pydantic)
- ✅ Protezione **SQL injection** (parametrized queries)
- ✅ **CORS** configurabile (no wildcard in produzione)
- ✅ **Multi-tenancy** con isolamento dati per utente
- ✅ Verifica ownership prima di modifiche/eliminazioni

---

## 📈 Performance

- ⚡ Tempo risposta API: ~200-500ms
- ⚡ Build frontend: ~10 secondi
- ⚡ Caricamento pagina: ~1-2 secondi
- ⚡ Database queries ottimizzate con indici

---

## 🧪 Testing

```bash
# Frontend tests (TODO)
npm run test

# Backend tests (TODO)
cd backend
pytest
```

---

## 📝 Normativa di Riferimento

### D.Lgs. 81/2008 - Valori di Azione e Limite

| Parametro | Valore Inferiore | Valore Superiore | Valore Limite |
|-----------|------------------|------------------|---------------|
| **LEX** | 80 dB(A) | 85 dB(A) | 87 dB(A) |
| **Lpicco** | 135 dB(C) | 137 dB(C) | 140 dB(C) |

### UNI EN 458:2016 - Metodi Valutazione DPI

- **Metodo HML** (High/Medium/Low frequency)
- **Metodo SNR** (Single Number Rating)
- **Metodo Ottava** (Analisi per bande di frequenza)

---

## 🤝 Contribuire

Il progetto è **proprietario** di AQR Group. Per contributi o modifiche, contattare:

- **Email:** info@aqrgroup.it
- **Repository:** [GitHub](https://github.com/wlad66/calcolo-esposizione-rumore-v00)

---

## 📞 Supporto

### Contatti

- **Email Tecnico:** info@aqrgroup.it
- **Sito Web:** https://rumore.safetyprosuite.com
- **Repository:** https://github.com/wlad66/calcolo-esposizione-rumore-v00

### Risorse Utili

- [Documentazione Tecnica](./docs/MANUALE_TECNICO.md)
- [D.Lgs. 81/2008](https://www.lavoro.gov.it/documenti-e-norme/normative/Documents/2008/20080409_DLgs_81.pdf)
- [UNI EN 458:2016](https://www.uni.com/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)

---

## 📄 Licenza

**Proprietario:** AQR Group

Tutti i diritti riservati. Questo software è proprietario e non può essere utilizzato, copiato, modificato o distribuito senza autorizzazione esplicita del proprietario.

---

## 🏆 Crediti

**Sviluppato da:** AQR Group
**Anno:** 2024
**Versione:** 2.0

---

<div align="center">

**[⬆ Torna su](#-calcolatore-esposizione-rumore)**

Made with ❤️ by AQR Group

</div>
