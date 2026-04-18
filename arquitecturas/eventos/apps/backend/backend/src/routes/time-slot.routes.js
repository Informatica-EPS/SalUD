const express = require("express");
const router = express.Router();
const timeSlotController = require("../controllers/time-slot.controller");

router.post("/", timeSlotController.createTimeSlot);
router.get("/", timeSlotController.getTimeSlots);

// Rutas específicas (deben ir ANTES de las rutas con parámetros)
router.get("/available/", timeSlotController.getAllAvailableSlots);
router.get("/scheduled/", timeSlotController.getAllScheduledSlots);

router.get(
  "/doctor/available/:id",
  timeSlotController.getTimeSlotsByDoctorAvailable,
);
router.get("/doctor/:id", timeSlotController.getTimeSlotsByDoctor);

// Specialty (con ambas ortografías para compatibilidad)
router.get("/specialty/:id", timeSlotController.getTimeSlotsBySpeciality);
router.get("/speciality/:id", timeSlotController.getTimeSlotsBySpeciality);

// Rutas genéricas (deben ir AL FINAL)
router.get("/:id", timeSlotController.getTimeSlotById);
router.put("/:id", timeSlotController.updateTimeSlot);
router.delete("/:id", timeSlotController.deleteTimeSlot);
module.exports = router;
