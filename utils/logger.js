/**
 * @file utils/logger.js
 * @description Logger centralizado que filtra datos sensibles en producción.
 *
 * En producción (NODE_ENV=production):
 *  - logger.debug() → silenciado completamente
 *  - logger.info()  → silenciado completamente
 *  - logger.warn()  → activo (sin datos de usuario)
 *  - logger.error() → activo siempre
 *
 * Uso:
 *   const logger = require('../utils/logger');
 *   logger.info('Servidor listo');          // solo en desarrollo
 *   logger.debug('Password:', pwd);         // NUNCA en producción
 *   logger.error('Fallo crítico:', err);    // siempre
 */

const IS_DEV = process.env.NODE_ENV !== 'production';

const logger = {
  /** Solo se muestra en desarrollo — usar para flujos generales no sensibles */
  info: (...args) => {
    if (IS_DEV) console.log('[INFO]', ...args);
  },

  /**
   * NUNCA se muestra en producción.
   * Usar para datos de depuración (emails, carnets, IDs temporales).
   */
  debug: (...args) => {
    if (IS_DEV) console.log('[DEBUG]', ...args);
  },

  /** Advertencias — visibles en producción pero sin datos personales */
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },

  /** Errores — siempre visibles, no incluir datos personales en el mensaje */
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
};

module.exports = logger;
