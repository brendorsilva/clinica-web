import { useState } from "react";
import { format } from "date-fns";
import { Search, Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { mockCashMovements } from "@/data/mockData";
import { CashMovement } from "@/types/clinic";
import { CashMovementModal } from "@/components/modals/CashMovementModal";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { cn } from "@/lib/utils";

const paymentMethodLabels = {
  cash: "Dinheiro",
  credit: "Crédito",
  debit: "Débito",
  pix: "PIX",
  transfer: "Transferência",
};

export default function Cash() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [movements, setMovements] = useState(mockCashMovements);
  const { notifyCashMovement } = useNotificationActions();

  const filteredMovements = movements.filter((item) =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalIncome = movements
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = movements
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleSave = (movementData: Omit<CashMovement, "id">) => {
    const newMovement: CashMovement = {
      ...movementData,
      id: String(Date.now()),
    };
    setMovements([...movements, newMovement]);
    notifyCashMovement(
      movementData.type,
      movementData.description,
      movementData.amount,
    );
  };

  const columns = [
    {
      key: "type",
      header: "Tipo",
      cell: (item: CashMovement) => (
        <div className="flex items-center gap-2">
          {item.type === "income" ? (
            <ArrowUpCircle className="h-5 w-5 text-success" />
          ) : (
            <ArrowDownCircle className="h-5 w-5 text-destructive" />
          )}
          <span
            className={cn(
              "font-medium",
              item.type === "income" ? "text-success" : "text-destructive",
            )}
          >
            {item.type === "income" ? "Entrada" : "Saída"}
          </span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Descrição",
      cell: (item: CashMovement) => (
        <div>
          <p className="font-medium text-foreground">{item.description}</p>
          <p className="text-sm text-muted-foreground">{item.category}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Valor",
      cell: (item: CashMovement) => (
        <span
          className={cn(
            "font-semibold",
            item.type === "income" ? "text-success" : "text-destructive",
          )}
        >
          {item.type === "income" ? "+" : "-"} R${" "}
          {item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      header: "Forma de Pagamento",
      cell: (item: CashMovement) => (
        <Badge variant="outline" className="badge-primary">
          {paymentMethodLabels[item.paymentMethod]}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Data",
      cell: (item: CashMovement) => (
        <span className="text-muted-foreground">
          {format(item.date, "dd/MM/yyyy")}
        </span>
      ),
    },
  ];

  return (
    <MainLayout title="Caixa" subtitle="Movimentação do caixa da clínica">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Entradas"
          value={`R$ ${totalIncome.toLocaleString("pt-BR")}`}
          icon={ArrowUpCircle}
          variant="success"
        />
        <StatCard
          title="Saídas"
          value={`R$ ${totalExpense.toLocaleString("pt-BR")}`}
          icon={ArrowDownCircle}
          variant="warning"
        />
        <StatCard
          title="Saldo"
          value={`R$ ${balance.toLocaleString("pt-BR")}`}
          icon={Wallet}
          variant="primary"
        />
      </div>

      <div className="page-header">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsExpenseModalOpen(true)}>
            <ArrowDownCircle className="mr-2 h-4 w-4" />
            Lançar Saída
          </Button>
          <Button onClick={() => setIsIncomeModalOpen(true)}>
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Lançar Entrada
          </Button>
        </div>
      </div>

      <DataTable data={filteredMovements} columns={columns} />

      <CashMovementModal
        open={isIncomeModalOpen}
        onOpenChange={setIsIncomeModalOpen}
        type="income"
        onSave={handleSave}
      />

      <CashMovementModal
        open={isExpenseModalOpen}
        onOpenChange={setIsExpenseModalOpen}
        type="expense"
        onSave={handleSave}
      />
    </MainLayout>
  );
}
