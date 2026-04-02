/**
 *
 * @param {*} SequelizeModel
 * @param {*} queryParams
 * @param {*} dbOption
 * @description Función de paginación para modelos Sequelize. Permite paginar resultados de consultas a la base de datos utilizando parámetros de consulta como `page` y `limit`. Además, se pueden pasar opciones adicionales para personalizar la consulta a la base de datos.
 * Ejemplo de uso:
 * const result = await paginate(UserModel, { page: 2, limit: 5 }, { where: { active: true } });
 * @returns
 */
const paginate = async (SequelizeModel, queryParams, dbOption = {}) => {
  const page = parseInt(queryParams.page) || 1;
  const limitValue = parseInt(queryParams.limit) || 10;
  const offset = (page - 1) * limitValue;

  const queryOptions = {
    limit: limitValue,
    offset,
    order: [["createdAt", "DESC"]],
    ...dbOption,
  };

  console.log({ queryOptions });

  const { count, rows } = await SequelizeModel.findAndCountAll(queryOptions);

  const totalPages = Math.ceil(count / limitValue);
  return {
    rows,
    count,
    page,
    totalPages,
  };
};

/**
 *
 * @param {*} date
 * @param {*} time
 * @param {*} UTCOffset
 * @description Convierte una fecha y hora a formato UTC considerando un offset específico. Si no se proporciona un offset, se asume UTC (Z). El formato de entrada debe ser compatible con el constructor de Date de JavaScript.
 * Ejemplo de uso:
 * const date = "2024-06-30";
 * const time = "14:30:00";
 * const UTCOffset = "-05:00"; // Para UTC-5
 * const utcDate = getDateFormatUTC(date, time, UTCOffset);
 * @returns
 */
const getDateFormatUTC = (date, time, UTCOffset = "Z") => {
  return new Date(`${date}T${time}${UTCOffset}`);
};

module.exports = {
  paginate,
  getDateFormatUTC,
};
