"use strict";
const Order = require("../models/order.model");
const AppointmentModel = require("../models/appointments.model");
const TimeSlotModel = require("../models/time-slot.model");
const PatientModel = require("../models/patient.model");
const DoctorModel = require("../models/doctor.model");
const UserModel = require("../models/user.model");
const { functions, ordersStatus } = require("../utils");
const RabbitMQService = require("./rabbitMqService/rabbitmq.service");
const specialtyService = require("./specialty.service");

class OrderService {
  async create(data, auditUserId) {
    const order = await Order.create({
      ...data,
      creadoPor: auditUserId,
      actualizadoPor: auditUserId,
    });

    const { dataValues: specialty } = await specialtyService.getSpecialty(
      order.especialidad,
    );

    console.log({ specialty });

    if (!specialty) {
      throw new Error("Especialidad no encontrada");
    }

    order.dataValues.specialtyName = specialty.nombre;

    console.log({ order });

    const rabbitService = new RabbitMQService();
    const publisher = rabbitService.getPublisherService();
    await publisher.setUp("clinic_events");

    await publisher.publishEvent("order.created", {
      ...order,
    });

    return order;
  }

  async findAll(queryParams) {
    console.log("Query Params:", queryParams);
    let idCita = undefined;
    if (queryParams.idCita) {
      idCita = Number(queryParams.idCita, 10);
    }

    const { rows, count, page, totalPages } = await functions.paginate(
      Order,
      queryParams,
      {
        where: idCita !== undefined ? { idCita: idCita } : {},
        include: [
          {
            model: AppointmentModel,
            attributes: ["id", "tipoCita", "estado"],
            include: [
              {
                model: TimeSlotModel,
                attributes: ["id", "fecha", "horaInicio", "horaFin"],
              },
              {
                model: PatientModel,
                attributes: [
                  "id",
                  "religion",
                  "discapacidad",
                  "etnia",
                  "ocupacion",
                ],
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
                model: DoctorModel,
                attributes: ["id", "licenciaMedica"],
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
            ],
          },
        ],
      },
    );

    return {
      totalPages,
      totalItems: count,
      currentPage: page,
      ordenes: rows,
    };
  }

  async findById(id) {
    return await Order.findByPk(id, {
      include: [
        {
          model: AppointmentModel,
          attributes: ["id", "tipoCita", "estado"],
          include: [
            {
              model: TimeSlotModel,
              attributes: ["id", "fecha", "horaInicio", "horaFin"],
            },
            {
              model: PatientModel,
              attributes: [
                "id",
                "religion",
                "discapacidad",
                "etnia",
                "ocupacion",
              ],
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
              model: DoctorModel,
              attributes: ["id", "licenciaMedica"],
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
          ],
        },
      ],
    });
  }

  async update(id, data, auditUserId) {
    const order = await Order.findByPk(id);
    if (!order) return null;

    await order.update({
      ...data,
      actualizadoPor: auditUserId,
    });
    return order;
  }

  async delete(id) {
    const order = await Order.findByPk(id);
    if (!order) return false;

    await order.destroy();
    return true;
  }

  async setCompletedOrder(idOrder) {
    const order = await Order.findByPk(idOrder);
    if (!order) return false;

    await order.update({
      estado: ordersStatus.COMPLETED,
    });
    return order;
  }

  async validatePatientHasAuthorizedOrders(idPatient, isSpeciality) {
    console.log("validatePatientHasAuthorizedOrders", {
      idPatient,
      isSpeciality,
    });

    const order = await Order.findOne({
      where: { estado: ordersStatus.AUTHORIZED, especialidad: isSpeciality },
      include: [
        {
          model: AppointmentModel,
          where: { idPaciente: idPatient },
        },
      ],
    });
    return order;
  }

  async getOrdersByPatient(idPaciente, queryParams) {
    const { rows, count, page, totalPages } = await functions.paginate(
      Order,
      queryParams,
      {
        include: [
          {
            model: AppointmentModel,
            where: { idPaciente },
            attributes: ["id", "tipoCita", "estado"],
            include: [
              {
                model: TimeSlotModel,
                attributes: ["id", "fecha", "horaInicio", "horaFin"],
              },
              {
                model: DoctorModel,
                attributes: ["id", "licenciaMedica"],
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
            ],
          },
        ],
      },
    );

    return {
      totalPages,
      totalItems: count,
      currentPage: page,
      ordenes: rows,
    };
  }
}

module.exports = new OrderService();
