const orderService = require("../services/order.service");
const { get } = require("../routes/time-slot.routes");

const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.create(req.body, null);

    res.json({
      success: true,
      message: "Orden creada exitosamente",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.findAll(req.query);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getAvailableOrders = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: "Órdenes disponibles",
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

const getScheduledOrders = async (req, res, next) => {
  try {
    // const users = await userService.getUsers();
    res.json({
      success: true,
      message: "Órdenes programadas",
      data: [], // Aquí irían las órdenes programadas obtenidas de la base de datos
    });
  } catch (error) {
    next(error);
  }
};

const getExecutedOrders = async (req, res, next) => {
  try {
    // const users = await userService.getUsers();
    res.json({
      success: true,
      message: "Órdenes ejecutadas",
      data: [], // Aquí irían las órdenes ejecutadas obtenidas de la base de datos
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.findById(req.params.id, req.query);
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const order = await orderService.update(req.params.id, req.body, null);
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    res.json({
      success: true,
      message: "Orden actualizada exitosamente",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const success = await orderService.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    res.json({
      success: true,
      message: "Orden eliminada exitosamente",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getAvailableOrders,
  getScheduledOrders,
  getExecutedOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
