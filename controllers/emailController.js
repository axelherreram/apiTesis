const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Configurar transporte de correo utilizando variables de entorno
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Tu correo almacenado en una variable de entorno
    pass: process.env.EMAIL_PASSWORD, // Tu contraseña almacenada en una variable de entorno
  },
});

// Función para cargar la plantilla desde un archivo
const loadTemplate = (templatePath, variables) => {
  let template = fs.readFileSync(templatePath, "utf8");

  // Reemplazar las variables en la plantilla
  for (const key in variables) {
    const regex = new RegExp(`{{${key}}}`, "g");
    template = template.replace(regex, variables[key]);
  }

  return template;
};

// Controlador para enviar correos electrónicos con HTML cargado desde una plantilla
const sendEmailPassword = async (subject, text, to, templateVariables) => {
  try {
    const templatePath = path.join(__dirname, "../templates/emailTemplatePassword.html");
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER, // Correo definido en las variables de entorno
      to: to, // Dirección de correo del destinatario
      subject: subject, // Asunto del correo
      text: text, // Contenido en texto plano
      html: htmlContent, // Contenido en formato HTML
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error al enviar correo: ${error.message}`);
  }
};

const sendEmailTask = async (subject, text, to, templateVariables) => {
  try {
    const templatePath = path.join(__dirname, "../templates/emailTemplateInfo.html"); // Plantilla de notificación
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: to, 
      subject: subject, // Asunto del correo 
      text: text, // Contenido en texto plano
      html: htmlContent, // Contenido en formato HTML
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error al enviar correo: ${error.message}`);
  }
};

const sendCommentEmail = async (subject, text, to, templateVariables) => {
  try {
    const templatePath = path.join(__dirname, "../templates/emailComentTemplate.html"); 
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: to, 
      subject: subject, // Asunto del correo (
      text: text, // Contenido en texto plano
      html: htmlContent, // Contenido en formato HTML
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error al enviar correo: ${error.message}`);
  }
};


// Función para enviar correo con la nueva contraseña
const sendEmailPasswordRecovery = async (subject, text, to, templateVariables) => {
  try {
    const templatePath = path.join(__dirname, "../templates/passwordRecoveryTemplate.html");
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER, // Correo definido en las variables de entorno
      to: to, // Dirección de correo del destinatario
      subject: subject, // Asunto del correo
      text: text, // Contenido en texto plano
      html: htmlContent, // Contenido en formato HTML
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error al enviar correo: ${error.message}`);
  }
};


// Función para enviar correo a catedráticos con su asignación a la plataforma
const sendEmailCatedratico = async (subject, to, templateVariables) => {
  try {
    const templatePath = path.join(__dirname, "../templates/emailCatedraticoTemplate.html"); 
    const htmlContent = loadTemplate(templatePath, templateVariables);

    const mailOptions = {
      from: process.env.EMAIL_USER, // Correo definido en las variables de entorno
      to: to, // Dirección de correo del destinatario
      subject: subject, // Asunto del correo
      html: htmlContent, // Contenido en formato HTML
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${to}: ${info.response}`);
  } catch (error) {
    console.error(`Error al enviar correo: ${error.message}`);
  }
};

module.exports = {
    sendEmailPassword,
    sendEmailTask,
    sendCommentEmail,
    sendEmailPasswordRecovery,
    sendEmailCatedratico
};
