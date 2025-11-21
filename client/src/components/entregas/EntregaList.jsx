import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import entregaService from '../../service/entregaService';
import notificacionService from '../../service/notificacionService';
import lenteService from '../../service/lenteService';
import pagoService from '../../service/pagoService';
import ventaService from '../../service/ventaService';
import clientService from '../../service/clientService';
import empleadoService from '../../service/empleadoService';
import rutaService from '../../service/rutaService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { Search, PlusCircle, Edit, Trash2, Eye, X, Truck, ShoppingCart, User, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

const EntregaList = () => {
  const { user } = useAuth();
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [entregaDetails, setEntregaDetails] = useState(null);
  const [associatedData, setAssociatedData] = useState(null);
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

  const handleView = async (id) => {
    try {
      const entrega = await entregaService.getEntregaById(id);
      setEntregaDetails(entrega);

      let data = {};
      if (entrega.idlente) {
        const lente = await lenteService.getLenteById(entrega.idlente);
        const venta = await ventaService.getVentaByFolio(lente.folio);
        const cliente = await clientService.getClientById(venta.idcliente);
        const asesor = await empleadoService.getEmpleadoById(venta.idasesor);
        data = { type: 'lente', lente, venta, cliente, asesor };
      } else if (entrega.idpago) {
        const pago = await pagoService.getPagoById(entrega.idpago);
        const venta = await ventaService.getVentaByFolio(pago.folio);
        const cliente = await clientService.getClientById(venta.idcliente);
        const asesor = await empleadoService.getEmpleadoById(venta.idasesor);
        data = { type: 'pago', pago, venta, cliente, asesor };
      }

      const ruta = await rutaService.getRutaById(entrega.idruta);
      data.ruta = ruta;

      setAssociatedData(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching entrega details:', error);
      Swal.fire('Error', 'No se pudieron cargar los detalles de la entrega.', 'error');
    }
  };

  const filteredEntregas = entregas.filter(entrega =>
    String(entrega.idruta).includes(searchTerm) ||
    entrega.estatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeClass = (estatus) => {
    switch (estatus) {
      case 'Entregado':
        return 'bg-green-100 text-green-800';
      case 'No entregado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeClass(entrega.estatus)}`}>
                          {entrega.estatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrega.hora}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleView(entrega.identrega)}
                            className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                            title="Ver Detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
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

      {showModal && entregaDetails && associatedData && (() => {
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <Truck className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        Detalles de la Entrega
                      </h2>
                      <p className="text-blue-100 text-sm mt-1">
                        Información completa de la entrega y elementos asociados
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-8 space-y-8">
                {/* Sección 1: Información de la entrega */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-blue-600 p-2 rounded-lg">
                        <Truck className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Información de la Entrega</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <Truck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Entrega</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{entregaDetails.identrega}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ruta</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{entregaDetails.idruta}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha de Ruta</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{new Date(associatedData.ruta.fecha).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <Truck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{entregaDetails.hora}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <Truck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(entregaDetails.estatus)}`}>
                            {entregaDetails.estatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <Truck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Motivo</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{entregaDetails.motivo}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Información del asesor de la ruta */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-purple-600 p-2 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Asesor de la Ruta</h3>
                    </div>

                    <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{associatedData.ruta.asesor_nombre} {associatedData.ruta.asesor_paterno}</p>
                        <p className="text-sm text-gray-600">Asesor asignado a la ruta</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección 3: Elemento asociado (Lente o Pago) */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-green-600 p-2 rounded-lg">
                        {associatedData.type === 'lente' ? <Truck className="h-5 w-5 text-white" /> : <ShoppingCart className="h-5 w-5 text-white" />}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {associatedData.type === 'lente' ? 'Lentes Asociados' : 'Pago Asociado'}
                      </h3>
                    </div>

                    {associatedData.type === 'lente' ? (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                          <p className="font-semibold text-gray-900">Folio de Venta: {associatedData.lente.folio}</p>
                          <p className="text-sm text-gray-600">Tipo de lente: {associatedData.lente.tipo_de_lente}</p>
                          <p className="text-sm text-gray-600">Material: {associatedData.lente.material}</p>
                          <p className="text-sm text-gray-600">Tratamiento: {associatedData.lente.tratamiento}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                          <p className="font-semibold text-gray-900">Folio de Pago: {associatedData.pago.folio}</p>
                          <p className="text-sm text-gray-600">Cantidad: ${associatedData.pago.cantidad}</p>
                          <p className="text-sm text-gray-600">Fecha: {new Date(associatedData.pago.fecha).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">Estatus: {associatedData.pago.estatus}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sección 4: Información del cliente */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-orange-600 p-2 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Cliente Asociado</h3>
                    </div>

                    <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <User className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{associatedData.cliente.nombre} {associatedData.cliente.paterno} {associatedData.cliente.materno}</p>
                        <p className="text-sm text-gray-600">Cliente de la venta</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default EntregaList;
