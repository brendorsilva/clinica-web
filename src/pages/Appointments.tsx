import { useState } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Search, Calendar as CalendarIcon, User, Filter, Edit } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockAppointments, mockBankAccounts } from '@/data/mockData';
import { Appointment, CashMovement, BankMovement } from '@/types/clinic';
import { AppointmentModal } from '@/components/modals/AppointmentModal';
import { AppointmentStatusModal } from '@/components/modals/AppointmentStatusModal';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusConfig = {
  scheduled: { label: 'Agendado', className: 'badge-primary' },
  confirmed: { label: 'Confirmado', className: 'badge-success' },
  completed: { label: 'Concluído', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelado', className: 'badge-destructive' },
};

type PaymentMethod = 'cash' | 'pix' | 'credit_card' | 'debit_card';

export default function Appointments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));
  const [statusFilter, setStatusFilter] = useState<Appointment['status'] | 'all'>('all');
  const { notifyAppointmentCreated, notifyCashMovement, notifyBankMovement } = useNotificationActions();

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

    const appointmentDate = typeof appointment.date === 'string' 
      ? parseISO(appointment.date) 
      : appointment.date;

    const matchesDateRange =
      startDate && endDate
        ? isWithinInterval(appointmentDate, { start: startDate, end: endDate })
        : true;

    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

    return matchesSearch && matchesDateRange && matchesStatus;
  });

  const handleSave = (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: String(Date.now()),
    };
    setAppointments([...appointments, newAppointment]);
    notifyAppointmentCreated(
      appointmentData.patientName,
      format(appointmentData.date, 'dd/MM/yyyy'),
      appointmentData.time
    );
  };

  const handleStatusChange = (
    appointmentId: string,
    newStatus: Appointment['status'],
    paymentData?: {
      paymentMethod: PaymentMethod;
      bankAccountId?: string;
    }
  ) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return;

    // Atualiza o status do agendamento
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
    );

    // Se foi concluído com pagamento, registra a movimentação
    if (newStatus === 'completed' && paymentData) {
      const paymentMethodLabels: Record<PaymentMethod, string> = {
        cash: 'Dinheiro',
        pix: 'PIX',
        credit_card: 'Cartão de Crédito',
        debit_card: 'Cartão de Débito',
      };

      if (paymentData.paymentMethod === 'cash') {
        // Adiciona ao caixa
        const cashMovement: CashMovement = {
          id: String(Date.now()),
          type: 'income',
          description: `Consulta - ${appointment.patientName}`,
          amount: appointment.price,
          date: new Date(),
          category: 'Consultas',
          paymentMethod: 'cash',
        };
        console.log('Movimentação de caixa criada:', cashMovement);
        notifyCashMovement('income', `Consulta - ${appointment.patientName}`, appointment.price);
        toast.success('Valor adicionado ao caixa');
      } else if (paymentData.bankAccountId) {
        // PIX, Cartão de Crédito ou Débito - adiciona à conta bancária
        const bankAccount = mockBankAccounts.find((b) => b.id === paymentData.bankAccountId);
        const bankMovement: BankMovement = {
          id: String(Date.now()),
          accountId: paymentData.bankAccountId,
          type: 'credit',
          description: `Consulta (${paymentMethodLabels[paymentData.paymentMethod]}) - ${appointment.patientName}`,
          amount: appointment.price,
          date: new Date(),
          category: 'Consultas',
        };
        console.log('Movimentação bancária criada:', bankMovement);
        if (bankAccount) {
          notifyBankMovement(bankAccount.name, 'credit', appointment.price);
        }
        toast.success(`Valor creditado via ${paymentMethodLabels[paymentData.paymentMethod]}`);
      }
    }

    toast.success(`Status alterado para ${statusConfig[newStatus].label}`);
  };

  const handleOpenStatusModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsStatusModalOpen(true);
  };

  const columns = [
    {
      key: 'dateTime',
      header: 'Data/Hora',
      cell: (appointment: Appointment) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {format(appointment.date, "dd 'de' MMM", { locale: ptBR })}
            </p>
            <p className="text-sm text-muted-foreground">{appointment.time}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'patient',
      header: 'Paciente',
      cell: (appointment: Appointment) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{appointment.patientName}</span>
        </div>
      ),
    },
    {
      key: 'doctor',
      header: 'Médico',
      cell: (appointment: Appointment) => (
        <span className="text-muted-foreground">{appointment.doctorName}</span>
      ),
    },
    {
      key: 'service',
      header: 'Serviço',
      cell: (appointment: Appointment) => (
        <span className="text-muted-foreground">{appointment.serviceName}</span>
      ),
    },
    {
      key: 'price',
      header: 'Valor',
      cell: (appointment: Appointment) => (
        <span className="font-semibold text-foreground">
          R$ {appointment.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (appointment: Appointment) => (
        <Badge variant="outline" className={cn(statusConfig[appointment.status].className)}>
          {statusConfig[appointment.status].label}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      cell: (appointment: Appointment) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenStatusModal(appointment)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const clearFilters = () => {
    setStartDate(startOfMonth(new Date()));
    setEndDate(endOfMonth(new Date()));
    setSearchTerm('');
    setStatusFilter('all');
  };

  return (
    <MainLayout title="Agendamentos" subtitle="Gerencie os agendamentos da clínica">
      <div className="flex flex-col gap-4">
        <div className="page-header">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente ou médico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[160px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <span className="text-muted-foreground">até</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[160px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Select value={statusFilter} onValueChange={(value: Appointment['status'] | 'all') => setStatusFilter(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar
              </Button>
            </div>
          </div>
          
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <DataTable data={filteredAppointments} columns={columns} />

      <AppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
      />

      <AppointmentStatusModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        appointment={selectedAppointment}
        onSave={handleStatusChange}
      />
    </MainLayout>
  );
}
