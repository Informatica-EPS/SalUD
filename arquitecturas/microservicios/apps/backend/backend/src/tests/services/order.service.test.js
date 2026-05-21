const orderService = require("../../services/order.service");
const specialtyService = require("../../services/specialty.service");
const orderModel = require("../../models/order.model");

jest.mock("../../models/order.model");
jest.mock("../../services/specialty.service");
jest.mock("../../utils", () => ({
  functions: { paginate: jest.fn() },
  ordersStatus: { AUTHORIZED: "autorizada", COMPLETED: "completada" },
}));
jest.mock("../../services/rabbitMqService/rabbitmq.service", () =>
  jest.fn().mockImplementation(() => ({
    getPublisherService: () => ({
      setUp: jest.fn().mockResolvedValue(undefined),
      publishEvent: jest.fn().mockResolvedValue(undefined),
    }),
  }))
);

const { functions } = require("../../utils");

const paginatedResult = (rows) => ({
  rows,
  count: rows.length,
  page: 1,
  totalPages: 1,
});

beforeEach(() => jest.clearAllMocks());

describe("order service", () => {
  describe("create", () => {
    test("crea orden de especialidad", async () => {
      orderModel.create.mockImplementation((param) => ({
        ...param,
        dataValues: { ...param },
      }));
      specialtyService.getSpecialty.mockResolvedValue({
        dataValues: { nombre: "Cardiología" },
      });

      const result = await orderService.create({ especialidad: 1 }, 1);
      expect(result).toBeDefined();
      expect(result.dataValues.specialtyName).toBe("Cardiología");
    });

    test("crea orden de medicamento", async () => {
      orderModel.create.mockImplementation((param) => ({ ...param }));

      const result = await orderService.create({ idMedicamento: 5 }, 1);
      expect(result).toBeDefined();
      expect(result.idMedicamento).toBe(5);
    });
  });

  describe("findAll", () => {
    test("retorna órdenes paginadas", async () => {
      functions.paginate.mockResolvedValue(paginatedResult([{ id: 1 }]));

      const result = await orderService.findAll({});
      expect(result).toEqual({
        totalPages: 1,
        totalItems: 1,
        currentPage: 1,
        ordenes: [{ id: 1 }],
      });
    });
  });

  describe("findById", () => {
    test("retorna la orden por id", async () => {
      const mockOrder = { id: 1 };
      orderModel.findByPk.mockResolvedValue(mockOrder);

      const result = await orderService.findById(1);
      expect(result).toEqual(mockOrder);
      expect(orderModel.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });

  describe("update", () => {
    test("actualiza y retorna la orden", async () => {
      const mockOrder = { update: jest.fn().mockResolvedValue(undefined) };
      orderModel.findByPk.mockResolvedValue(mockOrder);

      const result = await orderService.update(1, { especialidad: 2 }, 1);
      expect(mockOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({ especialidad: 2, actualizadoPor: 1 })
      );
      expect(result).toBe(mockOrder);
    });

    test("retorna null si la orden no existe", async () => {
      orderModel.findByPk.mockResolvedValue(null);

      const result = await orderService.update(999, {}, 1);
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    test("elimina la orden y retorna true", async () => {
      const mockOrder = { destroy: jest.fn().mockResolvedValue(undefined) };
      orderModel.findByPk.mockResolvedValue(mockOrder);

      const result = await orderService.delete(1);
      expect(mockOrder.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test("retorna false si la orden no existe", async () => {
      orderModel.findByPk.mockResolvedValue(null);

      const result = await orderService.delete(999);
      expect(result).toBe(false);
    });
  });

  describe("setCompletedOrder", () => {
    test("actualiza el estado a completada", async () => {
      const mockOrder = {
        update: jest.fn().mockResolvedValue({ estado: "completada" }),
      };
      orderModel.findByPk.mockResolvedValue(mockOrder);

      const result = await orderService.setCompletedOrder(1);
      expect(mockOrder.update).toHaveBeenCalledWith({ estado: "completada" });
      expect(result).toBe(mockOrder);
    });

    test("retorna false si la orden no existe", async () => {
      orderModel.findByPk.mockResolvedValue(null);

      const result = await orderService.setCompletedOrder(999);
      expect(result).toBe(false);
    });
  });

  describe("validatePatientHasAuthorizedOrders", () => {
    test("retorna la orden autorizada del paciente", async () => {
      const mockOrder = { id: 1, estado: "autorizada" };
      orderModel.findOne.mockResolvedValue(mockOrder);

      const result = await orderService.validatePatientHasAuthorizedOrders(1, 1);
      expect(result).toEqual(mockOrder);
    });

    test("retorna null si no hay orden autorizada", async () => {
      orderModel.findOne.mockResolvedValue(null);

      const result = await orderService.validatePatientHasAuthorizedOrders(1, 1);
      expect(result).toBeNull();
    });
  });

  describe("getOrdersByPatient", () => {
    test("retorna órdenes paginadas del paciente", async () => {
      functions.paginate.mockResolvedValue(paginatedResult([{ id: 1 }]));

      const result = await orderService.getOrdersByPatient(1, {});
      expect(result).toEqual({
        totalPages: 1,
        totalItems: 1,
        currentPage: 1,
        ordenes: [{ id: 1 }],
      });
    });
  });

  describe("findByPartientDocument", () => {
    test("retorna órdenes paginadas por documento", async () => {
      functions.paginate.mockResolvedValue(paginatedResult([{ id: 1 }]));

      const result = await orderService.findByPartientDocument("123456789", {});
      expect(result).toEqual({
        totalPages: 1,
        totalItems: 1,
        currentPage: 1,
        ordenes: [{ id: 1 }],
      });
    });
  });

  describe("validatePatientHasMedicamentOrder", () => {
    test("lanza error si la orden no existe", async () => {
      orderModel.findByPk.mockResolvedValue(null);

      await expect(
        orderService.validatePatientHasMedicamentOrder(1, 999, 1, {})
      ).rejects.toThrow("No existe la orden");
    });

    test("lanza error si la orden no está autorizada", async () => {
      orderModel.findByPk.mockResolvedValue({ estado: "pendiente", idMedicamento: 1 });

      await expect(
        orderService.validatePatientHasMedicamentOrder(1, 1, 1, {})
      ).rejects.toThrow("Orden no autorizada para medicamento");
    });

    test("lanza error si el medicamento no corresponde a la orden", async () => {
      orderModel.findByPk.mockResolvedValue({
        estado: "autorizada",
        idMedicamento: 2,
        idCita: 1,
      });

      await expect(
        orderService.validatePatientHasMedicamentOrder(1, 1, 1, {})
      ).rejects.toThrow("Este medicamento no esta autorizado");
    });

    test("lanza error si el paciente no tiene esa orden", async () => {
      orderModel.findByPk.mockResolvedValue({
        estado: "autorizada",
        idMedicamento: 1,
        idCita: 1,
      });
      const mockAppointmentService = {
        findById: jest.fn().mockResolvedValue({ idPaciente: 99 }),
      };

      await expect(
        orderService.validatePatientHasMedicamentOrder(1, 1, 1, mockAppointmentService)
      ).rejects.toThrow("El paciente no tiene esa orden asociada");
    });

    test("completa la orden correctamente", async () => {
      const mockOrder = {
        estado: "autorizada",
        idMedicamento: 1,
        idCita: 1,
        update: jest.fn().mockResolvedValue({ estado: "completada" }),
      };
      orderModel.findByPk.mockResolvedValue(mockOrder);
      const mockAppointmentService = {
        findById: jest.fn().mockResolvedValue({ idPaciente: 1 }),
      };

      const result = await orderService.validatePatientHasMedicamentOrder(
        1, 1, 1, mockAppointmentService
      );
      expect(mockOrder.update).toHaveBeenCalledWith({ estado: "completada" });
      expect(result).toEqual({ estado: "completada" });
    });
  });
});
