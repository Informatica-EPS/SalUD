const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  primer_nombre: DataTypes.STRING(30),
  segundo_nombre: DataTypes.STRING(30),
  primer_apellido: DataTypes.STRING(30),
  segundo_apellido: DataTypes.STRING(30),
  fecha_nacimiento: DataTypes.DATEONLY,
  lugar_nacimiento: DataTypes.STRING(50),
  direccion: DataTypes.STRING(200),
  documento: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  tipo_documento: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  usuario: {
    type: DataTypes.STRING(30),
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true
  },
  password: DataTypes.STRING(64), // guardada en SHA256
  creado_por: DataTypes.STRING(100),
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ultima_actualizacion: DataTypes.DATE,
  actualizado_por: DataTypes.STRING(100)
}, {
  tableName: 'usuarios',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['tipo_documento', 'documento']
    }
  ]
});

// Comparar contraseña con SHA256
User.prototype.comparePassword = async function (password) {
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  return this.password === hashedPassword;
};

module.exports = User;
