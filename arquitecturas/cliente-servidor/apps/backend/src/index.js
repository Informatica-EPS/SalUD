require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const routes = require("./routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ message: "Welcome to the SalUD backend API!", status: "ok" });
});

app.use("/api", routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
