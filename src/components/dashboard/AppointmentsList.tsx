import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import type { Appointment } from '../../types/clinic';
import { cn } from '../../lib/utils';

interface AppointmentsListProps {
  appointments: Appointment[];
}

const statusConfig = {
  scheduled: { label: 'Agendado', className: 'badge-primary' },
  confirmed: { label: 'Confirmado', className: 'badge-success' },
  completed: { label: 'Concluído', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelado', className: 'badge-destructive' },
};

export function AppointmentsList({ appointments }: AppointmentsListProps) {
  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">Agendamentos de Hoje</h3>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>
      <div className="divide-y divide-border">
        {appointments.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground">
            Nenhum agendamento para hoje
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">
                    {appointment.patientName}
                  </p>
                  <Badge variant="outline" className={cn('text-xs', statusConfig[appointment.status].className)}>
                    {statusConfig[appointment.status].label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {appointment.doctorName}
                  </span>
                  <span>{appointment.serviceName}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{appointment.time}</p>
                <p className="text-sm text-muted-foreground">
                  R$ {appointment.price.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
