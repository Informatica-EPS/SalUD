const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Doctor = sequelize.define(
  "Doctor",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    licenciaMedica: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    especialidad: {
      type: DataTypes.STRING,
    },
    idUsuario: {
      type: DataTypes.INTEGER,
      unique: true,
    },
    creadoPor: DataTypes.INTEGER,
    actualizadoPor: DataTypes.INTEGER,
  },
  {
    tableName: "doctores",
    underscored: true,
    timestamps: false,
  },
);

module.exports = Doctor;
