import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import type { User, UserRole } from '../../types/clinic';
import { toast } from 'sonner';

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSave: (user: Omit<User, 'id'>) => void;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'manager', label: 'Gerente' },
  { value: 'receptionist', label: 'Recepcionista' },
  { value: 'doctor', label: 'Médico' },
  { value: 'financial', label: 'Financeiro' },
];

const permissionOptions = [
  { value: 'patients', label: 'Pacientes' },
  { value: 'doctors', label: 'Médicos' },
  { value: 'services', label: 'Serviços' },
  { value: 'appointments', label: 'Agendamentos' },
  { value: 'financial', label: 'Financeiro' },
  { value: 'users', label: 'Usuários' },
  { value: 'settings', label: 'Configurações' },
];

export function UserModal({ open, onOpenChange, user, onSave }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'receptionist' as UserRole,
    status: user?.status || 'active' as 'active' | 'inactive',
    permissions: user?.permissions || [] as string[],
    password: '',
  });

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, permissions: [...formData.permissions, permission] });
    } else {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permission) });
    }
  };

  const handleRoleChange = (role: UserRole) => {
    let permissions: string[] = [];
    
    switch (role) {
      case 'admin':
        permissions = ['all'];
        break;
      case 'manager':
        permissions = ['patients', 'doctors', 'services', 'appointments', 'financial'];
        break;
      case 'receptionist':
        permissions = ['patients', 'appointments'];
        break;
      case 'doctor':
        permissions = ['patients', 'appointments'];
        break;
      case 'financial':
        permissions = ['financial', 'patients'];
        break;
    }
    
    setFormData({ ...formData, role, permissions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (!user && !formData.password) {
      toast.error('Senha é obrigatória para novos usuários');
      return;
    }

    onSave({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      permissions: formData.permissions,
    });
    
    toast.success(user ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do usuário"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            {!user && (
              <div className="col-span-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Senha de acesso"
                />
              </div>
            )}
            <div>
              <Label htmlFor="role">Perfil *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => handleRoleChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.role !== 'admin' && (
              <div className="col-span-2">
                <Label>Permissões</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {permissionOptions.map((permission) => (
                    <div key={permission.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.value}
                        checked={formData.permissions.includes(permission.value)}
                        onCheckedChange={(checked) => handlePermissionChange(permission.value, checked as boolean)}
                      />
                      <Label htmlFor={permission.value} className="text-sm font-normal cursor-pointer">
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
