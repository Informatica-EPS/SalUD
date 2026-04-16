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

const ordersStatus = {
  AUTHORIZED: "autorizada",
  COMPLETED: "completada",
  CANCELLED: "cancelada",
};

module.exports = {
  appointmentsStatus,
  timeSlotStatus,
  ordersStatus,
  functions,
};
