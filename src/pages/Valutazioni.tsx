import { useState, useEffect } from 'react';
import { FileText, Building2, ArrowLeft, Trash2, Filter, Edit, FolderOpen, Download, X, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { esposizioneAPI, dpiAPI, aziendeAPI, documentiAPI, DocumentoAPI } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ValutazioneEsposizione {
  id: number;
  azienda_id?: number;
  mansione: string;
  reparto: string;
  lex: string;
  lpicco: string;
  classe_rischio: string;
  created_at: string;
  misurazioni: any[];
}

interface ValutazioneDPI {
  id: number;
  azienda_id?: number;
  mansione: string;
  reparto: string;
  dpi_selezionato: string;
  lex_per_dpi: string;
  leff: string;
  protezione_adeguata: string;
  created_at: string;
}

interface Azienda {
  id: number;
  ragione_sociale: string;
}

const Valutazioni = () => {
  const navigate = useNavigate();
  const [valutazioniEsposizione, setValutazioniEsposizione] = useState<ValutazioneEsposizione[]>([]);
  const [valutazioniDPI, setValutazioniDPI] = useState<ValutazioneDPI[]>([]);
  const [aziende, setAziende] = useState<Azienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAzienda, setFiltroAzienda] = useState<string>('tutte');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'esposizione' | 'dpi'; id: number } | null>(null);

  // Stati per gestione documenti
  const [showDocsDialog, setShowDocsDialog] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<DocumentoAPI[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [selectedValutazioneForDocs, setSelectedValutazioneForDocs] = useState<{ type: 'esposizione' | 'dpi', id: number } | null>(null);

  useEffect(() => {
    caricaDati();
  }, []);

  const caricaDati = async () => {
    setLoading(true);

    // Carica aziende
    const aziendeRes = await aziendeAPI.lista();
    if (aziendeRes.data) {
      setAziende(aziendeRes.data);
    }

    // Carica valutazioni esposizione
    const espRes = await esposizioneAPI.lista(100);
    if (espRes.data) {
      setValutazioniEsposizione(espRes.data);
    } else if (espRes.error) {
      toast({
        title: 'Errore',
        description: `Impossibile caricare le valutazioni: ${espRes.error}`,
        variant: 'destructive',
      });
    }

    // Carica valutazioni DPI
    const dpiRes = await dpiAPI.lista(100);
    if (dpiRes.data) {
      setValutazioniDPI(dpiRes.data);
    } else if (dpiRes.error) {
      toast({
        title: 'Errore',
        description: `Impossibile caricare le valutazioni DPI: ${dpiRes.error}`,
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  const handleDeleteEsposizione = async (id: number) => {
    const response = await esposizioneAPI.elimina(id);
    if (response.data) {
      toast({
        title: 'Valutazione eliminata',
        description: 'La valutazione è stata eliminata con successo',
      });
      caricaDati();
    } else if (response.error) {
      toast({
        title: 'Errore',
        description: response.error,
        variant: 'destructive',
      });
    }
    setDeleteConfirm(null);
  };

  const handleDeleteDPI = async (id: number) => {
    const response = await dpiAPI.elimina(id);
    if (response.data) {
      toast({
        title: 'Valutazione DPI eliminata',
        description: 'La valutazione DPI è stata eliminata con successo',
      });
      caricaDati();
    } else if (response.error) {
      toast({
        title: 'Errore',
        description: response.error,
        variant: 'destructive',
      });
    }
    setDeleteConfirm(null);
  };

  const handleCaricaEsposizione = (val: ValutazioneEsposizione) => {
    navigate('/', {
      state: {
        caricaValutazione: {
          id: val.id,
          tipo: 'esposizione',
          azienda_id: val.azienda_id,
          mansione: val.mansione,
          reparto: val.reparto,
          misurazioni: val.misurazioni,
        }
      }
    });
  };

  const handleCaricaDPI = (val: ValutazioneDPI) => {
    navigate('/', {
      state: {
        caricaValutazione: {
          id: val.id,
          tipo: 'dpi',
          azienda_id: val.azienda_id,
          mansione: val.mansione,
          reparto: val.reparto,
          dpi_selezionato: val.dpi_selezionato,
          lex_per_dpi: val.lex_per_dpi,
        }
      }
    });
  };

  const handleShowDocuments = async (type: 'esposizione' | 'dpi', id: number) => {
    setSelectedValutazioneForDocs({ type, id });
    setLoadingDocs(true);
    setShowDocsDialog(true);

    const response = await documentiAPI.getByValutazione(type, id);
    if (response.data) {
      setSelectedDocs(response.data);
    } else {
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i documenti',
        variant: 'destructive'
      });
      setSelectedDocs([]);
    }
    setLoadingDocs(false);
  };

  const handleDownloadDocument = async (docId: number) => {
    try {
      // Scarica il file direttamente dall'endpoint proxy
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/documenti/${docId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Download fallito');
      }

      // Ottieni il nome del file dall'header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `documento-${docId}.pdf`;
      if (contentDisposition) {
        // Estrai il nome file tra virgolette: filename="nome.pdf"
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match) fileName = match[1];
      }

      // Crea blob e scarica
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Errore durante il download',
        description: error instanceof Error ? error.message : 'Errore sconosciuto',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) return;

    const response = await documentiAPI.elimina(docId);
    if (response.data) {
      toast({
        title: 'Documento eliminato',
        description: 'Il documento è stato rimosso con successo'
      });
      // Ricarica la lista documenti
      if (selectedValutazioneForDocs) {
        const docsRes = await documentiAPI.getByValutazione(selectedValutazioneForDocs.type, selectedValutazioneForDocs.id);
        if (docsRes.data) {
          setSelectedDocs(docsRes.data);
        }
      }
    } else {
      toast({
        title: 'Errore',
        description: response.error || 'Impossibile eliminare il documento',
        variant: 'destructive'
      });
    }
  };

  const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedValutazioneForDocs) return;

    // Reset input value to allow selecting the same file again
    event.target.value = '';

    const toastId = toast({
      title: 'Caricamento in corso...',
      description: 'Sto caricando il documento nel cloud',
    });

    try {
      const response = await documentiAPI.upload(
        file,
        selectedValutazioneForDocs.id,
        selectedValutazioneForDocs.type
      );

      if (response.data) {
        toast({
          title: 'Documento caricato',
          description: 'Il file è stato archiviato con successo'
        });

        // Ricarica lista
        const docsRes = await documentiAPI.getByValutazione(selectedValutazioneForDocs.type, selectedValutazioneForDocs.id);
        if (docsRes.data) {
          setSelectedDocs(docsRes.data);
        }
      } else {
        toast({
          title: 'Errore caricamento',
          description: response.error || 'Si è verificato un errore durante l\'upload',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Errore imprevisto',
        description: 'Impossibile completare il caricamento',
        variant: 'destructive'
      });
    }
  };

  const getNomeAzienda = (aziendaId?: number) => {
    if (!aziendaId) return 'Nessuna azienda';
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda?.ragione_sociale || 'Sconosciuta';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const valutazioniFiltrate = (valutazioni: any[]) => {
    if (filtroAzienda === 'tutte') return valutazioni;
    return valutazioni.filter(v => v.azienda_id?.toString() === filtroAzienda);
  };

  const getRiskColor = (classe: string) => {
    if (classe.includes('Basso')) return 'text-green-600 bg-green-50';
    if (classe.includes('Medio')) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Torna al Calcolatore
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Storico Valutazioni
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualizza e gestisci tutte le valutazioni salvate
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filtroAzienda} onValueChange={setFiltroAzienda}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filtra per azienda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutte">Tutte le aziende</SelectItem>
                {aziende.map(a => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.ragione_sociale}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Caricamento...</p>
          </div>
        ) : (
          <Tabs defaultValue="esposizione" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="esposizione">
                Esposizione Rumore ({valutazioniFiltrate(valutazioniEsposizione).length})
              </TabsTrigger>
              <TabsTrigger value="dpi">
                Valutazione DPI ({valutazioniFiltrate(valutazioniDPI).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="esposizione" className="space-y-4">
              {valutazioniFiltrate(valutazioniEsposizione).length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">Nessuna valutazione trovata</p>
                </Card>
              ) : (
                valutazioniFiltrate(valutazioniEsposizione).map(val => (
                  <Card key={val.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Building2 className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{getNomeAzienda(val.azienda_id)}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(val.classe_rischio)}`}>
                            {val.classe_rischio}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Mansione:</span>
                            <span className="ml-2 font-medium">{val.mansione}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reparto:</span>
                            <span className="ml-2 font-medium">{val.reparto || 'Non specificato'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">LEX:</span>
                            <span className="ml-2 font-medium">{val.lex} dB(A)</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Lpicco:</span>
                            <span className="ml-2 font-medium">{val.lpicco} dB(C)</span>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Salvato il {formatDate(val.created_at)} • {val.misurazioni?.length || 0} misurazioni
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowDocuments('esposizione', val.id)}
                          className="hover:bg-primary/10"
                          title="Gestisci documenti"
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Documenti
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCaricaEsposizione(val)}
                          className="hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Carica
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm({ type: 'esposizione', id: val.id })}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="dpi" className="space-y-4">
              {valutazioniFiltrate(valutazioniDPI).length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">Nessuna valutazione DPI trovata</p>
                </Card>
              ) : (
                valutazioniFiltrate(valutazioniDPI).map(val => (
                  <Card key={val.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Building2 className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{getNomeAzienda(val.azienda_id)}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${val.protezione_adeguata === 'SÌ' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                            }`}>
                            Protezione {val.protezione_adeguata}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Mansione:</span>
                            <span className="ml-2 font-medium">{val.mansione}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reparto:</span>
                            <span className="ml-2 font-medium">{val.reparto || 'Non specificato'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">DPI:</span>
                            <span className="ml-2 font-medium">{val.dpi_selezionato}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">LEff:</span>
                            <span className="ml-2 font-medium">{val.leff} dB(A)</span>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Salvato il {formatDate(val.created_at)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowDocuments('dpi', val.id)}
                          className="hover:bg-primary/10"
                          title="Gestisci documenti"
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Documenti
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCaricaDPI(val)}
                          className="hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Carica
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm({ type: 'dpi', id: val.id })}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Dialog Documenti */}
        <Dialog open={showDocsDialog} onOpenChange={setShowDocsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Documenti Archiviati</DialogTitle>
              <DialogDescription>
                Gestisci i documenti salvati per questa valutazione
              </DialogDescription>
              <div className="flex justify-end pt-4">
                <Button onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Carica Documento
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.csv"
                  onChange={handleUploadDocument}
                />
              </div>
            </DialogHeader>

            <div className="mt-4">
              {loadingDocs ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Caricamento documenti...</p>
                </div>
              ) : selectedDocs.length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-muted/20">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Nessun documento archiviato</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {selectedDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{doc.nome_file}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleString('it-IT')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Scarica
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog conferma eliminazione */}
        <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler eliminare questa valutazione? Questa azione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteConfirm) {
                    if (deleteConfirm.type === 'esposizione') {
                      handleDeleteEsposizione(deleteConfirm.id);
                    } else {
                      handleDeleteDPI(deleteConfirm.id);
                    }
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Valutazioni;
