import { useState } from "react";
import { Plus, Building2, TrendingUp } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { mockBankAccounts } from "@/data/mockData";
import { BankAccount } from "@/types/clinic";
import { BankAccountModal } from "@/components/modals/BankAccountModal";
import { useNotifications } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";

export default function Bank() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState(mockBankAccounts);
  const { addNotification } = useNotifications();

  const totalBalance = accounts.reduce(
    (acc, account) => acc + account.balance,
    0,
  );

  const handleSave = (accountData: Omit<BankAccount, "id">) => {
    const newAccount: BankAccount = {
      ...accountData,
      id: String(Date.now()),
    };
    setAccounts([...accounts, newAccount]);

    addNotification({
      title: "Conta bancária adicionada",
      message: `${accountData.name} - ${accountData.bank} foi adicionada`,
      type: "success",
      category: "financial",
    });
  };

  return (
    <MainLayout
      title="Contas Bancárias"
      subtitle="Gerencie suas contas bancárias"
    >
      {/* Total Balance Card */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 mb-8 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/80 mb-1">Saldo Total</p>
            <p className="text-4xl font-bold">
              R${" "}
              {totalBalance.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
            <div className="flex items-center gap-2 mt-2 text-primary-foreground/80">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">+5.2% este mês</span>
            </div>
          </div>
          <Button
            variant="secondary"
            className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {account.bank}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {account.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ag: {account.agency} • CC: {account.account}
            </p>
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Saldo Atual</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  account.balance >= 0 ? "text-success" : "text-destructive",
                )}
              >
                R${" "}
                {account.balance.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Add New Account Card */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="bg-muted/50 rounded-xl border-2 border-dashed border-border p-6 flex flex-col items-center justify-center min-h-[200px] hover:border-primary/50 transition-colors cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-muted-foreground">Adicionar Conta</p>
        </div>
      </div>

      <BankAccountModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
      />
    </MainLayout>
  );
}
