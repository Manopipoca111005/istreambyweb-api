const express = require("express");
const { onRequest } = require("firebase-functions/v2/https");
const { streamHandler } = require("./handlers/setupStream");
const cors = require("cors");
const { searchSubtitlesHandler, getVttSubtitleHandler } = require("./handlers/subtitles");
const { proxyVideoHandler, proxyImageHandler } = require("./handlers/proxy"); // <- Importante: Confirme este caminho!

const app = express();
app.use(cors()); // Permite CORS de qualquer origem
app.use(express.json());

// Rotas existentes
app.get("/stream", streamHandler);
app.get("/subtitles/search", searchSubtitlesHandler);
app.get("/subtitles/vtt", getVttSubtitleHandler);

// Novas rotas usando o handler de proxy
app.get("/proxy/video", proxyVideoHandler);
app.get("/proxy/image", proxyImageHandler);

exports.api = onRequest(
  {
    region: "us-central1", // Confirme que esta região corresponde à sua implantação
  },
  app
);
