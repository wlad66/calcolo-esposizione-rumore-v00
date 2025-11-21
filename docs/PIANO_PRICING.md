# Piano Pricing e Funzionalità

> **Documento di pianificazione strategica** per l'implementazione del modello freemium + subscription dell'applicazione Calcolo Esposizione Rumore.

---

## 🎯 Modello Business: Freemium + Subscription

- **Trial gratuito**: 15 giorni su tutti i piani
- **Fatturazione**: Mensile o annuale (sconto 17% su annuale)
- **Payment provider**: Stripe
- **Target**: B2B - Professionisti sicurezza, RSPP, studi di consulenza

---

## 💰 Piani di Abbonamento

### **PIANO 1: STARTER**
**Prezzo**: €29/mese o €290/anno
**Target**: Professionisti freelance, piccoli studi, RSPP aziendali singoli

#### Limiti Quantitativi
- 👤 **1 utente** (solo chi si registra)
- 🏢 **Massimo 5 aziende** in anagrafica
- 📊 **30 valutazioni totali/mese** (somma esposizione + DPI)
- 💾 **Storico 6 mesi** (poi cancellazione automatica)

#### Funzionalità Incluse
- ✅ Calcolo esposizione rumore completo (LEX, Lpicco)
- ✅ Classificazione rischio automatica (D.Lgs. 81/2008)
- ✅ Calcolo DPI metodo HML base
- ✅ Gestione aziende (max 5) con validazione P.IVA/CF
- ✅ Storico valutazioni (6 mesi)
- ✅ Export CSV
- ✅ Export PDF standard (template fisso, logo AQR in watermark)

#### Funzionalità NON Incluse
- ❌ NO export Word
- ❌ NO personalizzazione report (logo, intestazione)
- ❌ NO calcoli DPI metodo SNR/ottava avanzati
- ❌ NO grafici nei report
- ❌ NO template valutazioni salvabili
- ❌ NO analytics/statistiche

#### Supporto
- 📧 Email support (risposta entro 48h lavorative)
- 📚 Accesso knowledge base / FAQ
- 📖 Documentazione online

---

### **PIANO 2: PROFESSIONAL** ⭐ *Most Popular*
**Prezzo**: €79/mese o €790/anno
**Target**: Studi di consulenza, RSPP multi-sede, consulenti attivi

#### Limiti Quantitativi
- 👥 **Fino a 3 utenti** collaboratori
- 🏢 **Aziende illimitate**
- 📊 **Valutazioni illimitate**
- 💾 **Storico illimitato**

#### Funzionalità Incluse
**✨ Tutto di STARTER, PLUS:**

##### 🔬 Calcoli Avanzati
- ✅ Metodi DPI completi (HML + SNR + Ottava)
- ✅ Calcolo automatico incertezza di misura
- ✅ Confronto multiplo DPI (tabella comparativa)
- ✅ Analisi spettrale per ottava (125 Hz - 8000 Hz)

##### 📄 Export e Report Personalizzati
- ✅ **Export PDF personalizzato**:
  - Upload logo aziendale
  - Intestazione e piè di pagina custom
  - Scelta colori brand aziendali
  - Nessun watermark
- ✅ **Export Word completo** (.docx editabile)
- ✅ **Grafici automatici nei report**:
  - Grafico a barre distribuzione LEQ per attività
  - Grafico attenuazione DPI (prima/dopo)
  - Classificazione rischio visuale (semaforo)
  - Grafico trend esposizione nel tempo

##### 🗂️ Template e Automazione
- ✅ Template valutazioni salvabili (attività ricorrenti)
- ✅ Duplicazione valutazioni esistenti (clone rapido)
- ✅ Note personalizzate per azienda/valutazione
- ✅ Tag e categorie per organizzazione dati
- ✅ Ricerca avanzata e filtri multipli

##### 👥 Gestione Multi-Utente
- ✅ Fino a 3 utenti collaboratori
- ✅ Ruoli: **Admin** (controllo totale) + **Editor** (crea/modifica)
- ✅ Condivisione valutazioni tra utenti dello stesso account
- ✅ Log attività (audit trail: chi ha fatto cosa e quando)

##### 📊 Dashboard e Analytics Base
- ✅ **Dashboard statistiche**:
  - Numero valutazioni per mese (grafico trend)
  - Distribuzione classi di rischio (torta)
  - Top 10 aziende più valutate
  - LEX medio per settore
- ✅ Export massivo dati (tutte le valutazioni in CSV)
- ✅ Report riepilogativo mensile (PDF automatico)

#### Supporto
- 📧 Email support **prioritario** (risposta entro 24h)
- 💬 Chat support (orario ufficio 9-18)
- 📞 Numero verde per urgenze tecniche
- 📚 Accesso knowledge base avanzata

---

### **PIANO 3: ENTERPRISE**
**Prezzo**: €199/mese o €1.990/anno
**Target**: Grandi studi multi-sede, enti di formazione, software house che rivendono

#### Limiti Quantitativi
- 👥 **Utenti illimitati**
- 🏢 **Aziende illimitate**
- 📊 **Valutazioni illimitate**
- 💾 **Storico illimitato + backup dedicato giornaliero**

#### Funzionalità Incluse
**✨ Tutto di PROFESSIONAL, PLUS:**

##### 🎨 White Label e Personalizzazione Totale
- ✅ **White-label completo**:
  - Dominio personalizzato (es: valutazioni.tuostudio.it)
  - Brand completo (logo, nome app, colori, favicon)
  - Email transazionali da tuo dominio
  - Nascondi completamente brand AQR
- ✅ **Report completamente customizzabili**:
  - Editor template report drag & drop
  - Campi personalizzati illimitati
  - Clausole legali personalizzate
  - Sezioni custom (es: raccomandazioni specifiche)
  - Numerazione automatica documenti

##### 🗄️ Database e Integrazioni
- ✅ **Database DPI personalizzato**:
  - Aggiungi i tuoi DPI proprietari
  - Importa database DPI da Excel/CSV
  - Gestione completa caratteristiche tecniche
- ✅ **API REST completa**:
  - Integrazione con software gestionali (SAP, Zucchetti, etc.)
  - Webhook per automazioni
  - Documentazione Swagger interattiva
  - Rate limit dedicato (10.000 req/giorno)
- ✅ **Import massivo**:
  - Aziende da CSV/Excel (mapping campi)
  - Valutazioni bulk upload
  - Sincronizzazione database esterni

##### 📈 Analytics Avanzate e Business Intelligence
- ✅ **Dashboard analytics avanzata**:
  - Grafici trend temporali multi-anno
  - Heatmap esposizioni per reparto/settore
  - Analisi predittiva (ML: aziende a rischio)
  - Alert automatici rivalutazioni in scadenza
- ✅ **Report aggregati multi-azienda**
- ✅ **Benchmark settoriali**:
  - Confronto LEX con media settore ATECO
  - Posizionamento percentile
  - Best practices suggerite
- ✅ Export report analytics in PDF/Excel

##### 🔐 Gestione Avanzata e Sicurezza
- ✅ **Ruoli granulari**:
  - Admin, Editor, Viewer (sola lettura), Auditor
  - Permessi per singola azienda/reparto
  - Gruppi utenti personalizzati
- ✅ **Workflow approvazione**:
  - Stati valutazione: Bozza → In Revisione → Approvata → Archiviata
  - Sistema commenti e revisioni
  - Firma digitale valutazioni (integrazione DocuSign/InfoCert)
- ✅ **Scadenzario automatico**:
  - Promemoria rivalutazioni periodiche (es: ogni 3 anni)
  - Alert via email e dashboard
  - Calendario integrato (export iCal/Google Calendar)
- ✅ **Audit trail completo**:
  - Tracciamento modifiche dettagliato
  - Export log per compliance
  - Retention policy configurabile

##### 🛡️ Conformità, Sicurezza e SLA
- ✅ **Backup dedicato**:
  - Backup giornaliero automatico
  - Retention 90 giorni
  - Restore point-in-time
- ✅ **GDPR compliance**:
  - Export completo dati (portabilità)
  - Right to be forgotten (cancellazione)
  - Data Processing Agreement (DPA)
- ✅ **SSO (Single Sign-On)**:
  - Integrazione Azure AD / Entra ID
  - Google Workspace
  - SAML 2.0 generico
- ✅ **SLA 99.9% uptime** con rimborso proporzionale
- ✅ **Ambienti separati**: produzione + staging per test

#### Supporto Premium
- 📞 **Supporto telefonico dedicato** (linea diretta)
- 📧 Email support **critico** (risposta entro 4h, 24/7 per emergenze)
- 💬 Chat prioritaria con tecnici senior
- 👨‍💼 **Account manager dedicato** (chiamata mensile review)
- 🎓 **Onboarding e formazione personalizzata**:
  - 2 sessioni formazione online (2h cadauna) per il team
  - Materiale formativo personalizzato (guide, video)
  - Webinar mensili su novità e best practices
  - Consulenza strategica sull'uso ottimale del software
- 🚀 **Priorità nello sviluppo**: feature request considerato con priorità

---

## 📊 Matrice Comparativa Funzionalità

| Funzionalità | Starter | Professional | Enterprise |
|-------------|:-------:|:------------:|:----------:|
| **LIMITI** ||||
| Utenti | 1 | 3 | ∞ |
| Aziende | 5 | ∞ | ∞ |
| Valutazioni/mese | 30 | ∞ | ∞ |
| Storico dati | 6 mesi | ∞ | ∞ + backup |
| **CALCOLI** ||||
| Calcolo esposizione rumore | ✅ | ✅ | ✅ |
| Classificazione rischio | ✅ | ✅ | ✅ |
| DPI metodo HML | ✅ | ✅ | ✅ |
| DPI metodo SNR | ❌ | ✅ | ✅ |
| DPI metodo Ottava | ❌ | ✅ | ✅ |
| Incertezza di misura | ❌ | ✅ | ✅ |
| Confronto multiplo DPI | ❌ | ✅ | ✅ |
| Database DPI custom | ❌ | ❌ | ✅ |
| **EXPORT** ||||
| Export CSV | ✅ | ✅ | ✅ |
| Export PDF | Base | Personalizzato | White-label |
| Export Word | ❌ | ✅ | ✅ |
| Grafici nei report | ❌ | ✅ | ✅ Avanzati |
| Logo aziendale | ❌ | ✅ | ✅ |
| Template custom | ❌ | ❌ | Editor completo |
| **GESTIONE** ||||
| Template valutazioni | ❌ | ✅ | ✅ |
| Duplicazione rapida | ❌ | ✅ | ✅ |
| Tag e categorie | ❌ | ✅ | ✅ |
| Note personalizzate | ❌ | ✅ | ✅ |
| Multi-utente | ❌ | ✅ (3 utenti) | ✅ (∞) |
| Ruoli avanzati | ❌ | Base | Granulari |
| Workflow approvazione | ❌ | ❌ | ✅ |
| Scadenzario | ❌ | ❌ | ✅ |
| **ANALYTICS** ||||
| Dashboard statistiche | ❌ | Base | Avanzata |
| Grafici trend | ❌ | ✅ | ✅ + ML |
| Report aggregati | ❌ | ❌ | ✅ |
| Benchmark settoriali | ❌ | ❌ | ✅ |
| **INTEGRAZIONI** ||||
| API REST | ❌ | ❌ | ✅ |
| Webhook | ❌ | ❌ | ✅ |
| Import massivo | ❌ | ❌ | ✅ |
| SSO | ❌ | ❌ | ✅ |
| **BRAND** ||||
| White-label | ❌ | ❌ | ✅ |
| Dominio custom | ❌ | ❌ | ✅ |
| **SUPPORTO** ||||
| Email | 48h | 24h priorità | 4h critico |
| Chat | ❌ | ✅ (9-18) | ✅ Prioritaria |
| Telefono | ❌ | Verde urgenze | Linea dedicata |
| Account manager | ❌ | ❌ | ✅ |
| Formazione | ❌ | ❌ | ✅ 4h incluse |
| **SLA** ||||
| Uptime garantito | 95% | 99% | 99.9% |
| Backup | ❌ | Settimanale | Giornaliero |

---

## 🛠️ Funzionalità da Sviluppare

### 🔴 **PRIORITÀ ALTA** (necessarie per lancio piani a pagamento)
*Tempo stimato: 6-8 settimane*

1. **Sistema limiti/quote per piano** ⏱️ 1 settimana
   - Contatori aziende, valutazioni, utenti
   - Blocco soft (warning) e hard (impossibilità)
   - Dashboard utilizzo quota per utente

2. **Integrazione Stripe** ⏱️ 2 settimane
   - Checkout subscription
   - Trial 15 giorni automatico
   - Gestione upgrade/downgrade piano
   - Webhook events (payment success/failed/canceled)
   - Customer portal (fatture, disdetta)

3. **Personalizzazione PDF (Professional+)** ⏱️ 1,5 settimane
   - Upload logo aziendale (storage S3/Cloudflare)
   - Campi intestazione/footer custom
   - Color picker brand aziendali
   - Preview real-time template

4. **Grafici nei report (Professional+)** ⏱️ 1 settimana
   - Grafico distribuzione LEQ (bar chart)
   - Grafico attenuazione DPI (before/after)
   - Classificazione rischio (gauge/semaforo)
   - Export grafici in PDF

5. **Template valutazioni (Professional+)** ⏱️ 1 settimana
   - Salvataggio configurazione attività ricorrenti
   - CRUD template (nome, descrizione, misurazioni default)
   - Applicazione template rapida
   - Condivisione template tra utenti (Enterprise)

6. **Gestione team e inviti (Professional+)** ⏱️ 1,5 settimane
   - Sistema inviti utenti via email
   - Ruoli: Admin, Editor, Viewer
   - Gestione permessi base
   - Elenco utenti con stato (attivo/invitato/disabilitato)

**Totale priorità ALTA**: ~8 settimane (2 mesi)

---

### 🟡 **PRIORITÀ MEDIA** (post-lancio, primi 3-6 mesi)
*Tempo stimato: 8-10 settimane*

7. **Dashboard analytics base (Professional+)** ⏱️ 2 settimane
   - Grafici statistiche: valutazioni/mese, distribuzione rischio
   - KPI cards (totale aziende, valutazioni, LEX medio)
   - Filtri per periodo temporale
   - Export report PDF/Excel

8. **Editor template report (Enterprise)** ⏱️ 3 settimane
   - Drag & drop builder (es: GrapeJS)
   - Campi dinamici {{azienda.nome}} {{lex}}
   - Sezioni custom (clausole legali)
   - Anteprima real-time

9. **Database DPI personalizzato (Enterprise)** ⏱️ 1,5 settimane
   - CRUD DPI custom per utente
   - Import da Excel/CSV con mapping
   - Merge con database standard
   - Versioning DPI (storico modifiche)

10. **Import/export massivo (Enterprise)** ⏱️ 1 settimana
    - Import aziende da CSV/Excel
    - Import valutazioni bulk
    - Validazione e preview pre-import
    - Error handling e rollback

11. **Sistema notifiche e scadenzario (Enterprise)** ⏱️ 1,5 settimane
    - Scadenze rivalutazioni periodiche
    - Alert via email
    - Calendario integrato
    - Promemoria configurabili

**Totale priorità MEDIA**: ~9 settimane (2,5 mesi)

---

### 🟢 **PRIORITÀ BASSA** (dopo 6+ mesi, enterprise advanced features)
*Tempo stimato: 12-16 settimane*

12. **API REST pubblica (Enterprise)** ⏱️ 3 settimane
    - Endpoint CRUD completi
    - Documentazione Swagger/OpenAPI
    - API keys e rate limiting
    - Webhook configurabili
    - SDK JavaScript/Python

13. **White-label completo (Enterprise)** ⏱️ 4 settimane
    - Multi-tenancy con dominio custom
    - DNS configuration automatica
    - SSL certificati automatici (Let's Encrypt)
    - Custom branding completo (CSS variables)
    - Email transazionali branded

14. **SSO integration (Enterprise)** ⏱️ 2 settimane
    - Azure AD / Entra ID (OAuth2)
    - Google Workspace
    - SAML 2.0 generico
    - Just-in-time provisioning

15. **Analytics avanzate e ML (Enterprise)** ⏱️ 4 settimane
    - Trend analysis multi-anno
    - Predictions (aziende a rischio)
    - Benchmark settoriali (database ATECO)
    - Heatmaps e visualizzazioni avanzate
    - Export BI tools (Power BI, Tableau)

16. **Workflow e firma digitale (Enterprise)** ⏱️ 2 settimane
    - Stati documento: bozza → revisione → approvata
    - Sistema commenti e review
    - Integrazione DocuSign/InfoCert
    - Audit trail completo

17. **Sistema backup e disaster recovery (Enterprise)** ⏱️ 1 settimana
    - Backup automatici giornalieri
    - Point-in-time recovery
    - Export completo account (GDPR)
    - Ambiente staging dedicato

**Totale priorità BASSA**: ~16 settimane (4 mesi)

---

## 📅 Roadmap Sviluppo Suggerita

### **FASE 1: MVP Commerciale** (Mesi 1-2)
*Obiettivo: Lanciare Starter + Professional*

- ✅ Sistema quote e limiti
- ✅ Integrazione Stripe + trial 15gg
- ✅ Personalizzazione PDF base
- ✅ Grafici nei report
- ✅ Template valutazioni
- ✅ Gestione team (3 utenti)

**Deliverable**: Landing page + checkout funzionante

---

### **FASE 2: Consolidamento** (Mesi 3-5)
*Obiettivo: Migliorare retention e lanciare Enterprise*

- ✅ Dashboard analytics base
- ✅ Editor template report
- ✅ Database DPI custom
- ✅ Import/export massivo
- ✅ Scadenzario e notifiche

**Deliverable**: Piano Enterprise completo

---

### **FASE 3: Scale & Enterprise Features** (Mesi 6-10)
*Obiettivo: Funzionalità avanzate per grandi clienti*

- ✅ API REST pubblica
- ✅ White-label completo
- ✅ SSO integration
- ✅ Analytics avanzate + ML
- ✅ Workflow approvazione
- ✅ Backup e DR

**Deliverable**: Piattaforma enterprise-ready

---

## 💡 Considerazioni Strategiche

### **Pricing Positioning**
- **Competitor benchmark**: Software RSPP €50-150/mese (media €80/mese)
- **Nostro posizionamento**: Competitivo con valore aggiunto (conformità normativa)
- **Ancoraggio**: Piano Professional come "sweet spot" (Most Popular badge)

### **Customer Acquisition Cost (CAC)**
- Stimato: €150-200 (Google Ads + content marketing)
- Payback period target: 3 mesi (su Professional)
- Lifetime Value (LTV) stimato: €1.500-2.000 (18-24 mesi retention)

### **Conversion Funnel**
1. **Trial 15gg** → Starter (target 30% conversion)
2. **Starter** → Professional (upgrade dopo 3 mesi, target 40%)
3. **Professional** → Enterprise (upgrade dopo 6 mesi, target 10%)

### **Churn Reduction**
- **Onboarding**: Email drip campaign 15 giorni
- **Engagement**: Webinar mensili + newsletter best practices
- **Success metrics**: Monitora aziende/valutazioni create in trial
- **Win-back**: Offerta ri-attivazione 20% sconto dopo cancellazione

### **Upselling Opportunities**
- **Add-ons potenziali**:
  - Consulenza personalizzata (€200/h)
  - Formazione avanzata team (€500/sessione)
  - Setup white-label assistito (€1.500 una tantum)
  - Database DPI settoriale premium (€50/mese)

---

## 🎯 Metriche di Successo (KPI)

### **Business Metrics**
- **MRR** (Monthly Recurring Revenue): target €10.000/mese anno 1
- **ARR** (Annual Recurring Revenue): target €120.000 anno 1
- **Churn rate**: <5%/mese
- **CAC payback**: <3 mesi

### **Product Metrics**
- **Trial → Paid conversion**: >25%
- **Active users**: >70% utenti loggano almeno 1x/settimana
- **Feature adoption**:
  - Export PDF: >90%
  - Dashboard analytics: >60% (Professional+)
  - API usage: >30% (Enterprise)

### **Customer Success**
- **NPS** (Net Promoter Score): >50
- **Customer satisfaction**: >4.5/5
- **Time to first value**: <1 ora (prima valutazione creata)

---

## 🚀 Prossimi Step Operativi

### **1. Validazione** (Settimana 1-2)
- [ ] Ricerca competitor prezzi (10 software simili)
- [ ] Survey clienti potenziali (50 RSPP/consulenti)
- [ ] Interviste qualitative (5 studi di consulenza)
- [ ] Definizione finale prezzi

### **2. Sviluppo MVP** (Settimana 3-10)
- [ ] Setup Stripe account + test mode
- [ ] Sviluppo sistema quote (backend)
- [ ] Integrazione checkout Stripe (frontend)
- [ ] Testing payment flow (sandbox)
- [ ] Personalizzazione PDF + grafici

### **3. Landing Page** (Settimana 8-11)
- [ ] Copywriting (hero, features, testimonial, FAQ)
- [ ] Design mockup (Figma)
- [ ] Sviluppo (Next.js + TailwindCSS)
- [ ] SEO optimization
- [ ] A/B testing setup (2 versioni hero)

### **4. Launch** (Settimana 12)
- [ ] Soft launch (beta tester selezionati)
- [ ] Monitoring metrics
- [ ] Fix bug critici
- [ ] Public launch
- [ ] Campagna marketing (Google Ads, LinkedIn)

---

## 📝 Note e Modifiche

*Usa questa sezione per annotare modifiche, idee, feedback durante lo studio del documento*

### Modifiche da discutere:
- [ ]
- [ ]
- [ ]

### Domande aperte:
- [ ]
- [ ]
- [ ]

### Idee aggiuntive:
- [ ]
- [ ]
- [ ]

---

**Documento creato**: 2025-01-15
**Ultima modifica**: 2025-01-15
**Versione**: 1.0
**Status**: 📋 In revisione
