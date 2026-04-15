const express = require("express");
const router = express.Router();
const timeSlotController = require("../controllers/time-slot.controller");

router.post("/", timeSlotController.createTimeSlot);
router.get("/", timeSlotController.getTimeSlots);


router.get("/available/", timeSlotController.getAllAvailableSlots);
router.get("/scheduled/", timeSlotController.getAllScheduledSlots);

router.get(
  "/doctor/available/:id",
  timeSlotController.getTimeSlotsByDoctorAvailable,
);
router.get("/doctor/:id", timeSlotController.getTimeSlotsByDoctor);

// Speciality

// router.get("/speciality/available/:id", timeSlotController.getTimeSlotsBySpecialityAvailable);
router.get("/speciality/:id", timeSlotController.getTimeSlotsBySpeciality);

router.get("/:id", timeSlotController.getTimeSlotById);
router.put("/:id", timeSlotController.updateTimeSlot);
router.delete("/:id", timeSlotController.deleteTimeSlot);
module.exports = router;
