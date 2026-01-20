import { useState } from 'react';
import { Plus, Search, Phone, Mail } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { mockDoctors } from '../data/mockData';
import type { Doctor } from '../types/clinic';
import { DoctorModal } from '../components/modals/DoctorModal';
import { useNotificationActions } from '../hooks/useNotificationActions';

export default function Doctors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctors, setDoctors] = useState(mockDoctors);
  const { notifyDoctorCreated } = useNotificationActions();

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.crm.includes(searchTerm)
  );

  const handleSave = (doctorData: Omit<Doctor, 'id' | 'createdAt'>) => {
    const newDoctor: Doctor = {
      ...doctorData,
      id: String(Date.now()),
      createdAt: new Date(),
    };
    setDoctors([...doctors, newDoctor]);
    notifyDoctorCreated(doctorData.name, doctorData.specialty);
  };

  const columns = [
    {
      key: 'name',
      header: 'Médico',
      cell: (doctor: Doctor) => (
        <div>
          <p className="font-medium text-foreground">{doctor.name}</p>
          <p className="text-sm text-muted-foreground">CRM: {doctor.crm}</p>
        </div>
      ),
    },
    {
      key: 'specialty',
      header: 'Especialidade',
      cell: (doctor: Doctor) => (
        <Badge variant="outline" className="badge-primary">
          {doctor.specialty}
        </Badge>
      ),
    },
    {
      key: 'contact',
      header: 'Contato',
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
      key: 'status',
      header: 'Status',
      cell: (doctor: Doctor) => (
        <Badge
          variant="outline"
          className={doctor.status === 'active' ? 'badge-success' : 'badge-destructive'}
        >
          {doctor.status === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
  ];

  return (
    <MainLayout title="Médicos" subtitle="Gerencie os médicos da clínica">
      <div className="page-header">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, especialidade ou CRM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 pl-9"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Médico
        </Button>
      </div>

      <DataTable data={filteredDoctors} columns={columns} />

      <DoctorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
      />
    </MainLayout>
  );
}
