import { Link } from 'react-router-dom';
import { Calendar, UserPlus, Receipt, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/button';

const actions = [
  {
    label: 'Novo Agendamento',
    icon: Calendar,
    href: '/appointments',
    variant: 'default' as const,
  },
  {
    label: 'Novo Paciente',
    icon: UserPlus,
    href: '/patients',
    variant: 'outline' as const,
  },
  {
    label: 'Lançar Receita',
    icon: Receipt,
    href: '/financial/receivables',
    variant: 'outline' as const,
  },
  {
    label: 'Lançar Despesa',
    icon: CreditCard,
    href: '/financial/payables',
    variant: 'outline' as const,
  },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            asChild
            className="h-auto flex-col gap-2 py-4"
          >
            <Link to={action.href}>
              <action.icon className="h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
