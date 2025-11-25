# Mappa Porte VPS - 72.61.189.136

**Documento di riferimento per evitare conflitti di porte tra applicazioni**

Ultimo aggiornamento: 25 Novembre 2025

---

## 📋 Porte di Sistema

| Porta | Servizio | Tipo | Note |
|-------|----------|------|------|
| **22** | SSH | Sistema | Accesso remoto VPS |
| **53** | DNS (systemd-resolve) | Sistema | DNS locale (127.0.0.53, 127.0.0.54) |
| **80** | Nginx | Web Server | HTTP (redirect a HTTPS) |
| **443** | Nginx | Web Server | HTTPS (SSL/TLS) |
| **65529** | Monarx Agent | Security | Monitoring sicurezza |

---

## 🐳 Porte Docker (Applicazioni)

| Porta | Applicazione | Container | Descrizione |
|-------|--------------|-----------|-------------|
| **3000** | Dokploy | dokploy/dokploy:latest | Dashboard gestione container |
| **3001** | ScadeZero Frontend | scadezero-frontend | Applicazione frontend scadezero |
| **4000** | SafeDoc Backend | safedoc-backend | Backend API SafeDoc |
| **5432** | SafeDoc PostgreSQL | safedoc-postgres | Database PostgreSQL SafeDoc |
| **6379** | Redis (Dokploy) | dokploy-redis | Cache Redis per Dokploy |
| **8000** | Rumore Backend | calcoloesposizionerumoremain | Backend calcolo esposizione rumore (interno) |

---

## 🚀 Porte PM2 (Node.js)

| Porta | Applicazione | Processo | Descrizione |
|-------|--------------|----------|-------------|
| **4001** | Stress API Backend | stress-api (PM2) | Backend Valutazione Stress Lavoro-Correlato |

---

## 🗄️ Porte Database

| Porta | Database | Applicazione | Note |
|-------|----------|--------------|------|
| **5432** | PostgreSQL | SafeDoc, Dokploy, Rumore | Database Docker |
| **5433** | PostgreSQL | Stress App | Database nativo (non Docker) |

---

## 📡 Porte Docker Swarm (Interne)

| Porta | Servizio | Note |
|-------|----------|------|
| **2377** | Docker Swarm | Management (cluster orchestration) |
| **7946** | Docker Swarm | Container network discovery |

---

## ⚠️ Porte Riservate - NON USARE

```
22    - SSH (sistema)
53    - DNS (sistema)
80    - HTTP (nginx)
443   - HTTPS (nginx)
2377  - Docker Swarm
3000  - Dokploy
3001  - ScadeZero
4000  - SafeDoc
4001  - Stress API
5432  - PostgreSQL (Docker)
5433  - PostgreSQL (Stress)
6379  - Redis
7946  - Docker Swarm
8000  - Rumore Backend
65529 - Monarx Agent
```

---

## ✅ Porte Disponibili Consigliate

Per nuove applicazioni, utilizzare porte nella fascia:

### Backend/API:
- **4002-4099** - Porte libere per backend Node.js/Express
- **5000-5099** - Porte libere per backend Python/Flask/FastAPI
- **8001-8099** - Porte libere per backend vari

### Frontend:
- **3002-3099** - Porte libere per frontend React/Vue/Angular

### Database:
- **5434-5499** - Porte libere per PostgreSQL aggiuntivi
- **3306-3399** - Porte libere per MySQL/MariaDB
- **27017-27099** - Porte libere per MongoDB

---

## 🔧 Comandi Utili

### Verificare porte in uso:
```bash
# Lista tutte le porte in ascolto
ssh root@72.61.189.136 "netstat -tlnp | grep LISTEN"

# Verifica se una porta specifica è in uso
ssh root@72.61.189.136 "lsof -i :PORTA"

# Lista container Docker con porte
ssh root@72.61.189.136 "docker ps --format 'table {{.Names}}\t{{.Ports}}'"

# Lista processi PM2
ssh root@72.61.189.136 "pm2 status"
```

### Verificare disponibilità porta:
```bash
# Tenta connessione alla porta
nc -zv localhost PORTA

# oppure con telnet
telnet localhost PORTA
```

---

## 📝 Procedura per Nuove Applicazioni

1. **Consultare questo documento** per porte già in uso
2. **Scegliere porta libera** dalla fascia consigliata
3. **Aggiornare questo documento** con la nuova porta
4. **Configurare firewall** se necessario:
   ```bash
   ufw allow PORTA/tcp
   ```
5. **Testare** che la porta sia accessibile

---

## 🏗️ Architettura Rete VPS

```
Internet
    │
    ▼
┌─────────────────────────────────────────┐
│  VPS: 72.61.189.136                     │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Nginx (80/443)                  │  │
│  │  - stress.safetyprosuite.com     │  │
│  │  - api.stress.safetyprosuite.com │  │
│  │  - Altri domini...               │  │
│  └──────────────────────────────────┘  │
│           │                             │
│           ├──> localhost:4001 (Stress API - PM2)
│           ├──> localhost:4000 (SafeDoc - Docker)
│           ├──> localhost:3000 (Dokploy - Docker)
│           └──> localhost:3001 (ScadeZero - Docker)
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Databases                       │  │
│  │  - PostgreSQL 5433 (Stress)      │  │
│  │  - PostgreSQL 5432 (SafeDoc)     │  │
│  │  - Redis 6379 (Dokploy)          │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 📞 Contatti

Per modifiche a questo documento o segnalazione conflitti porte:
- Aggiornare manualmente questo file
- Committare le modifiche
- Documentare nel commit la nuova porta allocata

---

**⚠️ IMPORTANTE**: Mantenere questo documento aggiornato ad ogni nuova applicazione deployata sulla VPS!

**Versione**: 1.0
**Data creazione**: 25 Novembre 2025
**Ultima verifica**: 25 Novembre 2025
