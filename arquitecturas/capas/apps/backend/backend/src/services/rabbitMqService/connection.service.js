const amqp = require("amqplib");

class ConnectionService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.url = process.env.RABBITMQ_URL || "amqp://localhost";
  }

  async connect() {
    for (let i = 0; i < 5; i++) {
      try {
        this.connection = await amqp.connect(this.url);
        this.channel = await this.connection.createChannel();
        console.log("✅ Conectado a RabbitMQ");
        return this.channel;
      } catch (err) {
        console.log(`⏳ Reintentando conexión a RabbitMQ (${i + 1}/5)...`);
        await new Promise((res) => setTimeout(res, 3000));
      }
    }
    throw new Error("No se pudo conectar a RabbitMQ");
  }

  getChannel() {
    if (!this.channel) throw new Error("RabbitMQ no conectado");
    return this.channel;
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}

module.exports = new ConnectionService();
