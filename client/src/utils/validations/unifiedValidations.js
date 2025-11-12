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

  // Enganche (si es crédito)
  if (formData.tipo === 'Credito' && formData.enganche !== undefined) {
    const engancheError = validateNumber(formData.enganche, 'Enganche', 0);
    if (engancheError) errors.enganche = engancheError;
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
      if (formData.tipo === 'Credito' && value !== undefined) {
        return validateNumber(value, 'Enganche', 0);
      }
      return null;
    default:
      return null;
  }
};