const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER, // Tu correo electrónico
    pass: process.env.EMAIL_PASSWORD, // Tu contraseña o clave de aplicación
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
    const templatePath = path.join(__dirname, "../templates/emailTemplatePassword.html");
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
    const templatePath = path.join(__dirname, "../templates/emailTemplateInfo.html");
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
    const templatePath = path.join(__dirname, "../templates/emailComentTemplate.html");
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
const sendEmailPasswordRecovery = async (subject, text, to, templateVariables) => {
  try {
    const templatePath = path.join(__dirname, "../templates/passwordRecoveryTemplate.html");
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
    const templatePath = path.join(__dirname, "../templates/emailCatedraticoTemplate.html");
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
    const templatePath = path.join(__dirname, "../templates/emailDeliveryTask.html");
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
    const templatePath = path.join(__dirname, "../templates/emailThesisSubmission.html");
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
};
