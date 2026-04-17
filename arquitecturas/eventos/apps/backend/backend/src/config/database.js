require("dotenv").config();
const { Sequelize } = require("sequelize");

let sequelize;

// Si estamos en entorno de pruebas, usamos una base de datos temporal en memoria
if (process.env.NODE_ENV === "test") {
  sequelize = new Sequelize("sqlite::memory:", {
    logging: false, 
  });
} else {
  // Si estamos en desarrollo o producción, usamos tu conexión normal a PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false, 
  });
}

module.exports = sequelize;