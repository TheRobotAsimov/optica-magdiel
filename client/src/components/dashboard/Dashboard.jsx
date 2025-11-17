import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router';
import NavComponent from '../common/NavBar';
import { Users, Briefcase, UserCheck, ShoppingCart, MapPin, DollarSign, Package, Receipt, Glasses, FileText, Truck, Settings, Database } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent/>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* User Information Card 
          <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Información del Usuario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.nombre} {user?.paterno} {user?.materno}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.correo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rol</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.rol}</p>
                </div>
                {user?.puesto && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Puesto</p>
                    <p className="mt-1 text-sm text-gray-900">{user?.puesto}</p>
                  </div>
                )}
              </div>
            </div>
          </div> */}

          {/* Menu Sections */}
          
          {/* Gestiones Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-3xl font-bold leading-6 text-blue-500 mb-6 border-b-4 pb-2">
                GESTIONES
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[
                  ...(user?.rol === 'Matriz' ? [
                    { title: 'Usuarios', icon: Users, path: '/users', color: 'bg-blue-500' },
                    { title: 'Empleados', icon: Briefcase, path: '/empleados', color: 'bg-blue-500' },
                  ] : []),
                  { title: 'Clientes', icon: UserCheck, path: '/clients', color: 'bg-blue-500' },
                  { title: 'Ventas', icon: ShoppingCart, path: '/ventas', color: 'bg-blue-500' },
                  { title: 'Rutas', icon: MapPin, path: '/rutas', color: 'bg-blue-500' },
                  { title: 'Pagos', icon: DollarSign, path: '/pagos', color: 'bg-blue-500' },
                  { title: 'Entregas', icon: Package, path: '/entregas', color: 'bg-blue-500' },
                  { title: 'Gastos de Ruta', icon: Receipt, path: '/gasto-rutas', color: 'bg-blue-500' },
                  ...(user?.rol === 'Matriz' ? [
                    { title: 'Lentes', icon: Glasses, path: '/lentes', color: 'bg-blue-500' },
                  ] : []),
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className={`${item.color} p-6 h-32 flex flex-col items-center justify-center text-white`}>
                        <Icon className="h-10 w-10 mb-2 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-center font-medium text-sm">{item.title}</span>
                      </div>
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Acciones Rápidas Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-3xl font-bold leading-6 text-emerald-500 mb-6 border-b-4 pb-2">
                ACCIONES RÁPIDAS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[
                  { title: 'Contrato de Venta', icon: FileText, path: '/ventas/new/unified', color: 'bg-emerald-500' },
                  { title: 'Registrar Entrega', icon: Truck, path: '/entregas/complete', color: 'bg-emerald-500' },
                  ...(user?.puesto === 'Asesor' ? [
                    { title: 'Ruta Asesor', icon: MapPin, path: '/ruta-asesor', color: 'bg-emerald-500' },
                  ] : []),
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className={`${item.color} p-6 h-32 flex flex-col items-center justify-center text-white`}>
                        <Icon className="h-10 w-10 mb-2 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-center font-medium text-sm">{item.title}</span>
                      </div>
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reportes Section - Only for Matriz role */}
          {user?.rol === 'Matriz' && (
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-3xl font-bold leading-6 text-purple-500 mb-6 border-b-4 pb-2">
                  REPORTES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[
                    { title: 'Rutas', icon: FileText, path: '/reportes/rutas', color: 'bg-purple-500' },
                    { title: 'Desempeño por Asesor', icon: FileText, path: '/reportes/desempeno-asesor', color: 'bg-purple-500' },
                    { title: 'Pagos de Clientes', icon: FileText, path: '/reportes/pagos-clientes', color: 'bg-purple-500' },
                    { title: 'Balance', icon: FileText, path: '/reportes/balance', color: 'bg-purple-500' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className={`${item.color} p-6 h-32 flex flex-col items-center justify-center text-white`}>
                          <Icon className="h-10 w-10 mb-2 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-center font-medium text-sm">{item.title}</span>
                        </div>
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Administración Section - Only for Matriz role */}
          {user?.rol === 'Matriz' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-3xl font-bold leading-6 text-slate-500 mb-6 border-b-4 pb-2">
                  ADMINISTRACIÓN
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[
                    { title: 'Precios', icon: Settings, path: '/admin/prices', color: 'bg-slate-500' },
                    { title: 'Base de Datos', icon: Database, path: '/admin/database', color: 'bg-slate-500' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className={`${item.color} p-6 h-32 flex flex-col items-center justify-center text-white`}>
                          <Icon className="h-10 w-10 mb-2 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-center font-medium text-sm">{item.title}</span>
                        </div>
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};