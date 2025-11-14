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
  - Tecnologie utilizzate
  - Funzionalità
  - Struttura progetto
  - Database schema
  - Configurazione e deployment
  - Sicurezza
  - Miglioramenti recenti

- **[BACKEND_README.md](docs/BACKEND_README.md)** - Guida specifica backend
  - Setup locale
  - Deploy su cloud (AWS, Docker)
  - Endpoints API
  - Database PostgreSQL

## Tecnologie Principali

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Shadcn/ui
- **Backend**: FastAPI (Python) + PostgreSQL + JWT
- **Deployment**: Docker + Dokploy

## URL Applicazione

- **Produzione**: http://72.61.189.136
- **Sviluppo**: http://localhost:5173

## Funzionalità Chiave

- Calcolo esposizione rumore (LEX, Lpicco)
- Valutazione DPI con metodi HML/SNR/ottava
- Gestione aziende con validazione P.IVA/CF
- Export CSV, PDF, Word
- Sistema autenticazione completo
- Pannello amministratore

## Supporto

- **Email**: info@aqrgroup.it
- **Repository**: https://github.com/wlad66/calcolo-esposizione-rumore-v00

## Licenza

Proprietario: AQR Group
