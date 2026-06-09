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

    if (!config.logsFolder) {
        config.logsFolder = "logs";
    }

    return config;
}

const config = carregarConfigAgent();

const cacheFolder = path.join(agentRoot, config.cacheFolder);
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

        log("Sincronização da playlist concluída com sucesso.", "OK");
    } catch (erro) {
        log(`Falha ao sincronizar playlist: ${erro.message || erro}`, "ERRO");
    }
}

/* =========================================================
   START
   ========================================================= */

async function iniciarAgent() {
    garantirPasta(cacheFolder);
    garantirPasta(logsFolder);

    log("==================================================");
    log("Painel Ribas - Player Agent Local iniciado.");
    log(`Servidor principal: ${config.serverBaseUrl}`);
    log(`Intervalo de sincronização: ${config.syncIntervalSeconds}s`);
    log(`Pasta de cache: ${cacheFolder}`);
    log(`Pasta de logs: ${logsFolder}`);
    log("==================================================");

    await sincronizarPlaylist();

    const intervaloMs = Number(config.syncIntervalSeconds) * 1000;

    setInterval(() => {
        sincronizarPlaylist();
    }, intervaloMs);
}

iniciarAgent();