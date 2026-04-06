const crypto = require("crypto");
const { User, Role, Patient, Doctor } = require("../models/associations");

// Crear usuario con documento y contraseña hasheados
const createUser = async (userData) => {
  const hashedDocumento = crypto.createHash("sha256").update(userData.documento).digest("hex");
  const hashedPassword = crypto.createHash("sha256").update(userData.password).digest("hex");

  return await User.create({
    ...userData,
    documento: hashedDocumento,
    password: hashedPassword
  });
};

// Obtener todos los usuarios con roles
const getUsers = async () => {
  return await User.findAll({ include: Role });
};

// Buscar usuario por documento (hash SHA256)
const getUserByDocument = async (documento) => {
  const hashedDocumento = crypto.createHash("sha256").update(documento).digest("hex");
  console.log("Hashed documento:", hashedDocumento);

  return await User.findOne({
    where: { documento: hashedDocumento },
    include: [
      {
        model: Role,
        through: { attributes: [] }
      },
      {
        model: Patient,
        attributes: ["id"]
      },
      {
        model: Doctor,
        attributes: ["id"]
      }
    ]
  });
};

const updateUser = async (id, userData) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("Usuario no encontrado");

  // Si viene documento o password, hay que hashearlos
  if (userData.documento) {
    userData.documento = crypto.createHash("sha256").update(userData.documento).digest("hex");
  }
  if (userData.password) {
    userData.password = crypto.createHash("sha256").update(userData.password).digest("hex");
  }

  await user.update(userData);
  return user;
};

module.exports = {
  createUser,
  getUsers,
  getUserByDocument,
  updateUser
};
