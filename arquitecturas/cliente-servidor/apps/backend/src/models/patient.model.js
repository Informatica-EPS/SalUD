const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Patient = sequelize.define(
  "Patient", // Antes: "Patient"
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ocupacion: {
      // Antes: occupation
      type: DataTypes.STRING,
    },
    discapacidad: {
      // Antes: disability
      type: DataTypes.STRING,
    },
    religion: {
      // Antes: religion
      type: DataTypes.STRING,
    },
    etnia: {
      // Antes: ethnicity
      type: DataTypes.STRING,
    },
    identidadGenero: {
      // Antes: genderIdentity
      type: DataTypes.STRING,
    },
    sexo: {
      // Antes: sex
      type: DataTypes.STRING,
    },
    idUsuario: {
      // Antes: userId
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
    tableName: "pacientes", // Antes: "patients"
    underscored: true,
    timestamps: true,
  },
);

module.exports = Patient;
