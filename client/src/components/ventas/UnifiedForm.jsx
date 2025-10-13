import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import ventaService from '../../service/ventaService';
import clientService from '../../service/clientService';
import lenteService from '../../service/lenteService';
import empleadoService from '../../service/empleadoService';
import NavComponent from '../common/NavBar';
import { Save, ArrowLeft, ShoppingCart } from 'lucide-react';

const UnifiedForm = () => {
  const [formData, setFormData] = useState({
    // Venta fields
    folio: '',
    idasesor: '',
    fecha: new Date().toISOString().slice(0, 10),
    tipo: 'Contado',
    enganche: '',
    total: '',
    observaciones: '',
    estatus: 'Pendiente',
    cant_pagos: '',
    imagen_contrato: '',
    imagen_cobranza: '',
    // Cliente fields
    nombre: '',
    paterno: '',
    materno: '',
    domicilio1: '',
    domicilio2: '',
    telefono1: '',
    telefono2: '',
    edad: '',
    sexo: '',
    // Lente fields
    sintomas: '',
    idoptometrista: '',
    uso_de_lente: '',
    examen_seguimiento: '',
    armazon: '',
    material: 'CR-39',
    tratamiento: 'Monofocal',
    tinte_color: '',
    tono: '',
    desvanecido: '',
    tipo_de_lente: 'AR',
    blend: 'No',
    extra: '',
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
    kit: 'Sin kit',
    fecha_entrega: '',
  });
  const [asesores, setAsesores] = useState([]);
  const [optometristas, setOptometristas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ====== Price matrix based on your criteria ======
  // Keys match the select values: material: "CR-39" or "BLUERAY"
  const priceMatrix = {
    'CR-39': {
      'Monofocal': {
        AR: { base: 1500, extras: { Procesado: 200, Policarbonato: 500, 'Haid index': 300 }, blend: 0 },
        PH: { base: 2100, extras: { Procesado: 300, Policarbonato: 900, 'Haid index': 300 }, blend: 0 },
      },
      'Bifocal FT': {
        AR: { base: 2000, extras: { Procesado: 500, Policarbonato: 500, 'Haid index': 300 }, blend: 300 },
        PH: { base: 2500, extras: { Procesado: 700, Policarbonato: 900, 'Haid index': 300 }, blend: 300 },
      },
      'Progresivo': {
        AR: { base: 2600, extras: { Procesado: 600, Policarbonato: 700, 'Haid index': 300 }, blend: 0 },
        PH: { base: 3500, extras: { Procesado: 900, Policarbonato: 1300, 'Haid index': 300 }, blend: 0 },
      },
    },
    'BLUERAY': { // uso mayúsculas porque en tu select usas "BLUERAY"
      'Monofocal': {
        AR: { base: 1900, extras: { Procesado: 500, Policarbonato: 700, 'Haid index': 300 }, blend: 0 },
        PH: { base: 2600, extras: { Procesado: 600, Policarbonato: 900, 'Haid index': 300 }, blend: 0 },
      },
      'Bifocal FT': {
        AR: { base: 2500, extras: { Procesado: 600, Policarbonato: 700, 'Haid index': 300 }, blend: 300 },
        PH: { base: 3100, extras: { Procesado: 700, Policarbonato: 1000, 'Haid index': 300 }, blend: 300 },
      },
      'Progresivo': {
        AR: { base: 3000, extras: { Procesado: 700, Policarbonato: 900, 'Haid index': 300 }, blend: 0 },
        PH: { base: 4300, extras: { Procesado: 1000, Policarbonato: 1300, 'Haid index': 500 }, blend: 0 }, // Haid index = 500 en tu tabla para este caso
      },
    },
  };
  // ==================================================

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [asesoresData, optometristasData] = await Promise.all([
          empleadoService.getAllEmpleados(),
          empleadoService.getAllEmpleados(), // Assuming optometristas are also employees
        ]);
        setAsesores(asesoresData);
        setOptometristas(optometristasData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [suggestedTotal, setSuggestedTotal] = useState(null);


  // Recalculate total whenever relevant lens fields change
  useEffect(() => {
    const calculateTotal = () => {
      const matKey = formData.material; // "CR-39" or "BLUERAY"
      const tratKey = formData.tratamiento; // "Monofocal", "Bifocal FT", "Progresivo"
      // handle "Photo AR" as AR
      const tipoKey = formData.tipo_de_lente === 'Photo AR' ? 'AR' : formData.tipo_de_lente; // "AR" or "PH"

      if (!matKey || !tratKey || !tipoKey) {
        setFormData(prev => ({ ...prev, total: '' }));
        return;
      }

      const mat = priceMatrix[matKey];
      if (!mat) {
        setFormData(prev => ({ ...prev, total: '' }));
        return;
      }
      const trat = mat[tratKey];
      if (!trat) {
        setFormData(prev => ({ ...prev, total: '' }));
        return;
      }
      const tipo = trat[tipoKey];
      if (!tipo) {
        setFormData(prev => ({ ...prev, total: '' }));
        return;
      }

      let totalCalc = Number(tipo.base || 0);

      // Extra (Procesado | Policarbonato | Haid index) -> UI has single select "extra"
      if (formData.extra && tipo.extras) {
        const extraValue = tipo.extras[formData.extra] || 0;
        totalCalc += Number(extraValue);
      }

      // Blend add (aplica en Bifocal FT según tu tabla)
      if (tratKey === 'Bifocal FT' && formData.blend === 'Si') {
        totalCalc += Number(tipo.blend || 0);
      }

      // Guardamos la sugerencia, no escribimos en formData.total
      setSuggestedTotal(totalCalc);
    };

    calculateTotal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.material, formData.tratamiento, formData.tipo_de_lente, formData.extra, formData.blend]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 2. Create Cliente
      const newClient = await clientService.createClient({
        nombre: formData.nombre,
        paterno: formData.paterno,
        materno: formData.materno,
        domicilio1: formData.domicilio1,
        domicilio2: formData.domicilio2,
        telefono1: formData.telefono1,
        telefono2: formData.telefono2,
        edad: formData.edad,
        sexo: formData.sexo,
        map_url: ''
      });

      const finalTotal = formData.total ? parseFloat(formData.total) : (suggestedTotal || 0);

      // 1. Create Venta
      await ventaService.createVenta({
        folio: formData.folio,
        idasesor: parseInt(formData.idasesor),
        idcliente: newClient.id,
        fecha: formData.fecha,
        tipo: formData.tipo,
        enganche: parseFloat(formData.enganche) || 0,
        total: finalTotal,
        observaciones: formData.observaciones,
        estatus: formData.estatus,
        cant_pagos: parseInt(formData.cant_pagos) || 0,
        imagen_contrato: formData.imagen_contrato,
        imagen_cobranza: formData.imagen_cobranza,
      });


      // 3. Create Lente
      await lenteService.createLente({
        idoptometrista: parseInt(formData.idoptometrista, 10),
        folio: formData.folio, // Use the folio from the form
        sintomas: formData.sintomas,
        uso_de_lente: formData.uso_de_lente,
        armazon: formData.armazon,
        material: formData.material,
        tratamiento: formData.tratamiento,
        tipo_de_lente: formData.tipo_de_lente,
        kit: formData.kit,
        tinte_color: formData.tinte_color,
        tono: formData.tono === '' ? null : formData.tono,
        desvanecido: formData.desvanecido,
        blend: formData.blend,
        extra: formData.extra,
        fecha_entrega: formData.fecha_entrega,
        examen_seguimiento: formData.examen_seguimiento,
        estatus: 'Pendiente',
        od_esf: formData.od_esf ? parseFloat(formData.od_esf) : null,
        od_cil: formData.od_cil ? parseFloat(formData.od_cil) : null,
        od_eje: formData.od_eje ? parseInt(formData.od_eje, 10) : null,
        od_add: formData.od_add ? parseFloat(formData.od_add) : null,
        od_av: formData.od_av,
        oi_esf: formData.oi_esf ? parseFloat(formData.oi_esf) : null,
        oi_cil: formData.oi_cil ? parseFloat(formData.oi_cil) : null,
        oi_eje: formData.oi_eje ? parseInt(formData.oi_eje, 10) : null,
        oi_add: formData.oi_add ? parseFloat(formData.oi_add) : null,
        oi_av: formData.oi_av,
      });

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
                <h1 className="text-2xl font-bold text-blue-700">NUEVA VENTA</h1>
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
              {/* Venta Fields */}              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Venta</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Folio *</label>
                    <input type="text" name="folio" value={formData.folio} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Asesor *</label>
                    <select name="idasesor" value={formData.idasesor} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Seleccionar Asesor</option>
                      {asesores.map(asesor => (
                        <option key={asesor.idempleado} value={asesor.idempleado}>{asesor.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                    <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Cliente Fields */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Paterno *</label>
                    <input type="text" name="paterno" value={formData.paterno} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
                    <input type="text" name="materno" value={formData.materno} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                    <input type="number" name="edad" value={formData.edad} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                    <select name="sexo" value={formData.sexo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domicilio 1 *</label>
                    <textarea name="domicilio1" value={formData.domicilio1} onChange={handleChange} required rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domicilio 2</label>
                    <input type="text" name="domicilio2" value={formData.domicilio2} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono 1 *</label>
                    <input type="tel" name="telefono1" value={formData.telefono1} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono 2</label>
                    <input type="tel" name="telefono2" value={formData.telefono2} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Lente Fields */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Lente</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Síntomas</label>
                    <input type="text" name="sintomas" value={formData.sintomas} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Optometrista *</label>
                    <select name="idoptometrista" value={formData.idoptometrista} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Seleccionar Optometrista</option>
                      {optometristas.map(optometrista => (
                        <option key={optometrista.idempleado} value={optometrista.idempleado}>{optometrista.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Uso de Lente *</label>
                    <input type="text" name="uso_de_lente" value={formData.uso_de_lente} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Examen de Seguimiento</label>
                    <input type="date" name="examen_seguimiento" value={formData.examen_seguimiento} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Armazón *</label>
                    <input type="text" name="armazon" value={formData.armazon} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                    <select name="material" value={formData.material} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="CR-39">CR-39</option>
                      <option value="BLUERAY">BLUERAY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento *</label>
                    <select name="tratamiento" value={formData.tratamiento} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="Monofocal">Monofocal</option>
                      <option value="Bifocal FT">Bifocal FT</option>
                      <option value="Progresivo">Progresivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tinte Color</label>
                    <input type="text" name="tinte_color" value={formData.tinte_color} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tono</label>
                    <select name="tono" value={formData.tono} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">No</option>
                      <option value="Claro">Claro</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Oscuro">Oscuro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Desvanecido</label>
                    <input type="text" name="desvanecido" value={formData.desvanecido} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Lente *</label>
                    <select name="tipo_de_lente" value={formData.tipo_de_lente} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="AR">AR</option>
                      <option value="Photo AR">Photo AR</option>
                      <option value="PH">PH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blend</label>
                    <select name="blend" value={formData.blend} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="No">No</option>
                      <option value="Si">Si</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Extra</label>
                    <select name="extra" value={formData.extra} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value=""></option>
                      <option value="Procesado">Procesado</option>
                      <option value="Policarbonato">Policarbonato</option>
                      <option value="Haid index">Haid index</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kit de limpieza *</label>
                    <select name="kit" value={formData.kit} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="Sin kit">Sin kit</option>
                      <option value="Completo">Completo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Graduacion Fields */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Graduación</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="md:col-span-5 font-bold">Ojo Derecho (OD)</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ESF</label>
                    <input type="number" step="0.01" name="od_esf" value={formData.od_esf} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CIL</label>
                    <input type="number" step="0.01" name="od_cil" value={formData.od_cil} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">EJE</label>
                    <input type="number" name="od_eje" value={formData.od_eje} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ADD</label>
                    <input type="number" step="0.01" name="od_add" value={formData.od_add} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AV</label>
                    <input type="text" name="od_av" value={formData.od_av} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>

                  <div className="md:col-span-5 font-bold">Ojo Izquierdo (OI)</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ESF</label>
                    <input type="number" step="0.01" name="oi_esf" value={formData.oi_esf} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CIL</label>
                    <input type="number" step="0.01" name="oi_cil" value={formData.oi_cil} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">EJE</label>
                    <input type="number" name="oi_eje" value={formData.oi_eje} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ADD</label>
                    <input type="number" step="0.01" name="oi_add" value={formData.oi_add} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AV</label>
                    <input type="text" name="oi_av" value={formData.oi_av} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Venta Fields (continued) */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles Finales de la Venta</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pago *</label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="Contado">Contado</option>
                      <option value="Credito">Crédito</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total *</label>
                    <input
                      type="number"
                      name="total"
                      value={formData.total}
                      onChange={handleChange}
                      placeholder={suggestedTotal !== null ? String(suggestedTotal) : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enganche</label>
                    <input type="number" name="enganche" value={formData.enganche} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Entrega *</label>
                    <input type="date" name="fecha_entrega" value={formData.fecha_entrega} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                    <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg"></textarea>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                <button type="button" onClick={() => navigate('/ventas')} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Guardando...' : 'Crear Venta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedForm;
