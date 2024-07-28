let logger = require("node-color-log");

const mongoDB = require("./mongoDB");
const { client, validateSignature } = require("../utils/dblurt");
const crypto = require("crypto");

async function addAuth(username, eUUID, keyType, name, info, icon) {
  try {
    logger.info(`Trying to add an auth ${username}`);
    const accounts = await client.condenser.getAccounts([username]);
    if (accounts.length !== 1) {
      throw "Invalid Blurt Username.";
    }
    const record = await mongoDB.Auth.findOne({
      username: username,
      eUUID: eUUID,
      keyType: keyType,
    });
    if (record !== null) {
      throw `Auth Record (with eUUID - ${eUUID}, ${username}, ${keyType}) already exists`;
    } else {
      keyType =
        keyType.toLowerCase() === "posting"
          ? "posting"
          : keyType.toLowerCase() === "active"
          ? "active"
          : "posting";
      const record = new mongoDB.Auth({
        username: username,
        eUUID: eUUID,
        keyType: keyType,
      });
      record.authCode = crypto.randomBytes(20).toString("hex");
      record.client = {
        name,
        info,
        icon,
      };
      await record.save();
      let recordToReturn = { ...record._doc };
      delete recordToReturn["__v"];
      delete recordToReturn["_id"];
      return recordToReturn;
    }
  } catch (e) {
    logger.error("error getting auth " + e.toString());
    throw e;
  }
}

async function getAuthStatus(username, eUUID, keyType, authCode) {
  try {
    const filter = {
      authCode: authCode,
      keyType: keyType,
      eUUID: eUUID,
      username: username,
    };
    const record = await mongoDB.Auth.findOne(filter);
    if (record !== null) {
      let recordToReturn = { ...record._doc };
      delete recordToReturn["__v"];
      delete recordToReturn["_id"];
      return recordToReturn;
    } else {
      throw `Auth record (with eUUID - ${eUUID}, ${username}, ${keyType}, ${authCode}) not found or expired`;
    }
  } catch (e) {
    logger.error("error getting auth " + e.toString());
    throw e;
  }
}

async function approveAuth(
  username,
  eUUID,
  keyType,
  authCode,
  validity,
  signature,
  pubKey
) {
  try {
    if (
      validity !== "1 hour" &&
      validity !== "1 day" &&
      validity !== "1 week" &&
      validity !== "1 month"
    ) {
      throw "Invalid validity supplied";
    }
    const filter = {
      authStatus: "waiting",
      authCode: authCode,
      keyType: keyType,
      eUUID: eUUID,
      username: username,
    };
    const record = await mongoDB.Auth.findOne(filter);
    if (record !== null) {
      const result = await validateSignature(
        record.ts,
        signature,
        username,
        pubKey,
        keyType
      );
      if (result) {
        record.authStatus = "approved";
        record.authValidity = validity;
        record.approval = {
          signature: signature,
          publicKey: pubKey,
          expiry:
            validity === "1 hour"
              ? new Date().getTime() + 1000 * 60 * 60
              : "1 day"
              ? new Date().getTime() + 1000 * 60 * 60 * 24
              : "1 week"
              ? new Date().getTime() + 1000 * 60 * 60 * 24 * 7
              : new Date().getTime() + 1000 * 60 * 60 * 24 * 30,
        };
        await record.save();
        let recordToReturn = { ...record._doc };
        delete recordToReturn["__v"];
        delete recordToReturn["_id"];
        return recordToReturn;
      } else {
        record.authStatus = "failed";
        await record.save();
        throw `Auth validation failed`;
      }
    } else {
      throw `Auth record (with eUUID - ${eUUID}, ${username}, ${keyType}, ${authCode}) not found or expired`;
    }
  } catch (e) {
    logger.error("error getting auth " + e.toString());
    throw e;
  }
}

async function rejectAuth(username, eUUID, keyType, authCode) {
  try {
    const filter = {
      authStatus: "waiting",
      authCode: authCode,
      keyType: keyType,
      eUUID: eUUID,
      username: username,
      authExpiry: {
        $gte: new Date(),
      },
      authDeletion: {
        $gte: new Date(),
      },
    };
    const record = await mongoDB.Auth.findOne(filter);
    if (record !== null) {
      record.authStatus = "rejected";
      await record.save();
      let recordToReturn = { ...record._doc };
      delete recordToReturn["__v"];
      delete recordToReturn["_id"];
      return recordToReturn;
    } else {
      throw `Auth record (with eUUID - ${eUUID}, ${username}, ${keyType}, ${authCode}) not found or expired`;
    }
  } catch (e) {
    logger.error("error getting auth " + e.toString());
    throw e;
  }
}

async function bulkUpdateExpiredAuths() {
  const filter = {
    authStatus: { $in: ["waiting", "failed"] },
    authExpiry: {
      $lte: new Date(),
    },
  };
  const res = await mongoDB.Auth.updateMany(filter, { authStatus: "expired" });
  logger.info(
    `Updated Exipry for matched=${res.n}, modified =${res.modifiedCount} records`
  );
}

async function bulkDeleteExpiredAndRejectedAuths() {
  const filter = {
    authStatus: { $in: ["expired", "rejected", "failed"] },
    authDeletion: {
      $lte: new Date(),
    },
  };
  const res = await mongoDB.Auth.deleteMany(filter);
  logger.info(
    `Deleted - matched=${res.n}, deleted =${res.deletedCount} records`
  );
}

async function bulkAuthApprovalExpiry() {
  const filter = {
    approval: {
      expiry: {
        $lte: new Date(),
      },
    },
  };
  const res = await mongoDB.Auth.deleteMany(filter);
  logger.info(
    `Deleted - matched=${res.n}, deleted =${res.deletedCount} records`
  );
}

exports.addAuth = addAuth;
exports.getAuthStatus = getAuthStatus;
exports.approveAuth = approveAuth;
exports.rejectAuth = rejectAuth;
exports.bulkUpdateExpiredAuths = bulkUpdateExpiredAuths;
exports.bulkDeleteExpiredAndRejectedAuths = bulkDeleteExpiredAndRejectedAuths;
exports.bulkAuthApprovalExpiry = bulkAuthApprovalExpiry;