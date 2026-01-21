import { useParams } from 'react-router';
import userService from '../../service/userService';
import Loading from '../common/Loading';
import Error from '../common/Error';
import NavComponent from '../common/NavBar';
import { User } from 'lucide-react';
import { validateUserForm, validateUserField } from '../../utils/validations/index.js';
import { useFormManager } from '../../hooks/useFormManager';
import FormHeader from '../common/form/FormHeader';
import FormSection from '../common/form/FormSection';
import FormField from '../common/form/FormField';
import FormActions from '../common/form/FormActions';

const UserForm = () => {
  const { id } = useParams();

  const {
    values: user,
    loading,
    error,
    fieldErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    isFormValid,
    isEdit
  } = useFormManager({
    initialValues: {
      correo: '',
      contrasena: '',
      rol: 'Optometrista'
    },
    validateField: validateUserField,
    validateForm: validateUserForm,
    service: userService,
    createMethod: 'createUser',
    updateMethod: 'updateUser',
    getByIdMethod: 'getUserById',
    id,
    redirectPath: '/users'
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FormHeader
          title={isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
          subtitle={isEdit ? 'Actualiza la información del usuario' : 'Completa los datos del nuevo usuario'}
          icon={User}
          backPath="/users"
        />

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection title="Información de Cuenta" icon={User} colorClass="blue">
                <FormField
                  label="Correo Electrónico"
                  name="correo"
                  error={fieldErrors.correo}
                  required
                >
                  <input
                    type="email"
                    name="correo"
                    value={user.correo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.correo
                        ? 'border-red-500 focus:ring-red-100 bg-red-50'
                        : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                    placeholder="usuario@ejemplo.com"
                  />
                </FormField>

                <FormField
                  label="Contraseña"
                  name="contrasena"
                  error={fieldErrors.contrasena}
                  required={!isEdit}
                >
                  <input
                    type="password"
                    name="contrasena"
                    value={user.contrasena}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={!isEdit}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.contrasena
                        ? 'border-red-500 focus:ring-red-100 bg-red-50'
                        : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                    placeholder={isEdit ? "Dejar vacío para mantener actual" : "Ingrese contraseña"}
                  />
                </FormField>

                <FormField
                  label="Rol"
                  name="rol"
                  error={fieldErrors.rol}
                  required
                >
                  <select
                    name="rol"
                    value={user.rol}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.rol
                        ? 'border-red-500 focus:ring-red-100 bg-red-50'
                        : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="Optometrista">Optometrista</option>
                    <option value="Asesor">Asesor</option>
                    <option value="Matriz">Matriz</option>
                  </select>
                </FormField>
              </FormSection>

              <FormActions
                onCancel="/users"
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

export default UserForm;
