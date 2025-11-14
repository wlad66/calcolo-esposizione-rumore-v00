import { useState, useEffect } from 'react';
import { Shield, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminUser {
  id: number;
  email: string;
  nome: string;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
  num_aziende: number;
  num_valutazioni_esposizione: number;
  num_valutazioni_dpi: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? '' : 'http://72.61.189.136');

const Admin = () => {
  const { user, token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Redirect se non è admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      toast({
        title: 'Accesso negato',
        description: 'Non hai i permessi per accedere a questa pagina',
        variant: 'destructive',
      });
    }
  }, [isAdmin, navigate]);

  // Carica lista utenti
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const error = await response.json();
        toast({
          title: 'Errore',
          description: error.detail || 'Impossibile caricare gli utenti',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Errore di connessione al server',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userToDelete: AdminUser) => {
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Utente eliminato',
          description: `${data.deleted_user.nome} (${data.deleted_user.email}) è stato eliminato con successo`,
        });
        loadUsers();
        setDeleteConfirm(null);
      } else {
        const error = await response.json();
        toast({
          title: 'Errore',
          description: error.detail || 'Impossibile eliminare l\'utente',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Errore di connessione al server',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Mai';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pannello Admin</h1>
              <p className="text-gray-600">Gestione utenti e dati</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla Home
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Totale Utenti</CardDescription>
              <CardTitle className="text-3xl">{users.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Amministratori</CardDescription>
              <CardTitle className="text-3xl">{users.filter(u => u.is_admin).length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Aziende Totali</CardDescription>
              <CardTitle className="text-3xl">
                {users.reduce((sum, u) => sum + u.num_aziende, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Utenti Registrati</CardTitle>
            <CardDescription>
              Lista completa degli utenti e dei loro dati
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Caricamento...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nessun utente registrato</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ruolo</TableHead>
                      <TableHead>Registrato</TableHead>
                      <TableHead>Ultimo Accesso</TableHead>
                      <TableHead className="text-center">Aziende</TableHead>
                      <TableHead className="text-center">Valutazioni</TableHead>
                      <TableHead className="text-center">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.nome}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          {u.is_admin ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Utente
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(u.created_at)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(u.last_login)}
                        </TableCell>
                        <TableCell className="text-center">{u.num_aziende}</TableCell>
                        <TableCell className="text-center">
                          {u.num_valutazioni_esposizione + u.num_valutazioni_dpi}
                        </TableCell>
                        <TableCell className="text-center">
                          {u.id === user?.id ? (
                            <span className="text-xs text-gray-400">Tu</span>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteConfirm(u)}
                              className="gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Elimina
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare l'utente <strong>{deleteConfirm?.nome}</strong> ({deleteConfirm?.email})?
              <br /><br />
              Questa azione eliminerà anche:
              <ul className="list-disc list-inside mt-2">
                <li>{deleteConfirm?.num_aziende || 0} aziende</li>
                <li>{deleteConfirm?.num_valutazioni_esposizione || 0} valutazioni esposizione</li>
                <li>{deleteConfirm?.num_valutazioni_dpi || 0} valutazioni DPI</li>
              </ul>
              <br />
              <strong className="text-red-600">Questa operazione è irreversibile!</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Eliminazione...' : 'Elimina definitivamente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
