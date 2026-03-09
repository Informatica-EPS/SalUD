const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleCita = sequelize.define('DetalleCita', {
  id_cita: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  motivo: DataTypes.TEXT,
  antecedentes: DataTypes.TEXT,
  anamnesis: DataTypes.TEXT,
  revision_sistemas: DataTypes.TEXT,
  examen_fisico: DataTypes.TEXT,
  diagnostico: DataTypes.TEXT,
  plan_manejo: DataTypes.TEXT,
  evolucion: DataTypes.TEXT
}, {
  tableName: 'detalle_cita',
  timestamps: false
});

module.exports = DetalleCita;
