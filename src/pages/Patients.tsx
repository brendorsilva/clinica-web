import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Search, Phone, Mail } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { mockPatients } from '../data/mockData';
import type { Patient } from '../types/clinic';
import { PatientModal } from '../components/modals/PatientModal';
import { useNotificationActions } from '../hooks/useNotificationActions';

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patients, setPatients] = useState(mockPatients);
  const { notifyPatientCreated } = useNotificationActions();

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.cpf.includes(searchTerm)
  );

  const handleSave = (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: String(Date.now()),
      createdAt: new Date(),
    };
    setPatients([...patients, newPatient]);
    notifyPatientCreated(patientData.name);
  };

  const columns = [
    {
      key: 'name',
      header: 'Paciente',
      cell: (patient: Patient) => (
        <div>
          <p className="font-medium text-foreground">{patient.name}</p>
          <p className="text-sm text-muted-foreground">{patient.cpf}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contato',
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
      key: 'birthDate',
      header: 'Data Nasc.',
      cell: (patient: Patient) => (
        <span className="text-muted-foreground">
          {format(patient.birthDate, 'dd/MM/yyyy')}
        </span>
      ),
    },
    {
      key: 'healthInsurance',
      header: 'Convênio',
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
      key: 'createdAt',
      header: 'Cadastro',
      cell: (patient: Patient) => (
        <span className="text-muted-foreground">
          {format(patient.createdAt, 'dd/MM/yyyy')}
        </span>
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
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      <DataTable data={filteredPatients} columns={columns} />

      <PatientModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
      />
    </MainLayout>
  );
}
