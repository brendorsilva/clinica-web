import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Edit,
  Trash2,
  Stethoscope,
  Filter,
} from "lucide-react";
import { MainLayout } from "../components/layout/MainLayout";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import type { Doctor } from "../types/clinic";
import { DoctorModal } from "../components/modals/DoctorModal";
import { doctorService } from "../services/doctor-service";
import { toast } from "sonner";

// Import do Select para o Filtro
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// Import do Alert Dialog
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

export default function Doctors() {
  const [searchTerm, setSearchTerm] = useState("");

  // NOVO: Estado do Filtro de Status ('all' | 'active' | 'inactive')
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>(
    undefined,
  );
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar médicos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Lógica de Filtragem Combinada (Busca + Status)
  const filteredDoctors = doctors.filter((doctor) => {
    // 1. Filtro de Texto
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.crm.includes(searchTerm);

    // 2. Filtro de Status
    const matchesStatus =
      statusFilter === "all" || // Se for 'all', aceita tudo
      doctor.status === statusFilter; // Se não, o status deve ser igual ao filtro

    return matchesSearch && matchesStatus;
  });

  const handleOpenCreateModal = () => {
    setSelectedDoctor(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleSave = async (doctorData: any) => {
    try {
      if (selectedDoctor) {
        await doctorService.update(selectedDoctor.id, doctorData);
        toast.success("Médico atualizado com sucesso!");
      } else {
        await doctorService.create(doctorData);
        toast.success("Médico cadastrado com sucesso!");
      }

      await fetchDoctors();
      setIsModalOpen(false);
      setSelectedDoctor(undefined);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar médico. Verifique CRM ou E-mail.");
    }
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete) return;

    try {
      await doctorService.delete(doctorToDelete.id);
      toast.success("Médico removido com sucesso.");
      await fetchDoctors();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover médico.");
    } finally {
      setIsDeleteModalOpen(false);
      setDoctorToDelete(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Médico",
      cell: (doctor: Doctor) => (
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{doctor.name}</p>
            <p className="text-sm text-muted-foreground">CRM: {doctor.crm}</p>
          </div>
        </div>
      ),
    },
    {
      key: "specialty",
      header: "Especialidade",
      cell: (doctor: Doctor) => (
        <Badge variant="secondary" className="font-normal">
          {doctor.specialty}
        </Badge>
      ),
    },
    {
      key: "contact",
      header: "Contato",
      cell: (doctor: Doctor) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {doctor.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            {doctor.email}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (doctor: Doctor) => (
        <Badge
          variant={doctor.status === "active" ? "default" : "secondary"}
          className={
            doctor.status === "active"
              ? "bg-green-500/10 text-green-700 hover:bg-green-500/20"
              : ""
          }
        >
          {doctor.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      cell: (doctor: Doctor) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => handleOpenEditModal(doctor)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => handleDeleteClick(doctor)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout title="Médicos" subtitle="Gerencie o corpo clínico">
      <div className="page-header flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Container de Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Busca por Texto */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CRM ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filtro Dropdown de Status */}
          <div className="w-full sm:w-[180px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filtrar status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Ativos
                  </span>
                </SelectItem>
                <SelectItem value="inactive">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gray-300" />
                    Inativos
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Médico
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Carregando...</div>
      ) : (
        <DataTable data={filteredDoctors} columns={columns} />
      )}

      <DoctorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        doctor={selectedDoctor}
      />

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Médico?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o(a){" "}
              <span className="font-bold">{doctorToDelete?.name}</span>?
              <br />
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
