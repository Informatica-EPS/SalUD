"use strict";
const patientModel = require("../models/patient.model");

class PatientService {
  async create(data, auditUserId) {
    const newPatient = await patientModel.create({
      ...data,
      creadoPor: auditUserId,
      actualizadoPor: auditUserId,
    });
    return newPatient;
  }

  async update(id, data, auditUserId) {
    const patient = await patientModel.findByPk(id);
    if (!patient) return null;

    await patient.update({
      ...data,
      actualizadoPor: auditUserId,
    });

    return patient;
  }

  async findAll() {
    return await patientModel.findAll();
  }

  async findById(id) {
    return await patientModel.findByPk(id);
  }

  async delete(id) {
    const patient = await patientModel.findByPk(id);
    if (!patient) return false;

    await patient.destroy();
    return true;
  }
}

module.exports = new PatientService();
