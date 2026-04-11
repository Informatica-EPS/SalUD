const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders.controller");

// All
router.post("/", ordersController.createOrder);
router.get("/", ordersController.getOrders);

// router.get("/available/", ordersController.getAllScheduledSlots);
// router.get("/scheduled/", ordersController.getAllScheduledSlots);
// router.get("/expired/", ordersController.getAllAvailableSlots);

// // All by patient
// router.get("/patient/:id", ordersController.getTimeSlotsByDoctor);
// router.get(
//   "/patient/available/:id",
//   ordersController.getTimeSlotsByDoctorAvailable,
// );
// router.get(
//   "/patient/scheduled/:id",
//   ordersController.getTimeSlotsByDoctorAvailable,
// );
// router.get(
//   "/patient/expired/:id",
//   ordersController.getTimeSlotsByDoctorAvailable,
// );

// // by ID
router.get("/:id", ordersController.getOrderById);
router.put("/:id", ordersController.updateOrder);
router.delete("/:id", ordersController.deleteOrder);

module.exports = router;
