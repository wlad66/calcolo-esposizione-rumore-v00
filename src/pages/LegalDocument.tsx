import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface DocumentInfo {
  title: string;
  file: string;
  description: string;
}

const documents: Record<string, DocumentInfo> = {
  'terms': {
    title: 'Termini e Condizioni di Servizio',
    file: 'TERMINI_E_CONDIZIONI.md',
    description: 'Regole di utilizzo del servizio SafetyProSuite e diritti/doveri delle parti.'
  },
  'privacy': {
    title: 'Informativa sulla Privacy',
    file: 'PRIVACY_POLICY.md',
    description: 'Come trattiamo i tuoi dati personali secondo il GDPR.'
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    file: 'COOKIE_POLICY.md',
    description: 'Informazioni sui cookie utilizzati dall\'applicazione.'
  },
  'dpa': {
    title: 'Accordo sul Trattamento dei Dati (DPA)',
    file: 'ACCORDO_TRATTAMENTO_DATI.md',
    description: 'Accordo tra Titolare e Responsabile del trattamento ai sensi dell\'Art. 28 GDPR.'
  }
};

const LegalDocument = () => {
  const { docId } = useParams<{ docId: string }>();
  const location = useLocation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Determina il docId dal path se non presente nei params
  const getDocIdFromPath = () => {
    if (docId) return docId;
    const path = location.pathname.replace('/legal/', '').replace('/', '');
    return path || null;
  };

  const actualDocId = getDocIdFromPath();
  const docInfo = actualDocId ? documents[actualDocId] : null;

  useEffect(() => {
    if (!docInfo) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/docs/legal/${docInfo.file}`)
      .then(res => {
        if (!res.ok) throw new Error('Document not found');
        return res.text();
      })
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading document:', error);
        setContent('# Errore\n\nImpossibile caricare il documento. Si prega di contattare il supporto.');
        setLoading(false);
      });
  }, [docInfo]);

  if (!docInfo) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Documento non trovato</h1>
            <p className="text-muted-foreground mb-6">
              Il documento richiesto non esiste.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla Home
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Stampa / Salva PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <FileText className="h-4 w-4 mr-2" />
            Documento Legale
          </div>
          <h1 className="text-4xl font-bold mb-3">{docInfo.title}</h1>
          <p className="text-lg text-muted-foreground">{docInfo.description}</p>
        </div>

        <Card className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Caricamento documento...</p>
            </div>
          ) : (
            <ScrollArea className="h-[70vh]">
              <div className="prose prose-slate dark:prose-invert max-w-none pr-4">
                <MarkdownRenderer content={content} />
              </div>
            </ScrollArea>
          )}
        </Card>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Documenti legali di SafetyProSuite - TOKEM LLC</p>
          <p className="mt-2">
            Per domande: <a href="mailto:privacy@safetyprosuite.com" className="underline hover:text-primary">privacy@safetyprosuite.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalDocument;
