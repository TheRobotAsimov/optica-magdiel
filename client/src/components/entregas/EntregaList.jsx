import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import entregaService from '../../service/entregaService';
import notificacionService from '../../service/notificacionService';
import NavComponent from '../common/NavBar';
import { Search, PlusCircle, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

const EntregaList = () => {
  const { user } = useAuth();
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntregas = async () => {
      try {
        const data = await entregaService.getAllEntregas();
        setEntregas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEntregas();
  }, []);

  const handleDelete = async (id) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      // Mostrar modal para solicitar motivo
      Swal.fire({
        title: 'Solicitar Eliminación',
        input: 'textarea',
        inputLabel: 'Motivo de la solicitud',
        inputPlaceholder: 'Describe por qué deseas eliminar esta entrega...',
        inputValidator: (value) => {
          if (!value) {
            return 'Debes proporcionar un motivo';
          }
        },
        showCancelButton: true,
        confirmButtonText: 'Enviar Solicitud',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const mensaje = `Solicitud de eliminación - Entrega ID: ${id}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
            await notificacionService.create(mensaje);
            Swal.fire('Solicitud enviada', 'Tu solicitud ha sido enviada al administrador.', 'success');
          } catch {
            Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error');
          }
        }
      });
      return;
    }

    // Lógica original para usuarios Matriz
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
        await entregaService.deleteEntrega(id);
        setEntregas(entregas.filter(e => e.identrega !== id));
        Swal.fire(
          '¡Borrado!',
          'La entrega ha sido eliminada.',
          'success'
        )
      } catch (err) {
        setError(err.message);
        Swal.fire(
          'Error',
          'Hubo un problema al eliminar la entrega.',
          'error'
        )
      }
    }
  };

  const filteredEntregas = entregas.filter(entrega =>
    String(entrega.idruta).includes(searchTerm) ||
    entrega.estatus.toLowerCase().includes(searchTerm.toLowerCase())
  );


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

        <div className="bg-white rounded-4xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-400 to-indigo-800 px-8 py-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-4xl font-bold text-white text-center">
                    ENTREGAS
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Listado de entregas registradas en el sistema
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
        
            <div className="mb-8">
              {/* Search and Action Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
                {/* Grupo: Search + Botón Aplicar filtro */}
                <div className="flex items-center gap-4 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Buscar por ruta o estatus..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-200 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                    Aplicar filtro
                  </button>
                </div>

                {/* Botón Nueva Entrega (separado) */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/entregas/new')}
                    className="flex items-center space-x-2 px-8 py-2 bg-gradient-to-r from-purple-500 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-purple-300 disabled:to-purple-400 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>Nueva Entrega</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table Container */}
<div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Ruta</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    
                  </tr>
                </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredEntregas.map((entrega) => (
                      <tr
                        key={entrega.identrega}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ease-in-out group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                            {entrega.identrega}
                          </span>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entrega.idruta}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entrega.ruta_fecha).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrega.estatus}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrega.hora}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => {
                              if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
                                // Mostrar modal para solicitar motivo
                                Swal.fire({
                                  title: 'Solicitar Edición',
                                  input: 'textarea',
                                  inputLabel: 'Motivo de la solicitud',
                                  inputPlaceholder: 'Describe por qué deseas editar esta entrega...',
                                  inputValidator: (value) => {
                                    if (!value) {
                                      return 'Debes proporcionar un motivo';
                                    }
                                  },
                                  showCancelButton: true,
                                  confirmButtonText: 'Enviar Solicitud',
                                  cancelButtonText: 'Cancelar'
                                }).then(async (result) => {
                                  if (result.isConfirmed) {
                                    try {
                                      const mensaje = `Solicitud de edición - Entrega ID: ${entrega.identrega}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
                                      await notificacionService.create(mensaje);
                                      Swal.fire('Solicitud enviada', 'Tu solicitud ha sido enviada al administrador.', 'success');
                                    } catch {
                                      Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error');
                                    }
                                  }
                                });
                              } else {
                                navigate(`/entregas/${entrega.identrega}/edit`);
                              }
                            }}
                            className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entrega.identrega)}
                            className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                            title="Eliminar"
                          >
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

export default EntregaList;
