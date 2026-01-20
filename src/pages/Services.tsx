import { useState } from 'react';
import { Plus, Search, Clock } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { mockServices } from '../data/mockData';
import type { Service } from '../types/clinic';
import { ServiceModal } from '../components/modals/ServiceModal';
import { useNotificationActions } from '../hooks/useNotificationActions';

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState(mockServices);
  const { notifyServiceCreated } = useNotificationActions();

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: String(Date.now()),
    };
    setServices([...services, newService]);
    notifyServiceCreated(serviceData.name);
  };

  const columns = [
    {
      key: 'name',
      header: 'Serviço',
      cell: (service: Service) => (
        <div>
          <p className="font-medium text-foreground">{service.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      cell: (service: Service) => (
        <Badge variant="outline" className="badge-primary">
          {service.category}
        </Badge>
      ),
    },
    {
      key: 'duration',
      header: 'Duração',
      cell: (service: Service) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          {service.duration} min
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Valor',
      cell: (service: Service) => (
        <span className="font-semibold text-foreground">
          R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (service: Service) => (
        <Badge
          variant="outline"
          className={service.status === 'active' ? 'badge-success' : 'badge-destructive'}
        >
          {service.status === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
  ];

  return (
    <MainLayout title="Serviços" subtitle="Gerencie os serviços oferecidos">
      <div className="page-header">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 pl-9"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <DataTable data={filteredServices} columns={columns} />

      <ServiceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
      />
    </MainLayout>
  );
}
