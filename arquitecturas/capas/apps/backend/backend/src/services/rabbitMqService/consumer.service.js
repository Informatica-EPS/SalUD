class ConsumerService {
  constructor(connectionService) {
    this.connectionService = connectionService;
  }

  static async setUp(EXCHANGE, QUEUE, eventName) {
    this.EXCHANGE = EXCHANGE;
    this.QUEUE = QUEUE;
    this.eventName = eventName;
    const channel = this.connectionService.getChannel();

    await channel.assertExchange(this.EXCHANGE, "topic", { durable: true });
    await channel.assertQueue(this.QUEUE, { exclusive: true });

    await channel.bindQueue(this.QUEUE, this.EXCHANGE, this.eventName);

    console.log("👂 Escuchando eventos de órdenes...");

    channel.consume(this.QUEUE, async (msg) => {
      log(`📥 Evento recibido: ${msg.fields.routingKey}`);
      if (msg === null) return;
      const event = JSON.parse(msg.content.toString());
      console.log(`📥 Evento recibido: ${event.event}`);
      try {
      } catch (error) {}
    });
  }
}

module.exports = ConsumerService;
