const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Configuración del servicio de envío de correos electrónicos
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * @function loadTemplate
 * @description Loads an email template from the specified path and replaces variables within the template.
 * @param {string} templatePath - The path to the template file.
 * @param {Object} variables - Key-value pairs where keys represent placeholders in the template and values replace them.
 * @returns {string} - The processed HTML content of the email template.
 * @example
 * const template = loadTemplate('./templates/email.html', { name: 'John', link: 'example.com' });
 */
const loadTemplate = (templatePath, variables) => {
  let template = fs.readFileSync(templatePath, "utf8");

  // Replace variables in the template
  for (const key in variables) {
    const regex = new RegExp(`{{${key}}}`, "g");
    template = template.replace(regex, variables[key]);
  }

  return template;
};

/**
 * @function sendEmailPassword
 * @description Sends an email with a password-related template to the specified recipient.
 * @param {string} subject - The email subject.
 * @param {string} text - Plain text content for the email.
 * @param {string} to - The recipient's email address.
 * @param {Object} templateVariables - Key-value pairs for template placeholders.
 * @example
 * sendEmailPassword('Reset Your Password', 'Please check your email.', 'user@example.com', { link: 'reset-link.com' });
 */
const sendEmailPassword = async (subject, text, to, templateVariables) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/emailTemplatePassword.html"
    );
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

/**
 * @function sendEmailTask
 * @description Sends a task notification email to the specified recipient using a predefined template.
 * @param {string} subject - The email subject.
 * @param {string} text - Plain text content for the email.
 * @param {string} to - The recipient's email address.
 * @param {Object} templateVariables - Key-value pairs for template placeholders.
 * @example
 * sendEmailTask('Task Notification', 'You have a new task.', 'user@example.com', { taskName: 'Math Homework' });
 */
const sendEmailTask = async (subject, text, to, templateVariables) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/emailTemplateInfo.html"
    );
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

/**
 * @function sendCommentEmail
 * @description Sends a comment notification email using a specific template.
 * @param {string} subject - The email subject.
 * @param {string} text - Plain text content for the email.
 * @param {string} to - The recipient's email address.
 * @param {Object} templateVariables - Key-value pairs for template placeholders.
 * @example
 * sendCommentEmail('New Comment', 'Check your latest comment.', 'user@example.com', { comment: 'Good work!' });
 */
const sendCommentEmail = async (subject, text, to, templateVariables) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/emailComentTemplate.html"
    );
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

/**
 * @function sendEmailPasswordRecovery
 * @description Sends an email with a password recovery template to the specified recipient.
 * @param {string} subject - The email subject.
 * @param {string} text - Plain text content for the email.
 * @param {string} to - The recipient's email address.
 * @param {Object} templateVariables - Key-value pairs for template placeholders.
 * @example
 * sendEmailPasswordRecovery('Password Recovery', 'Follow the instructions.', 'user@example.com', { link: 'recovery-link.com' });
 */
const sendEmailPasswordRecovery = async (
  subject,
  text,
  to,
  templateVariables
) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/passwordRecoveryTemplate.html"
    );
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

/**
 * @function sendEmailCatedratico
 * @description Sends an email to professors with specific details using a predefined template.
 * @param {string} subject - The email subject.
 * @param {string} to - The recipient's email address.
 * @param {Object} templateVariables - Key-value pairs for template placeholders.
 * @example
 * sendEmailCatedratico('New Notification', 'professor@example.com', { courseName: 'Mathematics' });
 */
const sendEmailCatedratico = async (subject, to, templateVariables) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/emailCatedraticoTemplate.html"
    );
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

/**
 * @function sendEmailConfirmDelivery
 * @description Envía un correo electrónico para confirmar la entrega de una tarea o capítulo.
 * @param {string} subject - El asunto del correo electrónico.
 * @param {string} to - La dirección de correo electrónico del destinatario.
 * @param {Object} templateVariables - Un objeto con los valores que se reemplazarán en la plantilla.
 * @example
 * sendEmailConfirmDelivery(
 *   'Confirmación de Entrega',
 *   'catedratico@example.com',
 *   { estudiante: 'Juan Pérez', tituloEntrega: 'Capítulo 1', deliveryDate: '05/02/2025' }
 * );
 */
const sendEmailConfirmDelivery = async (subject, to, templateVariables) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/emailDeliveryTask.html"
    );
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

/**
 * @function sendEmailThesisSubmission
 * @description Sends an email notification to a professor about a new thesis proposal submission.
 * @param {string} subject - The email subject.
 * @param {string} to - The recipient's email address (professor).
 * @param {Object} templateVariables - Key-value pairs for template placeholders.
 * @example
 * sendEmailThesisSubmission(
 *   'New Thesis Proposal Submission',
 *   'professor@example.com',
 *   { professor: 'Dr. Smith', student: 'John Doe', thesisTitle: 'AI in Education', submissionDate: '05/02/2025', description: 'Exploring AI applications in learning environments' }
 * );
 */
const sendEmailThesisSubmission = async (subject, to, templateVariables) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/emailThesisSubmission.html"
    );
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

/**
 * @function sendEmailThesisRequest
 * @description Sends an email notification about a new thesis review request.
 * @param {string} subject - The subject of the email.
 * @param {string} to - The email address of the recipient (professor).
 * @param {Object} templateVariables - An object containing values to replace the placeholders in the email template.
 * @param {string} templateVariables.recipient_name - The name of the professor who will receive the notification.
 * @param {string} templateVariables.student_name - The name of the student who made the review request.
 * @param {string} templateVariables.campus_name - The name of the campus where the review request was made.
 * @param {string} templateVariables.requestDate - The date the review request was made.
 *
 *
 * @example
 * sendEmailThesisRequest(
 *   'Thesis Review Request',
 *   'professor@example.com',
 *   {
 *     recipient_name: 'Dr. Gomez',
 *     student_name: 'Ana Perez',
 *     campus_name: 'Central',
 *     requestDate: '03/10/2025',
 *   }
 * );
 *
 * @returns {Promise<void>} Returns a promise indicating the result of the email sending process.
 */
const sendEmailThesisRequest = async (subject, to, templateVariables) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/emailRevisionRequest.html"
    );
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

/**
 * @function sendEmailReviewerAsigned
 * @description Sends an email notification to a reviewer about a new thesis review request.
 * @param {string} subject - The subject of the email.
 * @param {string} to - The email address of the recipient (professor).
 * @param {Object} templateVariables - An object containing values to replace the placeholders in the email template.
 * @param {string} templateVariables.reviewer_name - The name of the revisor who will receive the notification.
 * @param {string} templateVariables.reviewer_date - The date the review request was made.
 *
 * @example
 * sendEmailReviewerAsigned(
 *  'Thesis Review Request',
 *  'review@miumg.edt'
 * {
 *   reviewer_name: 'Dr. Smith',
 *   reviewer_date: '05/02/2025',
 * }
 * );
 *
 * @returns {Promise<void>} Returns a promise indicating the result of the email sending process.
 *  */
const sendEmailReviewerAsigned = async (subject, to, templateVariables) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/emailNewResisionAsigned.html"
    );
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

/**
 * @function sendEmailCommentRevisionAproved
 * @description Sends an email notification to a student about a new comment revision.
 * @param {string} subject - The subject of the email.
 * @param {string} to - The email address of the recipient (student).
 * @param {Object} templateVariables - An object containing values to replace the placeholders in the email template.
 * @param {string} templateVariables.student_name - The name of the student who will receive the notification.
 * @param {string} templateVariables.reviewer_name - The name of the reviewer who made the comment.
 * @param {string} templateVariables.comment - The comment made by the reviewer.
 * @param {string} templateVariables.status - The status of the comment (approved or rejected).
 * @param {string} templateVariables.date - The date the comment was made.
 * @example
 * sendEmailCommentRevision(
 *  'Comment Revision',
 * 'student@gmail.com',
 * {
 *  student_name: 'John Doe',
 *  title: 'Comment title',
 *  comment: 'Good work!',
 *  approval_status: 'approved',
 *  status_message: 'Rechazada.',
 *  date: '05/02/2025',
 * }
 * );
 * @returns {Promise<void>} Returns a promise indicating the result of the email sending process.
 */
const sendEmailCommentRevisionAproved = async (
  subject,
  to,
  templateVariables
) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/emailCommentRevisionAproved.html"
    );
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

/**
 * @function sendEmailCommentRevisionRejected
 * @description Sends an email notification to a student about a new comment revision.
 * @param {string} subject - The subject of the email.
 * @param {string} to - The email address of the recipient (student).
 * @param {Object} templateVariables - An object containing values to replace the placeholders in the email template.
 * @param {string} templateVariables.student_name - The name of the student who will receive the notification.
 * @param {string} templateVariables.reviewer_name - The name of the reviewer who made the comment.
 * @param {string} templateVariables.comment - The comment made by the reviewer.
 * @param {string} templateVariables.status - The status of the comment (approved or rejected).
 * @param {string} templateVariables.date - The date the comment was made.
 * @example
 * sendEmailCommentRevision(
 *  'Comment Revision',
 * 'student@gmail.com',
 * {
 *  student_name: 'John Doe',
 *  title: 'Comment title',
 *  comment: 'Good work!',
 *  approval_status: 'approved',
 *  status_message: 'Rechazada.',
 *  date: '05/02/2025',
 * }
 * );
 * @returns {Promise<void>} Returns a promise indicating the result of the email sending process.
 */
const sendEmailCommentRevisionRejected = async (
  subject,
  to,
  templateVariables
) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/emailCommentRevisionRejected.html"
    );
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

module.exports = {
  sendEmailPassword,
  sendEmailTask,
  sendCommentEmail,
  sendEmailPasswordRecovery,
  sendEmailCatedratico,
  sendEmailConfirmDelivery,
  sendEmailThesisSubmission,
  sendEmailThesisRequest,
  sendEmailReviewerAsigned,
  sendEmailCommentRevisionAproved,
  sendEmailCommentRevisionRejected,
};
