import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Search, Phone, Mail, Edit, Trash2 } from "lucide-react";
import { MainLayout } from "../components/layout/MainLayout";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import type { Patient } from "../types/clinic";
import { PatientModal } from "../components/modals/PatientModal";
import { useNotificationActions } from "../hooks/useNotificationActions";
import { patientService } from "../services/patient-service";
import { toast } from "sonner";

// --- NOVOS IMPORTS DO ALERT DIALOG ---
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

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("");

  // Modal de Criação/Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(
    undefined,
  );

  // Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { notifyPatientCreated } = useNotificationActions();

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar pacientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.cpf.includes(searchTerm),
  );

  const handleOpenCreateModal = () => {
    setSelectedPatient(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleSave = async (patientData: Omit<Patient, "id" | "createdAt">) => {
    try {
      if (selectedPatient) {
        await patientService.update(selectedPatient.id, patientData);
        toast.success("Paciente atualizado com sucesso!");
      } else {
        await patientService.create(patientData);
        notifyPatientCreated(patientData.name);
        toast.success("Paciente cadastrado com sucesso!");
      }

      await fetchPatients();
      setIsModalOpen(false);
      setSelectedPatient(undefined);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar paciente.");
    }
  };

  // 1. Abre o modal de confirmação
  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  };

  // 2. Executa a exclusão de fato
  const confirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      await patientService.delete(patientToDelete.id);
      toast.success("Paciente excluído com sucesso.");
      await fetchPatients();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir paciente.");
    } finally {
      setIsDeleteModalOpen(false);
      setPatientToDelete(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Paciente",
      cell: (patient: Patient) => (
        <div>
          <p className="font-medium text-foreground">{patient.name}</p>
          <p className="text-sm text-muted-foreground">{patient.cpf}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contato",
      cell: (patient: Patient) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {patient.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            {patient.email}
          </div>
        </div>
      ),
    },
    {
      key: "birthDate",
      header: "Data Nasc.",
      cell: (patient: Patient) => (
        <span className="text-muted-foreground">
          {new Date(patient.birthDate).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })}
        </span>
      ),
    },
    {
      key: "healthInsurance",
      header: "Convênio",
      cell: (patient: Patient) =>
        patient.healthInsurance ? (
          <Badge variant="outline" className="badge-primary">
            {patient.healthInsurance}
          </Badge>
        ) : (
          <span className="text-muted-foreground">Particular</span>
        ),
    },
    {
      key: "actions",
      header: "Ações",
      cell: (patient: Patient) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => handleOpenEditModal(patient)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            // Alterado para chamar o modal
            onClick={() => handleDeleteClick(patient)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout title="Pacientes" subtitle="Gerencie os pacientes da clínica">
      <div className="page-header">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 pl-9"
          />
        </div>
        <Button onClick={handleOpenCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Carregando...</div>
      ) : (
        <DataTable data={filteredPatients} columns={columns} />
      )}

      {/* Modal de Criação/Edição */}
      <PatientModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        patient={selectedPatient}
      />

      {/* NOVO: Modal de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o
              paciente
              <span className="font-semibold text-foreground">
                {" "}
                {patientToDelete?.name}{" "}
              </span>
              e removerá seus dados dos nossos servidores.
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
