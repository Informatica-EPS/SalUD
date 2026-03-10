const appointmentService = require("../services/appointmet.service");

const createAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.create(
      req.body,
      req.user?.id || null,
    );
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.findAllPaginated(req.query);
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await appointmentService.findById(
      req.params.idAppointment,
    );
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

const getAppointmentsByDoctor = async (req, res, next) => {
  try {
    const appointments = await appointmentService.findByDoctor(
      req.params.idDoctor,
      req.query,
    );
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const getAppointmentsByPatient = async (req, res, next) => {
  try {
    const appointments = await appointmentService.findByPatient(
      req.params.idPaciente,
      req.query,
    );
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const updatedAppointment = await appointmentService.update(
      req.params.idAppointment,
      req.body,
    );
    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(updatedAppointment);
  } catch (error) {
    next(error);
  }
};

const updateRescheduledAppointment = async (req, res, next) => {
  try {
    const updatedAppointment =
      await appointmentService.updateRescheduledAppointment(
        req.params.idAppointment,
        req.body,
      );
    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(updatedAppointment);
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const updatedAppointment = await appointmentService.cancelAppointment(
      req.params.idAppointment,
      req.user?.id || null,
    );
    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(updatedAppointment);
  } catch (error) {
    next(error);
  }
};

const updateAppointmentCompleted = async (req, res, next) => {
  try {
    const updatedAppointment =
      await appointmentService.updateAppointmentCompleted(
        req.params.idAppointment,
        req.user?.id || null,
      );
    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(updatedAppointment);
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const deleted = await appointmentService.deleteById(
      req.params.idAppointment,
    );
    if (!deleted) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getClinicalHistory = async (req, res, next) => {
  try {
    const clinicalHistory = await appointmentService.getClinicalHistory(
      req.params.idPaciente,
    );
    res.json(clinicalHistory);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointmentById,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  getAppointments,
  updateAppointment,
  updateRescheduledAppointment,
  cancelAppointment,
  updateAppointmentCompleted,
  deleteAppointment,
  getClinicalHistory,
};
