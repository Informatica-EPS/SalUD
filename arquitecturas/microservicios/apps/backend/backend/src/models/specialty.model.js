const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Specialty = sequelize.define(
  "Specialty",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    descripcion: DataTypes.STRING(200),
  },
  {
    tableName: "especialidades",
    timestamps: false,
  },
);

module.exports = Specialty;
