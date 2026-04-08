const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idCita: {
      type: DataTypes.INTEGER,
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
    },
    estado: {
      type: DataTypes.STRING(50),
    },
    entidadDestino: {
      type: DataTypes.STRING(100),
    },
    especialidad: {
      type: DataTypes.STRING(100),
    },
    descripcion: {
      type: DataTypes.STRING(200),
    },
  },
  {
    tableName: "ordenes",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Order;
