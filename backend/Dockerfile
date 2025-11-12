FROM python:3.11-slim

WORKDIR /app

# Installa dipendenze di sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia il codice
COPY . .

# Esponi la porta
EXPOSE 8000

# Inizializza DB e avvia server
CMD python init_db.py && uvicorn main:app --host 0.0.0.0 --port 8000
