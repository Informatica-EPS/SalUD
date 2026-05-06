const patientService = require("../services/patient.service");
const userService = require("../services/user.service");

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

const getPatientById = async (req, res, next) => {
  try {
    const patient = await patientService.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const patient = await patientService.update(
      req.params.id,
      req.body,
      req.user?.id || null
    );
    if (!patient) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    res.json(patient);
  } catch (error) {
    next(error);
  }
};

const deletePatient = async (req, res, next) => {
  try {
    const deleted = await patientService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const registerPatient = async (req, res, next) => {
  try {
    const { userData, patientData } = req.body;

    // Crear usuario
    const user = await userService.createUser(userData);

    // Crear paciente con el id del usuario recién creado
    const patient = await patientService.create({
      ...patientData,
      idUsuario: user.id
    }, req.user?.id || null);

    res.status(201).json({ user, patient });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  registerPatient,
};
