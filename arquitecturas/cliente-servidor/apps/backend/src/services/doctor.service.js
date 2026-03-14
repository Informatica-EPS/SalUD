"use strict";
const Doctor = require("../models/doctor.model");
const User = require("../models/user.model");

class DoctorService {
  async create(data, auditUserId) {
    return await Doctor.create({
      ...data,
      creadoPor: auditUserId,
      actualizadoPor: auditUserId,
    });
  }

  async findAll() {
    return await Doctor.findAll({
      include: [
        {
          model: User,
          attributes: [
            "id",
            "primer_nombre",
            "segundo_nombre",
            "primer_apellido",
            "segundo_apellido",
          ],
        },
      ],
    });
  }

  async findById(id) {
    return await Doctor.findByPk(id, {
      include: [
        {
          model: User,
          attributes: [
            "id",
            "primer_nombre",
            "segundo_nombre",
            "primer_apellido",
            "segundo_apellido",
            "documento",
            "tipo_documento",
            "usuario",
            "email",
            "fecha_nacimiento",
            "lugar_nacimiento",
            "direccion"
          ],
        },
      ],
    });
  }

  async update(id, data, auditUserId) {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) return null;

    await doctor.update({
      ...data,
      actualizadoPor: auditUserId,
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
