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
// Importações do Select (Dropdown)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type { Doctor } from "../../types/clinic";
import { toast } from "sonner";

interface DoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor;
  onSave: (doctor: any) => void; // Usamos any aqui para facilitar o envio do status
}

export function DoctorModal({
  open,
  onOpenChange,
  doctor,
  onSave,
}: DoctorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    crm: "",
    phone: "",
    email: "",
    status: "active", // Valor padrão
  });

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || "",
        specialty: doctor.specialty || "",
        crm: doctor.crm || "",
        phone: doctor.phone || "",
        email: doctor.email || "",
        status: doctor.status || "active", // Carrega o status atual
      });
    } else {
      // Reset para criação (sempre ativo por padrão)
      setFormData({
        name: "",
        specialty: "",
        crm: "",
        phone: "",
        email: "",
        status: "active",
      });
    }
  }, [doctor, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.crm || !formData.specialty) {
      toast.error("Preencha os campos obrigatórios (*)");
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{doctor ? "Editar Médico" : "Novo Médico"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Status - SÓ APARECE NA EDIÇÃO */}
            {doctor && (
              <div className="col-span-2 bg-muted/30 p-3 rounded-md border border-border/50">
                <Label htmlFor="status" className="mb-2 block">
                  Situação do Cadastro
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status" className="bg-background">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <span className="flex items-center gap-2 text-green-600 font-medium">
                        ● Ativo (Visível na agenda)
                      </span>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        ● Inativo (Bloqueado)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Dr. João Silva"
              />
            </div>

            <div>
              <Label htmlFor="specialty">Especialidade *</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) =>
                  setFormData({ ...formData, specialty: e.target.value })
                }
                placeholder="Ex: Cardiologia"
              />
            </div>

            <div>
              <Label htmlFor="crm">CRM *</Label>
              <Input
                id="crm"
                value={formData.crm}
                onChange={(e) =>
                  setFormData({ ...formData, crm: e.target.value })
                }
                placeholder="00000/UF"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="medico@clinica.com"
              />
            </div>
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
