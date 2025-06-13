const express = require("express");
const { onRequest } = require("firebase-functions/v2/https");
const { streamHandler } = require("./handlers/setupStream");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/stream", streamHandler);

/**
 * @function api
 * @description Express app exposto como função HTTPS do Firebase.
 */
exports.api = onRequest(
  {
    region: "us-central1",
    timeoutSeconds: 300,
    // memory: "1GiB",
  },
  app
);
