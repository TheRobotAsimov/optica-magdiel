import pagoService from '../../service/pagoService';
import notificacionService from '../../service/notificacionService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useListManager } from '../../hooks/useListManager';
import ListHeader from '../common/list/ListHeader';
import ListActions from '../common/list/ListActions';
import ListTable from '../common/list/ListTable';
import ListBadge from '../common/list/ListBadge';

const PagoList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    items: pagos,
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
  } = useListManager(pagoService, 'deletePago', 'idpago', 'getAllPagos');

  const getBadgeType = (estatus) => {
    switch (estatus) {
      case 'Pagado': return 'success';
      case 'Pendiente': return 'warning';
      case 'Cancelado': return 'danger';
      default: return 'default';
    }
  };

  const handleRequestAction = (action, id) => {
    Swal.fire({
      title: `Solicitar ${action === 'delete' ? 'Eliminación' : 'Edición'}`,
      input: 'textarea',
      inputLabel: 'Motivo de la solicitud',
      inputPlaceholder: `Describe por qué deseas ${action === 'delete' ? 'eliminar' : 'editar'} este pago...`,
      inputValidator: (value) => {
        if (!value) return 'Debes proporcionar un motivo';
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar Solicitud',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const mensaje = `Solicitud de ${action === 'delete' ? 'eliminación' : 'edición'} - Pago ID: ${id}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
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
      successText: 'El pago ha sido eliminado.',
      errorText: 'Hubo un problema al eliminar el pago.'
    });
  };

  const handleEdit = (id) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      handleRequestAction('edit', id);
      return;
    }
    navigate(`/pagos/${id}/edit`);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <ListHeader
          title="PAGOS"
          subtitle="Listado de pagos registrados en el sistema"
        />

        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">

            <ListActions
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por folio o cliente..."
              newItemLabel="Nuevo Pago"
              newItemLink="/pagos/new"
              onApplyFilter={handleSearch}
            />

            <ListTable
              headers={['ID', 'Folio', 'Cliente', 'Fecha', 'Cantidad', 'Estatus', 'Acciones']}
              pagination={{
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                onPageChange: setCurrentPage,
                onItemsPerPageChange: setItemsPerPage
              }}
            >
              {pagos.map((pago) => (
                <tr
                  key={pago.idpago}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ease-in-out group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{pago.idpago}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pago.folio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{`${pago.cliente_nombre} ${pago.cliente_paterno}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(pago.fecha).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${parseFloat(pago.cantidad).toLocaleString('es-MX')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ListBadge text={pago.estatus} type={getBadgeType(pago.estatus)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button onClick={() => handleEdit(pago.idpago)} className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Editar"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(pago.idpago)} className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </ListTable>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoList;
