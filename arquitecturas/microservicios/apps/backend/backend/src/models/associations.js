const User = require("./user.model");
const Role = require("./role.model");
const RoleUser = require("./role_user.model");
const Doctor = require("./doctor.model");
const Patient = require("./patient.model");
const TimeSlot = require("./time-slot.model");
const Appointment = require("./appointments.model");
const AppointmentDetail = require("./appointment-details.model");
const Order = require("./order.model");
const Specialty = require("./specialty.model");

User.belongsToMany(Role, {
  through: RoleUser,
  foreignKey: "id_usuario",
  otherKey: "id_rol",
});

Role.belongsToMany(User, {
  through: RoleUser,
  foreignKey: "id_rol",
  otherKey: "id_usuario",
});

User.hasMany(Doctor, {
  foreignKey: "idUsuario",
  sourceKey: "id",
});

Doctor.belongsTo(User, {
  foreignKey: "idUsuario",
  targetKey: "id",
});

User.hasMany(Patient, {
  foreignKey: "idUsuario",
  sourceKey: "id",
});

Patient.belongsTo(User, {
  foreignKey: "idUsuario",
  targetKey: "id",
});

Doctor.hasMany(TimeSlot, {
  foreignKey: "idDoctor",
  sourceKey: "id",
});

TimeSlot.belongsTo(Doctor, {
  foreignKey: "idDoctor",
  targetKey: "id",
});

Patient.hasMany(Appointment, {
  foreignKey: "idPaciente",
  sourceKey: "id",
});

Appointment.belongsTo(Patient, {
  foreignKey: "idPaciente",
  targetKey: "id",
});

Doctor.hasMany(Appointment, {
  foreignKey: "idDoctor",
  sourceKey: "id",
});

Appointment.belongsTo(Doctor, {
  foreignKey: "idDoctor",
  targetKey: "id",
});

TimeSlot.hasOne(Appointment, {
  foreignKey: "idHorario",
  sourceKey: "id",
});

Appointment.belongsTo(TimeSlot, {
  foreignKey: "idHorario",
  targetKey: "id",
});

Appointment.hasOne(AppointmentDetail, {
  foreignKey: "idCita",
  sourceKey: "id",
});

AppointmentDetail.belongsTo(Appointment, {
  foreignKey: "idCita",
  targetKey: "id",
});

Appointment.hasMany(Order, {
  foreignKey: "idCita",
  sourceKey: "id",
});

Order.belongsTo(Appointment, {
  foreignKey: "idCita",
  targetKey: "id",
});

Specialty.hasMany(Doctor, {
  foreignKey: "especialidad",
  sourceKey: "id",
});

Doctor.belongsTo(Specialty, {
  foreignKey: "especialidad",
  targetKey: "id",
});

Specialty.hasMany(Order, {
  foreignKey: "especialidad",
  sourceKey: "id",
});

Order.belongsTo(Specialty, {
  foreignKey: "especialidad",
  targetKey: "id",
});

module.exports = {
  User,
  Role,
  Doctor,
  Patient,
  TimeSlot,
  Appointment,
  AppointmentDetail,
  Order,
};
