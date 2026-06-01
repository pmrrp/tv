/* =========================================================
   REDEFINIR SENHA - PAINEL TV PREFEITURA
   ========================================================= */

const resetPasswordForm = document.getElementById("resetPasswordForm");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const btnResetPassword = document.getElementById("btnResetPassword");
const resetPasswordMessage = document.getElementById("resetPasswordMessage");

const btnToggleNewPassword = document.getElementById("btnToggleNewPassword");
const btnToggleConfirmPassword = document.getElementById("btnToggleConfirmPassword");

const btnToggleNewPasswordIcon = btnToggleNewPassword
    ? btnToggleNewPassword.querySelector("i")
    : null;

const btnToggleConfirmPasswordIcon = btnToggleConfirmPassword
    ? btnToggleConfirmPassword.querySelector("i")
    : null;

/**
 * Recupera o token da URL.
 */
function obterTokenDaUrl() {
    const params = new URLSearchParams(window.location.search);

    return String(params.get("token") || "").trim();
}

/**
 * Mostra mensagem visual.
 */
function mostrarMensagemReset(texto, tipo = "erro") {
    if (!resetPasswordMessage) return;

    resetPasswordMessage.textContent = texto;

    resetPasswordMessage.classList.remove("hidden", "sucesso", "erro", "info");
    resetPasswordMessage.classList.add(tipo);
}

/**
 * Esconde mensagem visual.
 */
function esconderMensagemReset() {
    if (!resetPasswordMessage) return;

    resetPasswordMessage.textContent = "";
    resetPasswordMessage.classList.add("hidden");
    resetPasswordMessage.classList.remove("sucesso", "erro", "info");
}

/**
 * Controla estado visual do botão.
 */
function definirCarregandoReset(carregando) {
    if (!btnResetPassword) return;

    btnResetPassword.disabled = carregando;
    btnResetPassword.textContent = carregando
        ? "Redefinindo..."
        : "Redefinir senha";
}

/**
 * Alterna visibilidade de um campo de senha.
 */
function alternarCampoSenha(input, botao, icone) {
    if (!input || !botao || !icone) return;

    const senhaEstaOculta = input.type === "password";

    input.type = senhaEstaOculta ? "text" : "password";

    icone.className = senhaEstaOculta
        ? "fa-solid fa-eye-slash"
        : "fa-solid fa-eye";

    botao.setAttribute(
        "aria-label",
        senhaEstaOculta ? "Ocultar senha" : "Mostrar senha"
    );

    botao.setAttribute(
        "title",
        senhaEstaOculta ? "Ocultar senha" : "Mostrar senha"
    );
}

/**
 * Valida campos antes de enviar.
 */
function validarFormularioReset(token, novaSenha, confirmarSenha) {
    if (!token) {
        mostrarMensagemReset(
            "Link de recuperação inválido ou incompleto. Solicite uma nova recuperação de senha.",
            "erro"
        );
        return false;
    }

    if (!novaSenha) {
        mostrarMensagemReset("Informe a nova senha.", "erro");

        if (newPasswordInput) {
            newPasswordInput.focus();
        }

        return false;
    }

    if (novaSenha.length < 6) {
        mostrarMensagemReset("A nova senha deve ter pelo menos 6 caracteres.", "erro");

        if (newPasswordInput) {
            newPasswordInput.focus();
        }

        return false;
    }

    if (!confirmarSenha) {
        mostrarMensagemReset("Confirme a nova senha.", "erro");

        if (confirmPasswordInput) {
            confirmPasswordInput.focus();
        }

        return false;
    }

    if (novaSenha !== confirmarSenha) {
        mostrarMensagemReset("As senhas informadas não conferem.", "erro");

        if (confirmPasswordInput) {
            confirmPasswordInput.focus();
        }

        return false;
    }

    return true;
}

/**
 * Envia nova senha para o backend.
 */
async function redefinirSenha(event) {
    event.preventDefault();

    esconderMensagemReset();

    const token = obterTokenDaUrl();
    const novaSenha = newPasswordInput ? newPasswordInput.value : "";
    const confirmarSenha = confirmPasswordInput ? confirmPasswordInput.value : "";

    if (!validarFormularioReset(token, novaSenha, confirmarSenha)) {
        return;
    }

    definirCarregandoReset(true);

    try {
        const resposta = await fetch("/api/auth/reset-password", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token,
                password: novaSenha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.mensagem || "Não foi possível redefinir a senha.");
        }

        mostrarMensagemReset(
            dados.mensagem || "Senha redefinida com sucesso. Faça login novamente.",
            "sucesso"
        );

        /*
        Remove o token da barra de endereço após uso bem-sucedido.
        Assim, se alguém copiar a URL depois da redefinição, não carrega
        mais o token antigo visualmente.
        */
        window.history.replaceState({}, document.title, "/admin/reset-password");

        if (resetPasswordForm) {
            resetPasswordForm.classList.add("resetCompleted");
        }

        if (newPasswordInput) {
            newPasswordInput.value = "";
            newPasswordInput.disabled = true;
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.value = "";
            confirmPasswordInput.disabled = true;
        }

        if (btnResetPassword) {
            btnResetPassword.disabled = true;
            btnResetPassword.textContent = "Senha redefinida";
        }

        setTimeout(() => {
            window.location.href = "/admin/login";
        }, 3500);
    } catch (erro) {
        mostrarMensagemReset(
            erro.message || "Erro ao redefinir senha.",
            "erro"
        );
    } finally {
        /*
          Se deu sucesso, o botão já fica desabilitado com texto final.
        */
        if (!resetPasswordForm || !resetPasswordForm.classList.contains("resetCompleted")) {
            definirCarregandoReset(false);
        }
    }
}

/**
 * Habilita ou bloqueia o formulário de redefinição.
 */
function definirFormularioResetBloqueado(bloqueado) {
    if (newPasswordInput) {
        newPasswordInput.disabled = bloqueado;
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.disabled = bloqueado;
    }

    if (btnResetPassword) {
        btnResetPassword.disabled = bloqueado;
    }
}

/**
 * Valida o token no backend antes de permitir redefinir senha.
 */
async function validarTokenInicial(token) {
    definirFormularioResetBloqueado(true);

    try {
        const resposta = await fetch(
            `/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`,
            {
                method: "GET",
                credentials: "same-origin"
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok || !dados.valido) {
            throw new Error(dados.mensagem || "Link de recuperação inválido.");
        }

        definirFormularioResetBloqueado(false);
        esconderMensagemReset();

        setTimeout(() => {
            if (newPasswordInput) {
                newPasswordInput.focus();
            }
        }, 120);
    } catch (erro) {
        definirFormularioResetBloqueado(true);

        mostrarMensagemReset(
            erro.message || "Link de recuperação inválido ou expirado.",
            "erro"
        );
    }
}

/**
 * Inicialização da página.
 */
function iniciarResetPassword() {
    const token = obterTokenDaUrl();

    if (!token) {
        definirFormularioResetBloqueado(true);

        mostrarMensagemReset(
            "Link de recuperação inválido ou incompleto. Solicite uma nova recuperação de senha.",
            "erro"
        );

        return;
    }

    validarTokenInicial(token);
}

if (btnToggleNewPassword) {
    btnToggleNewPassword.addEventListener("click", () => {
        alternarCampoSenha(
            newPasswordInput,
            btnToggleNewPassword,
            btnToggleNewPasswordIcon
        );
    });
}

if (btnToggleConfirmPassword) {
    btnToggleConfirmPassword.addEventListener("click", () => {
        alternarCampoSenha(
            confirmPasswordInput,
            btnToggleConfirmPassword,
            btnToggleConfirmPasswordIcon
        );
    });
}

if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", redefinirSenha);
}

document.addEventListener("DOMContentLoaded", iniciarResetPassword);