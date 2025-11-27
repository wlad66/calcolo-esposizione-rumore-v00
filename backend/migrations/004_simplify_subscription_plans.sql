-- ============================================================
-- Migration 004: Semplifica piani a Free e Pro
-- Data: 27 Novembre 2025
-- Descrizione: Rimuove piani Starter/Enterprise, mantiene solo Free e Pro
-- ============================================================

-- Rimuovi piani non necessari
DELETE FROM subscription_plans WHERE name IN ('starter', 'enterprise');

-- Aggiorna il piano Professional -> Pro con nuovo prezzo
UPDATE subscription_plans
SET
    name = 'pro',
    display_name = 'Piano Pro',
    description = 'Piano completo con tutte le funzionalità - €55/anno con 15 giorni di prova gratuita',
    price_monthly = 0,  -- Solo pagamento annuale
    price_yearly = 55.0,
    max_valutazioni_esposizione_month = NULL,  -- Illimitato
    max_valutazioni_dpi_month = NULL,  -- Illimitato
    max_aziende = NULL,  -- Illimitato
    storage_mb = 10240,  -- 10GB storage
    feature_archivio_documenti = TRUE,
    feature_export_data = TRUE,
    feature_multi_user = FALSE,
    max_users = 1,
    feature_api_access = FALSE,
    feature_white_label = FALSE,
    feature_priority_support = TRUE,
    is_popular = TRUE,
    is_active = TRUE,
    sort_order = 2,
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'professional';

-- Aggiorna il piano Free
UPDATE subscription_plans
SET
    description = 'Piano di prova con funzionalità limitate - Passa a Pro per sbloccare tutto',
    is_popular = FALSE,
    sort_order = 1
WHERE name = 'free';

-- Verifica risultato
SELECT id, name, display_name, price_yearly, is_active
FROM subscription_plans
ORDER BY sort_order;
