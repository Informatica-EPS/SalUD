const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Patient = sequelize.define(
  "Patient",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ocupacion: DataTypes.STRING,
    discapacidad: DataTypes.STRING,
    religion: DataTypes.STRING,
    etnia: DataTypes.STRING,
    identidadGenero: DataTypes.STRING,
    sexo: DataTypes.STRING,
    idUsuario: DataTypes.INTEGER,
    creadoPor: DataTypes.INTEGER,
    actualizadoPor: DataTypes.INTEGER,
  },
  {
    tableName: "pacientes",
    underscored: true,
    timestamps: false,
  }
);

module.exports = Patient;
