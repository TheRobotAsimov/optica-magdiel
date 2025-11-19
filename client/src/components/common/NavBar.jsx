import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router';
import { User, Bell, Menu, X } from 'lucide-react';
import logo from '../../assets/pez_blanco.webp';
import notificacionService from '../../service/notificacionService';
import useSocket from '../../hooks/useSocket';

const NavComponent = () => {
    const { user, logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const socket = useSocket();
    const notificationRef = useRef(null);

    useEffect(() => {
        if (user && user.rol === 'Matriz') {
            fetchUnreadCount();
            fetchNotificaciones();
        }
    }, [user]);

    useEffect(() => {
        if (socket && user && user.rol === 'Matriz') {
            socket.on('nueva_notificacion', (data) => {
                setUnreadCount(prev => prev + 1);
                setNotificaciones(prev => [data, ...prev]);
            });
        }
    }, [socket, user]);

    // Handle clicks outside notification dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    // Handle clicks outside mobile menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close mobile menu if clicking outside
            if (showMobileMenu && !event.target.closest('.mobile-menu-container')) {
                setShowMobileMenu(false);
            }
        };

        if (showMobileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMobileMenu]);

    const fetchUnreadCount = async () => {
        try {
            const response = await notificacionService.getUnreadCount();
            setUnreadCount(response.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchNotificaciones = async () => {
        try {
            const data = await notificacionService.getAll();
            setNotificaciones(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificacionService.markAsRead(id);
            setNotificaciones(prev =>
                prev.map(notif =>
                    notif.idnotificacion === id ? { ...notif, leido: 1 } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
    };
  
  return (
    <nav className="bg-gradient-to-r from-blue-400 to-indigo-800 shadow-lg" style={{ backgroundColor: '#1A37A5' }}>
      {/* Header section with logo, user info, and logout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center transition-all duration-200 transform hover:scale-105">
            <div className="text-black font-bold text-xl">
              <Link to="/dashboard">
                <img src={logo} alt="Logo" style={{ height: '40px' }} />
              </Link>
            </div>
          </div>

          {/* Usuario y admin en la derecha */}
          <div className="flex items-center space-x-4">
            {user && user.rol === 'Matriz' && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-white hover:text-blue-200 transition-all duration-200 transform hover:scale-105"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-md shadow-lg z-50 md:w-80 md:right-0 left-4 md:left-auto">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Notificaciones</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notificaciones.filter(notif => !notif.leido).length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No hay notificaciones
                            </div>
                        ) : (
                            notificaciones.filter(notif => !notif.leido).map(notif => (
                                <div
                                    key={notif.idnotificacion || notif.fecha}
                                    className="p-4 border-b border-gray-100 hover:bg-gray-50 bg-blue-50"
                                >
                                    <p className="text-sm text-gray-800 break-words">{notif.mensaje}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notif.fecha).toLocaleString('es-ES')}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMarkAsRead(notif.idnotificacion);
                                        }}
                                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 touch-manipulation"
                                    >
                                        Marcar como leída
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Icono de usuario y admin */}
            <div className="flex items-center space-x-2 bg-indigo-800 bg-opacity-50 px-4 py-2 rounded-full">
              <div className="bg-white p-1 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-white text-sm font-medium">Bienvenido(a), {user?.correo}</span>
            </div>

             <button
               onClick={handleLogout}
               className="bg-pink-800 hover:bg-pink-900 text-white px-4 py-2 rounded-md text-sm font-medium"
             >
               Cerrar Sesión
             </button>
           </div>

           {/* Menú hamburguesa para móviles */}
           <div className="md:hidden">
             <button
               onClick={() => setShowMobileMenu(!showMobileMenu)}
               className="text-white hover:text-blue-200 p-2"
             >
               {showMobileMenu ? (
                 <X className="h-6 w-6" />
               ) : (
                 <Menu className="h-6 w-6" />
               )}
             </button>
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
                  <Link to="/pacientes" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Pacientes</Link>
                  <Link to="/ventas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Ventas</Link>
                  <Link to="/rutas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Rutas</Link>
                  <Link to="/pagos" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Pagos</Link>
                  <Link to="/entregas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Entregas</Link>
                  <Link to="/gasto-rutas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Gastos de Ruta</Link>
                  {user && user.rol === 'Matriz' && (<Link to="/lentes" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Lentes</Link>)}
                </div>
              </div>
            </div>

            {/* Reportes dropdown */}
            {user && user.rol === 'Matriz' && (
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 inline-flex items-center">
                Reportes
              </button>
              <div className="absolute left-0 top-full w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transform -translate-y-2 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto z-50">
                <div className="py-1">
                  {user && user.rol === 'Matriz' && (<Link to="/reportes/desempeno-asesor" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Desempeño por Asesor</Link>)}
                  {user && user.rol === 'Matriz' && (<Link to="/reportes/pagos-clientes" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Pagos de Clientes</Link>)}
                  {user && user.rol === 'Matriz' && (<Link to="/reportes/rutas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Rutas</Link>)}
                  {user && user.rol === 'Matriz' && (<Link to="/reportes/balance" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Balance</Link>)}
                </div>
              </div>
            </div>
            )}

            <Link to="/ventas/new/unified" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Contrato de Venta</Link>
            <Link to="/entregas/complete" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Registrar Entrega</Link>
            {user && user.puesto === 'Asesor' && (<Link to="/ruta-asesor" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Ruta Asesor</Link>)}
            {user && user.rol === 'Matriz' && (<Link to="/admin/prices" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Precios</Link>)}
            {user && user.rol === 'Matriz' && (<Link to="/admin/database" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">BD</Link>)}
          </div>

          {/* Mobile navigation */}
          <div className={`md:hidden mobile-menu-container overflow-hidden transition-all duration-500 ease-in-out ${
            showMobileMenu ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
              <div className="px-2 pt-2 pb-3 space-y-1">
              <details className="group">
                <summary className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 cursor-pointer">Gestiones</summary>
                <div className="pl-4 mt-1 space-y-1">
                  {user && user.rol === 'Matriz' && (<Link to="/users" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Usuarios</Link>)}
                  {user && user.rol === 'Matriz' && (<Link to="/empleados" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Empleados</Link>)}
                  <Link to="/clients" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Clientes</Link>
                  <Link to="/pacientes" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Pacientes</Link>
                  <Link to="/ventas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Ventas</Link>
                  <Link to="/rutas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Rutas</Link>
                  <Link to="/pagos" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Pagos</Link>
                  <Link to="/entregas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Entregas</Link>
                  <Link to="/gasto-rutas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Gastos de Ruta</Link>
                  {user && user.rol === 'Matriz' && (<Link to="/lentes" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Lentes</Link>)}
                </div>
              </details>

              <details className="group">
                <summary className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 cursor-pointer">Reportes</summary>
                <div className="pl-4 mt-1 space-y-1">
                  {user && user.rol === 'Matriz' && (<Link to="/reportes/desempeno-asesor" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Desempeño por Asesor</Link>)}
                  {user && user.rol === 'Matriz' && (<Link to="/reportes/pagos-clientes" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Pagos de Clientes</Link>)}
                  {user && user.rol === 'Matriz' && (<Link to="/reportes/rutas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Rutas</Link>)}
                  {user && user.rol === 'Matriz' && (<Link to="/reportes/balance" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Balance</Link>)}
                </div>
              </details>

              <Link to="/ventas/new/unified" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Contrato de Venta</Link>
              <Link to="/entregas/complete" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Registrar Entrega</Link>
              {user && user.puesto === 'Asesor' && (<Link to="/ruta-asesor" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Ruta Asesor</Link>)}
              {user && user.rol === 'Matriz' && (<Link to="/admin/prices" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Precios</Link>)}
              {user && user.rol === 'Matriz' && (<Link to="/admin/database" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Base de Datos</Link>)}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default NavComponent;