import { validateRequired, validateTextOnly, validatePhone, validateNumber, validateDate } from './commonValidations.js';

export const validateUnifiedForm = (formData) => {
  const errors = {};

  // Venta fields
  const folioError = validateRequired(formData.folio, 'Folio');
  if (folioError) errors.folio = folioError;

  const asesorError = validateRequired(formData.idasesor, 'Asesor');
  if (asesorError) errors.idasesor = asesorError;

  const fechaError = validateRequired(formData.fecha, 'Fecha');
  if (fechaError) errors.fecha = fechaError;

  const tipoError = validateRequired(formData.tipo, 'Tipo de pago');
  if (tipoError) errors.tipo = tipoError;

  // Cliente fields (si no está seleccionado)
  if (!formData.selectedClient) {
    const nombreError = validateRequired(formData.nombre, 'Nombre');
    if (nombreError) errors.nombre = nombreError;
    else {
      const textError = validateTextOnly(formData.nombre, 'Nombre');
      if (textError) errors.nombre = textError;
    }

    const paternoError = validateRequired(formData.paterno, 'Apellido paterno');
    if (paternoError) errors.paterno = paternoError;
    else {
      const textError = validateTextOnly(formData.paterno, 'Apellido paterno');
      if (textError) errors.paterno = textError;
    }

    const telefonoError = validatePhone(formData.telefono1);
    if (telefonoError) errors.telefono1 = telefonoError;

    const domicilioError = validateRequired(formData.domicilio1, 'Domicilio');
    if (domicilioError) errors.domicilio1 = domicilioError;
  }

  // Lente fields
  const optometristaError = validateRequired(formData.idoptometrista, 'Optometrista');
  if (optometristaError) errors.idoptometrista = optometristaError;

  const usoLenteError = validateRequired(formData.uso_de_lente, 'Uso de lente');
  if (usoLenteError) errors.uso_de_lente = usoLenteError;

  const armazonError = validateRequired(formData.armazon, 'Armazón');
  if (armazonError) errors.armazon = armazonError;

  // Material y tratamiento
  const validMateriales = ['CR-39', 'BLUERAY'];
  if (!formData.material) {
    errors.material = 'Material es requerido';
  } else if (!validMateriales.includes(formData.material)) {
    errors.material = 'Material inválido';
  }

  const validTratamientos = ['AR', 'Photo AR'];
  if (!formData.tratamiento) {
    errors.tratamiento = 'Tratamiento es requerido';
  } else if (!validTratamientos.includes(formData.tratamiento)) {
    errors.tratamiento = 'Tratamiento inválido';
  }

  const validTipos = ['Monofocal', 'Bifocal', 'Progresivo'];
  if (!formData.tipo_de_lente) {
    errors.tipo_de_lente = 'Tipo de lente es requerido';
  } else if (!validTipos.includes(formData.tipo_de_lente)) {
    errors.tipo_de_lente = 'Tipo de lente inválido';
  }

  // Fecha de entrega
  const entregaError = validateRequired(formData.fecha_entrega, 'Fecha de entrega');
  if (entregaError) errors.fecha_entrega = entregaError;
  else {
    const dateError = validateDate(formData.fecha_entrega, 'Fecha de entrega', { future: true });
    if (dateError) errors.fecha_entrega = dateError;
  }

  // Total
  if (formData.total !== undefined && formData.total !== null) {
    const totalError = validateNumber(formData.total, 'Total', 0);
    if (totalError) errors.total = totalError;
  }

  // Enganche
  if (formData.enganche !== undefined) {
    const engancheError = validateNumber(formData.enganche, 'Enganche', 0);
    if (engancheError) errors.enganche = engancheError;
    else if (parseFloat(formData.enganche) > parseFloat(formData.total)) {
      errors.enganche = 'Enganche no puede ser mayor que el Total';
    }
  }

  // Cantidad de pagos
  if (formData.cant_pagos !== undefined && formData.cant_pagos !== '') {
    const cantPagosError = validateNumber(formData.cant_pagos, 'Cantidad de pagos', 1);
    if (cantPagosError) errors.cant_pagos = cantPagosError;
    else if (!Number.isInteger(Number(formData.cant_pagos))) {
      errors.cant_pagos = 'Cantidad de pagos debe ser un número entero';
    }
  }

  // Institución
  if (formData.institucion && formData.institucion.trim() !== '') {
    const institucionError = validateTextOnly(formData.institucion, 'Institución', 3);
    if (institucionError) errors.institucion = institucionError;
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

export const validateUnifiedField = (name, value, formData = {}) => {
  switch (name) {
    case 'folio':
      return validateRequired(value, 'Folio');
    case 'idasesor':
      return validateRequired(value, 'Asesor');
    case 'fecha':
      return validateRequired(value, 'Fecha');
    case 'tipo':
      return validateRequired(value, 'Tipo de pago');
    case 'nombre': {
      if (formData.selectedClient) return null;
      const nombreReq = validateRequired(value, 'Nombre');
      if (nombreReq) return nombreReq;
      return validateTextOnly(value, 'Nombre');
    }
    case 'paterno': {
      if (formData.selectedClient) return null;
      const paternoReq = validateRequired(value, 'Apellido paterno');
      if (paternoReq) return paternoReq;
      return validateTextOnly(value, 'Apellido paterno');
    }
    case 'telefono1':
      if (formData.selectedClient) return null;
      return validatePhone(value);
    case 'domicilio1':
      if (formData.selectedClient) return null;
      return validateRequired(value, 'Domicilio');
    case 'idoptometrista':
      return validateRequired(value, 'Optometrista');
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
    case 'fecha_entrega': {
      const reqError = validateRequired(value, 'Fecha de entrega');
      if (reqError) return reqError;
      return validateDate(value, 'Fecha de entrega', { future: true });
    }
    case 'total':
      if (value !== undefined && value !== null) {
        return validateNumber(value, 'Total', 0);
      }
      return null;
    case 'enganche':
      if (value !== undefined) {
        const numError = validateNumber(value, 'Enganche', 0);
        if (numError) return numError;
        if (parseFloat(value) > parseFloat(formData.total)) {
          return 'Enganche no puede ser mayor que el Total';
        }
      }
      return null;
    case 'cant_pagos':
      if (value !== undefined && value !== '') {
        const numError = validateNumber(value, 'Cantidad de pagos', 1);
        if (numError) return numError;
        if (!Number.isInteger(Number(value))) {
          return 'Cantidad de pagos debe ser un número entero';
        }
      }
      return null;
    case 'institucion':
      if (value && value.trim() !== '') {
        return validateTextOnly(value, 'Institución', 3);
      }
      return null;
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
    default:
      return null;
  }
};