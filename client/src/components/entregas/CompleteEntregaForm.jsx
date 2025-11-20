import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import entregaService from '../../service/entregaService';
import rutaService from '../../service/rutaService';
import lenteService from '../../service/lenteService';
import pagoService from '../../service/pagoService';
import ventaService from '../../service/ventaService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, Eye, Package, Calendar, CheckCircle, AlertCircle, DollarSign, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';

const CompleteEntregaForm = () => {
  const [formData, setFormData] = useState({
    idruta: '',
    estatus: 'No entregado',
    idlente: '',
    idpago: '',
    motivo: '',
    hora: new Date().toTimeString().slice(0, 5),
  });

  const [rutas, setRutas] = useState([]);
  const [lentes, setLentes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [selectedLente, setSelectedLente] = useState(null);
  const [selectedPago, setSelectedPago] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagoOption, setPagoOption] = useState('existing');
  const [newPagoData, setNewPagoData] = useState({
    folio: '',
    fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    cantidad: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rutasData, lentesData, pagosData, ventasData] = await Promise.all([
          rutaService.getAllRutas(),
          lenteService.getPendingLentes(),
          pagoService.getPendingPagos(),
          ventaService.getAllVentas(),
        ]);
        setRutas(rutasData);
        setLentes(lentesData);
        setPagos(pagosData);
        setVentas(ventasData);

        const urlParams = new URLSearchParams(window.location.search);
        const rutaId = urlParams.get('ruta');
        const undeliveredType = urlParams.get('undelivered');

        if (rutaId) {
          setFormData(prev => ({ ...prev, idruta: rutaId }));
        }

        if (undeliveredType) {
          setFormData(prev => ({ ...prev, estatus: 'No entregado' }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLenteChange = (e) => {
    const lenteId = e.target.value;
    setFormData((prev) => ({ ...prev, idlente: lenteId }));
    const lente = lentes.find(l => l.idlente == lenteId);
    setSelectedLente(lente);
  };

  const handlePagoChange = (e) => {
    const pagoId = e.target.value;
    setFormData((prev) => ({ ...prev, idpago: pagoId }));
    const pago = pagos.find(p => p.idpago == pagoId);
    setSelectedPago(pago);
  };

  const handleNewPagoChange = (e) => {
    const { name, value } = e.target;
    setNewPagoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.idlente && !formData.idpago && pagoOption !== 'new') {
      Swal.fire({
        title: 'Validación requerida',
        text: 'Debe seleccionar al menos un lente o un pago.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (pagoOption === 'new' && !newPagoData.folio) {
      setError('Debe seleccionar un folio para el nuevo pago.');
      return;
    }

    setLoading(true);
    try {
      let pagoId = formData.idpago;

      if (pagoOption === 'new') {
        const newPago = await pagoService.createPago({
          ...newPagoData,
          cantidad: parseFloat(newPagoData.cantidad) || 0,
          estatus: 'Pendiente',
        });
        pagoId = newPago.id;
      }

      const entregaData = {
        ...formData,
        idpago: pagoId || null,
      };
      await entregaService.createEntrega(entregaData);

      if (formData.idlente) {
        const lenteUpdateData = {
          ...selectedLente,
          estatus: formData.estatus,
        };

        if (lenteUpdateData.fecha_entrega) {
          lenteUpdateData.fecha_entrega = lenteUpdateData.fecha_entrega.split('T')[0];
        }
        if (lenteUpdateData.examen_seguimiento) {
          lenteUpdateData.examen_seguimiento = lenteUpdateData.examen_seguimiento.split('T')[0];
        }

        delete lenteUpdateData.created_at;
        delete lenteUpdateData.updated_at;

        await lenteService.updateLente(formData.idlente, lenteUpdateData);

        if (formData.estatus === 'Entregado' && formData.idruta) {
          const currentRoute = rutas.find(r => r.idruta == formData.idruta);
          if (currentRoute) {
            const routeUpdateData = {
              ...currentRoute,
              lentes_entregados: (currentRoute.lentes_entregados || 0) + 1,
            };

            if (routeUpdateData.fecha) {
              routeUpdateData.fecha = routeUpdateData.fecha.split('T')[0];
            }

            await rutaService.updateRuta(formData.idruta, routeUpdateData);
          }
        }

        if (formData.estatus === 'No entregado' && formData.idruta) {
          const currentRoute = rutas.find(r => r.idruta == formData.idruta);
          if (currentRoute) {
            const routeUpdateData = {
              ...currentRoute,
            };

            if (formData.idlente) {
              routeUpdateData.lentes_no_entregados = (currentRoute.lentes_no_entregados || 0) + 1;
            }
            if (pagoId) {
              routeUpdateData.tarjetas_no_entregadas = (currentRoute.tarjetas_no_entregadas || 0) + 1;
            }

            if (routeUpdateData.fecha) {
              routeUpdateData.fecha = routeUpdateData.fecha.split('T')[0];
            }

            await rutaService.updateRuta(formData.idruta, routeUpdateData);
          }
        }
      }

      if (pagoId) {
        const pagoToUpdate = pagoOption === 'new' ? {
          ...newPagoData,
          estatus: formData.estatus === 'Entregado' ? 'Pagado' : 'Pendiente'
        } : {
          ...selectedPago,
          estatus: formData.estatus === 'Entregado' ? 'Pagado' : 'Pendiente',
        };
        await pagoService.updatePago(pagoId, pagoToUpdate);

        const currentRoute = rutas.find(r => r.idruta == formData.idruta);
        if (formData.estatus === 'Entregado' && formData.idruta) {
          if (currentRoute) {
            const routeUpdateData = {
              ...currentRoute,
              tarjetas_entregadas: (currentRoute.tarjetas_entregadas || 0) + 1,
            };

            if (routeUpdateData.fecha) {
              routeUpdateData.fecha = routeUpdateData.fecha.split('T')[0];
            }

            await rutaService.updateRuta(formData.idruta, routeUpdateData);
          }
        }

        if (formData.estatus === 'No entregado' && formData.idruta) {
          const routeUpdateData = {
            ...currentRoute,
            tarjetas_no_entregadas: (currentRoute.tarjetas_no_entregadas || 0) + 1,
          };

          if (routeUpdateData.fecha) {
            routeUpdateData.fecha = routeUpdateData.fecha.split('T')[0];
          }

          await rutaService.updateRuta(formData.idruta, routeUpdateData);
        }
      }

      const urlParams = new URLSearchParams(window.location.search);
      const rutaId = urlParams.get('ruta');
      const undeliveredType = urlParams.get('undelivered');

      if (rutaId && undeliveredType) {
        navigate('/ruta-asesor?window=3');
      } else if (rutaId) {
        navigate('/ruta-asesor');
      } else {
        navigate('/entregas');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Entregado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'No entregado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const pendingLentes = lentes.filter(l => l.estatus === 'Pendiente' || l.estatus === 'No entregado');
  const pendingPagos = pagos.filter(p => p.estatus === 'Pendiente');

  if (loading && rutas.length === 0) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-xl rounded-xl border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 border-b border-blue-800">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">NUEVA ENTREGA COMPLETA</h1>
            </div>
          </div>
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ruta *</label>
                  <select name="idruta" 
                          value={formData.idruta} 
                          onChange={handleChange} 
                          required 
                          disabled={new URLSearchParams(window.location.search).get('ruta') !== null}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar Ruta</option>
                    {rutas.map(ruta => (
                      <option key={ruta.idruta} value={ruta.idruta}>{`Ruta ${ruta.idruta} - ${new Date(ruta.fecha).toLocaleDateString()}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estatus *</label>
                  <select
                    name="estatus"
                    value={formData.estatus}
                    onChange={handleChange}
                    required
                    disabled={new URLSearchParams(window.location.search).get('undelivered') !== null}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="No entregado">No entregado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
                  <textarea name="motivo" value={formData.motivo} onChange={handleChange} required rows="3" className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hora *</label>
                  <input type="time" name="hora" value={formData.hora} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200" />
                </div>
              </div>

              {/* Lente Section - Improved */}

              {( new URLSearchParams(window.location.search).get('undelivered') === 'lente' || new URLSearchParams(window.location.search).get('undelivered') === null ) && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 mt-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Información del Lente</h3>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span>Seleccionar Lente</span>
                    </label>
                    <select 
                      name="idlente" 
                      value={formData.idlente} 
                      onChange={handleLenteChange}
                      disabled={new URLSearchParams(window.location.search).get('undelivered') === 'pago'}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700 font-medium hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">— Seleccionar Lente —</option>
                      {pendingLentes.map(lente => {
                        const venta = ventas.find(v => v.folio === lente.folio);
                        const cliente = venta ? `${venta.cliente_nombre} ${venta.cliente_paterno}` : 'Cliente desconocido';
                        return (
                          <option key={lente.idlente} value={lente.idlente}>
                            {`${cliente} — ID: ${lente.idlente} — Modelo: ${lente.material} — $${venta ? venta.total : 'N/A'}`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {selectedLente && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">ID Lente</div>
                          <div className="text-lg font-bold text-blue-900">{selectedLente.idlente}</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Material</div>
                          <div className="text-lg font-bold text-purple-900">{selectedLente.material}</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Tratamiento</div>
                          <div className="text-lg font-bold text-indigo-900">{selectedLente.tratamiento}</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
                          <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-1">Tipo</div>
                          <div className="text-lg font-bold text-cyan-900">{selectedLente.tipo_de_lente}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Armazón</div>
                          <div className="text-base font-semibold text-gray-900">{selectedLente.armazon}</div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="h-3 w-3 text-gray-600" />
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Fecha Entrega</div>
                          </div>
                          <div className="text-base font-semibold text-gray-900">
                            {new Date(selectedLente.fecha_entrega).toLocaleDateString('es-MX', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Estatus</div>
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedLente.estatus)}`}>
                            {selectedLente.estatus === 'Entregado' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            <span>{selectedLente.estatus}</span>
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
                                <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{selectedLente.od_esf}</td>
                                <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{selectedLente.od_cil}</td>
                                <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{selectedLente.od_eje}°</td>
                                <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{selectedLente.od_add}</td>
                                <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{selectedLente.od_av}</td>
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
                                <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{selectedLente.oi_esf}</td>
                                <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{selectedLente.oi_cil}</td>
                                <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{selectedLente.oi_eje}°</td>
                                <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900 border-r border-gray-200">{selectedLente.oi_add}</td>
                                <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{selectedLente.oi_av}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Pago Section - Improved */}
              {( new URLSearchParams(window.location.search).get('undelivered') === 'pago' || new URLSearchParams(window.location.search).get('undelivered') === null ) && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 mt-8">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Información del Pago</h3>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Opción de Pago</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center px-4 py-3 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-all duration-200">
                        <input 
                          type="radio" 
                          name="pagoOption" 
                          value="existing" 
                          checked={pagoOption === 'existing'} 
                          onChange={() => setPagoOption('existing')} 
                          className="mr-3 w-4 h-4 text-green-600" 
                        />
                        <span className="font-medium text-gray-700">Pago Existente</span>
                      </label>
                      <label className="flex items-center px-4 py-3 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-all duration-200">
                        <input 
                          type="radio" 
                          name="pagoOption" 
                          value="new" 
                          checked={pagoOption === 'new'} 
                          onChange={() => setPagoOption('new')} 
                          className="mr-3 w-4 h-4 text-green-600" 
                        />
                        <span className="font-medium text-gray-700">Nuevo Pago</span>
                      </label>
                    </div>
                  </div>

                  {pagoOption === 'existing' ? (
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <CreditCard className="h-4 w-4 text-green-600" />
                          <span>Seleccionar Pago</span>
                        </label>
                        <select 
                          name="idpago" 
                          value={formData.idpago} 
                          onChange={handlePagoChange} 
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-700 font-medium hover:border-gray-400"
                        >
                          <option value="">— Seleccionar Pago —</option>
                          {pendingPagos.map(pago => (
                            <option key={pago.idpago} value={pago.idpago}>
                              {`${pago.cliente_nombre} ${pago.cliente_paterno} — $${pago.cantidad}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Folio de Venta *</label>
                        <select name="folio" value={newPagoData.folio} onChange={handleNewPagoChange} required className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200">
                          <option value="">Seleccionar Folio</option>
                          {ventas.map(venta => (
                            <option key={venta.folio} value={venta.folio}>{venta.folio}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha *</label>
                        <input type="date" name="fecha" value={newPagoData.fecha} onChange={handleNewPagoChange} required className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad *</label>
                        <input type="number" step="0.01" name="cantidad" value={newPagoData.cantidad} onChange={handleNewPagoChange} required className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200" />
                      </div>
                    </div>
                  )}

                  {selectedPago && pagoOption === 'existing' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                          <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">ID Pago</div>
                          <div className="text-lg font-bold text-green-900">{selectedPago.idpago}</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Folio</div>
                          <div className="text-lg font-bold text-blue-900">{selectedPago.folio}</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Cantidad</div>
                          <div className="text-lg font-bold text-purple-900">${selectedPago.cantidad}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="h-3 w-3 text-gray-600" />
                            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Fecha</div>
                          </div>
                          <div className="text-base font-semibold text-gray-900">
                            {new Date(selectedPago.fecha).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Cliente</div>
                          <div className="text-base font-semibold text-gray-900">{selectedPago.cliente_nombre} {selectedPago.cliente_paterno}</div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Estatus</div>
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedPago.estatus)}`}>
                          {selectedPago.estatus === 'Pagado' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          <span>{selectedPago.estatus}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )}

              <div className="flex justify-end pt-6 border-t-2 border-gray-200 mt-8">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? 'Creando...' : 'Crear Entrega'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteEntregaForm;