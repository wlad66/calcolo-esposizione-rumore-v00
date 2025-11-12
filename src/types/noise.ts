export interface Measurement {
  id: number;
  attivita: string;
  leq: string;
  durata: string;
  lpicco: string;
}

export interface DPIInfo {
  nome: string;
  h: number;
  m: number;
  l: number;
  snr: number;
}

export interface DPIDatabase {
  [key: string]: DPIInfo;
}

export interface AttenuationResult {
  leff: string;
  pnr: string;
  protezioneAdeguata: string;
}

export interface RiskClass {
  classe: string;
  colore: string;
  border: string;
}

// Anagrafica azienda
export interface Azienda {
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
