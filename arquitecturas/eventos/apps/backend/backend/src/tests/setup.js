const sequelize = require('../config/database'); // <-- IMPORTACIÓN CORREGIDA
const { rabbitMQService } = require('../services/rabbitMqService/rabbitmq.service'); 

beforeAll(async () => {
  // Sincroniza la base de datos (borra y recrea las tablas para tener datos limpios)
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync({ force: true }); // <-- USAMOS 'sequelize' DIRECTAMENTE
  }
  
  // Prevenimos que RabbitMQ intente conectarse de verdad durante los tests
  if (rabbitMQService && rabbitMQService.publish) {
    jest.spyOn(rabbitMQService, 'publish').mockImplementation(() => Promise.resolve());
  }
});

afterAll(async () => {
  // Cierra la conexión a la BD al terminar todas las pruebas
  if (sequelize) {
    await sequelize.close(); // <-- USAMOS 'sequelize' DIRECTAMENTE
  }
});