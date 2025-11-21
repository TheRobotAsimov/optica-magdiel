import { useEffect, useState } from 'react';
import clientService from '../../service/clientService';
import notificacionService from '../../service/notificacionService';
import ventaService from '../../service/ventaService';
import pagoService from '../../service/pagoService';
import lenteService from '../../service/lenteService';
import pacienteService from '../../service/pacienteService';
import NavComponent from '../common/NavBar';
import { Search, Edit, Trash2, PlusCircle, Eye, ShoppingCart, CreditCard, Glasses, User, X, Phone, MapPin, Globe, AlertCircle, Users, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading.jsx';
import Error from '../common/Error.jsx';

const ClientList = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clientDetails, setClientDetails] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [lentes, setLentes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [clientsWithPending, setClientsWithPending] = useState(new Set());
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await clientService.getAllClients();
        setClients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchPendingData = async () => {
      try {
        const [allVentas, allPagos, allLentes] = await Promise.all([
          ventaService.getAllVentas(),
          pagoService.getAllPagos(),
          lenteService.getAllLentes()
        ]);

        const pendingClients = new Set();

        // Check ventas
        //allVentas.forEach(v => {
        //  if (v.estatus === 'Pendiente' || v.estatus === 'Atrasado') {
        //    pendingClients.add(v.idcliente);
        //  }
        //});

        // Check pagos
        allPagos.forEach(p => {
          if (p.estatus === 'Pendiente' || p.estatus === 'Atrasado') {
            // Find the venta to get idcliente
            const venta = allVentas.find(v => v.folio === p.folio);
            if (venta) {
              pendingClients.add(venta.idcliente);
            }
          }
        });

        // Check lentes
        allLentes.forEach(l => {
          if (l.estatus === 'Atrasado' || l.estatus === 'No entregado' || new Date(l.fecha) < new Date()) {
            // Find the venta to get idcliente
            const venta = allVentas.find(v => v.folio === l.folio);
            if (venta) {
              pendingClients.add(venta.idcliente);
            }
          }
        });

        setClientsWithPending(pendingClients);
      } catch (error) {
        console.error('Error fetching pending data:', error);
      }
    };

    fetchClients();
    fetchPendingData();
  }, []);

  const handleDelete = async (clientId) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      // Mostrar modal para solicitar motivo
      Swal.fire({
        title: 'Solicitar Eliminación',
        input: 'textarea',
        inputLabel: 'Motivo de la solicitud',
        inputPlaceholder: 'Describe por qué deseas eliminar este cliente...',
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
            const mensaje = `Solicitud de eliminación - Cliente ID: ${clientId}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
            await notificacionService.create(mensaje);
            Swal.fire('Solicitud enviada', 'Tu solicitud ha sido enviada al administrador.', 'success');
          } catch {
            Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error');
          }
        }
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
          await clientService.deleteClient(clientId);
          setClients(clients.filter((client) => client.idcliente !== clientId));
          Swal.fire(
            '¡Eliminado!',
            'El cliente ha sido eliminado.',
            'success'
          )
        } catch {
            Swal.fire(
                'Error!',
                'An error occurred while deleting the client.',
                'error'
            )
        }
      }
    })
  };

  const handleEdit = (clientId) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      // Mostrar modal para solicitar motivo
      Swal.fire({
        title: 'Solicitar Edición',
        input: 'textarea',
        inputLabel: 'Motivo de la solicitud',
        inputPlaceholder: 'Describe por qué deseas editar este cliente...',
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
            const mensaje = `Solicitud de edición - Cliente ID: ${clientId}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
            await notificacionService.create(mensaje);
            Swal.fire('Solicitud enviada', 'Tu solicitud ha sido enviada al administrador.', 'success');
          } catch {
            Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error');
          }
        }
      });
      return;
    }
    navigate(`/clients/${clientId}/edit`);
  };

  const handleView = async (clientId) => {
    try {
      const client = await clientService.getClientById(clientId);
      setClientDetails(client);

      const allVentas = await ventaService.getAllVentas();
      const clientVentas = allVentas.filter(v => v.idcliente === clientId);
      setVentas(clientVentas);

      const allPagos = await pagoService.getAllPagos();
      const clientPagos = allPagos.filter(p => clientVentas.some(v => v.folio === p.folio));
      setPagos(clientPagos);

      const allLentes = await lenteService.getAllLentes();
      const clientLentes = allLentes.filter(l => clientVentas.some(v => v.folio === l.folio));
      setLentes(clientLentes);

      const allPacientes = await pacienteService.getAllPacientes();
      const clientPacientes = allPacientes.filter(p => p.idcliente === clientId);
      setPacientes(clientPacientes);

      setShowModal(true);
    } catch (error) {
      console.error('Error fetching client details:', error);
      Swal.fire('Error', 'No se pudieron cargar los detalles del cliente.', 'error');
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
                    CLIENTES
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Listado de clientes registrados en el sistema
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
                        placeholder="Buscar Cliente"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-200 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                      Aplicar filtro
                    </button>
                  </div>

                  {/* Botón Nuevo Cliente (separado) */}
                  <div className="flex gap-3">
                    <Link to="/clients/new" className="flex items-center space-x-2 px-8 py-2 bg-gradient-to-r from-purple-500 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-purple-300 disabled:to-purple-400 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed">
                      <PlusCircle className="h-5 w-5" />
                      <span>Nuevo Cliente</span>
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
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono 1</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domicilio 1</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {clients.map((client) => (
                        <tr
                          key={client.idcliente}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ease-in-out group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                              {client.idcliente}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md ${
                                clientsWithPending.has(client.idcliente)
                                  ? 'bg-red-500'
                                  : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                              }`}>
                                {clientsWithPending.has(client.idcliente) ? (
                                  <AlertTriangle className="h-5 w-5" />
                                ) : (
                                  `${client.nombre.charAt(0)}${client.paterno.charAt(0)}`
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {client.nombre} {client.paterno}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {client.materno}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center text-sm text-gray-700">
                              <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {client.telefono1}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {client.domicilio1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-3">
                              <button
                                onClick={() => handleView(client.idcliente)}
                                className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                                title="Ver Detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(client.idcliente)}
                                className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(client.idcliente)}
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

      {showModal && clientDetails && (() => {
        const pendingVentas = ventas.filter(v => v.estatus === 'Pendiente' || v.estatus === 'Atrasado');
        const pendingPagos = pagos.filter(p => p.estatus === 'Pendiente' || p.estatus === 'Atrasado');
        const pendingLentes = lentes.filter(l => l.estatus === 'Pendiente' || l.estatus === 'Atrasado' || l.estatus === 'No entregado');
        const hasPendingItems = pendingVentas.length > 0 || pendingPagos.length > 0 || pendingLentes.length > 0;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Detalles del Cliente
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
              {/* Sección 1: Información del cliente */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información del Cliente</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre Completo</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">
                          {clientDetails.nombre} {clientDetails.paterno} {clientDetails.materno}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Edad</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{clientDetails.edad} años</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sexo</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">
                          {clientDetails.sexo === 'M' ? 'Masculino' : 'Femenino'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono 1</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{clientDetails.telefono1}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Domicilio 1</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{clientDetails.domicilio1}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono 2</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{clientDetails.telefono2}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Domicilio 2</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{clientDetails.domicilio2}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <Globe className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Maps URL</p>
                        <a 
                          href={clientDetails.map_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-base font-semibold text-blue-600 hover:text-blue-700 underline mt-1 inline-block"
                        >
                          Ver ubicación
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 2: Ventas, pagos y lentes pendientes */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                <div className={`rounded-xl p-6 border ${hasPendingItems ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-2 rounded-lg ${hasPendingItems ? 'bg-red-600' : 'bg-gray-600'}`}>
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Pagos y Lentes Pendientes o Atrasados
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {pendingVentas.map(v => (
                      <div key={v.folio} className="flex items-center space-x-3 bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <ShoppingCart className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Venta - Folio: {v.folio}</p>
                          <p className="text-sm text-gray-600">
                            Fecha: {formatDate(v.fecha)} • Monto: <span className="font-semibold">${v.total}</span>
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          {v.estatus}
                        </span>
                      </div>
                    ))}
                    
                    {pendingPagos.map(p => (
                      <div key={p.idpago} className="flex items-center space-x-3 bg-white p-4 rounded-xl border-l-4 border-orange-500 shadow-sm">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <CreditCard className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Pago - Folio: {p.folio}</p>
                          <p className="text-sm text-gray-600">
                            Fecha: {formatDate(p.fecha)} • Monto: <span className="font-semibold">${p.cantidad}</span>
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                          {p.estatus}
                        </span>
                      </div>
                    ))}
                    
                    {pendingLentes.map(l => (
                      <div key={l.idlente} className="flex items-center space-x-3 bg-white p-4 rounded-xl border-l-4 border-yellow-500 shadow-sm">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                          <Glasses className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Lente - Folio: {l.folio}</p>
                          <p className="text-sm text-gray-600">
                            Fecha Entrega: {formatDate(l.fecha_entrega)}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          {l.estatus}
                        </span>
                      </div>
                    ))}
                    
                    {!hasPendingItems && (
                      <div className="text-center py-8">
                        <div className="inline-block bg-green-100 p-3 rounded-full mb-3">
                          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-gray-600 font-medium">No hay elementos pendientes o atrasados</p>
                        <p className="text-sm text-gray-500 mt-1">Todo está al corriente</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 3: Pacientes asociados */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Pacientes Asociados</h3>
                  </div>
                  
                  {pacientes.length > 0 ? (
                    <div className="space-y-3">
                      {pacientes.map(p => (
                        <div key={p.idpaciente} className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                            {p.nombre.charAt(0)}{p.paterno.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {p.nombre} {p.paterno} {p.materno}
                            </p>
                            <p className="text-sm text-gray-600">{p.parentesco}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-block bg-gray-100 p-3 rounded-full mb-3">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">No hay pacientes asociados</p>
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

export default ClientList;

