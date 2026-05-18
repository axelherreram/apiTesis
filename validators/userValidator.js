/**
 * @file validators/userValidator.js
 * @description Esquemas de validación para endpoints de gestión de usuarios.
 */

const emailDomainRule = (v) =>
  !v.endsWith('@miumg.edu.gt') && 'El correo debe pertenecer al dominio @miumg.edu.gt.';

const emailFormatRule = (v, validator) =>
  !validator.isEmail(v) && 'Debe ser un correo electrónico válido.';

const carnetRule = (v) =>
  !/^\d{4}-\d{2}-\d{4,8}$/.test(v) && 'Carnet inválido. Formato esperado: XXXX-YY-XXXXXXXX.';

const nameRule = (v) =>
  (v.length < 2 || v.length > 100) && 'El nombre debe tener entre 2 y 100 caracteres.';

/**
 * Esquema para crear Administrador (POST /api/users/admin)
 */
const createAdminSchema = {
  email: {
    required: true,
    label: 'Correo electrónico',
    rules: [emailFormatRule, emailDomainRule],
  },
  name: {
    required: true,
    label: 'Nombre completo',
    rules: [nameRule],
  },
  carnet: {
    required: true,
    label: 'Carnet',
    rules: [carnetRule],
  },
  sede_id: {
    required: true,
    label: 'Sede',
    rules: [
      (v) => (isNaN(Number(v)) || Number(v) <= 0) && 'sede_id debe ser un número positivo.',
    ],
  },
};

/**
 * Esquema para crear usuario sin login (POST /api/users/create-no-login)
 */
const createUserNotlogSchema = {
  email: {
    required: true,
    label: 'Correo electrónico',
    rules: [emailFormatRule, emailDomainRule],
  },
  name: {
    required: true,
    label: 'Nombre completo',
    rules: [nameRule],
  },
  carnet: {
    required: true,
    label: 'Carnet',
    rules: [carnetRule],
  },
};

/**
 * Esquema para asignar admin a sede (POST /api/users/admin/assign)
 */
const assignAdminSchema = {
  user_id: {
    required: true,
    label: 'ID de usuario',
    rules: [
      (v) => (isNaN(Number(v)) || Number(v) <= 0) && 'user_id debe ser un número positivo.',
    ],
  },
  sede_id: {
    required: true,
    label: 'ID de sede',
    rules: [
      (v) => (isNaN(Number(v)) || Number(v) <= 0) && 'sede_id debe ser un número positivo.',
    ],
  },
};

module.exports = {
  createAdminSchema,
  createUserNotlogSchema,
  assignAdminSchema,
};
