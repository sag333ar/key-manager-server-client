const dblurt = require("@beblurt/dblurt");
const crypto = require("crypto");
const logger = require("node-color-log");

const client = new dblurt.Client(
  [
    "https://rpc.beblurt.com",
    "https://rpc.blurt.world",
    "https://blurt-rpc.saboin.com",
    "https://rpc.blurt.one",
  ],
  { timeout: 1500 }
);

exports.client = client;

async function validateSignature(ts, signature, username, publicKey, type) {
  let signatureValid = false;
  const accounts = await client.condenser.getAccounts([username]);
  const account = accounts[0];
  if (type.toLowerCase() === "posting") {
    if (account.posting.key_auths.map((e) => e[0]).includes(publicKey)) {
      const encoder = new TextEncoder();
      const timestamp = new Date(ts).toISOString();
      const messageBuffer = encoder.encode(timestamp);
      const hashBuffer = await crypto.subtle.digest("SHA-256", messageBuffer);
      const hashArray = new Uint8Array(hashBuffer);
      const sigValidity = dblurt.PublicKey.fromString(publicKey).verify(
        hashArray,
        dblurt.Signature.fromBuffer(Buffer.from(signature, "hex"))
      );
      return sigValidity;
    }
  } else if (type.toLowerCase() === "active") {
    if (account.active.key_auths.map((e) => e[0]).includes(publicKey)) {
      const encoder = new TextEncoder();
      const timestamp = new Date(ts).toISOString();
      const messageBuffer = encoder.encode(timestamp);
      const hashBuffer = await crypto.subtle.digest("SHA-256", messageBuffer);
      const hashArray = new Uint8Array(hashBuffer);
      const sigValidity = dblurt.PublicKey.fromString(publicKey).verify(
        hashArray,
        dblurt.Signature.fromBuffer(Buffer.from(signature, "hex"))
      );
      return sigValidity;
    }
  }
  return signatureValid;
}

exports.validateSignature = validateSignature;
