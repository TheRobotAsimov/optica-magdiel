import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import rutaService from '../../service/rutaService';
import notificacionService from '../../service/notificacionService';
import entregaService from '../../service/entregaService';
import ventaService from '../../service/ventaService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { Search, PlusCircle, Edit, Trash2, Eye, X, MapPin, AlertCircle, ShoppingCart, Truck } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

const RutaList = () => {
  const { user } = useAuth();
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [rutaDetails, setRutaDetails] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const navigate = useNavigate();

  const getBadgeClass = (estatus) => {
    switch (estatus) {
      case 'Finalizada':
        return 'bg-green-100 text-green-800';
      case 'Activa':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completada':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        let data = await rutaService.getAllRutas();
        if (user.rol === 'Asesor') {
          data = data.filter(ruta => ruta.idasesor === user.idempleado);
        }
        setRutas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRutas();
  }, [user]);

  const handleDelete = async (id) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      // Mostrar modal para solicitar motivo
      Swal.fire({
        title: 'Solicitar Eliminación',
        input: 'textarea',
        inputLabel: 'Motivo de la solicitud',
        inputPlaceholder: 'Describe por qué deseas eliminar esta ruta...',
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
            const mensaje = `Solicitud de eliminación - Ruta ID: ${id}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
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

  const handleView = async (rutaId) => {
    try {
      const ruta = await rutaService.getRutaById(rutaId);
      setRutaDetails(ruta);

      const allEntregas = await entregaService.getAllEntregas();
      const rutaEntregas = allEntregas.filter(e => e.idruta === rutaId);
      setEntregas(rutaEntregas);

      const allVentas = await ventaService.getAllVentas();
      const rutaVentas = allVentas.filter(v => v.idasesor === ruta.idasesor && v.fecha === ruta.fecha);
      setVentas(rutaVentas);

      setShowModal(true);
    } catch (error) {
      console.error('Error fetching ruta details:', error);
      Swal.fire('Error', 'No se pudieron cargar los detalles de la ruta.', 'error');
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
                    RUTAS
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Listado de rutas registradas en el sistema
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
                      placeholder="Buscar ruta..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-200 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                    Aplicar filtro
                  </button>
                </div>

                {/* Botón Nueva Ruta (separado) */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/rutas/new')}
                    className="flex items-center space-x-2 px-8 py-2 bg-gradient-to-r from-purple-500 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-purple-300 disabled:to-purple-400 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>Nueva Ruta</span>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asesor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Inicio</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Fin</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {rutas.map((ruta) => (
                      <tr
                        key={ruta.idruta}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ease-in-out group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                            {ruta.idruta}
                          </span>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ruta.asesor_nombre} {ruta.asesor_paterno}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ruta.fecha).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ruta.hora_inicio}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ruta.hora_fin}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(ruta.estatus)}`}>
                          {ruta.estatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleView(ruta.idruta)}
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
                                  inputPlaceholder: 'Describe por qué deseas editar esta ruta...',
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
                                      const mensaje = `Solicitud de edición - Ruta ID: ${ruta.idruta}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
                                      await notificacionService.create(mensaje);
                                      Swal.fire('Solicitud enviada', 'Tu solicitud ha sido enviada al administrador.', 'success');
                                    } catch {
                                      Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error');
                                    }
                                  }
                                });
                              } else {
                                navigate(`/rutas/${ruta.idruta}/edit`);
                              }
                            }}
                            className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ruta.idruta)}
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

      {showModal && rutaDetails && (() => {
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        Detalles de la Ruta
                      </h2>
                      <p className="text-blue-100 text-sm mt-1">
                        Información completa y registros asociados
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
                {/* Sección 1: Información de la ruta */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-blue-600 p-2 rounded-lg">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Información de la Ruta</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Ruta</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{rutaDetails.idruta}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Asesor</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{rutaDetails.asesor_nombre} {rutaDetails.asesor_paterno}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{new Date(rutaDetails.fecha).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora Inicio</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{rutaDetails.hora_inicio}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora Fin</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{rutaDetails.hora_fin}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(rutaDetails.estatus)}`}>
                            {rutaDetails.estatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lentes Entregados</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{rutaDetails.lentes_entregados}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarjetas Entregadas</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{rutaDetails.tarjetas_entregadas}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lentes No Entregados</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{rutaDetails.lentes_no_entregados}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarjetas No Entregadas</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{rutaDetails.tarjetas_no_entregadas}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lentes Recibidos</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{rutaDetails.lentes_recibidos}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarjetas Recibidas</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{rutaDetails.tarjetas_recibidas}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Entregas relacionadas */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-green-600 p-2 rounded-lg">
                        <Truck className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Entregas Relacionadas</h3>
                    </div>

                    {entregas.length > 0 ? (
                      <div className="space-y-3">
                        {entregas.map(entrega => (
                          <div key={entrega.identrega} className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Truck className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">Entrega ID: {entrega.identrega}</p>
                              <p className="text-sm text-gray-600">
                                Tipo: {entrega.idlente ? 'Lentes' : 'Tarjeta'}{entrega.folio && ` • Folio: ${entrega.folio}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-block bg-gray-100 p-3 rounded-full mb-3">
                          <Truck className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">No hay entregas relacionadas</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sección 3: Ventas relacionadas */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-purple-600 p-2 rounded-lg">
                        <ShoppingCart className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Ventas Relacionadas</h3>
                    </div>

                    {ventas.length > 0 ? (
                      <div className="space-y-3">
                        {ventas.map(venta => (
                          <div key={venta.folio} className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <ShoppingCart className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">Venta - Folio: {venta.folio}</p>
                              <p className="text-sm text-gray-600">
                                Fecha: {new Date(venta.fecha).toLocaleDateString()} • Total: <span className="font-semibold">${venta.total}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-block bg-gray-100 p-3 rounded-full mb-3">
                          <ShoppingCart className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">No hay ventas relacionadas</p>
                      </div>
                    )}
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

export default RutaList;
