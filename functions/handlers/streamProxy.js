const axios = require("axios");
const https = require("https");

const streamUrlCache = new Map(); // Mesma instância usada em `setupStream.js`

/**
 * Handler para realizar o proxy do stream de vídeo via Real-Debrid.
 *
 * @param {import('express').Request} req - Requisição Express.
 * @param {import('express').Response} res - Resposta Express.
 */
async function streamProxyHandler(req, res) {
  const { identifier } = req.params;
  const finalStreamUrl = streamUrlCache.get(identifier);

  if (!finalStreamUrl) {
    return res.status(404).send("Link de stream não encontrado ou expirado.");
  }

  console.log(`[STREAM] Iniciando proxy para ${identifier}`);

  try {
    const agent = new https.Agent({ rejectUnauthorized: false });

    const videoResponse = await axios({
      method: "get",
      url: finalStreamUrl,
      responseType: "stream",
      headers: {
        Range: req.headers.range || "bytes=0-",
      },
      httpsAgent: agent,
    });

    res.writeHead(videoResponse.status, videoResponse.headers);
    videoResponse.data.pipe(res);
  } catch (error) {
    const message = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`[STREAM] Erro ao fazer proxy para ${identifier}:`, message);
    res.status(500).send("Erro ao obter o vídeo.");
  }
}

module.exports = { streamProxyHandler };
