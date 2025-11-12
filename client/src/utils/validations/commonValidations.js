// Validaciones genéricas reutilizables para todos los formularios

export const validateEmail = (email) => {
  if (!email) return 'Correo electrónico requerido';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Correo electrónico inválido';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return 'Teléfono requerido';
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length !== 10) return 'Teléfono debe tener 10 dígitos';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} es requerido`;
  }
  return null;
};

export const validateTextOnly = (value, fieldName) => {
  if (!value) return null; // No requerido por defecto
  const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!textRegex.test(value)) {
    return `${fieldName} solo puede contener letras y espacios`;
  }
  return null;
};

export const validateNumber = (value, fieldName, min = 0, max = null) => {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return `${fieldName} debe ser un número válido`;
  if (num < min) return `${fieldName} debe ser mayor o igual a ${min}`;
  if (max !== null && num > max) return `${fieldName} debe ser menor o igual a ${max}`;
  return null;
};

export const validateDate = (date, fieldName, options = {}) => {
  if (!date) return null;
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return `${fieldName} debe ser una fecha válida`;

  if (options.future && dateObj < new Date()) {
    return `${fieldName} debe ser una fecha futura`;
  }

  if (options.past && dateObj > new Date()) {
    return `${fieldName} debe ser una fecha pasada`;
  }

  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Contraseña requerida';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
  }
  return null;
};

export const validateTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return null;
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  if (start >= end) return 'La hora de fin debe ser posterior a la hora de inicio';
  return null;
};