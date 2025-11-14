import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Measurement } from '@/types/noise';

interface MeasurementRowProps {
  measurement: Measurement;
  onUpdate: (id: number, campo: string, valore: string) => void;
  onRemove: (id: number) => void;
  canRemove: boolean;
}

export const MeasurementRow = ({
  measurement,
  onUpdate,
  onRemove,
  canRemove
}: MeasurementRowProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-3 items-center p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors">
      <Input
        placeholder="Descrizione attività..."
        value={measurement.attivita}
        onChange={(e) => onUpdate(measurement.id, 'attivita', e.target.value)}
        className="font-medium"
      />
      <Input
        type="number"
        step="0.1"
        min="0"
        max="140"
        placeholder="LEQ (dB)"
        value={measurement.leq}
        onChange={(e) => onUpdate(measurement.id, 'leq', e.target.value)}
        className="text-center"
        title="Livello equivalente: 0-140 dB(A)"
      />
      <Input
        type="number"
        step="1"
        min="0"
        max="480"
        placeholder="Minuti"
        value={measurement.durata}
        onChange={(e) => onUpdate(measurement.id, 'durata', e.target.value)}
        className="text-center"
        title="Durata esposizione: 0-480 minuti (8 ore)"
      />
      <Input
        type="number"
        step="0.1"
        min="0"
        max="200"
        placeholder="Lpicco (dB)"
        value={measurement.lpicco}
        onChange={(e) => onUpdate(measurement.id, 'lpicco', e.target.value)}
        className="text-center"
        title="Livello di picco: 0-200 dB(C)"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDeleteDialog(true)}
        disabled={!canRemove}
        className="hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa misurazione{measurement.attivita ? ` "${measurement.attivita}"` : ''}?
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemove(measurement.id);
                setShowDeleteDialog(false);
              }}
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
