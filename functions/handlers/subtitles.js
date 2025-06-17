const axios = require("axios");

const OPENSUBTITLES_API_KEY = "h2UaLQaDuh6wwDv4SQcAiQ8bDj7U2yJf";
const OPENSUBTITLES_BASE_URL = "https://api.opensubtitles.com/api/v1";

function convertSrtToVtt(srtContent) {
  let vttContent = "WEBVTT\n\n";
  const srtBlocks = srtContent.split(/\r?\n\r?\n/).filter(Boolean);

  for (const block of srtBlocks) {
    const lines = block.split(/\r?\n/).filter(Boolean);
    if (lines.length >= 2) {
      let timeLineIndex = 0;

      if (/^\d+$/.test(lines[0])) {
        timeLineIndex = 1;
      }

      const timeLine = lines[timeLineIndex].replace(/,/g, ".");
      const textLines = lines.slice(timeLineIndex + 1);

      vttContent += `${timeLine}\n${textLines.join("\n")}\n\n`;
    }
  }

  return vttContent;
}

async function searchSubtitlesHandler(req, res) {
  const { imdbId, languages = "pt,en", type = "movie", season, episode } = req.query;
  if (!imdbId) {
    return res.status(400).json({
      success: false,
      message: "IMDB ID é obrigatório na query (?imdbId=...)",
    });
  }
  if (OPENSUBTITLES_API_KEY === "glsBXGzZgcUHR6lwx4yhzteH6dUAmKbU") {
    return res.status(500).json({
      success: false,
      message: "Chave da API do OpenSubtitles não configurada no backend. Por favor, adicione a sua chave.",
    });
  }
  try {
    console.log(`[SUBTITLES] Pesquisando legendas para IMDB ID: ${imdbId}, idiomas: ${languages}`);
    const searchParams = new URLSearchParams({
      imdb_id: imdbId,
      languages: languages,
    });
    if (type === "series" && season && episode) {
      searchParams.append("season_number", season);
      searchParams.append("episode_number", episode);
    }
    const response = await axios.get(`${OPENSUBTITLES_BASE_URL}/subtitles`, {
      headers: {
        "Api-Key": OPENSUBTITLES_API_KEY,
        "User-Agent": "iStreamByWeb v1.0",
      },
      params: searchParams,
    });
    const subtitles = response.data.data.map((sub) => ({
      file_id: sub.attributes.files[0].file_id,
      language: sub.attributes.language,
      release: sub.attributes.release || "Desconhecido",
    }));
    res.status(200).json({ success: true, subtitles });
  } catch (error) {
    const message = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("[SUBTITLES] Erro na pesquisa:", message);
    res.status(500).json({ success: false, message: `Erro na pesquisa: ${message}` });
  }
}

async function downloadSubtitle(file_id) {
  try {
    console.log(`[SUBTITLES] Obtendo URL de download para file_id: ${file_id}`);
    let headersList = {
      "Accept": "*/*",
      "User-Agent": "iStreamByWeb v1.0",
      "Api-Key": OPENSUBTITLES_API_KEY,
      "Content-Type": "application/json" 
    };

    let bodyContent = JSON.stringify({
      "file_id": file_id
    });

    let reqOptions = {
      url: `${OPENSUBTITLES_BASE_URL}/download`,
      method: "POST",
      headers: headersList,
      data: bodyContent,
    };

    let response = await axios.request(reqOptions);


    return response.data.link;
  } catch (error) {

    const message = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("[SUBTITLES] Erro ao obter URL de download:", message);
    return null;
  }
}

async function getVttSubtitleHandler(req, res) {
  const { fileId } = req.query;
  console.log(`[SUBTITLES] Requisição para obter legenda VTT para file_id: ${fileId}`);
  if (!fileId) {
    return res.status(400).json({
      success: false,
      message: "fileId é obrigatório na query (?fileId=...)",
    });
  }
  try {
    const downloadUrl = await downloadSubtitle(fileId);
    if (!downloadUrl) {
      return res.status(500).json({
        success: false,
        message: `Não foi possível obter a URL de download para o file_id ${fileId}.`,
      });
    }

    console.log(`[SUBTITLES] URL de download obtida: ${downloadUrl}`);
    console.log(`[SUBTITLES] Fazendo download e convertendo para VTT para file_id: ${fileId} from ${downloadUrl}`);

    const srtResponse = await axios.get(downloadUrl, {
      responseType: "text",
      headers: {
        "User-Agent": "iStreamByWeb v1.0",
      },
    });

    const srtContent = srtResponse.data;
    const vttContent = convertSrtToVtt(srtContent);
    res.setHeader("Content-Type", "text/vtt; charset=utf-8"); // Mantenha esta linha
    // Remova as linhas abaixo
    // res.setHeader("Access-Control-Allow-Origin", "*");
    // res.setHeader("Access-Control-Allow-Methods", "GET");
    // res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).send(vttContent);
  } catch (error) {
    console.error(`[SUBTITLES] Erro ao obter legenda VTT para file_id ${fileId}:`, error);
    const message = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error(`[SUBTITLES] Erro no download/conversão VTT para file_id ${fileId}:`, message);
    res.status(500).json({ success: false, message: `Erro ao processar legenda VTT: ${message}` });
  }
}

module.exports = {
  searchSubtitlesHandler,
  getVttSubtitleHandler,
};