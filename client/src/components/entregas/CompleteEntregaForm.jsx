import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router'; // Agregado useParams
import entregaService from '../../service/entregaService';
import rutaService from '../../service/rutaService';
import lenteService from '../../service/lenteService';
import pagoService from '../../service/pagoService';
import ventaService from '../../service/ventaService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, Eye, Package, Calendar, CheckCircle, AlertCircle, DollarSign, CreditCard, Truck, Clock, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import { validateEntregaForm, validateEntregaField } from '../../utils/validations/index.js';

const CompleteEntregaForm = () => {
  const [formData, setFormData] = useState({
    idruta: '',
    estatus: 'No entregado',
    idlente: '',
    idpago: '',
    motivo: '',
    hora: new Date().toTimeString().slice(0, 5),
  });

  // Estado para guardar la data original al editar (para poder revertir estatus)
  const [originalData, setOriginalData] = useState(null);

  const [rutas, setRutas] = useState([]);
  const [lentes, setLentes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [ventas, setVentas] = useState([]);
  
  const [selectedLente, setSelectedLente] = useState(null);
  const [selectedPago, setSelectedPago] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [pagoOption, setPagoOption] = useState('existing');
  
  const [newPagoData, setNewPagoData] = useState({
    folio: '',
    fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    cantidad: '',
  });

  const navigate = useNavigate();
  const { id } = useParams(); // Detectar ID para edición

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Nota: Para edición, idealmente deberíamos traer todos los lentes/pagos 
        // o hacer una petición extra para traer el lente específico si ya no está "pendiente".
        // Aquí asumimos que getAllLentes o getPendingLentes manejan esto, 
        // pero para edición robusta se suele usar getAll.
        const [rutasData, lentesData, pagosData, ventasData] = await Promise.all([
          rutaService.getAllRutas(),
          lenteService.getAllLentes(), // Cambiado a AllLentes para asegurar que aparezca el actual al editar
          pagoService.getAllPagos(),   // Cambiado a AllPagos por la misma razón
          ventaService.getAllVentas(),
        ]);
        
        setRutas(rutasData);
        setLentes(lentesData);
        setPagos(pagosData);
        setVentas(ventasData);

        // Lógica de Edición
        if (id) {
          const entregaData = await entregaService.getEntregaById(id);
          
          setFormData({
            ...entregaData,
            hora: entregaData.hora || new Date().toTimeString().slice(0, 5),
          });
          
          // Guardamos la data original para comparar cambios después
          setOriginalData(entregaData);

          // Pre-seleccionar objetos visuales
          if (entregaData.idlente) {
            const l = lentesData.find(x => String(x.idlente) === String(entregaData.idlente));
            setSelectedLente(l);
          }
          if (entregaData.idpago) {
            const p = pagosData.find(x => String(x.idpago) === String(entregaData.idpago));
            setSelectedPago(p);
            setPagoOption('existing');
          }
        } else {
          // Lógica de Creación (solo params URL)
          const urlParams = new URLSearchParams(window.location.search);
          const rutaId = urlParams.get('ruta');
          const undeliveredType = urlParams.get('undelivered');

          if (rutaId) {
            setFormData(prev => ({ ...prev, idruta: rutaId }));
          }
          if (undeliveredType) {
            setFormData(prev => ({ ...prev, estatus: 'No entregado' }));
          }
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Sincronizar fecha de nuevo pago con la ruta
  useEffect(() => {
    if (formData.idruta && rutas.length > 0) {
      const selectedRoute = rutas.find(r => r.idruta == formData.idruta);
      if (selectedRoute && selectedRoute.fecha) {
        setNewPagoData(prev => ({ ...prev, fecha: selectedRoute.fecha.split('T')[0] }));
      }
    }
  }, [formData.idruta, rutas]);

  useEffect(() => {
    const errors = validateEntregaForm(formData, { pagoOption });
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [formData, fieldErrors, pagoOption]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si cambiamos el lente, reseteamos el pago para evitar inconsistencias de folio
    if (name === 'idlente') {
       setFormData(prev => ({ ...prev, [name]: value, idpago: '' }));
       setSelectedPago(null);
       const lente = lentes.find(l => l.idlente == value);
       setSelectedLente(lente);
    } else {
       setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Validación en tiempo real
    if (touched[name]) {
      const error = validateEntregaField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateEntregaField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  // Manejador específico (aunque integrado arriba, lo mantenemos por consistencia visual)
  const handleLenteChange = (e) => {
    handleChange(e);
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

    // Validación completa del formulario
    const errors = validateEntregaForm(formData, { pagoOption });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const generalError = errors.general || 'Por favor corrige los errores en el formulario';
      setError(generalError);
      return;
    }

    if (pagoOption === 'new' && !newPagoData.folio) {
      setError('Debe seleccionar un folio para el nuevo pago.');
      return;
    }

    setLoading(true);
    try {
      // 1. Manejo de reversión de estatus (Si estamos editando)
      if (id && originalData) {
        // Si había un lente y se cambió o se quitó
        if (originalData.idlente && String(originalData.idlente) !== String(formData.idlente)) {
          await lenteService.updateLente(originalData.idlente, { estatus: 'Pendiente' });
        }
        // Si había un pago y se cambió o se quitó
        if (originalData.idpago && String(originalData.idpago) !== String(formData.idpago)) {
          await pagoService.updatePago(originalData.idpago, { estatus: 'Pendiente' });
        }
      }

      // 2. Crear o determinar ID del pago actual
      let pagoId = formData.idpago;

      if (pagoOption === 'new') {
        const newPago = await pagoService.createPago({
          ...newPagoData,
          cantidad: parseFloat(newPagoData.cantidad) || 0,
          estatus: 'Pendiente',
        });
        pagoId = newPago.id;
      }

      // 3. Guardar/Actualizar Entrega
      const entregaData = {
        ...formData,
        idpago: pagoId || null,
      };

      if (id) {
        await entregaService.updateEntrega(id, entregaData);
      } else {
        await entregaService.createEntrega(entregaData);
      }

      // 4. Actualizar estatus del Lente seleccionado
      if (formData.idlente) {
        const lenteUpdateData = {
          ...selectedLente,
          estatus: formData.estatus,
        };
        // Limpieza de fechas y campos timestamp
        if (lenteUpdateData.fecha_entrega) lenteUpdateData.fecha_entrega = lenteUpdateData.fecha_entrega.split('T')[0];
        if (lenteUpdateData.examen_seguimiento) lenteUpdateData.examen_seguimiento = lenteUpdateData.examen_seguimiento.split('T')[0];
        delete lenteUpdateData.created_at;
        delete lenteUpdateData.updated_at;

        await lenteService.updateLente(formData.idlente, lenteUpdateData);
        
        // Lógica de contadores de Ruta para Lentes
        const currentRoute = rutas.find(r => r.idruta == formData.idruta);
        if (currentRoute && !id) { // Solo sumar contadores si es creación nueva (evitar doble conteo simple)
            // Nota: Para edición perfecta de contadores se requiere lógica más compleja (restar del anterior, sumar al nuevo),
            // se mantiene la lógica original de creación por seguridad.
            const routeUpdateData = { ...currentRoute };
            if (routeUpdateData.fecha) routeUpdateData.fecha = routeUpdateData.fecha.split('T')[0];

            if (formData.estatus === 'Entregado') {
               routeUpdateData.lentes_entregados = (currentRoute.lentes_entregados || 0) + 1;
            } else if (formData.estatus === 'No entregado') {
               routeUpdateData.lentes_no_entregados = (currentRoute.lentes_no_entregados || 0) + 1;
            }
            await rutaService.updateRuta(formData.idruta, routeUpdateData);
        }
      }

      // 5. Actualizar estatus y FECHA del Pago
      if (pagoId) {
        // Obtener fecha de la ruta actual para sincronizar
        const currentRoute = rutas.find(r => r.idruta == formData.idruta);
        const fechaRuta = currentRoute ? currentRoute.fecha.split('T')[0] : new Date().toISOString().slice(0, 10);

        const pagoToUpdate = pagoOption === 'new' ? {
          ...newPagoData,
          estatus: formData.estatus === 'Entregado' ? 'Pagado' : 'Pendiente',
          fecha: fechaRuta // Sincronización forzada
        } : {
          ...selectedPago,
          estatus: formData.estatus === 'Entregado' ? 'Pagado' : 'Pendiente',
          fecha: fechaRuta // Sincronización forzada
        };
        
        await pagoService.updatePago(pagoId, pagoToUpdate);

        // Lógica de contadores de Ruta para Pagos
        if (currentRoute && !id) {
             const routeUpdateData = { ...currentRoute };
             if (routeUpdateData.fecha) routeUpdateData.fecha = routeUpdateData.fecha.split('T')[0];

             if (formData.estatus === 'Entregado') {
               routeUpdateData.tarjetas_entregadas = (currentRoute.tarjetas_entregadas || 0) + 1;
             } else if (formData.estatus === 'No entregado') {
               routeUpdateData.tarjetas_no_entregadas = (currentRoute.tarjetas_no_entregadas || 0) + 1;
             }
             await rutaService.updateRuta(formData.idruta, routeUpdateData);
        }
      }

      // Redirección
      const urlParams = new URLSearchParams(window.location.search);
      const rutaIdParam = urlParams.get('ruta');
      const undeliveredType = urlParams.get('undelivered');

      if (rutaIdParam && undeliveredType) {
        navigate('/ruta-asesor?window=3');
      } else if (rutaIdParam) {
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

  // --- LÓGICA DE FILTRADO PRINCIPAL ---
  // 1. Si hay lente seleccionado, filtrar pagos por su folio.
  // 2. Filtrar también para mostrar solo pendientes (o el pago que ya tiene asignado si estamos editando)
  
  // Lentes disponibles: Pendientes o "No entregados", O el lente actual si estamos editando
  const availableLentes = lentes.filter(l => 
     l.estatus === 'Pendiente' || 
     l.estatus === 'No entregado' || 
     (id && String(l.idlente) === String(formData.idlente))
  );

  // Calcular pagos filtrados
  const filteredPagos = pagos.filter(p => {
    // Condición base: debe ser pendiente O ser el pago actual de la edición
    const isAvailableStatus = p.estatus === 'Pendiente' || (id && String(p.idpago) === String(formData.idpago));
    
    if (!isAvailableStatus) return false;

    // Condición de folio:
    if (selectedLente) {
      // Si hay lente seleccionado, EL PAGO DEBE TENER EL MISMO FOLIO
      return p.folio === selectedLente.folio;
    }
    // Si no hay lente seleccionado, mostrar todos los disponibles
    return true;
  });


  if (loading && rutas.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>; 
  }
  
  // Componente de carga simple inline para ahorrar espacio
  function LoadingSpinner() {
      return (
        <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <span className="text-xl font-medium text-gray-600">Cargando...</span>
        </div>
      );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <h3 className="font-bold text-red-900">Error</h3>
            <p className="text-red-700">{error}</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-red-700 underline">Volver</button>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <NavComponent />
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{id ? 'Editar Entrega' : 'Nueva Entrega Completa'}</h1>
                  <p className="text-blue-100 text-sm mt-1">{id ? 'Modifica los detalles de la entrega' : 'Registra la entrega de lentes y pagos'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* General Information Section */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información General</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span>Ruta</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="idruta"
                        value={formData.idruta}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        disabled={new URLSearchParams(window.location.search).get('ruta') !== null}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.idruta
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      >
                        <option value="">Seleccionar Ruta</option>
                        {rutas.map(ruta => (
                          <option key={ruta.idruta} value={ruta.idruta}>{`Ruta ${ruta.idruta} - ${new Date(ruta.fecha).toLocaleDateString()}`}</option>
                        ))}
                      </select>
                      {fieldErrors.idruta && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.idruta}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span>Estatus</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="estatus"
                        value={formData.estatus}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        disabled={new URLSearchParams(window.location.search).get('undelivered') !== null}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.estatus
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      >
                        <option value="No entregado">No entregado</option>
                        <option value="Entregado">Entregado</option>
                      </select>
                      {fieldErrors.estatus && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.estatus}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <span>Descripción</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="motivo"
                        value={formData.motivo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        rows="3"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 resize-none ${
                          fieldErrors.motivo
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}
                        placeholder="Describe los detalles de la entrega..."
                      />
                      {fieldErrors.motivo && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.motivo}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Hora</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="hora"
                        value={formData.hora}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.hora
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}
                      />
                      {fieldErrors.hora && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.hora}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lente Section */}
              {(new URLSearchParams(window.location.search).get('undelivered') === 'lente' || new URLSearchParams(window.location.search).get('undelivered') === null) && (
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl overflow-hidden border border-indigo-100">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Información del Lente</h3>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                          <Package className="h-4 w-4 text-indigo-600" />
                          <span>Seleccionar Lente</span>
                        </label>
                        <select 
                          name="idlente" 
                          value={formData.idlente} 
                          onChange={handleLenteChange}
                          disabled={new URLSearchParams(window.location.search).get('undelivered') === 'pago'}
                          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">— Seleccionar Lente —</option>
                          {availableLentes.map(lente => {
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
                        <div className="space-y-6">
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

                          {/* Graduation Table */}
                          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="bg-indigo-100 p-2 rounded-lg">
                                <Eye className="h-5 w-5 text-indigo-600" />
                              </div>
                              <h4 className="text-lg font-bold text-gray-900">Graduación</h4>
                            </div>
                            
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Ojo</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Esfera</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Cilindro</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Eje</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">Add</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">AV</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                  <tr className="hover:bg-indigo-50 transition-colors duration-150">
                                    <td className="px-4 py-4">
                                      <div className="flex items-center space-x-2">
                                        <div className="bg-indigo-100 p-1.5 rounded-lg">
                                          <Eye className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <span className="font-semibold text-gray-900">Derecho</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{selectedLente.od_esf}</td>
                                    <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{selectedLente.od_cil}</td>
                                    <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{selectedLente.od_eje}°</td>
                                    <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{selectedLente.od_add}</td>
                                    <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{selectedLente.od_av}</td>
                                  </tr>
                                  <tr className="hover:bg-purple-50 transition-colors duration-150">
                                    <td className="px-4 py-4">
                                      <div className="flex items-center space-x-2">
                                        <div className="bg-purple-100 p-1.5 rounded-lg">
                                          <Eye className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <span className="font-semibold text-gray-900">Izquierdo</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{selectedLente.oi_esf}</td>
                                    <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{selectedLente.oi_cil}</td>
                                    <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{selectedLente.oi_eje}°</td>
                                    <td className="px-4 py-4 text-center font-mono font-semibold text-gray-900">{selectedLente.oi_add}</td>
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
                </div>
              )}

              {/* Pago Section */}
              {(new URLSearchParams(window.location.search).get('undelivered') === 'pago' || new URLSearchParams(window.location.search).get('undelivered') === null) && (
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl overflow-hidden border border-green-100">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                          <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Información del Pago</h3>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Payment Option Toggle */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Opción de Pago</label>
                        <div className="flex flex-wrap gap-4">
                          <label className={`flex items-center px-5 py-3 bg-white border-2 rounded-xl cursor-pointer transition-all duration-200 ${pagoOption === 'existing' ? 'border-green-500 ring-4 ring-green-100 shadow-md' : 'border-gray-200 hover:border-green-300'}`}>
                            <input 
                              type="radio" 
                              name="pagoOption" 
                              value="existing" 
                              checked={pagoOption === 'existing'} 
                              onChange={() => setPagoOption('existing')} 
                              className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500" 
                            />
                            <span className="font-medium text-gray-700">Pago Existente</span>
                          </label>
                          <label className={`flex items-center px-5 py-3 bg-white border-2 rounded-xl cursor-pointer transition-all duration-200 ${pagoOption === 'new' ? 'border-green-500 ring-4 ring-green-100 shadow-md' : 'border-gray-200 hover:border-green-300'}`}>
                            <input 
                              type="radio" 
                              name="pagoOption" 
                              value="new" 
                              checked={pagoOption === 'new'} 
                              onChange={() => setPagoOption('new')} 
                              className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500" 
                            />
                            <span className="font-medium text-gray-700">Nuevo Pago</span>
                          </label>
                        </div>
                      </div>

                      {pagoOption === 'existing' ? (
                        <div>
                          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                            <CreditCard className="h-4 w-4 text-green-600" />
                            <span>Seleccionar Pago</span>
                          </label>
                          <select 
                            name="idpago" 
                            value={formData.idpago} 
                            onChange={handlePagoChange}
                            disabled={selectedLente && filteredPagos.length === 0} 
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 border-gray-200 focus:ring-green-100 focus:border-green-500 hover:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500"
                          >
                            <option value="">
                                {selectedLente && filteredPagos.length === 0 
                                  ? `— No hay pagos pendientes para el folio ${selectedLente.folio} —`
                                  : "— Seleccionar Pago —"}
                            </option>
                            {filteredPagos.map(pago => (
                              <option key={pago.idpago} value={pago.idpago}>
                                {`${pago.cliente_nombre} ${pago.cliente_paterno} — Folio: ${pago.folio} — $${pago.cantidad}`}
                              </option>
                            ))}
                          </select>
                          {selectedLente && (
                              <p className="text-xs text-green-600 mt-2 pl-1">
                                  * Filtrando pagos por folio: <b>{selectedLente.folio}</b>
                              </p>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Formulario de nuevo pago se mantiene igual */}
                          <div>
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                              <span>Folio de Venta</span>
                              <span className="text-red-500">*</span>
                            </label>
                            <select 
                              name="folio" 
                              value={newPagoData.folio} 
                              onChange={handleNewPagoChange} 
                              required 
                              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 border-gray-200 focus:ring-green-100 focus:border-green-500 hover:border-gray-300"
                            >
                              <option value="">Seleccionar Folio</option>
                              {ventas.map(venta => (
                                <option key={venta.folio} value={venta.folio}>{venta.folio}</option>
                              ))}
                            </select>
                          </div>
                          {/* Resto de campos de nuevo pago... */}
                           <div>
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span>Fecha</span>
                              <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="date" 
                              name="fecha" 
                              value={newPagoData.fecha} 
                              onChange={handleNewPagoChange}
                              disabled
                              required 
                              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 border-gray-200 focus:ring-green-100 focus:border-green-500 hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                            />
                          </div>
                          <div>
                            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span>Cantidad</span>
                              <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="number" 
                              step="0.01" 
                              name="cantidad" 
                              value={newPagoData.cantidad} 
                              onChange={handleNewPagoChange} 
                              required 
                              placeholder="0.00"
                              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 border-gray-200 focus:ring-green-100 focus:border-green-500 hover:border-gray-300" 
                            />
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
                              <div className="text-lg font-bold text-purple-900">${parseFloat(selectedPago.cantidad).toLocaleString('es-MX')}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center space-x-2 mb-1">
                                <Calendar className="h-3 w-3 text-gray-600" />
                                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Fecha Anterior</div>
                              </div>
                              <div className="text-base font-semibold text-gray-900">
                                {new Date(selectedPago.fecha).toLocaleDateString('es-MX', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
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
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t-2 border-gray-100">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? (id ? 'Guardando...' : 'Creando...') : (id ? 'Actualizar Entrega' : 'Crear Entrega')}</span>
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