"use strict";
const SpecialtyModel = require("../models/specialty.model");

class SpecialtyService {
  async getSpecialty(specualtyId) {
    const specialty = await SpecialtyModel.findByPk(specualtyId);
    if (!specialty) {
      return null;
    }

    return specialty;
  }

  async getSpecialties() {
    const specialties = await SpecialtyModel.findAll();
    return specialties;
  }
}

module.exports = new SpecialtyService();
