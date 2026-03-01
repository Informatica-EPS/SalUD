const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Asegúrate de que esta ruta apunte a tu database.js

const Patient = sequelize.define(
  "Patient",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documentNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "Patients",
    timestamps: true,
  },
);

module.exports = Patient;
