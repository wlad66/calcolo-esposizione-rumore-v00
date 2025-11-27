# Guida Configurazione Stripe
## Setup completo sistema pagamenti per SafetyProSuite

**Data**: 27 Novembre 2025
**Versione**: 1.0

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Prerequisiti](#prerequisiti)
3. [Setup Account Stripe](#setup-account-stripe)
4. [Configurazione Prodotti e Prezzi](#configurazione-prodotti-e-prezzi)
5. [Configurazione Webhook](#configurazione-webhook)
6. [Variabili Ambiente](#variabili-ambiente)
7. [Test Integrazione](#test-integrazione)
8. [Go Live](#go-live)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Panoramica

SafetyProSuite utilizza Stripe per gestire:
- Pagamenti ricorrenti (abbonamenti)
- Gestione ciclo di vita subscription
- Fatturazione automatica
- Customer Portal per self-service

---

## ✅ Prerequisiti

- Account Stripe (registrarsi su [stripe.com](https://stripe.com))
- Accesso al server per configurare variabili ambiente
- HTTPS attivo sul dominio (richiesto da Stripe per webhooks)

---

## 🚀 Setup Account Stripe

### 1. Creare Account Stripe

1. Vai su [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Registrati con email aziendale
3. Completa verifica identità (richiesto per andare in produzione)
4. Configura informazioni azienda:
   - **Business Name**: TOKEM LLC
   - **Country**: United States
   - **EIN**: 84-1930240

### 2. Attivare Billing (Subscriptions)

1. Nel Dashboard Stripe, vai su **Settings** → **Billing**
2. Abilita **Subscriptions** se non già attivo
3. Configura:
   - **Trial Period**: Default 14 giorni (già configurato nel codice)
   - **Payment Methods**: Carte di credito/debito, SEPA Direct Debit
   - **Currency**: EUR (Euro)

---

## 💳 Configurazione Prodotti e Prezzi

### 1. Creare i Prodotti

Nel Dashboard Stripe: **Products** → **Add Product**

#### Prodotto 1: SafetyProSuite Free
- **Name**: SafetyProSuite Free
- **Description**: Piano gratuito per testare il prodotto
- **Statement Descriptor**: SAFETYPRO FREE
- **Metadata**:
  - `plan_name`: free
  - `features`: trial

**Nota**: Non serve creare prezzi per il piano FREE (è sempre gratuito)

---

#### Prodotto 2: SafetyProSuite Starter

1. Clicca **Add Product**
2. Compila:
   - **Name**: SafetyProSuite Starter
   - **Description**: Per piccole aziende e consulenti freelance
   - **Statement Descriptor**: SAFETYPRO START
   - **Metadata**:
     - `plan_name`: starter
     - `max_aziende`: 3
     - `storage_mb`: 500

3. **Pricing**:
   - **Price 1 (Monthly)**:
     - Price: **€39.00**
     - Billing Period: **Monthly**
     - Currency: EUR
     - Tax Behavior: Exclusive
     - Price ID: Copia l'ID (es. `price_xxxxx`)

   - **Price 2 (Yearly)**:
     - Price: **€390.00** (€32.50/mese - sconto 17%)
     - Billing Period: **Yearly**
     - Currency: EUR
     - Tax Behavior: Exclusive
     - Price ID: Copia l'ID

4. Clicca **Save Product**

---

#### Prodotto 3: SafetyProSuite Professional (POPOLARE)

1. **Name**: SafetyProSuite Professional
2. **Description**: Per consulenti con clienti multipli e aziende medie
3. **Statement Descriptor**: SAFETYPRO PRO
4. **Metadata**:
   - `plan_name`: professional
   - `max_aziende`: unlimited
   - `storage_mb`: 5120
   - `is_popular`: true

5. **Pricing**:
   - **Monthly**: €129.00
   - **Yearly**: €1,290.00 (€107.50/mese - sconto 17%)

---

#### Prodotto 4: SafetyProSuite Enterprise

1. **Name**: SafetyProSuite Enterprise
2. **Description**: Per grandi organizzazioni e multinazionali
3. **Statement Descriptor**: SAFETYPRO ENT
4. **Metadata**:
   - `plan_name`: enterprise
   - `max_aziende`: unlimited
   - `storage_mb`: unlimited
   - `max_users`: 10

5. **Pricing**:
   - **Monthly**: €399.00
   - **Yearly**: €3,990.00 (€332.50/mese - sconto 17%)

---

### 2. Aggiornare Database con Stripe IDs

Dopo aver creato i prodotti su Stripe, aggiorna il database:

```sql
-- Connettiti al database
psql -h HOST -U postgres -d rumore-db

-- Aggiorna STARTER
UPDATE subscription_plans
SET
    stripe_product_id = 'prod_XXXXX',
    stripe_price_id_monthly = 'price_XXXXX',
    stripe_price_id_yearly = 'price_YYYYY'
WHERE name = 'starter';

-- Aggiorna PROFESSIONAL
UPDATE subscription_plans
SET
    stripe_product_id = 'prod_XXXXX',
    stripe_price_id_monthly = 'price_XXXXX',
    stripe_price_id_yearly = 'price_YYYYY'
WHERE name = 'professional';

-- Aggiorna ENTERPRISE
UPDATE subscription_plans
SET
    stripe_product_id = 'prod_XXXXX',
    stripe_price_id_monthly = 'price_XXXXX',
    stripe_price_id_yearly = 'price_YYYYY'
WHERE name = 'enterprise';

-- Verifica
SELECT name, stripe_product_id, stripe_price_id_monthly, stripe_price_id_yearly
FROM subscription_plans
WHERE name != 'free';
```

---

## 🔔 Configurazione Webhook

I webhook permettono a Stripe di notificare la nostra app quando avvengono eventi (pagamenti, cancellazioni, etc.)

### 1. Creare Webhook Endpoint

1. Dashboard Stripe → **Developers** → **Webhooks**
2. Clicca **Add Endpoint**
3. **Endpoint URL**: `https://rumore.safetyprosuite.com/api/webhooks/stripe`
4. **Description**: SafetyProSuite Subscription Events
5. **Events to listen to**: Seleziona questi eventi:

```
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ customer.subscription.trial_will_end
✅ invoice.paid
✅ invoice.payment_failed
```

6. Clicca **Add Endpoint**
7. **Copia il Signing Secret** (inizia con `whsec_...`)

### 2. Testare Webhook Localmente (Opzionale)

Per testare durante sviluppo:

```bash
# Installa Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhook a localhost
stripe listen --forward-to localhost:8000/api/webhooks/stripe

# Triggera evento di test
stripe trigger checkout.session.completed
```

---

## 🔐 Variabili Ambiente

### Test Mode (Sviluppo)

Aggiungi al file `.env` del backend:

```env
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_TEST_SECRET
```

### Live Mode (Produzione)

Quando sei pronto per andare live:

1. Dashboard Stripe → **Developers** → **API Keys**
2. Toggle da **Test Mode** a **Live Mode**
3. Copia le chiavi LIVE:
   - Secret Key: `sk_live_...`
   - Publishable Key: `pk_live_...`

4. Ricrea webhook per Live Mode e copia nuovo webhook secret

5. **Su VPS** (Dokploy o Docker):

```bash
# SSH nel server
ssh root@72.61.189.136

# Aggiungi variabili Stripe al servizio Docker
docker service update \
  --env-add STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY \
  --env-add STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY \
  --env-add STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET \
  calcoloesposizionerumoremain-rumorebackend-k55sdg

# Oppure configura in Dokploy UI:
# Settings → Environment Variables → Add:
# STRIPE_SECRET_KEY
# STRIPE_PUBLISHABLE_KEY
# STRIPE_WEBHOOK_SECRET
```

---

## 🧪 Test Integrazione

### 1. Test Carte di Credito (Test Mode)

Stripe fornisce carte di test:

```
Successo:
4242 4242 4242 4242   CVC: qualsiasi   Exp: futuro

3D Secure:
4000 0027 6000 3184   (richiede autenticazione)

Errori:
4000 0000 0000 0002   (carta declinata)
4000 0000 0000 9995   (insufficienza fondi)
```

### 2. Test Flusso Completo

1. **Frontend**: Vai su `/pricing`
2. Seleziona un piano (es. Starter Monthly)
3. Clicca "Inizia"
4. Verifica redirect a Stripe Checkout
5. Usa carta test: `4242 4242 4242 4242`
6. Completa pagamento
7. Verifica redirect a `/subscription/success`
8. Controlla database:

```sql
SELECT * FROM user_subscriptions
WHERE user_id = YOUR_USER_ID
ORDER BY created_at DESC
LIMIT 1;
```

### 3. Test Webhook

1. Dashboard Stripe → **Webhooks** → Click sul tuo endpoint
2. Vai su **Send Test Webhook**
3. Seleziona evento: `checkout.session.completed`
4. Clicca **Send Test Webhook**
5. Verifica risposta `200 OK`
6. Controlla logs backend:

```bash
docker logs calcoloesposizionerumoremain-rumorebackend-k55sdg --tail 50 | grep Stripe
```

---

## 🌐 Go Live

Prima di accettare pagamenti reali:

### Checklist Pre-Launch

- [ ] Verifica identità completata su Stripe
- [ ] Account bancario collegato per ricevere pagamenti
- [ ] Tutti i prodotti creati in Live Mode
- [ ] Database aggiornato con Stripe IDs live
- [ ] Webhook configurato in Live Mode
- [ ] Variabili ambiente aggiornate con chiavi LIVE
- [ ] Test completo con carte reali in test mode
- [ ] Termini e Condizioni pubblicati
- [ ] Privacy Policy pubblicata
- [ ] Customer Portal configurato

### Attivare Live Mode

1. Dashboard Stripe → Toggle **Live Mode** ON
2. Completa onboarding se richiesto
3. Aggiorna variabili ambiente sul server
4. Riavvia backend:

```bash
docker service update --force calcoloesposizionerumoremain-rumorebackend-k55sdg
```

5. Test con carta reale (piccolo importo)
6. Verifica email ricevute da Stripe
7. **Sei live! 🎉**

---

## 🛠️ Troubleshooting

### Problema: Webhook restituisce 401 Unauthorized

**Causa**: Stripe signature non valida

**Soluzione**:
```bash
# Verifica STRIPE_WEBHOOK_SECRET sia corretto
docker exec CONTAINER_ID env | grep STRIPE

# Rigenera webhook secret su Stripe Dashboard
# Aggiorna variabile ambiente
```

---

### Problema: Checkout session non si crea

**Causa**: Price ID non trovato

**Soluzione**:
```sql
-- Verifica Price IDs nel database
SELECT name, stripe_price_id_monthly, stripe_price_id_yearly
FROM subscription_plans
WHERE name != 'free';

-- Aggiorna se necessario
```

---

### Problema: Subscription non appare nel database

**Causa**: Webhook non ricevuto o fallito

**Soluzione**:
1. Stripe Dashboard → Webhooks → Verifica stato endpoint (verde = OK)
2. Check webhook logs: Click su endpoint → **Events**
3. Verifica errori nella response
4. Re-invia evento manualmente: **...** → **Resend**

---

### Problema: Payment Failed

**Causa**: Carta rifiutata, insufficienza fondi, etc.

**Soluzione**:
- In Test Mode: usa carte di test corrette
- In Live Mode: utente deve:
  - Verificare saldo
  - Provare carta diversa
  - Contattare banca

**Log per debugging**:
```bash
# Backend logs
docker logs -f CONTAINER_ID 2>&1 | grep -i "stripe\|payment"

# Database query
SELECT * FROM subscription_invoices
WHERE status = 'void' OR status = 'uncollectible'
ORDER BY created_at DESC;
```

---

## 📊 Monitoring

### Dashboard Utili

- **Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)
  - Payments → Subscriptions (abbonamenti attivi)
  - Customers (clienti registrati)
  - Invoices (fatture emesse)
  - Webhooks → Logs (eventi ricevuti)

### Query Database Utili

```sql
-- Abbonamenti attivi
SELECT COUNT(*) as active_subscriptions
FROM user_subscriptions
WHERE status IN ('active', 'trial');

-- Revenue mensile stimato
SELECT SUM(sp.price_monthly) as monthly_revenue
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active' AND us.billing_cycle = 'monthly';

-- Abbonamenti per piano
SELECT sp.display_name, COUNT(*) as count
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status IN ('active', 'trial')
GROUP BY sp.display_name;

-- Churn rate (cancellazioni ultimo mese)
SELECT COUNT(*) as canceled_last_month
FROM user_subscriptions
WHERE status = 'canceled'
  AND canceled_at >= NOW() - INTERVAL '30 days';
```

---

## 📞 Support

### Risorse Stripe

- **Documentazione**: [https://stripe.com/docs](https://stripe.com/docs)
- **Support**: [https://support.stripe.com](https://support.stripe.com)
- **Community**: [https://stripe.com/community](https://stripe.com/community)

### Contatti Interni

- **Email**: tech@safetyprosuite.com
- **Slack**: #payments-stripe

---

## ✅ Summary

Questa guida ti ha mostrato come:
- ✅ Creare account Stripe
- ✅ Configurare 4 piani di abbonamento
- ✅ Setup webhook per sincronizzazione automatica
- ✅ Configurare variabili ambiente
- ✅ Testare integrazione
- ✅ Andare in produzione

**Prossimi passi**:
1. Completa setup Stripe seguendo questa guida
2. Aggiorna database con Stripe IDs
3. Testa in modalità test
4. Vai live quando pronto!

---

**Versione**: 1.0
**Ultimo aggiornamento**: 27 Novembre 2025
**Autore**: Claude Code

🎉 **Buona fortuna con i pagamenti!**
