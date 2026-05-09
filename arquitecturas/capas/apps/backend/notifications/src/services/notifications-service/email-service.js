const nodemailer = require("nodemailer");

class EmailService {
  transporter = null;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "and.694@gmail.com",
        pass: "yseu arbe ftgv savh ",
      },
    });
  }

  async sendNotification({ recipient, subject, content }) {
    try {
      await this.sendEmail({ recipient, subject, content });
      console.log(`Correo enviado a ${recipient}`);
    } catch (error) {
      console.error(`Error al enviar correo a ${recipient}:`, error);
    }
  }

  async sendEmail({ recipient, subject, content, from }) {
    await this.transporter.sendMail({
      from: "EPS Notificaciones  <eps.notificaciones@gmail.com>",
      to: recipient,
      subject: subject,
      html: content,
    });
  }
}

module.exports = EmailService;
