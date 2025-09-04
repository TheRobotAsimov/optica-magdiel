import { useAuth } from '../../context/AuthContext'

export const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Sistema de Gestión</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Bienvenido, {user?.nombre} {user?.paterno}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Información del Usuario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.nombre} {user?.paterno} {user?.materno}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.correo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de Usuario</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.tipo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Contratación</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.feccon ? new Date(user.feccon).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.telefono}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sueldo</p>
                  <p className="mt-1 text-sm text-gray-900">
                    ${user?.sueldo ? parseFloat(user.sueldo).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};