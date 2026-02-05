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
  Filter,
  X,
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

// Imports do Select para o filtro de Status
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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
  // --- NOVOS ESTADOS DE FILTRO ---
  // Inicializa com a data de HOJE para ambos, para mostrar o dia atual por padrão
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Dados e Loading
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

  // Busca dados no Backend (Considerando o Range de Datas)
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      // Passamos as datas para a API filtrar no banco de dados
      const data = await appointmentService.getAll(startDate, endDate);
      setAppointments(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setIsLoading(false);
    }
  };

  // Recarrega sempre que mudar o intervalo de datas
  useEffect(() => {
    fetchAppointments();
  }, [startDate, endDate]);

  // Lógica de Filtro Local (Status + Busca por Texto)
  const filteredAppointments = appointments.filter((app) => {
    // 1. Filtro de Status
    const matchStatus = statusFilter === "all" || app.status === statusFilter;

    // 2. Filtro de Texto (Paciente ou Médico)
    const matchSearch =
      (app.patient?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.doctor?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchSearch;
  });

  const handleClearFilters = () => {
    setStartDate(today);
    setEndDate(today);
    setStatusFilter("all");
    setSearchTerm("");
  };

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
      toast.error("Erro ao salvar. Verifique os dados.");
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
            {new Date(app.date).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
              day: "2-digit",
              month: "2-digit",
            })}
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
      {/* Barra de Ferramentas / Filtros */}
      <div className="page-header flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-wrap">
          {/* Grupo de Datas */}
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-45">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none bg-background px-1">
                De
              </span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-12"
              />
            </div>
            <div className="relative flex-1 md:w-45">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none bg-background px-1">
                Até
              </span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>

          {/* Filtro de Status */}
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="scheduled">📅 Agendados</SelectItem>
                <SelectItem value="confirmed">✅ Confirmados</SelectItem>
                <SelectItem value="completed">🏁 Concluídos</SelectItem>
                <SelectItem value="cancelled">🚫 Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Busca Texto */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente ou médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Botão Limpar Filtros */}
          {(searchTerm ||
            statusFilter !== "all" ||
            startDate !== today ||
            endDate !== today) && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="text-muted-foreground hover:text-foreground px-2"
              title="Limpar filtros"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
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
        // Se criar um novo agendamento, usa a data inicial do filtro como sugestão
        selectedDate={new Date(startDate)}
      />

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? Isso removerá permanentemente este agendamento. Se o
              paciente apenas desistiu, considere mudar o status para{" "}
              <span className="font-bold">Cancelado</span>.
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
