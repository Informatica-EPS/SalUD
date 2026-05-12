const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Login
router.post('/login', userController.login);

// Crear usuario
router.post('/', userController.createUser);

// Listar usuarios
router.get('/', userController.getUsers);

module.exports = router;
