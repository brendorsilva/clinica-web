import { useNotifications } from '../contexts/NotificationContext';

export function useNotificationActions() {
  const { addNotification, settings } = useNotifications();

  const notifyAppointmentCreated = (patientName: string, date: string, time: string) => {
    if (settings.newAppointments) {
      addNotification({
        title: 'Novo agendamento criado',
        message: `Consulta agendada para ${patientName} em ${date} às ${time}`,
        type: 'success',
        category: 'appointment',
      });
    }
  };

  const notifyAppointmentCancelled = (patientName: string) => {
    addNotification({
      title: 'Agendamento cancelado',
      message: `A consulta de ${patientName} foi cancelada`,
      type: 'warning',
      category: 'appointment',
    });
  };

  const notifyAppointmentConfirmed = (patientName: string, date: string) => {
    addNotification({
      title: 'Consulta confirmada',
      message: `${patientName} confirmou a consulta para ${date}`,
      type: 'success',
      category: 'appointment',
    });
  };

  const notifyPatientCreated = (patientName: string) => {
    addNotification({
      title: 'Novo paciente cadastrado',
      message: `${patientName} foi adicionado(a) ao sistema`,
      type: 'success',
      category: 'patient',
    });
  };

  const notifyDoctorCreated = (doctorName: string, specialty: string) => {
    addNotification({
      title: 'Novo médico cadastrado',
      message: `Dr(a). ${doctorName} - ${specialty} foi adicionado(a)`,
      type: 'success',
      category: 'doctor',
    });
  };

  const notifyServiceCreated = (serviceName: string) => {
    addNotification({
      title: 'Novo serviço cadastrado',
      message: `O serviço "${serviceName}" foi adicionado ao catálogo`,
      type: 'success',
      category: 'service',
    });
  };

  const notifyTransactionCreated = (type: 'receivable' | 'payable', description: string, amount: number) => {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);

    addNotification({
      title: type === 'receivable' ? 'Conta a receber criada' : 'Conta a pagar criada',
      message: `${description} - ${formattedAmount}`,
      type: 'info',
      category: 'financial',
    });
  };

  const notifyPaymentReceived = (description: string, amount: number) => {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);

    addNotification({
      title: 'Pagamento recebido',
      message: `${description} - ${formattedAmount}`,
      type: 'success',
      category: 'financial',
    });
  };

  const notifyOverduePayment = (description: string, daysOverdue: number) => {
    if (settings.overduePayments) {
      addNotification({
        title: 'Pagamento vencido',
        message: `${description} está vencido há ${daysOverdue} dias`,
        type: 'error',
        category: 'financial',
      });
    }
  };

  const notifyCashMovement = (type: 'income' | 'expense', description: string, amount: number) => {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);

    addNotification({
      title: type === 'income' ? 'Entrada no caixa' : 'Saída do caixa',
      message: `${description} - ${formattedAmount}`,
      type: type === 'income' ? 'success' : 'info',
      category: 'financial',
    });
  };

  const notifyBankMovement = (bankName: string, type: 'credit' | 'debit', amount: number) => {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);

    addNotification({
      title: type === 'credit' ? 'Crédito bancário' : 'Débito bancário',
      message: `${type === 'credit' ? 'Crédito' : 'Débito'} de ${formattedAmount} em ${bankName}`,
      type: type === 'credit' ? 'success' : 'info',
      category: 'financial',
    });
  };

  const notifyUserCreated = (userName: string, role: string) => {
    addNotification({
      title: 'Novo usuário criado',
      message: `${userName} foi adicionado como ${role}`,
      type: 'success',
      category: 'user',
    });
  };

  const notifySystemAlert = (title: string, message: string) => {
    if (settings.systemAlerts) {
      addNotification({
        title,
        message,
        type: 'warning',
        category: 'system',
      });
    }
  };

  return {
    notifyAppointmentCreated,
    notifyAppointmentCancelled,
    notifyAppointmentConfirmed,
    notifyPatientCreated,
    notifyDoctorCreated,
    notifyServiceCreated,
    notifyTransactionCreated,
    notifyPaymentReceived,
    notifyOverduePayment,
    notifyCashMovement,
    notifyBankMovement,
    notifyUserCreated,
    notifySystemAlert,
  };
}
