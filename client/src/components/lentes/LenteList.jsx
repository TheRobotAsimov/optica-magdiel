import { useState } from 'react';
import lenteService from '../../service/lenteService';
import notificacionService from '../../service/notificacionService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { Edit, Trash2, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useListManager } from '../../hooks/useListManager';
import ListHeader from '../common/list/ListHeader';
import ListActions from '../common/list/ListActions';
import ListTable from '../common/list/ListTable';
import ListBadge from '../common/list/ListBadge';

const LenteList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    items: lentes,
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
  } = useListManager(lenteService, 'deleteLente', 'idlente', 'getAllLentes');

  const [showModal, setShowModal] = useState(false);
  const [lenteDetails, setLenteDetails] = useState(null);

  const getBadgeType = (estatus) => {
    switch (estatus) {
      case 'Entregado': return 'success';
      case 'Pendiente': return 'warning';
      case 'No entregado': return 'danger';
      default: return 'default';
    }
  };

  const handleRequestAction = (action, id) => {
    Swal.fire({
      title: `Solicitar ${action === 'delete' ? 'Eliminación' : 'Edición'}`,
      input: 'textarea',
      inputLabel: 'Motivo de la solicitud',
      inputPlaceholder: `Describe por qué deseas ${action === 'delete' ? 'eliminar' : 'editar'} este lente...`,
      inputValidator: (value) => {
        if (!value) return 'Debes proporcionar un motivo';
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar Solicitud',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const mensaje = `Solicitud de ${action === 'delete' ? 'eliminación' : 'edición'} - Lente ID: ${id}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
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
      successText: 'El lente ha sido eliminado.',
      errorText: 'No se pudo eliminar el lente.'
    });
  };

  const handleEdit = (id) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      handleRequestAction('edit', id);
      return;
    }
    navigate(`/lentes/${id}/edit`);
  };

  const handleView = async (lenteId) => {
    try {
      const lente = await lenteService.getLenteById(lenteId);
      setLenteDetails(lente);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching lente details:', error);
      Swal.fire('Error', 'No se pudieron cargar los detalles del lente.', 'error');
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <ListHeader
          title="LENTES"
          subtitle="Listado de lentes registrados en el sistema"
        />

        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">

            <ListActions
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por folio, cliente u optometrista..."
              newItemLabel="Nuevo Lente"
              newItemLink="/lentes/new"
              onApplyFilter={() => { }}
            />

            <ListTable
              headers={['ID', 'Folio', 'Optometrista', 'Cliente', 'Fecha de Entrega', 'Estatus', 'Acciones']}
              pagination={{
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                onPageChange: setCurrentPage,
                onItemsPerPageChange: setItemsPerPage
              }}
            >
              {lentes.map((lente) => (
                <tr
                  key={lente.idlente}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ease-in-out group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{lente.idlente}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{lente.folio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lente.optometrista_nombre} {lente.optometrista_paterno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lente.cliente_nombre} {lente.cliente_paterno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(lente.fecha_entrega).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ListBadge text={lente.estatus} type={getBadgeType(lente.estatus)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button onClick={() => handleView(lente.idlente)} className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Ver Detalles"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => handleEdit(lente.idlente)} className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Editar"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(lente.idlente)} className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </ListTable>
          </div>
        </div>
      </div>

      {showModal && lenteDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl"><Eye className="h-8 w-8 text-white" /></div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Detalles del Lente</h2>
                    <p className="text-blue-100 text-sm mt-1">Información completa del registro de lente</p>
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
                    <h3 className="text-xl font-bold text-gray-900">Información del Lente</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'ID Lente', value: lenteDetails.idlente },
                      { label: 'Folio Venta', value: lenteDetails.folio },
                      { label: 'Optometrista', value: `${lenteDetails.optometrista_nombre} ${lenteDetails.optometrista_paterno}` },
                      { label: 'Cliente', value: `${lenteDetails.cliente_nombre} ${lenteDetails.cliente_paterno}` },
                      { label: 'Material', value: lenteDetails.material },
                      { label: 'Armazón', value: lenteDetails.armazon },
                      { label: 'Tratamiento', value: lenteDetails.tratamiento },
                      { label: 'Tipo de Lente', value: lenteDetails.tipo_de_lente },
                      { label: 'Fecha Entrega', value: new Date(lenteDetails.fecha_entrega).toLocaleDateString() },
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
                        <ListBadge text={lenteDetails.estatus} type={getBadgeType(lenteDetails.estatus)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                    <div className="flex items-center space-x-3"><div className="bg-white/20 p-2 rounded-lg"><Eye className="h-6 w-6 text-white" /></div><h3 className="text-xl font-bold text-white">Graduación</h3></div>
                  </div>
                  <div className="p-6">
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
                          <tr className="border-b"><td className="p-2 font-bold">Der</td><td className="p-2 text-center">{lenteDetails.od_esf}</td><td className="p-2 text-center">{lenteDetails.od_cil}</td><td className="p-2 text-center">{lenteDetails.od_eje}</td><td className="p-2 text-center">{lenteDetails.od_add}</td><td className="p-2 text-center">{lenteDetails.od_av}</td></tr>
                          <tr><td className="p-2 font-bold">Izq</td><td className="p-2 text-center">{lenteDetails.oi_esf}</td><td className="p-2 text-center">{lenteDetails.oi_cil}</td><td className="p-2 text-center">{lenteDetails.oi_eje}</td><td className="p-2 text-center">{lenteDetails.oi_add}</td><td className="p-2 text-center">{lenteDetails.oi_av}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center space-x-3 mb-6"><div className="bg-green-600 p-2 rounded-lg"><Eye className="h-5 w-5 text-white" /></div><h3 className="text-xl font-bold text-gray-900">Información Adicional</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Síntomas', value: lenteDetails.sintomas || 'Sin síntomas' },
                      { label: 'Uso de Lente', value: lenteDetails.uso_de_lente },
                      { label: 'Tinte Color', value: lenteDetails.tinte_color },
                      { label: 'Tono', value: lenteDetails.tono },
                      { label: 'Desvanecido', value: lenteDetails.desvanecido },
                      { label: 'Examen Seguimiento', value: new Date(lenteDetails.examen_seguimiento).toLocaleDateString() },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg mt-0.5"><span className="h-4 w-4 text-green-600 font-bold">&#8226;</span></div>
                        <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p><p className="text-base font-semibold text-gray-900 mt-1">{item.value}</p></div>
                      </div>
                    ))}
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

export default LenteList;
