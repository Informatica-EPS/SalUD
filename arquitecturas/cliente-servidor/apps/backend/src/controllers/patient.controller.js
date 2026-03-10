const patientService = require("../services/patient.service");

const createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.create(req.body, req.user?.id || null);
    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
};

const getPatients = async (req, res, next) => {
  try {
    const patients = await patientService.findAll();
    res.json(patients);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getPatients,
};
