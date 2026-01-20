import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import type { CashMovement } from '../../types/clinic';
import { toast } from 'sonner';

interface CashMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'income' | 'expense';
  movement?: CashMovement;
  onSave: (movement: Omit<CashMovement, 'id'>) => void;
}

const categories = {
  income: ['Consultas', 'Exames', 'Procedimentos', 'Outros'],
  expense: ['Suprimentos', 'Despesas Operacionais', 'Compras', 'Outros'],
};

const paymentMethods = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'credit', label: 'Cartão de Crédito' },
  { value: 'debit', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'transfer', label: 'Transferência' },
];

export function CashMovementModal({ open, onOpenChange, type, movement, onSave }: CashMovementModalProps) {
  const [formData, setFormData] = useState({
    description: movement?.description || '',
    amount: movement?.amount || 0,
    date: movement?.date ? new Date(movement.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: movement?.category || '',
    paymentMethod: movement?.paymentMethod || 'pix' as CashMovement['paymentMethod'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.category || formData.amount <= 0) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    onSave({
      type,
      description: formData.description,
      amount: formData.amount,
      date: new Date(formData.date),
      category: formData.category,
      paymentMethod: formData.paymentMethod,
    });
    
    toast.success(movement ? 'Movimento atualizado com sucesso!' : 'Movimento registrado com sucesso!');
    onOpenChange(false);
  };

  const title = type === 'income' ? 'Nova Entrada' : 'Nova Saída';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{movement ? 'Editar Movimento' : title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do movimento"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories[type].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                min={0}
                step={0.01}
              />
            </div>
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value: CashMovement['paymentMethod']) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
