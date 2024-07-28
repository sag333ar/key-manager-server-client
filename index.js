let logger = require("node-color-log");

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const mongoDB = require("./database/mongoDB.js");

const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');
const { indexRouter } = require("./routes/index.js");

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
  res.locals = Object.assign(res.locals, global);
  res.header("Access-Control-Allow-Origin", req.header("Origin"));
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use("/", indexRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

const PORT = process.env.PORT || 7733;
app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  await mongoDB.connectDB();
});