import { validateRequired, validateTextOnly, validatePhone, validateNumber } from './commonValidations.js';

export const validateClientForm = (formData) => {
  const errors = {};

  // Nombres
  const nombreError = validateRequired(formData.nombre, 'Nombre');
  if (nombreError) errors.nombre = nombreError;
  else {
    const textError = validateTextOnly(formData.nombre, 'Nombre', 3);
    if (textError) errors.nombre = textError;
  }

  const paternoError = validateRequired(formData.paterno, 'Apellido paterno');
  if (paternoError) errors.paterno = paternoError;
  else {
    const textError = validateTextOnly(formData.paterno, 'Apellido paterno', 3);
    if (textError) errors.paterno = textError;
  }

  // Materno es opcional pero si se proporciona debe ser válido
  if (formData.materno) {
    const textError = validateTextOnly(formData.materno, 'Apellido materno', 3);
    if (textError) errors.materno = textError;
  }

  // Teléfono principal
  const phoneError = validatePhone(formData.telefono1);
  if (phoneError) errors.telefono1 = phoneError;

  // Teléfono secundario (opcional)
  if (formData.telefono2) {
    const cleanPhone = formData.telefono2.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      errors.telefono2 = 'Teléfono secundario debe tener 10 dígitos';
    }
  }

  // Edad
  if (!formData.edad) {
    errors.edad = 'Edad es requerida';
  } else {
    const ageError = validateNumber(formData.edad, 'Edad', 18, 120);
    if (ageError) errors.edad = ageError;
  }

  // Domicilio principal
  const domicilioError = validateRequired(formData.domicilio1, 'Domicilio principal');
  if (domicilioError) errors.domicilio1 = domicilioError;
  else {
    if (formData.domicilio1.length < 5) {
      errors.domicilio1 = 'Domicilio principal debe tener al menos 5 caracteres';
    }
  }

  // Sexo
  const validSexos = ['M', 'F'];
  if (!formData.sexo) {
    errors.sexo = 'Sexo es requerido';
  } else if (!validSexos.includes(formData.sexo)) {
    errors.sexo = 'Sexo inválido';
  }

  return errors;
};

export const validateClientField = (name, value) => {
  switch (name) {
    case 'nombre': {
      const nombreReq = validateRequired(value, 'Nombre');
      if (nombreReq) return nombreReq;
      return validateTextOnly(value, 'Nombre', 3);
    }
    case 'paterno': {
      const paternoReq = validateRequired(value, 'Apellido paterno');
      if (paternoReq) return paternoReq;
      return validateTextOnly(value, 'Apellido paterno', 3);
    }
    case 'materno':
      if (value) return validateTextOnly(value, 'Apellido materno', 3);
      return null;
    case 'telefono1':
      return validatePhone(value);
    case 'telefono2':
      if (value) {
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length !== 10) return 'Teléfono secundario debe tener 10 dígitos';
      }
      return null;
    case 'edad':
      if (!value) return 'Edad es requerida';
      return validateNumber(value, 'Edad', 18, 120);
    case 'domicilio1': {
      const domicilioReq = validateRequired(value, 'Domicilio principal');
      if (domicilioReq) return domicilioReq;
      if (value.length < 5) return 'Domicilio principal debe tener al menos 5 caracteres';
      return null;
    }
    case 'sexo': {
      if (!value) return 'Sexo es requerido';
      const validSexos = ['M', 'F'];
      if (!validSexos.includes(value)) return 'Sexo inválido';
      return null;
    }
    default:
      return null;
  }
};