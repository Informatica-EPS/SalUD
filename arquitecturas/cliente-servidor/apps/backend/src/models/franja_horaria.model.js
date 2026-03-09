const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FranjaHoraria = sequelize.define('FranjaHoraria', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  estado: DataTypes.STRING(20),
  creado_por: DataTypes.STRING(100),
  fecha_creacion: DataTypes.DATE,
  ultima_actualizacion: DataTypes.DATE,
  actualizado_por: DataTypes.STRING(100),
  id_medico: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  tableName: 'franja_horaria',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_medico', 'fecha', 'hora_inicio', 'hora_fin']
    }
  ]
});

module.exports = FranjaHoraria;
