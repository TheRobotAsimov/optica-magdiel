import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import rutaService from '../../service/rutaService';
import notificacionService from '../../service/notificacionService';
import entregaService from '../../service/entregaService';
import ventaService from '../../service/ventaService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { Eye, X, MapPin, ShoppingCart, Truck, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useListManager } from '../../hooks/useListManager';
import ListHeader from '../common/list/ListHeader';
import ListActions from '../common/list/ListActions';
import ListTable from '../common/list/ListTable';
import ListBadge from '../common/list/ListBadge';

const RutaList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const extraParams = useMemo(() => ({
    idasesor: user.rol === 'Asesor' ? user.idempleado : null
  }), [user]);

  const {
    items: rutas,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    handleDelete: baseHandleDelete
  } = useListManager(rutaService, 'deleteRuta', 'idruta', 'getAllRutas', extraParams);

  const [showModal, setShowModal] = useState(false);
  const [rutaDetails, setRutaDetails] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [ventas, setVentas] = useState([]);

  const getBadgeType = (estatus) => {
    switch (estatus) {
      case 'Finalizada':
      case 'Completada': return 'success';
      case 'Activa': return 'warning';
      case 'Cancelada': return 'danger';
      default: return 'default';
    }
  };

  const handleRequestAction = (action, id) => {
    Swal.fire({
      title: `Solicitar ${action === 'delete' ? 'Eliminación' : 'Edición'}`,
      input: 'textarea',
      inputLabel: 'Motivo de la solicitud',
      inputPlaceholder: `Describe por qué deseas ${action === 'delete' ? 'eliminar' : 'editar'} esta ruta...`,
      inputValidator: (value) => {
        if (!value) return 'Debes proporcionar un motivo';
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar Solicitud',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const mensaje = `Solicitud de ${action === 'delete' ? 'eliminación' : 'edición'} - Ruta ID: ${id}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
          await notificacionService.create(mensaje);
          Swal.fire('Solicitud enviada', 'Tu solicitud ha sido enviada al administrador.', 'success');
        } catch {
          Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error');
        }
      }
    });
  };

  const handleDelete = (id) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      handleRequestAction('delete', id);
      return;
    }
    baseHandleDelete(id, {
      successText: 'La ruta ha sido eliminada.',
      errorText: 'Hubo un problema al eliminar la ruta.'
    });
  };

  const handleEdit = (id) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      handleRequestAction('edit', id);
      return;
    }
    navigate(`/rutas/${id}/edit`);
  };

  const handleView = async (rutaId) => {
    try {
      const ruta = await rutaService.getRutaById(rutaId);
      setRutaDetails(ruta);

      // Background fetch for related details should have large limit
      const entregasRes = await entregaService.getAllEntregas({ limit: 1000 });
      const allEntregas = entregasRes.items || [];
      setEntregas(allEntregas.filter(e => e.idruta === rutaId));

      const ventasRes = await ventaService.getAllVentas({ limit: 1000 });
      const allVentas = ventasRes.items || [];
      setVentas(allVentas.filter(v => v.idasesor === ruta.idasesor && v.fecha === ruta.fecha));

      setShowModal(true);
    } catch (error) {
      console.error('Error fetching ruta details:', error);
      Swal.fire('Error', 'No se pudieron cargar los detalles de la ruta.', 'error');
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <ListHeader
          title="RUTAS"
          subtitle="Listado de rutas registradas en el sistema"
        />

        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">

            <ListActions
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por ID o estatus..."
              newItemLabel="Nueva Ruta"
              newItemLink="/rutas/new"
              onApplyFilter={() => { }}
            />

            <ListTable
              headers={['ID', 'Asesor', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Estatus', 'Acciones']}
              pagination={{
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                onPageChange: setCurrentPage,
                onItemsPerPageChange: setItemsPerPage
              }}
            >
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ruta.asesor_nombre} {ruta.asesor_paterno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ruta.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ruta.hora_inicio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ruta.hora_fin}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ListBadge text={ruta.estatus} type={getBadgeType(ruta.estatus)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button onClick={() => handleView(ruta.idruta)} className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Ver Detalles"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => handleEdit(ruta.idruta)} className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Editar"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(ruta.idruta)} className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </ListTable>
          </div>
        </div>
      </div>

      {showModal && rutaDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl"><MapPin className="h-8 w-8 text-white" /></div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Detalles de la Ruta</h2>
                    <p className="text-blue-100 text-sm mt-1">Información completa y registros asociados</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-200"><X className="h-6 w-6" /></button>
              </div>
            </div>

            <div className="overflow-y-auto p-8 space-y-8">
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg"><MapPin className="h-5 w-5 text-white" /></div>
                    <h3 className="text-xl font-bold text-gray-900">Información de la Ruta</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'ID Ruta', value: rutaDetails.idruta },
                      { label: 'Asesor', value: `${rutaDetails.asesor_nombre} ${rutaDetails.asesor_paterno}` },
                      { label: 'Fecha', value: new Date(rutaDetails.fecha).toLocaleDateString() },
                      { label: 'Hora Inicio', value: rutaDetails.hora_inicio },
                      { label: 'Hora Fin', value: rutaDetails.hora_fin },
                      { label: 'Estatus', value: rutaDetails.estatus, isBadge: true },
                      { label: 'Lentes Entregados', value: rutaDetails.lentes_entregados },
                      { label: 'Tarjetas Entregadas', value: rutaDetails.tarjetas_entregadas },
                      { label: 'Lentes No Entregados', value: rutaDetails.lentes_no_entregados },
                      { label: 'Tarjetas No Entregadas', value: rutaDetails.tarjetas_no_entregadas },
                      { label: 'Lentes Recibidos', value: rutaDetails.lentes_recibidos },
                      { label: 'Tarjetas Recibidas', value: rutaDetails.tarjetas_recibidas },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5"><MapPin className="h-4 w-4 text-blue-600" /></div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                          {item.isBadge ? (
                            <ListBadge text={item.value} type={getBadgeType(item.value)} />
                          ) : (
                            <p className="text-base font-semibold text-gray-900 mt-1">{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-green-600 p-2 rounded-lg"><Truck className="h-5 w-5 text-white" /></div>
                    <h3 className="text-xl font-bold text-gray-900">Entregas Relacionadas</h3>
                  </div>
                  {entregas.length > 0 ? (
                    <div className="space-y-3">
                      {entregas.map(entrega => (
                        <div key={entrega.identrega} className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm">
                          <div className="bg-green-100 p-2 rounded-lg"><Truck className="h-5 w-5 text-green-600" /></div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">Entrega ID: {entrega.identrega}</p>
                            <p className="text-sm text-gray-600">Tipo: {entrega.idlente ? 'Lentes' : 'Tarjeta'}{entrega.folio && ` • Folio: ${entrega.folio}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-block bg-gray-100 p-3 rounded-full mb-3"><Truck className="h-8 w-8 text-gray-400" /></div>
                      <p className="text-gray-600 font-medium">No hay entregas relacionadas</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-purple-600 p-2 rounded-lg"><ShoppingCart className="h-5 w-5 text-white" /></div>
                    <h3 className="text-xl font-bold text-gray-900">Ventas Relacionadas</h3>
                  </div>
                  {ventas.length > 0 ? (
                    <div className="space-y-3">
                      {ventas.map(venta => (
                        <div key={venta.folio} className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm">
                          <div className="bg-purple-100 p-2 rounded-lg"><ShoppingCart className="h-5 w-5 text-purple-600" /></div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">Venta - Folio: {venta.folio}</p>
                            <p className="text-sm text-gray-600">Fecha: {new Date(venta.fecha).toLocaleDateString()} • Total: <span className="font-semibold">${venta.total}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-block bg-gray-100 p-3 rounded-full mb-3"><ShoppingCart className="h-8 w-8 text-gray-400" /></div>
                      <p className="text-gray-600 font-medium">No hay ventas relacionadas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowModal(false)} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RutaList;
