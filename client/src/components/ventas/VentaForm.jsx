import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import ventaService from '../../service/ventaService';
import empleadoService from '../../service/empleadoService';
import clientService from '../../service/clientService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { Save, ArrowLeft, ShoppingCart } from 'lucide-react';
import { validateVentaForm, validateVentaField } from '../../utils/validations/index.js';

const VentaForm = () => {
  const [venta, setVenta] = useState({
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
  });
  const [asesores, setAsesores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState(null);
  const { folio } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [asesoresData, clientesData] = await Promise.all([
          empleadoService.getAllEmpleados(),
          clientService.getAllClients(),
        ]);
        setAsesores(asesoresData);
        setClientes(clientesData);

        if (folio) {
          const ventaData = await ventaService.getVentaByFolio(folio);
          setVenta({
            ...ventaData,
            fecha: ventaData.fecha ? new Date(ventaData.fecha).toISOString().slice(0, 10) : '',
          });

          setInitialSnapshot({
            enganche: ventaData.enganche,
            pagado: ventaData.pagado
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [folio]);

  useEffect(() => {
    const errors = validateVentaForm(venta);
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [venta, fieldErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVenta((prevVenta) => ({ ...prevVenta, [name]: value }));

    // Validación en tiempo real
    if (touched[name]) {
      const error = validateVentaField(name, value, venta);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateVentaField(name, value, venta);
    setFieldErrors(prev => ({ ...prev, [name]: error }));

    // --- LÓGICA AGREGADA PARA ENGANCHE/PAGADO ---
    if (name === 'enganche') {
      const valNumerico = parseFloat(value) || 0;

      if (!folio) {
        // CASO 1: NUEVA VENTA
        // Si es nueva venta, lo que pongas en enganche se copia a pagado
        setVenta(prev => ({ ...prev, pagado: valNumerico }));
      } 
      else if (initialSnapshot) {
        // CASO 2: EDITAR VENTA EXISTENTE
        // Calculamos la diferencia entre el NUEVO enganche y el ORIGINAL (base de datos)
        const engancheOriginal = parseFloat(initialSnapshot.enganche) || 0;
        const pagadoOriginal = parseFloat(initialSnapshot.pagado) || 0;
        
        const diferencia = valNumerico - engancheOriginal;

        // Ajustamos el pagado sumando (o restando) esa diferencia al pagado original
        const nuevoPagado = pagadoOriginal + diferencia;

        setVenta(prev => ({ ...prev, pagado: nuevoPagado }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación completa del formulario
    const errors = validateVentaForm(venta);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      const modifiedVenta = { ...venta };
      if (modifiedVenta.enganche === '') {
        modifiedVenta.enganche = null;
      }
      if (modifiedVenta.cant_pagos === '') {
        modifiedVenta.cant_pagos = null;
      }
      if (folio) {
        await ventaService.updateVenta(folio, modifiedVenta);
      } else {
        await ventaService.createVenta(modifiedVenta);
      }
      navigate('/ventas');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white rounded-4xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {folio ? 'Editar Venta' : 'Nueva Venta'}
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    {folio ? 'Actualiza la información de la venta' : 'Completa los datos de la nueva venta'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/ventas')}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Sales Information Section */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información de Venta</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Folio
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="text" name="folio" value={venta.folio} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.folio
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} />
                      {fieldErrors.folio && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.folio}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Asesor
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="idasesor" value={venta.idasesor} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.idasesor
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}>
                        <option value="">Seleccionar Asesor</option>
                        {asesores.map(asesor => (
                          <option key={asesor.idempleado} value={asesor.idempleado}>{asesor.nombre}</option>
                        ))}
                      </select>
                      {fieldErrors.idasesor && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.idasesor}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Cliente
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="idcliente" value={venta.idcliente} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.idcliente
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}>
                        <option value="">Seleccionar Cliente</option>
                        {clientes.map(cliente => (
                          <option key={cliente.idcliente} value={cliente.idcliente}>{cliente.nombre} {cliente.paterno}</option>
                        ))}
                      </select>
                      {fieldErrors.idcliente && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.idcliente}
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Fecha
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="date" name="fecha" value={venta.fecha} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.fecha
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} />
                      {fieldErrors.fecha && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.fecha}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2">
                        Institución
                      </label>
                      <input type="text" name="institucion" value={venta.institucion} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.institucion
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} />
                      {fieldErrors.institucion && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.institucion}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Tipo
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="tipo" value={venta.tipo} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.tipo
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}>
                        <option value="Contado">Contado</option>
                        <option value="Credito">Crédito</option>
                      </select>
                      {fieldErrors.tipo && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.tipo}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Enganche
                      </label>
                      <input type="number" name="enganche" value={venta.enganche} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.enganche
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} />
                      {fieldErrors.enganche && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.enganche}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        INAPAM
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl flex items-center  hover:border-gray-300 transition-all duration-200">
                        <label className="flex items-center w-full cursor-pointer">
                          <input
                            type="checkbox"
                            name="inapam"
                            checked={venta.inapam === 'Si'}
                            onChange={(e) => setVenta(prev => ({ ...prev, inapam: e.target.checked ? 'Si' : 'No' }))}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                          />
                          <span className="ml-3 text-gray-600 font-medium select-none">
                            Aplicar descuento
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Total
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input type="number" name="total" value={venta.total} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.total
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} />
                      {fieldErrors.total && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.total}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2">
                        Pagado
                      </label>
                      <input type="number" name="pagado" value={venta.pagado} onChange={handleChange} onBlur={handleBlur} disabled className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 bg-gray-100 ${
                        fieldErrors.pagado
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} />
                      {fieldErrors.pagado && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.pagado}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        Estatus
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select name="estatus" value={venta.estatus} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.estatus
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`}>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagado">Pagado</option>
                        <option value="Atrasado">Atrasado</option>
                      </select>
                      {fieldErrors.estatus && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.estatus}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cant. Pagos
                      </label>
                      <input type="number" name="cant_pagos" value={venta.cant_pagos} onChange={handleChange} onBlur={handleBlur} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                        fieldErrors.cant_pagos
                          ? 'border-red-500 focus:ring-red-100 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                      }`} />
                      {fieldErrors.cant_pagos && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <span className="mr-1">⚠</span> {fieldErrors.cant_pagos}
                        </p>
                      )}
                    </div>
                    <div className="group md:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Observaciones
                      </label>
                      <textarea name="observaciones" value={venta.observaciones} onChange={handleChange} rows="3" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/ventas')}
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
                  <span>{loading ? 'Guardando...' : (folio ? 'Actualizar Venta' : 'Crear Venta')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentaForm;
