import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router';
import NavComponent from '../common/NavBar';
import { Users, Briefcase, UserCheck, ShoppingCart, MapPin, DollarSign, Package, Receipt, Glasses, FileText, Truck, Settings, Database, LayoutDashboard, Activity } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  const menuSections = [
    {
      id: 'gestiones',
      title: 'GESTIONES',
      color: 'blue',
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-indigo-600',
      borderColor: 'border-blue-500',
      items: [
        ...(user?.rol === 'Matriz' ? [
          { title: 'Usuarios', icon: Users, path: '/users', gradient: 'from-blue-500 to-blue-600' },
          { title: 'Empleados', icon: Briefcase, path: '/empleados', gradient: 'from-blue-500 to-indigo-500' },
        ] : []),
        { title: 'Clientes', icon: UserCheck, path: '/clients', gradient: 'from-indigo-500 to-purple-500' },
        { title: 'Pacientes', icon: Activity, path: '/pacientes', gradient: 'from-purple-500 to-pink-500' },
        { title: 'Ventas', icon: ShoppingCart, path: '/ventas', gradient: 'from-pink-500 to-rose-500' },
        { title: 'Rutas', icon: MapPin, path: '/rutas', gradient: 'from-rose-500 to-red-500' },
        { title: 'Pagos', icon: DollarSign, path: '/pagos', gradient: 'from-blue-500 to-cyan-500' },
        { title: 'Entregas', icon: Package, path: '/entregas', gradient: 'from-cyan-500 to-teal-500' },
        { title: 'Gastos de Ruta', icon: Receipt, path: '/gasto-rutas', gradient: 'from-teal-500 to-green-500' },
        ...(user?.rol === 'Matriz' ? [
          { title: 'Lentes', icon: Glasses, path: '/lentes', gradient: 'from-violet-500 to-purple-500' },
        ] : []),
      ]
    },
    {
      id: 'acciones',
      title: 'ACCIONES RÁPIDAS',
      color: 'emerald',
      gradientFrom: 'from-emerald-600',
      gradientTo: 'to-green-600',
      borderColor: 'border-emerald-500',
      items: [
        { title: 'Contrato de Venta', icon: FileText, path: '/ventas/new/unified', gradient: 'from-emerald-500 to-green-500' },
        { title: 'Registrar Entrega', icon: Truck, path: '/entregas/complete', gradient: 'from-green-500 to-teal-500' },
        ...(user?.puesto === 'Asesor' ? [
          { title: 'Ruta Asesor', icon: MapPin, path: '/ruta-asesor', gradient: 'from-teal-500 to-cyan-500' },
        ] : []),
      ]
    },
    ...(user?.rol === 'Matriz' ? [{
      id: 'reportes',
      title: 'REPORTES',
      color: 'purple',
      gradientFrom: 'from-purple-600',
      gradientTo: 'to-pink-600',
      borderColor: 'border-purple-500',
      items: [
        { title: 'Rutas', icon: FileText, path: '/reportes/rutas', gradient: 'from-purple-500 to-violet-500' },
        { title: 'Desempeño por Asesor', icon: FileText, path: '/reportes/desempeno-asesor', gradient: 'from-violet-500 to-indigo-500' },
        { title: 'Pagos de Clientes', icon: FileText, path: '/reportes/pagos-clientes', gradient: 'from-indigo-500 to-blue-500' },
        { title: 'Balance', icon: FileText, path: '/reportes/balance', gradient: 'from-fuchsia-500 to-pink-500' },
      ]
    }] : []),
    ...(user?.rol === 'Matriz' ? [{
      id: 'administracion',
      title: 'ADMINISTRACIÓN',
      color: 'slate',
      gradientFrom: 'from-slate-600',
      gradientTo: 'to-gray-600',
      borderColor: 'border-slate-500',
      items: [
        { title: 'Precios', icon: Settings, path: '/admin/prices', gradient: 'from-slate-500 to-gray-500' },
        { title: 'Base de Datos', icon: Database, path: '/admin/database', gradient: 'from-gray-500 to-zinc-500' },
      ]
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <NavComponent/>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-10">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <LayoutDashboard className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Bienvenido, {user?.nombre}
                </h1>
                <p className="text-blue-100 text-lg">
                  {user?.rol} {user?.puesto && `• ${user?.puesto}`}
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Sistema Activo</span>
              </div>
              <div className="hidden md:block">
                <span className="font-medium">{user?.correo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <div 
            key={section.id}
            className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100 transform transition-all duration-300 hover:shadow-2xl"
          >
            {/* Section Header */}
            <div className={`bg-gradient-to-r ${section.gradientFrom} ${section.gradientTo} px-8 py-6`}>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <div className="w-8 h-8 bg-white/30 rounded-lg"></div>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-wide">
                  {section.title}
                </h2>
              </div>
            </div>

            {/* Section Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {section.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                      style={{
                        animationDelay: `${idx * 50}ms`
                      }}
                    >
                      {/* Gradient Background */}
                      <div className={`bg-gradient-to-br ${item.gradient} p-6 h-40 flex flex-col items-center justify-center relative overflow-hidden`}>
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0 bg-white transform rotate-12 scale-150 group-hover:rotate-45 transition-transform duration-700"></div>
                        </div>
                        
                        {/* Icon */}
                        <div className="relative z-10 bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <Icon className="h-10 w-10 text-white" strokeWidth={2.5} />
                        </div>
                        
                        {/* Title */}
                        <span className="relative z-10 text-center font-bold text-base text-white px-2 group-hover:scale-105 transition-transform duration-300">
                          {item.title}
                        </span>
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                      </div>

                      {/* Bottom Accent Bar */}
                      <div className="h-1 bg-gradient-to-r from-white/50 to-white/80 group-hover:h-2 transition-all duration-300"></div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Footer Info */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-6 mt-8">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm font-medium">
              Panel de Control • Sistema de Gestión
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};