const ConsumerService = require("./consumer.service");
const PublisherService = require("./publisher.service");
const connectionService = require("./connection.service");
class RabbitMQService {
  constructor() {
    this.connectionService = connectionService;
    this.publisherService = new PublisherService(this.connectionService);
    this.consumerService = new ConsumerService(this.connectionService);
  }

  getPublisherService() {
    return this.publisherService;
  }

  getConsumerService() {
    return this.consumerService;
  }
}

module.exports = RabbitMQService;
