import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router';
import { User, Bell, Menu, X, Check, MailOpen} from 'lucide-react';
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

          {/* Notificaciones */}
          <div className="flex items-center space-x-4">
            {user && user.rol === 'Matriz' && (
              <div className="relative" ref={notificationRef}>
                {/* Botón Campana */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 transition-all duration-200 rounded-full hover:bg-white/10 focus:outline-none ${
                    showNotifications ? 'bg-white/10 text-blue-200' : 'text-white hover:text-blue-100'
                  }`}
                >
                  <Bell className={`h-6 w-6 ${unreadCount > 0 ? 'animate-swing' : ''}`} /> {/* animate-swing es opcional si tienes config */}
                  
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center border-2 border-blue-900/50">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </span>
                  )}
                </button>

                {/* Dropdown de Notificaciones */}
                {showNotifications && (
                  <div className="
                    fixed top-16 right-4 left-4 z-50 
                    md:absolute md:top-full md:right-0 md:left-auto md:mt-3 md:w-96
                    bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden 
                    transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2
                  ">  
                    {/* Header del Dropdown */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Notificaciones
                        {unreadCount > 0 && (
                          <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">
                            {unreadCount} nuevas
                          </span>
                        )}
                      </h3>
                      {/* Opcional: Botón cerrar o marcar todo */}
                      <button 
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-gray-600"
                      >
                          <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Lista de Notificaciones */}
                    <div className="max-h-[60vh] md:max-h-[28rem] overflow-y-auto custom-scrollbar">
                      {notificaciones.filter(notif => !notif.leido).length === 0 ? (
                        // Estado Vacío (Empty State)
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                          <div className="bg-gray-50 p-3 rounded-full mb-3">
                            <MailOpen className="h-8 w-8 text-gray-300" />
                          </div>
                          <p className="text-gray-500 font-medium text-sm">¡Estás al día!</p>
                          <p className="text-gray-400 text-xs mt-1">No tienes notificaciones pendientes.</p>
                        </div>
                      ) : (
                        // Lista de Items
                        <ul className="divide-y divide-gray-50">
                          {notificaciones.filter(notif => !notif.leido).map((notif) => (
                            <li 
                              key={notif.idnotificacion || notif.fecha} 
                              className="group relative bg-white hover:bg-blue-50/50 transition-colors duration-200 p-4"
                            >
                              <div className="flex gap-3 items-start">
                                {/* Indicador de no leído */}
                                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500 ring-2 ring-blue-100"></div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800 leading-snug break-words">
                                    {notif.mensaje}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1.5 font-medium">
                                    {new Date(notif.fecha).toLocaleDateString('es-ES', { 
                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                                    })}
                                  </p>
                                </div>

                                {/* Botón de Acción (Marcar como leída) */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notif.idnotificacion);
                                  }}
                                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                  title="Marcar como leída"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    {/* Footer opcional (Ver todas) */}
                    <div className="bg-gray-50 border-t border-gray-100 p-2 text-center">
                      
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
                  {user && user.rol === 'Matriz' && user.rol !== 'Optometrista' && (<Link to="/users" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Usuarios</Link>)}
                  {user && user.rol === 'Matriz' && user.rol !== 'Optometrista' && (<Link to="/empleados" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Empleados</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/clients" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Clientes</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/pacientes" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Pacientes</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/ventas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Ventas</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/rutas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Rutas</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/pagos" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Pagos</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/entregas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Entregas</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/gasto-rutas" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Gastos de Ruta</Link>)}
                  {user && (user.rol === 'Matriz' || user.rol === 'Optometrista') && (<Link to="/lentes" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:text-blue-600">Lentes</Link>)}
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

            {user && user.rol !== 'Optometrista' && (<Link to="/ventas/new/unified" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Contrato de Venta</Link>)}
            {user && user.rol !== 'Optometrista' && (<Link to="/entregas/complete" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Registrar Entrega</Link>)}
            {user && user.puesto === 'Asesor' && user.rol !== 'Optometrista' && (<Link to="/ruta-asesor" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Ruta Asesor</Link>)}
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
                  {user && user.rol === 'Matriz' && user.rol !== 'Optometrista' && (<Link to="/users" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Usuarios</Link>)}
                  {user && user.rol === 'Matriz' && user.rol !== 'Optometrista' && (<Link to="/empleados" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Empleados</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/clients" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Clientes</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/pacientes" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Pacientes</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/ventas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Ventas</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/rutas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Rutas</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/pagos" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Pagos</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/entregas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Entregas</Link>)}
                  {user && user.rol !== 'Optometrista' && (<Link to="/gasto-rutas" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Gastos de Ruta</Link>)}
                  {user && (user.rol === 'Matriz' || user.rol === 'Optometrista') && (<Link to="/lentes" className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">Lentes</Link>)}
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

              {user && user.rol !== 'Optometrista' && (<Link to="/ventas/new/unified" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Contrato de Venta</Link>)}
              {user && user.rol !== 'Optometrista' && (<Link to="/entregas/complete" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Registrar Entrega</Link>)}
              {user && user.puesto === 'Asesor' && user.rol !== 'Optometrista' && (<Link to="/ruta-asesor" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">Ruta Asesor</Link>)}
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