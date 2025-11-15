import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import ventaService from '../../service/ventaService';
import empleadoService from '../../service/empleadoService';
import clientService from '../../service/clientService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, ShoppingCart } from 'lucide-react';
import { validateVentaForm, validateVentaField } from '../../utils/validations/index.js';

const VentaForm = () => {
  const [venta, setVenta] = useState({
    folio: '',
    idasesor: '',
    idcliente: '',
    fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    tipo: 'Contado',
    enganche: '',
    total: '',
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
          setVenta(ventaData);
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
    return (
      <div className="min-h-screen bg-gray-50">
        <NavComponent />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Cargando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavComponent />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-700">
                  {folio ? 'EDITAR VENTA' : 'NUEVA VENTA'}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => navigate('/ventas')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Folio *</label>
                  <input type="text" name="folio" value={venta.folio} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.folio ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} />
                  {fieldErrors.folio && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.folio}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asesor *</label>
                  <select name="idasesor" value={venta.idasesor} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.idasesor ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}>
                    <option value="">Seleccionar Asesor</option>
                    {asesores.map(asesor => (
                      <option key={asesor.idempleado} value={asesor.idempleado}>{asesor.nombre}</option>
                    ))}
                  </select>
                  {fieldErrors.idasesor && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.idasesor}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                  <select name="idcliente" value={venta.idcliente} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.idcliente ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}>
                    <option value="">Seleccionar Cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.idcliente} value={cliente.idcliente}>{cliente.nombre} {cliente.paterno}</option>
                    ))}
                  </select>
                  {fieldErrors.idcliente && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.idcliente}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                  <input type="date" name="fecha" value={venta.fecha} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.fecha ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} />
                  {fieldErrors.fecha && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.fecha}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                  <select name="tipo" value={venta.tipo} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.tipo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}>
                    <option value="Contado">Contado</option>
                    <option value="Credito">Crédito</option>
                  </select>
                  {fieldErrors.tipo && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.tipo}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enganche</label>
                  <input type="number" name="enganche" value={venta.enganche} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.enganche ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} />
                  {fieldErrors.enganche && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.enganche}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total *</label>
                  <input type="number" name="total" value={venta.total} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.total ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} />
                  {fieldErrors.total && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.total}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estatus *</label>
                  <select name="estatus" value={venta.estatus} onChange={handleChange} onBlur={handleBlur} required className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.estatus ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                    <option value="Atrasado">Atrasado</option>
                  </select>
                  {fieldErrors.estatus && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.estatus}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cant. Pagos</label>
                  <input type="number" name="cant_pagos" value={venta.cant_pagos} onChange={handleChange} onBlur={handleBlur} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.cant_pagos ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`} />
                  {fieldErrors.cant_pagos && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.cant_pagos}</p>
                  )}
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                  <textarea name="observaciones" value={venta.observaciones} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button type="button" onClick={() => navigate('/ventas')} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={!isFormValid || loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Guardando...' : (folio ? 'Actualizar' : 'Crear Venta')}</span>
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
