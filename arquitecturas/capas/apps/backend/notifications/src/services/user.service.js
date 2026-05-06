
const User = require('../models/user.model');

const createUser = async (data) => {
  return await User.create(data);
};

const getUsers = async () => {
  return await User.findAll();
};

module.exports = {
  createUser,
  getUsers
};
