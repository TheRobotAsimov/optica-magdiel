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
        <div className="bg-white overflow-hidden shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-700">
                  {id ? 'EDITAR USUARIO' : 'NUEVO USUARIO'}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <div class="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Information Section */}
              <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Información de Cuenta</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="correo"
                      value={user.correo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        fieldErrors.correo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="usuario@ejemplo.com"
                    />
                    {fieldErrors.correo && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.correo}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña {!id && '*'}
                    </label>
                    <input
                      type="password"
                      name="contrasena"
                      value={user.contrasena}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required={!id}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        fieldErrors.contrasena ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder={id ? "Dejar vacío para mantener actual" : "Ingrese contraseña"}
                    />
                    {fieldErrors.contrasena && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.contrasena}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol *
                    </label>
                    <select
                      name="rol"
                      value={user.rol}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        fieldErrors.rol ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    >
                      <option value="Optometrista">Optometrista</option>
                      <option value="Asesor">Asesor</option>
                      <option value="Matriz">Matriz</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                    {fieldErrors.rol && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.rol}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div class="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/users')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar' : 'Crear Usuario')}</span>
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
