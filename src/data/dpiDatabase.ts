import { DPIDatabase } from '@/types/noise';

export const dpiDatabase: DPIDatabase = {
  custom: { nome: 'Inserisci valori personalizzati', h: 0, m: 0, l: 0, snr: 0 },
  
  // === TAPPI MONOUSO 3M - BASSA ATTENUAZIONE ===
  '3m_classic_small': { nome: '3M E-A-R Classic Small (SNR 28 dB)', h: 30, m: 24, l: 22, snr: 28 },
  '3m_classic': { nome: '3M E-A-R Classic (SNR 28 dB)', h: 30, m: 24, l: 22, snr: 28 },
  
  // === TAPPI MONOUSO 3M - MEDIA ATTENUAZIONE ===
  '3m_classic_regular': { nome: '3M E-A-R Classic Regular (SNR 31 dB)', h: 32, m: 28, l: 26, snr: 31 },
  '3m_yellow_neons': { nome: '3M E-A-Rsoft Yellow Neons (SNR 34 dB)', h: 33, m: 33, l: 30, snr: 34 },
  
  // === TAPPI MONOUSO 3M - ALTA ATTENUAZIONE ===
  '3m_1100': { nome: '3M 1100 (SNR 35 dB - tappi arancioni)', h: 33, m: 33, l: 31, snr: 35 },
  '3m_1110': { nome: '3M 1110 con cordino (SNR 35 dB)', h: 33, m: 33, l: 31, snr: 35 },
  '3m_soft_fx': { nome: '3M E-A-Rsoft FX (SNR 37 dB)', h: 35, m: 35, l: 32, snr: 37 },
  
  // === CUFFIE 3M ===
  'peltor_optime1': { nome: '3M Peltor Optime I (SNR 27 dB - cuffie)', h: 30, m: 26, l: 17, snr: 27 },
  'peltor_optime2': { nome: '3M Peltor Optime II (SNR 31 dB - cuffie)', h: 34, m: 31, l: 23, snr: 31 },
  'peltor_optime3': { nome: '3M Peltor Optime III (SNR 35 dB - cuffie)', h: 37, m: 34, l: 26, snr: 35 },
  'peltor_x5': { nome: '3M Peltor X5A (SNR 37 dB - cuffie)', h: 37, m: 36, l: 33, snr: 37 },
};
