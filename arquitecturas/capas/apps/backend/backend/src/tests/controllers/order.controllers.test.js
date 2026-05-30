const {
  createOrder,
  getOrders,
  getAvailableOrders,
  getScheduledOrders,
  getExecutedOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByPatientDocument,
  validateOrder,
} = require("../../controllers/orders.controller");
const orderService = require("../../services/order.service");
const appointmentService = require("../../services/appointment.service");

jest.mock("../../services/order.service");
jest.mock("../../services/appointment.service");

describe("order controller", () => {
  describe("createOrder", () => {
    test("success", async () => {
      const mockOrder = { idOrden: 1 };

      orderService.create.mockResolvedValue(mockOrder);
      const jsonMock = jest.fn();

      const req = { body: {} };
      const res = { json: jsonMock };
      const next = () => {};

      await createOrder(req, res, next);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Orden creada exitosamente",
        data: mockOrder,
      });
    });

    test("failure", async () => {
      const mockError = new Error("something wrong");

      orderService.create.mockRejectedValue(mockError);
      const jsonMock = jest.fn();
      const nextMock = jest.fn();

      const req = { body: {} };
      const res = { json: jsonMock };

      await createOrder(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getOrders", () => {
    test("success", async () => {
      const mockOrder = [{ idOrden: 1 }, { idOrden: 2 }, { idOrden: 3 }];

      orderService.findAll.mockResolvedValue(mockOrder);
      const jsonMock = jest.fn();

      const req = { query: 0 };
      const res = { json: jsonMock };
      const next = () => {};

      await getOrders(req, res, next);

      expect(jsonMock).toHaveBeenCalledWith(mockOrder);
    });

    test("failure", async () => {
      const mockError = new Error("something wrong");

      orderService.findAll.mockRejectedValue(mockError);
      const jsonMock = jest.fn();
      const nextMock = jest.fn();

      const req = { body: {} };
      const res = { json: jsonMock };

      await getOrders(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getAvailableOrders", () => {
    test("success", async () => {
      const req = { query: 0 };
      const res = {};
      const next = () => {};

      await getAvailableOrders(req, res, next);
    });
  });

  describe("getScheduledOrders", () => {
    test("success", async () => {
      const req = { query: 0 };
      const res = {};
      const next = () => {};

      await getScheduledOrders(req, res, next);
    });
  });

  describe("getExecutedOrders", () => {
    test("success", async () => {
      const req = { query: 0 };
      const res = {};
      const next = () => {};

      await getExecutedOrders(req, res, next);
    });
  });

  describe("getOrderById", () => {
    test("success found", async () => {
      const mockOrder = { idOrden: 1 };

      orderService.findById.mockResolvedValue(mockOrder);
      const jsonMock = jest.fn();

      const req = { params: { id: 1 }, query: "" };
      const res = { json: jsonMock };
      const next = () => {};

      await getOrderById(req, res, next);

      expect(jsonMock).toHaveBeenCalledWith(mockOrder);
    });

    test("Not found", async () => {
      const mockOrder = null;

      orderService.findById.mockResolvedValue(mockOrder);
      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { params: { id: 1 }, query: "" };
      const res = { status: statusMock };
      const next = () => {};

      await getOrderById(req, res, next);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Orden no encontrada" });
    });

    test("failure", async () => {
      const mockError = new Error("something wrong");

      orderService.findById.mockRejectedValue(mockError);
      const jsonMock = jest.fn();
      const nextMock = jest.fn();

      const req = { params: { id: 1 }, query: "" };
      const res = { json: jsonMock };

      await getOrderById(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getupdateOrderOrders", () => {
    test("success", async () => {
      const mockOrder = { idOrden: 1 };

      orderService.update.mockResolvedValue(mockOrder);
      const jsonMock = jest.fn();

      const req = { params: { id: 1 }, body: {} };
      const res = { json: jsonMock };
      const next = () => {};

      await updateOrder(req, res, next);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Orden actualizada exitosamente",
        data: mockOrder,
      });
    });

    test("Not found", async () => {
      const mockOrder = null;

      orderService.update.mockResolvedValue(mockOrder);
      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { params: { id: 1 }, query: "" };
      const res = { status: statusMock };
      const next = () => {};

      await updateOrder(req, res, next);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Orden no encontrada" });
    });

    test("failure", async () => {
      const mockError = new Error("something wrong");

      orderService.update.mockRejectedValue(mockError);
      const jsonMock = jest.fn();
      const nextMock = jest.fn();

      const req = { params: { id: 1 }, query: "" };
      const res = { json: jsonMock };

      await updateOrder(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("deleteOrder", () => {
    test("success", async () => {
      const mockOrder = { idOrden: 1 };

      orderService.delete.mockResolvedValue(mockOrder);
      const jsonMock = jest.fn();

      const req = { params: { id: 1 } };
      const res = { json: jsonMock };
      const next = () => {};

      await deleteOrder(req, res, next);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Orden eliminada exitosamente",
      });
    });

    test("Not found", async () => {
      const mockOrder = null;

      orderService.delete.mockResolvedValue(mockOrder);
      const jsonMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: jsonMock }));

      const req = { params: { id: 1 } };
      const res = { status: statusMock };
      const next = () => {};

      await deleteOrder(req, res, next);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Orden no encontrada" });
    });

    test("failure", async () => {
      const mockError = new Error("something wrong");

      orderService.delete.mockRejectedValue(mockError);
      const jsonMock = jest.fn();
      const nextMock = jest.fn();

      const req = { params: { id: 1 } };
      const res = { json: jsonMock };

      await deleteOrder(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getOrdersByPatientDocument", () => {
    test("success", async () => {
      const mockOrder = [{ idOrden: 1 }, { idOrden: 2 }, { idOrden: 3 }];

      orderService.findByPartientDocument.mockResolvedValue(mockOrder);
      const jsonMock = jest.fn();

      const req = { params: { documento: 0 } };
      const res = { json: jsonMock };
      const next = () => {};

      await getOrdersByPatientDocument(req, res, next);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: mockOrder,
      });
    });

    test("failure", async () => {
      const mockError = new Error("something wrong");

      orderService.findByPartientDocument.mockRejectedValue(mockError);
      const jsonMock = jest.fn();
      const nextMock = jest.fn();

      const req = { params: { documento: 0 } };
      const res = { json: jsonMock };

      await getOrdersByPatientDocument(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe("validateOrder", () => {
    test("success", async () => {
      const mockOrder = true;

      orderService.validatePatientHasMedicamentOrder.mockResolvedValue(
        mockOrder,
      );
      const jsonMock = jest.fn();

      const req = { body: { idPaciente: 1, idOrden: 1, idMedicamento: 1 } };
      const res = { json: jsonMock };
      const next = () => {};

      await validateOrder(req, res, next);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: true,
      });
    });

    test("failure", async () => {
      const mockError = new Error("something wrong");

      orderService.validatePatientHasMedicamentOrder.mockRejectedValue(
        mockError,
      );
      const jsonMock = jest.fn();
      const nextMock = jest.fn();

      const req = { body: { idPaciente: 1, idOrden: 1, idMedicamento: 1 } };
      const res = { json: jsonMock };

      await validateOrder(req, res, nextMock);

      expect(jsonMock).not.toHaveBeenCalled();
      expect(nextMock).toHaveBeenCalledWith(mockError);
    });
  });
});
