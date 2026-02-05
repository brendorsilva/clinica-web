import { api } from "@/lib/api";
import { Service } from "@/types/clinic";

export const servicesService = {
  getAll: async (status?: string) => {
    const params = status ? `?status=${status}` : "";
    const response = await api.get<Service[]>(`/services${params}`);
    return response.data;
  },

  create: async (data: Omit<Service, "id" | "createdAt" | "clinicId">) => {
    // O backend espera: name, description, price, duration, category
    // Garantimos que duration e price sejam números
    const payload = {
      ...data,
      price: Number(data.price),
      duration: Number(data.duration),
    };
    const response = await api.post<Service>("/services", payload);
    return response.data;
  },

  update: async (id: string, data: Partial<Service>) => {
    const payload = { ...data };
    if (data.price) payload.price = Number(data.price);
    if (data.duration) payload.duration = Number(data.duration);

    const response = await api.patch<Service>(`/services/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/services/${id}`);
  },
};
