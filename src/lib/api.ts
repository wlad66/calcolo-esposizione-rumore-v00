/**
 * Client API per comunicare con il backend
 */

// URL del backend
// In sviluppo: usa variabile d'ambiente o localhost
// In produzione: usa URL relativo (stesso server)
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? '' : 'http://72.61.189.136');

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    // Recupera il token dal localStorage
    const token = localStorage.getItem('auth_token');

    // Prepara gli headers con il token se presente
    const headers: any = {
      ...options?.headers,
    };

    // Aggiungi Content-Type json solo se non è FormData (che lo gestisce in automatico)
    if (!(options?.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Errore sconosciuto' }));

      // Gestione errore 401 Unauthorized - Token scaduto o non valido
      if (response.status === 401) {
        // Rimuovi token e user dal localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        // Ricarica la pagina per forzare il redirect al login
        window.location.href = '/login';
        throw new Error('Sessione scaduta. Effettua nuovamente il login.');
      }

      // Gestione errori di validazione FastAPI (422)
      if (response.status === 422 && Array.isArray(errorData.detail)) {
        const errorMessages = errorData.detail.map((err: any) => {
          const field = err.loc ? err.loc.join(' -> ') : 'campo sconosciuto';
          return `${field}: ${err.msg}`;
        }).join(', ');
        throw new Error(`Errore validazione: ${errorMessages}`);
      }

      // Altri errori
      const errorMessage = typeof errorData.detail === 'string'
        ? errorData.detail
        : `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API Error:', error);

    // Gestione errori di rete specifici
    if (error instanceof Error) {
      // Errore di timeout o rete non disponibile
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        return { error: 'Impossibile connettersi al server. Verifica la tua connessione internet.' };
      }
      // Timeout
      if (error.message.includes('timeout')) {
        return { error: 'Il server non risponde. Riprova più tardi.' };
      }
      // Altri errori con messaggio
      return { error: error.message };
    }

    return { error: 'Si è verificato un errore imprevisto. Riprova.' };
  }
}

// ESPOSIZIONE API
export interface MisurazioneAPI {
  id: number;
  attivita: string;
  leq: string;
  durata: string;
  lpicco: string;
}

export interface ValutazioneEsposizioneAPI {
  id?: number;
  azienda_id?: number;
  mansione: string;
  reparto: string;
  misurazioni: MisurazioneAPI[];
  lex?: string;
  lpicco?: string;
  classe_rischio?: string;
  created_at?: string;
}

export const esposizioneAPI = {
  async salva(valutazione: ValutazioneEsposizioneAPI) {
    return fetchApi<{ id: number; created_at: string; message: string }>(
      '/api/esposizione',
      {
        method: 'POST',
        body: JSON.stringify(valutazione),
      }
    );
  },

  async aggiorna(id: number, valutazione: ValutazioneEsposizioneAPI) {
    return fetchApi<{ id: number; message: string }>(
      `/api/esposizione/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(valutazione),
      }
    );
  },

  async lista(limit: number = 50) {
    return fetchApi<ValutazioneEsposizioneAPI[]>(`/api/esposizione?limit=${limit}`);
  },

  async dettaglio(id: number) {
    return fetchApi<ValutazioneEsposizioneAPI>(`/api/esposizione/${id}`);
  },

  async elimina(id: number) {
    return fetchApi<{ message: string }>(`/api/esposizione/${id}`, {
      method: 'DELETE',
    });
  },
};

// DPI API
export interface ValoriHMLAPI {
  h: string;
  m: string;
  l: string;
}

export interface ValutazioneDPIAPI {
  id?: number;
  azienda_id?: number;
  mansione: string;
  reparto: string;
  dpi_selezionato: string;
  valori_hml: ValoriHMLAPI;
  lex_per_dpi: string;
  pnr?: string;
  leff?: string;
  protezione_adeguata?: string;
  created_at?: string;
}

export const dpiAPI = {
  async salva(valutazione: ValutazioneDPIAPI) {
    return fetchApi<{ id: number; created_at: string; message: string }>(
      '/api/dpi',
      {
        method: 'POST',
        body: JSON.stringify(valutazione),
      }
    );
  },

  async aggiorna(id: number, valutazione: ValutazioneDPIAPI) {
    return fetchApi<{ id: number; message: string }>(
      `/api/dpi/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(valutazione),
      }
    );
  },

  async lista(limit: number = 50) {
    return fetchApi<ValutazioneDPIAPI[]>(`/api/dpi?limit=${limit}`);
  },

  async dettaglio(id: number) {
    return fetchApi<ValutazioneDPIAPI>(`/api/dpi/${id}`);
  },

  async elimina(id: number) {
    return fetchApi<{ message: string }>(`/api/dpi/${id}`, {
      method: 'DELETE',
    });
  },
};

// AZIENDE API
export interface AziendaAPI {
  id?: number;
  ragione_sociale: string;
  partita_iva: string;
  codice_fiscale: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  telefono?: string;
  email?: string;
  rappresentante_legale?: string;
  created_at?: string;
  updated_at?: string;
}

export const aziendeAPI = {
  async crea(azienda: AziendaAPI) {
    return fetchApi<{ id: number; created_at: string; message: string }>(
      '/api/aziende',
      {
        method: 'POST',
        body: JSON.stringify(azienda),
      }
    );
  },

  async lista(limit: number = 100) {
    return fetchApi<AziendaAPI[]>(`/api/aziende?limit=${limit}`);
  },

  async dettaglio(id: number) {
    return fetchApi<AziendaAPI>(`/api/aziende/${id}`);
  },

  async aggiorna(id: number, azienda: Partial<AziendaAPI>) {
    return fetchApi<{ message: string }>(`/api/aziende/${id}`, {
      method: 'PUT',
      body: JSON.stringify(azienda),
    });
  },

  async elimina(id: number) {
    return fetchApi<{ message: string }>(`/api/aziende/${id}`, {
      method: 'DELETE',
    });
  },

  // Ottieni valutazioni per azienda
  async getValutazioniEsposizione(id: number) {
    return fetchApi<ValutazioneEsposizioneAPI[]>(`/api/aziende/${id}/esposizione`);
  },

  async getValutazioniDPI(id: number) {
    return fetchApi<ValutazioneDPIAPI[]>(`/api/aziende/${id}/dpi`);
  },
};

// Health check
export async function healthCheck() {
  return fetchApi<{ status: string }>('/health');
}

// DOCUMENTI API
export interface DocumentoAPI {
  id: number;
  valutazione_esposizione_id?: number;
  valutazione_dpi_id?: number;
  nome_file: string;
  url: string;
  tipo_file: string;
  created_at: string;
}

export const documentiAPI = {
  async upload(file: File, valutazioneId?: number, tipoValutazione?: 'esposizione' | 'dpi') {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (valutazioneId) headers['valutazione-id'] = valutazioneId.toString();
    if (tipoValutazione) headers['tipo-valutazione'] = tipoValutazione;

    return fetchApi<{ url: string }>(
      '/api/upload',
      {
        method: 'POST',
        body: formData,
        headers
      }
    );
  },

  async getByValutazione(tipo: 'esposizione' | 'dpi', id: number) {
    return fetchApi<DocumentoAPI[]>(`/api/valutazioni/${tipo}/${id}/documenti`);
  },

  async elimina(id: number) {
    return fetchApi<{ message: string }>(`/api/documenti/${id}`, {
      method: 'DELETE',
    });
  }
};
