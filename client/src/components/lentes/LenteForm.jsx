import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import lenteService from '../../service/lenteService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, User } from 'lucide-react';
import { validateLenteForm, validateLenteField } from '../../utils/validations/index.js';

const LenteForm = () => {
  const [lente, setLente] = useState({
    idoptometrista: '',
    folio: '',
    sintomas: '',
    uso_de_lente: '',
    armazon: '',
    material: 'CR-39',
    tratamiento: 'AR',
    tipo_de_lente: 'Monofocal',
    tinte_color: '',
    tono: '',
    desvanecido: 'No',
    blend: 'No',
    subtipo: '',
    procesado: 'No',
    fecha_entrega: '',
    examen_seguimiento: '',
    estatus: 'Pendiente',
    od_esf: '',
    od_cil: '',
    od_eje: '',
    od_add: '',
    od_av: '',
    oi_esf: '',
    oi_cil: '',
    oi_eje: '',
    oi_add: '',
    oi_av: '',
    kit: 'Sin kit'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchLente = async () => {
        setLoading(true);
        try {
          const data = await lenteService.getLenteById(id);
          if (data.fecha_entrega) {
            data.fecha_entrega = new Date(data.fecha_entrega).toISOString().split('T')[0];
          }
          if (data.examen_seguimiento) {
            data.examen_seguimiento = new Date(data.examen_seguimiento).toISOString().split('T')[0];
          }
          setLente(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchLente();
    }
  }, [id]);

  useEffect(() => {
    const errors = validateLenteForm(lente);
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [lente, fieldErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLente((prevLente) => ({ ...prevLente, [name]: value }));

    // Validación en tiempo real
    if (touched[name]) {
      const error = validateLenteField(name, value, lente);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateLenteField(name, value, lente);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación completa del formulario
    const errors = validateLenteForm(lente);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await lenteService.updateLente(id, lente);
      } else {
        await lenteService.createLente(lente);
      }
      navigate('/lentes');
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
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-700">
                  {id ? 'EDITAR LENTE' : 'NUEVO LENTE'}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => navigate('/lentes')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Optometrista *</label>
                    <input type="number" name="idoptometrista" value={lente.idoptometrista} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Folio Venta *</label>
                    <input type="text" name="folio" value={lente.folio} onChange={handleChange} onBlur={handleBlur} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Síntomas</label>
                    <input type="text" name="sintomas" value={lente.sintomas} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Uso de Lente *</label>
                    <input type="text" name="uso_de_lente" value={lente.uso_de_lente} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Armazón *</label>
                    <input type="text" name="armazon" value={lente.armazon} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                    <select name="material" value={lente.material} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="CR-39">CR-39</option>
                        <option value="BLUERAY">BLUERAY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento *</label>
                    <select name="tratamiento" value={lente.tratamiento} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="AR">AR</option>
                        <option value="Photo AR">Photo AR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Lente *</label>
                    <select name="tipo_de_lente" value={lente.tipo_de_lente} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Monofocal">Monofocal</option>
                        <option value="Bifocal">Bifocal</option>
                        <option value="Progresivo">Progresivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tinte Color</label>
                    <input type="text" name="tinte_color" value={lente.tinte_color} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tono</label>
                    <select name="tono" value={lente.tono} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">No</option>
                        <option value="Claro">Claro</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Oscuro">Oscuro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Desvanecido</label>
                    <select name="desvanecido" value={lente.desvanecido} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="No">No</option>
                        <option value="Si">Si</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blend</label>
                    <select name="blend" value={lente.blend} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="No">No</option>
                        <option value="Si">Si</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtipo</label>
                    <select name="subtipo" value={lente.subtipo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Ninguno</option>
                        <option value="Policarbonato">Policarbonato</option>
                        <option value="Haid index">Haid index</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Procesado</label>
                    <select name="procesado" value={lente.procesado} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="No">No</option>
                        <option value="Si">Si</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Entrega *</label>
                    <input type="date" name="fecha_entrega" value={lente.fecha_entrega} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Examen de Seguimiento</label>
                    <input type="date" name="examen_seguimiento" value={lente.examen_seguimiento} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estatus *</label>
                    <select name="estatus" value={lente.estatus} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Pendiente">Pendiente</option>
                        <option value="Entregado">Entregado</option>
                        <option value="No entregado">No entregado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kit</label>
                    <select name="kit" value={lente.kit} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Sin kit">Sin kit</option>
                        <option value="Completo">Completo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Graduación</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="md:col-span-5 font-bold">Ojo Derecho (OD)</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ESF</label>
                    <input type="number" step="0.01" name="od_esf" value={lente.od_esf} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CIL</label>
                    <input type="number" step="0.01" name="od_cil" value={lente.od_cil} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">EJE</label>
                    <input type="number" name="od_eje" value={lente.od_eje} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ADD</label>
                    <input type="number" step="0.01" name="od_add" value={lente.od_add} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AV</label>
                    <input type="text" name="od_av" value={lente.od_av} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="md:col-span-5 font-bold">Ojo Izquierdo (OI)</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ESF</label>
                    <input type="number" step="0.01" name="oi_esf" value={lente.oi_esf} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CIL</label>
                    <input type="number" step="0.01" name="oi_cil" value={lente.oi_cil} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">EJE</label>
                    <input type="number" name="oi_eje" value={lente.oi_eje} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ADD</label>
                    <input type="number" step="0.01" name="oi_add" value={lente.oi_add} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AV</label>
                    <input type="text" name="oi_av" value={lente.oi_av} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                <button type="button" onClick={() => navigate('/lentes')} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={!isFormValid || loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar' : 'Crear Lente')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenteForm;
