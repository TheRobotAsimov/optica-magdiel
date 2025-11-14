import { validateRequired, validateNumber } from './commonValidations.js';

export const validateGastoRutaForm = (formData) => {
  const errors = {};

  // Ruta
  const rutaError = validateRequired(formData.idruta, 'Ruta');
  if (rutaError) errors.idruta = rutaError;

  // Cantidad
  const cantidadError = validateRequired(formData.cantidad, 'Cantidad');
  if (cantidadError) errors.cantidad = cantidadError;
  else {
    const numError = validateNumber(formData.cantidad, 'Cantidad', 0.01);
    if (numError) errors.cantidad = numError;
  }

  // Motivo
  const motivoError = validateRequired(formData.motivo, 'Motivo');
  if (motivoError) errors.motivo = motivoError;
  else {
    if (formData.motivo.length < 5) {
      errors.motivo = 'Motivo debe tener al menos 5 caracteres';
    }
  }

  return errors;
};

export const validateGastoRutaField = (name, value) => {
  switch (name) {
    case 'idruta':
      return validateRequired(value, 'Ruta');
    case 'cantidad': {
      const reqError = validateRequired(value, 'Cantidad');
      if (reqError) return reqError;
      return validateNumber(value, 'Cantidad', 0.01);
    }
    case 'motivo': {
      const reqError = validateRequired(value, 'Motivo');
      if (reqError) return reqError;
      if (value.length < 5) return 'Motivo debe tener al menos 5 caracteres';
      return null;
    }
    default:
      return null;
  }
};