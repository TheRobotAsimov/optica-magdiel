import { useEffect, useState } from 'react';
import ventaService from '../../service/ventaService';
import notificacionService from '../../service/notificacionService';
import pagoService from '../../service/pagoService';
import lenteService from '../../service/lenteService';
import NavComponent from '../common/NavBar';
import { Search, Edit, Trash2, PlusCircle, Eye, X, CreditCard, Glasses } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

const VentaList = () => {
  const { user } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [ventaDetails, setVentaDetails] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [lentes, setLentes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        let data;
        data = await ventaService.getAllVentas();
        setVentas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, [user]);

  const getBadgeClass = (estatus) => {
    switch (estatus) {
      case 'Pagado':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Atrasado':
        return 'bg-red-100 text-red-800';
      case 'Entregado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (folio) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      // Mostrar modal para solicitar motivo
      Swal.fire({
        title: 'Solicitar Eliminación',
        input: 'textarea',
        inputLabel: 'Motivo de la solicitud',
        inputPlaceholder: 'Describe por qué deseas eliminar esta venta...',
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
            const mensaje = `Solicitud de eliminación - Venta Folio: ${folio}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
            await notificacionService.create(mensaje);
            Swal.fire('Solicitud enviada', 'Tu solicitud ha sido enviada al administrador.', 'success');
          } catch {
            Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error');
          }
        }
      });
      return;
    }

    // Lógica original para usuarios Matriz
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
          await ventaService.deleteVenta(folio);
          setVentas(ventas.filter((venta) => venta.folio !== folio));
          Swal.fire(
            'Deleted!',
            'The sale has been deleted.',
            'success'
          )
        } catch {
            Swal.fire(
                'Error!',
                'An error occurred while deleting the sale.',
                'error'
            )
        }
      }
    })
  };

  const handleView = async (folio) => {
    try {
      const venta = await ventaService.getVentaByFolio(folio);
      setVentaDetails(venta);

      const allPagos = await pagoService.getAllPagos();
      const ventaPagos = allPagos.filter(p => p.folio === folio);
      setPagos(ventaPagos);

      const allLentes = await lenteService.getAllLentes();
      const ventaLentes = allLentes.filter(l => l.folio === folio);
      setLentes(ventaLentes);

      setShowModal(true);
    } catch (error) {
      console.error('Error fetching venta details:', error);
      Swal.fire('Error', 'No se pudieron cargar los detalles de la venta.', 'error');
    }
  };

  const handleEdit = (folio) => {
    if (user.rol === 'Asesor' || user.rol === 'Optometrista') {
      // Mostrar modal para solicitar motivo
      Swal.fire({
        title: 'Solicitar Edición',
        input: 'textarea',
        inputLabel: 'Motivo de la solicitud',
        inputPlaceholder: 'Describe por qué deseas editar esta venta...',
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
            const mensaje = `Solicitud de edición - Venta Folio: ${folio}, Motivo: ${result.value} - Solicitado por: ${user.nombre} ${user.paterno}`;
            await notificacionService.create(mensaje);
            Swal.fire('Solicitud enviada', 'Tu solicitud ha sido enviada al administrador.', 'success');
          } catch {
            Swal.fire('Error', 'No se pudo enviar la solicitud.', 'error');
          }
        }
      });
      return;
    }
    navigate(`/ventas/${folio}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavComponent />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavComponent />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">Error: {error}</div>
          </div>
        </div>
      </div>
    );
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
                    VENTAS
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Listado de ventas registradas en el sistema
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
                        placeholder="Buscar Venta"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-200 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                      Aplicar filtro
                    </button>
                  </div>

                  {/* Botón Nuevo Venta (separado) */}
                  <div className="flex gap-3">
                    <Link to="/ventas/new" className="flex items-center space-x-2 px-8 py-2 bg-gradient-to-r from-purple-500 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-purple-300 disabled:to-purple-400 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed">
                      <PlusCircle className="h-5 w-5" />
                      <span>Nueva Venta</span>
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
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asesor</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {ventas.map((venta) => (
                        <tr
                          key={venta.folio}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ease-in-out group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                              {venta.folio}
                            </span>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(venta.estatus)}`}>
                              {venta.estatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-3">
                              <button
                                onClick={() => handleView(venta.folio)}
                                className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                                title="Ver Detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(venta.folio)}
                                className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-110"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(venta.folio)}
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

      {showModal && ventaDetails && (
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
                      Detalles de la Venta
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Información completa del registro de venta
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
              {/* Sección: Información de la venta */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información de la Venta</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">#</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Folio</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{ventaDetails.folio}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">A</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Asesor</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{ventaDetails.asesor_nombre} {ventaDetails.asesor_paterno}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">C</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{ventaDetails.idcliente} - {ventaDetails.cliente_nombre} {ventaDetails.cliente_paterno}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">F</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{new Date(ventaDetails.fecha).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">T</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{ventaDetails.tipo}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">$</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enganche</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">${parseFloat(ventaDetails.enganche).toLocaleString('es-MX')}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">$</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">${parseFloat(ventaDetails.total).toLocaleString('es-MX')}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">E</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(ventaDetails.estatus)}`}>
                          {ventaDetails.estatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">#</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad de Pagos</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{ventaDetails.cant_pagos}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 md:col-span-2">
                      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                        <span className="h-4 w-4 text-blue-600 font-bold">O</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Observaciones</p>
                        <p className="text-base font-semibold text-gray-900 mt-1">{ventaDetails.observaciones || 'Sin observaciones'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 2: Pagos asociados */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-green-600 p-2 rounded-lg">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Pagos Asociados</h3>
                    </div>
  
                    <div className="space-y-3">
                      {pagos.length > 0 ? (
                        pagos.map(p => (
                          <div key={p.idpago} className="flex items-center space-x-3 bg-white p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <CreditCard className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">Pago - ID: {p.idpago}</p>
                              <p className="text-sm text-gray-600">
                                Fecha: {new Date(p.fecha).toLocaleDateString()} • Monto: <span className="font-semibold">${parseFloat(p.cantidad).toLocaleString('es-MX')}</span>
                              </p>
                            </div>
                            <span className={`px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full`}>
                              {p.estatus}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="inline-block bg-gray-100 p-3 rounded-full mb-3">
                            <CreditCard className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium">No hay pagos asociados</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
  
                {/* Sección 3: Lentes asociados */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                          <Glasses className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Lentes Asociados</h3>
                      </div>
                    </div>
  
                    <div className="p-6 space-y-6">
                      {lentes.length > 0 ? (
                        lentes.map(lente => (
                          <div key={lente.idlente} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">ID Lente</div>
                                <div className="text-lg font-bold text-blue-900">{lente.idlente}</div>
                              </div>
  
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Material</div>
                                <div className="text-lg font-bold text-purple-900">{lente.material}</div>
                              </div>
  
                              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Tratamiento</div>
                                <div className="text-lg font-bold text-indigo-900">{lente.tratamiento}</div>
                              </div>
  
                              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
                                <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-1">Tipo</div>
                                <div className="text-lg font-bold text-cyan-900">{lente.tipo_de_lente}</div>
                              </div>
                            </div>
  
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Armazón</div>
                                <div className="text-base font-semibold text-gray-900">{lente.armazon}</div>
                              </div>
  
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Fecha Entrega</div>
                                <div className="text-base font-semibold text-gray-900">
                                  {new Date(lente.fecha_entrega).toLocaleDateString('es-MX', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
  
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Estatus</div>
                                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${getBadgeClass(lente.estatus)}`}>
                                  <span>{lente.estatus}</span>
                                </span>
                              </div>
                            </div>
  
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border-2 border-gray-200 shadow-sm">
                              <div className="flex items-center space-x-2 mb-4">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <Eye className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">Graduación</h4>
                              </div>
  
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
                                      <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lente.od_esf}</td>
                                      <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lente.od_cil}</td>
                                      <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lente.od_eje}°</td>
                                      <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lente.od_add}</td>
                                      <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{lente.od_av}</td>
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
                                      <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lente.oi_esf}</td>
                                      <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lente.oi_cil}</td>
                                      <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lente.oi_eje}°</td>
                                      <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{lente.oi_add}</td>
                                      <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{lente.oi_av}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="inline-block bg-gray-100 p-3 rounded-full mb-3">
                            <Glasses className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium">No hay lentes asociados</p>
                        </div>
                      )}
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

export default VentaList;
