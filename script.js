/* =========================================================
   ELEMENTOS PRINCIPAIS DA INTERFACE
   ========================================================= */

// Players de mídia
const videoPlayer = document.getElementById("videoPlayer");
const videoPreload = document.getElementById("videoPreload");
const imagePlayer = document.getElementById("imagePlayer");

// Status
const statusBox = document.getElementById("status");

// Splash inicial
const splashScreen = document.getElementById("splashScreen");
const splashWallpaper = document.getElementById("splashWallpaper");

// Barra lateral
const sidePanel = document.getElementById("sidePanel");
const controls = document.getElementById("controls");

// Relógio
const sidebarClockTime = document.getElementById("sidebarClockTime");
const sidebarClockDate = document.getElementById("sidebarClockDate");

// Botões
const btnPlayPause = document.getElementById("btnPlayPause");
const btnNext = document.getElementById("btnNext");
const btnPrev = document.getElementById("btnPrev");
const btnMute = document.getElementById("btnMute");
const btnFullscreen = document.getElementById("btnFullscreen");

// Conteúdo interno dos botões
const btnPlayPauseIcon = btnPlayPause ? btnPlayPause.querySelector("i") : null;
const btnPlayPauseText = btnPlayPause ? btnPlayPause.querySelector("span") : null;

const btnMuteIcon = btnMute ? btnMute.querySelector("i") : null;
const btnMuteText = btnMute ? btnMute.querySelector("span") : null;

const btnFullscreenIcon = btnFullscreen ? btnFullscreen.querySelector("i") : null;
const btnFullscreenText = btnFullscreen ? btnFullscreen.querySelector("span") : null;

// Aviso de rotação
const rotateNotice = document.getElementById("rotateNotice");
const btnDismissRotate = document.getElementById("btnDismissRotate");

/* =========================================================
   ESTADO DA APLICAÇÃO
   ========================================================= */

let config = {};
let playlist = [];
let indiceAtual = 0;
let tipoAtual = null;

let timerImagem = null;
let timerStatus = null;
let timerInterface = null;

let emTransicao = false;
let primeiraInicializacaoConcluida = false;
let somHabilitadoPeloUsuario = false;

// Controle do aviso de rotação
let rotateNoticeDismissed = false;

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getFadeDuration() {
  return Number(config.duracaoFadeMidia) > 0
    ? Number(config.duracaoFadeMidia)
    : 600;
}

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
   STATUS
   ========================================================= */

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

async function carregarConfig() {
  const resposta = await fetch(`config.json?v=${Date.now()}`);

  if (!resposta.ok) {
    throw new Error(`Erro ao carregar config: ${resposta.status}`);
  }

  config = await resposta.json();
  aplicarConfig();
}

function aplicarConfig() {
  if (config.wallpaperInicial) {
    splashWallpaper.src = config.wallpaperInicial;
  }

  if (!config.mostrarStatus) {
    statusBox.classList.add("hidden");
  } else {
    statusBox.classList.remove("hidden");
  }

  sidePanel.classList.toggle("hidden", !config.mostrarControles);
  sidePanel.classList.add("controls-hidden");
  sidePanel.classList.remove("panel-open");
}

/* =========================================================
   RELÓGIO
   ========================================================= */

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
   ========================================================= */

function mostrarCursor() {
  document.body.classList.remove("cursor-hidden");
}

function esconderCursor() {
  document.body.classList.add("cursor-hidden");
}

function mostrarControlesTemporariamente() {
  sidePanel.classList.remove("controls-hidden");
  sidePanel.classList.add("panel-open");
}

function esconderControlesTemporariamente() {
  sidePanel.classList.add("controls-hidden");
  sidePanel.classList.remove("panel-open");
}

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

document.addEventListener("mousemove", resetarInterface);
document.addEventListener("mousedown", resetarInterface);
document.addEventListener("touchstart", resetarInterface);

/* =========================================================
   CONTROLE VISUAL DAS MÍDIAS
   ========================================================= */

function mostrarVideo() {
  videoPlayer.style.opacity = 1;
  imagePlayer.style.opacity = 0;
}

function mostrarImagem() {
  imagePlayer.style.opacity = 1;
  videoPlayer.style.opacity = 0;
}

async function fadeOutMidias() {
  videoPlayer.style.opacity = 0;
  imagePlayer.style.opacity = 0;
  await sleep(getFadeDuration());
}

function limparMidias() {
  clearTimeout(timerImagem);
  timerImagem = null;

  videoPlayer.pause();
  imagePlayer.removeAttribute("src");
}

/* =========================================================
   PRÉ-CARREGAMENTO
   ========================================================= */

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

function preCarregarProximaImagem() {
  if (!playlist.length) return;

  const proximoIndex = (indiceAtual + 1) % playlist.length;
  const proximo = playlist[proximoIndex];

  if (proximo && proximo.tipo === "imagem") {
    const img = new Image();
    img.src = proximo.arquivo;
  }
}

function preCarregarProximaMidia() {
  preCarregarProximoVideo();
  preCarregarProximaImagem();
}

/* =========================================================
   SPLASH
   ========================================================= */

function mostrarSplash() {
  splashScreen.classList.remove("hidden");
  splashScreen.classList.add("visible");
}

function esconderSplash() {
  splashScreen.classList.remove("visible");
}

/* =========================================================
   PREPARAÇÃO DA PRIMEIRA MÍDIA
   ========================================================= */

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
   REPRODUÇÃO DA MÍDIA
   ========================================================= */

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
   NAVEGAÇÃO
   ========================================================= */

async function proximoItem() {
  if (!playlist.length || emTransicao) return;

  indiceAtual = (indiceAtual + 1) % playlist.length;
  tocarItemAtual();
}

function itemAnterior() {
  if (!playlist.length || emTransicao) return;

  indiceAtual = (indiceAtual - 1 + playlist.length) % playlist.length;
  tocarItemAtual();
}

/* =========================================================
   BOTÕES DINÂMICOS
   ========================================================= */

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
   FULLSCREEN
   ========================================================= */

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
   MODO MOBILE / ORIENTAÇÃO
   ========================================================= */

function isSmallScreen() {
  return window.innerWidth <= 1024;
}

function isPortrait() {
  return window.innerHeight > window.innerWidth;
}

function atualizarModoResponsivo() {
  const mobile = isSmallScreen();

  document.body.classList.toggle("mobile-mode", mobile);

  // Reset do aviso ao mudar para paisagem
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
   INICIALIZAÇÃO
   ========================================================= */

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
   FULLSCREEN / ORIENTAÇÃO
   ========================================================= */

document.addEventListener("fullscreenchange", atualizarBotaoFullscreen);
window.addEventListener("resize", atualizarModoResponsivo);
window.addEventListener("orientationchange", atualizarModoResponsivo);

/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA DA PLAYLIST
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
   ========================================================= */

document.addEventListener("keydown", (event) => {
  const tecla = event.key;
  const codigo = event.keyCode || event.which;

  resetarInterface();

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

  if (tecla === "ArrowUp" || codigo === 38) {
    event.preventDefault();
    mostrarControlesTemporariamente();
    return;
  }

  if (tecla === "ArrowDown" || codigo === 40) {
    event.preventDefault();
    esconderControlesTemporariamente();
    return;
  }

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