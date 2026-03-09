const User = require('./user.model');
const Role = require('./role.model');
const RoleUser = require('./role_user.model');
const Patient = require('./patient.model');
const Medico = require('./medico.model');
const FranjaHoraria = require('./franja_horaria.model');
const Cita = require('./cita.model');
const DetalleCita = require('./detalle_cita.model');

User.belongsToMany(Role, {
  through: RoleUser,
  foreignKey: 'id_usuario',
  otherKey: 'id_rol',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Role.belongsToMany(User, {
  through: RoleUser,
  foreignKey: 'id_rol',
  otherKey: 'id_usuario',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

User.hasOne(Patient, {
  foreignKey: 'id_usuario',
  as: 'paciente',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});
Patient.belongsTo(User, {
  foreignKey: 'id_usuario',
  as: 'usuario',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});

User.hasOne(Medico, {
  foreignKey: 'id_usuario',
  as: 'medico',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});
Medico.belongsTo(User, {
  foreignKey: 'id_usuario',
  as: 'usuario',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});

Medico.hasMany(FranjaHoraria, {
  foreignKey: 'id_medico',
  as: 'franjas',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});
FranjaHoraria.belongsTo(Medico, {
  foreignKey: 'id_medico',
  as: 'medico',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});

Patient.hasMany(Cita, {
  foreignKey: 'id_paciente',
  as: 'citas',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});
Cita.belongsTo(Patient, {
  foreignKey: 'id_paciente',
  as: 'paciente',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});

Medico.hasMany(Cita, {
  foreignKey: 'id_medico',
  as: 'citas',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});
Cita.belongsTo(Medico, {
  foreignKey: 'id_medico',
  as: 'medico',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});

FranjaHoraria.hasMany(Cita, {
  foreignKey: 'id_franja_horaria',
  as: 'citas',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});
Cita.belongsTo(FranjaHoraria, {
  foreignKey: 'id_franja_horaria',
  as: 'franja_horaria',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});

Cita.hasOne(DetalleCita, {
  foreignKey: 'id_cita',
  as: 'detalle',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});
DetalleCita.belongsTo(Cita, {
  foreignKey: 'id_cita',
  as: 'cita',
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
});

module.exports = {
  User,
  Role,
  RoleUser,
  Patient,
  Medico,
  FranjaHoraria,
  Cita,
  DetalleCita
};
