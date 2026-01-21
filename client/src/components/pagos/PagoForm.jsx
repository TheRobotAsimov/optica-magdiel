import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import pagoService from '../../service/pagoService';
import ventaService from '../../service/ventaService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { DollarSign, Calendar, Hash } from 'lucide-react';
import { validatePagoForm, validatePagoField } from '../../utils/validations/index.js';
import { useFormManager } from '../../hooks/useFormManager';
import FormHeader from '../common/form/FormHeader';
import FormSection from '../common/form/FormSection';
import FormField from '../common/form/FormField';
import FormActions from '../common/form/FormActions';

const PagoForm = () => {
  const { id } = useParams();
  const [ventas, setVentas] = useState([]);
  const [saldoPendiente, setSaldoPendiente] = useState(null);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [originalFolio, setOriginalFolio] = useState('');

  // Fetch ventas separately
  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const res = await ventaService.getAllVentas({ limit: 1000 });
        setVentas(res.items || []);
      } catch (err) {
        console.error('Error fetching ventas:', err);
      }
    };
    fetchVentas();
  }, []);

  const {
    values: formData,
    setValues,
    loading,
    error,
    fieldErrors,
    setFieldErrors,
    touched,
    handleChange: originalHandleChange,
    handleBlur,
    handleSubmit,
    isFormValid,
    isEdit
  } = useFormManager({
    initialValues: {
      folio: '',
      fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
      cantidad: '',
      estatus: 'Pendiente',
    },
    validateField: validatePagoField,
    validateForm: validatePagoForm,
    service: pagoService,
    createMethod: 'createPago',
    updateMethod: 'updatePago',
    getByIdMethod: 'getPagoById',
    id,
    redirectPath: '/pagos',
    transformData: (data, mode) => {
      if (mode === 'fetch') {
        const transformed = {
          ...data,
          fecha: new Date(data.fecha).toISOString().slice(0, 10),
        };
        setOriginalAmount(parseFloat(data.cantidad) || 0);
        setOriginalFolio(data.folio);
        return transformed;
      }
      if (mode === 'submit') {
        return {
          ...data,
          cantidad: parseFloat(data.cantidad) || 0,
        };
      }
      return data;
    }
  });

  // Calculate initial saldo when editing and ventas are loaded
  useEffect(() => {
    if (isEdit && ventas.length > 0 && formData.folio && originalFolio === '') {
      // Initial load for edit mode is handled in transformData, but we need to wait for ventas
    }
    if (isEdit && ventas.length > 0 && formData.folio && saldoPendiente === null) {
      const ventaAsociada = ventas.find(v => v.folio === formData.folio);
      if (ventaAsociada) {
        const deudaReal = parseFloat(ventaAsociada.total) - parseFloat(ventaAsociada.pagado);
        setSaldoPendiente(deudaReal + (parseFloat(formData.cantidad) || 0));
      }
    }
  }, [isEdit, ventas, formData.folio, formData.cantidad, originalFolio, saldoPendiente]);

  const validateAmount = (val, maximo) => {
    if (parseFloat(val) > maximo + 0.1) {
      setFieldErrors(prev => ({ ...prev, cantidad: `Máximo permitido: $${maximo.toFixed(2)}` }));
    } else {
      setFieldErrors(prev => {
        const newErr = { ...prev };
        delete newErr.cantidad;
        return newErr;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'folio') {
      const ventaSeleccionada = ventas.find(v => v.folio === value);
      if (ventaSeleccionada) {
        let disponible = parseFloat(ventaSeleccionada.total) - parseFloat(ventaSeleccionada.pagado);
        if (isEdit && value === originalFolio) {
          disponible += originalAmount;
        }
        setSaldoPendiente(disponible);
        if (formData.cantidad) {
          validateAmount(formData.cantidad, disponible);
        }
      } else {
        setSaldoPendiente(null);
      }
    }

    if (name === 'cantidad' && saldoPendiente !== null) {
      validateAmount(value, saldoPendiente);
    }

    originalHandleChange(e);
  };

  if (loading && !isEdit) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FormHeader
          title={isEdit ? 'Editar Pago' : 'Nuevo Pago'}
          subtitle={isEdit ? 'Actualiza la información del pago' : 'Completa los datos del nuevo pago'}
          icon={DollarSign}
          backPath="/pagos"
        />

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection title="Información de Pago" icon={DollarSign} colorClass="green">
                <FormField label="Folio de Venta" name="folio" error={fieldErrors.folio} required icon={Hash}>
                  <select
                    name="folio"
                    value={formData.folio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.folio ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-green-100 focus:border-green-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="">Seleccionar Folio</option>
                    {ventas.map(venta => (
                      <option key={venta.folio} value={venta.folio}>{venta.folio}</option>
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
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.fecha ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-green-100 focus:border-green-500 hover:border-gray-300'
                      }`}
                  />
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
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.cantidad ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-green-100 focus:border-green-500 hover:border-gray-300'
                      }`}
                  />
                  {saldoPendiente !== null && !fieldErrors.cantidad && (
                    <p className="text-blue-600 text-xs mt-2 font-medium">
                      Saldo pendiente de la venta: ${saldoPendiente.toLocaleString('es-MX')}
                    </p>
                  )}
                </FormField>

                <FormField label="Estatus" name="estatus" error={fieldErrors.estatus} required>
                  <select
                    name="estatus"
                    value={formData.estatus}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.estatus ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-green-100 focus:border-green-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                  </select>
                </FormField>
              </FormSection>

              <FormActions
                onCancel="/pagos"
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

export default PagoForm;
