const Appointment = require("../models/appointments.model");
const DoctorModel = require("../models/doctor.model");
const UserModel = require("../models/user.model");
const AppointmentDetailModel = require("../models/appointment-details.model");
const PatientModel = require("../models/patient.model");
const TimeSlotModel = require("../models/time-slot.model");
const { appointmentsStatus, timeSlotStatus, functions } = require("../utils");
const TimeSlotService = require("./time-slot.service");

class AppointmentService {
  async create(data) {
    const { idDoctor, idHorario } = data;

    await this.validateDoctorHasTimeSlot(idDoctor, idHorario);

    return await Appointment.create({
      ...data,
    });
  }

  async findAll() {
    return await Appointment.findAll();
  }

  async findAllPaginated(queryParams) {
    const { rows, count, page, totalPages } = await functions.paginate(
      Appointment,
      queryParams,
    );

    return {
      totalPages,
      totalItems: count,
      currentPage: page,
      citas: rows,
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
      citas: rows,
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
      citas: rows,
    };
  }

  async findById(id) {
    return await Appointment.findByPk(id);
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

    await appointment.destroy();
    return true;
  }

  async validateDoctorHasTimeSlot(idDoctor, idHorario) {
    const timeSlot = await TimeSlotService.findById(idHorario);
    console.log("validateDoctorHasTimeSlot", timeSlot);

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
    if (!appointment) return null; // throw new Error("Appointment not found");

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
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return null;

    await appointment.update({
      estado: appointmentsStatus.REALIZADO,
      updatedBy: auditUserId,
    });
    return appointment;
  }

  async cancelAppointment(id, auditUserId = 1) {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return null;

    // si ya está cancelada desbordar

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
    return {
      motivo: appointmentDetail.motivo,
      antecedentes: appointmentDetail.antecedentes,
      anamnesis: appointmentDetail.anamnesis,
      revisionSistemas: appointmentDetail.revisionSistemas,
      examenFisico: appointmentDetail.examenFisico,
      diagnostico: appointmentDetail.diagnostico,
      planManejo: appointmentDetail.planManejo,
      evolucion: appointmentDetail.evolucion,
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
