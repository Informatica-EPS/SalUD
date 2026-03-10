const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const crypto = require("crypto");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    primer_nombre: DataTypes.STRING(100),
    segundo_nombre: DataTypes.STRING(100),
    primer_apellido: DataTypes.STRING(100),
    segundo_apellido: DataTypes.STRING(100),
    fecha_nacimiento: DataTypes.DATEONLY,
    lugar_nacimiento: DataTypes.STRING(150),
    direccion: DataTypes.STRING(200),
    documento: {
      type: DataTypes.STRING(64),
      unique: true,
    },
    tipo_documento: DataTypes.STRING(30),
    usuario: {
      type: DataTypes.STRING(80),
      unique: true,
    },
    email: {
      type: DataTypes.STRING(150),
      unique: true,
    },
    password: DataTypes.STRING(64), // guardada en SHA256
    creado_por: DataTypes.STRING(100),
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ultima_actualizacion: DataTypes.DATE,
    actualizado_por: DataTypes.STRING(100),
  },
  {
    tableName: "usuarios",
    timestamps: false,
  },
);

// Comparar contraseña con SHA256
User.prototype.comparePassword = async function (password) {
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  return this.password === hashedPassword;
};

module.exports = User;
