# Problema Storage B2 - Da Risolvere

**Data**: 25/11/2025, 21:45
**Stato**: Non risolto - da affrontare domani

## Descrizione Problema

Quando si prova a caricare documenti dall'applicazione in produzione, si verifica un errore:

```
Errore caricamento
503: Storage service unavailable
```

## Errori Console Browser

```
Failed to load resource: the server responded with a status of 500 ()
API Error: Error: 503: Storage service unavailable
  at async (index-N8mDIvbU.js:512)
```

## Analisi

Il backend restituisce errore 503 quando tenta di accedere al servizio Backblaze B2 Storage. Questo indica che:

1. **Le variabili d'ambiente B2 potrebbero non essere caricate** nel container di produzione
2. **Il client B2 non è inizializzato** correttamente (`self.s3_client = None`)

## Causa Probabile

Le variabili d'ambiente B2 sono state aggiunte al file `backend/.env` locale, ma **potrebbero non essere state aggiunte correttamente su Dokploy** nel container di produzione.

## Verifica Necessaria

Controllare se le variabili B2 sono presenti nel container di produzione:

```bash
ssh root@72.61.189.136
docker ps --filter 'name=rumorebackend' --format '{{.ID}}'
docker exec <container-id> env | grep B2
```

**Output atteso**:
```
B2_ENDPOINT_URL=https://s3.eu-central-003.backblazeb2.com
B2_KEY_ID=00367792fd505150000000006
B2_APPLICATION_KEY=K003xMWWtooSZw0PCsiixlHpGnGhjEU
B2_BUCKET_NAME=rumore-storage
```

**Se le variabili NON sono presenti**, è necessario aggiungerle tramite Dokploy.

## Soluzione da Applicare Domani

### Opzione 1: Via Dokploy Web UI (Consigliata)

1. Accedi a Dokploy: `http://72.61.189.136:3000`
2. Seleziona progetto: `calcolo-esposizione-rumore-main`
3. Seleziona servizio: `rumore-backend`
4. Vai su "Environment Variables"
5. Aggiungi le 4 variabili B2:
   ```
   B2_ENDPOINT_URL=https://s3.eu-central-003.backblazeb2.com
   B2_KEY_ID=00367792fd505150000000006
   B2_APPLICATION_KEY=K003xMWWtooSZw0PCsiixlHpGnGhjEU
   B2_BUCKET_NAME=rumore-storage
   ```
6. Salva e riavvia il container

### Opzione 2: Via SSH + Docker Service Update

```bash
ssh root@72.61.189.136

# Trova il servizio
SERVICE_NAME=$(docker service ls --filter 'name=rumorebackend' --format '{{.Name}}')

# Aggiungi variabili d'ambiente
docker service update \
  --env-add "B2_ENDPOINT_URL=https://s3.eu-central-003.backblazeb2.com" \
  --env-add "B2_KEY_ID=00367792fd505150000000006" \
  --env-add "B2_APPLICATION_KEY=K003xMWWtooSZw0PCsiixlHpGnGhjEU" \
  --env-add "B2_BUCKET_NAME=rumore-storage" \
  $SERVICE_NAME

# Attendi riavvio container (~30 secondi)
docker service ps $SERVICE_NAME

# Verifica variabili caricate
CONTAINER_ID=$(docker ps --filter "name=rumorebackend" --format "{{.ID}}")
docker exec $CONTAINER_ID env | grep B2
```

### Verifica Post-Fix

1. **Controlla logs backend**:
   ```bash
   docker logs $CONTAINER_ID | grep -i "b2\|storage"
   ```

   Output atteso: Nessun errore di inizializzazione B2

2. **Testa upload da app**:
   - Vai su `https://rumore.safetyprosuite.com/valutazioni`
   - Seleziona una valutazione
   - Clicca "Documenti"
   - Clicca "Carica Documento"
   - Carica un file di test
   - Verifica che non ci siano errori 503

3. **Verifica file su B2**:
   - Accedi a Backblaze B2 console
   - Verifica bucket `rumore-storage`
   - Controlla che il file sia stato caricato

## Riferimenti

- **Documentazione deployment**: `docs/DEPLOYMENT.md`
- **Guida aggiornamento Dokploy**: `docs/AGGIORNA_DOKPLOY.md`
- **Codice storage backend**: `backend/storage.py`
- **Env locale (esempio)**: `backend/.env`

## Note Importanti

- ✅ Il codice backend è corretto (`backend/storage.py`)
- ✅ Le variabili sono corrette nel file `.env` locale
- ❌ Le variabili probabilmente mancano nel container di produzione
- 🔧 Fix richiede solo aggiunta variabili + riavvio container (5 minuti)

## Checklist Risoluzione

- [ ] Verifica variabili B2 nel container produzione
- [ ] Aggiungi variabili B2 tramite Dokploy o docker service update
- [ ] Riavvia container
- [ ] Verifica logs backend (no errori B2)
- [ ] Test upload documento da app
- [ ] Verifica file su bucket B2
- [ ] Marca problema come risolto

---

**Status**: Da risolvere domani
**Priorità**: Alta
**Tempo stimato**: 10-15 minuti
