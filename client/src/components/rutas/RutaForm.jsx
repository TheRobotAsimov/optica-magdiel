import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import rutaService from '../../service/rutaService';
import empleadoService from '../../service/empleadoService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft } from 'lucide-react';
import { validateRouteForm, validateRouteField } from '../../utils/validations/index.js';

const RutaForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    idasesor: '',
    lentes_entregados: '',
    tarjetas_entregadas: '',
    lentes_no_entregados: '',
    tarjetas_no_entregadas: '',
    fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    lentes_recibidos: '',
    tarjetas_recibidas: '',
    hora_inicio: '',
    hora_fin: '',
    estatus: 'Activa',
  });
  const [asesores, setAsesores] = useState([]);
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
        const empleadosData = await empleadoService.getAllEmpleados();
        const asesoresList = user.rol === 'Matriz' ? empleadosData.filter(emp => emp.puesto === 'Asesor') : empleadosData;
        setAsesores(asesoresList);

        if (id) {
          const rutaData = await rutaService.getRutaById(id);
          setFormData({
            ...rutaData,
            fecha: new Date(rutaData.fecha).toISOString().slice(0, 10),
          });
        } else if (user.rol === 'Asesor') {
          setFormData(prev => ({
            ...prev,
            idasesor: user.idempleado,
          }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  useEffect(() => {
    const errors = validateRouteForm(formData);
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [formData, fieldErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validación en tiempo real
    if (touched[name]) {
      const error = validateRouteField(name, value, formData);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateRouteField(name, value, formData);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación completa del formulario
    const errors = validateRouteForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        hora_fin: formData.hora_fin || null,
        lentes_entregados: parseInt(formData.lentes_entregados) || 0,
        tarjetas_entregadas: parseInt(formData.tarjetas_entregadas) || 0,
        lentes_no_entregados: parseInt(formData.lentes_no_entregados) || 0,
        tarjetas_no_entregadas: parseInt(formData.tarjetas_no_entregadas) || 0,
        lentes_recibidos: parseInt(formData.lentes_recibidos) || 0,
        tarjetas_recibidas: parseInt(formData.tarjetas_recibidas) || 0,
      };

      if (id) {
        await rutaService.updateRuta(id, dataToSubmit);
      } else {
        await rutaService.createRuta(dataToSubmit);
      }
      navigate('/rutas');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.idasesor) {
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
              <h1 className="text-2xl font-bold text-blue-700">{id ? 'Editar Ruta' : 'Nueva Ruta'}</h1>
              <button
                type="button"
                onClick={() => navigate('/rutas')}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asesor *</label>
                  <select name="idasesor" value={formData.idasesor} onChange={handleChange} onBlur={handleBlur} required disabled={user?.rol === 'Asesor'} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.idasesor ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}>
                    <option value="">Seleccionar Asesor</option>
                    {asesores.map(asesor => (
                      <option key={asesor.idempleado} value={asesor.idempleado}>{asesor.nombre} {asesor.paterno}</option>
                    ))}
                  </select>
                  {fieldErrors.idasesor && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.idasesor}</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora Inicio *</label>
                  <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.hora_inicio ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} />
                  {fieldErrors.hora_inicio && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.hora_inicio}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora Fin</label>
                  <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.hora_fin ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} />
                  {fieldErrors.hora_fin && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.hora_fin}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estatus *</label>
                  <select name="estatus" value={formData.estatus} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.estatus ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}>
                    <option value="Activa">Activa</option>
                    <option value="Finalizada">Finalizada</option>
                  </select>
                  {fieldErrors.estatus && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.estatus}</p>
                  )}
                </div>
                <div></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lentes Recibidos *</label>
                  <input type="number" name="lentes_recibidos" value={formData.lentes_recibidos} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.lentes_recibidos ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} />
                  {fieldErrors.lentes_recibidos && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.lentes_recibidos}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarjetas Recibidas *</label>
                  <input type="number" name="tarjetas_recibidas" value={formData.tarjetas_recibidas} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.tarjetas_recibidas ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} />
                  {fieldErrors.tarjetas_recibidas && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.tarjetas_recibidas}</p>
                  )}
                </div>
                {/*
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lentes Entregados</label>
                  <input type="number" name="lentes_entregados" value={formData.lentes_entregados} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarjetas Entregadas</label>
                  <input type="number" name="tarjetas_entregadas" value={formData.tarjetas_entregadas} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lentes No Entregados</label>
                  <input type="number" name="lentes_no_entregados" value={formData.lentes_no_entregados} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarjetas No Entregadas</label>
                  <input type="number" name="tarjetas_no_entregadas" value={formData.tarjetas_no_entregadas} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                */}
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button type="submit" disabled={!isFormValid || loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar Ruta' : 'Crear Ruta')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RutaForm;
