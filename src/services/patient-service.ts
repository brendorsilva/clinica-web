import { api } from "@/lib/api";
import { Patient } from "@/types/clinic";

export const patientService = {
  // Listar todos os pacientes da clínica
  getAll: async () => {
    const response = await api.get<Patient[]>("/patients");
    return response.data;
  },

  // Criar novo paciente
  create: async (data: Omit<Patient, "id" | "createdAt">) => {
    const response = await api.post<Patient>("/patients", data);
    return response.data;
  },

  // Atualizar paciente
  update: async (id: string, data: Partial<Patient>) => {
    const response = await api.patch<Patient>(`/patients/${id}`, data);
    return response.data;
  },

  // Remover paciente
  delete: async (id: string) => {
    await api.delete(`/patients/${id}`);
  },
};
