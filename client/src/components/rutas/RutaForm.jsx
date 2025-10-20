import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import rutaService from '../../service/rutaService';
import empleadoService from '../../service/empleadoService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft } from 'lucide-react';

const RutaForm = () => {
  const [formData, setFormData] = useState({
    idasesor: '',
    lentes_entregados: '',
    tarjetas_entregadas: '',
    lentes_no_entregados: '',
    tarjetas_no_entregadas: '',
    fecha: new Date().toISOString().slice(0, 10),
    lentes_recibidos: '',
    tarjetas_recibidas: '',
    hora_inicio: '',
    hora_fin: '',
  });
  const [asesores, setAsesores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const asesoresData = await empleadoService.getAllEmpleados();
        setAsesores(asesoresData);

        if (id) {
          const rutaData = await rutaService.getRutaById(id);
          setFormData({
            ...rutaData,
            fecha: new Date(rutaData.fecha).toISOString().slice(0, 10),
          });
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
        lentes_entregados: parseInt(formData.lentes_entregados) || 0,
        tarjetas_entregadas: parseInt(formData.tarjetas_entregadas) || 0,
        lentes_no_entregados: parseInt(formData.lentes_no_entregados) || 0,
        tarjetas_no_entregadas: parseInt(formData.tarjetas_no_entregadas) || 0,
        lentes_recibidos: parseInt(formData.lentes_recibidos) || 0,
        tarjetas_recibidas: parseInt(formData.tarjetas_recibidas) || 0,
      };

      if (id) {
        await rutaService.updateRuta(id, dataToSubmit);
      } else {
        await rutaService.createRuta(dataToSubmit);
      }
      navigate('/rutas');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.idasesor) {
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
              <h1 className="text-2xl font-bold text-blue-700">{id ? 'Editar Ruta' : 'Nueva Ruta'}</h1>
              <button
                type="button"
                onClick={() => navigate('/rutas')}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asesor *</label>
                  <select name="idasesor" value={formData.idasesor} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Seleccionar Asesor</option>
                    {asesores.map(asesor => (
                      <option key={asesor.idempleado} value={asesor.idempleado}>{asesor.nombre} {asesor.paterno}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                  <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora Inicio *</label>
                  <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora Fin *</label>
                  <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lentes Recibidos</label>
                  <input type="number" name="lentes_recibidos" value={formData.lentes_recibidos} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarjetas Recibidas</label>
                  <input type="number" name="tarjetas_recibidas" value={formData.tarjetas_recibidas} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lentes Entregados</label>
                  <input type="number" name="lentes_entregados" value={formData.lentes_entregados} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarjetas Entregadas</label>
                  <input type="number" name="tarjetas_entregadas" value={formData.tarjetas_entregadas} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lentes No Entregados</label>
                  <input type="number" name="lentes_no_entregados" value={formData.lentes_no_entregados} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarjetas No Entregadas</label>
                  <input type="number" name="tarjetas_no_entregadas" value={formData.tarjetas_no_entregadas} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button type="submit" disabled={loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar Ruta' : 'Crear Ruta')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RutaForm;
