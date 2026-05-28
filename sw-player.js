/* =========================================================
   SERVICE WORKER DO PLAYER — PAINEL RIBAS
   =========================================================
   Responsável por oferecer fallback offline básico para o player.

   Neste primeiro momento:
   - cacheia imagens da playlist;
   - permite que imagens já salvas continuem abrindo sem rede;
   - não cacheia vídeos automaticamente para evitar uso excessivo de disco.

   Observação:
   O Service Worker só funciona em HTTPS ou localhost.
   Em produção com painelribas.com.br, está OK.
   ========================================================= */

const PLAYER_CACHE_NAME = "painel-ribas-player-cache-v4";

const PLAYER_SHELL_URLS = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/config.json",
    "/assets/favicon.svg",
    "/assets/logo-prefeitura.svg",
    "/assets/wallpaper.jpg",
    "/assets/watermark-prefeitura.svg"
];

const EXTENSOES_IMAGEM = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".svg"
];

/**
 * Verifica se a URL parece ser uma imagem.
 */
function ehImagem(url) {
    const pathname = new URL(url).pathname.toLowerCase();

    return EXTENSOES_IMAGEM.some((extensao) => {
        return pathname.endsWith(extensao);
    });
}

/**
 * Verifica se a requisição é parte essencial do player.
 */
function ehArquivoBaseDoPlayer(url) {
    const pathname = new URL(url).pathname;

    if (pathname === "/") return true;

    return PLAYER_SHELL_URLS.includes(pathname);
}

/**
 * Verifica se a requisição pertence ao player/mídias.
 */
function deveTratarRequisicao(request) {
    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return false;
    }

    /*
      Não interferimos no admin.
      O admin continua seguindo o fluxo normal do servidor.
    */
    if (url.pathname.startsWith("/admin/")) {
        return false;
    }

    /*
      Neste primeiro momento, o Service Worker só trata imagens.
  
      Importante:
      Não interceptamos vídeos ainda, porque vídeos podem ser grandes
      e ainda não temos política de cache, limite e limpeza para eles.
    */
    return ehImagem(request.url);
}

self.addEventListener("install", (event) => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(PLAYER_CACHE_NAME).then(async (cache) => {
            await Promise.allSettled(
                PLAYER_SHELL_URLS.map(async (url) => {
                    try {
                        const response = await fetch(url, {
                            cache: "reload"
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                        }

                        await cache.put(url, response.clone());
                    } catch (erro) {
                        console.warn(`Falha ao cachear arquivo base do player: ${url}`, erro);
                    }
                })
            );
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((nomesCaches) => {
            return Promise.all(
                nomesCaches.map((nomeCache) => {
                    if (nomeCache !== PLAYER_CACHE_NAME) {
                        return caches.delete(nomeCache);
                    }

                    return null;
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    /*
      Não interferimos no admin.
      O admin continua seguindo o fluxo normal do servidor.
    */
    if (url.pathname.startsWith("/admin/")) {
        return;
    }

    /*
      Navegação do player.
  
      Importante:
      URLs como:
      - /
      - /?debug=1
      - /index.html
      devem conseguir abrir offline usando a versão cacheada do player.
    */
    const ehNavegacao =
        request.mode === "navigate" ||
        request.destination === "document";

    if (ehNavegacao) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.ok) {
                        const respostaParaCache = response.clone();

                        caches.open(PLAYER_CACHE_NAME).then((cache) => {
                            cache.put("/", respostaParaCache.clone());
                            cache.put("/index.html", respostaParaCache);
                        });
                    }

                    return response;
                })
                .catch(async () => {
                    const cache = await caches.open(PLAYER_CACHE_NAME);

                    const indexCache =
                        await cache.match("/index.html") ||
                        await cache.match("/") ||
                        await caches.match("/index.html") ||
                        await caches.match("/");

                    if (indexCache) {
                        return indexCache;
                    }

                    return new Response(
                        "<h1>Painel indisponível offline</h1><p>O player ainda não foi salvo no cache local.</p>",
                        {
                            status: 503,
                            headers: {
                                "Content-Type": "text/html; charset=utf-8"
                            }
                        }
                    );
                })
        );

        return;
    }

    const deveTratar =
        ehArquivoBaseDoPlayer(request.url) ||
        ehImagem(request.url);

    if (!deveTratar) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response && response.ok) {
                    const respostaParaCache = response.clone();
                    const respostaParaCacheSemQuery = response.clone();

                    caches.open(PLAYER_CACHE_NAME).then((cache) => {
                        cache.put(request, respostaParaCache);

                        /*
                          Também salva uma cópia pelo caminho limpo, sem query string.
                          Isso permite responder offline a URLs versionadas como:
                          /config.json?v=123
                          /script.js?v=123
                        */
                        cache.put(url.pathname, respostaParaCacheSemQuery);
                    });
                }

                return response;
            })
            .catch(async () => {
                const cache = await caches.open(PLAYER_CACHE_NAME);

                const respostaCache =
                    await cache.match(request) ||
                    await caches.match(request) ||
                    await cache.match(url.pathname) ||
                    await caches.match(url.pathname);

                if (respostaCache) {
                    return respostaCache;
                }

                throw new Error("Recurso indisponível offline e não encontrado no cache.");
            })
    );
});