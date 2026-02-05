import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner";
import type { User, UserRole } from "../../services/user-service";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSave: (data: any) => void;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrador (Acesso Total)" },
  { value: "manager", label: "Gerente" },
  { value: "receptionist", label: "Recepcionista" },
  { value: "doctor", label: "Médico" },
  { value: "financial", label: "Financeiro" },
];

const permissionOptions = [
  { value: "patients", label: "Pacientes" },
  { value: "doctors", label: "Médicos" },
  { value: "services", label: "Serviços" },
  { value: "appointments", label: "Agendamentos" },
  { value: "financial", label: "Financeiro" },
  { value: "users", label: "Usuários" },
  { value: "settings", label: "Configurações" },
];

export function UserModal({
  open,
  onOpenChange,
  user,
  onSave,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "receptionist" as UserRole,
    status: "active",
    permissions: [] as string[],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        status: user.status || "active",
        permissions: user.permissions || [],
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "receptionist",
        status: "active",
        permissions: ["patients", "appointments"],
      });
    }
  }, [user, open]);

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, permission],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => p !== permission),
      }));
    }
  };

  const handleRoleChange = (role: UserRole) => {
    let newPermissions: string[] = [];

    switch (role) {
      case "admin":
        newPermissions = ["all"];
        break;
      case "manager":
        newPermissions = [
          "patients",
          "doctors",
          "services",
          "appointments",
          "financial",
        ];
        break;
      case "receptionist":
        newPermissions = ["patients", "appointments"];
        break;
      case "doctor":
        newPermissions = ["patients", "appointments"];
        break;
      case "financial":
        newPermissions = ["financial", "patients"];
        break;
    }

    setFormData((prev) => ({ ...prev, role, permissions: newPermissions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Nome e E-mail são obrigatórios.");
      return;
    }

    if (!user) {
      if (!formData.password) {
        toast.error("Senha é obrigatória.");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("A senha deve ter no mínimo 6 caracteres.");
        return;
      }
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Nome */}
            <div className="col-span-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Maria Souza"
              />
            </div>

            {/* Email */}
            <div className="col-span-2">
              <Label htmlFor="email">E-mail de Acesso *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="maria@clinica.com"
              />
            </div>

            {/* Senha */}
            <div className="col-span-2">
              <Label htmlFor="password">
                {user ? "Nova Senha (Opcional)" : "Senha *"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={user ? "Deixe em branco para manter" : "******"}
              />
            </div>

            {/* Cargo */}
            <div>
              <Label htmlFor="role">Perfil / Cargo *</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => handleRoleChange(val as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue />
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

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permissões - Checkboxes */}
            {formData.role !== "admin" && (
              <div className="col-span-2 bg-muted/30 p-4 rounded-md border border-border/50 mt-2">
                <Label className="mb-3 block text-base">
                  Permissões de Acesso
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {permissionOptions.map((permission) => (
                    <div
                      key={permission.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={permission.value}
                        checked={formData.permissions.includes(
                          permission.value,
                        )}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            permission.value,
                            checked as boolean,
                          )
                        }
                      />
                      <Label
                        htmlFor={permission.value}
                        className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground"
                      >
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
