
const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const patientRoutes = require('./patient.routes');

router.use('/users', userRoutes);
router.use('/patients', patientRoutes);

module.exports = router;
