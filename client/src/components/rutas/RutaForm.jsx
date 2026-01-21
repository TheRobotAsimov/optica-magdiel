import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import rutaService from '../../service/rutaService';
import empleadoService from '../../service/empleadoService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { MapPin, User, Calendar, Clock, Hash } from 'lucide-react';
import { validateRouteForm, validateRouteField } from '../../utils/validations/index.js';
import { useFormManager } from '../../hooks/useFormManager';
import FormHeader from '../common/form/FormHeader';
import FormSection from '../common/form/FormSection';
import FormField from '../common/form/FormField';
import FormActions from '../common/form/FormActions';

const RutaForm = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [asesores, setAsesores] = useState([]);

  // Fetch asesores separately
  useEffect(() => {
    const fetchAsesores = async () => {
      try {
        const res = await empleadoService.getAllEmpleados({ limit: 1000 });
        const allEmpleados = res.items || [];
        const asesoresList = user.rol === 'Matriz' ? allEmpleados.filter(emp => emp.puesto === 'Asesor') : allEmpleados;
        setAsesores(asesoresList);
      } catch (err) {
        console.error('Error fetching asesores:', err);
      }
    };
    fetchAsesores();
  }, [user]);

  const {
    values: formData,
    setValues,
    loading,
    error,
    fieldErrors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isFormValid,
    isEdit
  } = useFormManager({
    initialValues: {
      idasesor: '',
      lentes_entregados: '',
      tarjetas_entregadas: '',
      lentes_no_entregados: '',
      tarjetas_no_entregadas: '',
      fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
      lentes_recibidos: '',
      tarjetas_recibidas: '',
      hora_inicio: '',
      hora_fin: '',
      estatus: 'Activa',
    },
    validateField: validateRouteField,
    validateForm: validateRouteForm,
    service: rutaService,
    createMethod: 'createRuta',
    updateMethod: 'updateRuta',
    getByIdMethod: 'getRutaById',
    id,
    redirectPath: '/rutas',
    transformData: (data, mode) => {
      if (mode === 'fetch') {
        return {
          ...data,
          fecha: new Date(data.fecha).toISOString().slice(0, 10),
        };
      }
      if (mode === 'submit') {
        return {
          ...data,
          hora_fin: data.hora_fin || null,
          lentes_entregados: parseInt(data.lentes_entregados) || 0,
          tarjetas_entregadas: parseInt(data.tarjetas_entregadas) || 0,
          lentes_no_entregados: parseInt(data.lentes_no_entregados) || 0,
          tarjetas_no_entregadas: parseInt(data.tarjetas_no_entregadas) || 0,
          lentes_recibidos: parseInt(data.lentes_recibidos) || 0,
          tarjetas_recibidas: parseInt(data.tarjetas_recibidas) || 0,
        };
      }
      return data;
    }
  });

  // Set initial idasesor for non-admin
  useEffect(() => {
    if (!isEdit && user?.rol === 'Asesor' && formData.idasesor === '') {
      setValues(prev => ({ ...prev, idasesor: user.idempleado }));
    }
  }, [isEdit, user, formData.idasesor, setValues]);

  if (loading && !formData.idasesor) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FormHeader
          title={isEdit ? 'Editar Ruta' : 'Nueva Ruta'}
          subtitle={isEdit ? 'Actualiza la información de la ruta' : 'Completa los datos de la nueva ruta'}
          icon={MapPin}
          backPath="/rutas"
        />

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection title="Información de Ruta" icon={MapPin} colorClass="indigo">
                <FormField label="Asesor" name="idasesor" error={fieldErrors.idasesor} required icon={User}>
                  <select
                    name="idasesor"
                    value={formData.idasesor}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={user?.rol === 'Asesor'}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.idasesor ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="">Seleccionar Asesor</option>
                    {asesores.map(asesor => (
                      <option key={asesor.idempleado} value={asesor.idempleado}>{asesor.nombre} {asesor.paterno}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Fecha" name="fecha" error={fieldErrors.fecha} required icon={Calendar}>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.fecha ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Hora Inicio" name="hora_inicio" error={fieldErrors.hora_inicio} required icon={Clock}>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.hora_inicio ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Hora Fin" name="hora_fin" error={fieldErrors.hora_fin} icon={Clock}>
                  <input
                    type="time"
                    name="hora_fin"
                    value={formData.hora_fin}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.hora_fin ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Estatus" name="estatus" error={fieldErrors.estatus} required>
                  <select
                    name="estatus"
                    value={formData.estatus}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.estatus ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="Activa">Activa</option>
                    <option value="Finalizada">Finalizada</option>
                  </select>
                </FormField>

                <FormField label="Lentes Recibidos" name="lentes_recibidos" error={fieldErrors.lentes_recibidos} required icon={Hash}>
                  <input
                    type="number"
                    name="lentes_recibidos"
                    value={formData.lentes_recibidos}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.lentes_recibidos ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Tarjetas Recibidas" name="tarjetas_recibidas" error={fieldErrors.tarjetas_recibidas} required icon={Hash}>
                  <input
                    type="number"
                    name="tarjetas_recibidas"
                    value={formData.tarjetas_recibidas}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.tarjetas_recibidas ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>
              </FormSection>

              <FormActions
                onCancel="/rutas"
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

export default RutaForm;
