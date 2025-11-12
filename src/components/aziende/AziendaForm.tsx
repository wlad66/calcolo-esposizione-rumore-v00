import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Save, X } from 'lucide-react';
import { Azienda } from '@/types/noise';

interface AziendaFormProps {
  azienda?: Azienda;
  onSave: (azienda: Azienda) => void;
  onCancel: () => void;
}

export const AziendaForm = ({ azienda, onSave, onCancel }: AziendaFormProps) => {
  const [formData, setFormData] = useState<Azienda>({
    ragione_sociale: '',
    partita_iva: '',
    codice_fiscale: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    telefono: '',
    email: '',
    rappresentante_legale: '',
  });

  useEffect(() => {
    if (azienda) {
      setFormData(azienda);
    }
  }, [azienda]);

  const handleChange = (field: keyof Azienda, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {azienda?.id ? 'Modifica Azienda' : 'Nuova Azienda'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ragione Sociale */}
            <div className="md:col-span-2">
              <Label htmlFor="ragione_sociale">Ragione Sociale *</Label>
              <Input
                id="ragione_sociale"
                value={formData.ragione_sociale}
                onChange={(e) => handleChange('ragione_sociale', e.target.value)}
                required
                placeholder="Es. Rossi S.r.l."
              />
            </div>

            {/* Partita IVA */}
            <div>
              <Label htmlFor="partita_iva">Partita IVA *</Label>
              <Input
                id="partita_iva"
                value={formData.partita_iva}
                onChange={(e) => handleChange('partita_iva', e.target.value)}
                required
                placeholder="12345678901"
                maxLength={11}
              />
            </div>

            {/* Codice Fiscale */}
            <div>
              <Label htmlFor="codice_fiscale">Codice Fiscale *</Label>
              <Input
                id="codice_fiscale"
                value={formData.codice_fiscale}
                onChange={(e) => handleChange('codice_fiscale', e.target.value.toUpperCase())}
                required
                placeholder="12345678901"
                maxLength={16}
              />
            </div>

            {/* Indirizzo */}
            <div className="md:col-span-2">
              <Label htmlFor="indirizzo">Indirizzo *</Label>
              <Input
                id="indirizzo"
                value={formData.indirizzo}
                onChange={(e) => handleChange('indirizzo', e.target.value)}
                required
                placeholder="Via Roma, 123"
              />
            </div>

            {/* Città */}
            <div>
              <Label htmlFor="citta">Città *</Label>
              <Input
                id="citta"
                value={formData.citta}
                onChange={(e) => handleChange('citta', e.target.value)}
                required
                placeholder="Milano"
              />
            </div>

            {/* CAP */}
            <div>
              <Label htmlFor="cap">CAP *</Label>
              <Input
                id="cap"
                value={formData.cap}
                onChange={(e) => handleChange('cap', e.target.value)}
                required
                placeholder="20100"
                maxLength={5}
              />
            </div>

            {/* Provincia */}
            <div>
              <Label htmlFor="provincia">Provincia *</Label>
              <Input
                id="provincia"
                value={formData.provincia}
                onChange={(e) => handleChange('provincia', e.target.value.toUpperCase())}
                required
                placeholder="MI"
                maxLength={2}
              />
            </div>

            {/* Telefono */}
            <div>
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="02 1234567"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="info@azienda.it"
              />
            </div>

            {/* Rappresentante Legale */}
            <div>
              <Label htmlFor="rappresentante_legale">Rappresentante Legale</Label>
              <Input
                id="rappresentante_legale"
                value={formData.rappresentante_legale}
                onChange={(e) => handleChange('rappresentante_legale', e.target.value)}
                placeholder="Mario Rossi"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Salva
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
