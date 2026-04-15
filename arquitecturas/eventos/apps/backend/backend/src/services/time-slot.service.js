const TimeSlot = require("../models/time-slot.model");
const Doctor = require("../models/doctor.model");
const User = require("../models/user.model");
const DoctorService = require("./doctor.service");
const DoctorModel = require("../models/doctor.model");
const PatientModel = require("../models/patient.model");
const AppointmentModel = require("../models/appointments.model");
const UserModel = require("../models/user.model");
const { appointmentsStatus, timeSlotStatus, functions } = require("../utils");
const { Op } = require("sequelize");
const { getDateFormatUTC } = require("../utils/functions");

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
    await this.validateStartAfterEndTime(data.horaInicio, data.horaFin);
    await this.validateDoctorExists(data.idDoctor);
    await this.validateItMustBeInTheFuture(data.fecha, data.horaInicio);
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

  async validateStartAfterEndTime(horaInicio, horaFin) {
    if (horaFin <= horaInicio) {
      throw new Error("La hora de inicio debe ser anterior a la hora de fin");
    }
  }

  async validateItMustBeInTheFuture(fecha, horaInicio) {
    const now = new Date();
    const slotDateTime = getDateFormatUTC(fecha, horaInicio, "-05:00");

    if (slotDateTime <= now) {
      throw new Error("La franja horaria debe ser en el futuro");
    }
  }

  async getAvailableSlotsByDoctor(doctorId, queryParams) {
    const nowObj = new Date();
    const nowDate = nowObj.toLocaleDateString("sv-SE", {
      timeZone: "America/Bogota",
    });

    const nowTime = nowObj.toLocaleTimeString("en-GB", {
      timeZone: "America/Bogota",
    });

    const { rows, count, page, totalPages } = await functions.paginate(
      TimeSlot,
      queryParams,
      {
        where: {
          idDoctor: doctorId,
          estado: timeSlotStatus.AVAILABLE,
          [Op.or]: [
            {
              [Op.and]: [
                {
                  fecha: {
                    [Op.eq]: nowDate,
                  },
                },
                {
                  horaInicio: {
                    [Op.gte]: nowTime,
                  },
                },
              ],
            },
            {
              fecha: {
                [Op.gt]: nowDate,
              },
            },
          ],
        },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: Doctor,
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

  async getAllAvailableSlots(queryParams) {
    const nowObj = new Date();
    const nowDate = nowObj.toLocaleDateString("sv-SE", {
      timeZone: "America/Bogota",
    });

    const nowTime = nowObj.toLocaleTimeString("en-GB", {
      timeZone: "America/Bogota",
    });

    const { rows, count, page, totalPages } = await functions.paginate(
      TimeSlot,
      queryParams,
      {
        where: {
          estado: timeSlotStatus.AVAILABLE,
          [Op.or]: [
            {
              [Op.and]: [
                {
                  fecha: {
                    [Op.eq]: nowDate,
                  },
                },
                {
                  horaInicio: {
                    [Op.gte]: nowTime,
                  },
                },
              ],
            },
            {
              fecha: {
                [Op.gt]: nowDate,
              },
            },
          ],
        },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: Doctor,
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
    const nowObj = new Date();
    const nowDate = nowObj.toLocaleDateString("sv-SE", {
      timeZone: "America/Bogota",
    });

    const nowTime = nowObj.toLocaleTimeString("en-GB", {
      timeZone: "America/Bogota",
    });
    const { rows, count, page, totalPages } = await functions.paginate(
      TimeSlot,
      queryParams,
      {
        where: {
          estado: timeSlotStatus.SCHEDULED,
          [Op.or]: [
            {
              [Op.and]: [
                {
                  fecha: {
                    [Op.eq]: nowDate,
                  },
                },
                {
                  horaInicio: {
                    [Op.gte]: nowTime,
                  },
                },
              ],
            },
            {
              fecha: {
                [Op.gt]: nowDate,
              },
            },
          ],
        },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: Doctor,
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

  async validateOverlappingSlotsForPatient(
    slotHoraInicio,
    slotHoraFin,
    slotFecha,
    idPacienteSlot,
  ) {
    const existingSlots = await TimeSlot.findAll({
      where: {
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
      include: [
        {
          model: AppointmentModel,
          attributes: ["id", "estado", "idPaciente"],
          where: {
            estado: appointmentsStatus.PROGRAMADO,
            idPaciente: idPacienteSlot,
          },
          required: true,
        },
      ],
    });

    // console.log({ existingSlots: existingSlots.map((e) => e.dataValues) });

    if (existingSlots.length > 0) {
      throw new Error(
        "Paciente ya tiene una cita programada en ese horario en la fecha indicada",
      );
    }
    return existingSlots;
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

    // console.log({ existingSlots: existingSlots.map((e) => e.dataValues) });

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
            model: Doctor,
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
        where: {
          idDoctor: doctorId,
        },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: Doctor,
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
      estado: timeSlotStatus.SCHEDULED,
      updatedBy: updatedBy,
    });
    return slot;
  }

  async markAsAvailable(id, updatedBy = null) {
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
      estado: timeSlotStatus.CANCELLED,
      updatedBy: updatedBy,
    });
    return slot;
  }
}

module.exports = new TimeSlotService();
