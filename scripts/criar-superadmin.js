/* =========================================================
   SCRIPT - CRIAR PRIMEIRO SUPERADMIN
   =========================================================

   Execute com:
   node scripts/criar-superadmin.js

   Este script cria o primeiro usuário administrador do sistema.

   Importante:
   - A senha NÃO é salva em texto puro.
   - A senha é salva como hash usando bcryptjs.
   - Se o usuário já existir, o script não cria duplicado.
   ========================================================= */

const bcrypt = require("bcryptjs");
const db = require("../database/db");
const initDatabase = require("../database/initDatabase");

/*
  Edite estes dados se quiser outro nome/login/senha inicial.
*/
const usuarioInicial = {
    nome: "Raul",
    email: "admin",
    senha: "admin123",
    role: "superadmin"
};

try {
    /*
      Garante que as tabelas existem antes de inserir usuário.
    */
    initDatabase();

    /*
      Verifica se o usuário já existe.
    */
    const usuarioExistente = db.prepare(`
        SELECT id, nome, email, role
        FROM users
        WHERE email = ?
    `).get(usuarioInicial.email);

    if (usuarioExistente) {
        console.log("Usuário inicial já existe:");
        console.log(usuarioExistente);
        process.exit(0);
    }

    /*
      Gera hash seguro da senha.
      Quanto maior o saltRounds, mais pesado fica.
      10 é um bom equilíbrio para este projeto.
    */
    const saltRounds = 10;
    const senhaHash = bcrypt.hashSync(usuarioInicial.senha, saltRounds);

    /*
      Insere o usuário no banco.
    */
    const resultado = db.prepare(`
        INSERT INTO users (
            nome,
            email,
            senha_hash,
            role,
            ativo
        ) VALUES (
            @nome,
            @email,
            @senha_hash,
            @role,
            1
        )
    `).run({
        nome: usuarioInicial.nome,
        email: usuarioInicial.email,
        senha_hash: senhaHash,
        role: usuarioInicial.role
    });

    console.log("Superadmin criado com sucesso!");
    console.log({
        id: resultado.lastInsertRowid,
        nome: usuarioInicial.nome,
        email: usuarioInicial.email,
        role: usuarioInicial.role
    });

    console.log("");
    console.log("Login inicial:");
    console.log(`Usuário: ${usuarioInicial.email}`);
    console.log(`Senha: ${usuarioInicial.senha}`);
    console.log("");
    console.log("Troque essa senha depois que o CRUD de usuários estiver pronto.");

    process.exit(0);
} catch (erro) {
    console.error("Erro ao criar superadmin:", erro);
    process.exit(1);
}