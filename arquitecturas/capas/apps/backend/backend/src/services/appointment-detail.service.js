const AppointmentDetail = require("../models/appointment-details.model");
const AppointmentService = require("./appointmet.service");
const AppointmentModel = require("../models/appointments.model");
const PatientModel = require("../models/patient.model");
const DoctorModel = require("../models/doctor.model");
const UserModel = require("../models/user.model");
const TimeSlotModel = require("../models/time-slot.model");
const { functions } = require("../utils");
const {
  encryptSensitiveFields,
  decryptSensitiveFields,
} = require("../utils/appointment-detail-crypto");

class AppointmentDetailService {
  async create(data, auditUserId) {
    await this.validateDetail(data, false); // false = no requiere diagnóstico
    return await AppointmentDetail.create({
      ...encryptSensitiveFields(data),
      createdBy: auditUserId,
      updatedBy: auditUserId,
    });
  }

  async validateDetail(data, requireDiagnostico = true) {
    const { motivo, diagnostico, idCita } = data;
    
    // Motivo e idCita siempre son requeridos
    if (!motivo || !idCita) {
      throw new Error("motivo e idCita son requeridos");
    }
    
    // Diagnóstico solo es requerido si se especifica (ej: al actualizar después de la consulta)
    if (requireDiagnostico && !diagnostico) {
      throw new Error("diagnostico es requerido");
    }

    const appointmentExists =
      await AppointmentService.appointmentExists(idCita);
    if (!appointmentExists) {
      throw new Error("La cita no existe");
    }

    const appointmentHasDetails = await AppointmentDetail.findOne({
      where: { idCita },
    });
    if (appointmentHasDetails) {
      throw new Error("La cita ya tiene detalles registrados");
    }
  }

  async findAll() {
    const rows = await AppointmentDetail.findAll();
    return rows.map((row) => decryptSensitiveFields(row));
  }

  async findAllPaginated(queryParams) {
    const { rows, count, page, totalPages } = await functions.paginate(
      AppointmentDetail,
      queryParams,
      {
        include: [
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
              {
                model: TimeSlotModel,
                attributes: ["fecha", "horaInicio", "horaFin"],
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
            ],
          },
        ],
      },
    );

    return {
      totalPages,
      totalItems: count,
      currentPage: page,
      detallesCitas: rows.map((row) => decryptSensitiveFields(row)),
    };
  }

  async findByAppointmentId(appointmentId) {
    const row = await AppointmentDetail.findOne({
      where: { idCita: appointmentId },
    });
    return decryptSensitiveFields(row);
  }

  async findById(id) {
    const row = await AppointmentDetail.findByPk(id, {
      include: [
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
            {
              model: TimeSlotModel,
              attributes: ["fecha", "horaInicio", "horaFin"],
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
          ],
        },
      ],
    });
    return decryptSensitiveFields(row);
  }

  async update(id, data, auditUserId) {
    const detail = await AppointmentDetail.findByPk(id);
    if (!detail) return null;

    // No validar duplicados al actualizar (solo al crear)
    const { motivo, idCita } = data;
    if (!motivo || !idCita) {
      throw new Error("motivo e idCita son requeridos");
    }

    await detail.update({
      ...encryptSensitiveFields(data),
      idCita: detail.idCita,
      updatedBy: auditUserId,
    });
    return decryptSensitiveFields(detail);
  }

  async delete(id) {
    const detail = await AppointmentDetail.findByPk(id);
    if (!detail) return false;

    await detail.destroy();
    return true;
  }
}

module.exports = new AppointmentDetailService();
