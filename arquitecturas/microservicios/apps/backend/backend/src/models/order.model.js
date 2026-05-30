const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    idCita: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "id_cita",
    },
    idMedicamento: {
      type: DataTypes.BIGINT,
      field: "id_medicamento",
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "fecha_vencimiento",
    },
    estado: {
      type: DataTypes.STRING(50),
    },
    entidadDestino: {
      type: DataTypes.STRING(100),
      field: "entidad_destino",
    },
    especialidad: {
      type: DataTypes.BIGINT,
    },
    descripcion: {
      type: DataTypes.STRING(200),
    },
    cantidad_medicamento: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    creadoPor: {
      type: DataTypes.STRING(100),
      field: "creado_por",
    },
    actualizadoPor: {
      type: DataTypes.STRING(100),
      field: "actualizado_por",
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "fecha_creacion",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "fecha_actualizacion",
    },
  },
  {
    tableName: "ordenes",
    timestamps: true,
  },
);

module.exports = Order;
