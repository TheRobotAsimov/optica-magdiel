import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import empleadoService from '../../service/empleadoService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, User } from 'lucide-react';

const EmpleadoForm = () => {
  const [empleado, setEmpleado] = useState({
    idusuario: '',
    nombre: '',
    paterno: '',
    materno: '',
    fecnac: '',
    feccon: '',
    sueldo: '',
    telefono: '',
    sexo: '',
    puesto: 'Optometrista',
    estado: 'Activo'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchEmpleado = async () => {
        setLoading(true);
        try {
          const data = await empleadoService.getEmpleadoById(id);
          if (data.fecnac) {
            data.fecnac = new Date(data.fecnac).toISOString().split('T')[0];
          }
          if (data.feccon) {
            data.feccon = new Date(data.feccon).toISOString().split('T')[0];
          }
          setEmpleado(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchEmpleado();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpleado((prevEmpleado) => ({ ...prevEmpleado, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await empleadoService.updateEmpleado(id, empleado);
      } else {
        await empleadoService.createEmpleado(empleado);
      }
      navigate('/empleados');
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
                  {id ? 'EDITAR EMPLEADO' : 'NUEVO EMPLEADO'}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => navigate('/empleados')}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <input type="text" name="nombre" value={empleado.nombre} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ingrese el nombre" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Paterno *</label>
                    <input type="text" name="paterno" value={empleado.paterno} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Apellido paterno" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
                    <input type="text" name="materno" value={empleado.materno} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Apellido materno" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                    <input type="date" name="fecnac" value={empleado.fecnac} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                    <select name="sexo" value={empleado.sexo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                    <input type="tel" name="telefono" value={empleado.telefono} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Número de teléfono" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información Laboral</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Contratación</label>
                        <input type="date" name="feccon" value={empleado.feccon} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sueldo</label>
                        <input type="number" name="sueldo" value={empleado.sueldo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Puesto</label>
                        <select name="puesto" value={empleado.puesto} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Optometrista">Optometrista</option>
                            <option value="Gestor">Gestor</option>
                            <option value="Matriz">Matriz</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                        <select name="estado" value={empleado.estado} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ID Usuario</label>
                        <input type="number" name="idusuario" value={empleado.idusuario} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                <button type="button" onClick={() => navigate('/empleados')} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar' : 'Crear Empleado')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpleadoForm;
