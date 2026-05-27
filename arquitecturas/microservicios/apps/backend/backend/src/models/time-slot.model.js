const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TimeSlot = sequelize.define(
  "TimeSlot",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: DataTypes.DATEONLY,
    horaInicio: {
      type: DataTypes.TIME,
      field: "hora_inicio",
    },
    horaFin: {
      type: DataTypes.TIME,
      field: "hora_fin",
    },
    estado: DataTypes.STRING(20),
    idDoctor: {
      type: DataTypes.BIGINT,
      field: "id_medico",
    },
    createdBy: {
      type: DataTypes.STRING(100),
      field: "creado_por",
    },
    updatedBy: {
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
    tableName: "franja_horaria",
    timestamps: true,
  },
);

module.exports = TimeSlot;
