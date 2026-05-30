const Appointment = require("../models/appointments.model");
const DoctorModel = require("../models/doctor.model");
const UserModel = require("../models/user.model");
const AppointmentDetailModel = require("../models/appointment-details.model");
const PatientModel = require("../models/patient.model");
const TimeSlotModel = require("../models/time-slot.model");
const SpecialtyModel = require("../models/specialty.model");
const { appointmentsStatus, timeSlotStatus, functions } = require("../utils");
const TimeSlotService = require("./time-slot.service"); // ← eliminada la importación duplicada
const { decryptSensitiveFields } = require("../utils/appointment-detail-crypto");
const { getDateFormatUTC } = require("../utils/functions");
const { Op } = require("sequelize");
const orderService = require("./order.service");

// ── Atributos compartidos ────────────────────────────────────────────────────
const APPOINTMENT_DETAIL_ATTRIBUTES = [
  "motivo", "antecedentes", "anamnesis", "revisionSistemas",
  "examenFisico", "diagnostico", "planManejo", "evolucion",
];

const TIME_SLOT_ATTRIBUTES = ["fecha", "horaInicio", "horaFin"];

const PATIENT_ATTRIBUTES = ["ocupacion", "discapacidad", "etnia", "identidadGenero", "sexo"];

// User del doctor (sin id, con email)
const DOCTOR_USER_ATTRIBUTES = [
  "primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido", "email",
];

// User del paciente (sin id, con direccion y email)
const PATIENT_USER_ATTRIBUTES = [
  "primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido",
  "direccion", "email",
];

// User con id, sin email (para listados de paciente/doctor/especialidad)
const USER_ID_NAME_ATTRIBUTES = [
  "id", "primer_nombre", "segundo_nombre", "primer_apellido", "segundo_apellido",
];

// ── Includes compartidos ─────────────────────────────────────────────────────
const SPECIALTY_INCLUDE = {
  model: SpecialtyModel,
  attributes: ["id", "nombre", "descripcion"],
};

const APPOINTMENT_DETAIL_INCLUDE = {
  model: AppointmentDetailModel,
  attributes: APPOINTMENT_DETAIL_ATTRIBUTES,
};

// Doctor completo: licencia + usuario + especialidad (findAllPaginated / findById)
const DOCTOR_FULL_INCLUDE = {
  model: DoctorModel,
  attributes: ["licenciaMedica"],
  include: [
    { model: UserModel, attributes: DOCTOR_USER_ATTRIBUTES },
    SPECIALTY_INCLUDE,
  ],
};

// Patient completo: atributos clínicos + usuario (findAllPaginated / findById)
const PATIENT_FULL_INCLUDE = {
  model: PatientModel,
  attributes: PATIENT_ATTRIBUTES,
  include: [{ model: UserModel, attributes: PATIENT_USER_ATTRIBUTES }],
};

// Include para findById y getClinicalHistory (sin filtro dinámico)
const APPOINTMENT_DETAIL_FULL_INCLUDE = [
  DOCTOR_FULL_INCLUDE,
  APPOINTMENT_DETAIL_INCLUDE,
  { model: TimeSlotModel, attributes: TIME_SLOT_ATTRIBUTES },
  PATIENT_FULL_INCLUDE,
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Desencripta el AppointmentDetail de una fila y la devuelve como objeto plano. */
function decryptRow(row) {
  const out = row.toJSON ? row.toJSON() : { ...row };
  if (out.AppointmentDetail) {
    out.AppointmentDetail = decryptSensitiveFields(out.AppointmentDetail);
  }
  return out;
}

/** Construye la respuesta paginada estándar con citas. */
function toPaginatedResponse({ rows, count, page, totalPages }) {
  return {
    totalPages,
    totalItems: count,
    currentPage: page,
    citas: rows.map(decryptRow),
  };
}

// ────────────────────────────────────────────────────────────────────────────

class AppointmentService {
  async create(data) {
    const { idDoctor, idFranjaHoraria, idPaciente } = data;
    const appointmentData = {
      ...data,
      tipoCita: data.tipoCita || "general",
      estado: data.estado || appointmentsStatus.PROGRAMADO,
    };

    console.log("Validando especialidad del doctor:", idDoctor);
    await this.validateIsGeneralSpecialty(idDoctor);

    console.log("Validando fecha futura:", idFranjaHoraria);
    await this.validateMustBeFutureDate(idFranjaHoraria);

    console.log("Validando citas previas del paciente:", idPaciente, idFranjaHoraria);
    await this.validatePatientHasNoScheduledAppointments(idPaciente, idFranjaHoraria);

    console.log("Validando franja del doctor:", idDoctor, idFranjaHoraria);
    await this.validateDoctorHasTimeSlot(idDoctor, idFranjaHoraria);

    console.log("Marcando franja como programada:", idFranjaHoraria);
    await TimeSlotService.markAsScheduled(idFranjaHoraria);

    return await Appointment.create({ ...appointmentData });
  }

  async findAll() {
    return await Appointment.findAll();
  }

  async findAllPaginated(queryParams) {
    const nowObj = new Date();
    const nowDate = nowObj.toLocaleDateString("sv-SE", { timeZone: "America/Bogota" });
    const nowTime = nowObj.toLocaleTimeString("en-GB", { timeZone: "America/Bogota" });

    const result = await functions.paginate(Appointment, queryParams, {
      include: [
        {
          model: TimeSlotModel,
          attributes: TIME_SLOT_ATTRIBUTES,
          where: {
            [Op.or]: [
              {
                [Op.and]: [
                  { fecha: { [Op.eq]: nowDate } },
                  { horaInicio: { [Op.gte]: nowTime } },
                ],
              },
              { fecha: { [Op.gt]: nowDate } },
            ],
          },
        },
        DOCTOR_FULL_INCLUDE,
        PATIENT_FULL_INCLUDE,
        APPOINTMENT_DETAIL_INCLUDE,
      ],
    });

    return toPaginatedResponse(result);
  }

  async findByPatient(idPaciente, queryParams) {
    console.log("Finding appointments for patient ID:", idPaciente);

    const result = await functions.paginate(Appointment, queryParams, {
      where: { idPaciente },
      include: [
        {
          model: DoctorModel,
          include: [
            { model: UserModel, attributes: USER_ID_NAME_ATTRIBUTES },
            SPECIALTY_INCLUDE,
          ],
        },
        { model: TimeSlotModel },
        { model: AppointmentDetailModel },
      ],
      order: [["createdAt", "DESC"]],
    });

    return toPaginatedResponse(result);
  }

  async findByDoctor(idDoctor, queryParams) {
    const result = await functions.paginate(Appointment, queryParams, {
      where: { idDoctor },
      include: [
        {
          model: PatientModel,
          include: [{ model: UserModel, attributes: USER_ID_NAME_ATTRIBUTES }],
        },
        {
          model: DoctorModel,
          include: [
            { model: UserModel, attributes: USER_ID_NAME_ATTRIBUTES },
            SPECIALTY_INCLUDE,
          ],
        },
        { model: TimeSlotModel },
        { model: AppointmentDetailModel },
      ],
      order: [["createdAt", "DESC"]],
    });

    return toPaginatedResponse(result);
  }

  async findById(id) {
    const row = await Appointment.findByPk(id, {
      include: APPOINTMENT_DETAIL_FULL_INCLUDE,
    });
    if (!row) return row;
    return decryptRow(row);
  }

  async update(id, data, auditUserId) {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return null;

    await appointment.update({ ...data, updatedBy: auditUserId });
    return appointment;
  }

  async deleteById(id) {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return false;

    await this.validateIsNotCompleted(appointment);

    const timeSlot = await TimeSlotService.findById(appointment.idFranjaHoraria);
    if (timeSlot) {
      await TimeSlotService.markAsAvailable(appointment.idFranjaHoraria);
    }
    await appointment.destroy();
    return true;
  }

  async validateIsNotCompleted(appointment) {
    if (appointment.estado === appointmentsStatus.REALIZADO) {
      throw new Error("No se pueden modificar citas ya realizadas");
    }
  }

  async validateMustBeFutureDate(idFranjaHoraria) {
    const timeSlot = await TimeSlotService.findById(idFranjaHoraria);
    const timeSlotDate = getDateFormatUTC(timeSlot.fecha, timeSlot.horaInicio, "-05:00");

    if (timeSlotDate < new Date()) {
      throw new Error("La fecha del horario debe ser futura");
    }
  }

  async validatePatientHasNoScheduledAppointments(idPaciente, idFranjaHoraria) {
    const newTimeSlot = await TimeSlotService.findById(idFranjaHoraria);
    await TimeSlotService.validateOverlappingSlotsForPatient(
      newTimeSlot.horaInicio,
      newTimeSlot.horaFin,
      newTimeSlot.fecha,
      idPaciente,
    );
  }

  async validateDoctorHasTimeSlot(idDoctor, idFranjaHoraria) {
    const timeSlot = await TimeSlotService.findById(idFranjaHoraria);

    if (!timeSlot || timeSlot.idDoctor !== idDoctor) {
      throw new Error("El médico no tiene horario disponible para esa franja horaria");
    }
    if (timeSlot.estado === timeSlotStatus.SCHEDULED) {
      throw new Error("El horario ya está reservado");
    }
  }

  async updateRescheduledAppointment(id, data, auditUserId = 1) {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return null;

    const oldSlot = await TimeSlotService.findById(appointment.idFranjaHoraria);
    if (!oldSlot) throw new Error("Old time slot not found");

    await TimeSlotService.markAsAvailable(appointment.idFranjaHoraria, auditUserId);
    await TimeSlotService.markAsScheduled(data.idFranjaHoraria);
    await appointment.update({ ...data, updatedBy: auditUserId });
    return appointment;
  }

  async updateAppointmentCompleted(id, auditUserId = 1) {
    const appointment = await Appointment.findByPk(id, {
      include: [{ model: TimeSlotModel, attributes: TIME_SLOT_ATTRIBUTES }],
    });
    if (!appointment) return null;

    await this.validateAppointmentIsCurrently(appointment);
    await appointment.update({ estado: appointmentsStatus.REALIZADO, updatedBy: auditUserId });
    return appointment;
  }

  async validateAppointmentIsCurrently(appointment) {
    const nowDate = new Date();
    const { fecha, horaInicio, horaFin } = appointment.TimeSlot;

    if (
      nowDate < getDateFormatUTC(fecha, horaInicio, "-05:00") ||
      nowDate > getDateFormatUTC(fecha, horaFin, "-05:00")
    ) {
      throw new Error("La cita no está en curso, no se puede marcar como realizada");
    }
  }

  async cancelAppointment(id, auditUserId = 1) {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return null;

    if (appointment.estado === appointmentsStatus.CANCELADO) {
      throw new Error("Appointment is already canceled");
    }

    await appointment.update({ estado: appointmentsStatus.CANCELADO, updatedBy: auditUserId });
    return appointment;
  }

  async getClinicalHistory(idPaciente) {
    const appointmentsHistory = await Appointment.findAll({
      where: { idPaciente },
      include: [
        // getClinicalHistory usa Specialty con solo "nombre" (sin id/descripcion)
        {
          model: DoctorModel,
          attributes: ["licenciaMedica"],
          include: [
            { model: UserModel, attributes: DOCTOR_USER_ATTRIBUTES },
            { model: SpecialtyModel, attributes: ["nombre"] },
          ],
        },
        APPOINTMENT_DETAIL_INCLUDE,
        { model: TimeSlotModel, attributes: TIME_SLOT_ATTRIBUTES },
        PATIENT_FULL_INCLUDE,
      ],
      order: [
        [TimeSlotModel, "fecha", "DESC"],
        [TimeSlotModel, "horaInicio", "DESC"],
      ],
    });

    return {
      citas: appointmentsHistory.map((a) => ({
        id: a.id,
        tipoCita: a.tipoCita,
        estado: a.estado,
        idPaciente: a.idPaciente,
        idDoctor: a.idDoctor,
        idFranjaHoraria: a.idFranjaHoraria,
        createdAt: a.createdAt,
        horario: this.mapTimeSlot(a.TimeSlot),
        detalles: this.mapAppointmentDetail(a.AppointmentDetail),
        doctor: this.mapDoctor(a.Doctor),
      })),
      datosPaciente: this.mapPatient(appointmentsHistory[0]?.Patient),
    };
  }

  mapDoctor(doctor) {
    if (!doctor) return null;
    return {
      doctorNombreCompleto: `${doctor.User.primer_nombre} ${doctor.User.segundo_nombre || ""} ${doctor.User.primer_apellido} ${doctor.User.segundo_apellido || ""}`,
      doctorLicencia: doctor.licenciaMedica,
      doctorEmail: doctor.User.email,
      doctorEspecialidad: doctor.Specialty ? doctor.Specialty.nombre : "General",
    };
  }

  mapAppointmentDetail(appointmentDetail) {
    if (!appointmentDetail) return null;
    const decrypted = decryptSensitiveFields(appointmentDetail);
    return {
      motivo: decrypted.motivo,
      antecedentes: decrypted.antecedentes,
      anamnesis: decrypted.anamnesis,
      revisionSistemas: decrypted.revisionSistemas,
      examenFisico: decrypted.examenFisico,
      diagnostico: decrypted.diagnostico,
      planManejo: decrypted.planManejo,
      evolucion: decrypted.evolucion,
    };
  }

  mapTimeSlot(timeSlot) {
    if (!timeSlot) return null;
    return {
      fecha: timeSlot.fecha,
      horaInicio: timeSlot.horaInicio,
      horaFin: timeSlot.horaFin,
    };
  }

  mapPatient(patient) {
    if (!patient) return null;
    return {
      id: patient.id,
      ocupacion: patient.ocupacion,
      discapacidad: patient.discapacidad,
      etnia: patient.etnia,
      identidadGenero: patient.identidadGenero,
      sexo: patient.sexo,
      nombreCompleto: `${patient.User.primer_nombre} ${patient.User.segundo_nombre || ""} ${patient.User.primer_apellido} ${patient.User.segundo_apellido || ""}`,
      direccion: patient.User.direccion,
      email: patient.User.email,
    };
  }

  async appointmentExists(id) {
    const appointment = await Appointment.findByPk(id);
    return !!appointment;
  }

  async findBySpecialty(idSpecialty, queryParams) {
    const result = await functions.paginate(Appointment, queryParams, {
      include: [
        {
          model: DoctorModel,
          where: { idEspecialidad: idSpecialty },
          include: [{ model: UserModel, attributes: USER_ID_NAME_ATTRIBUTES }],
        },
        {
          model: PatientModel,
          include: [{ model: UserModel, attributes: USER_ID_NAME_ATTRIBUTES }],
        },
        { model: TimeSlotModel },
        { model: AppointmentDetailModel },
      ],
      order: [["createdAt", "DESC"]],
    });

    return toPaginatedResponse(result);
  }

  async validateHasOrder(idPatient, idSpecialty) {
    const order = await orderService.validatePatientHasAuthorizedOrders(idPatient, idSpecialty);

    if (!order) {
      throw new Error("El paciente no tiene órdenes autorizadas asociadas para esa especialidad");
    }

    await this.validateOrderAvailable(order.dataValues);
    return order;
  }

  async validateOrderAvailable(order) {
    console.log("validateOrderAvailable", { order });

    if (new Date(order.fechaVencimiento) < new Date()) {
      throw new Error("La orden ha vencido y no se puede usar para crear una cita");
    }
  }

  async validateIsGeneralSpecialty(idDoctor) {
    const doctor = await DoctorModel.findByPk(idDoctor);
    if (!doctor) throw new Error("Doctor no encontrado");

    const specialty = await SpecialtyModel.findByPk(doctor.especialidad);
    if (specialty !== null) {
      throw new Error("El paciente no puede agendar una cita general con un médico especialista");
    }
  }

  async validateDoctorSpecialty(idDoctor, idSpecialty) {
    const doctor = await DoctorModel.findByPk(idDoctor);
    if (!doctor) throw new Error("Doctor no encontrado");

    console.log("validateDoctorSpecialty - idDoctor:", idDoctor, "tipo:", typeof idDoctor);
    console.log("validateDoctorSpecialty - idSpecialty:", idSpecialty, "tipo:", typeof idSpecialty);
    console.log("validateDoctorSpecialty - doctor.especialidad:", doctor.especialidad, "tipo:", typeof doctor.especialidad);

    if (Number(doctor.especialidad) !== Number(idSpecialty)) {
      throw new Error("El médico no pertenece a la especialidad seleccionada");
    }
  }

  async createBySpecialty(idSpecialty, data, userId) {
    console.log("==== createBySpecialty ====");
    console.log("idSpecialty:", idSpecialty, "tipo:", typeof idSpecialty);
    console.log("data:", data);
    console.log("userId:", userId);

    const { idDoctor, idFranjaHoraria, idPaciente } = data;

    console.log("idDoctor:", idDoctor, "tipo:", typeof idDoctor);
    console.log("idFranjaHoraria:", idFranjaHoraria, "tipo:", typeof idFranjaHoraria);
    console.log("idPaciente:", idPaciente, "tipo:", typeof idPaciente);

    await this.validateDoctorSpecialty(idDoctor, idSpecialty);
    await this.validateMustBeFutureDate(idFranjaHoraria);
    await this.validatePatientHasNoScheduledAppointments(idPaciente, idFranjaHoraria);
    await this.validateDoctorHasTimeSlot(idDoctor, idFranjaHoraria);

    const order = await this.validateHasOrder(idPaciente, idSpecialty);
    await orderService.setCompletedOrder(order.dataValues.id);
    await TimeSlotService.markAsScheduled(idFranjaHoraria);

    const appointmentData = {
      ...data,
      tipoCita: data.tipoCita || "general",
      estado: data.estado || appointmentsStatus.PROGRAMADO,
    };

    return await Appointment.create({ ...appointmentData });
  }
}

module.exports = new AppointmentService();