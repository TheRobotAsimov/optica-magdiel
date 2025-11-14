import { validateRequired, validateTextOnly, validatePhone, validateNumber, validateDate } from './commonValidations.js';

export const validateEmpleadoForm = (formData) => {
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

  // Teléfono
  const phoneError = validatePhone(formData.telefono);
  if (phoneError) errors.telefono = phoneError;

  // Fechas
  if (!formData.fecnac) {
    errors.fecnac = 'Fecha de nacimiento es requerida';
  } else {
    const birthDateError = validateDate(formData.fecnac, 'Fecha de nacimiento', { past: true, minAge: 18 });
    if (birthDateError) errors.fecnac = birthDateError;
  }

  if (!formData.feccon) {
    errors.feccon = 'Fecha de contratación es requerida';
  } else {
    const contractDateError = validateDate(formData.feccon, 'Fecha de contratación');
    if (contractDateError) errors.feccon = contractDateError;
  }

  // Sueldo
  if (formData.sueldo) {
    const sueldoError = validateNumber(formData.sueldo, 'Sueldo', 0);
    if (sueldoError) errors.sueldo = sueldoError;
  }

  // Puesto
  const validPuestos = ['Optometrista', 'Asesor', 'Matriz'];
  if (!formData.puesto) {
    errors.puesto = 'Puesto es requerido';
  } else if (!validPuestos.includes(formData.puesto)) {
    errors.puesto = 'Puesto inválido';
  }

  // Estado
  const validEstados = ['Activo', 'Inactivo'];
  if (!formData.estado) {
    errors.estado = 'Estado es requerido';
  } else if (!validEstados.includes(formData.estado)) {
    errors.estado = 'Estado inválido';
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

export const validateEmpleadoField = (name, value) => {
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
    case 'telefono':
      return validatePhone(value);
    case 'fecnac':
      if (!value) return 'Fecha de nacimiento es requerida';
      return validateDate(value, 'Fecha de nacimiento', { past: true, minAge: 18 });
    case 'feccon':
      if (!value) return 'Fecha de contratación es requerida';
      return validateDate(value, 'Fecha de contratación');
    case 'sueldo':
      if (value) return validateNumber(value, 'Sueldo', 0);
      return null;
    case 'puesto': {
      const validPuestos = ['Optometrista', 'Asesor', 'Matriz'];
      if (!value) return 'Puesto es requerido';
      if (!validPuestos.includes(value)) return 'Puesto inválido';
      return null;
    }
    case 'estado': {
      const validEstados = ['Activo', 'Inactivo'];
      if (!value) return 'Estado es requerido';
      if (!validEstados.includes(value)) return 'Estado inválido';
      return null;
    }
    case 'sexo': {
      const validSexos = ['M', 'F'];
      if (!value) return 'Sexo es requerido';
      if (!validSexos.includes(value)) return 'Sexo inválido';
      return null;
    }
    default:
      return null;
  }
};