import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
        placeholder="LEQ"
        value={measurement.leq}
        onChange={(e) => onUpdate(measurement.id, 'leq', e.target.value)}
        className="text-center"
      />
      <Input
        type="number"
        step="1"
        placeholder="Minuti"
        value={measurement.durata}
        onChange={(e) => onUpdate(measurement.id, 'durata', e.target.value)}
        className="text-center"
      />
      <Input
        type="number"
        step="0.1"
        placeholder="Lpicco"
        value={measurement.lpicco}
        onChange={(e) => onUpdate(measurement.id, 'lpicco', e.target.value)}
        className="text-center"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(measurement.id)}
        disabled={!canRemove}
        className="hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
