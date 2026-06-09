/* =========================================================
   ELEMENTOS PRINCIPAIS DA INTERFACE
   =========================================================
   Nesta seção capturamos todos os elementos do HTML
   que serão manipulados pelo JavaScript.
   ========================================================= */

// Players de mídia
const videoPlayer = document.getElementById("videoPlayer");
const videoPreload = document.getElementById("videoPreload");
const imagePlayer = document.getElementById("imagePlayer");

// Caixa de status / mensagens rápidas
const statusBox = document.getElementById("status");

// Tela de fallback operacional do player
const playerFallback = document.getElementById("playerFallback");
const playerFallbackIcon = document.getElementById("playerFallbackIcon");
const playerFallbackTitle = document.getElementById("playerFallbackTitle");
const playerFallbackMessage = document.getElementById("playerFallbackMessage");
const playerFallbackHint = document.getElementById("playerFallbackHint");
const btnRetryPlayer = document.getElementById("btnRetryPlayer");

// Splash inicial
const splashScreen = document.getElementById("splashScreen");
const splashWallpaper = document.getElementById("splashWallpaper");

// Barra lateral
const sidePanel = document.getElementById("sidePanel");
const controls = document.getElementById("controls");

// Relógio lateral
const sidebarClockTime = document.getElementById("sidebarClockTime");
const sidebarClockDate = document.getElementById("sidebarClockDate");

// Botões principais
const btnPlayPause = document.getElementById("btnPlayPause");
const btnNext = document.getElementById("btnNext");
const btnPrev = document.getElementById("btnPrev");
const btnMute = document.getElementById("btnMute");
const btnFullscreen = document.getElementById("btnFullscreen");

// Ícones e textos internos dos botões
const btnPlayPauseIcon = btnPlayPause ? btnPlayPause.querySelector("i") : null;
const btnPlayPauseText = btnPlayPause ? btnPlayPause.querySelector("span") : null;

const btnMuteIcon = btnMute ? btnMute.querySelector("i") : null;
const btnMuteText = btnMute ? btnMute.querySelector("span") : null;

const btnFullscreenIcon = btnFullscreen ? btnFullscreen.querySelector("i") : null;
const btnFullscreenText = btnFullscreen ? btnFullscreen.querySelector("span") : null;

// Aviso de rotação em dispositivos móveis
const rotateNotice = document.getElementById("rotateNotice");
const btnDismissRotate = document.getElementById("btnDismissRotate");

// Painel de diagnóstico opcional
const debugPanel = document.getElementById("debugPanel");
const debugLog = document.getElementById("debugLog");

/* =========================================================
   MODO DE DIAGNÓSTICO
   =========================================================
   Para ativar o diagnóstico, abra a página com ?debug=1

   Exemplos:
   - http://localhost/?debug=1
   - http://192.168.4.14/?debug=1
   - https://painelribas.com.br/?debug=1

   No uso normal, o diagnóstico fica invisível.
   ========================================================= */
const parametrosUrl = new URLSearchParams(window.location.search);
const modoDebugAtivo = parametrosUrl.get("debug") === "1";

if (modoDebugAtivo) {
  document.body.classList.add("debug-mode");
} else {
  document.body.classList.remove("debug-mode");
}

/* =========================================================
   ESTADO DA APLICAÇÃO
   =========================================================
   Variáveis globais que guardam o estado do painel.
   ========================================================= */

// Configuração carregada do config.json
let config = {};

// Playlist carregada do playlist.json
let playlist = [];

// Índice atual da playlist
let indiceAtual = 0;

// Tipo da mídia atual ("video" ou "imagem")
let tipoAtual = null;

// Timers auxiliares
let timerImagem = null;
let timerStatus = null;
let timerInterface = null;

// Controle de transição entre mídias
let emTransicao = false;

// Indica se a primeira inicialização já terminou
let primeiraInicializacaoConcluida = false;

// Preferência de som do usuário
let somHabilitadoPeloUsuario = false;

// Controle do overlay de rotação
let rotateNoticeDismissed = false;

// Controle de nova tentativa automática após falha operacional grave
let timerRetryFallbackPlayer = null;
let tentativaRecuperacaoPlayerEmAndamento = false;

/* =========================================================
   DIAGNÓSTICO / DEBUG
   ========================================================= */

/**
 * Escreve uma linha no painel de diagnóstico.
 * Só aparece quando a página é aberta com ?debug=1.
 */
function debugMensagem(mensagem) {
  if (!modoDebugAtivo || !debugLog) return;

  const agora = new Date().toLocaleTimeString("pt-BR", {
    hour12: false
  });

  debugLog.textContent += `[${agora}] ${mensagem}\n`;
  debugLog.scrollTop = debugLog.scrollHeight;
}

/**
 * Registra o estado atual do player de vídeo.
 * Isso é especialmente útil para diagnosticar Smart TVs.
 */
function debugEstadoVideo(contexto = "Estado do vídeo") {
  if (!modoDebugAtivo || !videoPlayer) return;

  debugMensagem("==========================================");
  debugMensagem(contexto);
  debugMensagem(`src: ${videoPlayer.currentSrc || videoPlayer.src || "(sem src)"}`);
  debugMensagem(`readyState: ${videoPlayer.readyState}`);
  debugMensagem(`networkState: ${videoPlayer.networkState}`);
  debugMensagem(`paused: ${videoPlayer.paused}`);
  debugMensagem(`muted: ${videoPlayer.muted}`);
  debugMensagem(`volume: ${videoPlayer.volume}`);
  debugMensagem(`duration: ${videoPlayer.duration}`);
  debugMensagem(`currentTime: ${videoPlayer.currentTime}`);

  if (videoPlayer.error) {
    debugMensagem(`error code: ${videoPlayer.error.code}`);
    debugMensagem(`error message: ${videoPlayer.error.message || "sem mensagem"}`);
  } else {
    debugMensagem("error: Sem erro registrado");
  }

  debugMensagem("==========================================");
}

/* =========================================================
   FUNÇÕES UTILITÁRIAS
   ========================================================= */

/**
 * Espera um tempo em milissegundos.
 * Útil para splash, fade e pequenos atrasos controlados.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retorna a duração configurada do fade entre mídias.
 * Se não houver valor válido no config, usa 600ms.
 */
function getFadeDuration() {
  return Number(config.duracaoFadeMidia) > 0
    ? Number(config.duracaoFadeMidia)
    : 600;
}

/**
 * Cria uma URL com parâmetro anti-cache.
 * Ajuda quando a Smart TV insiste em reutilizar arquivo antigo.
 */
function criarUrlComCacheBuster(caminho) {
  const url = new URL(caminho, window.location.href);
  url.searchParams.set("t", Date.now().toString());
  return url.href;
}

/**
 * Aplica uma animação rápida de feedback visual em um botão.
 * Serve para clique com mouse, toque ou interação de teclado/controle.
 */
function aplicarFeedbackNoBotao(botao) {
  if (!botao) return;

  botao.classList.remove("feedback");
  void botao.offsetWidth;
  botao.classList.add("feedback");

  setTimeout(() => {
    botao.classList.remove("feedback");
  }, 300);
}

/* =========================================================
   STATUS / MENSAGENS
   ========================================================= */

/**
 * Mostra uma mensagem temporária na caixa de status.
 * Em modo teste ela fica visível por mais tempo.
 */
function atualizarStatus(texto) {
  statusBox.textContent = texto;
  statusBox.classList.remove("hidden");

  clearTimeout(timerStatus);

  const tempoVisivel = config.modoTeste ? 4000 : 2000;

  timerStatus = setTimeout(() => {
    statusBox.classList.add("hidden");
  }, tempoVisivel);
}

/* =========================================================
   STATUS DE CONEXÃO / FALLBACK
   ========================================================= */

let timerConnectionStatus = null;
let estadoConexaoPlayer = "online";

/**
 * Atualiza o indicador discreto de conexão do player.
 *
 * Estados:
 * - online: conexão OK, indicador aparece rapidamente e some;
 * - offline: sem conexão com o servidor, mantém conteúdo atual;
 * - fallback: usando última playlist salva localmente;
 * - erro: situação crítica de carregamento.
 */
function atualizarIndicadorConexao(estado, texto) {
  const connectionStatus = document.getElementById("connectionStatus");

  if (!connectionStatus) return;

  const icone = connectionStatus.querySelector("i");
  const label = connectionStatus.querySelector("span");

  estadoConexaoPlayer = estado;

  connectionStatus.classList.remove(
    "hidden",
    "connectionStatusOnline",
    "connectionStatusOffline",
    "connectionStatusFallback",
    "connectionStatusError"
  );

  if (timerConnectionStatus) {
    clearTimeout(timerConnectionStatus);
    timerConnectionStatus = null;
  }

  if (estado === "online") {
    connectionStatus.classList.add("connectionStatusOnline");

    if (icone) {
      icone.className = "fa-solid fa-wifi";
    }

    if (label) {
      label.textContent = texto || "Conexão restabelecida.";
    }

    /*
      Online é apenas um aviso rápido.
      No uso normal, não queremos um indicador permanente na TV.
    */
    timerConnectionStatus = setTimeout(() => {
      connectionStatus.classList.add("hidden");
    }, 3500);

    return;
  }

  if (estado === "offline") {
    connectionStatus.classList.add("connectionStatusOffline");

    if (icone) {
      icone.className = "fa-solid fa-wifi-slash";
    }

    if (label) {
      label.textContent = texto || "Sem conexão. Mantendo conteúdo atual.";
    }

    return;
  }

  if (estado === "fallback") {
    connectionStatus.classList.add("connectionStatusFallback");

    if (icone) {
      icone.className = "fa-solid fa-clock-rotate-left";
    }

    if (label) {
      label.textContent = texto || "Usando última playlist salva.";
    }

    return;
  }

  connectionStatus.classList.add("connectionStatusError");

  if (icone) {
    icone.className = "fa-solid fa-triangle-exclamation";
  }

  if (label) {
    label.textContent = texto || "Falha operacional no player.";
  }
}

/**
 * Esconde o indicador de conexão.
 */
function esconderIndicadorConexao() {
  const connectionStatus = document.getElementById("connectionStatus");

  if (!connectionStatus) return;

  connectionStatus.classList.add("hidden");
}

/* =========================================================
   FALLBACK OPERACIONAL VISUAL DO PLAYER
   =========================================================
   Exibe uma tela amigável quando o player não consegue
   carregar playlist ou mídia válida.
   ========================================================= */

/**
 * Exibe tela de fallback operacional.
 */
function mostrarFallbackOperacionalPlayer({
  icone = "fa-triangle-exclamation",
  titulo = "Conteúdo indisponível",
  mensagem = "O player não conseguiu carregar conteúdo para exibição.",
  dica = "O sistema tentará novamente automaticamente em instantes.",
  estado = "erro"
} = {}) {
  if (!playerFallback) return;

  playerFallback.classList.remove(
    "hidden",
    "playerFallbackWarning",
    "playerFallbackError",
    "playerFallbackOffline"
  );

  if (estado === "offline") {
    playerFallback.classList.add("playerFallbackOffline");
  } else if (estado === "aviso") {
    playerFallback.classList.add("playerFallbackWarning");
  } else {
    playerFallback.classList.add("playerFallbackError");
  }

  if (playerFallbackIcon) {
    playerFallbackIcon.className = `fa-solid ${icone}`;
  }

  if (playerFallbackTitle) {
    playerFallbackTitle.textContent = titulo;
  }

  if (playerFallbackMessage) {
    playerFallbackMessage.textContent = mensagem;
  }

  if (playerFallbackHint) {
    playerFallbackHint.textContent = dica;
  }

  mostrarCursor();

  if (config && config.mostrarControles) {
    mostrarControlesTemporariamente();
  }
}

/**
 * Esconde tela de fallback operacional.
 */
function esconderFallbackOperacionalPlayer() {
  if (!playerFallback) return;

  playerFallback.classList.add("hidden");
}

/**
 * Agenda uma nova tentativa de recuperação do player.
 */
function agendarRetryFallbackPlayer(tempoMs = 30000) {
  if (timerRetryFallbackPlayer) {
    clearTimeout(timerRetryFallbackPlayer);
  }

  timerRetryFallbackPlayer = setTimeout(() => {
    tentarRecuperarPlayerAposFalha();
  }, tempoMs);
}

/**
 * Tenta recuperar o player após uma falha grave.
 *
 * Não chama iniciarSistema() de novo para evitar duplicar eventos,
 * timers e intervalos. Apenas tenta recarregar playlist e tocar.
 */
async function tentarRecuperarPlayerAposFalha() {
  if (tentativaRecuperacaoPlayerEmAndamento) return;

  tentativaRecuperacaoPlayerEmAndamento = true;

  try {
    atualizarStatus("Tentando carregar conteúdo novamente...");
    debugMensagem("Tentando recuperar player após fallback operacional...");

    await carregarPlaylist();

    if (!playlistEhValida(playlist)) {
      throw new Error("Playlist continua vazia ou inválida.");
    }

    esconderFallbackOperacionalPlayer();
    esconderSplash();
    splashScreen.classList.add("hidden");

    falhasSequenciaisDeMidia = 0;
    indiceAtual = 0;
    emTransicao = false;

    await prepararPrimeiraMidiaDoCiclo();

    tocarItemAtual();

    atualizarIndicadorConexao("online", "Conteúdo carregado novamente.");
    debugMensagem("Player recuperado com sucesso após fallback.");
  } catch (erro) {
    console.warn("Ainda não foi possível recuperar o player:", erro);
    debugMensagem(`Falha ao recuperar player: ${erro.message || erro}`);

    mostrarFallbackOperacionalPlayer({
      icone: navigator.onLine === false ? "fa-wifi-slash" : "fa-triangle-exclamation",
      titulo: "Aguardando conteúdo",
      mensagem: "Ainda não foi possível carregar uma playlist ou mídia válida.",
      dica: "Verifique a conexão, o servidor e se há mídias ativas na playlist.",
      estado: navigator.onLine === false ? "offline" : "erro"
    });

    agendarRetryFallbackPlayer(30000);
  } finally {
    tentativaRecuperacaoPlayerEmAndamento = false;
  }
}

/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

/**
 * Carrega o arquivo config.json.
 */
async function carregarConfig() {
  debugMensagem("Carregando config.json...");
  const resposta = await fetch(`config.json?v=${Date.now()}`);

  if (!resposta.ok) {
    throw new Error(`Erro ao carregar config: ${resposta.status}`);
  }

  config = await resposta.json();
  debugMensagem("config.json carregado.");
  aplicarConfig();
}

/**
 * Aplica as configurações carregadas na interface.
 */
function aplicarConfig() {
  // Define wallpaper da splash
  if (config.wallpaperInicial) {
    splashWallpaper.src = config.wallpaperInicial;
  }

  // Liga/desliga status visual
  if (!config.mostrarStatus) {
    statusBox.classList.add("hidden");
  } else {
    statusBox.classList.remove("hidden");
  }

  // Liga/desliga a barra lateral
  sidePanel.classList.toggle("hidden", !config.mostrarControles);

  // Garante que a barra comece escondida
  sidePanel.classList.add("controls-hidden");
  sidePanel.classList.remove("panel-open");
}

/* =========================================================
   RELÓGIO
   ========================================================= */

/**
 * Inicia a atualização contínua de hora e data
 * usando o fuso de Campo Grande / MS.
 */
function iniciarRelogio() {
  function atualizarRelogio() {
    const agora = new Date();

    const horaFormatada = agora.toLocaleTimeString("pt-BR", {
      timeZone: "America/Campo_Grande",
      hour12: false
    });

    const dataFormatada = agora.toLocaleDateString("pt-BR", {
      timeZone: "America/Campo_Grande"
    });

    if (sidebarClockTime) {
      sidebarClockTime.textContent = horaFormatada;
    }

    if (sidebarClockDate) {
      sidebarClockDate.textContent = dataFormatada;
    }
  }

  atualizarRelogio();
  setInterval(atualizarRelogio, 1000);
}

/* =========================================================
   PLAYLIST
   ========================================================= */

/* =========================================================
PLAYLIST - FALLBACK LOCAL
=========================================================
Mantém uma cópia local da última playlist válida.

Objetivo:
- se a rede cair;
- se o servidor ficar temporariamente indisponível;
- ou se o playlist.json falhar no carregamento;

o player tenta continuar usando a última playlist válida salva
no navegador, evitando tela parada por falha temporária.
========================================================= */

const PLAYLIST_CACHE_KEY = "painelRibasUltimaPlaylistValida";
const PLAYLIST_CACHE_DATA_KEY = "painelRibasUltimaPlaylistValidaEm";

/**
 * Cria erro operacional do player com código interno.
 *
 * Isso permite diferenciar:
 * - playlist vazia;
 * - falha de rede;
 * - JSON inválido;
 * - ausência de cache local.
 */
function criarErroPlayer(mensagem, codigo) {
  const erro = new Error(mensagem);
  erro.codigo = codigo;
  return erro;
}

/**
 * Valida se uma playlist possui formato mínimo aceitável.
 */
function playlistEhValida(lista) {
  return Array.isArray(lista) && lista.length > 0;
}

/**
 * Salva localmente a última playlist válida.
 */
function salvarPlaylistLocal(lista) {
  if (!playlistEhValida(lista)) return;

  try {
    localStorage.setItem(PLAYLIST_CACHE_KEY, JSON.stringify(lista));
    localStorage.setItem(PLAYLIST_CACHE_DATA_KEY, new Date().toISOString());

    debugMensagem(`Playlist salva localmente. Total de itens: ${lista.length}`);
  } catch (erro) {
    console.warn("Não foi possível salvar a playlist localmente:", erro);
  }
}

/**
 * Carrega a última playlist válida salva localmente.
 */
function carregarPlaylistLocal() {
  try {
    const texto = localStorage.getItem(PLAYLIST_CACHE_KEY);

    if (!texto) {
      return null;
    }

    const lista = JSON.parse(texto);

    if (!playlistEhValida(lista)) {
      return null;
    }

    return lista;
  } catch (erro) {
    console.warn("Não foi possível carregar a playlist local:", erro);
    return null;
  }
}

/**
 * Busca a playlist atual no servidor.
 */
async function buscarPlaylistRemota() {
  const resposta = await fetch(`playlist.json?v=${Date.now()}`, {
    cache: "no-store"
  });

  if (!resposta.ok) {
    throw new Error(`Erro HTTP ao carregar playlist: ${resposta.status}`);
  }

  const dados = await resposta.json();

  if (!Array.isArray(dados)) {
    throw criarErroPlayer(
      "O arquivo playlist.json foi carregado, mas possui formato inválido.",
      "PLAYLIST_FORMATO_INVALIDO"
    );
  }

  if (!dados.length) {
    throw criarErroPlayer(
      "Nenhuma mídia ativa encontrada na playlist.",
      "PLAYLIST_VAZIA"
    );
  }

  salvarPlaylistLocal(dados);

  return dados;
}

/**
 * Carrega o arquivo playlist.json.
 *
 * Se a playlist remota falhar, tenta usar a última playlist válida
 * salva localmente no navegador.
 */
async function carregarPlaylist() {
  debugMensagem("Carregando playlist.json...");

  try {
    const dados = await buscarPlaylistRemota();

    playlist = dados;
    indiceAtual = 0;

    preCarregarImagensDaPlaylist(playlist);

    if (estadoConexaoPlayer !== "online") {
      atualizarIndicadorConexao("online", "Conexão restabelecida.");
    }

    atualizarStatus("Playlist carregada.");
    debugMensagem(`playlist.json carregado. Total de itens: ${playlist.length}`);

    return;
  } catch (erro) {
    console.warn("Falha ao carregar playlist remota:", erro);

    /*
      Se o servidor respondeu corretamente, mas a playlist veio vazia,
      isso não é queda de rede.
  
      Exemplo real:
      - todas as mídias foram inativadas no admin;
      - playlist.json foi regenerada vazia;
      - o player não deve usar playlist antiga salva localmente.
    */
    if (erro && erro.codigo === "PLAYLIST_VAZIA") {
      playlist = [];
      indiceAtual = 0;

      atualizarIndicadorConexao("erro", "Nenhuma mídia ativa.");

      mostrarFallbackOperacionalPlayer({
        icone: "fa-photo-film",
        titulo: "Nenhuma mídia ativa",
        mensagem: "A playlist foi carregada, mas não há mídias ativas para exibição.",
        dica: "Ative pelo menos uma mídia no painel administrativo e sincronize a playlist.",
        estado: "aviso"
      });

      throw erro;
    }

    /*
      Formato inválido também não deve usar cache antigo automaticamente,
      porque pode indicar arquivo corrompido ou problema de geração.
    */
    if (erro && erro.codigo === "PLAYLIST_FORMATO_INVALIDO") {
      playlist = [];
      indiceAtual = 0;

      atualizarIndicadorConexao("erro", "Playlist inválida.");

      mostrarFallbackOperacionalPlayer({
        icone: "fa-file-circle-xmark",
        titulo: "Playlist inválida",
        mensagem: "O arquivo da playlist foi encontrado, mas o formato não é válido.",
        dica: "Gere/sincronize a playlist novamente pelo painel administrativo.",
        estado: "erro"
      });

      throw erro;
    }

    debugMensagem("Falha ao carregar playlist remota. Tentando fallback local...");
  }

  const playlistLocal = carregarPlaylistLocal();

  if (playlistEhValida(playlistLocal)) {
    playlist = playlistLocal;
    indiceAtual = 0;

    preCarregarImagensDaPlaylist(playlist);

    atualizarIndicadorConexao("fallback", "Usando última playlist salva.");
    debugMensagem(`Fallback local carregado. Total de itens: ${playlist.length}`);

    return;
  }

  atualizarIndicadorConexao("erro", "Não foi possível carregar playlist.");

  throw new Error("Não foi possível carregar a playlist remota nem uma playlist local salva.");
}

/* =========================================================
   INTERFACE INTELIGENTE
   =========================================================
   Controla:
   - mostrar/esconder cursor
   - mostrar/esconder barra lateral
   - reaparecer quando há interação
   ========================================================= */

/**
 * Mostra o cursor.
 */
function mostrarCursor() {
  document.body.classList.remove("cursor-hidden");
}

/**
 * Esconde o cursor.
 */
function esconderCursor() {
  document.body.classList.add("cursor-hidden");
}

/**
 * Mostra temporariamente a barra lateral.
 */
function mostrarControlesTemporariamente() {
  sidePanel.classList.remove("controls-hidden");
  sidePanel.classList.add("panel-open");
}

/**
 * Esconde temporariamente a barra lateral.
 */
function esconderControlesTemporariamente() {
  sidePanel.classList.add("controls-hidden");
  sidePanel.classList.remove("panel-open");
}

/**
 * Reinicia a visibilidade da interface.
 * Toda interação chama essa função.
 */
function resetarInterface() {
  mostrarCursor();

  if (config.mostrarControles) {
    mostrarControlesTemporariamente();
  }

  clearTimeout(timerInterface);

  timerInterface = setTimeout(() => {
    esconderCursor();

    if (config.mostrarControles) {
      esconderControlesTemporariamente();
    }
  }, Number(config.tempoOcultarPainel) > 0 ? Number(config.tempoOcultarPainel) : 3500);
}

// Qualquer interação relevante reativa a interface
document.addEventListener("mousemove", resetarInterface);
document.addEventListener("mousedown", resetarInterface);
document.addEventListener("touchstart", resetarInterface);

/* =========================================================
   CONTROLE VISUAL DAS MÍDIAS
   ========================================================= */

/**
 * Mostra o vídeo atual e esconde a imagem.
 */
function mostrarVideo() {
  videoPlayer.style.opacity = 1;
  imagePlayer.style.opacity = 0;
}

/**
 * Mostra a imagem atual e esconde o vídeo.
 */
function mostrarImagem() {
  imagePlayer.style.opacity = 1;
  videoPlayer.style.opacity = 0;
}

/**
 * Faz fade out das mídias antes da próxima entrar.
 */
async function fadeOutMidias() {
  videoPlayer.style.opacity = 0;
  imagePlayer.style.opacity = 0;
  await sleep(getFadeDuration());
}

/**
 * Limpa estado da mídia anterior.
 */
function limparMidias() {
  clearTimeout(timerImagem);
  timerImagem = null;

  videoPlayer.pause();
  imagePlayer.removeAttribute("src");
}

/**
 * Pré - carrega / cacheia imagens presentes na playlist.
 *
 * Usa duas estratégias:
 * 1. Cache Storage, para permitir fallback offline via Service Worker;
 * 2. Image(), para aquecer o carregamento visual do navegador.
 *
 * Não cacheia vídeos automaticamente.
 */
async function preCarregarImagensDaPlaylist(lista) {
  if (!Array.isArray(lista) || !lista.length) return;

  const imagens = lista.filter((item) => {
    return item && item.tipo === "imagem" && item.arquivo;
  });

  if (!imagens.length) {
    debugMensagem("Nenhuma imagem encontrada para pré-cache.");
    return;
  }

  debugMensagem(`Preparando cache de ${imagens.length} imagem(ns) da playlist...`);

  const urlsUnicas = [...new Set(imagens.map((item) => item.arquivo))];

  /*
    Estratégia 1:
    tenta salvar no Cache Storage para uso offline real.
  */
  if ("caches" in window) {
    try {
      const cache = await caches.open("painel-ribas-player-4");

      await Promise.allSettled(
        urlsUnicas.map(async (url) => {
          try {
            const resposta = await fetch(url, {
              cache: "reload"
            });

            if (!resposta.ok) {
              throw new Error(`HTTP ${resposta.status}`);
            }

            await cache.put(url, resposta.clone());

            debugMensagem(`Imagem salva no cache offline: ${url}`);
          } catch (erro) {
            debugMensagem(`Falha ao salvar imagem no cache offline: ${url} | ${erro.message || erro}`);
          }
        })
      );
    } catch (erro) {
      debugMensagem(`Cache Storage indisponível ou falhou: ${erro.message || erro}`);
    }
  }

  /*
    Estratégia 2:
    também aquece o cache/memória visual do navegador.
  */
  urlsUnicas.forEach((url) => {
    const img = new Image();

    img.onload = () => {
      debugMensagem(`Imagem pré-carregada visualmente: ${url}`);
    };

    img.onerror = () => {
      debugMensagem(`Falha ao pré-carregar imagem visualmente: ${url}`);
    };

    img.src = url;
  });

  mostrarResumoCacheOfflinePlayer();

}

/* =========================================================
   PRÉ-CARREGAMENTO
   =========================================================
   Tenta deixar a próxima mídia mais pronta para reduzir
   travadas na troca.
   ========================================================= */

/**
 * Pré-carrega o próximo vídeo.
 *
 * Importante:
 * O vídeo de preload nunca deve tocar áudio.
 * Ele existe apenas para deixar o próximo arquivo mais pronto
 * para reprodução quando chegar a vez dele na playlist.
 */
function preCarregarProximoVideo() {
  if (!playlist.length) return;

  const proximoIndex = (indiceAtual + 1) % playlist.length;
  const proximo = playlist[proximoIndex];

  if (proximo && proximo.tipo === "video") {
    const proximoUrlAbsoluto = new URL(proximo.arquivo, window.location.href).href;

    /*
      Blindagem de segurança:
      mesmo que algum navegador tente ser "esperto",
      o preload fica sempre mutado e sem volume.
    */
    videoPreload.muted = true;
    videoPreload.volume = 0;
    videoPreload.pause();

    if (videoPreload.src !== proximoUrlAbsoluto) {
      videoPreload.src = proximo.arquivo;
      videoPreload.load();
    }
  }
}

/**
 * Pré-carrega a próxima imagem.
 */
function preCarregarProximaImagem() {
  if (!playlist.length) return;

  const proximoIndex = (indiceAtual + 1) % playlist.length;
  const proximo = playlist[proximoIndex];

  if (proximo && proximo.tipo === "imagem") {
    const img = new Image();
    img.src = proximo.arquivo;
  }
}

/**
 * Executa o pré-carregamento da próxima mídia.
 */
function preCarregarProximaMidia() {
  preCarregarProximoVideo();
  preCarregarProximaImagem();
}

/* =========================================================
   SPLASH INICIAL
   ========================================================= */

/**
 * Mostra a splash inicial.
 */
function mostrarSplash() {
  splashScreen.classList.remove("hidden");
  splashScreen.classList.add("visible");
}

/**
 * Esconde visualmente a splash.
 */
function esconderSplash() {
  splashScreen.classList.remove("visible");
}

/* =========================================================
   PREPARAÇÃO DA PRIMEIRA MÍDIA
   ========================================================= */

/**
 * Pré-carrega a primeira mídia da playlist antes do painel
 * ficar visível para o usuário.
 */
async function prepararPrimeiraMidiaDoCiclo() {
  if (!playlist.length) return;

  const primeiroItem = playlist[0];

  if (primeiroItem.tipo === "video") {
    return new Promise((resolve) => {
      videoPlayer.src = primeiroItem.arquivo;
      videoPlayer.load();

      const timeoutSeguranca = setTimeout(() => {
        resolve();
      }, 5000);

      const quandoPronto = () => {
        videoPlayer.removeEventListener("loadeddata", quandoPronto);
        clearTimeout(timeoutSeguranca);
        resolve();
      };

      videoPlayer.addEventListener("loadeddata", quandoPronto);
    });
  }

  if (primeiroItem.tipo === "imagem") {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = primeiroItem.arquivo;
    });
  }
}

/* =========================================================
   FALLBACK DE ERRO DE MÍDIA
   =========================================================
   Evita que o player fique travado quando uma mídia falha.

   Exemplos:
   - arquivo removido;
   - vídeo corrompido;
   - imagem inexistente;
   - rede oscilando;
   - cache local sem o arquivo solicitado.
   ========================================================= */

const TEMPO_AVANCAR_APOS_FALHA_MIDIA_MS = 1000;
const TEMPO_RETENTAR_APOS_TODAS_FALHAREM_MS = 30000;

let falhasSequenciaisDeMidia = 0;

/**
 * Deve ser chamado quando uma mídia começa a tocar/exibir com sucesso.
 */
function registrarMidiaExecutadaComSucesso() {
  falhasSequenciaisDeMidia = 0;
  esconderFallbackOperacionalPlayer();

  if (timerRetryFallbackPlayer) {
    clearTimeout(timerRetryFallbackPlayer);
    timerRetryFallbackPlayer = null;
  }
}

/**
 * Trata falha da mídia atual e tenta avançar para a próxima.
 *
 * Possui proteção para evitar loop infinito caso todas as mídias
 * da playlist estejam indisponíveis.
 */
function tratarFalhaMidiaAtual(motivo = "Falha ao abrir mídia.") {
  falhasSequenciaisDeMidia += 1;

  debugMensagem(`${motivo} Falhas sequenciais: ${falhasSequenciaisDeMidia}.`);

  if (timerImagem) {
    clearTimeout(timerImagem);
    timerImagem = null;
  }

  emTransicao = false;

  const totalMidias = Array.isArray(playlist) ? playlist.length : 0;

  if (totalMidias > 0 && falhasSequenciaisDeMidia >= totalMidias) {
    atualizarIndicadorConexao("erro", "Nenhuma mídia carregou.");
    atualizarStatus("Nenhuma mídia carregou. Tentando novamente em instantes...");

    mostrarFallbackOperacionalPlayer({
      icone: "fa-photo-film",
      titulo: "Nenhuma mídia carregou",
      mensagem: "Todas as mídias da playlist falharam ou estão indisponíveis no momento.",
      dica: "O player tentará novamente automaticamente. Verifique se os arquivos existem e se a rede está estável.",
      estado: "erro"
    });

    debugMensagem(
      "Todas as mídias da playlist falharam em sequência. Aguardando antes de tentar novamente."
    );

    setTimeout(() => {
      falhasSequenciaisDeMidia = 0;
      esconderFallbackOperacionalPlayer();
      proximoItem();
    }, TEMPO_RETENTAR_APOS_TODAS_FALHAREM_MS);

    return;
  }

  atualizarStatus("Falha ao abrir mídia, avançando...");

  setTimeout(() => {
    proximoItem();
  }, TEMPO_AVANCAR_APOS_FALHA_MIDIA_MS);
}

/* =========================================================
   REPRODUÇÃO DA MÍDIA ATUAL
   ========================================================= */

/**
 * Toca a mídia atual da playlist.
 * Mantém comportamento seguro:
 * se falhar, avança para a próxima.
 */
async function tocarItemAtual() {
  if (!playlist.length || emTransicao) return;

  emTransicao = true;

  const item = playlist[indiceAtual];

  if (!item || !item.tipo || !item.arquivo) {
    tratarFalhaMidiaAtual("Conteúdo inválido na playlist.");
    return;
  }

  if (primeiraInicializacaoConcluida) {
    await fadeOutMidias();
  }

  limparMidias();

  tipoAtual = item.tipo;
  atualizarStatus("Preparando conteúdo...");

  if (item.tipo === "video") {
    debugMensagem(`Mídia atual: vídeo | ${item.arquivo}`);
    atualizarStatus("Carregando vídeo...");

    let jaTentouIniciar = false;
    let timeoutSegurancaVideo = null;

    function removerEventosVideo() {
      videoPlayer.removeEventListener("loadedmetadata", tentarIniciarVideo);
      videoPlayer.removeEventListener("loadeddata", tentarIniciarVideo);
      videoPlayer.removeEventListener("canplay", tentarIniciarVideo);
      videoPlayer.removeEventListener("canplaythrough", tentarIniciarVideo);
      videoPlayer.removeEventListener("error", tratarErroVideo);
    }

    function tratarErroVideo() {
      removerEventosVideo();

      if (timeoutSegurancaVideo) {
        clearTimeout(timeoutSegurancaVideo);
      }

      const erroVideo = videoPlayer.error
        ? `Código do erro do vídeo: ${videoPlayer.error.code}`
        : "Erro desconhecido no vídeo.";

      tratarFalhaMidiaAtual(`Falha ao carregar vídeo. ${erroVideo}`);
    }

    function tentarIniciarVideo() {
      if (jaTentouIniciar) return;

      jaTentouIniciar = true;
      removerEventosVideo();

      if (timeoutSegurancaVideo) {
        clearTimeout(timeoutSegurancaVideo);
      }

      mostrarVideo();

      /*
      Política de áudio do player:

      - Por padrão, iniciamos mutado para garantir autoplay.
      - Se config.iniciarComSom = true, tentamos iniciar com som.
      - Se o navegador bloquear autoplay com som, fazemos fallback
        automático para mutado e tocamos mesmo assim.

      Isso preserva compatibilidade com Smart TVs e permite testar
      som automático em PCs configurados como quiosque.
    */
      const tentarComSom = somHabilitadoPeloUsuario === true;

      videoPlayer.muted = !tentarComSom;
      videoPlayer.volume = tentarComSom ? 1 : 0;

      debugMensagem(
        tentarComSom
          ? "Tentando executar videoPlayer.play() com som..."
          : "Tentando executar videoPlayer.play() mutado..."
      );

      debugEstadoVideo("Antes do play()");

      videoPlayer.play()
        .then(() => {

          registrarMidiaExecutadaComSucesso();

          debugMensagem("videoPlayer.play() executado com sucesso.");
          debugEstadoVideo("Depois do play()");

          atualizarBotaoSom();

          preCarregarProximaMidia();
          emTransicao = false;
          primeiraInicializacaoConcluida = true;
          atualizarTextoBotaoPlayPause();
        })
        .catch((erro) => {
          /*
            Se tentou com som e o navegador bloqueou, não avançamos a mídia.
            Fazemos fallback para mutado e tentamos tocar novamente.
          */
          if (tentarComSom) {
            debugMensagem(
              `Autoplay com som bloqueado ou falhou: ${erro && erro.message ? erro.message : erro}`
            );

            debugMensagem("Tentando fallback mutado...");

            somHabilitadoPeloUsuario = false;
            videoPlayer.muted = true;
            videoPlayer.volume = 0;
            atualizarBotaoSom();

            videoPlayer.play()
              .then(() => {
                registrarMidiaExecutadaComSucesso();

                debugMensagem("Fallback mutado executado com sucesso.");
                debugEstadoVideo("Depois do fallback mutado");

                preCarregarProximaMidia();
                emTransicao = false;
                primeiraInicializacaoConcluida = true;
                atualizarTextoBotaoPlayPause();
              })
              .catch((erroFallback) => {
                debugMensagem(
                  `Falha também no fallback mutado: ${erroFallback && erroFallback.message ? erroFallback.message : erroFallback}`
                );

                debugEstadoVideo("Falha ao tentar fallback mutado");
                tratarFalhaMidiaAtual("Falha ao executar vídeo mesmo no fallback mutado.");
              });

            return;
          }

          debugMensagem(`Falha no play(): ${erro && erro.message ? erro.message : erro}`);
          debugEstadoVideo("Falha ao tentar play()");
          tratarFalhaMidiaAtual("Falha ao executar vídeo.");
        });
    }

    videoPlayer.addEventListener("loadedmetadata", tentarIniciarVideo);
    videoPlayer.addEventListener("loadeddata", tentarIniciarVideo);
    videoPlayer.addEventListener("canplay", tentarIniciarVideo);
    videoPlayer.addEventListener("canplaythrough", tentarIniciarVideo);
    videoPlayer.addEventListener("error", tratarErroVideo);

    timeoutSegurancaVideo = setTimeout(() => {
      if (!jaTentouIniciar && tipoAtual === "video") {
        debugMensagem("Timeout de segurança acionado para iniciar vídeo.");
        tentarIniciarVideo();
      }
    }, 5000);

    /*
      Limpa o vídeo anterior antes de carregar o próximo.
      Isso ajuda navegadores de Smart TV.
    */
    videoPlayer.pause();
    videoPlayer.removeAttribute("src");
    videoPlayer.load();

    /*
    Define o estado inicial antes de carregar o arquivo.

    Se o modo com som estiver habilitado, carregamos já com som.
    Se não, mantemos mutado para compatibilidade com autoplay.
  */
    videoPlayer.muted = !somHabilitadoPeloUsuario;
    videoPlayer.volume = somHabilitadoPeloUsuario ? 1 : 0;

    videoPlayer.src = item.arquivo;
    videoPlayer.load();

    debugMensagem(`src definido: ${videoPlayer.src}`);
  } else if (item.tipo === "imagem") {
    const img = new Image();

    let imagemResolvida = false;

    const timeoutSegurancaImagem = setTimeout(() => {
      if (imagemResolvida) return;

      imagemResolvida = true;

      img.onload = null;
      img.onerror = null;

      tratarFalhaMidiaAtual("Timeout ao carregar imagem.");
    }, 8000);

    img.onload = () => {
      if (imagemResolvida) return;

      imagemResolvida = true;
      clearTimeout(timeoutSegurancaImagem);

      registrarMidiaExecutadaComSucesso();

      imagePlayer.src = item.arquivo;
      mostrarImagem();

      const duracao = Number(item.duracao) > 0 ? Number(item.duracao) : 8;

      timerImagem = setTimeout(() => {
        proximoItem();
      }, duracao * 1000);

      preCarregarProximaMidia();
      emTransicao = false;
      primeiraInicializacaoConcluida = true;
      atualizarTextoBotaoPlayPause();
    };

    img.onerror = () => {
      if (imagemResolvida) return;

      imagemResolvida = true;
      clearTimeout(timeoutSegurancaImagem);

      tratarFalhaMidiaAtual("Falha ao carregar imagem.");
    };

    img.src = item.arquivo;
  } else {
    tratarFalhaMidiaAtual("Tipo de mídia desconhecido na playlist.");
  }
}

/* =========================================================
   NAVEGAÇÃO ENTRE ITENS
   ========================================================= */

/**
 * Vai para o próximo item da playlist.
 */
async function proximoItem() {
  if (!playlist.length || emTransicao) return;

  indiceAtual = (indiceAtual + 1) % playlist.length;
  tocarItemAtual();
}

/**
 * Volta para o item anterior.
 */
function itemAnterior() {
  if (!playlist.length || emTransicao) return;

  indiceAtual = (indiceAtual - 1 + playlist.length) % playlist.length;
  tocarItemAtual();
}

/**
 * Define se o player deve tentar iniciar vídeos com som.
 *
 * Observação:
 * - Em Smart TVs e navegadores comuns, autoplay com som pode ser bloqueado.
 * - Em PCs configurados como quiosque, usando Chrome com política adequada,
 *   pode funcionar.
 */
function deveTentarIniciarComSom() {
  return config && config.iniciarComSom === true;
}

/* =========================================================
   ATUALIZAÇÃO VISUAL DOS BOTÕES
   ========================================================= */

/**
 * Atualiza texto e ícone do botão play/pause conforme o estado atual.
 */
function atualizarTextoBotaoPlayPause() {
  if (!btnPlayPause || !btnPlayPauseIcon || !btnPlayPauseText) return;

  const deveMostrarPausar =
    (tipoAtual === "video" && !videoPlayer.paused) ||
    (tipoAtual === "imagem" && !!timerImagem);

  if (deveMostrarPausar) {
    btnPlayPauseIcon.className = "fa-solid fa-pause";
    btnPlayPauseText.textContent = "Pausar";
    btnPlayPause.setAttribute("aria-label", "Pausar");
  } else {
    btnPlayPauseIcon.className = "fa-solid fa-play";
    btnPlayPauseText.textContent = "Reproduzir";
    btnPlayPause.setAttribute("aria-label", "Reproduzir");
  }
}

/**
 * Atualiza ícone e texto do botão de som.
 */
function atualizarBotaoSom() {
  if (!btnMute || !btnMuteIcon || !btnMuteText) return;

  if (somHabilitadoPeloUsuario && !videoPlayer.muted) {
    btnMuteIcon.className = "fa-solid fa-volume-high";
    btnMuteText.textContent = "Som ligado";
    btnMute.setAttribute("aria-label", "Som ligado");
  } else {
    btnMuteIcon.className = "fa-solid fa-volume-xmark";
    btnMuteText.textContent = "Som desligado";
    btnMute.setAttribute("aria-label", "Som desligado");
  }
}

/**
 * Atualiza ícone e texto do botão de tela cheia.
 */
function estaEmTelaCheia() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

function atualizarBotaoFullscreen() {
  if (!btnFullscreen || !btnFullscreenIcon || !btnFullscreenText) return;

  if (estaEmTelaCheia()) {
    btnFullscreenIcon.className = "fa-solid fa-compress";
    btnFullscreenText.textContent = "Sair da tela cheia";
    btnFullscreen.setAttribute("aria-label", "Sair da tela cheia");
  } else {
    btnFullscreenIcon.className = "fa-solid fa-expand";
    btnFullscreenText.textContent = "Tela cheia";
    btnFullscreen.setAttribute("aria-label", "Tela cheia");
  }
}

/* =========================================================
   CONTROLES MANUAIS
   ========================================================= */

/**
 * Alterna entre play e pause da mídia atual.
 */
function alternarPlayPause() {
  if (!playlist.length) return;

  if (tipoAtual === "video") {
    if (videoPlayer.paused) {
      videoPlayer.play().then(() => {
        atualizarTextoBotaoPlayPause();
      }).catch(() => {
        atualizarStatus("Não foi possível reproduzir este conteúdo.");
      });
    } else {
      videoPlayer.pause();
      atualizarTextoBotaoPlayPause();
    }
  } else if (tipoAtual === "imagem") {
    if (timerImagem) {
      clearTimeout(timerImagem);
      timerImagem = null;
      atualizarStatus("Exibição pausada.");
    } else {
      const item = playlist[indiceAtual];
      const duracao = Number(item.duracao) > 0 ? Number(item.duracao) : 8;

      timerImagem = setTimeout(() => {
        proximoItem();
      }, duracao * 1000);

      atualizarStatus("Exibição retomada.");
    }

    atualizarTextoBotaoPlayPause();
  }
}

/**
 * Liga ou desliga o som manualmente.
 */
function alternarSom() {
  somHabilitadoPeloUsuario = !somHabilitadoPeloUsuario;

  videoPlayer.muted = !somHabilitadoPeloUsuario;
  videoPlayer.volume = somHabilitadoPeloUsuario ? 1 : 0;

  atualizarBotaoSom();

  debugMensagem(
    somHabilitadoPeloUsuario
      ? "Som ativado pelo usuário."
      : "Som desativado pelo usuário."
  );

  debugEstadoVideo("Após alternar som");

  atualizarStatus(
    somHabilitadoPeloUsuario
      ? "Som ativado."
      : "Som desativado."
  );
}

/* =========================================================
   TELA CHEIA
   ========================================================= */

/**
 * Alterna modo tela cheia.
 * Em navegador mobile pode depender de suporte do browser.
 */
async function alternarFullscreen() {
  try {
    const elemento = document.documentElement;

    if (!estaEmTelaCheia()) {
      const requestFullscreen =
        elemento.requestFullscreen ||
        elemento.webkitRequestFullscreen ||
        elemento.msRequestFullscreen;

      if (requestFullscreen) {
        await requestFullscreen.call(elemento);
      } else {
        throw new Error("Fullscreen API não disponível.");
      }
    } else {
      const exitFullscreen =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen;

      if (exitFullscreen) {
        await exitFullscreen.call(document);
      } else {
        throw new Error("Exit fullscreen não disponível.");
      }
    }
  } catch (erro) {
    debugMensagem(`Falha ao alternar tela cheia: ${erro.message || erro}`);
    atualizarStatus("Tela cheia não disponível neste navegador.");
  }

  atualizarBotaoFullscreen();
}

/* =========================================================
   MODO RESPONSIVO / ORIENTAÇÃO
   ========================================================= */

/**
 * Retorna true se a tela for considerada pequena
 * (tablet/celular).
 */
function isSmallScreen() {
  return window.innerWidth <= 1024;
}

/**
 * Retorna true se o dispositivo estiver em retrato.
 */
function isPortrait() {
  return window.innerHeight > window.innerWidth;
}

/**
 * Atualiza classes e comportamento visual para
 * mobile/tablet conforme tamanho/orientação.
 */
function atualizarModoResponsivo() {
  const mobile = isSmallScreen();

  document.body.classList.toggle("mobile-mode", mobile);

  // Quando sai do retrato, resetamos o dismiss
  if (!isPortrait()) {
    rotateNoticeDismissed = false;
  }

  if (mobile && isPortrait() && !rotateNoticeDismissed) {
    rotateNotice.classList.remove("hidden");
  } else {
    rotateNotice.classList.add("hidden");
  }
}

/* =========================================================
   INICIALIZAÇÃO DO SISTEMA
   ========================================================= */

/**
 * Fluxo principal:
 * 1. carrega config
 * 2. inicia relógio
 * 3. carrega playlist
 * 4. mostra splash
 * 5. prepara primeira mídia
 * 6. toca primeira mídia
 * 7. esconde splash
 * 8. ativa interface e responsividade
 */
async function iniciarSistema() {
  try {
    await carregarConfig();
    registrarServiceWorkerPlayer();
    iniciarRelogio();
    await carregarPlaylist();

    const tempoMinimoSplash = Number(config.tempoMinimoSplash) > 0
      ? Number(config.tempoMinimoSplash)
      : 4000;

    esconderControlesTemporariamente();
    esconderCursor();
    mostrarSplash();

    await Promise.all([
      prepararPrimeiraMidiaDoCiclo(),
      sleep(tempoMinimoSplash)
    ]);

    /*
    Define o estado inicial de áudio.

    Por padrão, o sistema continua seguro para autoplay mutado.
    Quando config.iniciarComSom = true, tentamos iniciar com som,
    útil para PCs em modo quiosque.
  */
    somHabilitadoPeloUsuario = deveTentarIniciarComSom();

    videoPlayer.muted = !somHabilitadoPeloUsuario;
    videoPlayer.volume = somHabilitadoPeloUsuario ? 1 : 0;

    atualizarBotaoSom();
    atualizarBotaoFullscreen();

    tocarItemAtual();

    await sleep(150);

    esconderSplash();
    await sleep(800);
    splashScreen.classList.add("hidden");

    atualizarModoResponsivo();
    resetarInterface();
  } catch (erro) {
    console.error(erro);
    debugMensagem(`Erro ao iniciar o painel: ${erro.message || erro}`);
    atualizarStatus("Erro ao iniciar o painel.");

    /*
      Se a inicialização falhar, escondemos a splash para evitar
      a sensação de travamento eterno e mostramos uma tela operacional.
    */
    esconderSplash();

    setTimeout(() => {
      if (splashScreen) {
        splashScreen.classList.add("hidden");
      }
    }, 900);

    atualizarIndicadorConexao(
      navigator.onLine === false ? "offline" : "erro",
      navigator.onLine === false
        ? "Sem conexão. Aguardando conteúdo local."
        : "Não foi possível iniciar o player."
    );

    mostrarFallbackOperacionalPlayer({
      icone: navigator.onLine === false ? "fa-wifi-slash" : "fa-triangle-exclamation",
      titulo: "Player aguardando conteúdo",
      mensagem: erro && erro.message
        ? erro.message
        : "Não foi possível carregar a playlist ou a primeira mídia.",
      dica: "O sistema tentará novamente automaticamente. Verifique servidor, rede e playlist.",
      estado: navigator.onLine === false ? "offline" : "erro"
    });

    agendarRetryFallbackPlayer(30000);
  }
}

/* =========================================================
   EVENTOS DO PLAYER
   ========================================================= */

videoPlayer.addEventListener("ended", proximoItem);

videoPlayer.addEventListener("error", () => {
  /*
    Durante a transição, o erro já é tratado pelos listeners
    específicos criados dentro de tocarItemAtual().
    Evitamos avançar duas vezes.
  */
  if (emTransicao) return;

  tratarFalhaMidiaAtual("Falha inesperada ao carregar vídeo.");
});

videoPlayer.addEventListener("stalled", () => {
  /*
    stalled pode acontecer quando a rede oscila no meio do vídeo.
    Se não estamos em transição, tratamos como mídia indisponível.
  */
  if (emTransicao) return;

  tratarFalhaMidiaAtual("Vídeo travou ou ficou indisponível.");
});

videoPlayer.addEventListener("waiting", () => {
  atualizarStatus("Preparando conteúdo...");
});

videoPlayer.addEventListener("playing", () => {
  atualizarTextoBotaoPlayPause();
});

videoPlayer.addEventListener("pause", () => {
  atualizarTextoBotaoPlayPause();
});

/* =========================================================
   EVENTOS DE DIAGNÓSTICO DO PLAYER
   =========================================================
   Estes eventos ajudam a entender o que a Smart TV está fazendo.
   Eles só aparecem na tela quando a URL tem ?debug=1.
   ========================================================= */
[
  "loadstart",
  "loadedmetadata",
  "loadeddata",
  "durationchange",
  "canplay",
  "canplaythrough",
  "play",
  "playing",
  "pause",
  "waiting",
  "stalled",
  "suspend",
  "progress",
  "emptied",
  "abort",
  "error",
  "ended",
  "volumechange"
].forEach((evento) => {
  videoPlayer.addEventListener(evento, () => {
    debugMensagem(`EVENTO VIDEO: ${evento}`);

    if (
      evento === "playing" ||
      evento === "pause" ||
      evento === "volumechange" ||
      evento === "error" ||
      evento === "ended"
    ) {
      debugEstadoVideo(`Evento ${evento}`);
    }

    atualizarTextoBotaoPlayPause();
    atualizarBotaoSom();
  });
});

/* =========================================================
   EVENTOS DOS BOTÕES
   ========================================================= */

btnPrev.addEventListener("click", () => {
  aplicarFeedbackNoBotao(btnPrev);
  itemAnterior();
});

btnPlayPause.addEventListener("click", () => {
  aplicarFeedbackNoBotao(btnPlayPause);

  /*
    Em Smart TV, o clique/OK do usuário é uma interação válida.
    Aproveitamos essa interação para liberar áudio.
  */
  somHabilitadoPeloUsuario = true;
  videoPlayer.muted = false;
  videoPlayer.volume = 1;
  atualizarBotaoSom();

  alternarPlayPause();

  setTimeout(() => {
    atualizarTextoBotaoPlayPause();
    atualizarBotaoSom();
  }, 150);
});

btnNext.addEventListener("click", () => {
  aplicarFeedbackNoBotao(btnNext);
  proximoItem();
});

btnMute.addEventListener("click", () => {
  aplicarFeedbackNoBotao(btnMute);
  alternarSom();
});

btnFullscreen.addEventListener("click", () => {
  aplicarFeedbackNoBotao(btnFullscreen);
  alternarFullscreen();
});

btnDismissRotate.addEventListener("click", () => {
  rotateNoticeDismissed = true;
  rotateNotice.classList.add("hidden");
});

if (btnRetryPlayer) {
  btnRetryPlayer.addEventListener("click", () => {
    aplicarFeedbackNoBotao(btnRetryPlayer);
    tentarRecuperarPlayerAposFalha();
  });
}

/* =========================================================
   EVENTOS DE FULLSCREEN / ORIENTAÇÃO
   ========================================================= */

document.addEventListener("fullscreenchange", atualizarBotaoFullscreen);
document.addEventListener("webkitfullscreenchange", atualizarBotaoFullscreen);
document.addEventListener("msfullscreenchange", atualizarBotaoFullscreen);
window.addEventListener("resize", atualizarModoResponsivo);
window.addEventListener("orientationchange", atualizarModoResponsivo);


/* =========================================================
   SINCRONIZAÇÃO SILENCIOSA DA PLAYLIST
   =========================================================
   Atualiza a playlist sem reiniciar sempre do primeiro item.

   Comportamento:
   - se a mídia atual ainda existir, mantém o índice nela;
   - se a mídia atual saiu da playlist, vai para o próximo item válido;
   - evita interromper o conteúdo atual sem necessidade.
   ========================================================= */

/**
 * Retorna uma chave estável para comparar mídias.
 * Preferimos o caminho do arquivo, pois ele identifica a mídia real.
 */
function obterChaveMidia(item) {
  return item && item.arquivo
    ? String(item.arquivo)
    : "";
}

/**
 * Atualiza a playlist em memória tentando preservar a mídia atual.
 */
function sincronizarPlaylistSemReiniciar(novaPlaylist) {
  if (!Array.isArray(novaPlaylist) || novaPlaylist.length === 0) {
    debugMensagem("Nova playlist vazia ou inválida. Mantendo playlist atual.");
    return;
  }

  const itemAtual = playlist[indiceAtual];
  const chaveAtual = obterChaveMidia(itemAtual);

  playlist = novaPlaylist;

  preCarregarImagensDaPlaylist(novaPlaylist);

  const novoIndiceDoItemAtual = playlist.findIndex((item) => {
    return obterChaveMidia(item) === chaveAtual;
  });

  if (novoIndiceDoItemAtual >= 0) {
    indiceAtual = novoIndiceDoItemAtual;
    atualizarStatus("Playlist atualizada.");
    debugMensagem(`Playlist atualizada mantendo item atual no índice ${indiceAtual}.`);
    preCarregarProximaMidia();
    return;
  }

  /*
    Se o item atual não existe mais, escolhemos um índice seguro.
    Aqui usamos o índice atual se ainda couber na nova playlist;
    senão voltamos para zero.
  */
  if (indiceAtual >= playlist.length) {
    indiceAtual = 0;
  }

  atualizarStatus("Playlist atualizada. Avançando conteúdo...");
  debugMensagem("Item atual não existe mais na playlist. Avançando para item válido.");

  tocarItemAtual();
}

/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA DA PLAYLIST
   =========================================================
   Verifica periodicamente se o playlist.json mudou.
   ========================================================= */
const INTERVALO_SINCRONIZACAO_PLAYLIST_MS = 5 * 1000;

let playerEstaOnline = navigator.onLine !== false;
let sincronizacaoPlaylistEmAndamento = false;

/**
 * Sincroniza a playlist com o servidor quando houver conexão.
 *
 * Se o navegador estiver offline, não tenta buscar o servidor.
 * Isso evita erro repetido no console e mantém o player rodando
 * com a playlist atual/local.
 */
async function sincronizarPlaylistRemotaSePossivel() {
  if (!playerEstaOnline) {
    if (playlistEhValida(playlist)) {
      atualizarIndicadorConexao("offline", "Sem conexão. Mantendo conteúdo atual.");
    }

    return;
  }

  if (sincronizacaoPlaylistEmAndamento) {
    return;
  }

  sincronizacaoPlaylistEmAndamento = true;

  try {
    const novaPlaylist = await buscarPlaylistRemota();

    if (estadoConexaoPlayer !== "online") {
      atualizarIndicadorConexao("online", "Conexão restabelecida.");
    }

    if (JSON.stringify(novaPlaylist) !== JSON.stringify(playlist)) {
      sincronizarPlaylistSemReiniciar(novaPlaylist);
    }
  } catch (erro) {
    console.warn("Erro ao atualizar playlist. Mantendo playlist atual:", erro);

    playerEstaOnline = navigator.onLine !== false;

    if (playlistEhValida(playlist)) {
      atualizarIndicadorConexao("offline", "Sem conexão. Mantendo conteúdo atual.");
    }
  } finally {
    sincronizacaoPlaylistEmAndamento = false;
  }
}

setInterval(() => {
  sincronizarPlaylistRemotaSePossivel();
}, INTERVALO_SINCRONIZACAO_PLAYLIST_MS);

window.addEventListener("offline", () => {
  playerEstaOnline = false;

  atualizarIndicadorConexao("offline", "Sem conexão. Mantendo conteúdo atual.");
  debugMensagem("Navegador entrou em modo offline. Sincronização remota pausada.");
});

window.addEventListener("online", () => {
  playerEstaOnline = true;

  atualizarIndicadorConexao("online", "Conexão restabelecida.");
  debugMensagem("Navegador voltou ao modo online. Sincronizando playlist...");

  sincronizarPlaylistRemotaSePossivel();
});

/* =========================================================
   TECLADO / CONTROLE REMOTO
   =========================================================
   Muitas TVs e navegadores enviam botões do controle
   como eventos de teclado / media keys.
   ========================================================= */
document.addEventListener("keydown", (event) => {
  const tecla = event.key;
  const codigo = event.keyCode || event.which;

  resetarInterface();

  // Play / Pause
  const ehPlayPause =
    tecla === "Enter" ||
    tecla === " " ||
    tecla === "Spacebar" ||
    tecla === "MediaPlayPause" ||
    codigo === 13 ||
    codigo === 32 ||
    codigo === 179 ||
    codigo === 415;

  if (ehPlayPause) {
    event.preventDefault();
    aplicarFeedbackNoBotao(btnPlayPause);
    alternarPlayPause();

    somHabilitadoPeloUsuario = true;
    videoPlayer.muted = false;
    videoPlayer.volume = 1;
    atualizarBotaoSom();
    return;
  }

  // Próximo item
  const ehProximo =
    tecla === "ArrowRight" ||
    tecla === "MediaTrackNext" ||
    codigo === 39 ||
    codigo === 176 ||
    codigo === 417;

  if (ehProximo) {
    event.preventDefault();
    aplicarFeedbackNoBotao(btnNext);
    proximoItem();
    return;
  }

  // Item anterior
  const ehAnterior =
    tecla === "ArrowLeft" ||
    tecla === "MediaTrackPrevious" ||
    codigo === 37 ||
    codigo === 177 ||
    codigo === 412;

  if (ehAnterior) {
    event.preventDefault();
    aplicarFeedbackNoBotao(btnPrev);
    itemAnterior();
    return;
  }

  // Mostrar barra
  if (tecla === "ArrowUp" || codigo === 38) {
    event.preventDefault();
    mostrarControlesTemporariamente();
    return;
  }

  // Esconder barra
  if (tecla === "ArrowDown" || codigo === 40) {
    event.preventDefault();
    esconderControlesTemporariamente();
    return;
  }

  // Mute pelo teclado
  if (tecla === "m" || tecla === "M") {
    event.preventDefault();
    aplicarFeedbackNoBotao(btnMute);
    alternarSom();
  }
});

/* =========================================================
   CACHE OFFLINE - INSPEÇÃO E MANUTENÇÃO
   ========================================================= */

const PLAYER_CACHE_NAME = "painel-ribas-player-cache-v4";

/**
 * Lista os itens atualmente salvos no Cache Storage do player.
 */
async function listarItensCacheOfflinePlayer() {
  if (!("caches" in window)) {
    debugMensagem("Cache Storage não disponível neste navegador.");
    return [];
  }

  try {
    const cache = await caches.open(PLAYER_CACHE_NAME);
    const requests = await cache.keys();

    return requests.map((request) => {
      return request.url;
    });
  } catch (erro) {
    debugMensagem(`Falha ao listar cache offline: ${erro.message || erro}`);
    return [];
  }
}

/**
 * Mostra no debug um resumo do cache offline atual.
 */
async function mostrarResumoCacheOfflinePlayer() {
  const itens = await listarItensCacheOfflinePlayer();

  const imagens = itens.filter((url) => {
    return /\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(url);
  });

  const videos = itens.filter((url) => {
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
  });

  const resumo = {
    total: itens.length,
    imagens: imagens.length,
    videos: videos.length,
    itens
  };

  debugMensagem(
    `Cache offline: ${resumo.total} item(ns) | ${resumo.imagens} imagem(ns) | ${resumo.videos} vídeo(s).`
  );

  console.log("Resumo do cache offline do player:", resumo);

  if (itens.length) {
    console.table(itens.map((url) => ({ url })));
  }

  return resumo;
}

/**
 * Limpa o cache offline do player.
 *
 * Útil em testes, manutenção ou quando algum arquivo antigo
 * ficou preso no cache.
 */
async function limparCacheOfflinePlayer() {
  if (!("caches" in window)) {
    debugMensagem("Cache Storage não disponível neste navegador.");
    return false;
  }

  try {
    await caches.delete(PLAYER_CACHE_NAME);
    debugMensagem("Cache offline do player limpo com sucesso.");

    atualizarIndicadorConexao("online", "Cache offline limpo.");
    return true;
  } catch (erro) {
    debugMensagem(`Falha ao limpar cache offline: ${erro.message || erro}`);
    return false;
  }
}

/*
  Funções expostas para suporte técnico em modo debug/console.

  Exemplos no console:
  - PainelOffline.mostrarResumo()
  - PainelOffline.limparCache()
*/
window.PainelOffline = {
  mostrarResumo: mostrarResumoCacheOfflinePlayer,
  limparCache: limparCacheOfflinePlayer,
  listarItens: listarItensCacheOfflinePlayer
};

/* =========================================================
   SERVICE WORKER / OFFLINE BÁSICO
   ========================================================= */

/**
 * Registra o Service Worker do player.
 *
 * Ele permite cache controlado de imagens da playlist para melhorar
 * o comportamento quando a rede cair.
 */
function registrarServiceWorkerPlayer() {
  if (!("serviceWorker" in navigator)) {
    debugMensagem("Service Worker não disponível neste navegador.");
    return;
  }

  navigator.serviceWorker.register("/sw-player.js", {
    updateViaCache: "none"
  })
    .then((registro) => {
      debugMensagem(`Service Worker registrado: ${registro.scope}`);
    })
    .catch((erro) => {
      debugMensagem(`Falha ao registrar Service Worker: ${erro.message || erro}`);
    });
}

/* =========================================================
   START
   ========================================================= */
iniciarSistema();