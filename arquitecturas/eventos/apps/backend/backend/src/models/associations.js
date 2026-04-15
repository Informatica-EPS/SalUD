const User = require("./user.model");
const Role = require("./role.model");
const RoleUser = require("./role_user.model");
const Doctor = require("./doctor.model");
const Patient = require("./patient.model");
const TimeSlot = require("./time-slot.model");
const Appointment = require("./appointments.model");
const AppointmentDetail = require("./appointment-details.model");
const Order = require("./order.model");

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
  foreignKey: "id_usuario",
  sourceKey: "id",
});

Doctor.belongsTo(User, {
  foreignKey: "id_usuario",
  targetKey: "id",
});

User.hasMany(Patient, {
  foreignKey: "id_usuario",
  sourceKey: "id",
});

Patient.belongsTo(User, {
  foreignKey: "id_usuario",
  targetKey: "id",
});

Doctor.hasMany(TimeSlot, {
  foreignKey: "id_doctor",
  sourceKey: "id",
});

TimeSlot.belongsTo(Doctor, {
  foreignKey: "id_doctor",
  targetKey: "id",
});

Patient.hasMany(Appointment, {
  foreignKey: "id_paciente",
  sourceKey: "id",
});

Appointment.belongsTo(Patient, {
  foreignKey: "id_paciente",
  targetKey: "id",
});

Doctor.hasMany(Appointment, {
  foreignKey: "id_doctor",
  sourceKey: "id",
});

Appointment.belongsTo(Doctor, {
  foreignKey: "id_doctor",
  targetKey: "id",
});

TimeSlot.hasOne(Appointment, {
  foreignKey: "id_horario",
  sourceKey: "id",
});

Appointment.belongsTo(TimeSlot, {
  foreignKey: "id_horario",
  targetKey: "id",
});

Appointment.hasOne(AppointmentDetail, {
  foreignKey: "id_cita",
  sourceKey: "id",
});

AppointmentDetail.belongsTo(Appointment, {
  foreignKey: "id_cita",
  targetKey: "id",
});

Appointment.hasMany(Order, {
  foreignKey: "id_cita",
  sourceKey: "id",
});

Order.belongsTo(Appointment, {
  foreignKey: "id_cita",
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
