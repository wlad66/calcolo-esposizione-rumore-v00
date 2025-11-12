import { Measurement, AttenuationResult, RiskClass } from '@/types/noise';

export const calcolaLEX = (misurazioni: Measurement[]): number => {
  let somma = 0;
  misurazioni.forEach(m => {
    const leq = parseFloat(m.leq);
    const durata = parseFloat(m.durata);
    if (!isNaN(leq) && !isNaN(durata) && durata > 0) {
      somma += Math.pow(10, leq / 10) * durata;
    }
  });
  
  if (somma === 0) return 0;
  return parseFloat((10 * Math.log10(somma / 480)).toFixed(1));
};

export const getLpiccoMax = (misurazioni: Measurement[]): number => {
  const valoriValidi = misurazioni.map(m => parseFloat(m.lpicco)).filter(v => !isNaN(v));
  return valoriValidi.length > 0 ? parseFloat(Math.max(...valoriValidi).toFixed(1)) : 0;
};

export const getClasseRischio = (lex: number): RiskClass => {
  if (lex < 80) return { 
    classe: 'MINIMO', 
    colore: 'bg-success/10 text-success', 
    border: 'border-success' 
  };
  if (lex < 85) return { 
    classe: 'MEDIO - Valore inferiore di azione', 
    colore: 'bg-warning/10 text-warning', 
    border: 'border-warning' 
  };
  if (lex < 87) return { 
    classe: 'RILEVANTE - Valore superiore di azione', 
    colore: 'bg-orange-500/10 text-orange-600', 
    border: 'border-orange-500' 
  };
  return { 
    classe: 'ALTO - Superamento valori limite', 
    colore: 'bg-destructive/10 text-destructive', 
    border: 'border-destructive' 
  };
};

export const calcolaAttenuazione = (
  lexDPI: number,
  valoriHML: { h: string; m: string; l: string }
): AttenuationResult => {
  const H = parseFloat(valoriHML.h) || 0;
  const M = parseFloat(valoriHML.m) || 0;
  const L = parseFloat(valoriHML.l) || 0;
  
  if (lexDPI === 0 || (H === 0 && M === 0 && L === 0)) {
    return { leff: '0', pnr: '0', protezioneAdeguata: '' };
  }

  // Metodo HML secondo UNI EN 458:2016
  let attenuazionePrevista = 0;
  
  if (lexDPI <= 80) {
    attenuazionePrevista = M - H / 4 - L / 4;
  } else if (lexDPI <= 90) {
    attenuazionePrevista = M - H / 2 - L / 8;
  } else if (lexDPI <= 95) {
    attenuazionePrevista = M - H / 4;
  } else if (lexDPI <= 100) {
    attenuazionePrevista = M;
  } else if (lexDPI <= 105) {
    attenuazionePrevista = M + H / 4;
  } else if (lexDPI <= 110) {
    attenuazionePrevista = M + H / 2 + L / 4;
  } else {
    attenuazionePrevista = M + 3 * H / 4 + L / 2;
  }

  const PNR = attenuazionePrevista;
  const Leff = lexDPI - PNR;
  
  let protezioneAdeguata = '';
  if (Leff < 65) {
    protezioneAdeguata = 'ECCESSIVA - Rischio isolamento acustico';
  } else if (Leff >= 65 && Leff < 70) {
    protezioneAdeguata = 'BUONA - Leggermente sovradimensionata';
  } else if (Leff >= 70 && Leff <= 80) {
    protezioneAdeguata = 'OTTIMALE - Protezione adeguata';
  } else if (Leff > 80 && Leff <= 85) {
    protezioneAdeguata = 'ACCETTABILE - Protezione minima';
  } else {
    protezioneAdeguata = 'INSUFFICIENTE - DPI inadeguato';
  }

  return { leff: Leff.toFixed(1), pnr: PNR.toFixed(1), protezioneAdeguata };
};
