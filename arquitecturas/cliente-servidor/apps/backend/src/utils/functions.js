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

module.exports = {
  paginate,
};
