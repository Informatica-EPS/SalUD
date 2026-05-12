const doctorService = require("../services/doctor.service");
const userService = require("../services/user.service");

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

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor no encontrado" });
    }
    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

async function updateDoctor(req, res) {
  try {
    const { id } = req.params;
    const { doctorData, userData } = req.body;

    const doctor = await Doctor.findByPk(id, { include: [User] });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor no encontrado" });
    }

    // Actualizar datos del doctor
    if (doctorData) {
      await doctor.update(doctorData);
    }

    // Actualizar datos del usuario asociado
    if (userData && doctor.User) {
      await doctor.User.update(userData);
    }

    // Devolver doctor actualizado con su User completo
    const updated = await Doctor.findByPk(id, { include: [User] });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error actualizando doctor" });
  }
}

const deleteDoctor = async (req, res, next) => {
  try {
    const deleted = await doctorService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Doctor no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const registerDoctor = async (req, res, next) => {
  try {
    const { userData, doctorData } = req.body;

    // Crear usuario
    const user = await userService.createUser(userData);

    // Crear doctor con el id del usuario recién creado
    const doctor = await doctorService.create({
      ...doctorData,
      idUsuario: user.id
    }, req.user?.id || null);

    res.status(201).json({ user, doctor });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerDoctor,
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
