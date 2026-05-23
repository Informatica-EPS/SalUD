const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoleUser = sequelize.define('RoleUser', {
  id_rol: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  id_usuario: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  }
}, {
  tableName: 'roles_usuario',
  timestamps: false
});

module.exports = RoleUser;
