import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import empleadoService from '../../service/empleadoService';
import userService from '../../service/userService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, User } from 'lucide-react';
import { validateEmpleadoForm, validateEmpleadoField } from '../../utils/validations/index.js';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('es', es);

const EmpleadoForm = () => {
  const [empleado, setEmpleado] = useState({
    idusuario: null,
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const users = await userService.getUsersWithoutEmployee();
        setAvailableUsers(users);
      } catch (err) {
        console.error('Error fetching available users:', err);
      }
    };
    fetchAvailableUsers();
  }, []);

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

          // If editing and has idusuario, fetch the current user and add to available if not already
          if (data.idusuario) {
            try {
              const currentUser = await userService.getUserById(data.idusuario);
              setAvailableUsers(prev => {
                const exists = prev.find(u => u.id === currentUser.id);
                if (!exists) {
                  return [...prev, currentUser];
                }
                return prev;
              });
            } catch (err) {
              console.error('Error fetching current user:', err);
            }
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchEmpleado();
    }
  }, [id]);

  useEffect(() => {
    const errors = validateEmpleadoForm(empleado);
    // Additional validation for user-role match
    if (empleado.idusuario) {
      const selectedUser = availableUsers.find(u => u.id === empleado.idusuario);
      if (selectedUser && selectedUser.rol !== empleado.puesto) {
        errors.idusuario = `El rol del usuario (${selectedUser.rol}) no coincide con el puesto del empleado (${empleado.puesto})`;
      }
    }
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [empleado, fieldErrors, availableUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'idusuario') {
      processedValue = value === '' ? null : parseInt(value, 10);
    }
    setEmpleado((prevEmpleado) => ({ ...prevEmpleado, [name]: processedValue }));

    // Validación en tiempo real
    if (touched[name]) {
      let error = validateEmpleadoField(name, processedValue);
      if (name === 'idusuario' && processedValue) {
        const selectedUser = availableUsers.find(u => u.id === processedValue);
        if (selectedUser && selectedUser.rol !== empleado.puesto) {
          error = `El rol del usuario (${selectedUser.rol}) no coincide con el puesto del empleado (${empleado.puesto})`;
        }
      }
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    let error = validateEmpleadoField(name, value);
    if (name === 'idusuario' && empleado.idusuario) {
      const selectedUser = availableUsers.find(u => u.id === empleado.idusuario);
      if (selectedUser && selectedUser.rol !== empleado.puesto) {
        error = `El rol del usuario (${selectedUser.rol}) no coincide con el puesto del empleado (${empleado.puesto})`;
      }
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación completa del formulario
    const errors = validateEmpleadoForm(empleado);
    // Additional validation for user-role match
    if (empleado.idusuario) {
      const selectedUser = availableUsers.find(u => u.id === empleado.idusuario);
      if (selectedUser && selectedUser.rol !== empleado.puesto) {
        errors.idusuario = `El rol del usuario (${selectedUser.rol}) no coincide con el puesto del empleado (${empleado.puesto})`;
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      const modifiedEmpleado = { ...empleado };
      if (modifiedEmpleado.sueldo === '') {
        modifiedEmpleado.sueldo = null;
      }
      if (id) {
        await empleadoService.updateEmpleado(id, modifiedEmpleado);
      } else {
        await empleadoService.createEmpleado(modifiedEmpleado);
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
                    <input type="text" name="nombre" value={empleado.nombre} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.nombre ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`} placeholder="Ingrese el nombre" />
                    {fieldErrors.nombre && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.nombre}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Paterno *</label>
                    <input type="text" name="paterno" value={empleado.paterno} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.paterno ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`} placeholder="Apellido paterno" />
                    {fieldErrors.paterno && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.paterno}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
                    <input type="text" name="materno" value={empleado.materno} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.materno ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`} placeholder="Apellido materno" />
                    {fieldErrors.materno && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.materno}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento *</label>
                    <DatePicker
                      selected={empleado.fecnac ? new Date(empleado.fecnac) : null}
                      onChange={(date) => {
                        const value = date ? date.toISOString().split('T')[0] : '';
                        setEmpleado({ ...empleado, fecnac: value });
                        if (touched.fecnac) {
                          const error = validateEmpleadoField('fecnac', value);
                          setFieldErrors(prev => ({ ...prev, fecnac: error }));
                        }
                      }}
                      onBlur={() => {
                        setTouched(prev => ({ ...prev, fecnac: true }));
                        const error = validateEmpleadoField('fecnac', empleado.fecnac);
                        setFieldErrors(prev => ({ ...prev, fecnac: error }));
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Selecciona fecha de nacimiento"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        fieldErrors.fecnac ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      maxDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                      minDate={new Date(1940, 0, 1)}
                      locale="es"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                    />
                    {fieldErrors.fecnac && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.fecnac}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sexo *</label>
                    <select name="sexo" value={empleado.sexo} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                    <input type="tel" name="telefono" value={empleado.telefono} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.telefono ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`} placeholder="Número de teléfono" />
                    {fieldErrors.telefono && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.telefono}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información Laboral</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Contratación *</label>
                        <DatePicker
                          selected={empleado.feccon ? new Date(empleado.feccon) : null}
                          onChange={(date) => {
                            const value = date ? date.toISOString().split('T')[0] : '';
                            setEmpleado({ ...empleado, feccon: value });
                            if (touched.feccon) {
                              const error = validateEmpleadoField('feccon', value);
                              setFieldErrors(prev => ({ ...prev, feccon: error }));
                            }
                          }}
                          onBlur={() => {
                            setTouched(prev => ({ ...prev, feccon: true }));
                            const error = validateEmpleadoField('feccon', empleado.feccon);
                            setFieldErrors(prev => ({ ...prev, feccon: error }));
                          }}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Selecciona fecha de contratación"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                            fieldErrors.feccon ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          locale="es"
                          maxDate={new Date(new Date().getFullYear(), 12, 31)}
                          showYearDropdown
                          showMonthDropdown
                          dropdownMode="select"
                        />
                        {fieldErrors.feccon && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.feccon}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sueldo</label>
                        <input type="number" name="sueldo" value={empleado.sueldo} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          fieldErrors.sueldo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`} />
                        {fieldErrors.sueldo && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.sueldo}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Puesto *</label>
                        <select name="puesto" value={empleado.puesto} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          fieldErrors.puesto ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}>
                            <option value="Optometrista">Optometrista</option>
                            <option value="Asesor">Asesor</option>
                            <option value="Matriz">Matriz</option>
                        </select>
                        {fieldErrors.puesto && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.puesto}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                        <select name="estado" value={empleado.estado} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          fieldErrors.estado ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}>
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                        {fieldErrors.estado && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.estado}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Asociar Usuario</label>
                        <select name="idusuario" value={empleado.idusuario || ''} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          fieldErrors.idusuario ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}>
                          <option value="">Seleccionar usuario</option>
                          {availableUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.correo}</option>
                          ))}
                        </select>
                        {fieldErrors.idusuario && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.idusuario}</p>
                        )}
                    </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                <button type="button" onClick={() => navigate('/empleados')} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={!isFormValid || loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
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
