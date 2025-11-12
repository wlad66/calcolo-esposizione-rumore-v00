-- Schema Database per Calcolo Esposizione Rumore
-- PostgreSQL

-- Tabella Aziende
CREATE TABLE IF NOT EXISTS aziende (
    id SERIAL PRIMARY KEY,
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
CREATE INDEX idx_aziende_ragione_sociale ON aziende(ragione_sociale);
CREATE INDEX idx_aziende_partita_iva ON aziende(partita_iva);

-- Tabella Valutazioni Esposizione
CREATE TABLE IF NOT EXISTS valutazioni_esposizione (
    id SERIAL PRIMARY KEY,
    azienda_id INTEGER REFERENCES aziende(id) ON DELETE CASCADE,
    mansione VARCHAR(255) NOT NULL,
    reparto VARCHAR(255),
    lex DECIMAL(5,2),
    lpicco DECIMAL(5,2),
    classe_rischio VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_valutazioni_esposizione_azienda ON valutazioni_esposizione(azienda_id);
CREATE INDEX idx_valutazioni_esposizione_data ON valutazioni_esposizione(created_at DESC);

-- Tabella Misurazioni (per valutazioni esposizione)
CREATE TABLE IF NOT EXISTS misurazioni (
    id SERIAL PRIMARY KEY,
    valutazione_id INTEGER REFERENCES valutazioni_esposizione(id) ON DELETE CASCADE,
    attivita VARCHAR(255),
    leq DECIMAL(5,2),
    durata INTEGER,
    lpicco DECIMAL(5,2),
    ordine INTEGER DEFAULT 0
);

CREATE INDEX idx_misurazioni_valutazione ON misurazioni(valutazione_id);

-- Tabella Valutazioni DPI
CREATE TABLE IF NOT EXISTS valutazioni_dpi (
    id SERIAL PRIMARY KEY,
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

CREATE INDEX idx_valutazioni_dpi_azienda ON valutazioni_dpi(azienda_id);
CREATE INDEX idx_valutazioni_dpi_data ON valutazioni_dpi(created_at DESC);

-- Trigger per aggiornare updated_at su aziende
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_aziende_updated_at
    BEFORE UPDATE ON aziende
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Dati di esempio (opzionale - puoi rimuoverli)
INSERT INTO aziende (ragione_sociale, partita_iva, codice_fiscale, indirizzo, citta, cap, provincia, telefono, email, rappresentante_legale)
VALUES
    ('Esempio S.r.l.', '12345678901', '12345678901', 'Via Roma 123', 'Milano', '20100', 'MI', '02 1234567', 'info@esempio.it', 'Mario Rossi')
ON CONFLICT (partita_iva) DO NOTHING;
