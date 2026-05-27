"use strict";
const crypto = require("node:crypto");
const Order = require("../models/order.model");
const AppointmentModel = require("../models/appointments.model");
const TimeSlotModel = require("../models/time-slot.model");
const PatientModel = require("../models/patient.model");
const DoctorModel = require("../models/doctor.model");
const UserModel = require("../models/user.model");
const SpecialtyModel = require("../models/specialty.model");
const { functions, ordersStatus } = require("../utils");
const RabbitMQService = require("./rabbitMqService/rabbitmq.service");
const specialtyService = require("./specialty.service");

// ── Atributos compartidos ────────────────────────────────────────────────────
const USER_NAME_ATTRIBUTES = [
  "id", "primer_nombre", "segundo_nombre",
  "primer_apellido", "segundo_apellido",
];
const PATIENT_ATTRIBUTES = ["id", "religion", "discapacidad", "etnia", "ocupacion"];
const TIME_SLOT_ATTRIBUTES = ["id", "fecha", "horaInicio", "horaFin"];
const SPECIALTY_INCLUDE = {
  model: SpecialtyModel,
  attributes: ["id", "nombre", "descripcion"],
};

// ── Include completo (findAll / findById) ────────────────────────────────────
const ORDER_FULL_INCLUDE = [
  SPECIALTY_INCLUDE,
  {
    model: AppointmentModel,
    attributes: ["id", "tipoCita", "estado"],
    include: [
      { model: TimeSlotModel, attributes: TIME_SLOT_ATTRIBUTES },
      {
        model: PatientModel,
        attributes: PATIENT_ATTRIBUTES,
        include: [{ model: UserModel, attributes: USER_NAME_ATTRIBUTES }],
      },
      {
        model: DoctorModel,
        attributes: ["id", "licenciaMedica"],
        include: [{ model: UserModel, attributes: USER_NAME_ATTRIBUTES }],
      },
    ],
  },
];

// ── Include para getOrdersByPatient (filtro dinámico por paciente) ────────────
const buildPatientOrdersInclude = (idPaciente) => [
  SPECIALTY_INCLUDE,
  {
    model: AppointmentModel,
    where: { idPaciente },
    attributes: ["id", "tipoCita", "estado"],
    include: [
      { model: TimeSlotModel, attributes: TIME_SLOT_ATTRIBUTES },
      {
        model: DoctorModel,
        attributes: ["id", "licenciaMedica"],
        include: [{ model: UserModel, attributes: USER_NAME_ATTRIBUTES }],
      },
    ],
  },
];

// ── Include para findByPatientDocument (filtro dinámico por documento) ────────
const buildDocumentOrdersInclude = (hashedDocumento) => [
  SPECIALTY_INCLUDE,
  {
    model: AppointmentModel,
    required: true,
    attributes: ["id", "tipoCita", "estado"],
    include: [
      { model: TimeSlotModel, attributes: TIME_SLOT_ATTRIBUTES },
      {
        model: PatientModel,
        required: true,
        attributes: PATIENT_ATTRIBUTES,
        include: [
          {
            model: UserModel,
            required: true,
            where: { documento: hashedDocumento },
            attributes: [...USER_NAME_ATTRIBUTES, "documento"],
          },
        ],
      },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────

class OrderService {
  async create(data, auditUserId) {
    console.log("create ->", { data });

    const order = await Order.create({
      ...data,
      tipo: data.tipo || (data.idMedicamento ? "medicamento" : "especialidad"),
      creadoPor: auditUserId,
      actualizadoPor: auditUserId,
    });

    if (order.especialidad) {
      const { dataValues: specialty } = await specialtyService.getSpecialty(
        order.especialidad,
      );

      if (!specialty) throw new Error("Especialidad no encontrada");

      order.dataValues.specialtyName = specialty.nombre;
      console.log({ order });

      const rabbitService = new RabbitMQService();
      const publisher = rabbitService.getPublisherService();
      await publisher.setUp("clinic_events");
      await publisher.publishEvent("order.created", { ...order });

      return order;
    }

    if (order.idMedicamento) {
      console.log("Orden de medicamento creada");
      return order;
    }
  }

  async findAll(queryParams) {
    console.log("Query Params:", queryParams);
    const idCita = queryParams.idCita ? Number(queryParams.idCita, 10) : undefined;

    const { rows, count, page, totalPages } = await functions.paginate(
      Order,
      queryParams,
      {
        where: idCita !== undefined ? { idCita } : {},
        include: ORDER_FULL_INCLUDE,
      },
    );

    return { totalPages, totalItems: count, currentPage: page, ordenes: rows };
  }

  async findById(id) {
    return await Order.findByPk(id, { include: ORDER_FULL_INCLUDE });
  }

  async update(id, data, auditUserId) {
    const order = await Order.findByPk(id);
    if (!order) return null;

    await order.update({ ...data, actualizadoPor: auditUserId });
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

    await order.update({ estado: ordersStatus.COMPLETED });
    return order;
  }

  async validatePatientHasAuthorizedOrders(idPatient, isSpeciality) {
    console.log("validatePatientHasAuthorizedOrders", { idPatient, isSpeciality });

    return await Order.findOne({
      where: { estado: ordersStatus.AUTHORIZED, especialidad: isSpeciality },
      include: [{ model: AppointmentModel, where: { idPaciente: idPatient } }],
    });
  }

  async getOrdersByPatient(idPaciente, queryParams) {
    const { rows, count, page, totalPages } = await functions.paginate(
      Order,
      queryParams,
      { include: buildPatientOrdersInclude(idPaciente) },
    );

    return { totalPages, totalItems: count, currentPage: page, ordenes: rows };
  }

  async findByPartientDocument(document, queryParams) {
    const hashedDocumento = crypto
      .createHash("sha256")
      .update(document)
      .digest("hex");

    const { rows, count, page, totalPages } = await functions.paginate(
      Order,
      queryParams,
      { include: buildDocumentOrdersInclude(hashedDocumento) },
    );

    return { totalPages, totalItems: count, currentPage: page, ordenes: rows };
  }

  // NOTA: se eliminó la primera definición de este método — usaba `queryParams`
  // y `hashedDocumento` que no estaban definidos en su scope (era código muerto).
  async validatePatientHasMedicamentOrder(
    idPaciente,
    idOrder,
    idMedicamento,
    AppointmentService,
  ) {
    console.log("validatePatientHasMedicamentOrder", { idPaciente, idOrder, idMedicamento });

    const order = await Order.findByPk(idOrder);

    if (!order) throw new Error("No existe la orden");
    if (order.estado !== ordersStatus.AUTHORIZED)
      throw new Error("Orden no autorizada para medicamento");
    if (order.idMedicamento !== idMedicamento)
      throw new Error("Este medicamento no esta autorizado para ser despachado en esta orden");

    const appointment = await AppointmentService.findById(order.idCita);
    if (appointment.idPaciente !== idPaciente)
      throw new Error("El paciente no tiene esa orden asociada");

    return await order.update({ estado: ordersStatus.COMPLETED });
  }
}

module.exports = new OrderService();