import { api } from "@/lib/api";
import { Doctor } from "@/types/clinic";

export const doctorService = {
  getAll: async (status?: string) => {
    const params = status ? `?status=${status}` : "";
    const response = await api.get<Doctor[]>(`/doctors${params}`);
    return response.data;
  },

  create: async (data: Omit<Doctor, "id" | "createdAt" | "status">) => {
    const response = await api.post<Doctor>("/doctors", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Doctor>) => {
    const response = await api.patch<Doctor>(`/doctors/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/doctors/${id}`);
  },
};
