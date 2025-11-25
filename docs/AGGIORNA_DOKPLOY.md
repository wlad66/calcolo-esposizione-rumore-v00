# Aggiornamento Variabili d'Ambiente Dokploy

## Azione Richiesta: Aggiungere Credenziali Backblaze B2

L'applicazione è ora configurata per utilizzare Backblaze B2 come storage per i documenti. È necessario aggiornare le variabili d'ambiente su Dokploy.

### 🔧 Variabili da Aggiungere

Accedi al pannello Dokploy e aggiungi le seguenti variabili d'ambiente al servizio **backend**:

#### 1. Backblaze B2 Storage

```env
B2_ENDPOINT_URL=https://s3.eu-central-003.backblazeb2.com
B2_KEY_ID=00367792fd505150000000006
B2_APPLICATION_KEY=K003xMWWtooSZw0PCsiixlHpGnGhjEU
B2_BUCKET_NAME=rumore-storage
```

#### 2. Secret Key (SE NON PRESENTE)

⚠️ **IMPORTANTE**: Verifica che questa variabile sia presente. Se manca, l'autenticazione JWT non funzionerà.

```env
SECRET_KEY=AribcFVVSuqpkfMH_ydR271sGnlDL03yQJdXoCzbQ6I
```

### 📋 Procedura Step-by-Step

#### Opzione A: Interfaccia Web Dokploy

1. **Accedi a Dokploy**:
   ```
   http://72.61.189.136:3000
   ```

2. **Seleziona il Progetto**:
   - Vai a "Projects"
   - Seleziona: `calcolo-esposizione-rumore-main`

3. **Seleziona il Servizio Backend**:
   - Clicca sul servizio backend (es. `rumore-backend`)

4. **Vai alle Environment Variables**:
   - Tab "Environment" o "Settings"
   - Sezione "Environment Variables"

5. **Aggiungi le Variabili**:
   - Clicca "Add Variable" o "+"
   - Inserisci **Nome** e **Valore** per ogni variabile:
     - `B2_ENDPOINT_URL` → `https://s3.eu-central-003.backblazeb2.com`
     - `B2_KEY_ID` → `00367792fd505150000000006`
     - `B2_APPLICATION_KEY` → `K003xMWWtooSZw0PCsiixlHpGnGhjEU`
     - `B2_BUCKET_NAME` → `rumore-storage`
     - `SECRET_KEY` → `AribcFVVSuqpkfMH_ydR271sGnlDL03yQJdXoCzbQ6I` (se mancante)

6. **Salva le Modifiche**:
   - Clicca "Save" o "Update"

7. **Riavvia il Container**:
   - Clicca "Restart" o "Redeploy"
   - Attendi che il container si riavvii (~30 secondi)

#### Opzione B: File .env (se hai accesso SSH)

Se hai accesso SSH al server:

```bash
# Trova il container ID
docker ps | grep backend

# Entra nel container
docker exec -it <container-id> /bin/sh

# Oppure modifica il file .env se montato come volume
# (varia in base alla configurazione Dokploy)
```

### ✅ Verifica Configurazione

Dopo aver aggiunto le variabili e riavviato il container:

#### 1. Verifica Variabili Caricate

```bash
# SSH al server
ssh user@72.61.189.136

# Controlla variabili d'ambiente del container
docker exec <container-id> env | grep B2
```

Output atteso:
```
B2_ENDPOINT_URL=https://s3.eu-central-003.backblazeb2.com
B2_KEY_ID=00367792fd505150000000006
B2_APPLICATION_KEY=K003xMWWtooSZw0PCsiixlHpGnGhjEU
B2_BUCKET_NAME=rumore-storage
```

#### 2. Verifica Storage Inizializzato

```bash
# Verifica che il client B2 sia inizializzato correttamente
docker logs <container-id> | grep -i "b2\|storage"
```

Output atteso (nessun errore):
```
✅ B2 Storage initialized
```

Output da evitare (errore):
```
⚠️  WARNING: B2 Storage credentials not fully configured.
❌ Error initializing B2 client: ...
```

#### 3. Test Upload da Applicazione

1. Accedi a: `https://rumore.safetyprosuite.com`
2. Crea una valutazione esposizione
3. Clicca "Salva"
4. Genera un PDF
5. Verifica che il file sia caricato (controlla bucket B2)

### 🔍 Troubleshooting

#### Errore: "Storage service unavailable"

**Causa**: Credenziali B2 non caricate o errate

**Soluzione**:
1. Verifica che tutte le 4 variabili B2 siano presenti
2. Controlla che non ci siano spazi extra
3. Riavvia il container

#### Errore: "Failed to upload file to storage"

**Causa**: Permessi bucket o credenziali errate

**Soluzione**:
1. Verifica che il bucket esista su Backblaze B2
2. Controlla che l'Application Key abbia i permessi:
   - `listBuckets`
   - `listFiles`
   - `readFiles`
   - `writeFiles`
3. Verifica endpoint e region corretti

#### Container non si riavvia

**Causa**: Possibile errore di configurazione

**Soluzione**:
```bash
# Controlla logs per errori
docker logs <container-id> --tail 50

# Verifica DATABASE_URL e SECRET_KEY
docker exec <container-id> env | grep -E "DATABASE_URL|SECRET_KEY"
```

### 📊 Configurazione Bucket Backblaze B2

#### Impostazioni Bucket Consigliate

**Nome Bucket**: `rumore-storage`

**Visibilità**:
- **Opzione 1 (Consigliata)**: Public
  - I file sono accessibili tramite URL diretta
  - URL formato: `https://rumore-storage.s3.eu-central-003.backblazeb2.com/filename`
  - Più semplice e veloce

- **Opzione 2**: Private
  - I file richiedono presigned URL
  - Più sicuro ma richiede modifiche al codice
  - URL temporanee con scadenza

**Lifecycle Settings**: (opzionale)
- Mantieni tutte le versioni: No (per risparmiare spazio)
- Giorni prima di eliminare versioni nascoste: 1

**Encryption**: (opzionale)
- SSE-B2 (Server-Side Encryption)

#### Verifica Bucket

1. Accedi a Backblaze B2 console
2. Vai su "Buckets"
3. Verifica che esista `rumore-storage`
4. Controlla impostazioni "Bucket Info":
   - Type: Public o Private
   - Region: eu-central-003

### 🔐 Sicurezza Application Key

**Permessi Minimi Richiesti**:
```json
{
  "capabilities": [
    "listBuckets",
    "listFiles",
    "readFiles",
    "writeFiles"
  ],
  "bucketId": "<id-bucket-rumore-storage>",
  "namePrefix": ""
}
```

**NON dare permessi**:
- `deleteFiles` (a meno che non sia necessario)
- `listAllBucketNames` (usa bucketId specifico)

### 📝 Checklist Finale

Prima di considerare il deployment completo, verifica:

- [ ] Variabili B2 aggiunte su Dokploy
- [ ] SECRET_KEY presente
- [ ] Container riavviato
- [ ] Logs container senza errori B2
- [ ] Test upload funzionante
- [ ] File visibile su bucket B2
- [ ] URL file accessibile

### 🚀 Dopo la Configurazione

Una volta completata la configurazione:

1. **Testa l'Upload**:
   - Crea valutazione → Salva → Genera PDF
   - Verifica file su B2 console

2. **Monitora i Logs**:
   ```bash
   docker logs -f <container-id>
   ```

3. **Verifica Performance**:
   - Upload dovrebbe essere istantaneo (<1s)
   - URL dovrebbe essere accessibile immediatamente

---

## ⚡ Quick Reference

### Comandi Utili

```bash
# Lista container
docker ps

# Logs real-time
docker logs -f <container-id>

# Verifica env
docker exec <container-id> env | grep B2

# Riavvia container
docker restart <container-id>

# Testa connessione B2
docker exec <container-id> python -c "from storage import storage; print('✅ OK' if storage.s3_client else '❌ ERROR')"
```

### Variabili d'Ambiente Complete

```env
# Database
DATABASE_URL=postgresql://postgres:***@host:5432/rumore-db

# Server
PORT=8000
HOST=0.0.0.0

# Security
SECRET_KEY=AribcFVVSuqpkfMH_ydR271sGnlDL03yQJdXoCzbQ6I

# CORS
CORS_ORIGINS=https://rumore.safetyprosuite.com

# Email
RESEND_API_KEY=re_***
RESEND_FROM_EMAIL=noreply@puntodiraccolta.com
FRONTEND_URL=https://rumore.safetyprosuite.com

# Backblaze B2
B2_ENDPOINT_URL=https://s3.eu-central-003.backblazeb2.com
B2_KEY_ID=00367792fd505150000000006
B2_APPLICATION_KEY=K003xMWWtooSZw0PCsiixlHpGnGhjEU
B2_BUCKET_NAME=rumore-storage
```

---

**Ultimo aggiornamento**: 2025-01-25
