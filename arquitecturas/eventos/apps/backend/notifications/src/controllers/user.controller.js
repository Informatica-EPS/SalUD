const userService = require("../services/user.service");
const NotificationService = require("../services/notifications-service/index");
const EmailService = require("../services/notifications-service/email-service");

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const notificationService = new NotificationService(new EmailService());
    const response = await notificationService.sendEmailNotification({
      para: "afarizal@udistrital.edu.co",
      asunto: "Notificación de usuario",
      contenido: "Se ha creado un nuevo usuario.",
    });

    // const users = await userService.getUsers();
    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUsers,
};
