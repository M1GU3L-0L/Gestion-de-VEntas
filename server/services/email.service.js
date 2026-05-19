const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {

  constructor() {

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });

  }

  async sendEmail(options) {

    const mailOptions = {
      from: `Sistema Ventas <${config.email.from}>`,
      to: options.email,
      subject: options.subject,
      html: options.message
    };

    return await this.transporter.sendMail(mailOptions);

  }

  async sendResetPasswordEmail(email, resetToken) {

    const resetUrl =
      `${config.frontendUrl}/reset-password.html?token=${resetToken}`;

    const message = `
      <h2>Recuperación de contraseña</h2>

      <p>Haz clic en el siguiente enlace:</p>

      <a href="${resetUrl}">
        Restablecer contraseña
      </a>

      <p>${resetUrl}</p>
    `;

    return await this.sendEmail({
      email,
      subject: 'Recuperación de contraseña',
      message
    });

  }

  async sendWelcomeEmail(email, nombre) {

    const message = `
      <h2>Bienvenido ${nombre}</h2>
      <p>Tu cuenta fue creada exitosamente.</p>
    `;

    return await this.sendEmail({
      email,
      subject: 'Bienvenido',
      message
    });

  }
}

module.exports = new EmailService();