import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import pagoService from '../../service/pagoService';
import ventaService from '../../service/ventaService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, User } from 'lucide-react';
import { validatePagoForm, validatePagoField } from '../../utils/validations/index.js';

const PagoForm = () => {
  const [formData, setFormData] = useState({
    folio: '',
    fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    cantidad: '',
    estatus: 'Pendiente',
  });
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [saldoPendiente, setSaldoPendiente] = useState(null);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [originalFolio, setOriginalFolio] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const ventasData = await ventaService.getAllVentas();
        setVentas(ventasData);

        if (id) {
          const pagoData = await pagoService.getPagoById(id);
          setFormData({
            ...pagoData,
            fecha: new Date(pagoData.fecha).toISOString().slice(0, 10),
          });

          // GUARDAMOS LA FOTO INICIAL
          setOriginalAmount(parseFloat(pagoData.cantidad) || 0);
          setOriginalFolio(pagoData.folio);
          
          // Ejecutamos el cálculo inicial del saldo para que aparezca al cargar
          const ventaAsociada = ventasData.find(v => v.folio === pagoData.folio);
          if (ventaAsociada) {
              const deudaReal = parseFloat(ventaAsociada.total) - parseFloat(ventaAsociada.pagado);
              // Al editar, mi saldo disponible es: Lo que debe la venta + Lo que yo ya había pagado en este registro
              setSaldoPendiente(deudaReal + (parseFloat(pagoData.cantidad) || 0));
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

  useEffect(() => {
    const errors = validatePagoForm(formData);
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [formData, fieldErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // LÓGICA AGREGADA: Calcular saldo al cambiar folio
    if (name === 'folio') {
      const ventaSeleccionada = ventas.find(v => v.folio === value);
      if (ventaSeleccionada) {
        // Si estamos editando, debemos sumar el pago actual al saldo pendiente "visual"
        // para permitir que el usuario vuelva a poner el mismo monto.
        const pagadoActualEnBD = parseFloat(ventaSeleccionada.pagado) || 0;
        const total = parseFloat(ventaSeleccionada.total) || 0;
        
        // Si es edición (id existe), el saldo disponible es (Total - PagadoReal + MontoDeEstePago)
        // Si es nuevo, es (Total - PagadoReal)
        let disponible = total - pagadoActualEnBD;
        
        // TRUCO DE EDICIÓN:
        // Si estoy editando (id existe) Y el folio que seleccioné es el mismo que tenía originalmente...
        // entonces sumo el monto original al disponible, porque ese dinero "regresa" a mi cartera para reasignarlo.
        if (id && value === originalFolio) {
          disponible += originalAmount;
        }
        
        setSaldoPendiente(disponible);
        
        // Re-validar cantidad si ya había un número escrito
        if (formData.cantidad) {
             validateAmount(formData.cantidad, disponible);
        }
      } else {
        setSaldoPendiente(null);
      }
    }

    // VALIDACIÓN DE CANTIDAD
    if (name === 'cantidad') {
        // Si cambio la cantidad, valido contra el saldoPendiente actual
        if (saldoPendiente !== null) {
            validateAmount(value, saldoPendiente);
        }
    }

    // Validación en tiempo real
    if (touched[name]) {
      const error = validatePagoField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateAmount = (val, maximo) => {
      if (parseFloat(val) > maximo + 0.1) { // +0.1 margen decimales
          setFieldErrors(prev => ({...prev, cantidad: `Máximo permitido: $${maximo.toFixed(2)}`}));
      } else {
          setFieldErrors(prev => {
             const newErr = {...prev};
             delete newErr.cantidad;
             return newErr;
          });
      }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validatePagoField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación completa del formulario
    const errors = validatePagoForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        cantidad: parseFloat(formData.cantidad) || 0,
      };

      if (id) {
        await pagoService.updatePago(id, dataToSubmit);
      } else {
        await pagoService.createPago(dataToSubmit);
      }
      navigate('/pagos');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !id) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {id ? 'Editar Pago' : 'Nuevo Pago'}
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    {id ? 'Actualiza la información del pago' : 'Completa los datos del nuevo pago'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/pagos')}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Payment Information Section */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información de Pago</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Folio de Venta
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="folio" value={formData.folio} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.folio
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}>
                        <option value="">Seleccionar Folio</option>
                        {ventas.map(venta => (
                          <option key={venta.folio} value={venta.folio}>{venta.folio}</option>
                        ))}
                      </select>
                      {fieldErrors.folio && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.folio}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Fecha
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.fecha
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} />
                      {fieldErrors.fecha && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.fecha}
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Cantidad
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input 
                        type="number" 
                        step="0.01" 
                        name="cantidad" 
                        value={formData.cantidad} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        required 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.cantidad
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}
                      />
                      
                      {/* MENSAJE DE AYUDA VISUAL */}
                      {saldoPendiente !== null && !fieldErrors.cantidad && (
                        <p className="text-blue-600 text-xs mt-2 font-medium">
                            Saldo pendiente de la venta: ${saldoPendiente.toLocaleString('es-MX')}
                        </p>
                      )}
                      
                      {/* MENSAJE DE ERROR */}
                      {fieldErrors.cantidad && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.cantidad}
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Estatus
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="estatus" value={formData.estatus} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.estatus
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagado">Pagado</option>
                      </select>
                      {fieldErrors.estatus && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.estatus}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t-2 border-gray-200">
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar Pago' : 'Crear Pago')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoForm;
