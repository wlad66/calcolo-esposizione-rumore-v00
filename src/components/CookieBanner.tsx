import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Mostra il banner dopo 1 secondo per non essere invasivo
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = (level: 'all' | 'essential') => {
    localStorage.setItem('cookie_consent', level);
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);

    // In futuro: attiva/disattiva Google Analytics in base al consenso
    if (level === 'all') {
      // window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
      console.log('Cookie analytics abilitati');
    } else {
      console.log('Solo cookie essenziali');
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom">
      <Card className="max-w-5xl mx-auto p-6 shadow-2xl border-2">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              🍪 Utilizzo dei Cookie
            </h3>
            <p className="text-sm text-muted-foreground">
              Utilizziamo <strong>cookie tecnici</strong> essenziali per il funzionamento del sito
              e <strong>cookie analytics</strong> (anonimi) per migliorare l'esperienza utente.
              {' '}
              <Link
                to="/cookie-policy"
                className="underline hover:text-primary"
                target="_blank"
              >
                Leggi la Cookie Policy completa
              </Link>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => handleAccept('essential')}
              className="w-full sm:w-auto"
            >
              Solo Essenziali
            </Button>
            <Button
              onClick={() => handleAccept('all')}
              className="w-full sm:w-auto"
            >
              Accetta Tutti
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieBanner;
