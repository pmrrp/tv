/* =========================================================
   ELEMENTOS PRINCIPAIS DO HTML
   ========================================================= */

// Players de mídia
const videoPlayer = document.getElementById("videoPlayer");
const videoPreload = document.getElementById("videoPreload");
const imagePlayer = document.getElementById("imagePlayer");

// Caixa de status
const statusBox = document.getElementById("status");

// Splash screen
const splashScreen = document.getElementById("splashScreen");
const splashWallpaper = document.getElementById("splashWallpaper");

// Botões de controle
const btnPrev = document.getElementById("btnPrev");
const btnPlay = document.getElementById("btnPlay");
const btnPause = document.getElementById("btnPause");
const btnNext = document.getElementById("btnNext");
const btnMute = document.getElementById("btnMute");
const toggleControls = document.getElementById("toggleControls");
const controls = document.getElementById("controls");

// Elementos institucionais
const tituloPainel = document.getElementById("tituloPainel");
const subtituloPainel = document.getElementById("subtituloPainel");
const clockArea = document.getElementById("clockArea");
const clockTime = document.getElementById("clockTime");
const clockDate = document.getElementById("clockDate");

/* =========================================================
   ESTADO DA APLICAÇÃO
   ========================================================= */

let config = {};
let playlist = [];
let indiceAtual = 0;
let tipoAtual = null;

// Timers auxiliares
let timerImagem = null;
let timerStatus = null;
let timerInterface = null;

/* =========================================================
   FUNÇÕES DE STATUS
   ========================================================= */

/**
 * Mostra uma mensagem temporária de status na tela.
 * Exemplo:
 * - "Carregando vídeo..."
 * - "Playlist atualizada"
 * - "Erro ao carregar mídia"
 */
function atualizarStatus(texto) {
  statusBox.textContent = texto;
  statusBox.classList.remove("hidden");

  clearTimeout(timerStatus);

  // Em modo teste, a mensagem fica um pouco mais tempo visível
  const tempoVisivel = config.modoTeste ? 4000 : 2000;

  timerStatus = setTimeout(() => {
    statusBox.classList.add("hidden");
  }, tempoVisivel);
}

/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

/**
 * Carrega o config.json
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
 * Aplica as configurações visuais e comportamentais
 * vindas do config.json
 */
function aplicarConfig() {
  // Textos da barra superior
  tituloPainel.textContent =
    config.tituloPainel || "Prefeitura de Ribas do Rio Pardo";

  subtituloPainel.textContent =
    config.subtituloPainel || "Painel Institucional";

  // Splash wallpaper
  if (config.wallpaperInicial) {
    splashWallpaper.src = config.wallpaperInicial;
  }

  // Status
  if (!config.mostrarStatus) {
    statusBox.classList.add("hidden");
  } else {
    statusBox.classList.remove("hidden");
  }

  // Relógio
  clockArea.classList.toggle("hidden", !config.mostrarRelogio);

  // Controles
  toggleControls.classList.toggle("hidden", !config.mostrarControles);
  controls.classList.toggle("hidden", !config.mostrarControles);
}

/* =========================================================
   RELÓGIO
   ========================================================= */

/**
 * Atualiza relógio e data usando o fuso de Campo Grande/MS
 */
function iniciarRelogio() {
  function atualizarRelogio() {
    const agora = new Date();

    clockTime.textContent = agora.toLocaleTimeString("pt-BR", {
      timeZone: "America/Campo_Grande",
      hour12: false
    });

    clockDate.textContent = agora.toLocaleDateString("pt-BR", {
      timeZone: "America/Campo_Grande"
    });
  }

  atualizarRelogio();
  setInterval(atualizarRelogio, 1000);
}

/* =========================================================
   PLAYLIST
   ========================================================= */

/**
 * Carrega a playlist atual do arquivo playlist.json
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
   Cursor e controles aparecem quando há movimento
   e somem depois de alguns segundos parados
   ========================================================= */

/**
 * Mostra o cursor
 */
function mostrarCursor() {
  document.body.classList.remove("cursor-hidden");
}

/**
 * Esconde o cursor
 */
function esconderCursor() {
  document.body.classList.add("cursor-hidden");
}

/**
 * Mostra os controles temporariamente
 */
function mostrarControlesTemporariamente() {
  toggleControls.classList.remove("controls-hidden");
  controls.classList.remove("controls-hidden");
}

/**
 * Esconde os controles temporariamente
 */
function esconderControlesTemporariamente() {
  toggleControls.classList.add("controls-hidden");
  controls.classList.add("controls-hidden");
}

/**
 * Reseta o temporizador de interface:
 * - mostra cursor
 * - mostra controles
 * - depois de 3s sem interação, esconde de novo
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
  }, 3000);
}

// Eventos que reativam a interface
document.addEventListener("mousemove", resetarInterface);
document.addEventListener("mousedown", resetarInterface);
document.addEventListener("touchstart", resetarInterface);

/* =========================================================
   CONTROLE VISUAL DAS MÍDIAS
   ========================================================= */

/**
 * Mostra o vídeo atual com fade
 */
function mostrarVideo() {
  videoPlayer.style.opacity = 1;
  imagePlayer.style.opacity = 0;
}

/**
 * Mostra a imagem atual com fade
 */
function mostrarImagem() {
  imagePlayer.style.opacity = 1;
  videoPlayer.style.opacity = 0;
}

/**
 * Esconde tudo antes de tocar a próxima mídia
 */
function esconderTudo() {
  clearTimeout(timerImagem);

  // Pausa o vídeo atual
  videoPlayer.pause();

  // Zera as opacidades
  videoPlayer.style.opacity = 0;
  imagePlayer.style.opacity = 0;

  // Limpa a imagem anterior
  imagePlayer.removeAttribute("src");
}

/* =========================================================
   NAVEGAÇÃO ENTRE ITENS
   ========================================================= */

/**
 * Vai para o próximo item da playlist
 */
function proximoItem() {
  if (!playlist.length) return;

  indiceAtual = (indiceAtual + 1) % playlist.length;
  tocarItemAtual();
}

/**
 * Volta para o item anterior
 */
function itemAnterior() {
  if (!playlist.length) return;

  indiceAtual = (indiceAtual - 1 + playlist.length) % playlist.length;
  tocarItemAtual();
}

/* =========================================================
   REPRODUÇÃO DA MÍDIA ATUAL
   ========================================================= */

/**
 * Toca o item atual da playlist.
 * Se for vídeo:
 * - carrega o vídeo
 * - aguarda loadeddata
 * - faz play
 *
 * Se for imagem:
 * - exibe a imagem
 * - aguarda a duração definida
 */
function tocarItemAtual() {
  if (!playlist.length) return;

  esconderTudo();

  const item = playlist[indiceAtual];

  // Validação mínima
  if (!item || !item.tipo || !item.arquivo) {
    atualizarStatus("Item inválido, pulando...");
    setTimeout(proximoItem, 1000);
    return;
  }

  tipoAtual = item.tipo;
  atualizarStatus(`Reproduzindo: ${item.arquivo}`);

  // -------------------------
  // CASO: VÍDEO
  // -------------------------
  if (item.tipo === "video") {
    videoPlayer.src = item.arquivo;
    videoPlayer.load();

    // Pré-carrega o próximo vídeo, se o próximo item também for vídeo
    const proximoIndex = (indiceAtual + 1) % playlist.length;
    const proximo = playlist[proximoIndex];

    if (proximo && proximo.tipo === "video") {
      const proximoUrlAbsoluto = new URL(proximo.arquivo, window.location.href).href;

      // Evita recarregar se já estiver apontando para o mesmo arquivo
      if (videoPreload.src !== proximoUrlAbsoluto) {
        videoPreload.src = proximo.arquivo;
        videoPreload.load();
      }
    }

    // Quando o vídeo estiver pronto para exibir
    const aoCarregar = () => {
      videoPlayer.removeEventListener("loadeddata", aoCarregar);

      mostrarVideo();

      videoPlayer.play().catch(() => {
        atualizarStatus("Erro no vídeo, pulando...");
        setTimeout(proximoItem, 1000);
      });
    };

    videoPlayer.addEventListener("loadeddata", aoCarregar);
  }

  // -------------------------
  // CASO: IMAGEM
  // -------------------------
  else if (item.tipo === "imagem") {
    imagePlayer.src = item.arquivo;
    mostrarImagem();

    const duracao = Number(item.duracao) > 0 ? Number(item.duracao) : 8;

    timerImagem = setTimeout(() => {
      proximoItem();
    }, duracao * 1000);
  }

  // -------------------------
  // TIPO DESCONHECIDO
  // -------------------------
  else {
    atualizarStatus("Tipo desconhecido, pulando...");
    setTimeout(proximoItem, 1000);
  }
}

/* =========================================================
   CONTROLES MANUAIS
   ========================================================= */

/**
 * Dá play na mídia atual
 */
function playAtual() {
  if (!playlist.length) return;

  if (tipoAtual === "video") {
    videoPlayer.play().catch(() => {
      atualizarStatus("Não foi possível dar play no vídeo");
    });
  } else if (tipoAtual === "imagem") {
    const item = playlist[indiceAtual];
    const duracao = Number(item.duracao) > 0 ? Number(item.duracao) : 8;

    clearTimeout(timerImagem);
    timerImagem = setTimeout(() => {
      proximoItem();
    }, duracao * 1000);
  }
}

/**
 * Pausa a mídia atual
 */
function pausarAtual() {
  if (!playlist.length) return;

  if (tipoAtual === "video") {
    videoPlayer.pause();
  } else if (tipoAtual === "imagem") {
    clearTimeout(timerImagem);
  }
}

/**
 * Liga/desliga o som do player principal
 * Observação:
 * o autoplay depende de começar mutado
 */
function alternarSom() {
  videoPlayer.muted = !videoPlayer.muted;
  atualizarStatus(videoPlayer.muted ? "Som desligado" : "Som ligado");
}

/* =========================================================
   PREPARAÇÃO DA PRIMEIRA MÍDIA
   Isso permite que a splash fique visível
   enquanto a primeira mídia é preparada
   ========================================================= */

/**
 * Pré-carrega apenas a primeira mídia,
 * para evitar travar logo ao iniciar.
 */
async function prepararPrimeiraMidia() {
  if (!playlist.length) return;

  const primeiroItem = playlist[0];

  // Se for vídeo, aguarda loadeddata ou timeout de segurança
  if (primeiroItem.tipo === "video") {
    return new Promise((resolve) => {
      videoPlayer.src = primeiroItem.arquivo;
      videoPlayer.load();

      // Timeout de segurança: não esperar para sempre
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

  // Se for imagem, pré-carrega usando objeto Image
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
   INICIALIZAÇÃO DO SISTEMA
   ========================================================= */

async function iniciarSistema() {
  try {
    // 1. Carrega configurações
    await carregarConfig();

    // 2. Inicia relógio
    iniciarRelogio();

    // 3. Carrega playlist
    await carregarPlaylist();

    // 4. Mantém a splash por tempo mínimo
    const tempoMinimoSplash = config.tempoMinimoSplash || 4000;

    // 5. Enquanto splash aparece, prepara a primeira mídia
    await Promise.all([
      prepararPrimeiraMidia(),
      new Promise((resolve) => setTimeout(resolve, tempoMinimoSplash))
    ]);

    // 6. Fade out da splash
    setTimeout(() => {
      splashScreen.classList.add("hidden");

      // 7. Após o fade out, inicia a primeira mídia
      setTimeout(() => {
        tocarItemAtual();
      }, 800);
    }, 100);

    // 8. Inicializa estado da interface
    resetarInterface();
  } catch (erro) {
    console.error(erro);
    atualizarStatus("Erro ao iniciar sistema");
  }
}

/* =========================================================
   EVENTOS DO VÍDEO
   ========================================================= */

// Ao terminar o vídeo, vai para o próximo item
videoPlayer.addEventListener("ended", proximoItem);

// Se der erro no vídeo, tenta pular
videoPlayer.addEventListener("error", () => {
  atualizarStatus("Erro ao carregar vídeo, pulando...");
  setTimeout(proximoItem, 1000);
});

// Se travar no carregamento, tenta seguir
videoPlayer.addEventListener("stalled", () => {
  atualizarStatus("Vídeo travou, tentando próximo...");
  setTimeout(proximoItem, 1000);
});

// Mensagem de espera/buffer
videoPlayer.addEventListener("waiting", () => {
  atualizarStatus("Carregando vídeo...");
});

/* =========================================================
   EVENTOS DOS BOTÕES
   ========================================================= */

btnPrev.addEventListener("click", itemAnterior);
btnPlay.addEventListener("click", playAtual);
btnPause.addEventListener("click", pausarAtual);
btnNext.addEventListener("click", proximoItem);
btnMute.addEventListener("click", alternarSom);

// Mostra/esconde o painel de controles
toggleControls.addEventListener("click", () => {
  controls.classList.toggle("hidden");
});

/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA DA PLAYLIST
   A cada 30 segundos, verifica se o playlist.json mudou
   ========================================================= */

setInterval(async () => {
  try {
    const resposta = await fetch(`playlist.json?v=${Date.now()}`);

    if (!resposta.ok) return;

    const novaPlaylist = await resposta.json();

    // Se mudou o conteúdo do JSON, atualiza a reprodução
    if (JSON.stringify(novaPlaylist) !== JSON.stringify(playlist)) {
      playlist = novaPlaylist;
      indiceAtual = 0;
      atualizarStatus("Playlist atualizada");
      tocarItemAtual();
    }
  } catch (erro) {
    console.error("Erro ao atualizar playlist:", erro);
  }
}, 30000);

/* =========================================================
   INÍCIO DA APLICAÇÃO
   ========================================================= */

iniciarSistema();