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
        <div className="bg-white overflow-hidden shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-700">
                  {id ? 'EDITAR CLIENTE' : 'NUEVO CLIENTE'}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <input type="text" name="nombre" value={client.nombre} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.nombre ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`} placeholder="Ingrese el nombre" />
                    {fieldErrors.nombre && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.nombre}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Paterno *</label>
                    <input type="text" name="paterno" value={client.paterno} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.paterno ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`} placeholder="Apellido paterno" />
                    {fieldErrors.paterno && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.paterno}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
                    <input type="text" name="materno" value={client.materno} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.materno ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`} placeholder="Apellido materno" />
                    {fieldErrors.materno && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.materno}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Edad *</label>
                    <input type="number" name="edad" value={client.edad} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.edad ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`} />
                    {fieldErrors.edad && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.edad}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sexo *</label>
                    <select name="sexo" value={client.sexo} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.sexo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}>
                      <option value="">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                    {fieldErrors.sexo && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.sexo}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono 1 *</label>
                    <input type="tel" name="telefono1" value={client.telefono1} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.telefono1 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`} placeholder="Número de teléfono" />
                    {fieldErrors.telefono1 && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.telefono1}</p>
                    )}
                  </div>
                  <div class="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domicilio 1 *</label>
                    <textarea name="domicilio1" value={client.domicilio1} onChange={handleChange} onBlur={handleBlur} required rows="3" className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.domicilio1 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`} placeholder="Dirección completa"></textarea>
                    {fieldErrors.domicilio1 && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.domicilio1}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domicilio 2</label>
                    <input type="text" name="domicilio2" value={client.domicilio2} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Segunda dirección" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono 2</label>
                    <input type="tel" name="telefono2" value={client.telefono2} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Segundo teléfono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL del Mapa</label>
                    <input type="text" name="map_url" value={client.map_url} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="URL de Google Maps" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                <button type="button" onClick={() => navigate('/clients')} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={!isFormValid || loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar' : 'Crear Cliente')}</span>
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
