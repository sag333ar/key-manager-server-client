let logger = require("node-color-log");

const mongoDB = require("./mongoDB");
const { client } = require("../utils/dblurt");
const crypto = require("crypto");

async function requestToSignOps(
  username,
  eUUID,
  keyType,
  name,
  info,
  icon,
  ops,
  signature,
  pubKey
) {
  try {
    const filter = {
      authStatus: "approved",
      eUUID: eUUID,
      username: username,
      "approval.signature": signature,
      "approval.publicKey": pubKey,
      "client.name": name,
      "client.info": info,
      "client.icon": icon,
      "approval.expiry": {
        $gte: new Date().toISOString(),
      },
    };
    const record = await mongoDB.Auth.findOne(filter);
    if (record === null) {
      throw `Auth record (with eUUID - ${eUUID}, ${username}) not found or expired`;
    } else {
      keyType =
        keyType.toLowerCase() === "posting"
          ? "posting"
          : keyType.toLowerCase() === "active"
          ? "active"
          : "posting";
      const record = new mongoDB.Ops({
        username: username,
        keyType: keyType,
        client: {
          name: name,
          info: info,
          icon: icon,
        },
        opsData: ops,
        opsCode: crypto.randomBytes(20).toString("hex"),
      });
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

async function getOps(
  username,
  eUUID,
  keyType,
  name,
  info,
  icon,
  signature,
  pubKey,
  opsCode
) {
  try {
    const filter = {
      authStatus: "approved",
      eUUID: eUUID,
      username: username,
      "approval.signature": signature,
      "approval.publicKey": pubKey,
      "client.name": name,
      "client.info": info,
      "client.icon": icon,
      "approval.expiry": {
        $gte: new Date().toISOString(),
      },
    };
    const record = await mongoDB.Auth.findOne(filter);
    if (record === null) {
      throw `Ops record (with eUUID - ${eUUID}, ${username}) not found or expired`;
    } else {
      keyType =
        keyType.toLowerCase() === "posting"
          ? "posting"
          : keyType.toLowerCase() === "active"
          ? "active"
          : "posting";
      const opsFilter = {
        username: username,
        keyType: keyType,
        "client.name": name,
        "client.info": info,
        "client.icon": icon,
        opsCode: opsCode,
      };
      const opsRecord = await mongoDB.Ops.findOne(opsFilter);
      if (opsRecord === null) {
        throw `No opsRecord found with ${opsCode}`;
      }
      let recordToReturn = { ...opsRecord._doc };
      delete recordToReturn["__v"];
      delete recordToReturn["_id"];
      return recordToReturn;
    }
  } catch (e) {
    logger.error("error getting ops " + e.toString());
    throw e;
  }
}

async function approveOps(
  username,
  eUUID,
  keyType,
  name,
  info,
  icon,
  signature,
  pubKey,
  opsCode,
  opsApprovedTrxId
) {
  try {
    const filter = {
      eUUID: eUUID,
      username: username,
      approval: {
        expiry: {
          $lte: new Date(),
        },
        signature: signature,
        pubKey: pubKey,
      },
      client: {
        name: name,
        info: info,
        icon: icon,
      },
    };
    const record = await mongoDB.Auth.findOne(filter);
    if (record === null) {
      throw `Auth record (with eUUID - ${eUUID}, ${username}) not found or expired`;
    } else {
      keyType =
        keyType.toLowerCase() === "posting"
          ? "posting"
          : keyType.toLowerCase() === "active"
          ? "active"
          : "posting";
      const opsFilter = {
        username: username,
        keyType: keyType,
        client: {
          name: name,
          info: info,
          icon: icon,
        },
        opsCode: opsCode,
      };
      const opsRecord = await mongoDB.Ops.findOne(filter);
      if (opsRecord === null) {
        throw `No opsRecord found with ${opsCode}`;
      }
      opsRecord.opsStatus = "approved";
      opsRecord.opsApprovedTrxId = opsApprovedTrxId;
      await opsRecord.save();
      let recordToReturn = { ...opsRecord._doc };
      delete recordToReturn["__v"];
      delete recordToReturn["_id"];
      return recordToReturn;
    }
  } catch (e) {
    logger.error("error getting ops " + e.toString());
    throw e;
  }
}

async function rejectOps(
  username,
  eUUID,
  keyType,
  name,
  info,
  icon,
  signature,
  pubKey,
  opsCode,
  opsApprovedTrxId
) {
  try {
    const filter = {
      authStatus: "approved",
      eUUID: eUUID,
      username: username,
      approval: {
        expiry: {
          $lte: new Date(),
        },
        signature: signature,
        pubKey: pubKey,
      },
      client: {
        name: name,
        info: info,
        icon: icon,
      },
    };
    const record = await mongoDB.Auth.findOne(filter);
    if (record === null) {
      throw `Auth record (with eUUID - ${eUUID}, ${username}) not found or expired`;
    } else {
      keyType =
        keyType.toLowerCase() === "posting"
          ? "posting"
          : keyType.toLowerCase() === "active"
          ? "active"
          : "posting";
      const opsFilter = {
        username: username,
        keyType: keyType,
        client: {
          name: name,
          info: info,
          icon: icon,
        },
        opsCode: opsCode,
      };
      const opsRecord = await mongoDB.Ops.findOne(filter);
      if (opsRecord === null) {
        throw `No opsRecord found with ${opsCode}`;
      }
      opsRecord.opsStatus = "rejected";
      await opsRecord.save();
      let recordToReturn = { ...opsRecord._doc };
      delete recordToReturn["__v"];
      delete recordToReturn["_id"];
      return recordToReturn;
    }
  } catch (e) {
    logger.error("error getting ops " + e.toString());
    throw e;
  }
}

exports.requestToSignOps = requestToSignOps;
exports.approveOps = approveOps;
exports.rejectOps = rejectOps;
exports.getOps = getOps;
