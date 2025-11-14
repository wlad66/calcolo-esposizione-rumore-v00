import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { dpiDatabase } from '@/data/dpiDatabase';

interface DPISelectorProps {
  dpiSelezionato: string;
  valoriHML: { h: string; m: string; l: string };
  lexPerDPI: string;
  onDPIChange: (key: string) => void;
  onHMLChange: (field: 'h' | 'm' | 'l', value: string) => void;
  onLexChange: (value: string) => void;
  lexCalcolato: number;
}

export const DPISelector = ({
  dpiSelezionato,
  valoriHML,
  lexPerDPI,
  onDPIChange,
  onHMLChange,
  onLexChange,
  lexCalcolato
}: DPISelectorProps) => {
  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Shield className="h-5 w-5 text-accent" />
        Valutazione DPI Uditivi (Metodo HML)
      </h3>
      
      <div className="space-y-4">
        <div>
          <Label>Seleziona DPI dal Database 3M</Label>
          <Select value={dpiSelezionato} onValueChange={onDPIChange}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Seleziona un DPI..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Valori personalizzati</SelectItem>
              <SelectItem disabled value="tappi">— TAPPI MONOUSO 3M —</SelectItem>
              <SelectItem value="3m_classic_small">3M E-A-R Classic Small (SNR 28 dB)</SelectItem>
              <SelectItem value="3m_classic">3M E-A-R Classic (SNR 28 dB)</SelectItem>
              <SelectItem value="3m_classic_regular">3M E-A-R Classic Regular (SNR 31 dB)</SelectItem>
              <SelectItem value="3m_yellow_neons">3M E-A-Rsoft Yellow Neons (SNR 34 dB)</SelectItem>
              <SelectItem value="3m_1100">3M 1100 (SNR 35 dB)</SelectItem>
              <SelectItem value="3m_1110">3M 1110 con cordino (SNR 35 dB)</SelectItem>
              <SelectItem value="3m_soft_fx">3M E-A-Rsoft FX (SNR 37 dB)</SelectItem>
              <SelectItem disabled value="cuffie">— CUFFIE 3M PELTOR —</SelectItem>
              <SelectItem value="peltor_optime1">3M Peltor Optime I (SNR 27 dB)</SelectItem>
              <SelectItem value="peltor_optime2">3M Peltor Optime II (SNR 31 dB)</SelectItem>
              <SelectItem value="peltor_optime3">3M Peltor Optime III (SNR 35 dB)</SelectItem>
              <SelectItem value="peltor_x5">3M Peltor X5A (SNR 37 dB)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="h-value">H (dB) - Alte freq.</Label>
            <Input
              id="h-value"
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={valoriHML.h}
              onChange={(e) => onHMLChange('h', e.target.value)}
              placeholder="0"
              className="mt-2"
              title="Attenuazione alte frequenze: 0-50 dB"
            />
          </div>
          <div>
            <Label htmlFor="m-value">M (dB) - Medie freq.</Label>
            <Input
              id="m-value"
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={valoriHML.m}
              onChange={(e) => onHMLChange('m', e.target.value)}
              placeholder="0"
              className="mt-2"
              title="Attenuazione medie frequenze: 0-50 dB"
            />
          </div>
          <div>
            <Label htmlFor="l-value">L (dB) - Basse freq.</Label>
            <Input
              id="l-value"
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={valoriHML.l}
              onChange={(e) => onHMLChange('l', e.target.value)}
              placeholder="0"
              className="mt-2"
              title="Attenuazione basse frequenze: 0-50 dB"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="lex-dpi">LEX,8h per valutazione DPI (dB(A))</Label>
          <Input
            id="lex-dpi"
            type="number"
            step="0.1"
            min="0"
            max="140"
            value={lexPerDPI}
            onChange={(e) => onLexChange(e.target.value)}
            placeholder={lexCalcolato.toFixed(1)}
            className="mt-2"
            title="Livello di esposizione: 0-140 dB(A)"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Lascia vuoto per usare il LEX calcolato ({lexCalcolato.toFixed(1)} dB(A))
          </p>
        </div>
      </div>
    </Card>
  );
};
