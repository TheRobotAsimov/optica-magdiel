import { useState } from 'react';
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
import { Eye, X, Truck, ShoppingCart, User, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useListManager } from '../../hooks/useListManager';
import ListHeader from '../common/list/ListHeader';
import ListActions from '../common/list/ListActions';
import ListTable from '../common/list/ListTable';
import ListBadge from '../common/list/ListBadge';

const EntregaList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    items: entregas,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    handleSearch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    handleDelete: baseHandleDelete
  } = useListManager(entregaService, 'deleteEntrega', 'identrega', 'getAllEntregas');

  const [showModal, setShowModal] = useState(false);
  const [entregaDetails, setEntregaDetails] = useState(null);
  const [associatedData, setAssociatedData] = useState(null);

  const getBadgeType = (estatus) => {
    switch (estatus) {
      case 'Entregado': return 'success';
      case 'No entregado': return 'danger';
      default: return 'default';
    }
  };

  const handleRequestAction = (action, id) => {
    Swal.fire({
      title: `Solicitar ${action === 'delete' ? 'Eliminación' : 'Edición'}`,
      input: 'textarea',
      inputLabel: 'Motivo de la solicitud',
      inputPlaceholder: `Describe por qué deseas ${action === 'delete' ? 'eliminar' : 'editar'} esta entrega...`,
      inputValidator: (value) => {
        if (!value) return 'Debes proporcionar un motivo';
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar Solicitud',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const mensaje = `Solicitud de ${action === 'delete' ? 'eliminación' : 'edición'} - Entrega ID: ${id}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
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
      successText: 'La entrega ha sido eliminada.',
      errorText: 'Hubo un problema al eliminar la entrega.'
    });
  };

  const handleEdit = (id) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      handleRequestAction('edit', id);
      return;
    }
    navigate(`/entregas/${id}/edit`);
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

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <ListHeader
          title="ENTREGAS"
          subtitle="Listado de entregas registradas en el sistema"
        />

        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">

            <ListActions
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por folio o estatus..."
              newItemLabel="Nueva Entrega"
              newItemLink="/entregas/new"
              onApplyFilter={handleSearch}
            />

            <ListTable
              headers={['ID', 'Ruta', 'Fecha de Ruta', 'Estatus', 'Hora', 'Acciones']}
              pagination={{
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                onPageChange: setCurrentPage,
                onItemsPerPageChange: setItemsPerPage
              }}
            >
              {entregas.map((entrega) => (
                <tr
                  key={entrega.identrega}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ease-in-out group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{entrega.identrega}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entrega.idruta}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entrega.ruta_fecha).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ListBadge text={entrega.estatus} type={getBadgeType(entrega.estatus)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrega.hora}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button onClick={() => handleView(entrega.identrega)} className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Ver Detalles"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => handleEdit(entrega.identrega)} className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Editar"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(entrega.identrega)} className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </ListTable>
          </div>
        </div>
      </div>

      {showModal && entregaDetails && associatedData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl"><Truck className="h-8 w-8 text-white" /></div>
                  <div><h2 className="text-3xl font-bold text-white">Detalles de la Entrega</h2><p className="text-blue-100 text-sm mt-1">Información completa de la entrega y elementos asociados</p></div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-200"><X className="h-6 w-6" /></button>
              </div>
            </div>

            <div className="overflow-y-auto p-8 space-y-8">
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6"><div className="bg-blue-600 p-2 rounded-lg"><Truck className="h-5 w-5 text-white" /></div><h3 className="text-xl font-bold text-gray-900">Información de la Entrega</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'ID Entrega', value: entregaDetails.identrega },
                      { label: 'Ruta', value: entregaDetails.idruta },
                      { label: 'Fecha de Ruta', value: new Date(associatedData.ruta.fecha).toLocaleDateString() },
                      { label: 'Hora', value: entregaDetails.hora },
                      { label: 'Motivo', value: entregaDetails.motivo },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5"><Truck className="h-4 w-4 text-blue-600" /></div>
                        <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p><p className="text-base font-semibold text-gray-900 mt-1">{item.value}</p></div>
                      </div>
                    ))}
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5"><Truck className="h-4 w-4 text-blue-600" /></div>
                      <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</p><ListBadge text={entregaDetails.estatus} type={getBadgeType(entregaDetails.estatus)} /></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center space-x-3 mb-6"><div className="bg-purple-600 p-2 rounded-lg"><User className="h-5 w-5 text-white" /></div><h3 className="text-xl font-bold text-gray-900">Asesor de la Ruta</h3></div>
                  <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm">
                    <div className="bg-purple-100 p-2 rounded-lg"><User className="h-5 w-5 text-purple-600" /></div>
                    <div className="flex-1"><p className="font-semibold text-gray-900">{associatedData.ruta.asesor_nombre} {associatedData.ruta.asesor_paterno}</p><p className="text-sm text-gray-600">Asesor asignado a la ruta</p></div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center space-x-3 mb-6"><div className="bg-green-600 p-2 rounded-lg">{associatedData.type === 'lente' ? <Truck className="h-5 w-5 text-white" /> : <ShoppingCart className="h-5 w-5 text-white" />}</div><h3 className="text-xl font-bold text-gray-900">{associatedData.type === 'lente' ? 'Lentes Asociados' : 'Pago Asociado'}</h3></div>
                  {associatedData.type === 'lente' ? (
                    <div className="bg-white p-4 rounded-xl shadow-sm"><p className="font-semibold text-gray-900">Folio de Venta: {associatedData.lente.folio}</p><p className="text-sm text-gray-600">Tipo de lente: {associatedData.lente.tipo_de_lente} • Material: {associatedData.lente.material} • Tratamiento: {associatedData.lente.tratamiento}</p></div>
                  ) : (
                    <div className="bg-white p-4 rounded-xl shadow-sm"><p className="font-semibold text-gray-900">Folio de Pago: {associatedData.pago.folio}</p><p className="text-sm text-gray-600">Cantidad: ${associatedData.pago.cantidad} • Fecha: {new Date(associatedData.pago.fecha).toLocaleDateString()} • Estatus: {associatedData.pago.estatus}</p></div>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                  <div className="flex items-center space-x-3 mb-6"><div className="bg-orange-600 p-2 rounded-lg"><User className="h-5 w-5 text-white" /></div><h3 className="text-xl font-bold text-gray-900">Cliente Asociado</h3></div>
                  <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm">
                    <div className="bg-orange-100 p-2 rounded-lg"><User className="h-5 w-5 text-orange-600" /></div>
                    <div className="flex-1"><p className="font-semibold text-gray-900">{associatedData.cliente.nombre} {associatedData.cliente.paterno} {associatedData.cliente.materno}</p><p className="text-sm text-gray-600">Cliente de la venta</p></div>
                  </div>
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

export default EntregaList;
