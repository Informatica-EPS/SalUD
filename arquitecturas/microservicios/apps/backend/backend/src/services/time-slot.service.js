const TimeSlot = require("../models/time-slot.model");
const DoctorModel = require("../models/doctor.model");   // ← eliminado alias duplicado "Doctor"
const UserModel = require("../models/user.model");       // ← eliminado alias duplicado "User"
const DoctorService = require("./doctor.service");
const PatientModel = require("../models/patient.model");
const AppointmentModel = require("../models/appointments.model");
const SpecialtyModel = require("../models/specialty.model");
const { appointmentsStatus, timeSlotStatus, functions } = require("../utils");
const { Op } = require("sequelize");
const { getDateFormatUTC } = require("../utils/functions");

// ── Atributos compartidos ────────────────────────────────────────────────────
const USER_ID_NAME_ATTRIBUTES = [
  "id", "primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido",
];

const SPECIALTY_INCLUDE = {
  model: SpecialtyModel,
  attributes: ["id", "nombre", "descripcion"],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Devuelve la fecha y hora actuales formateadas en zona America/Bogota. */
function getNowBogota() {
  const now = new Date();
  return {
    nowDate: now.toLocaleDateString("sv-SE", { timeZone: "America/Bogota" }),
    nowTime: now.toLocaleTimeString("en-GB", { timeZone: "America/Bogota" }),
  };
}

/** Condición Sequelize para traer solo franjas desde ahora en adelante. */
function buildFutureDateFilter(nowDate, nowTime) {
  return {
    [Op.or]: [
      {
        [Op.and]: [
          { fecha: { [Op.eq]: nowDate } },
          { horaInicio: { [Op.gte]: nowTime } },
        ],
      },
      { fecha: { [Op.gt]: nowDate } },
    ],
  };
}

/** Condición Sequelize para detectar solapamiento entre franjas horarias. */
function buildTimeOverlapCondition(horaInicio, horaFin) {
  return [
    { horaInicio: { [Op.between]: [horaInicio, horaFin] } },
    { horaFin:    { [Op.between]: [horaInicio, horaFin] } },
    { horaInicio: { [Op.lte]: horaInicio }, horaFin: { [Op.gte]: horaFin } },
  ];
}

/** Include estándar de Doctor (con User e Id de Specialty) para listados. */
function buildDoctorInclude(extraWhere) {
  return {
    model: DoctorModel,
    ...(extraWhere ? { where: extraWhere } : {}),
    include: [
      { model: UserModel, attributes: USER_ID_NAME_ATTRIBUTES },
      SPECIALTY_INCLUDE,
    ],
  };
}

/** Construye la respuesta paginada estándar de franjas horarias. */
function toPaginatedResponse({ rows, count, page, totalPages }) {
  return { totalPages, totalItems: count, currentPage: page, franjasHorarias: rows };
}

// ────────────────────────────────────────────────────────────────────────────

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
    await this.validateOverlappingSlots(data.idDoctor, data.horaInicio, data.horaFin, data.fecha);

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
    const slotDateTime = getDateFormatUTC(fecha, horaInicio, "-05:00");
    if (slotDateTime <= new Date()) {
      throw new Error("La franja horaria debe ser en el futuro");
    }
  }

  async getAvailableSlotsByDoctor(doctorId, queryParams) {
    const { nowDate, nowTime } = getNowBogota();

    const result = await functions.paginate(TimeSlot, queryParams, {
      where: {
        idDoctor: doctorId,
        estado: timeSlotStatus.AVAILABLE,
        ...buildFutureDateFilter(nowDate, nowTime),
      },
      order: [["createdAt", "ASC"]],
      include: [buildDoctorInclude()],
    });

    return toPaginatedResponse(result);
  }

  async getAllAvailableSlots(queryParams) {
    const { nowDate, nowTime } = getNowBogota();

    const doctorWhere = {};
    if (queryParams.soloGenerales === "true") {
      doctorWhere.especialidad = null;
    } else if (queryParams.soloEspecialistas === "true") {
      doctorWhere.especialidad = { [Op.ne]: null };
    }

    const result = await functions.paginate(TimeSlot, queryParams, {
      where: {
        estado: timeSlotStatus.AVAILABLE,
        ...buildFutureDateFilter(nowDate, nowTime),
      },
      order: [["createdAt", "ASC"]],
      include: [buildDoctorInclude(Object.keys(doctorWhere).length > 0 ? doctorWhere : undefined)],
    });

    return toPaginatedResponse(result);
  }

  async getAllScheduledSlots(queryParams) {
    const { nowDate, nowTime } = getNowBogota();

    const result = await functions.paginate(TimeSlot, queryParams, {
      where: {
        estado: timeSlotStatus.SCHEDULED,
        ...buildFutureDateFilter(nowDate, nowTime),
      },
      order: [["createdAt", "ASC"]],
      include: [buildDoctorInclude()],
    });

    return toPaginatedResponse(result);
  }

  async validateDoctorExists(idDoctor) {
    const doctor = await DoctorService.findById(idDoctor);
    if (!doctor) throw new Error("Doctor not found");
  }

  async validateOverlappingSlotsForPatient(slotHoraInicio, slotHoraFin, slotFecha, idPacienteSlot) {
    const existingSlots = await TimeSlot.findAll({
      where: {
        fecha: slotFecha,
        [Op.or]: buildTimeOverlapCondition(slotHoraInicio, slotHoraFin),
      },
      include: [
        {
          model: AppointmentModel,
          attributes: ["id", "estado", "idPaciente"],
          where: { estado: appointmentsStatus.PROGRAMADO, idPaciente: idPacienteSlot },
          required: true,
        },
      ],
    });

    if (existingSlots.length > 0) {
      throw new Error("Paciente ya tiene una cita programada en ese horario en la fecha indicada");
    }
    return existingSlots;
  }

  async validateOverlappingSlots(idDoctor, slotHoraInicio, slotHoraFin, slotFecha) {
    const existingSlots = await TimeSlot.findAll({
      where: {
        idDoctor,
        fecha: slotFecha,
        [Op.or]: buildTimeOverlapCondition(slotHoraInicio, slotHoraFin),
      },
    });

    if (existingSlots.length > 0) {
      throw new Error("Overlapping time slots detected");
    }
    return existingSlots;
  }

  async findAll() {
    return await TimeSlot.findAll();
  }

  async findAllPaginated(queryParams) {
    const result = await functions.paginate(TimeSlot, queryParams, {
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: DoctorModel,
          where: { especialidad: null },
          include: [{ model: UserModel, attributes: USER_ID_NAME_ATTRIBUTES }],
        },
      ],
    });

    return toPaginatedResponse(result);
  }

  async findAllByDoctor(doctorId, queryParams) {
    const result = await functions.paginate(TimeSlot, queryParams, {
      where: { idDoctor: doctorId },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: DoctorModel,
          include: [{ model: UserModel, attributes: USER_ID_NAME_ATTRIBUTES }],
        },
      ],
    });

    return toPaginatedResponse(result);
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
              attributes: ["primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido", "email"],
            },
          ],
        },
        {
          model: AppointmentModel,
          attributes: ["tipoCita", "estado"],
          include: [
            {
              model: PatientModel,
              attributes: ["ocupacion", "discapacidad", "etnia", "identidadGenero", "sexo"],
              include: [
                {
                  model: UserModel,
                  attributes: ["primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido", "direccion", "email"],
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

    const timeUnchanged =
      slot.horaInicio === data.horaInicio &&
      slot.horaFin === data.horaFin &&
      slot.fecha === data.fecha;

    if (!timeUnchanged) {
      await this.validateOverlappingSlots(slot.idDoctor, data.horaInicio, data.horaFin, data.fecha);
    }

    await slot.update({ ...data, updatedBy: auditUserId });
    return slot;
  }

  async updateRangeTime(id, data, auditUserId) {
    const slot = await TimeSlot.findByPk(id);
    if (!slot) return null;

    await this.validateOverlappingSlots(slot.idDoctor, data.horaInicio, data.horaFin, slot.fecha);
    await slot.update({ ...data, updatedBy: auditUserId });
    return slot;
  }

  async delete(id) {
    const slot = await TimeSlot.findByPk(id);
    if (!slot) return false;

    await slot.destroy();
    return true;
  }

  // ── markAs* unificados en un helper privado ──────────────────────────────
  async _updateSlotStatus(id, estado, updatedBy) {
    const slot = await TimeSlot.findByPk(id);
    if (!slot) return false;

    await slot.update({ estado, updatedBy });
    return slot;
  }

  async markAsScheduled(id, updatedBy) {
    return this._updateSlotStatus(id, timeSlotStatus.SCHEDULED, updatedBy);
  }

  async markAsAvailable(id, updatedBy = null) {
    return this._updateSlotStatus(id, timeSlotStatus.AVAILABLE, updatedBy);
  }

  async markAsCancelled(id, updatedBy) {
    return this._updateSlotStatus(id, timeSlotStatus.CANCELLED, updatedBy);
  }

  async findAllBySpeciality(specialityId, queryParams) {
    const { nowDate, nowTime } = getNowBogota();

    const result = await functions.paginate(TimeSlot, queryParams, {
      where: {
        estado: timeSlotStatus.AVAILABLE,
        ...buildFutureDateFilter(nowDate, nowTime),
      },
      order: [["createdAt", "ASC"]],
      include: [buildDoctorInclude({ especialidad: specialityId })],
    });

    return toPaginatedResponse(result);
  }
}

module.exports = new TimeSlotService();