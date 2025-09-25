import { useEffect, useState } from 'react';
import empleadoService from '../../service/empleadoService';
import NavComponent from '../common/NavBar';
import { Search, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';

const EmpleadoList = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const data = await empleadoService.getAllEmpleados();
        setEmpleados(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleados();
  }, []);

  const handleDelete = async (empleadoId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, bórralo!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await empleadoService.deleteEmpleado(empleadoId);
          setEmpleados(empleados.filter((empleado) => empleado.idempleado !== empleadoId));
          Swal.fire(
            '¡Eliminado!',
            'El empleado ha sido eliminado.',
            'success'
          )
        } catch {
            Swal.fire(
                '¡Error!',
                'No se pudo eliminar el empleado.',
                'error'
            )
        }
      }
    })
  };

  const handleEdit = (empleadoId) => {
    navigate(`/empleados/${empleadoId}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavComponent />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavComponent />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
        
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">EMPLEADOS</h1>
                
                {/* Search and Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Buscar Empleado"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-200 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                      Aplicar filtro
                    </button>
                    <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                      <Link to="/empleados/new">Nuevo Empleado</Link>
                    </button>
                    <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors">
                      Reporte
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puesto</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {empleados.map((empleado) => (
                        <tr key={empleado.idempleado} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {empleado.idempleado}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {empleado.nombre} {empleado.paterno} {empleado.materno}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {empleado.puesto}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {empleado.telefono}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {empleado.estado}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => handleEdit(empleado.idempleado)} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDelete(empleado.idempleado)} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

      </div>
          </div>
      </div>
    </div>
  );
};

export default EmpleadoList;
