import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000", // Confirme se seu backend roda aqui
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("clinic_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
