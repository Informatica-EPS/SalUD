const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Asegúrate de que esta ruta sea correcta

const Doctor = sequelize.define(
  "Doctor",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    licenciaMedica: {
      // Antes: medicalLicense
      type: DataTypes.STRING,
      allowNull: false,
    },
    idUsuario: {
      // Antes: userId (para que coincida con tu FK 'id_usuario')
      type: DataTypes.INTEGER,
    },
    // Campos de auditoría manuales
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
    tableName: "doctores", // Antes: "doctors"
    underscored: true, // Convierte camelCase a snake_case en la BD
    timestamps: true, // Gestiona 'created_at' y 'updated_at' automáticamente
  },
);

module.exports = Doctor;
