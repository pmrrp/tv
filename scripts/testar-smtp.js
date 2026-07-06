/*
  scripts/testar-smtp.js

  Diagnóstico SMTP do Painel Ribas.

  Objetivo:
  - testar as configurações SMTP do arquivo .env;
  - verificar conexão/autenticação;
  - tentar enviar um e-mail de teste;
  - imprimir erro detalhado no terminal sem expor senha.

  Uso:
  node scripts/testar-smtp.js destino@exemplo.com
*/

require("dotenv").config();

const nodemailer = require("nodemailer");

function boolEnv(nome, valorPadrao = false) {
    const valor = process.env[nome];

    if (valor === undefined || valor === null || valor === "") {
        return valorPadrao;
    }

    return String(valor).trim().toLowerCase() === "true";
}

function ocultar(valor) {
    if (!valor) return "";

    const texto = String(valor);

    if (texto.length <= 4) {
        return "***";
    }

    return `${texto.slice(0, 2)}***${texto.slice(-2)}`;
}

async function main() {
    const destinatario = process.argv[2] || process.env.SMTP_TEST_TO || process.env.SMTP_USER;

    if (!destinatario || !destinatario.includes("@")) {
        console.error("Informe um destinatário de teste.");
        console.error("Exemplo:");
        console.error("node scripts/testar-smtp.js seu-email@dominio.com.br");
        process.exit(1);
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpSecure = boolEnv("SMTP_SECURE", false);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const mailFrom = process.env.MAIL_FROM || smtpUser;

    const authMethod = process.env.SMTP_AUTH_METHOD || undefined;

    /*
      Configurações TLS opcionais.

      Normalmente NÃO precisamos desativar validação de certificado.

      SMTP_TLS_REJECT_UNAUTHORIZED=false deve ser usado apenas como teste
      temporário para diagnosticar problema de certificado, nunca como solução
      final ideal.
    */
    const tlsRejectUnauthorized = boolEnv("SMTP_TLS_REJECT_UNAUTHORIZED", true);
    const tlsServername = process.env.SMTP_TLS_SERVERNAME || smtpHost;
    const requireTLS = boolEnv("SMTP_REQUIRE_TLS", false);

    console.log("=================================================");
    console.log("Diagnóstico SMTP - Painel Ribas");
    console.log("=================================================");
    console.log("SMTP_HOST:", smtpHost);
    console.log("SMTP_PORT:", smtpPort);
    console.log("SMTP_SECURE:", smtpSecure);
    console.log("SMTP_USER:", smtpUser);
    console.log("SMTP_PASS:", ocultar(smtpPass));
    console.log("MAIL_FROM:", mailFrom);
    console.log("SMTP_AUTH_METHOD:", authMethod || "(automático)");
    console.log("SMTP_REQUIRE_TLS:", requireTLS);
    console.log("SMTP_TLS_SERVERNAME:", tlsServername);
    console.log("SMTP_TLS_REJECT_UNAUTHORIZED:", tlsRejectUnauthorized);
    console.log("DESTINATÁRIO TESTE:", destinatario);
    console.log("=================================================");

    if (!smtpHost || !smtpUser || !smtpPass || !mailFrom) {
        console.error("Configuração incompleta. Confira SMTP_HOST, SMTP_USER, SMTP_PASS e MAIL_FROM no .env.");
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        requireTLS,

        auth: {
            user: smtpUser,
            pass: smtpPass
        },

        authMethod,

        tls: {
            servername: tlsServername,
            rejectUnauthorized: tlsRejectUnauthorized
        },

        logger: true,
        debug: true
    });

    try {
        console.log("\n[1/2] Verificando conexão/autenticação SMTP...");
        await transporter.verify();
        console.log("[OK] Conexão/autenticação SMTP validada.");

        console.log("\n[2/2] Enviando e-mail de teste...");
        const info = await transporter.sendMail({
            from: mailFrom,
            to: destinatario,
            subject: "Teste SMTP - Painel Ribas",
            text: [
                "Olá.",
                "",
                "Este é um teste SMTP do Painel Ribas.",
                "",
                "Se esta mensagem chegou, o envio por SMTP está funcionando.",
                "",
                `Data/hora: ${new Date().toLocaleString("pt-BR")}`
            ].join("\n")
        });

        console.log("[OK] E-mail enviado.");
        console.log("MessageId:", info.messageId);
        console.log("Resposta SMTP:", info.response);
    } catch (erro) {
        console.error("\n[ERRO] Falha no teste SMTP.");
        console.error("Mensagem:", erro.message);
        console.error("Código:", erro.code);
        console.error("Comando:", erro.command);
        console.error("Resposta:", erro.response);
        console.error("ResponseCode:", erro.responseCode);

        process.exit(1);
    }
}

main();