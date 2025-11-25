# Calcolatore Esposizione Rumore

Applicazione web professionale per il calcolo dell'esposizione al rumore secondo D.Lgs. 81/2008 e UNI EN 458:2016.

## Quick Start

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

## Documentazione

Tutta la documentazione è disponibile nella cartella [docs/](docs/):

- **[DOCUMENTAZIONE.md](docs/DOCUMENTAZIONE.md)** - Documentazione completa del progetto
  - Tecnologie utilizzate e stack completo
  - Funzionalità implementate
  - Struttura progetto e architettura
  - Database schema e relazioni
  - Configurazione ambiente
  - Storage Backblaze B2
  - Deployment produzione
  - Sicurezza e best practices

- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Guida deployment produzione
  - Setup Dokploy step-by-step
  - Configurazione variabili d'ambiente
  - Setup Backblaze B2 storage
  - Configurazione dominio e HTTPS
  - Nginx reverse proxy
  - SSL con Let's Encrypt
  - Monitoraggio e troubleshooting

- **[AGGIORNA_DOKPLOY.md](docs/AGGIORNA_DOKPLOY.md)** - Aggiornamento configurazione
  - Istruzioni per aggiungere credenziali B2
  - Verifica configurazione
  - Troubleshooting comune
  - Quick reference comandi

- **[BACKEND_README.md](docs/BACKEND_README.md)** - Guida specifica backend
  - Setup locale sviluppo
  - Endpoints API completi
  - Database PostgreSQL
  - Testing

## Tecnologie Principali

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Shadcn/ui
- **Backend**: FastAPI (Python) + PostgreSQL + JWT
- **Storage**: Backblaze B2 (S3-compatible)
- **Deployment**: Docker + Dokploy + Nginx + Let's Encrypt

## URL Applicazione

- **Produzione**: https://rumore.safetyprosuite.com 🔒
- **Sviluppo**: http://localhost:5173

## Funzionalità Chiave

- ✅ Calcolo esposizione rumore (LEX, Lpicco) secondo D.Lgs. 81/2008
- ✅ Valutazione DPI con metodi HML/SNR/ottava (UNI EN 458:2016)
- ✅ Gestione aziende con validazione P.IVA/CF completa
- ✅ Export CSV, PDF, Word con branding personalizzato
- ✅ Archiviazione documenti su Backblaze B2
- ✅ Sistema autenticazione JWT + recupero password
- ✅ Pannello amministratore con gestione utenti
- ✅ Multi-tenancy con isolamento dati per utente

## Supporto

- **Email**: info@aqrgroup.it
- **Repository**: https://github.com/wlad66/calcolo-esposizione-rumore-v00

## Licenza

Proprietario: AQR Group
