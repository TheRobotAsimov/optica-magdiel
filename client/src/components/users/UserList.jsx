// Componente para listar usuarios con funcionalidades de búsqueda, edición y eliminación

import { useEffect } from 'react';
import userService from '../../service/userService';
import Loading from '../common/Loading';
import Error from '../common/Error';
import NavComponent from '../common/NavBar';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useListManager } from '../../hooks/useListManager';
import ListHeader from '../common/list/ListHeader';
import ListActions from '../common/list/ListActions';
import ListTable from '../common/list/ListTable';
import ListBadge from '../common/list/ListBadge';

const UserList = () => {
  const navigate = useNavigate();
  const {
    items: users,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    fetchData,
    handleDelete
  } = useListManager(userService, 'deleteUser', 'id');

  useEffect(() => {
    fetchData('getAllUsers');
  }, []);

  const handleEdit = (userId) => {
    navigate(`/users/${userId}/edit`);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const getRolBadgeType = (rol) => {
    switch (rol) {
      case 'Matriz': return 'danger';
      case 'Optometrista': return 'success';
      case 'Asesor': return 'info';
      default: return 'default';
    }
  };

  const filteredUsers = users.filter(user =>
    user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <ListHeader
          title="USUARIOS"
          subtitle="Listado de usuarios registrados en el sistema"
        />

        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">

            <ListActions
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar Usuario"
              newItemLabel="Nuevo Usuario"
              newItemLink="/users/new"
              onApplyFilter={() => { }}
            />

            <ListTable headers={['ID', 'Correo', 'Rol', 'Acciones']}>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ease-in-out group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                      {user.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.correo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ListBadge text={user.rol} type={getRolBadgeType(user.rol)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, {
                          successText: 'El usuario ha sido eliminado.',
                          errorText: 'No se pudo eliminar el usuario.'
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

export default UserList;
