/**
 * @file middlewares/validate.js
 * @description Middleware de validación centralizada.
 *
 * Usa el paquete `validator` (ya instalado) para definir esquemas reutilizables
 * sin necesidad de instalar dependencias adicionales.
 *
 * Uso en rutas:
 *   const { validate } = require('../middlewares/validate');
 *   const { loginSchema } = require('../validators/authValidator');
 *
 *   router.post('/login', validate(loginSchema), authController.loginUser);
 *
 * Definición de un esquema:
 *   const schema = {
 *     email: {
 *       required: true,
 *       label: 'Correo electrónico',
 *       rules: [
 *         (v) => !validator.isEmail(v) && 'Formato de correo inválido',
 *       ],
 *     },
 *   };
 */

const validator = require('validator');

/**
 * Genera el middleware de validación a partir de un esquema.
 * @param {Object} schema - Objeto cuyas claves son nombres de campos y
 *   valores son { required?, source?, label?, rules? }.
 *   - required {boolean}  - Si el campo es obligatorio (default: false)
 *   - source   {string}   - 'body' | 'params' | 'query' (default: 'body')
 *   - label    {string}   - Nombre legible para el error
 *   - rules    {Array}    - Funciones (value) => string|false
 *                           Devuelven el mensaje de error o false/undefined si es válido
 */
const validate = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, config] of Object.entries(schema)) {
    const source = config.source || 'body';
    const bag = source === 'params' ? req.params
               : source === 'query'  ? req.query
               : req.body;

    const raw   = bag[field];
    const value = typeof raw === 'string' ? raw.trim() : raw;
    const label = config.label || field;
    const isEmpty = value === undefined || value === null || value === '';

    if (config.required && isEmpty) {
      errors.push({ field, message: `${label} es obligatorio.` });
      continue; // No validar reglas si el campo está vacío y es requerido
    }

    // Solo ejecutar las reglas si hay un valor
    if (!isEmpty && config.rules) {
      for (const rule of config.rules) {
        const errorMsg = rule(String(value), validator);
        if (errorMsg) {
          errors.push({ field, message: errorMsg });
          break; // Una sola regla de error por campo
        }
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Los datos enviados no son válidos.',
      errors,
    });
  }

  next();
};

module.exports = { validate };
