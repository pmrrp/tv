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

// Fallback de mídia
const mediaFallback = document.getElementById("mediaFallback");

// Caixa de status / mensagens rápidas
const statusBox = document.getElementById("status");

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

/**
 * Carrega o arquivo playlist.json.
 */
async function carregarPlaylist() {
  debugMensagem("Carregando playlist.json...");
  const resposta = await fetch(`playlist.json?v=${Date.now()}`);

  if (!resposta.ok) {
    throw new Error(`Erro HTTP ao carregar playlist: ${resposta.status}`);
  }

  const dados = await resposta.json();

  if (!Array.isArray(dados) || dados.length === 0) {
    throw new Error("A playlist está vazia.");
  }

  playlist = dados;
  indiceAtual = 0;
  debugMensagem(`playlist.json carregado. Total de itens: ${playlist.length}`);
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
FALLBACK DE MÍDIA
========================================================= */

/**
 * Mostra o fallback de carregamento.
 */
function mostrarFallbackMidia(texto = "Carregando a próxima mídia...") {
  if (!mediaFallback) return;

  const textoFallback = mediaFallback.querySelector("span");

  if (textoFallback) {
    textoFallback.textContent = texto;
  }

  mediaFallback.classList.remove("hidden");
}

function esconderFallbackMidia() {
  if (!mediaFallback) return;

  mediaFallback.classList.add("hidden");
}

/* =========================================================
   CONTROLE VISUAL DAS MÍDIAS
   ========================================================= */

/**
 * Mostra o vídeo atual e esconde a imagem.
 */
function mostrarVideo() {
  esconderFallbackMidia();
  videoPlayer.style.opacity = 1;
  imagePlayer.style.opacity = 0;
}

/**
 * Mostra a imagem atual e esconde o vídeo.
 */
function mostrarImagem() {
  esconderFallbackMidia();
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

/* =========================================================
   PRÉ-CARREGAMENTO
   =========================================================
   Tenta deixar a próxima mídia mais pronta para reduzir
   travadas na troca.
   ========================================================= */

/**
 * Pré-carrega o próximo vídeo.
 */
function preCarregarProximoVideo() {
  if (!playlist.length) return;

  const proximoIndex = (indiceAtual + 1) % playlist.length;
  const proximo = playlist[proximoIndex];

  if (proximo && proximo.tipo === "video") {
    const proximoUrlAbsoluto = new URL(proximo.arquivo, window.location.href).href;

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
    atualizarStatus("Conteúdo inválido, avançando...");
    emTransicao = false;
    setTimeout(proximoItem, 1000);
    return;
  }

  if (primeiraInicializacaoConcluida) {
    await fadeOutMidias();
  }

  limparMidias();

  tipoAtual = item.tipo;
  atualizarStatus("Preparando conteúdo...");

  mostrarFallbackMidia("Preparando próxima mídia...");

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
        IMPORTANTE PARA SMART TV:
        muitos navegadores de TV bloqueiam autoplay quando o vídeo
        começa com áudio. Então iniciamos MUTADO e, após o play()
        ser aceito, tentamos religar o som se o usuário já havia
        ativado som anteriormente.
      */
      videoPlayer.muted = true;

      debugMensagem("Tentando executar videoPlayer.play()...");
      debugEstadoVideo("Antes do play()");

      videoPlayer.play()
        .then(() => {
          debugMensagem("videoPlayer.play() executado com sucesso.");
          debugEstadoVideo("Depois do play()");

          if (somHabilitadoPeloUsuario) {
            setTimeout(() => {
              try {
                videoPlayer.muted = false;
                videoPlayer.volume = 1;
                debugMensagem("Som religado após o vídeo iniciar.");
                atualizarBotaoSom();
                debugEstadoVideo("Depois de religar o som");
              } catch (erro) {
                debugMensagem(`Falha ao religar som: ${erro.message || erro}`);
              }
            }, 400);
          }

          preCarregarProximaMidia();
          emTransicao = false;
          primeiraInicializacaoConcluida = true;
          atualizarTextoBotaoPlayPause();
        })
        .catch((erro) => {
          debugMensagem(`Falha no play(): ${erro && erro.message ? erro.message : erro}`);
          debugEstadoVideo("Falha ao tentar play()");
          atualizarStatus("Falha ao abrir mídia, avançando...");
          emTransicao = false;
          setTimeout(proximoItem, 1000);
        });
    }

    videoPlayer.addEventListener("loadedmetadata", tentarIniciarVideo);
    videoPlayer.addEventListener("loadeddata", tentarIniciarVideo);
    videoPlayer.addEventListener("canplay", tentarIniciarVideo);
    videoPlayer.addEventListener("canplaythrough", tentarIniciarVideo);

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

    videoPlayer.muted = true;
    videoPlayer.src = criarUrlComCacheBuster(item.arquivo);
    videoPlayer.load();

    debugMensagem(`src definido: ${videoPlayer.src}`);
  } else if (item.tipo === "imagem") {
    const img = new Image();

    img.onload = () => {
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
      mostrarFallbackMidia("Falha ao carregar. Avançando conteúdo...");
      atualizarStatus("Falha ao abrir mídia, avançando...");
      emTransicao = false;
      setTimeout(proximoItem, 1000);
    };

    img.src = item.arquivo;
  } else {
    atualizarStatus("Tipo de mídia desconhecido, avançando...");
    emTransicao = false;
    setTimeout(proximoItem, 1000);
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
        mostrarFallbackMidia("Falha ao carregar. Avançando conteúdo...");
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

  atualizarBotaoSom();
  debugMensagem(somHabilitadoPeloUsuario ? "Som ativado pelo usuário." : "Som desativado pelo usuário.");
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

    videoPlayer.muted = !somHabilitadoPeloUsuario;
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
  }
}

/* =========================================================
   EVENTOS DO PLAYER
   ========================================================= */

videoPlayer.addEventListener("ended", proximoItem);

videoPlayer.addEventListener("error", () => {
  atualizarStatus("Falha ao carregar mídia, avançando...");
  setTimeout(proximoItem, 1000);
});

videoPlayer.addEventListener("stalled", () => {
  atualizarStatus("Conteúdo indisponível no momento, avançando...");
  setTimeout(proximoItem, 1000);
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
setInterval(async () => {
  try {
    const resposta = await fetch(`playlist.json?v=${Date.now()}`);

    if (!resposta.ok) return;

    const novaPlaylist = await resposta.json();

    if (JSON.stringify(novaPlaylist) !== JSON.stringify(playlist)) {
      sincronizarPlaylistSemReiniciar(novaPlaylist);
    }
  } catch (erro) {
    console.error("Erro ao atualizar playlist:", erro);
  }
}, 30000);

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
   START
   ========================================================= */
iniciarSistema();