const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AppointmentDetail = sequelize.define(
  "AppointmentDetail", // Antes: "AppointmentDetail"
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    motivo: {
      // Antes: reason (Motivo de consulta)
      type: DataTypes.TEXT,
    },
    antecedentes: {
      // Antes: background (Antecedentes médicos)
      type: DataTypes.TEXT,
    },
    anamnesis: {
      // Antes: anamnesis (Se usa igual en español)
      type: DataTypes.TEXT,
    },
    revisionSistemas: {
      // Antes: systemsReview (Revisión por sistemas)
      type: DataTypes.TEXT,
    },
    examenFisico: {
      // Antes: physicalExam
      type: DataTypes.TEXT,
    },
    diagnostico: {
      // Antes: diagnosis
      type: DataTypes.TEXT,
    },
    planManejo: {
      // Antes: managementPlan (Plan de manejo o tratamiento)
      type: DataTypes.TEXT,
    },
    evolucion: {
      // Antes: evolution
      type: DataTypes.TEXT,
    },
    idCita: {
      // Antes: appointmentId
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "detalles_cita", // Antes: "appointment_details"
    underscored: true,
    timestamps: true,
  },
);

module.exports = AppointmentDetail;