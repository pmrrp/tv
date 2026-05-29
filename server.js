require("dotenv").config();


/* =========================================================
   SERVIDOR - PAINEL TV PREFEITURA
   =========================================================

   Este arquivo é o backend principal do sistema.

   Responsabilidades:
   - servir o player da TV;
   - servir o painel administrativo;
   - controlar login/sessão do admin;
   - receber upload de imagens e vídeos;
   - listar, configurar, ordenar e excluir mídias;
   - gerar playlist automaticamente;
   - aplicar validade por data/hora;
   - aplicar prioridade e recorrência;
   - criar backups inteligentes;
   - fornecer APIs para dashboard administrativa.

   Observação:
   Este projeto ainda está em formato MVP avançado.
   Futuramente, este arquivo pode ser dividido em módulos:
   routes/, services/, utils/, config/, etc.
   ========================================================= */


/* =========================================================
   IMPORTAÇÕES
   ========================================================= */

const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const db = require("./database/db");
const initDatabase = require("./database/initDatabase");


/* =========================================================
   CONFIGURAÇÕES GERAIS
   ========================================================= */

const app = express();

const PORT = Number(process.env.PORT) || 3000;

/*
  Senha administrativa.

  Em desenvolvimento, ela vem do arquivo .env.
  Exemplo:
  ADMIN_PASSWORD=admin123

  Antes de colocar em produção, trocar por uma senha forte.
*/
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_USER = process.env.ADMIN_USER || "Administrador";

/*
  Caminhos principais do projeto.
*/
const projectRoot = __dirname;
const mediaFolder = path.join(projectRoot, "midia");
const chunksFolder = path.join(projectRoot, "data", "upload-chunks");

const adminFolder = path.join(projectRoot, "admin");
const dataFolder = path.join(projectRoot, "data");
const backupFolder = path.join(projectRoot, "backups");

/*
  Arquivo físico do banco SQLite.

  Observação:
  A conexão real fica em database/db.js, mas mantemos aqui o caminho
  do arquivo para rotinas de backup, listagem e documentação operacional.
*/
const databaseFile = path.join(dataFolder, "painel-tv.db");

/*
  Prefixo usado nos backups do banco SQLite.

  Exemplo gerado:
  database_2026-05-26_14-30-00.db
*/
const DATABASE_BACKUP_PREFIX = "database";

/*
  Configurações de manutenção dos uploads em partes.

  Quando um upload grande é interrompido, a pasta temporária pode
  permanecer em data/upload-chunks/. Para evitar acúmulo indefinido,
  removemos apenas uploads temporários antigos.

  Mantemos uma margem conservadora de 24 horas para não apagar um upload
  legítimo que ainda possa estar em andamento em uma conexão ruim.
*/
const TEMPO_MAXIMO_CHUNK_MS = 24 * 60 * 60 * 1000;
const INTERVALO_LIMPEZA_CHUNKS_MS = 6 * 60 * 60 * 1000;

[mediaFolder, dataFolder, backupFolder, chunksFolder].forEach((pasta) => {
    if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta, { recursive: true });
    }
});

/**
 * Calcula a data mais recente de modificação dentro de uma pasta.
 *
 * Usamos a maior data entre:
 * - a própria pasta;
 * - os arquivos/pastas internos imediatos.
 *
 * Motivo:
 * Em uploads em partes, cada chunk recebido atualiza o conteúdo da pasta.
 * Assim evitamos apagar uma pasta que ainda recebeu partes recentemente.
 */
function obterUltimaAlteracaoDaPasta(pasta) {
    let ultimaAlteracao = fs.statSync(pasta).mtimeMs;

    const itens = fs.readdirSync(pasta, { withFileTypes: true });

    itens.forEach((item) => {
        const caminhoItem = path.join(pasta, item.name);

        try {
            const statusItem = fs.statSync(caminhoItem);
            ultimaAlteracao = Math.max(ultimaAlteracao, statusItem.mtimeMs);
        } catch (erro) {
            /*
              Se algum arquivo sumir durante a leitura, ignoramos.
              Isso pode acontecer em cenários raros de concorrência.
            */
        }
    });

    return ultimaAlteracao;
}

/**
 * Remove uploads em partes antigos que ficaram abandonados.
 *
 * Segurança adotada:
 * - só olha dentro de data/upload-chunks;
 * - só remove diretórios;
 * - ignora arquivos soltos;
 * - só remove pastas com última alteração acima do limite configurado;
 * - usa recursive + force para limpar a pasta temporária inteira;
 * - registra auditoria quando alguma limpeza é executada.
 */
function limparChunksAntigos() {
    if (!fs.existsSync(chunksFolder)) return;

    const agora = Date.now();
    let totalRemovido = 0;
    let tamanhoTotalRemovidoBytes = 0;
    const uploadsRemovidos = [];

    try {
        const entradas = fs.readdirSync(chunksFolder, { withFileTypes: true });

        entradas.forEach((entrada) => {
            if (!entrada.isDirectory()) return;

            const caminhoUpload = path.join(chunksFolder, entrada.name);

            try {
                const ultimaAlteracao = obterUltimaAlteracaoDaPasta(caminhoUpload);
                const idade = agora - ultimaAlteracao;

                if (idade < TEMPO_MAXIMO_CHUNK_MS) return;

                const tamanhoPastaBytes = calcularTamanhoPastaBytes(caminhoUpload);

                fs.rmSync(caminhoUpload, {
                    recursive: true,
                    force: true
                });

                totalRemovido++;
                tamanhoTotalRemovidoBytes += tamanhoPastaBytes;

                uploadsRemovidos.push({
                    uploadId: entrada.name,
                    idadeHoras: Number((idade / (60 * 60 * 1000)).toFixed(2)),
                    ultimaAlteracao: new Date(ultimaAlteracao).toISOString(),
                    tamanhoBytes: tamanhoPastaBytes,
                    tamanhoFormatado: formatarBytes(tamanhoPastaBytes)
                });
            } catch (erroPasta) {
                console.error(`Erro ao limpar chunk antigo "${entrada.name}":`, erroPasta);
            }
        });

        if (totalRemovido > 0) {
            console.log(`[manutencao] ${totalRemovido} upload(s) temporário(s) antigo(s) removido(s).`);

            registrarAuditoriaSistema("sistema.chunks.limpeza", {
                totalRemovido,
                tamanhoTotalRemovidoBytes,
                tamanhoTotalRemovidoFormatado: formatarBytes(tamanhoTotalRemovidoBytes),

                /*
                  Mantemos a lista completa, mas se futuramente isso ficar grande demais,
                  podemos limitar ou criar uma tabela técnica separada.
                */
                uploadsRemovidos,

                politica: {
                    tempoMaximoMs: TEMPO_MAXIMO_CHUNK_MS,
                    tempoMaximoHoras: Number((TEMPO_MAXIMO_CHUNK_MS / (60 * 60 * 1000)).toFixed(2)),
                    intervaloLimpezaMs: INTERVALO_LIMPEZA_CHUNKS_MS,
                    intervaloLimpezaHoras: Number((INTERVALO_LIMPEZA_CHUNKS_MS / (60 * 60 * 1000)).toFixed(2))
                }
            });
        }
    } catch (erro) {
        console.error("Erro ao executar limpeza de chunks antigos:", erro);
    }
}

/**
 * Agenda limpeza periódica dos chunks antigos.
 *
 * Também executa uma primeira limpeza na inicialização do servidor.
 */
function iniciarRotinaLimpezaChunks() {
    limparChunksAntigos();

    setInterval(() => {
        limparChunksAntigos();
    }, INTERVALO_LIMPEZA_CHUNKS_MS);
}

/**
 * Calcula o tamanho total de uma pasta em bytes.
 *
 * Percorre arquivos e subpastas recursivamente.
 * Se algum arquivo não puder ser lido, ele é ignorado para
 * não quebrar o resumo administrativo inteiro.
 */
function calcularTamanhoPastaBytes(pasta) {
    if (!fs.existsSync(pasta)) return 0;

    let total = 0;

    try {
        const itens = fs.readdirSync(pasta, { withFileTypes: true });

        itens.forEach((item) => {
            const caminhoItem = path.join(pasta, item.name);

            try {
                const statusItem = fs.statSync(caminhoItem);

                if (item.isDirectory()) {
                    total += calcularTamanhoPastaBytes(caminhoItem);
                    return;
                }

                if (item.isFile()) {
                    total += statusItem.size;
                }
            } catch (erroItem) {
                /*
                  Ignoramos arquivos inacessíveis para manter o resumo funcionando.
                  Isso evita que um arquivo temporário bloqueado derrube a API.
                */
            }
        });
    } catch (erro) {
        console.error(`Erro ao calcular tamanho da pasta "${pasta}":`, erro);
    }

    return total;
}

/**
 * Obtém informações básicas do disco onde o projeto está rodando.
 *
 * Usa fs.statfsSync quando disponível.
 * Em versões antigas do Node.js, ou em caso de falha no Windows,
 * retorna null sem quebrar o sistema.
 */
function obterInformacoesDisco() {
    if (typeof fs.statfsSync !== "function") {
        return null;
    }

    try {
        const stats = fs.statfsSync(projectRoot);

        const tamanhoBloco = Number(stats.bsize || 0);
        const blocosTotais = Number(stats.blocks || 0);
        const blocosLivres = Number(stats.bavail || stats.bfree || 0);

        if (!tamanhoBloco || !blocosTotais) {
            return null;
        }

        const discoTotalBytes = blocosTotais * tamanhoBloco;
        const discoLivreBytes = blocosLivres * tamanhoBloco;
        const discoUsadoBytes = Math.max(discoTotalBytes - discoLivreBytes, 0);
        const discoUsadoPercentual = discoTotalBytes > 0
            ? Number(((discoUsadoBytes / discoTotalBytes) * 100).toFixed(2))
            : null;

        return {
            discoTotalBytes,
            discoLivreBytes,
            discoUsadoBytes,
            discoUsadoPercentual
        };
    } catch (erro) {
        console.error("Erro ao obter informações de disco:", erro);
        return null;
    }
}

/**
 * Retorna metadados seguros de um arquivo ou pasta.
 *
 * Essa função é usada pelo diagnóstico operacional para verificar
 * se arquivos/pastas importantes existem e quando foram alterados.
 *
 * Importante:
 * - não lê o conteúdo dos arquivos;
 * - não expõe dados sensíveis;
 * - retorna apenas informações operacionais.
 */
function obterInfoCaminho(caminho) {
    try {
        if (!fs.existsSync(caminho)) {
            return {
                existe: false,
                tipo: null,
                tamanhoBytes: 0,
                tamanhoFormatado: "0 B",
                modificadoEm: null
            };
        }

        const stats = fs.statSync(caminho);

        return {
            existe: true,
            tipo: stats.isDirectory() ? "pasta" : "arquivo",
            tamanhoBytes: stats.isDirectory()
                ? calcularTamanhoPastaBytes(caminho)
                : stats.size,
            tamanhoFormatado: stats.isDirectory()
                ? formatarBytes(calcularTamanhoPastaBytes(caminho))
                : formatarBytes(stats.size),
            modificadoEm: stats.mtime.toISOString()
        };
    } catch (erro) {
        return {
            existe: false,
            tipo: null,
            tamanhoBytes: 0,
            tamanhoFormatado: "0 B",
            modificadoEm: null,
            erro: erro.message || String(erro)
        };
    }
}

/**
 * Verifica rapidamente se o banco SQLite está respondendo.
 *
 * Usamos consultas simples e leves para validar:
 * - conexão ativa;
 * - tabela de usuários;
 * - tabela de auditoria.
 */
function obterDiagnosticoBanco() {
    try {
        const teste = db.prepare("SELECT 1 AS ok").get();

        const totalUsuarios = db.prepare(`
            SELECT COUNT(*) AS total
            FROM users
        `).get();

        const totalLogs = db.prepare(`
            SELECT COUNT(*) AS total
            FROM audit_logs
        `).get();

        return {
            ok: Boolean(teste && teste.ok === 1),
            arquivo: databaseFile,
            arquivoExiste: fs.existsSync(databaseFile),
            usuarios: Number(totalUsuarios ? totalUsuarios.total : 0),
            logsAuditoria: Number(totalLogs ? totalLogs.total : 0)
        };
    } catch (erro) {
        return {
            ok: false,
            arquivo: databaseFile,
            arquivoExiste: fs.existsSync(databaseFile),
            usuarios: null,
            logsAuditoria: null,
            erro: erro.message || String(erro)
        };
    }
}

/**
 * Monta um resumo dos backups disponíveis.
 *
 * O diagnóstico não lista todos os backups em detalhe.
 * Ele apenas resume quantos existem por tipo e identifica os últimos.
 */
function obterDiagnosticoBackups() {
    const resultado = {
        total: 0,
        porTipo: {
            playlist: 0,
            midiaConfig: 0,
            database: 0,
            outros: 0
        },
        ultimos: {
            playlist: null,
            midiaConfig: null,
            database: null
        }
    };

    try {
        if (!fs.existsSync(backupFolder)) {
            return resultado;
        }

        const backups = fs.readdirSync(backupFolder)
            .filter((arquivo) => arquivo.endsWith(".json") || arquivo.endsWith(".db"))
            .map((arquivo) => {
                const caminho = path.join(backupFolder, arquivo);
                const stats = fs.statSync(caminho);

                let tipo = "outros";

                if (arquivo.startsWith("playlist_")) {
                    tipo = "playlist";
                }

                if (arquivo.startsWith("midia-config_")) {
                    tipo = "midiaConfig";
                }

                if (arquivo.startsWith("database_")) {
                    tipo = "database";
                }

                return {
                    nome: arquivo,
                    tipo,
                    tamanhoBytes: stats.size,
                    tamanhoFormatado: formatarBytes(stats.size),
                    modificadoEm: stats.mtime.toISOString(),
                    modificadoEmMs: stats.mtimeMs
                };
            })
            .sort((a, b) => b.modificadoEmMs - a.modificadoEmMs);

        resultado.total = backups.length;

        backups.forEach((backup) => {
            if (backup.tipo === "playlist") {
                resultado.porTipo.playlist++;
            } else if (backup.tipo === "midiaConfig") {
                resultado.porTipo.midiaConfig++;
            } else if (backup.tipo === "database") {
                resultado.porTipo.database++;
            } else {
                resultado.porTipo.outros++;
            }

            if (backup.tipo === "playlist" && !resultado.ultimos.playlist) {
                resultado.ultimos.playlist = backup;
            }

            if (backup.tipo === "midiaConfig" && !resultado.ultimos.midiaConfig) {
                resultado.ultimos.midiaConfig = backup;
            }

            if (backup.tipo === "database" && !resultado.ultimos.database) {
                resultado.ultimos.database = backup;
            }
        });

        return resultado;
    } catch (erro) {
        return {
            ...resultado,
            erro: erro.message || String(erro)
        };
    }
}

/**
 * Define o status geral do diagnóstico operacional.
 *
 * Regras:
 * - critico: algo essencial não está disponível;
 * - aviso: sistema funciona, mas há pontos que merecem atenção;
 * - ok: tudo essencial está em ordem.
 */
function calcularStatusDiagnostico({ arquivos, banco, armazenamento, backups }) {
    const problemasCriticos = [];
    const avisos = [];

    if (!arquivos.mediaFolder.existe) {
        problemasCriticos.push("Pasta de mídias não encontrada.");
    }

    if (!arquivos.dataFolder.existe) {
        problemasCriticos.push("Pasta de dados não encontrada.");
    }

    if (!arquivos.backupFolder.existe) {
        problemasCriticos.push("Pasta de backups não encontrada.");
    }

    if (!arquivos.midiaConfigFile.existe) {
        problemasCriticos.push("Arquivo de configuração de mídias não encontrado.");
    }

    if (!banco.ok || !banco.arquivoExiste) {
        problemasCriticos.push("Banco SQLite não está disponível.");
    }

    if (armazenamento.status === "critico") {
        problemasCriticos.push("Armazenamento em estado crítico.");
    }

    if (!arquivos.playlistFile.existe) {
        avisos.push("Arquivo playlist.json ainda não existe.");
    }

    if (armazenamento.status === "aviso") {
        avisos.push(armazenamento.mensagem || "Armazenamento exige atenção.");
    }

    if (!backups.ultimos.database) {
        avisos.push("Nenhum backup do banco SQLite encontrado.");
    }

    if (!backups.ultimos.playlist) {
        avisos.push("Nenhum backup de playlist encontrado.");
    }

    if (!backups.ultimos.midiaConfig) {
        avisos.push("Nenhum backup de configuração de mídia encontrado.");
    }

    if (problemasCriticos.length > 0) {
        return {
            status: "critico",
            mensagem: "Foram encontrados problemas críticos no sistema.",
            problemasCriticos,
            avisos
        };
    }

    if (avisos.length > 0) {
        return {
            status: "aviso",
            mensagem: "Sistema operacional, mas com pontos de atenção.",
            problemasCriticos,
            avisos
        };
    }

    return {
        status: "ok",
        mensagem: "Sistema operacional dentro dos parâmetros esperados.",
        problemasCriticos,
        avisos
    };
}

/**
 * Monta o resumo de armazenamento usado pelo sistema.
 *
 * Inclui:
 * - valores em bytes, úteis para cálculos;
 * - valores formatados, úteis para exibição;
 * - limites operacionais definidos por ambiente;
 * - status geral para orientar dashboard e bloqueios futuros.
 */
function obterResumoArmazenamento() {
    const midiasBytes = calcularTamanhoPastaBytes(mediaFolder);
    const chunksBytes = calcularTamanhoPastaBytes(chunksFolder);
    const backupsBytes = calcularTamanhoPastaBytes(backupFolder);
    const dataBytes = calcularTamanhoPastaBytes(dataFolder);

    /*
      Total operacional focado nos principais pontos de crescimento:
      - mídias enviadas;
      - chunks temporários;
      - backups.

      O dataBytes fica separado porque inclui banco SQLite e arquivos
      operacionais que merecem visualização própria.
    */
    const totalOperacionalBytes = midiasBytes + chunksBytes + backupsBytes;

    const disco = obterInformacoesDisco();

    /*
      Limites operacionais.

      Mesmo que o disco da VM tenha bastante espaço, a pasta midia/
      não deve poder crescer sem controle, pois o disco também precisa
      manter espaço para Windows, logs, banco SQLite, backups e serviços.
    */
    const limiteMidiasGb = obterNumeroEnv("MEDIA_MAX_STORAGE_GB", 180);
    const minimoDiscoLivreGb = obterNumeroEnv("DISK_MIN_FREE_GB", 50);

    const limiteMidiasBytes = gbParaBytes(limiteMidiasGb);
    const minimoDiscoLivreBytes = gbParaBytes(minimoDiscoLivreGb);

    const midiasUsoPercentual = limiteMidiasBytes > 0
        ? Number(((midiasBytes / limiteMidiasBytes) * 100).toFixed(2))
        : null;

    const discoLivreSeguro = disco
        ? disco.discoLivreBytes >= minimoDiscoLivreBytes
        : true;

    const midiasDentroDoLimite = midiasBytes <= limiteMidiasBytes;

    let status = "ok";
    let mensagem = "Armazenamento dentro dos limites operacionais.";

    if (!midiasDentroDoLimite || !discoLivreSeguro) {
        status = "critico";
        mensagem = "Armazenamento em estado crítico. Recomenda-se liberar espaço antes de novos uploads.";
    } else if (
        midiasUsoPercentual !== null &&
        midiasUsoPercentual >= 85
    ) {
        status = "aviso";
        mensagem = "A pasta de mídias está próxima do limite configurado.";
    } else if (
        disco &&
        disco.discoLivreBytes < minimoDiscoLivreBytes * 1.5
    ) {
        status = "aviso";
        mensagem = "O disco está se aproximando da reserva mínima de segurança.";
    }

    return {
        midiasBytes,
        midiasFormatado: formatarBytes(midiasBytes),

        chunksBytes,
        chunksFormatado: formatarBytes(chunksBytes),

        backupsBytes,
        backupsFormatado: formatarBytes(backupsBytes),

        dataBytes,
        dataFormatado: formatarBytes(dataBytes),

        totalOperacionalBytes,
        totalOperacionalFormatado: formatarBytes(totalOperacionalBytes),

        limiteMidiasGb,
        limiteMidiasBytes,
        limiteMidiasFormatado: formatarBytes(limiteMidiasBytes),
        midiasUsoPercentual,
        midiasDentroDoLimite,

        minimoDiscoLivreGb,
        minimoDiscoLivreBytes,
        minimoDiscoLivreFormatado: formatarBytes(minimoDiscoLivreBytes),

        discoLivreBytes: disco ? disco.discoLivreBytes : null,
        discoLivreFormatado: disco ? formatarBytes(disco.discoLivreBytes) : "Indisponível",

        discoTotalBytes: disco ? disco.discoTotalBytes : null,
        discoTotalFormatado: disco ? formatarBytes(disco.discoTotalBytes) : "Indisponível",

        discoUsadoBytes: disco ? disco.discoUsadoBytes : null,
        discoUsadoFormatado: disco ? formatarBytes(disco.discoUsadoBytes) : "Indisponível",

        discoUsadoPercentual: disco ? disco.discoUsadoPercentual : null,
        discoLivreSeguro,

        status,
        mensagem,
        podeReceberUpload: status !== "critico"
    };
}

/**
 * Formata bytes em texto amigável para exibição.
 *
 * Mantemos os valores originais em bytes para cálculos,
 * mas também retornamos uma versão formatada para a dashboard.
 */
function formatarBytes(bytes) {
    const valor = Number(bytes);

    if (!Number.isFinite(valor) || valor <= 0) {
        return "0 B";
    }

    const unidades = ["B", "KB", "MB", "GB", "TB"];
    const indice = Math.min(
        Math.floor(Math.log(valor) / Math.log(1024)),
        unidades.length - 1
    );

    const valorFormatado = valor / Math.pow(1024, indice);

    return `${valorFormatado.toLocaleString("pt-BR", {
        minimumFractionDigits: indice === 0 ? 0 : 2,
        maximumFractionDigits: indice === 0 ? 0 : 2
    })} ${unidades[indice]}`;
}

/**
 * Lê uma variável numérica do ambiente.
 *
 * Se a variável não existir, estiver vazia ou inválida,
 * usa o valor padrão informado.
 */
function obterNumeroEnv(nome, valorPadrao) {
    const valor = Number(process.env[nome]);

    if (!Number.isFinite(valor) || valor <= 0) {
        return valorPadrao;
    }

    return valor;
}

/**
 * Converte gigabytes para bytes.
 */
function gbParaBytes(gb) {
    return Number(gb) * 1024 * 1024 * 1024;
}

/**
 * Valida se o sistema pode receber um novo arquivo sem ultrapassar
 * os limites operacionais de armazenamento.
 *
 * Verifica:
 * - limite máximo da pasta midia/;
 * - reserva mínima de espaço livre no disco.
 */
function validarEspacoParaNovoArquivo(tamanhoNovoArquivoBytes) {
    const tamanhoArquivo = Number(tamanhoNovoArquivoBytes);

    if (!Number.isFinite(tamanhoArquivo) || tamanhoArquivo <= 0) {
        return {
            permitido: false,
            statusHttp: 400,
            mensagem: "Não foi possível identificar o tamanho do arquivo enviado."
        };
    }

    const resumo = obterResumoArmazenamento();

    const midiasDepoisDoUpload = resumo.midiasBytes + tamanhoArquivo;

    if (midiasDepoisDoUpload > resumo.limiteMidiasBytes) {
        return {
            permitido: false,
            statusHttp: 507,
            mensagem: `Não foi possível enviar o arquivo. O limite operacional da pasta de mídias seria ultrapassado. Limite configurado: ${resumo.limiteMidiasFormatado}. Uso atual: ${resumo.midiasFormatado}. Arquivo enviado: ${formatarBytes(tamanhoArquivo)}.`
        };
    }

    if (resumo.discoLivreBytes !== null) {
        const discoLivreDepoisDoUpload = resumo.discoLivreBytes - tamanhoArquivo;

        if (discoLivreDepoisDoUpload < resumo.minimoDiscoLivreBytes) {
            return {
                permitido: false,
                statusHttp: 507,
                mensagem: `Não foi possível enviar o arquivo. O servidor ficaria abaixo da reserva mínima de espaço livre. Reserva configurada: ${resumo.minimoDiscoLivreFormatado}. Espaço livre atual: ${resumo.discoLivreFormatado}. Arquivo enviado: ${formatarBytes(tamanhoArquivo)}.`
            };
        }
    }

    return {
        permitido: true,
        statusHttp: 200,
        mensagem: "Espaço disponível para upload."
    };
}

/**
 * Remove arquivos que já foram recebidos pelo Multer quando,
 * após o upload, a validação de armazenamento reprova a operação.
 */
function removerArquivosEnviadosComFalha(arquivos) {
    const listaArquivos = Array.isArray(arquivos) ? arquivos : [];

    listaArquivos.forEach((arquivo) => {
        if (!arquivo || !arquivo.path) return;

        try {
            if (fs.existsSync(arquivo.path)) {
                fs.unlinkSync(arquivo.path);
            }
        } catch (erro) {
            console.error(`Erro ao remover arquivo enviado com falha "${arquivo.filename}":`, erro);
        }
    });
}

/**
 * Validação preventiva para upload simples.
 *
 * Quando o navegador envia Content-Length, conseguimos bloquear antes
 * de o Multer gravar o arquivo. Como multipart/form-data possui uma
 * pequena sobrecarga além do tamanho real do arquivo, essa validação é
 * conservadora. A validação exata ainda acontece depois do upload.
 */
function validarEspacoAntesDoUploadSimples(req, res, next) {
    const contentLength = Number(req.headers["content-length"] || 0);

    if (!Number.isFinite(contentLength) || contentLength <= 0) {
        return next();
    }

    const validacao = validarEspacoParaNovoArquivo(contentLength);

    if (!validacao.permitido) {
        registrarAuditoriaUploadBloqueado(req, {
            tipoUpload: "simples-preventivo",
            motivo: "validacao_previa_content_length",
            mensagem: validacao.mensagem,
            tamanhoAvaliadoBytes: contentLength
        });

        return res.status(validacao.statusHttp).json({
            erro: true,
            mensagem: validacao.mensagem
        });
    }

    next();
}

/*
  Arquivo principal de configurações das mídias.

  Nele ficam salvos:
  - ativo/inativo;
  - duração de imagens;
  - ordem;
  - prioridade;
  - recorrência;
  - nome amigável;
  - início/fim de exibição.
*/
const mediaConfigFile = path.join(dataFolder, "midia-config.json");

/*
  Limite de backups por tipo.

  Exemplo:
  - mantém até 30 backups de playlist;
  - mantém até 30 backups de midia-config.
*/
const MAX_BACKUPS_POR_TIPO = 30;

/*
  Extensões aceitas.
*/
const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"];
const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];


/* =========================================================
   CRIAÇÃO DE PASTAS/ARQUIVOS NECESSÁRIOS
   ========================================================= */

/*
  Garante que as pastas essenciais existam.
*/
if (!fs.existsSync(mediaFolder)) {
    fs.mkdirSync(mediaFolder, { recursive: true });
}

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
}

if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder, { recursive: true });
}

/*
  Garante que o arquivo de configuração exista.
*/
if (!fs.existsSync(mediaConfigFile)) {
    fs.writeFileSync(mediaConfigFile, JSON.stringify({}, null, 2), "utf8");
}

/*
  Inicializa o banco SQLite.
  Isso cria as tabelas necessárias se ainda não existirem.
*/
initDatabase();

/* =========================================================
   FUNÇÕES UTILITÁRIAS - TEXTO E ARQUIVOS
   ========================================================= */

/**
 * Remove acentos de uma string.
 *
 * Exemplo:
 * "Saúde Pública" -> "Saude Publica"
 */
function removerAcentos(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Normaliza texto simples.
 *
 * Se o texto vier vazio, retorna o valor padrão informado.
 */
function normalizarTexto(texto, padrao = "") {
    const valor = String(texto || "").trim();

    return valor || padrao;
}

/**
 * Gera um título amigável padrão a partir do nome do arquivo.
 *
 * Exemplo:
 * video_campanha_saude_2026.mp4
 *
 * vira:
 * Video Campanha Saude 2026
 */
function gerarTituloPadrao(nomeArquivo) {
    const extensao = path.extname(nomeArquivo);
    const nomeBase = path.basename(nomeArquivo, extensao);

    return nomeBase
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

/**
 * Converte nome de arquivo enviado pelo usuário para nome seguro.
 *
 * Exemplo:
 * "Vídeo da Saúde (Final).mp4"
 *
 * vira:
 * "video_da_saude_final.mp4"
 */
function gerarNomeSeguro(nomeOriginal) {
    const extensao = path.extname(nomeOriginal).toLowerCase();
    const nomeSemExtensao = path.basename(nomeOriginal, extensao);

    let nomeSeguro = removerAcentos(nomeSemExtensao)
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_-]/g, "")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");

    if (!nomeSeguro) {
        nomeSeguro = "arquivo";
    }

    return `${nomeSeguro}${extensao}`;
}

/**
 * Evita sobrescrever arquivo existente.
 *
 * Se "video.mp4" já existir, cria:
 * - video_1.mp4
 * - video_2.mp4
 * - etc.
 */
function garantirNomeUnico(nomeArquivo) {
    const extensao = path.extname(nomeArquivo);
    const base = path.basename(nomeArquivo, extensao);

    let nomeFinal = nomeArquivo;
    let contador = 1;

    while (fs.existsSync(path.join(mediaFolder, nomeFinal))) {
        nomeFinal = `${base}_${contador}${extensao}`;
        contador++;
    }

    return nomeFinal;
}

/**
 * Verifica se a extensão de um arquivo é permitida.
 */
function extensaoPermitida(nomeArquivo) {
    const extensao = path.extname(nomeArquivo).toLowerCase();

    return videoExtensions.includes(extensao) || imageExtensions.includes(extensao);
}

/**
 * Retorna o tipo de mídia pela extensão.
 */
function obterTipoPorExtensao(extensao) {
    if (videoExtensions.includes(extensao)) return "video";
    if (imageExtensions.includes(extensao)) return "imagem";

    return "outro";
}


/* =========================================================
   FUNÇÕES UTILITÁRIAS - DATA/HORA
   ========================================================= */

/**
 * Normaliza data recebida de input datetime-local.
 *
 * O input datetime-local envia algo assim:
 * 2026-05-04T14:30
 *
 * Esse valor NÃO possui fuso horário.
 *
 * Como o sistema está pensado para Ribas do Rio Pardo/MS,
 * interpretamos esse horário como America/Campo_Grande,
 * que atualmente é UTC-04:00.
 *
 * Exemplo:
 * 2026-05-04T14:30
 *
 * vira:
 * 2026-05-04T18:30:00.000Z
 */
function normalizarDataOuNull(valor) {
    const texto = String(valor || "").trim();

    if (!texto) return null;

    /*
      Se já vier em ISO completo com Z, aceita normalmente.
    */
    if (texto.endsWith("Z")) {
        const dataIso = new Date(texto);

        if (Number.isNaN(dataIso.getTime())) {
            return null;
        }

        return dataIso.toISOString();
    }

    /*
      datetime-local geralmente vem:
      YYYY-MM-DDTHH:mm

      Acrescentamos segundos e fuso UTC-04:00.
    */
    const textoComFuso = texto.length === 16
        ? `${texto}:00-04:00`
        : `${texto}-04:00`;

    const data = new Date(textoComFuso);

    if (Number.isNaN(data.getTime())) {
        return null;
    }

    return data.toISOString();
}

/**
 * Verifica se uma mídia está dentro do período de exibição.
 *
 * Regras:
 * - sem início e sem fim: exibe sempre;
 * - início futuro: ainda não exibe;
 * - fim passado: não exibe mais;
 * - dentro do período: exibe.
 */
function midiaEstaDentroDaValidade(midia) {
    const agora = new Date();

    if (midia.inicio) {
        const inicio = new Date(midia.inicio);

        if (!Number.isNaN(inicio.getTime()) && agora < inicio) {
            return false;
        }
    }

    if (midia.fim) {
        const fim = new Date(midia.fim);

        if (!Number.isNaN(fim.getTime()) && agora > fim) {
            return false;
        }
    }

    return true;
}


/* =========================================================
   FUNÇÕES UTILITÁRIAS - BACKUP
   ========================================================= */

/**
 * Compara o JSON novo com o JSON já salvo.
 *
 * Se for igual, não precisa salvar nem criar backup.
 */
function jsonFoiAlterado(caminhoArquivo, dadosNovos) {
    try {
        const novoConteudo = JSON.stringify(dadosNovos, null, 2);

        if (!fs.existsSync(caminhoArquivo)) {
            return true;
        }

        const conteudoAtual = fs.readFileSync(caminhoArquivo, "utf8");

        return conteudoAtual.trim() !== novoConteudo.trim();
    } catch (erro) {
        console.error("Erro ao comparar JSON:", erro);
        return true;
    }
}

/**
 * Gera timestamp seguro para nome de arquivo usando horário local.
 *
 * Por que não usamos toISOString()?
 * ---------------------------------------------------------
 * toISOString() sempre usa UTC. Isso faria o nome do backup
 * ficar com horário diferente do horário local exibido no Windows
 * e no painel administrativo.
 *
 * Exemplo gerado:
 * 2026-05-26_14-50-08
 */
function gerarTimestampSeguro() {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");
    const segundo = String(agora.getSeconds()).padStart(2, "0");

    return `${ano}-${mes}-${dia}_${hora}-${minuto}-${segundo}`;
}

/**
 * Cria backup de um arquivo, se ele existir.
 */
function criarBackupArquivo(caminhoArquivo, prefixo) {
    try {
        if (!fs.existsSync(caminhoArquivo)) return null;

        const timestamp = gerarTimestampSeguro();
        const extensao = path.extname(caminhoArquivo) || ".json";

        const nomeBackup = `${prefixo}_${timestamp}${extensao}`;
        const caminhoBackup = path.join(backupFolder, nomeBackup);

        fs.copyFileSync(caminhoArquivo, caminhoBackup);

        const stats = fs.statSync(caminhoBackup);

        return {
            criado: true,
            prefixo,
            nome: nomeBackup,
            caminho: caminhoBackup,
            origem: caminhoArquivo,
            tamanhoBytes: stats.size,
            tamanhoFormatado: formatarBytes(stats.size),
            criadoEm: stats.birthtime.toISOString(),
            modificadoEm: stats.mtime.toISOString()
        };
    } catch (erro) {
        console.error("Erro ao criar backup:", erro);

        return {
            criado: false,
            prefixo,
            origem: caminhoArquivo,
            erro: erro.message || String(erro)
        };
    }
}

/**
 * Remove backups antigos de um determinado tipo.
 *
 * Exemplo:
 * prefixo "playlist" mantém só os últimos 30:
 * playlist_2026-...
 */
function limparBackupsAntigos(prefixo, limite = MAX_BACKUPS_POR_TIPO) {
    const resultado = {
        prefixo,
        limite,
        totalExistente: 0,
        totalRemovido: 0,
        removidos: []
    };

    try {
        if (!fs.existsSync(backupFolder)) return resultado;

        const arquivos = fs.readdirSync(backupFolder)
            .filter((arquivo) => arquivo.startsWith(`${prefixo}_`))
            .map((arquivo) => {
                const caminho = path.join(backupFolder, arquivo);
                const stats = fs.statSync(caminho);

                return {
                    arquivo,
                    caminho,
                    tamanhoBytes: stats.size,
                    tamanhoFormatado: formatarBytes(stats.size),
                    modificadoEm: stats.mtimeMs,
                    modificadoEmIso: stats.mtime.toISOString()
                };
            })
            .sort((a, b) => b.modificadoEm - a.modificadoEm);

        resultado.totalExistente = arquivos.length;

        const arquivosParaRemover = arquivos.slice(limite);

        arquivosParaRemover.forEach((item) => {
            fs.unlinkSync(item.caminho);

            resultado.totalRemovido++;

            resultado.removidos.push({
                nome: item.arquivo,
                tamanhoBytes: item.tamanhoBytes,
                tamanhoFormatado: item.tamanhoFormatado,
                modificadoEm: item.modificadoEmIso
            });
        });

        return resultado;
    } catch (erro) {
        console.error("Erro ao limpar backups antigos:", erro);

        resultado.erro = erro.message || String(erro);
        return resultado;
    }
}

/**
 * Salva JSON com backup automático.
 *
 * Importante:
 * - só salva se o conteúdo mudou;
 * - cria backup antes de sobrescrever;
 * - limpa backups antigos.
 */
function salvarJsonComBackup(caminhoArquivo, dados, prefixoBackup) {
    const alterou = jsonFoiAlterado(caminhoArquivo, dados);

    if (!alterou) {
        return {
            salvo: false,
            motivo: "Sem alterações"
        };
    }

    const backupCriado = criarBackupArquivo(caminhoArquivo, prefixoBackup);

    fs.writeFileSync(
        caminhoArquivo,
        JSON.stringify(dados, null, 2),
        "utf8"
    );

    const limpezaBackups = limparBackupsAntigos(prefixoBackup);

    const resultado = {
        salvo: true,
        motivo: "Arquivo atualizado",
        arquivoAtualizado: path.basename(caminhoArquivo),
        caminhoArquivo,
        prefixoBackup,
        backupCriado,
        limpezaBackups
    };

    registrarAuditoriaSistema("sistema.backup.json", {
        tipo: prefixoBackup,
        arquivoAtualizado: path.basename(caminhoArquivo),
        caminhoArquivo,
        backupCriado,
        limpezaBackups
    });

    return resultado;
}

/**
 * Cria um backup seguro do banco SQLite.
 *
 * Por que não usamos apenas fs.copyFileSync?
 * ---------------------------------------------------------
 * O SQLite pode estar com escrita ativa e usando WAL
 * (Write-Ahead Logging). Copiar o arquivo .db diretamente,
 * enquanto o banco está em uso, pode gerar um backup inconsistente.
 *
 * O better-sqlite3 possui o método db.backup(), que usa a API
 * própria do SQLite para criar uma cópia segura do banco aberto.
 *
 * Resultado:
 * - cria um arquivo .db dentro da pasta backups/;
 * - retorna metadados do arquivo criado;
 * - aplica rotação dos backups antigos;
 * - registra auditoria do sistema.
 */
async function criarBackupBancoSqlite() {
    const timestamp = gerarTimestampSeguro();
    const nomeBackup = `${DATABASE_BACKUP_PREFIX}_${timestamp}.db`;
    const caminhoBackup = path.join(backupFolder, nomeBackup);

    try {
        if (!fs.existsSync(databaseFile)) {
            return {
                sucesso: false,
                mensagem: "Arquivo do banco SQLite não encontrado.",
                databaseFile,
                backupCriado: null
            };
        }

        /*
          Garante que a pasta de backups exista.
          Mesmo que ela já seja criada no início do servidor,
          manter esta proteção aqui deixa a função mais segura.
        */
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder, { recursive: true });
        }

        /*
          Cria o backup usando a API do SQLite via better-sqlite3.
          Essa é a forma mais segura com o banco em uso.
        */
        await db.backup(caminhoBackup);

        const stats = fs.statSync(caminhoBackup);

        const backupCriado = {
            nome: nomeBackup,
            caminho: caminhoBackup,
            origem: databaseFile,
            tipo: "database",
            tamanhoBytes: stats.size,
            tamanhoFormatado: formatarBytes(stats.size),
            criadoEm: stats.birthtime.toISOString(),
            modificadoEm: stats.mtime.toISOString()
        };

        /*
          Reaproveitamos a rotação já existente.
          Ela mantém somente os últimos MAX_BACKUPS_POR_TIPO
          arquivos com prefixo database_.
        */
        const limpezaBackups = limparBackupsAntigos(DATABASE_BACKUP_PREFIX);

        registrarAuditoriaSistema("sistema.backup.database", {
            tipo: "database",
            arquivoAtualizado: path.basename(databaseFile),
            databaseFile,
            backupCriado,
            limpezaBackups
        });

        return {
            sucesso: true,
            mensagem: "Backup do banco SQLite criado com sucesso.",
            backupCriado,
            limpezaBackups
        };
    } catch (erro) {
        console.error("Erro ao criar backup do banco SQLite:", erro);

        registrarAuditoriaSistema("sistema.backup.database.falha", {
            tipo: "database",
            arquivoAtualizado: path.basename(databaseFile),
            databaseFile,
            caminhoBackup,
            erro: erro.message || String(erro)
        });

        return {
            sucesso: false,
            mensagem: "Erro ao criar backup do banco SQLite.",
            erro: erro.message || String(erro),
            backupCriado: null
        };
    }
}


/* =========================================================
   CONFIGURAÇÕES DE MÍDIA
   ========================================================= */

/**
 * Lê data/midia-config.json.
 *
 * Se der erro, retorna objeto vazio para o sistema não cair.
 * Também remove BOM invisível caso o arquivo seja salvo pelo PowerShell/Windows.
 */
function lerConfiguracoesDeMidia() {
    try {
        if (!fs.existsSync(mediaConfigFile)) {
            return {};
        }

        const conteudo = fs.readFileSync(mediaConfigFile, "utf8");
        const conteudoLimpo = conteudo.replace(/^\uFEFF/, "").trim();

        if (!conteudoLimpo) {
            return {};
        }

        return JSON.parse(conteudoLimpo);
    } catch (erro) {
        console.error("Erro ao ler configurações de mídia:", erro);
        return {};
    }
}

/**
 * Salva configurações das mídias com backup automático.
 */
function salvarConfiguracoesDeMidia(configuracoes) {
    salvarJsonComBackup(
        mediaConfigFile,
        configuracoes,
        "midia-config"
    );
}

/**
 * Normaliza prioridade.
 *
 * Valores aceitos:
 * - normal;
 * - alta;
 * - urgente.
 */
function normalizarPrioridade(prioridade) {
    const valor = String(prioridade || "normal").toLowerCase();

    if (["normal", "alta", "urgente"].includes(valor)) {
        return valor;
    }

    return "normal";
}

/**
 * Peso da prioridade.
 *
 * normal  = 1
 * alta    = 2
 * urgente = 3
 */
function obterPesoPrioridade(prioridade) {
    const valor = normalizarPrioridade(prioridade);

    if (valor === "urgente") return 3;
    if (valor === "alta") return 2;

    return 1;
}

/**
 * Lista mídias da pasta midia já mesclando configurações salvas.
 */
function listarMidiasDaPasta() {
    if (!fs.existsSync(mediaFolder)) {
        return [];
    }

    const configuracoes = lerConfiguracoesDeMidia();
    const arquivos = fs.readdirSync(mediaFolder);

    return arquivos
        .map((nomeArquivo) => {
            const caminhoCompleto = path.join(mediaFolder, nomeArquivo);
            const stats = fs.statSync(caminhoCompleto);

            if (!stats.isFile()) return null;

            const extensao = path.extname(nomeArquivo).toLowerCase();
            const tipo = obterTipoPorExtensao(extensao);

            if (tipo === "outro") return null;

            const configMidia = configuracoes[nomeArquivo] || {};

            return {
                nome: nomeArquivo,
                caminho: `midia/${nomeArquivo}`,
                extensao,
                tipo,
                tamanho: stats.size,
                modificadoEm: stats.mtime,

                ativo: configMidia.ativo !== false,

                duracao: Number(configMidia.duracao) > 0
                    ? Number(configMidia.duracao)
                    : 8,

                ordem: Number(configMidia.ordem) > 0
                    ? Number(configMidia.ordem)
                    : 999999,

                prioridade: normalizarPrioridade(configMidia.prioridade),

                repetirACada: Number(configMidia.repetirACada) > 0
                    ? Number(configMidia.repetirACada)
                    : 0,

                titulo: normalizarTexto(
                    configMidia.titulo,
                    gerarTituloPadrao(nomeArquivo)
                ),

                inicio: configMidia.inicio || null,
                fim: configMidia.fim || null
            };
        })
        .filter(Boolean);
}

/**
 * Normaliza a ordem das mídias.
 *
 * Exemplo:
 * se houver ordens 1, 5, 9,
 * reorganiza para 1, 2, 3.
 */
function normalizarOrdensDasMidias() {
    const configuracoes = lerConfiguracoesDeMidia();

    const midias = listarMidiasDaPasta()
        .sort((a, b) => {
            if (a.ordem !== b.ordem) {
                return a.ordem - b.ordem;
            }

            return a.nome.localeCompare(b.nome);
        });

    midias.forEach((midia, index) => {
        const configAtual = configuracoes[midia.nome] || {};

        configuracoes[midia.nome] = {
            ativo: configAtual.ativo !== false,

            duracao: Number(configAtual.duracao) > 0
                ? Number(configAtual.duracao)
                : 8,

            ordem: index + 1,

            prioridade: normalizarPrioridade(configAtual.prioridade),

            repetirACada: Number(configAtual.repetirACada) > 0
                ? Number(configAtual.repetirACada)
                : 0,

            titulo: normalizarTexto(
                configAtual.titulo,
                gerarTituloPadrao(midia.nome)
            ),

            inicio: configAtual.inicio || null,
            fim: configAtual.fim || null
        };
    });

    salvarConfiguracoesDeMidia(configuracoes);

    return configuracoes;
}


/* =========================================================
   PLAYLIST
   ========================================================= */

/**
 * Gera o arquivo playlist.json.
 *
 * Regras aplicadas:
 * - somente mídias ativas;
 * - somente mídias dentro da validade;
 * - ordem manual;
 * - duração de imagens;
 * - título amigável;
 * - recorrência a cada X mídias;
 * - fallback de prioridade simples.
 */
function gerarPlaylistArquivo() {
    const playlistFile = path.join(projectRoot, "playlist.json");

    normalizarOrdensDasMidias();

    const midiasAtivas = listarMidiasDaPasta()
        .filter((midia) => midia.ativo)
        .filter((midia) => midiaEstaDentroDaValidade(midia))
        .sort((a, b) => {
            if (a.ordem !== b.ordem) {
                return a.ordem - b.ordem;
            }

            return a.nome.localeCompare(b.nome);
        });

    /**
     * Converte a mídia interna para o formato usado pelo player.
     */
    function converterMidiaParaPlaylist(midia) {
        if (midia.tipo === "video") {
            return {
                tipo: "video",
                arquivo: midia.caminho,
                titulo: midia.titulo
            };
        }

        if (midia.tipo === "imagem") {
            return {
                tipo: "imagem",
                arquivo: midia.caminho,
                duracao: midia.duracao,
                titulo: midia.titulo
            };
        }

        return null;
    }

    /**
 * Retorna um identificador estável da mídia dentro da playlist.
 *
 * Usamos o campo "arquivo" porque ele representa o caminho real
 * usado pelo player, por exemplo:
 *
 * midia/video-institucional.mp4
 *
 * Esse identificador permite comparar se dois itens representam
 * a mesma mídia, mesmo quando ela aparece como item original
 * ou como repetição.
 */
    function obterChaveItemPlaylist(item) {
        return item && item.arquivo
            ? String(item.arquivo)
            : "";
    }

    /**
     * Calcula a distância mínima recomendada entre duas aparições
     * da mesma mídia.
     *
     * Regra adotada:
     * - usa metade do intervalo de repetição;
     * - nunca permite menos de 2 posições de distância.
     *
     * Exemplo:
     * repetir a cada 6 mídias => distância mínima 3.
     * repetir a cada 3 mídias => distância mínima 2.
     */
    function calcularDistanciaMinimaRepeticao(intervalo) {
        const intervaloSeguro = Math.max(1, Number(intervalo || 1));

        return Math.max(
            2,
            Math.floor(intervaloSeguro / 2)
        );
    }

    /**
     * Verifica se uma mídia apareceu recentemente na playlist já montada.
     *
     * Isso evita casos como:
     * - mídia original;
     * - outra mídia;
     * - repetição da mesma mídia logo em seguida.
     */
    function itemApareceuRecentemente(playlist, item, distanciaMinima) {
        const chaveItem = obterChaveItemPlaylist(item);

        if (!chaveItem) return false;

        const distanciaSegura = Math.max(1, Number(distanciaMinima || 1));
        const ultimosItens = playlist.slice(-distanciaSegura);

        return ultimosItens.some((itemExistente) => {
            return obterChaveItemPlaylist(itemExistente) === chaveItem;
        });
    }

    /**
     * Verifica se a mídia original aparecerá logo adiante na playlist base.
     *
     * Essa proteção evita inserir uma repetição imediatamente antes
     * da posição original da própria mídia.
     *
     * Exemplo evitado:
     * - repetição da mídia X;
     * - mídia X original logo depois.
     *
     * A busca é circular, ou seja, também considera o início da playlist
     * quando estamos perto do final.
     */
    function distanciaAteProximaAparicaoBase(playlistBase, indiceAtual, item, limiteBusca) {
        const chaveItem = obterChaveItemPlaylist(item);

        if (!chaveItem || !playlistBase.length) return null;

        const limiteSeguro = Math.max(1, Number(limiteBusca || 1));
        const total = playlistBase.length;

        for (let deslocamento = 1; deslocamento <= limiteSeguro; deslocamento++) {
            const indiceProximo = (indiceAtual + deslocamento) % total;
            const proximoItem = playlistBase[indiceProximo];

            if (obterChaveItemPlaylist(proximoItem) === chaveItem) {
                return deslocamento;
            }
        }

        return null;
    }

    /**
     * Cria o estado de controle de uma mídia recorrente.
     *
     * A parte mais importante aqui é a posição inicial.
     *
     * Como a playlist roda em loop, uma mídia que está perto do final
     * da playlist já apareceu no ciclo anterior antes do item 1 rodar.
     *
     * Exemplo:
     * - playlist base tem 10 itens;
     * - mídia X está na posição 8;
     * - ao começar um novo ciclo, consideramos que ela apareceu
     *   na posição 8 do ciclo anterior.
     *
     * Isso impede que o contador "resete" no início da playlist.
     */
    function criarEstadoRecorrencia(midia, playlistBase) {
        const item = converterMidiaParaPlaylist(midia);

        if (!item) return null;

        const chave = obterChaveItemPlaylist(item);
        const intervalo = Number(midia.repetirACada || 0);

        if (!chave || intervalo <= 0) return null;

        const indiceOriginal = playlistBase.findIndex((itemBase) => {
            return obterChaveItemPlaylist(itemBase) === chave;
        });

        /*
          Posição inicial considerando o ciclo anterior.

          Se a mídia está na posição 8 de uma playlist com 10 itens:
          indiceOriginal = 7
          posição anterior = 8 - 10 = -2

          Então, após tocar o item 1 do ciclo atual:
          distância = 1 - (-2) = 3

          Isso faz a recorrência atravessar corretamente o loop.
        */
        const ultimaPosicao = indiceOriginal >= 0
            ? (indiceOriginal + 1) - playlistBase.length
            : 0;

        return {
            midia,
            item,
            chave,
            intervalo,
            distanciaMinima: calcularDistanciaMinimaRepeticao(intervalo),
            ultimaPosicao
        };
    }

    /*
      Playlist base:
      todas as mídias ativas entram uma vez.
    */
    const playlistBase = midiasAtivas
        .map(converterMidiaParaPlaylist)
        .filter(Boolean);

    /*
      Mídias com repetição configurada.
      Exemplo:
      repetirACada = 4
      significa entrar novamente a cada 4 itens.
    */
    const midiasComRepeticao = midiasAtivas
        .filter((midia) => Number(midia.repetirACada) > 0)
        .sort((a, b) => {
            const pesoA = obterPesoPrioridade(a.prioridade);
            const pesoB = obterPesoPrioridade(b.prioridade);

            if (pesoA !== pesoB) {
                return pesoB - pesoA;
            }

            return a.ordem - b.ordem;
        });

    /*
    Se houver recorrência configurada, ela prevalece.
    Isso evita duplicar excessivamente usando prioridade + repetição.

    Fase 3 — recorrência inteligente:
    ---------------------------------
    A regra anterior usava apenas:
    posição atual % intervalo === 0

    Isso causava dois problemas:
    - a mídia podia repetir muito perto dela mesma;
    - a contagem reiniciava no começo da playlist, ignorando o loop.

    Agora cada mídia recorrente possui um contador próprio.
    Assim, a recorrência considera a última aparição real daquela mídia,
    inclusive quando a playlist volta do final para o início.
    */
    if (midiasComRepeticao.length > 0) {
        const playlistFinal = [];

        /*
          Posição de exibição dentro da playlist final.

          Diferente do índice da playlist base, essa posição também conta
          repetições inseridas dinamicamente.
        */
        let posicaoExibicao = 0;

        /*
          Cria o estado de cada mídia recorrente.

          Cada estado guarda:
          - item convertido para playlist;
          - intervalo de repetição;
          - última posição em que apareceu;
          - distância mínima contra duplicação visual.
        */
        const estadosRecorrencia = midiasComRepeticao
            .map((midia) => criarEstadoRecorrencia(midia, playlistBase))
            .filter(Boolean);

        playlistBase.forEach((itemBase, index) => {
            playlistFinal.push(itemBase);
            posicaoExibicao++;

            const chaveBase = obterChaveItemPlaylist(itemBase);

            /*
              Se o item base atual for uma mídia com recorrência,
              atualizamos sua última aparição.

              Isso faz a posição original da mídia também contar como
              aparição válida e reinicia o intervalo dela.
            */
            estadosRecorrencia.forEach((estado) => {
                if (estado.chave === chaveBase) {
                    estado.ultimaPosicao = posicaoExibicao;
                }
            });

            /*
              Após inserir a mídia normal da playlist, verificamos
              se alguma mídia recorrente já atingiu seu intervalo.
            */
            estadosRecorrencia.forEach((estado) => {
                const distanciaDesdeUltimaAparicao = posicaoExibicao - estado.ultimaPosicao;

                if (distanciaDesdeUltimaAparicao < estado.intervalo) {
                    return;
                }

                /*
                  Evita repetir se a mesma mídia apareceu há poucas posições.
                */
                if (itemApareceuRecentemente(
                    playlistFinal,
                    estado.item,
                    estado.distanciaMinima
                )) {
                    return;
                }

                /*
                  Evita repetir se a posição original da mesma mídia
                  aparecerá logo adiante.

                  Isso resolve casos em que a repetição cairia imediatamente
                  antes da mídia original.
                */
                const distanciaProximaOriginal = distanciaAteProximaAparicaoBase(
                    playlistBase,
                    index,
                    estado.item,
                    estado.distanciaMinima
                );

                if (
                    distanciaProximaOriginal !== null &&
                    distanciaProximaOriginal <= estado.distanciaMinima
                ) {
                    return;
                }

                playlistFinal.push(estado.item);
                posicaoExibicao++;

                /*
                  A repetição também conta como aparição.
                  Portanto, atualizamos a última posição da mídia.
                */
                estado.ultimaPosicao = posicaoExibicao;
            });
        });

        salvarJsonComBackup(
            playlistFile,
            playlistFinal,
            "playlist"
        );

        return {
            total: playlistFinal.length,
            playlist: playlistFinal
        };
    }

    /*
      Fallback de prioridade simples:
      normal  = entra 1 vez
      alta    = entra 2 vezes
      urgente = entra 3 vezes
    */
    const playlist = [];

    midiasAtivas.forEach((midia) => {
        const item = converterMidiaParaPlaylist(midia);

        if (item) {
            playlist.push(item);
        }
    });

    midiasAtivas.forEach((midia) => {
        const peso = obterPesoPrioridade(midia.prioridade);

        if (peso >= 2) {
            const item = converterMidiaParaPlaylist(midia);

            if (item) {
                playlist.push(item);
            }
        }
    });

    midiasAtivas.forEach((midia) => {
        const peso = obterPesoPrioridade(midia.prioridade);

        if (peso >= 3) {
            const item = converterMidiaParaPlaylist(midia);

            if (item) {
                playlist.push(item);
            }
        }
    });

    salvarJsonComBackup(
        playlistFile,
        playlist,
        "playlist"
    );

    return {
        total: playlist.length,
        playlist
    };
}

/**
 * Publica a playlist sem derrubar a rota principal.
 *
 * Usada após:
 * - upload;
 * - exclusão;
 * - alteração de configuração;
 * - rotina automática.
 */
function publicarPlaylistAutomaticamente() {
    try {
        const resultado = gerarPlaylistArquivo();

        return {
            sucesso: true,
            total: resultado.total
        };
    } catch (erro) {
        console.error("Erro ao publicar playlist automaticamente:", erro);

        return {
            sucesso: false,
            mensagem: "A alteração foi salva, mas houve erro ao gerar a playlist."
        };
    }
}


/* =========================================================
   CONFIGURAÇÃO DO UPLOAD - MULTER
   ========================================================= */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, mediaFolder);
    },

    filename: (req, file, cb) => {
        const nomeSeguro = gerarNomeSeguro(file.originalname);
        const nomeUnico = garantirNomeUnico(nomeSeguro);

        cb(null, nomeUnico);
    }
});

const upload = multer({
    storage,

    fileFilter: (req, file, cb) => {
        if (!extensaoPermitida(file.originalname)) {
            return cb(new Error("Tipo de arquivo não permitido."));
        }

        cb(null, true);
    },

    /*
      Limite inicial: 2 GB.
      Pode ser ajustado conforme o servidor.
    */
    limits: {
        fileSize: 2 * 1024 * 1024 * 1024
    }
});

/* =========================================================
   UPLOAD EM PARTES / CHUNKS
   ========================================================== */

const chunkStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadId = String(req.body.uploadId || "").replace(/[^a-zA-Z0-9_-]/g, "");
        const pastaUpload = path.join(chunksFolder, uploadId);

        if (!uploadId) {
            return cb(new Error("Identificador de upload inválido."));
        }

        if (!fs.existsSync(pastaUpload)) {
            fs.mkdirSync(pastaUpload, { recursive: true });
        }

        cb(null, pastaUpload);
    },
    filename: (req, file, cb) => {
        const indice = Number(req.body.indice);

        if (!Number.isInteger(indice) || indice < 0) {
            return cb(new Error("Índice do pedaço inválido."));
        }

        cb(null, `chunk-${String(indice).padStart(6, "0")}.part`);
    }
});

const uploadChunk = multer({
    storage: chunkStorage,
    limits: {
        fileSize: 60 * 1024 * 1024
    }
});

/* =========================================================
   MIDDLEWARES
   ========================================================= */

/*
  Permite que o Express leia JSON no corpo das requisições.

  Importante:
  Precisa vir antes das rotas que usam req.body.
*/
app.use(express.json());

/* =========================================================
   CONFIGURAÇÕES DE SESSÃO / INATIVIDADE
   ========================================================= */

const SESSION_COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 8;

const SESSION_INACTIVITY_TIMEOUT_MINUTES = Number(
    process.env.SESSION_INACTIVITY_TIMEOUT_MINUTES || 30
);

const SESSION_INACTIVITY_TIMEOUT_MS =
    Number.isFinite(SESSION_INACTIVITY_TIMEOUT_MINUTES) &&
        SESSION_INACTIVITY_TIMEOUT_MINUTES > 0
        ? SESSION_INACTIVITY_TIMEOUT_MINUTES * 60 * 1000
        : 30 * 60 * 1000;

/*
  Sessão do painel administrativo.

  Importante:
  Deve vir depois do express.json e antes das rotas protegidas.
*/
app.use(session({
    secret: process.env.SESSION_SECRET || "painel-tv-prefeitura-ribas-secret-dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: SESSION_COOKIE_MAX_AGE_MS,
        httpOnly: true,
        sameSite: "lax",
        secure: false
    }
}));

/* =========================================================
   PROTEÇÃO DO ADMIN
   ========================================================= */

/**
 * Verifica se existe usuário logado na sessão.
 *
 * A sessão nova usa:
 * req.session.user
 *
 * Durante a transição, também aceitamos adminLogado antigo
 * para evitar travar testes locais.
 */
function exigirLogin(req, res, next) {
    if (existeSessaoAdministrativa(req)) {
        if (sessaoAtualFoiRevogada(req)) {
            return encerrarSessaoRevogada(req, res);
        }

        if (sessaoExpiradaPorInatividade(req)) {
            return encerrarSessaoPorInatividade(req, res);
        }

        atualizarUltimaAtividadeSessao(req);
        atualizarUltimoUsoDaSessaoAtiva(req);

        return next();
    }

    if (req.path.startsWith("/api")) {
        return res.status(401).json({
            erro: true,
            mensagem: "Acesso não autorizado. Faça login novamente."
        });
    }

    return res.redirect("/admin/login");
}

/* =========================================================
   PERMISSÕES / ROLES
   =========================================================

   Perfis previstos:
   - superadmin: acesso total
   - admin: gerencia conteúdo e usuários comuns
   - editor: gerencia mídias/conteúdo
   - viewer: apenas visualização

   A função exigirRole() protege rotas específicas.
   ========================================================= */

/**
 * Retorna o usuário logado salvo na sessão.
 */
function obterUsuarioDaSessao(req) {
    return req.session && req.session.user
        ? req.session.user
        : null;
}

/**
 * Retorna true quando existe uma sessão administrativa ativa.
 */
function existeSessaoAdministrativa(req) {
    return !!(
        req.session &&
        (req.session.user || req.session.adminLogado)
    );
}

/**
 * Verifica se a sessão passou do tempo máximo de inatividade.
 */
function sessaoExpiradaPorInatividade(req) {
    if (!existeSessaoAdministrativa(req)) {
        return false;
    }

    const ultimaAtividadeEm = Number(
        req.session.ultimaAtividadeEm ||
        req.session.loginEm ||
        0
    );

    if (!ultimaAtividadeEm) {
        return false;
    }

    const tempoInativoMs = Date.now() - ultimaAtividadeEm;

    return tempoInativoMs > SESSION_INACTIVITY_TIMEOUT_MS;
}

/**
 * Atualiza a última atividade da sessão.
 */
function atualizarUltimaAtividadeSessao(req) {
    if (!existeSessaoAdministrativa(req)) {
        return;
    }

    req.session.ultimaAtividadeEm = Date.now();
}

/* =========================================================
   CONTROLE DE SESSÕES SIMULTÂNEAS
   ========================================================= */

/**
 * Registra a sessão atual como sessão ativa do usuário.
 *
 * Regra inicial:
 * - ao fazer login, revogamos sessões antigas do mesmo usuário;
 * - somente a sessão atual continua válida.
 */
function registrarSessaoAtivaDoUsuario(req, usuario) {
    const sessionId = req.sessionID;

    if (!sessionId || !usuario || !usuario.id) {
        return {
            sessoesRevogadas: 0
        };
    }

    const agora = new Date().toISOString();
    const ip = obterIpRequisicao(req);
    const userAgent = req.headers["user-agent"] || "";

    const transacao = db.transaction(() => {
        const resultadoRevogacao = db.prepare(`
            UPDATE user_sessions
            SET
                revoked_at = datetime('now', 'localtime'),
                revoked_reason = 'novo_login'
            WHERE user_id = ?
              AND session_id <> ?
              AND revoked_at IS NULL
        `).run(usuario.id, sessionId);

        const sessaoExistente = db.prepare(`
            SELECT id
            FROM user_sessions
            WHERE session_id = ?
            LIMIT 1
        `).get(sessionId);

        if (sessaoExistente) {
            db.prepare(`
                UPDATE user_sessions
                SET
                    user_id = ?,
                    ip = ?,
                    user_agent = ?,
                    last_seen_at = datetime('now', 'localtime'),
                    revoked_at = NULL,
                    revoked_reason = NULL
                WHERE session_id = ?
            `).run(
                usuario.id,
                ip,
                userAgent,
                sessionId
            );
        } else {
            db.prepare(`
                INSERT INTO user_sessions (
                    user_id,
                    session_id,
                    ip,
                    user_agent,
                    created_at,
                    last_seen_at
                )
                VALUES (?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
            `).run(
                usuario.id,
                sessionId,
                ip,
                userAgent
            );
        }

        return {
            sessoesRevogadas: resultadoRevogacao.changes || 0,
            registradoEm: agora
        };
    });

    return transacao();
}

/**
 * Verifica se a sessão atual foi revogada.
 */
function sessaoAtualFoiRevogada(req) {
    if (!req.sessionID) {
        return false;
    }

    const sessao = db.prepare(`
        SELECT
            revoked_at,
            revoked_reason
        FROM user_sessions
        WHERE session_id = ?
        LIMIT 1
    `).get(req.sessionID);

    return !!(sessao && sessao.revoked_at);
}

/**
 * Atualiza o último uso da sessão atual.
 */
function atualizarUltimoUsoDaSessaoAtiva(req) {
    if (!req.sessionID || !existeSessaoAdministrativa(req)) {
        return;
    }

    try {
        db.prepare(`
            UPDATE user_sessions
            SET last_seen_at = datetime('now', 'localtime')
            WHERE session_id = ?
              AND revoked_at IS NULL
        `).run(req.sessionID);
    } catch (erro) {
        console.error("Erro ao atualizar último uso da sessão:", erro);
    }
}

/**
 * Marca a sessão atual como revogada.
 */
function revogarSessaoAtual(req, motivo = "manual") {
    if (!req.sessionID) {
        return;
    }

    try {
        db.prepare(`
            UPDATE user_sessions
            SET
                revoked_at = datetime('now', 'localtime'),
                revoked_reason = ?
            WHERE session_id = ?
              AND revoked_at IS NULL
        `).run(motivo, req.sessionID);
    } catch (erro) {
        console.error("Erro ao revogar sessão atual:", erro);
    }
}

/**
 * Encerra requisições feitas por sessão revogada.
 */
function encerrarSessaoRevogada(req, res) {
    const usuario = req.session && req.session.user
        ? req.session.user
        : null;

    try {
        registrarAuditoria(req, "login.sessao.revogada", {
            usuarioId: usuario ? usuario.id : null,
            usuario: usuario ? usuario.email : null,
            sessionId: req.sessionID || null,
            motivo: "sessao_revogada_ou_novo_login"
        });
    } catch (erro) {
        console.error("Erro ao registrar auditoria de sessão revogada:", erro);
    }

    req.session.destroy(() => {
        if (req.path.startsWith("/api")) {
            return res.status(401).json({
                erro: true,
                codigo: "SESSAO_REVOGADA",
                mensagem: "Esta sessão foi encerrada porque houve um novo login deste usuário."
            });
        }

        return res.redirect("/admin/login");
    });
}

/**
 * Encerra a sessão quando expirar por inatividade.
 */
function encerrarSessaoPorInatividade(req, res) {
    const usuario = req.session && req.session.user
        ? req.session.user
        : null;

    try {
        registrarAuditoria(req, "login.expirado.inatividade", {
            usuario: usuario ? usuario.email : null,
            usuarioId: usuario ? usuario.id : null,
            timeoutMinutos: SESSION_INACTIVITY_TIMEOUT_MS / 1000 / 60
        });
    } catch (erro) {
        console.error("Erro ao registrar auditoria de sessão expirada:", erro);
    }

    revogarSessaoAtual(req, "inatividade");

    req.session.destroy(() => {
        if (req.path.startsWith("/api")) {
            return res.status(401).json({
                erro: true,
                codigo: "SESSAO_EXPIRADA_INATIVIDADE",
                mensagem: "Sessão encerrada por inatividade. Faça login novamente."
            });
        }

        return res.redirect("/admin/login");
    });
}

function obterIpRequisicao(req) {
    const ip = (
        req.headers["cf-connecting-ip"] ||
        req.headers["true-client-ip"] ||
        req.headers["x-real-ip"] ||
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        ""
    ).toString().split(",")[0].trim();

    if (ip === "::1") {
        return "localhost";
    }

    if (ip === "::ffff:127.0.0.1") {
        return "localhost";
    }

    return ip;
}

function registrarAuditoria(req, acao, detalhes = {}) {
    try {
        const usuario = obterUsuarioDaSessao(req);

        db.prepare(`
            INSERT INTO audit_logs (
                user_id,
                user_name,
                user_email,
                user_role,
                action,
                details,
                ip,
                user_agent,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
        `).run(
            usuario ? usuario.id : null,
            usuario ? usuario.nome : "Sistema",
            usuario ? usuario.email : null,
            usuario ? usuario.role : null,
            acao,
            JSON.stringify(detalhes || {}),
            obterIpRequisicao(req),
            req.headers["user-agent"] || ""
        );
    } catch (erro) {
        console.error("Erro ao registrar auditoria:", erro);
    }
}

/**
 * Registra auditorias executadas automaticamente pelo sistema,
 * sem depender de uma requisição HTTP ou usuário logado.
 *
 * Usado para rotinas internas como:
 * - limpeza automática de chunks antigos;
 * - futuras manutenções agendadas;
 * - rotinas preventivas da Fase 3.
 */
function registrarAuditoriaSistema(acao, detalhes = {}) {
    try {
        db.prepare(`
            INSERT INTO audit_logs (
                user_id,
                user_name,
                user_email,
                user_role,
                action,
                details,
                ip,
                user_agent,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
        `).run(
            null,
            "Sistema",
            null,
            "system",
            acao,
            JSON.stringify(detalhes || {}),
            null,
            "rotina-interna"
        );
    } catch (erro) {
        console.error("Erro ao registrar auditoria do sistema:", erro);
    }
}

/**
 * Registra em auditoria quando um upload é bloqueado por limite
 * operacional de armazenamento.
 *
 * Essa auditoria ajuda a entender:
 * - quem tentou enviar;
 * - qual era o tamanho do arquivo/requisição;
 * - qual limite foi atingido;
 * - qual era o estado do armazenamento no momento.
 */
function registrarAuditoriaUploadBloqueado(req, detalhes = {}) {
    try {
        const resumo = obterResumoArmazenamento();
        const tamanhoAvaliadoBytes = Number(detalhes.tamanhoAvaliadoBytes || 0);

        registrarAuditoria(req, "midia.upload.bloqueado", {
            motivo: detalhes.motivo || "armazenamento",
            tipoUpload: detalhes.tipoUpload || "indefinido",
            mensagem: detalhes.mensagem || "Upload bloqueado por limite de armazenamento.",

            nomeOriginal: detalhes.nomeOriginal || null,
            uploadId: detalhes.uploadId || null,
            totalChunks: detalhes.totalChunks || null,

            tamanhoAvaliadoBytes,
            tamanhoAvaliadoFormatado: formatarBytes(tamanhoAvaliadoBytes),

            arquivos: Array.isArray(detalhes.arquivos)
                ? detalhes.arquivos
                : [],

            armazenamento: {
                midiasBytes: resumo.midiasBytes,
                midiasFormatado: resumo.midiasFormatado,

                limiteMidiasBytes: resumo.limiteMidiasBytes,
                limiteMidiasFormatado: resumo.limiteMidiasFormatado,
                midiasUsoPercentual: resumo.midiasUsoPercentual,

                discoLivreBytes: resumo.discoLivreBytes,
                discoLivreFormatado: resumo.discoLivreFormatado,

                minimoDiscoLivreBytes: resumo.minimoDiscoLivreBytes,
                minimoDiscoLivreFormatado: resumo.minimoDiscoLivreFormatado,

                status: resumo.status,
                podeReceberUpload: resumo.podeReceberUpload
            }
        });
    } catch (erro) {
        console.error("Erro ao registrar auditoria de upload bloqueado:", erro);
    }
}

/**
 * Verifica se o usuário logado possui uma das roles permitidas.
 *
 * Uso:
 * app.post("/rota", exigirLogin, exigirRole("superadmin", "admin"), ...)
 */
function exigirRole(...rolesPermitidas) {
    return (req, res, next) => {
        const usuario = obterUsuarioDaSessao(req);

        if (!usuario) {
            return res.status(401).json({
                erro: true,
                mensagem: "Usuário não autenticado."
            });
        }

        if (!rolesPermitidas.includes(usuario.role)) {
            return res.status(403).json({
                erro: true,
                mensagem: "Você não tem permissão para executar esta ação."
            });
        }

        return next();
    };
}

/**
 * Atalho para rotas administrativas sensíveis.
 *
 * Superadmin e admin podem usar.
 */
function exigirAdmin(req, res, next) {
    return exigirRole("superadmin", "admin")(req, res, next);
}

/**
 * Atalho para rotas de edição de conteúdo.
 *
 * Superadmin, admin e editor podem usar.
 */
function exigirEditor(req, res, next) {
    return exigirRole("superadmin", "admin", "editor")(req, res, next);
}

/* =========================================================
   PROTEÇÕES DE USUÁRIOS ADMINISTRATIVOS
   =========================================================
   Helpers reaproveitáveis para proteger operações sensíveis
   envolvendo usuários administrativos.

   Observação:
   O projeto usa:
   - req.session.user para guardar o usuário logado;
   - tabela users no SQLite.
   ========================================================= */

/**
 * Retorna true se o usuário logado for superadmin.
 */
function usuarioSessaoEhSuperadmin(req) {
    const usuario = obterUsuarioDaSessao(req);

    return usuario && usuario.role === "superadmin";
}

/**
 * Retorna true se o usuário logado estiver tentando agir
 * sobre o próprio cadastro.
 */
function usuarioEstaAlterandoASiMesmo(req, idAlvo) {
    const usuario = obterUsuarioDaSessao(req);

    if (!usuario) return false;

    return Number(usuario.id) === Number(idAlvo);
}

/**
 * Busca um usuário alvo no banco pelo ID.
 *
 * Como o projeto usa better-sqlite3, a consulta é síncrona.
 * Retorna:
 * - o usuário, se encontrar;
 * - null, se não encontrar.
 */
function buscarUsuarioAlvoPorId(idUsuario) {
    return db.prepare(`
        SELECT
            id,
            nome,
            email,
            role,
            ativo
        FROM users
        WHERE id = ?
        LIMIT 1
    `).get(idUsuario) || null;
}

/**
 * Impede que admin comum altere superadmin.
 *
 * Retorna true quando bloqueou a ação.
 * Retorna false quando pode continuar.
 */
function bloquearAdminAlterandoSuperadmin(req, res, usuarioAlvo) {
    const alvoEhSuperadmin = usuarioAlvo && usuarioAlvo.role === "superadmin";
    const logadoEhSuperadmin = usuarioSessaoEhSuperadmin(req);

    if (alvoEhSuperadmin && !logadoEhSuperadmin) {
        res.status(403).json({
            erro: true,
            mensagem: "Somente um superadmin pode alterar outro superadmin."
        });

        return true;
    }

    return false;
}

/* =========================================================
   SERVICE WORKER DO PLAYER
   =========================================================
   O Service Worker precisa ser servido a partir da raiz do site
   para poder controlar o player e interceptar requisições de mídia.
   ========================================================= */

app.get("/sw-player.js", (req, res) => {
    const swPath = path.join(projectRoot, "sw-player.js");

    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Service-Worker-Allowed", "/");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.sendFile(swPath);
});

/* =========================================================
   ARQUIVOS ESTÁTICOS PÚBLICOS
   =========================================================

   Importante:
   Não servimos a raiz inteira do projeto.

   Isso evita expor:
   - .env;
   - server.js;
   - data/;
   - backups/;
   - package.json;
   - outros arquivos internos.
   ========================================================= */
/*
  Anti-cache do frontend administrativo.

  Precisa vir antes do express.static para os headers serem aplicados
  quando o Express entregar admin.html, admin.css e admin.js.
*/
app.use(aplicarHeadersAntiCacheAdmin);

app.use("/assets", express.static(path.join(projectRoot, "assets")));
app.use("/midia", express.static(mediaFolder));

/*
  Arquivos estáticos do admin.

  HTMLs principais são tratados por rotas específicas.
*/
app.use("/admin", (req, res, next) => {
    if (req.path === "/index.html") {
        return exigirLogin(req, res, () => {
            res.sendFile(path.join(adminFolder, "index.html"));
        });
    }

    if (req.path === "/login.html") {
        return res.redirect("/admin/login");
    }

    next();
}, express.static(adminFolder, {
    index: false,
    dotfiles: "ignore"
}));

/*
  Arquivos públicos usados pelo player.
*/
app.get("/style.css", (req, res) => {
    res.sendFile(path.join(projectRoot, "style.css"));
});

app.get("/script.js", (req, res) => {
    res.sendFile(path.join(projectRoot, "script.js"));
});

app.get("/config.json", (req, res) => {
    res.sendFile(path.join(projectRoot, "config.json"));
});

app.get("/playlist.json", (req, res) => {
    res.sendFile(path.join(projectRoot, "playlist.json"));
});


/* =========================================================
   ROTAS DE LOGIN
   ========================================================= */

app.get("/admin/login", (req, res) => {
    if (req.session && req.session.adminLogado) {
        return res.redirect("/admin");
    }

    res.sendFile(path.join(adminFolder, "login.html"));
});

/* =========================================================
   API: LOGIN
   =========================================================
   Autentica usuário usando SQLite + bcrypt.

   Espera receber:
   {
     "email": "admin",
     "password": "admin123"
   }

   Observação:
   O campo se chama "email", mas pode ser usado como login também.
   ========================================================= */

app.post("/api/login", (req, res) => {
    try {
        const email = String(req.body.email || req.body.login || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        if (!email || !password) {
            return res.status(400).json({
                erro: true,
                mensagem: "Informe usuário e senha."
            });
        }

        const usuario = db.prepare(`
            SELECT
                id,
                nome,
                email,
                senha_hash,
                role,
                secretaria_id,
                ativo
            FROM users
            WHERE LOWER(email) = ?
            LIMIT 1
        `).get(email);

        if (!usuario) {
            return res.status(401).json({
                erro: true,
                mensagem: "Usuário ou senha inválidos."
            });
        }

        if (Number(usuario.ativo) !== 1) {
            return res.status(403).json({
                erro: true,
                mensagem: "Usuário desativado. Procure o administrador."
            });
        }

        const senhaValida = bcrypt.compareSync(password, usuario.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({
                erro: true,
                mensagem: "Usuário ou senha inválidos."
            });
        }

        /*
          Grava usuário na sessão.

          Importante:
          Nunca gravamos senha ou hash na sessão.
        */
        req.session.user = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role,
            secretariaId: usuario.secretaria_id || null
        };

        req.session.loginEm = Date.now();
        req.session.ultimaAtividadeEm = Date.now();

        /*
          Mantemos esta flag por compatibilidade temporária.
          Depois podemos remover.
        */
        req.session.adminLogado = true;

        req.session.save((erro) => {
            if (erro) {
                console.error("Erro ao salvar sessão:", erro);

                return res.status(500).json({
                    erro: true,
                    mensagem: "Erro ao salvar sessão."
                });
            }

            let resumoSessao = {
                sessoesRevogadas: 0
            };

            try {
                resumoSessao = registrarSessaoAtivaDoUsuario(req, usuario);
            } catch (erroSessao) {
                console.error("Erro ao registrar sessão ativa:", erroSessao);
            }

            registrarAuditoria(req, "login.realizado", {
                usuarioId: usuario.id,
                email: usuario.email,
                nome: usuario.nome,
                role: usuario.role,
                sessionId: req.sessionID || null,
                sessoesRevogadas: resumoSessao.sessoesRevogadas || 0
            });

            res.json({
                sucesso: true,
                mensagem: "Login realizado com sucesso.",
                usuario: req.session.user,
                sessoesRevogadas: resumoSessao.sessoesRevogadas || 0
            });
        });
    } catch (erro) {
        console.error("Erro no login:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao realizar login."
        });
    }
});

app.post("/api/logout", (req, res) => {
    registrarAuditoria(req, "login.logout", {
        usuario: req.session && req.session.user
            ? req.session.user.email
            : null
    });

    revogarSessaoAtual(req, "logout_manual");

    req.session.destroy(() => {
        res.json({
            sucesso: true,
            mensagem: "Logout realizado com sucesso."
        });
    });
});

/* =========================================================
   API: STATUS DA AUTENTICAÇÃO
   ========================================================= */

app.get("/api/auth/status", (req, res) => {
    const usuario = req.session && req.session.user
        ? req.session.user
        : null;

    res.json({
        logado: !!usuario || !!(req.session && req.session.adminLogado),
        usuario,
        sessionId: req.sessionID || null
    });
});

/* =========================================================
   API: USUÁRIO LOGADO
   =========================================================
   Retorna os dados básicos do usuário da sessão.
   ========================================================= */

app.get("/api/auth/me", exigirLogin, (req, res) => {
    if (!req.session.user) {
        return res.json({
            logado: true,
            usuario: {
                id: null,
                nome: "Administrador",
                email: "admin",
                role: "superadmin",
                secretariaId: null
            }
        });
    }

    res.json({
        logado: true,
        usuario: req.session.user
    });
});

/* =========================================================
   API: TESTE DE PERMISSÃO
   =========================================================
   Rota temporária para validar se roles estão funcionando.
   Depois podemos remover.
   ========================================================= */

app.get("/api/auth/teste-admin", exigirLogin, exigirAdmin, (req, res) => {
    res.json({
        sucesso: true,
        mensagem: "Você tem permissão administrativa.",
        usuario: req.session.user
    });
});

app.get("/api/auth/teste-editor", exigirLogin, exigirEditor, (req, res) => {
    res.json({
        sucesso: true,
        mensagem: "Você tem permissão de editor.",
        usuario: req.session.user
    });
});

/* =========================================================
   CACHE DO FRONTEND ADMIN
   =========================================================
   Evita que o navegador mantenha versões antigas de CSS/JS/HTML
   após deploy.

   Importante:
   - aplicado apenas em arquivos leves do frontend administrativo;
   - não deve ser aplicado em mídias/vídeos/imagens da pasta midia/;
   - evita necessidade de hard reload após atualizações visuais.
   ========================================================= */

/**
 * Aplica headers anti-cache para arquivos sensíveis do painel admin.
 *
 * Isso força o navegador a buscar a versão mais recente após deploy,
 * evitando casos em que:
 * - HTML novo carrega;
 * - CSS antigo fica em cache;
 * - JS antigo continua rodando;
 * - a interface fica quebrada ou inconsistente.
 */
function aplicarHeadersAntiCacheAdmin(req, res, next) {
    const caminho = String(req.path || "").toLowerCase();

    const ehArquivoDoAdmin = caminho.startsWith("/admin/");
    const ehHtmlCssOuJs =
        caminho.endsWith(".html") ||
        caminho.endsWith(".css") ||
        caminho.endsWith(".js");

    /*
      Só aplicamos anti-cache nos arquivos leves do admin.

      Não aplicamos em:
      - /midia/
      - vídeos;
      - imagens;
      - backups;
      - arquivos pesados.

      Isso evita prejudicar performance do player e consumo de rede.
    */
    if (ehArquivoDoAdmin && ehHtmlCssOuJs) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
    }

    next();
}

/* =========================================================
   ROTAS DO PLAYER E ADMIN
   ========================================================= */

app.get("/", (req, res) => {
    res.sendFile(path.join(projectRoot, "index.html"));
});

app.get("/player", (req, res) => {
    res.sendFile(path.join(projectRoot, "index.html"));
});

app.get("/admin", exigirLogin, (req, res) => {
    res.sendFile(path.join(adminFolder, "index.html"));
});


/* =========================================================
   APIs PÚBLICAS DE LEITURA
   ========================================================= */

app.get("/api/auth/status", (req, res) => {
    if (sessaoExpiradaPorInatividade(req)) {
        return encerrarSessaoPorInatividade(req, res);
    }

    const usuario = req.session && req.session.user
        ? req.session.user
        : null;

    if (existeSessaoAdministrativa(req)) {
        atualizarUltimaAtividadeSessao(req);
    }

    res.json({
        logado: !!usuario || !!(req.session && req.session.adminLogado),
        usuario,
        sessionId: req.sessionID || null,
        inatividadeTimeoutMs: SESSION_INACTIVITY_TIMEOUT_MS
    });
});

/* =========================================================
   API ADMIN: DIAGNÓSTICO OPERACIONAL
   =========================================================
   Retorna uma visão protegida da saúde operacional do sistema.

   Diferença para /api/health:
   - /api/health é simples e público;
   - /api/admin/diagnostico é protegido e mais completo.

   Verifica:
   - pastas principais;
   - arquivos essenciais;
   - banco SQLite;
   - armazenamento;
   - backups;
   - playlist/configurações.
   ========================================================= */
app.get("/api/admin/diagnostico", exigirLogin, exigirRole("superadmin"), (req, res) => {
    try {
        const agora = new Date();
        const playlistFile = path.join(projectRoot, "playlist.json");

        const arquivos = {
            mediaFolder: obterInfoCaminho(mediaFolder),
            dataFolder: obterInfoCaminho(dataFolder),
            backupFolder: obterInfoCaminho(backupFolder),
            chunksFolder: obterInfoCaminho(chunksFolder),
            midiaConfigFile: obterInfoCaminho(mediaConfigFile),
            playlistFile: obterInfoCaminho(playlistFile),
            databaseFile: obterInfoCaminho(databaseFile)
        };

        const banco = obterDiagnosticoBanco();
        const armazenamento = obterResumoArmazenamento();
        const backups = obterDiagnosticoBackups();

        const midias = listarMidiasDaPasta();

        const diagnosticoStatus = calcularStatusDiagnostico({
            arquivos,
            banco,
            armazenamento,
            backups
        });

        res.json({
            sucesso: true,
            status: diagnosticoStatus.status,
            mensagem: diagnosticoStatus.mensagem,
            problemasCriticos: diagnosticoStatus.problemasCriticos,
            avisos: diagnosticoStatus.avisos,

            sistema: {
                nome: "Painel TV Prefeitura",
                ambiente: process.env.NODE_ENV || "development",
                uptimeSegundos: Math.floor(process.uptime()),
                dataHoraUtc: agora.toISOString(),
                dataHoraCampoGrande: agora.toLocaleString("pt-BR", {
                    timeZone: "America/Campo_Grande",
                    hour12: false
                })
            },

            arquivos,
            banco,
            armazenamento,
            backups,

            midias: {
                total: midias.length,
                ativas: midias.filter((midia) => midia.ativo).length,
                inativas: midias.filter((midia) => !midia.ativo).length
            }
        });
    } catch (erro) {
        console.error("Erro ao gerar diagnóstico operacional:", erro);

        res.status(500).json({
            erro: true,
            status: "critico",
            mensagem: "Erro ao gerar diagnóstico operacional.",
            detalhe: erro.message || String(erro)
        });
    }
});

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        sistema: "Painel TV Prefeitura",
        uptimeSegundos: Math.floor(process.uptime()),
        ambiente: process.env.NODE_ENV || "development",
        dataHoraUtc: new Date().toISOString()
    });
});

app.get("/api/playlist", (req, res) => {
    try {
        const playlistFile = path.join(projectRoot, "playlist.json");

        if (!fs.existsSync(playlistFile)) {
            return res.json({
                total: 0,
                playlist: []
            });
        }

        const conteudo = fs.readFileSync(playlistFile, "utf8");
        const playlist = JSON.parse(conteudo);

        res.json({
            total: Array.isArray(playlist) ? playlist.length : 0,
            playlist: Array.isArray(playlist) ? playlist : []
        });
    } catch (erro) {
        console.error("Erro ao ler playlist:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao ler playlist."
        });
    }
});


/* =========================================================
   APIs DO ADMIN - LEITURA
   ========================================================= */

app.get("/api/midias", exigirLogin, (req, res) => {
    try {
        normalizarOrdensDasMidias();

        const midias = listarMidiasDaPasta()
            .sort((a, b) => {
                if (a.ordem !== b.ordem) {
                    return a.ordem - b.ordem;
                }

                return a.nome.localeCompare(b.nome);
            });

        res.json({
            total: midias.length,
            midias
        });
    } catch (erro) {
        console.error("Erro ao listar mídias:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao listar mídias."
        });
    }
});

app.get("/api/admin/resumo", exigirLogin, (req, res) => {
    try {
        const agora = new Date();
        const midias = listarMidiasDaPasta();

        const playlistFile = path.join(projectRoot, "playlist.json");
        const armazenamento = obterResumoArmazenamento();

        let totalItensPlaylist = 0;
        let ultimaAtualizacaoPlaylist = null;

        if (fs.existsSync(playlistFile)) {
            const conteudo = fs.readFileSync(playlistFile, "utf8");
            const playlist = JSON.parse(conteudo);

            if (Array.isArray(playlist)) {
                totalItensPlaylist = playlist.length;
            }

            const statsPlaylist = fs.statSync(playlistFile);
            ultimaAtualizacaoPlaylist = statsPlaylist.mtime.toISOString();
        }

        res.json({
            sucesso: true,

            midias: {
                total: midias.length,
                ativas: midias.filter((midia) => midia.ativo).length,
                inativas: midias.filter((midia) => !midia.ativo).length,
                vencidas: midias.filter((midia) => {
                    if (!midia.fim) return false;

                    const fim = new Date(midia.fim);

                    return !Number.isNaN(fim.getTime()) && agora > fim;
                }).length,
                agendadas: midias.filter((midia) => {
                    if (!midia.inicio) return false;

                    const inicio = new Date(midia.inicio);

                    return !Number.isNaN(inicio.getTime()) && agora < inicio;
                }).length,
                dentroDaValidade: midias.filter((midia) => {
                    return midia.ativo && midiaEstaDentroDaValidade(midia);
                }).length,
                comRecorrencia: midias.filter((midia) => {
                    return Number(midia.repetirACada) > 0;
                }).length,
                prioridadeAlta: midias.filter((midia) => {
                    return midia.prioridade === "alta";
                }).length,
                urgentes: midias.filter((midia) => {
                    return midia.prioridade === "urgente";
                }).length
            },

            playlist: {
                itensPublicados: totalItensPlaylist,
                ultimaAtualizacao: ultimaAtualizacaoPlaylist
            },

            armazenamento,

            servidor: {
                dataHoraUtc: agora.toISOString(),
                dataHoraCampoGrande: agora.toLocaleString("pt-BR", {
                    timeZone: "America/Campo_Grande",
                    hour12: false
                })
            }
        });
    } catch (erro) {
        console.error("Erro ao gerar resumo do admin:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao gerar resumo do admin."
        });
    }
});

app.get("/api/admin/backups", exigirLogin, (req, res) => {
    try {
        if (!fs.existsSync(backupFolder)) {
            return res.json({
                sucesso: true,
                total: 0,
                backups: []
            });
        }

        const backups = fs.readdirSync(backupFolder)
            .filter((arquivo) => {
                return arquivo.endsWith(".json") || arquivo.endsWith(".db");
            })
            .map((arquivo) => {
                const caminho = path.join(backupFolder, arquivo);
                const stats = fs.statSync(caminho);

                let tipo = "outro";

                if (arquivo.startsWith("playlist_")) {
                    tipo = "playlist";
                }

                if (arquivo.startsWith("midia-config_")) {
                    tipo = "midia-config";
                }

                if (arquivo.startsWith("database_")) {
                    tipo = "database";
                }

                return {
                    nome: arquivo,
                    tipo,
                    tamanho: stats.size,
                    tamanhoFormatado: formatarBytes(stats.size),
                    criadoEm: stats.birthtime.toISOString(),
                    modificadoEm: stats.mtime.toISOString()
                };
            })
            .sort((a, b) => {
                return new Date(b.modificadoEm) - new Date(a.modificadoEm);
            });

        res.json({
            sucesso: true,
            total: backups.length,
            backups
        });
    } catch (erro) {
        console.error("Erro ao listar backups:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao listar backups."
        });
    }
});

/* =========================================================
   API ADMIN: CRIAR BACKUP DO BANCO SQLITE
   =========================================================
   Cria manualmente um backup seguro do arquivo painel-tv.db.

   Segurança:
   - exige login;
   - exige perfil superadmin;
   - usa db.backup() para evitar cópia inconsistente;
   - registra auditoria do sistema.
   ========================================================= */
app.post("/api/admin/backups/database", exigirLogin, exigirRole("superadmin"), async (req, res) => {
    try {
        const resultado = await criarBackupBancoSqlite();

        if (!resultado.sucesso) {
            return res.status(500).json({
                erro: true,
                mensagem: resultado.mensagem,
                detalhe: resultado.erro || null
            });
        }

        res.json({
            sucesso: true,
            mensagem: resultado.mensagem,
            backup: resultado.backupCriado,
            limpezaBackups: resultado.limpezaBackups
        });
    } catch (erro) {
        console.error("Erro na rota de backup do banco:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao criar backup do banco SQLite."
        });
    }
});


/* =========================================================
   APIs DO ADMIN - ALTERAÇÃO DE MÍDIAS
   ========================================================= */
/* =========================================================
   TÍTULO AMIGÁVEL DE MÍDIA
   =========================================================
   Usa o nome original enviado no upload para criar um título
   bonito, corrigindo quando o nome vier com mojibake/encoding quebrado.

   Exemplo:
   - "AÃ§Ãµes da Sedec.mp4" vira "Ações da Sedec"
   - "acoes_da_sedec.mp4" vira "Acoes da Sedec"
   ========================================================= */

/**
 * Remove extensão do arquivo.
 */
function removerExtensaoArquivo(nomeArquivo) {
    return String(nomeArquivo || "").replace(/\.[^/.]+$/, "");
}

/**
 * Corrige textos que chegaram com encoding quebrado.
 *
 * Alguns uploads chegam no backend como:
 * - AÃ§Ãµes
 * em vez de:
 * - Ações
 *
 * Só tentamos corrigir quando encontramos sinais claros de mojibake.
 */
function corrigirEncodingTextoUpload(texto) {
    const valor = String(texto || "");

    const pareceMojibake = /Ã|Â|�/.test(valor);

    if (!pareceMojibake) {
        return valor;
    }

    try {
        return Buffer.from(valor, "latin1").toString("utf8");
    } catch (erro) {
        console.warn("Não foi possível corrigir encoding do texto:", valor);
        return valor;
    }
}

/**
 * Limpa nome original para virar título amigável.
 *
 * Importante:
 * - tenta corrigir encoding quebrado;
 * - mantém acentos;
 * - troca _, -, múltiplos espaços por espaço simples;
 * - remove padrões comuns de WhatsApp;
 * - aplica capitalização simples.
 */
function gerarTituloAmigavelDoNomeOriginal(nomeOriginal) {
    let titulo = corrigirEncodingTextoUpload(nomeOriginal);

    titulo = removerExtensaoArquivo(titulo);

    titulo = titulo
        .replace(/^whatsapp\s+image\s+/i, "")
        .replace(/^whatsapp\s+video\s+/i, "")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!titulo) {
        return "Nova mídia";
    }

    const palavrasMinusculas = new Set([
        "a",
        "as",
        "o",
        "os",
        "da",
        "de",
        "do",
        "das",
        "dos",
        "e",
        "em",
        "no",
        "na",
        "nos",
        "nas",
        "para",
        "por",
        "com"
    ]);

    return titulo
        .split(" ")
        .map((palavra, index) => {
            const palavraLower = palavra.toLocaleLowerCase("pt-BR");

            if (index > 0 && palavrasMinusculas.has(palavraLower)) {
                return palavraLower;
            }

            return palavraLower.charAt(0).toLocaleUpperCase("pt-BR") + palavraLower.slice(1);
        })
        .join(" ");
}

function registrarMidiaEnviada(nomeSalvo, nomeOriginal, tamanho) {
    const extensao = path.extname(nomeSalvo).toLowerCase();
    const tipo = obterTipoPorExtensao(extensao);
    const tituloAmigavel = gerarTituloAmigavelDoNomeOriginal(nomeOriginal);

    if (tipo !== "outro") {
        const configuracoes = lerConfiguracoesDeMidia();
        const configuracaoAtual = configuracoes[nomeSalvo] || {};

        configuracoes[nomeSalvo] = {
            ativo: configuracaoAtual.ativo !== false,
            duracao: tipo === "imagem"
                ? Number(configuracaoAtual.duracao || 8)
                : 8,
            ordem: Number(configuracaoAtual.ordem) > 0
                ? Number(configuracaoAtual.ordem)
                : 999999,
            prioridade: configuracaoAtual.prioridade || "normal",
            repetirACada: Number(configuracaoAtual.repetirACada || 0),
            titulo: configuracaoAtual.titulo || tituloAmigavel,
            inicio: configuracaoAtual.inicio || null,
            fim: configuracaoAtual.fim || null
        };

        salvarConfiguracoesDeMidia(configuracoes);
        normalizarOrdensDasMidias();
    }

    const publicacao = publicarPlaylistAutomaticamente();

    return {
        publicacao,
        arquivo: {
            nomeOriginal: corrigirEncodingTextoUpload(nomeOriginal),
            nomeSalvo,
            titulo: tituloAmigavel,
            caminho: `midia/${nomeSalvo}`,
            tipo,
            extensao,
            tamanho
        }
    };
}

app.post("/api/upload/bloqueio-preventivo", exigirLogin, exigirEditor, (req, res) => {
    try {
        const nomeOriginal = String(req.body.nomeOriginal || "");
        const tamanhoArquivoBytes = Number(req.body.tamanhoArquivoBytes || 0);
        const mensagem = String(req.body.mensagem || "Upload bloqueado preventivamente pelo painel administrativo.");

        registrarAuditoriaUploadBloqueado(req, {
            tipoUpload: "frontend-preventivo",
            motivo: "validacao_previa_dashboard",
            mensagem,
            nomeOriginal,
            tamanhoAvaliadoBytes: tamanhoArquivoBytes
        });

        res.json({
            sucesso: true
        });
    } catch (erro) {
        console.error("Erro ao registrar bloqueio preventivo de upload:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao registrar bloqueio preventivo de upload."
        });
    }
});

app.post("/api/upload/chunk", exigirLogin, exigirEditor, uploadChunk.single("chunk"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                erro: true,
                mensagem: "Nenhum pedaço recebido."
            });
        }

        res.json({
            sucesso: true,
            uploadId: req.body.uploadId,
            indice: Number(req.body.indice)
        });
    } catch (erro) {
        console.error("Erro ao receber chunk:", erro);
        res.status(500).json({
            erro: true,
            mensagem: "Erro ao receber parte do arquivo."
        });
    }
});

app.post("/api/upload/finalizar", exigirLogin, exigirEditor, (req, res) => {
    try {
        const uploadId = String(req.body.uploadId || "").replace(/[^a-zA-Z0-9_-]/g, "");
        const nomeOriginal = String(req.body.nomeOriginal || "");
        const totalChunks = Number(req.body.totalChunks);

        if (!uploadId || !nomeOriginal || !Number.isInteger(totalChunks) || totalChunks <= 0) {
            return res.status(400).json({
                erro: true,
                mensagem: "Dados de finalização inválidos."
            });
        }

        if (!extensaoPermitida(nomeOriginal)) {
            return res.status(400).json({
                erro: true,
                mensagem: "Tipo de arquivo não permitido."
            });
        }

        const pastaUpload = path.join(chunksFolder, uploadId);

        if (!fs.existsSync(pastaUpload)) {
            return res.status(400).json({
                erro: true,
                mensagem: "Upload temporário não encontrado."
            });
        }

        const tamanhoUploadTemporario = calcularTamanhoPastaBytes(pastaUpload);
        const validacaoArmazenamento = validarEspacoParaNovoArquivo(tamanhoUploadTemporario);

        if (!validacaoArmazenamento.permitido) {
            registrarAuditoriaUploadBloqueado(req, {
                tipoUpload: "chunks-finalizacao",
                motivo: "validacao_finalizacao_chunks",
                mensagem: validacaoArmazenamento.mensagem,
                nomeOriginal,
                uploadId,
                totalChunks,
                tamanhoAvaliadoBytes: tamanhoUploadTemporario
            });

            /*
              Se o arquivo não pode ser finalizado por limite de armazenamento,
              removemos os chunks temporários para não deixar lixo acumulado.
            */
            fs.rmSync(pastaUpload, {
                recursive: true,
                force: true
            });

            return res.status(validacaoArmazenamento.statusHttp).json({
                erro: true,
                mensagem: validacaoArmazenamento.mensagem
            });
        }

        const nomeSeguro = gerarNomeSeguro(nomeOriginal);
        const nomeSalvo = garantirNomeUnico(nomeSeguro);
        const caminhoFinal = path.join(mediaFolder, nomeSalvo);

        const escrita = fs.createWriteStream(caminhoFinal);

        for (let i = 0; i < totalChunks; i++) {
            const caminhoChunk = path.join(pastaUpload, `chunk-${String(i).padStart(6, "0")}.part`);

            if (!fs.existsSync(caminhoChunk)) {
                escrita.destroy();

                if (fs.existsSync(caminhoFinal)) {
                    fs.unlinkSync(caminhoFinal);
                }

                return res.status(400).json({
                    erro: true,
                    mensagem: `Parte ${i + 1} de ${totalChunks} não encontrada.`
                });
            }

            const buffer = fs.readFileSync(caminhoChunk);
            escrita.write(buffer);
        }

        escrita.end();

        escrita.on("finish", () => {
            try {
                const tamanho = fs.statSync(caminhoFinal).size;
                fs.rmSync(pastaUpload, { recursive: true, force: true });

                const resultado = registrarMidiaEnviada(nomeSalvo, nomeOriginal, tamanho);

                registrarAuditoria(req, "midia.upload", {
                    nomeOriginal,
                    nomeSalvo,
                    tamanho
                });

                res.json({
                    sucesso: true,
                    mensagem: "Arquivo enviado com sucesso.",
                    playlistAtualizada: resultado.publicacao,
                    arquivo: resultado.arquivo,
                    arquivos: [resultado.arquivo]
                });
            } catch (erroFinalizacao) {
                console.error("Erro ao finalizar upload em chunks:", erroFinalizacao);
                res.status(500).json({
                    erro: true,
                    mensagem: "Erro ao finalizar arquivo enviado."
                });
            }
        });

        escrita.on("error", (erroEscrita) => {
            console.error("Erro ao juntar chunks:", erroEscrita);
            res.status(500).json({
                erro: true,
                mensagem: "Erro ao montar arquivo enviado."
            });
        });
    } catch (erro) {
        console.error("Erro ao finalizar upload:", erro);
        res.status(500).json({
            erro: true,
            mensagem: "Erro ao finalizar upload."
        });
    }
});

app.post("/api/upload", exigirLogin, exigirEditor, validarEspacoAntesDoUploadSimples, upload.array("arquivo", 30), (req, res) => {
    try {
        const arquivos = Array.isArray(req.files) ? req.files : [];

        if (!arquivos.length) {
            return res.status(400).json({
                erro: true,
                mensagem: "Nenhum arquivo enviado."
            });
        }

        const tamanhoTotalArquivos = arquivos.reduce((total, arquivo) => {
            return total + Number(arquivo.size || 0);
        }, 0);

        const validacaoArmazenamento = validarEspacoParaNovoArquivo(tamanhoTotalArquivos);

        if (!validacaoArmazenamento.permitido) {
            registrarAuditoriaUploadBloqueado(req, {
                tipoUpload: "simples-pos-recebimento",
                motivo: "validacao_pos_upload",
                mensagem: validacaoArmazenamento.mensagem,
                tamanhoAvaliadoBytes: tamanhoTotalArquivos,
                arquivos: arquivos.map((arquivo) => ({
                    nomeOriginal: corrigirEncodingTextoUpload(arquivo.originalname),
                    nomeSalvo: arquivo.filename,
                    tamanho: arquivo.size,
                    tamanhoFormatado: formatarBytes(arquivo.size)
                }))
            });

            removerArquivosEnviadosComFalha(arquivos);

            return res.status(validacaoArmazenamento.statusHttp).json({
                erro: true,
                mensagem: validacaoArmazenamento.mensagem
            });
        }

        const arquivosResposta = arquivos.map((arquivo) => {
            const extensao = path.extname(arquivo.filename).toLowerCase();
            const tipo = obterTipoPorExtensao(extensao);

            const tituloAmigavel = gerarTituloAmigavelDoNomeOriginal(arquivo.originalname);
            const nomeOriginalCorrigido = corrigirEncodingTextoUpload(arquivo.originalname);

            return {
                nomeOriginal: nomeOriginalCorrigido,
                nomeSalvo: arquivo.filename,
                titulo: tituloAmigavel,
                caminho: `midia/${arquivo.filename}`,
                tipo,
                extensao,
                tamanho: arquivo.size
            };
        });

        /*
        Salva uma configuração inicial para os arquivos enviados,
        usando o nome original como título amigável.
        */
        const configuracoes = lerConfiguracoesDeMidia();

        arquivos.forEach((arquivo) => {
            const nomeSalvo = arquivo.filename;
            const extensao = path.extname(nomeSalvo).toLowerCase();
            const tipo = obterTipoPorExtensao(extensao);

            if (tipo === "outro") return;

            const configuracaoAtual = configuracoes[nomeSalvo] || {};

            configuracoes[nomeSalvo] = {
                ativo: configuracaoAtual.ativo !== false,
                duracao: tipo === "imagem"
                    ? Number(configuracaoAtual.duracao || 8)
                    : 8,
                ordem: Number(configuracaoAtual.ordem) > 0
                    ? Number(configuracaoAtual.ordem)
                    : 999999,
                prioridade: configuracaoAtual.prioridade || "normal",
                repetirACada: Number(configuracaoAtual.repetirACada || 0),
                titulo: configuracaoAtual.titulo || gerarTituloAmigavelDoNomeOriginal(arquivo.originalname),
                inicio: configuracaoAtual.inicio || null,
                fim: configuracaoAtual.fim || null
            };
        });

        salvarConfiguracoesDeMidia(configuracoes);
        normalizarOrdensDasMidias();

        const publicacao = publicarPlaylistAutomaticamente();

        registrarAuditoria(req, "midia.upload", {
            total: arquivosResposta.length,
            arquivos: arquivosResposta.map((arquivo) => ({
                nomeOriginal: arquivo.nomeOriginal,
                nomeSalvo: arquivo.nomeSalvo,
                tamanho: arquivo.tamanho,
                tipo: arquivo.tipo
            }))
        });

        res.json({
            sucesso: true,
            mensagem: arquivosResposta.length > 1
                ? "Arquivos enviados com sucesso."
                : "Arquivo enviado com sucesso.",
            playlistAtualizada: publicacao,
            arquivo: arquivosResposta[0],
            arquivos: arquivosResposta
        });
    } catch (erro) {
        console.error("Erro no upload:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao enviar arquivo."
        });
    }
});

app.put("/api/midias/config/lote", exigirLogin, exigirEditor, (req, res) => {
    try {
        const midias = Array.isArray(req.body.midias)
            ? req.body.midias
            : [];

        if (!midias.length) {
            return res.status(400).json({
                erro: true,
                mensagem: "Nenhuma mídia enviada para salvar."
            });
        }

        const configuracoes = lerConfiguracoesDeMidia();

        let totalSalvo = 0;

        midias.forEach((midia) => {
            const nomeArquivo = path.basename(midia.nome || "");
            const caminhoArquivo = path.join(mediaFolder, nomeArquivo);

            if (!nomeArquivo) return;
            if (!fs.existsSync(caminhoArquivo)) return;

            const stats = fs.statSync(caminhoArquivo);

            if (!stats.isFile()) return;

            const extensao = path.extname(nomeArquivo).toLowerCase();
            const tipo = obterTipoPorExtensao(extensao);

            if (tipo === "outro") return;

            const configuracaoAtual = configuracoes[nomeArquivo] || {};

            const ativo = midia.ativo !== false;

            let duracao = Number(midia.duracao);

            if (!Number.isFinite(duracao) || duracao <= 0) {
                duracao = 8;
            }

            const repetirACada = Number(midia.repetirACada) > 0
                ? Number(midia.repetirACada)
                : 0;

            const titulo = normalizarTexto(
                midia.titulo,
                gerarTituloPadrao(nomeArquivo)
            );

            const inicio = normalizarDataOuNull(midia.inicio);
            const fim = normalizarDataOuNull(midia.fim);

            configuracoes[nomeArquivo] = {
                ativo,

                duracao: tipo === "imagem" ? duracao : 8,

                ordem: Number(configuracaoAtual.ordem) > 0
                    ? Number(configuracaoAtual.ordem)
                    : 999999,

                prioridade: normalizarPrioridade(midia.prioridade),

                repetirACada,

                titulo,

                inicio,

                fim
            };

            totalSalvo++;
        });

        salvarConfiguracoesDeMidia(configuracoes);
        normalizarOrdensDasMidias();

        const publicacao = publicarPlaylistAutomaticamente();

        registrarAuditoria(req, "midia.editar_lote", {
            totalRecebido: midias.length,
            totalSalvo,
            arquivos: midias.map((midia) => ({
                nome: path.basename(midia.nome || ""),
                titulo: midia.titulo || null,
                ativo: midia.ativo !== false,
                prioridade: midia.prioridade || null,
                duracao: midia.duracao || null,
                repetirACada: midia.repetirACada || 0,
                inicio: midia.inicio || null,
                fim: midia.fim || null
            })),
            playlistAtualizada: publicacao
        });

        res.json({
            sucesso: true,
            mensagem: "Configurações salvas com sucesso.",
            totalSalvo,
            playlistAtualizada: publicacao
        });
    } catch (erro) {
        console.error("Erro ao salvar configurações em lote:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao salvar configurações em lote."
        });
    }
});

app.put("/api/midias/:nomeArquivo/config", exigirLogin, exigirEditor, (req, res) => {
    try {
        const nomeArquivo = path.basename(req.params.nomeArquivo);
        const caminhoArquivo = path.join(mediaFolder, nomeArquivo);

        if (!fs.existsSync(caminhoArquivo)) {
            return res.status(404).json({
                erro: true,
                mensagem: "Arquivo não encontrado."
            });
        }

        const stats = fs.statSync(caminhoArquivo);

        if (!stats.isFile()) {
            return res.status(400).json({
                erro: true,
                mensagem: "O item informado não é um arquivo."
            });
        }

        const extensao = path.extname(nomeArquivo).toLowerCase();
        const tipo = obterTipoPorExtensao(extensao);

        const configuracoes = lerConfiguracoesDeMidia();
        const configuracaoAtual = configuracoes[nomeArquivo] || {};

        const ativo = req.body.ativo !== false;

        let duracao = Number(req.body.duracao);

        if (!Number.isFinite(duracao) || duracao <= 0) {
            duracao = 8;
        }

        const prioridade = normalizarPrioridade(req.body.prioridade);

        const repetirACada = Number(req.body.repetirACada) > 0
            ? Number(req.body.repetirACada)
            : 0;

        const titulo = normalizarTexto(
            req.body.titulo ?? configuracaoAtual.titulo,
            gerarTituloPadrao(nomeArquivo)
        );

        const inicio = Object.prototype.hasOwnProperty.call(req.body, "inicio")
            ? normalizarDataOuNull(req.body.inicio)
            : configuracaoAtual.inicio || null;

        const fim = Object.prototype.hasOwnProperty.call(req.body, "fim")
            ? normalizarDataOuNull(req.body.fim)
            : configuracaoAtual.fim || null;

        configuracoes[nomeArquivo] = {
            ativo,

            duracao: tipo === "imagem" ? duracao : 8,

            ordem: Number(configuracaoAtual.ordem) > 0
                ? Number(configuracaoAtual.ordem)
                : 999999,

            prioridade,

            repetirACada,

            titulo,

            inicio,

            fim
        };

        salvarConfiguracoesDeMidia(configuracoes);
        normalizarOrdensDasMidias();

        const publicacao = publicarPlaylistAutomaticamente();

        registrarAuditoria(req, "midia.editar", {
            arquivo: nomeArquivo,
            configuracaoAnterior: configuracaoAtual,
            configuracaoNova: configuracoes[nomeArquivo],
            playlistAtualizada: publicacao
        });

        res.json({
            sucesso: true,
            mensagem: "Configuração salva com sucesso.",
            arquivo: nomeArquivo,
            configuracao: configuracoes[nomeArquivo],
            playlistAtualizada: publicacao
        });
    } catch (erro) {
        console.error("Erro ao salvar configuração da mídia:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao salvar configuração da mídia."
        });
    }
});

app.post("/api/midias/:nomeArquivo/mover", exigirLogin, exigirEditor, (req, res) => {
    try {
        const nomeArquivo = path.basename(req.params.nomeArquivo);
        const direcao = req.body.direcao;

        if (!["up", "down"].includes(direcao)) {
            return res.status(400).json({
                erro: true,
                mensagem: "Direção inválida."
            });
        }

        const caminhoArquivo = path.join(mediaFolder, nomeArquivo);

        if (!fs.existsSync(caminhoArquivo)) {
            return res.status(404).json({
                erro: true,
                mensagem: "Arquivo não encontrado."
            });
        }

        normalizarOrdensDasMidias();

        const configuracoes = lerConfiguracoesDeMidia();

        const midias = listarMidiasDaPasta()
            .sort((a, b) => a.ordem - b.ordem);

        const indiceAtual = midias.findIndex((midia) => midia.nome === nomeArquivo);

        if (indiceAtual === -1) {
            return res.status(404).json({
                erro: true,
                mensagem: "Mídia não encontrada na lista."
            });
        }

        const novoIndice = direcao === "up"
            ? indiceAtual - 1
            : indiceAtual + 1;

        if (novoIndice < 0 || novoIndice >= midias.length) {
            return res.json({
                sucesso: true,
                mensagem: "A mídia já está no limite da lista."
            });
        }

        const midiaAtual = midias[indiceAtual];
        const midiaTroca = midias[novoIndice];

        const ordemAtual = configuracoes[midiaAtual.nome].ordem;
        const ordemTroca = configuracoes[midiaTroca.nome].ordem;

        configuracoes[midiaAtual.nome].ordem = ordemTroca;
        configuracoes[midiaTroca.nome].ordem = ordemAtual;

        salvarConfiguracoesDeMidia(configuracoes);
        normalizarOrdensDasMidias();

        const publicacao = publicarPlaylistAutomaticamente();

        registrarAuditoria(req, "midia.mover", {
            arquivo: nomeArquivo,
            direcao,
            indiceAnterior: indiceAtual,
            indiceNovo: novoIndice,
            trocouCom: midiaTroca.nome,
            playlistAtualizada: publicacao
        });

        res.json({
            sucesso: true,
            mensagem: "Ordem atualizada com sucesso.",
            playlistAtualizada: publicacao
        });
    } catch (erro) {
        console.error("Erro ao mover mídia:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao mover mídia."
        });
    }
});

app.delete("/api/midias/:nomeArquivo", exigirLogin, exigirEditor, (req, res) => {
    try {
        const nomeArquivo = req.params.nomeArquivo;
        const nomeSeguro = path.basename(nomeArquivo);
        const caminhoArquivo = path.join(mediaFolder, nomeSeguro);

        if (!fs.existsSync(caminhoArquivo)) {
            return res.status(404).json({
                erro: true,
                mensagem: "Arquivo não encontrado."
            });
        }

        const stats = fs.statSync(caminhoArquivo);

        if (!stats.isFile()) {
            return res.status(400).json({
                erro: true,
                mensagem: "O item informado não é um arquivo."
            });
        }

        fs.unlinkSync(caminhoArquivo);

        const configuracoes = lerConfiguracoesDeMidia();

        if (configuracoes[nomeSeguro]) {
            delete configuracoes[nomeSeguro];
            salvarConfiguracoesDeMidia(configuracoes);
        }

        const publicacao = publicarPlaylistAutomaticamente();

        registrarAuditoria(req, "midia.excluir", {
            arquivo: nomeSeguro,
            tamanho: stats.size,
            playlistAtualizada: publicacao
        });

        res.json({
            sucesso: true,
            mensagem: "Arquivo excluído com sucesso.",
            arquivo: nomeSeguro,
            playlistAtualizada: publicacao
        });
    } catch (erro) {
        console.error("Erro ao excluir mídia:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao excluir mídia."
        });
    }
});

app.post("/api/midias/excluir-lote", exigirLogin, exigirEditor, (req, res) => {
    try {
        const arquivos = Array.isArray(req.body.arquivos)
            ? req.body.arquivos
            : [];

        if (!arquivos.length) {
            return res.status(400).json({
                erro: true,
                mensagem: "Nenhum arquivo enviado para exclusão."
            });
        }

        const configuracoes = lerConfiguracoesDeMidia();

        const excluidos = [];
        const ignorados = [];

        arquivos.forEach((arquivo) => {
            const nomeSeguro = path.basename(String(arquivo || ""));
            const caminhoArquivo = path.join(mediaFolder, nomeSeguro);

            if (!nomeSeguro || !fs.existsSync(caminhoArquivo)) {
                ignorados.push(nomeSeguro || arquivo);
                return;
            }

            const stats = fs.statSync(caminhoArquivo);

            if (!stats.isFile()) {
                ignorados.push(nomeSeguro);
                return;
            }

            fs.unlinkSync(caminhoArquivo);

            if (configuracoes[nomeSeguro]) {
                delete configuracoes[nomeSeguro];
            }

            excluidos.push(nomeSeguro);
        });

        salvarConfiguracoesDeMidia(configuracoes);
        normalizarOrdensDasMidias();

        const publicacao = publicarPlaylistAutomaticamente();

        registrarAuditoria(req, "midia.excluir_lote", {
            totalSolicitado: arquivos.length,
            totalExcluido: excluidos.length,
            totalIgnorado: ignorados.length,
            excluidos,
            ignorados,
            playlistAtualizada: publicacao
        });

        res.json({
            sucesso: true,
            mensagem: "Exclusão em lote concluída.",
            excluidos,
            ignorados,
            playlistAtualizada: publicacao
        });
    } catch (erro) {
        console.error("Erro ao excluir mídias em lote:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao excluir mídias em lote."
        });
    }
});


/* =========================================================
   API - PLAYLIST
   ========================================================= */

app.post("/api/playlist/gerar", exigirLogin, exigirEditor, (req, res) => {
    try {
        const resultado = gerarPlaylistArquivo();

        res.json({
            sucesso: true,
            mensagem: "playlist.json gerado com sucesso.",
            total: resultado.total,
            playlist: resultado.playlist
        });
    } catch (erro) {
        console.error("Erro ao gerar playlist:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao gerar playlist."
        });
    }
});


/* =========================================================
   TRATAMENTO DE ERROS DO MULTER
   ========================================================= */

app.use((erro, req, res, next) => {
    if (erro) {
        console.error("Erro capturado:", erro.message);

        return res.status(400).json({
            erro: true,
            mensagem: erro.message || "Erro na requisição."
        });
    }

    next();
});


/* =========================================================
   ROTINA AUTOMÁTICA DE PUBLICAÇÃO
   =========================================================

   A cada 60 segundos:
   - verifica mídias vencidas;
   - verifica mídias agendadas;
   - regenera playlist se necessário.

   Isso garante que uma mídia vencida saia automaticamente
   da TV sem alguém precisar mexer no Admin.
   ========================================================= */

const INTERVALO_PUBLICACAO_AUTOMATICA_MS = 5 * 1000;

/*
  A playlist precisa ser revalidada com frequência para que
  mídias agendadas entrem e mídias vencidas saiam perto do
  horário configurado.

  O intervalo é curto, mas os logs são controlados para não
  poluir o PM2/terminal a cada 5 segundos.
*/
let ciclosPublicacaoAutomatica = 0;

setInterval(() => {
    const agora = new Date();

    const horarioCampoGrande = agora.toLocaleString("pt-BR", {
        timeZone: "America/Campo_Grande"
    });

    const resultado = publicarPlaylistAutomaticamente();

    ciclosPublicacaoAutomatica += 1;

    /*
      Log informativo apenas a cada 12 ciclos.
      Como o intervalo é de 5s, isso gera log aproximadamente
      a cada 1 minuto.
    */
    const deveLogarStatus = ciclosPublicacaoAutomatica >= 12;

    if (deveLogarStatus) {
        ciclosPublicacaoAutomatica = 0;
    }

    if (resultado.sucesso) {
        if (deveLogarStatus) {
            console.log(
                `[${horarioCampoGrande}] Playlist verificada automaticamente. Itens: ${resultado.total}`
            );
        }
    } else {
        console.log(
            `[${horarioCampoGrande}] Falha ao atualizar playlist automaticamente.`
        );
    }
}, INTERVALO_PUBLICACAO_AUTOMATICA_MS);

/* =========================================================
   API ADMIN: LISTAR USUÁRIOS
   =========================================================
   Lista os usuários cadastrados no banco SQLite.

   Segurança:
   - exige login;
   - exige perfil administrativo;
   - não retorna senha nem senha_hash.
   ========================================================= */

app.get("/api/admin/users", exigirLogin, exigirAdmin, (req, res) => {
    try {
        const usuarios = db.prepare(`
            SELECT
                users.id,
                users.nome,
                users.email,
                users.role,
                users.secretaria_id AS secretariaId,
                users.ativo,
                users.criado_em AS criadoEm,
                users.atualizado_em AS atualizadoEm,
                secretarias.nome AS secretariaNome
            FROM users
            LEFT JOIN secretarias
                ON secretarias.id = users.secretaria_id
            ORDER BY users.id ASC
        `).all();

        res.json({
            sucesso: true,
            total: usuarios.length,
            usuarios
        });
    } catch (erro) {
        console.error("Erro ao listar usuários:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao listar usuários."
        });
    }
});

/* =========================================================
   API ADMIN: CRIAR USUÁRIO
   =========================================================
   Cria um novo usuário administrativo no sistema.

   Segurança:
   - exige login;
   - exige perfil administrativo;
   - salva senha com hash bcrypt;
   - não retorna senha nem senha_hash na resposta.
   ========================================================= */

app.post("/api/admin/users", exigirLogin, exigirAdmin, (req, res) => {
    try {
        const nome = String(req.body.nome || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const senha = String(req.body.senha || "");
        const role = String(req.body.role || "viewer").trim().toLowerCase();

        const secretariaIdBruto = req.body.secretariaId ?? req.body.secretaria_id ?? null;

        const secretariaId = secretariaIdBruto
            ? Number(secretariaIdBruto)
            : null;

        const ativo = req.body.ativo === false ? 0 : 1;

        /*
          Roles permitidas neste primeiro momento.
        */
        const rolesPermitidas = ["superadmin", "admin", "editor", "viewer"];

        if (!nome) {
            return res.status(400).json({
                erro: true,
                mensagem: "Informe o nome do usuário."
            });
        }

        if (!email) {
            return res.status(400).json({
                erro: true,
                mensagem: "Informe o usuário/e-mail."
            });
        }

        if (!senha || senha.length < 6) {
            return res.status(400).json({
                erro: true,
                mensagem: "Informe uma senha com pelo menos 6 caracteres."
            });
        }

        if (!rolesPermitidas.includes(role)) {
            return res.status(400).json({
                erro: true,
                mensagem: "Perfil de usuário inválido."
            });
        }

        if (secretariaId !== null && (!Number.isInteger(secretariaId) || secretariaId <= 0)) {
            return res.status(400).json({
                erro: true,
                mensagem: "Secretaria inválida."
            });
        }

        /*
          Evita usuário/e-mail duplicado.
        */
        const usuarioExistente = db.prepare(`
            SELECT id
            FROM users
            WHERE LOWER(email) = ?
            LIMIT 1
        `).get(email);

        if (usuarioExistente) {
            return res.status(409).json({
                erro: true,
                mensagem: "Já existe um usuário com este login/e-mail."
            });
        }

        /*
          Se secretariaId foi enviada, verifica se ela existe.
          Por enquanto provavelmente será null, mas já deixamos pronto.
        */
        if (secretariaId !== null) {
            const secretariaExiste = db.prepare(`
                SELECT id
                FROM secretarias
                WHERE id = ?
                LIMIT 1
            `).get(secretariaId);

            if (!secretariaExiste) {
                return res.status(400).json({
                    erro: true,
                    mensagem: "Secretaria informada não existe."
                });
            }
        }

        const senhaHash = bcrypt.hashSync(senha, 10);
        const agora = new Date().toISOString();

        const resultado = db.prepare(`
            INSERT INTO users (
                nome,
                email,
                senha_hash,
                role,
                secretaria_id,
                ativo,
                criado_em,
                atualizado_em
            ) VALUES (
                @nome,
                @email,
                @senha_hash,
                @role,
                @secretaria_id,
                @ativo,
                @criado_em,
                @atualizado_em
            )
        `).run({
            nome,
            email,
            senha_hash: senhaHash,
            role,
            secretaria_id: secretariaId,
            ativo,
            criado_em: agora,
            atualizado_em: agora
        });

        const usuarioCriado = db.prepare(`
            SELECT
                id,
                nome,
                email,
                role,
                secretaria_id AS secretariaId,
                ativo,
                criado_em AS criadoEm,
                atualizado_em AS atualizadoEm
            FROM users
            WHERE id = ?
        `).get(resultado.lastInsertRowid);

        registrarAuditoria(req, "usuario.criar", {
            usuarioCriado: {
                id: usuarioCriado.id,
                nome: usuarioCriado.nome,
                email: usuarioCriado.email,
                role: usuarioCriado.role,
                ativo: usuarioCriado.ativo
            }
        });

        res.status(201).json({
            sucesso: true,
            mensagem: "Usuário criado com sucesso.",
            usuario: usuarioCriado
        });
    } catch (erro) {
        console.error("Erro ao criar usuário:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao criar usuário."
        });
    }
});

/* =========================================================
   API ADMIN: EDITAR USUÁRIO
   =========================================================
   Atualiza dados básicos de um usuário.

   Esta rota NÃO altera senha.
   Para senha, usaremos uma rota separada de reset.

   Segurança:
   - exige login;
   - exige perfil administrativo;
   - não permite remover o próprio superadmin de forma perigosa.
   ========================================================= */

app.put("/api/admin/users/:id", exigirLogin, exigirAdmin, (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: true,
                mensagem: "ID de usuário inválido."
            });
        }

        /*
          Usuário logado na sessão.
          Esta função já existe no seu projeto, então reaproveitamos ela.
        */
        const usuarioLogado = obterUsuarioDaSessao(req);

        if (!usuarioLogado) {
            return res.status(401).json({
                erro: true,
                mensagem: "Sessão inválida. Faça login novamente."
            });
        }

        const usuarioLogadoEhSuperadmin = usuarioLogado.role === "superadmin";

        /*
          Busca o usuário que será editado.
          Chamamos ele de "usuarioAtual" porque representa o estado atual
          antes da edição.
        */
        const usuarioAtual = db.prepare(`
            SELECT
                id,
                nome,
                email,
                role,
                secretaria_id,
                ativo
            FROM users
            WHERE id = ?
            LIMIT 1
        `).get(id);

        if (!usuarioAtual) {
            return res.status(404).json({
                erro: true,
                mensagem: "Usuário não encontrado."
            });
        }

        const usuarioAlvoEhSuperadmin = usuarioAtual.role === "superadmin";
        const usuarioEditandoASiMesmo = Number(usuarioLogado.id) === id;

        /*
          REGRA DE OURO:
          Somente um superadmin pode alterar outro superadmin.

          Isso impede que um admin comum:
          - edite o nome/login de um superadmin;
          - troque o perfil do superadmin;
          - desative o superadmin;
          - vincule secretaria;
          - faça qualquer alteração sensível no usuário superadmin.
        */
        if (usuarioAlvoEhSuperadmin && !usuarioLogadoEhSuperadmin) {
            return res.status(403).json({
                erro: true,
                mensagem: "Somente um superadmin pode alterar outro superadmin."
            });
        }

        const nome = String(req.body.nome || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const role = String(req.body.role || "viewer").trim().toLowerCase();

        const secretariaIdBruto = req.body.secretariaId ?? req.body.secretaria_id ?? null;
        const secretariaId = secretariaIdBruto
            ? Number(secretariaIdBruto)
            : null;

        const ativo = req.body.ativo === false ? 0 : 1;

        const rolesPermitidas = ["superadmin", "admin", "editor", "viewer"];

        if (!nome) {
            return res.status(400).json({
                erro: true,
                mensagem: "Informe o nome do usuário."
            });
        }

        if (!email) {
            return res.status(400).json({
                erro: true,
                mensagem: "Informe o usuário/e-mail."
            });
        }

        if (!rolesPermitidas.includes(role)) {
            return res.status(400).json({
                erro: true,
                mensagem: "Perfil de usuário inválido."
            });
        }

        if (secretariaId !== null && (!Number.isInteger(secretariaId) || secretariaId <= 0)) {
            return res.status(400).json({
                erro: true,
                mensagem: "Secretaria inválida."
            });
        }

        /*
          REGRA DE ELEVAÇÃO DE PRIVILÉGIO:
          Apenas superadmin pode criar/transformar alguém em superadmin.

          Sem isso, um admin comum poderia editar outro admin/editor/viewer
          e promover para superadmin. Aí o sistema vira festa junina:
          todo mundo pulando a fogueira da permissão.
        */
        if (role === "superadmin" && !usuarioLogadoEhSuperadmin) {
            return res.status(403).json({
                erro: true,
                mensagem: "Somente um superadmin pode definir outro usuário como superadmin."
            });
        }

        /*
          Proteção:
          o usuário logado não pode se desativar.
          Isso evita você se trancar para fora do sistema.
        */
        if (usuarioEditandoASiMesmo && ativo === 0) {
            return res.status(403).json({
                erro: true,
                mensagem: "Você não pode desativar o próprio usuário logado."
            });
        }

        /*
          Proteção:
          o usuário logado não pode remover o próprio perfil superadmin.

          Mesmo sendo superadmin, ele não pode editar a si mesmo e trocar
          sua role para admin/editor/viewer.
        */
        if (
            usuarioEditandoASiMesmo &&
            usuarioAtual.role === "superadmin" &&
            role !== "superadmin"
        ) {
            return res.status(403).json({
                erro: true,
                mensagem: "Você não pode remover o próprio perfil superadmin."
            });
        }

        /*
          Evita duplicar login/e-mail em outro usuário.
        */
        const usuarioMesmoEmail = db.prepare(`
            SELECT id
            FROM users
            WHERE LOWER(email) = ?
              AND id <> ?
            LIMIT 1
        `).get(email, id);

        if (usuarioMesmoEmail) {
            return res.status(409).json({
                erro: true,
                mensagem: "Já existe outro usuário com este login/e-mail."
            });
        }

        /*
          Se secretariaId foi enviada, verifica se ela existe.
        */
        if (secretariaId !== null) {
            const secretariaExiste = db.prepare(`
                SELECT id
                FROM secretarias
                WHERE id = ?
                LIMIT 1
            `).get(secretariaId);

            if (!secretariaExiste) {
                return res.status(400).json({
                    erro: true,
                    mensagem: "Secretaria informada não existe."
                });
            }
        }

        const agora = new Date().toISOString();

        db.prepare(`
            UPDATE users
            SET
                nome = @nome,
                email = @email,
                role = @role,
                secretaria_id = @secretaria_id,
                ativo = @ativo,
                atualizado_em = @atualizado_em
            WHERE id = @id
        `).run({
            id,
            nome,
            email,
            role,
            secretaria_id: secretariaId,
            ativo,
            atualizado_em: agora
        });

        const usuarioAtualizado = db.prepare(`
            SELECT
                id,
                nome,
                email,
                role,
                secretaria_id AS secretariaId,
                ativo,
                criado_em AS criadoEm,
                atualizado_em AS atualizadoEm
            FROM users
            WHERE id = ?
        `).get(id);

        /*
          Se o usuário editado for o próprio usuário logado,
          atualizamos também a sessão para refletir nome/e-mail/role novos.
        */
        if (usuarioEditandoASiMesmo) {
            req.session.user = {
                ...req.session.user,
                nome: usuarioAtualizado.nome,
                email: usuarioAtualizado.email,
                role: usuarioAtualizado.role,
                secretariaId: usuarioAtualizado.secretariaId || null
            };
        }

        registrarAuditoria(req, "usuario.editar", {
            usuarioId: id,
            antes: {
                id: usuarioAtual.id,
                nome: usuarioAtual.nome,
                email: usuarioAtual.email,
                role: usuarioAtual.role,
                secretariaId: usuarioAtual.secretaria_id,
                ativo: usuarioAtual.ativo
            },
            depois: {
                id: usuarioAtualizado.id,
                nome: usuarioAtualizado.nome,
                email: usuarioAtualizado.email,
                role: usuarioAtualizado.role,
                secretariaId: usuarioAtualizado.secretariaId,
                ativo: usuarioAtualizado.ativo
            }
        });

        res.json({
            sucesso: true,
            mensagem: "Usuário atualizado com sucesso.",
            usuario: usuarioAtualizado
        });
    } catch (erro) {
        console.error("Erro ao editar usuário:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao editar usuário."
        });
    }
});

/* =========================================================
   API ADMIN: LOGS DE AUDITORIA
   ========================================================= */
app.get("/api/admin/audit-logs", exigirLogin, exigirRole("superadmin"), (req, res) => {
    try {
        const limite = Math.min(Number(req.query.limite || 100), 300);

        const logs = db.prepare(`
            SELECT
                id,
                user_id AS userId,
                user_name AS userName,
                user_email AS userEmail,
                user_role AS userRole,
                action,
                details,
                ip,
                user_agent AS userAgent,
                created_at AS createdAt
            FROM audit_logs
            ORDER BY id DESC
            LIMIT ?
        `).all(limite);

        res.json({
            sucesso: true,
            total: logs.length,
            logs: logs.map((log) => ({
                ...log,
                details: log.details ? JSON.parse(log.details) : null
            }))
        });
    } catch (erro) {
        console.error("Erro ao listar auditoria:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao listar logs de auditoria."
        });
    }
});

/* =========================================================
   API ADMIN: ATIVAR / DESATIVAR USUÁRIO
   =========================================================
   Altera somente o status de um usuário.

   Em vez de excluir usuários, usamos ativo/inativo.
   Isso preserva histórico e evita perder referência futura.

   Segurança:
   - exige login;
   - exige perfil administrativo;
   - impede o usuário logado de alterar o próprio status;
   - impede admin comum de ativar/desativar superadmin.
   ========================================================= */
app.patch("/api/admin/users/:id/status", exigirLogin, exigirAdmin, (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: true,
                mensagem: "ID de usuário inválido."
            });
        }

        /*
          Usuário logado na sessão.

          Precisamos dele para:
          - impedir autodesativação;
          - saber se ele é superadmin;
          - bloquear admin comum tentando alterar superadmin.
        */
        const usuarioLogado = obterUsuarioDaSessao(req);

        if (!usuarioLogado) {
            return res.status(401).json({
                erro: true,
                mensagem: "Sessão inválida. Faça login novamente."
            });
        }

        const usuarioLogadoEhSuperadmin = usuarioLogado.role === "superadmin";

        const usuario = db.prepare(`
            SELECT
                id,
                nome,
                email,
                role,
                ativo
            FROM users
            WHERE id = ?
            LIMIT 1
        `).get(id);

        if (!usuario) {
            return res.status(404).json({
                erro: true,
                mensagem: "Usuário não encontrado."
            });
        }

        /*
          Proteção:
          ninguém pode alterar o status do próprio usuário logado.

          Mesmo que esteja tentando "ativar" a si mesmo, não faz sentido
          permitir essa rota para o próprio cadastro.
        */
        if (Number(usuarioLogado.id) === id) {
            return res.status(403).json({
                erro: true,
                mensagem: "Você não pode alterar o status do próprio usuário logado."
            });
        }

        /*
          Proteção:
          admin comum não pode ativar/desativar superadmin.

          Motivo:
          se um admin pudesse desativar o superadmin, ele poderia
          bloquear a conta principal do sistema.
        */
        if (usuario.role === "superadmin" && !usuarioLogadoEhSuperadmin) {
            return res.status(403).json({
                erro: true,
                mensagem: "Somente um superadmin pode alterar o status de outro superadmin."
            });
        }

        /*
          Aceita true/false.
          Qualquer valor diferente de false será tratado como ativo.
        */
        const ativo = req.body.ativo === false ? 0 : 1;
        const agora = new Date().toISOString();

        db.prepare(`
            UPDATE users
            SET
                ativo = @ativo,
                atualizado_em = @atualizado_em
            WHERE id = @id
        `).run({
            id,
            ativo,
            atualizado_em: agora
        });

        const usuarioAtualizado = db.prepare(`
            SELECT
                id,
                nome,
                email,
                role,
                secretaria_id AS secretariaId,
                ativo,
                criado_em AS criadoEm,
                atualizado_em AS atualizadoEm
            FROM users
            WHERE id = ?
        `).get(id);

        registrarAuditoria(req, "usuario.alterar_status", {
            usuarioId: id,
            usuario: {
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role
            },
            ativoAnterior: usuario.ativo,
            ativoNovo: usuarioAtualizado.ativo
        });

        res.json({
            sucesso: true,
            mensagem: ativo
                ? "Usuário ativado com sucesso."
                : "Usuário desativado com sucesso.",
            usuario: usuarioAtualizado
        });
    } catch (erro) {
        console.error("Erro ao alterar status do usuário:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao alterar status do usuário."
        });
    }
});

/* =========================================================
   API ADMIN: EXCLUIR USUÁRIO
   =========================================================
   Exclui definitivamente um usuário do sistema.

   Segurança:
   - exige login;
   - exige perfil superadmin;
   - impede o superadmin logado de excluir a si mesmo;
   - registra auditoria antes da exclusão.
   ========================================================= */

app.delete("/api/admin/users/:id", exigirLogin, exigirRole("superadmin"), (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: true,
                mensagem: "ID de usuário inválido."
            });
        }

        const usuarioLogado = obterUsuarioDaSessao(req);

        if (!usuarioLogado) {
            return res.status(401).json({
                erro: true,
                mensagem: "Sessão inválida. Faça login novamente."
            });
        }

        if (Number(usuarioLogado.id) === id) {
            return res.status(403).json({
                erro: true,
                mensagem: "Você não pode excluir o próprio usuário logado."
            });
        }

        const usuarioAlvo = db.prepare(`
            SELECT
                id,
                nome,
                email,
                role,
                secretaria_id AS secretariaId,
                ativo,
                criado_em AS criadoEm,
                atualizado_em AS atualizadoEm
            FROM users
            WHERE id = ?
            LIMIT 1
        `).get(id);

        if (!usuarioAlvo) {
            return res.status(404).json({
                erro: true,
                mensagem: "Usuário não encontrado."
            });
        }

        registrarAuditoria(req, "usuario.excluir", {
            usuarioExcluido: {
                id: usuarioAlvo.id,
                nome: usuarioAlvo.nome,
                email: usuarioAlvo.email,
                role: usuarioAlvo.role,
                secretariaId: usuarioAlvo.secretariaId,
                ativo: usuarioAlvo.ativo,
                criadoEm: usuarioAlvo.criadoEm,
                atualizadoEm: usuarioAlvo.atualizadoEm
            }
        });

        db.prepare(`
            DELETE FROM users
            WHERE id = ?
        `).run(id);

        res.json({
            sucesso: true,
            mensagem: "Usuário excluído com sucesso.",
            usuario: {
                id: usuarioAlvo.id,
                nome: usuarioAlvo.nome,
                email: usuarioAlvo.email,
                role: usuarioAlvo.role
            }
        });
    } catch (erro) {
        console.error("Erro ao excluir usuário:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao excluir usuário."
        });
    }
});

/* =========================================================
   API ADMIN: RESETAR SENHA DE USUÁRIO
   =========================================================
   Redefine a senha de um usuário existente.

   Segurança:
   - exige login;
   - exige perfil administrativo;
   - salva a nova senha com hash bcrypt;
   - não retorna senha nem hash na resposta.
   ========================================================= */

app.post("/api/admin/users/:id/reset-password", exigirLogin, exigirAdmin, (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: true,
                mensagem: "ID de usuário inválido."
            });
        }

        const novaSenha = String(req.body.senha || req.body.novaSenha || "");

        if (!novaSenha || novaSenha.length < 6) {
            return res.status(400).json({
                erro: true,
                mensagem: "Informe uma nova senha com pelo menos 6 caracteres."
            });
        }

        const usuario = db.prepare(`
            SELECT
                id,
                nome,
                email,
                role,
                ativo
            FROM users
            WHERE id = ?
            LIMIT 1
        `).get(id);

        if (!usuario) {
            return res.status(404).json({
                erro: true,
                mensagem: "Usuário não encontrado."
            });
        }

        const senhaHash = bcrypt.hashSync(novaSenha, 10);
        const agora = new Date().toISOString();

        db.prepare(`
            UPDATE users
            SET
                senha_hash = @senha_hash,
                atualizado_em = @atualizado_em
            WHERE id = @id
        `).run({
            id,
            senha_hash: senhaHash,
            atualizado_em: agora
        });

        registrarAuditoria(req, "usuario.resetar_senha", {
            usuarioId: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role
        });

        res.json({
            sucesso: true,
            mensagem: "Senha redefinida com sucesso.",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role,
                ativo: usuario.ativo
            }
        });
    } catch (erro) {
        console.error("Erro ao redefinir senha:", erro);

        res.status(500).json({
            erro: true,
            mensagem: "Erro ao redefinir senha."
        });
    }
});

/* =========================================================
   START DO SERVIDOR
   ========================================================= */

/*
  Inicia manutenção automática de uploads temporários antigos.
  Isso evita acúmulo de restos de uploads interrompidos.
*/
iniciarRotinaLimpezaChunks();

app.listen(PORT, () => {
    console.log("==============================================");
    console.log(" Painel TV Prefeitura - Servidor Local");
    console.log("==============================================");
    console.log(` Player: http://localhost:${PORT}`);
    console.log(` Player alternativo: http://localhost:${PORT}/player`);
    console.log(` Admin: http://localhost:${PORT}/admin`);
    console.log(` Login: http://localhost:${PORT}/admin/login`);
    console.log(` API status: http://localhost:${PORT}/api/status`);
    console.log(` API health: http://localhost:${PORT}/api/health`);
    console.log(` API playlist: http://localhost:${PORT}/api/playlist`);
    console.log("==============================================");

    const publicacaoInicial = publicarPlaylistAutomaticamente();

    if (publicacaoInicial.sucesso) {
        console.log(` Playlist inicial gerada. Itens: ${publicacaoInicial.total}`);
    } else {
        console.log(" Não foi possível gerar a playlist inicial.");
    }
});
