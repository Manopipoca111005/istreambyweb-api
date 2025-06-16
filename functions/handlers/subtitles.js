const axios = require("axios");

const OPENSUBTITLES_API_KEY = "yqcGsK2wFddmZnrECKlaUY1nAweVpKZA"; // Sua nova chave de API
const OPENSUBTITLES_BASE_URL = "https://api.opensubtitles.com/api/v1";

/**
 * Handler para pesquisar legendas por IMDB ID
 */
async function searchSubtitlesHandler(req, res) {
  const { imdbId, languages = "pt,en", type = "movie", season, episode } = req.query;
  
  if (!imdbId) {
    return res.status(400).json({
      success: false,
      message: "IMDB ID é obrigatório na query (?imdbId=...)",
    });
  }

  // Verifica se a chave de API padrão está sendo usada (sua chave agora não é a padrão)
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
    
    const response = await axios.get(
      `${OPENSUBTITLES_BASE_URL}/subtitles?${searchParams.toString()}`,
      {
        headers: {
          "Api-Key": OPENSUBTITLES_API_KEY,
          "User-Agent": "iStreamByWeb v1.0", // Certifique-se de que este User-Agent seja aceito
          "Accept": "application/json",
        },
      }
    );
    console.log(`[SUBTITLES] Resposta recebida: ${JSON.stringify(response.data)}`);
    const subtitles = response.data.data || [];
    
    // Filtrar e formatar as legendas para o frontend
    const formattedSubtitles = subtitles.map(subtitle => ({
      id: subtitle.id,
      file_id: subtitle.attributes.files[0]?.file_id,
      language: subtitle.attributes.language,
      release: subtitle.attributes.release,
      download_count: subtitle.attributes.download_count,
      hearing_impaired: subtitle.attributes.hearing_impaired,
      hd: subtitle.attributes.hd,
      fps: subtitle.attributes.fps,
      votes: subtitle.attributes.votes,
      points: subtitle.attributes.points,
      ratings: subtitle.attributes.ratings,
      from_trusted: subtitle.attributes.from_trusted,
      foreign_parts_only: subtitle.attributes.foreign_parts_only,
      ai_translated: subtitle.attributes.ai_translated,
      machine_translated: subtitle.attributes.machine_translated,
      upload_date: subtitle.attributes.upload_date,
      url: subtitle.attributes.url,
    })).filter(subtitle => subtitle.file_id);

    console.log(`[SUBTITLES] Encontradas ${formattedSubtitles.length} legendas`);

    return res.json({
      success: true,
      count: formattedSubtitles.length,
      subtitles: formattedSubtitles,
      mock_data: false,
    });

  } catch (error) {
    const message = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("[SUBTITLES] Erro ao pesquisar legendas:", message);
    res.status(500).json({
      success: false,
      message: `Erro ao pesquisar legendas: ${message}`,
    });
  }
}

/**
 * Handler para obter URL de download de legenda
 */
async function downloadSubtitleHandler(req, res) {
  const { file_id } = req.body;
  
  if (!file_id) {
    return res.status(400).json({
      success: false,
      message: "file_id é obrigatório no body da requisição",
    });
  }

  // Verifica se a chave de API padrão está sendo usada (sua chave agora não é a padrão)
  if (OPENSUBTITLES_API_KEY === "glsBXGzZgcUHR6lwx4yhzteH6dUAmKbU") {
    return res.status(500).json({
      success: false,
      message: "Chave da API do OpenSubtitles não configurada no backend. Por favor, adicione a sua chave.",
    });
  }

  try {
    console.log(`[SUBTITLES] Solicitando download para file_id: ${file_id}`);
    
    const response = await axios.post(
      `${OPENSUBTITLES_BASE_URL}/download`,
      { file_id: parseInt(file_id) },
      {
        headers: {
          "Api-Key": OPENSUBTITLES_API_KEY,
          "User-Agent": "iStreamByWeb v1.0", // Certifique-se de que este User-Agent seja aceito
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );

    const downloadData = response.data;
    
    if (downloadData.link) {
      console.log(`[SUBTITLES] URL de download obtido para file_id: ${file_id}`);
      return res.json({
        success: true,
        download_url: downloadData.link,
        file_name: downloadData.file_name,
        requests: downloadData.requests,
        remaining: downloadData.remaining,
        reset_time: downloadData.reset_time,
      });
    } else {
      throw new Error("URL de download não disponível na resposta");
    }

  } catch (error) {
    const message = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("[SUBTITLES] Erro ao obter URL de download:", message);
    res.status(500).json({
      success: false,
      message: `Erro ao obter URL de download: ${message}`,
    });
  }
}

/**
 * Handler para fazer proxy do download da legenda
 */
async function proxySubtitleHandler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      message: "URL é obrigatório na query (?url=...)",
    });
  }

  try {
    console.log(`[SUBTITLES] Fazendo proxy de download: ${url}`);
    
    const response = await axios.get(url, {
      responseType: "stream",
      headers: {
        "User-Agent": "iStreamByWeb v1.0", // Certifique-se de que este User-Agent seja aceito
      },
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=\"subtitle.srt\"");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    response.data.pipe(res);

  } catch (error) {
    const message = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("[SUBTITLES] Erro no proxy de download:", message);
    res.status(500).json({
      success: false,
      message: `Erro no proxy de download: ${message}`,
    });
  }
}

module.exports = {
  searchSubtitlesHandler,
  downloadSubtitleHandler,
  proxySubtitleHandler,
};
