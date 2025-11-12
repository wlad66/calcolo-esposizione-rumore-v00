#!/bin/bash
# Script di avvio per il backend
# Esegue prima l'inizializzazione del database, poi avvia il server

echo "🚀 Starting backend..."

# Inizializza il database
echo "📊 Initializing database..."
python init_db.py

# Avvia il server
echo "🌐 Starting Uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
