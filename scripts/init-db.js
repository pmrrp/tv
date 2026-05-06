/* =========================================================
   SCRIPT - INICIALIZAR BANCO
   =========================================================

   Execute com:
   node scripts/init-db.js

   Ele cria o arquivo data/painel-tv.db e as tabelas iniciais.
   ========================================================= */

const initDatabase = require("../database/initDatabase");

try {
    initDatabase();
    console.log("Inicialização concluída.");
    process.exit(0);
} catch (erro) {
    console.error("Erro ao inicializar banco:", erro);
    process.exit(1);
}