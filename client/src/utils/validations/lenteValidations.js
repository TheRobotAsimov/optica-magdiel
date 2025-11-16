import { validateRequired, validateNumber, validateDate } from './commonValidations.js';

export const validateLenteForm = (formData) => {
  const errors = {};

  // Optometrista
  const optometristaError = validateRequired(formData.idoptometrista, 'Optometrista');
  if (optometristaError) errors.idoptometrista = optometristaError;

  // Folio
  const folioError = validateRequired(formData.folio, 'Folio');
  if (folioError) errors.folio = folioError;

  // Uso de lente
  const usoError = validateRequired(formData.uso_de_lente, 'Uso de lente');
  if (usoError) errors.uso_de_lente = usoError;

  // Armazón
  const armazonError = validateRequired(formData.armazon, 'Armazón');
  if (armazonError) errors.armazon = armazonError;

  // Material
  const validMateriales = ['CR-39', 'BLUERAY'];
  if (!formData.material) {
    errors.material = 'Material es requerido';
  } else if (!validMateriales.includes(formData.material)) {
    errors.material = 'Material inválido';
  }

  // Tratamiento
  const validTratamientos = ['AR', 'Photo AR'];
  if (!formData.tratamiento) {
    errors.tratamiento = 'Tratamiento es requerido';
  } else if (!validTratamientos.includes(formData.tratamiento)) {
    errors.tratamiento = 'Tratamiento inválido';
  }

  // Tipo de lente
  const validTipos = ['Monofocal', 'Bifocal', 'Progresivo'];
  if (!formData.tipo_de_lente) {
    errors.tipo_de_lente = 'Tipo de lente es requerido';
  } else if (!validTipos.includes(formData.tipo_de_lente)) {
    errors.tipo_de_lente = 'Tipo de lente inválido';
  }

  // Subtipo (opcional)
  const validSubtipos = ['', 'Policarbonato', 'Haid index'];
  if (formData.subtipo && !validSubtipos.includes(formData.subtipo)) {
    errors.subtipo = 'Subtipo inválido';
  }

  // Fecha de entrega
  const entregaError = validateRequired(formData.fecha_entrega, 'Fecha de entrega');
  if (entregaError) errors.fecha_entrega = entregaError;
  else {
    const dateError = validateDate(formData.fecha_entrega, 'Fecha de entrega', { future: true });
    if (dateError) errors.fecha_entrega = dateError;
  }

  // Examen de seguimiento (opcional)
  if (formData.examen_seguimiento) {
    const seguimientoError = validateDate(formData.examen_seguimiento, 'Examen de seguimiento');
    if (seguimientoError) errors.examen_seguimiento = seguimientoError;
  }

  // Estatus
  const validEstatus = ['Pendiente', 'Entregado', 'No entregado'];
  if (!formData.estatus) {
    errors.estatus = 'Estatus es requerido';
  } else if (!validEstatus.includes(formData.estatus)) {
    errors.estatus = 'Estatus inválido';
  }

  // Graduación (valores numéricos opcionales)
  const graduacionFields = [
    'od_esf', 'od_cil', 'od_eje', 'od_add', 'od_av',
    'oi_esf', 'oi_cil', 'oi_eje', 'oi_add', 'oi_av'
  ];

  graduacionFields.forEach(field => {
    let numError;
    if (field === 'od_av' || field === 'oi_av') {
      // AV es requerido
      if (!formData[field]) {
        numError = 'AV es requerido';
      } else if (!/^\d+\/\d+$/.test(formData[field])) {
        numError = `${field.replace(/_/g, ' ')} debe tener formato numérico/numérico`;
      }
    } else if (formData[field]) {
      if (field === 'od_eje' || field === 'oi_eje') {
        numError = validateNumber(formData[field], field.replace(/_/g, ' '), 0, 180);
      } else if (field === 'od_add' || field === 'oi_add') {
        numError = validateNumber(formData[field], field.replace(/_/g, ' '), 0);
      } else if (field === 'od_cil' || field === 'oi_cil') {
        const num = parseFloat(formData[field]);
        if (isNaN(num) || num >= 0) {
          numError = `${field.replace(/_/g, ' ')} debe ser un número negativo válido`;
        }
      } else {
        // Para ESF, permite signo opcional
        //numError = validateNumber(formData[field], field.replace(/_/g, ' '));
      }
    }
    if (numError) errors[field] = numError;
  });

  // Kit
  const validKits = ['Sin kit', 'Completo'];
  if (formData.kit && !validKits.includes(formData.kit)) {
    errors.kit = 'Kit inválido';
  }

  // Desvanecido
  const validDesvanecido = ['No', 'Si'];
  if (formData.desvanecido && !validDesvanecido.includes(formData.desvanecido)) {
    errors.desvanecido = 'Desvanecido inválido';
  }

  // Blend
  const validBlend = ['No', 'Si'];
  if (formData.blend && !validBlend.includes(formData.blend)) {
    errors.blend = 'Blend inválido';
  }

  // Procesado
  const validProcesado = ['No', 'Si'];
  if (formData.procesado && !validProcesado.includes(formData.procesado)) {
    errors.procesado = 'Procesado inválido';
  }

  // Tono (solo si hay tinte)
  if (formData.tinte_color) {
    const validTonos = ['', 'Claro', 'Intermedio', 'Oscuro'];
    if (formData.tono && !validTonos.includes(formData.tono)) {
      errors.tono = 'Tono inválido';
    }
  }

  // Validar que si se ingresa CIL, se requiera EJE
  if (formData.od_cil && !formData.od_eje) {
    errors.od_eje = 'EJE es requerido cuando se ingresa CIL';
  }
  if (formData.oi_cil && !formData.oi_eje) {
    errors.oi_eje = 'EJE es requerido cuando se ingresa CIL';
  }

  if (!formData.od_cil && formData.od_eje) {
    errors.od_cil = 'CIL es requerido cuando se ingresa EJE';
  }
  if (!formData.oi_cil && formData.oi_eje) {
    errors.oi_cil = 'CIL es requerido cuando se ingresa EJE';
  }


  // Validar que haya al menos una graduación en OD (excluyendo AV ya que es requerido)
  const odFields = ['od_esf', 'od_cil', 'od_eje'];
  const hasOdGraduacion = odFields.some(field => formData[field]);
  if (!hasOdGraduacion) {
    errors.od_esf = 'Debe ingresar al menos una graduación para el ojo derecho';
  }

  // Validar que haya al menos una graduación en OI (excluyendo AV ya que es requerido)
  const oiFields = ['oi_esf', 'oi_cil', 'oi_eje'];
  const hasOiGraduacion = oiFields.some(field => formData[field]);
  if (!hasOiGraduacion) {
    errors.oi_esf = 'Debe ingresar al menos una graduación para el ojo izquierdo';
  }

  // Validar que si se pone en OD alguna graduación en OI debe tener también
  if (formData.od_esf && !formData.oi_esf) {
    errors.oi_esf = 'Debe ingresar ESF en ojo izquierdo si hay ESF en ojo derecho';
  }
  if (formData.od_cil && !formData.oi_cil) {
    errors.oi_cil = 'Debe ingresar CIL en ojo izquierdo si hay CIL en ojo derecho';
  }
  if (formData.od_eje && !formData.oi_eje) {
    errors.oi_eje = 'Debe ingresar EJE en ojo izquierdo si hay EJE en ojo derecho';
  }
  if (formData.od_add && !formData.oi_add) {
    errors.oi_add = 'Debe ingresar ADD en ojo izquierdo si hay ADD en ojo derecho';
  }

  return errors;
};

export const validateLenteField = (name, value, formData = {}) => {
  switch (name) {
    case 'idoptometrista':
      return validateRequired(value, 'Optometrista');
    case 'folio':
      return validateRequired(value, 'Folio');
    case 'uso_de_lente':
      return validateRequired(value, 'Uso de lente');
    case 'armazon':
      return validateRequired(value, 'Armazón');
    case 'material': {
      const validMateriales = ['CR-39', 'BLUERAY'];
      if (!value) return 'Material es requerido';
      if (!validMateriales.includes(value)) return 'Material inválido';
      return null;
    }
    case 'tratamiento': {
      const validTratamientos = ['AR', 'Photo AR'];
      if (!value) return 'Tratamiento es requerido';
      if (!validTratamientos.includes(value)) return 'Tratamiento inválido';
      return null;
    }
    case 'tipo_de_lente': {
      const validTipos = ['Monofocal', 'Bifocal', 'Progresivo'];
      if (!value) return 'Tipo de lente es requerido';
      if (!validTipos.includes(value)) return 'Tipo de lente inválido';
      return null;
    }
    case 'subtipo': {
      const validSubtipos = ['', 'Policarbonato', 'Haid index'];
      if (value && !validSubtipos.includes(value)) return 'Subtipo inválido';
      return null;
    }
    case 'fecha_entrega': {
      const reqError = validateRequired(value, 'Fecha de entrega');
      if (reqError) return reqError;
      return validateDate(value, 'Fecha de entrega', { future: true });
    }
    case 'examen_seguimiento':
      if (value) return validateDate(value, 'Examen de seguimiento');
      return null;
    case 'estatus': {
      const validEstatus = ['Pendiente', 'Entregado', 'No entregado'];
      if (!value) return 'Estatus es requerido';
      if (!validEstatus.includes(value)) return 'Estatus inválido';
      return null;
    }
    case 'od_esf':
    case 'oi_esf':
      //if (value) return validateNumber(value, name.replace(/_/g, ' '));
      return null;
    case 'od_cil':
    case 'oi_cil':
      if (value) {
        const num = parseFloat(value);
        if (isNaN(num) || num >= 0) return `${name.replace(/_/g, ' ')} debe ser un número negativo válido`;
      }
      return null;
    case 'od_eje':
    case 'oi_eje':
      if (value) return validateNumber(value, name.replace(/_/g, ' '), 0, 180);
      return null;
    case 'od_add':
    case 'oi_add':
      if (value) return validateNumber(value, name.replace(/_/g, ' '), 0);
      return null;
    case 'od_av':
    case 'oi_av':
      if (value && !/^\d+\/\d+$/.test(value)) return `${name.replace(/_/g, ' ')} debe tener formato numérico/numérico`;
      return null;
    case 'od_esf_val':
    case 'oi_esf_val':
      if (value) return validateNumber(value, name.replace(/_/g, ' '));
      return null;
    case 'od_cil_val':
    case 'oi_cil_val':
      if (value) return validateNumber(value, name.replace(/_/g, ' '));
      return null;
    case 'od_eje_val':
    case 'oi_eje_val':
      if (value) return validateNumber(value, name.replace(/_/g, ' '), 0, 180);
      return null;
    case 'od_add_val':
    case 'oi_add_val':
      if (value) return validateNumber(value, name.replace(/_/g, ' '), 0);
      return null;
    case 'od_av_1':
    case 'od_av_2':
    case 'oi_av_1':
    case 'oi_av_2': {
      const reqError = validateRequired(value, name.replace(/_/g, ' '));
      if (reqError) return reqError;
      if (value) return validateNumber(value, name.replace(/_/g, ' '));
      return null;
    }
    case 'kit': {
      const validKits = ['Sin kit', 'Completo'];
      if (value && !validKits.includes(value)) return 'Kit inválido';
      return null;
    }
    case 'desvanecido': {
      const validDesvanecido = ['No', 'Si'];
      if (value && !validDesvanecido.includes(value)) return 'Desvanecido inválido';
      return null;
    }
    case 'blend': {
      const validBlend = ['No', 'Si'];
      if (value && !validBlend.includes(value)) return 'Blend inválido';
      return null;
    }
    case 'procesado': {
      const validProcesado = ['No', 'Si'];
      if (value && !validProcesado.includes(value)) return 'Procesado inválido';
      return null;
    }
    case 'tono': {
      if (formData.tinte_color) {
        const validTonos = ['', 'Claro', 'Intermedio', 'Oscuro'];
        if (value && !validTonos.includes(value)) return 'Tono inválido';
      }
      return null;
    }
    default:
      return null;
  }
};