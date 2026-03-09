const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medico = sequelize.define('Medico', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  registro_medico: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true
  },
  creado_por: DataTypes.STRING(100),
  fecha_creacion: DataTypes.DATE,
  ultima_actualizacion: DataTypes.DATE,
  actualizado_por: DataTypes.STRING(100),
  id_usuario: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'medicos',
  timestamps: false
});

module.exports = Medico;
