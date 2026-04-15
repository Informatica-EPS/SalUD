const express = require("express");
const router = express.Router();
const appointmentDetailController = require("../controllers/appointment-detail.controller");

router.post("/", appointmentDetailController.createAppointmentDetail);
router.get("/", appointmentDetailController.getAppointmentDetails);

router.get(
  "/appointment/:appointmentId",
  appointmentDetailController.getAppointmentDetailsByAppointmentId,
);

router.put("/:id", appointmentDetailController.updateAppointmentDetails);
router.delete("/:id", appointmentDetailController.deleteAppointmentDetail);
router.get("/:id", appointmentDetailController.getAppointmentDetailById);

module.exports = router;
