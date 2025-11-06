import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import entregaService from '../../service/entregaService';
import rutaService from '../../service/rutaService';
import lenteService from '../../service/lenteService';
import pagoService from '../../service/pagoService';
import ventaService from '../../service/ventaService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft } from 'lucide-react';
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
  const [pagoOption, setPagoOption] = useState('existing'); // 'existing' or 'new'
  const [newPagoData, setNewPagoData] = useState({
    folio: '',
    fecha: new Date().toISOString().slice(0, 10),
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

        // Pre-select route if coming from ruta-asesor
        const urlParams = new URLSearchParams(window.location.search);
        const rutaId = urlParams.get('ruta');
        const undeliveredType = urlParams.get('undelivered');

        if (rutaId) {
          setFormData(prev => ({ ...prev, idruta: rutaId }));
        }

        // If coming from undelivered registration, set status to "No entregado" and disable it
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

    // Validation: At least one of lente or pago must be selected
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

      // If creating new payment
      if (pagoOption === 'new') {
        const newPago = await pagoService.createPago({
          ...newPagoData,
          cantidad: parseFloat(newPagoData.cantidad) || 0,
          estatus: 'Pendiente',
        });
        pagoId = newPago.id;
      }

      // Create entrega
      const entregaData = {
        ...formData,
        idpago: pagoId || null,
      };
      await entregaService.createEntrega(entregaData);

      // Update lente status if selected
      if (formData.idlente) {
        const lenteUpdateData = {
          ...selectedLente,
          estatus: formData.estatus,
        };

        // Ensure date fields are in YYYY-MM-DD format only
        if (lenteUpdateData.fecha_entrega) {
          lenteUpdateData.fecha_entrega = lenteUpdateData.fecha_entrega.split('T')[0];
        }
        if (lenteUpdateData.examen_seguimiento) {
          lenteUpdateData.examen_seguimiento = lenteUpdateData.examen_seguimiento.split('T')[0];
        }

        // Remove timestamp fields that are handled by database
        delete lenteUpdateData.created_at;
        delete lenteUpdateData.updated_at;

        await lenteService.updateLente(formData.idlente, lenteUpdateData);

        // Update route counters if delivery is successful
        if (formData.estatus === 'Entregado' && formData.idruta) {
          const currentRoute = rutas.find(r => r.idruta == formData.idruta);
          if (currentRoute) {
            const routeUpdateData = {
              ...currentRoute,
              lentes_entregados: (currentRoute.lentes_entregados || 0) + 1,
            };

            // Ensure date field is in YYYY-MM-DD format only
            if (routeUpdateData.fecha) {
              routeUpdateData.fecha = routeUpdateData.fecha.split('T')[0];
            }

            await rutaService.updateRuta(formData.idruta, routeUpdateData);
          }
        }

        // Update route counters for undelivered items
        if (formData.estatus === 'No entregado' && formData.idruta) {
          const currentRoute = rutas.find(r => r.idruta == formData.idruta);
          if (currentRoute) {
            const routeUpdateData = {
              ...currentRoute,
            };

            // Increment the appropriate counter based on what was not delivered
            if (formData.idlente) {
              routeUpdateData.lentes_no_entregados = (currentRoute.lentes_no_entregados || 0) + 1;
            }
            if (pagoId) {
              routeUpdateData.tarjetas_no_entregadas = (currentRoute.tarjetas_no_entregadas || 0) + 1;
            }

            // Ensure date field is in YYYY-MM-DD format only
            if (routeUpdateData.fecha) {
              routeUpdateData.fecha = routeUpdateData.fecha.split('T')[0];
            }

            await rutaService.updateRuta(formData.idruta, routeUpdateData);
          }
        }
      }

      // Update pago status if selected
      if (pagoId) {
        const pagoToUpdate = pagoOption === 'new' ? {
          ...newPagoData,
          estatus: formData.estatus === 'Entregado' ? 'Pagado' : 'Pendiente'
        } : {
          ...selectedPago,
          estatus: formData.estatus === 'Entregado' ? 'Pagado' : 'Pendiente',
        };
        await pagoService.updatePago(pagoId, pagoToUpdate);

        // Update route counters if payment delivery is successful
        if (formData.estatus === 'Entregado' && formData.idruta) {
          const currentRoute = rutas.find(r => r.idruta == formData.idruta);
          if (currentRoute) {
            const routeUpdateData = {
              ...currentRoute,
              tarjetas_entregadas: (currentRoute.tarjetas_entregadas || 0) + 1,
            };

            // Ensure date field is in YYYY-MM-DD format only
            if (routeUpdateData.fecha) {
              routeUpdateData.fecha = routeUpdateData.fecha.split('T')[0];
            }

            await rutaService.updateRuta(formData.idruta, routeUpdateData);
          }
        }
      }

      // Navigate back to ruta asesor if coming from there, otherwise to entregas
      const urlParams = new URLSearchParams(window.location.search);
      const rutaId = urlParams.get('ruta');
      const undeliveredType = urlParams.get('undelivered');

      if (rutaId && undeliveredType) {
        // If registering undelivered items, navigate back to window 3
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
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-700">NUEVA ENTREGA COMPLETA</h1>
            </div>
          </div>
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ruta *</label>
                  <select name="idruta" value={formData.idruta} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Seleccionar Ruta</option>
                    {rutas.map(ruta => (
                      <option key={ruta.idruta} value={ruta.idruta}>{`Ruta ${ruta.idruta} - ${new Date(ruta.fecha).toLocaleDateString()}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estatus *</label>
                  <select
                    name="estatus"
                    value={formData.estatus}
                    onChange={handleChange}
                    required
                    disabled={new URLSearchParams(window.location.search).get('undelivered') !== null}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="No entregado">No entregado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motivo *</label>
                  <textarea name="motivo" value={formData.motivo} onChange={handleChange} required rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora *</label>
                  <input type="time" name="hora" value={formData.hora} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              {/* Lente Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Lente</label>
                    <select name="idlente" value={formData.idlente} onChange={handleLenteChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Seleccionar Lente</option>
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
                </div>
                {selectedLente && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Detalles del Lente</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><strong>ID:</strong> {selectedLente.idlente}</div>
                      <div><strong>Material:</strong> {selectedLente.material}</div>
                      <div><strong>Tratamiento:</strong> {selectedLente.tratamiento}</div>
                      <div><strong>Tipo:</strong> {selectedLente.tipo_de_lente}</div>
                      <div><strong>Armazón:</strong> {selectedLente.armazon}</div>
                      <div><strong>Fecha Entrega:</strong> {new Date(selectedLente.fecha_entrega).toLocaleDateString()}</div>
                      <div><strong>Estatus:</strong> {selectedLente.estatus}</div>
                      {/*Graduación details in a table format
                      od_esf decimal(5,2) DEFAULT NULL, od_cil decimal(5,2) DEFAULT NULL, od_eje smallint DEFAULT NULL, od_add decimal(5,2) DEFAULT NULL, od_av varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL, oi_esf decimal(5,2) DEFAULT NULL, oi_cil decimal(5,2) DEFAULT NULL, oi_eje smallint DEFAULT NULL, oi_add decimal(5,2) DEFAULT NULL, oi_av varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,*/}
                      <div></div>
                      <table className="table-auto w-full text-sm mt-4 border border-gray-300">
                        <thead>
                          <tr>
                            <th className="border px-2 py-1">Graduación</th>
                            <th className="border px-2 py-1">Esfera</th>
                            <th className="border px-2 py-1">Cilindro</th>
                            <th className="border px-2 py-1">Eje</th>
                            <th className="border px-2 py-1">Add</th>
                            <th className="border px-2 py-1">AV</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border px-2 py-1">Ojo Derecho</td>
                            <td className="border px-2 py-1">{selectedLente.od_esf}</td>
                            <td className="border px-2 py-1">{selectedLente.od_cil}</td>
                            <td className="border px-2 py-1">{selectedLente.od_eje}</td>
                            <td className="border px-2 py-1">{selectedLente.od_add}</td>
                            <td className="border px-2 py-1">{selectedLente.od_av}</td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-1">Ojo Izquierdo</td>
                            <td className="border px-2 py-1">{selectedLente.oi_esf}</td>
                            <td className="border px-2 py-1">{selectedLente.oi_cil}</td>
                            <td className="border px-2 py-1">{selectedLente.oi_eje}</td>
                            <td className="border px-2 py-1">{selectedLente.oi_add}</td>
                            <td className="border px-2 py-1">{selectedLente.oi_av}</td>
                          </tr>
                        </tbody>
                      </table>

                    </div>
                  </div>
                )}
              </div>

              {/* Pago Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pago</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opción de Pago</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input type="radio" name="pagoOption" value="existing" checked={pagoOption === 'existing'} onChange={() => setPagoOption('existing')} className="mr-2" />
                      Pago Existente
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="pagoOption" value="new" checked={pagoOption === 'new'} onChange={() => setPagoOption('new')} className="mr-2" />
                      Nuevo Pago
                    </label>
                  </div>
                </div>

                {pagoOption === 'existing' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Pago</label>
                      <select name="idpago" value={formData.idpago} onChange={handlePagoChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="">Seleccionar Pago</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Folio de Venta *</label>
                      <select name="folio" value={newPagoData.folio} onChange={handleNewPagoChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="">Seleccionar Folio</option>
                        {ventas.map(venta => (
                          <option key={venta.folio} value={venta.folio}>{venta.folio}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                      <input type="date" name="fecha" value={newPagoData.fecha} onChange={handleNewPagoChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad *</label>
                      <input type="number" step="0.01" name="cantidad" value={newPagoData.cantidad} onChange={handleNewPagoChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                )}

                {selectedPago && pagoOption === 'existing' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Detalles del Pago</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><strong>ID:</strong> {selectedPago.idpago}</div>
                      <div><strong>Folio:</strong> {selectedPago.folio}</div>
                      <div><strong>Fecha:</strong> {new Date(selectedPago.fecha).toLocaleDateString()}</div>
                      <div><strong>Cantidad:</strong> ${selectedPago.cantidad}</div>
                      <div><strong>Cliente:</strong> {selectedPago.cliente_nombre} {selectedPago.cliente_paterno}</div>
                      <div><strong>Estatus:</strong> {selectedPago.estatus}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button type="submit" disabled={loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="h-4 w-4" />
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