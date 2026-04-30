-- ============================================================
-- SCHEMA NORMALIZADO - apiTesis (3NF)
-- Cambios aplicados:
--   1. task.year_id eliminado (transitivo via asigCourse_id)
--   2. studentcomision.year_id eliminado (transitivo via group_id)
--   3. comisiones.year_id eliminado (transitivo via group_id)
--   4. notification.sede_id eliminado (transitivo via student_id)
--   5. applog.username eliminado (transitivo via user_id)
--   6. approvalthesis.approved eliminado (redundante con status ENUM)
--   7. commentversion.role convertido a ENUM
--   8. thesissubmissions.approved_proposal convertido a ENUM
--   9. Constraints UNIQUE compuestos en tablas pivote
--  10. Indices de FK en todas las tablas para optimizar JOINs
--  11. notification_text ampliado a TEXT
--  12. courseassignment UNIQUE(student_id, asigCourse_id)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. TABLAS DE CATÁLOGO (sin dependencias)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    rol_id    INT          NOT NULL AUTO_INCREMENT,
    name      VARCHAR(100) NOT NULL,
    PRIMARY KEY (rol_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS year (
    year_id INT  NOT NULL AUTO_INCREMENT,
    year    YEAR NOT NULL,
    PRIMARY KEY (year_id),
    UNIQUE KEY uq_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sede (
    sede_id  INT          NOT NULL AUTO_INCREMENT,
    nameSede VARCHAR(200) NOT NULL,
    address  VARCHAR(255)     NULL,
    PRIMARY KEY (sede_id),
    UNIQUE KEY uq_sede_name (nameSede)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS course (
    course_id  INT          NOT NULL AUTO_INCREMENT,
    courseName VARCHAR(255) NOT NULL,
    PRIMARY KEY (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS typetask (
    typeTask_id INT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    PRIMARY KEY (typeTask_id),
    UNIQUE KEY uq_typetask_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS rolcomision (
    rol_comision_id  INT          NOT NULL AUTO_INCREMENT,
    rolComisionName  VARCHAR(100) NOT NULL,
    PRIMARY KEY (rol_comision_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 2. USER (depende de: roles, sede, year)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user (
    user_id         INT          NOT NULL AUTO_INCREMENT,
    email           VARCHAR(200) NOT NULL,
    password        VARCHAR(200) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    carnet          VARCHAR(25)      NULL,
    sede_id         INT              NULL,
    rol_id          INT          NOT NULL DEFAULT 1,
    year_id         INT              NULL,
    profilePhoto    VARCHAR(200)     NULL,
    active          TINYINT(1)   NOT NULL DEFAULT 1,
    passwordUpdate  TINYINT(1)   NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_user_carnet (carnet),
    UNIQUE KEY uq_user_email  (email),
    KEY idx_user_sede   (sede_id),
    KEY idx_user_rol    (rol_id),
    KEY idx_user_year   (year_id),
    CONSTRAINT fk_user_sede  FOREIGN KEY (sede_id)  REFERENCES sede  (sede_id),
    CONSTRAINT fk_user_rol   FOREIGN KEY (rol_id)   REFERENCES roles (rol_id),
    CONSTRAINT fk_user_year  FOREIGN KEY (year_id)  REFERENCES year  (year_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 3. COURSESEDEASSIGNMENT
--    Asigna un curso a una sede en un año académico.
--    UNIQUE compuesto evita duplicados.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS coursesedeassignment (
    asigCourse_id INT         NOT NULL AUTO_INCREMENT,
    course_id     INT         NOT NULL,
    sede_id       INT         NOT NULL,
    year_id       INT         NOT NULL,
    courseActive  TINYINT(1)  NOT NULL DEFAULT 1,
    PRIMARY KEY (asigCourse_id),
    UNIQUE KEY uq_csassign (course_id, sede_id, year_id),
    KEY idx_csassign_course (course_id),
    KEY idx_csassign_sede   (sede_id),
    KEY idx_csassign_year   (year_id),
    CONSTRAINT fk_csassign_course FOREIGN KEY (course_id) REFERENCES course (course_id),
    CONSTRAINT fk_csassign_sede   FOREIGN KEY (sede_id)   REFERENCES sede   (sede_id),
    CONSTRAINT fk_csassign_year   FOREIGN KEY (year_id)   REFERENCES year   (year_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 4. COURSEASSIGNMENT
--    Inscripción de un estudiante a un curso-sede-año.
--    UNIQUE compuesto evita inscripción duplicada.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS courseassignment (
    courseAssignment_id INT   NOT NULL AUTO_INCREMENT,
    student_id          INT   NOT NULL,
    asigCourse_id       INT   NOT NULL,
    note                FLOAT     NULL DEFAULT NULL,
    PRIMARY KEY (courseAssignment_id),
    UNIQUE KEY uq_courseassign (student_id, asigCourse_id),
    KEY idx_courseassign_student    (student_id),
    KEY idx_courseassign_asigcourse (asigCourse_id),
    CONSTRAINT fk_courseassign_student    FOREIGN KEY (student_id)    REFERENCES user                (user_id),
    CONSTRAINT fk_courseassign_asigcourse FOREIGN KEY (asigCourse_id) REFERENCES coursesedeassignment (asigCourse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 5. TASK
--    ELIMINADO: year_id (transitivo via asigCourse_id -> coursesedeassignment.year_id)
--    Fechas consolidadas en DATETIME para evitar duplicación de campos DATE+TIME.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS task (
    task_id       INT          NOT NULL AUTO_INCREMENT,
    asigCourse_id INT          NOT NULL,
    typeTask_id   INT          NOT NULL,
    title         VARCHAR(255) NOT NULL,
    description   TEXT         NOT NULL,
    taskStart     DATETIME     NOT NULL,
    endTask       DATETIME     NOT NULL,
    PRIMARY KEY (task_id),
    KEY idx_task_asigcourse (asigCourse_id),
    KEY idx_task_typetask   (typeTask_id),
    CONSTRAINT fk_task_asigcourse FOREIGN KEY (asigCourse_id) REFERENCES coursesedeassignment (asigCourse_id),
    CONSTRAINT fk_task_typetask   FOREIGN KEY (typeTask_id)   REFERENCES typetask             (typeTask_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 6. TIMELINEEVENTOS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS timelineeventos (
    evento_id   INT          NOT NULL AUTO_INCREMENT,
    user_id     INT          NOT NULL,
    typeEvent   VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    task_id     INT              NULL,
    date        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (evento_id),
    KEY idx_timeline_user (user_id),
    KEY idx_timeline_task (task_id),
    CONSTRAINT fk_timeline_user FOREIGN KEY (user_id) REFERENCES user (user_id),
    CONSTRAINT fk_timeline_task FOREIGN KEY (task_id) REFERENCES task (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 7. COMMENTS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS comments (
    comment_id     INT        NOT NULL AUTO_INCREMENT,
    user_id        INT        NOT NULL,
    task_id        INT        NOT NULL,
    comment_active TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (comment_id),
    KEY idx_comments_user (user_id),
    KEY idx_comments_task (task_id),
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES user (user_id),
    CONSTRAINT fk_comments_task FOREIGN KEY (task_id) REFERENCES task (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 8. COMMENTVERSION
--    role convertido a ENUM (eliminado validación en app).
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS commentversion (
    commentVersion_id INT                        NOT NULL AUTO_INCREMENT,
    comment_id        INT                        NOT NULL,
    comment           TEXT                       NOT NULL,
    role              ENUM('student','teacher')  NOT NULL,
    datecomment       DATETIME                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (commentVersion_id),
    KEY idx_commentversion_comment (comment_id),
    CONSTRAINT fk_commentversion_comment FOREIGN KEY (comment_id) REFERENCES comments (comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 9. TASKSUBMISSIONS
--    UNIQUE(user_id, task_id) evita entregas duplicadas.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tasksubmissions (
    submission_id       INT        NOT NULL AUTO_INCREMENT,
    user_id             INT        NOT NULL,
    task_id             INT        NOT NULL,
    submission_complete TINYINT(1) NOT NULL DEFAULT 0,
    file_path           VARCHAR(500)   NULL,
    date                DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (submission_id),
    UNIQUE KEY uq_tasksubmit (user_id, task_id),
    KEY idx_tasksubmit_user (user_id),
    KEY idx_tasksubmit_task (task_id),
    CONSTRAINT fk_tasksubmit_user FOREIGN KEY (user_id) REFERENCES user (user_id),
    CONSTRAINT fk_tasksubmit_task FOREIGN KEY (task_id) REFERENCES task (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 10. THESISSUBMISSIONS
--     approved_proposal convertido a ENUM semántico.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS thesissubmissions (
    thesisSubmissions_id INT                                              NOT NULL AUTO_INCREMENT,
    user_id              INT                                              NOT NULL,
    task_id              INT                                              NOT NULL,
    file_path            VARCHAR(500)                                     NOT NULL,
    date                 DATETIME                                         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_proposal    ENUM('pending','approved','needs_changes','rejected') NOT NULL DEFAULT 'pending',
    PRIMARY KEY (thesisSubmissions_id),
    KEY idx_thesissubmit_user (user_id),
    KEY idx_thesissubmit_task (task_id),
    CONSTRAINT fk_thesissubmit_user FOREIGN KEY (user_id) REFERENCES user (user_id),
    CONSTRAINT fk_thesissubmit_task FOREIGN KEY (task_id) REFERENCES task (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 11. GROUPCOMISION
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS groupcomision (
    group_id    INT        NOT NULL AUTO_INCREMENT,
    year_id     INT        NOT NULL,
    sede_id     INT        NOT NULL,
    activeGroup TINYINT(1) NOT NULL DEFAULT 1,
    createdAt   DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt   DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id),
    KEY idx_groupcomision_year (year_id),
    KEY idx_groupcomision_sede (sede_id),
    CONSTRAINT fk_groupcomision_year FOREIGN KEY (year_id) REFERENCES year (year_id),
    CONSTRAINT fk_groupcomision_sede FOREIGN KEY (sede_id) REFERENCES sede (sede_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 12. COMISIONES
--     ELIMINADO: year_id (transitivo via group_id -> groupcomision.year_id)
--     UNIQUE compuesto evita asignación duplicada de un usuario al mismo grupo con el mismo rol.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS comisiones (
    comision_id     INT NOT NULL AUTO_INCREMENT,
    group_id        INT NOT NULL,
    user_id         INT NOT NULL,
    rol_comision_id INT NOT NULL,
    PRIMARY KEY (comision_id),
    UNIQUE KEY uq_comision (group_id, user_id, rol_comision_id),
    KEY idx_comision_group (group_id),
    KEY idx_comision_user  (user_id),
    KEY idx_comision_rol   (rol_comision_id),
    CONSTRAINT fk_comision_group FOREIGN KEY (group_id)        REFERENCES groupcomision (group_id),
    CONSTRAINT fk_comision_user  FOREIGN KEY (user_id)         REFERENCES user          (user_id),
    CONSTRAINT fk_comision_rol   FOREIGN KEY (rol_comision_id) REFERENCES rolcomision   (rol_comision_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 13. STUDENTCOMISION
--     ELIMINADO: year_id (transitivo via group_id -> groupcomision.year_id)
--     UNIQUE(group_id, user_id) evita duplicados.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS studentcomision (
    estudiante_comision_id INT NOT NULL AUTO_INCREMENT,
    group_id               INT NOT NULL,
    user_id                INT NOT NULL,
    PRIMARY KEY (estudiante_comision_id),
    UNIQUE KEY uq_studentcomision (group_id, user_id),
    KEY idx_studentcomision_group (group_id),
    KEY idx_studentcomision_user  (user_id),
    CONSTRAINT fk_studentcomision_group FOREIGN KEY (group_id) REFERENCES groupcomision (group_id),
    CONSTRAINT fk_studentcomision_user  FOREIGN KEY (user_id)  REFERENCES user          (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 14. REVISIONTHESIS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS revisionthesis (
    revision_thesis_id   INT          NOT NULL AUTO_INCREMENT,
    user_id              INT          NOT NULL,
    sede_id              INT          NOT NULL,
    active_process       TINYINT(1)   NOT NULL DEFAULT 1,
    date_revision        DATETIME         NULL DEFAULT CURRENT_TIMESTAMP,
    approval_letter_dir  VARCHAR(500)     NULL,
    thesis_dir           VARCHAR(500)     NULL,
    PRIMARY KEY (revision_thesis_id),
    KEY idx_revisionthesis_user (user_id),
    KEY idx_revisionthesis_sede (sede_id),
    CONSTRAINT fk_revisionthesis_user FOREIGN KEY (user_id) REFERENCES user (user_id),
    CONSTRAINT fk_revisionthesis_sede FOREIGN KEY (sede_id) REFERENCES sede (sede_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 15. ASSIGNEDREVIEW
--     UNIQUE(revision_thesis_id, user_id) evita asignación duplicada.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS assignedreview (
    assigned_review_id  INT      NOT NULL AUTO_INCREMENT,
    revision_thesis_id  INT      NOT NULL,
    user_id             INT      NOT NULL,
    date_assigned       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (assigned_review_id),
    UNIQUE KEY uq_assignedreview (revision_thesis_id, user_id),
    KEY idx_assignedreview_revision (revision_thesis_id),
    KEY idx_assignedreview_user     (user_id),
    CONSTRAINT fk_assignedreview_revision FOREIGN KEY (revision_thesis_id) REFERENCES revisionthesis (revision_thesis_id),
    CONSTRAINT fk_assignedreview_user     FOREIGN KEY (user_id)            REFERENCES user           (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 16. APPROVALTHESIS
--     ELIMINADO: approved BOOLEAN (redundante con status ENUM)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS approvalthesis (
    approval_id        INT                                          NOT NULL AUTO_INCREMENT,
    revision_thesis_id INT                                          NOT NULL,
    user_id            INT                                          NOT NULL,
    date_approved      DATETIME                                         NULL,
    status             ENUM('pending','approved','rejected','in revision') NOT NULL DEFAULT 'pending',
    PRIMARY KEY (approval_id),
    KEY idx_approvalthesis_revision (revision_thesis_id),
    KEY idx_approvalthesis_user     (user_id),
    CONSTRAINT fk_approvalthesis_revision FOREIGN KEY (revision_thesis_id) REFERENCES revisionthesis (revision_thesis_id),
    CONSTRAINT fk_approvalthesis_user     FOREIGN KEY (user_id)            REFERENCES user           (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 17. COMMENTSREVISION
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS commentsrevision (
    commentsRevision_id INT          NOT NULL AUTO_INCREMENT,
    assigned_review_id  INT          NOT NULL,
    title               VARCHAR(150) NOT NULL,
    comment             TEXT         NOT NULL,
    date_comment        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (commentsRevision_id),
    KEY idx_commentsrevision_review (assigned_review_id),
    CONSTRAINT fk_commentsrevision_review FOREIGN KEY (assigned_review_id) REFERENCES assignedreview (assigned_review_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 18. NOTIFICATION
--     ELIMINADO: sede_id (transitivo via student_id -> user.sede_id)
--     notification_text ampliado a TEXT.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notification (
    notification_id   INT                        NOT NULL AUTO_INCREMENT,
    notification_text TEXT                       NOT NULL,
    student_id        INT                        NOT NULL,
    task_id           INT                        NOT NULL,
    notification_date DATETIME                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type_notification ENUM('student','general')  NOT NULL,
    PRIMARY KEY (notification_id),
    KEY idx_notification_student (student_id),
    KEY idx_notification_task    (task_id),
    CONSTRAINT fk_notification_student FOREIGN KEY (student_id) REFERENCES user (user_id),
    CONSTRAINT fk_notification_task    FOREIGN KEY (task_id)    REFERENCES task (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 19. APPLOG
--     ELIMINADO: username (transitivo via user_id -> user.name)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS applog (
    log_id   INT          NOT NULL AUTO_INCREMENT,
    user_id  INT          NOT NULL,
    sede_id  INT              NULL,
    action   VARCHAR(255) NOT NULL,
    details  TEXT         NOT NULL,
    date     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (log_id),
    KEY idx_applog_user (user_id),
    KEY idx_applog_sede (sede_id),
    CONSTRAINT fk_applog_user FOREIGN KEY (user_id) REFERENCES user (user_id),
    CONSTRAINT fk_applog_sede FOREIGN KEY (sede_id) REFERENCES sede (sede_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
