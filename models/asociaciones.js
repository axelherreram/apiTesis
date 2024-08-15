const Usuarios = require('./usuarios');
const CursoAsignacion = require('./cursoAsignacion');
const Cursos = require('./cursos');

// Asegurarse de que las asociaciones están definidas
Usuarios.associate({ CursoAsignacion });
CursoAsignacion.associate({ Usuarios, Cursos });
