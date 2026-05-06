const amqp = require("amqplib");

class RabbitMQConnection {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.url = process.env.RABBITMQ_URL || "amqp://localhost";
  }

  async connect() {
    if (this.connection) return;

    try {
      const amqpUrl = this.url;
      this.connection = await amqp.connect(amqpUrl);
      this.channel = await this.connection.createChannel();

      console.log("✅ Conexión a RabbitMQ establecida exitosamente");

      this.connection.on("error", (err) => {
        console.error("❌ Error en la conexión de RabbitMQ:", err);
      });

      this.connection.on("close", () => {
        console.warn("⚠️ Conexión de RabbitMQ cerrada");
      });
    } catch (error) {
      console.error("❌ Fallo al conectar con RabbitMQ:", error);
      process.exit(1);
    }
  }

  getChannel() {
    if (!this.channel) {
      throw new Error(
        "El canal de RabbitMQ no está inicializado. Llama a connect() primero.",
      );
    }
    return this.channel;
  }

  disconnect() {
    if (this.connection) {
      return this.connection.close();
    }
  }
}

module.exports = new RabbitMQConnection();
