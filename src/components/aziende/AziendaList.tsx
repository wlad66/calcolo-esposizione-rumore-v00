import { Building2, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Azienda } from '@/types/noise';

interface AziendaListProps {
  aziende: Azienda[];
  onSelect: (azienda: Azienda) => void;
  onEdit: (azienda: Azienda) => void;
  onDelete: (id: number) => void;
  onViewValutazioni: (azienda: Azienda) => void;
}

export const AziendaList = ({
  aziende,
  onSelect,
  onEdit,
  onDelete,
  onViewValutazioni
}: AziendaListProps) => {
  if (aziende.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nessuna azienda registrata</p>
          <p className="text-sm mt-2">Inizia registrando la prima azienda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {aziende.map((azienda) => (
        <Card
          key={azienda.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect(azienda)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">{azienda.ragione_sociale}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">P.IVA:</span> {azienda.partita_iva}
                  </div>
                  <div>
                    <span className="font-medium">CF:</span> {azienda.codice_fiscale}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Indirizzo:</span> {azienda.indirizzo}, {azienda.cap} {azienda.citta} ({azienda.provincia})
                  </div>
                  {azienda.telefono && (
                    <div>
                      <span className="font-medium">Tel:</span> {azienda.telefono}
                    </div>
                  )}
                  {azienda.email && (
                    <div>
                      <span className="font-medium">Email:</span> {azienda.email}
                    </div>
                  )}
                  {azienda.rappresentante_legale && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Rappresentante Legale:</span> {azienda.rappresentante_legale}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewValutazioni(azienda)}
                  title="Visualizza valutazioni"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(azienda)}
                  title="Modifica"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => azienda.id && onDelete(azienda.id)}
                  className="text-destructive hover:text-destructive"
                  title="Elimina"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
