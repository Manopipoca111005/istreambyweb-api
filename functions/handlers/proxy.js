const axios = require("axios");

async function proxyVideoHandler(req, res) {
  // Definir cabeçalhos CORS explicitamente no início do handler
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Range");
  res.setHeader("Access-Control-Expose-Headers", "Content-Length, Accept-Ranges, Content-Range"); // Expor headers importantes para streaming

  // Lidar com requisições OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }

  const videoUrl = req.query.url;
  if (!videoUrl) {
    console.error("[PROXY VIDEO] Erro: URL do vídeo é obrigatório.");
    return res.status(400).send("URL do vídeo é obrigatório.");
  }

  try {
    const headersToForward = {
      "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
      // Copiar o cabeçalho Range do cliente para o servidor remoto, se existir
      ... (req.headers.range && { "Range": req.headers.range })
    };

    console.log(`[PROXY VIDEO] Tentando fazer proxy para: ${videoUrl}`);
    console.log("[PROXY VIDEO] Headers de requisição:", headersToForward);

    const response = await axios({
      method: "get",
      url: videoUrl,
      responseType: "stream",
      headers: headersToForward,
    });

    // Copia os cabeçalhos relevantes do servidor de vídeo original para o cliente
    for (const header in response.headers) {
      // Evitar headers que podem causar problemas ou são irrelevantes para o cliente
      // 'transfer-encoding' pode ser problemático com Gzip ou outros middlewares
      if (!["transfer-encoding", "connection", "keep-alive", "date", "strict-transport-security", "content-encoding"].includes(header.toLowerCase())) {
        res.setHeader(header, response.headers[header]);
      }
    }

    res.status(response.status);

    // Promisify the stream piping to await its completion
    await new Promise((resolve, reject) => {
      response.data.pipe(res);

      response.data.on("end", () => {
        console.log("[PROXY VIDEO] Stream de dados do Axios encerrado.");
        resolve();
      });

      response.data.on("error", (err) => {
        console.error("[PROXY VIDEO] Erro no stream de dados do Axios:", err);
        // Garantir que uma resposta de erro é enviada se ainda não o foi
        if (!res.headersSent) {
          res.status(500).send("Erro ao processar o stream de vídeo.");
        }
        reject(err);
      });

      res.on("finish", () => {
        console.log("[PROXY VIDEO] Resposta HTTP para o cliente finalizada.");
        resolve(); // Resolve se o stream de resposta termina com sucesso
      });

      res.on("error", (err) => {
        console.error("[PROXY VIDEO] Erro no stream de resposta HTTP (para o cliente):", err);
        reject(err); // Rejeita se houver um erro ao enviar para o cliente
      });
    });

    console.log(`[PROXY VIDEO] Proxy bem-sucedido e stream finalizado para: ${videoUrl} com status ${response.status}`);

  } catch (error) {
    console.error(`[PROXY VIDEO] Erro ao fazer proxy para ${videoUrl}:`);
    if (error.response) {
      console.error(`[PROXY VIDEO] Status do erro: ${error.response.status}`);
      console.error(`[PROXY VIDEO] Dados do erro: ${error.response.data ? error.response.data.toString() : "Nenhum"}`);
      if (!res.headersSent) {
        res.status(error.response.status).send(error.response.data || "Erro no proxy de vídeo.");
      }
    } else if (error.request) {
      console.error("[PROXY VIDEO] Nenhuma resposta recebida:", error.request);
      if (!res.headersSent) {
        res.status(502).send("Erro de rede no proxy de vídeo (sem resposta).");
      }
    } else {
      console.error("[PROXY VIDEO] Erro na configuração da requisição:", error.message);
      if (!res.headersSent) {
        res.status(500).send("Erro interno do servidor no proxy de vídeo.");
      }
    }
  }
}

async function proxyImageHandler(req, res) {
  // Definir cabeçalhos CORS explicitamente no início do handler
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  // Lidar com requisições OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }

  const imageUrl = req.query.url;
  if (!imageUrl) {
    console.error("[PROXY IMAGE] Erro: URL da imagem é obrigatório.");
    return res.status(400).send("URL da imagem é obrigatório.");
  }
  try {
    console.log(`[PROXY IMAGE] Tentando fazer proxy para: ${imageUrl}`);
    const response = await axios({
      method: "get",
      url: imageUrl,
      responseType: "arraybuffer" // Para imagens, geralmente buffer é melhor
    });

    if (response.headers["content-type"]) {
      res.setHeader("Content-Type", response.headers["content-type"]);
    }
    res.status(response.status).send(response.data);
    console.log(`[PROXY IMAGE] Proxy bem-sucedido para: ${imageUrl} com status ${response.status}`);

  } catch (error) {
    console.error(`[PROXY IMAGE] Erro ao fazer proxy para ${imageUrl}:`);
    if (error.response) {
      console.error(`[PROXY IMAGE] Status do erro: ${error.response.status}`);
      console.error(`[PROXY IMAGE] Dados do erro: ${error.response.data ? error.response.data.toString() : "Nenhum"}`);
      res.status(error.response.status).send(error.response.data || "Erro no proxy de imagem.");
    } else if (error.request) {
      console.error("[PROXY IMAGE] Nenhuma resposta recebida:", error.request);
      res.status(502).send("Erro de rede no proxy de imagem (sem resposta).");
    } else {
      console.error("[PROXY IMAGE] Erro na configuração da requisição:", error.message);
      res.status(500).send("Erro interno do servidor no proxy de imagem.");
    }
  }
}

module.exports = {
  proxyVideoHandler,
  proxyImageHandler,
};
