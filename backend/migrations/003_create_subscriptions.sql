-- Migration 003: Subscription Plans and User Subscriptions
-- Created: 2025-11-27
-- Description: Tables for managing pricing plans and user subscriptions with Stripe integration

-- ============================================================
-- TABELLA: subscription_plans
-- Descrizione: Definizione dei piani di abbonamento disponibili
-- ============================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,  -- 'free', 'starter', 'professional', 'enterprise'
    display_name VARCHAR(100) NOT NULL,  -- Nome visualizzato all'utente
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,  -- Prezzo mensile in EUR
    price_yearly DECIMAL(10, 2),  -- Prezzo annuale in EUR (se disponibile)
    currency VARCHAR(3) DEFAULT 'EUR',

    -- Stripe Integration
    stripe_price_id_monthly VARCHAR(255),  -- Stripe Price ID per abbonamento mensile
    stripe_price_id_yearly VARCHAR(255),   -- Stripe Price ID per abbonamento annuale
    stripe_product_id VARCHAR(255),        -- Stripe Product ID

    -- Feature Limits
    max_valutazioni_esposizione_month INTEGER,  -- NULL = illimitato
    max_valutazioni_dpi_month INTEGER,          -- NULL = illimitato
    max_aziende INTEGER,                        -- NULL = illimitato
    storage_mb INTEGER,                         -- NULL = illimitato

    -- Features (boolean flags)
    feature_archivio_documenti BOOLEAN DEFAULT FALSE,
    feature_export_data BOOLEAN DEFAULT FALSE,
    feature_multi_user BOOLEAN DEFAULT FALSE,
    max_users INTEGER DEFAULT 1,
    feature_api_access BOOLEAN DEFAULT FALSE,
    feature_white_label BOOLEAN DEFAULT FALSE,
    feature_sso BOOLEAN DEFAULT FALSE,
    feature_priority_support BOOLEAN DEFAULT FALSE,
    support_response_hours INTEGER,  -- Tempo di risposta supporto in ore

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,  -- Badge "Popolare" sulla UI
    sort_order INTEGER DEFAULT 0,      -- Ordine visualizzazione

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELLA: user_subscriptions
-- Descrizione: Abbonamenti attivi degli utenti
-- ============================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),

    -- Subscription Details
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    -- Possibili stati: 'trial', 'active', 'past_due', 'canceled', 'expired'

    billing_cycle VARCHAR(20) NOT NULL,  -- 'monthly', 'yearly'

    -- Stripe Integration
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_payment_method_id VARCHAR(255),

    -- Dates
    trial_start_date TIMESTAMP,
    trial_end_date TIMESTAMP,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    canceled_at TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,

    -- Usage Tracking (reset ogni ciclo)
    usage_valutazioni_esposizione_current INTEGER DEFAULT 0,
    usage_valutazioni_dpi_current INTEGER DEFAULT 0,
    usage_storage_mb_current INTEGER DEFAULT 0,
    usage_reset_date TIMESTAMP,

    -- Billing
    last_payment_date TIMESTAMP,
    last_payment_amount DECIMAL(10, 2),
    next_payment_date TIMESTAMP,
    next_payment_amount DECIMAL(10, 2),

    -- Metadata
    metadata JSONB,  -- Dati aggiuntivi Stripe o custom

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_active_subscription UNIQUE(user_id, status)
    -- Un utente può avere solo un abbonamento attivo alla volta
);

-- ============================================================
-- TABELLA: subscription_invoices
-- Descrizione: Storico fatture e pagamenti
-- ============================================================

CREATE TABLE IF NOT EXISTS subscription_invoices (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Invoice Details
    invoice_number VARCHAR(100) UNIQUE,
    stripe_invoice_id VARCHAR(255) UNIQUE,
    stripe_charge_id VARCHAR(255),

    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,

    -- Status
    status VARCHAR(50) NOT NULL,  -- 'draft', 'open', 'paid', 'void', 'uncollectible'
    paid BOOLEAN DEFAULT FALSE,

    -- Dates
    invoice_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP,
    paid_date TIMESTAMP,

    -- Links
    invoice_pdf_url TEXT,
    hosted_invoice_url TEXT,

    -- Metadata
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELLA: subscription_usage_logs
-- Descrizione: Log dettagliato dell'uso delle risorse
-- ============================================================

CREATE TABLE IF NOT EXISTS subscription_usage_logs (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    resource_type VARCHAR(50) NOT NULL,  -- 'valutazione_esposizione', 'valutazione_dpi', 'storage'
    resource_id INTEGER,  -- ID della risorsa creata/usata
    action VARCHAR(50) NOT NULL,  -- 'create', 'delete', 'update'

    quantity INTEGER DEFAULT 1,  -- Quantità usata (es. MB per storage)

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INSERIMENTO PIANI DEFAULT
-- ============================================================

INSERT INTO subscription_plans (
    name, display_name, description,
    price_monthly, price_yearly,
    max_valutazioni_esposizione_month, max_valutazioni_dpi_month, max_aziende, storage_mb,
    feature_archivio_documenti, feature_export_data, feature_multi_user, max_users,
    feature_api_access, feature_white_label, feature_sso, feature_priority_support,
    support_response_hours, is_popular, sort_order
) VALUES
    -- PIANO FREE
    (
        'free',
        'Piano Free',
        'Per testare il prodotto',
        0.00,
        0.00,
        3,      -- 3 valutazioni esposizione/mese
        3,      -- 3 valutazioni DPI/mese
        1,      -- 1 azienda
        0,      -- No storage
        FALSE,  -- No archivio documenti
        FALSE,  -- No export
        FALSE,  -- No multi-user
        1,      -- 1 solo utente
        FALSE,  -- No API
        FALSE,  -- No white-label
        FALSE,  -- No SSO
        FALSE,  -- No priority support
        NULL,   -- Supporto community
        FALSE,
        1
    ),

    -- PIANO STARTER
    (
        'starter',
        'Piano Starter',
        'Per piccole aziende e consulenti freelance',
        39.00,
        390.00,  -- Sconto 17% annuale
        NULL,    -- Valutazioni illimitate
        NULL,    -- Valutazioni illimitate
        3,       -- 3 aziende
        500,     -- 500 MB storage
        TRUE,    -- Archivio documenti
        TRUE,    -- Export data
        FALSE,   -- No multi-user
        1,
        FALSE,   -- No API
        FALSE,   -- No white-label
        FALSE,   -- No SSO
        FALSE,   -- Email support
        48,      -- Risposta entro 48h
        FALSE,
        2
    ),

    -- PIANO PROFESSIONAL
    (
        'professional',
        'Piano Professional',
        'Per consulenti con clienti multipli e aziende medie',
        129.00,
        1290.00,  -- Sconto 17% annuale
        NULL,     -- Illimitato
        NULL,     -- Illimitato
        NULL,     -- Aziende illimitate
        5120,     -- 5 GB storage
        TRUE,
        TRUE,
        FALSE,
        1,
        FALSE,
        FALSE,
        FALSE,
        TRUE,     -- Priority support
        24,       -- Risposta entro 24h
        TRUE,     -- Piano popolare
        3
    ),

    -- PIANO ENTERPRISE
    (
        'enterprise',
        'Piano Enterprise',
        'Per grandi organizzazioni e multinazionali',
        399.00,
        3990.00,  -- Sconto 17% annuale
        NULL,     -- Illimitato
        NULL,     -- Illimitato
        NULL,     -- Illimitato
        NULL,     -- Storage illimitato
        TRUE,
        TRUE,
        TRUE,     -- Multi-user
        10,       -- Fino a 10 utenti inclusi
        TRUE,     -- API access
        TRUE,     -- White-label
        TRUE,     -- SSO
        TRUE,     -- Supporto dedicato
        4,        -- Risposta entro 4h
        FALSE,
        4
    )
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- INDEXES PER PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON subscription_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON subscription_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON subscription_invoices(status);
CREATE INDEX IF NOT EXISTS idx_usage_subscription ON subscription_usage_logs(subscription_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_resource ON subscription_usage_logs(resource_type, created_at);

-- ============================================================
-- TRIGGER PER UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_invoices_updated_at BEFORE UPDATE ON subscription_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMMENTI SULLE TABELLE
-- ============================================================

COMMENT ON TABLE subscription_plans IS 'Piani di abbonamento disponibili (Free, Starter, Professional, Enterprise)';
COMMENT ON TABLE user_subscriptions IS 'Abbonamenti attivi degli utenti con integrazione Stripe';
COMMENT ON TABLE subscription_invoices IS 'Storico fatture e pagamenti ricevuti';
COMMENT ON TABLE subscription_usage_logs IS 'Log dettagliato uso risorse per monitoraggio limiti';

-- ============================================================
-- VISTA: active_subscriptions
-- Descrizione: Vista per accesso rapido agli abbonamenti attivi
-- ============================================================

CREATE OR REPLACE VIEW active_subscriptions AS
SELECT
    us.id as subscription_id,
    us.user_id,
    u.email as user_email,
    u.nome as user_name,
    sp.name as plan_name,
    sp.display_name as plan_display_name,
    us.status,
    us.billing_cycle,
    us.current_period_start,
    us.current_period_end,
    us.usage_valutazioni_esposizione_current,
    us.usage_valutazioni_dpi_current,
    us.usage_storage_mb_current,
    sp.max_valutazioni_esposizione_month,
    sp.max_valutazioni_dpi_month,
    sp.storage_mb as max_storage_mb
FROM user_subscriptions us
JOIN users u ON us.user_id = u.id
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status IN ('active', 'trial', 'past_due');

COMMENT ON VIEW active_subscriptions IS 'Vista abbonamenti attivi con dettagli piano e utilizzo corrente';

-- ============================================================
-- FUNZIONE: check_subscription_limit
-- Descrizione: Verifica se l'utente ha raggiunto i limiti del piano
-- ============================================================

CREATE OR REPLACE FUNCTION check_subscription_limit(
    p_user_id INTEGER,
    p_resource_type VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_usage INTEGER;
    v_max_limit INTEGER;
BEGIN
    SELECT
        CASE p_resource_type
            WHEN 'valutazione_esposizione' THEN us.usage_valutazioni_esposizione_current
            WHEN 'valutazione_dpi' THEN us.usage_valutazioni_dpi_current
            ELSE 0
        END,
        CASE p_resource_type
            WHEN 'valutazione_esposizione' THEN sp.max_valutazioni_esposizione_month
            WHEN 'valutazione_dpi' THEN sp.max_valutazioni_dpi_month
            ELSE NULL
        END
    INTO v_current_usage, v_max_limit
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = p_user_id
      AND us.status = 'active'
    LIMIT 1;

    -- Se max_limit è NULL = illimitato, permetti
    IF v_max_limit IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Altrimenti verifica il limite
    RETURN v_current_usage < v_max_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_subscription_limit IS 'Controlla se utente può creare una nuova risorsa in base ai limiti del piano';

-- ============================================================
-- MIGRATION COMPLETATA
-- ============================================================
