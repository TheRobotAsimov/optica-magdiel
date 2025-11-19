export const validatePacienteForm = (data) => {
  const errors = {};

  if (!data.idcliente) {
    errors.idcliente = 'El cliente es requerido';
  }

  if (!data.nombre?.trim()) {
    errors.nombre = 'El nombre es requerido';
  }

  if (!data.paterno?.trim()) {
    errors.paterno = 'El apellido paterno es requerido';
  }

  if (!data.sexo) {
    errors.sexo = 'El sexo es requerido';
  }

  if (!data.edad || data.edad <= 0) {
    errors.edad = 'La edad es requerida y debe ser mayor a 0';
  }

  if (!data.parentesco) {
    errors.parentesco = 'El parentesco es requerido';
  }

  return errors;
};

export const validatePacienteField = (field, value) => {
  switch (field) {
    case 'idcliente':
      return !value ? 'El cliente es requerido' : '';
    case 'nombre':
      return !value?.trim() ? 'El nombre es requerido' : '';
    case 'paterno':
      return !value?.trim() ? 'El apellido paterno es requerido' : '';
    case 'sexo':
      return !value ? 'El sexo es requerido' : '';
    case 'edad':
      return !value || value <= 0 ? 'La edad es requerida y debe ser mayor a 0' : '';
    case 'parentesco':
      return !value ? 'El parentesco es requerido' : '';
    default:
      return '';
  }
};