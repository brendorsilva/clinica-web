import { Toaster } from "./components/ui/toaster.tsx";
import { Toaster as Sonner } from "./components/ui/sonner.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Carregando ...</div>;

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <PrivateRoute>
            <Patients />
          </PrivateRoute>
        }
      />
      <Route
        path="/doctors"
        element={
          <PrivateRoute>
            <Doctors />
          </PrivateRoute>
        }
      />
      <Route
        path="/services"
        element={
          <PrivateRoute>
            <Services />
          </PrivateRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <PrivateRoute>
            <Appointments />
          </PrivateRoute>
        }
      />
      <Route
        path="/financial/receivables"
        element={
          <PrivateRoute>
            <Receivables />
          </PrivateRoute>
        }
      />
      <Route
        path="/financial/payables"
        element={
          <PrivateRoute>
            <Payables />
          </PrivateRoute>
        }
      />
      <Route
        path="/financial/cash"
        element={
          <PrivateRoute>
            <Cash />
          </PrivateRoute>
        }
      />
      <Route
        path="/financial/bank"
        element={
          <PrivateRoute>
            <Bank />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <Users />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route
        path="*"
        element={
          <PrivateRoute>
            <NotFound />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
