import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultsCardProps {
  lex: number;
  lpicco: number;
  riskClass: {
    classe: string;
    colore: string;
    border: string;
  };
}

export const ResultsCard = ({ lex, lpicco, riskClass }: ResultsCardProps) => {
  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-primary" />
        Risultati Valutazione
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary">
          <p className="text-sm text-muted-foreground mb-1">
            Livello di Esposizione Giornaliera
          </p>
          <p className="text-3xl font-bold text-primary">
            LEX,8h = {lex.toFixed(1)} dB(A)
          </p>
        </div>
        
        <div className="p-4 rounded-lg bg-accent/5 border-2 border-accent">
          <p className="text-sm text-muted-foreground mb-1">
            Livello di Picco Massimo
          </p>
          <p className="text-3xl font-bold text-accent">
            Lpicco,C = {lpicco.toFixed(1)} dB(C)
          </p>
        </div>
      </div>
      
      <div className={cn(
        "p-6 rounded-lg border-l-4",
        riskClass.colore,
        riskClass.border
      )}>
        <p className="text-sm font-semibold mb-2">CLASSIFICAZIONE DEL RISCHIO</p>
        <p className="text-lg font-bold">{riskClass.classe}</p>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
        <p className="font-semibold">Valori Limite D.Lgs. 81/2008:</p>
        <div className="grid gap-1.5">
          <div className="flex justify-between">
            <span>Valore inferiore di azione:</span>
            <span className="font-medium">80 dB(A) | 135 dB(C)</span>
          </div>
          <div className="flex justify-between">
            <span>Valore superiore di azione:</span>
            <span className="font-medium">85 dB(A) | 137 dB(C)</span>
          </div>
          <div className="flex justify-between">
            <span>Valore limite di esposizione:</span>
            <span className="font-medium">87 dB(A) | 140 dB(C)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
