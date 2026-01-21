import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import entregaService from '../../service/entregaService';
import rutaService from '../../service/rutaService';
import lenteService from '../../service/lenteService';
import pagoService from '../../service/pagoService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { User, MapPin, Glasses, DollarSign, Clock, FileText } from 'lucide-react';
import { validateEntregaForm, validateEntregaField } from '../../utils/validations/index.js';
import { useFormManager } from '../../hooks/useFormManager';
import FormHeader from '../common/form/FormHeader';
import FormSection from '../common/form/FormSection';
import FormField from '../common/form/FormField';
import FormActions from '../common/form/FormActions';

const EntregaForm = () => {
  const { id } = useParams();
  const [rutas, setRutas] = useState([]);
  const [lentes, setLentes] = useState([]);
  const [pagos, setPagos] = useState([]);

  // Fetch related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rutasData, lentesData, pagosData] = await Promise.all([
          rutaService.getAllRutas(),
          lenteService.getAllLentes(),
          pagoService.getAllPagos(),
        ]);
        setRutas(rutasData);
        setLentes(lentesData);
        setPagos(pagosData);
      } catch (err) {
        console.error('Error fetching delivery data:', err);
      }
    };
    fetchData();
  }, []);

  const {
    values: formData,
    setValues,
    loading,
    error,
    fieldErrors,
    touched,
    handleChange: originalHandleChange,
    handleBlur,
    handleSubmit,
    isFormValid,
    isEdit
  } = useFormManager({
    initialValues: {
      idruta: '',
      estatus: 'No entregado',
      idlente: '',
      idpago: '',
      motivo: '',
      hora: new Date().toTimeString().slice(0, 5),
    },
    validateField: validateEntregaField,
    validateForm: validateEntregaForm,
    service: entregaService,
    createMethod: 'createEntrega',
    updateMethod: 'updateEntrega',
    getByIdMethod: 'getEntregaById',
    id,
    redirectPath: '/entregas',
    transformData: (data, mode) => {
      if (mode === 'fetch') {
        return {
          ...data,
          hora: data.hora || new Date().toTimeString().slice(0, 5),
        };
      }
      return data;
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'idlente') {
      setValues(prev => ({
        ...prev,
        idlente: value,
        idpago: ''
      }));
    } else {
      originalHandleChange(e);
    }
  };

  // Filter logic
  const selectedLente = lentes.find(l => String(l.idlente) === String(formData.idlente));
  const filteredPagos = selectedLente
    ? pagos.filter(pago => pago.folio === selectedLente.folio)
    : pagos;

  if (loading && !isEdit) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FormHeader
          title={isEdit ? 'Editar Entrega' : 'Nueva Entrega'}
          subtitle={isEdit ? 'Actualiza la información de la entrega' : 'Completa los datos de la nueva entrega'}
          icon={User}
          backPath="/entregas"
        />

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection title="Información de Entrega" icon={User} colorClass="blue">
                <FormField label="Ruta" name="idruta" error={fieldErrors.idruta} required icon={MapPin}>
                  <select
                    name="idruta"
                    value={formData.idruta}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.idruta ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="">Seleccionar Ruta</option>
                    {rutas.map(ruta => (
                      <option key={ruta.idruta} value={ruta.idruta}>{`Ruta ${ruta.idruta} - ${new Date(ruta.fecha).toLocaleDateString()}`}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Estatus" name="estatus" error={fieldErrors.estatus} required>
                  <select
                    name="estatus"
                    value={formData.estatus}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.estatus ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="No entregado">No entregado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </FormField>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="font-medium text-blue-800">Nota:</span> Debe seleccionar al menos un lente o un pago.
                  </p>
                </div>

                <FormField label="Lente" name="idlente" error={fieldErrors.idlente} icon={Glasses}>
                  <select
                    name="idlente"
                    value={formData.idlente}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                  >
                    <option value="">Seleccionar Lente</option>
                    {lentes.map(lente => (
                      <option key={lente.idlente} value={lente.idlente}>{`${lente.idlente} - ${lente.armazon}`}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Pago" name="idpago" error={fieldErrors.idpago} icon={DollarSign}>
                  <select
                    name="idpago"
                    value={formData.idpago}
                    onChange={handleChange}
                    disabled={selectedLente && filteredPagos.length === 0}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">
                      {selectedLente && filteredPagos.length === 0 ? "No hay pagos con este folio" : "Seleccionar Pago"}
                    </option>
                    {filteredPagos.map(pago => (
                      <option key={pago.idpago} value={pago.idpago}>{`Pago ${pago.idpago} - Folio ${pago.folio}`}</option>
                    ))}
                  </select>
                  {selectedLente && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      {filteredPagos.length > 0 ? `Filtrando por Folio: ${selectedLente.folio}` : `No se encontraron pagos para el Folio: ${selectedLente.folio}`}
                    </p>
                  )}
                </FormField>

                <FormField label="Motivo" name="motivo" error={fieldErrors.motivo} required icon={FileText}>
                  <textarea
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    rows="3"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.motivo ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  ></textarea>
                </FormField>

                <FormField label="Hora" name="hora" error={fieldErrors.hora} required icon={Clock}>
                  <input
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.hora ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>
              </FormSection>

              <FormActions
                onCancel="/entregas"
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

export default EntregaForm;