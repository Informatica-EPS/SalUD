const express = require("express");
const router = express.Router();
const specialtiesController = require("../controllers/specialties.controller");

// All
router.get("/", specialtiesController.getSpecialties);
module.exports = router;
