import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import gastoRutaService from '../../service/gastoRutaService';
import rutaService from '../../service/rutaService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { DollarSign, MapPin, Hash } from 'lucide-react';
import { validateGastoRutaForm, validateGastoRutaField } from '../../utils/validations/index.js';
import { useFormManager } from '../../hooks/useFormManager';
import FormHeader from '../common/form/FormHeader';
import FormSection from '../common/form/FormSection';
import FormField from '../common/form/FormField';
import FormActions from '../common/form/FormActions';

const GastoRutaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rutas, setRutas] = useState([]);
  const urlParams = new URLSearchParams(window.location.search);
  const queryRutaId = urlParams.get('idruta');

  // Fetch rutas separately
  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const data = await rutaService.getAllRutas();
        setRutas(data);
      } catch (err) {
        console.error('Error fetching rutas:', err);
      }
    };
    fetchRutas();
  }, []);

  const {
    values: formData,
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
      idruta: queryRutaId || '',
      cantidad: '',
      motivo: '',
    },
    validateField: validateGastoRutaField,
    validateForm: validateGastoRutaForm,
    service: gastoRutaService,
    createMethod: 'createGastoRuta',
    updateMethod: 'updateGastoRuta',
    getByIdMethod: 'getGastoRutaById',
    id,
    redirectPath: queryRutaId ? '/ruta-asesor' : '/gasto-rutas',
    transformData: (data, mode) => {
      if (mode === 'submit') {
        return {
          ...data,
          cantidad: parseFloat(data.cantidad) || 0,
        };
      }
      return data;
    }
  });

  if (loading && !isEdit) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FormHeader
          title={isEdit ? 'Editar Gasto de Ruta' : 'Nuevo Gasto de Ruta'}
          subtitle={isEdit ? 'Actualiza la información del gasto de ruta' : 'Completa los datos del nuevo gasto de ruta'}
          icon={DollarSign}
          backPath={queryRutaId ? '/ruta-asesor' : '/gasto-rutas'}
        />

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection title="Información de Gasto de Ruta" icon={DollarSign} colorClass="purple">
                <FormField label="Ruta" name="idruta" error={fieldErrors.idruta} required icon={MapPin}>
                  <select
                    name="idruta"
                    value={formData.idruta}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={queryRutaId !== null}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 ${fieldErrors.idruta ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-purple-100 focus:border-purple-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="">Seleccionar Ruta</option>
                    {rutas.map(ruta => (
                      <option key={ruta.idruta} value={ruta.idruta}>{`Ruta ${ruta.idruta} - ${new Date(ruta.fecha).toLocaleDateString()}`}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Cantidad" name="cantidad" error={fieldErrors.cantidad} required icon={DollarSign}>
                  <input
                    type="number"
                    step="0.01"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.cantidad ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-purple-100 focus:border-purple-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Motivo" name="motivo" error={fieldErrors.motivo} required icon={Hash}>
                  <textarea
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    rows="3"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.motivo ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-purple-100 focus:border-purple-500 hover:border-gray-300'
                      }`}
                  ></textarea>
                </FormField>
              </FormSection>

              <FormActions
                onCancel={queryRutaId ? '/ruta-asesor' : '/gasto-rutas'}
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

export default GastoRutaForm;
