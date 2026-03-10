const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion: DataTypes.STRING(200),
    creado_por: DataTypes.STRING(100),
    fecha_creacion: DataTypes.DATE,
    ultima_actualizacion: DataTypes.DATE,
    actualizado_por: DataTypes.STRING(100),
  },
  {
    tableName: "rol",
    timestamps: false,
  },
);

module.exports = Role;
