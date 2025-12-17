# ==================== STAGE 1: Build Frontend ====================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Copia package files
COPY package*.json ./
RUN npm ci

# Copia il codice frontend
COPY . .

# Build del frontend per produzione
RUN npm run build

# ==================== STAGE 2: Backend + Frontend Statico ====================
FROM python:3.11-slim

WORKDIR /app

# Installa dipendenze di sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements e installa dipendenze Python
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia il codice backend
COPY backend/ .

# Copia file .env.stripe come .env per load_dotenv()
COPY backend/.env.stripe .env

# Copia i file statici del frontend dal build precedente
COPY --from=frontend-builder /frontend/dist ./static

# Esponi la porta
EXPOSE 8000

# Inizializza DB e avvia server
CMD python init_db.py && uvicorn main:app --host 0.0.0.0 --port 8000
