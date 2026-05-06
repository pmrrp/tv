/* =========================================================
   SCRIPT - LISTAR USUÁRIOS
   =========================================================

   Execute com:
   node scripts/listar-users.js

   Mostra usuários cadastrados sem exibir senha/hash.
   ========================================================= */

const db = require("../database/db");

try {
    const usuarios = db.prepare(`
        SELECT
            id,
            nome,
            email,
            role,
            ativo,
            criado_em,
            atualizado_em
        FROM users
        ORDER BY id ASC
    `).all();

    console.table(usuarios);
    process.exit(0);
} catch (erro) {
    console.error("Erro ao listar usuários:", erro);
    process.exit(1);
}