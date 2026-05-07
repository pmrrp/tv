/* =========================================================
   ADMIN - PAINEL TV PREFEITURA
   =========================================================

   Este arquivo controla toda a lógica do painel administrativo.

   Responsabilidades:
   - listar mídias cadastradas;
   - enviar novas mídias por upload;
   - salvar configurações em lote;
   - controlar alterações pendentes;
   - ordenar mídias na playlist;
   - selecionar e excluir mídias em lote;
   - controlar validade por data/hora;
   - atualizar contador da playlist;
   - controlar logout do painel.

   Observação:
   Este arquivo ainda está em JavaScript puro.
   Futuramente, se o painel crescer muito, podemos separar em
   módulos menores ou migrar para uma estrutura mais organizada.
   ========================================================= */


/* =========================================================
   ELEMENTOS DA INTERFACE
   ========================================================= */

const mediaList = document.getElementById("mediaList");
const loadingMessage = document.getElementById("loadingMessage");

const btnReload = document.getElementById("btnReload");
const btnSalvarTudo = document.getElementById("btnSalvarTudo");
const pendingChanges = document.getElementById("pendingChanges");
const btnLogout = document.getElementById("btnLogout");

const uploadForm = document.getElementById("uploadForm");
const inputArquivo = document.getElementById("arquivo");
const selectedFileName = document.getElementById("selectedFileName");
const uploadMessage = document.getElementById("uploadMessage");
const btnUpload = document.getElementById("btnUpload");

const btnGerarPlaylist = document.getElementById("btnGerarPlaylist");
const playlistMessage = document.getElementById("playlistMessage");
const playlistTotal = document.getElementById("playlistTotal");

const selectAllMedia = document.getElementById("selectAllMedia");
const btnDeleteSelected = document.getElementById("btnDeleteSelected");
const btnToggleSelectionMode = document.getElementById("btnToggleSelectionMode");

const summaryTotalMedia = document.getElementById("summaryTotalMedia");
const summaryActiveMedia = document.getElementById("summaryActiveMedia");
const summaryValidMedia = document.getElementById("summaryValidMedia");
const summaryScheduledMedia = document.getElementById("summaryScheduledMedia");
const summaryPriorityMedia = document.getElementById("summaryPriorityMedia");
const summaryRepeatMedia = document.getElementById("summaryRepeatMedia");
const summaryPlaylistItems = document.getElementById("summaryPlaylistItems");
const summaryPlaylistUpdated = document.getElementById("summaryPlaylistUpdated");

const mediaSearch = document.getElementById("mediaSearch");
const mediaStatusFilter = document.getElementById("mediaStatusFilter");
const mediaTypeFilter = document.getElementById("mediaTypeFilter");
const mediaPeriodFilter = document.getElementById("mediaPeriodFilter");
const mediaPriorityFilter = document.getElementById("mediaPriorityFilter");
const mediaRepeatFilter = document.getElementById("mediaRepeatFilter");
const mediaFilterInfo = document.getElementById("mediaFilterInfo");
const libraryDropdownMeta = document.getElementById("libraryDropdownMeta");

const adminUserName = document.getElementById("adminUserName");

const toastContainer = document.getElementById("toastContainer");

/* =========================================================
   ELEMENTOS - USUÁRIOS
   ========================================================= */

const usersCard = document.getElementById("usersCard");
const usersList = document.getElementById("usersList");
const usersMessage = document.getElementById("usersMessage");

const btnNewUser = document.getElementById("btnNewUser");
const btnReloadUsers = document.getElementById("btnReloadUsers");

const userModal = document.getElementById("userModal");
const userForm = document.getElementById("userForm");
const userFormTitle = document.getElementById("userFormTitle");
const btnCancelUserForm = document.getElementById("btnCancelUserForm");

const userIdInput = document.getElementById("userId");
const userNameInput = document.getElementById("userName");
const userEmailInput = document.getElementById("userEmail");
const userPasswordInput = document.getElementById("userPassword");
const userPasswordLabel = document.getElementById("userPasswordLabel");
const userRoleInput = document.getElementById("userRole");
const userActiveInput = document.getElementById("userActive");

const btnToggleUserPassword = document.getElementById("btnToggleUserPassword");
const btnToggleUserPasswordIcon = btnToggleUserPassword
    ? btnToggleUserPassword.querySelector("i")
    : null;

const userPasswordHint = document.getElementById("userPasswordHint");

const userRoleField = userRoleInput
    ? userRoleInput.closest(".selectField")
    : null;

const usersDropdown = document.getElementById("usersDropdown");
const usersDropdownCount = document.getElementById("usersDropdownCount");

/* =========================================================
   ELEMENTOS - RESET DE SENHA
   ========================================================= */

const resetPasswordModal = document.getElementById("resetPasswordModal");
const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetPasswordUserIdInput = document.getElementById("resetPasswordUserId");
const resetPasswordInput = document.getElementById("resetPasswordInput");
const resetPasswordHint = document.getElementById("resetPasswordHint");
const resetPasswordDescription = document.getElementById("resetPasswordDescription");

const btnCancelResetPassword = document.getElementById("btnCancelResetPassword");
const btnSaveResetPassword = document.getElementById("btnSaveResetPassword");
const btnToggleResetPassword = document.getElementById("btnToggleResetPassword");

const btnToggleResetPasswordIcon = btnToggleResetPassword
    ? btnToggleResetPassword.querySelector("i")
    : null;

/* =========================================================
   ELEMENTOS - ALTERAR STATUS DO USUÁRIO
   ========================================================= */

const userStatusModal = document.getElementById("userStatusModal");
const userStatusTitle = document.getElementById("userStatusTitle");
const userStatusDescription = document.getElementById("userStatusDescription");
const userStatusUserIdInput = document.getElementById("userStatusUserId");
const userStatusNewValueInput = document.getElementById("userStatusNewValue");

const btnCancelUserStatus = document.getElementById("btnCancelUserStatus");
const btnDismissUserStatus = document.getElementById("btnDismissUserStatus");
const btnConfirmUserStatus = document.getElementById("btnConfirmUserStatus");

/* =========================================================
   USUÁRIO LOGADO - UTILITÁRIO SEGURO
   ========================================================= */

/**
 * Atualiza o nome exibido no cabeçalho.
 *
 * Aceita:
 * - string: "Raul"
 * - objeto: { nome: "Raul", ... }
 *
 * Evita aparecer "Olá, [object Object]".
 */
function definirNomeUsuarioLogado(valor) {
    if (!adminUserName) return;

    if (typeof valor === "string" && valor.trim()) {
        adminUserName.textContent = valor.trim();
        return;
    }

    if (valor && typeof valor === "object" && typeof valor.nome === "string") {
        adminUserName.textContent = valor.nome.trim() || "usuário";
        return;
    }

    definirNomeUsuarioLogado("usuário");
}

/* =========================================================
   PERMISSÕES VISUAIS DO ADMIN
   =========================================================
   Importante:
   - isso melhora a experiência visual da tela;
   - a segurança real continua sendo feita no backend.
   ========================================================= */

/**
 * Retorna a role/perfil do usuário logado.
 *
 * Se por algum motivo o usuário ainda não tiver carregado,
 * assumimos "viewer" por segurança visual.
 */
function obterRoleUsuarioLogado() {
    return usuarioLogado && usuarioLogado.role
        ? usuarioLogado.role
        : "viewer";
}

/**
 * Superadmin e admin podem gerenciar usuários.
 */
function usuarioPodeGerenciarUsuarios() {
    return ["superadmin", "admin"].includes(obterRoleUsuarioLogado());
}

/**
 * Superadmin, admin e editor podem gerenciar mídias.
 */
function usuarioPodeEditarMidias() {
    return ["superadmin", "admin", "editor"].includes(obterRoleUsuarioLogado());
}

/**
 * Aplica classes no body conforme as permissões.
 *
 * O CSS usa essas classes para esconder/mostrar partes da interface.
 */
function aplicarClassesDePermissao() {
    const role = obterRoleUsuarioLogado();

    document.body.classList.remove(
        "role-superadmin",
        "role-admin",
        "role-editor",
        "role-viewer",
        "can-edit-media",
        "can-manage-users"
    );

    document.body.classList.add(`role-${role}`);

    if (usuarioPodeEditarMidias()) {
        document.body.classList.add("can-edit-media");
    }

    if (usuarioPodeGerenciarUsuarios()) {
        document.body.classList.add("can-manage-users");
    }
}

/**
 * Verifica se o usuário pode editar mídias.
 *
 * Se não puder, mostra um aviso e retorna false.
 * Usamos isso antes de ações sensíveis no frontend.
 */
function garantirPermissaoParaEditarMidias() {
    if (usuarioPodeEditarMidias()) {
        return true;
    }

    mostrarToast(
        "Seu perfil não tem permissão para alterar mídias.",
        "erro"
    );

    return false;
}

/**
 * Verifica se o usuário pode gerenciar usuários.
 *
 * Se não puder, mostra um aviso e retorna false.
 */
function garantirPermissaoParaGerenciarUsuarios() {
    if (usuarioPodeGerenciarUsuarios()) {
        return true;
    }

    mostrarToast(
        "Seu perfil não tem permissão para gerenciar usuários.",
        "erro"
    );

    return false;
}


/* =========================================================
   ESTADO GLOBAL DO ADMIN
   ========================================================= */

/*
  Indica se o usuário alterou algum campo e ainda não salvou.
  Usado para:
  - habilitar o botão "Salvar alterações";
  - mostrar aviso visual;
  - impedir saída acidental da página.
*/
let existemAlteracoesPendentes = false;
let mediaArrastada = null;
let modoSelecaoMidiasAtivo = false;
let uploadMessageTimer = null;
let playlistMessageTimer = null;
let modalConfirmacao = null;
let usuariosCarregados = [];
let usuarioLogado = null;


/* =========================================================
   FUNÇÕES UTILITÁRIAS
   ========================================================= */

/**
 * Faz uma requisição fetch e trata erro de sessão expirada.
 *
 * Se a API retornar 401, significa que o usuário não está logado
 * ou a sessão expirou. Nesse caso, redirecionamos para o login.
 */
async function fetchComSessao(url, opcoes = {}) {
    const resposta = await fetch(url, {
        credentials: "same-origin",
        ...opcoes
    });

    if (resposta.status === 401) {
        window.location.href = "/admin/login";
        throw new Error("Sessão expirada. Faça login novamente.");
    }

    return resposta;
}

/* =========================================================
   DROPDOWNS - SCROLL AUTOMÁTICO COM RESPIRO
   ========================================================= */

/**
 * Rola até um elemento deixando uma margem superior.
 */
function rolarAteElementoComOffset(elemento, offset = 24) {
    if (!elemento) return;

    const posicao =
        elemento.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
        top: posicao,
        behavior: "smooth"
    });
}

/**
 * Ao abrir um dropdown/details, rola a página suavemente
 * até a seção aberta.
 */
function configurarScrollAoAbrirDropdowns() {
    const dropdowns = document.querySelectorAll(
        ".libraryDropdown, .usersDropdown"
    );

    dropdowns.forEach((dropdown) => {
        dropdown.addEventListener("toggle", () => {
            if (!dropdown.open) return;

            setTimeout(() => {
                rolarAteElementoComOffset(dropdown, 24);
            }, 120);
        });
    });
}

/* =========================================================
   DETAILS / POPOVERS - FECHAMENTO INTELIGENTE
   =========================================================
   Controla elementos <details> usados como menus/popovers.

   Resolve:
   - menu "Olá, usuário" não fechar ao clicar fora;
   - popover de período não fechar ao clicar fora;
   - menu de prioridade ficar aberto;
   - ESC não fechar os menus;
   - vários popovers abertos ao mesmo tempo.
   ========================================================= */

/**
 * Retorna todos os <details> que devem se comportar como popover.
 */
function obterDetailsControlados() {
    return Array.from(document.querySelectorAll([
        ".adminUserDropdown",
        ".mediaScheduleMenu",
        ".mediaPriorityMenu",
        ".mediaDetailsHover",
        ".mediaFiltersDropdown"
    ].join(",")));
}

/**
 * Fecha os details controlados.
 *
 * O parâmetro "exceto" permite manter aberto o details atual
 * quando o usuário acabou de clicar nele.
 */
function fecharDetailsControlados(exceto = null) {
    obterDetailsControlados().forEach((details) => {
        if (details !== exceto) {
            details.removeAttribute("open");
        }
    });
}

/**
 * Configura fechamento automático dos popovers/details.
 *
 * Comportamentos:
 * - clicar fora fecha todos;
 * - ESC fecha todos;
 * - abrir um fecha os outros;
 * - clique dentro do próprio details não fecha.
 */
function configurarDetailsControlados() {
    document.addEventListener("click", (event) => {
        const detailsClicado = event.target.closest(
            ".adminUserDropdown, .mediaScheduleMenu, .mediaPriorityMenu, .mediaDetailsHover, .mediaFiltersDropdown"
        );

        if (detailsClicado) {
            return;
        }

        fecharDetailsControlados();

        const dropdownFiltros = document.querySelector(".mediaFiltersDropdown");

        if (dropdownFiltros) {
            dropdownFiltros.removeAttribute("open");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;

        fecharDetailsControlados();

        const dropdownFiltros = document.querySelector(".mediaFiltersDropdown");

        if (dropdownFiltros) {
            dropdownFiltros.removeAttribute("open");
        }
    });

    document.addEventListener("toggle", (event) => {
        const details = event.target;

        if (!(details instanceof HTMLDetailsElement)) return;

        const ehControlado = details.matches(
            ".adminUserDropdown, .mediaScheduleMenu, .mediaPriorityMenu, .mediaDetailsHover, .mediaFiltersDropdown"
        );

        if (!ehControlado || !details.open) return;

        fecharDetailsControlados(details);
    }, true);
}

/* =========================================================
   USUÁRIOS - HELPERS VISUAIS
   ========================================================= */

/**
 * Retorna um rótulo amigável para cada perfil.
 */
function obterLabelRole(role) {
    const labels = {
        superadmin: "Superadmin",
        admin: "Administrador",
        editor: "Editor",
        viewer: "Visualizador"
    };

    return labels[role] || "Usuário";
}

/**
 * Retorna um ícone Font Awesome para cada perfil.
 */
function obterIconeRole(role) {
    const icones = {
        superadmin: "fa-user-shield",
        admin: "fa-user-gear",
        editor: "fa-pen-to-square",
        viewer: "fa-eye"
    };

    return icones[role] || "fa-user";
}

/**
 * Mostra mensagem simples dentro da área de usuários.
 */
function mostrarMensagemUsuarios(texto, tipo = "info") {
    mostrarToast(texto, tipo);

    if (!usersMessage) return;

    usersMessage.textContent = texto;
    usersMessage.className = `uploadMessage ${tipo} hidden`;
}

/**
 * Renderiza estado vazio da lista de usuários.
 */
function renderizarUsuariosVazio() {
    if (!usersList) return;

    usersList.innerHTML = `
        <div class="emptyState">
            Nenhum usuário cadastrado.
        </div>
    `;
}

/* =========================================================
   USUÁRIOS - RENDERIZAÇÃO
   ========================================================= */

/**
 * Renderiza a lista de usuários retornada pela API.
 */
function renderizarUsuarios(usuarios) {
    if (!usersList) return;

    const totalUsuarios = Array.isArray(usuarios) ? usuarios.length : 0;
    const totalAtivos = Array.isArray(usuarios)
        ? usuarios.filter((usuario) => Number(usuario.ativo) === 1).length
        : 0;

    if (usersDropdownCount) {
        usersDropdownCount.textContent =
            `${totalUsuarios} usuário(s) • ${totalAtivos} ativo(s)`;
    }

    usersList.innerHTML = "";

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
        renderizarUsuariosVazio();
        return;
    }

    usuarios.forEach((usuario) => {
        const item = document.createElement("div");

        item.className = [
            "userItem",
            Number(usuario.ativo) === 1 ? "" : "userItemInactive"
        ].filter(Boolean).join(" ");

        item.dataset.userId = usuario.id;
        item.dataset.role = usuario.role;
        item.dataset.active = Number(usuario.ativo) === 1 ? "true" : "false";

        const nome = escaparHtml(usuario.nome || "Usuário");
        const email = escaparHtml(usuario.email || "");
        const role = escaparHtml(usuario.role || "viewer");
        const roleLabel = obterLabelRole(usuario.role);
        const roleIcon = obterIconeRole(usuario.role);

        const ativo = Number(usuario.ativo) === 1;
        const usuarioEhAtual =
            usuarioLogado && Number(usuario.id) === Number(usuarioLogado.id);

        const usuarioLogadoEhSuperadmin =
            usuarioLogado && usuarioLogado.role === "superadmin";

        const usuarioDaListaEhSuperadmin =
            usuario.role === "superadmin";

        const podeGerenciarEsteUsuario =
            usuarioLogadoEhSuperadmin || !usuarioDaListaEhSuperadmin;

        const statusLabel = ativo ? "Ativo" : "Inativo";
        const statusClass = ativo ? "status-active" : "status-inactive";

        const secretariaNome = usuario.secretariaNome
            ? escaparHtml(usuario.secretariaNome)
            : "Sem secretaria vinculada";

        const botaoStatusUsuario = usuarioEhAtual
            ? `
        <button
            class="secondaryAction btnCurrentUser"
            type="button"
            disabled
            title="Você não pode desativar seu próprio usuário"
        >
            <i class="fa-solid fa-user-check" aria-hidden="true"></i>
            Usuário atual
        </button>
    `
            : !podeGerenciarEsteUsuario
                ? `
            <button
                class="secondaryAction btnProtectedUser"
                type="button"
                disabled
                title="Somente um superadmin pode alterar este usuário"
            >
                <i class="fa-solid fa-lock" aria-hidden="true"></i>
                Protegido
            </button>
        `
                : `
            <button
                class="${ativo ? "dangerAction" : "successAction"} btnToggleUserStatus"
                type="button"
                data-user-id="${usuario.id}"
                data-user-name="${nome}"
                data-active="${ativo ? "true" : "false"}"
            >
                <i class="fa-solid ${ativo ? "fa-user-slash" : "fa-user-check"}" aria-hidden="true"></i>
                ${ativo ? "Desativar" : "Ativar"}
            </button>
        `;

        const botaoEditarUsuario = podeGerenciarEsteUsuario
            ? `
        <button
            class="secondaryAction btnEditUser"
            type="button"
            data-user-id="${usuario.id}"
        >
            <i class="fa-solid fa-pen" aria-hidden="true"></i>
            Editar
        </button>
    `
            : `
        <button
            class="secondaryAction btnProtectedUser"
            type="button"
            disabled
            title="Somente um superadmin pode editar este usuário"
        >
            <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
            Protegido
        </button>
    `;

        const botaoResetSenhaUsuario = podeGerenciarEsteUsuario
            ? `
        <button
            class="warningAction btnResetUserPassword"
            type="button"
            data-user-id="${usuario.id}"
            data-user-name="${nome}"
        >
            <i class="fa-solid fa-key" aria-hidden="true"></i>
            Resetar Senha
        </button>
    `
            : "";

        item.innerHTML = `
            <div class="userInfo">
                <div class="userMainLine">
                    <strong class="userName">${nome}</strong>
                    <span class="userLogin">${email}</span>
                </div>

                <div class="userMeta">
                    <span class="userBadge role-${role}">
                        <i class="fa-solid ${roleIcon}" aria-hidden="true"></i>
                        ${roleLabel}
                    </span>

                    <span class="userBadge ${statusClass}">
                        <i class="fa-solid ${ativo ? "fa-circle-check" : "fa-circle-xmark"}" aria-hidden="true"></i>
                        ${statusLabel}
                    </span>

                    <span class="userBadge role-viewer">
                        <i class="fa-solid fa-building" aria-hidden="true"></i>
                        ${secretariaNome}
                    </span>
                </div>
            </div>

            <div class="userActions">
                ${botaoEditarUsuario}
                ${botaoResetSenhaUsuario}
                ${botaoStatusUsuario}
            </div>
        `;

        usersList.appendChild(item);
    });
}

/* =========================================================
   USUÁRIOS - API
   ========================================================= */

/**
 * Carrega os usuários cadastrados no sistema.
 */
async function carregarUsuarios() {
    if (!usersList) return;

    if (usersDropdownCount) {
        usersDropdownCount.textContent = "Carregando usuários...";
    }

    usersList.innerHTML = `
    <div class="message">
        Carregando usuários...
    </div>
    `;

    if (btnReloadUsers) {
        btnReloadUsers.disabled = true;
    }

    try {
        const resposta = await fetchComSessao("/api/admin/users");

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.mensagem || "Erro ao carregar usuários.");
        }

        usuariosCarregados = dados.usuarios || [];
        renderizarUsuarios(usuariosCarregados);
    } catch (erro) {
        console.error("Erro ao carregar usuários:", erro);

        usersList.innerHTML = `
            <div class="emptyState">
                Não foi possível carregar os usuários.
            </div>
        `;

        mostrarMensagemUsuarios(
            erro.message || "Erro ao carregar usuários.",
            "erro"
        );
    } finally {
        if (btnReloadUsers) {
            btnReloadUsers.disabled = false;
        }
    }
}

/* =========================================================
   USUÁRIOS - FORMULÁRIO
   ========================================================= */

/**
 * Limpa todos os campos do formulário de usuário.
 */
function limparFormularioUsuario() {
    if (userIdInput) userIdInput.value = "";
    if (userNameInput) userNameInput.value = "";
    if (userEmailInput) userEmailInput.value = "";
    if (userPasswordInput) {
        userPasswordInput.value = "";
        userPasswordInput.type = "password";
        userPasswordInput.classList.remove("fieldInvalid");
        userPasswordInput.classList.remove("fieldValid");
    }

    if (btnToggleUserPasswordIcon) {
        btnToggleUserPasswordIcon.className = "fa-solid fa-eye";
    }

    if (btnToggleUserPassword) {
        btnToggleUserPassword.setAttribute("aria-label", "Mostrar senha");
    }

    if (userPasswordHint) {
        userPasswordHint.classList.remove("erro");
        userPasswordHint.classList.remove("sucesso");
        userPasswordHint.textContent = "A senha deve ter pelo menos 6 caracteres.";
    }

    if (userRoleInput) userRoleInput.value = "viewer";
    if (userActiveInput) {
        if (userActiveInput.type === "checkbox") {
            userActiveInput.checked = true;
        } else {
            userActiveInput.value = "true";
        }
    }
}

/**
 * Abre o modal de usuário.
 */
function abrirModalUsuario() {
    if (!userModal) return;

    userModal.classList.remove("hidden");
    userModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");
}

/**
 * Fecha o modal de usuário.
 */
function fecharModalUsuario() {
    if (!userModal) return;

    userModal.classList.add("hidden");
    userModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");
}

/**
 * Abre o formulário no modo "novo usuário".
 */
function abrirFormularioNovoUsuario() {
    if (!garantirPermissaoParaGerenciarUsuarios()) return;
    limparFormularioUsuario();

    if (userFormTitle) {
        userFormTitle.textContent = "Novo usuário";
    }

    /*
      Para criação de usuário, a senha inicial é obrigatória.
    */
    if (userPasswordLabel) {
        userPasswordLabel.classList.remove("hidden");
    }

    if (userPasswordInput) {
        userPasswordInput.required = true;
        userPasswordInput.placeholder = "Mínimo 6 caracteres";
    }

    abrirModalUsuario();

    setTimeout(() => {
        if (userNameInput) userNameInput.focus();
    }, 180);
}

/**
 * Fecha o formulário de usuário.
 */
function fecharFormularioUsuario() {
    limparFormularioUsuario();
    fecharModalUsuario();
}

/* =========================================================
   SELECT CUSTOMIZADO - PERFIL DO USUÁRIO
   ========================================================= */

/**
 * Controla a animação da setinha do select de perfil.
 *
 * Observação:
 * o navegador não dá um evento perfeito para "select abriu/fechou",
 * então usamos uma aproximação visual:
 * - pointerdown/click: vira a seta;
 * - change/blur/Escape: volta a seta.
 */
function abrirIndicadorSelectPerfil() {
    if (!userRoleField) return;

    userRoleField.classList.add("isOpen");
}

function fecharIndicadorSelectPerfil() {
    if (!userRoleField) return;

    userRoleField.classList.remove("isOpen");
}

/* =========================================================
   USUÁRIOS - SENHA DO MODAL
   ========================================================= */

/**
 * Alterna a visibilidade da senha no modal de usuário.
 */
function alternarVisibilidadeSenhaUsuario() {
    if (!userPasswordInput || !btnToggleUserPassword || !btnToggleUserPasswordIcon) return;

    const senhaEstaOculta = userPasswordInput.type === "password";

    userPasswordInput.type = senhaEstaOculta ? "text" : "password";

    btnToggleUserPasswordIcon.className = senhaEstaOculta
        ? "fa-solid fa-eye-slash"
        : "fa-solid fa-eye";

    btnToggleUserPassword.setAttribute(
        "aria-label",
        senhaEstaOculta ? "Ocultar senha" : "Mostrar senha"
    );
}

/**
 * Valida visualmente o campo de senha do modal.
 *
 * No modo novo usuário, a senha é obrigatória.
 * No modo edição, a senha não será usada aqui, porque resetar senha
 * terá modal próprio depois.
 */
function validarSenhaUsuarioVisualmente() {
    if (!userPasswordInput || !userPasswordHint) return true;

    const senha = userPasswordInput.value;
    const senhaValida = senha.length >= 6;

    /*
      Se o campo não for obrigatório e estiver vazio,
      não marcamos como erro.
    */
    if (!userPasswordInput.required && senha.length === 0) {
        userPasswordInput.classList.remove("fieldInvalid");
        userPasswordInput.classList.remove("fieldValid");
        userPasswordHint.classList.remove("erro");
        userPasswordHint.classList.remove("sucesso");
        userPasswordHint.textContent = "Deixe em branco para não alterar a senha.";
        return true;
    }

    if (senhaValida) {
        userPasswordInput.classList.remove("fieldInvalid");
        userPasswordInput.classList.add("fieldValid");
        userPasswordHint.classList.remove("erro");
        userPasswordHint.classList.add("sucesso");
        userPasswordHint.textContent = "Senha válida.";
        return true;
    }

    userPasswordInput.classList.remove("fieldValid");
    userPasswordInput.classList.add("fieldInvalid");
    userPasswordHint.classList.remove("sucesso");
    userPasswordHint.classList.add("erro");
    userPasswordHint.textContent = "A senha precisa ter pelo menos 6 caracteres.";
    return false;
}

/* =========================================================
   USUÁRIOS - COLETA DE DADOS DO FORMULÁRIO
   ========================================================= */

/**
 * Coleta os dados preenchidos no modal de usuário.
 */
function coletarDadosFormularioUsuario() {
    const id = userIdInput ? userIdInput.value.trim() : "";

    const nome = userNameInput ? userNameInput.value.trim() : "";
    const email = userEmailInput ? userEmailInput.value.trim().toLowerCase() : "";
    const senha = userPasswordInput ? userPasswordInput.value : "";
    const role = userRoleInput ? userRoleInput.value : "viewer";

    /*
      No modo "novo usuário", removemos o checkbox visual de ativo
      e deixamos o hidden sempre true.
    */
    const ativo = userActiveInput
        ? userActiveInput.type === "checkbox"
            ? userActiveInput.checked
            : userActiveInput.value !== "false"
        : true;

    return {
        id,
        nome,
        email,
        senha,
        role,
        ativo,
        secretariaId: null
    };
}

/* =========================================================
   USUÁRIOS - VALIDAÇÃO DO FORMULÁRIO
   ========================================================= */

/**
 * Valida os campos antes de enviar para a API.
 */
function validarFormularioUsuario(dados) {
    if (!dados.nome) {
        mostrarToast("Informe o nome do usuário.", "erro");
        if (userNameInput) userNameInput.focus();
        return false;
    }

    if (!dados.email) {
        mostrarToast("Informe o e-mail/login de acesso.", "erro");
        if (userEmailInput) userEmailInput.focus();
        return false;
    }

    /*
      Se for novo usuário, senha é obrigatória.
      Se for edição, senha não entra aqui.
    */
    const criandoNovoUsuario = !dados.id;

    if (criandoNovoUsuario) {
        if (!dados.senha || dados.senha.length < 6) {
            mostrarToast("Informe uma senha com pelo menos 6 caracteres.", "erro");

            if (userPasswordInput) {
                userPasswordInput.focus();
                validarSenhaUsuarioVisualmente();
            }

            return false;
        }
    }

    const rolesPermitidas = ["superadmin", "admin", "editor", "viewer"];

    if (!rolesPermitidas.includes(dados.role)) {
        mostrarToast("Perfil de usuário inválido.", "erro");
        return false;
    }

    return true;
}

/* =========================================================
   USUÁRIOS - SALVAR
   ========================================================= */

/**
 * Salva usuário.
 *
 * Por enquanto:
 * - se não tiver ID, cria novo usuário via POST.
 *
 * Depois vamos usar a mesma função para editar via PUT.
 */
async function salvarUsuarioPeloFormulario(event) {
    event.preventDefault();

    const dados = coletarDadosFormularioUsuario();

    if (!validarFormularioUsuario(dados)) {
        return;
    }

    const criandoNovoUsuario = !dados.id;

    const payload = {
        nome: dados.nome,
        email: dados.email,
        role: dados.role,
        ativo: dados.ativo,
        secretariaId: dados.secretariaId
    };

    if (criandoNovoUsuario) {
        payload.senha = dados.senha;
    }

    const btnSaveUser = document.getElementById("btnSaveUser");
    const textoOriginalBotao = btnSaveUser ? btnSaveUser.innerHTML : "";

    if (btnSaveUser) {
        btnSaveUser.disabled = true;
        btnSaveUser.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
            Salvando...
        `;
    }

    try {
        const url = criandoNovoUsuario
            ? "/api/admin/users"
            : `/api/admin/users/${encodeURIComponent(dados.id)}`;

        const metodo = criandoNovoUsuario ? "POST" : "PUT";

        const resposta = await fetchComSessao(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const resultado = await resposta.json();

        if (!resposta.ok || resultado.erro) {
            throw new Error(resultado.mensagem || "Erro ao salvar usuário.");
        }

        mostrarToast(
            criandoNovoUsuario
                ? "Usuário criado com sucesso."
                : "Usuário atualizado com sucesso.",
            "sucesso"
        );
        fecharFormularioUsuario();

        await carregarUsuarios();
        await carregarResumoAdmin();

    } catch (erro) {
        console.error("Erro ao salvar usuário:", erro);

        mostrarToast(
            erro.message || "Erro ao salvar usuário.",
            "erro"
        );
    } finally {
        if (btnSaveUser) {
            btnSaveUser.disabled = false;
            btnSaveUser.innerHTML = textoOriginalBotao;
        }
    }
}

/* =========================================================
   USUÁRIO LOGADO
   ========================================================= */

/**
 * Carrega os dados do usuário logado e atualiza o cabeçalho.
 */
async function carregarUsuarioLogado() {
    if (!adminUserName) return;

    try {
        const resposta = await fetchComSessao("/api/auth/me");

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dados = await resposta.json();

        usuarioLogado = dados.usuario || null;

        definirNomeUsuarioLogado(usuarioLogado || "usuário");

        aplicarClassesDePermissao();

        if (usuarioPodeGerenciarUsuarios()) {
            await carregarUsuarios();
        }
    } catch (erro) {
        console.error("Erro ao carregar usuário logado:", erro);

        usuarioLogado = null;
        definirNomeUsuarioLogado("usuário");
        aplicarClassesDePermissao();
    }
}

/**
 * Escapa texto para uso seguro dentro de HTML.
 *
 * Isso evita que nomes de arquivos ou títulos com caracteres especiais
 * quebrem o HTML renderizado.
 */
function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/**
 * Escapa valores usados em seletores CSS.
 */
function escaparSeletorCss(valor) {
    if (window.CSS && typeof window.CSS.escape === "function") {
        return window.CSS.escape(String(valor || ""));
    }

    return String(valor || "").replace(/["\\]/g, "\\$&");
}

/**
 * Converte uma data ISO salva no servidor para o formato aceito
 * pelo input datetime-local.
 *
 * Exemplo:
 * ISO salvo:
 * 2026-05-04T18:30:00.000Z
 *
 * No navegador local:
 * 2026-05-04T14:30
 */
function formatarIsoParaDatetimeLocal(valorIso) {
    if (!valorIso) return "";

    const data = new Date(valorIso);

    if (Number.isNaN(data.getTime())) {
        return "";
    }

    /*
      Ajusta o horário para o fuso local do navegador.
      Assim o datetime-local mostra a hora esperada pelo usuário.
    */
    const offsetMinutos = data.getTimezoneOffset();
    const dataLocal = new Date(data.getTime() - offsetMinutos * 60000);

    return dataLocal.toISOString().slice(0, 16);
}

/**
 * Formata tamanho de arquivo para leitura humana.
 */
function formatarTamanho(bytes) {
    if (!bytes && bytes !== 0) return "Tamanho desconhecido";

    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;

    if (gb >= 1) {
        return `${gb.toFixed(2)} GB`;
    }

    if (mb >= 1) {
        return `${mb.toFixed(2)} MB`;
    }

    return `${kb.toFixed(2)} KB`;
}

/* =========================================================
   VÍDEOS - FORMATAÇÃO DE DURAÇÃO
   =========================================================
   Converte a duração real do vídeo, em segundos, para um texto
   amigável no painel administrativo.

   Exemplos:
   - 8s
   - 1min 30s
   - 1h 02min 09s
   ========================================================= */

/**
 * Formata segundos em duração amigável.
 */
function formatarDuracaoVideo(segundos) {
    const totalSegundos = Number(segundos);

    if (!Number.isFinite(totalSegundos) || totalSegundos <= 0) {
        return "Duração indisponível";
    }

    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundosRestantes = Math.round(totalSegundos % 60);

    if (horas > 0) {
        return `${horas}h ${String(minutos).padStart(2, "0")}min ${String(segundosRestantes).padStart(2, "0")}s`;
    }

    if (minutos > 0) {
        return `${minutos}min ${String(segundosRestantes).padStart(2, "0")}s`;
    }

    return `${segundosRestantes}s`;
}
/**
 * Formata números do resumo administrativo.
 */
function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString("pt-BR");
}

/**
 * Formata quantidade com singular/plural.
 */
function formatarQuantidadeItens(valor) {
    const quantidade = Number(valor || 0);
    const unidade = quantidade > 1 ? "itens" : "item";

    return `${formatarNumero(quantidade)} ${unidade}`;
}

/**
 * Formata uma quantidade com singular ate 1 e plural acima disso.
 */
function formatarQuantidade(valor, singular, plural) {
    const quantidade = Number(valor || 0);
    const unidade = quantidade > 1 ? plural : singular;

    return `${formatarNumero(quantidade)} ${unidade}`;
}

/**
 * Formata datas exibidas em cards de resumo.
 */
function formatarDataResumo(valorIso) {
    if (!valorIso) return "Sem publicação";

    const data = new Date(valorIso);

    if (Number.isNaN(data.getTime())) {
        return "Data indisponível";
    }

    return data.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

/**
 * Retorna o estado temporal da mídia para filtros.
 */
function obterEstadoPeriodo(inicio, fim) {
    const agora = Date.now();
    const inicioMs = inicio ? new Date(inicio).getTime() : null;
    const fimMs = fim ? new Date(fim).getTime() : null;

    if (!inicio && !fim) return "indeterminado";
    if (Number.isFinite(inicioMs) && inicioMs > agora) return "agendado";
    if (Number.isFinite(fimMs) && fimMs < agora) return "vencido";

    return "programado";
}

/* =========================================================
   BADGE DE PERÍODO DA MÍDIA
   =========================================================
   Exibe no rodapé do card uma indicação visual do período:
   - Livre: sem início/fim definidos;
   - Agendado: começa no futuro;
   - Vencido: já passou da data final;
   - Programado: está dentro do período configurado.
   ========================================================= */

/**
 * Retorna o texto amigável do período.
 */
function obterLabelPeriodo(estadoPeriodo) {
    const labels = {
        indeterminado: "Livre",
        agendado: "Agendado",
        programado: "Programado",
        vencido: "Vencido"
    };

    return labels[estadoPeriodo] || "Livre";
}

/**
 * Retorna o ícone Font Awesome do período.
 */
function obterIconePeriodo(estadoPeriodo) {
    const icones = {
        indeterminado: "fa-infinity",
        agendado: "fa-clock",
        programado: "fa-calendar-check",
        vencido: "fa-calendar-xmark"
    };

    return icones[estadoPeriodo] || "fa-infinity";
}

/**
 * Monta o HTML da badge de período.
 */
function renderizarPeriodoBadge(midia) {
    const estadoPeriodo = obterEstadoPeriodo(midia.inicio, midia.fim);
    const labelPeriodo = obterLabelPeriodo(estadoPeriodo);
    const iconePeriodo = obterIconePeriodo(estadoPeriodo);

    return `
        <span
            class="mediaBadge periodo periodo-${estadoPeriodo}"
            data-periodo-badge
            data-periodo="${estadoPeriodo}"
            title="Período: ${labelPeriodo}"
        >
            <i class="fa-solid ${iconePeriodo}" aria-hidden="true"></i>
            <span>${labelPeriodo}</span>
        </span>
    `;
}

/**
 * Atualiza a badge de período de um card já renderizado.
 */
function atualizarPeriodoBadgeDoItem(item) {
    if (!item) return;

    const badge = item.querySelector("[data-periodo-badge]");
    const inputInicio = item.querySelector(".mediaStartDate");
    const inputFim = item.querySelector(".mediaEndDate");

    if (!badge || !inputInicio || !inputFim) return;

    const estadoPeriodo = obterEstadoPeriodo(inputInicio.value, inputFim.value);
    const labelPeriodo = obterLabelPeriodo(estadoPeriodo);
    const iconePeriodo = obterIconePeriodo(estadoPeriodo);

    badge.className = `mediaBadge periodo periodo-${estadoPeriodo}`;
    badge.dataset.periodo = estadoPeriodo;
    badge.title = `Período: ${labelPeriodo}`;
    badge.innerHTML = `
        <i class="fa-solid ${iconePeriodo}" aria-hidden="true"></i>
        <span>${labelPeriodo}</span>
    `;

    item.dataset.periodo = estadoPeriodo;
}

/**
 * Normaliza texto para busca local na lista.
 */
function normalizarBusca(valor) {
    return String(valor || "")
        .toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Monta a URL pública da mídia.
 */
function obterUrlMidia(nomeArquivo) {
    return `/midia/${encodeURIComponent(nomeArquivo)}`;
}

/**
 * Atualiza texto de botões mantendo ícones do Font Awesome.
 */
function definirBotaoComIcone(botao, icone, texto) {
    if (!botao) return;

    botao.innerHTML = `
        <i class="${icone}" aria-hidden="true"></i>
        <span>${escaparHtml(texto)}</span>
    `;
}

/**
 * Exibe uma confirmação em modal antes de ações de CRUD.
 *
 * Mantém compatibilidade com chamadas antigas:
 * confirmarAcaoModal({ titulo, mensagem, confirmar, cancelar })
 *
 * E permite chamadas novas/premium:
 * confirmarAcaoModal({
 *   kicker: "Biblioteca",
 *   titulo: "Excluir mídia",
 *   mensagem: "Essa ação remove a mídia...",
 *   detalhe: "arquivo.mp4",
 *   confirmar: "Excluir",
 *   cancelar: "Cancelar",
 *   variante: "danger"
 * })
 */
function confirmarAcaoModal({
    kicker = "Confirmação",
    titulo,
    mensagem,
    detalhe = "",
    confirmar = "Confirmar",
    cancelar = "Cancelar",
    variante = "default"
}) {
    if (!modalConfirmacao) {
        modalConfirmacao = document.createElement("div");
        modalConfirmacao.className = "confirmModal hidden";
        modalConfirmacao.innerHTML = `
            <div class="confirmModalBackdrop" data-confirm-cancel></div>

            <section
                class="confirmModalDialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmModalTitle"
                aria-describedby="confirmModalText"
            >
                <div class="confirmModalHeader">
                    <div>
                        <span id="confirmModalKicker" class="sectionKicker confirmModalKicker"></span>
                        <h2 id="confirmModalTitle"></h2>
                        <p id="confirmModalText"></p>
                        <p id="confirmModalDetail" class="confirmModalDetail hidden"></p>
                    </div>

                    <button
                        class="iconButton confirmModalClose"
                        type="button"
                        data-confirm-cancel
                        aria-label="Fechar confirmação"
                    >
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                </div>

                <div class="confirmModalActions">
                    <button class="confirmModalCancel secondaryAction" type="button" data-confirm-cancel></button>
                    <button class="confirmModalAccept primaryAction" type="button" data-confirm-accept></button>
                </div>
            </section>
        `;

        document.body.appendChild(modalConfirmacao);
    }

    const dialog = modalConfirmacao.querySelector(".confirmModalDialog");
    const kickerEl = modalConfirmacao.querySelector("#confirmModalKicker");
    const tituloEl = modalConfirmacao.querySelector("#confirmModalTitle");
    const mensagemEl = modalConfirmacao.querySelector("#confirmModalText");
    const detalheEl = modalConfirmacao.querySelector("#confirmModalDetail");
    const botaoCancelar = modalConfirmacao.querySelector(".confirmModalCancel");
    const botaoConfirmar = modalConfirmacao.querySelector(".confirmModalAccept");

    dialog.dataset.variant = variante;

    kickerEl.textContent = kicker;
    tituloEl.textContent = titulo;
    mensagemEl.textContent = mensagem;

    if (detalhe) {
        detalheEl.textContent = detalhe;
        detalheEl.classList.remove("hidden");
    } else {
        detalheEl.textContent = "";
        detalheEl.classList.add("hidden");
    }

    definirBotaoComIcone(
        botaoCancelar,
        "fa-solid fa-arrow-left",
        cancelar
    );

    const iconeConfirmar = variante === "danger"
        ? "fa-solid fa-trash-can"
        : variante === "success"
            ? "fa-solid fa-check"
            : "fa-solid fa-check";

    definirBotaoComIcone(
        botaoConfirmar,
        iconeConfirmar,
        confirmar
    );

    modalConfirmacao.classList.remove("hidden");
    document.body.classList.add("modalAberto");

    const focoAnterior = document.activeElement;

    setTimeout(() => {
        botaoConfirmar.focus();
    }, 0);

    return new Promise((resolve) => {
        function fechar(resultado) {
            modalConfirmacao.classList.add("hidden");
            document.body.classList.remove("modalAberto");

            modalConfirmacao.removeEventListener("click", aoClicar);
            document.removeEventListener("keydown", aoTeclar);

            if (focoAnterior && typeof focoAnterior.focus === "function") {
                focoAnterior.focus();
            }

            resolve(resultado);
        }

        function aoClicar(event) {
            if (event.target.closest("[data-confirm-accept]")) {
                fechar(true);
                return;
            }

            if (event.target.closest("[data-confirm-cancel]")) {
                fechar(false);
            }
        }

        function aoTeclar(event) {
            if (event.key === "Escape") {
                fechar(false);
                return;
            }

            /*
              Atalho simples de acessibilidade:
              Enter confirma se o foco não estiver em textarea/input.
            */
            if (
                event.key === "Enter" &&
                !event.target.closest("input, textarea, select")
            ) {
                event.preventDefault();
                fechar(true);
            }
        }

        modalConfirmacao.addEventListener("click", aoClicar);
        document.addEventListener("keydown", aoTeclar);
    });
}

/**
 * Retorna texto curto para o card da mídia.
 */
function obterTipoVisual(tipo) {
    if (tipo === "video") return "VÍDEO";
    if (tipo === "imagem") return "IMG";

    return "ARQ";
}

/**
 * Cria a prévia visual para imagens e vídeos.
 */
function renderizarPreviewMidia(midia) {
    const nomeArquivo = midia.nome || "";
    const urlMidia = obterUrlMidia(nomeArquivo);
    const alt = escaparHtml(`Prévia de ${midia.titulo || midia.nome || "mídia"}`);

    if (midia.tipo === "imagem") {
        return `
            <div class="mediaPreview mediaPreviewImage">
                <img src="${urlMidia}" alt="${alt}" loading="lazy" />
                <span class="mediaPreviewHint">Prévia</span>
            </div>
        `;
    }

    if (midia.tipo === "video") {
        return `
            <div class="mediaPreview mediaPreviewVideo">
                <video src="${urlMidia}" muted preload="metadata" playsinline aria-label="${alt}"></video>
                <span class="mediaPreviewHint">Prévia</span>
            </div>
        `;
    }

    return `
        <div class="mediaPreview">
            <div class="mediaIcon">
                ${obterTipoVisual(midia.tipo)}
            </div>
        </div>
    `;
}

/**
 * Mostra mensagem na área de upload.
 */
function mostrarMensagemUpload(texto, tipo = "info") {
    mostrarToast(texto, tipo);

    if (!uploadMessage) return;

    uploadMessage.textContent = texto;
    uploadMessage.className = `uploadMessage ${tipo} hidden`;
}

/**
 * Esconde mensagem da área de upload.
 */
function esconderMensagemUpload() {
    if (!uploadMessage) return;

    window.clearTimeout(uploadMessageTimer);
    uploadMessage.className = "uploadMessage hidden";
    uploadMessage.textContent = "";
}

/**
 * Mostra mensagem na área da playlist.
 */
function mostrarMensagemPlaylist(texto, tipo = "info") {
    mostrarToast(texto, tipo);

    /*
      Mantemos compatibilidade com o bloco antigo, se ele existir,
      mas não dependemos mais dele visualmente.
    */
    if (!playlistMessage) return;

    playlistMessage.textContent = texto;
    playlistMessage.className = `uploadMessage ${tipo} hidden`;
}

/**
 * Esconde mensagem da área da playlist.
 */
function esconderMensagemPlaylist() {
    if (!playlistMessage) return;

    window.clearTimeout(playlistMessageTimer);
    playlistMessage.className = "uploadMessage hidden";
    playlistMessage.textContent = "";
}

/* =========================================================
   USUÁRIOS - EDITAR
   ========================================================= */

/**
 * Abre o modal preenchido com os dados de um usuário existente.
 *
 * Observação:
 * - edição não altera senha;
 * - reset de senha terá modal próprio depois.
 */
function abrirFormularioEditarUsuario(idUsuario) {
    if (!garantirPermissaoParaGerenciarUsuarios()) return;
    const id = Number(idUsuario);

    const usuario = usuariosCarregados.find((item) => Number(item.id) === id);

    if (!usuario) {
        mostrarToast("Usuário não encontrado na lista carregada.", "erro");
        return;
    }

    limparFormularioUsuario();

    if (userFormTitle) {
        userFormTitle.textContent = "Editar usuário";
    }

    if (userIdInput) {
        userIdInput.value = usuario.id;
    }

    if (userNameInput) {
        userNameInput.value = usuario.nome || "";
    }

    if (userEmailInput) {
        userEmailInput.value = usuario.email || "";
    }

    if (userRoleInput) {
        userRoleInput.value = usuario.role || "viewer";
    }

    /*
      Na edição, não alteramos senha aqui.
      Reset de senha será outro modal.
    */
    if (userPasswordLabel) {
        userPasswordLabel.classList.add("hidden");
    }

    if (userPasswordInput) {
        userPasswordInput.required = false;
        userPasswordInput.value = "";
    }

    /*
      Status ativo/inativo fica controlado pelo botão da lista.
      Mesmo assim mantemos o valor internamente para o PUT.
    */
    if (userActiveInput) {
        if (userActiveInput.type === "checkbox") {
            userActiveInput.checked = Number(usuario.ativo) === 1;
        } else {
            userActiveInput.value = Number(usuario.ativo) === 1 ? "true" : "false";
        }
    }

    abrirModalUsuario();

    setTimeout(() => {
        if (userNameInput) userNameInput.focus();
    }, 180);
}

/* =========================================================
   USUÁRIOS - MODAL DE RESET DE SENHA
   =========================================================
   Este bloco controla o modal usado para redefinir a senha
   de um usuário existente.

   Fluxo:
   - clica em "Resetar senha" na lista;
   - abre o modal;
   - digita nova senha;
   - valida mínimo de 6 caracteres;
   - envia para POST /api/admin/users/:id/reset-password.
   ========================================================= */

/**
 * Limpa o formulário de reset de senha.
 */
function limparFormularioResetSenha() {
    if (resetPasswordUserIdInput) {
        resetPasswordUserIdInput.value = "";
    }

    if (resetPasswordInput) {
        resetPasswordInput.value = "";
        resetPasswordInput.type = "password";
        resetPasswordInput.classList.remove("fieldInvalid");
        resetPasswordInput.classList.remove("fieldValid");
    }

    if (btnToggleResetPasswordIcon) {
        btnToggleResetPasswordIcon.className = "fa-solid fa-eye";
    }

    if (btnToggleResetPassword) {
        btnToggleResetPassword.setAttribute("aria-label", "Mostrar senha");
    }

    if (resetPasswordHint) {
        resetPasswordHint.classList.remove("erro");
        resetPasswordHint.classList.remove("sucesso");
        resetPasswordHint.textContent = "A senha deve ter pelo menos 6 caracteres.";
    }
}

/**
 * Abre o modal de reset de senha.
 */
function abrirModalResetSenha(idUsuario, nomeUsuario = "usuário") {
    if (!garantirPermissaoParaGerenciarUsuarios()) return;
    if (!resetPasswordModal) return;

    limparFormularioResetSenha();

    if (resetPasswordUserIdInput) {
        resetPasswordUserIdInput.value = idUsuario;
    }

    if (resetPasswordDescription) {
        resetPasswordDescription.textContent =
            `Defina uma nova senha para ${nomeUsuario}.`;
    }

    resetPasswordModal.classList.remove("hidden");
    resetPasswordModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    setTimeout(() => {
        if (resetPasswordInput) {
            resetPasswordInput.focus();
        }
    }, 180);
}

/**
 * Fecha o modal de reset de senha.
 */
function fecharModalResetSenha() {
    if (!resetPasswordModal) return;

    limparFormularioResetSenha();

    resetPasswordModal.classList.add("hidden");
    resetPasswordModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");
}

/**
 * Alterna entre mostrar e ocultar a senha no modal de reset.
 */
function alternarVisibilidadeResetSenha() {
    if (!resetPasswordInput || !btnToggleResetPassword || !btnToggleResetPasswordIcon) return;

    const senhaEstaOculta = resetPasswordInput.type === "password";

    resetPasswordInput.type = senhaEstaOculta ? "text" : "password";

    btnToggleResetPasswordIcon.className = senhaEstaOculta
        ? "fa-solid fa-eye-slash"
        : "fa-solid fa-eye";

    btnToggleResetPassword.setAttribute(
        "aria-label",
        senhaEstaOculta ? "Ocultar senha" : "Mostrar senha"
    );
}

/**
 * Valida visualmente a nova senha.
 */
function validarResetSenhaVisualmente() {
    if (!resetPasswordInput || !resetPasswordHint) return true;

    const senha = resetPasswordInput.value;
    const senhaValida = senha.length >= 6;

    if (senhaValida) {
        resetPasswordInput.classList.remove("fieldInvalid");
        resetPasswordInput.classList.add("fieldValid");

        resetPasswordHint.classList.remove("erro");
        resetPasswordHint.classList.add("sucesso");
        resetPasswordHint.textContent = "Senha válida.";

        return true;
    }

    resetPasswordInput.classList.remove("fieldValid");
    resetPasswordInput.classList.add("fieldInvalid");

    resetPasswordHint.classList.remove("sucesso");
    resetPasswordHint.classList.add("erro");
    resetPasswordHint.textContent = "A senha precisa ter pelo menos 6 caracteres.";

    return false;
}

/**
 * Envia a nova senha para a API.
 */
async function salvarResetSenha(event) {
    event.preventDefault();

    const idUsuario = resetPasswordUserIdInput
        ? resetPasswordUserIdInput.value
        : "";

    const novaSenha = resetPasswordInput
        ? resetPasswordInput.value
        : "";

    if (!idUsuario) {
        mostrarToast("Usuário inválido para reset de senha.", "erro");
        return;
    }

    if (!novaSenha || novaSenha.length < 6) {
        mostrarToast("Informe uma senha com pelo menos 6 caracteres.", "erro");

        if (resetPasswordInput) {
            resetPasswordInput.focus();
            validarResetSenhaVisualmente();
        }

        return;
    }

    const textoOriginalBotao = btnSaveResetPassword
        ? btnSaveResetPassword.innerHTML
        : "";

    if (btnSaveResetPassword) {
        btnSaveResetPassword.disabled = true;
        btnSaveResetPassword.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
            Salvando...
        `;
    }

    try {
        const resposta = await fetchComSessao(
            `/api/admin/users/${encodeURIComponent(idUsuario)}/reset-password`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    senha: novaSenha
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok || resultado.erro) {
            throw new Error(resultado.mensagem || "Erro ao resetar senha.");
        }

        mostrarToast("Senha redefinida com sucesso.", "sucesso");

        fecharModalResetSenha();

        await carregarUsuarios();
    } catch (erro) {
        console.error("Erro ao resetar senha:", erro);

        mostrarToast(
            erro.message || "Erro ao resetar senha.",
            "erro"
        );
    } finally {
        if (btnSaveResetPassword) {
            btnSaveResetPassword.disabled = false;
            btnSaveResetPassword.innerHTML = textoOriginalBotao;
        }
    }
}

/* =========================================================
   USUÁRIOS - MODAL DE ALTERAÇÃO DE STATUS
   ========================================================= */

/**
 * Abre o modal para confirmar ativação/desativação de usuário.
 */
function abrirModalStatusUsuario(idUsuario, nomeUsuario, usuarioEstaAtivo) {
    if (!garantirPermissaoParaGerenciarUsuarios()) return;
    if (!userStatusModal) return;

    const novoStatus = !usuarioEstaAtivo;

    if (userStatusUserIdInput) {
        userStatusUserIdInput.value = idUsuario;
    }

    if (userStatusNewValueInput) {
        userStatusNewValueInput.value = novoStatus ? "true" : "false";
    }

    if (userStatusTitle) {
        userStatusTitle.textContent = novoStatus
            ? "Ativar usuário"
            : "Desativar usuário";
    }

    if (userStatusDescription) {
        userStatusDescription.textContent = novoStatus
            ? `Tem certeza que deseja ativar o usuário ${nomeUsuario}?`
            : `Tem certeza que deseja desativar o usuário ${nomeUsuario}? Ele não conseguirá acessar o painel até ser ativado novamente.`;
    }

    if (btnConfirmUserStatus) {
        btnConfirmUserStatus.className = novoStatus
            ? "successAction"
            : "dangerAction";

        btnConfirmUserStatus.innerHTML = novoStatus
            ? `
                <i class="fa-solid fa-user-check" aria-hidden="true"></i>
                Ativar usuário
            `
            : `
                <i class="fa-solid fa-user-slash" aria-hidden="true"></i>
                Desativar usuário
            `;
    }

    userStatusModal.classList.remove("hidden");
    userStatusModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");
}

/**
 * Fecha o modal de alteração de status.
 */
function fecharModalStatusUsuario() {
    if (!userStatusModal) return;

    if (userStatusUserIdInput) {
        userStatusUserIdInput.value = "";
    }

    if (userStatusNewValueInput) {
        userStatusNewValueInput.value = "";
    }

    userStatusModal.classList.add("hidden");
    userStatusModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");
}

/**
 * Confirma a ativação/desativação do usuário.
 */
async function confirmarAlteracaoStatusUsuario() {
    const idUsuario = userStatusUserIdInput
        ? userStatusUserIdInput.value
        : "";

    const novoValorTexto = userStatusNewValueInput
        ? userStatusNewValueInput.value
        : "";

    if (!idUsuario || !novoValorTexto) {
        mostrarToast("Dados inválidos para alterar status do usuário.", "erro");
        return;
    }

    const ativo = novoValorTexto === "true";

    const textoOriginalBotao = btnConfirmUserStatus
        ? btnConfirmUserStatus.innerHTML
        : "";

    if (btnConfirmUserStatus) {
        btnConfirmUserStatus.disabled = true;
        btnConfirmUserStatus.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
            Salvando...
        `;
    }

    try {
        const resposta = await fetchComSessao(
            `/api/admin/users/${encodeURIComponent(idUsuario)}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ativo
                })
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok || resultado.erro) {
            throw new Error(resultado.mensagem || "Erro ao alterar status do usuário.");
        }

        mostrarToast(
            ativo
                ? "Usuário ativado com sucesso."
                : "Usuário desativado com sucesso.",
            "sucesso"
        );

        fecharModalStatusUsuario();

        await carregarUsuarios();
    } catch (erro) {
        console.error("Erro ao alterar status do usuário:", erro);

        mostrarToast(
            erro.message || "Erro ao alterar status do usuário.",
            "erro"
        );
    } finally {
        if (btnConfirmUserStatus) {
            btnConfirmUserStatus.disabled = false;
            btnConfirmUserStatus.innerHTML = textoOriginalBotao;
        }
    }
}

/* =========================================================
   RESUMO ADMINISTRATIVO
   ========================================================= */

/**
 * Carrega os dados consolidados da API de resumo do admin.
 */
async function carregarResumoAdmin() {
    if (!summaryTotalMedia) return;

    try {
        const resposta = await fetchComSessao("/api/admin/resumo");

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (dados.erro) {
            throw new Error(dados.mensagem || "Erro ao carregar resumo.");
        }

        const midias = dados.midias || {};
        const playlist = dados.playlist || {};

        summaryTotalMedia.textContent = formatarNumero(midias.total);
        summaryActiveMedia.textContent = [
            formatarQuantidade(midias.ativas, "ativa", "ativas"),
            formatarQuantidade(midias.inativas, "inativa", "inativas")
        ].join(" • ");

        summaryValidMedia.textContent = formatarNumero(midias.dentroDaValidade);
        summaryScheduledMedia.textContent = [
            formatarQuantidade(midias.agendadas, "agendada", "agendadas"),
            formatarQuantidade(midias.vencidas, "vencida", "vencidas")
        ].join(" • ");

        summaryPriorityMedia.textContent =
            formatarNumero(Number(midias.prioridadeAlta || 0) + Number(midias.urgentes || 0));
        summaryRepeatMedia.textContent = [
            formatarQuantidade(midias.comRecorrencia, "Recorrência", "Recorrências"),
            formatarQuantidade(midias.prioridadeAlta, "Alta", "Altas"),
            formatarQuantidade(midias.urgentes, "Urgente", "Urgentes")
        ].join(" • ");

        summaryPlaylistItems.textContent = formatarQuantidadeItens(playlist.itensPublicados);
        summaryPlaylistUpdated.textContent =
            `Última atualização: ${formatarDataResumo(playlist.ultimaAtualizacao)}`;

        if (libraryDropdownMeta) {
            libraryDropdownMeta.textContent = [
                formatarQuantidade(midias.total, "mídia", "mídias"),
                formatarQuantidade(midias.ativas, "ativa", "ativas")
            ].join(" • ");
        }
    } catch (erro) {
        summaryTotalMedia.textContent = "--";
        summaryActiveMedia.textContent = "Resumo indisponível";
        summaryValidMedia.textContent = "--";
        summaryScheduledMedia.textContent = "Tente atualizar a página";
        summaryPriorityMedia.textContent = "--";
        summaryRepeatMedia.textContent = "Dados não carregados";
        summaryPlaylistItems.textContent = "--";
        summaryPlaylistUpdated.textContent = "Última atualização: indisponível";

        if (libraryDropdownMeta) {
            libraryDropdownMeta.textContent = "Resumo da biblioteca indisponível";
        }

        console.error(erro);
    }
}


/* =========================================================
   PLAYLIST
   ========================================================= */

/**
 * Carrega informações da playlist atual.
 *
 * Atualiza o contador:
 * "Itens publicados: X item/itens"
 */
async function carregarPlaylistAtual() {
    if (!playlistTotal) return;

    try {
        const resposta = await fetchComSessao("/api/playlist");

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dados = await resposta.json();

        playlistTotal.textContent = formatarQuantidadeItens(dados.total);
    } catch (erro) {
        playlistTotal.textContent = "Erro ao carregar";
        console.error(erro);
    }
}

/* =========================================================
   NOTIFICAÇÕES FLUTUANTES / TOASTS
   ========================================================= */

/**
 * Mostra uma notificação flutuante na tela.
 *
 * Tipos aceitos:
 * - sucesso
 * - erro
 * - info
 * - aviso
 */
function mostrarToast(texto, tipo = "info", tempo = 4200) {
    if (!toastContainer) {
        console.log(`[${tipo}] ${texto}`);
        return;
    }

    const toast = document.createElement("div");
    toast.className = `toastMessage ${tipo}`;

    const icones = {
        sucesso: "fa-circle-check",
        erro: "fa-circle-xmark",
        info: "fa-circle-info",
        aviso: "fa-triangle-exclamation"
    };

    const icone = icones[tipo] || icones.info;

    toast.innerHTML = `
        <span class="toastIcon">
            <i class="fa-solid ${icone}" aria-hidden="true"></i>
        </span>

        <span class="toastText">${texto}</span>

        <button class="toastClose" type="button" aria-label="Fechar aviso">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
    `;

    const fecharToast = () => {
        toast.classList.add("saindo");

        setTimeout(() => {
            toast.remove();
        }, 260);
    };

    toast.querySelector(".toastClose").addEventListener("click", fecharToast);

    toastContainer.appendChild(toast);

    if (tempo > 0) {
        setTimeout(fecharToast, tempo);
    }
}

/* =========================================================
   PRESERVAÇÃO DO SCROLL
   ========================================================= */

/**
 * Executa uma ação assíncrona preservando a posição atual da página.
 *
 * Útil quando o admin.js recarrega/renderiza a lista depois de salvar,
 * excluir ou enviar mídia.
 */
async function executarPreservandoScroll(callback) {
    const scrollAtual = window.scrollY;

    const resultado = await callback();

    /*
      Espera o navegador terminar de redesenhar a tela
      antes de restaurar o scroll.
    */
    requestAnimationFrame(() => {
        window.scrollTo({
            top: scrollAtual,
            behavior: "auto"
        });
    });

    return resultado;
}

/* =========================================================
   DESTAQUE VISUAL DE MÍDIA
   ========================================================= */

/**
 * Localiza uma mídia na lista, rola até ela e aplica destaque visual.
 *
 * Usado principalmente depois do upload, para mostrar ao usuário
 * qual item acabou de ser enviado.
 */
function destacarMidiaNaLista(nomeArquivo) {
    if (!nomeArquivo) return;

    /*
      Monta um seletor seguro para localizar o card da mídia.
      Usamos escaparSeletorCss() em vez de CSS.escape() direto
      para manter compatibilidade com navegadores que não suportem
      CSS.escape nativamente.
    */
    const seletor = `.mediaItem[data-arquivo="${escaparSeletorCss(nomeArquivo)}"]`;
    const item = document.querySelector(seletor);

    if (!item) return;

    /*
      Rola até o card da mídia.
      block: "center" tenta deixar o card no meio da tela.
    */
    item.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    /*
      Reinicia a animação caso o destaque já tenha sido aplicado antes.
    */
    item.classList.remove("mediaItemUploadHighlight");
    void item.offsetWidth;
    item.classList.add("mediaItemUploadHighlight");

    /*
      Remove a classe depois da animação.
    */
    setTimeout(() => {
        item.classList.remove("mediaItemUploadHighlight");
    }, 2600);
}

/**
 * Gera manualmente o arquivo playlist.json no servidor.
 *
 * Observação:
 * A playlist já é atualizada automaticamente após várias ações,
 * mas mantemos este botão como recurso manual de segurança.
 */
async function gerarPlaylist() {
    /*
      Segurança: o layout criado pelo Codex removeu o card visual de
      publicação manual da playlist, porque a playlist já é publicada
      automaticamente após upload, exclusão, ordenação ou salvamento.

      Mesmo assim, mantemos esta função no arquivo para compatibilidade
      futura. Se o botão não existir no HTML atual, a função simplesmente
      encerra sem gerar erro no console.
    */
    if (!btnGerarPlaylist) {
        mostrarMensagemPlaylist(
            "A playlist já é atualizada automaticamente após as alterações.",
            "info"
        );
        return;
    }

    esconderMensagemPlaylist();

    btnGerarPlaylist.disabled = true;
    definirBotaoComIcone(btnGerarPlaylist, "fa-solid fa-spinner fa-spin", "Gerando...");

    mostrarMensagemPlaylist("Gerando playlist, aguarde...", "info");

    try {
        const resposta = await fetchComSessao("/api/playlist/gerar", {
            method: "POST"
        });

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.mensagem || "Erro ao gerar playlist.");
        }

        mostrarMensagemPlaylist(
            `Playlist gerada com sucesso. Total de itens: ${dados.total}`,
            "sucesso"
        );

        await carregarPlaylistAtual();
        await carregarResumoAdmin();
    } catch (erro) {
        mostrarMensagemPlaylist(
            erro.message || "Erro ao gerar playlist.",
            "erro"
        );

        console.error(erro);
    } finally {
        btnGerarPlaylist.disabled = false;
        definirBotaoComIcone(btnGerarPlaylist, "fa-solid fa-rotate", "Gerar Playlist");
    }
}


/* =========================================================
   RENDERIZAÇÃO DAS MÍDIAS
   ========================================================= */

/**
 * Renderiza a lista de mídias no painel.
 *
 * Cada mídia exibe:
 * - checkbox de seleção;
 * - posição na playlist;
 * - botões de subir/descer;
 * - tipo da mídia;
 * - nome amigável;
 * - nome real do arquivo;
 * - tamanho/extensão;
 * - ativo/inativo;
 * - duração, se imagem;
 * - validade;
 * - prioridade;
 * - recorrência.
 */
function renderizarMidias(midias) {
    mediaList.innerHTML = "";
    const podeEditarMidias = usuarioPodeEditarMidias();

    if (libraryDropdownMeta) {
        libraryDropdownMeta.textContent = `${formatarQuantidade(midias.length, "mídia cadastrada", "mídias cadastradas")}`;
    }

    if (!midias.length) {
        mediaList.innerHTML = `
            <div class="emptyState">
                Nenhuma mídia cadastrada ainda.
            </div>
        `;
        aplicarFiltrosMidia();
        return;
    }

    midias.forEach((midia, index) => {
        const item = document.createElement("div");

        item.className = [
            "mediaItem",
            midia.tipo === "imagem" ? "mediaItemImage" : "",
            midia.tipo === "video" ? "mediaItemVideo" : "",
            midia.ativo ? "" : "mediaItemInactive"
        ].filter(Boolean).join(" ");
        item.style.setProperty("--item-index", index);
        item.draggable = podeEditarMidias;

        /*
        Identifica este card pelo nome real do arquivo.

        Isso permite localizar o card depois de ações como upload,
        para rolar até ele e aplicar um destaque visual.
        */
        item.dataset.arquivo = midia.nome;

        const nomeArquivo = escaparHtml(midia.nome);
        const tituloMidia = escaparHtml(midia.titulo || midia.nome);
        const extensao = escaparHtml(midia.extensao || "");
        const tipo = escaparHtml(midia.tipo || "arquivo");
        const prioridade = escaparHtml(midia.prioridade || "normal");

        const prioridadeLabel = midia.prioridade === "urgente"
            ? "Urgente"
            : midia.prioridade === "alta"
                ? "Alta"
                : "Normal";

        const controleTitulo = podeEditarMidias
            ? `
        <label class="mediaTitleLabel">
            Nome
            <input
                type="text"
                class="mediaTitleInput"
                data-arquivo="${nomeArquivo}"
                value="${tituloMidia}"
                placeholder="Ex: Campanha de Vacinação 2026"
            />
        </label>
    `
            : `
        <div class="mediaTitleReadOnly">
            <span>Nome</span>
            <strong>${tituloMidia}</strong>
        </div>
    `;

        const controlePrioridadeSelect = podeEditarMidias
            ? `
        <select class="mediaPriority" data-arquivo="${nomeArquivo}" aria-label="Prioridade da mídia ${nomeArquivo}">
            <option value="normal" ${midia.prioridade === "normal" ? "selected" : ""}>Normal</option>
            <option value="alta" ${midia.prioridade === "alta" ? "selected" : ""}>Alta</option>
            <option value="urgente" ${midia.prioridade === "urgente" ? "selected" : ""}>Urgente</option>
        </select>
    `
            : "";

        const statusBadge = `
            <label class="mediaStatusToggle ${midia.ativo ? "isActive" : "isInactive"}">
                <input
                    type="checkbox"
                    class="mediaActive"
                    data-arquivo="${nomeArquivo}"
                    ${midia.ativo ? "checked" : ""}
                />
                <span>${midia.ativo ? "Ativo" : "Inativo"}</span>
            </label>
        `;

        const prioridadeBadge = podeEditarMidias
            ? `
            <details class="mediaPriorityMenu">
                <summary class="mediaBadge ${prioridade}">
                    <i class="fa-solid ${midia.prioridade === "urgente" ? "fa-triangle-exclamation" : midia.prioridade === "alta" ? "fa-bolt" : "fa-circle-check"}" aria-hidden="true"></i>
                    <span>${prioridadeLabel}</span>
                </summary>
                <div class="mediaPriorityOptions">
                    <button type="button" data-prioridade="normal" data-arquivo="${nomeArquivo}">
                        <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                        Normal
                    </button>
                    <button type="button" data-prioridade="alta" data-arquivo="${nomeArquivo}">
                        <i class="fa-solid fa-bolt" aria-hidden="true"></i>
                        Alta
                    </button>
                    <button type="button" data-prioridade="urgente" data-arquivo="${nomeArquivo}">
                        <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                        Urgente
                    </button>
                </div>
            </details>
            `
            : `
            <span class="mediaBadge ${prioridade} mediaBadgeStatic">
                <i class="fa-solid ${midia.prioridade === "urgente" ? "fa-triangle-exclamation" : midia.prioridade === "alta" ? "fa-bolt" : "fa-circle-check"}" aria-hidden="true"></i>
                <span>${prioridadeLabel}</span>
            </span>
        `;

        const periodoBadge = renderizarPeriodoBadge(midia);

        const semValidadeDefinida = !midia.inicio && !midia.fim;

        const detalheDuracao = midia.tipo === "imagem"
            ? `${Number(midia.duracao || 0)}s por exibição`
            : "Lendo duração do vídeo...";

        const detalhesMidia = `
            <span><strong>Arquivo</strong>${nomeArquivo}</span>
            <span><strong>Tamanho</strong>${formatarTamanho(midia.tamanho)}</span>
            <span><strong>Tipo</strong>${tipo}</span>
            <span><strong>Extensão</strong>${extensao || "sem extensão"}</span>
            <span><strong>Duração</strong>
                <span
                    class="mediaVideoDurationText"
                    data-video-duration="${midia.tipo === "video" ? nomeArquivo : ""}"
                >
                    ${detalheDuracao}
                </span>
            </span>        `;

        const controleDuracao = midia.tipo === "imagem"
            ? `
                <label class="mediaConfigLabel">
                    Duração
                    <select class="mediaDuration" data-arquivo="${nomeArquivo}">
                        <option value="5" ${Number(midia.duracao) === 5 ? "selected" : ""}>5s</option>
                        <option value="8" ${Number(midia.duracao) === 8 ? "selected" : ""}>8s</option>
                        <option value="10" ${Number(midia.duracao) === 10 ? "selected" : ""}>10s</option>
                        <option value="15" ${Number(midia.duracao) === 15 ? "selected" : ""}>15s</option>
                        <option value="20" ${Number(midia.duracao) === 20 ? "selected" : ""}>20s</option>
                        <option value="30" ${Number(midia.duracao) === 30 ? "selected" : ""}>30s</option>
                    </select>
                </label>
            `
            : "";

        item.innerHTML = `
            <div class="mediaSelectArea">
                <input
                    type="checkbox"
                    class="mediaSelect"
                    data-arquivo="${nomeArquivo}"
                    aria-label="Selecionar mídia ${nomeArquivo}"
                />
            </div>

            <div class="mediaOrder">
                <span class="mediaOrderNumber">${index + 1}</span>

                <span
                    class="mediaDragHandle"
                    aria-label="Clique e arraste para reorganizar"
                    data-tooltip="Clique e arraste para reorganizar"
                >
                    <i class="fa-solid fa-grip-vertical" aria-hidden="true"></i>
                </span>
            </div>

            ${renderizarPreviewMidia(midia)}

            <div class="mediaInfo">
                ${controleTitulo}

                <div class="mediaConfigRow">
                    
                    ${controleDuracao}

                    <details class="mediaScheduleMenu">
                        <summary>
                            <span>
                                <i class="fa-solid fa-calendar-days" aria-hidden="true"></i>
                                Período de exibição
                            </span>
                            <small>${semValidadeDefinida ? "Tempo indeterminado" : "Com data definida"}</small>
                        </summary>

                        <div class="mediaValidityBox">
                            <label class="mediaConfigCheckbox mediaIndefiniteLabel">
                                <input
                                    type="checkbox"
                                    class="mediaIndefinite"
                                    data-arquivo="${nomeArquivo}"
                                    ${semValidadeDefinida ? "checked" : ""}
                                />
                                Tempo indeterminado
                            </label>

                            <div class="mediaDateFields ${semValidadeDefinida ? "disabledDates" : ""}">
                                <label class="mediaConfigLabel mediaDateLabel">
                                    Início
                                    <input
                                        type="datetime-local"
                                    class="mediaStartDate"
                                    data-arquivo="${nomeArquivo}"
                                    value="${formatarIsoParaDatetimeLocal(midia.inicio)}"
                                    />
                                </label>

                                <label class="mediaConfigLabel mediaDateLabel">
                                    Fim
                                    <input
                                        type="datetime-local"
                                    class="mediaEndDate"
                                    data-arquivo="${nomeArquivo}"
                                    value="${formatarIsoParaDatetimeLocal(midia.fim)}"
                                    />
                                </label>
                            </div>
                        </div>
                    </details>

                    ${controlePrioridadeSelect}

                    <label class="mediaConfigLabel">
                        Repetir
                        <select class="mediaRepeatEvery" data-arquivo="${nomeArquivo}">
                            <option value="0" ${Number(midia.repetirACada) === 0 ? "selected" : ""}>Não repetir</option>
                            <option value="3" ${Number(midia.repetirACada) === 3 ? "selected" : ""}>A cada 3 mídias</option>
                            <option value="4" ${Number(midia.repetirACada) === 4 ? "selected" : ""}>A cada 4 mídias</option>
                            <option value="5" ${Number(midia.repetirACada) === 5 ? "selected" : ""}>A cada 5 mídias</option>
                            <option value="10" ${Number(midia.repetirACada) === 10 ? "selected" : ""}>A cada 10 mídias</option>
                        </select>
                    </label>
                </div>

                <div class="mediaFooterActions">
                    <div class="mediaBadges">
                        ${statusBadge}
                        ${prioridadeBadge}
                        ${periodoBadge}
                    </div>

                    <div class="mediaDetailsHover">
                        <button class="mediaDetailsTrigger" type="button">
                            <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                            Detalhes
                        </button>

                        <div class="mediaDetailsPopover" role="tooltip">
                            ${detalhesMidia}
                        </div>
                    </div>

                    <button class="mediaDeleteButton" type="button" data-arquivo="${nomeArquivo}">
                        <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                        Excluir
                    </button>

                    <button class="mediaSaveButton hidden" type="button" data-arquivo="${nomeArquivo}">
                        <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i>
                        Salvar
                    </button>
                </div>
            </div>

        `;

        item.dataset.search = normalizarBusca([
            midia.nome,
            midia.titulo,
            midia.tipo,
            midia.extensao,
            midia.prioridade
        ].join(" "));
        item.dataset.active = midia.ativo ? "true" : "false";
        item.dataset.tipo = midia.tipo || "arquivo";
        item.dataset.prioridade = midia.prioridade || "normal";
        item.dataset.repeat = Number(midia.repetirACada || 0) > 0 ? "com" : "sem";
        item.dataset.periodo = obterEstadoPeriodo(midia.inicio, midia.fim);
        item.dataset.configOriginal = JSON.stringify(
            obterConfiguracaoOriginalDeMidia(midia)
        );

        mediaList.appendChild(item);
    });

    aplicarFiltrosMidia();
    atualizarDuracaoRealDosVideos();
}

/* =========================================================
   VÍDEOS - LEITURA DE DURAÇÃO REAL
   =========================================================
   Lê a duração real dos vídeos renderizados no painel.

   Como funciona:
   - cada card já possui um <video preload="metadata">;
   - ao carregar os metadados, o navegador informa video.duration;
   - atualizamos o popover "Detalhes" daquele card.
   ========================================================= */

/**
 * Atualiza nos detalhes do card a duração real do vídeo.
 */
function atualizarDuracaoRealDosVideos() {
    const videos = document.querySelectorAll(".mediaItemVideo video");

    videos.forEach((video) => {
        const item = video.closest(".mediaItem");

        if (!item) return;

        const nomeArquivo = item.dataset.arquivo || "";
        const campoDuracao = item.querySelector(".mediaVideoDurationText");

        if (!campoDuracao) return;

        function aplicarDuracao() {
            const duracaoFormatada = formatarDuracaoVideo(video.duration);

            campoDuracao.textContent = duracaoFormatada;
            campoDuracao.dataset.durationLoaded = "true";
        }

        /*
          Se o navegador já tiver os metadados, atualiza na hora.
          Caso contrário, espera o evento loadedmetadata.
        */
        if (Number.isFinite(video.duration) && video.duration > 0) {
            aplicarDuracao();
            return;
        }

        video.addEventListener("loadedmetadata", aplicarDuracao, {
            once: true
        });

        video.addEventListener("error", () => {
            campoDuracao.textContent = "Duração indisponível";
            campoDuracao.dataset.durationLoaded = "false";

            console.warn(
                "Não foi possível ler a duração do vídeo:",
                nomeArquivo
            );
        }, {
            once: true
        });
    });
}

/**
 * Aplica busca e filtro de status sem remover cards do DOM.
 *
 * Isso mantém o salvamento em lote funcionando com todos os campos
 * renderizados, mesmo quando a lista está filtrada visualmente.
 */
function aplicarFiltrosMidia() {
    const itens = Array.from(document.querySelectorAll(".mediaItem"));

    if (!itens.length) {
        if (mediaFilterInfo) {
            mediaFilterInfo.classList.add("hidden");
            mediaFilterInfo.textContent = "";
        }

        atualizarEstadoAcoesEmLote();
        return;
    }

    const termo = normalizarBusca(mediaSearch ? mediaSearch.value : "");
    const status = mediaStatusFilter ? mediaStatusFilter.value : "todas";
    const tipoFiltro = mediaTypeFilter ? mediaTypeFilter.value : "todos";
    const periodoFiltro = mediaPeriodFilter ? mediaPeriodFilter.value : "todos";
    const prioridadeFiltro = mediaPriorityFilter ? mediaPriorityFilter.value : "todas";
    const repeticaoFiltro = mediaRepeatFilter ? mediaRepeatFilter.value : "todas";

    let totalVisivel = 0;

    itens.forEach((item) => {
        const atendeBusca = !termo || item.dataset.search.includes(termo);
        const ativo = item.dataset.active === "true";
        const atendeTipo = tipoFiltro === "todos" || item.dataset.tipo === tipoFiltro;
        const atendePeriodo =
            periodoFiltro === "todos" ||
            item.dataset.periodo === periodoFiltro ||
            (periodoFiltro === "programado" && item.dataset.periodo === "programado");
        const atendePrioridade =
            prioridadeFiltro === "todas" || item.dataset.prioridade === prioridadeFiltro;
        const atendeRepeticao =
            repeticaoFiltro === "todas" || item.dataset.repeat === repeticaoFiltro;

        const atendeStatus =
            status === "todas" ||
            (status === "ativas" && ativo) ||
            (status === "inativas" && !ativo);

        const deveExibir =
            atendeBusca &&
            atendeStatus &&
            atendeTipo &&
            atendePeriodo &&
            atendePrioridade &&
            atendeRepeticao;

        item.classList.toggle("mediaItemFiltered", !deveExibir);

        if (!deveExibir) {
            const checkbox = item.querySelector(".mediaSelect");

            if (checkbox) {
                checkbox.checked = false;
            }
        } else {
            totalVisivel += 1;
        }
    });

    const filtroAtivo =
        Boolean(termo) ||
        status !== "todas" ||
        tipoFiltro !== "todos" ||
        periodoFiltro !== "todos" ||
        prioridadeFiltro !== "todas" ||
        repeticaoFiltro !== "todas";

    if (mediaFilterInfo) {
        mediaFilterInfo.classList.toggle("hidden", !filtroAtivo);
        mediaFilterInfo.textContent = filtroAtivo
            ? `${formatarQuantidade(totalVisivel, "mídia exibida", "mídias exibidas")} de ${formatarNumero(itens.length)}.`
            : "";
    }

    if (libraryDropdownMeta) {
        libraryDropdownMeta.textContent = filtroAtivo
            ? `${formatarNumero(totalVisivel)} de ${formatarQuantidade(itens.length, "mídia exibida", "mídias exibidas")}`
            : formatarQuantidade(itens.length, "mídia cadastrada", "mídias cadastradas");
    }

    atualizarEstadoAcoesEmLote();
}

/**
 * Carrega as mídias pela API e renderiza na tela.
 */
async function carregarMidias() {
    loadingMessage.style.display = "block";
    loadingMessage.textContent = "Carregando arquivos...";
    mediaList.innerHTML = "";

    try {
        const resposta = await fetchComSessao("/api/midias");

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const dados = await resposta.json();

        loadingMessage.style.display = "none";

        renderizarMidias(dados.midias || []);
        atualizarEstadoAcoesEmLote();
        await carregarResumoAdmin();
    } catch (erro) {
        loadingMessage.style.display = "block";
        loadingMessage.textContent = "Erro ao carregar mídias. Verifique se a API está rodando.";
        console.error(erro);
    }
}


/* =========================================================
   UPLOAD DE MÍDIA
   ========================================================= */

/**
 * Atualiza o texto com o nome do arquivo selecionado.
 */
function atualizarNomeSelecionado() {
    /*
      O backend atual usa upload.single("arquivo"), ou seja:
      ele recebe apenas UM arquivo por envio.

      Por isso, mesmo que algum navegador permita seleção/arraste de
      vários arquivos, a interface considera somente o primeiro.
      Essa escolha mantém o layout bonito do Codex sem exigir alteração
      no server.js agora.
    */
    const arquivo = inputArquivo && inputArquivo.files
        ? inputArquivo.files[0]
        : null;

    if (!arquivo) {
        selectedFileName.textContent = "Nenhum arquivo selecionado";
        uploadForm.classList.remove("uploadFormHasFile");
        return;
    }

    selectedFileName.textContent = arquivo.name;
    uploadForm.classList.add("uploadFormHasFile");
}

/**
 * Carrega o usuário da sessão para o cabeçalho.
 */
async function carregarUsuarioSessao() {
    if (!adminUserName) return;

    try {
        const resposta = await fetchComSessao("/api/auth/status");
        const dados = await resposta.json();

        definirNomeUsuarioLogado(dados.usuario || "Administrador");
    } catch (erro) {
        definirNomeUsuarioLogado("Administrador");
    }
}

/**
 * Recebe arquivos arrastados para a área de upload.
 */
function receberArquivoArrastado(event) {
    event.preventDefault();
    uploadForm.classList.remove("uploadFormDragging");

    const arquivos = event.dataTransfer ? event.dataTransfer.files : null;

    if (!arquivos || !arquivos.length || !inputArquivo) return;

    /*
      Mantém compatibilidade com o backend atual:
      - o usuário pode arrastar vários arquivos sem quebrar a tela;
      - mas o sistema usa somente o primeiro arquivo arrastado;
      - quando quisermos upload múltiplo de verdade, alteramos também
        a rota /api/upload no server.js para upload.array(...).
    */
    const primeiroArquivo = arquivos[0];

    if (typeof DataTransfer !== "undefined") {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(primeiroArquivo);
        inputArquivo.files = dataTransfer.files;
    }

    atualizarNomeSelecionado();
}

/**
 * Envia o arquivo selecionado para a API.
 */
async function enviarArquivo(event) {
    event.preventDefault();
    if (!garantirPermissaoParaEditarMidias()) return;

    esconderMensagemUpload();

    /*
      Upload de UM arquivo por vez.

      Motivo técnico:
      O backend atual está configurado com multer usando:
      upload.single("arquivo")

      Portanto, o FormData deve enviar apenas um campo "arquivo".
      Isso evita erro silencioso e mantém o frontend alinhado ao backend.
    */
    const arquivo = inputArquivo && inputArquivo.files
        ? inputArquivo.files[0]
        : null;

    if (!arquivo) {
        mostrarMensagemUpload("Selecione um arquivo antes de enviar.", "erro");
        return;
    }

    const confirmouUpload = await confirmarAcaoModal({
        kicker: "Upload",
        titulo: "Enviar nova mídia",
        mensagem: "A mídia será adicionada à biblioteca e a playlist será atualizada automaticamente.",
        detalhe: arquivo.name,
        confirmar: "Enviar mídia",
        cancelar: "Cancelar",
        variante: "success"
    });

    if (!confirmouUpload) return;

    const formData = new FormData();
    formData.append("arquivo", arquivo);

    btnUpload.disabled = true;
    definirBotaoComIcone(btnUpload, "fa-solid fa-spinner fa-spin", "Enviando...");

    mostrarMensagemUpload("Enviando arquivo, aguarde...", "info");

    try {
        const resposta = await fetchComSessao("/api/upload", {
            method: "POST",
            body: formData
        });

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.mensagem || "Erro ao enviar arquivo.");
        }

        const nomeExibicaoUpload =
            dados.arquivo && (dados.arquivo.titulo || dados.arquivo.nomeOriginal || dados.arquivo.nomeSalvo)
                ? (dados.arquivo.titulo || dados.arquivo.nomeOriginal || dados.arquivo.nomeSalvo)
                : "mídia enviada";

        mostrarMensagemUpload(
            `Mídia enviada e playlist atualizada: ${nomeExibicaoUpload}`,
            "sucesso"
        );

        uploadForm.reset();
        selectedFileName.textContent = "Nenhum arquivo selecionado";
        uploadForm.classList.remove("uploadFormHasFile");

        await carregarMidias();
        await carregarPlaylistAtual();

        /*
          Após recarregar a lista, rola até a mídia enviada
          e aplica destaque visual nela.
        */
        setTimeout(() => {
            destacarMidiaNaLista(dados.arquivo.nomeSalvo);
        }, 180);

        await carregarResumoAdmin();
    } catch (erro) {
        mostrarMensagemUpload(
            erro.message || "Erro ao enviar arquivo.",
            "erro"
        );

        console.error(erro);
    } finally {
        btnUpload.disabled = false;
        definirBotaoComIcone(btnUpload, "fa-solid fa-upload", "Enviar mídia");
    }
}


/* =========================================================
   ALTERAÇÕES PENDENTES / SALVAR EM LOTE
   ========================================================= */

/**
 * Marca que existem alterações ainda não salvas.
 */
function marcarAlteracoesPendentes() {
    existemAlteracoesPendentes = true;

    if (pendingChanges) {
        pendingChanges.classList.remove("hidden");
    }

    if (btnSalvarTudo) {
        btnSalvarTudo.classList.remove("hidden");
        btnSalvarTudo.disabled = false;
        btnSalvarTudo.classList.add("hasChanges");
        definirBotaoComIcone(btnSalvarTudo, "fa-solid fa-floppy-disk", "Salvar alterações");
    }
}

/**
 * Limpa o aviso de alterações pendentes.
 */
function limparAlteracoesPendentes() {
    existemAlteracoesPendentes = false;

    if (pendingChanges) {
        pendingChanges.classList.add("hidden");
    }

    if (btnSalvarTudo) {
        btnSalvarTudo.disabled = true;
        btnSalvarTudo.classList.remove("hasChanges");
        btnSalvarTudo.classList.add("hidden");
        definirBotaoComIcone(btnSalvarTudo, "fa-solid fa-floppy-disk", "Salvar alterações");
    }

    document.querySelectorAll(".mediaItemChanged").forEach((item) => {
        item.classList.remove("mediaItemChanged");
    });
}

/**
 * Coleta todas as configurações visíveis na lista.
 *
 * Esta função é usada pelo botão "Salvar alterações".
 */
function coletarConfiguracoesDaTela() {
    const checkboxes = Array.from(
        document.querySelectorAll(".mediaActive")
    );

    return checkboxes.map((checkbox) => {
        const nomeArquivo = checkbox.dataset.arquivo;
        const item = checkbox.closest(".mediaItem");

        const selectDuracao = item
            ? item.querySelector(".mediaDuration")
            : null;

        const selectPrioridade = item
            ? item.querySelector(".mediaPriority")
            : null;

        const selectRepetirACada = item
            ? item.querySelector(".mediaRepeatEvery")
            : null;

        const inputTitulo = item
            ? item.querySelector(".mediaTitleInput")
            : null;

        const checkboxIndefinido = item
            ? item.querySelector(".mediaIndefinite")
            : null;

        const inputInicio = item
            ? item.querySelector(".mediaStartDate")
            : null;

        const inputFim = item
            ? item.querySelector(".mediaEndDate")
            : null;

        const exibirIndefinidamente =
            checkboxIndefinido ? checkboxIndefinido.checked : false;

        return {
            nome: nomeArquivo,
            ativo: checkbox.checked,
            duracao: selectDuracao ? Number(selectDuracao.value) : 8,
            prioridade: selectPrioridade ? selectPrioridade.value : "normal",
            repetirACada: selectRepetirACada ? Number(selectRepetirACada.value) : 0,
            titulo: inputTitulo ? inputTitulo.value : nomeArquivo,

            inicio: exibirIndefinidamente
                ? ""
                : inputInicio
                    ? inputInicio.value
                    : "",

            fim: exibirIndefinidamente
                ? ""
                : inputFim
                    ? inputFim.value
                    : ""
        };
    });
}

/**
 * Salva todas as configurações de uma vez.
 */
async function salvarTodasConfiguracoes() {
    if (!garantirPermissaoParaEditarMidias()) return;

    const selecionadas = obterMidiasSelecionadas();
    const todasConfiguracoes = coletarConfiguracoesDaTela();

    const itensAlterados = Array.from(document.querySelectorAll(".mediaItemChanged"));
    const nomesAlterados = itensAlterados
        .map((item) => item.dataset.arquivo)
        .filter(Boolean);

    const midias = selecionadas.length
        ? todasConfiguracoes.filter((midia) => selecionadas.includes(midia.nome))
        : todasConfiguracoes.filter((midia) => nomesAlterados.includes(midia.nome));

    if (!midias.length) {
        mostrarMensagemPlaylist("Nenhuma alteração pendente para salvar.", "erro");
        sincronizarAlteracoesPendentesGlobais();
        return;
    }

    const confirmou = await confirmarAcaoModal({
        kicker: "Biblioteca",
        titulo: "Salvar alterações",
        mensagem: selecionadas.length
            ? `Você está prestes a salvar ${formatarQuantidade(midias.length, "mídia selecionada", "mídias selecionadas")}.`
            : `Você está prestes a salvar ${formatarQuantidade(midias.length, "alteração pendente", "alterações pendentes")}.`,
        detalhe: "A playlist publicada será atualizada automaticamente.",
        confirmar: "Salvar alterações",
        cancelar: "Cancelar",
        variante: "success"
    });

    if (!confirmou) return;

    btnSalvarTudo.disabled = true;
    definirBotaoComIcone(btnSalvarTudo, "fa-solid fa-spinner fa-spin", "Salvando...");
    mostrarMensagemPlaylist("Salvando alterações, aguarde...", "info");

    try {
        const resposta = await fetchComSessao("/api/midias/config/lote", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                midias
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.mensagem || "Erro ao salvar alterações.");
        }

        mostrarMensagemPlaylist(
            `Alterações salvas e playlist atualizada automaticamente. ${formatarQuantidade(dados.totalSalvo, "item salvo", "itens salvos")}.`,
            "sucesso"
        );

        limparAlteracoesPendentes();

        await executarPreservandoScroll(async () => {
            await carregarMidias();
            await carregarPlaylistAtual();
        });

        sincronizarAlteracoesPendentesGlobais();
    } catch (erro) {
        mostrarMensagemPlaylist(
            erro.message || "Erro ao salvar alterações.",
            "erro"
        );

        if (btnSalvarTudo) {
            btnSalvarTudo.disabled = false;
        }

        sincronizarAlteracoesPendentesGlobais();

        console.error(erro);
    } finally {
        if (btnSalvarTudo) {
            definirBotaoComIcone(btnSalvarTudo, "fa-solid fa-floppy-disk", "Salvar alterações");
        }
    }
}

/*
  Se houver alteração pendente, o navegador avisa antes de sair.
*/
window.addEventListener("beforeunload", (event) => {
    if (!existemAlteracoesPendentes) return;

    event.preventDefault();
    event.returnValue = "Existem alterações não salvas.";
});


/* =========================================================
   SELEÇÃO E EXCLUSÃO EM LOTE
   ========================================================= */

/**
 * Retorna os nomes dos arquivos selecionados na lista.
 */
function obterMidiasSelecionadas() {
    return Array.from(document.querySelectorAll(".mediaSelect:checked"))
        .map((checkbox) => checkbox.dataset.arquivo)
        .filter(Boolean);
}

/**
 * Retorna checkboxes de mídias visíveis após busca/filtro.
 */
function obterCheckboxesVisiveis() {
    return Array.from(
        document.querySelectorAll(".mediaItem:not(.mediaItemFiltered) .mediaSelect")
    );
}

/**
 * Atualiza estado do botão "Excluir selecionadas".
 */
function atualizarEstadoAcoesEmLote() {
    const selecionadas = obterMidiasSelecionadas();
    const existeSelecao = selecionadas.length > 0;

    const selectAllWrapper = selectAllMedia
        ? selectAllMedia.closest(".selectAllLabel")
        : null;

    /*
      O modo seleção é controlado explicitamente pelo botão "Selecionar".
      Seleção existente não deve ligar/desligar o modo sozinha.
    */
    document.body.classList.toggle("mediaSelectionMode", modoSelecaoMidiasAtivo);
    mediaList.classList.toggle("mediaSelectionMode", modoSelecaoMidiasAtivo);

    document.querySelectorAll(".mediaItem").forEach((item) => {
        const checkbox = item.querySelector(".mediaSelect");

        item.classList.toggle(
            "mediaItemSelected",
            Boolean(checkbox && checkbox.checked)
        );

        /*
          No modo seleção, desativamos o arraste para não conflitar
          com a seleção em lote.
        */
        item.draggable = usuarioPodeEditarMidias() && !modoSelecaoMidiasAtivo;
    });

    if (selectAllWrapper) {
        selectAllWrapper.classList.toggle("hidden", !modoSelecaoMidiasAtivo);
    }

    if (btnDeleteSelected) {
        btnDeleteSelected.classList.toggle("hidden", !modoSelecaoMidiasAtivo);
        btnDeleteSelected.disabled = !existeSelecao;

        definirBotaoComIcone(
            btnDeleteSelected,
            "fa-solid fa-trash-can",
            existeSelecao
                ? `Excluir ${formatarQuantidade(selecionadas.length, "selecionada", "selecionadas")}`
                : "Excluir selecionadas"
        );
    }

    if (btnToggleSelectionMode) {
        definirBotaoComIcone(
            btnToggleSelectionMode,
            modoSelecaoMidiasAtivo
                ? "fa-solid fa-xmark"
                : "fa-solid fa-check-double",
            modoSelecaoMidiasAtivo
                ? "Cancelar seleção"
                : "Selecionar Itens"
        );

        btnToggleSelectionMode.classList.toggle(
            "selectionModeActive",
            modoSelecaoMidiasAtivo
        );
    }

    if (selectAllMedia) {
        const todas = obterCheckboxesVisiveis();
        const selecionadasVisiveis = todas.filter((checkbox) => checkbox.checked);

        selectAllMedia.checked =
            todas.length > 0 && selecionadasVisiveis.length === todas.length;

        selectAllMedia.indeterminate =
            selecionadasVisiveis.length > 0 &&
            selecionadasVisiveis.length < todas.length;
    }
}

/* =========================================================
   MODO SELEÇÃO DE MÍDIAS
   =========================================================
   Controla seleção em lote sem conflitar com reordenação.

   Fora do modo seleção:
   - cards não selecionam ao clicar;
   - arrastar continua funcionando.

   Dentro do modo seleção:
   - checkboxes aparecem;
   - clicar em área neutra do card seleciona;
   - arrastar fica desativado.
   ========================================================= */

/**
 * Limpa todas as seleções atuais.
 */
function limparSelecaoMidias() {
    document.querySelectorAll(".mediaSelect:checked").forEach((checkbox) => {
        checkbox.checked = false;
    });

    if (selectAllMedia) {
        selectAllMedia.checked = false;
        selectAllMedia.indeterminate = false;
    }
}

/**
 * Ativa ou desativa o modo seleção.
 */
function definirModoSelecaoMidias(ativo) {
    modoSelecaoMidiasAtivo = Boolean(ativo);

    if (!modoSelecaoMidiasAtivo) {
        limparSelecaoMidias();
    }

    atualizarEstadoAcoesEmLote();
}

/**
 * Alterna o modo seleção.
 */
function alternarModoSelecaoMidias() {
    definirModoSelecaoMidias(!modoSelecaoMidiasAtivo);
}

/**
 * Marca ou desmarca todas as mídias visíveis.
 */
function alternarSelecionarTodas() {
    const checkboxes = obterCheckboxesVisiveis();

    checkboxes.forEach((checkbox) => {
        checkbox.checked = selectAllMedia.checked;
    });

    atualizarEstadoAcoesEmLote();
}

/**
 * Exclui todas as mídias selecionadas.
 */
async function excluirMidiasSelecionadas() {
    if (!garantirPermissaoParaEditarMidias()) return;

    const arquivos = obterMidiasSelecionadas();

    if (!arquivos.length) {
        mostrarMensagemUpload("Nenhuma mídia selecionada.", "erro");
        return;
    }

    const confirmou = await confirmarAcaoModal({
        kicker: "Biblioteca",
        titulo: "Excluir mídias selecionadas",
        mensagem: `Essa ação remove ${formatarQuantidade(arquivos.length, "mídia selecionada", "mídias selecionadas")} da biblioteca e atualiza a playlist publicada automaticamente.`,
        detalhe: "Essa ação não pode ser desfeita.",
        confirmar: "Excluir selecionadas",
        cancelar: "Cancelar",
        variante: "danger"
    });

    if (!confirmou) return;

    if (btnDeleteSelected) {
        btnDeleteSelected.disabled = true;
        definirBotaoComIcone(btnDeleteSelected, "fa-solid fa-spinner fa-spin", "Excluindo...");
    }

    try {
        const resposta = await fetchComSessao("/api/midias/excluir-lote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                arquivos
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.mensagem || "Erro ao excluir mídias.");
        }

        mostrarMensagemUpload(
            `${formatarQuantidade(dados.excluidos.length, "mídia excluída", "mídias excluídas")}. Playlist atualizada automaticamente.`,
            "sucesso"
        );

        await executarPreservandoScroll(async () => {
            await carregarMidias();
            await carregarPlaylistAtual();
            await carregarResumoAdmin();
        });

        definirModoSelecaoMidias(false);
        atualizarEstadoAcoesEmLote();
    } catch (erro) {
        mostrarMensagemUpload(
            erro.message || "Erro ao excluir mídias selecionadas.",
            "erro"
        );

        console.error(erro);
    } finally {
        if (btnDeleteSelected) {
            btnDeleteSelected.disabled = false;
        }

        atualizarEstadoAcoesEmLote();
    }
}


/* =========================================================
   ORDEM DA PLAYLIST
   ========================================================= */

/**
 * Move uma mídia para cima ou para baixo na ordem da playlist.
 */
async function moverMidia(nomeArquivo, direcao) {
    if (!garantirPermissaoParaEditarMidias()) return;
    try {
        const resposta = await fetchComSessao(
            `/api/midias/${encodeURIComponent(nomeArquivo)}/mover`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    direcao
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.mensagem || "Erro ao mover mídia.");
        }

        mostrarMensagemPlaylist(
            "Ordem atualizada e playlist publicada automaticamente.",
            "sucesso"
        );

        await executarPreservandoScroll(async () => {
            await carregarMidias();
            await carregarPlaylistAtual();
        });
    } catch (erro) {
        mostrarMensagemPlaylist(
            erro.message || "Erro ao mover mídia.",
            "erro"
        );

        console.error(erro);
    }
}

/**
 * Exclui uma única mídia diretamente pelo card.
 */
async function excluirMidiaIndividual(nomeArquivo) {
    if (!garantirPermissaoParaEditarMidias()) return;
    if (!nomeArquivo) return;

    const confirmar = await confirmarAcaoModal({
        kicker: "Biblioteca",
        titulo: "Excluir mídia",
        mensagem: "Essa ação remove a mídia da biblioteca e atualiza a playlist publicada automaticamente.",
        detalhe: nomeArquivo,
        confirmar: "Excluir mídia",
        cancelar: "Cancelar",
        variante: "danger"
    });

    if (!confirmar) return;

    const botao = mediaList.querySelector(
        `.mediaDeleteButton[data-arquivo="${escaparSeletorCss(nomeArquivo)}"]`
    );

    if (botao) {
        botao.disabled = true;
        definirBotaoComIcone(botao, "fa-solid fa-spinner fa-spin", "Excluindo...");
    }

    try {
        const resposta = await fetchComSessao(
            `/api/midias/${encodeURIComponent(nomeArquivo)}`,
            { method: "DELETE" }
        );

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.mensagem || "Erro ao excluir mídia.");
        }

        mostrarMensagemUpload("Mídia excluída e playlist atualizada automaticamente.", "sucesso");

        await executarPreservandoScroll(async () => {
            await carregarMidias();
            await carregarPlaylistAtual();
        });;
    } catch (erro) {
        mostrarMensagemUpload(erro.message || "Erro ao excluir mídia.", "erro");
        console.error(erro);
    } finally {
        if (botao) {
            botao.disabled = false;
            definirBotaoComIcone(botao, "fa-solid fa-trash-can", "Excluir");
        }
    }
}

/**
 * Move uma mídia várias posições usando a API de ordenação existente.
 */
async function moverMidiaParaIndice(nomeArquivo, indiceInicial, indiceFinal) {
    if (!garantirPermissaoParaEditarMidias()) return;
    if (!nomeArquivo || indiceInicial === indiceFinal) return;

    const direcao = indiceFinal < indiceInicial ? "up" : "down";
    const passos = Math.abs(indiceFinal - indiceInicial);

    mediaList.classList.add("mediaListSavingOrder");

    try {
        for (let passo = 0; passo < passos; passo += 1) {
            const resposta = await fetchComSessao(
                `/api/midias/${encodeURIComponent(nomeArquivo)}/mover`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        direcao
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok || dados.erro) {
                throw new Error(dados.mensagem || "Erro ao reordenar mídia.");
            }
        }

        mostrarMensagemPlaylist(
            "Ordem atualizada e playlist publicada automaticamente.",
            "sucesso"
        );

        await executarPreservandoScroll(async () => {
            await carregarMidias();
            await carregarPlaylistAtual();
        });
    } catch (erro) {
        mostrarMensagemPlaylist(
            erro.message || "Erro ao reordenar mídia.",
            "erro"
        );

        await carregarMidias();
        console.error(erro);
    } finally {
        mediaList.classList.remove("mediaListSavingOrder");
    }
}

/**
 * Encontra o ponto de inserção durante o arraste.
 */
function obterItemDepoisDoArraste(y) {
    const itens = Array.from(
        mediaList.querySelectorAll(".mediaItem:not(.mediaItemDragging):not(.mediaItemFiltered)")
    );
    const arrastandoParaCima = Boolean(
        mediaArrastada &&
        typeof mediaArrastada.ultimoY === "number" &&
        y < mediaArrastada.ultimoY
    );

    for (const item of itens) {
        const caixa = item.getBoundingClientRect();
        const margemDeTroca = caixa.height * 0.1;
        const limite = arrastandoParaCima
            ? caixa.bottom - margemDeTroca
            : caixa.top + margemDeTroca;

        if (y < limite) {
            return item;
        }
    }

    return null;
}

/**
 * Atualiza visualmente os numerais depois de uma reordenação local.
 */
function atualizarNumerosDaPlaylist() {
    Array.from(mediaList.querySelectorAll(".mediaItem")).forEach((item, index) => {
        const numero = item.querySelector(".mediaOrderNumber");

        if (numero) {
            numero.textContent = index + 1;
        }
    });
}

/* =========================================================
   ALTERAÇÕES REAIS NOS CARDS DE MÍDIA
   =========================================================
   Evita falso positivo de alteração.

   Antes:
   - alguns cliques neutros podiam mostrar o botão Salvar.

   Agora:
   - cada card guarda a configuração original;
   - ao interagir, comparamos o estado atual com o original;
   - o botão Salvar só aparece se algo realmente mudou.
   ========================================================= */

/**
 * Normaliza uma configuração para comparação.
 */
function normalizarConfiguracaoComparavel(configuracao) {
    return {
        ativo: Boolean(configuracao.ativo),
        duracao: Number(configuracao.duracao || 8),
        prioridade: String(configuracao.prioridade || "normal"),
        repetirACada: Number(configuracao.repetirACada || 0),
        titulo: String(configuracao.titulo || "").trim(),
        inicio: String(configuracao.inicio || ""),
        fim: String(configuracao.fim || "")
    };
}

/**
 * Monta a configuração original da mídia usando os dados vindos da API.
 *
 * As datas são convertidas para datetime-local porque é esse formato
 * que os inputs usam na tela.
 */
function obterConfiguracaoOriginalDeMidia(midia) {
    return normalizarConfiguracaoComparavel({
        ativo: midia.ativo !== false,
        duracao: midia.tipo === "imagem"
            ? Number(midia.duracao || 8)
            : 8,
        prioridade: midia.prioridade || "normal",
        repetirACada: Number(midia.repetirACada || 0),
        titulo: midia.titulo || midia.nome || "",
        inicio: formatarIsoParaDatetimeLocal(midia.inicio),
        fim: formatarIsoParaDatetimeLocal(midia.fim)
    });
}

/**
 * Lê a configuração atual do card em um formato comparável.
 */
function obterConfiguracaoAtualComparavelDoItem(item) {
    const configuracao = coletarConfiguracaoDoItem(item);

    if (!configuracao) return null;

    return normalizarConfiguracaoComparavel(configuracao);
}

/**
 * Verifica se o card realmente possui alteração.
 */
function itemPossuiAlteracaoReal(item) {
    if (!item || !item.dataset.configOriginal) return false;

    const original = JSON.parse(item.dataset.configOriginal);
    const atual = obterConfiguracaoAtualComparavelDoItem(item);

    if (!atual) return false;

    return JSON.stringify(original) !== JSON.stringify(atual);
}

/**
 * Atualiza visualmente o estado de alteração de um card.
 */
function atualizarEstadoVisualAlteracaoDoItem(item) {
    if (!item) return false;

    const alterado = itemPossuiAlteracaoReal(item);
    const botaoSalvar = item.querySelector(".mediaSaveButton");

    item.classList.toggle("mediaItemChanged", alterado);

    if (botaoSalvar) {
        botaoSalvar.classList.toggle("hidden", !alterado);
    }

    /*
      Sempre que um card muda de estado, atualizamos também
      o botão global "Salvar alterações" no header.
    */
    sincronizarAlteracoesPendentesGlobais();

    return alterado;
}

/* =========================================================
   ALTERAÇÕES PENDENTES GLOBAIS
   =========================================================
   Controla o botão "Salvar alterações" do header e o aviso
   de saída da página quando houver cards modificados.
   ========================================================= */

/**
 * Retorna todos os cards de mídia com alterações reais.
 */
function obterItensComAlteracoesPendentes() {
    return Array.from(document.querySelectorAll(".mediaItemChanged"));
}

/**
 * Atualiza o estado global de alterações pendentes.
 */

function sincronizarAlteracoesPendentesGlobais() {
    const itensAlterados = obterItensComAlteracoesPendentes();
    const totalAlterados = itensAlterados.length;

    existemAlteracoesPendentes = totalAlterados > 0;

    if (btnSalvarTudo) {
        btnSalvarTudo.classList.toggle("hidden", !existemAlteracoesPendentes);
        btnSalvarTudo.disabled = !existemAlteracoesPendentes;

        definirBotaoComIcone(
            btnSalvarTudo,
            "fa-solid fa-floppy-disk",
            totalAlterados > 1
                ? `Salvar ${totalAlterados} alterações`
                : "Salvar alteração"
        );

        btnSalvarTudo.classList.toggle("hasChanges", existemAlteracoesPendentes);
    }

    if (pendingChanges) {
        pendingChanges.classList.toggle("hidden", !existemAlteracoesPendentes);

        if (existemAlteracoesPendentes) {
            pendingChanges.textContent = totalAlterados > 1
                ? `${totalAlterados} mídias possuem alterações não salvas.`
                : "1 mídia possui alteração não salva.";
        }
    }
}

/**
 * Coleta a configuração de um card específico.
 */
function coletarConfiguracaoDoItem(item) {
    if (!item) return null;

    const checkbox = item.querySelector(".mediaActive");

    if (!checkbox) return null;

    return coletarConfiguracoesDaTela().find((midia) => midia.nome === checkbox.dataset.arquivo) || null;
}

/**
 * Salva uma única mídia após confirmação.
 */
async function confirmarESalvarMidia(item, mensagem = "Deseja salvar esta alteração?") {
    if (!garantirPermissaoParaEditarMidias()) return false;

    const configuracao = coletarConfiguracaoDoItem(item);

    if (!configuracao) return false;

    /*
      Nome exibido no modal.
      Prioriza o título amigável digitado no card.
      Se não houver título, usa o nome real do arquivo.
    */
    const nomeMidia =
        configuracao.titulo ||
        configuracao.nome ||
        "mídia selecionada";

    const confirmou = await confirmarAcaoModal({
        kicker: "Biblioteca",
        titulo: "Salvar mídia",
        mensagem: "As alterações desta mídia serão salvas e a playlist publicada será atualizada automaticamente.",
        detalhe: nomeMidia,
        confirmar: "Salvar mídia",
        cancelar: "Cancelar",
        variante: "success"
    });

    if (!confirmou) {
        await carregarMidias();
        return false;
    }

    try {
        mostrarMensagemPlaylist("Salvando alteração...", "info");

        const resposta = await fetchComSessao(
            `/api/midias/${encodeURIComponent(configuracao.nome)}/config`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(configuracao)
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.mensagem || "Erro ao salvar mídia.");
        }

        mostrarMensagemPlaylist("Alteração salva e playlist atualizada automaticamente.", "sucesso");

        await executarPreservandoScroll(async () => {
            await carregarMidias();
            await carregarPlaylistAtual();
        });

        /*
          Depois que recarrega, sincroniza o botão global do header.
          Isso evita o botão "Salvar alterações" ficar preso indevidamente.
        */
        sincronizarAlteracoesPendentesGlobais();

        return true;
    } catch (erro) {
        mostrarMensagemPlaylist(erro.message || "Erro ao salvar mídia.", "erro");

        await carregarMidias();

        sincronizarAlteracoesPendentesGlobais();

        console.error(erro);

        return false;
    }
}

/**
 * Salva uma mídia sem modal, para ações rápidas como prioridade.
 */
async function salvarMidiaRapida(item) {
    if (!garantirPermissaoParaEditarMidias()) return false;
    const configuracao = coletarConfiguracaoDoItem(item);

    if (!configuracao) return false;

    try {
        const resposta = await fetchComSessao(
            `/api/midias/${encodeURIComponent(configuracao.nome)}/config`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(configuracao)
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok || dados.erro) {
            throw new Error(dados.mensagem || "Erro ao salvar mídia.");
        }

        mostrarMensagemPlaylist("Alteração salva automaticamente.", "sucesso");
        await executarPreservandoScroll(async () => {
            await carregarMidias();
            await carregarPlaylistAtual();
        });
        return true;
    } catch (erro) {
        mostrarMensagemPlaylist(erro.message || "Erro ao salvar mídia.", "erro");
        await carregarMidias();
        console.error(erro);
        return false;
    }
}


/* =========================================================
   VALIDADE / DATA DE EXIBIÇÃO
   ========================================================= */

/**
 * Atualiza os campos de validade de uma mídia.
 *
 * Quando "Exibir por tempo indeterminado" está marcado:
 * - limpa data inicial;
 * - limpa data final;
 * - desabilita os campos de data.
 *
 * Quando está desmarcado:
 * - libera os campos para edição.
 */
function atualizarCamposValidade(item) {
    if (!item) return;

    const checkboxIndefinido = item.querySelector(".mediaIndefinite");
    const inputInicio = item.querySelector(".mediaStartDate");
    const inputFim = item.querySelector(".mediaEndDate");
    const dateFields = item.querySelector(".mediaDateFields");
    const scheduleSummary = item.querySelector(".mediaScheduleMenu summary");
    const scheduleSummarySmall = item.querySelector(".mediaScheduleMenu summary small");

    if (!checkboxIndefinido || !inputInicio || !inputFim) return;

    const indefinido = checkboxIndefinido.checked;

    if (indefinido) {
        inputInicio.value = "";
        inputFim.value = "";

        if (dateFields) {
            dateFields.classList.add("disabledDates");
        }
    } else {
        if (dateFields) {
            dateFields.classList.remove("disabledDates");
        }
    }

    const textoPeriodo = indefinido
        ? "Tempo indeterminado"
        : "Com data definida";

    if (scheduleSummarySmall) {
        scheduleSummarySmall.textContent = textoPeriodo;
    }

    /*
      Mesmo que o texto pequeno esteja escondido no CSS,
      o title ajuda o usuário e facilita debug visual.
    */
    if (scheduleSummary) {
        scheduleSummary.title = textoPeriodo;
        scheduleSummary.setAttribute("aria-label", `Período de exibição: ${textoPeriodo}`);
    }

    atualizarPeriodoBadgeDoItem(item);
}

/**
 * Ativa datas quando o usuário interage com o datepicker.
 */
function ativarPeriodoPorData(input) {
    const item = input ? input.closest(".mediaItem") : null;
    const checkboxIndefinido = item ? item.querySelector(".mediaIndefinite") : null;

    if (!item || !checkboxIndefinido || !checkboxIndefinido.checked) return;

    checkboxIndefinido.checked = false;
    atualizarCamposValidade(item);

    /*
      Interagir com os campos de data deve contar como alteração real
      somente se o estado atual ficou diferente do original.
    */
    atualizarEstadoVisualAlteracaoDoItem(item);
}


/* =========================================================
   LOGOUT
   ========================================================= */

/**
 * Encerra a sessão administrativa.
 */
async function sairDoAdmin() {
    try {
        await fetchComSessao("/api/logout", {
            method: "POST"
        });

        window.location.href = "/admin/login";
    } catch (erro) {
        console.error("Erro ao sair:", erro);
        window.location.href = "/admin/login";
    }
}


/* =========================================================
   EVENTOS
   ========================================================= */

/* =========================================================
   EVENTOS - USUÁRIOS
   ========================================================= */

if (btnReloadUsers) {
    btnReloadUsers.addEventListener("click", carregarUsuarios);
}

/*
  Abre o modal de novo usuário.
*/
if (btnNewUser) {
    btnNewUser.addEventListener("click", abrirFormularioNovoUsuario);
}

/*
  Fecha o modal pelo botão X.
*/
if (btnCancelUserForm) {
    btnCancelUserForm.addEventListener("click", fecharFormularioUsuario);
}

/*
  Fecha o modal ao clicar fora do card.
*/
if (userModal) {
    userModal.addEventListener("click", (event) => {
        if (event.target === userModal) {
            fecharFormularioUsuario();
        }
    });
}

/*
  Fecha modais e reseta indicadores visuais ao pressionar ESC.
*/
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    fecharIndicadorSelectPerfil();

    if (userModal && !userModal.classList.contains("hidden")) {
        fecharFormularioUsuario();
        return;
    }

    if (resetPasswordModal && !resetPasswordModal.classList.contains("hidden")) {
        fecharModalResetSenha();
        return;
    }

    if (userStatusModal && !userStatusModal.classList.contains("hidden")) {
        fecharModalStatusUsuario();
        return;
    }
});

if (btnToggleUserPassword) {
    btnToggleUserPassword.addEventListener("click", alternarVisibilidadeSenhaUsuario);
}

if (userPasswordInput) {
    userPasswordInput.addEventListener("input", validarSenhaUsuarioVisualmente);
}

if (userRoleInput) {
    userRoleInput.addEventListener("pointerdown", () => {
        if (userRoleField && userRoleField.classList.contains("isOpen")) {
            fecharIndicadorSelectPerfil();
        } else {
            abrirIndicadorSelectPerfil();
        }
    });

    userRoleInput.addEventListener("change", fecharIndicadorSelectPerfil);
    userRoleInput.addEventListener("blur", fecharIndicadorSelectPerfil);
}

if (userForm) {
    userForm.addEventListener("submit", salvarUsuarioPeloFormulario);
}


if (usersList) {
    usersList.addEventListener("click", (event) => {
        const btnEditar = event.target.closest(".btnEditUser");
        const btnResetSenha = event.target.closest(".btnResetUserPassword");
        const btnStatus = event.target.closest(".btnToggleUserStatus");

        if (btnEditar) {
            const idUsuario = btnEditar.dataset.userId;

            abrirFormularioEditarUsuario(idUsuario);
            return;
        }

        if (btnResetSenha) {
            const idUsuario = btnResetSenha.dataset.userId;
            const nomeUsuario = btnResetSenha.dataset.userName || "usuário";

            abrirModalResetSenha(idUsuario, nomeUsuario);
            return;
        }

        if (btnStatus) {
            const idUsuario = btnStatus.dataset.userId;
            const nomeUsuario = btnStatus.dataset.userName || "usuário";
            const usuarioEstaAtivo = btnStatus.dataset.active === "true";

            abrirModalStatusUsuario(idUsuario, nomeUsuario, usuarioEstaAtivo);
            return;
        }
    });
}

if (btnCancelResetPassword) {
    btnCancelResetPassword.addEventListener("click", fecharModalResetSenha);
}

if (btnToggleResetPassword) {
    btnToggleResetPassword.addEventListener("click", alternarVisibilidadeResetSenha);
}

if (resetPasswordInput) {
    resetPasswordInput.addEventListener("input", validarResetSenhaVisualmente);
}

if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", salvarResetSenha);
}

if (resetPasswordModal) {
    resetPasswordModal.addEventListener("click", (event) => {
        if (event.target === resetPasswordModal) {
            fecharModalResetSenha();
        }
    });
}

if (btnCancelUserStatus) {
    btnCancelUserStatus.addEventListener("click", fecharModalStatusUsuario);
}

if (btnDismissUserStatus) {
    btnDismissUserStatus.addEventListener("click", fecharModalStatusUsuario);
}

if (btnConfirmUserStatus) {
    btnConfirmUserStatus.addEventListener("click", confirmarAlteracaoStatusUsuario);
}

if (userStatusModal) {
    userStatusModal.addEventListener("click", (event) => {
        if (event.target === userStatusModal) {
            fecharModalStatusUsuario();
        }
    });
}

if (btnReload) {
    btnReload.addEventListener("click", carregarMidias);
}

if (uploadForm) {
    uploadForm.addEventListener("submit", enviarArquivo);
}

if (inputArquivo) {
    inputArquivo.addEventListener("change", atualizarNomeSelecionado);
}

if (uploadForm) {
    uploadForm.addEventListener("dragenter", (event) => {
        event.preventDefault();
        uploadForm.classList.add("uploadFormDragging");
    });

    uploadForm.addEventListener("dragover", (event) => {
        event.preventDefault();
        uploadForm.classList.add("uploadFormDragging");
    });

    uploadForm.addEventListener("dragleave", (event) => {
        if (uploadForm.contains(event.relatedTarget)) return;

        uploadForm.classList.remove("uploadFormDragging");
    });

    uploadForm.addEventListener("drop", receberArquivoArrastado);
}

if (btnGerarPlaylist) {
    btnGerarPlaylist.addEventListener("click", gerarPlaylist);
}

if (selectAllMedia) {
    selectAllMedia.addEventListener("change", alternarSelecionarTodas);
}

if (btnDeleteSelected) {
    btnDeleteSelected.addEventListener("click", excluirMidiasSelecionadas);
}

if (btnToggleSelectionMode) {
    btnToggleSelectionMode.addEventListener("click", alternarModoSelecaoMidias);
}

if (btnLogout) {
    btnLogout.addEventListener("click", sairDoAdmin);
}

if (btnSalvarTudo) {
    btnSalvarTudo.addEventListener("click", salvarTodasConfiguracoes);
}

if (mediaSearch) {
    mediaSearch.addEventListener("input", aplicarFiltrosMidia);
}

if (mediaStatusFilter) {
    mediaStatusFilter.addEventListener("change", aplicarFiltrosMidia);
}

[mediaTypeFilter, mediaPeriodFilter, mediaPriorityFilter, mediaRepeatFilter]
    .filter(Boolean)
    .forEach((filtro) => {
        filtro.addEventListener("change", aplicarFiltrosMidia);
    });

/*
  Delegação de clique na lista de mídias.

  Como os botões de subir/descer são criados dinamicamente,
  ouvimos o clique no container principal.
*/
mediaList.addEventListener("click", (event) => {
    const itemClicado = event.target.closest(".mediaItem");
    const botaoSalvarDoItemClicado = itemClicado
        ? itemClicado.querySelector(".mediaSaveButton")
        : null;
    const salvarEstavaOculto = Boolean(
        botaoSalvarDoItemClicado &&
        botaoSalvarDoItemClicado.classList.contains("hidden")
    );
    const limparCliqueNeutro = () => {
        if (!itemClicado || !salvarEstavaOculto) return;

        window.setTimeout(() => {
            itemClicado.classList.remove("mediaItemChanged");
            botaoSalvarDoItemClicado.classList.add("hidden");
        }, 0);
    };

    if (event.target.closest(".mediaDragHandle")) {
        limparCliqueNeutro();
        return;
    }

    const botaoMover = event.target.closest(".btnMoveMedia");
    const botaoExcluir = event.target.closest(".mediaDeleteButton");
    const botaoSalvarItem = event.target.closest(".mediaSaveButton");
    const botaoPrioridade = event.target.closest("[data-prioridade]");

    if (botaoMover) {
        const nomeArquivo = botaoMover.dataset.arquivo;
        const direcao = botaoMover.dataset.direcao;

        if (!nomeArquivo || !direcao) return;

        moverMidia(nomeArquivo, direcao);
        return;
    }

    if (botaoExcluir) {
        excluirMidiaIndividual(botaoExcluir.dataset.arquivo);
        return;
    }

    if (botaoSalvarItem) {
        confirmarESalvarMidia(
            botaoSalvarItem.closest(".mediaItem"),
            "Deseja salvar as alterações desta mídia?"
        );
        return;
    }

    if (botaoPrioridade) {
        const itemPrioridade = botaoPrioridade.closest(".mediaItem");
        const selectPrioridade = itemPrioridade
            ? itemPrioridade.querySelector(".mediaPriority")
            : null;

        if (!itemPrioridade || !selectPrioridade) return;

        selectPrioridade.value = botaoPrioridade.dataset.prioridade;
        itemPrioridade.querySelector(".mediaPriorityMenu").removeAttribute("open");
        processarAlteracaoDeMidia(selectPrioridade);
        return;
    }

    const item = event.target.closest(".mediaItem");
    const checkbox = item ? item.querySelector(".mediaSelect") : null;

    /*
      Fora do modo seleção, clique no card não seleciona nada.
      Isso evita conflito com edição, detalhes, período e arrastar.
    */
    if (!modoSelecaoMidiasAtivo) {
        return;
    }

    /*
      Dentro do modo seleção, ignoramos cliques em controles reais.
    */
    if (
        !item ||
        event.target.closest("input, select, textarea, button, a, summary, label, .mediaBadge, .mediaScheduleMenu, .mediaDetailsHover, .mediaStatusToggle, .mediaPreview, .mediaDragHandle")
    ) {
        return;
    }

    if (!checkbox) return;

    checkbox.checked = !checkbox.checked;
    atualizarEstadoAcoesEmLote();
    limparCliqueNeutro();
});

mediaList.addEventListener("dragstart", (event) => {
    const item = event.target.closest(".mediaItem");

    if (
        modoSelecaoMidiasAtivo ||
        !item ||
        event.target.closest("input, select, textarea, button")
    ) {
        event.preventDefault();
        return;
    }

    const itens = Array.from(mediaList.querySelectorAll(".mediaItem"));

    mediaArrastada = {
        elemento: item,
        arquivo: item.dataset.arquivo,
        indiceInicial: itens.indexOf(item),
        ultimoY: event.clientY
    };

    item.classList.add("mediaItemDragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", item.dataset.arquivo || "");
});

mediaList.addEventListener("dragover", (event) => {
    if (!mediaArrastada) return;

    event.preventDefault();

    const itemDepois = obterItemDepoisDoArraste(event.clientY);

    if (itemDepois) {
        mediaList.insertBefore(mediaArrastada.elemento, itemDepois);
    } else {
        mediaList.appendChild(mediaArrastada.elemento);
    }

    mediaArrastada.ultimoY = event.clientY;
    atualizarNumerosDaPlaylist();
});

mediaList.addEventListener("drop", (event) => {
    if (mediaArrastada) {
        event.preventDefault();
    }
});

mediaList.addEventListener("dragend", () => {
    if (!mediaArrastada) return;

    const { elemento, arquivo, indiceInicial } = mediaArrastada;
    const itens = Array.from(mediaList.querySelectorAll(".mediaItem"));
    const indiceFinal = itens.indexOf(elemento);

    elemento.classList.remove("mediaItemDragging");
    mediaArrastada = null;

    if (indiceFinal >= 0 && indiceInicial !== indiceFinal) {
        moverMidiaParaIndice(arquivo, indiceInicial, indiceFinal);
    }
});

mediaList.addEventListener("mouseover", (event) => {
    const preview = event.target.closest(".mediaPreviewVideo");

    if (!preview || preview.dataset.previewing === "true") return;

    const video = preview.querySelector("video");

    if (!video) return;

    preview.dataset.previewing = "true";
    window.clearTimeout(Number(preview.dataset.previewTimer || 0));

    try {
        video.currentTime = 0;
    } catch (erro) {
        // Alguns navegadores bloqueiam seek antes do metadata; o play ainda funciona.
    }

    video.play().catch(() => { });

    preview.dataset.previewTimer = String(window.setTimeout(() => {
        video.pause();

        try {
            video.currentTime = 0;
        } catch (erro) {
            // Sem acao necessaria.
        }

        preview.dataset.previewing = "false";
    }, 8000));
});

mediaList.addEventListener("mouseout", (event) => {
    const preview = event.target.closest(".mediaPreviewVideo");

    if (!preview || preview.contains(event.relatedTarget)) return;

    const video = preview.querySelector("video");

    window.clearTimeout(Number(preview.dataset.previewTimer || 0));
    preview.dataset.previewing = "false";

    if (!video) return;

    video.pause();

    try {
        video.currentTime = 0;
    } catch (erro) {
        // Sem acao necessaria.
    }
});

async function processarAlteracaoDeMidia(alvo) {
    const mudouConfig =
        alvo.classList.contains("mediaActive") ||
        alvo.classList.contains("mediaDuration") ||
        alvo.classList.contains("mediaPriority") ||
        alvo.classList.contains("mediaRepeatEvery") ||
        alvo.classList.contains("mediaStartDate") ||
        alvo.classList.contains("mediaEndDate") ||
        alvo.classList.contains("mediaIndefinite") ||
        alvo.classList.contains("mediaTitleInput");

    if (!mudouConfig) return;

    const item = alvo.closest(".mediaItem");

    if (!item) return;

    /*
      Atualiza campos e textos auxiliares de período.
    */
    if (alvo.classList.contains("mediaIndefinite")) {
        atualizarCamposValidade(item);
    }

    if (alvo.classList.contains("mediaStartDate") ||
        alvo.classList.contains("mediaEndDate")) {
        atualizarPeriodoBadgeDoItem(item);
    }

    /*
      Atualiza visualmente a tag Ativo/Inativo.
    */
    if (alvo.classList.contains("mediaActive")) {
        const statusToggle = alvo.closest(".mediaStatusToggle");
        const statusText = statusToggle ? statusToggle.querySelector("span") : null;

        if (statusToggle) {
            statusToggle.classList.toggle("isActive", alvo.checked);
            statusToggle.classList.toggle("isInactive", !alvo.checked);
        }

        if (statusText) {
            statusText.textContent = alvo.checked ? "Ativo" : "Inativo";
        }
    }

    /*
      Só marca como alterado se houve mudança real em comparação
      com a configuração original carregada pela API.
    */
    const alterado = atualizarEstadoVisualAlteracaoDoItem(item);

    /*
      Se houver seleção em lote, usamos o botão global.
      Mesmo assim, só ativamos o aviso global se algo realmente mudou.
    */
    if (obterMidiasSelecionadas().length > 0 && alterado) {
        marcarAlteracoesPendentes();
    }
}

mediaList.addEventListener("change", (event) => {
    const alvo = event.target;

    if (alvo.classList.contains("mediaSelect")) {
        atualizarEstadoAcoesEmLote();
        return;
    }

    if (alvo.classList.contains("mediaTitleInput")) {
        return;
    }

    processarAlteracaoDeMidia(alvo);
});

mediaList.addEventListener("focusin", (event) => {
    const alvo = event.target;

    if (
        alvo.classList.contains("mediaStartDate") ||
        alvo.classList.contains("mediaEndDate")
    ) {
        ativarPeriodoPorData(alvo);
    }
});

mediaList.addEventListener("click", (event) => {
    const alvo = event.target;

    if (
        alvo.classList.contains("mediaStartDate") ||
        alvo.classList.contains("mediaEndDate")
    ) {
        ativarPeriodoPorData(alvo);
    }
});

/*
  Detecta digitação no nome amigável.
 */
mediaList.addEventListener("input", (event) => {
    const alvo = event.target;

    if (!alvo.classList.contains("mediaTitleInput")) return;

    const item = alvo.closest(".mediaItem");

    const alterado = atualizarEstadoVisualAlteracaoDoItem(item);

    if (obterMidiasSelecionadas().length > 0 && alterado) {
        marcarAlteracoesPendentes();
    }
});

document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".mediaDetailsTrigger");
    const detalhes = event.target.closest(".mediaDetailsHover");

    document.querySelectorAll(".mediaDetailsHover.isOpen").forEach((item) => {
        if (item !== detalhes) {
            item.classList.remove("isOpen");
        }
    });

    if (trigger) {
        event.preventDefault();
        detalhes.classList.toggle("isOpen");
        return;
    }

    if (!detalhes) {
        document.querySelectorAll(".mediaDetailsHover.isOpen").forEach((item) => {
            item.classList.remove("isOpen");
        });
    }
});

/* =========================================================
   START DO ADMIN
   ========================================================= */

async function iniciarAdmin() {
    await carregarUsuarioLogado();

    await carregarResumoAdmin();
    await carregarMidias();
    await carregarPlaylistAtual();

    limparAlteracoesPendentes();
    configurarScrollAoAbrirDropdowns();
    configurarDetailsControlados();
}

iniciarAdmin();