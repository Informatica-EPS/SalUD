const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/error.middleware");
const { apiRouteSwagger } = require("./swagger");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ message: "Welcome to the SalUD backend API!", status: "ok" });
});

apiRouteSwagger(app);

app.use("/api", routes);
app.use(errorHandler.logErrors);
app.use(errorHandler.ORMErrorHandler);
app.use(errorHandler.errorHandler);

module.exports = app;
