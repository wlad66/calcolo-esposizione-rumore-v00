import { useState, useEffect } from 'react';
import { Download, Plus, Upload, FileSpreadsheet, Calculator, Printer, FileText, Save, List, Building2, FolderOpen, RotateCcw, LogOut, Shield, Loader2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { MeasurementRow } from '@/components/noise/MeasurementRow';
import { ResultsCard } from '@/components/noise/ResultsCard';
import { DPISelector } from '@/components/noise/DPISelector';
import { DPIResults } from '@/components/noise/DPIResults';
import { AziendaSelector } from '@/components/aziende/AziendaSelector';
import { Measurement, Azienda } from '@/types/noise';
import { dpiDatabase } from '@/data/dpiDatabase';
import { calcolaLEX, getLpiccoMax, getClasseRischio, calcolaAttenuazione } from '@/utils/noiseCalculations';
import { esportaCSVEsposizione, esportaCSVDPI } from '@/utils/exportUtils';
import { generaPDFEsposizione, generaPDFDPI } from '@/utils/pdfUtils';
import { generaWordEsposizione, generaWordDPI } from '@/utils/wordUtils';
import { esposizioneAPI, dpiAPI, aziendeAPI, documentiAPI } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AziendaForm } from '@/components/aziende/AziendaForm';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [mansione, setMansione] = useState('');
  const [reparto, setReparto] = useState('');
  const [misurazioni, setMisurazioni] = useState<Measurement[]>([{
    id: 1,
    attivita: '',
    leq: '',
    durata: '',
    lpicco: ''
  }]);

  // Stati per azienda
  const [aziende, setAziende] = useState<Azienda[]>([]);
  const [selectedAziendaId, setSelectedAziendaId] = useState<number | undefined>();
  const [showAziendaDialog, setShowAziendaDialog] = useState(false);

  // Stati per DPI
  const [dpiSelezionato, setDpiSelezionato] = useState('');
  const [valoriHML, setValoriHML] = useState({
    h: '',
    m: '',
    l: ''
  });
  const [lexPerDPI, setLexPerDPI] = useState('');

  // Stati per loading
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Stati per editing valutazioni esistenti
  const [editingEsposizioneId, setEditingEsposizioneId] = useState<number | null>(null);
  const [editingDPIId, setEditingDPIId] = useState<number | null>(null);

  // Carica lista aziende all'avvio
  useEffect(() => {
    caricaAziende();
  }, []);

  // Carica dati da valutazione salvata (se navigato da pagina Valutazioni)
  useEffect(() => {
    const state = location.state as any;
    if (state?.caricaValutazione) {
      const dati = state.caricaValutazione;

      // Carica dati comuni
      if (dati.azienda_id) setSelectedAziendaId(dati.azienda_id);
      if (dati.mansione) setMansione(dati.mansione);
      if (dati.reparto) setReparto(dati.reparto);

      if (dati.tipo === 'esposizione' && dati.misurazioni) {
        // Carica ID per editing se presente
        if (dati.id) setEditingEsposizioneId(dati.id);

        // Carica misurazioni per valutazione esposizione
        setMisurazioni(dati.misurazioni.map((m: any) => ({
          id: m.id || Date.now() + Math.random(),
          attivita: m.attivita || '',
          leq: m.leq || '',
          durata: m.durata || '',
          lpicco: m.lpicco || ''
        })));

        toast({
          title: dati.id ? 'Valutazione caricata per modifica' : 'Valutazione caricata',
          description: `${dati.id ? 'Modifica' : 'Caricata'} valutazione per ${dati.mansione}`,
        });
      } else if (dati.tipo === 'dpi') {
        // Carica ID per editing se presente
        if (dati.id) setEditingDPIId(dati.id);

        // Carica dati per valutazione DPI
        if (dati.dpi_selezionato) {
          setDpiSelezionato(dati.dpi_selezionato);
          // Se è un DPI dal database, carica i valori HML automaticamente
          const dpiData = dpiDatabase[dati.dpi_selezionato];
          if (dpiData) {
            setValoriHML({
              h: dpiData.h.toString(),
              m: dpiData.m.toString(),
              l: dpiData.l.toString()
            });
          }
        }
        if (dati.lex_per_dpi) setLexPerDPI(dati.lex_per_dpi);

        toast({
          title: dati.id ? 'Valutazione DPI caricata per modifica' : 'Valutazione DPI caricata',
          description: `${dati.id ? 'Modifica' : 'Caricata'} valutazione DPI per ${dati.mansione}`,
        });
      }

      // Pulisci lo state per evitare ricaricamenti
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const caricaAziende = async () => {
    const response = await aziendeAPI.lista();
    if (response.data) {
      setAziende(response.data);
    }
  };

  const handleSaveAzienda = async (azienda: Azienda) => {
    const response = await aziendeAPI.crea(azienda);
    if (response.data) {
      toast({
        title: 'Azienda creata',
        description: 'L\'azienda è stata registrata con successo',
      });
      await caricaAziende();
      setSelectedAziendaId(response.data.id);
      setShowAziendaDialog(false);
    } else if (response.error) {
      toast({
        title: 'Errore',
        description: `Impossibile creare l'azienda: ${response.error}`,
        variant: 'destructive',
      });
    }
  };
  const aggiungiMisurazione = () => {
    setMisurazioni([...misurazioni, {
      id: Date.now(),
      attivita: '',
      leq: '',
      durata: '',
      lpicco: ''
    }]);
  };
  const rimuoviMisurazione = (id: number) => {
    if (misurazioni.length > 1) {
      setMisurazioni(misurazioni.filter(m => m.id !== id));
    }
  };
  const aggiornaMisurazione = (id: number, campo: string, valore: string) => {
    setMisurazioni(misurazioni.map(m => m.id === id ? {
      ...m,
      [campo]: valore
    } : m));
  };
  const selezionaDPI = (key: string) => {
    setDpiSelezionato(key);
    const dpi = dpiDatabase[key];
    if (key !== 'custom') {
      setValoriHML({
        h: dpi.h.toString(),
        m: dpi.m.toString(),
        l: dpi.l.toString()
      });
    }
  };
  const handleHMLChange = (field: 'h' | 'm' | 'l', value: string) => {
    setValoriHML(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const gestisciImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    toast({
      title: 'Caricamento file...'
    });
    try {
      const text = await file.text();
      const detectSeparator = (text: string) => {
        const firstLines = text.split('\n').slice(0, 5).join('\n');
        const commas = (firstLines.match(/,/g) || []).length;
        const semicolons = (firstLines.match(/;/g) || []).length;
        const tabs = (firstLines.match(/\t/g) || []).length;
        if (tabs > commas && tabs > semicolons) return '\t';
        if (semicolons > commas) return ';';
        return ',';
      };
      const separator = detectSeparator(text);
      const righe = text.split('\n').map(r => r.trim()).filter(r => r.length > 0);
      const datiImportati: Measurement[] = [];
      let headerTrovato = false;
      for (let i = 0; i < righe.length; i++) {
        const riga = righe[i];

        // Salta righe di intestazione sezioni
        if (riga.includes('INFORMAZIONI GENERALI') ||
          riga.includes('DATI DI MISURAZIONE') ||
          riga.includes('Calcolo Esposizione')) {
          continue;
        }

        // Riconosci header della tabella dati (gestisce problemi encoding)
        if (riga.includes('Attività') || riga.includes('AttivitÃ') ||
          riga.includes('LEQ dB') || riga.includes('Mansione,') ||
          riga.includes('MANSIONE,') || riga.includes('Reparto,')) {
          headerTrovato = true;
          continue;
        }

        // Ferma quando arriva alla sezione risultati
        if (riga.includes('RISULTATI') || riga.includes('LEX 8h')) break;
        if (!headerTrovato && i === 0) continue;
        const valori: string[] = [];
        let valoreCorrente = '';
        let dentroVirgolette = false;
        for (let char of riga) {
          if (char === '"') {
            dentroVirgolette = !dentroVirgolette;
          } else if (char === separator && !dentroVirgolette) {
            valori.push(valoreCorrente.trim());
            valoreCorrente = '';
          } else {
            valoreCorrente += char;
          }
        }
        valori.push(valoreCorrente.trim());
        if (valori.length >= 2) {
          const attivita = valori[0].replace(/^"|"$/g, '').replace(/^\d+\s*[-–—]\s*/, '').trim();
          const numeri: {
            valore: string;
            numero: number;
          }[] = [];
          for (let j = 1; j < valori.length; j++) {
            const val = valori[j].replace(/,/g, '.').replace(/[^\d.]/g, '');
            const num = parseFloat(val);
            if (!isNaN(num) && num >= 0) {
              numeri.push({
                valore: val,
                numero: num
              });
            }
          }
          let leq = '',
            durata = '',
            lpicco = '';
          if (numeri.length >= 2) {
            if (numeri[0].numero > 50 && numeri[0].numero < 120) {
              leq = numeri[0].valore;
              durata = numeri[1].valore;
            } else {
              durata = numeri[0].valore;
              leq = numeri[1].valore;
            }
            if (numeri.length >= 3) lpicco = numeri[2].valore;
          } else if (numeri.length === 1) {
            leq = numeri[0].valore;
          }
          if (attivita.length > 2) {
            datiImportati.push({
              id: Date.now() + datiImportati.length + Math.random(),
              attivita: attivita,
              leq: leq || '',
              durata: durata || '',
              lpicco: lpicco || ''
            });
          }
        }
      }
      if (datiImportati.length > 0) {
        setMisurazioni(datiImportati);
        toast({
          title: 'Importazione completata',
          description: `${datiImportati.length} record importati con successo`
        });
      } else {
        toast({
          title: 'Nessun dato trovato',
          description: 'Il file non contiene dati validi',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Errore durante importazione',
        description: error instanceof Error ? error.message : 'Errore sconosciuto',
        variant: 'destructive'
      });
    }
    event.target.value = '';
  };
  const esportaCSV = () => {
    const success = esportaCSVEsposizione(misurazioni, mansione, reparto);
    if (success) {
      toast({
        title: 'Export completato',
        description: 'Il file CSV è stato scaricato'
      });
    } else {
      toast({
        title: 'Errore durante esportazione',
        variant: 'destructive'
      });
    }
  };
  const stampaPDFDPI = async () => {
    const selectedAzienda = aziende.find(a => a.id === selectedAziendaId);

    // 1. Genera e scarica locale
    const success = generaPDFDPI(dpiSelezionato, valoriHML, lexPerDPI, attenuationResults, mansione, reparto, lex, selectedAzienda);

    if (success) {
      toast({
        title: 'PDF DPI generato',
        description: 'Il report PDF della valutazione DPI è stato scaricato'
      });

      // 2. Upload automatico se salvato
      if (editingDPIId) {
        try {
          const blob = await generaPDFDPI(dpiSelezionato, valoriHML, lexPerDPI, attenuationResults, mansione, reparto, lex, selectedAzienda, true);
          if (blob instanceof Blob) {
            const filename = `Valutazione_DPI_${new Date().toLocaleDateString('it-IT').replace(/\//g, '-')}.pdf`;
            await documentiAPI.upload(new File([blob], filename), editingDPIId, 'dpi');
            toast({ title: 'Documento archiviato', description: 'Copia salvata nel cloud' });
          }
        } catch (e) {
          console.error('Errore upload automatico:', e);
        }
      }
    } else {
      toast({
        title: 'Errore durante la generazione del PDF',
        variant: 'destructive'
      });
    }
  };
  const stampaPDF = async () => {
    const selectedAzienda = aziende.find(a => a.id === selectedAziendaId);

    // 1. Genera e scarica locale
    const success = generaPDFEsposizione(misurazioni, mansione, reparto, lex, lpicco, riskClass, selectedAzienda);

    if (success) {
      toast({
        title: 'PDF generato',
        description: 'Il report PDF è stato scaricato'
      });

      // 2. Upload automatico se salvato
      if (editingEsposizioneId) {
        try {
          const blob = await generaPDFEsposizione(misurazioni, mansione, reparto, lex, lpicco, riskClass, selectedAzienda, true);
          if (blob instanceof Blob) {
            const filename = `Report_Rumore_${new Date().toLocaleDateString('it-IT').replace(/\//g, '-')}.pdf`;
            await documentiAPI.upload(new File([blob], filename), editingEsposizioneId, 'esposizione');
            toast({ title: 'Documento archiviato', description: 'Copia salvata nel cloud' });
          }
        } catch (e) {
          console.error('Errore upload automatico:', e);
        }
      }
    } else {
      toast({
        title: 'Errore durante la generazione del PDF',
        variant: 'destructive'
      });
    }
  };
  const esportaWord = async () => {
    try {
      const selectedAzienda = aziende.find(a => a.id === selectedAziendaId);

      // 1. Genera e scarica locale
      const success = await generaWordEsposizione(misurazioni, mansione, reparto, lex, lpicco, riskClass, selectedAzienda);

      if (success) {
        toast({
          title: 'Documento Word generato',
          description: 'Il report Word è stato scaricato'
        });

        // 2. Upload automatico se salvato
        if (editingEsposizioneId) {
          try {
            const blob = await generaWordEsposizione(misurazioni, mansione, reparto, lex, lpicco, riskClass, selectedAzienda, true);
            if (blob instanceof Blob) {
              const filename = `Report_Rumore_${new Date().toLocaleDateString('it-IT').replace(/\//g, '-')}.docx`;
              await documentiAPI.upload(new File([blob], filename), editingEsposizioneId, 'esposizione');
              toast({ title: 'Documento archiviato', description: 'Copia salvata nel cloud' });
            }
          } catch (e) {
            console.error('Errore upload automatico:', e);
          }
        }
      } else {
        toast({
          title: 'Errore durante la generazione del documento',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Errore durante la generazione del documento',
        variant: 'destructive'
      });
    }
  };
  const esportaWordDPI = async () => {
    try {
      const selectedAzienda = aziende.find(a => a.id === selectedAziendaId);

      // 1. Genera e scarica locale
      const success = await generaWordDPI(dpiSelezionato, valoriHML, lexPerDPI, attenuationResults, mansione, reparto, lex, selectedAzienda);

      if (success) {
        toast({
          title: 'Documento Word DPI generato',
          description: 'Il report Word della valutazione DPI è stato scaricato'
        });

        // 2. Upload automatico se salvato
        if (editingDPIId) {
          try {
            const blob = await generaWordDPI(dpiSelezionato, valoriHML, lexPerDPI, attenuationResults, mansione, reparto, lex, selectedAzienda, true);
            if (blob instanceof Blob) {
              const filename = `Valutazione_DPI_${new Date().toLocaleDateString('it-IT').replace(/\//g, '-')}.docx`;
              await documentiAPI.upload(new File([blob], filename), editingDPIId, 'dpi');
              toast({ title: 'Documento archiviato', description: 'Copia salvata nel cloud' });
            }
          } catch (e) {
            console.error('Errore upload automatico:', e);
          }
        }
      } else {
        toast({
          title: 'Errore durante la generazione del documento',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Errore durante la generazione del documento',
        variant: 'destructive'
      });
    }
  };
  const esportaCSVDPIHandler = () => {
    const success = esportaCSVDPI(dpiSelezionato, valoriHML, lexPerDPI, attenuationResults, mansione, reparto, lex);
    if (success) {
      toast({
        title: 'Export DPI completato',
        description: 'Il file CSV della valutazione DPI è stato scaricato'
      });
    } else {
      toast({
        title: 'Errore durante esportazione',
        variant: 'destructive'
      });
    }
  };

  // Funzioni per salvare nel database
  const salvaEsposizione = async () => {
    // Validazione azienda
    if (!selectedAziendaId) {
      toast({
        title: 'Attenzione',
        description: 'Seleziona un\'azienda prima di salvare la valutazione',
        variant: 'destructive'
      });
      return;
    }

    // Validazione campi obbligatori
    if (!mansione.trim()) {
      toast({
        title: 'Campi mancanti',
        description: 'Compila il campo "Mansione"',
        variant: 'destructive'
      });
      return;
    }

    // Validazione misurazioni
    const misurazioniMancanti: string[] = [];
    misurazioni.forEach((m, index) => {
      if (!m.attivita.trim()) {
        misurazioniMancanti.push(`Riga ${index + 1}: manca la descrizione attività`);
      }
      if (!m.leq || m.leq.trim() === '') {
        misurazioniMancanti.push(`Riga ${index + 1}: manca il valore LEQ`);
      }
      if (!m.durata || m.durata.trim() === '') {
        misurazioniMancanti.push(`Riga ${index + 1}: manca la durata`);
      }
      if (!m.lpicco || m.lpicco.trim() === '') {
        misurazioniMancanti.push(`Riga ${index + 1}: manca Lpicco`);
      }
    });

    if (misurazioniMancanti.length > 0) {
      toast({
        title: 'Dati incompleti',
        description: (
          <div className="space-y-1">
            <p className="font-semibold">Compila tutti i campi obbligatori:</p>
            <ul className="list-disc list-inside text-sm">
              {misurazioniMancanti.slice(0, 3).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
              {misurazioniMancanti.length > 3 && (
                <li>...e altri {misurazioniMancanti.length - 3} campi</li>
              )}
            </ul>
          </div>
        ),
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      const valutazioneData = {
        azienda_id: selectedAziendaId,
        mansione,
        reparto,
        misurazioni: misurazioni.map(m => ({
          attivita: m.attivita,
          leq: m.leq.replace(',', '.'),
          durata: m.durata.replace(',', '.'),
          lpicco: m.lpicco.replace(',', '.')
        })),
        lex: lex.toString().replace(',', '.'),
        lpicco: lpicco.toString().replace(',', '.'),
        classe_rischio: riskClass.classe
      };

      const response = editingEsposizioneId
        ? await esposizioneAPI.aggiorna(editingEsposizioneId, valutazioneData)
        : await esposizioneAPI.salva(valutazioneData);

      if (response.error) {
        toast({
          title: editingEsposizioneId ? 'Errore nell\'aggiornamento' : 'Errore nel salvataggio',
          description: response.error,
          variant: 'destructive'
        });
      } else {
        toast({
          title: editingEsposizioneId ? 'Valutazione aggiornata' : 'Valutazione salvata',
          description: `ID: ${response.data?.id}`
        });
        // Reset editing ID dopo salvataggio
        setEditingEsposizioneId(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const salvaDPI = async () => {
    // Validazione azienda
    if (!selectedAziendaId) {
      toast({
        title: 'Attenzione',
        description: 'Seleziona un\'azienda prima di salvare la valutazione DPI',
        variant: 'destructive'
      });
      return;
    }

    // Validazione campi obbligatori
    if (!mansione.trim()) {
      toast({
        title: 'Campi mancanti',
        description: 'Compila il campo "Mansione"',
        variant: 'destructive'
      });
      return;
    }

    if (!dpiSelezionato) {
      toast({
        title: 'Campi mancanti',
        description: 'Seleziona un DPI',
        variant: 'destructive'
      });
      return;
    }

    // Validazione valori HML
    const campiMancanti: string[] = [];
    if (!valoriHML.h || valoriHML.h.trim() === '') {
      campiMancanti.push('Valore H');
    }
    if (!valoriHML.m || valoriHML.m.trim() === '') {
      campiMancanti.push('Valore M');
    }
    if (!valoriHML.l || valoriHML.l.trim() === '') {
      campiMancanti.push('Valore L');
    }
    if (!lexPerDPI || lexPerDPI.trim() === '') {
      campiMancanti.push('LEX per DPI');
    }

    if (campiMancanti.length > 0) {
      toast({
        title: 'Dati incompleti',
        description: `Compila i seguenti campi: ${campiMancanti.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      const valutazioneDPIData = {
        azienda_id: selectedAziendaId,
        mansione,
        reparto,
        dpi_selezionato: dpiSelezionato,
        valori_hml: {
          h: valoriHML.h.replace(',', '.'),
          m: valoriHML.m.replace(',', '.'),
          l: valoriHML.l.replace(',', '.')
        },
        lex_per_dpi: lexPerDPI.replace(',', '.'),
        pnr: attenuationResults.pnr.replace(',', '.'),
        leff: attenuationResults.leff.replace(',', '.'),
        protezione_adeguata: attenuationResults.protezioneAdeguata
      };

      const response = editingDPIId
        ? await dpiAPI.aggiorna(editingDPIId, valutazioneDPIData)
        : await dpiAPI.salva(valutazioneDPIData);

      if (response.error) {
        toast({
          title: editingDPIId ? 'Errore nell\'aggiornamento' : 'Errore nel salvataggio',
          description: response.error,
          variant: 'destructive'
        });
      } else {
        toast({
          title: editingDPIId ? 'Valutazione DPI aggiornata' : 'Valutazione DPI salvata',
          description: `ID: ${response.data?.id}`
        });
        // Reset editing ID dopo salvataggio
        setEditingDPIId(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const nuovaValutazione = () => {
    setMansione('');
    setReparto('');
    setMisurazioni([{
      id: Date.now(),
      attivita: '',
      leq: '',
      durata: '',
      lpicco: ''
    }]);
    setDpiSelezionato('');
    setValoriHML({ h: '', m: '', l: '' });
    setLexPerDPI('');
    toast({
      title: 'Nuova valutazione',
      description: 'Tutti i campi sono stati resettati'
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Disconnesso',
      description: 'Arrivederci!'
    });
    navigate('/login');
  };

  const lex = calcolaLEX(misurazioni);
  const lpicco = getLpiccoMax(misurazioni);
  const riskClass = getClasseRischio(lex);
  const lexForDPI = parseFloat(lexPerDPI) || lex;
  const attenuationResults = calcolaAttenuazione(lexForDPI, valoriHML);
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <header className="mb-8">
        {/* Barra superiore: Titolo + Info Utente */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-lg">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Calcolatore Livello di Esposizione Rumore</h1>
              <p className="text-muted-foreground mt-1">
                Valutazione professionale secondo D.Lgs. 81/2008 e UNI EN 458:2016
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user?.nome}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Esci
            </Button>
          </div>
        </div>

        {/* Barra di navigazione */}
        <div className="flex items-center gap-2 p-4 bg-card rounded-lg border shadow-sm">
          <Button variant="outline" onClick={nuovaValutazione} className="flex-1 sm:flex-none">
            <RotateCcw className="h-4 w-4 mr-2" />
            Nuova Valutazione
          </Button>
          <Link to="/valutazioni" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full">
              <FolderOpen className="h-4 w-4 mr-2" />
              Storico Valutazioni
            </Button>
          </Link>
          <Link to="/aziende" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full">
              <Building2 className="h-4 w-4 mr-2" />
              Gestione Aziende
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50">
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          )}
        </div>
      </header>

      <Card className="p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <AziendaSelector
              aziende={aziende}
              selectedAziendaId={selectedAziendaId}
              onSelect={setSelectedAziendaId}
              onAddNew={() => setShowAziendaDialog(true)}
            />
          </div>
          <div>
            <Label htmlFor="mansione">Mansione</Label>
            <Input id="mansione" value={mansione} onChange={e => setMansione(e.target.value)} placeholder="Es: Operatore manutenzione" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="reparto">Reparto/Area</Label>
            <Input id="reparto" value={reparto} onChange={e => setReparto(e.target.value)} placeholder="Es: Reparto produzione" className="mt-2" />
          </div>
        </div>
      </Card>

      <Tabs defaultValue="esposizione" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="esposizione" className="gap-2">
            <Calculator className="h-4 w-4" />
            Esposizione Rumore
          </TabsTrigger>
          <TabsTrigger value="dpi" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Valutazione DPI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="esposizione" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Dati di Misurazione</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={aggiungiMisurazione}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Riga
                </Button>
                <label>
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Importa CSV
                    </span>
                  </Button>
                  <input type="file" accept=".csv,.txt" onChange={gestisciImportCSV} className="hidden" />
                </label>
                <Button variant="outline" size="sm" onClick={esportaCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Esporta CSV
                </Button>
                <Button variant="outline" size="sm" onClick={stampaPDF}>
                  <Printer className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={esportaWord}>
                  <FileText className="h-4 w-4 mr-2" />
                  Word
                </Button>
                <Button variant="default" size="sm" onClick={salvaEsposizione} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? (editingEsposizioneId ? 'Aggiornamento...' : 'Salvataggio...') : (editingEsposizioneId ? 'Aggiorna' : 'Salva')}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-3 text-sm font-semibold text-muted-foreground px-4">
                <div>Attività/Postazione</div>
                <div className="text-center">LAeq dB(A)</div>
                <div className="text-center">Durata (min)</div>
                <div className="text-center">Lpicco,C dB(C)</div>
                <div className="w-10"></div>
              </div>

              {misurazioni.map(m => <MeasurementRow key={m.id} measurement={m} onUpdate={aggiornaMisurazione} onRemove={rimuoviMisurazione} canRemove={misurazioni.length > 1} />)}
            </div>
          </Card>

          <ResultsCard lex={lex} lpicco={lpicco} riskClass={riskClass} />
        </TabsContent>

        <TabsContent value="dpi" className="space-y-6">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={esportaCSVDPIHandler} disabled={!attenuationResults.leff || attenuationResults.leff === '0'}>
              <Download className="h-4 w-4 mr-2" />
              Esporta CSV
            </Button>
            <Button variant="outline" size="sm" onClick={stampaPDFDPI} disabled={!attenuationResults.leff || attenuationResults.leff === '0'}>
              <Printer className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={esportaWordDPI} disabled={!attenuationResults.leff || attenuationResults.leff === '0'}>
              <FileText className="h-4 w-4 mr-2" />
              Word
            </Button>
            <Button variant="default" size="sm" onClick={salvaDPI} disabled={isSaving || !attenuationResults.leff || attenuationResults.leff === '0'}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? (editingDPIId ? 'Aggiornamento...' : 'Salvataggio...') : (editingDPIId ? 'Aggiorna' : 'Salva')}
            </Button>
          </div>

          <Card className="p-6">
            <DPISelector
              dpiSelezionato={dpiSelezionato}
              onSelectDPI={selezionaDPI}
              valoriHML={valoriHML}
              onHMLChange={handleHMLChange}
              lexPerDPI={lexPerDPI}
              onLexPerDPIChange={setLexPerDPI}
            />
          </Card>

          <DPIResults results={attenuationResults} />
        </TabsContent>
      </Tabs>

      <Dialog open={showAziendaDialog} onOpenChange={setShowAziendaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova Azienda</DialogTitle>
            <DialogDescription>
              Inserisci i dati della nuova azienda
            </DialogDescription>
          </DialogHeader>
          <AziendaForm onSubmit={handleSaveAzienda} onCancel={() => setShowAziendaDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  </div>;
};

export default Index;