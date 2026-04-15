const functions = require("./functions");

const appointmentsStatus = {
  PROGRAMADO: "programado",
  CONFIRMADO: "confirmado",
  CANCELADO: "cancelado",
  REALIZADO: "completado",
};

const timeSlotStatus = {
  AVAILABLE: "disponible",
  SCHEDULED: "programado",
  CANCELLED: "cancelado",
};

module.exports = {
  appointmentsStatus,
  timeSlotStatus,
  functions,
};
