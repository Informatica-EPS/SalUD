const appointmentClient = require("../appointment.client");
const NotificationsService = require("../notifications-service");
const rabbitMq = require("./rabbitMq");

class NotificationsConsumer {
  EXCHANGE = "clinic_events";
  QUEUE_NAME = "notifications_service_queue";

  constructor() {
    this.handlers = {
      "order.created": this.handleOrderCreated.bind(this),
      "user.registered": this.handleUserRegistered.bind(this),
      "appointment.canceled": this.handleAppointmentCanceled.bind(this),
    };

    this.EVENTS_TO_LISTEN = Object.keys(this.handlers);
  }

  async startConsuming() {
    const channel = rabbitMq.getChannel();

    await channel.assertExchange(this.EXCHANGE, "topic", { durable: true });
    await channel.assertQueue(this.QUEUE_NAME, { durable: true });

    for (const eventKey of this.EVENTS_TO_LISTEN) {
      await channel.bindQueue(this.QUEUE_NAME, this.EXCHANGE, eventKey);
    }

    channel.prefetch(1);
    console.log(
      `Escuchando ${this.EVENTS_TO_LISTEN.length} eventos en [${this.QUEUE_NAME}]...`,
    );

    channel.consume(
      this.QUEUE_NAME,
      async (msg) => {
        if (msg === null) return;

        try {
          const payload = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey;

          console.log(JSON.stringify({ routingKey, payload }));

          await this.routeEvent(routingKey, payload);

          channel.ack(msg);
        } catch (error) {
          console.error(`Error procesando el evento:`, error);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );
  }

  async routeEvent(routingKey, payload) {
    const handler = this.handlers[routingKey];

    if (handler) {
      await handler(payload);
    } else {
      console.log(`No hay un handler para el evento: ${routingKey}`);
    }
  }

  async handleOrderCreated(payload) {
    console.log("test", { payload });

    const data = payload.data.dataValues;

    console.log({ data });

    const appointment = await appointmentClient.getAppointmentById(data.idCita);

    const {
      Patient: {
        User: { primer_nombre, email },
      },
    } = appointment;

    const notificationService = new NotificationsService();

    const bodyMesagge = `Se ha creado la orden #${data.id}

        Detalles:
        - Especialidad: ${data.especialidad}
        - Descripción: ${data.descripcion}
        - Fecha de vencimiento: ${new Date(data.fechaVencimiento).toLocaleDateString()}

        ¡Gracias por confiar en SalUD!

      `;

    await notificationService.sendEmailNotification({
      recipient: email || "afarizal@udistrital.edu.co",
      subject: `${primer_nombre}! Tienes una nueva orden autorizada`,
      content: bodyMesagge.replace(/\n/g, "<br>"),
    });
    console.log("[order.created] procesado con éxito.");
  }

  async handleUserRegistered(payload) {
    console.log("[user.registered] procesado con éxito.");
  }

  async handleAppointmentCanceled(payload) {
    console.log("[appointment.canceled] procesado con éxito.");
  }
}

module.exports = new NotificationsConsumer();
