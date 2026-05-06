/* =========================================================
   DATABASE - CONEXÃO SQLITE
   =========================================================

   Este arquivo centraliza a conexão com o banco SQLite.

   O banco será salvo em:
   data/painel-tv.db

   Importante:
   - SQLite é um banco em arquivo.
   - Não precisa instalar servidor de banco separado.
   - O arquivo .db deve ser preservado em produção.
   ========================================================= */

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

/*
  Caminho da pasta data.
  Ela já existe no projeto, mas garantimos aqui também.
*/
const projectRoot = path.join(__dirname, "..");
const dataFolder = path.join(projectRoot, "data");

/*
  Arquivo físico do banco SQLite.
*/
const databaseFile = path.join(dataFolder, "painel-tv.db");

/*
  Garante que a pasta data exista antes de abrir o banco.
*/
if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
}

/*
  Abre conexão com o banco.
  Se o arquivo não existir, o SQLite cria automaticamente.
*/
const db = new Database(databaseFile);

/*
  Configuração recomendada para SQLite:
  WAL melhora segurança e desempenho para leituras/escritas.
*/
db.pragma("journal_mode = WAL");

/*
  Ativa suporte a chaves estrangeiras.
*/
db.pragma("foreign_keys = ON");

module.exports = db;