import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import type { BankAccount } from '../../types/clinic';
import { toast } from 'sonner';

interface BankAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: BankAccount;
  onSave: (account: Omit<BankAccount, 'id'>) => void;
}

const banks = [
  'Banco do Brasil',
  'Bradesco',
  'Caixa Econômica',
  'Itaú',
  'Santander',
  'Nubank',
  'Inter',
  'Sicredi',
  'Sicoob',
  'Outro',
];

export function BankAccountModal({ open, onOpenChange, account, onSave }: BankAccountModalProps) {
  const [formData, setFormData] = useState({
    name: account?.name || '',
    bank: account?.bank || '',
    agency: account?.agency || '',
    account: account?.account || '',
    balance: account?.balance || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.bank || !formData.agency || !formData.account) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    onSave(formData);
    toast.success(account ? 'Conta atualizada com sucesso!' : 'Conta cadastrada com sucesso!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{account ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome da Conta *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Conta Principal"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="bank">Banco *</Label>
              <Select
                value={formData.bank}
                onValueChange={(value) => setFormData({ ...formData, bank: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="agency">Agência *</Label>
              <Input
                id="agency"
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                placeholder="0000-0"
              />
            </div>
            <div>
              <Label htmlFor="account">Conta *</Label>
              <Input
                id="account"
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                placeholder="00000-0"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="balance">Saldo Inicial (R$)</Label>
              <Input
                id="balance"
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                step={0.01}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
