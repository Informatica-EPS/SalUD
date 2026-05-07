const EmailService = require("./email-service");

class NotificationsService {
  constructor() {
    this.emailService = new EmailService();
  }

  async sendEmailNotification({ recipient, subject, content, from }) {
    await this.emailService.sendNotification({
      recipient,
      subject,
      content,
      from,
    });
  }
}

module.exports = NotificationsService;
