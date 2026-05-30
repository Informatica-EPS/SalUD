const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Appointment = sequelize.define(
  "Appointment",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    tipoCita: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "tipo_cita",
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    idPaciente: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "id_paciente",
    },
    idDoctor: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "id_medico",
    },
    idFranjaHoraria: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "id_franja_horaria",
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
    tableName: "citas",
    timestamps: true,
    createdAt: "fecha_creacion", 
    updatedAt: "ultima_actualizacion", 
  },
);

module.exports = Appointment;
