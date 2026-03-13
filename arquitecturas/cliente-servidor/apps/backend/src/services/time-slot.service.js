const TimeSlot = require("../models/time-slot.model");
const DoctorService = require("./doctor.service");
const DoctorModel = require("../models/doctor.model");
const PatientModel = require("../models/patient.model");
const AppointmentModel = require("../models/appointments.model");
const UserModel = require("../models/user.model");
const { appointmentsStatus, timeSlotStatus, functions } = require("../utils");
const { Op } = require("sequelize");

class TimeSlotService {
  async create(data, auditUserId = 1) {
    if (!!data.slots && data.slots instanceof Array) {
      return await this.createMultiple(data.slots, auditUserId);
    } else {
      return await this.createSingle(data, auditUserId);
    }
  }

  async createMultiple(dataArray, auditUserId) {
    const createdSlots = [];
    for (const data of dataArray) {
      const slot = await this.createSingle(data, auditUserId);
      createdSlots.push(slot);
    }
    return createdSlots;
  }

  async createSingle(data, auditUserId) {
    await this.validateDoctorExists(data.idDoctor);
    await this.validateOverlappingSlots(
      data.idDoctor,
      data.horaInicio,
      data.horaFin,
      data.fecha,
    );

    return await TimeSlot.create({
      ...data,
      createdBy: auditUserId,
      updatedBy: auditUserId,
    });
  }

  async getAvailableSlotsByDoctor(doctorId, queryParams) {
    const { rows, count, page, totalPages } = await functions.paginate(
      TimeSlot,
      queryParams,
      {
        where: { idDoctor: doctorId, estado: timeSlotStatus.AVAILABLE },
        order: [["createdAt", "ASC"]],
      },
    );

    return {
      totalPages,
      totalItems: count,
      currentPage: page,
      franjasHorarias: rows,
    };
  }

  async getAllAvailableSlots(queryParams) {
    const { rows, count, page, totalPages } = await functions.paginate(
      TimeSlot,
      queryParams,
      {
        where: { estado: timeSlotStatus.AVAILABLE },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: DoctorModel,
            attributes: ["licenciaMedica"],
            include: [
              {
                model: UserModel,
                attributes: [
                  "primer_nombre",
                  "segundo_nombre",
                  "primer_apellido",
                  "segundo_apellido",
                  "email",
                ],
              },
            ],
          },
        ],
      },
    );

    return {
      totalPages,
      totalItems: count,
      currentPage: page,
      franjasHorarias: rows,
    };
  }

  async getAllScheduledSlots(queryParams) {
    const { rows, count, page, totalPages } = await functions.paginate(
      TimeSlot,
      queryParams,
      {
        where: { estado: timeSlotStatus.SCHEDULED },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: DoctorModel,
            attributes: ["licenciaMedica"],
            include: [
              {
                model: UserModel,
                attributes: [
                  "primer_nombre",
                  "segundo_nombre",
                  "primer_apellido",
                  "segundo_apellido",
                  "email",
                ],
              },
            ],
          },
          {
            model: AppointmentModel,
            attributes: ["tipoCita", "estado"],
            include: [
              {
                model: PatientModel,
                attributes: [
                  "ocupacion",
                  "discapacidad",
                  "etnia",
                  "identidadGenero",
                  "sexo",
                ],
                include: [
                  {
                    model: UserModel,
                    attributes: [
                      "primer_nombre",
                      "segundo_nombre",
                      "primer_apellido",
                      "segundo_apellido",
                      "direccion",
                      "email",
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    );

    return {
      totalPages,
      totalItems: count,
      currentPage: page,
      franjasHorarias: rows,
    };
  }

  async validateDoctorExists(idDoctor) {
    const doctor = await DoctorService.findById(idDoctor);

    if (!doctor) {
      throw new Error("Doctor not found");
    }
  }

  async validateOverlappingSlots(
    idDoctor,
    slotHoraInicio,
    slotHoraFin,
    slotFecha,
  ) {
    const existingSlots = await TimeSlot.findAll({
      where: {
        idDoctor,
        fecha: slotFecha,
        [Op.or]: [
          {
            horaInicio: {
              [Op.between]: [slotHoraInicio, slotHoraFin],
            },
          },
          {
            horaFin: {
              [Op.between]: [slotHoraInicio, slotHoraFin],
            },
          },
          {
            horaInicio: {
              [Op.lte]: slotHoraInicio,
            },
            horaFin: {
              [Op.gte]: slotHoraFin,
            },
          },
        ],
      },
    });

    console.log({ existingSlots: existingSlots.map((e) => e.dataValues) });

    if (existingSlots.length > 0) {
      throw new Error("Overlapping time slots detected");
    }

    return existingSlots;
  }

  async findAll() {
    return await TimeSlot.findAll();
  }

  async findAllPaginated(queryParams) {
    const { rows, count, page, totalPages } = await functions.paginate(
      TimeSlot,
      queryParams,
      {
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: DoctorModel,
            attributes: ["licenciaMedica"],
            include: [
              {
                model: UserModel,
                attributes: [
                  "primer_nombre",
                  "segundo_nombre",
                  "primer_apellido",
                  "segundo_apellido",
                  "email",
                ],
              },
            ],
          },
          {
            model: AppointmentModel,
            attributes: ["tipoCita", "estado"],
            include: [
              {
                model: PatientModel,
                attributes: [
                  "ocupacion",
                  "discapacidad",
                  "etnia",
                  "identidadGenero",
                  "sexo",
                ],
                include: [
                  {
                    model: UserModel,
                    attributes: [
                      "primer_nombre",
                      "segundo_nombre",
                      "primer_apellido",
                      "segundo_apellido",
                      "direccion",
                      "email",
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    );

    return {
      totalPages,
      totalItems: count,
      currentPage: page,
      franjasHorarias: rows,
    };
  }

  async findAllByDoctor(doctorId, queryParams) {
    const { rows, count, page, totalPages } = await functions.paginate(
      TimeSlot,
      queryParams,
      {
        where: { idDoctor: doctorId },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: DoctorModel,
            attributes: ["licenciaMedica"],
            include: [
              {
                model: UserModel,
                attributes: [
                  "primer_nombre",
                  "segundo_nombre",
                  "primer_apellido",
                  "segundo_apellido",
                  "email",
                ],
              },
            ],
          },
          {
            model: AppointmentModel,
            attributes: ["tipoCita", "estado"],
            include: [
              {
                model: PatientModel,
                attributes: [
                  "ocupacion",
                  "discapacidad",
                  "etnia",
                  "identidadGenero",
                  "sexo",
                ],
                include: [
                  {
                    model: UserModel,
                    attributes: [
                      "primer_nombre",
                      "segundo_nombre",
                      "primer_apellido",
                      "segundo_apellido",
                      "direccion",
                      "email",
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    );

    return {
      totalPages,
      totalItems: count,
      currentPage: page,
      franjasHorarias: rows,
    };
  }

  async findById(id) {
    return await TimeSlot.findByPk(id, {
      include: [
        {
          model: DoctorModel,
          attributes: ["licenciaMedica"],
          include: [
            {
              model: UserModel,
              attributes: [
                "primer_nombre",
                "segundo_nombre",
                "primer_apellido",
                "segundo_apellido",
                "email",
              ],
            },
          ],
        },
        {
          model: AppointmentModel,
          attributes: ["tipoCita", "estado"],
          include: [
            {
              model: PatientModel,
              attributes: [
                "ocupacion",
                "discapacidad",
                "etnia",
                "identidadGenero",
                "sexo",
              ],
              include: [
                {
                  model: UserModel,
                  attributes: [
                    "primer_nombre",
                    "segundo_nombre",
                    "primer_apellido",
                    "segundo_apellido",
                    "direccion",
                    "email",
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  }

  async update(id, data, auditUserId) {
    const slot = await TimeSlot.findByPk(id);
    if (!slot) return null;

    if (
      slot.horaInicio === data.horaInicio &&
      slot.horaFin === data.horaFin &&
      slot.fecha === data.fecha
    ) {
      await slot.update({
        ...data,
        updatedBy: auditUserId,
      });
      return slot;
    }

    await this.validateOverlappingSlots(
      slot.idDoctor,
      data.horaInicio,
      data.horaFin,
      data.fecha,
    );

    await slot.update({
      ...data,
      updatedBy: auditUserId,
    });
    return slot;
  }

  async updateRangeTime(id, data, auditUserId) {
    const slot = await TimeSlot.findByPk(id);
    if (!slot) return null;

    await this.validateOverlappingSlots(
      slot.idDoctor,
      data.horaInicio,
      data.horaFin,
      slot.fecha,
    );

    await slot.update({
      ...data,
      updatedBy: auditUserId,
    });
    return slot;
  }

  async delete(id) {
    const slot = await TimeSlot.findByPk(id);
    if (!slot) return false;

    await slot.destroy();
    return true;
  }

  async markAsScheduled(id, updatedBy) {
    const slot = await TimeSlot.findByPk(id);
    if (!slot) return false;

    await slot.update({
      estado: appointmentsStatus.PROGRAMADO,
      updatedBy: updatedBy,
    });
    return slot;
  }

  async markAsAvailable(id, updatedBy) {
    const slot = await TimeSlot.findByPk(id);
    if (!slot) return false;

    await slot.update({
      estado: timeSlotStatus.AVAILABLE,
      updatedBy: updatedBy,
    });
    return slot;
  }

  async markAsCancelled(id, updatedBy) {
    const slot = await TimeSlot.findByPk(id);
    if (!slot) return false;

    await slot.update({
      estado: appointmentsStatus.CANCELADO,
      updatedBy: updatedBy,
    });
    return slot;
  }
}

module.exports = new TimeSlotService();
