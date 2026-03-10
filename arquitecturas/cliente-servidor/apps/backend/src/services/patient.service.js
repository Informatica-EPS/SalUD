"use strict";
const patientModel = require("../models/patient.model");
console.log(JSON.stringify(patientModel));

class PatientService {
  async create(data, auditUserId) {
    const newPatient = await patientModel.create({
      ...data,
      createdBy: auditUserId,
      updatedBy: auditUserId,
    });
    return newPatient;
  }

  async findAll() {
    return await patientModel.findAll();
  }

  async findById(id) {
    return await patientModel.findByPk(id);
  }

  async update(id, data, auditUserId) {
    const patient = await patientModel.findByPk(id);
    if (!patient) return null;

    await patient.update({
      ...data,
      updatedBy: auditUserId,
    });

    return patient;
  }

  async delete(id) {
    const patient = await patientModel.findByPk(id);
    if (!patient) return false;

    await patient.destroy();
    return true;
  }
}

module.exports = new PatientService();
