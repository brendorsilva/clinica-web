import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  User as UserIcon,
  Shield,
  Mail,
  Edit,
  Trash2,
} from "lucide-react";
import { MainLayout } from "../components/layout/MainLayout";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { userService, User } from "../services/user-service";
import { UserModal } from "../components/modals/UserModal";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { AxiosError } from "axios";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      toast.error("Erro ao carregar usuários.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSave = async (data: any) => {
    try {
      if (selectedUser) {
        await userService.update(selectedUser.id, data);
        toast.success("Usuário atualizado!");
      } else {
        await userService.create(data);
        toast.success("Usuário criado!");
      }
      fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        const displayMessage = Array.isArray(backendMessage)
          ? backendMessage.join("\n")
          : backendMessage;
        toast.error(displayMessage, {
          duration: 5000,
          style: { whiteSpace: "pre-line" },
        });
      } else {
        toast.error("Erro ao salvar usuário.");
      }
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await userService.delete(userToDelete.id);
      toast.success("Usuário removido.");
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao remover usuário.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-500/15 text-purple-700 hover:bg-purple-500/25 border-purple-200">
            Admin
          </Badge>
        );
      case "manager":
        return (
          <Badge className="bg-orange-500/15 text-orange-700 hover:bg-orange-500/25 border-orange-200">
            Gerente
          </Badge>
        );
      case "financial":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">
            Financeiro
          </Badge>
        );
      case "doctor":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200">
            Médico
          </Badge>
        );
      case "receptionist":
        return (
          <Badge
            variant="secondary"
            className="bg-gray-500/15 text-gray-700 border-gray-200"
          >
            Recepcionista
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const columns = [
    {
      key: "name",
      header: "Usuário",
      cell: (user: User) => (
        <div className="flex items-center gap-2">
          <div className="bg-muted p-2 rounded-full">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-medium">{user.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "E-mail",
      cell: (user: User) => (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Mail className="h-3.5 w-3.5" />
          {user.email}
        </div>
      ),
    },
    {
      key: "role",
      header: "Permissão",
      cell: (user: User) => getRoleBadge(user.role),
    },
    {
      key: "actions",
      header: "Ações",
      cell: (user: User) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedUser(user);
              setIsModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              setUserToDelete(user);
              setIsDeleteModalOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout title="Usuários" subtitle="Gerencie o acesso ao sistema">
      <div className="page-header">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedUser(undefined);
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Carregando...</div>
      ) : (
        <DataTable data={filteredUsers} columns={columns} />
      )}

      <UserModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        user={selectedUser}
      />

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação removerá o acesso de{" "}
              <span className="font-bold">{userToDelete?.name}</span> ao
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
