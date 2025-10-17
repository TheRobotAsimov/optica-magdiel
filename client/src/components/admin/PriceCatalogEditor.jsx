import { useState, useEffect } from 'react';
import precioService from '../../service/precioService';
import NavComponent from '../common/NavBar';
import Swal from 'sweetalert2';
import { Save } from 'lucide-react';

const PriceTable = ({ title, data, onChange }) => {
  const isBifocal = title.includes('Bifocal');
  const headers = ['Tratamiento', 'Base', 'Procesado', 'Policarbonato', 'Haid index'];
  if (isBifocal) {
    headers.push('Blend');
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-black">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="px-6 py-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([tratamiento, values]) => (
              <tr key={tratamiento} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{tratamiento}</td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={values.base}
                    onChange={(e) => onChange(tratamiento, 'base', e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-lg"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={values.procesado}
                    onChange={(e) => onChange(tratamiento, 'procesado', e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-lg"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={values.subtipo.Policarbonato}
                    onChange={(e) => onChange(tratamiento, 'subtipo', e.target.value, 'Policarbonato')}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-lg"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={values.subtipo['Haid index']}
                    onChange={(e) => onChange(tratamiento, 'subtipo', e.target.value, 'Haid index')}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-lg"
                  />
                </td>
                {isBifocal && (
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={values.blend}
                      onChange={(e) => onChange(tratamiento, 'blend', e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded-lg"
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdditivesEditor = ({ data, onChange }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-bold text-gray-800 mb-4">Extras</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Kit</label>
        <input
          type="number"
          value={data.kit}
          onChange={(e) => onChange('kit', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tinte</label>
        <input
          type="number"
          value={data.tinte}
          onChange={(e) => onChange('tinte', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  </div>
);

const PriceCatalogEditor = () => {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await precioService.getPriceCatalog();
        setCatalog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const handlePriceChange = (material, tipo, tratamiento, field, value, subField = null) => {
    setCatalog((prev) => {
      const newCatalog = { ...prev };
      newCatalog.priceCatalog = { ...prev.priceCatalog };
      newCatalog.priceCatalog[material] = { ...prev.priceCatalog[material] };
      newCatalog.priceCatalog[material][tipo] = { ...prev.priceCatalog[material][tipo] };
      newCatalog.priceCatalog[material][tipo][tratamiento] = { ...prev.priceCatalog[material][tipo][tratamiento] };

      if (subField) {
        newCatalog.priceCatalog[material][tipo][tratamiento][field] = {
          ...prev.priceCatalog[material][tipo][tratamiento][field],
          [subField]: parseFloat(value),
        };
      } else {
        newCatalog.priceCatalog[material][tipo][tratamiento][field] = parseFloat(value);
      }

      return newCatalog;
    });
  };

  const handleAdditiveChange = (field, value) => {
    setCatalog((prev) => {
      const newCatalog = { ...prev };
      newCatalog.additives[field] = parseFloat(value);
      return newCatalog;
    });
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      await precioService.updatePriceCatalog(catalog);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Catálogo actualizado correctamente',
        showConfirmButton: false,
        timer: 1800,
      });

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

  if (!catalog) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">Catálogo de Precios</h1>
            { //<p className="text-gray-500">Version: {catalog.version} | Last Updated: {catalog.lastUpdated}</p> 
            }
          </div>
          <button
            onClick={handleSaveChanges}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Guardar Cambios'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {Object.entries(catalog.priceCatalog).map(([material, tipos]) => (
              <div key={material}>
                {Object.entries(tipos).map(([tipo, tratamientos]) => (
                  <PriceTable
                    key={`${material}-${tipo}`}
                    title={`${material} - ${tipo}`}
                    data={tratamientos}
                    onChange={(tratamiento, field, value, subField) =>
                      handlePriceChange(material, tipo, tratamiento, field, value, subField)
                    }
                  />
                ))}
              </div>
            ))}
          </div>

          <aside className="lg:col-span-1">
            <AdditivesEditor data={catalog.additives} onChange={handleAdditiveChange} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PriceCatalogEditor;
