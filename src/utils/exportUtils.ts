import { Measurement, AttenuationResult, RiskClass } from '@/types/noise';
import { dpiDatabase } from '@/data/dpiDatabase';
import { calcolaLEX, getLpiccoMax, getClasseRischio } from './noiseCalculations';

export const esportaCSVEsposizione = (
  misurazioni: Measurement[],
  mansione: string,
  reparto: string
) => {
  try {
    let csv = '\uFEFF';
    csv += 'Calcolo Esposizione Giornaliera al Rumore\n\n';
    
    csv += 'INFORMAZIONI GENERALI\n';
    csv += `Mansione,${mansione || 'Non specificata'}\n`;
    csv += `Reparto,${reparto || 'Non specificato'}\n\n`;
    
    csv += 'DATI DI MISURAZIONE\n';
    csv += 'Attività,LEQ dB(A),Durata (min),Lpicco dB(C)\n';
    
    misurazioni.forEach(m => {
      const attivita = (m.attivita || '').replace(/"/g, '""');
      csv += `"${attivita}",${m.leq || ''},${m.durata || ''},${m.lpicco || ''}\n`;
    });
    
    const lex = calcolaLEX(misurazioni);
    const rischio = getClasseRischio(lex);
    
    csv += '\nRISULTATI\n';
    csv += `LEX 8h,${lex.toFixed(1)} dB(A)\n`;
    csv += `Lpicco C max,${getLpiccoMax(misurazioni).toFixed(1)} dB(C)\n`;
    csv += `Classe di Rischio,"${rischio.classe}"\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'esposizione_rumore.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Errore esportazione CSV:', error);
    return false;
  }
};

export const esportaCSVDPI = (
  dpiSelezionato: string,
  valoriHML: { h: string; m: string; l: string },
  lexPerDPI: string,
  risultatoAttenuazione: AttenuationResult,
  mansione: string,
  reparto: string,
  lexCalcolato: number
) => {
  try {
    const dataOggi = new Date().toLocaleDateString('it-IT');
    const lexDPI = parseFloat(lexPerDPI) || lexCalcolato;
    
    let csv = '\uFEFF';
    csv += 'Valutazione DPI Uditivi - Metodo HML (UNI EN 458:2016)\n\n';
    csv += `Data,${dataOggi}\n`;
    csv += `Mansione,${mansione || 'Non specificata'}\n`;
    csv += `Reparto,${reparto || 'Non specificato'}\n\n`;
    
    csv += 'INFORMAZIONI DPI\n';
    csv += `Dispositivo,"${dpiSelezionato ? dpiDatabase[dpiSelezionato].nome : 'Personalizzato'}"\n`;
    csv += `Valore H (dB),${valoriHML.h}\n`;
    csv += `Valore M (dB),${valoriHML.m}\n`;
    csv += `Valore L (dB),${valoriHML.l}\n\n`;
    
    csv += 'DATI DI ESPOSIZIONE\n';
    csv += `Livello di rumore LEX 8h (dB(A)),${lexDPI.toFixed(1)}\n\n`;
    
    csv += 'RISULTATI VALUTAZIONE\n';
    csv += `Attenuazione Prevista PNR (dB),${risultatoAttenuazione.pnr}\n`;
    csv += `Livello Effettivo L'eff (dB(A)),${risultatoAttenuazione.leff}\n`;
    csv += `Valutazione Protezione,"${risultatoAttenuazione.protezioneAdeguata}"\n\n`;
    
    csv += 'FORMULA APPLICATA\n';
    if (lexDPI <= 80) {
      csv += 'LEX ≤ 80 dB,PNR = M - H/4 - L/4\n';
    } else if (lexDPI <= 90) {
      csv += '80 < LEX ≤ 90 dB,PNR = M - H/2 - L/8\n';
    } else if (lexDPI <= 95) {
      csv += '90 < LEX ≤ 95 dB,PNR = M - H/4\n';
    } else if (lexDPI <= 100) {
      csv += '95 < LEX ≤ 100 dB,PNR = M\n';
    } else if (lexDPI <= 105) {
      csv += '100 < LEX ≤ 105 dB,PNR = M + H/4\n';
    } else if (lexDPI <= 110) {
      csv += '105 < LEX ≤ 110 dB,PNR = M + H/2 + L/4\n';
    } else {
      csv += 'LEX > 110 dB,PNR = M + 3H/4 + L/2\n';
    }
    
    csv += '\nCRITERI DI INTERPRETAZIONE\n';
    csv += "Range L'eff,Valutazione,Note\n";
    csv += '< 65 dB(A),ECCESSIVA,Rischio isolamento acustico\n';
    csv += '65-70 dB(A),BUONA,Protezione leggermente sovradimensionata\n';
    csv += '70-80 dB(A),OTTIMALE,Range ideale - Protezione adeguata\n';
    csv += '80-85 dB(A),ACCETTABILE,Protezione al limite inferiore\n';
    csv += '> 85 dB(A),INSUFFICIENTE,DPI inadeguato\n';
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Valutazione_DPI_${dataOggi.replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Errore esportazione CSV DPI:', error);
    return false;
  }
};
