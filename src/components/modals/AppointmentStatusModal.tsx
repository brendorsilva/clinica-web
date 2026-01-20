import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Appointment, BankAccount } from '@/types/clinic';
import { mockBankAccounts } from '@/data/mockData';
import { toast } from 'sonner';

type PaymentMethod = 'cash' | 'pix' | 'credit_card' | 'debit_card';

interface AppointmentStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onSave: (
    appointmentId: string,
    newStatus: Appointment['status'],
    paymentData?: {
      paymentMethod: PaymentMethod;
      bankAccountId?: string;
    }
  ) => void;
}

const statusOptions: { value: Appointment['status']; label: string }[] = [
  { value: 'scheduled', label: 'Agendado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

export function AppointmentStatusModal({
  open,
  onOpenChange,
  appointment,
  onSave,
}: AppointmentStatusModalProps) {
  const [status, setStatus] = useState<Appointment['status']>('scheduled');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [bankAccounts] = useState<BankAccount[]>(mockBankAccounts);

  const requiresBankAccount = paymentMethod === 'pix' || paymentMethod === 'credit_card' || paymentMethod === 'debit_card';

  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status);
      setPaymentMethod('');
      setBankAccountId('');
    }
  }, [appointment]);

  const handleSave = () => {
    if (!appointment) return;

    // Se está marcando como concluído, exige forma de pagamento
    if (status === 'completed') {
      if (!paymentMethod) {
        toast.error('Selecione a forma de pagamento');
        return;
      }

      if (requiresBankAccount && !bankAccountId) {
        toast.error('Selecione a conta bancária');
        return;
      }

      onSave(appointment.id, status, {
        paymentMethod,
        bankAccountId: requiresBankAccount ? bankAccountId : undefined,
      });
    } else {
      onSave(appointment.id, status);
    }

    onOpenChange(false);
  };

  if (!appointment) return null;

  const showPaymentOptions = status === 'completed' && appointment.status !== 'completed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Status do Agendamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações do agendamento */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Paciente:</span>
              <span className="text-sm font-medium">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Médico:</span>
              <span className="text-sm font-medium">{appointment.doctorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Serviço:</span>
              <span className="text-sm font-medium">{appointment.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Data/Hora:</span>
              <span className="text-sm font-medium">
                {format(appointment.date, "dd/MM/yyyy", { locale: ptBR })} às {appointment.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valor:</span>
              <span className="text-sm font-semibold text-primary">
                R$ {appointment.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Seleção de status */}
          <div className="space-y-2">
            <Label>Novo Status</Label>
            <Select value={status} onValueChange={(value: Appointment['status']) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Opções de pagamento (apenas quando marca como concluído) */}
          {showPaymentOptions && (
            <>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro (Caixa)</SelectItem>
                    <SelectItem value="pix">PIX (Conta Bancária)</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  </SelectContent>
                </Select>
                {paymentMethod === 'cash' && (
                  <p className="text-xs text-muted-foreground">
                    O valor será adicionado ao caixa
                  </p>
                )}
              </div>

              {requiresBankAccount && (
                <div className="space-y-2">
                  <Label>Conta Bancária</Label>
                  <Select value={bankAccountId} onValueChange={setBankAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - {account.bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    O valor será creditado na conta selecionada
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
