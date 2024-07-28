let logger = require("node-color-log");

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
var router = express.Router();

const dayjs = require("dayjs");

const authRepository = require("../database/authRepository");
const opsRepository = require("../database/opsRepository");

router.get("/", (req, res) => {
  res.status(200);
  res.send("Welcome to root URL of Server");
});

router.post("/", async (req, res) => {
  const { username, eUUID, keyType, authCode, client } = req.body;
  if (
    username === undefined ||
    eUUID === undefined ||
    keyType === undefined ||
    client === undefined
  ) {
    return res.status(500).json({
      error: `Invalid Auth Request`,
    });
  }
  const { name, info, icon } = client;
  if (name === undefined) {
    return res.status(500).json({
      error: `Invalid Client info`,
    });
  }
  if (authCode === undefined) {
    try {
      const record = await authRepository.addAuth(
        username,
        eUUID,
        keyType,
        name,
        info,
        icon
      );
      return res.send(record);
    } catch (e) {
      return res.status(500).json({
        error: `Error occured ${e.toString()}`,
      });
    }
  } else {
    try {
      const record = await authRepository.getAuthStatus(
        username,
        eUUID,
        keyType,
        authCode
      );
      return res.send(record);
    } catch (e) {
      return res.status(500).json({
        error: `Error occured ${e.toString()}`,
      });
    }
  }
});

router.post("/ops/request", async (req, res) => {
  const { username, eUUID, keyType, client, ops, signature, pubKey } = req.body;
  if (
    username === undefined ||
    eUUID === undefined ||
    keyType === undefined ||
    client === undefined ||
    ops === undefined ||
    signature === undefined ||
    pubKey === undefined
  ) {
    return res.status(500).json({
      error: `Invalid Ops Request`,
    });
  }
  const { name, info, icon } = client;
  if (name === undefined) {
    return res.status(500).json({
      error: `Invalid Client info`,
    });
  } else {
    try {
      const record = await opsRepository.requestToSignOps(
        username,
        eUUID,
        keyType,
        name,
        info,
        icon,
        ops,
        signature,
        pubKey
      );
      return res.send(record);
    } catch (e) {
      return res.status(500).json({
        error: e,
      });
    }
  }
});

router.post("/ops", async (req, res) => {
  const { username, eUUID, keyType, client, signature, pubKey, opsCode} = req.body;
  if (
    username === undefined ||
    eUUID === undefined ||
    keyType === undefined ||
    client === undefined ||
    opsCode === undefined ||
    signature === undefined ||
    pubKey === undefined
  ) {
    return res.status(500).json({
      error: `Invalid Ops Approval Request`,
    });
  }
  const { name, info, icon } = client;
  if (name === undefined) {
    return res.status(500).json({
      error: `Invalid Client info`,
    });
  } else {
    try {
      const record = await opsRepository.getOps(
        username,
        eUUID,
        keyType,
        name,
        info,
        icon,
        signature,
        pubKey,
        opsCode
      );
      return res.send(record);
    } catch (e) {
      return res.status(500).json({
        error: e,
      });
    }
  }
});

router.post("/ops/approve", async (req, res) => {
  const { username, eUUID, keyType, client, signature, pubKey, opsCode, opsApprovedTrxId} = req.body;
  if (
    username === undefined ||
    eUUID === undefined ||
    keyType === undefined ||
    client === undefined ||
    opsCode === undefined ||
    signature === undefined ||
    pubKey === undefined ||
    opsApprovedTrxId === undefined
  ) {
    return res.status(500).json({
      error: `Invalid Ops Approval Request`,
    });
  }
  const { name, info, icon } = client;
  if (name === undefined) {
    return res.status(500).json({
      error: `Invalid Client info`,
    });
  } else {
    try {
      const record = await opsRepository.approveOps(
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
      );
      return res.send(record);
    } catch (e) {
      return res.status(500).json({
        error: e,
      });
    }
  }
});

router.post("/ops/reject", async (req, res) => {
  const { username, eUUID, keyType, client, signature, pubKey, opsCode} = req.body;
  if (
    username === undefined ||
    eUUID === undefined ||
    keyType === undefined ||
    client === undefined ||
    opsCode === undefined ||
    signature === undefined ||
    pubKey === undefined
  ) {
    return res.status(500).json({
      error: `Invalid Ops Rejection Request`,
    });
  }
  const { name, info, icon } = client;
  if (name === undefined) {
    return res.status(500).json({
      error: `Invalid Client info`,
    });
  } else {
    try {
      const record = await opsRepository.rejectOps(
        username,
        eUUID,
        keyType,
        name,
        info,
        icon,
        signature,
        pubKey,
        opsCode
      );
      return res.send(record);
    } catch (e) {
      return res.status(500).json({
        error: e,
      });
    }
  }
});

router.post("/approve", async (req, res) => {
  const { username, eUUID, keyType, authCode, validity, signature, pubKey } =
    req.body;
  if (
    username === undefined ||
    eUUID === undefined ||
    keyType === undefined ||
    authCode === undefined ||
    validity === undefined ||
    signature === undefined ||
    pubKey === undefined
  ) {
    return res.status(500).json({
      error: `Invalid Auth Approval Request`,
    });
  }
  try {
    const record = await authRepository.approveAuth(
      username,
      eUUID,
      keyType,
      authCode,
      validity,
      signature,
      pubKey
    );
    return res.send(record);
  } catch (e) {
    return res.status(500).json({
      error: `Error occured ${e.toString()}`,
    });
  }
});

router.post("/reject", async (req, res) => {
  const { username, eUUID, keyType, authCode } = req.body;
  if (
    username === undefined ||
    eUUID === undefined ||
    keyType === undefined ||
    authCode === undefined
  ) {
    return res.status(500).json({
      error: `Invalid Auth Rejection Request`,
    });
  }
  try {
    const record = await authRepository.rejectAuth(
      username,
      eUUID,
      keyType,
      authCode
    );
    return res.send(record);
  } catch (e) {
    return res.status(500).json({
      error: `Error occured ${e.toString()}`,
    });
  }
});

exports.indexRouter = router;
