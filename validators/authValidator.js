/**
 * @file validators/authValidator.js
 * @description Esquemas de validación para los endpoints de autenticación.
 */

/** Validaciones reutilizables */
const rules = {
  email: (v, validator) =>
    !validator.isEmail(v) && 'Debe ser un correo electrónico válido.',

  emailDomain: (v) =>
    !v.endsWith('@miumg.edu.gt') && 'El correo debe pertenecer al dominio @miumg.edu.gt.',

  passwordMin: (v) =>
    v.length < 4 && 'La contraseña debe tener al menos 4 caracteres.',
};

/**
 * Esquema para POST /auth/login
 */
const loginSchema = {
  email: {
    required: true,
    label: 'Correo electrónico',
    rules: [rules.email],
  },
  password: {
    required: true,
    label: 'Contraseña',
    rules: [rules.passwordMin],
  },
};

/**
 * Esquema para POST /auth/register
 */
const registerSchema = {
  email: {
    required: true,
    label: 'Correo electrónico',
    rules: [rules.email, rules.emailDomain],
  },
  password: {
    required: true,
    label: 'Contraseña',
    rules: [rules.passwordMin],
  },
  name: {
    required: true,
    label: 'Nombre',
    rules: [
      (v) => v.length < 2 && 'El nombre debe tener al menos 2 caracteres.',
      (v) => v.length > 100 && 'El nombre no puede superar 100 caracteres.',
    ],
  },
  carnet: {
    required: true,
    label: 'Carnet',
    rules: [
      (v) => !/^\d{4}-\d{2}-\d{4,8}$/.test(v) && 'Carnet inválido. Formato esperado: XXXX-YY-XXXXXXXX.',
    ],
  },
};

/**
 * Esquema para POST /auth/requestPasswordRecovery
 */
const requestPasswordRecoverySchema = {
  email: {
    required: true,
    label: 'Correo electrónico',
    rules: [rules.email],
  },
};

/**
 * Esquema para POST /auth/updatePassword
 */
const updatePasswordSchema = {
  currentPassword: {
    required: true,
    label: 'Contraseña actual',
    rules: [rules.passwordMin],
  },
  newPassword: {
    required: true,
    label: 'Nueva contraseña',
    rules: [
      rules.passwordMin,
      (v) => v.length > 72 && 'La contraseña no puede superar 72 caracteres (límite de bcrypt).',
    ],
  },
};

module.exports = {
  loginSchema,
  registerSchema,
  requestPasswordRecoverySchema,
  updatePasswordSchema,
};
