const User = require('./user.model');
const Role = require('./role.model');

// Relación muchos a muchos
User.belongsToMany(Role, {
  through: 'roles_usuario',
  foreignKey: 'id_usuario',
  otherKey: 'id_rol'
});

Role.belongsToMany(User, {
  through: 'roles_usuario',
  foreignKey: 'id_rol',
  otherKey: 'id_usuario'
});

module.exports = { User, Role };
