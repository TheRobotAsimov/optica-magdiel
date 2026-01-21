import { useEffect } from 'react';
import empleadoService from '../../service/empleadoService';
import NavComponent from '../common/NavBar';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { useListManager } from '../../hooks/useListManager';
import ListHeader from '../common/list/ListHeader';
import ListActions from '../common/list/ListActions';
import ListTable from '../common/list/ListTable';
import ListBadge from '../common/list/ListBadge';
import ListAvatar from '../common/list/ListAvatar';

const EmpleadoList = () => {
  const navigate = useNavigate();
  const {
    items: empleados,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchData,
    handleDelete
  } = useListManager(empleadoService, 'deleteEmpleado', 'idempleado');

  useEffect(() => {
    fetchData('getAllEmpleados');
  }, []);

  const handleEdit = (empleadoId) => {
    navigate(`/empleados/${empleadoId}/edit`);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const getPuestoBadgeType = (puesto) => {
    switch (puesto) {
      case 'Matriz': return 'danger';
      case 'Optometrista': return 'success';
      case 'Asesor': return 'info';
      default: return 'default';
    }
  };

  const getEstadoBadgeType = (estado) => {
    switch (estado) {
      case 'Activo': return 'success';
      case 'Inactivo': return 'danger';
      default: return 'default';
    }
  };

  const filteredEmpleados = empleados.filter(emp =>
    `${emp.nombre} ${emp.paterno} ${emp.materno}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.idempleado.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <ListHeader
          title="EMPLEADOS"
          subtitle="Listado de empleados registrados en el sistema"
        />

        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">

            <ListActions
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar Empleado"
              newItemLabel="Nuevo Empleado"
              newItemLink="/empleados/new"
              onApplyFilter={() => { }}
            />

            <ListTable headers={['ID', 'Nombre', 'Puesto', 'Teléfono', 'Estado', 'Acciones']}>
              {filteredEmpleados.map((empleado) => (
                <tr
                  key={empleado.idempleado}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ease-in-out group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                      {empleado.idempleado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ListAvatar
                        initials={`${empleado.nombre.charAt(0)}${empleado.paterno.charAt(0)}`}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {empleado.nombre} {empleado.paterno}
                        </div>
                        <div className="text-xs text-gray-500">
                          {empleado.materno}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ListBadge text={empleado.puesto} type={getPuestoBadgeType(empleado.puesto)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {empleado.telefono}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ListBadge text={empleado.estado} type={getEstadoBadgeType(empleado.estado)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleEdit(empleado.idempleado)}
                        className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(empleado.idempleado, {
                          successText: 'El empleado ha sido eliminado.',
                          errorText: 'No se pudo eliminar el empleado.'
                        })}
                        className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

export default EmpleadoList;
