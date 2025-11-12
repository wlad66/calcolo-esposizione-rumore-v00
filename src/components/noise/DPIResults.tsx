import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AttenuationResult } from '@/types/noise';

interface DPIResultsProps {
  results: AttenuationResult;
}

export const DPIResults = ({ results }: DPIResultsProps) => {
  if (!results.leff || results.leff === '0') {
    return null;
  }

  const getProtectionColor = (protection: string) => {
    if (protection.includes('OTTIMALE')) return 'bg-success/10 text-success border-success';
    if (protection.includes('INSUFFICIENTE')) return 'bg-destructive/10 text-destructive border-destructive';
    if (protection.includes('BUONA')) return 'bg-info/10 text-info border-info';
    if (protection.includes('ACCETTABILE')) return 'bg-warning/10 text-warning border-warning';
    return 'bg-orange-500/10 text-orange-600 border-orange-500';
  };

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-xl font-bold text-foreground">Risultati Valutazione DPI</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary">
          <p className="text-sm text-muted-foreground mb-1">
            Attenuazione Prevista (PNR)
          </p>
          <p className="text-3xl font-bold text-primary">
            {results.pnr} dB
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Riduzione fornita dal DPI
          </p>
        </div>
        
        <div className="p-4 rounded-lg bg-accent/5 border-2 border-accent">
          <p className="text-sm text-muted-foreground mb-1">
            Livello Effettivo (L'eff)
          </p>
          <p className="text-3xl font-bold text-accent">
            {results.leff} dB(A)
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Livello all'orecchio del lavoratore
          </p>
        </div>
      </div>
      
      <div className={cn(
        "p-6 rounded-lg border-l-4",
        getProtectionColor(results.protezioneAdeguata)
      )}>
        <p className="text-sm font-semibold mb-2">VALUTAZIONE PROTEZIONE</p>
        <p className="text-lg font-bold">{results.protezioneAdeguata}</p>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
        <p className="font-semibold">Criteri di Interpretazione (UNI EN 458:2016):</p>
        <div className="grid gap-1.5">
          <div className="flex justify-between">
            <span>&lt; 65 dB(A)</span>
            <span className="font-medium text-destructive">ECCESSIVA</span>
          </div>
          <div className="flex justify-between">
            <span>65-70 dB(A)</span>
            <span className="font-medium text-info">BUONA</span>
          </div>
          <div className="flex justify-between bg-success/5 px-2 py-1 rounded">
            <span className="font-semibold">70-80 dB(A)</span>
            <span className="font-bold text-success">OTTIMALE ✓</span>
          </div>
          <div className="flex justify-between">
            <span>80-85 dB(A)</span>
            <span className="font-medium text-warning">ACCETTABILE</span>
          </div>
          <div className="flex justify-between">
            <span>&gt; 85 dB(A)</span>
            <span className="font-medium text-destructive">INSUFFICIENTE</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
