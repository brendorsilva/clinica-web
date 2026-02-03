import { api } from "@/lib/api";
import { Appointment } from "@/types/clinic";

export const appointmentService = {
  // Busca com filtro de datas opcional
  getAll: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get<Appointment[]>(
      `/appointments?${params.toString()}`,
    );
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post<Appointment>("/appointments", data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/appointments/${id}`);
  },
};
