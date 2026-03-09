const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

const apiRouteSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = {
  apiRouteSwagger,
};
