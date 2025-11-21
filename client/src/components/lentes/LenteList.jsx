import { useEffect, useState } from 'react';
import lenteService from '../../service/lenteService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { Search, Edit, Trash2, PlusCircle, Eye, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

const LenteList = () => {
  const { user } = useAuth();
  const [lentes, setLentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [lenteDetails, setLenteDetails] = useState(null);
  const navigate = useNavigate();

  const getBadgeClass = (estatus) => {
    if (estatus === 'Entregado') return 'bg-green-100 text-green-800';
    if (estatus === 'Pendiente') return 'bg-yellow-100 text-yellow-800';
    if (estatus === 'No entregado') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    const fetchLentes = async () => {
      try {
        const data = await lenteService.getAllLentes();
        setLentes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLentes();
  }, []);

  const handleDelete = async (lenteId) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      Swal.fire({
        title: 'No permitido',
        text: 'No tienes permisos para realizar esta acción. Por favor, contacta a un usuario Matriz para solicitar el cambio.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, bórralo!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await lenteService.deleteLente(lenteId);
          setLentes(lentes.filter((lente) => lente.idlente !== lenteId));
          Swal.fire(
            '¡Eliminado!',
            'El lente ha sido eliminado.',
            'success'
          )
        } catch {
            Swal.fire(
                '¡Error!',
                'No se pudo eliminar el lente.',
                'error'
            )
        }
      }
    })
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

  const handleEdit = (lenteId) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      Swal.fire({
        title: 'No permitido',
        text: 'No tienes permisos para realizar esta acción. Por favor, contacta a un usuario Matriz para solicitar el cambio.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    navigate(`/lentes/${lenteId}/edit`);
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
                    LENTES
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Listado de lentes registrados en el sistema
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
        
              {/* Header */}
              <div className="mb-8">
                {/* Search and Action Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
                  {/* Grupo: Search + Botón Aplicar filtro */}
                  <div className="flex items-center gap-4 flex-1 max-w-md">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Buscar Lente"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-200 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                      Aplicar filtro
                    </button>
                  </div>

                  {/* Botón Nuevo Lente (separado) */}
                  <div className="flex gap-3">
                    <Link to="/lentes/new" className="flex items-center space-x-2 px-8 py-2 bg-gradient-to-r from-purple-500 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-purple-300 disabled:to-purple-400 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed">
                      <PlusCircle className="h-5 w-5" />
                      <span>Nuevo Lente</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Table Container */}
<div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Optometrista</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Entrega</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {lentes.map((lente) => (
                        <tr
                          key={lente.idlente}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ease-in-out group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                              {lente.idlente}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {lente.folio}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lente.optometrista_nombre} {lente.optometrista_paterno}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lente.cliente_nombre} {lente.cliente_paterno} {lente.cliente_materno}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(lente.fecha_entrega).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeClass(lente.estatus)}`}>
                              {lente.estatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-3">
                              <button
                                onClick={() => handleView(lente.idlente)}
                                className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                                title="Ver Detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(lente.idlente)}
                                className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(lente.idlente)}
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

      {showModal && lenteDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Detalles del Lente
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Información completa del registro de lente
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
              {/* Sección: Información del lente */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información del Lente</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">#</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Lente</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.idlente}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">F</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Folio Venta</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.folio}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">O</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Optometrista</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.optometrista_nombre} {lenteDetails.optometrista_paterno}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">C</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.cliente_nombre} {lenteDetails.cliente_paterno} {lenteDetails.cliente_materno}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">M</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Material</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.material}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">A</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Armazón</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.armazon}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">T</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tratamiento</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.tratamiento}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">L</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo de Lente</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.tipo_de_lente}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">F</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Entrega</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{new Date(lenteDetails.fecha_entrega).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">E</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(lenteDetails.estatus)}`}>
                          {lenteDetails.estatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección: Graduación */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Graduación</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">Ojo</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">Esfera</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">Cilindro</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">Eje</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">Add</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">AV</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-4 py-4 border-r border-gray-200">
                              <div className="flex items-center space-x-2">
                                <div className="bg-blue-100 p-1.5 rounded">
                                  <Eye className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="font-semibold text-gray-900">Derecho</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lenteDetails.od_esf}</td>
                            <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lenteDetails.od_cil}</td>
                            <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lenteDetails.od_eje}°</td>
                            <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lenteDetails.od_add}</td>
                            <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{lenteDetails.od_av}</td>
                          </tr>
                          <tr className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="px-4 py-4 border-r border-gray-200">
                              <div className="flex items-center space-x-2">
                                <div className="bg-indigo-100 p-1.5 rounded">
                                  <Eye className="h-4 w-4 text-indigo-600" />
                                </div>
                                <span className="font-semibold text-gray-900">Izquierdo</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lenteDetails.oi_esf}</td>
                            <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lenteDetails.oi_cil}</td>
                            <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lenteDetails.oi_eje}°</td>
                            <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lenteDetails.oi_add}</td>
                            <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{lenteDetails.oi_av}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección: Información adicional */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información Adicional</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-green-600 font-bold">S</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Síntomas</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.sintomas || 'Sin síntomas'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-green-600 font-bold">U</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Uso de Lente</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.uso_de_lente}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-green-600 font-bold">T</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tinte Color</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.tinte_color}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-green-600 font-bold">T</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tono</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.tono}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-green-600 font-bold">D</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Desvanecido</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{lenteDetails.desvanecido}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-green-600 font-bold">S</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Examen Seguimiento</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{new Date(lenteDetails.examen_seguimiento).toLocaleDateString()}</p>
                      </div>
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
      )}
    </div>
  );
};

export default LenteList;
