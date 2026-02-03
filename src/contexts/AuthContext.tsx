import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api";
import { User } from "@/types/clinic";

// 1. Definimos que o Contexto TEM a função registerClinic
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  registerClinic: (data: any) => Promise<void>; // <--- OBRIGATÓRIO ESTAR AQUI
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("clinic_user");
    const token = localStorage.getItem("clinic_token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  async function signIn(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });

    const { access_token, user: userData } = response.data;

    localStorage.setItem("clinic_token", access_token);
    localStorage.setItem("clinic_user", JSON.stringify(userData));

    api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    setUser(userData);
  }

  // 2. Implementamos a função
  async function registerClinic(data: any) {
    // Chama a rota de registro no backend
    await api.post("/auth/register", data);

    // Após registrar com sucesso, faz login automático
    await signIn(data.userEmail, data.password);
  }

  function signOut() {
    localStorage.removeItem("clinic_token");
    localStorage.removeItem("clinic_user");
    api.defaults.headers.common["Authorization"] = "";
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        registerClinic, // <--- 3. OBRIGATÓRIO EXPORTAR AQUI NO VALUE
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
