import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import pagoService from '../../service/pagoService';
import notificacionService from '../../service/notificacionService';
import NavComponent from '../common/NavBar';
import { Search, PlusCircle, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

const PagoList = () => {
  const { user } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const data = await pagoService.getAllPagos();
        setPagos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPagos();
  }, []);

  const handleDelete = async (id) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      // Mostrar modal para solicitar motivo
      Swal.fire({
        title: 'Solicitar Eliminación',
        input: 'textarea',
        inputLabel: 'Motivo de la solicitud',
        inputPlaceholder: 'Describe por qué deseas eliminar este pago...',
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
            const mensaje = `Solicitud de eliminación - Pago ID: ${id}, Motivo: ${result.value}`;
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
        await pagoService.deletePago(id);
        setPagos(pagos.filter(p => p.idpago !== id));
        Swal.fire(
          '¡Borrado!',
          'El pago ha sido eliminado.',
          'success'
        )
      } catch (err) {
        setError(err.message);
        Swal.fire(
          'Error',
          'Hubo un problema al eliminar el pago.',
          'error'
        )
      }
    }
  };

  const filteredPagos = pagos.filter(pago =>
    pago.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${pago.cliente_nombre} ${pago.cliente_paterno}`.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
        
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">PAGOS</h1>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">

                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por folio o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-0 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/pagos/new')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>Nuevo Pago</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPagos.map((pago) => (
                    <tr key={pago.idpago}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pago.folio}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${pago.cliente_nombre} ${pago.cliente_paterno}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(pago.fecha).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pago.cantidad}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pago.estatus}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => {
                          if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
                            // Mostrar modal para solicitar motivo
                            Swal.fire({
                              title: 'Solicitar Edición',
                              input: 'textarea',
                              inputLabel: 'Motivo de la solicitud',
                              inputPlaceholder: 'Describe por qué deseas editar este pago...',
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
                                  const mensaje = `Solicitud de edición - Pago ID: ${pago.idpago}, Motivo: ${result.value}`;
                                  await notificacionService.create(mensaje);
                                  Swal.fire('Solicitud enviada', 'Tu solicitud ha sido enviada al administrador.', 'success');
                                } catch {
                                  Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error');
                                }
                              }
                            });
                          } else {
                            navigate(`/pagos/${pago.idpago}/edit`);
                          }
                        }} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(pago.idpago)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
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

export default PagoList;
