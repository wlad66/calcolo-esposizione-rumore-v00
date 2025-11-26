import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import LegalDocumentsAcceptance from '@/components/LegalDocuments';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [legalDocsAccepted, setLegalDocsAccepted] = useState(false);
  const [showLegalError, setShowLegalError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione documenti legali
    if (!legalDocsAccepted) {
      setShowLegalError(true);
      toast({
        title: 'Documenti legali non accettati',
        description: 'Devi accettare tutti i documenti legali obbligatori per registrarti',
        variant: 'destructive',
      });
      // Scroll alla sezione documenti legali
      document.getElementById('legal-docs')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Validazione password
    if (password !== confirmPassword) {
      toast({
        title: 'Errore',
        description: 'Le password non coincidono',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Errore',
        description: 'La password deve essere di almeno 6 caratteri',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, nome);
      toast({
        title: 'Registrazione completata',
        description: 'Account creato con successo!',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Errore di registrazione',
        description: error instanceof Error ? error.message : 'Si è verificato un errore',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Registrati</CardTitle>
          <CardDescription className="text-center">
            Crea un nuovo account per accedere al sistema di calcolo esposizione rumore
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Mario Rossi"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoComplete="name"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isLoading}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isLoading}
                minLength={6}
              />
            </div>

            {/* Separatore */}
            <div className="border-t pt-6" id="legal-docs">
              <h3 className="text-lg font-semibold mb-4">Documenti Legali Obbligatori</h3>
              <LegalDocumentsAcceptance
                onAcceptAll={setLegalDocsAccepted}
                showValidationError={showLegalError}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !legalDocsAccepted}
            >
              {isLoading ? (
                'Registrazione in corso...'
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {legalDocsAccepted ? 'Completa Registrazione' : 'Accetta i Documenti Legali per Procedere'}
                </>
              )}
            </Button>
            <div className="text-sm text-center text-gray-600">
              Hai già un account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Accedi
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
