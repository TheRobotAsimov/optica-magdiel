import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import entregaService from '../../service/entregaService';
import rutaService from '../../service/rutaService';
import lenteService from '../../service/lenteService';
import pagoService from '../../service/pagoService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft } from 'lucide-react';
import { validateEntregaForm, validateEntregaField } from '../../utils/validations/index.js';

const EntregaForm = () => {
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
        const [rutasData, lentesData, pagosData] = await Promise.all([
          rutaService.getAllRutas(),
          lenteService.getAllLentes(),
          pagoService.getAllPagos(),
        ]);
        setRutas(rutasData);
        setLentes(lentesData);
        setPagos(pagosData);

        if (id) {
          const entregaData = await entregaService.getEntregaById(id);
          setFormData({
            ...entregaData,
            hora: entregaData.hora || new Date().toTimeString().slice(0, 5),
          });
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
    const errors = validateEntregaForm(formData);
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [formData, fieldErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación completa del formulario
    const errors = validateEntregaForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await entregaService.updateEntrega(id, formData);
      } else {
        await entregaService.createEntrega(formData);
      }
      navigate('/entregas');
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
              <h1 className="text-2xl font-bold text-blue-700">{id ? 'Editar Entrega' : 'Nueva Entrega'}</h1>
              <button
                type="button"
                onClick={() => navigate('/entregas')}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estatus *</label>
                  <select name="estatus" value={formData.estatus} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.estatus ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}>
                    <option value="No entregado">No entregado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                  {fieldErrors.estatus && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.estatus}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lente</label>
                  <select name="idlente" value={formData.idlente} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Seleccionar Lente (Opcional)</option>
                    {lentes.map(lente => (
                      <option key={lente.idlente} value={lente.idlente}>{`${lente.idlente} - ${lente.armazon}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pago</label>
                  <select name="idpago" value={formData.idpago} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Seleccionar Pago (Opcional)</option>
                    {pagos.map(pago => (
                      <option key={pago.idpago} value={pago.idpago}>{`Pago ${pago.idpago} - Folio ${pago.folio}`}</option>
                    ))}
                  </select>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora *</label>
                  <input type="time" name="hora" value={formData.hora} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.hora ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} />
                  {fieldErrors.hora && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.hora}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button type="submit" disabled={!isFormValid || loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar Entrega' : 'Crear Entrega')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntregaForm;
