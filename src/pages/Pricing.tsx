import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { subscriptionsAPI, SubscriptionPlanAPI } from '@/lib/api';
import { Check, Loader2, Sparkles } from 'lucide-react';

export default function Pricing() {
  const [plans, setPlans] = useState<SubscriptionPlanAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await subscriptionsAPI.getPlans();
      if (response.data) {
        setPlans(response.data);
      } else if (response.error) {
        toast({
          title: 'Errore',
          description: response.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i piani disponibili',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: number, planName: string) => {
    // Se l'utente non è loggato, reindirizza al login
    if (!user) {
      toast({
        title: 'Accesso richiesto',
        description: 'Effettua il login per sottoscrivere un abbonamento',
      });
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    // Piano Free: redirect alla dashboard
    if (planName === 'free') {
      navigate('/');
      return;
    }

    setCheckoutLoading(planId);

    try {
      // Crea sessione di checkout Stripe (per ora solo yearly per il Pro)
      const response = await subscriptionsAPI.createCheckoutSession(planId, 'yearly');

      if (response.data && response.data.checkout_url) {
        // Reindirizza a Stripe Checkout
        window.location.href = response.data.checkout_url;
      } else if (response.error) {
        toast({
          title: 'Errore',
          description: response.error,
          variant: 'destructive',
        });
        setCheckoutLoading(null);
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile avviare il checkout. Riprova.',
        variant: 'destructive',
      });
      setCheckoutLoading(null);
    }
  };

  const formatFeature = (value: any, label: string) => {
    if (value === null || value === undefined) return `${label} illimitato`;
    if (typeof value === 'boolean') return value ? label : null;
    if (typeof value === 'number' && value > 0) return `${label}: ${value}`;
    return label;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Scegli il piano perfetto per te
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Inizia con 15 giorni di prova gratuita, senza carta di credito richiesta
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col h-full ${plan.is_popular ? 'border-2 border-blue-500 shadow-xl scale-105' : 'border-gray-200'}`}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1 flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Consigliato
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold">{plan.display_name}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {plan.description}
                </CardDescription>

                <div className="mt-4">
                  {plan.price_yearly && plan.price_yearly > 0 ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          €{plan.price_yearly}
                        </span>
                        <span className="text-gray-600">/anno</span>
                      </div>
                      {plan.name === 'pro' && (
                        <Badge variant="outline" className="mt-2 border-green-500 text-green-700 bg-green-50">
                          🎉 7 giorni di prova gratuita
                        </Badge>
                      )}
                    </>
                  ) : (
                    <div className="text-4xl font-bold text-gray-900">Gratis</div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="space-y-3">
                  {/* Features List */}
                  {plan.max_valutazioni_esposizione_month !== null && plan.max_valutazioni_esposizione_month > 0 && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        {plan.max_valutazioni_esposizione_month} valutazioni esposizione/mese
                      </span>
                    </div>
                  )}
                  {plan.max_valutazioni_esposizione_month === null && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-semibold">
                        Valutazioni esposizione illimitate
                      </span>
                    </div>
                  )}

                  {plan.max_valutazioni_dpi_month !== null && plan.max_valutazioni_dpi_month > 0 && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        {plan.max_valutazioni_dpi_month} valutazioni DPI/mese
                      </span>
                    </div>
                  )}
                  {plan.max_valutazioni_dpi_month === null && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-semibold">
                        Valutazioni DPI illimitate
                      </span>
                    </div>
                  )}

                  {plan.max_aziende !== null && plan.max_aziende > 0 && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        Fino a {plan.max_aziende} {plan.max_aziende === 1 ? 'azienda' : 'aziende'}
                      </span>
                    </div>
                  )}
                  {plan.max_aziende === null && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-semibold">
                        Aziende illimitate
                      </span>
                    </div>
                  )}

                  {plan.storage_mb && plan.storage_mb > 0 && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        {plan.storage_mb >= 1024
                          ? `${(plan.storage_mb / 1024).toFixed(0)} GB`
                          : `${plan.storage_mb} MB`} di storage
                      </span>
                    </div>
                  )}

                  {plan.feature_archivio_documenti && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Archivio documenti</span>
                    </div>
                  )}

                  {plan.feature_export_data && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Esportazione dati (PDF, Excel)</span>
                    </div>
                  )}

                  {plan.feature_priority_support && (
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Supporto prioritario</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan.id, plan.name)}
                  disabled={checkoutLoading === plan.id}
                  className={`w-full ${plan.is_popular
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-800 hover:bg-gray-900'
                    }`}
                  size="lg"
                >
                  {checkoutLoading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Caricamento...
                    </>
                  ) : (
                    <>
                      {plan.name === 'free' ? 'Inizia Gratis' : 'Abbonati Ora'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ o info aggiuntive */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            Tutti i piani includono aggiornamenti gratuiti e assistenza via email.
          </p>
          <p className="text-sm mt-2">
            Puoi cancellare in qualsiasi momento. Nessun vincolo.
          </p>
        </div>
      </div>
    </div>
  );
}
