const timeSlotService = require("../services/time-slot.service");

const createTimeSlot = async (req, res, next) => {
  try {
    const timeSlot = await timeSlotService.create(
      req.body,
      req.user?.id || null,
    );
    res.status(201).json(timeSlot);
  } catch (error) {
    next(error);
  }
};

const getTimeSlots = async (req, res, next) => {
  try {
    const timeSlots = await timeSlotService.findAllPaginated(req.query);
    res.json(timeSlots);
  } catch (error) {
    next(error);
  }
};

const getTimeSlotById = async (req, res, next) => {
  try {
    const timeSlot = await timeSlotService.findById(req.params.id);
    if (!timeSlot) {
      return res.status(404).json({ error: "Time slot not found" });
    }
    res.json(timeSlot);
  } catch (error) {
    next(error);
  }
};

const getTimeSlotsByDoctor = async (req, res, next) => {
  try {
    const timeSlots = await timeSlotService.findAllByDoctor(
      req.params.id,
      req.query,
    );
    res.json(timeSlots);
  } catch (error) {
    next(error);
  }
};

const getTimeSlotsByDoctorAvailable = async (req, res, next) => {
  try {
    const timeSlots = await timeSlotService.getAvailableSlotsByDoctor(
      req.params.id,
      req.query,
    );
    res.json(timeSlots);
  } catch (error) {
    next(error);
  }
};

const getAllAvailableSlots = async (req, res, next) => {
  try {
    const timeSlots = await timeSlotService.getAllAvailableSlots(req.query);
    res.json(timeSlots);
  } catch (error) {
    console.log("Error!", error);

    next(error);
  }
};

const getAllScheduledSlots = async (req, res, next) => {
  try {
    const timeSlots = await timeSlotService.getAllScheduledSlots(req.query);
    res.json(timeSlots);
  } catch (error) {
    console.log("Error!", error);

    next(error);
  }
};

const updateTimeSlot = async (req, res, next) => {
  try {
    const timeSlot = await timeSlotService.update(
      req.params.id,
      req.body,
      req.user?.id || null,
    );
    if (!timeSlot) {
      return res.status(404).json({ error: "Time slot not found" });
    }
    res.json(timeSlot);
  } catch (error) {
    next(error);
  }
};

const deleteTimeSlot = async (req, res, next) => {
  try {
    const deleted = await timeSlotService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Time slot not found" });
    }
    res.json({ message: "Time slot deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTimeSlot,
  getTimeSlots,
  getTimeSlotById,
  getTimeSlotsByDoctor,
  getTimeSlotsByDoctorAvailable,
  getAllAvailableSlots,
  getAllScheduledSlots,
  updateTimeSlot,
  deleteTimeSlot,
};
