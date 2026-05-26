const configcat = require("@configcat/sdk");

const logger = configcat.createConsoleLogger(configcat.LogLevel.Info);

const configCatClient = configcat.getClient(
  process.env.CONFIG_CAT_KEY,
  configcat.PollingMode.AutoPoll,
  {
    logger: logger,
  },
);

module.exports = configCatClient;
