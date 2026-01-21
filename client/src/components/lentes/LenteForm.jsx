import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import lenteService from '../../service/lenteService';
import empleadoService from '../../service/empleadoService';
import ventaService from '../../service/ventaService';
import NavComponent from '../common/NavBar';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { Glasses, Calendar, ClipboardList, Settings, Hash, User, FileText } from 'lucide-react';
import { validateLenteForm, validateLenteField } from '../../utils/validations/index.js';
import { useFormManager } from '../../hooks/useFormManager';
import FormHeader from '../common/form/FormHeader';
import FormSection from '../common/form/FormSection';
import FormField from '../common/form/FormField';
import FormActions from '../common/form/FormActions';

const LenteForm = () => {
  const { id } = useParams();
  const [optometristas, setOptometristas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [graduacion, setGraduacion] = useState({
    od_esf_sign: '+', od_esf_val: '', od_cil_val: '', od_eje_val: '', od_add_val: '', od_av_1: '', od_av_2: '',
    oi_esf_sign: '+', oi_esf_val: '', oi_cil_val: '', oi_eje_val: '', oi_add_val: '', oi_av_1: '', oi_av_2: '',
  });
  const [examenSeguimientoOption, setExamenSeguimientoOption] = useState('');

  const symptomsList = [
    'ARDOR', 'LAGRIMEO', 'IRRITACION', 'DOLOR', 'COMEZON', 'MOL. SOL.',
    'MOL. AIRE', 'ARENOZO', 'HIPERTENSION', 'DIABETES', 'GLAUCOMA', 'CATARATAS',
    'USO DISP. ELEC.', 'QUIRURGICOS', 'INFECCION', 'FOSFENOS', 'MIODESOPIAS', 'FOTOSENSIBLES'
  ];
  const initialSymptomsState = symptomsList.reduce((acc, symptom) => { acc[symptom] = false; return acc; }, {});
  const [symptomsState, setSymptomsState] = useState(initialSymptomsState);

  // Fetch relatd data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [optometristasData, ventasData] = await Promise.all([
          empleadoService.getAllEmpleados(),
          ventaService.getAllVentas(),
        ]);
        setOptometristas(optometristasData.filter(emp => emp.puesto === 'Optometrista'));
        setVentas(ventasData);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const {
    values: lente,
    setValues,
    loading,
    error,
    fieldErrors,
    touched,
    handleChange: originalHandleChange,
    handleBlur: originalHandleBlur,
    handleSubmit,
    isFormValid,
    isEdit
  } = useFormManager({
    initialValues: {
      idoptometrista: '', folio: '', sintomas: '', uso_de_lente: '', armazon: '', material: 'CR-39', tratamiento: 'AR', tipo_de_lente: 'Monofocal', tinte_color: '', tono: '', desvanecido: 'No', blend: 'No', subtipo: '', procesado: 'No', fecha_entrega: '', examen_seguimiento: '', estatus: 'Pendiente', od_esf: '', od_cil: '', od_eje: '', od_add: '', od_av: '', oi_esf: '', oi_cil: '', oi_eje: '', oi_add: '', oi_av: '', kit: 'Sin kit'
    },
    validateField: validateLenteField,
    validateForm: validateLenteForm,
    service: lenteService,
    createMethod: 'createLente',
    updateMethod: 'updateLente',
    getByIdMethod: 'getLenteById',
    id,
    redirectPath: '/lentes',
    transformData: (data, mode) => {
      if (mode === 'fetch') {
        const transformed = { ...data };
        if (transformed.fecha_entrega) transformed.fecha_entrega = new Date(transformed.fecha_entrega).toISOString().split('T')[0];
        if (transformed.examen_seguimiento) transformed.examen_seguimiento = new Date(transformed.examen_seguimiento).toISOString().split('T')[0];

        // Update graduacion state
        const newGrad = { ...graduacion };
        const updatePartial = (side, esf, cil, eje, add, av) => {
          if (esf) {
            newGrad[`${side}_esf_sign`] = esf.startsWith('-') ? '-' : '+';
            newGrad[`${side}_esf_val`] = esf.replace(/[+-]/, '');
          }
          if (cil) newGrad[`${side}_cil_val`] = cil.replace('-', '');
          newGrad[`${side}_eje_val`] = eje || '';
          if (add) newGrad[`${side}_add_val`] = add.replace('+', '');
          if (av) {
            const parts = av.split('/');
            newGrad[`${side}_av_1`] = parts[0] || '';
            newGrad[`${side}_av_2`] = parts[1] || '';
          }
        };
        updatePartial('od', data.od_esf, data.od_cil, data.od_eje, data.od_add, data.od_av);
        updatePartial('oi', data.oi_esf, data.oi_cil, data.oi_eje, data.oi_add, data.oi_av);
        setGraduacion(newGrad);

        // Update symptoms state
        if (data.sintomas) {
          const selected = data.sintomas.split(', ');
          const newSymptoms = { ...initialSymptomsState };
          selected.forEach(s => { if (newSymptoms[s] !== undefined) newSymptoms[s] = true; });
          setSymptomsState(newSymptoms);
        }

        // Update exam option
        if (transformed.examen_seguimiento) {
          const months = (new Date(transformed.examen_seguimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24 * 30.44);
          if (Math.abs(months - 6) < 1) setExamenSeguimientoOption('6 months');
          else if (Math.abs(months - 12) < 1) setExamenSeguimientoOption('1 year');
          else if (Math.abs(months - 24) < 1) setExamenSeguimientoOption('2 years');
        }

        return transformed;
      }
      if (mode === 'submit') {
        const toSubmit = { ...data };
        ['tono', 'od_esf', 'od_cil', 'od_eje', 'od_add', 'oi_esf', 'oi_cil', 'oi_eje', 'oi_add', 'subtipo'].forEach(f => {
          if (!toSubmit[f]) toSubmit[f] = null;
        });
        return toSubmit;
      }
      return data;
    }
  });

  // Keep symptoms synchronized
  useEffect(() => {
    const selected = Object.keys(symptomsState).filter(s => symptomsState[s]).join(', ');
    setValues(prev => ({ ...prev, sintomas: selected }));
  }, [symptomsState, setValues]);

  // Keep graduation synchronized
  useEffect(() => {
    const { od_esf_sign, od_esf_val, od_cil_val, od_eje_val, od_add_val, od_av_1, od_av_2, oi_esf_sign, oi_esf_val, oi_cil_val, oi_eje_val, oi_add_val, oi_av_1, oi_av_2 } = graduacion;
    const newValues = {
      od_esf: od_esf_val ? `${od_esf_sign}${od_esf_val}` : '',
      od_cil: od_cil_val ? `-${od_cil_val}` : '',
      od_eje: od_eje_val,
      od_add: od_add_val ? `+${od_add_val}` : '',
      od_av: (od_av_1 || od_av_2) ? `${od_av_1}/${od_av_2}` : '',
      oi_esf: oi_esf_val ? `${oi_esf_sign}${oi_esf_val}` : '',
      oi_cil: oi_cil_val ? `-${oi_cil_val}` : '',
      oi_eje: oi_eje_val,
      oi_add: oi_add_val ? `+${oi_add_val}` : '',
      oi_av: (oi_av_1 || oi_av_2) ? `${oi_av_1}/${oi_av_2}` : '',
    };
    const shouldBeProcesado = [newValues.od_esf, newValues.od_cil, newValues.oi_esf, newValues.oi_cil].some(v => Math.abs(parseFloat(v)) >= 5);
    setValues(prev => ({ ...prev, ...newValues, procesado: shouldBeProcesado ? 'Si' : 'No' }));
  }, [graduacion, setValues]);

  const handleGraduacionChange = (e) => {
    const { name, value } = e.target;
    setGraduacion(prev => {
      const next = { ...prev, [name]: value };
      if (name.startsWith('od_')) next[name.replace('od_', 'oi_')] = value;
      return next;
    });
  };

  const handleSymptomChange = (e) => setSymptomsState(prev => ({ ...prev, [e.target.name]: e.target.checked }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'examenSeguimientoOption') {
      setExamenSeguimientoOption(value);
      if (value) {
        let date = new Date();
        if (value === '6 months') date.setMonth(date.getMonth() + 6);
        else if (value === '1 year') date.setFullYear(date.getFullYear() + 1);
        else if (value === '2 years') date.setFullYear(date.getFullYear() + 2);
        setValues(prev => ({ ...prev, examen_seguimiento: date.toISOString().split('T')[0] }));
      } else setValues(prev => ({ ...prev, examen_seguimiento: '' }));
    } else {
      setValues(prev => {
        const next = { ...prev, [name]: value };
        if (name === 'material') { next.tratamiento = ''; next.tipo_de_lente = ''; next.subtipo = ''; }
        if (name === 'tratamiento') { next.tipo_de_lente = ''; next.subtipo = ''; }
        if (name === 'tipo_de_lente') { next.subtipo = ''; if (value !== 'Bifocal') next.blend = 'No'; }
        return next;
      });
      originalHandleChange(e);
    }
  };

  if (loading && !isEdit) return <Loading />;
  if (error) return <Error message={error} />;

  const GraduationField = ({ side, field, label, type = "number", sign, step = "0.25" }) => {
    const name = `${side}_${field}`;
    const valName = `${name}_val`;
    const signName = `${name}_sign`;
    return (
      <div className="flex flex-col">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
        <div className="flex">
          {sign && (
            <select name={signName} value={graduacion[signName]} onChange={handleGraduacionChange} className="bg-gray-50 border-2 border-r-0 border-gray-200 rounded-l-xl px-2 focus:ring-0 focus:border-gray-200">
              <option value="+">+</option>
              <option value="-">-</option>
            </select>
          )}
          <input
            type={type} step={step} name={valName} value={graduacion[valName]} onChange={handleGraduacionChange} onBlur={originalHandleBlur}
            className={`w-full px-3 py-2 border-2 border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all ${sign ? 'rounded-r-xl' : 'rounded-xl'}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FormHeader title={isEdit ? 'Editar Lente' : 'Nuevo Lente'} subtitle={isEdit ? 'Actualiza la información del lente' : 'Registra un nuevo lente'} icon={Glasses} backPath="/lentes" />

        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              <FormSection title="Información General" icon={ClipboardList} colorClass="blue">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Síntomas</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 p-4 border-2 border-gray-100 rounded-xl bg-gray-50/50">
                    {symptomsList.map(s => (
                      <label key={s} className="flex items-center space-x-2 text-xs font-medium text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
                        <input type="checkbox" name={s} checked={symptomsState[s]} onChange={handleSymptomChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <FormField label="Uso de Lente" name="uso_de_lente" error={fieldErrors.uso_de_lente} required><input type="text" name="uso_de_lente" value={lente.uso_de_lente} onChange={handleChange} onBlur={originalHandleBlur} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" /></FormField>
                <FormField label="Folio Venta" name="folio" error={fieldErrors.folio} required icon={Hash}>
                  <select name="folio" value={lente.folio} onChange={handleChange} onBlur={originalHandleBlur} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
                    <option value="">Seleccionar</option>
                    {ventas.map(v => <option key={v.folio} value={v.folio}>{v.folio} - {v.cliente_nombre}</option>)}
                  </select>
                </FormField>
                <FormField label="Optometrista" name="idoptometrista" error={fieldErrors.idoptometrista} required icon={User}>
                  <select name="idoptometrista" value={lente.idoptometrista} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
                    <option value="">Seleccionar</option>
                    {optometristas.map(o => <option key={o.idempleado} value={o.idempleado}>{o.nombre} {o.paterno}</option>)}
                  </select>
                </FormField>
              </FormSection>

              <FormSection title="Graduación" icon={Glasses} colorClass="indigo">
                <div className="md:col-span-3 space-y-6">
                  {['od', 'oi'].map(side => (
                    <div key={side} className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className={`w-3 h-8 rounded-full ${side === 'od' ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
                        <h4 className="text-lg font-bold text-gray-800">{side === 'od' ? 'Ojo Derecho' : 'Ojo Izquierdo'}</h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        <GraduationField side={side} field="esf" label="Esfera" sign />
                        <GraduationField side={side} field="cil" label="Cilindro" />
                        <GraduationField side={side} field="eje" label="Eje" type="text" step="1" />
                        <GraduationField side={side} field="add" label="Adición" />
                        <div className="flex flex-col md:col-span-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Agudeza Visual</label>
                          <div className="flex items-center space-x-2">
                            <input type="text" name={`${side}_av_1`} value={graduacion[`${side}_av_1`]} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl" />
                            <span className="text-xl font-bold text-gray-300">/</span>
                            <input type="text" name={`${side}_av_2`} value={graduacion[`${side}_av_2`]} onChange={handleGraduacionChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </FormSection>

              <FormSection title="Configuración de Lente" icon={Settings} colorClass="purple">
                <FormField label="Armazón" name="armazon" error={fieldErrors.armazon} required><input type="text" name="armazon" value={lente.armazon} onChange={handleChange} onBlur={originalHandleBlur} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" /></FormField>
                <FormField label="Material" name="material" required>
                  <select name="material" value={lente.material} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
                    <option value="CR-39">CR-39</option><option value="BLUERAY">BLUERAY</option>
                  </select>
                </FormField>
                <FormField label="Tratamiento" name="tratamiento" required>
                  <select name="tratamiento" value={lente.tratamiento} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
                    <option value="AR">AR</option><option value="Photo AR">Photo AR</option>
                  </select>
                </FormField>
                <FormField label="Tipo de Lente" name="tipo_de_lente" required>
                  <select name="tipo_de_lente" value={lente.tipo_de_lente} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
                    <option value="Monofocal">Monofocal</option><option value="Bifocal">Bifocal</option><option value="Progresivo">Progresivo</option>
                  </select>
                </FormField>
                <FormField label="Kit" name="kit">
                  <select name="kit" value={lente.kit} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
                    <option value="Sin kit">Sin kit</option><option value="Completo">Completo</option>
                  </select>
                </FormField>
                <FormField label="Estatus" name="estatus" required>
                  <select name="estatus" value={lente.estatus} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
                    <option value="Pendiente">Pendiente</option><option value="Proceso">Proceso</option><option value="Terminado">Terminado</option><option value="Entregado">Entregado</option>
                  </select>
                </FormField>
                <FormField label="Fecha de Entrega" name="fecha_entrega" error={fieldErrors.fecha_entrega} required icon={Calendar}><input type="date" name="fecha_entrega" value={lente.fecha_entrega} onChange={handleChange} onBlur={originalHandleBlur} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" /></FormField>
                <FormField label="Próximo Examen" name="examenSeguimientoOption" icon={Calendar}>
                  <select name="examenSeguimientoOption" value={examenSeguimientoOption} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl">
                    <option value="">Manual</option><option value="6 months">6 meses</option><option value="1 year">1 año</option><option value="2 years">2 años</option>
                  </select>
                </FormField>
              </FormSection>

              <FormActions onCancel="/lentes" loading={loading} isFormValid={isFormValid} isEdit={isEdit} />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenteForm;