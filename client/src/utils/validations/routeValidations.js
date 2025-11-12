import { validateRequired, validateNumber, validateDate, validateTimeRange } from './commonValidations.js';

export const validateRouteForm = (formData) => {
  const errors = {};

  // Asesor
  const asesorError = validateRequired(formData.idasesor, 'Asesor');
  if (asesorError) errors.idasesor = asesorError;

  // Fecha
  const fechaError = validateRequired(formData.fecha, 'Fecha');
  if (fechaError) errors.fecha = fechaError;
  else {
    const dateError = validateDate(formData.fecha, 'Fecha');
    if (dateError) errors.fecha = dateError;
  }

  // Horas
  const horaInicioError = validateRequired(formData.hora_inicio, 'Hora de inicio');
  if (horaInicioError) errors.hora_inicio = horaInicioError;

  const horaFinError = validateRequired(formData.hora_fin, 'Hora de fin');
  if (horaFinError) errors.hora_fin = horaFinError;

  // Validar que hora fin sea posterior a hora inicio
  if (formData.hora_inicio && formData.hora_fin) {
    const timeError = validateTimeRange(formData.hora_inicio, formData.hora_fin);
    if (timeError) errors.hora_fin = timeError;
  }

  // Estatus
  const validEstatus = ['Activa', 'Finalizada'];
  if (!formData.estatus) {
    errors.estatus = 'Estatus es requerido';
  } else if (!validEstatus.includes(formData.estatus)) {
    errors.estatus = 'Estatus inválido';
  }

  // Cantidades (deben ser números positivos o cero)
  const lentesRecibidosError = validateNumber(formData.lentes_recibidos, 'Lentes recibidos', 0);
  if (lentesRecibidosError) errors.lentes_recibidos = lentesRecibidosError;

  const tarjetasRecibidasError = validateNumber(formData.tarjetas_recibidas, 'Tarjetas recibidas', 0);
  if (tarjetasRecibidasError) errors.tarjetas_recibidas = tarjetasRecibidasError;

  const lentesEntregadosError = validateNumber(formData.lentes_entregados, 'Lentes entregados', 0);
  if (lentesEntregadosError) errors.lentes_entregados = lentesEntregadosError;

  const tarjetasEntregadasError = validateNumber(formData.tarjetas_entregadas, 'Tarjetas entregadas', 0);
  if (tarjetasEntregadasError) errors.tarjetas_entregadas = tarjetasEntregadasError;

  const lentesNoEntregadosError = validateNumber(formData.lentes_no_entregados, 'Lentes no entregados', 0);
  if (lentesNoEntregadosError) errors.lentes_no_entregados = lentesNoEntregadosError;

  const tarjetasNoEntregadasError = validateNumber(formData.tarjetas_no_entregadas, 'Tarjetas no entregadas', 0);
  if (tarjetasNoEntregadasError) errors.tarjetas_no_entregadas = tarjetasNoEntregadasError;

  return errors;
};

export const validateRouteField = (name, value, formData = {}) => {
  switch (name) {
    case 'idasesor':
      return validateRequired(value, 'Asesor');
    case 'fecha': {
      const fechaReq = validateRequired(value, 'Fecha');
      if (fechaReq) return fechaReq;
      return validateDate(value, 'Fecha');
    }
    case 'hora_inicio':
      return validateRequired(value, 'Hora de inicio');
    case 'hora_fin': {
      const finReq = validateRequired(value, 'Hora de fin');
      if (finReq) return finReq;
      if (formData.hora_inicio && value) {
        return validateTimeRange(formData.hora_inicio, value);
      }
      return null;
    }
    case 'estatus': {
      const validEstatus = ['Activa', 'Finalizada'];
      if (!value) return 'Estatus es requerido';
      if (!validEstatus.includes(value)) return 'Estatus inválido';
      return null;
    }
    case 'lentes_recibidos':
    case 'tarjetas_recibidas':
    case 'lentes_entregados':
    case 'tarjetas_entregadas':
    case 'lentes_no_entregados':
    case 'tarjetas_no_entregadas':
      return validateNumber(value, name.replace(/_/g, ' '), 0);
    default:
      return null;
  }
};