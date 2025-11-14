import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import gastoRutaService from '../../service/gastoRutaService';
import rutaService from '../../service/rutaService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft } from 'lucide-react';
import { validateGastoRutaForm, validateGastoRutaField } from '../../utils/validations/index.js';

const GastoRutaForm = () => {
  const [formData, setFormData] = useState({
    idruta: '',
    cantidad: '',
    motivo: '',
  });
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rutasData = await rutaService.getAllRutas();
        setRutas(rutasData);

        if (id) {
          const gastoRutaData = await gastoRutaService.getGastoRutaById(id);
          setFormData(gastoRutaData);
        } else {
          // Pre-select route if coming from ruta-asesor
          const urlParams = new URLSearchParams(window.location.search);
          const rutaId = urlParams.get('idruta');
          if (rutaId) {
            setFormData(prev => ({ ...prev, idruta: rutaId }));
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
    const errors = validateGastoRutaForm(formData);
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [formData, fieldErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validación en tiempo real
    if (touched[name]) {
      const error = validateGastoRutaField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateGastoRutaField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación completa del formulario
    const errors = validateGastoRutaForm(formData);
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
        await gastoRutaService.updateGastoRuta(id, dataToSubmit);
      } else {
        await gastoRutaService.createGastoRuta(dataToSubmit);
      }

      // Navigate back to ruta asesor if coming from there, otherwise to gasto-rutas
      const urlParams = new URLSearchParams(window.location.search);
      const rutaId = urlParams.get('idruta');
      if (rutaId) {
        navigate('/ruta-asesor');
      } else {
        navigate('/gasto-rutas');
      }
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
              <h1 className="text-2xl font-bold text-blue-700">{id ? 'Editar Gasto de Ruta' : 'Nuevo Gasto de Ruta'}</h1>
              <button
                type="button"
                onClick={() => navigate('/gasto-rutas')}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ruta *</label>
                  <select name="idruta" value={formData.idruta} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.idruta ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}>
                    <option value="">Seleccionar Ruta</option>
                    {rutas.map(ruta => (
                      <option key={ruta.idruta} value={ruta.idruta}>{`Ruta ${ruta.idruta} - ${new Date(ruta.fecha).toLocaleDateString()}`}</option>
                    ))}
                  </select>
                  {fieldErrors.idruta && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.idruta}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad *</label>
                  <input type="number" step="0.01" name="cantidad" value={formData.cantidad} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.cantidad ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} />
                  {fieldErrors.cantidad && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.cantidad}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motivo *</label>
                  <textarea name="motivo" value={formData.motivo} onChange={handleChange} onBlur={handleBlur} required rows="3" className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.motivo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}></textarea>
                  {fieldErrors.motivo && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.motivo}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button type="submit" disabled={!isFormValid || loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar Gasto' : 'Crear Gasto')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GastoRutaForm;
