import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import rutaService from '../../service/rutaService';
import NavComponent from '../common/NavBar';
import { Search, PlusCircle, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

const RutaList = () => {
  const { user } = useAuth();
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const data = await rutaService.getAllRutas();
        setRutas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRutas();
  }, []);

  const handleDelete = async (id) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      Swal.fire({
        title: 'No permitido',
        text: 'No tienes permisos para realizar esta acción. Por favor, contacta a un usuario Matriz para solicitar el cambio.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡bórralo!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await rutaService.deleteRuta(id);
        setRutas(rutas.filter(r => r.idruta !== id));
        Swal.fire(
          '¡Borrado!',
          'La ruta ha sido eliminada.',
          'success'
        )
      } catch (err) {
        setError(err.message);
        Swal.fire(
          'Error',
          'Hubo un problema al eliminar la ruta.',
          'error'
        )
      }
    }
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
        
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">RUTAS</h1>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">

                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar ruta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-0 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/rutas/new')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>Nueva Ruta</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asesor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lentes Entregados</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Inicio</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Fin</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rutas.map((ruta) => (
                    <tr key={ruta.idruta}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ruta.asesor_nombre} {ruta.asesor_paterno}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ruta.fecha).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ruta.lentes_entregados}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ruta.hora_inicio}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ruta.hora_fin}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ruta.estatus}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => {
                          if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
                            Swal.fire({
                              title: 'No permitido',
                              text: 'No tienes permisos para realizar esta acción. Por favor, contacta a un usuario Matriz para solicitar el cambio.',
                              icon: 'warning',
                              confirmButtonColor: '#3085d6',
                              confirmButtonText: 'Entendido'
                            });
                          } else {
                            navigate(`/rutas/${ruta.idruta}/edit`);
                          }
                        }} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(ruta.idruta)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
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
  );
};

export default RutaList;
