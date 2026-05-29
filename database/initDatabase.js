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
    Tabela de auditoria.

    Registra ações importantes executadas no painel:
    - login/logout;
    - upload;
    - edição/exclusão de mídias;
    - alterações de usuários;
    - ações administrativas.
    */
    db.prepare(`
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,
        user_name TEXT,
        user_email TEXT,
        user_role TEXT,

        action TEXT NOT NULL,
        details TEXT,

        ip TEXT,
        user_agent TEXT,

        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE SET NULL
    )
    `).run();

    /*
      Tabela de sessões administrativas.

      Objetivo:
      - controlar sessões ativas por usuário;
      - permitir revogar sessões antigas;
      - futuramente listar sessões ativas no admin;
      - futuramente permitir desconectar sessões manualmente.
    */
    db.prepare(`
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,
            session_id TEXT NOT NULL UNIQUE,

            ip TEXT,
            user_agent TEXT,

            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

            revoked_at TEXT,
            revoked_reason TEXT,

            FOREIGN KEY (user_id)
                REFERENCES users (id)
                ON DELETE CASCADE
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

    db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
        ON user_sessions (user_id)
    `).run();

    db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id
        ON user_sessions (session_id)
    `).run();

    db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_user_sessions_revoked_at
        ON user_sessions (revoked_at)
    `).run();

    console.log("Banco de dados inicializado com sucesso.");
}

module.exports = initDatabase;