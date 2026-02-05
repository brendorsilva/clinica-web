import { useState } from "react";
import { format } from "date-fns";
import { Plus, Search, DollarSign } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { mockTransactions } from "@/data/mockData";
import { Transaction } from "@/types/clinic";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Pendente", className: "badge-warning" },
  paid: { label: "Pago", className: "badge-success" },
  overdue: { label: "Vencido", className: "badge-destructive" },
  cancelled: {
    label: "Cancelado",
    className: "bg-muted text-muted-foreground",
  },
};

export default function Receivables() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState(mockTransactions);
  const { notifyTransactionCreated } = useNotificationActions();

  const receivables = transactions.filter((t) => t.type === "receivable");
  const filteredReceivables = receivables.filter((item) =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPending = receivables
    .filter((t) => t.status === "pending")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPaid = receivables
    .filter((t) => t.status === "paid")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOverdue = receivables
    .filter((t) => t.status === "overdue")
    .reduce((acc, t) => acc + t.amount, 0);

  const handleSave = (transactionData: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: String(Date.now()),
    };
    setTransactions([...transactions, newTransaction]);
    notifyTransactionCreated(
      "receivable",
      transactionData.description,
      transactionData.amount,
    );
  };

  const columns = [
    {
      key: "description",
      header: "Descrição",
      cell: (item: Transaction) => (
        <div>
          <p className="font-medium text-foreground">{item.description}</p>
          <p className="text-sm text-muted-foreground">{item.category}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Valor",
      cell: (item: Transaction) => (
        <span className="font-semibold text-foreground">
          R$ {item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Vencimento",
      cell: (item: Transaction) => (
        <span className="text-muted-foreground">
          {format(item.dueDate, "dd/MM/yyyy")}
        </span>
      ),
    },
    {
      key: "paidDate",
      header: "Pagamento",
      cell: (item: Transaction) =>
        item.paidDate ? (
          <span className="text-success">
            {format(item.paidDate, "dd/MM/yyyy")}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item: Transaction) => (
        <Badge
          variant="outline"
          className={cn(statusConfig[item.status].className)}
        >
          {statusConfig[item.status].label}
        </Badge>
      ),
    },
  ];

  return (
    <MainLayout
      title="Contas a Receber"
      subtitle="Gerencie os recebimentos da clínica"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="A Receber"
          value={`R$ ${totalPending.toLocaleString("pt-BR")}`}
          icon={DollarSign}
          variant="warning"
        />
        <StatCard
          title="Recebido"
          value={`R$ ${totalPaid.toLocaleString("pt-BR")}`}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Vencido"
          value={`R$ ${totalOverdue.toLocaleString("pt-BR")}`}
          icon={DollarSign}
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
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Receita
        </Button>
      </div>

      <DataTable data={filteredReceivables} columns={columns} />

      <TransactionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        type="receivable"
        onSave={handleSave}
      />
    </MainLayout>
  );
}
