import { validateRequired, validateNumber, validateDate } from './commonValidations.js';

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

  // Enganche (si es crédito)
  if (formData.tipo === 'Credito' && formData.enganche !== undefined && formData.enganche !== '') {
    const engancheError = validateNumber(formData.enganche, 'Enganche', 0);
    if (engancheError) errors.enganche = engancheError;
  }

  // Cantidad de pagos (si es crédito)
  if (formData.tipo === 'Credito' && formData.cant_pagos !== undefined && formData.cant_pagos !== '') {
    const cantPagosError = validateNumber(formData.cant_pagos, 'Cantidad de pagos', 1);
    if (cantPagosError) errors.cant_pagos = cantPagosError;
    else if (!Number.isInteger(Number(formData.cant_pagos))) {
      errors.cant_pagos = 'Cantidad de pagos debe ser un número entero';
    }
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
      if (formData.tipo === 'Credito' && value !== undefined && value !== '') {
        return validateNumber(value, 'Enganche', 0);
      }
      return null;
    case 'cant_pagos':
      if (formData.tipo === 'Credito' && value !== undefined && value !== '') {
        const numError = validateNumber(value, 'Cantidad de pagos', 1);
        if (numError) return numError;
        if (!Number.isInteger(Number(value))) {
          return 'Cantidad de pagos debe ser un número entero';
        }
      }
      return null;
    default:
      return null;
  }
};