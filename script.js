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
  const resposta = await fetch(`config.json?v=${Date.now()}`);

  if (!resposta.ok) {
    throw new Error(`Erro ao carregar config: ${resposta.status}`);
  }

  config = await resposta.json();
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

  if (item.tipo === "video") {
    videoPlayer.src = item.arquivo;
    videoPlayer.load();

    const aoCarregar = () => {
      videoPlayer.removeEventListener("loadeddata", aoCarregar);

      mostrarVideo();

      videoPlayer.play()
        .then(() => {
          preCarregarProximaMidia();
          emTransicao = false;
          primeiraInicializacaoConcluida = true;
          atualizarTextoBotaoPlayPause();
        })
        .catch(() => {
          atualizarStatus("Falha ao abrir mídia, avançando...");
          emTransicao = false;
          setTimeout(proximoItem, 1000);
        });
    };

    videoPlayer.addEventListener("loadeddata", aoCarregar);
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

  if (tipoAtual === "video") {
    if (videoPlayer.paused) {
      btnPlayPauseIcon.className = "fa-solid fa-play";
      btnPlayPauseText.textContent = "Reproduzir";
    } else {
      btnPlayPauseIcon.className = "fa-solid fa-pause";
      btnPlayPauseText.textContent = "Pausar";
    }
  } else if (tipoAtual === "imagem") {
    if (timerImagem) {
      btnPlayPauseIcon.className = "fa-solid fa-pause";
      btnPlayPauseText.textContent = "Pausar";
    } else {
      btnPlayPauseIcon.className = "fa-solid fa-play";
      btnPlayPauseText.textContent = "Reproduzir";
    }
  } else {
    btnPlayPauseIcon.className = "fa-solid fa-play";
    btnPlayPauseText.textContent = "Reproduzir";
  }
}

/**
 * Atualiza ícone e texto do botão de som.
 */
function atualizarBotaoSom() {
  if (!btnMute || !btnMuteIcon || !btnMuteText) return;

  if (somHabilitadoPeloUsuario) {
    btnMuteIcon.className = "fa-solid fa-volume-high";
    btnMuteText.textContent = "Som ligado";
  } else {
    btnMuteIcon.className = "fa-solid fa-volume-xmark";
    btnMuteText.textContent = "Som desligado";
  }
}

/**
 * Atualiza ícone e texto do botão de tela cheia.
 */
function atualizarBotaoFullscreen() {
  if (!btnFullscreen || !btnFullscreenIcon || !btnFullscreenText) return;

  const emFullscreen = !!document.fullscreenElement;

  if (emFullscreen) {
    btnFullscreenIcon.className = "fa-solid fa-compress";
    btnFullscreenText.textContent = "Sair da tela cheia";
  } else {
    btnFullscreenIcon.className = "fa-solid fa-expand";
    btnFullscreenText.textContent = "Tela cheia";
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

  atualizarBotaoSom();

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
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (erro) {
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
   EVENTOS DOS BOTÕES
   ========================================================= */

btnPrev.addEventListener("click", () => {
  aplicarFeedbackNoBotao(btnPrev);
  itemAnterior();
});

btnPlayPause.addEventListener("click", () => {
  aplicarFeedbackNoBotao(btnPlayPause);
  alternarPlayPause();
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
window.addEventListener("resize", atualizarModoResponsivo);
window.addEventListener("orientationchange", atualizarModoResponsivo);

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
      playlist = novaPlaylist;
      indiceAtual = 0;
      atualizarStatus("Conteúdo atualizado.");
      tocarItemAtual();
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