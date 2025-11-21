import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import lenteService from '../../service/lenteService';
import empleadoService from '../../service/empleadoService';
import ventaService from '../../service/ventaService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { Save, ArrowLeft, Eye, Glasses, Calendar, ClipboardList, Settings, AlertCircle } from 'lucide-react';
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
  const [examenSeguimientoOption, setExamenSeguimientoOption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [optometristas, setOptometristas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const symptomsList = [
    'ARDOR', 'LAGRIMEO', 'IRRITACION', 'DOLOR', 'COMEZON', 'MOL. SOL.',
    'MOL. AIRE', 'ARENOZO', 'HIPERTENSION', 'DIABETES', 'GLAUCOMA', 'CATARATAS',
    'USO DISP. ELEC.', 'QUIRURGICOS', 'INFECCION', 'FOSFENOS', 'MIODESOPIAS', 'FOTOSENSIBLES'
  ];

  const initialSymptomsState = symptomsList.reduce((acc, symptom) => {
    acc[symptom] = false;
    return acc;
  }, {});

  const [symptomsState, setSymptomsState] = useState(initialSymptomsState);

  const handleGraduacionChange = (e) => {
    const { name, value } = e.target;

    setGraduacion(prev => {
      const newGrad = { ...prev, [name]: value };

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

           const newGraduacion = { ...graduacion };
           if (data.od_esf) {
             if (data.od_esf.startsWith('-')) {
               newGraduacion.od_esf_sign = '-';
               newGraduacion.od_esf_val = data.od_esf.substring(1);
             } else {
               newGraduacion.od_esf_sign = '+';
               newGraduacion.od_esf_val = data.od_esf.startsWith('+') ? data.od_esf.substring(1) : data.od_esf;
             }
           }
           if (data.od_cil && data.od_cil.startsWith('-')) {
             newGraduacion.od_cil_val = data.od_cil.substring(1);
           }
           newGraduacion.od_eje_val = data.od_eje || '';
           if (data.od_add) {
             newGraduacion.od_add_val = data.od_add.startsWith('+') ? data.od_add.substring(1) : data.od_add;
           }
           if (data.od_av) {
             const parts = data.od_av.split('/');
             newGraduacion.od_av_1 = parts[0] || '';
             newGraduacion.od_av_2 = parts[1] || '';
           }
           if (data.oi_esf) {
             if (data.oi_esf.startsWith('-')) {
               newGraduacion.oi_esf_sign = '-';
               newGraduacion.oi_esf_val = data.oi_esf.substring(1);
             } else {
               newGraduacion.oi_esf_sign = '+';
               newGraduacion.oi_esf_val = data.oi_esf.startsWith('+') ? data.oi_esf.substring(1) : data.oi_esf;
             }
           }
           if (data.oi_cil && data.oi_cil.startsWith('-')) {
             newGraduacion.oi_cil_val = data.oi_cil.substring(1);
           }
           newGraduacion.oi_eje_val = data.oi_eje || '';
           if (data.oi_add) {
             newGraduacion.oi_add_val = data.oi_add.startsWith('+') ? data.oi_add.substring(1) : data.oi_add;
           }
           if (data.oi_av) {
             const parts = data.oi_av.split('/');
             newGraduacion.oi_av_1 = parts[0] || '';
             newGraduacion.oi_av_2 = parts[1] || '';
           }
           setGraduacion(newGraduacion);

           if (data.examen_seguimiento) {
             const today = new Date();
             const examDate = new Date(data.examen_seguimiento);
             const diffTime = examDate.getTime() - today.getTime();
             const diffDays = diffTime / (1000 * 3600 * 24);
             const diffMonths = diffDays / 30.44;
             if (Math.abs(diffMonths - 6) < 1) {
               setExamenSeguimientoOption('6 months');
             } else if (Math.abs(diffMonths - 12) < 1) {
               setExamenSeguimientoOption('1 year');
             } else if (Math.abs(diffMonths - 24) < 1) {
               setExamenSeguimientoOption('2 years');
             } else {
               setExamenSeguimientoOption('');
             }
           }

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

  useEffect(() => {
    const selectedSymptoms = Object.keys(symptomsState)
      .filter(symptom => symptomsState[symptom])
      .join(', ');

    setLente(prev => ({
      ...prev,
      sintomas: selectedSymptoms
    }));
  }, [symptomsState]);

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

  const handleSymptomChange = (e) => {
    const { name, checked } = e.target;
    setSymptomsState(prev => ({ ...prev, [name]: checked }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'examenSeguimientoOption') {
      setExamenSeguimientoOption(value);
      if (value) {
        const baseDate = new Date();
        let newDate = new Date(baseDate);

        if (value === '6 months') {
          newDate.setMonth(newDate.getMonth() + 6);
        } else if (value === '1 year') {
          newDate.setFullYear(newDate.getFullYear() + 1);
        } else if (value === '2 years') {
          newDate.setFullYear(newDate.getFullYear() + 2);
        }

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

    let errorField = name;
    if (name.includes('_val') || name.includes('_sign') || name.includes('_1') || name.includes('_2')) {
      errorField = name.replace(/_val|_sign|_1|_2/, '');
    }

    setFieldErrors(prev => ({ ...prev, [errorField]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateLenteForm(lente);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      const lenteToSubmit = { ...lente };
      if (!lenteToSubmit.tono) {
        lenteToSubmit.tono = null;
      }
      if (!lenteToSubmit.od_esf) {
        lenteToSubmit.od_esf = null;
      }
      if (!lenteToSubmit.od_cil) {
        lenteToSubmit.od_cil = null;
      }
      if (!lenteToSubmit.od_eje) {
        lenteToSubmit.od_eje = null;
      }
      if (!lenteToSubmit.od_add) {
        lenteToSubmit.od_add = null;
      }
      if (!lenteToSubmit.oi_esf) {
        lenteToSubmit.oi_esf = null;
      }
      if (!lenteToSubmit.oi_cil) {
        lenteToSubmit.oi_cil = null;
      }
      if (!lenteToSubmit.oi_eje) {
        lenteToSubmit.oi_eje = null;
      }
      if (!lenteToSubmit.oi_add) {
        lenteToSubmit.oi_add = null;
      }
      if (!lenteToSubmit.subtipo) {
        lenteToSubmit.subtipo = null;
      }

      if (id) {
        await lenteService.updateLente(id, lenteToSubmit);
      } else {
        await lenteService.createLente(lenteToSubmit);
      }
      navigate('/lentes');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <NavComponent />
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Glasses className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {id ? 'Editar Lente' : 'Nuevo Lente'}
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    {id ? 'Actualiza la información del lente' : 'Registra un nuevo lente en el sistema'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/lentes')}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Lens Information Section */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Información del Lente</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Symptoms */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Síntomas</label>
                      <div className="grid grid-cols-3 gap-x-4 gap-y-3 p-4 border-2 border-gray-200 rounded-xl">
                        {symptomsList.map(symptom => (
                          <label key={symptom} className="flex items-center space-x-2 text-xs font-medium text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
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

                    {/* Uso de Lente */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Uso de Lente <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="uso_de_lente" 
                        value={lente.uso_de_lente} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        required 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.uso_de_lente 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} 
                      />
                      {fieldErrors.uso_de_lente && <p className="mt-2 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{fieldErrors.uso_de_lente}</p>}
                    </div>

                    {/* Folio Venta */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Folio Venta <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="folio" 
                        value={lente.folio} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        required 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.folio 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}
                      >
                        <option value="">Seleccionar Folio Venta</option>
                        {ventas.map(venta => (
                          <option key={venta.folio} value={venta.folio}>Folio: {venta.folio} - {venta.cliente_nombre} {venta.cliente_paterno}</option>
                        ))}
                      </select>
                      {fieldErrors.folio && <p className="mt-2 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{fieldErrors.folio}</p>}
                    </div>

                    {/* Optometrista */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Optometrista <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="idoptometrista" 
                        value={lente.idoptometrista} 
                        onChange={handleChange} 
                        required 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.idoptometrista 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`}
                      >
                        <option value="">Seleccionar Optometrista</option>
                        {optometristas.map(optometrista => (
                          <option key={optometrista.idempleado} value={optometrista.idempleado}>{optometrista.nombre} {optometrista.paterno}</option>
                        ))}
                      </select>
                      {fieldErrors.idoptometrista && <p className="mt-2 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{fieldErrors.idoptometrista}</p>}
                    </div>

                    {/* Examen de Seguimiento */}
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>Examen de Seguimiento</span>
                      </label>
                      <select 
                        name="examenSeguimientoOption" 
                        value={examenSeguimientoOption} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                      >
                        <option value="">Seleccionar</option>
                        <option value="6 months">6 meses</option>
                        <option value="1 year">1 año</option>
                        <option value="2 years">2 años</option>
                      </select>
                    </div>

                    {/* Armazón */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Armazón <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="armazon" 
                        value={lente.armazon} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        required 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.armazon 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} 
                      />
                      {fieldErrors.armazon && <p className="mt-2 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{fieldErrors.armazon}</p>}
                    </div>

                    {/* Kit */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Kit</label>
                      <select 
                        name="kit" 
                        value={lente.kit} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                      >
                        <option value="Sin kit">Sin kit</option>
                        <option value="Completo">Completo</option>
                      </select>
                    </div>

                    {/* Material/Treatment Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:col-span-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Material <span className="text-red-500">*</span>
                        </label>
                        <select 
                          name="material" 
                          value={lente.material} 
                          onChange={handleChange} 
                          onBlur={handleBlur} 
                          required 
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                            fieldErrors.material 
                              ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                              : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                          }`}
                        >
                          <option value="">Seleccione</option>
                          <option value="CR-39">CR-39</option>
                          <option value="BLUERAY">BLUERAY</option>
                        </select>
                        {fieldErrors.material && <p className="mt-2 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{fieldErrors.material}</p>}
                      </div>

                      {lente.material && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tratamiento <span className="text-red-500">*</span>
                          </label>
                          <select 
                            name="tratamiento" 
                            value={lente.tratamiento} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            required 
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                              fieldErrors.tratamiento 
                                ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                                : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                            }`}
                          >
                            <option value="">Seleccione</option>
                            <option value="AR">AR</option>
                            <option value="Photo AR">Photo AR</option>
                          </select>
                          {fieldErrors.tratamiento && <p className="mt-2 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{fieldErrors.tratamiento}</p>}
                        </div>
                      )}

                      {lente.tratamiento && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tipo de Lente <span className="text-red-500">*</span>
                          </label>
                          <select 
                            name="tipo_de_lente" 
                            value={lente.tipo_de_lente} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            required 
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                              fieldErrors.tipo_de_lente 
                                ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                                : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                            }`}
                          >
                            <option value="">Seleccione</option>
                            <option value="Monofocal">Monofocal</option>
                            <option value="Bifocal">Bifocal</option>
                            <option value="Progresivo">Progresivo</option>
                          </select>
                          {fieldErrors.tipo_de_lente && <p className="mt-2 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{fieldErrors.tipo_de_lente}</p>}
                        </div>
                      )}

                      {lente.tipo_de_lente && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Subtipo</label>
                          <select 
                            name="subtipo" 
                            value={lente.subtipo} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                          >
                            <option value="">Ninguno</option>
                            <option value="Policarbonato">Policarbonato</option>
                            <option value="Haid index">Haid index</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Tinte Color Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tinte Color</label>
                        <input 
                          type="text" 
                          name="tinte_color" 
                          value={lente.tinte_color} 
                          onChange={handleChange} 
                          onBlur={handleBlur} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200" 
                        />
                      </div>

                      {lente.tinte_color && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Tono</label>
                          <select 
                            name="tono" 
                            value={lente.tono} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                          >
                            <option value="">No</option>
                            <option value="Claro">Claro</option>
                            <option value="Intermedio">Intermedio</option>
                            <option value="Oscuro">Oscuro</option>
                          </select>
                        </div>
                      )}

                      {lente.tono && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Desvanecido</label>
                          <select 
                            name="desvanecido" 
                            value={lente.desvanecido} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                          >
                            <option value="No">No</option>
                            <option value="Si">Si</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Procesado */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Procesado</label>
                      <select 
                        name="procesado" 
                        value={lente.procesado} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed transition-all duration-200"
                      >
                        <option value="No">No</option>
                        <option value="Si">Si</option>
                      </select>
                    </div>

                    {/* Blend (Conditional) */}
                    {lente.tipo_de_lente === 'Bifocal' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Blend</label>
                        <select 
                          name="blend" 
                          value={lente.blend} 
                          onChange={handleChange} 
                          onBlur={handleBlur} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                        >
                          <option value="No">No</option>
                          <option value="Si">Si</option>
                        </select>
                      </div>
                    )}

                    {/* Fecha de Entrega */}
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>Fecha de Entrega</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="date" 
                        name="fecha_entrega" 
                        value={lente.fecha_entrega} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        required 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                          fieldErrors.fecha_entrega 
                            ? 'border-red-500 focus:ring-red-100 bg-red-50' 
                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
                        }`} 
                      />
                      {fieldErrors.fecha_entrega && <p className="mt-2 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{fieldErrors.fecha_entrega}</p>}
                    </div>

                    {/* Estatus */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Estatus <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="estatus" 
                        value={lente.estatus} 
                        onChange={handleChange} 
                        onBlur={handleBlur} 
                        required 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Entregado">Entregado</option>
                        <option value="No entregado">No entregado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graduation Section */}
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Graduación</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Right Eye (OD) */}
                    <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-sm">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="bg-indigo-100 p-1.5 rounded-lg">
                          <Eye className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span className="font-bold text-gray-900">Ojo Derecho (OD)</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {/* ESF */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">ESF</label>
                          <div className="flex">
                            <select 
                              name="od_esf_sign" 
                              value={graduacion.od_esf_sign} 
                              onChange={handleGraduacionChange} 
                              onBlur={handleBlur} 
                              className={`px-2 py-2.5 border-2 rounded-l-lg bg-gray-50 focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.od_esf ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                              }`}
                            >
                              <option value="+">+</option>
                              <option value="-">-</option>
                            </select>
                            <input 
                              type="number" 
                              step="0.25" 
                              name="od_esf_val" 
                              value={graduacion.od_esf_val} 
                              onChange={handleGraduacionChange} 
                              onBlur={handleBlur} 
                              className={`w-full px-3 py-2.5 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.od_esf ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                              }`} 
                            />
                          </div>
                          {fieldErrors.od_esf && <p className="mt-1 text-xs text-red-600">{fieldErrors.od_esf}</p>}
                        </div>

                        {/* CIL */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">CIL</label>
                          <div className="flex">
                            <span className={`px-3 py-2.5 border-2 rounded-l-lg bg-gray-50 text-gray-600 font-medium ${
                              fieldErrors.od_cil ? 'border-red-500' : 'border-gray-200'
                            }`}>-</span>
                            <input 
                              type="number" 
                              step="0.25" 
                              name="od_cil_val" 
                              value={graduacion.od_cil_val} 
                              onChange={handleGraduacionChange} 
                              onBlur={handleBlur} 
                              className={`w-full px-3 py-2.5 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.od_cil ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                              }`} 
                            />
                          </div>
                          {fieldErrors.od_cil && <p className="mt-1 text-xs text-red-600">{fieldErrors.od_cil}</p>}
                        </div>

                        {/* EJE */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">EJE</label>
                          <div className="flex">
                            <input 
                              type="number" 
                              name="od_eje_val" 
                              value={graduacion.od_eje_val} 
                              onChange={handleGraduacionChange} 
                              onBlur={handleBlur} 
                              className={`w-full px-3 py-2.5 border-2 rounded-l-lg focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.od_eje ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                              }`} 
                            />
                            <span className={`px-3 py-2.5 border-2 border-l-0 rounded-r-lg bg-gray-50 text-gray-600 font-medium ${
                              fieldErrors.od_eje ? 'border-red-500' : 'border-gray-200'
                            }`}>°</span>
                          </div>
                          {fieldErrors.od_eje && <p className="mt-1 text-xs text-red-600">{fieldErrors.od_eje}</p>}
                        </div>

                        {/* ADD (Conditional) */}
                        {(lente.tipo_de_lente === 'Bifocal' || lente.tipo_de_lente === 'Progresivo') && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">ADD</label>
                            <div className="flex">
                              <span className={`px-3 py-2.5 border-2 rounded-l-lg bg-gray-50 text-gray-600 font-medium ${
                                fieldErrors.od_add ? 'border-red-500' : 'border-gray-200'
                              }`}>+</span>
                              <input 
                                type="number" 
                                step="0.25" 
                                name="od_add_val" 
                                value={graduacion.od_add_val} 
                                onChange={handleGraduacionChange} 
                                onBlur={handleBlur} 
                                className={`w-full px-3 py-2.5 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 transition-colors ${
                                  fieldErrors.od_add ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                                }`} 
                              />
                            </div>
                            {fieldErrors.od_add && <p className="mt-1 text-xs text-red-600">{fieldErrors.od_add}</p>}
                          </div>
                        )}

                        {/* AV */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">AV <span className="text-red-500">*</span></label>
                          <div className="flex">
                            <input 
                              type="text" 
                              name="od_av_1" 
                              value={graduacion.od_av_1} 
                              onChange={handleGraduacionChange} 
                              onBlur={handleBlur} 
                              className={`w-full px-3 py-2.5 border-2 rounded-l-lg text-center focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.od_av ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                              }`} 
                            />
                            <span className={`px-2 py-2.5 border-2 border-l-0 border-r-0 bg-gray-50 text-gray-600 font-medium ${
                              fieldErrors.od_av ? 'border-red-500' : 'border-gray-200'
                            }`}>/</span>
                            <input 
                              type="text" 
                              name="od_av_2" 
                              value={graduacion.od_av_2} 
                              onChange={handleGraduacionChange} 
                              onBlur={handleBlur} 
                              className={`w-full px-3 py-2.5 border-2 rounded-r-lg text-center focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.od_av ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-500'
                              }`} 
                            />
                          </div>
                          {fieldErrors.od_av && <p className="mt-1 text-xs text-red-600">{fieldErrors.od_av}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Left Eye (OI) */}
                    <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="bg-purple-100 p-1.5 rounded-lg">
                          <Eye className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-bold text-gray-900">Ojo Izquierdo (OI)</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {/* ESF */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">ESF</label>
                          <div className="flex">
                            <select 
                              name="oi_esf_sign" 
                              value={graduacion.oi_esf_sign} 
                              onChange={handleGraduacionChange} 
                              onBlur={handleBlur} 
                              className={`px-2 py-2.5 border-2 rounded-l-lg bg-gray-50 focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.oi_esf ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                              }`}
                            >
                              <option value="+">+</option>
                              <option value="-">-</option>
                            </select>
                            <input 
                              type="number" 
                              step="0.25" 
                              name="oi_esf_val" 
                              value={graduacion.oi_esf_val} 
                              onChange={handleGraduacionChange} 
                              onBlur={handleBlur} 
                              className={`w-full px-3 py-2.5 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.oi_esf ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                              }`} 
                            />
                          </div>
                          {fieldErrors.oi_esf && <p className="mt-1 text-xs text-red-600">{fieldErrors.oi_esf}</p>}
                        </div>

                        {/* CIL */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">CIL</label>
                          <div className="flex">
                            <span className={`px-3 py-2.5 border-2 rounded-l-lg bg-gray-50 text-gray-600 font-medium ${
                              fieldErrors.oi_cil ? 'border-red-500' : 'border-gray-200'
                            }`}>-</span>
                            <input 
                              type="number" 
                              step="0.25" 
                              name="oi_cil_val" 
                              value={graduacion.oi_cil_val} 
                              onChange={handleGraduacionChange} 
                              onBlur={handleBlur} 
                              className={`w-full px-3 py-2.5 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.oi_cil ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                              }`} 
                            />
                          </div>
                          {fieldErrors.oi_cil && <p className="mt-1 text-xs text-red-600">{fieldErrors.oi_cil}</p>}
                        </div>

                        {/* EJE */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">EJE</label>
                          <div className="flex">
                            <input 
                              type="number" 
                              name="oi_eje_val" 
                              value={graduacion.oi_eje_val} 
                              onChange={handleGraduacionChange} 
                              onBlur={handleBlur} 
                              className={`w-full px-3 py-2.5 border-2 rounded-l-lg focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.oi_eje ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                              }`} 
                            />
                            <span className={`px-3 py-2.5 border-2 border-l-0 rounded-r-lg bg-gray-50 text-gray-600 font-medium ${
                              fieldErrors.oi_eje ? 'border-red-500' : 'border-gray-200'
                            }`}>°</span>
                          </div>
                          {fieldErrors.oi_eje && <p className="mt-1 text-xs text-red-600">{fieldErrors.oi_eje}</p>}
                        </div>

                        {/* ADD (Conditional) */}
                        {(lente.tipo_de_lente === 'Bifocal' || lente.tipo_de_lente === 'Progresivo') && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">ADD</label>
                            <div className="flex">
                              <span className={`px-3 py-2.5 border-2 rounded-l-lg bg-gray-50 text-gray-600 font-medium ${
                                fieldErrors.oi_add ? 'border-red-500' : 'border-gray-200'
                              }`}>+</span>
                              <input 
                                type="number" 
                                step="0.25" 
                                name="oi_add_val" 
                                value={graduacion.oi_add_val} 
                                onChange={handleGraduacionChange} 
                                onBlur={handleBlur} 
                                className={`w-full px-3 py-2.5 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 transition-colors ${
                                  fieldErrors.oi_add ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                                }`} 
                              />
                            </div>
                            {fieldErrors.oi_add && <p className="mt-1 text-xs text-red-600">{fieldErrors.oi_add}</p>}
                          </div>
                        )}

                        {/* AV */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">AV <span className="text-red-500">*</span></label>
                          <div className="flex">
                            <input 
                              type="text" 
                              name="oi_av_1" 
                              value={graduacion.oi_av_1} 
                              onChange={handleGraduacionChange} 
                              onBlur={handleBlur} 
                              className={`w-full px-3 py-2.5 border-2 rounded-l-lg text-center focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.oi_av ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                              }`} 
                            />
                            <span className={`px-2 py-2.5 border-2 border-l-0 border-r-0 bg-gray-50 text-gray-600 font-medium ${
                              fieldErrors.oi_av ? 'border-red-500' : 'border-gray-200'
                            }`}>/</span>
                            <input 
                              type="text" 
                              name="oi_av_2" 
                              value={graduacion.oi_av_2} 
                              onChange={handleGraduacionChange} 
                              onBlur={handleBlur} 
                              className={`w-full px-3 py-2.5 border-2 rounded-r-lg text-center focus:outline-none focus:ring-2 transition-colors ${
                                fieldErrors.oi_av ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'
                              }`} 
                            />
                          </div>
                          {fieldErrors.oi_av && <p className="mt-1 text-red-600">{fieldErrors.oi_av}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t-2 border-gray-100">
                <button 
                  type="button" 
                  onClick={() => navigate('/lentes')} 
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
                  <span>{loading ? 'Guardando...' : (id ? 'Actualizar Lente' : 'Crear Lente')}</span>
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