const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment.controller");

router.get("/", appointmentController.getAppointments);

router.post("/", appointmentController.createAppointment);

router.put(
  "/reschedule/:idAppointment",
  appointmentController.updateRescheduledAppointment,
);
router.put("/cancel/:idAppointment", appointmentController.cancelAppointment);
router.put(
  "/complete/:idAppointment",
  appointmentController.updateAppointmentCompleted,
);

router.get("/doctor/:idDoctor", appointmentController.getAppointmentsByDoctor);

router.get(
  "/paciente/:idPaciente",
  appointmentController.getAppointmentsByPatient,
);

router.get(
  "/medical-records/:idPaciente",
  appointmentController.getClinicalHistory,
);

router.put("/:idAppointment", appointmentController.updateAppointment);
router.get("/:idAppointment", appointmentController.getAppointmentById);
router.delete("/:idAppointment", appointmentController.deleteAppointment);
module.exports = router;
