/* =========================================================
   ELEMENTOS PRINCIPAIS DA INTERFACE
   =========================================================

   Aqui pegamos referências dos elementos HTML usados pelo sistema:
   - players de vídeo e imagem
   - splash inicial
   - status
   - barra lateral
   - relógio lateral
   - botões de controle
   ========================================================= */

// Players de mídia
const videoPlayer = document.getElementById("videoPlayer");
const videoPreload = document.getElementById("videoPreload");
const imagePlayer = document.getElementById("imagePlayer");

// Área principal de mídia
const mediaArea = document.getElementById("mediaArea");

// Caixa de status
const statusBox = document.getElementById("status");

// Splash screen inicial
const splashScreen = document.getElementById("splashScreen");
const splashWallpaper = document.getElementById("splashWallpaper");

// Botões de controle
const btnPrev = document.getElementById("btnPrev");
const btnPlayPause = document.getElementById("btnPlayPause");
const btnNext = document.getElementById("btnNext");
const btnMute = document.getElementById("btnMute");

// Barra lateral
const controls = document.getElementById("controls");
const sidePanel = document.getElementById("sidePanel");

// Relógio lateral
const sidebarClockTime = document.getElementById("sidebarClockTime");
const sidebarClockDate = document.getElementById("sidebarClockDate");

/* =========================================================
   ESTADO DA APLICAÇÃO
   =========================================================

   Variáveis responsáveis por guardar:
   - config carregada do JSON
   - playlist carregada
   - índice atual
   - timers
   - estado de transição
   - preferência de som do usuário
   ========================================================= */

// Configuração geral do painel
let config = {};

// Playlist atual carregada do playlist.json
let playlist = [];

// Índice do item atual da playlist
let indiceAtual = 0;

// Tipo da mídia atual ("video" ou "imagem")
let tipoAtual = null;

// Timers auxiliares
let timerImagem = null;
let timerStatus = null;
let timerInterface = null;

// Controle de transições
let emTransicao = false;
let primeiraInicializacaoConcluida = false;

// Preferência de som do usuário
// false = painel continua mutado
// true = usuário liberou o som
let somHabilitadoPeloUsuario = false;

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

/**
 * Espera um tempo em milissegundos.
 * Útil para splash, fade e transições.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retorna a duração do fade entre mídias.
 */
function getFadeDuration() {
  return Number(config.duracaoFadeMidia) > 0
    ? Number(config.duracaoFadeMidia)
    : 600;
}

/**
 * Adiciona um pequeno feedback visual ao botão clicado.
 * Isso ajuda o usuário a perceber que o comando foi recebido.
 */
function aplicarFeedbackNoBotao(botao) {
  if (!botao) return;

  botao.classList.remove("feedback");
  void botao.offsetWidth; // força reflow para reiniciar animação
  botao.classList.add("feedback");

  setTimeout(() => {
    botao.classList.remove("feedback");
  }, 300);
}

/* =========================================================
   STATUS / MENSAGENS DE APOIO
   ========================================================= */

/**
 * Mostra uma mensagem temporária na caixa de status.
 * Em modo teste, a mensagem fica mais tempo visível.
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
   CONFIGURAÇÃO DO SISTEMA
   ========================================================= */

/**
 * Carrega o arquivo config.json
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
 * Aplica os valores da configuração à interface.
 */
function aplicarConfig() {
  // Wallpaper da splash inicial
  if (config.wallpaperInicial) {
    splashWallpaper.src = config.wallpaperInicial;
  }

  // Status
  if (!config.mostrarStatus) {
    statusBox.classList.add("hidden");
  } else {
    statusBox.classList.remove("hidden");
  }

  // Barra lateral
  sidePanel.classList.toggle("hidden", !config.mostrarControles);

  // Garante que a barra lateral comece recolhida
  sidePanel.classList.add("controls-hidden");
  sidePanel.classList.remove("panel-open");
}

/* =========================================================
   RELÓGIO
   ========================================================= */

/**
 * Atualiza hora e data com o fuso de Campo Grande / MS
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
 * Carrega o arquivo playlist.json
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
   - reaparecer quando houver movimento/interação
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
 * Mostra temporariamente a barra lateral
 */
function mostrarControlesTemporariamente() {
  sidePanel.classList.remove("controls-hidden");
  sidePanel.classList.add("panel-open");
}

/**
 * Esconde temporariamente a barra lateral
 */
function esconderControlesTemporariamente() {
  sidePanel.classList.add("controls-hidden");
  sidePanel.classList.remove("panel-open");
}

/**
 * Reinicia o temporizador da interface.
 * Sempre que houver movimento/interação:
 * - mostra cursor
 * - mostra a barra lateral
 * - espera alguns segundos
 * - esconde novamente
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

// Eventos que reativam a interface
document.addEventListener("mousemove", resetarInterface);
document.addEventListener("mousedown", resetarInterface);
document.addEventListener("touchstart", resetarInterface);

/* =========================================================
   CONTROLE VISUAL DAS MÍDIAS
   ========================================================= */

/**
 * Mostra o vídeo atual e esconde a imagem
 */
function mostrarVideo() {
  videoPlayer.style.opacity = 1;
  imagePlayer.style.opacity = 0;
}

/**
 * Mostra a imagem atual e esconde o vídeo
 */
function mostrarImagem() {
  imagePlayer.style.opacity = 1;
  videoPlayer.style.opacity = 0;
}

/**
 * Faz fade out das mídias antes da próxima entrar
 */
async function fadeOutMidias() {
  videoPlayer.style.opacity = 0;
  imagePlayer.style.opacity = 0;
  await sleep(getFadeDuration());
}

/**
 * Limpa o estado das mídias antes da próxima reprodução
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

   Objetivo:
   tentar deixar a próxima mídia mais pronta para reduzir
   travadinhas entre uma troca e outra.
   ========================================================= */

/**
 * Pré-carrega o próximo vídeo da playlist, se o próximo item for vídeo
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
 * Pré-carrega a próxima imagem da playlist, se o próximo item for imagem
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
 * Chama o pré-carregamento da próxima mídia
 */
function preCarregarProximaMidia() {
  preCarregarProximoVideo();
  preCarregarProximaImagem();
}

/* =========================================================
   SPLASH INICIAL
   =========================================================

   A splash existe apenas na abertura do sistema.
   Não usamos mais splash no meio do loop.
   ========================================================= */

/**
 * Mostra a splash inicial
 */
function mostrarSplash() {
  splashScreen.classList.remove("hidden");
  splashScreen.classList.add("visible");
}

/**
 * Esconde visualmente a splash
 */
function esconderSplash() {
  splashScreen.classList.remove("visible");
}

/* =========================================================
   PREPARAÇÃO DA PRIMEIRA MÍDIA
   =========================================================

   Aqui tentamos deixar a primeira mídia pronta enquanto
   a splash está sendo exibida.

   Versão segura:
   - vídeo: espera loadeddata ou timeout
   - imagem: carrega em memória
   ========================================================= */

/**
 * Prepara a primeira mídia da playlist.
 */
async function prepararPrimeiraMidiaDoCiclo() {
  if (!playlist.length) return;

  const primeiroItem = playlist[0];

  // Se for vídeo, espera loadeddata ou timeout
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

  // Se for imagem, tenta carregá-la em memória
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
   =========================================================

   Comportamento atual:
   - se vídeo travar ou falhar, o sistema pula para o próximo
   - isso é mais seguro para apresentação do que congelar a tela
   ========================================================= */

/**
 * Toca a mídia atual da playlist.
 */
async function tocarItemAtual() {
  if (!playlist.length || emTransicao) return;

  emTransicao = true;

  const item = playlist[indiceAtual];

  // Validação básica do item
  if (!item || !item.tipo || !item.arquivo) {
    atualizarStatus("Item inválido, pulando...");
    emTransicao = false;
    setTimeout(proximoItem, 1000);
    return;
  }

  // A partir da segunda execução, faz fade out antes da troca
  if (primeiraInicializacaoConcluida) {
    await fadeOutMidias();
  }

  limparMidias();

  tipoAtual = item.tipo;
  atualizarStatus(`Reproduzindo: ${item.arquivo}`);

  /* ---------------------------------------------
     CASO: VÍDEO
     --------------------------------------------- */
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
        })
        .catch(() => {
          atualizarStatus("Erro no vídeo, pulando...");
          emTransicao = false;
          setTimeout(proximoItem, 1000);
        });
    };

    videoPlayer.addEventListener("loadeddata", aoCarregar);
  }

  /* ---------------------------------------------
     CASO: IMAGEM
     --------------------------------------------- */
  else if (item.tipo === "imagem") {
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
    };

    img.onerror = () => {
      atualizarStatus("Erro na imagem, pulando...");
      emTransicao = false;
      setTimeout(proximoItem, 1000);
    };

    img.src = item.arquivo;
  }

  /* ---------------------------------------------
     CASO: TIPO DESCONHECIDO
     --------------------------------------------- */
  else {
    atualizarStatus("Tipo desconhecido, pulando...");
    emTransicao = false;
    setTimeout(proximoItem, 1000);
  }
}

/* =========================================================
   NAVEGAÇÃO ENTRE ITENS
   ========================================================= */

/**
 * Vai para o próximo item da playlist.
 * Quando chega ao final, volta para o primeiro.
 */
async function proximoItem() {
  if (!playlist.length || emTransicao) return;

  indiceAtual = (indiceAtual + 1) % playlist.length;
  tocarItemAtual();
}

/**
 * Volta para o item anterior
 */
function itemAnterior() {
  if (!playlist.length || emTransicao) return;

  indiceAtual = (indiceAtual - 1 + playlist.length) % playlist.length;
  tocarItemAtual();
}

/* =========================================================
   CONTROLES MANUAIS
   ========================================================= */

/**
 * Alterna entre play e pause da mídia atual
 */
function alternarPlayPause() {
  if (!playlist.length) return;

  if (tipoAtual === "video") {
    if (videoPlayer.paused) {
      videoPlayer.play().catch(() => {
        atualizarStatus("Não foi possível dar play no vídeo");
      });
    } else {
      videoPlayer.pause();
    }
  } else if (tipoAtual === "imagem") {
    if (timerImagem) {
      clearTimeout(timerImagem);
      timerImagem = null;
      atualizarStatus("Imagem pausada");
    } else {
      const item = playlist[indiceAtual];
      const duracao = Number(item.duracao) > 0 ? Number(item.duracao) : 8;

      timerImagem = setTimeout(() => {
        proximoItem();
      }, duracao * 1000);

      atualizarStatus("Imagem retomada");
    }
  }
}

/**
 * Liga ou desliga o som manualmente
 */
function alternarSom() {
  somHabilitadoPeloUsuario = !somHabilitadoPeloUsuario;
  videoPlayer.muted = !somHabilitadoPeloUsuario;

  atualizarStatus(somHabilitadoPeloUsuario ? "Som ligado" : "Som desligado");
}

/* =========================================================
   INICIALIZAÇÃO DO SISTEMA
   =========================================================

   Fluxo:
   1. carrega config
   2. inicia relógio
   3. carrega playlist
   4. garante barra lateral recolhida
   5. mostra splash
   6. prepara a primeira mídia
   7. toca a primeira mídia
   8. esconde a splash
   9. só depois disso libera a barra lateral
   ========================================================= */

/**
 * Inicializa todo o sistema
 */
async function iniciarSistema() {
  try {
    await carregarConfig();
    iniciarRelogio();
    await carregarPlaylist();

    const tempoMinimoSplash = Number(config.tempoMinimoSplash) > 0
      ? Number(config.tempoMinimoSplash)
      : 4000;

    // Garante que a barra lateral comece escondida
    esconderControlesTemporariamente();

    // Garante que o cursor também não apareça brigando com a splash
    esconderCursor();

    // Mostra splash inicial
    mostrarSplash();

    // Enquanto a splash aparece, prepara a primeira mídia
    await Promise.all([
      prepararPrimeiraMidiaDoCiclo(),
      sleep(tempoMinimoSplash)
    ]);

    // Estado inicial do som
    videoPlayer.muted = !somHabilitadoPeloUsuario;

    // Inicia a primeira mídia ainda por baixo da splash
    tocarItemAtual();

    // Dá um pequeno tempo para a primeira mídia entrar visualmente
    await sleep(150);

    // Some com a splash
    esconderSplash();

    // Aguarda o fade da splash
    await sleep(800);

    // Remove a splash da tela
    splashScreen.classList.add("hidden");

    // Só agora ativa a interface inteligente
    resetarInterface();
  } catch (erro) {
    console.error(erro);
    atualizarStatus("Erro ao iniciar sistema");
  }
}

/* =========================================================
   EVENTOS DO PLAYER DE VÍDEO
   ========================================================= */

/**
 * Ao terminar um vídeo, vai para o próximo item
 */
videoPlayer.addEventListener("ended", proximoItem);

/**
 * Se der erro no vídeo, tenta pular
 */
videoPlayer.addEventListener("error", () => {
  atualizarStatus("Erro ao carregar vídeo, pulando...");
  setTimeout(proximoItem, 1000);
});

/**
 * Se o vídeo travar no carregamento, pula para o próximo
 */
videoPlayer.addEventListener("stalled", () => {
  atualizarStatus("Vídeo travou, tentando próximo...");
  setTimeout(proximoItem, 1000);
});

/**
 * Se entrar em buffering, mostra mensagem
 */
videoPlayer.addEventListener("waiting", () => {
  atualizarStatus("Carregando vídeo...");
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

/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA DA PLAYLIST
   =========================================================

   A cada 30 segundos:
   - verifica se o playlist.json mudou
   - se mudou, atualiza playlist
   - reinicia no primeiro item
   ========================================================= */

setInterval(async () => {
  try {
    const resposta = await fetch(`playlist.json?v=${Date.now()}`);

    if (!resposta.ok) return;

    const novaPlaylist = await resposta.json();

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
   SUPORTE A TECLADO / CONTROLE REMOTO
   =========================================================

   Muitas Smart TVs enviam botões do controle como:
   - setas
   - Enter
   - MediaPlayPause
   - MediaTrackNext
   - MediaTrackPrevious
   ========================================================= */

document.addEventListener("keydown", (event) => {
  const tecla = event.key;
  const codigo = event.keyCode || event.which;

  // Sempre que houver interação por teclado/controle,
  // reativa a interface.
  resetarInterface();

  /* ---------------------------------------------
     PLAY / PAUSE
     --------------------------------------------- */
  const ehPlayPause =
    tecla === "Enter" ||
    tecla === " " ||
    tecla === "Spacebar" ||
    tecla === "MediaPlayPause" ||
    codigo === 13 ||   // Enter
    codigo === 32 ||   // Espaço
    codigo === 179 ||  // MediaPlayPause
    codigo === 415;    // Play em algumas TVs

  if (ehPlayPause) {
    event.preventDefault();
    aplicarFeedbackNoBotao(btnPlayPause);
    alternarPlayPause();

    // Primeiro OK/Play também libera o som
    somHabilitadoPeloUsuario = true;
    videoPlayer.muted = false;

    return;
  }

  /* ---------------------------------------------
     PRÓXIMO ITEM
     --------------------------------------------- */
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

  /* ---------------------------------------------
     ITEM ANTERIOR
     --------------------------------------------- */
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

  /* ---------------------------------------------
     MOSTRAR BARRA LATERAL
     --------------------------------------------- */
  if (tecla === "ArrowUp" || codigo === 38) {
    event.preventDefault();
    mostrarControlesTemporariamente();
    return;
  }

  /* ---------------------------------------------
     OCULTAR BARRA LATERAL
     --------------------------------------------- */
  if (tecla === "ArrowDown" || codigo === 40) {
    event.preventDefault();
    esconderControlesTemporariamente();
    return;
  }

  /* ---------------------------------------------
     MUTE / UNMUTE VIA TECLA "M"
     --------------------------------------------- */
  if (tecla === "m" || tecla === "M") {
    event.preventDefault();
    aplicarFeedbackNoBotao(btnMute);
    alternarSom();
    return;
  }
});

/* =========================================================
   START
   ========================================================= */

iniciarSistema();