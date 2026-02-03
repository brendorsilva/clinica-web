import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Tag,
  DollarSign,
  Filter,
} from "lucide-react";
import { MainLayout } from "../components/layout/MainLayout";
import { DataTable } from "../components/ui/data-table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import type { Service } from "../types/clinic";
import { ServiceModal } from "../components/modals/ServiceModal";
import { servicesService } from "../services/services-service";
import { toast } from "sonner";

// Import components de Select para os filtros
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

export default function Services() {
  // --- ESTADOS DE FILTRO ---
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Estados de Dados e Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>(
    undefined,
  );
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await servicesService.getAll();
      setServicesData(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar serviços");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // --- LÓGICA DE FILTRAGEM AVANÇADA ---
  const filteredServices = servicesData.filter((service) => {
    // 1. Filtro por Texto (Nome)
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // 2. Filtro por Categoria
    const matchesCategory =
      categoryFilter === "all" || service.category === categoryFilter;

    // 3. Filtro por Status
    const matchesStatus =
      statusFilter === "all" || service.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenCreateModal = () => {
    setSelectedService(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (selectedService) {
        await servicesService.update(selectedService.id, data);
        toast.success("Serviço atualizado!");
      } else {
        await servicesService.create(data);
        toast.success("Serviço criado!");
      }
      await fetchServices();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar serviço.");
    }
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await servicesService.delete(serviceToDelete.id);
      toast.success("Serviço removido.");
      await fetchServices();
    } catch (error) {
      toast.error("Erro ao remover serviço.");
    } finally {
      setIsDeleteModalOpen(false);
      setServiceToDelete(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Procedimento",
      cell: (service: Service) => (
        <div>
          <p className="font-medium text-foreground">{service.name}</p>
          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
            {service.description}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoria",
      cell: (service: Service) => (
        <Badge variant="outline" className="flex w-fit items-center gap-1">
          <Tag className="h-3 w-3" />
          {service.category}
        </Badge>
      ),
    },
    {
      key: "duration",
      header: "Duração",
      cell: (service: Service) => (
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-1 h-3.5 w-3.5" />
          {service.duration} min
        </div>
      ),
    },
    {
      key: "price",
      header: "Valor",
      cell: (service: Service) => (
        <div className="flex items-center font-medium text-foreground">
          <DollarSign className="mr-1 h-3.5 w-3.5 text-green-600" />
          {Number(service.price).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (service: Service) => (
        <Badge
          variant={service.status === "active" ? "default" : "secondary"}
          className={
            service.status === "active" ? "bg-green-500/10 text-green-700" : ""
          }
        >
          {service.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      cell: (service: Service) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEditModal(service)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => handleDeleteClick(service)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout title="Serviços" subtitle="Catálogo de procedimentos e exames">
      {/* Container do Cabeçalho e Filtros */}
      <div className="page-header flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* 1. Busca Texto */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 2. Filtro Categoria */}
          <div className="w-full sm:w-40">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Categoria" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Consulta">Consulta</SelectItem>
                <SelectItem value="Exame">Exame</SelectItem>
                <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                <SelectItem value="Estética">Estética</SelectItem>
                <SelectItem value="Retorno">Retorno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. Filtro Status */}
          <div className="w-full sm:w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
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

        {/* Botão Novo */}
        <Button onClick={handleOpenCreateModal} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Carregando...</div>
      ) : (
        <DataTable data={filteredServices} columns={columns} />
      )}

      <ServiceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        service={selectedService}
      />

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? Isso removerá o serviço{" "}
              <span className="font-bold">{serviceToDelete?.name}</span> do
              catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
