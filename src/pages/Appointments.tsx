import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MainLayout } from "../components/layout/MainLayout";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import type { Appointment } from "../types/clinic";
import { AppointmentModal } from "../components/modals/AppointmentModal";
import { appointmentService } from "../services/appointment-service";
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

export default function Appointments() {
  // Filtros
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0],
  ); // Começa com HOJE
  const [searchTerm, setSearchTerm] = useState("");

  // Dados
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<
    Appointment | undefined
  >(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      // Aqui poderíamos passar dateFilter como startDate e endDate para filtrar no backend
      // Por enquanto, vamos pegar tudo e filtrar no front se quiser, ou usar o filtro:
      // const data = await appointmentService.getAll(dateFilter, dateFilter); (Para pegar só do dia)

      // Vamos pegar TUDO por enquanto para ver a lista cheia:
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []); // Se quiser recarregar ao mudar data: [dateFilter]

  // Lógica de Filtro no Frontend (Data + Busca)
  const filteredAppointments = appointments.filter((app) => {
    const appDate = new Date(app.date).toISOString().split("T")[0];
    const matchDate = !dateFilter || appDate === dateFilter; // Se tiver filtro de data, usa. Se vazio, mostra tudo.

    const matchSearch =
      app.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.doctor?.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchDate && matchSearch;
  });

  const handleSave = async (data: any) => {
    try {
      if (selectedAppointment) {
        await appointmentService.update(selectedAppointment.id, data);
        toast.success("Agendamento atualizado!");
      } else {
        await appointmentService.create(data);
        toast.success("Agendamento criado!");
      }
      await fetchAppointments();
      setIsModalOpen(false);
      setSelectedAppointment(undefined);
    } catch (error) {
      console.error(error);
      toast.error(
        "Erro ao salvar. Verifique se o paciente e médico estão ativos.",
      );
    }
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;
    try {
      await appointmentService.delete(appointmentToDelete.id);
      toast.success("Agendamento removido.");
      await fetchAppointments();
    } catch (error) {
      toast.error("Erro ao remover agendamento.");
    } finally {
      setIsDeleteModalOpen(false);
      setAppointmentToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "completed":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200"; // scheduled
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      default:
        return "Agendado";
    }
  };

  const columns = [
    {
      key: "time",
      header: "Horário",
      cell: (app: Appointment) => (
        <div className="flex flex-col">
          <div className="flex items-center font-bold text-foreground">
            <Clock className="mr-1 h-3.5 w-3.5" />
            {app.time}
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(app.date), "dd/MM", { locale: ptBR })}
          </span>
        </div>
      ),
    },
    {
      key: "patient",
      header: "Paciente",
      cell: (app: Appointment) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {app.patient?.name || "Desconhecido"}
          </span>
        </div>
      ),
    },
    {
      key: "doctor",
      header: "Médico",
      cell: (app: Appointment) => (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Stethoscope className="h-3.5 w-3.5" />
          <span>{app.doctor?.name || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "service",
      header: "Procedimento",
      cell: (app: Appointment) => (
        <span className="text-sm">{app.service?.name}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (app: Appointment) => (
        <Badge variant="outline" className={getStatusColor(app.status)}>
          {getStatusLabel(app.status)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      cell: (app: Appointment) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedAppointment(app);
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
              setAppointmentToDelete(app);
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
    <MainLayout
      title="Agendamentos"
      subtitle="Agenda de consultas e procedimentos"
    >
      <div className="page-header flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Filtro de Data */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <Calendar className="h-4 w-4" />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 w-40"
            />
          </div>

          {/* Busca Texto */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente ou médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setDateFilter("")} // Limpar filtro de data
            className="text-xs"
          >
            Ver Todos
          </Button>
        </div>

        <Button
          onClick={() => {
            setSelectedAppointment(undefined);
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Carregando agenda...</div>
      ) : (
        <DataTable data={filteredAppointments} columns={columns} />
      )}

      <AppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        appointment={selectedAppointment}
      />

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá permanentemente o agendamento do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
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
