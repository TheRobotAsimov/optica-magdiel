import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ResetPassword } from './components/auth/ResetPassword';
import { Dashboard } from './components/dashboard/Dashboard';
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';
import ClientList from './components/clients/ClientList';
import ClientForm from './components/clients/ClientForm';
import DatabaseAdmin from './components/admin/DatabaseAdmin';
import DesempenoAsesorReport from './components/admin/DesempenoAsesorReport';
import PagosClientesReport from './components/admin/PagosClientesReport';
import RutasReport from './components/admin/RutasReport';
import BalanceReport from './components/admin/BalanceReport';
import EmpleadoList from './components/empleados/EmpleadoList';
import EmpleadoForm from './components/empleados/EmpleadoForm';
import LenteList from './components/lentes/LenteList';
import LenteForm from './components/lentes/LenteForm';
import VentaList from './components/ventas/VentaList';
import VentaForm from './components/ventas/VentaForm';
import UnifiedForm from './components/ventas/UnifiedForm';
import PriceCatalogEditor from './components/admin/PriceCatalogEditor';
import RutaList from './components/rutas/RutaList';
import RutaForm from './components/rutas/RutaForm';
import RutaAsesor from './components/rutas/RutaAsesor';
import PagoList from './components/pagos/PagoList';
import PagoForm from './components/pagos/PagoForm';
import EntregaList from './components/entregas/EntregaList';
import EntregaForm from './components/entregas/EntregaForm';
import CompleteEntregaForm from './components/entregas/CompleteEntregaForm';
import GastoRutaList from './components/gastoRutas/GastoRutaList';
import GastoRutaForm from './components/gastoRutas/GastoRutaForm';
import PacienteList from './components/pacientes/PacienteList';
import PacienteForm from './components/pacientes/PacienteForm';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users/new" 
            element={
              <ProtectedRoute>
                <UserForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users/:id/edit" 
            element={
              <ProtectedRoute>
                <UserForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clients" 
            element={
              <ProtectedRoute>
                <ClientList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clients/new" 
            element={
              <ProtectedRoute>
                <ClientForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clients/:id/edit" 
            element={
              <ProtectedRoute>
                <ClientForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/empleados" 
            element={
              <ProtectedRoute>
                <EmpleadoList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/empleados/new" 
            element={
              <ProtectedRoute>
                <EmpleadoForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/empleados/:id/edit" 
            element={
              <ProtectedRoute>
                <EmpleadoForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lentes" 
            element={
              <ProtectedRoute>
                <LenteList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lentes/new" 
            element={
              <ProtectedRoute>
                <LenteForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lentes/:id/edit" 
            element={
              <ProtectedRoute>
                <LenteForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ventas" 
            element={
              <ProtectedRoute>
                <VentaList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ventas/new/unified" 
            element={
              <ProtectedRoute>
                <UnifiedForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ventas/new" 
            element={
              <ProtectedRoute>
                <VentaForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ventas/:folio/edit" 
            element={
              <ProtectedRoute>
                <VentaForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/database" 
            element={
              <ProtectedRoute>
                <DatabaseAdmin />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin/prices"
            element={
              <ProtectedRoute>
                <PriceCatalogEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes/desempeno-asesor"
            element={
              <ProtectedRoute>
                <DesempenoAsesorReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes/pagos-clientes"
            element={
              <ProtectedRoute>
                <PagosClientesReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes/rutas"
            element={
              <ProtectedRoute>
                <RutasReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes/balance"
            element={
              <ProtectedRoute>
                <BalanceReport />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/rutas" 
            element={
              <ProtectedRoute>
                <RutaList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rutas/new" 
            element={
              <ProtectedRoute>
                <RutaForm />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/rutas/:id/edit"
            element={
              <ProtectedRoute>
                <RutaForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ruta-asesor"
            element={
              <ProtectedRoute>
                <RutaAsesor />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/pagos" 
            element={
              <ProtectedRoute>
                <PagoList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pagos/new" 
            element={
              <ProtectedRoute>
                <PagoForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pagos/:id/edit"
            element={
              <ProtectedRoute>
                <PagoForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/entregas" 
            element={
              <ProtectedRoute>
                <EntregaList />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/entregas/new"
            element={
              <ProtectedRoute>
                <CompleteEntregaForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entregas/complete"
            element={
              <ProtectedRoute>
                <CompleteEntregaForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entregas/:id/edit"
            element={
              <ProtectedRoute>
                <CompleteEntregaForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/gasto-rutas" 
            element={
              <ProtectedRoute>
                <GastoRutaList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/gasto-rutas/new" 
            element={
              <ProtectedRoute>
                <GastoRutaForm />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/gasto-rutas/:id/edit"
            element={
              <ProtectedRoute>
                <GastoRutaForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pacientes"
            element={
              <ProtectedRoute>
                <PacienteList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pacientes/new"
            element={
              <ProtectedRoute>
                <PacienteForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pacientes/:id/edit"
            element={
              <ProtectedRoute>
                <PacienteForm />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;