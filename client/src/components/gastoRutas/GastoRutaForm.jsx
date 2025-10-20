import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import gastoRutaService from '../../service/gastoRutaService';
import rutaService from '../../service/rutaService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft } from 'lucide-react';

const GastoRutaForm = () => {
  const [formData, setFormData] = useState({
    idruta: '',
    cantidad: '',
    motivo: '',
  });
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rutasData = await rutaService.getAllRutas();
        setRutas(rutasData);

        if (id) {
          const gastoRutaData = await gastoRutaService.getGastoRutaById(id);
          setFormData(gastoRutaData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        cantidad: parseFloat(formData.cantidad) || 0,
      };

      if (id) {
        await gastoRutaService.updateGastoRuta(id, dataToSubmit);
      } else {
        await gastoRutaService.createGastoRuta(dataToSubmit);
      }
      navigate('/gasto-rutas');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !id) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-700">{id ? 'Editar Gasto de Ruta' : 'Nuevo Gasto de Ruta'}</h1>
              <button
                type="button"
                onClick={() => navigate('/gasto-rutas')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ruta *</label>
                  <select name="idruta" value={formData.idruta} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Seleccionar Ruta</option>
                    {rutas.map(ruta => (
                      <option key={ruta.idruta} value={ruta.idruta}>{`Ruta ${ruta.idruta} - ${new Date(ruta.fecha).toLocaleDateString()}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad *</label>
                  <input type="number" step="0.01" name="cantidad" value={formData.cantidad} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motivo *</label>
                  <textarea name="motivo" value={formData.motivo} onChange={handleChange} required rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button type="submit" disabled={loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar Gasto' : 'Crear Gasto')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GastoRutaForm;
