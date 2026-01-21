import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import empleadoService from '../../service/empleadoService';
import userService from '../../service/userService';
import NavComponent from '../common/NavBar';
import { User, Calendar, Phone, Briefcase, DollarSign, UserCircle } from 'lucide-react';
import { validateEmpleadoForm, validateEmpleadoField } from '../../utils/validations/index.js';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import Loading from '../common/Loading.jsx';
import Error from '../common/Error.jsx';
import { useFormManager } from '../../hooks/useFormManager';
import FormHeader from '../common/form/FormHeader';
import FormSection from '../common/form/FormSection';
import FormField from '../common/form/FormField';
import FormActions from '../common/form/FormActions';

registerLocale('es', es);

const EmpleadoForm = () => {
  const { id } = useParams();
  const [availableUsers, setAvailableUsers] = useState([]);

  // Fetch available users separately as it's not the main form entity
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

  const {
    values: empleado,
    setValues: setEmpleado,
    loading,
    setLoading,
    error,
    fieldErrors,
    setFieldErrors,
    touched,
    setTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    isFormValid,
    isEdit
  } = useFormManager({
    initialValues: {
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
    },
    validateField: (name, value, values) => {
      let error = validateEmpleadoField(name, value);
      if ((name === 'idusuario' || name === 'puesto') && (name === 'idusuario' ? value : values.idusuario)) {
        const userId = name === 'idusuario' ? value : values.idusuario;
        const selectedUser = availableUsers.find(u => u.id === userId);
        const puesto = name === 'puesto' ? value : values.puesto;
        if (selectedUser && selectedUser.rol !== puesto) {
          return `El rol del usuario (${selectedUser.rol}) no coincide con el puesto del empleado (${puesto})`;
        }
      }
      return error;
    },
    validateForm: (values) => {
      const errors = validateEmpleadoForm(values);
      if (values.idusuario) {
        const selectedUser = availableUsers.find(u => u.id === values.idusuario);
        if (selectedUser && selectedUser.rol !== values.puesto) {
          errors.idusuario = `El rol del usuario (${selectedUser.rol}) no coincide con el puesto del empleado (${values.puesto})`;
        }
      }
      return errors;
    },
    service: empleadoService,
    createMethod: 'createEmpleado',
    updateMethod: 'updateEmpleado',
    getByIdMethod: 'getEmpleadoById',
    id,
    redirectPath: '/empleados',
    transformData: (data, mode) => {
      if (mode === 'fetch') {
        const transformed = { ...data };
        if (transformed.fecnac) transformed.fecnac = new Date(transformed.fecnac).toISOString().split('T')[0];
        if (transformed.feccon) transformed.feccon = new Date(transformed.feccon).toISOString().split('T')[0];

        // If editing and has idusuario, ensure it's in availableUsers
        if (transformed.idusuario) {
          userService.getUserById(transformed.idusuario).then(currentUser => {
            setAvailableUsers(prev => {
              const exists = prev.find(u => u.id === currentUser.id);
              return exists ? prev : [...prev, currentUser];
            });
          });
        }
        return transformed;
      }
      if (mode === 'submit') {
        const transformed = { ...data };
        if (transformed.sueldo === '') transformed.sueldo = null;
        return transformed;
      }
      return data;
    }
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FormHeader
          title={isEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
          subtitle={isEdit ? 'Actualiza la información del empleado' : 'Completa los datos del nuevo empleado'}
          icon={User}
          backPath="/empleados"
        />

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection title="Información Personal" icon={UserCircle} colorClass="blue">
                <FormField label="Nombre" name="nombre" error={fieldErrors.nombre} required>
                  <input
                    type="text"
                    name="nombre"
                    value={empleado.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.nombre ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                    placeholder="Nombre"
                  />
                </FormField>

                <FormField label="Apellido Paterno" name="paterno" error={fieldErrors.paterno} required>
                  <input
                    type="text"
                    name="paterno"
                    value={empleado.paterno}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.paterno ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                    placeholder="Apellido paterno"
                  />
                </FormField>

                <FormField label="Apellido Materno" name="materno" error={fieldErrors.materno}>
                  <input
                    type="text"
                    name="materno"
                    value={empleado.materno}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.materno ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                    placeholder="Apellido materno"
                  />
                </FormField>

                <FormField label="Fecha de Nacimiento" name="fecnac" error={fieldErrors.fecnac} required icon={Calendar}>
                  <DatePicker
                    selected={empleado.fecnac ? new Date(empleado.fecnac) : null}
                    onChange={(date) => {
                      const value = date ? date.toISOString().split('T')[0] : '';
                      setEmpleado(prev => ({ ...prev, fecnac: value }));
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
                    placeholderText="dd/mm/aaaa"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.fecnac ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                    maxDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                    locale="es"
                    showYearDropdown
                    dropdownMode="select"
                  />
                </FormField>

                <FormField label="Sexo" name="sexo" error={fieldErrors.sexo} required>
                  <select
                    name="sexo"
                    value={empleado.sexo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.sexo ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </FormField>

                <FormField label="Teléfono" name="telefono" error={fieldErrors.telefono} required icon={Phone}>
                  <input
                    type="tel"
                    name="telefono"
                    value={empleado.telefono}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.telefono ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                    placeholder="Número de teléfono"
                  />
                </FormField>
              </FormSection>

              <FormSection title="Información Laboral" icon={Briefcase} colorClass="indigo">
                <FormField label="Fecha de Contratación" name="feccon" error={fieldErrors.feccon} required icon={Calendar}>
                  <DatePicker
                    selected={empleado.feccon ? new Date(empleado.feccon) : null}
                    onChange={(date) => {
                      const value = date ? date.toISOString().split('T')[0] : '';
                      setEmpleado(prev => ({ ...prev, feccon: value }));
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
                    placeholderText="dd/mm/aaaa"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.feccon ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                      }`}
                    locale="es"
                    showYearDropdown
                    dropdownMode="select"
                  />
                </FormField>

                <FormField label="Sueldo" name="sueldo" error={fieldErrors.sueldo} icon={DollarSign}>
                  <input
                    type="number"
                    name="sueldo"
                    value={empleado.sueldo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.sueldo ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                      }`}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Puesto" name="puesto" error={fieldErrors.puesto} required>
                  <select
                    name="puesto"
                    value={empleado.puesto}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.puesto ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="Optometrista">Optometrista</option>
                    <option value="Asesor">Asesor</option>
                    <option value="Matriz">Matriz</option>
                  </select>
                </FormField>

                <FormField label="Estado" name="estado" error={fieldErrors.estado} required>
                  <select
                    name="estado"
                    value={empleado.estado}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.estado ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </FormField>

                <FormField label="Asociar Usuario" name="idusuario" error={fieldErrors.idusuario} icon={User}>
                  <select
                    name="idusuario"
                    value={empleado.idusuario || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                      setEmpleado(prev => ({ ...prev, idusuario: val }));
                    }}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.idusuario ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="">Seleccionar usuario</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>{user.correo}</option>
                    ))}
                  </select>
                </FormField>
              </FormSection>

              <FormActions
                onCancel="/empleados"
                loading={loading}
                isFormValid={isFormValid}
                isEdit={isEdit}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpleadoForm;
