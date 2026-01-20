import { useState } from 'react';
import { Plus, Search, Shield, Mail } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import type { User, UserRole } from '../types/clinic';
import { UserModal } from '../components/modals/UserModal';
import { useNotificationActions } from '../hooks/useNotificationActions';
import { cn } from '../lib/utils';

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@clinica.com',
    role: 'admin',
    status: 'active',
    permissions: ['all'],
  },
  {
    id: '2',
    name: 'Maria Gerente',
    email: 'maria@clinica.com',
    role: 'manager',
    status: 'active',
    permissions: ['patients', 'appointments', 'financial'],
  },
  {
    id: '3',
    name: 'Ana Recepcionista',
    email: 'ana@clinica.com',
    role: 'receptionist',
    status: 'active',
    permissions: ['patients', 'appointments'],
  },
  {
    id: '4',
    name: 'Dr. Carlos Silva',
    email: 'carlos.silva@clinica.com',
    role: 'doctor',
    status: 'active',
    permissions: ['patients', 'appointments'],
  },
];

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  admin: { label: 'Administrador', className: 'bg-destructive/15 text-destructive border-destructive/20' },
  manager: { label: 'Gerente', className: 'badge-primary' },
  receptionist: { label: 'Recepcionista', className: 'badge-success' },
  doctor: { label: 'Médico', className: 'badge-warning' },
  financial: { label: 'Financeiro', className: 'bg-accent/15 text-accent-foreground border-accent/20' },
};

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState(initialUsers);
  const { notifyUserCreated } = useNotificationActions();

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: String(Date.now()),
    };
    setUsers([...users, newUser]);
    notifyUserCreated(userData.name, roleConfig[userData.role].label);
  };

  const columns = [
    {
      key: 'name',
      header: 'Usuário',
      cell: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="text-sm font-medium text-primary">
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{user.name}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Perfil',
      cell: (user: User) => (
        <Badge variant="outline" className={cn(roleConfig[user.role].className)}>
          <Shield className="mr-1 h-3 w-3" />
          {roleConfig[user.role].label}
        </Badge>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissões',
      cell: (user: User) => (
        <div className="flex flex-wrap gap-1">
          {user.permissions.slice(0, 3).map((perm) => (
            <span
              key={perm}
              className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
            >
              {perm === 'all' ? 'Acesso Total' : perm}
            </span>
          ))}
          {user.permissions.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{user.permissions.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user: User) => (
        <Badge
          variant="outline"
          className={user.status === 'active' ? 'badge-success' : 'badge-destructive'}
        >
          {user.status === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
  ];

  return (
    <MainLayout title="Usuários" subtitle="Gerencie os usuários e permissões">
      <div className="page-header">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 pl-9"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <DataTable data={filteredUsers} columns={columns} />

      <UserModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
      />
    </MainLayout>
  );
}
