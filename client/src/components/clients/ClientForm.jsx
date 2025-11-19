import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import clientService from '../../service/clientService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, User } from 'lucide-react';
import { validateClientForm, validateClientField } from '../../utils/validations/index.js';

const ClientForm = () => {
  const [client, setClient] = useState({
    nombre: '',
    paterno: '',
    materno: '',
    edad: '',
    sexo: '',
    domicilio1: '',
    telefono1: '',
    domicilio2: '',
    telefono2: '',
    map_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchClient = async () => {
        setLoading(true);
        try {
          const data = await clientService.getClientById(id);
          setClient(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchClient();
    }
  }, [id]);

  useEffect(() => {
    const errors = validateClientForm(client);
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [client, fieldErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient((prevClient) => ({ ...prevClient, [name]: value }));

    // Validación en tiempo real
    if (touched[name]) {
      const error = validateClientField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateClientField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación completa del formulario
    const errors = validateClientForm(client);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await clientService.updateClient(id, client);
      } else {
        await clientService.createClient(client);
      }
      navigate('/clients');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
                    {id ? 'Editar Cliente' : 'Nuevo Cliente'}
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    {id ? 'Actualiza la información del cliente' : 'Completa los datos del nuevo cliente'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/clients')}
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

              {/* Personal Information Section */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información Personal</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Nombre
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="text" name="nombre" value={client.nombre} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.nombre
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} placeholder="Ingrese el nombre" />
                      {fieldErrors.nombre && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.nombre}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Apellido Paterno
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="text" name="paterno" value={client.paterno} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.paterno
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} placeholder="Apellido paterno" />
                      {fieldErrors.paterno && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.paterno}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Apellido Materno
                      </label>
                      <input type="text" name="materno" value={client.materno} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.materno
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} placeholder="Apellido materno" />
                      {fieldErrors.materno && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.materno}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Edad
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="number" name="edad" value={client.edad} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.edad
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} />
                      {fieldErrors.edad && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.edad}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Sexo
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="sexo" value={client.sexo} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.sexo
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}>
                        <option value="">Seleccionar</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                      {fieldErrors.sexo && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.sexo}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Teléfono 1
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="tel" name="telefono1" value={client.telefono1} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.telefono1
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} placeholder="Número de teléfono" />
                      {fieldErrors.telefono1 && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.telefono1}
                        </p>
                      )}
                    </div>
                    <div className="group md:col-span-3">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Domicilio 1
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <textarea name="domicilio1" value={client.domicilio1} onChange={handleChange} onBlur={handleBlur} required rows="3" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.domicilio1
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} placeholder="Dirección completa"></textarea>
                      {fieldErrors.domicilio1 && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.domicilio1}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Domicilio 2
                      </label>
                      <input type="text" name="domicilio2" value={client.domicilio2} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200" placeholder="Segunda dirección" />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono 2
                      </label>
                      <input type="tel" name="telefono2" value={client.telefono2} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200" placeholder="Segundo teléfono" />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        URL del Mapa
                      </label>
                      <input type="text" name="map_url" value={client.map_url} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200" placeholder="URL de Google Maps" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/clients')}
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
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar Cliente' : 'Crear Cliente')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;
