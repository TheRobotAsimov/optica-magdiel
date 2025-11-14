import { validateRequired } from './commonValidations.js';

export const validateEntregaForm = (formData) => {
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

  // Hora
  const horaError = validateRequired(formData.hora, 'Hora');
  if (horaError) errors.hora = horaError;

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
    case 'motivo':
      return validateRequired(value, 'Motivo');
    case 'hora':
      return validateRequired(value, 'Hora');
    default:
      return null;
  }
};