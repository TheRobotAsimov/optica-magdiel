import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import authService from '../../service/authService'

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nueva_contrasena: '',
    confirmar_contrasena: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.nueva_contrasena !== formData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.nueva_contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(token, formData.nueva_contrasena);
      alert('Contraseña restablecida exitosamente');
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al restablecer la contraseña');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Nueva Contraseña
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="nueva_contrasena" className="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <input
                id="nueva_contrasena"
                name="nueva_contrasena"
                type="password"
                required
                minLength="6"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.nueva_contrasena}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmar_contrasena" className="block text-sm font-medium text-gray-700">
                Confirmar Nueva Contraseña
              </label>
              <input
                id="confirmar_contrasena"
                name="confirmar_contrasena"
                type="password"
                required
                minLength="6"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.confirmar_contrasena}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};