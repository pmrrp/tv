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

const PLAYER_CACHE_NAME = "painel-ribas-player-cache-v1";

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

    if (url.pathname.startsWith("/midia/")) {
        return true;
    }

    if (ehImagem(request.url)) {
        return true;
    }

    return false;
}

self.addEventListener("install", (event) => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(PLAYER_CACHE_NAME)
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

    if (!deveTratarRequisicao(request)) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                /*
                  Se a rede respondeu OK e for imagem, atualizamos o cache.
                */
                if (response && response.ok && ehImagem(request.url)) {
                    const respostaParaCache = response.clone();

                    caches.open(PLAYER_CACHE_NAME).then((cache) => {
                        cache.put(request, respostaParaCache);
                    });
                }

                return response;
            })
            .catch(async () => {
                /*
                  Se a rede falhar, tentamos responder com cache.
                */
                const respostaCache = await caches.match(request);

                if (respostaCache) {
                    return respostaCache;
                }

                throw new Error("Recurso indisponível offline e não encontrado no cache.");
            })
    );
});