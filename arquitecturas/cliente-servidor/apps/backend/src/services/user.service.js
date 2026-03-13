const crypto = require('crypto');
const { User, Role } = require('../models/associations');

// Crear usuario
const createUser = async (userData) => {
  return await User.create(userData);
};

// Obtener todos los usuarios
const getUsers = async () => {
  return await User.findAll({ include: Role });
};

// Buscar usuario por documento (hash SHA256)
const getUserByDocument = async (documento) => {
  const hashedDocumento = crypto.createHash('sha256').update(documento).digest('hex');
  console.log('Hashed documento:', hashedDocumento);

  const { Patient, Doctor } = require('../models/associations');

  return await User.findOne({
    where: { documento: hashedDocumento },
    include: [
      {
        model: Role,
        through: { attributes: [] }
      },
      {
        model: Patient,
        attributes: ['id']
      },
      {
        model: Doctor,
        attributes: ['id']
      }
    ]
  });
};

module.exports = {
  createUser,
  getUsers,
  getUserByDocument
};
