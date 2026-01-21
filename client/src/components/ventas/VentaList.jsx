import { useEffect, useState } from 'react';
import ventaService from '../../service/ventaService';
import notificacionService from '../../service/notificacionService';
import pagoService from '../../service/pagoService';
import lenteService from '../../service/lenteService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { Edit, Trash2, Eye, X, CreditCard, Glasses } from 'lucide-react';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useListManager } from '../../hooks/useListManager';
import ListHeader from '../common/list/ListHeader';
import ListActions from '../common/list/ListActions';
import ListTable from '../common/list/ListTable';
import ListBadge from '../common/list/ListBadge';

const VentaList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    items: ventas,
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
  } = useListManager(ventaService, 'deleteVenta', 'folio', 'getAllVentas');

  const [showModal, setShowModal] = useState(false);
  const [ventaDetails, setVentaDetails] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [lentes, setLentes] = useState([]);

  // fetchData is handled by useListManager automatically when pagination/search changes

  const getBadgeType = (estatus) => {
    switch (estatus) {
      case 'Pagado':
      case 'Entregado': return 'success';
      case 'Pendiente': return 'warning';
      case 'Atrasado': return 'danger';
      default: return 'default';
    }
  };

  const handleRequestAction = (action, folio) => {
    Swal.fire({
      title: `Solicitar ${action === 'delete' ? 'Eliminación' : 'Edición'}`,
      input: 'textarea',
      inputLabel: 'Motivo de la solicitud',
      inputPlaceholder: `Describe por qué deseas ${action === 'delete' ? 'eliminar' : 'editar'} esta venta...`,
      inputValidator: (value) => {
        if (!value) return 'Debes proporcionar un motivo';
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar Solicitud',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const mensaje = `Solicitud de ${action === 'delete' ? 'eliminación' : 'edición'} - Venta Folio: ${folio}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
          await notificacionService.create(mensaje);
          Swal.fire('Solicitud enviada', 'Tu solicitud ha sido enviada al administrador.', 'success');
        } catch {
          Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error');
        }
      }
    });
  };

  const handleDelete = (folio) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      handleRequestAction('delete', folio);
      return;
    }
    baseHandleDelete(folio, {
      successText: 'La venta ha sido eliminada.',
      errorText: 'No se pudo eliminar la venta.'
    });
  };

  const handleEdit = (folio) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      handleRequestAction('edit', folio);
      return;
    }
    navigate(`/ventas/${folio}/edit`);
  };

  const handleView = async (folio) => {
    try {
      const [venta, pagosRes, lentesRes] = await Promise.all([
        ventaService.getVentaByFolio(folio),
        pagoService.getAllPagos({ limit: 1000 }),
        lenteService.getAllLentes({ limit: 1000 })
      ]);

      const allPagos = pagosRes.items || [];
      const allLentes = lentesRes.items || [];

      setVentaDetails(venta);
      setPagos(allPagos.filter(p => p.folio === folio));
      setLentes(allLentes.filter(l => l.folio === folio));
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching venta details:', error);
      Swal.fire('Error', 'No se pudieron cargar los detalles de la venta.', 'error');
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <ListHeader
          title="VENTAS"
          subtitle="Listado de ventas registradas en el sistema"
        />

        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">

            <ListActions
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por folio, cliente o asesor..."
              newItemLabel="Nueva Venta"
              newItemLink="/ventas/new"
              onApplyFilter={() => { }}
            />

            <ListTable
              headers={['Folio', 'Asesor', 'Cliente', 'Fecha', 'Total', 'Estatus', 'Acciones']}
              pagination={{
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                onPageChange: setCurrentPage,
                onItemsPerPageChange: setItemsPerPage
              }}
            >
              {ventas.map((venta) => (
                <tr
                  key={venta.folio}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ease-in-out group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{venta.folio}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {venta.asesor_nombre} {venta.asesor_paterno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {venta.idcliente} - {venta.cliente_nombre} {venta.cliente_paterno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(venta.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${parseFloat(venta.total).toLocaleString('es-MX')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ListBadge text={venta.estatus} type={getBadgeType(venta.estatus)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-3">
                      <button onClick={() => handleView(venta.folio)} className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Ver Detalles"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => handleEdit(venta.folio)} className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Editar"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(venta.folio)} className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </ListTable>
          </div>
        </div>
      </div>

      {showModal && ventaDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl"><Eye className="h-8 w-8 text-white" /></div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Detalles de la Venta</h2>
                    <p className="text-blue-100 text-sm mt-1">Información completa del registro de venta</p>
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
                    <div className="bg-blue-600 p-2 rounded-lg"><Eye className="h-5 w-5 text-white" /></div>
                    <h3 className="text-xl font-bold text-gray-900">Información de la Venta</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Folio', value: ventaDetails.folio },
                      { label: 'Asesor', value: `${ventaDetails.asesor_nombre} ${ventaDetails.asesor_paterno}` },
                      { label: 'Cliente', value: `${ventaDetails.idcliente} - ${ventaDetails.cliente_nombre} ${ventaDetails.cliente_paterno}` },
                      { label: 'Fecha', value: new Date(ventaDetails.fecha).toLocaleDateString() },
                      { label: 'Tipo', value: ventaDetails.tipo },
                      { label: 'Enganche', value: `$${parseFloat(ventaDetails.enganche).toLocaleString('es-MX')}` },
                      { label: 'Total', value: `$${parseFloat(ventaDetails.total).toLocaleString('es-MX')}` },
                      { label: 'Cant. Pagos', value: ventaDetails.cant_pagos },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg mt-0.5"><span className="h-4 w-4 text-blue-600 font-bold">&#8226;</span></div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{item.value}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5"><span className="h-4 w-4 text-blue-600 font-bold">&#8226;</span></div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</p>
                        <ListBadge text={ventaDetails.estatus} type={getBadgeType(ventaDetails.estatus)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-green-600 p-2 rounded-lg"><CreditCard className="h-5 w-5 text-white" /></div>
                    <h3 className="text-xl font-bold text-gray-900">Pagos Asociados</h3>
                  </div>
                  <div className="space-y-3">
                    {pagos.map(p => (
                      <div key={p.idpago} className="flex items-center space-x-3 bg-white p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
                        <div className="bg-green-100 p-2 rounded-lg"><CreditCard className="h-5 w-5 text-green-600" /></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Pago - ID: {p.idpago}</p>
                          <p className="text-sm text-gray-600">Fecha: {new Date(p.fecha).toLocaleDateString()} • Monto: <span className="font-semibold">${parseFloat(p.cantidad).toLocaleString('es-MX')}</span></p>
                        </div>
                        <ListBadge text={p.estatus} type={getBadgeType(p.estatus)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 p-2 rounded-lg"><Glasses className="h-6 w-6 text-white" /></div>
                      <h3 className="text-xl font-bold text-white">Lentes Asociados</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    {lentes.length > 0 ? lentes.map(lente => (
                      <div key={lente.idlente} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-xs font-semibold text-blue-600 uppercase mb-1">ID</p>
                            <p className="text-lg font-bold text-blue-900">{lente.idlente}</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Material</p>
                            <p className="text-lg font-bold text-purple-900">{lente.material}</p>
                          </div>
                          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                            <p className="text-xs font-semibold text-indigo-600 uppercase mb-1">Tratamiento</p>
                            <p className="text-lg font-bold text-indigo-900">{lente.tratamiento}</p>
                          </div>
                          <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                            <p className="text-xs font-semibold text-cyan-600 uppercase mb-1">Tipo</p>
                            <p className="text-lg font-bold text-cyan-900">{lente.tipo_de_lente}</p>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                          <h4 className="flex items-center gap-2 text-lg font-bold mb-4"><Eye className="text-blue-600" /> Graduación</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-blue-600 text-white font-bold">
                                  <th className="p-2 border-r border-blue-500">Ojo</th>
                                  <th className="p-2 border-r border-blue-500">Esfera</th>
                                  <th className="p-2 border-r border-blue-500">Cil</th>
                                  <th className="p-2 border-r border-blue-500">Eje</th>
                                  <th className="p-2 border-r border-blue-500">Add</th>
                                  <th className="p-2">AV</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b"><td className="p-2 font-bold">Der</td><td className="p-2 text-center">{lente.od_esf}</td><td className="p-2 text-center">{lente.od_cil}</td><td className="p-2 text-center">{lente.od_eje}</td><td className="p-2 text-center">{lente.od_add}</td><td className="p-2 text-center">{lente.od_av}</td></tr>
                                <tr><td className="p-2 font-bold">Izq</td><td className="p-2 text-center">{lente.oi_esf}</td><td className="p-2 text-center">{lente.oi_cil}</td><td className="p-2 text-center">{lente.oi_eje}</td><td className="p-2 text-center">{lente.oi_add}</td><td className="p-2 text-center">{lente.oi_av}</td></tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )) : <p className="text-center text-gray-500">No hay lentes vinculados</p>}
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

export default VentaList;
