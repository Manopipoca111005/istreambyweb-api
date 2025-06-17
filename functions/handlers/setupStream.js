const axios = require("axios");

const REAL_DEBRID_TOKEN =
  "2RHUYGEFBFKUNIKQSUDID2NUIG4MDBOWRD2AFQL3Y6ZOVISI7OSQ";

let VIDEO_EXTENSIONS = [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".webm"];

/**
 * Handler Express para preparar o link Real-Debrid e retornar o link direto.
 * Endpoint: /api/stream?magnet=...
 */
async function streamHandler(req, res) {
  const { magnet } = req.query;
  if (!magnet) {
    return res.status(400).json({
      success: false,
      message: "Magnet link obrigatório na query (?magnet=...)",
    });
  }

  try {
    // 1. Adicionar magnet ao Real-Debrid
    const { data: addedMagnetData } = await axios.post(
      "https://api.real-debrid.com/rest/1.0/torrents/addMagnet",
      `magnet=${encodeURIComponent(magnet)}`,
      {
        headers: {
          Authorization: `Bearer ${REAL_DEBRID_TOKEN}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const torrentId = addedMagnetData.id;

    // 2. Poll até estar pronto
    let torrentInfo;
    for (let attempts = 0; attempts < 25; attempts++) {
      await new Promise((r) => setTimeout(r, 5000)); // Espera 5 segundos
      const { data: info } = await axios.get(
        `https://api.real-debrid.com/rest/1.0/torrents/info/${torrentId}`,
        { headers: { Authorization: `Bearer ${REAL_DEBRID_TOKEN}` } }
      );
      torrentInfo = info;

      // ADICIONADOS LOGS DE DEPURACÃO AQUI
      console.log(
        `[REAL-DEBRID DEBUG] Tentativa ${
          attempts + 1
        } para torrent ${torrentId}:`
      );
      console.log("  Status atual:", torrentInfo.status);
      if (torrentInfo.error) {
        console.log("  Erro do Real-Debrid:", torrentInfo.error);
      }
      if (torrentInfo.files) {
        console.log(
          "  Ficheiros do torrent (para seleção):",
          JSON.stringify(
            torrentInfo.files.map((f) => ({
              id: f.id,
              path: f.path,
              selected: f.selected,
              bytes: f.bytes,
            })),
            null,
            2
          )
        );
      }
      if (torrentInfo.links) {
        console.log(
          "  Links gerados pelo Real-Debrid:",
          JSON.stringify(torrentInfo.links, null, 2)
        );
      }
      // FIM DOS LOGS DE DEPURACÃO

      if (
        torrentInfo.status === "downloaded" &&
        torrentInfo.links?.length > 0
      ) {
        console.log(
          `[REAL-DEBRID DEBUG] Torrent ${torrentId} descarregado e links disponíveis.`
        );
        break; // Sai do loop de polling
      } else if (torrentInfo.status === "waiting_files_selection") {
        const allFiles = torrentInfo.files || [];

        let bestVideoToSelect = null;
        let largestSizeForSelection = -1;

        // Priorize ficheiros não-sample e maiores
        for (const f of allFiles) {
          if (
            VIDEO_EXTENSIONS.some((ext) => f.path.toLowerCase().endsWith(ext))
          ) {
            const currentSize = f.bytes || 0; // Usar 'bytes' para o tamanho do ficheiro
            const isSample = f.path.toLowerCase().includes("sample");

            if (!isSample && currentSize > largestSizeForSelection) {
              bestVideoToSelect = f;
              largestSizeForSelection = currentSize;
            } else if (
              bestVideoToSelect === null &&
              isSample &&
              currentSize > largestSizeForSelection
            ) {
              // Se ainda não encontrámos um não-sample, e este é um sample maior,
              // guarda-o temporariamente como a melhor opção.
              bestVideoToSelect = f;
              largestSizeForSelection = currentSize;
            }
          }
        }

        if (bestVideoToSelect) {
          // Seleciona APENAS o melhor ficheiro de vídeo encontrado
          const selectedFileIds = [String(bestVideoToSelect.id)];
          console.log(
            `[REAL-DEBRID DEBUG] Selecionando o melhor ficheiro de vídeo: ${bestVideoToSelect.path} (ID: ${bestVideoToSelect.id})`
          );
          await axios.post(
            `https://api.real-debrid.com/rest/1.0/torrents/selectFiles/${torrentId}`,
            `files=${selectedFileIds.join(",")}`,
            {
              headers: {
                Authorization: `Bearer ${REAL_DEBRID_TOKEN}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );
          console.log(
            `[REAL-DEBRID DEBUG] Melhor ficheiro selecionado para torrent ${torrentId}.`
          );
        } else {
          // Se não encontrou nenhum ficheiro de vídeo válido após a filtragem
          console.log(
            `[REAL-DEBRID DEBUG] NENHUM FICHEIRO DE VÍDEO VÁLIDO ENCONTRADO para torrent ${torrentId}.`
          );
          await axios.delete(
            `https://api.real-debrid.com/rest/1.0/torrents/delete/${torrentId}`,
            { headers: { Authorization: `Bearer ${REAL_DEBRID_TOKEN}` } }
          );
          return res.status(404).json({
            success: false,
            message:
              "Nenhum ficheiro de vídeo encontrado no torrent ou Real-Debrid não conseguiu processá-lo.",
          });
        }
      } else if (
        ["magnet_error", "error", "dead"].includes(torrentInfo.status)
      ) {
        console.log(
          `[REAL-DEBRID DEBUG] Torrent ${torrentId} em status de erro: ${torrentInfo.status}`
        );
        return res.status(500).json({
          success: false,
          message: `Erro no torrent RD: ${
            torrentInfo.error || torrentInfo.status
          }`,
        });
      }
    }

    // Após o loop de polling, verifica novamente se há links.
    // Como agora estamos a selecionar apenas um ficheiro, deve haver apenas um link.
    if (!torrentInfo.links || torrentInfo.links.length === 0) {
      console.log(
        `[REAL-DEBRID DEBUG] Torrent ${torrentId} não tem links após o polling (final).`
      );
      return res.status(404).json({
        success: false,
        message:
          "Nenhum link disponível no Real-Debrid após a seleção do ficheiro.",
      });
    }

    // 3. Unrestrict link para obter link direto
    // Agora que apenas o melhor ficheiro foi selecionado, torrentInfo.links[0] deverá ser o link correto.
    const linkToUnrestrict = torrentInfo.links[0];
    console.log(
      `[REAL-DEBRID DEBUG] Desbloqueando o link: ${linkToUnrestrict}`
    );
    const { data: unrestrictedData } = await axios.post(
      "https://api.real-debrid.com/rest/1.0/unrestrict/link",
      `link=${linkToUnrestrict}`,
      {
        headers: {
          Authorization: `Bearer ${REAL_DEBRID_TOKEN}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const finalStreamUrl = unrestrictedData.download;
    console.log(
      `[REAL-DEBRID DEBUG] URL de stream final obtido: ${finalStreamUrl}`
    );

    // 4. Retorne apenas o link direto ao invés de fazer proxy
    return res.json({ success: true, url: finalStreamUrl });
  } catch (error) {
    const message = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("[STREAM] Erro ao preparar link:", message);
    res.status(500).send(`Erro ao preparar o link do vídeo: ${message}`); // Incluir a mensagem do erro para melhor depuração
  }
}

module.exports = { streamHandler };
