const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  host: process.env.DB_HOST,
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;
