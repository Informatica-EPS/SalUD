const Patient = require("../models/patient.model");

const createPatient = async (data) => {
  const { name, documentNumber } = data;
  return await Patient.create({ name, documentNumber });
};

const getPatients = async () => {
  return await Patient.findAll();
};

module.exports = {
  createPatient,
  getPatients,
};
