import { Toaster } from "./components/ui/toaster.tsx";
import { Toaster as Sonner } from "./components/ui/sonner.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";
import Dashboard from "./pages/Dashboard.tsx";
import Patients from "./pages/Patients.tsx";
import Doctors from "./pages/Doctors.tsx";
import Services from "./pages/Services.tsx";
import Appointments from "./pages/Appointments.tsx";
import Receivables from "./pages/financial/Receivables.tsx";
import Payables from "./pages/financial/Payables.tsx";
import Cash from "./pages/financial/Cash.tsx";
import Bank from "./pages/financial/Bank.tsx";
import Users from "./pages/Users.tsx";
import Settings from "./pages/Settings.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NotificationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/services" element={<Services />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/financial/receivables" element={<Receivables />} />
            <Route path="/financial/payables" element={<Payables />} />
            <Route path="/financial/cash" element={<Cash />} />
            <Route path="/financial/bank" element={<Bank />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
