const { Resend } = require('resend');
const config = require('../config/config');

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {

  async sendResetPasswordEmail(email, resetToken) {

    const resetUrl = `${config.frontendUrl}/reset-password.html?token=${resetToken}`;

    try {

      const response = await resend.emails.send({
        from: 'Sistema Ventas <onboarding@resend.dev>',
        to: email,
        subject: 'Recuperación de Contraseña',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Recuperación de Contraseña</h2>

            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>

            <a href="${resetUrl}">
              Restablecer Contraseña
            </a>

            <p>O copia este enlace:</p>

            <p>${resetUrl}</p>
          </div>
        `
      });

      console.log('✅ Email enviado:', response);

      return response;

    } catch (error) {

      console.error('❌ Error enviando email:', error);

      throw new Error('Error al enviar email');

    }
  }

  async sendWelcomeEmail(email, nombre) {

    try {

      const response = await resend.emails.send({
        from: 'Sistema Ventas <onboarding@resend.dev>',
        to: email,
        subject: 'Bienvenido al Sistema',
        html: `
          <h2>Bienvenido ${nombre}</h2>
          <p>Tu cuenta ha sido creada exitosamente.</p>
        `
      });

      return response;

    } catch (error) {

      console.error(error);

    }
  }
}

module.exports = new EmailService();