import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import empleadoService from '../../service/empleadoService';
import userService from '../../service/userService';
import NavComponent from '../common/NavBar';
import { User, ArrowLeft, Save, Calendar, Phone, Briefcase, DollarSign, UserCircle } from 'lucide-react';
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
      if ((name === 'idusuario' || name === 'puesto') && processedValue) {
        const selectedUser = availableUsers.find(u => u.id === processedValue);
        if (selectedUser && selectedUser.rol !== empleado.puesto) {
          error = `El rol del usuario (${selectedUser.rol}) no coincide con el puesto del empleado (${empleado.puesto})`;
        }
      }

      let newName = name;

      if(name === 'puesto') {
        newName = 'idusuario'
      }
      setFieldErrors(prev => ({ ...prev, [newName]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    let error = validateEmpleadoField(name, value);
    if ((name === 'idusuario' || name === 'puesto') && empleado.idusuario) {
      const selectedUser = availableUsers.find(u => u.id === empleado.idusuario);
      if (selectedUser && selectedUser.rol !== empleado.puesto) {
        error = `El rol del usuario (${selectedUser.rol}) no coincide con el puesto del empleado (${empleado.puesto})`;
      }
    }
    let newName = name;

    if(name === 'puesto') {
      newName = 'idusuario'
    }
    setFieldErrors(prev => ({ ...prev, [newName]: error }));
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
                    {id ? 'Editar Empleado' : 'Nuevo Empleado'}
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    {id ? 'Actualiza la información del empleado' : 'Completa los datos del nuevo empleado'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/empleados')}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-2xl">
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <UserCircle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información Personal</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Nombre 
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="nombre" 
                        value={empleado.nombre} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        required 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.nombre 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} 
                        placeholder="Ingrese el nombre" 
                      />
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
                      <input 
                        type="text" 
                        name="paterno" 
                        value={empleado.paterno} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        required 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.paterno 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} 
                        placeholder="Apellido paterno" 
                      />
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
                      <input 
                        type="text" 
                        name="materno" 
                        value={empleado.materno} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.materno 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} 
                        placeholder="Apellido materno" 
                      />
                      {fieldErrors.materno && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.materno}
                        </p>
                      )}
                    </div>
                    
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                        Fecha de Nacimiento
                        <span className="text-red-500 ml-1">*</span>
                      </label>
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
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.fecnac 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} 
                        maxDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                        minDate={new Date(1940, 0, 1)}
                        locale="es"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                      />
                      {fieldErrors.fecnac && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.fecnac}
                        </p>
                      )}
                    </div>
                    
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Sexo
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select 
                        name="sexo" 
                        value={empleado.sexo} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.sexo 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}
                      >
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
                        <Phone className="h-4 w-4 mr-1.5 text-gray-500" />
                        Teléfono
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input 
                        type="tel" 
                        name="telefono" 
                        value={empleado.telefono} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        required 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.telefono 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} 
                        placeholder="Número de teléfono" 
                      />
                      {fieldErrors.telefono && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.telefono}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Information Section */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información Laboral</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                        Fecha de Contratación
                        <span className="text-red-500 ml-1">*</span>
                      </label>
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
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                            fieldErrors.feccon 
                              ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                              : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                          }`} 
                          locale="es"
                          maxDate={new Date(new Date().getFullYear(), 12, 31)}
                          showYearDropdown
                          showMonthDropdown
                          dropdownMode="select"
                        />
                      {fieldErrors.feccon && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.feccon}
                        </p>
                      )}
                    </div>
                    
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1.5 text-gray-500" />
                        Sueldo
                      </label>
                      <input 
                        type="number" 
                        name="sueldo" 
                        value={empleado.sueldo} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.sueldo 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                      {fieldErrors.sueldo && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.sueldo}
                        </p>
                      )}
                    </div>
                    
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Puesto
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select 
                        name="puesto" 
                        value={empleado.puesto} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.puesto 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                        }`}
                      >
                        <option value="Optometrista">Optometrista</option>
                        <option value="Asesor">Asesor</option>
                        <option value="Matriz">Matriz</option>
                      </select>
                      {fieldErrors.puesto && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.puesto}
                        </p>
                      )}
                    </div>
                    
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Estado
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select 
                        name="estado" 
                        value={empleado.estado} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.estado 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                        }`}
                      >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                      {fieldErrors.estado && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.estado}
                        </p>
                      )}
                    </div>
                    
                    <div className="group md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <User className="h-4 w-4 mr-1.5 text-gray-500" />
                        Asociar Usuario
                      </label>
                      <select 
                        name="idusuario" 
                        value={empleado.idusuario || ''} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.idusuario 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                        }`}
                      >
                        <option value="">Seleccionar usuario</option>
                        {availableUsers.map(user => (
                          <option key={user.id} value={user.id}>{user.correo}</option>
                        ))}
                      </select>
                      {fieldErrors.idusuario && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.idusuario}
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
                  onClick={() => navigate('/empleados')} 
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
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar Empleado' : 'Crear Empleado')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EmpleadoForm;
