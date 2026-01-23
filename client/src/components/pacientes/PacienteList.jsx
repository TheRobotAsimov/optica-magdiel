import { useEffect, useState } from 'react';
import pacienteService from '../../service/pacienteService';
import clientService from '../../service/clientService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useListManager } from '../../hooks/useListManager';
import ListHeader from '../common/list/ListHeader';
import ListActions from '../common/list/ListActions';
import ListTable from '../common/list/ListTable';
import ListBadge from '../common/list/ListBadge';
import ListAvatar from '../common/list/ListAvatar';

const PacienteList = () => {
  const navigate = useNavigate();
  const {
    items: pacientes,
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
  } = useListManager(pacienteService, 'deletePaciente', 'idpaciente', 'getAllPacientes');

  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Fetch more clients for mapping purposes
        const clientsData = await clientService.getAllClients({ limit: 1000 });
        setClients(clientsData.items || (Array.isArray(clientsData) ? clientsData : []));
      } catch (err) {
        console.error('Error fetching clients for mapping:', err);
      }
    };
    fetchClients();
  }, []);

  const clientMap = (clients || []).reduce((map, client) => {
    map[client.idcliente] = `${client.nombre} ${client.paterno}`;
    return map;
  }, {});

  const handleDelete = (id) => {
    baseHandleDelete(id, {
      successText: 'El paciente ha sido eliminado.',
      errorText: 'No se pudo eliminar el paciente.'
    });
  };

  const getSexoBadgeType = (sexo) => {
    switch (sexo) {
      case 'M': return 'info';
      case 'F': return 'danger';
      default: return 'default';
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <ListHeader
          title="PACIENTES"
          subtitle="Listado de pacientes registrados en el sistema"
        />

        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">

            <ListActions
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por nombre o ID..."
              newItemLabel="Nuevo Paciente"
              newItemLink="/pacientes/new"
              onApplyFilter={handleSearch}
            />

            <ListTable
              headers={['ID', 'Nombre del Paciente', 'Cliente', 'Parentesco', 'Sexo', 'Edad', 'Acciones']}
              pagination={{
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                onPageChange: setCurrentPage,
                onItemsPerPageChange: setItemsPerPage
              }}
            >
              {pacientes.map((paciente) => (
                <tr
                  key={paciente.idpaciente}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ease-in-out group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{paciente.idpaciente}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ListAvatar initials={`${paciente.nombre.charAt(0)}${paciente.paterno.charAt(0)}`} />
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{paciente.nombre} {paciente.paterno}</div>
                        <div className="text-xs text-gray-500">{paciente.materno}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {clientMap[paciente.idcliente] || 'Cliente no encontrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {paciente.parentesco || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ListBadge
                      text={paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}
                      type={getSexoBadgeType(paciente.sexo)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {paciente.edad} años
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => navigate(`/pacientes/${paciente.idpaciente}/edit`)}
                        className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(paciente.idpaciente)}
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

export default PacienteList;