/* =========================================================
   PAINEL RIBAS - PLAYER AGENT LOCAL
   =========================================================
   Agente local do player.

   Objetivo inicial:
   - ler configuração local;
   - criar pastas de cache e logs;
   - baixar playlist.json do servidor principal;
   - salvar uma cópia local em cache/playlist.json;
   - registrar logs simples.

   Importante:
   Este agente NÃO substitui o servidor principal.
   Ele é apenas uma camada local de sobrevivência para os PCs das TVs.
   ========================================================= */

const fs = require("fs");
const path = require("path");
const http = require("http");

/* =========================================================
   CAMINHOS BASE
   ========================================================= */

const agentRoot = __dirname;

const configFile = path.join(agentRoot, "config.agent.json");

/* =========================================================
   HELPERS GERAIS
   ========================================================= */

/**
 * Garante que uma pasta exista.
 */
function garantirPasta(caminho) {
    if (!fs.existsSync(caminho)) {
        fs.mkdirSync(caminho, { recursive: true });
    }
}

/**
 * Formata data/hora local para log.
 */
function obterDataHoraLocal() {
    return new Date().toLocaleString("pt-BR", {
        timeZone: "America/Campo_Grande",
        hour12: false
    });
}

/**
 * Lê JSON de um arquivo.
 */
function lerJson(caminho) {
    const conteudo = fs.readFileSync(caminho, "utf8");
    return JSON.parse(conteudo);
}

/**
 * Salva JSON formatado em arquivo.
 */
function salvarJson(caminho, dados) {
    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), "utf8");
}

/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

/**
 * Carrega configuração do agente local.
 */
function carregarConfigAgent() {
    if (!fs.existsSync(configFile)) {
        throw new Error(`Arquivo de configuração não encontrado: ${configFile}`);
    }

    const config = lerJson(configFile);

    if (!config.serverBaseUrl) {
        throw new Error("Configuração inválida: serverBaseUrl não informado.");
    }

    if (!config.playlistPath) {
        config.playlistPath = "/playlist.json";
    }

    if (!config.syncIntervalSeconds || Number(config.syncIntervalSeconds) < 5) {
        config.syncIntervalSeconds = 30;
    }

    if (!config.cacheFolder) {
        config.cacheFolder = "cache";
    }

    if (!config.mediaCacheFolder) {
        config.mediaCacheFolder = path.join(config.cacheFolder, "midia");
    }

    if (!config.logsFolder) {
        config.logsFolder = "logs";
    }

    if (config.removeOldMedia !== false) {
        config.removeOldMedia = true;
    }

    if (
        config.oldMediaRetentionHours === undefined ||
        Number(config.oldMediaRetentionHours) < 0
    ) {
        config.oldMediaRetentionHours = 24;
    }

    if (!config.localServerPort || Number(config.localServerPort) <= 0) {
        config.localServerPort = 3579;
    }

    return config;
}

const config = carregarConfigAgent();

const cacheFolder = path.join(agentRoot, config.cacheFolder);
const mediaCacheFolder = path.join(agentRoot, config.mediaCacheFolder);
const logsFolder = path.join(agentRoot, config.logsFolder);

const playlistCacheFile = path.join(cacheFolder, "playlist.json");
const logFile = path.join(logsFolder, "agent.log");

/* =========================================================
   LOG
   ========================================================= */

/**
 * Registra mensagem no terminal e no arquivo de log.
 */
function log(mensagem, tipo = "INFO") {
    garantirPasta(logsFolder);

    const linha = `[${obterDataHoraLocal()}] [${tipo}] ${mensagem}`;

    console.log(linha);

    fs.appendFileSync(logFile, `${linha}\n`, "utf8");
}

/* =========================================================
   URLS
   ========================================================= */

/**
 * Monta URL absoluta com segurança.
 */
function montarUrlAbsoluta(baseUrl, caminho) {
    return new URL(caminho, baseUrl).href;
}

/**
 * Monta a URL da playlist remota.
 */
function obterUrlPlaylistRemota() {
    return montarUrlAbsoluta(config.serverBaseUrl, config.playlistPath);
}

/* =========================================================
   MÍDIAS / CACHE LOCAL
   ========================================================= */

/**
 * Extrai nome seguro do arquivo a partir da URL/caminho da mídia.
 */
function obterNomeArquivoMidia(caminhoMidia) {
    const url = new URL(caminhoMidia, config.serverBaseUrl);
    const nome = path.basename(decodeURIComponent(url.pathname));

    if (!nome || nome === "." || nome === "/" || nome.includes("..")) {
        throw new Error(`Nome de mídia inválido: ${caminhoMidia}`);
    }

    return nome;
}

/**
 * Monta caminho local da mídia dentro do cache.
 */
function obterCaminhoLocalMidia(caminhoMidia) {
    const nomeArquivo = obterNomeArquivoMidia(caminhoMidia);
    return path.join(mediaCacheFolder, nomeArquivo);
}

/**
 * Monta URL remota absoluta da mídia.
 */
function obterUrlRemotaMidia(caminhoMidia) {
    return montarUrlAbsoluta(config.serverBaseUrl, caminhoMidia);
}

/**
 * Retorna somente itens de mídia válidos da playlist.
 */
function obterMidiasDaPlaylist(lista) {
    if (!Array.isArray(lista)) return [];

    return lista.filter((item) => {
        return item &&
            typeof item === "object" &&
            item.arquivo &&
            (item.tipo === "imagem" || item.tipo === "video");
    });
}

/**
 * Baixa uma mídia remota para o cache local.
 */
async function baixarMidiaParaCache(item) {
    const caminhoMidia = item.arquivo;
    const nomeArquivo = obterNomeArquivoMidia(caminhoMidia);
    const caminhoLocal = obterCaminhoLocalMidia(caminhoMidia);
    const urlRemota = obterUrlRemotaMidia(caminhoMidia);

    garantirPasta(mediaCacheFolder);

    if (fs.existsSync(caminhoLocal)) {
        const stats = fs.statSync(caminhoLocal);

        if (stats.size > 0) {
            log(`Mídia já existe no cache: ${nomeArquivo} (${stats.size} bytes)`);
            return {
                nome: nomeArquivo,
                status: "ja_existe",
                caminhoLocal,
                tamanhoBytes: stats.size
            };
        }
    }

    log(`Baixando mídia: ${nomeArquivo}`);
    log(`Origem: ${urlRemota}`);

    const resposta = await fetch(urlRemota, {
        cache: "no-store"
    });

    if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status} ao baixar ${nomeArquivo}`);
    }

    const arrayBuffer = await resposta.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!buffer.length) {
        throw new Error(`Arquivo baixado vazio: ${nomeArquivo}`);
    }

    fs.writeFileSync(caminhoLocal, buffer);

    log(`Mídia salva no cache: ${nomeArquivo} (${buffer.length} bytes)`, "OK");

    return {
        nome: nomeArquivo,
        status: "baixado",
        caminhoLocal,
        tamanhoBytes: buffer.length
    };
}

/**
 * Sincroniza mídias referenciadas pela playlist.
 */
async function sincronizarMidiasDaPlaylist(lista) {
    const midias = obterMidiasDaPlaylist(lista);

    if (!midias.length) {
        log("Nenhuma mídia encontrada na playlist para sincronizar.");
        return {
            total: 0,
            baixadas: 0,
            existentes: 0,
            falhas: 0
        };
    }

    log(`Sincronizando ${midias.length} mídia(s) da playlist...`);

    let baixadas = 0;
    let existentes = 0;
    let falhas = 0;

    for (const item of midias) {
        try {
            const resultado = await baixarMidiaParaCache(item);

            if (resultado.status === "baixado") {
                baixadas++;
            } else if (resultado.status === "ja_existe") {
                existentes++;
            }
        } catch (erro) {
            falhas++;
            log(`Falha ao sincronizar mídia ${item.arquivo}: ${erro.message || erro}`, "ERRO");
        }
    }

    log(
        `Resumo de mídias: ${baixadas} baixada(s), ${existentes} já existente(s), ${falhas} falha(s).`,
        falhas > 0 ? "AVISO" : "OK"
    );

    return {
        total: midias.length,
        baixadas,
        existentes,
        falhas
    };
}

/* =========================================================
   LIMPEZA SEGURA DO CACHE LOCAL
   ========================================================= */

/**
 * Retorna um Set com os nomes de arquivos que ainda fazem parte
 * da playlist atual.
 */
function obterNomesMidiasAtuaisDaPlaylist(lista) {
    const midias = obterMidiasDaPlaylist(lista);

    return new Set(
        midias.map((item) => obterNomeArquivoMidia(item.arquivo))
    );
}

/**
 * Lista arquivos físicos existentes no cache local de mídias.
 */
function listarArquivosCacheMidia() {
    if (!fs.existsSync(mediaCacheFolder)) {
        return [];
    }

    return fs.readdirSync(mediaCacheFolder)
        .map((arquivo) => {
            const caminho = path.join(mediaCacheFolder, arquivo);
            const stats = fs.statSync(caminho);

            return {
                nome: arquivo,
                caminho,
                tamanhoBytes: stats.size,
                modificadoEmMs: stats.mtimeMs,
                modificadoEm: stats.mtime.toISOString(),
                ehArquivo: stats.isFile()
            };
        })
        .filter((item) => item.ehArquivo);
}

/**
 * Verifica se um arquivo antigo já passou da margem segura
 * para remoção.
 */
function arquivoPassouDaRetencao(item) {
    const retencaoMs = Number(config.oldMediaRetentionHours) * 60 * 60 * 1000;

    if (retencaoMs <= 0) {
        return true;
    }

    const idadeMs = Date.now() - item.modificadoEmMs;

    return idadeMs >= retencaoMs;
}

/**
 * Remove do cache local mídias que não aparecem mais na playlist.
 *
 * Segurança:
 * - só remove arquivos dentro de cache/midia;
 * - só remove arquivos que não estão na playlist atual;
 * - respeita margem de retenção configurada;
 * - não remove pastas;
 * - não mexe na playlist.json.
 */
function limparMidiasAntigasDoCache(lista) {
    const resultado = {
        ativo: config.removeOldMedia === true,
        totalArquivosCache: 0,
        totalMantidos: 0,
        totalIgnoradosPorRetencao: 0,
        totalRemovidos: 0,
        removidos: []
    };

    if (!resultado.ativo) {
        log("Limpeza de mídias antigas desativada por configuração.");
        return resultado;
    }

    garantirPasta(mediaCacheFolder);

    const nomesAtuais = obterNomesMidiasAtuaisDaPlaylist(lista);
    const arquivosCache = listarArquivosCacheMidia();

    resultado.totalArquivosCache = arquivosCache.length;

    arquivosCache.forEach((item) => {
        if (nomesAtuais.has(item.nome)) {
            resultado.totalMantidos++;
            return;
        }

        if (!arquivoPassouDaRetencao(item)) {
            resultado.totalIgnoradosPorRetencao++;
            log(`Mídia fora da playlist mantida por retenção: ${item.nome}`);
            return;
        }

        try {
            fs.unlinkSync(item.caminho);

            resultado.totalRemovidos++;
            resultado.removidos.push({
                nome: item.nome,
                tamanhoBytes: item.tamanhoBytes,
                modificadoEm: item.modificadoEm
            });

            log(`Mídia antiga removida do cache: ${item.nome}`, "OK");
        } catch (erro) {
            log(`Falha ao remover mídia antiga ${item.nome}: ${erro.message || erro}`, "ERRO");
        }
    });

    log(
        `Limpeza do cache: ${resultado.totalMantidos} mantida(s), ${resultado.totalIgnoradosPorRetencao} em retenção, ${resultado.totalRemovidos} removida(s).`,
        "OK"
    );

    return resultado;
}

/* =========================================================
   SERVIDOR LOCAL DO CACHE
   =========================================================
   Disponibiliza o cache local via localhost.

   Rotas:
   - GET /health
   - GET /playlist.json
   - GET /midia/:arquivo
   ========================================================= */

/**
 * Retorna content-type básico conforme extensão.
 */
function obterContentType(caminhoArquivo) {
    const extensao = path.extname(caminhoArquivo).toLowerCase();

    const mapa = {
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mov": "video/quicktime"
    };

    return mapa[extensao] || "application/octet-stream";
}

/**
 * Envia JSON na resposta HTTP.
 */
/**
 * Verifica se a requisição não deve receber corpo.
 *
 * HEAD é usado por navegadores, players de vídeo e ferramentas
 * de diagnóstico para consultar metadados do arquivo sem baixar
 * o conteúdo inteiro.
 */
function requisicaoSemCorpo(req) {
    return req && req.method === "HEAD";
}

/**
 * Envia JSON na resposta HTTP.
 */
function responderJson(req, res, statusCode, dados) {
    const corpo = JSON.stringify(dados, null, 2);

    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(corpo),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
    });

    if (requisicaoSemCorpo(req)) {
        return res.end();
    }

    res.end(corpo);
}

/**
 * Envia resposta de erro em texto simples.
 */
function responderTexto(req, res, statusCode, texto, headersExtras = {}) {
    const corpo = String(texto || "");

    res.writeHead(statusCode, {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": Buffer.byteLength(corpo),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
        ...headersExtras
    });

    if (requisicaoSemCorpo(req)) {
        return res.end();
    }

    res.end(corpo);
}

/**
 * Responde preflight CORS.
 *
 * Mesmo sendo um servidor local, manter OPTIONS ajuda em cenários
 * onde o navegador decide consultar permissões antes de acessar
 * mídia com cabeçalhos como Range.
 */
function responderOptions(res) {
    res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type",
        "Access-Control-Max-Age": "86400",
        "Cache-Control": "no-store"
    });

    res.end();
}

/**
 * Interpreta o cabeçalho Range de forma segura.
 *
 * Suporta:
 * - bytes=0-1023
 * - bytes=1000-
 * - bytes=-1024
 */
function interpretarRange(rangeHeader, tamanhoArquivo) {
    if (!rangeHeader) return null;

    const texto = String(rangeHeader).trim();
    const match = texto.match(/^bytes=(\d*)-(\d*)$/);

    if (!match) {
        return {
            invalido: true
        };
    }

    const inicioTexto = match[1];
    const fimTexto = match[2];

    let inicio;
    let fim;

    /*
      Sufixo: bytes=-1024
      Significa: últimos 1024 bytes do arquivo.
    */
    if (!inicioTexto && fimTexto) {
        const quantidadeFinal = Number(fimTexto);

        if (!Number.isFinite(quantidadeFinal) || quantidadeFinal <= 0) {
            return { invalido: true };
        }

        inicio = Math.max(tamanhoArquivo - quantidadeFinal, 0);
        fim = tamanhoArquivo - 1;
    } else {
        inicio = Number(inicioTexto);
        fim = fimTexto ? Number(fimTexto) : tamanhoArquivo - 1;
    }

    if (
        !Number.isFinite(inicio) ||
        !Number.isFinite(fim) ||
        inicio < 0 ||
        fim < inicio ||
        inicio >= tamanhoArquivo
    ) {
        return {
            invalido: true
        };
    }

    fim = Math.min(fim, tamanhoArquivo - 1);

    return {
        inicio,
        fim,
        tamanho: fim - inicio + 1
    };
}

/**
 * Envia arquivo físico com validação básica.
 *
 * Suporta:
 * - GET normal;
 * - HEAD;
 * - Range bytes para vídeos e mídias grandes.
 *
 * Isso evita que o navegador precise baixar o arquivo inteiro quando
 * ele só quer metadados ou pequenos trechos do vídeo.
 */
function enviarArquivo(req, res, caminhoArquivo) {
    if (!fs.existsSync(caminhoArquivo)) {
        return responderTexto(req, res, 404, "Arquivo não encontrado.");
    }

    const stats = fs.statSync(caminhoArquivo);

    if (!stats.isFile()) {
        return responderTexto(req, res, 400, "O caminho solicitado não é um arquivo.");
    }

    const tamanhoArquivo = stats.size;
    const contentType = obterContentType(caminhoArquivo);

    const headersBase = {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
        "Accept-Ranges": "bytes",
        "Last-Modified": stats.mtime.toUTCString()
    };

    const range = interpretarRange(req.headers.range, tamanhoArquivo);

    if (range && range.invalido) {
        return responderTexto(
            req,
            res,
            416,
            "Range inválido ou não satisfatório.",
            {
                "Content-Range": `bytes */${tamanhoArquivo}`,
                "Accept-Ranges": "bytes"
            }
        );
    }

    /*
      Resposta parcial: o navegador pediu só um pedaço do arquivo.
      Para MP4 isso é importante, pois o player costuma pedir ranges
      para carregar metadados e controlar reprodução.
    */
    if (range) {
        res.writeHead(206, {
            ...headersBase,
            "Content-Length": range.tamanho,
            "Content-Range": `bytes ${range.inicio}-${range.fim}/${tamanhoArquivo}`
        });

        if (requisicaoSemCorpo(req)) {
            return res.end();
        }

        return fs
            .createReadStream(caminhoArquivo, {
                start: range.inicio,
                end: range.fim
            })
            .pipe(res);
    }

    /*
      Resposta completa.
      Usada para arquivos pequenos, playlist.json ou clientes que
      não enviam cabeçalho Range.
    */
    res.writeHead(200, {
        ...headersBase,
        "Content-Length": tamanhoArquivo
    });

    if (requisicaoSemCorpo(req)) {
        return res.end();
    }

    fs.createReadStream(caminhoArquivo).pipe(res);
}

/**
 * Resolve com segurança arquivo dentro da pasta de mídias cacheadas.
 */
function resolverMidiaLocal(nomeArquivo) {
    const nome = String(nomeArquivo || "").trim();

    if (!nome || nome !== path.basename(nome)) {
        return null;
    }

    const caminho = path.resolve(mediaCacheFolder, nome);
    const pastaMidiasResolvida = path.resolve(mediaCacheFolder);

    if (!caminho.startsWith(pastaMidiasResolvida + path.sep)) {
        return null;
    }

    return caminho;
}

/**
 * Obtém resumo rápido do cache local.
 */
function obterResumoCacheLocal() {
    const playlistExiste = fs.existsSync(playlistCacheFile);
    const arquivosMidia = listarArquivosCacheMidia();

    return {
        ok: true,
        nome: "Painel Ribas Player Agent",
        dataHora: obterDataHoraLocal(),
        servidorPrincipal: config.serverBaseUrl,
        playlistCache: {
            existe: playlistExiste,
            caminho: playlistCacheFile
        },
        midias: {
            total: arquivosMidia.length,
            pasta: mediaCacheFolder
        }
    };
}


/**
 * Trata requisições HTTP do servidor local.
 */
function tratarRequisicaoLocal(req, res) {
    try {
        const url = new URL(req.url, `http://localhost:${config.localServerPort}`);
        const pathname = decodeURIComponent(url.pathname);

        if (req.method === "OPTIONS") {
            return responderOptions(res);
        }

        if (req.method !== "GET" && req.method !== "HEAD") {
            return responderJson(req, res, 405, {
                erro: true,
                mensagem: "Método não permitido."
            });
        }

        if (pathname === "/" || pathname === "/health") {
            return responderJson(req, res, 200, obterResumoCacheLocal());
        }

        if (pathname === "/playlist.json") {
            return enviarArquivo(req, res, playlistCacheFile);
        }

        if (pathname.startsWith("/midia/")) {
            const nomeArquivo = pathname.replace("/midia/", "");
            const caminhoMidia = resolverMidiaLocal(nomeArquivo);

            if (!caminhoMidia) {
                return responderTexto(req, res, 400, "Nome de mídia inválido.");
            }

            return enviarArquivo(req, res, caminhoMidia);
        }

        return responderJson(req, res, 404, {
            erro: true,
            mensagem: "Rota não encontrada."
        });
    } catch (erro) {
        log(`Erro no servidor local: ${erro.message || erro}`, "ERRO");

        return responderJson(req, res, 500, {
            erro: true,
            mensagem: "Erro interno no servidor local."
        });
    }
}

/**
 * Inicia servidor local do agente.
 */
function iniciarServidorLocal() {
    const porta = Number(config.localServerPort) || 3579;

    const servidor = http.createServer(tratarRequisicaoLocal);

    servidor.listen(porta, "127.0.0.1", () => {
        log(`Servidor local do cache iniciado em http://localhost:${porta}`, "OK");
    });

    servidor.on("error", (erro) => {
        log(`Falha no servidor local do cache: ${erro.message || erro}`, "ERRO");
    });

    return servidor;
}

/* =========================================================
   PLAYLIST
   ========================================================= */

/**
 * Valida formato mínimo da playlist.
 *
 * Neste agente, playlist vazia não é erro fatal.
 * Ela pode significar que todas as mídias estão inativas.
 *
 * O importante é o arquivo ser um array.
 */
function validarPlaylist(dados) {
    if (!Array.isArray(dados)) {
        throw new Error("playlist.json remoto não é um array válido.");
    }

    return true;
}

/**
 * Baixa playlist remota do servidor principal.
 */
async function baixarPlaylistRemota() {
    const url = obterUrlPlaylistRemota();

    log(`Baixando playlist remota: ${url}`);

    const resposta = await fetch(url, {
        cache: "no-store"
    });

    if (!resposta.ok) {
        throw new Error(`Erro HTTP ao baixar playlist: ${resposta.status}`);
    }

    const dados = await resposta.json();

    validarPlaylist(dados);

    return dados;
}

/**
 * Salva playlist no cache local.
 */
function salvarPlaylistNoCache(playlist) {
    garantirPasta(cacheFolder);

    salvarJson(playlistCacheFile, playlist);

    log(`Playlist salva no cache local: ${playlistCacheFile}`);
    log(`Total de itens na playlist: ${playlist.length}`);
}

/**
 * Executa uma sincronização simples da playlist.
 */
async function sincronizarPlaylist() {
    try {
        log("Iniciando sincronização da playlist...");

        const playlist = await baixarPlaylistRemota();

        salvarPlaylistNoCache(playlist);

        await sincronizarMidiasDaPlaylist(playlist);

        limparMidiasAntigasDoCache(playlist);

        log("Sincronização da playlist, mídias e limpeza concluída com sucesso.", "OK");
    } catch (erro) {
        log(`Falha ao sincronizar playlist: ${erro.message || erro}`, "ERRO");
    }
}

/* =========================================================
   START
   ========================================================= */

async function iniciarAgent() {
    garantirPasta(cacheFolder);
    garantirPasta(mediaCacheFolder);
    garantirPasta(logsFolder);

    log("==================================================");
    log("Painel Ribas - Player Agent Local iniciado.");
    log(`Servidor principal: ${config.serverBaseUrl}`);
    log(`Intervalo de sincronização: ${config.syncIntervalSeconds}s`);
    log(`Pasta de cache: ${cacheFolder}`);
    log(`Pasta de mídias em cache: ${mediaCacheFolder}`);
    log(`Limpeza de mídias antigas: ${config.removeOldMedia ? "ativada" : "desativada"}`);
    log(`Retenção de mídias antigas: ${config.oldMediaRetentionHours}h`);
    log(`Servidor local: http://localhost:${config.localServerPort}`);
    log(`Pasta de logs: ${logsFolder}`);
    log("==================================================");

    iniciarServidorLocal();

    await sincronizarPlaylist();

    const intervaloMs = Number(config.syncIntervalSeconds) * 1000;

    setInterval(() => {
        sincronizarPlaylist();
    }, intervaloMs);
}

iniciarAgent();