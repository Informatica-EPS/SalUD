const db = require('../models/associations'); // Asumiendo que aquí exportas tu instancia de Sequelize
const { rabbitMQService } = require('../services/rabbitMqService/rabbitmq.service'); 

beforeAll(async () => {
  // Sincroniza la base de datos (force: true borra y recrea las tablas para tener datos limpios)
  // IMPORTANTE: Asegúrate de que package.json pase NODE_ENV=test
  if (process.env.NODE_ENV === 'test') {
    await db.sequelize.sync({ force: true });
  }
  
  // Si RabbitMQ da problemas en los tests, lo mockeamos (simulamos):
  jest.spyOn(rabbitMQService, 'publish').mockImplementation(() => Promise.resolve());
});

afterAll(async () => {
  // Cierra la conexión a la BD al terminar todas las pruebas
  await db.sequelize.close();
});