const admin = require("firebase-admin");
require("dotenv").config();

const encoded = process.env.FIREBASE_KEY_BASE64;
if (!encoded) throw new Error("Missing FIREBASE_KEY_BASE64 env variable");

const decoded = Buffer.from(encoded, "base64").toString("utf-8");
const serviceAccount = JSON.parse(decoded);

if (serviceAccount.private_key.includes("\\n")) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
