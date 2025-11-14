import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import pagoService from '../../service/pagoService';
import ventaService from '../../service/ventaService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft } from 'lucide-react';
import { validatePagoForm, validatePagoField } from '../../utils/validations/index.js';

const PagoForm = () => {
  const [formData, setFormData] = useState({
    folio: '',
    fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    cantidad: '',
    estatus: 'Pendiente',
  });
  const [cantidadDisplay, setCantidadDisplay] = useState('');
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  // Función para formatear el número con $ y comas
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '';
    return '$' + parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Función para parsear el input (remover $ y comas)
  const parseCurrency = (value) => {
    return value.replace(/[$,]/g, '');
  };

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
          setCantidadDisplay(formatCurrency(pagoData.cantidad));
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
    setCantidadDisplay(formatCurrency(formData.cantidad));
  }, [formData.cantidad]);

  useEffect(() => {
    const errors = validatePagoForm(formData);
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [formData, fieldErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cantidad') {
      const parsedValue = parseCurrency(value);
      setFormData((prev) => ({ ...prev, [name]: parsedValue }));
      setCantidadDisplay(value); // Keep the display as typed

      // Validación en tiempo real
      if (touched[name]) {
        const error = validatePagoField(name, parsedValue);
        setFieldErrors(prev => ({ ...prev, [name]: error }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Validación en tiempo real
      if (touched[name]) {
        const error = validatePagoField(name, value);
        setFieldErrors(prev => ({ ...prev, [name]: error }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    let validationValue = value;
    if (name === 'cantidad') {
      validationValue = parseCurrency(value);
      setCantidadDisplay(formatCurrency(validationValue)); // Format on blur
    }

    const error = validatePagoField(name, validationValue);
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
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-700">{id ? 'Editar Pago' : 'Nuevo Pago'}</h1>
              <button
                type="button"
                onClick={() => navigate('/pagos')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Folio de Venta *</label>
                  <select name="folio" value={formData.folio} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.folio ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}>
                    <option value="">Seleccionar Folio</option>
                    {ventas.map(venta => (
                      <option key={venta.folio} value={venta.folio}>{venta.folio}</option>
                    ))}
                  </select>
                  {fieldErrors.folio && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.folio}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                  <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.fecha ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} />
                  {fieldErrors.fecha && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.fecha}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad *</label>
                  <input type="text" name="cantidad" value={cantidadDisplay} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.cantidad ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} placeholder="$0.00" />
                  {fieldErrors.cantidad && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.cantidad}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estatus *</label>
                  <select name="estatus" value={formData.estatus} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.estatus ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                  </select>
                  {fieldErrors.estatus && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.estatus}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button type="submit" disabled={!isFormValid || loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="h-4 w-4" />
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
