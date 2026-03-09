const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cita = sequelize.define('Cita', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_cita: DataTypes.STRING(10),
  estado: DataTypes.STRING(10),
  creado_por: DataTypes.STRING(100),
  fecha_creacion: DataTypes.DATE,
  ultima_actualizacion: DataTypes.DATE,
  actualizado_por: DataTypes.STRING(100),
  id_paciente: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  id_medico: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  id_franja_horaria: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  tableName: 'citas',
  timestamps: false
});

module.exports = Cita;
