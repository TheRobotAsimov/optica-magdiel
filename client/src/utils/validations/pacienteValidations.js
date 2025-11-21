import { validateRequired, validateTextOnly, validateNumber } from './commonValidations.js';

export const validatePacienteForm = (formData) => {
  const errors = {};

  // Cliente
  const clienteError = validateRequired(formData.idcliente, 'Cliente');
  if (clienteError) errors.idcliente = clienteError;

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

  // Sexo
  const validSexos = ['M', 'F'];
  if (!formData.sexo) {
    errors.sexo = 'Sexo es requerido';
  } else if (!validSexos.includes(formData.sexo)) {
    errors.sexo = 'Sexo inválido';
  }

  // Edad
  if (!formData.edad) {
    errors.edad = 'Edad es requerida';
  } else {
    const ageError = validateNumber(formData.edad, 'Edad', 0, 120);
    if (ageError) errors.edad = ageError;
  }

  // Parentesco
  const parentescoError = validateRequired(formData.parentesco, 'Parentesco');
  if (parentescoError) errors.parentesco = parentescoError;

  return errors;
};

export const validatePacienteField = (name, value) => {
  switch (name) {
    case 'idcliente':
      return validateRequired(value, 'Cliente');
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
    case 'sexo': {
      if (!value) return 'Sexo es requerido';
      const validSexos = ['M', 'F'];
      if (!validSexos.includes(value)) return 'Sexo inválido';
      return null;
    }
    case 'edad':
      if (!value) return 'Edad es requerida';
      return validateNumber(value, 'Edad', 0, 120);
    case 'parentesco':
      return validateRequired(value, 'Parentesco');
    default:
      return null;
  }
};