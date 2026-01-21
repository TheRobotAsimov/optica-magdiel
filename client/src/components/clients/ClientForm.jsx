import { useParams } from 'react-router';
import clientService from '../../service/clientService';
import NavComponent from '../common/NavBar';
import { User } from 'lucide-react';
import { validateClientForm, validateClientField } from '../../utils/validations/index.js';
import Loading from '../common/Loading.jsx';
import Error from '../common/Error.jsx';
import { useFormManager } from '../../hooks/useFormManager';
import FormHeader from '../common/form/FormHeader';
import FormSection from '../common/form/FormSection';
import FormField from '../common/form/FormField';
import FormActions from '../common/form/FormActions';

const ClientForm = () => {
  const { id } = useParams();

  const {
    values: client,
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
    },
    validateField: validateClientField,
    validateForm: validateClientForm,
    service: clientService,
    createMethod: 'createClient',
    updateMethod: 'updateClient',
    getByIdMethod: 'getClientById',
    id,
    redirectPath: '/clients'
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FormHeader
          title={isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
          subtitle={isEdit ? 'Actualiza la información del cliente' : 'Completa los datos del nuevo cliente'}
          icon={User}
          backPath="/clients"
        />

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection title="Información Personal" icon={User} colorClass="blue">
                <FormField label="Nombre" name="nombre" error={fieldErrors.nombre} required>
                  <input
                    type="text"
                    name="nombre"
                    value={client.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.nombre ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                    placeholder="Ingrese el nombre"
                  />
                </FormField>

                <FormField label="Apellido Paterno" name="paterno" error={fieldErrors.paterno} required>
                  <input
                    type="text"
                    name="paterno"
                    value={client.paterno}
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
                    value={client.materno}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.materno ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                    placeholder="Apellido materno"
                  />
                </FormField>

                <FormField label="Edad" name="edad" error={fieldErrors.edad} required>
                  <input
                    type="number"
                    name="edad"
                    value={client.edad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.edad ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Sexo" name="sexo" error={fieldErrors.sexo} required>
                  <select
                    name="sexo"
                    value={client.sexo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.sexo ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </FormField>

                <FormField label="Teléfono 1" name="telefono1" error={fieldErrors.telefono1} required>
                  <input
                    type="tel"
                    name="telefono1"
                    value={client.telefono1}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.telefono1 ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                    placeholder="Número de teléfono"
                  />
                </FormField>

                <FormField label="Domicilio 1" name="domicilio1" error={fieldErrors.domicilio1} required>
                  <textarea
                    name="domicilio1"
                    value={client.domicilio1}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    rows="3"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.domicilio1 ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                    placeholder="Dirección completa"
                  ></textarea>
                </FormField>

                <FormField label="Domicilio 2" name="domicilio2">
                  <input
                    type="text"
                    name="domicilio2"
                    value={client.domicilio2}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                    placeholder="Segunda dirección"
                  />
                </FormField>

                <FormField label="Teléfono 2" name="telefono2">
                  <input
                    type="tel"
                    name="telefono2"
                    value={client.telefono2}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                    placeholder="Segundo teléfono"
                  />
                </FormField>

                <FormField label="URL del Mapa" name="map_url">
                  <input
                    type="text"
                    name="map_url"
                    value={client.map_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                    placeholder="URL de Google Maps"
                  />
                </FormField>
              </FormSection>

              <FormActions
                onCancel="/clients"
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

export default ClientForm;
