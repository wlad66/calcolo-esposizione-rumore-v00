import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Measurement, RiskClass, AttenuationResult, Azienda } from '@/types/noise';
import { dpiDatabase } from '@/data/dpiDatabase';

export const generaPDFEsposizione = (
  misurazioni: Measurement[],
  mansione: string,
  reparto: string,
  lex: number,
  lpicco: number,
  riskClass: RiskClass,
  azienda?: Azienda
) => {
  try {
    const doc = new jsPDF();
    const dataOggi = new Date().toLocaleDateString('it-IT');
    let yPos = 20;

    // Intestazione
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('REPORT VALUTAZIONE RISCHIO RUMORE', 105, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('D.Lgs. 81/2008 - Titolo VIII Capo II', 105, yPos, { align: 'center' });

    // Dati Azienda
    yPos += 15;
    if (azienda) {
      doc.setFillColor(245, 245, 245);
      const altezzaBoxAzienda = 35;
      doc.rect(15, yPos - 5, 180, altezzaBoxAzienda, 'F');
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.text('AZIENDA:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(azienda.ragione_sociale, 50, yPos);

      yPos += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('P.IVA:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(azienda.partita_iva, 50, yPos);

      doc.setFont('helvetica', 'bold');
      doc.text('C.F:', 110, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(azienda.codice_fiscale, 125, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Indirizzo:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${azienda.indirizzo}, ${azienda.cap} ${azienda.citta} (${azienda.provincia})`, 50, yPos);

      if (azienda.rappresentante_legale) {
        yPos += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Rapp. Legale:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(azienda.rappresentante_legale, 50, yPos);
      }

      yPos += 12;
    }

    // Informazioni generali
    doc.setFillColor(239, 246, 255);
    const altezzaBox = (mansione ? 7 : 0) + (reparto ? 7 : 0) + 7;
    doc.rect(15, yPos - 5, 180, altezzaBox + 5, 'F');
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('Data:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(dataOggi, 50, yPos);

    yPos += 7;
    if (mansione) {
      doc.setFont('helvetica', 'bold');
      doc.text('Mansione:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(mansione, 50, yPos);
      yPos += 7;
    }

    if (reparto) {
      doc.setFont('helvetica', 'bold');
      doc.text('Reparto:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(reparto, 50, yPos);
      yPos += 7;
    }
    
    // Tabella misurazioni
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    doc.text('Dati di Misurazione', 20, yPos);
    
    yPos += 5;
    const tableData = misurazioni.map(m => [
      m.attivita || '-',
      m.leq || '-',
      m.durata || '-',
      m.lpicco || '-'
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Attività/Postazione', 'LEQ dB(A)', 'Durata (min)', 'Lpicco,C dB(C)']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' }
      },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Risultati
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    doc.text('Risultati della Valutazione', 20, yPos);
    
    yPos += 10;
    
    // Box LEX (centrato)
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.rect(27.5, yPos, 75, 25, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(30, 64, 175);
    doc.text('Livello di Esposizione Giornaliera', 65, yPos + 7, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(`LEX,8h = ${lex.toFixed(1)} dB(A)`, 65, yPos + 18, { align: 'center' });
    
    // Box Lpicco (centrato)
    doc.setFillColor(250, 245, 255);
    doc.setDrawColor(124, 58, 237);
    doc.rect(107.5, yPos, 75, 25, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(107, 33, 168);
    doc.text('Livello di Picco Massimo', 145, yPos + 7, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(124, 58, 237);
    doc.text(`Lpicco,C = ${lpicco.toFixed(1)} dB(C)`, 145, yPos + 18, { align: 'center' });
    
    yPos += 35;
    
    // Classificazione rischio (centrato)
    const colorRischio = riskClass.classe.toLowerCase().includes('minimo') ? [220, 252, 231] :
      riskClass.classe.toLowerCase().includes('medio') ? [254, 243, 199] :
      riskClass.classe.toLowerCase().includes('rilevante') ? [254, 215, 170] : [254, 226, 226];
    
    doc.setFillColor(colorRischio[0], colorRischio[1], colorRischio[2]);
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(2);
    doc.rect(20, yPos, 170, 20, 'FD');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('CLASSIFICAZIONE DEL RISCHIO', 25, yPos + 7);
    doc.setFontSize(12);
    doc.text(riskClass.classe, 25, yPos + 15);
    
    yPos += 30;
    
    // Valori limite
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    doc.text('Valori Limite di Riferimento (D.Lgs. 81/2008)', 20, yPos);
    
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [['Livello di Azione/Limite', 'LEX,8h', 'Lpicco,C']],
      body: [
        ['Valore inferiore di azione', '80 dB(A)', '135 dB(C)'],
        ['Valore superiore di azione', '85 dB(A)', '137 dB(C)'],
        ['Valore limite di esposizione', '87 dB(A)', '140 dB(C)']
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 45, halign: 'center' },
        2: { cellWidth: 45, halign: 'center' }
      },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9 }
    });
    
    // Footer
    const totalPages = (doc as any).internal.pages.length - 1;
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'italic');
    const durataTotale = misurazioni.reduce((sum, m) => sum + (parseFloat(m.durata) || 0), 0);
    doc.text(`Formula: LEX,8h = 10 × log₁₀(Σ(10^(LEQi/10) × ti/480))`, 20, pageHeight - 20);
    doc.text(`Durata totale misurata: ${durataTotale} minuti`, 20, pageHeight - 15);
    doc.text(`Report generato il ${dataOggi}`, 20, pageHeight - 10);
    
    // Salva il PDF
    doc.save(`Report_Rumore_${dataOggi.replace(/\//g, '-')}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Errore generazione PDF:', error);
    return false;
  }
};

export const generaPDFDPI = (
  dpiSelezionato: string,
  valoriHML: { h: string; m: string; l: string },
  lexPerDPI: string,
  risultatoAttenuazione: AttenuationResult,
  mansione: string,
  reparto: string,
  lexCalcolato: number,
  azienda?: Azienda
) => {
  try {
    const doc = new jsPDF();
    const dataOggi = new Date().toLocaleDateString('it-IT');
    const lexDPI = parseFloat(lexPerDPI) || lexCalcolato;
    let yPos = 20;

    // Intestazione
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text('VALUTAZIONE DPI UDITIVI', 105, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Metodo HML - UNI EN 458:2016', 105, yPos, { align: 'center' });

    // Dati Azienda
    yPos += 15;
    if (azienda) {
      doc.setFillColor(245, 245, 245);
      const altezzaBoxAzienda = 35;
      doc.rect(15, yPos - 5, 180, altezzaBoxAzienda, 'F');
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.text('AZIENDA:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(azienda.ragione_sociale, 50, yPos);

      yPos += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('P.IVA:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(azienda.partita_iva, 50, yPos);

      doc.setFont('helvetica', 'bold');
      doc.text('C.F:', 110, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(azienda.codice_fiscale, 125, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Indirizzo:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${azienda.indirizzo}, ${azienda.cap} ${azienda.citta} (${azienda.provincia})`, 50, yPos);

      if (azienda.rappresentante_legale) {
        yPos += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Rapp. Legale:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(azienda.rappresentante_legale, 50, yPos);
      }

      yPos += 12;
    }

    // Informazioni generali
    const boxHeight = (mansione && reparto) ? 25 : (mansione || reparto) ? 18 : 11;
    doc.setFillColor(250, 245, 255);
    doc.rect(15, yPos - 5, 180, boxHeight, 'F');
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('Data:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(dataOggi, 45, yPos);
    
    if (mansione) {
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Mansione:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(mansione, 45, yPos);
    }
    
    if (reparto) {
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.text('Reparto:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(reparto, 45, yPos);
    }
    
    yPos += 7;
    
    // Informazioni DPI
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    doc.text('Dispositivo di Protezione Individuale', 20, yPos);
    
    yPos += 7;
    doc.setFillColor(243, 232, 255);
    doc.setDrawColor(192, 132, 252);
    doc.setLineWidth(0.5);
    doc.rect(20, yPos - 2, 170, 10, 'FD');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text(dpiSelezionato ? dpiDatabase[dpiSelezionato].nome : 'DPI Personalizzato', 22, yPos + 4);
    
    // Valori HML
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text('Valori di Attenuazione Sonora (HML)', 20, yPos);
    
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [['H (High)\nAlte frequenze', 'M (Medium)\nMedie frequenze', 'L (Low)\nBasse frequenze']],
      body: [[`${valoriHML.h} dB`, `${valoriHML.m} dB`, `${valoriHML.l} dB`]],
      theme: 'grid',
      headStyles: {
        fillColor: [124, 58, 237],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9,
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 12,
        fontStyle: 'bold',
        textColor: [107, 33, 168],
        halign: 'center',
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 56.67 },
        1: { cellWidth: 56.67 },
        2: { cellWidth: 56.66 }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 170
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Livello di rumore
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.text('Livello di Rumore da Attenuare:', 20, yPos);
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text(`LEX,8h = ${lexDPI.toFixed(1)} dB(A)`, 95, yPos);
    
    // Risultati
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    doc.text('Risultati della Valutazione', 20, yPos);
    
    yPos += 8;
    
    // Box PNR
    doc.setFillColor(219, 234, 254);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.rect(20, yPos, 80, 25, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(30, 64, 175);
    doc.text('Attenuazione Prevista (PNR)', 60, yPos + 7, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(`${risultatoAttenuazione.pnr} dB`, 60, yPos + 18, { align: 'center' });
    
    // Box L'eff
    doc.setFillColor(233, 213, 255);
    doc.setDrawColor(124, 58, 237);
    doc.rect(110, yPos, 80, 25, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(107, 33, 168);
    doc.text("Livello Effettivo (L'eff)", 150, yPos + 7, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(124, 58, 237);
    doc.text(`${risultatoAttenuazione.leff} dB(A)`, 150, yPos + 18, { align: 'center' });
    
    yPos += 35;
    
    // Valutazione protezione
    const colorProtez = risultatoAttenuazione.protezioneAdeguata.includes('OTTIMALE') ? [220, 252, 231] :
      risultatoAttenuazione.protezioneAdeguata.includes('INSUFFICIENTE') ? [254, 226, 226] :
      risultatoAttenuazione.protezioneAdeguata.includes('BUONA') ? [224, 242, 254] :
      risultatoAttenuazione.protezioneAdeguata.includes('ACCETTABILE') ? [254, 243, 199] : [254, 215, 170];
    
    doc.setFillColor(colorProtez[0], colorProtez[1], colorProtez[2]);
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(1.5);
    doc.rect(20, yPos, 170, 16, 'FD');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('VALUTAZIONE PROTEZIONE', 22, yPos + 6);
    doc.setFontSize(10);
    doc.text(risultatoAttenuazione.protezioneAdeguata, 22, yPos + 12);
    
    yPos += 22;
    
    // Criteri di interpretazione
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text('Criteri di Interpretazione (UNI EN 458:2016)', 20, yPos);
    
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [["Livello L'eff", 'Valutazione', 'Note']],
      body: [
        ['< 65 dB(A)', 'ECCESSIVA', 'Rischio isolamento acustico'],
        ['65-70 dB(A)', 'BUONA', 'Protezione sovradimensionata'],
        ['70-80 dB(A)', 'OTTIMALE ✓', 'Range ideale - Protezione adeguata'],
        ['80-85 dB(A)', 'ACCETTABILE', 'Protezione al limite inferiore'],
        ['> 85 dB(A)', 'INSUFFICIENTE', 'DPI inadeguato']
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [124, 58, 237],
        textColor: 255,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 35, halign: 'center' },
        1: { cellWidth: 45, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 90 }
      },
      margin: { left: 20, right: 20 },
      tableWidth: 170,
      didParseCell: (data: any) => {
        if (data.row.index === 2 && data.section === 'body') {
          data.cell.styles.fillColor = [220, 252, 231];
        }
      }
    });
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'italic');
    doc.text(`Calcolo: L'eff = LEX,8h - PNR = ${lexDPI.toFixed(1)} - ${risultatoAttenuazione.pnr} = ${risultatoAttenuazione.leff} dB(A)`, 20, pageHeight - 20);
    doc.text('Il Metodo HML utilizza i valori H, M, L per calcolare l\'attenuazione prevista', 20, pageHeight - 15);
    doc.text(`Report generato il ${dataOggi}`, 20, pageHeight - 10);
    
    // Salva il PDF
    doc.save(`Valutazione_DPI_${dataOggi.replace(/\//g, '-')}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Errore generazione PDF DPI:', error);
    return false;
  }
};
