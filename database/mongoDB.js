let logger = require("node-color-log");

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema({
  username: { type: String, required: true },
  keyType: {
    type: String,
    required: true,
    enum: ["posting", "active"],
    default: "posting",
  },
  eUUID: { type: String, required: true },
  ts: { type: Date, required: true, default: Date.now() },
  client: {
    name: { type: String, required: true },
    info: { type: String, required: false },
    icon: { type: String, required: false },
  },
  authCode: { type: String, required: true },
  authStatus: {
    type: String,
    required: true,
    enum: ["waiting", "approved", "failed", "rejected", "expired"],
    default: "waiting",
  },
  authExpiry: {
    type: Date,
    required: true,
    default: new Date().getTime() + 30_000,
  },
  authDeletion: {
    type: Date,
    required: true,
    default: new Date().getTime() + 40_000,
  },
  authValidity: {
    type: String,
    required: true,
    enum: ["1 hour", "1 day", "1 week", "1 month"],
    default: "1 hour",
  },
  approval: {
    signature: { type: String, required: false, default: null },
    expiry: { type: Date, required: false, default: null },
    publicKey: { type: String, required: false, default: null },
  },
});
exports.Auth = mongoose.model("Auth", AuthSchema);

const OpsSchema = new mongoose.Schema({
  username: { type: String, required: true },
  keyType: {
    type: String,
    required: true,
    enum: ["posting", "active"],
    default: "posting",
  },
  ts: { type: Date, required: true, default: Date.now() },
  client: {
    name: { type: String, required: true },
    info: { type: String, required: false },
    icon: { type: String, required: false },
  },
  opsData: { type: String, required: true },
  opsCode: { type: String, required: true },
  opsStatus: {
    type: String,
    required: true,
    enum: ["waiting", "approved", "failed", "rejected", "expired"],
    default: "waiting",
  },
  opsApprovedTrxId: { type: String, required: false },
  opsExpiry: {
    type: Date,
    required: true,
    default: new Date().getTime() + 30_000,
  },
  opsDeletion: {
    type: Date,
    required: true,
    default: new Date().getTime() + 40_000,
  },
});
exports.Ops = mongoose.model("Ops", OpsSchema);

async function connectDB() {
  logger.info("MongoDB Trying to connected to " + process.env.DB);
  await mongoose.connect(process.env.DB, {
    connectTimeoutMS: 30000,
  });
  logger.info("MongoDB Connected to " + process.env.DB);
}

exports.connectDB = connectDB;
