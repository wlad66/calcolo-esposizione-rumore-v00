# Guida Deployment Produzione

## Deployment su Dokploy

### 1. Prerequisiti

- Account Dokploy configurato
- Database PostgreSQL creato
- Bucket Backblaze B2 creato e configurato
- Dominio configurato con DNS

### 2. Configurazione Variabili d'Ambiente

Nel pannello Dokploy, configura le seguenti variabili d'ambiente per il servizio backend:

#### Database
```env
DATABASE_URL=postgresql://user:password@host:5432/database-name
```

#### Server
```env
PORT=8000
HOST=0.0.0.0
```

#### Security (REQUIRED)
```env
SECRET_KEY=<generato-con-secrets.token_urlsafe(32)>
```

**Come generare SECRET_KEY**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### CORS
```env
CORS_ORIGINS=https://tuodominio.com
```
⚠️ **IMPORTANTE**: NON usare `*` in produzione!

#### Email (Resend)
```env
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@tuodominio.com
FRONTEND_URL=https://tuodominio.com
```

#### Backblaze B2 Storage
```env
B2_ENDPOINT_URL=https://s3.eu-central-003.backblazeb2.com
B2_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_application_key
B2_BUCKET_NAME=your-bucket-name
```

**Configurazione Bucket B2**:
1. Accedi a Backblaze B2
2. Crea un bucket (es. `rumore-storage`)
3. Configura bucket come **Public** se vuoi URL dirette, oppure **Private** per usare presigned URL
4. Genera Application Key con permessi:
   - `listBuckets`
   - `listFiles`
   - `readFiles`
   - `writeFiles`
5. Annota:
   - Key ID
   - Application Key
   - Endpoint (es. `s3.eu-central-003.backblazeb2.com`)
   - Region (es. `eu-central-003`)

### 3. Configurazione Dominio e HTTPS

#### DNS (Hostinger o altro provider)
```
Type: A
Name: tuodominio (o sottodominio)
Points to: IP_SERVER
TTL: 14400
```

#### Nginx Reverse Proxy

File: `/etc/nginx/sites-available/tuodominio.com`

```nginx
server {
    server_name tuodominio.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/tuodominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tuodominio.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    listen 80;
    server_name tuodominio.com;
    return 301 https://$host$request_uri;
}
```

**Comandi**:
```bash
# Crea symlink
sudo ln -s /etc/nginx/sites-available/tuodominio.com /etc/nginx/sites-enabled/

# Testa configurazione
sudo nginx -t

# Riavvia nginx
sudo systemctl restart nginx
```

#### SSL Certificate (Let's Encrypt)

```bash
# Installa certbot
sudo apt install certbot python3-certbot-nginx -y

# Genera certificato
sudo certbot --nginx -d tuodominio.com

# Verifica auto-renewal
sudo certbot renew --dry-run
```

### 4. Firewall

Assicurati che le seguenti porte siano aperte:

```
80  (HTTP)  - Redirect to HTTPS
443 (HTTPS) - Applicazione principale
3000 (TCP) - Dokploy panel (opzionale)
```

### 5. Inizializzazione Database

**Opzione 1: Script automatico**
```bash
cd backend
python init_db.py
```

**Opzione 2: Manuale**
```sql
-- Vedi backend/init_db.py per lo schema completo
```

### 6. Creazione Utente Admin

```bash
cd backend
python make_admin.py email@esempio.it
```

### 7. Build e Deploy

#### Build Locale (opzionale)
```bash
# Frontend
npm install
npm run build

# Backend
cd backend
pip install -r requirements.txt
```

#### Deploy su Dokploy

1. **Push su GitHub**:
   ```bash
   git add .
   git commit -m "Update configuration"
   git push
   ```

2. **Dokploy Auto-Deploy**:
   - Dokploy rileva automaticamente il push
   - Esegue build e restart del container
   - Verifica nei logs che tutto sia ok

3. **Verifica Deployment**:
   ```bash
   # Controlla stato container
   docker ps

   # Verifica logs
   docker logs <container-name>
   ```

### 8. Verifica Funzionamento

1. **Backend Health Check**:
   ```
   https://tuodominio.com/health
   ```
   Risposta attesa: `{"status": "ok"}`

2. **API Docs**:
   ```
   https://tuodominio.com/docs
   ```

3. **Frontend**:
   ```
   https://tuodominio.com
   ```

4. **Test Upload B2**:
   - Accedi all'applicazione
   - Crea una valutazione
   - Genera e salva un PDF
   - Verifica che il file sia caricato su B2
   - Controlla l'URL generata

### 9. Monitoraggio

#### Logs Nginx
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

#### Logs Container
```bash
docker logs -f <container-name>
```

#### Performance
```bash
# Tempo di risposta
curl -w "@-" -o /dev/null -s https://tuodominio.com/health <<'EOF'
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer:  %{time_pretransfer}\n
time_redirect:  %{time_redirect}\n
time_starttransfer:  %{time_starttransfer}\n
----------\n
time_total:  %{time_total}\n
EOF
```

### 10. Troubleshooting

#### Container non parte
```bash
# Verifica variabili d'ambiente
docker exec <container-name> env

# Verifica DATABASE_URL
docker exec <container-name> python -c "import os; print(os.getenv('DATABASE_URL'))"
```

#### Errore 503 Storage
```bash
# Verifica credenziali B2
docker exec <container-name> python -c "
from storage import storage
print(f'Bucket: {storage.bucket_name}')
print(f'Endpoint: {storage.endpoint_url}')
print(f'Client: {storage.s3_client is not None}')
"
```

#### Nginx 502 Bad Gateway
```bash
# Verifica container in ascolto
ss -tlnp | grep 8000

# Verifica container running
docker ps | grep backend
```

#### Upload non funziona
1. Verifica bucket B2 sia pubblico o abilita presigned URL
2. Controlla permessi Application Key
3. Verifica Content-Type nelle richieste
4. Controlla logs backend per errori boto3

### 11. Backup

#### Database
Dokploy gestisce automaticamente i backup del database.

**Backup manuale**:
```bash
docker exec <postgres-container> pg_dump -U postgres database-name > backup.sql
```

#### File B2
I file su Backblaze B2 hanno versioning automatico se abilitato nelle impostazioni bucket.

### 12. Aggiornamenti

#### Update Applicazione
```bash
git pull
git push
# Dokploy auto-deploy
```

#### Update Dipendenze
```bash
# Frontend
npm update

# Backend
pip install -r requirements.txt --upgrade
```

#### Update Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 13. Sicurezza

✅ **Checklist**:
- [ ] SECRET_KEY generata e sicura
- [ ] CORS_ORIGINS configurato (NO `*`)
- [ ] Database password complessa
- [ ] B2 Application Key con permessi minimi necessari
- [ ] HTTPS abilitato
- [ ] Firewall configurato
- [ ] Backup automatici attivi
- [ ] Logs monitorati

---

## Link Utili

- **Dokploy**: https://dokploy.com/docs
- **Backblaze B2**: https://www.backblaze.com/b2/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **FastAPI**: https://fastapi.tiangolo.com/
- **Nginx**: https://nginx.org/en/docs/

## Supporto

Per problemi o domande:
1. Controlla i logs (Nginx + Container)
2. Verifica variabili d'ambiente
3. Consulta [DOCUMENTAZIONE.md](./DOCUMENTAZIONE.md)
