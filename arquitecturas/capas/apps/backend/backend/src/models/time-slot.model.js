const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TimeSlot = sequelize.define(
  "TimeSlot", // Antes: "TimeSlot"
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      // Antes: date
      type: DataTypes.DATEONLY,
    },
    horaInicio: {
      // Antes: startTime
      type: DataTypes.TIME,
    },
    horaFin: {
      // Antes: endTime
      type: DataTypes.TIME,
    },
    estado: {
      // Antes: status
      type: DataTypes.STRING,
    },
    idDoctor: {
      // Antes: doctorId
      type: DataTypes.INTEGER,
    },
    // Auditoría
    creadoPor: {
      // Antes: createdBy
      type: DataTypes.INTEGER,
    },
    actualizadoPor: {
      // Antes: updatedBy
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "horarios",
    underscored: true,
    timestamps: true,
  },
);

module.exports = TimeSlot;
