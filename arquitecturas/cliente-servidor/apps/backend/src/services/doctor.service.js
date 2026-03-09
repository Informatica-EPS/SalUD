const Doctor = require("../models/doctor.model");

class DoctorService {
  async create(data, auditUserId) {
    return await Doctor.create({
      ...data,
      createdBy: auditUserId,
      updatedBy: auditUserId,
    });
  }

  async findAll() {
    return await Doctor.findAll();
  }

  async findById(id) {
    return await Doctor.findByPk(id);
  }

  async update(id, data, auditUserId) {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) return null;

    await doctor.update({
      ...data,
      updatedBy: auditUserId,
    });
    return doctor;
  }

  async delete(id) {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) return false;

    await doctor.destroy();
    return true;
  }
}

module.exports = new DoctorService();
