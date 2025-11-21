import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import entregaService from '../../service/entregaService';
import rutaService from '../../service/rutaService';
import lenteService from '../../service/lenteService';
import pagoService from '../../service/pagoService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { Save, ArrowLeft, User } from 'lucide-react';
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
    
    // Actualizamos el estado. Si cambia el lente, reseteamos el pago.
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value,
      ...(name === 'idlente' ? { idpago: '' } : {}) // Reset pago si cambia el lente
    }));

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
      const generalError = errors.general || 'Por favor corrige los errores en el formulario';
      setError(generalError);
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

  // --- LÓGICA DE FILTRADO ---
  // Buscamos el objeto lente completo basado en el ID seleccionado
  const selectedLente = lentes.find(l => String(l.idlente) === String(formData.idlente));
  
  // Filtramos los pagos: Si hay lente seleccionado, solo mostramos los pagos con el mismo folio.
  // Si no hay lente, mostramos todos (o podrías mostrar lista vacía si prefieres).
  const filteredPagos = selectedLente 
    ? pagos.filter(pago => pago.folio === selectedLente.folio)
    : pagos;

  if (loading && !id) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
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
                    {id ? 'Editar Entrega' : 'Nueva Entrega'}
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    {id ? 'Actualiza la información de la entrega' : 'Completa los datos de la nueva entrega'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/entregas')}
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
              {/* Delivery Information Section */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información de Entrega</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Ruta
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="idruta" value={formData.idruta} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.idruta
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}>
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
                        <option value="No entregado">No entregado</option>
                        <option value="Entregado">Entregado</option>
                      </select>
                      {fieldErrors.estatus && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.estatus}
                        </p>
                      )}
                    </div>
                    <div className="group md:col-span-2 mb-4">
                      <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <span className="font-medium text-blue-800">Nota:</span> Debe seleccionar al menos un lente o un pago.
                      </p>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lente
                      </label>
                      <select name="idlente" value={formData.idlente} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200">
                        <option value="">Seleccionar Lente</option>
                        {lentes.map(lente => (
                          <option key={lente.idlente} value={lente.idlente}>{`${lente.idlente} - ${lente.armazon}`}</option>
                        ))}
                      </select>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pago
                      </label>
                      <select 
                        name="idpago" 
                        value={formData.idpago} 
                        onChange={handleChange} 
                        // Deshabilitar si hay lente seleccionado pero no hay pagos coincidentes
                        disabled={selectedLente && filteredPagos.length === 0}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <option value="">
                           {selectedLente && filteredPagos.length === 0 
                             ? "No hay pagos con este folio" 
                             : "Seleccionar Pago"}
                        </option>
                        {/* Usamos filteredPagos en lugar de pagos */}
                        {filteredPagos.map(pago => (
                          <option key={pago.idpago} value={pago.idpago}>{`Pago ${pago.idpago} - Folio ${pago.folio}`}</option>
                        ))}
                      </select>
                      {selectedLente && (
                        <p className="text-xs text-blue-600 mt-1">
                           {filteredPagos.length > 0 
                             ? `Filtrando por Folio: ${selectedLente.folio}`
                             : `No se encontraron pagos para el Folio: ${selectedLente.folio}`}
                        </p>
                      )}
                    </div>
                    <div className="group md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Motivo
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <textarea name="motivo" value={formData.motivo} onChange={handleChange} onBlur={handleBlur} required rows="3" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.motivo
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}></textarea>
                      {fieldErrors.motivo && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.motivo}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Hora
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="time" name="hora" value={formData.hora} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.hora
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} />
                      {fieldErrors.hora && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.hora}
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