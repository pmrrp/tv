/* =========================================================
   LOGIN - PAINEL TV PREFEITURA
   =========================================================

   Login com usuário + senha.

   Fluxo:
   1. usuário informa login e senha;
   2. frontend envia para /api/login;
   3. backend valida no SQLite;
   4. backend cria sessão;
   5. frontend redireciona para /admin.
   ========================================================= */

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const loginMessage = document.getElementById("loginMessage");
const btnTogglePassword = document.getElementById("btnTogglePassword");
const btnTogglePasswordIcon = btnTogglePassword
    ? btnTogglePassword.querySelector("i")
    : null;

/* =========================================================
   FOCO AUTOMÁTICO NO LOGIN
   =========================================================
   Ao abrir a tela de login, posiciona o cursor automaticamente
   no campo de usuário/e-mail.

   Isso melhora a experiência de uso, principalmente para quem
   acessa o painel com frequência.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const campoUsuario = document.getElementById("email")
        || document.getElementById("login")
        || document.querySelector('input[name="email"]')
        || document.querySelector('input[name="login"]')
        || document.querySelector('input[type="text"]');

    if (!campoUsuario) return;

    campoUsuario.focus();
});

/* =========================================================
   MOSTRAR / OCULTAR SENHA
   ========================================================= */

/**
 * Alterna a visibilidade da senha usando ícones Font Awesome.
 *
 * Importante:
 * - não usamos emoji;
 * - não alteramos textContent do botão;
 * - alteramos somente a classe do <i>.
 */
function alternarVisibilidadeSenha() {
    if (!passwordInput || !btnTogglePassword || !btnTogglePasswordIcon) return;

    const senhaEstaOculta = passwordInput.type === "password";

    passwordInput.type = senhaEstaOculta ? "text" : "password";

    btnTogglePasswordIcon.className = senhaEstaOculta
        ? "fa-solid fa-eye-slash"
        : "fa-solid fa-eye";

    btnTogglePassword.setAttribute(
        "aria-label",
        senhaEstaOculta ? "Ocultar senha" : "Mostrar senha"
    );
}

if (btnTogglePassword) {
    btnTogglePassword.addEventListener("click", alternarVisibilidadeSenha);
}

/**
 * Mostra mensagem de erro no login.
 */
function mostrarMensagem(texto) {
    if (!loginMessage) return;

    loginMessage.textContent = texto;
    loginMessage.classList.remove("hidden");
}

/**
 * Esconde mensagem de erro.
 */
function esconderMensagem() {
    if (!loginMessage) return;

    loginMessage.textContent = "";
    loginMessage.classList.add("hidden");
}

/**
 * Controla estado visual do botão.
 */
function definirCarregando(carregando) {
    if (!btnLogin) return;

    btnLogin.disabled = carregando;
    btnLogin.textContent = carregando ? "Entrando..." : "Entrar";
}

/**
 * Envia dados de login para o servidor.
 */
async function realizarLogin(event) {
    event.preventDefault();

    esconderMensagem();

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
        mostrarMensagem("Informe usuário e senha.");
        return;
    }

    definirCarregando(true);

    try {
        const resposta = await fetch("/api/login", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.mensagem || "Não foi possível fazer login.");
        }

        window.location.href = "/admin";
    } catch (erro) {
        mostrarMensagem(erro.message || "Erro ao fazer login.");
    } finally {
        definirCarregando(false);
    }
}

if (loginForm) {
    loginForm.addEventListener("submit", realizarLogin);
}