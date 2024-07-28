let logger = require("node-color-log");

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const mongoDB = require("./database/mongoDB.js");
const authRepository = require("./database/authRepository");

async function main() {
  await mongoDB.connectDB();
  while (true) {
    await authRepository.bulkUpdateExpiredAuths();
    await authRepository.bulkDeleteExpiredAndRejectedAuths();
    await authRepository.bulkAuthApprovalExpiry();
    await new Promise((resolve) => setTimeout(resolve, 1000 * 1));
  }
}

main();