"use strict";
const SpecialtyModel = require("../models/specialty.model");
const AppointmentModel = require("../models/appointments.model");
const TimeSlotModel = require("../models/time-slot.model");
const PatientModel = require("../models/patient.model");
const DoctorModel = require("../models/doctor.model");
const UserModel = require("../models/user.model");
const { functions, ordersStatus } = require("../utils");
const RabbitMQService = require("./rabbitMqService/rabbitmq.service");

class SpecialtyService {
  async getSpecialty(specualtyId) {
    const specialty = await SpecialtyModel.findByPk(specualtyId);
    if (!specialty) {
      return null;
    }

    return specialty;
  }
}

module.exports = new SpecialtyService();
