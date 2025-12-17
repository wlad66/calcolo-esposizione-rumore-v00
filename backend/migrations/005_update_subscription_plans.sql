-- Migration 005: Aggiornamento Piani Abbonamento
-- Nuovo modello: Free Trial (7 giorni) + Professional (€55/anno)
-- Data: 17 Dicembre 2024

-- 1. Disabilita piani vecchi (mantieni dati storici)
UPDATE subscription_plans 
SET is_active = false 
WHERE name IN ('starter', 'professional', 'enterprise')
  AND is_active = true;

-- 2. Aggiungi colonne necessarie a user_subscriptions se non esistono
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;

ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false;

-- 3. Crea piano Free Trial
INSERT INTO subscription_plans (
    name, 
    display_name, 
    description,
    price_monthly, 
    price_yearly,
    trial_days,
    max_aziende,
    max_valutazioni_month,
    storage_mb,
    features,
    is_active,
    stripe_product_id,
    stripe_price_id_monthly,
    stripe_price_id_yearly
) VALUES (
    'free_trial',
    'Free Trial',
    'Prova gratuita 7 giorni con accesso completo a tutte le funzionalità',
    0.00,
    0.00,
    7,
    NULL, -- illimitate durante trial
    NULL, -- illimitate durante trial
    50,
    '{"export_csv": true, "export_pdf": true, "export_word": true, "custom_logo": true, "analytics": false, "api_access": false, "backup": false}',
    true,
    NULL, -- nessun prodotto Stripe per piano gratuito
    NULL,
    NULL
)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- 4. Crea piano Professional
INSERT INTO subscription_plans (
    name,
    display_name,
    description,
    price_monthly,
    price_yearly,
    trial_days,
    max_aziende,
    max_valutazioni_month,
    storage_mb,
    features,
    is_active,
    stripe_product_id,
    stripe_price_id_monthly,
    stripe_price_id_yearly
) VALUES (
    'professional',
    'Professional',
    'Piano completo per professionisti - €55/anno',
    NULL, -- solo annuale
    55.00,
    0, -- nessun trial aggiuntivo (già fatto con free_trial)
    NULL, -- illimitate
    NULL, -- illimitate
    50,
    '{"export_csv": true, "export_pdf": true, "export_word": true, "custom_logo": true, "analytics": true, "api_access": false, "backup": true, "priority_support": true}',
    true,
    'prod_RVmKuWBnGPqKzC', -- Da aggiornare con ID reale da Stripe Dashboard
    NULL, -- solo annuale
    'price_1SY3znLTvWqex2p5Q2l24hM3' -- Price ID fornito dall'utente
)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_yearly = EXCLUDED.price_yearly,
    stripe_price_id_yearly = EXCLUDED.stripe_price_id_yearly,
    is_active = EXCLUDED.is_active;

-- 5. Verifica risultati
SELECT 
    name,
    display_name,
    price_yearly,
    storage_mb,
    is_active,
    stripe_price_id_yearly
FROM subscription_plans
WHERE is_active = true
ORDER BY price_yearly NULLS FIRST;

-- Note:
-- - Gli utenti esistenti con piani vecchi mantengono il loro piano fino a scadenza
-- - Nuovi utenti ricevono automaticamente piano free_trial alla registrazione
-- - stripe_product_id per Professional va aggiornato dopo creazione prodotto su Stripe Dashboard
