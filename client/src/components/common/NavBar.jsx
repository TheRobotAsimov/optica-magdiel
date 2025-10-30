import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router';
import { User } from 'lucide-react';
import logo from '../../assets/pez_blanco.webp';

const NavComponent = () => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
    await logout();
  };
  
  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg" style={{ backgroundColor: '#1A37A5' }}>
      {/* Header section with logo, user info, and logout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-black font-bold text-xl">
              <Link to="/dashboard">
                <img src={logo} alt="Logo" style={{ height: '40px' }} />
              </Link>
            </div>
          </div>

          {/* Usuario y admin en la derecha */}
          <div className="flex items-center space-x-4">
            {/* Icono de usuario y admin */}
            <div className="flex items-center space-x-2 bg-blue-800 bg-opacity-50 px-4 py-2 rounded-full">
              <div className="bg-white p-1 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-white text-sm font-medium">Bienvenido(a), {user?.correo}</span>
            </div>

             <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>

            {/* Menú hamburguesa para móviles */}
            <div className="md:hidden">
              <button className="text-white hover:text-blue-200 p-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* White navigation section */}
      <div className="bg-white border-t border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-8 py-2 justify-center">
            {/* Gestión dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 inline-flex items-center">
                Gestiones
              </button>
              <div className="absolute left-0 top-full w-35 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transform -translate-y-2 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto z-50">
                <div className="py-1">
                  {user && user.rol === 'Matriz' && (<Link to="/users" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Usuarios</Link>)}
                  {user && user.rol === 'Matriz' && (<Link to="/empleados" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Empleados</Link>)}
                  <Link to="/clients" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Clientes</Link>
                  <Link to="/ventas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Ventas</Link>
                  <Link to="/rutas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Rutas</Link>
                  <Link to="/pagos" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Pagos</Link>
                  <Link to="/entregas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Entregas</Link>
                  <Link to="/gasto-rutas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Gastos de Ruta</Link>
                  {user && user.rol === 'Matriz' && (<Link to="/lentes" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Lentes</Link>)}
                </div>
              </div>
            </div>

            <Link to="/ventas/new/unified" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Contrato de Venta</Link>
            <Link to="/entregas/complete" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Registrar Entrega</Link>
            {user && user.puesto === 'Asesor' && (<Link to="/ruta-asesor" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Ruta Asesor</Link>)}
            {user && user.rol === 'Matriz' && (<Link to="/admin/prices" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Precios</Link>)}
            {user && user.rol === 'Matriz' && (<Link to="/admin/database" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">BD</Link>)}
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <details className="group">
                <summary className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 cursor-pointer">Gestión</summary>
                <div className="pl-4 mt-1 space-y-1">
                  <Link to="/users" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Usuarios</Link>
                  <Link to="/empleados" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Empleados</Link>
                  <Link to="/clients" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Clientes</Link>
                  <Link to="/ventas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Ventas</Link>
                  <Link to="/rutas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Rutas</Link>
                  <Link to="/pagos" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Pagos</Link>
                  <Link to="/entregas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Entregas</Link>
                  <Link to="/entregas/complete" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Nueva Entrega Completa</Link>
                  <Link to="/gasto-rutas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Gastos de Ruta</Link>
                  <Link to="/lentes" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Lentes</Link>
                </div>
              </details>

              <Link to="/ventas/new/unified" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Contrato de Venta</Link>
              {user && user.puesto === 'Asesor' && (<Link to="/ruta-asesor" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Ruta Asesor</Link>)}
              {user && user.rol === 'Matriz' && (
                <Link to="/admin/prices" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Precios</Link>
              )}
              {user && user.rol === 'Matriz' && (
                <Link to="/admin/database" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Base de Datos</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavComponent;