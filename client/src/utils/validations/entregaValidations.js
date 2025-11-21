import { validateRequired } from './commonValidations.js';

export const validateEntregaForm = (formData, options = {}) => {
  const errors = {};

  // Ruta
  const rutaError = validateRequired(formData.idruta, 'Ruta');
  if (rutaError) errors.idruta = rutaError;

  // Estatus
  const validEstatus = ['No entregado', 'Entregado'];
  if (!formData.estatus) {
    errors.estatus = 'Estatus es requerido';
  } else if (!validEstatus.includes(formData.estatus)) {
    errors.estatus = 'Estatus inválido';
  }

  // Motivo
  const motivoError = validateRequired(formData.motivo, 'Motivo');
  if (motivoError) errors.motivo = motivoError;
  else {
    if (formData.motivo.length < 5) {
      errors.motivo = 'Motivo debe tener al menos 5 caracteres';
    }
  }

  // Hora
  const horaError = validateRequired(formData.hora, 'Hora');
  if (horaError) errors.hora = horaError;

  // Al menos un lente o pago
  if (!formData.idlente && !formData.idpago && options.pagoOption !== 'new') {
    errors.general = 'Debe seleccionar al menos un lente o un pago.';
  }

  return errors;
};

export const validateEntregaField = (name, value) => {
  switch (name) {
    case 'idruta':
      return validateRequired(value, 'Ruta');
    case 'estatus': {
      const validEstatus = ['No entregado', 'Entregado'];
      if (!value) return 'Estatus es requerido';
      if (!validEstatus.includes(value)) return 'Estatus inválido';
      return null;
    }
    case 'motivo': {
      const reqError = validateRequired(value, 'Motivo');
      if (reqError) return reqError;
      if (value.length < 5) return 'Motivo debe tener al menos 5 caracteres';
      return null;
    }
    case 'hora':
      return validateRequired(value, 'Hora');
    default:
      return null;
  }
};