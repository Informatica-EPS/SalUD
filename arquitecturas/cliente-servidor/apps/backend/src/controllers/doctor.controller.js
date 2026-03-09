const doctorService = require("../services/doctor.service");

const createDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.create(req.body, req.user?.id || null);
    res.status(201).json(doctor);
  } catch (error) {
    next(error);
  }
};

const getDoctors = async (req, res, next) => {
  try {
    const doctors = await doctorService.findAll();
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  getDoctors,
};
