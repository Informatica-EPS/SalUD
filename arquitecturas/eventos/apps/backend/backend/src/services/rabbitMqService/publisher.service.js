class PublisherService {
  constructor(connectionService) {
    this.connectionService = connectionService;
  }

  async setUp(EXCHANGE) {
    this.EXCHANGE = EXCHANGE;
    const channel = this.connectionService.getChannel();

    await channel.assertExchange(this.EXCHANGE, "topic", { durable: true });
  }

  async publishEvent(routingKey, data) {
    const channel = this.connectionService.getChannel();
    const message = JSON.stringify({
      event: routingKey,
      data,
      timestamp: new Date().toISOString(),
    });

    channel.publish(this.EXCHANGE, routingKey, Buffer.from(message), {
      persistent: true,
    });

    console.log(`📤 Evento publicado: ${routingKey}`);
  }
}

module.exports = PublisherService;
