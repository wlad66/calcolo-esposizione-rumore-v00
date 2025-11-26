import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface LegalDocument {
  id: string;
  title: string;
  description: string;
  required: boolean;
  content?: string; // Markdown content (loaded dynamically)
  url?: string; // URL to external document
}

const legalDocuments: LegalDocument[] = [
  {
    id: 'terms',
    title: 'Termini e Condizioni di Servizio',
    description: 'Regole di utilizzo del servizio SafetyProSuite e diritti/doveri delle parti.',
    required: true,
    url: '/docs/legal/TERMINI_E_CONDIZIONI.md'
  },
  {
    id: 'privacy',
    title: 'Informativa sulla Privacy',
    description: 'Come trattiamo i tuoi dati personali secondo il GDPR.',
    required: true,
    url: '/docs/legal/PRIVACY_POLICY.md'
  },
  {
    id: 'cookie',
    title: 'Cookie Policy',
    description: 'Informazioni sui cookie utilizzati dall\'applicazione.',
    required: true,
    url: '/docs/legal/COOKIE_POLICY.md'
  },
  {
    id: 'dpa',
    title: 'Accordo sul Trattamento dei Dati (DPA)',
    description: 'Accordo tra Titolare e Responsabile del trattamento ai sensi dell\'Art. 28 GDPR.',
    required: true,
    url: '/docs/legal/ACCORDO_TRATTAMENTO_DATI.md'
  }
];

interface LegalDocumentsAcceptanceProps {
  onAcceptAll: (accepted: boolean) => void;
  showValidationError?: boolean;
}

export const LegalDocumentsAcceptance = ({ onAcceptAll, showValidationError }: LegalDocumentsAcceptanceProps) => {
  const [acceptedDocuments, setAcceptedDocuments] = useState<Set<string>>(new Set());
  const [openDocument, setOpenDocument] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState<{ [key: string]: string }>({});

  const handleToggleAcceptance = (documentId: string, checked: boolean) => {
    const newAccepted = new Set(acceptedDocuments);
    if (checked) {
      newAccepted.add(documentId);
    } else {
      newAccepted.delete(documentId);
    }
    setAcceptedDocuments(newAccepted);

    // Check if all required documents are accepted
    const allRequiredAccepted = legalDocuments
      .filter(doc => doc.required)
      .every(doc => newAccepted.has(doc.id));

    onAcceptAll(allRequiredAccepted);
  };

  const loadDocumentContent = async (doc: LegalDocument) => {
    if (documentContent[doc.id]) {
      return; // Already loaded
    }

    if (doc.url) {
      try {
        const response = await fetch(doc.url);
        const text = await response.text();
        setDocumentContent(prev => ({ ...prev, [doc.id]: text }));
      } catch (error) {
        console.error(`Failed to load document ${doc.id}:`, error);
        setDocumentContent(prev => ({
          ...prev,
          [doc.id]: '# Errore\n\nImpossibile caricare il documento. Si prega di contattare il supporto.'
        }));
      }
    }
  };

  const handleOpenDocument = (doc: LegalDocument) => {
    setOpenDocument(doc.id);
    loadDocumentContent(doc);
  };

  const allRequiredAccepted = legalDocuments
    .filter(doc => doc.required)
    .every(doc => acceptedDocuments.has(doc.id));

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {legalDocuments.map((doc) => (
          <div key={doc.id} className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <Checkbox
              id={doc.id}
              checked={acceptedDocuments.has(doc.id)}
              onCheckedChange={(checked) => handleToggleAcceptance(doc.id, checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <label
                htmlFor={doc.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {doc.title}
                {doc.required && <span className="text-destructive ml-1">*</span>}
              </label>
              <p className="text-sm text-muted-foreground">
                {doc.description}
              </p>
            </div>
            <Dialog open={openDocument === doc.id} onOpenChange={(open) => !open && setOpenDocument(null)}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDocument(doc)}
                  className="shrink-0"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Leggi
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>{doc.title}</DialogTitle>
                  <DialogDescription>{doc.description}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                  {documentContent[doc.id] ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownRenderer content={documentContent[doc.id]} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                </ScrollArea>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant={acceptedDocuments.has(doc.id) ? "secondary" : "default"}
                    onClick={() => {
                      handleToggleAcceptance(doc.id, true);
                      setOpenDocument(null);
                    }}
                  >
                    {acceptedDocuments.has(doc.id) ? 'Già Accettato' : 'Accetto'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>

      {showValidationError && !allRequiredAccepted && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Devi accettare tutti i documenti obbligatori (contrassegnati con *) per procedere con la registrazione.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>* Documenti obbligatori - L'accettazione è necessaria per utilizzare il servizio.</p>
        <p>
          Registrandoti, confermi di aver letto, compreso e accettato tutti i documenti legali sopra elencati.
        </p>
      </div>
    </div>
  );
};

export default LegalDocumentsAcceptance;
