const patientService = require("../services/patient.service");

const createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(req.body);
    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
};

const getPatients = async (req, res, next) => {
  try {
    const patients = await patientService.getPatients();
    res.json(patients);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getPatients,
};
