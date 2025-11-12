import { useState, useEffect } from 'react';
import { Building2, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { AziendaForm } from '@/components/aziende/AziendaForm';
import { AziendaList } from '@/components/aziende/AziendaList';
import { Azienda } from '@/types/noise';
import { aziendeAPI, AziendaAPI } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

const Aziende = () => {
  const [aziende, setAziende] = useState<Azienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAzienda, setEditingAzienda] = useState<Azienda | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Carica lista aziende
  useEffect(() => {
    caricaAziende();
  }, []);

  const caricaAziende = async () => {
    setLoading(true);
    const response = await aziendeAPI.lista();
    if (response.data) {
      setAziende(response.data);
    } else if (response.error) {
      toast({
        title: 'Errore',
        description: `Impossibile caricare le aziende: ${response.error}`,
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleSave = async (azienda: Azienda) => {
    if (azienda.id) {
      // Aggiorna azienda esistente
      const response = await aziendeAPI.aggiorna(azienda.id, azienda);
      if (response.data) {
        toast({
          title: 'Successo',
          description: 'Azienda aggiornata con successo',
        });
        caricaAziende();
        setShowForm(false);
        setEditingAzienda(undefined);
      } else if (response.error) {
        toast({
          title: 'Errore',
          description: `Impossibile aggiornare l'azienda: ${response.error}`,
          variant: 'destructive',
        });
      }
    } else {
      // Crea nuova azienda
      const response = await aziendeAPI.crea(azienda as AziendaAPI);
      if (response.data) {
        toast({
          title: 'Successo',
          description: 'Azienda creata con successo',
        });
        caricaAziende();
        setShowForm(false);
      } else if (response.error) {
        toast({
          title: 'Errore',
          description: `Impossibile creare l'azienda: ${response.error}`,
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (azienda: Azienda) => {
    setEditingAzienda(azienda);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const response = await aziendeAPI.elimina(id);
    if (response.data) {
      toast({
        title: 'Successo',
        description: 'Azienda eliminata con successo',
      });
      caricaAziende();
    } else if (response.error) {
      toast({
        title: 'Errore',
        description: `Impossibile eliminare l'azienda: ${response.error}`,
        variant: 'destructive',
      });
    }
    setDeleteConfirm(null);
  };

  const handleAddNew = () => {
    setEditingAzienda(undefined);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAzienda(undefined);
  };

  const handleSelect = (azienda: Azienda) => {
    // Puoi implementare la visualizzazione dettagli azienda
    console.log('Azienda selezionata:', azienda);
  };

  const handleViewValutazioni = (azienda: Azienda) => {
    // Naviga alla pagina valutazioni filtrate per azienda
    toast({
      title: 'Funzionalità in sviluppo',
      description: `Visualizzazione valutazioni per ${azienda.ragione_sociale}`,
    });
  };

  if (showForm) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alla lista
        </Button>
        <AziendaForm
          azienda={editingAzienda}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Gestione Aziende
          </h1>
          <p className="text-muted-foreground mt-2">
            Registra e gestisci le aziende per le quali effettui le valutazioni
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nuova Azienda
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      ) : (
        <AziendaList
          aziende={aziende}
          onSelect={handleSelect}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteConfirm(id)}
          onViewValutazioni={handleViewValutazioni}
        />
      )}

      {/* Dialog conferma eliminazione */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa azienda? Questa azione non può essere annullata.
              Le valutazioni associate all'azienda non verranno eliminate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Aziende;
