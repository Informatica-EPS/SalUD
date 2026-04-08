require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/error.middleware");
const rabbitMQ = require("./services/rabbitMqService/rabbitMq");
const notificationsConsumer = require("./services/rabbitMqService/notificationsConsumer");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    console.log("🚀 Iniciando el servicio de notificaciones...");
    await rabbitMQ.connect();

    await notificationsConsumer.startConsuming();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const gracefulShutdown = async () => {
      console.log("🔌 Cerrando conexión a RabbitMQ...");
      await rabbitMQ.disconnect();
      process.exit(0);
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGUSR2", gracefulShutdown);
  } catch (error) {
    console.error("Error during bootstrap:", error);
    process.exit(1);
  }
}

bootstrap();
