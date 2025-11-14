# Backend API - Noise Assessment

Backend Python con FastAPI e PostgreSQL per gestire valutazioni di esposizione al rumore e DPI.

## Setup Locale

1. Installa le dipendenze:
```bash
pip install -r requirements.txt
```

2. Configura la variabile d'ambiente DATABASE_URL:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/noise_db"
```

3. Avvia il server:
```bash
python main.py
# oppure
uvicorn main:app --reload
```

Il server sarà disponibile su http://localhost:8000
Documentazione API: http://localhost:8000/docs

## Deploy su AWS Lambda + API Gateway

### Opzione 1: AWS Lambda con Mangum

1. Installa Mangum:
```bash
pip install mangum
```

2. Crea `lambda_handler.py`:
```python
from mangum import Mangum
from main import app

handler = Mangum(app)
```

3. Crea un file ZIP con tutto il codice e le dipendenze:
```bash
pip install -r requirements.txt -t package/
cp main.py lambda_handler.py package/
cd package && zip -r ../deployment.zip . && cd ..
```

4. Carica su AWS Lambda tramite Console o AWS CLI

5. Configura API Gateway per esporre gli endpoint

### Opzione 2: AWS Elastic Beanstalk

1. Installa EB CLI:
```bash
pip install awsebcli
```

2. Inizializza e deploy:
```bash
eb init -p python-3.11 noise-assessment-api
eb create noise-assessment-env
eb deploy
```

### Opzione 3: AWS ECS/Fargate con Docker

1. Crea `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
```

2. Build e push su ECR:
```bash
docker build -t noise-api .
aws ecr create-repository --repository-name noise-api
docker tag noise-api:latest <account-id>.dkr.ecr.<region>.amazonaws.com/noise-api:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/noise-api:latest
```

3. Crea servizio ECS/Fargate dalla Console AWS

## Database PostgreSQL su AWS

### Opzione 1: Amazon RDS PostgreSQL
- Vai su AWS RDS Console
- Crea un database PostgreSQL
- Configura security group per accesso
- Usa la connection string in DATABASE_URL

### Opzione 2: Amazon Aurora Serverless
- Maggiore scalabilità automatica
- Pay-per-use

## Variabili d'Ambiente

Configura su AWS:
- `DATABASE_URL`: Connection string PostgreSQL
- `CORS_ORIGINS`: Domini frontend autorizzati (produzione)

## Endpoints API

### Esposizione Rumore
- `POST /api/esposizione` - Salva valutazione
- `GET /api/esposizione` - Lista valutazioni
- `GET /api/esposizione/{id}` - Dettaglio valutazione
- `DELETE /api/esposizione/{id}` - Elimina valutazione

### DPI
- `POST /api/dpi` - Salva valutazione DPI
- `GET /api/dpi` - Lista valutazioni DPI
- `GET /api/dpi/{id}` - Dettaglio valutazione DPI
- `DELETE /api/dpi/{id}` - Elimina valutazione DPI

## Sicurezza

Per produzione, aggiungi:
1. Autenticazione JWT/OAuth2
2. Rate limiting
3. CORS specifico per il tuo dominio
4. HTTPS obbligatorio
5. Validazione input avanzata
