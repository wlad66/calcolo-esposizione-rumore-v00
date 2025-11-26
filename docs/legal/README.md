# Documenti Legali - SafetyProSuite

Questa cartella contiene tutti i documenti legali necessari per la conformità normativa di SafetyProSuite.

## 📄 Documenti Inclusi

### 1. **TERMINI_E_CONDIZIONI.md**
Termini e Condizioni di Servizio completi che regolano l'uso di SafetyProSuite.

**Contenuto**:
- Definizioni e oggetto del servizio
- Registrazione e gestione account
- Licenza d'uso e restrizioni
- Abbonamento e pagamenti
- Proprietà intellettuale
- Privacy e protezione dati
- Disponibilità del servizio e limitazioni di responsabilità
- Risoluzione e cessazione
- Penali e disposizioni legali

**Obbligatorio**: ✅ Sì (deve essere accettato alla registrazione)

---

### 2. **PRIVACY_POLICY.md**
Informativa sulla Privacy conforme al GDPR (Regolamento UE 2016/679) e CCPA (California).

**Contenuto**:
- Titolare del trattamento e contatti DPO
- Categorie di dati raccolti
- Base giuridica e finalità del trattamento
- Modalità e durata del trattamento
- Comunicazione e trasferimento dati (inclusi trasferimenti extra-UE)
- Misure di sicurezza tecniche e organizzative
- Diritti degli interessati (accesso, cancellazione, portabilità, etc.)
- Gestione cookie
- Diritti specifici per residenti California (CCPA/CPRA)

**Obbligatorio**: ✅ Sì

---

### 3. **COOKIE_POLICY.md**
Informativa dettagliata sull'uso dei cookie e tecnologie simili.

**Contenuto**:
- Definizione e tipologie di cookie
- Cookie utilizzati da SafetyProSuite (tecnici, preferenze, analytics)
- Cookie di terze parti (Google Analytics, Stripe, Cloudflare)
- Gestione preferenze cookie e consenso
- Banner cookie e pannello impostazioni
- Local Storage e altre tecnologie
- Do Not Track (DNT)
- FAQ sui cookie

**Obbligatorio**: ✅ Sì

---

### 4. **ACCORDO_TRATTAMENTO_DATI.md**
Data Processing Agreement (DPA) ai sensi dell'Art. 28 GDPR.

**Contenuto**:
- Ruoli: Utente = Titolare, TOKEM LLC = Responsabile
- Natura e finalità del trattamento
- Categorie di dati e interessati
- Istruzioni del titolare
- Obblighi del responsabile (sicurezza, riservatezza, assistenza)
- Sub-responsabili del trattamento (Backblaze B2, database provider, etc.)
- Trasferimenti extra-UE con Standard Contractual Clauses (SCC)
- Notifica data breach (entro 24 ore)
- Cancellazione e restituzione dati
- Diritto di audit
- Responsabilità e indennizzi

**Obbligatorio**: ✅ Sì

---

## 🔧 Come Utilizzare i Documenti

### Integrazione nella Pagina di Registrazione

Il componente React `LegalDocumentsAcceptance` è già pronto per l'uso. Integrarlo nella pagina di registrazione:

```tsx
import { useState } from 'react';
import LegalDocumentsAcceptance from '@/components/LegalDocuments';

const RegisterPage = () => {
  const [legalDocsAccepted, setLegalDocsAccepted] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleRegister = () => {
    if (!legalDocsAccepted) {
      setShowError(true);
      return;
    }

    // Procedi con la registrazione...
  };

  return (
    <div>
      {/* Form di registrazione (nome, email, password, etc.) */}

      {/* Documenti Legali */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Documenti Legali</h3>
        <LegalDocumentsAcceptance
          onAcceptAll={setLegalDocsAccepted}
          showValidationError={showError}
        />
      </div>

      {/* Pulsante Registrati */}
      <Button
        onClick={handleRegister}
        disabled={!legalDocsAccepted}
        className="w-full mt-6"
      >
        Registrati
      </Button>
    </div>
  );
};
```

### Servire i Documenti come File Statici

I documenti markdown devono essere accessibili tramite HTTP. Due opzioni:

#### Opzione A: Copiare nella cartella `public`

```bash
# Dalla root del progetto
mkdir -p public/docs/legal
cp docs/legal/*.md public/docs/legal/
```

Poi il component li caricherà da `/docs/legal/TERMINI_E_CONDIZIONI.md`.

#### Opzione B: Servire dal Backend

Modificare `backend/main.py` per servire i documenti:

```python
from fastapi import FastAPI
from fastapi.responses import FileResponse

@app.get("/api/legal/{document_name}")
async def get_legal_document(document_name: str):
    """
    Serve i documenti legali
    """
    allowed_docs = [
        "TERMINI_E_CONDIZIONI.md",
        "PRIVACY_POLICY.md",
        "COOKIE_POLICY.md",
        "ACCORDO_TRATTAMENTO_DATI.md"
    ]

    if document_name not in allowed_docs:
        raise HTTPException(status_code=404, detail="Documento non trovato")

    file_path = f"../docs/legal/{document_name}"
    return FileResponse(file_path, media_type="text/markdown")
```

Aggiornare gli URL nel componente:
```tsx
url: '/api/legal/TERMINI_E_CONDIZIONI.md'
```

---

## 📝 Personalizzazione

### Informazioni da Completare (se necessario)

I documenti sono già personalizzati con i dati di TOKEM LLC. Tuttavia, verifica/aggiorna:

1. **Prezzi e Piani di Abbonamento** (TERMINI_E_CONDIZIONI.md, sezione 5):
   - Attualmente generico. Specificare piani tariffari esatti se disponibili.

2. **Data Protection Officer (DPO)** (PRIVACY_POLICY.md, ACCORDO_TRATTAMENTO_DATI.md):
   - Email: `privacy@safetyprosuite.com` (verificare che esista)
   - Considerare nomina formale DPO se richiesto da GDPR (trattamento su larga scala)

3. **Rappresentante UE** (PRIVACY_POLICY.md, sezione 1.3):
   - Se SafetyProSuite ha molti utenti UE, potrebbe essere necessario nominare un rappresentante nell'UE ai sensi dell'Art. 27 GDPR.

4. **Sub-Responsabili** (ACCORDO_TRATTAMENTO_DATI.md, sezione 6.2):
   - Aggiornare l'elenco con i provider effettivamente utilizzati:
     - Database: Neon? Supabase? AWS RDS? Altro?
     - Email: SendGrid? Mailgun? AWS SES?
   - Verificare che tutti abbiano DPA firmati con SCC.

5. **Certificazioni di Sicurezza** (ACCORDO_TRATTAMENTO_DATI.md):
   - Se si ottengono certificazioni (SOC 2, ISO 27001), aggiungerle nella sezione Audit.

### Linguaggio e Traduzioni

I documenti sono in **italiano**. Per supporto multilingua:

1. Creare versioni tradotte:
   - `docs/legal/en/TERMS_AND_CONDITIONS.md` (inglese)
   - `docs/legal/es/TERMINOS_Y_CONDICIONES.md` (spagnolo)
   - etc.

2. Aggiornare il componente `LegalDocuments.tsx` per rilevare la lingua utente.

---

## ⚖️ Note Legali Importanti

### ⚠️ Disclaimer

**I documenti forniti sono template generici e NON costituiscono consulenza legale.**

Prima di utilizzarli in produzione, **si raccomanda fortemente di**:

1. ✅ **Consultare un avvocato specializzato** in diritto digitale, privacy e GDPR
2. ✅ **Adattare i documenti** alle specificità del business e del modello di servizio
3. ✅ **Verificare conformità** con le leggi locali applicabili (USA, UE, altri paesi)
4. ✅ **Ottenere certificazioni** (es. Privacy Shield successor, SOC 2) se necessario
5. ✅ **Rivedere periodicamente** i documenti (almeno annualmente) per adeguarli a cambiamenti normativi

### Responsabilità

**TOKEM LLC** è responsabile di:
- Mantenere aggiornati i documenti
- Rispettare gli obblighi dichiarati (misure di sicurezza, notifica breach, etc.)
- Formare il personale sulla conformità GDPR

### Autorità di Controllo

In caso di dubbi sulla conformità GDPR:
- **Italia**: Garante per la Protezione dei Dati Personali - www.garanteprivacy.it
- **UE**: European Data Protection Board (EDPB) - edpb.europa.eu
- **USA (California)**: California Attorney General - oag.ca.gov/privacy

---

## 🔄 Aggiornamenti

**Versione attuale**: 1.0
**Data ultimo aggiornamento**: 26 Novembre 2025

### Changelog

#### v1.0 - 26 Novembre 2025
- ✅ Creazione iniziale di tutti i documenti legali
- ✅ Conformità GDPR (Regolamento UE 2016/679)
- ✅ Conformità CCPA/CPRA (California)
- ✅ Standard Contractual Clauses per trasferimenti extra-UE
- ✅ Data Processing Agreement (DPA) Art. 28 GDPR
- ✅ Cookie Policy completa
- ✅ Componente React per accettazione documenti

---

## 📧 Contatti

Per domande sui documenti legali:

**TOKEM LLC**
- Email DPO: privacy@safetyprosuite.com
- Email supporto: info@safetyprosuite.com
- Website: www.safetyprosuite.com

---

## 📚 Risorse Utili

### GDPR e Privacy
- Testo completo GDPR: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- Linee guida EDPB: https://edpb.europa.eu/our-work-tools/general-guidance_en
- GDPR.eu (risorsa non ufficiale): https://gdpr.eu/

### Standard Contractual Clauses (SCC)
- SCC aggiornate (2021): https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en

### EU-US Data Privacy Framework
- Lista aziende certificate: https://www.dataprivacyframework.gov/s/

### CCPA/CPRA (California)
- Testo CCPA: https://oag.ca.gov/privacy/ccpa
- CPRA (aggiornamento 2023): https://cppa.ca.gov/

### Tools e Checker
- GDPR Compliance Checker: https://gdpr.eu/checklist/
- Cookie Consent Tool: https://www.cookiebot.com/
- Privacy Policy Generator: https://www.iubenda.com/ (a pagamento, per confronto)

---

*Ultimo aggiornamento: 26 Novembre 2025*
*Versione: 1.0*
