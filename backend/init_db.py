"""
Script per inizializzare il database PostgreSQL
Esegui: python init_db.py
"""
import psycopg2
import os

# Leggi DATABASE_URL dalla variabile d'ambiente (iniettata da Dokploy)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL environment variable not set!")
    print("Available env vars:", list(os.environ.keys()))
    exit(1)

print(f"📝 Using DATABASE_URL from environment")

SQL_SCHEMA = """
-- Schema Database per Calcolo Esposizione Rumore
-- PostgreSQL

-- Tabella Users (Autenticazione)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tabella Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);

-- Tabella Aziende
CREATE TABLE IF NOT EXISTS aziende (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ragione_sociale VARCHAR(255) NOT NULL,
    partita_iva VARCHAR(11) NOT NULL UNIQUE,
    codice_fiscale VARCHAR(16) NOT NULL,
    indirizzo VARCHAR(255) NOT NULL,
    citta VARCHAR(100) NOT NULL,
    cap VARCHAR(5) NOT NULL,
    provincia VARCHAR(2) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255),
    rappresentante_legale VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indice per ricerca veloce
CREATE INDEX IF NOT EXISTS idx_aziende_ragione_sociale ON aziende(ragione_sociale);
CREATE INDEX IF NOT EXISTS idx_aziende_partita_iva ON aziende(partita_iva);
CREATE INDEX IF NOT EXISTS idx_aziende_user ON aziende(user_id);

-- Tabella Valutazioni Esposizione
CREATE TABLE IF NOT EXISTS valutazioni_esposizione (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    azienda_id INTEGER REFERENCES aziende(id) ON DELETE CASCADE,
    mansione VARCHAR(255) NOT NULL,
    reparto VARCHAR(255),
    lex DECIMAL(5,2),
    lpicco DECIMAL(5,2),
    classe_rischio VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_valutazioni_esposizione_azienda ON valutazioni_esposizione(azienda_id);
CREATE INDEX IF NOT EXISTS idx_valutazioni_esposizione_data ON valutazioni_esposizione(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_valutazioni_esposizione_user ON valutazioni_esposizione(user_id);

-- Tabella Misurazioni (per valutazioni esposizione)
CREATE TABLE IF NOT EXISTS misurazioni (
    id SERIAL PRIMARY KEY,
    valutazione_id INTEGER REFERENCES valutazioni_esposizione(id) ON DELETE CASCADE,
    attivita VARCHAR(255),
    leq DECIMAL(5,2),
    durata DECIMAL(10,2),
    lpicco DECIMAL(5,2),
    ordine INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_misurazioni_valutazione ON misurazioni(valutazione_id);

-- Migrazione: modifica durata da INTEGER a DECIMAL se necessario
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='misurazioni' AND column_name='durata' AND data_type='integer'
    ) THEN
        ALTER TABLE misurazioni ALTER COLUMN durata TYPE DECIMAL(10,2) USING durata::DECIMAL(10,2);
    END IF;
END $$;

-- Tabella Valutazioni DPI
CREATE TABLE IF NOT EXISTS valutazioni_dpi (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    azienda_id INTEGER REFERENCES aziende(id) ON DELETE CASCADE,
    mansione VARCHAR(255) NOT NULL,
    reparto VARCHAR(255),
    dpi_selezionato VARCHAR(255),
    h DECIMAL(5,2),
    m DECIMAL(5,2),
    l DECIMAL(5,2),
    lex_per_dpi DECIMAL(5,2),
    pnr DECIMAL(5,2),
    leff DECIMAL(5,2),
    protezione_adeguata VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_valutazioni_dpi_azienda ON valutazioni_dpi(azienda_id);
CREATE INDEX IF NOT EXISTS idx_valutazioni_dpi_data ON valutazioni_dpi(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_valutazioni_dpi_user ON valutazioni_dpi(user_id);

-- Trigger per aggiornare updated_at su aziende
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_aziende_updated_at ON aziende;
CREATE TRIGGER update_aziende_updated_at
    BEFORE UPDATE ON aziende
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Migrazioni: Aggiunta user_id alle tabelle esistenti
DO $$
BEGIN
    -- Aggiungi user_id a aziende se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='aziende' AND column_name='user_id'
    ) THEN
        ALTER TABLE aziende ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_aziende_user ON aziende(user_id);
    END IF;

    -- Aggiungi user_id a valutazioni_esposizione se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='valutazioni_esposizione' AND column_name='user_id'
    ) THEN
        ALTER TABLE valutazioni_esposizione ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_valutazioni_esposizione_user ON valutazioni_esposizione(user_id);
    END IF;

    -- Aggiungi user_id a valutazioni_dpi se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='valutazioni_dpi' AND column_name='user_id'
    ) THEN
        ALTER TABLE valutazioni_dpi ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_valutazioni_dpi_user ON valutazioni_dpi(user_id);
    END IF;
END $$;
"""

def init_database():
    """Inizializza il database con lo schema"""
    print("🔌 Connessione al database...")
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        print("📊 Creazione tabelle...")
        cursor.execute(SQL_SCHEMA)
        conn.commit()
        
        print("✅ Database inizializzato con successo!")
        print("\n📋 Tabelle create:")
        print("  - users")
        print("  - password_reset_tokens")
        print("  - aziende")
        print("  - valutazioni_esposizione")
        print("  - misurazioni")
        print("  - valutazioni_dpi")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Errore durante l'inizializzazione: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 50)
    print("  INIZIALIZZAZIONE DATABASE RUMORE")
    print("=" * 50)
    print()
    
    success = init_database()
    
    if success:
        print("\n🎉 Inizializzazione completata!")
    else:
        print("\n⚠️  Inizializzazione fallita")
