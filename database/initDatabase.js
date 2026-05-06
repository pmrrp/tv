/* =========================================================
   DATABASE - INICIALIZAÇÃO DAS TABELAS
   =========================================================

   Este arquivo cria as tabelas iniciais do sistema.

   Por enquanto:
   - users
   - secretarias

   Ele pode ser executado várias vezes sem apagar dados.
   ========================================================= */

const db = require("./db");

/**
 * Cria/atualiza as tabelas necessárias.
 */
function initDatabase() {
    /*
      Tabela de secretarias.

      Futuramente, cada mídia poderá pertencer a uma secretaria.
    */
    db.prepare(`
        CREATE TABLE IF NOT EXISTS secretarias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            ativa INTEGER NOT NULL DEFAULT 1,
            criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    /*
      Tabela de usuários.

      role:
      - superadmin
      - admin
      - editor
      - viewer

      ativo:
      - 1 = usuário ativo
      - 0 = usuário desativado
    */
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'viewer',
            secretaria_id INTEGER,
            ativo INTEGER NOT NULL DEFAULT 1,
            criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (secretaria_id)
                REFERENCES secretarias (id)
                ON DELETE SET NULL
        )
    `).run();

    /*
      Índices simples para acelerar buscas futuras.
    */
    db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_users_email
        ON users (email)
    `).run();

    db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_users_role
        ON users (role)
    `).run();

    db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_users_ativo
        ON users (ativo)
    `).run();

    console.log("Banco de dados inicializado com sucesso.");
}

module.exports = initDatabase;