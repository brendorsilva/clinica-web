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
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";

// Services para buscar as listas
import { patientService } from "../../services/patient-service";
import { doctorService } from "../../services/doctor-service";
import { servicesService } from "../../services/services-service";

import type { Appointment, Patient, Doctor, Service } from "../../types/clinic";

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment;
  onSave: (data: any) => void;
}

export function AppointmentModal({
  open,
  onOpenChange,
  appointment,
  onSave,
}: AppointmentModalProps) {
  // Listas para os Selects
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    serviceId: "",
    date: "",
    time: "09:00",
    notes: "",
    status: "scheduled",
  });

  // Carrega as listas de apoio ao abrir o modal
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        try {
          const [pts, docs, servs] = await Promise.all([
            patientService.getAll(),
            doctorService.getAll(),
            servicesService.getAll(),
          ]);
          setPatients(pts);
          setDoctors(docs);
          setServices(servs);
        } catch (error) {
          console.error(error);
          toast.error("Erro ao carregar listas de cadastro.");
        }
      };
      loadData();
    }
  }, [open]);

  // Preenche o formulário (Edição ou Criação)
  useEffect(() => {
    if (appointment) {
      // Modo Edição
      setFormData({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        serviceId: appointment.serviceId,
        // Backend manda ISO completo (yyyy-mm-ddThh:mm...), pegamos só a data
        date: new Date(appointment.date).toISOString().split("T")[0],
        time: appointment.time,
        notes: appointment.notes || "",
        status: appointment.status,
      });
    } else {
      // Modo Criação: Data de hoje
      setFormData({
        patientId: "",
        doctorId: "",
        serviceId: "",
        date: new Date().toISOString().split("T")[0],
        time: "09:00",
        notes: "",
        status: "scheduled",
      });
    }
  }, [appointment, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.patientId ||
      !formData.doctorId ||
      !formData.serviceId ||
      !formData.date ||
      !formData.time
    ) {
      toast.error("Preencha todos os campos obrigatórios (*)");
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Paciente */}
          <div className="col-span-2">
            <Label>Paciente *</Label>
            <Select
              value={formData.patientId}
              onValueChange={(val) =>
                setFormData({ ...formData, patientId: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} - CPF: {p.cpf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Médico */}
          <div className="col-span-1">
            <Label>Médico *</Label>
            <Select
              value={formData.doctorId}
              onValueChange={(val) =>
                setFormData({ ...formData, doctorId: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o médico..." />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Serviço */}
          <div className="col-span-1">
            <Label>Serviço/Procedimento *</Label>
            <Select
              value={formData.serviceId}
              onValueChange={(val) =>
                setFormData({ ...formData, serviceId: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o serviço..." />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} (R$ {Number(s.price).toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data e Hora */}
          <div>
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="time">Horário *</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
            />
          </div>

          {/* Status (Apenas na edição) */}
          {appointment && (
            <div className="col-span-2 bg-muted/30 p-2 rounded border border-border/50">
              <Label>Status do Agendamento</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData({ ...formData, status: val as any })
                }
              >
                <SelectTrigger className="mt-1 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">📅 Agendado</SelectItem>
                  <SelectItem value="confirmed">✅ Confirmado</SelectItem>
                  <SelectItem value="completed">
                    🏁 Concluído (Realizado)
                  </SelectItem>
                  <SelectItem value="cancelled">🚫 Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Observações */}
          <div className="col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Paciente relatou dores..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <DialogFooter className="col-span-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Agendar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
