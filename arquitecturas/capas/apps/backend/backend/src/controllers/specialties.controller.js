const specialtiesService = require("../services/specialty.service");

const getSpecialties = async (req, res, next) => {
  try {
    const specialties = await specialtiesService.getSpecialties();

    res.json(specialties);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSpecialties,
};
