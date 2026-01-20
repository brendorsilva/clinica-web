import { Building2, Bell, Shield, Palette, Database, Globe, Volume2, Mail } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useNotifications } from '../contexts/NotificationContext';
import { toast } from '../hooks/use-toast';

const settingsSections = [
  {
    icon: Building2,
    title: 'Dados da Clínica',
    description: 'Informações gerais da clínica',
  },
  {
    icon: Bell,
    title: 'Notificações',
    description: 'Configure alertas e lembretes',
  },
  {
    icon: Shield,
    title: 'Segurança',
    description: 'Configurações de acesso e privacidade',
  },
  {
    icon: Palette,
    title: 'Aparência',
    description: 'Personalize a interface',
  },
  {
    icon: Database,
    title: 'Backup',
    description: 'Backup e restauração de dados',
  },
  {
    icon: Globe,
    title: 'Integrações',
    description: 'Conecte serviços externos',
  },
];

export default function Settings() {
  const { settings, updateSettings } = useNotifications();

  const handleSaveClinicData = () => {
    toast({
      title: 'Dados salvos',
      description: 'As informações da clínica foram atualizadas com sucesso.',
    });
  };

  return (
    <MainLayout title="Configurações" subtitle="Personalize o sistema">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="space-y-2">
          {settingsSections.map((section) => (
            <div
              key={section.title}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{section.title}</p>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Clinic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Dados da Clínica</CardTitle>
              <CardDescription>Informações básicas sobre sua clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Nome da Clínica</Label>
                  <Input id="clinicName" defaultValue="CliniControl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" defaultValue="12.345.678/0001-90" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" defaultValue="(11) 3456-7890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue="contato@clinica.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" defaultValue="Av. Paulista, 1000 - São Paulo, SP" />
              </div>
              <Button onClick={handleSaveClinicData}>Salvar Alterações</Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>Configure como você deseja ser notificado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* In-App Notifications */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Notificações no Sistema</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Lembrete de Consultas</p>
                    <p className="text-sm text-muted-foreground">Enviar lembrete 24h antes</p>
                  </div>
                  <Switch 
                    checked={settings.appointmentReminders}
                    onCheckedChange={(checked) => updateSettings({ appointmentReminders: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Contas Vencidas</p>
                    <p className="text-sm text-muted-foreground">Alertar sobre pagamentos pendentes</p>
                  </div>
                  <Switch 
                    checked={settings.overduePayments}
                    onCheckedChange={(checked) => updateSettings({ overduePayments: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Novos Agendamentos</p>
                    <p className="text-sm text-muted-foreground">Notificar quando houver novo agendamento</p>
                  </div>
                  <Switch 
                    checked={settings.newAppointments}
                    onCheckedChange={(checked) => updateSettings({ newAppointments: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Alertas do Sistema</p>
                    <p className="text-sm text-muted-foreground">Notificações sobre eventos importantes</p>
                  </div>
                  <Switch 
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) => updateSettings({ systemAlerts: checked })}
                  />
                </div>
              </div>

              {/* Sound & Email */}
              <div className="pt-4 border-t border-border space-y-4">
                <h4 className="text-sm font-medium text-foreground">Preferências</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Som de Notificação</p>
                      <p className="text-sm text-muted-foreground">Tocar som ao receber notificação</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Notificações por Email</p>
                      <p className="text-sm text-muted-foreground">Receber resumo diário por email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
