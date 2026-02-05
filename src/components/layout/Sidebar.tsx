import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Stethoscope,
  Calendar,
  DollarSign,
  Building2,
  Settings,
  ChevronDown,
  ChevronRight,
  Activity,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Interface atualizada para suportar permissões e filhos
interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  permission?: string; // Permissão necessária para ver este item
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    permission: "dashboard",
  },
  {
    label: "Agendamentos",
    icon: Calendar,
    href: "/appointments",
    permission: "appointments",
  },
  {
    label: "Pacientes",
    icon: Users,
    href: "/patients",
    permission: "patients",
  },
  {
    label: "Médicos",
    icon: Stethoscope,
    href: "/doctors",
    permission: "doctors",
  },
  {
    label: "Serviços",
    icon: Activity,
    href: "/services",
    permission: "services",
  },
  {
    label: "Financeiro",
    icon: DollarSign,
    permission: "financial", // Só aparece para quem tem permissão financeira
    children: [
      { label: "Contas a Receber", href: "/financial/receivables" },
      { label: "Contas a Pagar", href: "/financial/payables" },
      { label: "Caixa", href: "/financial/cash" },
      { label: "Contas Bancárias", href: "/financial/bank" },
    ],
  },
  {
    label: "Usuários",
    icon: UserCog,
    href: "/users",
    permission: "users",
  },
  {
    label: "Configurações",
    icon: Settings,
    href: "/settings",
    permission: "settings",
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth(); // Hooks de autenticação
  const [expandedItems, setExpandedItems] = useState<string[]>(["Financeiro"]);

  // Lógica de Expandir/Recolher submenus
  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  // Verifica se o usuário tem permissão para ver o item
  const canAccess = (itemPermission?: string) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (!itemPermission || itemPermission === "dashboard") return true;
    return user.permissions?.includes(itemPermission);
  };

  // Tradutor de Cargos
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "manager":
        return "Gerente";
      case "doctor":
        return "Médico";
      case "receptionist":
        return "Recepcionista";
      case "financial":
        return "Financeiro";
      default:
        return role;
    }
  };

  const isActive = (href: string) => location.pathname === href;
  const isChildActive = (children?: { href: string }[]) =>
    children?.some((child) => location.pathname === child.href);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border transition-all duration-300">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">CliniControl</h1>
            <p className="text-xs text-muted-foreground">Gestão Clínica</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              // Verifica permissão antes de renderizar
              if (!canAccess(item.permission)) return null;

              return (
                <li key={item.label}>
                  {item.children ? (
                    /* Renderização de Item com Submenu (Accordion) */
                    <div>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                          isChildActive(item.children)
                            ? "bg-muted text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {expandedItems.includes(item.label) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>

                      {/* Lista de Filhos */}
                      {expandedItems.includes(item.label) && (
                        <ul className="mt-1 ml-4 space-y-1 border-l border-border pl-4">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                to={child.href}
                                className={cn(
                                  "block rounded-md px-3 py-2 text-sm transition-colors hover:text-foreground",
                                  isActive(child.href)
                                    ? "font-medium text-primary"
                                    : "text-muted-foreground",
                                )}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    /* Renderização de Item Simples (Link) */
                    <Link
                      to={item.href!}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                        isActive(item.href!)
                          ? "bg-muted text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-border p-4 bg-muted/20">
          <div className="flex items-center justify-between gap-2">
            {/* Perfil */}
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user?.name?.slice(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <p
                  className="text-sm font-medium text-foreground truncate max-w-[100px]"
                  title={user?.name}
                >
                  {user?.name || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {getRoleLabel(user?.role)}
                </p>
              </div>
            </div>

            {/* Botão de Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Sair do Sistema"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
