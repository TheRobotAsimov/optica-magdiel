import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import ventaService from '../../service/ventaService';
import empleadoService from '../../service/empleadoService';
import clientService from '../../service/clientService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { ShoppingCart, Calendar, Hash, User, DollarSign, FileText } from 'lucide-react';
import { validateVentaForm, validateVentaField } from '../../utils/validations/index.js';
import { useFormManager } from '../../hooks/useFormManager';
import FormHeader from '../common/form/FormHeader';
import FormSection from '../common/form/FormSection';
import FormField from '../common/form/FormField';
import FormActions from '../common/form/FormActions';

const VentaForm = () => {
  const { folio } = useParams();
  const [asesores, setAsesores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [initialSnapshot, setInitialSnapshot] = useState(null);

  // Fetch asesores and clientes separately
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [asesoresData, clientesData] = await Promise.all([
          empleadoService.getAllEmpleados(),
          clientService.getAllClients(),
        ]);
        setAsesores(asesoresData);
        setClientes(clientesData);
      } catch (err) {
        console.error('Error fetching asesores/clientes:', err);
      }
    };
    fetchData();
  }, []);

  const {
    values: venta,
    setValues,
    loading,
    error,
    fieldErrors,
    touched,
    setTouched,
    setFieldErrors,
    handleChange: originalHandleChange,
    handleBlur: originalHandleBlur,
    handleSubmit,
    isFormValid,
    isEdit
  } = useFormManager({
    initialValues: {
      folio: '',
      idasesor: '',
      idcliente: '',
      fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
      institucion: '',
      tipo: 'Contado',
      inapam: 'No',
      enganche: '',
      total: '',
      pagado: '',
      estatus: 'Pendiente',
      cant_pagos: '',
      observaciones: '',
      imagen_contrato: '',
      imagen_cobranza: ''
    },
    validateField: validateVentaField,
    validateForm: validateVentaForm,
    service: ventaService,
    createMethod: 'createVenta',
    updateMethod: 'updateVenta',
    getByIdMethod: 'getVentaByFolio',
    id: folio,
    redirectPath: '/ventas',
    transformData: (data, mode) => {
      if (mode === 'fetch') {
        setInitialSnapshot({
          enganche: data.enganche,
          pagado: data.pagado
        });
        return {
          ...data,
          fecha: data.fecha ? new Date(data.fecha).toISOString().slice(0, 10) : '',
        };
      }
      if (mode === 'submit') {
        const transformed = { ...data };
        if (transformed.enganche === '') transformed.enganche = null;
        if (transformed.cant_pagos === '') transformed.cant_pagos = null;
        return transformed;
      }
      return data;
    }
  });

  const handleBlur = (e) => {
    const { name, value } = e.target;
    originalHandleBlur(e);

    // Special logic for enganche/pagado
    if (name === 'enganche') {
      const valNumerico = parseFloat(value) || 0;

      if (!isEdit) {
        setValues(prev => ({ ...prev, pagado: valNumerico }));
      } else if (initialSnapshot) {
        const engancheOriginal = parseFloat(initialSnapshot.enganche) || 0;
        const pagadoOriginal = parseFloat(initialSnapshot.pagado) || 0;
        const diferencia = valNumerico - engancheOriginal;
        const nuevoPagado = pagadoOriginal + diferencia;
        setValues(prev => ({ ...prev, pagado: nuevoPagado }));
      }
    }
  };

  if (loading && !isEdit) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FormHeader
          title={isEdit ? 'Editar Venta' : 'Nueva Venta'}
          subtitle={isEdit ? 'Actualiza la información de la venta' : 'Completa los datos de la nueva venta'}
          icon={ShoppingCart}
          backPath="/ventas"
        />

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection title="Información de Venta" icon={ShoppingCart} colorClass="blue">
                <FormField label="Folio" name="folio" error={fieldErrors.folio} required icon={Hash}>
                  <input
                    type="text"
                    name="folio"
                    value={venta.folio}
                    onChange={originalHandleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.folio ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Asesor" name="idasesor" error={fieldErrors.idasesor} required icon={User}>
                  <select
                    name="idasesor"
                    value={venta.idasesor}
                    onChange={originalHandleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.idasesor ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="">Seleccionar Asesor</option>
                    {asesores.map(asesor => (
                      <option key={asesor.idempleado} value={asesor.idempleado}>{asesor.nombre}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Cliente" name="idcliente" error={fieldErrors.idcliente} required icon={User}>
                  <select
                    name="idcliente"
                    value={venta.idcliente}
                    onChange={originalHandleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.idcliente ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="">Seleccionar Cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.idcliente} value={cliente.idcliente}>{cliente.nombre} {cliente.paterno}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Fecha" name="fecha" error={fieldErrors.fecha} required icon={Calendar}>
                  <input
                    type="date"
                    name="fecha"
                    value={venta.fecha}
                    onChange={originalHandleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.fecha ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Institución" name="institucion" error={fieldErrors.institucion}>
                  <input
                    type="text"
                    name="institucion"
                    value={venta.institucion}
                    onChange={originalHandleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.institucion ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Tipo" name="tipo" error={fieldErrors.tipo} required>
                  <select
                    name="tipo"
                    value={venta.tipo}
                    onChange={originalHandleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.tipo ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="Contado">Contado</option>
                    <option value="Credito">Crédito</option>
                  </select>
                </FormField>

                <FormField label="Enganche" name="enganche" error={fieldErrors.enganche} icon={DollarSign}>
                  <input
                    type="number"
                    name="enganche"
                    value={venta.enganche}
                    onChange={originalHandleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.enganche ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="INAPAM" name="inapam">
                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl flex items-center hover:border-gray-300 transition-all duration-200">
                    <label className="flex items-center w-full cursor-pointer">
                      <input
                        type="checkbox"
                        name="inapam"
                        checked={venta.inapam === 'Si'}
                        onChange={(e) => setValues(prev => ({ ...prev, inapam: e.target.checked ? 'Si' : 'No' }))}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                      />
                      <span className="ml-3 text-gray-600 font-medium select-none">Aplicar descuento</span>
                    </label>
                  </div>
                </FormField>

                <FormField label="Total" name="total" error={fieldErrors.total} required icon={DollarSign}>
                  <input
                    type="number"
                    name="total"
                    value={venta.total}
                    onChange={originalHandleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.total ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Pagado" name="pagado" error={fieldErrors.pagado} icon={DollarSign}>
                  <input
                    type="number"
                    name="pagado"
                    value={venta.pagado}
                    onChange={originalHandleChange}
                    onBlur={handleBlur}
                    disabled
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 bg-gray-100 ${fieldErrors.pagado ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Estatus" name="estatus" error={fieldErrors.estatus} required>
                  <select
                    name="estatus"
                    value={venta.estatus}
                    onChange={originalHandleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.estatus ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                    <option value="Atrasado">Atrasado</option>
                  </select>
                </FormField>

                <FormField label="Cant. Pagos" name="cant_pagos" error={fieldErrors.cant_pagos}>
                  <input
                    type="number"
                    name="cant_pagos"
                    value={venta.cant_pagos}
                    onChange={originalHandleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${fieldErrors.cant_pagos ? 'border-red-500 focus:ring-red-100 bg-red-50' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}
                  />
                </FormField>

                <FormField label="Observaciones" name="observaciones" className="md:col-span-3" icon={FileText}>
                  <textarea
                    name="observaciones"
                    value={venta.observaciones}
                    onChange={originalHandleChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                  ></textarea>
                </FormField>
              </FormSection>

              <FormActions
                onCancel="/ventas"
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

export default VentaForm;
