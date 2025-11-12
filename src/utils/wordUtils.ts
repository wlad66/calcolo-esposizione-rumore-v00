import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { Measurement, RiskClass, AttenuationResult, Azienda } from '@/types/noise';
import { dpiDatabase } from '@/data/dpiDatabase';

export const generaWordEsposizione = async (
  misurazioni: Measurement[],
  mansione: string,
  reparto: string,
  lex: number,
  lpicco: number,
  riskClass: RiskClass,
  azienda?: Azienda
) => {
  try {
    const dataOggi = new Date().toLocaleDateString('it-IT');

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Intestazione
          new Paragraph({
            text: 'REPORT VALUTAZIONE RISCHIO RUMORE',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),

          new Paragraph({
            text: 'D.Lgs. 81/2008 - Titolo VIII Capo II',
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Dati Azienda
          ...(azienda ? [
            new Paragraph({
              text: 'AZIENDA',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 200 }
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Ragione Sociale:', bold: true })]
                      })],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                      shading: { fill: 'F5F5F5' }
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: azienda.ragione_sociale })],
                      width: { size: 70, type: WidthType.PERCENTAGE }
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'P.IVA:', bold: true })]
                      })],
                      shading: { fill: 'F5F5F5' }
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: azienda.partita_iva })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Codice Fiscale:', bold: true })]
                      })],
                      shading: { fill: 'F5F5F5' }
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: azienda.codice_fiscale })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Indirizzo:', bold: true })]
                      })],
                      shading: { fill: 'F5F5F5' }
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: `${azienda.indirizzo}, ${azienda.cap} ${azienda.citta} (${azienda.provincia})` })]
                    })
                  ]
                }),
                ...(azienda.rappresentante_legale ? [new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Rappresentante Legale:', bold: true })]
                      })],
                      shading: { fill: 'F5F5F5' }
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: azienda.rappresentante_legale })]
                    })
                  ]
                })] : [])
              ]
            })
          ] : []),

          // Informazioni generali
          new Paragraph({
            text: 'INFORMAZIONI GENERALI',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: 'Data:', bold: true })]
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: 'EFF6FF' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: dataOggi })],
                    width: { size: 70, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              ...(mansione ? [new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: 'Mansione:', bold: true })]
                    })],
                    shading: { fill: 'EFF6FF' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: mansione })]
                  })
                ]
              })] : []),
              ...(reparto ? [new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: 'Reparto:', bold: true })]
                    })],
                    shading: { fill: 'EFF6FF' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: reparto })]
                  })
                ]
              })] : [])
            ]
          }),
          
          // Dati di Misurazione
          new Paragraph({
            text: 'DATI DI MISURAZIONE',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Attività/Postazione', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    shading: { fill: 'B4C7E7' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'LEQ dB(A)', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: 'B4C7E7' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Durata (min)', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: 'B4C7E7' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Lpicco,C dB(C)', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: 'B4C7E7' }
                  })
                ]
              }),
              ...misurazioni.map(m => new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: m.attivita || '-' })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: m.leq || '-', alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: m.durata || '-', alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: m.lpicco || '-', alignment: AlignmentType.CENTER })]
                  })
                ]
              }))
            ]
          }),
          
          // Risultati della Valutazione
          new Paragraph({
            text: 'RISULTATI DELLA VALUTAZIONE',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        text: 'Livello di Esposizione Giornaliera',
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 }
                      }),
                      new Paragraph({ 
                        children: [new TextRun({ 
                          text: `LEX,8h = ${lex.toFixed(1)} dB(A)`,
                          bold: true
                        })],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'DBEAFE' }
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        text: 'Livello di Picco Massimo',
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 }
                      }),
                      new Paragraph({ 
                        children: [new TextRun({ 
                          text: `Lpicco,C = ${lpicco.toFixed(1)} dB(C)`,
                          bold: true
                        })],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FAF5FF' }
                  })
                ]
              })
            ]
          }),
          
          // Classificazione del Rischio
          new Paragraph({
            text: 'CLASSIFICAZIONE DEL RISCHIO',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ 
                          text: riskClass.classe,
                          bold: true
                        })],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    shading: { 
                      fill: riskClass.classe.toLowerCase().includes('minimo') ? 'DCFCE7' :
                            riskClass.classe.toLowerCase().includes('medio') ? 'FEF3C7' :
                            riskClass.classe.toLowerCase().includes('rilevante') ? 'FED7AA' : 'FEE2E2'
                    }
                  })
                ]
              })
            ]
          }),
          
          // Valori Limite di Riferimento
          new Paragraph({
            text: 'VALORI LIMITE DI RIFERIMENTO (D.Lgs. 81/2008)',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Livello di Azione/Limite', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    shading: { fill: 'B4C7E7' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'LEX,8h', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    shading: { fill: 'B4C7E7' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Lpicco,C', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    shading: { fill: 'B4C7E7' }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Valore inferiore di azione' })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '80 dB(A)', alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '135 dB(C)', alignment: AlignmentType.CENTER })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Valore superiore di azione' })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '85 dB(A)', alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '137 dB(C)', alignment: AlignmentType.CENTER })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Valore limite di esposizione' })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '87 dB(A)', alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '140 dB(C)', alignment: AlignmentType.CENTER })]
                  })
                ]
              })
            ]
          }),
          
          // Note a piè di pagina
          new Paragraph({
            text: '',
            spacing: { before: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Formula: LEX,8h = 10 × log₁₀(Σ(10^(LEQi/10) × ti/480))',
                italics: true,
                size: 18
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Durata totale misurata: ${misurazioni.reduce((sum, m) => sum + (parseFloat(m.durata) || 0), 0)} minuti`,
                italics: true,
                size: 18
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Report generato il ${dataOggi}`,
                italics: true,
                size: 18
              })
            ]
          })
        ]
      }]
    });
    
    // Genera il blob e scarica
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Report_Rumore_${dataOggi.replace(/\//g, '-')}.docx`);
    
    return true;
  } catch (error) {
    console.error('Errore generazione Word:', error);
    return false;
  }
};

export const generaWordDPI = async (
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
    const dataOggi = new Date().toLocaleDateString('it-IT');
    const lexDPI = parseFloat(lexPerDPI) || lexCalcolato;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Intestazione
          new Paragraph({
            text: 'VALUTAZIONE DPI UDITIVI',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),

          new Paragraph({
            text: 'Metodo HML - UNI EN 458:2016',
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Dati Azienda
          ...(azienda ? [
            new Paragraph({
              text: 'AZIENDA',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 200 }
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Ragione Sociale:', bold: true })]
                      })],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                      shading: { fill: 'F5F5F5' }
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: azienda.ragione_sociale })],
                      width: { size: 70, type: WidthType.PERCENTAGE }
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'P.IVA:', bold: true })]
                      })],
                      shading: { fill: 'F5F5F5' }
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: azienda.partita_iva })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Codice Fiscale:', bold: true })]
                      })],
                      shading: { fill: 'F5F5F5' }
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: azienda.codice_fiscale })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Indirizzo:', bold: true })]
                      })],
                      shading: { fill: 'F5F5F5' }
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: `${azienda.indirizzo}, ${azienda.cap} ${azienda.citta} (${azienda.provincia})` })]
                    })
                  ]
                }),
                ...(azienda.rappresentante_legale ? [new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Rappresentante Legale:', bold: true })]
                      })],
                      shading: { fill: 'F5F5F5' }
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: azienda.rappresentante_legale })]
                    })
                  ]
                })] : [])
              ]
            })
          ] : []),

          // Informazioni generali
          new Paragraph({
            text: 'INFORMAZIONI GENERALI',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: 'Data:', bold: true })]
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: 'EFF6FF' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: dataOggi })],
                    width: { size: 70, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              ...(mansione ? [new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: 'Mansione:', bold: true })]
                    })],
                    shading: { fill: 'EFF6FF' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: mansione })]
                  })
                ]
              })] : []),
              ...(reparto ? [new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [new TextRun({ text: 'Reparto:', bold: true })]
                    })],
                    shading: { fill: 'EFF6FF' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: reparto })]
                  })
                ]
              })] : [])
            ]
          }),
          
          // Dispositivo di Protezione Individuale
          new Paragraph({
            text: 'DISPOSITIVO DI PROTEZIONE INDIVIDUALE',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: dpiSelezionato ? dpiDatabase[dpiSelezionato].nome : 'DPI Personalizzato',
                        bold: true
                      })],
                      alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: 'F3E8FF' }
                  })
                ]
              })
            ]
          }),
          
          // Valori di Attenuazione Sonora (HML)
          new Paragraph({
            text: 'VALORI DI ATTENUAZIONE SONORA (HML)',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'H (High)\nAlte frequenze', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    width: { size: 33.33, type: WidthType.PERCENTAGE },
                    shading: { fill: 'B4C7E7' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'M (Medium)\nMedie frequenze', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    width: { size: 33.33, type: WidthType.PERCENTAGE },
                    shading: { fill: 'B4C7E7' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'L (Low)\nBasse frequenze', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    width: { size: 33.34, type: WidthType.PERCENTAGE },
                    shading: { fill: 'B4C7E7' }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: `${valoriHML.h} dB`, bold: true, size: 24 })],
                      alignment: AlignmentType.CENTER
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: `${valoriHML.m} dB`, bold: true, size: 24 })],
                      alignment: AlignmentType.CENTER
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: `${valoriHML.l} dB`, bold: true, size: 24 })],
                      alignment: AlignmentType.CENTER
                    })]
                  })
                ]
              })
            ]
          }),
          
          // Livello di rumore
          new Paragraph({
            text: '',
            spacing: { before: 400, after: 200 }
          }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'Livello di Rumore da Attenuare:', bold: true })],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'EFF6FF' }
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: `LEX,8h = ${lexDPI.toFixed(1)} dB(A)`, bold: true, size: 24 })],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              })
            ]
          }),
          
          // Risultati della Valutazione
          new Paragraph({
            text: 'RISULTATI DELLA VALUTAZIONE',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        text: 'Attenuazione Prevista (PNR)',
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 }
                      }),
                      new Paragraph({ 
                        children: [new TextRun({ 
                          text: `${risultatoAttenuazione.pnr} dB`,
                          bold: true,
                          size: 32
                        })],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'DBEAFE' }
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        text: "Livello Effettivo (L'eff)",
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 }
                      }),
                      new Paragraph({ 
                        children: [new TextRun({ 
                          text: `${risultatoAttenuazione.leff} dB(A)`,
                          bold: true,
                          size: 32
                        })],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'E9D5FF' }
                  })
                ]
              })
            ]
          }),
          
          // Valutazione Protezione
          new Paragraph({
            text: 'VALUTAZIONE PROTEZIONE',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ 
                          text: risultatoAttenuazione.protezioneAdeguata,
                          bold: true
                        })],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    shading: { 
                      fill: risultatoAttenuazione.protezioneAdeguata.includes('OTTIMALE') ? 'DCFCE7' :
                            risultatoAttenuazione.protezioneAdeguata.includes('INSUFFICIENTE') ? 'FEE2E2' :
                            risultatoAttenuazione.protezioneAdeguata.includes('BUONA') ? 'E0F2FE' :
                            risultatoAttenuazione.protezioneAdeguata.includes('ACCETTABILE') ? 'FEF3C7' : 'FED7AA'
                    }
                  })
                ]
              })
            ]
          }),
          
          // Criteri di Interpretazione
          new Paragraph({
            text: 'CRITERI DI INTERPRETAZIONE (UNI EN 458:2016)',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: "Livello L'eff", bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    shading: { fill: 'B4C7E7' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Valutazione', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    shading: { fill: 'B4C7E7' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Note', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    shading: { fill: 'B4C7E7' }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: '< 65 dB(A)', alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'ECCESSIVA', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Rischio isolamento acustico' })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: '65-70 dB(A)', alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'BUONA', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Protezione sovradimensionata' })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: '70-80 dB(A)', alignment: AlignmentType.CENTER })],
                    shading: { fill: 'DCFCE7' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'OTTIMALE ✓', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })],
                    shading: { fill: 'DCFCE7' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Range ideale - Protezione adeguata' })],
                    shading: { fill: 'DCFCE7' }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: '80-85 dB(A)', alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'ACCETTABILE', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Protezione al limite inferiore' })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: '> 85 dB(A)', alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'INSUFFICIENTE', bold: true })],
                      alignment: AlignmentType.CENTER 
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'DPI inadeguato' })]
                  })
                ]
              })
            ]
          }),
          
          // Note a piè di pagina
          new Paragraph({
            text: '',
            spacing: { before: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Calcolo: L'eff = LEX,8h - PNR = ${lexDPI.toFixed(1)} - ${risultatoAttenuazione.pnr} = ${risultatoAttenuazione.leff} dB(A)`,
                italics: true,
                size: 18
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Il Metodo HML utilizza i valori H, M, L per calcolare l\'attenuazione prevista',
                italics: true,
                size: 18
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Report generato il ${dataOggi}`,
                italics: true,
                size: 18
              })
            ]
          })
        ]
      }]
    });
    
    // Genera il blob e scarica
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Valutazione_DPI_${dataOggi.replace(/\//g, '-')}.docx`);
    
    return true;
  } catch (error) {
    console.error('Errore generazione Word DPI:', error);
    return false;
  }
};
