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
ELEMENTOS - RECUPERAÇÃO DE SENHA
========================================================= */

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const forgotEmailInput = document.getElementById("forgotEmail");
const btnShowForgotPassword = document.getElementById("btnShowForgotPassword");
const btnBackToLogin = document.getElementById("btnBackToLogin");
const btnRequestPasswordReset = document.getElementById("btnRequestPasswordReset");

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
 * Mostra mensagem na tela de login.
 *
 * Tipos:
 * - erro
 * - sucesso
 * - info
 */
function mostrarMensagem(texto, tipo = "erro") {
    if (!loginMessage) return;

    loginMessage.textContent = texto;

    loginMessage.classList.remove("hidden", "sucesso", "erro", "info");
    loginMessage.classList.add(tipo);
}

/**
 * Esconde mensagem da tela.
 */
function esconderMensagem() {
    if (!loginMessage) return;

    loginMessage.textContent = "";
    loginMessage.classList.add("hidden");
    loginMessage.classList.remove("sucesso", "erro", "info");
}

/**
 * Controla estado visual do botão.
 */
function definirCarregando(carregando) {
    if (!btnLogin) return;

    btnLogin.disabled = carregando;
    btnLogin.textContent = carregando ? "Entrando..." : "Entrar";
}

/* =========================================================
   RECUPERAÇÃO DE SENHA - INTERFACE
   ========================================================= */

/**
 * Alterna para o formulário de recuperação de senha.
 */
function mostrarFormularioRecuperacaoSenha() {
    esconderMensagem();

    if (loginForm) {
        loginForm.classList.add("hidden");
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.classList.remove("hidden");
    }

    /*
      Se o usuário já digitou algo no campo de login,
      reaproveitamos esse valor no campo de recuperação.
    */
    if (forgotEmailInput && emailInput) {
        forgotEmailInput.value = emailInput.value.trim();
    }

    setTimeout(() => {
        if (forgotEmailInput) {
            forgotEmailInput.focus();
        }
    }, 100);
}

/**
 * Volta para o formulário de login.
 */
function mostrarFormularioLogin() {
    esconderMensagem();

    if (forgotPasswordForm) {
        forgotPasswordForm.classList.add("hidden");
    }

    if (loginForm) {
        loginForm.classList.remove("hidden");
    }

    setTimeout(() => {
        if (emailInput) {
            emailInput.focus();
        }
    }, 100);
}

/**
 * Controla estado visual do botão de recuperação.
 */
function definirCarregandoRecuperacaoSenha(carregando) {
    if (!btnRequestPasswordReset) return;

    btnRequestPasswordReset.disabled = carregando;
    btnRequestPasswordReset.textContent = carregando
        ? "Enviando..."
        : "Enviar instruções";
}

/**
 * Envia dados de login para o servidor.
 */
async function realizarLogin(event) {
    event.preventDefault();

    esconderMensagem();

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email) {
        mostrarMensagem("Informe seu usuário de acesso.", "erro");

        if (emailInput) {
            emailInput.focus();
        }

        return;
    }

    if (!password) {
        mostrarMensagem("Informe sua senha de acesso.", "erro");

        if (passwordInput) {
            passwordInput.focus();
        }

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

/**
 * Solicita recuperação de senha.
 *
 * Por segurança, a API sempre responde com mensagem genérica,
 * sem confirmar se o usuário existe ou não.
 */
async function solicitarRecuperacaoSenha(event) {
    event.preventDefault();

    esconderMensagem();

    const email = forgotEmailInput
        ? forgotEmailInput.value.trim()
        : "";

    if (!email) {
        mostrarMensagem("Informe seu usuário/e-mail de acesso.", "erro");

        if (forgotEmailInput) {
            forgotEmailInput.focus();
        }

        return;
    }

    definirCarregandoRecuperacaoSenha(true);

    try {
        const resposta = await fetch("/api/auth/forgot-password", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.mensagem || "Não foi possível solicitar recuperação de senha.");
        }

        mostrarMensagem(
            dados.mensagem || "Se o usuário informado existir e estiver ativo, enviaremos as instruções de recuperação.",
            "sucesso"
        );

        /*
          Depois de solicitar, voltamos visualmente para o login,
          mas mantemos a mensagem de sucesso na tela.
        */
        if (forgotPasswordForm) {
            forgotPasswordForm.classList.add("hidden");
        }

        if (loginForm) {
            loginForm.classList.remove("hidden");
        }

        if (emailInput) {
            emailInput.value = email;
        }

        if (passwordInput) {
            passwordInput.value = "";
        }

    } catch (erro) {
        mostrarMensagem(
            erro.message || "Erro ao solicitar recuperação de senha.",
            "erro"
        );
    } finally {
        definirCarregandoRecuperacaoSenha(false);
    }
}

if (loginForm) {
    loginForm.addEventListener("submit", realizarLogin);
}

if (btnShowForgotPassword) {
    btnShowForgotPassword.addEventListener("click", mostrarFormularioRecuperacaoSenha);
}

if (btnBackToLogin) {
    btnBackToLogin.addEventListener("click", mostrarFormularioLogin);
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", solicitarRecuperacaoSenha);
}