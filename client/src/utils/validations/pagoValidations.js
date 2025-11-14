import { validateRequired, validateNumber, validateDate } from './commonValidations.js';

export const validatePagoForm = (formData) => {
  const errors = {};

  // Folio
  const folioError = validateRequired(formData.folio, 'Folio');
  if (folioError) errors.folio = folioError;

  // Fecha
  const fechaError = validateRequired(formData.fecha, 'Fecha');
  if (fechaError) errors.fecha = fechaError;
  else {
    const dateError = validateDate(formData.fecha, 'Fecha');
    if (dateError) errors.fecha = dateError;
  }

  // Cantidad
  const cantidadError = validateRequired(formData.cantidad, 'Cantidad');
  if (cantidadError) errors.cantidad = cantidadError;
  else {
    const numError = validateNumber(formData.cantidad, 'Cantidad', 0.01);
    if (numError) errors.cantidad = numError;
  }

  // Estatus
  const validEstatus = ['Pendiente', 'Pagado'];
  if (!formData.estatus) {
    errors.estatus = 'Estatus es requerido';
  } else if (!validEstatus.includes(formData.estatus)) {
    errors.estatus = 'Estatus inválido';
  }

  return errors;
};

export const validatePagoField = (name, value) => {
  switch (name) {
    case 'folio':
      return validateRequired(value, 'Folio');
    case 'fecha': {
      const reqError = validateRequired(value, 'Fecha');
      if (reqError) return reqError;
      return validateDate(value, 'Fecha');
    }
    case 'cantidad': {
      const reqError = validateRequired(value, 'Cantidad');
      if (reqError) return reqError;
      return validateNumber(value, 'Cantidad', 0.01);
    }
    case 'estatus': {
      const validEstatus = ['Pendiente', 'Pagado'];
      if (!value) return 'Estatus es requerido';
      if (!validEstatus.includes(value)) return 'Estatus inválido';
      return null;
    }
    default:
      return null;
  }
};