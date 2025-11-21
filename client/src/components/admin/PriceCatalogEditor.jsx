import { useState, useEffect } from 'react';
import precioService from '../../service/precioService';
import NavComponent from '../common/NavBar';
import Swal from 'sweetalert2';
import { Save, DollarSign, Tag, Package, Percent, AlertCircle } from 'lucide-react';

const PriceTable = ({ title, data, originalData, onChange }) => {
  const isBifocal = title.includes('Bifocal');
  const headers = ['Tratamiento', 'Precio Base', 'Procesado', 'Policarbonato', 'Haid index'];
  if (isBifocal) {
    headers.push('Blend');
  }

  // Determine color scheme based on material
  const isBlueray = title.includes('BLUERAY');
  const headerGradient = isBlueray 
    ? 'from-purple-600 to-indigo-600' 
    : 'from-blue-600 to-cyan-600';
  const accentColor = isBlueray ? 'purple' : 'blue';

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
      <div className={`bg-gradient-to-r ${headerGradient} px-6 py-4`}>
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <Tag className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              {headers.map((header) => (
                <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Object.entries(data).map(([tratamiento, values]) => {
              const originalValues = originalData[tratamiento];
              const isBaseChanged = values.base !== originalValues.base;
              const isProcesadoChanged = values.procesado !== originalValues.procesado;
              const isPoliChanged = values.subtipo.Policarbonato !== originalValues.subtipo.Policarbonato;
              const isHaidChanged = values.subtipo['Haid index'] !== originalValues.subtipo['Haid index'];
              const isBlendChanged = isBifocal && values.blend !== originalValues.blend;

              return (
                <tr key={tratamiento} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-${accentColor}-100 text-${accentColor}-800`}>
                      {tratamiento}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`px-3 py-2.5 border-2 rounded-l-xl bg-gray-50 text-gray-600 font-semibold ${isBaseChanged ? 'border-yellow-400' : 'border-gray-200'}`}>$</span>
                      <input
                        type="number"
                        value={values.base}
                        onChange={(e) => onChange(tratamiento, 'base', e.target.value)}
                        className={`w-24 px-3 py-2.5 border-2 border-l-0 rounded-r-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium ${
                          isBaseChanged 
                            ? 'border-yellow-400 bg-yellow-50 focus:ring-yellow-200' 
                            : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                        }`}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`px-3 py-2.5 border-2 rounded-l-xl bg-gray-50 text-gray-600 font-semibold ${isProcesadoChanged ? 'border-yellow-400' : 'border-gray-200'}`}>+</span>
                      <input
                        type="number"
                        value={values.procesado}
                        onChange={(e) => onChange(tratamiento, 'procesado', e.target.value)}
                        className={`w-20 px-3 py-2.5 border-2 border-l-0 rounded-r-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium ${
                          isProcesadoChanged 
                            ? 'border-yellow-400 bg-yellow-50 focus:ring-yellow-200' 
                            : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                        }`}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`px-3 py-2.5 border-2 rounded-l-xl bg-gray-50 text-gray-600 font-semibold ${isPoliChanged ? 'border-yellow-400' : 'border-gray-200'}`}>+</span>
                      <input
                        type="number"
                        value={values.subtipo.Policarbonato}
                        onChange={(e) => onChange(tratamiento, 'subtipo', e.target.value, 'Policarbonato')}
                        className={`w-20 px-3 py-2.5 border-2 border-l-0 rounded-r-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium ${
                          isPoliChanged 
                            ? 'border-yellow-400 bg-yellow-50 focus:ring-yellow-200' 
                            : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                        }`}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`px-3 py-2.5 border-2 rounded-l-xl bg-gray-50 text-gray-600 font-semibold ${isHaidChanged ? 'border-yellow-400' : 'border-gray-200'}`}>+</span>
                      <input
                        type="number"
                        value={values.subtipo['Haid index']}
                        onChange={(e) => onChange(tratamiento, 'subtipo', e.target.value, 'Haid index')}
                        className={`w-20 px-3 py-2.5 border-2 border-l-0 rounded-r-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium ${
                          isHaidChanged 
                            ? 'border-yellow-400 bg-yellow-50 focus:ring-yellow-200' 
                            : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                        }`}
                      />
                    </div>
                  </td>
                  {isBifocal && (
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`px-3 py-2.5 border-2 rounded-l-xl bg-gray-50 text-gray-600 font-semibold ${isBlendChanged ? 'border-yellow-400' : 'border-gray-200'}`}>+</span>
                        <input
                          type="number"
                          value={values.blend}
                          onChange={(e) => onChange(tratamiento, 'blend', e.target.value)}
                          className={`w-20 px-3 py-2.5 border-2 border-l-0 rounded-r-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium ${
                            isBlendChanged 
                              ? 'border-yellow-400 bg-yellow-50 focus:ring-yellow-200' 
                              : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                          }`}
                        />
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdditivesEditor = ({ data, originalData, onChange }) => {
  const isKitChanged = data.kit !== originalData.kit;
  const isTinteChanged = data.tinte !== originalData.tinte;
  const isInapamChanged = data.inapam_discount !== originalData.inapam_discount;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 sticky top-8">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <Package className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Extras</h2>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Kit */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
            <Package className="h-4 w-4 text-green-600" />
            <span>Kit</span>
          </label>
          <div className="flex items-center">
            <span className={`px-3 py-2.5 border-2 rounded-l-xl bg-white text-gray-600 font-semibold ${isKitChanged ? 'border-yellow-400' : 'border-gray-200'}`}>+</span>
            <input
              type="number"
              value={data.kit}
              onChange={(e) => onChange('kit', e.target.value)}
              className={`w-full px-4 py-2.5 border-2 border-l-0 rounded-r-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium ${
                isKitChanged 
                  ? 'border-yellow-400 bg-yellow-50 focus:ring-yellow-200' 
                  : 'border-gray-200 focus:ring-yellow-200 focus:border-yellow-400'
              }`}
            />
          </div>
        </div>

        {/* Tinte */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
            <Tag className="h-4 w-4 text-amber-600" />
            <span>Tinte</span>
          </label>
          <div className="flex items-center">
            <span className={`px-3 py-2.5 border-2 rounded-l-xl bg-white text-gray-600 font-semibold ${isTinteChanged ? 'border-yellow-400' : 'border-gray-200'}`}>+</span>
            <input
              type="number"
              value={data.tinte}
              onChange={(e) => onChange('tinte', e.target.value)}
              className={`w-full px-4 py-2.5 border-2 border-l-0 rounded-r-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium ${
                isTinteChanged 
                  ? 'border-yellow-400 bg-yellow-50 focus:ring-yellow-200' 
                  : 'border-gray-200 focus:ring-amber-200 focus:border-amber-400'
              }`}
            />
          </div>
        </div>

        {/* INAPAM */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
            <Percent className="h-4 w-4 text-blue-600" />
            <span>INAPAM</span>
          </label>
          <div className="flex items-center">
            <input
              type="number"
              value={data.inapam_discount}
              onChange={(e) => onChange('inapam_discount', e.target.value)}
              className={`w-full px-4 py-2.5 border-2 rounded-l-xl focus:outline-none focus:ring-2 transition-all duration-200 font-medium ${
                isInapamChanged 
                  ? 'border-yellow-400 bg-yellow-50 focus:ring-yellow-200' 
                  : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
              }`}
            />
            <span className={`px-3 py-2.5 border-2 border-l-0 rounded-r-xl bg-white text-gray-600 font-semibold ${isInapamChanged ? 'border-yellow-400' : 'border-gray-200'}`}>%</span>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">Nota:</span> Los campos con borde amarillo indican cambios sin guardar. Haz clic en "Guardar Cambios" para aplicarlos.
          </p>
        </div>
      </div>
    </div>
  );
};

const PriceCatalogEditor = () => {
  const [catalog, setCatalog] = useState(null);
  const [originalCatalog, setOriginalCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await precioService.getPriceCatalog();
        setCatalog(data);
        setOriginalCatalog(JSON.parse(JSON.stringify(data)));
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
      setOriginalCatalog(JSON.parse(JSON.stringify(catalog)));
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <NavComponent />
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <span className="text-xl font-medium text-gray-600">Cargando catálogo...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <NavComponent />
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-900">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!catalog || !originalCatalog) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <NavComponent />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-4xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Catálogo de Precios</h1>
                  <p className="text-blue-100 text-sm mt-1">Administra los precios de lentes y tratamientos</p>
                </div>
              </div>
              <button
                onClick={handleSaveChanges}
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 disabled:bg-gray-200 disabled:text-gray-400 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Price Tables */}
          <div className="lg:col-span-3 space-y-6">
            {Object.entries(catalog.priceCatalog).map(([material, tipos]) => (
              <div key={material}>
                {Object.entries(tipos).map(([tipo, tratamientos]) => (
                  <PriceTable
                    key={`${material}-${tipo}`}
                    title={`${material} - ${tipo}`}
                    data={tratamientos}
                    originalData={originalCatalog.priceCatalog[material][tipo]}
                    onChange={(tratamiento, field, value, subField) =>
                      handlePriceChange(material, tipo, tratamiento, field, value, subField)
                    }
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Extras Sidebar */}
          <aside className="lg:col-span-1">
            <AdditivesEditor 
              data={catalog.additives} 
              originalData={originalCatalog.additives} 
              onChange={handleAdditiveChange} 
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PriceCatalogEditor;