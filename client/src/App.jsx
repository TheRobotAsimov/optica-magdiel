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
import EmpleadoList from './components/empleados/EmpleadoList';
import EmpleadoForm from './components/empleados/EmpleadoForm';
import LenteList from './components/lentes/LenteList';
import LenteForm from './components/lentes/LenteForm';
import VentaList from './components/ventas/VentaList';
import VentaForm from './components/ventas/VentaForm';

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
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;