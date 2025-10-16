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
          <div className="hidden md:flex space-x-8 py-3 justify-center">
            <Link to="/users" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Usuarios</Link>
            <Link to="/empleados" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Empleados</Link>
            <Link to="/clients" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Clientes</Link>
            <Link to="/ventas" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Ventas</Link>
            <Link to="/lentes" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Lentes</Link>
            <Link to="/ventas/new/unified" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Contrato de Venta</Link>
            <Link to="/admin/database" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">BD</Link>
            <Link to="/admin/prices" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Precios</Link>
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/users" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Usuarios</Link>
              <Link to="/clients" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Clientes</Link>
              <Link to="/empleados" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Empleados</Link>
              <Link to="/ventas" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Ventas</Link>
              <Link to="/lentes" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Lentes</Link>
              <Link to="/ventas/new/unified" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Contrato de Venta</Link>
              {user && user.rol === 'Matriz' && (
                <Link to="/admin/database" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Base de Datos</Link>
              )}
              {user && user.rol === 'Matriz' && (
                <Link to="/admin/prices" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Precios</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavComponent;