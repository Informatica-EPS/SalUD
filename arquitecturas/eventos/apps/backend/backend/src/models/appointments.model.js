const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Appointment = sequelize.define(
  "Appointment", // Antes: "Appointment"
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipoCita: {
      // Antes: appointmentType
      type: DataTypes.STRING,
    },
    estado: {
      // Antes: status
      type: DataTypes.STRING,
    },
    idPaciente: {
      // Antes: patientId
      type: DataTypes.INTEGER,
    },
    idDoctor: {
      // Antes: doctorId
      type: DataTypes.INTEGER,
    },
    idHorario: {
      // Antes: timeSlotId
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
    tableName: "citas", // Antes: "appointments"
    underscored: true,
    timestamps: true,
  },
);

module.exports = Appointment;
