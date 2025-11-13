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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Errore sconosciuto' }));

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
    return { error: error instanceof Error ? error.message : 'Errore di connessione' };
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
