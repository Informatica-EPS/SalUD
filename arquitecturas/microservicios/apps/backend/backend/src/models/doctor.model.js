const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Doctor = sequelize.define(
  "Doctor",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    licenciaMedica: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "registro_medico",
    },
    especialidad: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    idUsuario: {
      type: DataTypes.BIGINT,
      unique: true,
      field: "id_usuario",
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
      field: "ultima_actualizacion",
    },
  },
  {
    tableName: "medicos",
    timestamps: true,
  },
);

module.exports = Doctor;
