import { MainLayout } from '../components/layout/MainLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { AppointmentsList } from '../components/dashboard/AppointmentsList';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { QuickActions } from '../components/dashboard/QuickActions';
import { Calendar, Users, DollarSign, TrendingUp, Stethoscope, AlertCircle } from 'lucide-react';
import { dashboardStats, mockAppointments } from '../data/mockData';

export default function Dashboard() {
  return (
    <MainLayout 
      title="Dashboard" 
      subtitle="Visão geral da sua clínica"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Agendamentos Hoje"
          value={dashboardStats.todayAppointments}
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Pacientes Ativos"
          value={dashboardStats.activePatients}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Receita do Mês"
          value={`R$ ${dashboardStats.monthRevenue.toLocaleString('pt-BR')}`}
          icon={DollarSign}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="A Receber"
          value={`R$ ${dashboardStats.pendingReceivables.toLocaleString('pt-BR')}`}
          icon={TrendingUp}
          variant="warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
          
          {/* Mini Stats */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Status da Clínica</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Médicos Ativos</span>
                </div>
                <span className="text-lg font-semibold text-foreground">{dashboardStats.activeDoctors}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <AlertCircle className="h-5 w-5 text-warning" />
                  </div>
                  <span className="text-sm text-muted-foreground">Contas Vencidas</span>
                </div>
                <span className="text-lg font-semibold text-destructive">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom - Appointments List */}
        <div className="lg:col-span-3">
          <AppointmentsList appointments={mockAppointments} />
        </div>
      </div>
    </MainLayout>
  );
}
