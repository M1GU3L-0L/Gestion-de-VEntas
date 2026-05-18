const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: 465,
      secure: true,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });
  }

  async sendEmail(options) {
    const mailOptions = {
      from: `Sistema de Ventas <${config.email.from}>`,
      to: options.email,
      subject: options.subject,
      html: options.message
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw error;
    }
  }

  async sendResetPasswordEmail(email, resetToken) {
    const resetUrl = `${config.frontendUrl}/reset-password.html?token=${resetToken}`;
    
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Recuperación de Contraseña</h2>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Restablecer Contraseña
        </a>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Este enlace expirará en 10 minutos.<br>
          Si no solicitaste restablecer tu contraseña, ignora este correo.
        </p>
      </div>
    `;

    await this.sendEmail({
      email,
      subject: 'Recuperación de Contraseña - Sistema de Ventas',
      message
    });
  }

  async sendWelcomeEmail(email, nombre) {
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">¡Bienvenido ${nombre}!</h2>
        <p>Tu cuenta ha sido creada exitosamente en el Sistema de Gestión de Ventas.</p>
        <p>Ya puedes iniciar sesión y comenzar a usar todas las funcionalidades del sistema.</p>
        <a href="${config.frontendUrl}" style="display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Ir al Sistema
        </a>
      </div>
    `;

    await this.sendEmail({
      email,
      subject: 'Bienvenido - Sistema de Ventas',
      message
    });
  }
}

module.exports = new EmailService();