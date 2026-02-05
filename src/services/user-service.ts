import { api } from "@/lib/api";

// Definindo o Enum no Frontend
export type UserRole =
  | "admin"
  | "manager"
  | "receptionist"
  | "doctor"
  | "financial";

export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clinicId: string;
  status: UserStatus;
  permissions: string[];
}

export const userService = {
  getAll: async () => {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post<User>("/users", data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    if (!data.password) delete data.password;
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};
