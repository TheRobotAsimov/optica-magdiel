import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import lenteService from '../../service/lenteService';
import empleadoService from '../../service/empleadoService';
import ventaService from '../../service/ventaService';
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
  // Estado para manejar la graduacion optica separadamente
  const [graduacion, setGraduacion] = useState({
    od_esf_sign: '+',
    od_esf_val: '',
    od_cil_val: '',
    od_eje_val: '',
    od_add_val: '',
    od_av_1: '',
    od_av_2: '',
    oi_esf_sign: '+',
    oi_esf_val: '',
    oi_cil_val: '',
    oi_eje_val: '',
    oi_add_val: '',
    oi_av_1: '',
    oi_av_2: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [optometristas, setOptometristas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  // Lista de sintomas disponibles para seleccion
  const symptomsList = [
    'ARDOR', 'LAGRIMEO', 'IRRITACION', 'DOLOR', 'COMEZON', 'MOL. SOL.',
    'MOL. AIRE', 'ARENOZO', 'HIPERTENSION', 'DIABETES', 'GLAUCOMA', 'CATARATAS',
    'USO DISP. ELEC.', 'QUIRURGICOS', 'INFECCION', 'FOSFENOS', 'MIODESOPIAS', 'FOTOSENSIBLES'
  ];

  // Estado inicial para los sintomas, todos desmarcados
  const initialSymptomsState = symptomsList.reduce((acc, symptom) => {
    acc[symptom] = false;
    return acc;
  }, {});

  const [symptomsState, setSymptomsState] = useState(initialSymptomsState);

  // Funcion para manejar cambios en la graduacion optica
  const handleGraduacionChange = (e) => {
    const { name, value } = e.target;

    setGraduacion(prev => {
      const newGrad = { ...prev, [name]: value };

      // Mirroring logic from OD to OI
      if (name.startsWith('od_')) {
        const oi_name = name.replace('od_', 'oi_');
        newGrad[oi_name] = value;
      }

      return newGrad;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const optometristasData = await empleadoService.getAllEmpleados();
        const optometristasList = optometristasData.filter(emp => emp.puesto === 'Optometrista');
        setOptometristas(optometristasList);

        const ventasData = await ventaService.getAllVentas();
        setVentas(ventasData);

        if (id) {
          const data = await lenteService.getLenteById(id);
          if (data.fecha_entrega) {
            data.fecha_entrega = new Date(data.fecha_entrega).toISOString().split('T')[0];
          }
          if (data.examen_seguimiento) {
            data.examen_seguimiento = new Date(data.examen_seguimiento).toISOString().split('T')[0];
          }
          setLente(data);

          // Set symptoms state if sintomas is a string
          if (data.sintomas) {
            const selectedSymptoms = data.sintomas.split(', ');
            const newSymptomsState = { ...initialSymptomsState };
            selectedSymptoms.forEach(symptom => {
              if (newSymptomsState[symptom] !== undefined) {
                newSymptomsState[symptom] = true;
              }
            });
            setSymptomsState(newSymptomsState);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Efecto para actualizar los sintomas seleccionados en lente
  useEffect(() => {
    const selectedSymptoms = Object.keys(symptomsState)
      .filter(symptom => symptomsState[symptom])
      .join(', ');

    setLente(prev => ({
      ...prev,
      sintomas: selectedSymptoms
    }));
  }, [symptomsState]);

  // Efecto para sincronizar la graduacion con formData y determinar si es procesado
  useEffect(() => {
    const {
      od_esf_sign, od_esf_val, od_cil_val, od_eje_val, od_add_val, od_av_1, od_av_2,
      oi_esf_sign, oi_esf_val, oi_cil_val, oi_eje_val, oi_add_val, oi_av_1, oi_av_2
    } = graduacion;

    const newOdEsf = od_esf_val ? `${od_esf_sign}${od_esf_val}` : '';
    const newOdCil = od_cil_val ? `-${od_cil_val}` : '';
    const newOiEsf = oi_esf_val ? `${oi_esf_sign}${oi_esf_val}` : '';
    const newOiCil = oi_cil_val ? `-${oi_cil_val}` : '';

    const shouldBeProcesado =
      Math.abs(parseFloat(newOdEsf)) >= 5 ||
      Math.abs(parseFloat(newOdCil)) >= 5 ||
      Math.abs(parseFloat(newOiEsf)) >= 5 ||
      Math.abs(parseFloat(newOiCil)) >= 5;

    setLente(prev => ({
      ...prev,
      od_esf: newOdEsf,
      od_cil: newOdCil,
      od_eje: od_eje_val,
      od_add: od_add_val ? `+${od_add_val}` : '',
      od_av: (od_av_1 || od_av_2) ? `${od_av_1}/${od_av_2}` : '',
      oi_esf: newOiEsf,
      oi_cil: newOiCil,
      oi_eje: oi_eje_val,
      oi_add: oi_add_val ? `+${oi_add_val}` : '',
      oi_av: (oi_av_1 || oi_av_2) ? `${oi_av_1}/${oi_av_2}` : '',
      procesado: shouldBeProcesado ? 'Si' : 'No',
    }));
  }, [graduacion]);

  useEffect(() => {
    const errors = validateLenteForm(lente);
    const hasErrors = Object.values(errors).some((err) => err);
    setIsFormValid(!hasErrors);
  }, [lente, fieldErrors]);

  // Funcion para manejar cambios en los sintomas
  const handleSymptomChange = (e) => {
    const { name, checked } = e.target;
    setSymptomsState(prev => ({ ...prev, [name]: checked }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si el campo es examen de seguimiento, calcular la fecha automaticamente
    if (name === 'examenSeguimientoOption') {
      if (value) {
        const baseDate = new Date(lente.fecha_entrega); // Usar la fecha de entrega como base
        let newDate = new Date(baseDate);

        // Calcular la nueva fecha basada en la opcion seleccionada
        if (value === '6 months') {
          newDate.setMonth(newDate.getMonth() + 6);
        } else if (value === '1 year') {
          newDate.setFullYear(newDate.getFullYear() + 1);
        } else if (value === '2 years') {
          newDate.setFullYear(newDate.getFullYear() + 2);
        }

        // Formatear la fecha a YYYY-MM-DD
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const day = String(newDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        setLente((prev) => ({
          ...prev,
          examen_seguimiento: formattedDate,
        }));
      } else {
        setLente((prev) => ({
          ...prev,
          examen_seguimiento: '',
        }));
      }
    } else {
      setLente((prev) => {
        const newLente = { ...prev, [name]: value };

        if (name === 'material') {
          newLente.tratamiento = '';
          newLente.tipo_de_lente = '';
          newLente.subtipo = '';
        }

        if (name === 'tratamiento') {
          newLente.tipo_de_lente = '';
          newLente.subtipo = '';
        }

        if (name === 'tipo_de_lente') {
          newLente.subtipo = '';
          if (value !== 'Bifocal') {
            newLente.blend = 'No';
          }
        }

        return newLente;
      });

      // Validación en tiempo real
      if (touched[name]) {
        const error = validateLenteField(name, value, lente);
        setFieldErrors(prev => ({ ...prev, [name]: error }));
      }
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
              {/* Seccion de informacion del lente*/}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Lente</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Síntomas</label>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 p-2 border border-gray-200 rounded-lg">
                      {symptomsList.map(symptom => (
                        <label key={symptom} className="flex items-center space-x-2 text-xs font-medium text-gray-600">
                          <input
                            type="checkbox"
                            name={symptom}
                            checked={symptomsState[symptom]}
                            onChange={handleSymptomChange}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>{symptom}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Uso de Lente *</label>
                    <input type="text" name="uso_de_lente" value={lente.uso_de_lente} onChange={handleChange} onBlur={handleBlur} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Folio Venta *</label>
                    <select name="folio" value={lente.folio} onChange={handleChange} onBlur={handleBlur} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Seleccionar Folio Venta</option>
                      {ventas.map(venta => (
                        <option key={venta.folio} value={venta.folio}>Folio: {venta.folio} - {venta.cliente_nombre} {venta.cliente_paterno}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Optometrista *</label>
                    <select name="idoptometrista" value={lente.idoptometrista} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Seleccionar Optometrista</option>
                      {optometristas.map(optometrista => (
                        <option key={optometrista.idempleado} value={optometrista.idempleado}>{optometrista.nombre} {optometrista.paterno}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Examen de Seguimiento</label>
                    <select name="examenSeguimientoOption" value="" onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Seleccionar</option>
                      <option value="6 months">6 meses</option>
                      <option value="1 year">1 año</option>
                      <option value="2 years">2 años</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Armazón *</label>
                    <input type="text" name="armazon" value={lente.armazon} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kit</label>
                    <select name="kit" value={lente.kit} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Sin kit">Sin kit</option>
                        <option value="Completo">Completo</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:col-span-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                      <select name="material" value={lente.material} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccione</option>
                        <option value="CR-39">CR-39</option>
                        <option value="BLUERAY">BLUERAY</option>
                      </select>
                    </div>
                    {lente.material && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento *</label>
                        <select name="tratamiento" value={lente.tratamiento} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Seleccione</option>
                          <option value="AR">AR</option>
                          <option value="Photo AR">Photo AR</option>
                        </select>
                      </div>
                    )}
                    {lente.tratamiento && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Lente *</label>
                        <select name="tipo_de_lente" value={lente.tipo_de_lente} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Seleccione</option>
                          <option value="Monofocal">Monofocal</option>
                          <option value="Bifocal">Bifocal</option>
                          <option value="Progresivo">Progresivo</option>
                        </select>
                      </div>
                    )}
                    {lente.tipo_de_lente && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subtipo</label>
                        <select name="subtipo" value={lente.subtipo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Ninguno</option>
                          <option value="Policarbonato">Policarbonato</option>
                          <option value="Haid index">Haid index</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tinte Color</label>
                      <input type="text" name="tinte_color" value={lente.tinte_color} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    {lente.tinte_color && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tono</label>
                          <select name="tono" value={lente.tono} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">No</option>
                            <option value="Claro">Claro</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Oscuro">Oscuro</option>
                          </select>
                        </div>
                      )}
                      {lente.tono && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Desvanecido</label>
                          <select name="desvanecido" value={lente.desvanecido} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="No">No</option>
                              <option value="Si">Si</option>
                          </select>
                        </div>
                      )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Procesado</label>
                    <select name="procesado" value={lente.procesado} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                        <option value="No">No</option>
                        <option value="Si">Si</option>
                    </select>
                  </div>
                  {lente.tipo_de_lente === 'Bifocal' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blend</label>
                      <select name="blend" value={lente.blend} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="No">No</option>
                        <option value="Si">Si</option>
                      </select>
                    </div>
                  )}
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
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Graduación</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="md:col-span-5 font-bold">Ojo Derecho (OD)</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ESF</label>
                    <div className="flex items-center">
                      <select name="od_esf_sign" value={graduacion.od_esf_sign} onChange={handleGraduacionChange} className="px-2 py-2 border border-gray-300 rounded-l-lg bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        <option value="+">+</option>
                        <option value="-">-</option>
                      </select>
                      <input type="number" step="0.25" name="od_esf_val" value={graduacion.od_esf_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CIL</label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 border-l border-t border-b border-gray-300 rounded-l-lg bg-gray-100">-</span>
                      <input type="number" step="0.25" name="od_cil_val" value={graduacion.od_cil_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">EJE</label>
                    <div className="flex items-center">
                      <input type="number" name="od_eje_val" value={graduacion.od_eje_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      <span className="px-3 py-2 border-r border-t border-b border-gray-300 rounded-r-lg bg-gray-100">°</span>
                    </div>
                  </div>
                  {(lente.tipo_de_lente === 'Bifocal' || lente.tipo_de_lente === 'Progresivo') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ADD</label>
                      <div className="flex items-center">
                        <span className="px-3 py-2 border-l border-t border-b border-gray-300 rounded-l-lg bg-gray-100">+</span>
                        <input type="number" step="0.25" name="od_add_val" value={graduacion.od_add_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AV</label>
                    <div className="flex items-center">
                      <input type="text" name="od_av_1" value={graduacion.od_av_1} onChange={handleGraduacionChange} className="w-full px-3 py-2 border border-gray-300 rounded-l-lg text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      <span className="px-2 py-2 border-t border-b border-gray-300 bg-gray-100">/</span>
                      <input type="text" name="od_av_2" value={graduacion.od_av_2} onChange={handleGraduacionChange} className="w-full px-3 py-2 border border-gray-300 rounded-r-lg text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>

                  <div className="md:col-span-5 font-bold">Ojo Izquierdo (OI)</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ESF</label>
                    <div className="flex items-center">
                      <select name="oi_esf_sign" value={graduacion.oi_esf_sign} onChange={handleGraduacionChange} className="px-2 py-2 border border-gray-300 rounded-l-lg bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        <option value="+">+</option>
                        <option value="-">-</option>
                      </select>
                      <input type="number" step="0.25" name="oi_esf_val" value={graduacion.oi_esf_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CIL</label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 border-l border-t border-b border-gray-300 rounded-l-lg bg-gray-100">-</span>
                      <input type="number" step="0.25" name="oi_cil_val" value={graduacion.oi_cil_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">EJE</label>
                    <div className="flex items-center">
                      <input type="number" name="oi_eje_val" value={graduacion.oi_eje_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      <span className="px-3 py-2 border-r border-t border-b border-gray-300 rounded-r-lg bg-gray-100">°</span>
                    </div>
                  </div>
                  {(lente.tipo_de_lente === 'Bifocal' || lente.tipo_de_lente === 'Progresivo') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ADD</label>
                      <div className="flex items-center">
                        <span className="px-3 py-2 border-l border-t border-b border-gray-300 rounded-l-lg bg-gray-100">+</span>
                        <input type="number" step="0.25" name="oi_add_val" value={graduacion.oi_add_val} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-t border-b border-r border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AV</label>
                    <div className="flex items-center">
                      <input type="text" name="oi_av_1" value={graduacion.oi_av_1} onChange={handleGraduacionChange} className="w-full px-3 py-2 border border-gray-300 rounded-l-lg text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      <span className="px-2 py-2 border-t border-b border-gray-300 bg-gray-100">/</span>
                      <input type="text" name="oi_av_2" value={graduacion.oi_av_2} onChange={handleGraduacionChange} className="w-full px-3 py-2 border border-gray-300 rounded-r-lg text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
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
