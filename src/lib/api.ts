import axios from "axios";

export const api = axios.create({
  //baseURL: "http://localhost:3000",
  baseURL: "https://clinica-api-df1a.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("clinic_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
