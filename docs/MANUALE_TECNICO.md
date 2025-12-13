# Manuale Tecnico - Calcolo Esposizione Rumore

**Versione:** 1.0
**Data:** Dicembre 2024
**Proprietario:** AQR Group
**URL Produzione:** https://rumore.safetyprosuite.com/

---

## Indice

1. [Panoramica Architettura](#1-panoramica-architettura)
2. [Stack Tecnologico](#2-stack-tecnologico)
3. [Struttura del Progetto](#3-struttura-del-progetto)
4. [Setup Ambiente di Sviluppo](#4-setup-ambiente-di-sviluppo)
5. [Database](#5-database)
6. [Servizi Esterni](#6-servizi-esterni)
7. [Deploy su VPS](#7-deploy-su-vps)
8. [Gestione Container Docker](#8-gestione-container-docker)
9. [Configurazioni](#9-configurazioni)
10. [Manutenzione e Troubleshooting](#10-manutenzione-e-troubleshooting)
11. [Best Practices](#11-best-practices)
12. [Appendici](#12-appendici)

---

## 1. Panoramica Architettura

### 1.1 Architettura Generale

L'applicazione segue un'architettura **client-server** con separazione netta tra frontend e backend:

```
┌─────────────────┐
│   Browser       │
│   (React SPA)   │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   Nginx         │ ◄─── Reverse Proxy + SSL (Let's Encrypt)
│   (Traefik)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI        │ ◄─── Backend Python (Docker)
│  Backend        │
└────┬────────────┘
     │
     ├──────────┐
     │          │
     ▼          ▼
┌─────────┐  ┌──────────────┐
│PostgreSQL│  │Servizi Esterni│
│Database  │  │- SMTP        │
└──────────┘  │- Stripe      │
              │- Backblaze B2│
              └──────────────┘
```

### 1.2 Componenti Principali

| Componente | Tecnologia | Funzione |
|------------|-----------|----------|
| **Frontend** | React 18 + TypeScript | Interfaccia utente SPA |
| **Backend** | FastAPI (Python 3.11) | REST API + Business Logic |
| **Database** | PostgreSQL 15 | Storage dati persistenti |
| **Reverse Proxy** | Nginx/Traefik | Routing + SSL termination |
| **Container** | Docker Swarm | Orchestrazione container |
| **Platform** | Dokploy | Deployment e gestione |

### 1.3 Caratteristiche Chiave

- **Multi-tenancy**: Isolamento completo dei dati per utente
- **Subscription-based**: 4 piani tariffari con Stripe
- **Document Storage**: Upload su Backblaze B2 (S3-compatible)
- **Email Transazionali**: SMTP via Hostinger
- **Autenticazione**: JWT con validità 7 giorni
- **Conformità**: D.Lgs. 81/2008 + UNI EN 458:2016

---

## 2. Stack Tecnologico

### 2.1 Frontend

```json
{
  "runtime": "Node.js 20",
  "framework": "React 18.3",
  "language": "TypeScript 5.x",
  "bundler": "Vite 5.4",
  "styling": "TailwindCSS 3.4",
  "ui": "Shadcn/ui (Radix UI)",
  "routing": "React Router 6",
  "http": "Fetch API",
  "icons": "Lucide React"
}
```

**Dipendenze Principali:**
- `react` + `react-dom` v18.3
- `vite` v5.4 (build tool)
- `tailwindcss` v3.4
- `@radix-ui/*` (componenti UI)
- `jspdf` + `docx` (export documenti)
- `recharts` (grafici)

### 2.2 Backend

```python
{
  "runtime": "Python 3.11",
  "framework": "FastAPI 0.109.2",
  "server": "Uvicorn 0.27.1",
  "database_driver": "psycopg2-binary 2.9.9",
  "auth": "python-jose + passlib + bcrypt",
  "validation": "Pydantic v2"
}
```

**Dipendenze Principali:**
```txt
fastapi==0.109.2
uvicorn[standard]==0.27.1
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib==1.7.4
bcrypt==4.0.1
boto3==1.34.0          # Backblaze B2
stripe==7.8.0          # Pagamenti
python-multipart==0.0.9
email-validator==2.1.0
```

### 2.3 Infrastruttura VPS

| Componente | Versione | Note |
|-----------|----------|------|
| OS | Ubuntu/Debian | VPS IP: 72.61.189.136 |
| Docker | Latest | Swarm mode attivo |
| Dokploy | Latest | /etc/dokploy |
| PostgreSQL | 15 | Container dedicato |
| Nginx | Latest | Gestito da Dokploy/Traefik |

---

## 3. Struttura del Progetto

### 3.1 Albero delle Directory

```
calcolo-esposizione-rumore-main/
│
├── backend/                    # Backend Python
│   ├── main.py                # API principale (1600+ righe)
│   ├── auth.py                # JWT + password hashing
│   ├── storage.py             # Backblaze B2 client
│   ├── stripe_service.py      # Stripe operations
│   ├── stripe_webhooks.py     # Webhook handlers
│   ├── subscriptions.py       # Subscription router
│   ├── init_db.py             # Database initialization
│   ├── requirements.txt       # Dipendenze Python
│   ├── Dockerfile            # (non usato, usa root Dockerfile)
│   ├── .env                   # Variabili ambiente (LOCALE - NON COMMITTARE)
│   ├── .env.example          # Template variabili
│   ├── migrations/           # SQL migrations
│   │   ├── 003_create_subscriptions.sql
│   │   └── 004_add_stripe_fields.sql
│   └── test_smtp.py          # Script test email
│
├── src/                       # Frontend React
│   ├── pages/                # Pagine route
│   │   ├── Index.tsx        # Home (calcolatore)
│   │   ├── Aziende.tsx      # Gestione aziende
│   │   ├── Valutazioni.tsx  # Storico valutazioni
│   │   ├── Admin.tsx        # Pannello admin
│   │   ├── Login.tsx        # Login
│   │   ├── Register.tsx     # Registrazione
│   │   ├── Pricing.tsx      # Pricing + Stripe checkout
│   │   └── ...
│   │
│   ├── components/           # Componenti riutilizzabili
│   │   ├── aziende/         # Gestione aziende
│   │   ├── noise/           # Calcoli rumore
│   │   ├── ui/              # Base UI (Shadcn)
│   │   └── ...
│   │
│   ├── contexts/            # React Context
│   │   └── AuthContext.tsx
│   │
│   ├── lib/                 # Utilities
│   │   ├── api.ts          # Client API centralizzato
│   │   └── utils.ts        # Helper functions
│   │
│   ├── data/               # Dati statici
│   │   └── dpiDatabase.ts  # DB DPI
│   │
│   ├── utils/              # Business logic
│   │   ├── noiseCalculations.ts  # Calcoli LEX/Lpicco
│   │   ├── exportUtils.ts        # Export CSV
│   │   ├── pdfUtils.ts           # Export PDF
│   │   └── wordUtils.ts          # Export Word
│   │
│   ├── App.tsx             # Router principale
│   └── main.tsx            # Entry point
│
├── docs/                    # Documentazione
│   ├── MANUALE_TECNICO.md  # Questo file
│   ├── DOCUMENTAZIONE.md   # Doc progetto
│   ├── DEPLOYMENT.md       # Guida deploy
│   └── ...
│
├── public/                 # Asset statici
│   └── favicon.png
│
├── Dockerfile             # Multi-stage build
├── package.json           # Dipendenze frontend
├── vite.config.ts         # Config Vite
├── tailwind.config.ts     # Config TailwindCSS
└── .gitignore            # Git ignore rules
```

### 3.2 File Chiave

#### `backend/main.py`
Contiene:
- Tutti gli endpoint API REST
- Logica business principale
- Gestione autenticazione
- CRUD per tutte le entità
- Invio email SMTP

**Struttura endpoint:**
```
/api/auth/*              - Autenticazione
/api/aziende/*           - CRUD aziende
/api/esposizione/*       - Valutazioni esposizione
/api/dpi/*               - Valutazioni DPI
/api/documenti/*         - Gestione documenti
/api/admin/*             - Amministrazione
/api/subscriptions/*     - Abbonamenti (router separato)
/health                  - Health check
```

#### `src/lib/api.ts`
Client API centralizzato per tutte le chiamate backend:
- Auto-gestione token JWT
- Error handling
- Logging requests
- Support FormData (upload)

#### `Dockerfile` (root)
Multi-stage build:
1. **Stage 1**: Build frontend (Node 20)
2. **Stage 2**: Backend + static files (Python 3.11)

---

## 4. Setup Ambiente di Sviluppo

### 4.1 Prerequisiti

- **Node.js** 20.x LTS
- **Python** 3.11+
- **PostgreSQL** 15+
- **Git**
- **Docker** (opzionale per test)

### 4.2 Setup Backend

```bash
cd backend

# Crea virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Installa dipendenze
pip install -r requirements.txt

# Copia .env.example e configura
cp .env.example .env
# Modifica .env con le tue credenziali

# Inizializza database
python init_db.py

# Avvia server dev
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4.3 Setup Frontend

```bash
# Installa dipendenze
npm install

# Avvia dev server
npm run dev

# Build produzione
npm run build
```

### 4.4 Configurazione .env (Backend)

Crea `backend/.env` con:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rumore_db

# Server
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173

# Security
SECRET_KEY=genera_con_secrets_token_urlsafe_32

# SMTP Email
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@safetyprosuite.com
SMTP_PASSWORD=tua_password
SMTP_FROM_EMAIL=noreply@safetyprosuite.com
SMTP_FROM_NAME=Safety Pro Suite

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Backblaze B2 (opzionale in dev)
B2_ENDPOINT_URL=https://s3.eu-central-003.backblazeb2.com
B2_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_app_key
B2_BUCKET_NAME=your-bucket

# Stripe (usa test keys in dev)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 5. Database

### 5.1 Schema Database

**Tabelle Principali:**

```sql
-- Autenticazione
users (id, email, password_hash, nome, is_admin, created_at, updated_at, last_login)
password_reset_tokens (id, user_id, token, expires_at, created_at)

-- Business Logic
aziende (id, user_id, ragione_sociale, partita_iva, codice_fiscale, ...)
valutazioni_esposizione (id, user_id, azienda_id, data_valutazione, lex, lpicco, ...)
misurazioni (id, valutazione_id, attivita, leq, durata, lpicco)
valutazioni_dpi (id, user_id, azienda_id, valutazione_esposizione_id, ...)
documenti (id, user_id, nome_file, file_url, tipo_documento, ...)

-- Subscriptions
subscription_plans (id, name, stripe_product_id, stripe_price_id_monthly, ...)
user_subscriptions (id, user_id, plan_id, stripe_customer_id, status, ...)
subscription_invoices (id, subscription_id, stripe_invoice_id, amount, ...)
subscription_usage_logs (id, subscription_id, resource_type, count, ...)
```

### 5.2 Migrazioni

Le migrazioni SQL sono in `backend/migrations/`:

```bash
# Applicare nuova migrazione
python init_db.py  # Esegue automaticamente migrations/
```

**Creare nuova migrazione:**

1. Crea file `backend/migrations/005_nome_migrazione.sql`
2. Scrivi SQL (CREATE, ALTER, INSERT)
3. Riavvia `init_db.py`

### 5.3 Connessione Database

Il backend usa `psycopg2` con connection pooling manuale:

```python
import psycopg2
from psycopg2.extras import RealDictCursor

conn = psycopg2.connect(
    os.getenv("DATABASE_URL"),
    cursor_factory=RealDictCursor
)
```

**IMPORTANTE**: Ogni endpoint apre/chiude la propria connessione.

### 5.4 Backup Database

**Su VPS (produzione):**

```bash
# Trova il container PostgreSQL
docker ps | grep postgres

# Backup
docker exec <postgres_container_id> pg_dump -U postgres rumore-db > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i <postgres_container_id> psql -U postgres rumore-db < backup_20241213.sql
```

---

## 6. Servizi Esterni

### 6.1 SMTP Email (Hostinger)

**Configurazione Attuale:**

- **Server**: smtp.hostinger.com
- **Porta**: 465 (SSL)
- **User**: noreply@safetyprosuite.com
- **Uso**: Email reset password

**Test connessione:**

```bash
cd backend
python test_smtp.py
# Inserisci email destinatario quando richiesto
```

**Codice invio email:**

Funzione `send_email()` in `main.py`:
- Usa `smtplib.SMTP_SSL`
- Template HTML professionale
- Gestione errori con fallback a log

### 6.2 Stripe (Pagamenti)

**Modalità:**
- **Test Mode**: Chiavi `sk_test_*` / `pk_test_*`
- **Live Mode**: Chiavi `sk_live_*` / `pk_live_*` (DA CONFIGURARE)

**Webhook Endpoint:**
```
POST /api/stripe/webhook
```

**Eventi gestiti:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `charge.succeeded`
- `charge.failed`

**Test webhook in locale:**

```bash
# Installa Stripe CLI
stripe login
stripe listen --forward-to localhost:8000/api/stripe/webhook
```

### 6.3 Backblaze B2 (Storage)

**Configurazione:**

- **Endpoint**: https://s3.eu-central-003.backblazeb2.com
- **Bucket**: rumore-storage
- **Regione**: eu-central-003
- **SDK**: boto3 (S3-compatible)

**Codice upload:**

```python
from storage import storage

file_url = storage.upload_file(
    file_content=file.file.read(),
    file_name=unique_filename,
    content_type=file.content_type
)
```

**Gestione file:**
- Upload: `storage.upload_file()`
- Download URL: Presigned URL con scadenza
- Delete: `storage.delete_file()`

---

## 7. Deploy su VPS

### 7.1 Informazioni VPS

- **IP**: 72.61.189.136
- **Accesso SSH**: `root@72.61.189.136`
- **OS**: Ubuntu/Debian
- **Platform**: Dokploy
- **Dominio**: https://rumore.safetyprosuite.com

### 7.2 Struttura su VPS

```
/etc/dokploy/
└── applications/
    └── calcoloesposizionerumoremain-rumorebackend-k55sdg/
        ├── code/              # Repository Git clonato
        │   ├── .git/
        │   ├── backend/
        │   ├── src/
        │   ├── Dockerfile
        │   └── .env           # Config produzione (ROOT)
        └── ...
```

**IMPORTANTE:**
- Il file `.env` è nella ROOT del progetto (non in backend/)
- Le variabili d'ambiente sono anche configurate nel Docker Service

### 7.3 Processo di Deploy

#### Opzione A: Deploy Automatico (se configurato Dokploy)

Se Dokploy è configurato per auto-deploy da GitHub:

1. Push su `main`:
   ```bash
   git push origin main
   ```
2. Dokploy rileva il push e fa rebuild automatico

#### Opzione B: Deploy Manuale

**Step-by-step:**

```bash
# 1. Connetti a VPS
ssh root@72.61.189.136

# 2. Vai alla directory app
cd /etc/dokploy/applications/calcoloesposizionerumoremain-rumorebackend-k55sdg/code

# 3. Pull latest code
git fetch origin
git reset --hard origin/main

# 4. Aggiorna .env se necessario
nano .env

# 5. Rebuild immagine Docker
docker build -t calcoloesposizionerumoremain-rumorebackend-k55sdg:latest .

# 6. Update service con force (riavvia container)
docker service update --force calcoloesposizionerumoremain-rumorebackend-k55sdg

# 7. Verifica stato
docker service ps calcoloesposizionerumoremain-rumorebackend-k55sdg

# 8. Controlla logs
docker service logs -f calcoloesposizionerumoremain-rumorebackend-k55sdg
```

### 7.4 Aggiornare Variabili d'Ambiente

**Metodo 1: File .env (richiede rebuild)**

```bash
nano /etc/dokploy/applications/.../code/.env
# Modifica variabili
docker build -t calcoloesposizionerumoremain-rumorebackend-k55sdg:latest .
docker service update --force calcoloesposizionerumoremain-rumorebackend-k55sdg
```

**Metodo 2: Docker Service Update (immediato)**

```bash
docker service update \
  --env-add NUOVA_VAR=valore \
  --env-rm VECCHIA_VAR \
  calcoloesposizionerumoremain-rumorebackend-k55sdg
```

**Esempio: Cambiare SMTP password**

```bash
docker service update \
  --env-rm SMTP_PASSWORD \
  --env-add SMTP_PASSWORD=nuova_password \
  --force \
  calcoloesposizionerumoremain-rumorebackend-k55sdg
```

### 7.5 Rollback

**Rollback a versione precedente:**

```bash
# 1. Torna a commit precedente
git reset --hard <commit_hash>

# 2. Rebuild
docker build -t calcoloesposizionerumoremain-rumorebackend-k55sdg:latest .

# 3. Force update
docker service update --force calcoloesposizionerumoremain-rumorebackend-k55sdg
```

---

## 8. Gestione Container Docker

### 8.1 Comandi Utili

```bash
# Lista servizi
docker service ls

# Dettagli servizio
docker service ps calcoloesposizionerumoremain-rumorebackend-k55sdg

# Logs in tempo reale
docker service logs -f calcoloesposizionerumoremain-rumorebackend-k55sdg

# Logs ultimi 100 righe
docker service logs --tail 100 calcoloesposizionerumoremain-rumorebackend-k55sdg

# Lista container attivi
docker ps

# Inspect container
docker inspect <container_id>

# Exec in container (debug)
docker exec -it <container_id> bash

# Verificare variabili d'ambiente
docker inspect <container_id> | grep -A 20 "Env"
```

### 8.2 Scaling (se necessario)

```bash
# Scale a 2 repliche
docker service scale calcoloesposizionerumoremain-rumorebackend-k55sdg=2

# Torna a 1 replica
docker service scale calcoloesposizionerumoremain-rumorebackend-k55sdg=1
```

### 8.3 Health Checks

**Endpoint health:**
```bash
curl https://rumore.safetyprosuite.com/health
# Risposta: {"status": "ok"}
```

**Verifica database:**
```bash
docker exec -it <postgres_container> psql -U postgres -d rumore-db -c "SELECT COUNT(*) FROM users;"
```

---

## 9. Configurazioni

### 9.1 Variabili d'Ambiente Obbligatorie

| Variabile | Descrizione | Esempio |
|-----------|-------------|---------|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | Chiave JWT (32+ chars) | `AribcFVVSuqpkfMH_ydR271...` |
| `SMTP_HOST` | Server SMTP | `smtp.hostinger.com` |
| `SMTP_PORT` | Porta SMTP | `465` |
| `SMTP_USER` | Username SMTP | `noreply@safetyprosuite.com` |
| `SMTP_PASSWORD` | Password SMTP | `password_sicura` |
| `SMTP_FROM_EMAIL` | Email mittente | `noreply@safetyprosuite.com` |
| `FRONTEND_URL` | URL frontend per link | `https://rumore.safetyprosuite.com` |

### 9.2 Variabili Opzionali

| Variabile | Descrizione | Default |
|-----------|-------------|---------|
| `PORT` | Porta backend | `8000` |
| `HOST` | Host backend | `0.0.0.0` |
| `CORS_ORIGINS` | CORS allowed origins | `*` |
| `SMTP_FROM_NAME` | Nome mittente email | `Safety Pro Suite` |

### 9.3 Generare SECRET_KEY

```python
import secrets
print(secrets.token_urlsafe(32))
```

### 9.4 CORS Configuration

In produzione, limita CORS:

```env
CORS_ORIGINS=https://rumore.safetyprosuite.com
```

In sviluppo:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:8000
```

---

## 10. Manutenzione e Troubleshooting

### 10.1 Problemi Comuni

#### ❌ Email non vengono inviate

**Sintomi:**
```
❌ Errore invio email: please run connect() first
```

**Diagnosi:**
```bash
# Verifica variabili SMTP nel container
docker inspect <container_id> | grep SMTP

# Test connessione SMTP
cd backend && python test_smtp.py
```

**Soluzioni:**
1. Verifica credenziali SMTP in `.env`
2. Controlla che porta 465 sia aperta
3. Verifica password (caratteri speciali potrebbero richiedere escape)
4. Aggiorna variabili nel service:
   ```bash
   docker service update \
     --env-add SMTP_HOST=smtp.hostinger.com \
     --env-add SMTP_PORT=465 \
     --force calcoloesposizionerumoremain-rumorebackend-k55sdg
   ```

#### ❌ Database connection refused

**Sintomi:**
```
could not connect to server: Connection refused
```

**Diagnosi:**
```bash
# Verifica container PostgreSQL running
docker ps | grep postgres

# Test connessione
docker exec -it <postgres_container> psql -U postgres
```

**Soluzioni:**
1. Riavvia container PostgreSQL
2. Verifica `DATABASE_URL` corretta
3. Controlla password (escape caratteri speciali: `#` -> `%23`)

#### ❌ 401 Unauthorized

**Sintomi:**
- Token expired
- Invalid token

**Soluzioni:**
1. Logout e re-login (token scaduto)
2. Verifica `SECRET_KEY` non cambiata
3. Controlla che JWT non sia corrotto

#### ❌ Container non parte dopo deploy

**Diagnosi:**
```bash
docker service ps calcoloesposizionerumoremain-rumorebackend-k55sdg
docker service logs calcoloesposizionerumoremain-rumorebackend-k55sdg --tail 50
```

**Soluzioni comuni:**
1. Errore Python: controlla `requirements.txt`
2. Database non raggiungibile: verifica `DATABASE_URL`
3. Porta già in uso: cambia `PORT` in `.env`

### 10.2 Log Analysis

**Trovare errori recenti:**
```bash
docker service logs calcoloesposizionerumoremain-rumorebackend-k55sdg 2>&1 | grep -i error | tail -20
```

**Filtrare per tipo:**
```bash
# Solo email
docker logs <container_id> | grep -i email

# Solo database
docker logs <container_id> | grep -i "database\|postgresql"

# Solo API calls
docker logs <container_id> | grep "POST\|GET\|PUT\|DELETE"
```

### 10.3 Performance Monitoring

```bash
# CPU e RAM container
docker stats <container_id>

# Spazio disco
df -h

# Dimensione database
docker exec <postgres_container> psql -U postgres -d rumore-db -c "
  SELECT pg_size_pretty(pg_database_size('rumore-db'));
"
```

### 10.4 Pulizia Disco

```bash
# Rimuovi immagini Docker non usate
docker image prune -a

# Rimuovi container stopped
docker container prune

# Rimuovi volumi non usati
docker volume prune

# Pulizia completa (ATTENZIONE!)
docker system prune -a --volumes
```

---

## 11. Best Practices

### 11.1 Sviluppo

1. **Branch Strategy**
   - `main`: Produzione
   - `develop`: Sviluppo
   - `feature/*`: Nuove funzionalità
   - `hotfix/*`: Fix urgenti

2. **Commit Messages**
   ```
   feat: Add new feature
   fix: Fix bug in calculation
   docs: Update documentation
   refactor: Refactor code
   test: Add tests
   ```

3. **Testing Locale**
   - Testare sempre localmente prima di push
   - Usare Stripe test mode
   - Usare database di test

4. **Code Review**
   - Review prima di merge su `main`
   - Controllare che .env non sia committato
   - Verificare che non ci siano credenziali hardcoded

### 11.2 Sicurezza

1. **Credenziali**
   - Mai committare `.env`
   - Usare variabili d'ambiente
   - Rotare `SECRET_KEY` periodicamente

2. **Database**
   - Backup giornalieri automatici
   - Password forte per PostgreSQL
   - Limitare accesso rete database

3. **API**
   - Rate limiting (da implementare)
   - Input validation (Pydantic)
   - SQL injection prevention (parametrized queries)

4. **HTTPS**
   - Sempre usare HTTPS in produzione
   - Redirect HTTP → HTTPS (gestito da Nginx)

### 11.3 Deploy

1. **Pre-deploy Checklist**
   - [ ] Testato localmente
   - [ ] Commit e push su GitHub
   - [ ] .env aggiornato su VPS
   - [ ] Backup database fatto
   - [ ] Notificato team del deploy

2. **Post-deploy Checklist**
   - [ ] Verificato health endpoint
   - [ ] Controllato logs per errori
   - [ ] Testato funzionalità critiche
   - [ ] Verificato email/Stripe funzionanti

3. **Rollback Plan**
   - Tenere commit hash precedente
   - Script rollback pronto
   - Backup database recente

---

## 12. Appendici

### 12.1 Endpoints API Completi

```
POST   /api/auth/register              Registrazione utente
POST   /api/auth/login                 Login
POST   /api/auth/forgot-password       Richiesta reset password
POST   /api/auth/reset-password        Reset password
GET    /api/auth/me                    Info utente corrente

GET    /api/aziende                    Lista aziende utente
POST   /api/aziende                    Crea azienda
GET    /api/aziende/{id}              Dettagli azienda
PUT    /api/aziende/{id}              Aggiorna azienda
DELETE /api/aziende/{id}              Elimina azienda

GET    /api/esposizione                Lista valutazioni
POST   /api/esposizione                Crea valutazione
GET    /api/esposizione/{id}          Dettagli valutazione
PUT    /api/esposizione/{id}          Aggiorna valutazione
DELETE /api/esposizione/{id}          Elimina valutazione

GET    /api/dpi                        Lista valutazioni DPI
POST   /api/dpi                        Crea valutazione DPI
GET    /api/dpi/{id}                  Dettagli valutazione DPI
PUT    /api/dpi/{id}                  Aggiorna valutazione DPI
DELETE /api/dpi/{id}                  Elimina valutazione DPI

POST   /api/upload                     Upload documento
GET    /api/documenti/{id}            Download documento
DELETE /api/documenti/{id}            Elimina documento

GET    /api/admin/users                Lista utenti (admin)
DELETE /api/admin/users/{id}          Elimina utente (admin)

GET    /api/subscriptions/plans        Lista piani
POST   /api/subscriptions/checkout     Crea checkout Stripe
GET    /api/subscriptions/portal       Customer portal Stripe
GET    /api/subscriptions/current      Abbonamento corrente

POST   /api/stripe/webhook             Webhook Stripe

GET    /health                         Health check
```

### 12.2 Comandi Utili VPS

```bash
# === CONNESSIONE ===
ssh root@72.61.189.136

# === NAVIGAZIONE ===
cd /etc/dokploy/applications/calcoloesposizionerumoremain-rumorebackend-k55sdg/code

# === GIT ===
git status
git pull origin main
git log --oneline -5

# === DOCKER SERVICE ===
docker service ls
docker service ps calcoloesposizionerumoremain-rumorebackend-k55sdg
docker service logs -f calcoloesposizionerumoremain-rumorebackend-k55sdg
docker service update --force calcoloesposizionerumoremain-rumorebackend-k55sdg

# === DOCKER CONTAINER ===
docker ps
docker logs <container_id> --tail 100
docker exec -it <container_id> bash
docker inspect <container_id>

# === DATABASE ===
docker exec -it <postgres_container> psql -U postgres rumore-db
docker exec <postgres_container> pg_dump -U postgres rumore-db > backup.sql

# === BUILD ===
docker build -t calcoloesposizionerumoremain-rumorebackend-k55sdg:latest .

# === MONITORING ===
docker stats
htop
df -h
```

### 12.3 SQL Queries Utili

```sql
-- Conteggio utenti
SELECT COUNT(*) FROM users;

-- Utenti registrati oggi
SELECT id, email, nome, created_at
FROM users
WHERE created_at::date = CURRENT_DATE;

-- Aziende per utente
SELECT u.email, COUNT(a.id) as num_aziende
FROM users u
LEFT JOIN aziende a ON a.user_id = u.id
GROUP BY u.id, u.email
ORDER BY num_aziende DESC;

-- Valutazioni ultimo mese
SELECT COUNT(*)
FROM valutazioni_esposizione
WHERE created_at > NOW() - INTERVAL '30 days';

-- Top utenti per valutazioni
SELECT u.email, COUNT(v.id) as num_valutazioni
FROM users u
LEFT JOIN valutazioni_esposizione v ON v.user_id = u.id
GROUP BY u.id, u.email
ORDER BY num_valutazioni DESC
LIMIT 10;

-- Documenti per tipo
SELECT tipo_documento, COUNT(*)
FROM documenti
GROUP BY tipo_documento;

-- Abbonamenti attivi
SELECT p.name, COUNT(s.id) as active_subscriptions
FROM subscription_plans p
LEFT JOIN user_subscriptions s ON s.plan_id = p.id AND s.status = 'active'
GROUP BY p.id, p.name;
```

### 12.4 Script Utili

#### Script: Deploy Rapido

Crea `scripts/quick_deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Quick Deploy"

# 1. Pull latest
git pull origin main

# 2. Build
docker build -t calcoloesposizionerumoremain-rumorebackend-k55sdg:latest .

# 3. Update service
docker service update --force calcoloesposizionerumoremain-rumorebackend-k55sdg

# 4. Wait and check
sleep 10
docker service ps calcoloesposizionerumoremain-rumorebackend-k55sdg

echo "✅ Deploy completato!"
```

#### Script: Backup Database

Crea `scripts/backup_db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER=$(docker ps | grep postgres | awk '{print $1}')

mkdir -p $BACKUP_DIR

docker exec $CONTAINER pg_dump -U postgres rumore-db > "$BACKUP_DIR/backup_$DATE.sql"

echo "✅ Backup salvato: $BACKUP_DIR/backup_$DATE.sql"

# Mantieni solo ultimi 7 backup
cd $BACKUP_DIR
ls -t backup_*.sql | tail -n +8 | xargs -r rm

echo "✅ Pulizia vecchi backup completata"
```

### 12.5 Contatti e Risorse

**Sviluppatore Principale**: [Nome]
**Email Tecnico**: dev@aqrgroup.it
**Repository**: https://github.com/wlad66/calcolo-esposizione-rumore-v00

**Risorse Esterne:**
- FastAPI Docs: https://fastapi.tiangolo.com/
- React Docs: https://react.dev/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Docker Swarm: https://docs.docker.com/engine/swarm/
- Stripe API: https://stripe.com/docs/api

---

## Changelog

| Versione | Data | Modifiche |
|----------|------|-----------|
| 1.0 | 2024-12-13 | Creazione manuale iniziale |

---

**Fine Manuale Tecnico**

Per domande o chiarimenti, contattare il team di sviluppo.
