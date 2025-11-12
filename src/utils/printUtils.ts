import { Measurement, AttenuationResult, RiskClass } from '@/types/noise';

export const stampaPDFEsposizione = (
  misurazioni: Measurement[],
  mansione: string,
  reparto: string,
  lex: number,
  lpicco: number,
  riskClass: RiskClass
) => {
  const dataOggi = new Date().toLocaleDateString('it-IT');
  
  const righeTabella = misurazioni.map(m => `
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 10px;">${m.attivita || '-'}</td>
      <td style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">${m.leq || '-'}</td>
      <td style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">${m.durata || '-'}</td>
      <td style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">${m.lpicco || '-'}</td>
    </tr>
  `).join('');
  
  const colorRischio = riskClass.classe.toLowerCase().includes('minimo') ? '#dcfce7' :
    riskClass.classe.toLowerCase().includes('medio') ? '#fef3c7' :
    riskClass.classe.toLowerCase().includes('rilevante') ? '#fed7aa' : '#fee2e2';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Report Valutazione Rischio Rumore - ${dataOggi}</title>
      <style>
        @page {
          margin: 2cm;
          size: A4;
        }
        body { 
          font-family: Arial, Helvetica, sans-serif; 
          margin: 0;
          padding: 20px;
          line-height: 1.6;
          color: #1f2937;
        }
        h1 { 
          color: #1e40af; 
          border-bottom: 4px solid #1e40af; 
          padding-bottom: 12px;
          margin-bottom: 20px;
          font-size: 28px;
        }
        h2 { 
          color: #4b5563; 
          margin-top: 30px;
          margin-bottom: 15px;
          font-size: 20px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
          font-size: 13px;
        }
        th { 
          background-color: #1e40af; 
          color: white;
          font-weight: bold;
          border: 1px solid #1e40af; 
          padding: 12px 10px; 
          text-align: left;
        }
        td {
          border: 1px solid #d1d5db; 
          padding: 10px;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .info-box {
          background-color: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 12px 15px;
          margin: 15px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          font-size: 11px;
          color: #6b7280;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>REPORT VALUTAZIONE RISCHIO RUMORE</h1>
      <div class="info-box">
        <p style="margin: 5px 0;"><strong>Normativa:</strong> D.Lgs. 81/2008 - Titolo VIII Capo II</p>
        <p style="margin: 5px 0;"><strong>Data:</strong> ${dataOggi}</p>
        ${mansione ? `<p style="margin: 5px 0;"><strong>Mansione:</strong> ${mansione}</p>` : ''}
        ${reparto ? `<p style="margin: 5px 0;"><strong>Reparto:</strong> ${reparto}</p>` : ''}
      </div>
      
      <h2>Dati di Misurazione</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 40%;">Attività/Postazione</th>
            <th style="width: 20%; text-align: center;">LEQ dB(A)</th>
            <th style="width: 20%; text-align: center;">Durata (min)</th>
            <th style="width: 20%; text-align: center;">Lpicco,C dB(C)</th>
          </tr>
        </thead>
        <tbody>
          ${righeTabella}
        </tbody>
      </table>
      
      <h2>Risultati della Valutazione</h2>
      <table style="border: none;">
        <tr style="background-color: transparent;">
          <td style="background-color: #f0f9ff; padding: 15px; border: 2px solid #3b82f6; border-radius: 8px; width: 50%;">
            <p style="margin: 0 0 5px 0; color: #1e40af; font-weight: 600;">Livello di Esposizione Giornaliera</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #2563eb;">LEX,8h = ${lex.toFixed(1)} dB(A)</p>
          </td>
          <td style="border: none; width: 15px;"></td>
          <td style="background-color: #faf5ff; padding: 15px; border: 2px solid #7c3aed; border-radius: 8px; width: 50%;">
            <p style="margin: 0 0 5px 0; color: #6b21a8; font-weight: 600;">Livello di Picco Massimo</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #7c3aed;">Lpicco,C = ${lpicco.toFixed(1)} dB(C)</p>
          </td>
        </tr>
      </table>
      
      <div style="background-color: ${colorRischio}; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 6px solid #059669;">
        <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">CLASSIFICAZIONE DEL RISCHIO</p>
        <p style="margin: 0; font-size: 22px; font-weight: bold;">${riskClass.classe}</p>
      </div>
      
      <h2>Valori Limite di Riferimento (D.Lgs. 81/2008)</h2>
      <table>
        <thead>
          <tr>
            <th>Livello di Azione/Limite</th>
            <th style="text-align: center;">LEX,8h</th>
            <th style="text-align: center;">Lpicco,C</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Valore inferiore di azione</strong></td>
            <td style="text-align: center;">80 dB(A)</td>
            <td style="text-align: center;">135 dB(C)</td>
          </tr>
          <tr>
            <td><strong>Valore superiore di azione</strong></td>
            <td style="text-align: center;">85 dB(A)</td>
            <td style="text-align: center;">137 dB(C)</td>
          </tr>
          <tr>
            <td><strong>Valore limite di esposizione</strong></td>
            <td style="text-align: center;">87 dB(A)</td>
            <td style="text-align: center;">140 dB(C)</td>
          </tr>
        </tbody>
      </table>
      
      <div class="footer">
        <p><strong>Note:</strong></p>
        <p>• Report generato automaticamente - Verificare l'accuratezza dei dati</p>
        <p>• Formula: LEX,8h = 10 × log₁₀(Σ(10^(LEQi/10) × ti/480))</p>
        <p>• Durata totale: ${misurazioni.reduce((sum, m) => sum + (parseFloat(m.durata) || 0), 0)} minuti</p>
      </div>
      
      <div class="no-print" style="margin-top: 30px; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; font-weight: bold;">Usa CTRL+P (o CMD+P su Mac) per stampare o salvare come PDF</p>
        <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
          Stampa / Salva PDF
        </button>
      </div>
    </body>
    </html>
  `;
  
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Report_Rumore_${dataOggi.replace(/\//g, '-')}.html`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return true;
};
