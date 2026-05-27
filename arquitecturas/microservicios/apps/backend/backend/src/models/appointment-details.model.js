const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AppointmentDetail = sequelize.define(
  "AppointmentDetail",
  {
    idCita: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      field: "id_cita",
    },
    motivo: {
      type: DataTypes.TEXT,
    },
    antecedentes: {
      type: DataTypes.TEXT,
    },
    anamnesis: {
      type: DataTypes.TEXT,
    },
    revisionSistemas: {
      type: DataTypes.TEXT,
      field: "revision_sistemas",
    },
    examenFisico: {
      type: DataTypes.TEXT,
      field: "examen_fisico",
    },
    diagnostico: {
      type: DataTypes.TEXT,
    },
    planManejo: {
      type: DataTypes.TEXT,
      field: "plan_manejo",
    },
    evolucion: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "detalle_cita",
    timestamps: false,
  },
);

module.exports = AppointmentDetail;
