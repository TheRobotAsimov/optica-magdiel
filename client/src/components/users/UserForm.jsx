import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import userService from '../../service/userService';
import Loading from '../common/Loading';
import Error from '../common/Error';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, User } from 'lucide-react';
import { validateUserForm, validateUserField } from '../../utils/validations/index.js';

const UserForm = () => {
  const [user, setUser] = useState({
    correo: '',
    contrasena: '',
    rol: 'Optometrista'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const errors = validateUserForm(user);
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [user, fieldErrors]);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const data = await userService.getUserById(id);
          setUser(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));

    // Validación en tiempo real
    if (touched[name]) {
      const error = validateUserField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateUserField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación completa del formulario
    const errors = validateUserForm(user);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await userService.updateUser(id, user);
      } else {
        await userService.createUser(user);
      }
      navigate('/users');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  if (error) {
    return (
      <Error message={error} />
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
                    {id ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    {id ? 'Actualiza la información del usuario' : 'Completa los datos del nuevo usuario'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/users')}
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

              {/* Account Information Section */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información de Cuenta</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Correo Electrónico
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="email"
                        name="correo"
                        value={user.correo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.correo
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}
                        placeholder="usuario@ejemplo.com"
                      />
                      {fieldErrors.correo && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.correo}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Contraseña {!id && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type="password"
                        name="contrasena"
                        value={user.contrasena}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required={!id}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.contrasena
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}
                        placeholder={id ? "Dejar vacío para mantener actual" : "Ingrese contraseña"}
                      />
                      {fieldErrors.contrasena && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.contrasena}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Rol
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        name="rol"
                        value={user.rol}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.rol
                            ? 'border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}
                      >
                        <option value="Optometrista">Optometrista</option>
                        <option value="Asesor">Asesor</option>
                        <option value="Matriz">Matriz</option>
                      </select>
                      {fieldErrors.rol && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.rol}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/users')}
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
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar Usuario' : 'Crear Usuario')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
