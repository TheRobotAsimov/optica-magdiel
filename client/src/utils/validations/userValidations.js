import { validateEmail, validatePassword } from './commonValidations.js';

export const validateUserForm = (formData) => {
  const errors = {};

  // Correo
  const emailError = validateEmail(formData.correo);
  if (emailError) errors.correo = emailError;

  // Contraseña (solo si es creación, no edición)
  if (!formData.id) {
    const passwordError = validatePassword(formData.contrasena);
    if (passwordError) errors.contrasena = passwordError;
  }

  // Rol
  const validRoles = ['Optometrista', 'Asesor', 'Matriz', 'Administrador'];
  if (!formData.rol) {
    errors.rol = 'Rol es requerido';
  } else if (!validRoles.includes(formData.rol)) {
    errors.rol = 'Rol inválido';
  }

  return errors;
};

export const validateUserField = (name, value) => {
  switch (name) {
    case 'correo':
      return validateEmail(value);
    case 'contrasena':
      return validatePassword(value);
    case 'rol': {
      const validRoles = ['Optometrista', 'Asesor', 'Matriz', 'Administrador'];
      if (!value) return 'Rol es requerido';
      if (!validRoles.includes(value)) return 'Rol inválido';
      return null;
    }
    default:
      return null;
  }
};