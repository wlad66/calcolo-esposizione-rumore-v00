import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Azienda } from '@/types/noise';

interface AziendaFormProps {
  azienda?: Azienda;
  onSave: (azienda: Azienda) => void;
  onCancel: () => void;
}

// Validazione Partita IVA italiana (11 cifre)
const validaPartitaIVA = (piva: string): boolean => {
  if (!/^\d{11}$/.test(piva)) return false;

  // Algoritmo di controllo P.IVA
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let digit = parseInt(piva[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(piva[10]);
};

// Validazione Codice Fiscale (16 caratteri alfanumerici)
const validaCodiceFiscale = (cf: string): boolean => {
  if (!/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i.test(cf)) return false;

  // Tabella caratteri dispari
  const odd = { '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
    A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21, K: 2, L: 4, M: 18, N: 20, O: 11,
    P: 3, Q: 6, R: 8, S: 12, T: 14, U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23 };

  // Tabella caratteri pari
  const even = { '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10, L: 11, M: 12, N: 13, O: 14,
    P: 15, Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25 };

  const remainderMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let sum = 0;
  const cfUpper = cf.toUpperCase();
  for (let i = 0; i < 15; i++) {
    const char = cfUpper[i];
    sum += i % 2 === 0 ? (odd as any)[char] : (even as any)[char];
  }

  const expectedCheck = remainderMap[sum % 26];
  return cfUpper[15] === expectedCheck;
};

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

  const [errors, setErrors] = useState({
    partita_iva: '',
    codice_fiscale: ''
  });

  useEffect(() => {
    if (azienda) {
      setFormData(azienda);
    }
  }, [azienda]);

  const handleChange = (field: keyof Azienda, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validazione in tempo reale per P.IVA e CF
    if (field === 'partita_iva' && value.length === 11) {
      setErrors(prev => ({
        ...prev,
        partita_iva: validaPartitaIVA(value) ? '' : 'Partita IVA non valida'
      }));
    } else if (field === 'partita_iva') {
      setErrors(prev => ({ ...prev, partita_iva: value.length > 0 && value.length < 11 ? 'La P.IVA deve essere di 11 cifre' : '' }));
    }

    if (field === 'codice_fiscale' && value.length === 16) {
      setErrors(prev => ({
        ...prev,
        codice_fiscale: validaCodiceFiscale(value) ? '' : 'Codice Fiscale non valido'
      }));
    } else if (field === 'codice_fiscale') {
      setErrors(prev => ({ ...prev, codice_fiscale: value.length > 0 && value.length < 16 ? 'Il CF deve essere di 16 caratteri' : '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione finale prima del submit
    const pivaValid = validaPartitaIVA(formData.partita_iva);
    const cfValid = validaCodiceFiscale(formData.codice_fiscale);

    if (!pivaValid || !cfValid) {
      setErrors({
        partita_iva: pivaValid ? '' : 'Partita IVA non valida',
        codice_fiscale: cfValid ? '' : 'Codice Fiscale non valido'
      });
      return;
    }

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
              <div className="relative">
                <Input
                  id="partita_iva"
                  value={formData.partita_iva}
                  onChange={(e) => handleChange('partita_iva', e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="12345678901"
                  maxLength={11}
                  pattern="\d{11}"
                  className={errors.partita_iva ? 'border-red-500 pr-10' : formData.partita_iva.length === 11 && !errors.partita_iva ? 'border-green-500 pr-10' : ''}
                  title="P.IVA italiana: 11 cifre numeriche"
                />
                {formData.partita_iva.length === 11 && !errors.partita_iva && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
                {errors.partita_iva && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600" />
                )}
              </div>
              {errors.partita_iva && (
                <p className="text-sm text-red-600 mt-1">{errors.partita_iva}</p>
              )}
            </div>

            {/* Codice Fiscale */}
            <div>
              <Label htmlFor="codice_fiscale">Codice Fiscale *</Label>
              <div className="relative">
                <Input
                  id="codice_fiscale"
                  value={formData.codice_fiscale}
                  onChange={(e) => handleChange('codice_fiscale', e.target.value.toUpperCase())}
                  required
                  placeholder="RSSMRA80A01H501A"
                  maxLength={16}
                  pattern="[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]"
                  className={errors.codice_fiscale ? 'border-red-500 pr-10' : formData.codice_fiscale.length === 16 && !errors.codice_fiscale ? 'border-green-500 pr-10' : ''}
                  title="CF italiano: 16 caratteri alfanumerici"
                />
                {formData.codice_fiscale.length === 16 && !errors.codice_fiscale && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
                {errors.codice_fiscale && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600" />
                )}
              </div>
              {errors.codice_fiscale && (
                <p className="text-sm text-red-600 mt-1">{errors.codice_fiscale}</p>
              )}
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
