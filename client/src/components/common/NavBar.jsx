import React from 'react';
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router';
import { User } from 'lucide-react';
import logo from '../../assets/logoimagen.webp';

const NavComponent = () => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
    await logout();
  };
  
  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg" style={{ backgroundColor: '#1A37A5' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y navegación izquierda */}
          <div className="flex items-center space-x-8">
            {/* Logo placeholder - puedes reemplazar con tu logo real */}
            <div className="flex items-center">
              <div className="text-black font-bold text-xl bg-white px-3 py-1 rounded-lg">
                <Link to="/dashboard">
                  <img src={logo} alt="Logo" style={{ height: '40px' }} />
                </Link>
              </div>
            </div>
            
            {/* Enlaces de navegación */}
            <div className="hidden md:flex space-x-8">
                <Link to="/users" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium">Usuarios</Link>
                <Link to="/clients" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium">Clientes</Link>
                  <Link to="/admin/database" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium">Base de Datos</Link>
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

        {/* Menú móvil (oculto por defecto) */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-blue-600">
              <Link to="/users" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium">Usuarios</Link>
              <Link to="/clients" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium">Clientes</Link>
              {user && user.rol === 'Matriz' && (
                <Link to="/admin/database" className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium">Base de Datos</Link>
              )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavComponent;