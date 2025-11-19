import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import pacienteService from '../../service/pacienteService';
import clientService from '../../service/clientService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, User } from 'lucide-react';
import { validatePacienteForm, validatePacienteField } from '../../utils/validations/index.js';

const PacienteForm = () => {
  const [paciente, setPaciente] = useState({
    idcliente: '',
    nombre: '',
    paterno: '',
    materno: '',
    sexo: '',
    edad: '',
    parentesco: '',
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clientsData = await clientService.getAllClients();
        setClients(clientsData);

        if (id) {
          const pacienteData = await pacienteService.getPacienteById(id);
          setPaciente(pacienteData);
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
    const errors = validatePacienteForm(paciente);
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [paciente, fieldErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaciente((prev) => ({ ...prev, [name]: value }));

    // Validación en tiempo real
    if (touched[name]) {
      const error = validatePacienteField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validatePacienteField(name, value);
    setFieldErrors(prev => ({ ...prev, [error]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación completa del formulario
    const errors = validatePacienteForm(paciente);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = { ...paciente };
      if (!dataToSubmit.materno) dataToSubmit.materno = null;

      if (id) {
        await pacienteService.updatePaciente(id, dataToSubmit);
      } else {
        await pacienteService.createPaciente(dataToSubmit);
      }
      navigate('/pacientes');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !id) {
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
                    {id ? 'Editar Paciente' : 'Nuevo Paciente'}
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    {id ? 'Actualiza la información del paciente' : 'Completa los datos del nuevo paciente'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/pacientes')}
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
              {/* Patient Information Section */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información del Paciente</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Cliente
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="idcliente" value={paciente.idcliente} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.idcliente
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}>
                        <option value="">Seleccionar Cliente</option>
                        {clients.map(cliente => (
                          <option key={cliente.idcliente} value={cliente.idcliente}>{cliente.nombre} {cliente.paterno}</option>
                        ))}
                      </select>
                      {fieldErrors.idcliente && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.idcliente}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Nombre
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="text" name="nombre" value={paciente.nombre} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.nombre
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} />
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
                      <input type="text" name="paterno" value={paciente.paterno} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.paterno
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} />
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
                      <input type="text" name="materno" value={paciente.materno} onChange={handleChange} onBlur={handleBlur} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200" />
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Sexo
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="sexo" value={paciente.sexo} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.sexo
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}>
                        <option value="">Seleccionar Sexo</option>
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
                        Edad
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="number" name="edad" value={paciente.edad} onChange={handleChange} onBlur={handleBlur} required min="1" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
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
                    <div className="group md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Parentesco
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="parentesco" value={paciente.parentesco} onChange={handleChange} onBlur={handleBlur} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200">
                        <option value="">Seleccionar Parentesco</option>
                        <option value="Hijo">Hijo</option>
                        <option value="Nieto">Nieto</option>
                        <option value="Hermano">Hermano</option>
                        <option value="Primo">Primo</option>
                        <option value="Sobrino">Sobrino</option>
                      </select>
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
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar Paciente' : 'Crear Paciente')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PacienteForm;