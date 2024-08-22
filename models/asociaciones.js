// models/associateModels.js

const Usuarios = require('./usuarios');
const CursoAsignacion = require('./cursoAsignacion');
const Cursos = require('./cursos');
const AsignacionEstudiante = require('./asignacionEstudiante');

module.exports = function associateModels() {
  // Asegúrate de que los modelos estén correctamente asociados
  Usuarios.hasMany(CursoAsignacion, { foreignKey: 'estudiante_id' });
  Usuarios.hasMany(AsignacionEstudiante, { foreignKey: 'estudiante_id', as: 'asignacionesEstudiante' });
  Usuarios.hasMany(AsignacionEstudiante, { foreignKey: 'catedratico_id', as: 'asignacionesCatedratico' });

  CursoAsignacion.belongsTo(Usuarios, { foreignKey: 'estudiante_id' });
  CursoAsignacion.belongsTo(Cursos, { foreignKey: 'curso_id' });

  AsignacionEstudiante.belongsTo(Usuarios, { foreignKey: 'estudiante_id', as: 'estudiante' });
  AsignacionEstudiante.belongsTo(Usuarios, { foreignKey: 'catedratico_id', as: 'catedratico' });
};
