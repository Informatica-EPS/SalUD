const AppointmentDetail = require("../models/appointment-details.model");
const AppointmentService = require("./appointmet.service");
const AppointmentModel = require("../models/appointments.model");
const PatientModel = require("../models/patient.model");
const DoctorModel = require("../models/doctor.model");
const UserModel = require("../models/user.model");
const TimeSlotModel = require("../models/time-slot.model");

const { functions } = require("../utils");

class AppointmentDetailService {
  async create(data, auditUserId) {
    await this.validateDetail(data);
    return await AppointmentDetail.create({
      ...data,
      createdBy: auditUserId,
      updatedBy: auditUserId,
    });
  }

  async validateDetail(data) {
    const { motivo, diagnostico, idCita } = data;
    if (!motivo || !diagnostico || !idCita) {
      throw new Error("motivo, diagnostico e idCita son requeridos");
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
    return await AppointmentDetail.findAll();
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
      detallesCitas: rows,
    };
  }

  async findByAppointmentId(appointmentId) {
    return await AppointmentDetail.findOne({
      where: { idCita: appointmentId },
    });
  }

  async findById(id) {
    return await AppointmentDetail.findByPk(id, {
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
  }

  async update(id, data, auditUserId) {
    const detail = await AppointmentDetail.findByPk(id);
    if (!detail) return null;

    await this.validateDetail(data);

    await detail.update({
      ...data,
      idCita: detail.idCita,
      updatedBy: auditUserId,
    });
    return detail;
  }

  async delete(id) {
    const detail = await AppointmentDetail.findByPk(id);
    if (!detail) return false;

    await detail.destroy();
    return true;
  }
}

module.exports = new AppointmentDetailService();
