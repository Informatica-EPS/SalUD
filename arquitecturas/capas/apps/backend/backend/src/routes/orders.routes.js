const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders.controller");

// All
router.post("/", ordersController.createOrder);
router.get("/", ordersController.getOrders);

// // by ID
router.get("/:id", ordersController.getOrderById);
router.put("/:id", ordersController.updateOrder);
router.delete("/:id", ordersController.deleteOrder);
router.post("/validate", ordersController.validateOrder);
module.exports = router;
