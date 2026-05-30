const appointmentDetailService = require("../services/appointment-detail.service");

const createAppointmentDetail = async (req, res, next) => {
  try {
    const appointmentDetail = await appointmentDetailService.create(
      req.body,
      req.user?.id || null,
    );
    res.status(201).json(appointmentDetail);
  } catch (error) {
    next(error);
  }
};

const getAppointmentDetails = async (req, res, next) => {
  try {
    const appointmentDetails = await appointmentDetailService.findAllPaginated(
      req.query,
    );
    res.json(appointmentDetails);
  } catch (error) {
    next(error);
  }
};

const deleteAppointmentDetail = async (req, res, next) => {
  try {
    const deleted = await appointmentDetailService.delete(req.params.id);
    if (deleted) {
      res.status(200).json({ message: "Detalle eliminado correctamente" });
    } else {
      res.status(404).json({ message: "Detalle no encontrado" });
    }
  } catch (error) {
    next(error);
  }
};

const getAppointmentDetailById = async (req, res, next) => {
  try {
    const appointmentDetail = await appointmentDetailService.findById(
      req.params.id,
    );
    if (appointmentDetail) {
      res.json(appointmentDetail);
    } else {
      res.status(404).json({ message: "Detalle no encontrado" });
    }
  } catch (error) {
    next(error);
  }
};

const getAppointmentDetailsByAppointmentId = async (req, res, next) => {
  try {
    const appointmentDetails =
      await appointmentDetailService.findByAppointmentId(
        req.params.appointmentId,
      );
    res.json(appointmentDetails);
  } catch (error) {
    next(error);
  }
};

const updateAppointmentDetails = async (req, res, next) => {
  try {
    const updated = await appointmentDetailService.update(
      req.params.id,
      req.body,
      req.user?.id || null,
    );
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ message: "Detalle no encontrado" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointmentDetail,
  getAppointmentDetails,
  deleteAppointmentDetail,
  getAppointmentDetailById,
  getAppointmentDetailsByAppointmentId,
  updateAppointmentDetails,
};
