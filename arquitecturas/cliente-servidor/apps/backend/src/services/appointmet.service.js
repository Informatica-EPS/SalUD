const Appointment = require("../models/appointments.model");
const DoctorModel = require("../models/doctor.model");
const UserModel = require("../models/user.model");
const AppointmentDetailModel = require("../models/appointment-details.model");
const PatientModel = require("../models/patient.model");
const TimeSlotModel = require("../models/time-slot.model");
const { appointmentsStatus, timeSlotStatus, functions } = require("../utils");
const TimeSlotService = require("./time-slot.service");
const {
  decryptSensitiveFields,
} = require("../utils/appointment-detail-crypto");
const timeSlotService = require("./time-slot.service");
const { getDateFormatUTC } = require("../utils/functions");
const { Op } = require("sequelize");

class AppointmentService {
  async create(data) {
    const { idDoctor, idHorario, idPaciente } = data;

    await this.validateMustBeFutureDate(idHorario);
    await this.validatePatientHasNoScheduledAppointments(idPaciente, idHorario);
    await this.validateDoctorHasTimeSlot(idDoctor, idHorario);

    return await Appointment.create({
      ...data,
    });
  }

  async findAll() {
    return await Appointment.findAll();
  }

  async findAllPaginated(queryParams) {
    const nowObj = new Date();
    const nowDate = nowObj.toLocaleDateString("sv-SE", {
      timeZone: "America/Bogota",
    });

    const nowTime = nowObj.toLocaleTimeString("en-GB", {
      timeZone: "America/Bogota",
    });

    const { rows, count, page, totalPages } = await functions.paginate(
      Appointment,
      queryParams,
      {
        include: [
          {
            model: TimeSlotModel,
            attributes: ["fecha", "horaInicio", "horaFin"],
            where: {
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
          },
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
          {
            model: AppointmentDetailModel,
            attributes: [
              "motivo",
              "antecedentes",
              "anamnesis",
              "revisionSistemas",
              "examenFisico",
              "diagnostico",
              "planManejo",
              "evolucion",
            ],
          },
        ],
      },
    );

    return {
      totalPages,
      totalItems: count,
      currentPage: page,
      citas: rows.map((row) => {
        const out = row.toJSON ? row.toJSON() : { ...row };
        if (out.AppointmentDetail) {
          out.AppointmentDetail = decryptSensitiveFields(out.AppointmentDetail);
        }
        return out;
      }),
    };
  }

  async findByPatient(idPaciente, queryParams) {
    console.log("Finding appointments for patient ID:", idPaciente);

    const { rows, count, page, totalPages } = await functions.paginate(
      Appointment,
      queryParams,
      {
        where: { idPaciente },
        include: [
          {
            model: DoctorModel,
            include: [
              {
                model: UserModel,
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
          {
            model: TimeSlotModel,
          },
          {
            model: AppointmentDetailModel,
          },
        ],
        order: [["createdAt", "DESC"]],
      },
    );

    return {
      totalPages,
      currentPage: page,
      totalItems: count,
      citas: rows.map((row) => {
        const out = row.toJSON ? row.toJSON() : { ...row };
        if (out.AppointmentDetail) {
          out.AppointmentDetail = decryptSensitiveFields(out.AppointmentDetail);
        }
        return out;
      }),
    };
  }

  async findByDoctor(idDoctor, queryParams) {
    const { rows, count, page, totalPages } = await functions.paginate(
      Appointment,
      queryParams,
      {
        where: { idDoctor },
        include: [
          {
            model: PatientModel,
            include: [
              {
                model: UserModel,
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
          {
            model: TimeSlotModel,
          },
          {
            model: AppointmentDetailModel,
          },
        ],
        order: [["createdAt", "DESC"]],
      },
    );

    return {
      totalPages,
      currentPage: page,
      totalItems: count,
      citas: rows.map((row) => {
        const out = row.toJSON ? row.toJSON() : { ...row };
        if (out.AppointmentDetail) {
          out.AppointmentDetail = decryptSensitiveFields(out.AppointmentDetail);
        }
        return out;
      }),
    };
  }

  async findById(id) {
    const row = await Appointment.findByPk(id, {
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
          model: AppointmentDetailModel,
          attributes: [
            "motivo",
            "antecedentes",
            "anamnesis",
            "revisionSistemas",
            "examenFisico",
            "diagnostico",
            "planManejo",
            "evolucion",
          ],
        },
        {
          model: TimeSlotModel,
          attributes: ["fecha", "horaInicio", "horaFin"],
        },
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
    });
    if (!row) return row;
    const out = row.toJSON ? row.toJSON() : { ...row };
    if (out.AppointmentDetail) {
      out.AppointmentDetail = decryptSensitiveFields(out.AppointmentDetail);
    }
    return out;
  }

  async update(id, data, auditUserId) {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return null;

    await appointment.update({
      ...data,
      updatedBy: auditUserId,
    });
    return appointment;
  }

  async deleteById(id) {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return false;

    await this.validateIsNotCompleted(appointment);

    const timeSlot = await TimeSlotService.findById(appointment.idHorario);

    if (timeSlot) {
      await TimeSlotService.markAsAvailable(appointment.idHorario);
    }
    await appointment.destroy();
    return true;
  }

  async validateIsNotCompleted(appointment) {
    if (appointment.estado === appointmentsStatus.REALIZADO) {
      throw new Error("No se pueden modificar citas ya realizadas");
    }
  }

  async validateMustBeFutureDate(idHorario) {
    const timeSlot = await TimeSlotService.findById(idHorario);

    const nowDate = new Date();
    const initTime = timeSlot.horaInicio;

    const timeSlotDate = getDateFormatUTC(timeSlot.fecha, initTime, "-05:00");

    if (timeSlotDate < nowDate) {
      throw new Error("La fecha del horario debe ser futura");
    }
  }

  async validatePatientHasNoScheduledAppointments(idPaciente, idHorario) {
    const newTimeSlot = await timeSlotService.findById(idHorario);

    await timeSlotService.validateOverlappingSlotsForPatient(
      newTimeSlot.horaInicio,
      newTimeSlot.horaFin,
      newTimeSlot.fecha,
      idPaciente,
    );
  }

  async validateDoctorHasTimeSlot(idDoctor, idHorario) {
    const timeSlot = await TimeSlotService.findById(idHorario);

    if (!timeSlot || timeSlot.idDoctor !== idDoctor) {
      throw new Error(
        "El médico no tiene horario disponible para esa franja horaria",
      );
    }

    if (timeSlot.estado === timeSlotStatus.SCHEDULED) {
      throw new Error("El horario ya está reservado");
    }

    await TimeSlotService.markAsScheduled(idHorario);
  }

  async updateRescheduledAppointment(id, data, auditUserId = 1) {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return null;

    const oldSlot = await TimeSlotService.findById(appointment.idHorario);
    if (!oldSlot) {
      throw new Error("Old time slot not found");
    }

    await TimeSlotService.markAsAvailable(appointment.idHorario, auditUserId);

    await TimeSlotService.markAsScheduled(data.idHorario);

    await appointment.update({
      ...data,
      updatedBy: auditUserId,
    });
    return appointment;
  }

  async updateAppointmentCompleted(id, auditUserId = 1) {
    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: TimeSlotModel,
          attributes: ["fecha", "horaInicio", "horaFin"],
        },
      ],
    });
    if (!appointment) return null;

    await this.validateAppointmentIsCurrently(appointment);

    await appointment.update({
      estado: appointmentsStatus.REALIZADO,
      updatedBy: auditUserId,
    });
    return appointment;
  }

  async validateAppointmentIsCurrently(appointment) {
    const nowDate = new Date();
    const initTime = appointment.TimeSlot.horaInicio;
    const endTime = appointment.TimeSlot.horaFin;

    if (
      nowDate <
        getDateFormatUTC(appointment.TimeSlot.fecha, initTime, "-05:00") ||
      nowDate > getDateFormatUTC(appointment.TimeSlot.fecha, endTime, "-05:00")
    ) {
      throw new Error(
        "La cita no está en curso, no se puede marcar como realizada",
      );
    }
  }

  async cancelAppointment(id, auditUserId = 1) {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return null;

    if (appointment.estado === appointmentsStatus.CANCELADO) {
      throw new Error("Appointment is already canceled");
    }

    await appointment.update({
      estado: appointmentsStatus.CANCELADO,
      updatedBy: auditUserId,
    });
    return appointment;
  }

  async getClinicalHistory(idPaciente) {
    const appointmentsHistory = await Appointment.findAll({
      where: { idPaciente },
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
          model: AppointmentDetailModel,
          attributes: [
            "motivo",
            "antecedentes",
            "anamnesis",
            "revisionSistemas",
            "examenFisico",
            "diagnostico",
            "planManejo",
            "evolucion",
          ],
        },
        {
          model: TimeSlotModel,
          attributes: ["fecha", "horaInicio", "horaFin"],
        },
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
        idHorario: a.idHorario,
        createdAt: a.createdAt,
        id_paciente: 1,
        id_doctor: 1,
        id_horario: 3,
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
      doctorLicencia: doctor.licencia_medica,
      doctorEmail: doctor.User.email,
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
}

module.exports = new AppointmentService();
