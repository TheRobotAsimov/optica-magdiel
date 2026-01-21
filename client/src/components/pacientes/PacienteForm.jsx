import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import pacienteService from '../../service/pacienteService';
import clientService from '../../service/clientService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { User } from 'lucide-react';
import { validatePacienteForm, validatePacienteField } from '../../utils/validations/index.js';
import { useFormManager } from '../../hooks/useFormManager';
import FormHeader from '../common/form/FormHeader';
import FormSection from '../common/form/FormSection';
import FormField from '../common/form/FormField';
import FormActions from '../common/form/FormActions';

const PacienteForm = () => {
  const { id } = useParams();
  const [clients, setClients] = useState([]);

  // Fetch clients separately
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await clientService.getAllClients({ limit: 1000 });
        setClients(res.items || []);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };
    fetchClients();
  }, []);

  const {
    values: paciente,
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
      idcliente: '',
      nombre: '',
      paterno: '',
      materno: '',
      sexo: '',
      edad: '',
      parentesco: '',
    },
    validateField: validatePacienteField,
    validateForm: validatePacienteForm,
    service: pacienteService,
    createMethod: 'createPaciente',
    updateMethod: 'updatePaciente',
    getByIdMethod: 'getPacienteById',
    id,
    redirectPath: '/pacientes',
    transformData: (data, mode) => {
      if (mode === 'submit') {
        const transformed = { ...data };
        if (!transformed.materno) transformed.materno = null;
        return transformed;
      }
      return data;
    }
  });

  if (loading && !id) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FormHeader
          title={isEdit ? 'Editar Paciente' : 'Nuevo Paciente'}
          subtitle={isEdit ? 'Actualiza la información del paciente' : 'Completa los datos del nuevo paciente'}
          icon={User}
          backPath="/pacientes"
        />

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection title="Información del Paciente" icon={User} colorClass="blue">
                <FormField label="Cliente" name="idcliente" error={fieldErrors.idcliente} required>
                  <select
                    name="idcliente"
                    value={paciente.idcliente}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.idcliente ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="">Seleccionar Cliente</option>
                    {clients.map(cliente => (
                      <option key={cliente.idcliente} value={cliente.idcliente}>{cliente.nombre} {cliente.paterno}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Nombre" name="nombre" error={fieldErrors.nombre} required>
                  <input
                    type="text"
                    name="nombre"
                    value={paciente.nombre}
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
                    value={paciente.paterno}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.paterno ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Apellido Materno" name="materno" error={fieldErrors.materno}>
                  <input
                    type="text"
                    name="materno"
                    value={paciente.materno}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.materno ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Sexo" name="sexo" error={fieldErrors.sexo} required>
                  <select
                    name="sexo"
                    value={paciente.sexo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.sexo ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="">Seleccionar Sexo</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </FormField>

                <FormField label="Edad" name="edad" error={fieldErrors.edad} required>
                  <input
                    type="number"
                    name="edad"
                    value={paciente.edad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    min="1"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.edad ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Parentesco" name="parentesco">
                  <select
                    name="parentesco"
                    value={paciente.parentesco}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                  >
                    <option value="">Seleccionar Parentesco</option>
                    <option value="Hijo">Hijo</option>
                    <option value="Nieto">Nieto</option>
                    <option value="Hermano">Hermano</option>
                    <option value="Primo">Primo</option>
                    <option value="Sobrino">Sobrino</option>
                  </select>
                </FormField>
              </FormSection>

              <FormActions
                onCancel="/pacientes"
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

export default PacienteForm;