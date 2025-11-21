import { validateRequired, validateNumber, validateDate, validateTextOnly } from './commonValidations.js';

export const validateVentaForm = (formData) => {
  const errors = {};

  // Folio
  const folioError = validateRequired(formData.folio, 'Folio');
  if (folioError) errors.folio = folioError;
  else {
    if (!/^V\d{3}$/.test(formData.folio)) {
      errors.folio = 'Folio debe tener el formato VXXX (V seguido de 3 números)';
    }
  }

  // Asesor
  const asesorError = validateRequired(formData.idasesor, 'Asesor');
  if (asesorError) errors.idasesor = asesorError;

  // Cliente
  const clienteError = validateRequired(formData.idcliente, 'Cliente');
  if (clienteError) errors.idcliente = clienteError;

  // Fecha
  const fechaError = validateRequired(formData.fecha, 'Fecha');
  if (fechaError) errors.fecha = fechaError;
  else {
    const dateError = validateDate(formData.fecha, 'Fecha');
    if (dateError) errors.fecha = dateError;
  }

  // Tipo
  const tipoError = validateRequired(formData.tipo, 'Tipo');
  if (tipoError) errors.tipo = tipoError;

  // Total
  const totalError = validateRequired(formData.total, 'Total');
  if (totalError) errors.total = totalError;
  else {
    const numError = validateNumber(formData.total, 'Total', 0);
    if (numError) errors.total = numError;
  }

  // Estatus
  const estatusError = validateRequired(formData.estatus, 'Estatus');
  if (estatusError) errors.estatus = estatusError;

  // Enganche
  if (formData.enganche !== undefined && formData.enganche !== '') {
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

  return errors;
};

export const validateVentaField = (name, value, formData = {}) => {
  switch (name) {
    case 'folio': {
      const req = validateRequired(value, 'Folio');
      if (req) return req;
      if (!/^V\d{3}$/.test(value)) {
        return 'Folio debe tener el formato VXXX (V seguido de 3 números)';
      }
      return null;
    }
    case 'idasesor':
      return validateRequired(value, 'Asesor');
    case 'idcliente':
      return validateRequired(value, 'Cliente');
    case 'fecha': {
      const reqError = validateRequired(value, 'Fecha');
      if (reqError) return reqError;
      return validateDate(value, 'Fecha');
    }
    case 'tipo':
      return validateRequired(value, 'Tipo');
    case 'total': {
      const totalReq = validateRequired(value, 'Total');
      if (totalReq) return totalReq;
      return validateNumber(value, 'Total', 0);
    }
    case 'estatus':
      return validateRequired(value, 'Estatus');
    case 'enganche':
      if (value !== undefined && value !== '') {
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
    default:
      return null;
  }
};