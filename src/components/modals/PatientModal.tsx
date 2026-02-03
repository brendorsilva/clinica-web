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
import type { Patient } from "../../types/clinic";
import { toast } from "sonner";

interface PatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient; // Pode vir undefined (criação) ou preenchido (edição)
  onSave: (patient: Omit<Patient, "id" | "createdAt">) => void;
}

export function PatientModal({
  open,
  onOpenChange,
  patient,
  onSave,
}: PatientModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
    healthInsurance: "",
  });

  // Este useEffect garante que o formulário seja preenchido ou limpo
  // sempre que a propriedade 'patient' mudar ou o modal abrir.
  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || "",
        cpf: patient.cpf || "",
        // Ajuste para pegar a data corretamente do objeto Date ou string ISO
        birthDate: patient.birthDate
          ? new Date(patient.birthDate).toISOString().split("T")[0]
          : "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        healthInsurance: patient.healthInsurance || "",
      });
    } else {
      // Limpa o formulário se for um novo cadastro
      setFormData({
        name: "",
        cpf: "",
        birthDate: "",
        phone: "",
        email: "",
        address: "",
        healthInsurance: "",
      });
    }
  }, [patient, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.cpf || !formData.phone) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    onSave({
      ...formData,
      birthDate: new Date(formData.birthDate),
    });

    // O toast de sucesso agora deve ser tratado no componente pai (Patients.tsx)
    // ou mantemos aqui apenas o fechamento
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {patient ? "Editar Paciente" : "Novo Paciente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Digite o nome"
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) =>
                  setFormData({ ...formData, cpf: e.target.value })
                }
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone *</Label>
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
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="healthInsurance">Convênio</Label>
              <Input
                id="healthInsurance"
                value={formData.healthInsurance}
                onChange={(e) =>
                  setFormData({ ...formData, healthInsurance: e.target.value })
                }
                placeholder="Nome do convênio (opcional)"
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
