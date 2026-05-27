const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Patient = sequelize.define(
  "Patient",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ocupacion: DataTypes.STRING,
    discapacidad: DataTypes.STRING,
    religion: DataTypes.STRING,
    etnia: DataTypes.STRING,
    identidadGenero: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "identidad_genero",
    },
    sexo: {
      type: DataTypes.STRING(1),
      allowNull: false,
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
    tableName: "pacientes",
    timestamps: true,
  },
);

module.exports = Patient;
