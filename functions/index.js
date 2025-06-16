const express = require("express");
const { onRequest } = require("firebase-functions/v2/https");
const { streamHandler } = require("./handlers/setupStream"); // Verifique o caminho correto
const cors = require("cors");
// Importe ambos os handlers de subtitles
const { searchSubtitlesHandler, downloadSubtitleHandler, proxySubtitleHandler } = require("./handlers/subtitles");

const app = express();
app.use(cors());
app.use(express.json()); // Adicione este middleware para parsear o body de requisições JSON

app.get("/stream", streamHandler);
app.get("/subtitles/search", searchSubtitlesHandler); // Mudei para /subtitles/search para clareza
app.post("/subtitles/download", downloadSubtitleHandler); // Nova rota para baixar legendas
// Se você ainda usa o proxy, adicione a rota para ele também
app.get("/subtitles/proxy", proxySubtitleHandler); // Verifique se proxySubtitleHandler também é exportado de subtitles.js e importado

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
