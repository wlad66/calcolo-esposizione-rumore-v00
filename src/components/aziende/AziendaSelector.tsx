import { Building2, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Azienda } from '@/types/noise';

interface AziendaSelectorProps {
  aziende: Azienda[];
  selectedAziendaId?: number;
  onSelect: (aziendaId: number) => void;
  onAddNew: () => void;
}

export const AziendaSelector = ({
  aziende,
  selectedAziendaId,
  onSelect,
  onAddNew,
}: AziendaSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="azienda-select" className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Azienda
      </Label>
      <div className="flex gap-2">
        <Select
          value={selectedAziendaId?.toString()}
          onValueChange={(value) => onSelect(parseInt(value))}
        >
          <SelectTrigger id="azienda-select" className="flex-1">
            <SelectValue placeholder="Seleziona un'azienda..." />
          </SelectTrigger>
          <SelectContent>
            {aziende.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Nessuna azienda disponibile
              </div>
            ) : (
              aziende.map((azienda) => (
                <SelectItem key={azienda.id} value={azienda.id!.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">{azienda.ragione_sociale}</span>
                    <span className="text-xs text-muted-foreground">
                      P.IVA: {azienda.partita_iva}
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onAddNew}
          title="Aggiungi nuova azienda"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
