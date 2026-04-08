const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");
const patientRoutes = require("./patient.routes");
const doctorRoutes = require("./doctor.routes");
const appointmentRoutes = require("./appointment.routes");
const appointmentDetailRoutes = require("./appointment-detail.routes");
const timeSlotsRoutes = require("./time-slot.routes");
const ordersRoutes = require("./orders.routes");

router.use("/users", userRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patients", patientRoutes);
router.use("/appointment-details", appointmentDetailRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/time-slots", timeSlotsRoutes);
router.use("/orders", ordersRoutes);

module.exports = router;
