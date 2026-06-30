# =========================================================
# PAINEL RIBAS - PREPARACAO DO WINDOWS PARA PONTO TV
# =========================================================
# Este script deve ser executado apos a instalacao limpa do Windows
# e antes do Kit Ponto TV.
#
# Objetivo:
# - validar usuario/PC;
# - reduzir penduricalhos do Windows;
# - desativar sugestoes/notificacoes;
# - aplicar energia basica;
# - instalar Chrome, Node.js e AnyDesk via winget;
# - configurar login automatico do usuario Painel;
# - preparar estrutura base C:\PainelRibas;
# - gerar relatorio da preparacao.
#
# IMPORTANTE:
# - Execute como Administrador.
# - Nao configura BIOS.
# - Configura login automatico local quando habilitado.
# - Instala AnyDesk quando habilitado, mas nao grava senha de acesso nao supervisionado no codigo.
# =========================================================

$ErrorActionPreference = "Continue"

# ---------------------------------------------------------
# CONFIGURACOES
# ---------------------------------------------------------

$DryRun = $false

$ExpectedUser = "Painel"
$ExpectedComputerNamePattern = "PAINEL-TV"

$BaseDir = "C:\PainelRibas"
$ReportDir = Join-Path $BaseDir "relatorios-preparacao"

$InstallChrome = $true
$InstallNode = $true
$InstallAnyDesk = $true
$ConfigureAutoLogin = $true

$ChromeWingetId = "Google.Chrome"
$NodeWingetId = "OpenJS.NodeJS.LTS"
$AnyDeskWingetId = "AnyDeskSoftwareGmbH.AnyDesk"

$RemoveBloatware = $true
$ApplyPrivacyTweaks = $true
$ApplyPowerTweaks = $true

# Apps que podem ser removidos com segurança razoável para um ponto de TV.
# Evitamos remover Microsoft Store, App Installer, WebView2, Segurança do Windows etc.
$BloatwarePackages = @(
    "*Clipchamp*",
    "*MicrosoftTeams*",
    "*Teams*",
    "*Solitaire*",
    "*BingNews*",
    "*BingWeather*",
    "*BingSearch*",
    "*Microsoft.Bing*",
    "*GetHelp*",
    "*Getstarted*",
    "*QuickAssist*",
    "*MicrosoftOfficeHub*",
    "*Microsoft.OutlookForWindows*",
    "*OutlookForWindows*",
    "*MicrosoftStickyNotes*",
    "*MicrosoftTodos*",
    "*Microsoft.ToDo*",
    "*PowerAutomateDesktop*",
    "*WindowsFeedbackHub*",
    "*ZuneMusic*",
    "*ZuneVideo*",
    "*LinkedIn*",
    "*GamingApp*",
    "*XboxGamingOverlay*",
    "*XboxIdentityProvider*",
    "*Microsoft.OneDriveSync*",
    "*Microsoft.WindowsCamera*",
    "*Microsoft.WindowsSoundRecorder*",
    "*Microsoft.WindowsAlarms*",
    "*Microsoft.Windows.Photos*",
    "*Microsoft.Paint*",
    "*Microsoft.People*"
)

# Componentes que podem aparecer como Xbox, mas sao protegidos pelo Windows.
# Nao tratamos como erro fatal, apenas como aviso operacional.
$AppxProtegidosParaIgnorar = @(
    "Microsoft.XboxGameCallableUI"
)

# ---------------------------------------------------------
# LOG
# ---------------------------------------------------------

if (!(Test-Path $BaseDir)) {
    New-Item -ItemType Directory -Path $BaseDir -Force | Out-Null
}

if (!(Test-Path $ReportDir)) {
    New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null
}

$ReportPath = Join-Path $ReportDir ("preparacao-windows-{0}.txt" -f (Get-Date -Format "yyyyMMdd-HHmmss"))

function Add-Log {
    param(
        [string]$Mensagem,
        [string]$Nivel = "INFO"
    )

    $Linha = "[{0}] [{1}] {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Nivel, $Mensagem

    switch ($Nivel) {
        "OK" { Write-Host $Linha -ForegroundColor Green }
        "AVISO" { Write-Host $Linha -ForegroundColor Yellow }
        "ERRO" { Write-Host $Linha -ForegroundColor Red }
        default { Write-Host $Linha }
    }

    Add-Content -Path $ReportPath -Value $Linha -Encoding UTF8
}

# ---------------------------------------------------------
# STATUS FINAL / RESUMO INTELIGENTE
# ---------------------------------------------------------
# Este bloco centraliza os status finais da preparação.
# Assim evitamos erro de função inexistente e conseguimos
# gerar um relatório final mais inteligente.

$StatusFinal = [ordered]@{
    Administrador              = $false
    UsuarioPadrao              = $false
    NomePcPadrao               = $false
    ChromeDisponivel           = $false
    NodeDisponivel             = $false
    AnyDeskEncontrado          = $false
    LoginAutomaticoConfigurado = $false
    EstruturaBaseOk            = $false
    WallpaperAplicado          = $false
    PrecisaReiniciar           = $false
}

function Set-StatusFinal {
    param(
        [string]$Nome,
        [bool]$Valor
    )

    if ($StatusFinal.Contains($Nome)) {
        $StatusFinal[$Nome] = $Valor
        return
    }

    Add-Log "StatusFinal desconhecido ignorado: $Nome" "AVISO"
}

function Set-ReinicioPendente {
    param(
        [string]$Motivo
    )

    Set-StatusFinal "PrecisaReiniciar" $true

    if (![string]::IsNullOrWhiteSpace($Motivo)) {
        Add-Log "Reinicio pendente: $Motivo" "AVISO"
    }
}

function Initialize-ChaveRegistro {
    param(
        [string]$Caminho
    )

    if ([string]::IsNullOrWhiteSpace($Caminho)) {
        return $false
    }

    if (!(Test-Path $Caminho)) {
        New-Item -Path $Caminho -Force -ErrorAction Stop | Out-Null
    }

    return $true
}

function Test-AppxProtegidoPainel {
    param(
        [string]$Nome
    )

    if ([string]::IsNullOrWhiteSpace($Nome)) {
        return $false
    }

    return $AppxProtegidosParaIgnorar -contains $Nome
}

function Remove-AppxPainelControlado {
    param(
        [string]$PackagePattern
    )

    # Remove pacotes instalados para usuarios.
    $PacotesInstalados = Get-AppxPackage -Name $PackagePattern -AllUsers -ErrorAction SilentlyContinue

    foreach ($Pacote in $PacotesInstalados) {
        if (Test-AppxProtegidoPainel $Pacote.Name) {
            Add-Log "Componente protegido do Windows nao removido: $($Pacote.Name)" "AVISO"
            continue
        }

        try {
            Remove-AppxPackage -Package $Pacote.PackageFullName -AllUsers -ErrorAction Stop
            Add-Log "App removido: $($Pacote.Name)" "OK"
        }
        catch {
            $MensagemErro = $_.Exception.Message

            if ($Pacote.Name -like "*Xbox*" -or $MensagemErro -like "*protegido*" -or $MensagemErro -like "*protected*") {
                Add-Log "App nao removido por protecao do Windows: $($Pacote.Name)" "AVISO"
                Add-Log "Detalhe: $MensagemErro" "AVISO"
                continue
            }

            throw
        }
    }

    # Remove pacotes provisionados para novos usuarios.
    $PacotesProvisionados = Get-AppxProvisionedPackage -Online |
    Where-Object { $_.DisplayName -like $PackagePattern }

    foreach ($PacoteProvisionado in $PacotesProvisionados) {
        if (Test-AppxProtegidoPainel $PacoteProvisionado.DisplayName) {
            Add-Log "Componente provisionado protegido nao removido: $($PacoteProvisionado.DisplayName)" "AVISO"
            continue
        }

        try {
            Remove-AppxProvisionedPackage `
                -Online `
                -PackageName $PacoteProvisionado.PackageName `
                -ErrorAction Stop | Out-Null

            Add-Log "App provisionado removido: $($PacoteProvisionado.DisplayName)" "OK"
        }
        catch {
            $MensagemErro = $_.Exception.Message

            if ($PacoteProvisionado.DisplayName -like "*Xbox*" -or $MensagemErro -like "*protegido*" -or $MensagemErro -like "*protected*") {
                Add-Log "App provisionado nao removido por protecao do Windows: $($PacoteProvisionado.DisplayName)" "AVISO"
                Add-Log "Detalhe: $MensagemErro" "AVISO"
                continue
            }

            throw
        }
    }
}

function Add-StatusResumo {
    param(
        [bool]$Ok,
        [string]$MensagemOk,
        [string]$MensagemAviso
    )

    if ($Ok) {
        Add-Log $MensagemOk "OK"
    }
    else {
        Add-Log $MensagemAviso "AVISO"
    }
}

function Add-PendenciaManualSe {
    param(
        [bool]$Condicao,
        [string]$Mensagem
    )

    if ($Condicao) {
        Add-Log "[MANUAL] $Mensagem" "INFO"
    }
}

function Add-ProximoPassoKitSe {
    param(
        [bool]$Condicao,
        [string]$Mensagem
    )

    if ($Condicao) {
        Add-Log "[KIT] $Mensagem" "INFO"
    }
}

function Invoke-AcaoSegura {
    param(
        [string]$Descricao,
        [scriptblock]$Acao
    )

    if ($DryRun) {
        Add-Log "[DRYRUN] $Descricao" "AVISO"
        return $true
    }

    try {
        Add-Log "Executando: $Descricao"
        & $Acao
        Add-Log "Concluido: $Descricao" "OK"
        return $true
    }
    catch {
        Add-Log "Falha ao executar '$Descricao': $($_.Exception.Message)" "ERRO"
        return $false
    }
}

function Test-Administrador {
    $Identidade = [Security.Principal.WindowsIdentity]::GetCurrent()
    $Principal = New-Object Security.Principal.WindowsPrincipal($Identidade)
    return $Principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-Comando {
    param([string]$Nome)

    try {
        return Get-Command $Nome -ErrorAction Stop
    }
    catch {
        return $null
    }
}

function Update-PathDaSessao {
    try {
        $MachinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        $UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
        $env:Path = "$MachinePath;$UserPath"
        Add-Log "PATH da sessao atualizado a partir do Registro."
    }
    catch {
        Add-Log "Nao foi possivel atualizar PATH da sessao: $($_.Exception.Message)" "AVISO"
    }
}

function Find-Node {
    $Possiveis = @(
        "C:\Program Files\nodejs\node.exe",
        "C:\Program Files (x86)\nodejs\node.exe"
    )

    foreach ($Caminho in $Possiveis) {
        if (Test-Path $Caminho) {
            return $Caminho
        }
    }

    $Cmd = Get-Comando "node.exe"
    if ($Cmd) {
        return $Cmd.Source
    }

    return $null
}

function Find-AnyDesk {
    $Possiveis = @(
        "C:\Program Files (x86)\AnyDesk\AnyDesk.exe",
        "C:\Program Files\AnyDesk\AnyDesk.exe",
        "$env:LocalAppData\Programs\AnyDesk\AnyDesk.exe",
        "$env:ProgramData\AnyDesk\AnyDesk.exe"
    )

    foreach ($Caminho in $Possiveis) {
        if ($Caminho -and (Test-Path $Caminho)) {
            return $Caminho
        }
    }

    $Cmd = Get-Comando "AnyDesk.exe"
    if ($Cmd) {
        return $Cmd.Source
    }

    return $null
}

function Disable-OneDrive {
    Add-Log "Aplicando bloqueios/remocao do OneDrive..."

    Invoke-AcaoSegura "Encerrar processo do OneDrive, se estiver aberto" {
        Stop-Process -Name "OneDrive" -Force -ErrorAction SilentlyContinue
    } | Out-Null

    Invoke-AcaoSegura "Remover OneDrive da inicializacao do usuario" {
        Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "OneDrive" -ErrorAction SilentlyContinue
    } | Out-Null

    Invoke-AcaoSegura "Desativar OneDrive por politica local" {
        New-Item -Path "HKLM:\Software\Policies\Microsoft\Windows\OneDrive" -Force | Out-Null
        Set-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Windows\OneDrive" -Name "DisableFileSyncNGSC" -Type DWord -Value 1
    } | Out-Null

    $OneDriveSetupPossiveis = @(
        "$env:SystemRoot\System32\OneDriveSetup.exe",
        "$env:SystemRoot\SysWOW64\OneDriveSetup.exe"
    )

    foreach ($Setup in $OneDriveSetupPossiveis) {
        if (Test-Path $Setup) {
            Invoke-AcaoSegura "Desinstalar OneDrive via $Setup" {
                Start-Process -FilePath $Setup -ArgumentList "/uninstall" -Wait -WindowStyle Hidden
            } | Out-Null
        }
    }
}

function Set-NotificacoesDesativadas {
    Add-Log "Desativando notificacoes gerais/toasts do Windows..."

    Invoke-AcaoSegura "Desativar notificacoes Toast do usuario atual" {
        $PushNotificationsPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\PushNotifications"

        Initialize-ChaveRegistro $PushNotificationsPath | Out-Null

        New-ItemProperty `
            -Path $PushNotificationsPath `
            -Name "ToastEnabled" `
            -PropertyType DWord `
            -Value 0 `
            -Force | Out-Null
    } | Out-Null

    Invoke-AcaoSegura "Desativar notificacoes globais do usuario atual" {
        New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Notifications\Settings" -Force | Out-Null
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Notifications\Settings" -Name "NOC_GLOBAL_SETTING_TOASTS_ENABLED" -Type DWord -Value 0
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Notifications\Settings" -Name "NOC_GLOBAL_SETTING_ALLOW_NOTIFICATION_SOUND" -Type DWord -Value 0
    } | Out-Null

    Invoke-AcaoSegura "Desativar experiencias de consumidor e conteudo sugerido" {
        New-Item -Path "HKLM:\Software\Policies\Microsoft\Windows\CloudContent" -Force | Out-Null
        Set-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Windows\CloudContent" -Name "DisableWindowsConsumerFeatures" -Type DWord -Value 1
        Set-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Windows\CloudContent" -Name "DisableSoftLanding" -Type DWord -Value 1
    } | Out-Null
}

function Set-LoginAutomaticoPainel {
    if ($ConfigureAutoLogin -ne $true) {
        Add-Log "Configuracao de login automatico desativada por configuracao." "AVISO"
        Set-StatusFinal "LoginAutomaticoConfigurado" $false
        return
    }

    Add-Log "Preparando login automatico do Windows para o usuario $ExpectedUser..."

    if ($UsuarioAtual -ine $ExpectedUser) {
        Add-Log "Usuario atual nao e $ExpectedUser. Login automatico nao sera configurado automaticamente." "AVISO"
        Set-StatusFinal "LoginAutomaticoConfigurado" $false
        return
    }

    if ($DryRun) {
        Add-Log "[DRYRUN] Configuraria AutoAdminLogon para $NomePc\$ExpectedUser." "AVISO"
        return
    }

    $SenhaSegura = Read-Host "Digite a senha do usuario $ExpectedUser. Se nao tiver senha, apenas aperte Enter" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SenhaSegura)

    try {
        $Senha = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

        $RegPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"

        Set-ItemProperty -Path $RegPath -Name "AutoAdminLogon" -Value "1" -Type String
        Set-ItemProperty -Path $RegPath -Name "DefaultUserName" -Value $ExpectedUser -Type String
        Set-ItemProperty -Path $RegPath -Name "DefaultDomainName" -Value $NomePc -Type String
        Set-ItemProperty -Path $RegPath -Name "DefaultPassword" -Value $Senha -Type String

        Remove-ItemProperty -Path $RegPath -Name "AutoLogonCount" -ErrorAction SilentlyContinue

        Add-Log "Login automatico configurado para $NomePc\$ExpectedUser." "OK"
        Set-StatusFinal "LoginAutomaticoConfigurado" $true
    }
    catch {
        Add-Log "Falha ao configurar login automatico: $($_.Exception.Message)" "ERRO"
        Set-StatusFinal "LoginAutomaticoConfigurado" $false
    }
    finally {
        if ($BSTR -ne [IntPtr]::Zero) {
            [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
        }
    }
}

# ---------------------------------------------------------
# CABECALHO
# ---------------------------------------------------------

Write-Host ""
Write-Host "========================================================"
Write-Host "   PAINEL RIBAS - PREPARACAO DO WINDOWS PARA PONTO TV"
Write-Host "========================================================"
Write-Host ""

Add-Log "========================================================"
Add-Log "PAINEL RIBAS - PREPARACAO DO WINDOWS PARA PONTO TV"
Add-Log "========================================================"
Add-Log "Modo dryRun: $DryRun"
Add-Log "Relatorio: $ReportPath"

# ---------------------------------------------------------
# VALIDACOES INICIAIS
# ---------------------------------------------------------

if (Test-Administrador) {
    Add-Log "Executando com permissao de Administrador." "OK"
    Set-StatusFinal "Administrador" $true
}
else {
    Add-Log "Execute este script como Administrador." "ERRO"
    Add-Log "Encerrando preparacao." "ERRO"
    Set-StatusFinal "Administrador" $false
    exit 1
}

$UsuarioAtual = $env:USERNAME
$NomePc = $env:COMPUTERNAME

Add-Log "Usuario atual: $UsuarioAtual"
Add-Log "Nome do computador: $NomePc"

if ($UsuarioAtual -ieq $ExpectedUser) {
    Add-Log "Usuario atual esta no padrao esperado: $ExpectedUser" "OK"
    Set-StatusFinal "UsuarioPadrao" $true
}
else {
    Add-Log "Usuario atual diferente do esperado. Esperado: $ExpectedUser | Atual: $UsuarioAtual" "AVISO"
    Add-Log "Recomendado executar a preparacao e o Kit logado no usuario Painel." "AVISO"
    Set-StatusFinal "UsuarioPadrao" $false
}

if ($NomePc -like "$ExpectedComputerNamePattern*") {
    Add-Log "Nome do computador segue o padrao esperado: $ExpectedComputerNamePattern*" "OK"
    Set-StatusFinal "NomePcPadrao" $true
}
else {
    Add-Log "Nome do computador fora do padrao. Recomenda-se usar PAINEL-TV-XX." "AVISO"
    Set-StatusFinal "NomePcPadrao" $false
}

# ---------------------------------------------------------
# WINGET
# ---------------------------------------------------------

$Winget = Get-Comando "winget.exe"

if ($Winget) {
    Add-Log "winget encontrado em: $($Winget.Source)" "OK"
}
else {
    Add-Log "winget nao encontrado. Instalacao automatica de Chrome/Node pode falhar." "AVISO"
    Add-Log "Nao remova Microsoft Store/App Installer, pois o winget depende deles." "AVISO"
}

# ---------------------------------------------------------
# REMOCAO DE BLOATWARE
# ---------------------------------------------------------

if ($RemoveBloatware) {
    Add-Log "Iniciando remocao controlada de apps desnecessarios..."

    foreach ($PackagePattern in $BloatwarePackages) {
        Invoke-AcaoSegura "Remover app instalado/provisionado: $PackagePattern" {
            Remove-AppxPainelControlado $PackagePattern
        } | Out-Null
    }

    Add-Log "Remocao controlada de apps finalizada." "OK"
}
else {
    Add-Log "Remocao de bloatware desativada por configuracao." "AVISO"
}

# ---------------------------------------------------------
# PRIVACIDADE / SUGESTOES / NOTIFICACOES
# ---------------------------------------------------------

if ($ApplyPrivacyTweaks) {
    Add-Log "Aplicando ajustes de privacidade, sugestoes e notificacoes..."

    Invoke-AcaoSegura "Desativar sugestoes, dicas e experiencias personalizadas" {
        New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Force | Out-Null

        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "SubscribedContent-338389Enabled" -Type DWord -Value 0
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "SubscribedContent-338388Enabled" -Type DWord -Value 0
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "SubscribedContent-353698Enabled" -Type DWord -Value 0
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "SystemPaneSuggestionsEnabled" -Type DWord -Value 0
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "SoftLandingEnabled" -Type DWord -Value 0
    } | Out-Null

    Invoke-AcaoSegura "Desativar notificacoes de boas-vindas/sugestoes pos-atualizacao" {
        New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\UserProfileEngagement" -Force | Out-Null
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\UserProfileEngagement" -Name "ScoobeSystemSettingEnabled" -Type DWord -Value 0
    } | Out-Null

    Invoke-AcaoSegura "Desativar reabertura automatica de aplicativos reiniciaveis" {
        New-Item -Path "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" -Force | Out-Null
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "RestartApps" -Type DWord -Value 0
    } | Out-Null

    Set-NotificacoesDesativadas
    Disable-OneDrive

    Add-Log "Ajustes de privacidade/sugestoes/notificacoes finalizados." "OK"
}
else {
    Add-Log "Ajustes de privacidade desativados por configuracao." "AVISO"
}

# ---------------------------------------------------------
# POLITICAS DO CHROME PARA ACESSO LOCAL
# ---------------------------------------------------------

Add-Log "Configurando politicas do Chrome para permitir acesso local do painel..."

Invoke-AcaoSegura "Permitir Local Network Access para painelribas.com.br" {
    $ChromePolicyBase = "HKLM:\SOFTWARE\Policies\Google\Chrome"
    $LocalNetworkPolicy = Join-Path $ChromePolicyBase "LocalNetworkAccessAllowedForUrls"
    $PrivateNetworkPolicy = Join-Path $ChromePolicyBase "InsecurePrivateNetworkRequestsAllowedForUrls"

    New-Item -Path $LocalNetworkPolicy -Force | Out-Null
    New-ItemProperty -Path $LocalNetworkPolicy -Name "1" -Value "https://painelribas.com.br" -PropertyType String -Force | Out-Null

    # Politica antiga/de compatibilidade para Chromium/Chrome em algumas versoes.
    New-Item -Path $PrivateNetworkPolicy -Force | Out-Null
    New-ItemProperty -Path $PrivateNetworkPolicy -Name "1" -Value "https://painelribas.com.br" -PropertyType String -Force | Out-Null
} | Out-Null

Add-Log "Politicas do Chrome para acesso local configuradas." "OK"

# ---------------------------------------------------------
# FUSO HORARIO E SINCRONIZACAO DE HORA
# ---------------------------------------------------------

Add-Log "Configurando fuso horario e sincronizacao de hora..."

Invoke-AcaoSegura "Definir fuso horario para Cuiaba/Campo Grande" {
    tzutil /s "Central Brazilian Standard Time"
} | Out-Null

Invoke-AcaoSegura "Garantir servico de horario automatico" {
    Set-Service W32Time -StartupType Automatic
    Start-Service W32Time -ErrorAction SilentlyContinue
} | Out-Null

Invoke-AcaoSegura "Forcar sincronizacao de horario" {
    w32tm /resync /force
} | Out-Null

Add-Log "Fuso horario e sincronizacao de hora configurados." "OK"

# ---------------------------------------------------------
# ENERGIA BASICA
# ---------------------------------------------------------

if ($ApplyPowerTweaks) {
    Add-Log "Aplicando ajustes basicos de energia..."

    Invoke-AcaoSegura "Ativar plano Alto desempenho, quando disponivel" {
        powercfg /setactive SCHEME_MIN | Out-Null
    } | Out-Null

    Invoke-AcaoSegura "Desativar hibernacao" {
        powercfg /hibernate off | Out-Null
    } | Out-Null

    Invoke-AcaoSegura "Configurar tela para nunca desligar na energia" {
        powercfg /change monitor-timeout-ac 0 | Out-Null
    } | Out-Null

    Invoke-AcaoSegura "Configurar suspensao para nunca ocorrer na energia" {
        powercfg /change standby-timeout-ac 0 | Out-Null
    } | Out-Null

    Invoke-AcaoSegura "Configurar disco para nunca desligar na energia" {
        powercfg /change disk-timeout-ac 0 | Out-Null
    } | Out-Null

    Add-Log "Ajustes basicos de energia finalizados." "OK"
}
else {
    Add-Log "Ajustes de energia desativados por configuracao." "AVISO"
}

# ---------------------------------------------------------
# INSTALACAO DO CHROME
# ---------------------------------------------------------

function Find-Chrome {
    $Possiveis = @(
        "C:\Program Files\Google\Chrome\Application\chrome.exe",
        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    )

    foreach ($Caminho in $Possiveis) {
        if (Test-Path $Caminho) {
            return $Caminho
        }
    }

    return $null
}

$ChromePath = Find-Chrome

if ($ChromePath) {
    Add-Log "Google Chrome encontrado em: $ChromePath" "OK"
    Set-StatusFinal "ChromeDisponivel" $true
}
else {
    Add-Log "Google Chrome nao encontrado." "AVISO"

    if ($InstallChrome -and $Winget) {
        Invoke-AcaoSegura "Instalar Google Chrome via winget ($ChromeWingetId)" {
            winget install --id $ChromeWingetId --exact --silent --accept-source-agreements --accept-package-agreements
        } | Out-Null

        $ChromePath = Find-Chrome

        if ($ChromePath) {
            Add-Log "Google Chrome encontrado apos instalacao: $ChromePath" "OK"
            Set-StatusFinal "ChromeDisponivel" $true
        }
        else {
            Add-Log "Google Chrome ainda nao foi encontrado apos instalacao." "AVISO"
            Add-Log "Pode ser necessario reiniciar o Windows ou instalar manualmente." "AVISO"
            Set-StatusFinal "ChromeDisponivel" $false
        }
    }
    else {
        Add-Log "Instalacao automatica do Chrome nao executada." "AVISO"
        Set-StatusFinal "ChromeDisponivel" $false
    }
}

# ---------------------------------------------------------
# INSTALACAO DO NODE.JS
# ---------------------------------------------------------

$NodePath = Find-Node

if ($NodePath) {
    try {
        $NodeVersion = & $NodePath -v
        Add-Log "Node.js encontrado: $NodeVersion em $NodePath" "OK"
        Set-StatusFinal "NodeDisponivel" $true
    }
    catch {
        Add-Log "Node.js encontrado em $NodePath, mas nao foi possivel obter versao." "AVISO"
        Set-StatusFinal "NodeDisponivel" $true
    }
}
else {
    Add-Log "Node.js nao encontrado no PATH/caminhos padrao." "AVISO"

    if ($InstallNode -and $Winget) {
        Invoke-AcaoSegura "Instalar Node.js LTS via winget ($NodeWingetId)" {
            winget install --id $NodeWingetId --exact --silent --accept-source-agreements --accept-package-agreements
        } | Out-Null

        Update-PathDaSessao

        $NodePath = Find-Node

        if ($NodePath) {
            try {
                $NodeVersion = & $NodePath -v
                Add-Log "Node.js encontrado apos instalacao: $NodeVersion em $NodePath" "OK"
                Set-StatusFinal "NodeDisponivel" $true
            }
            catch {
                Add-Log "Node.js encontrado apos instalacao em $NodePath, mas nao foi possivel obter versao." "AVISO"
                Set-StatusFinal "NodeDisponivel" $true
            }
        }
        else {
            Add-Log "Node.js ainda nao foi encontrado apos instalacao." "AVISO"
            Add-Log "Pode ser necessario reiniciar/logoff para atualizar o PATH." "AVISO"
            Set-StatusFinal "NodeDisponivel" $false
            Set-ReinicioPendente "Node.js foi instalado ou solicitado, mas ainda nao ficou disponivel nesta sessao."
        }
    }
    else {
        Add-Log "Instalacao automatica do Node.js nao executada." "AVISO"
        Set-StatusFinal "NodeDisponivel" $false
    }
}

# ---------------------------------------------------------
# INSTALACAO DO ANYDESK
# ---------------------------------------------------------

$AnyDeskPath = Find-AnyDesk

if ($AnyDeskPath) {
    Add-Log "AnyDesk encontrado em: $AnyDeskPath" "OK"
    Set-StatusFinal "AnyDeskEncontrado" $true
}
else {
    Add-Log "AnyDesk nao encontrado." "AVISO"
    Set-StatusFinal "AnyDeskEncontrado" $false

    if ($InstallAnyDesk) {
        $InstalouViaWinget = $false

        if ($Winget) {
            Invoke-AcaoSegura "Instalar AnyDesk via winget ($AnyDeskWingetId)" {
                winget install --id $AnyDeskWingetId --exact --silent --accept-source-agreements --accept-package-agreements
            } | Out-Null

            Update-PathDaSessao
            Start-Sleep -Seconds 5

            $AnyDeskPath = Find-AnyDesk

            if ($AnyDeskPath) {
                $InstalouViaWinget = $true
                Add-Log "AnyDesk encontrado apos instalacao via winget: $AnyDeskPath" "OK"
                Set-StatusFinal "AnyDeskEncontrado" $true
            }
            else {
                Add-Log "winget concluiu, mas o AnyDesk nao foi localizado. Tentando instalador oficial." "AVISO"
            }
        }
        else {
            Add-Log "winget nao encontrado. Tentando instalador oficial do AnyDesk." "AVISO"
        }

        if (-not $InstalouViaWinget) {
            $AnyDeskInstaller = Join-Path $env:TEMP "AnyDesk.exe"
            $AnyDeskInstallDir = "C:\Program Files (x86)\AnyDesk"

            Invoke-AcaoSegura "Baixar instalador oficial do AnyDesk" {
                Invoke-WebRequest `
                    -Uri "https://download.anydesk.com/AnyDesk.exe" `
                    -OutFile $AnyDeskInstaller `
                    -UseBasicParsing
            } | Out-Null

            if (Test-Path $AnyDeskInstaller) {
                Invoke-AcaoSegura "Instalar AnyDesk via instalador oficial" {
                    Start-Process `
                        -FilePath $AnyDeskInstaller `
                        -ArgumentList "--install `"$AnyDeskInstallDir`" --start-with-win --create-shortcuts --silent" `
                        -Wait
                } | Out-Null

                Start-Sleep -Seconds 8
                Update-PathDaSessao

                $AnyDeskPath = Find-AnyDesk

                if ($AnyDeskPath) {
                    Add-Log "AnyDesk encontrado apos instalacao oficial: $AnyDeskPath" "OK"
                    Set-StatusFinal "AnyDeskEncontrado" $true
                    Add-Log "Configure manualmente o acesso nao supervisionado e registre a senha apenas no controle interno da TI." "AVISO"
                }
                else {
                    Add-Log "AnyDesk ainda nao foi encontrado apos winget/fallback oficial. Configuracao manual pode ser necessaria." "AVISO"
                    Set-StatusFinal "AnyDeskEncontrado" $false
                }
            }
            else {
                Add-Log "Instalador oficial do AnyDesk nao foi baixado: $AnyDeskInstaller" "ERRO"
                Set-StatusFinal "AnyDeskEncontrado" $false
            }
        }
    }
    else {
        Add-Log "Instalacao automatica do AnyDesk nao executada por configuracao." "AVISO"
        Set-StatusFinal "AnyDeskEncontrado" $false
    }
}

# ---------------------------------------------------------
# ESTRUTURA BASE
# ---------------------------------------------------------

Add-Log "Conferindo estrutura base do Painel Ribas..."

$PastasBase = @(
    "C:\PainelRibas",
    "C:\PainelRibas\chrome-profile",
    "C:\PainelRibas\relatorios-preparacao"
)

$EstruturaBaseOk = $true

foreach ($Pasta in $PastasBase) {
    if (Test-Path $Pasta) {
        Add-Log "Pasta ja existe: $Pasta" "OK"
    }
    else {
        $CriouPasta = Invoke-AcaoSegura "Criar pasta: $Pasta" {
            New-Item -ItemType Directory -Path $Pasta -Force | Out-Null
        }

        if (-not $CriouPasta) {
            $EstruturaBaseOk = $false
        }
    }
}

Set-StatusFinal "EstruturaBaseOk" $EstruturaBaseOk

# ---------------------------------------------------------
# WALLPAPER INSTITUCIONAL
# ---------------------------------------------------------

Add-Log "Configurando wallpaper institucional..."

$WallpaperOrigem = "C:\PainelRibas\assets\wallpaper.jpg"
$WallpaperDestino = "C:\PainelRibas\assets\wallpaper.jpg"

if (Test-Path $WallpaperOrigem) {
    $WallpaperAplicado = Invoke-AcaoSegura "Aplicar wallpaper institucional" {
        Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name Wallpaper -Value $WallpaperDestino
        Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name WallpaperStyle -Value "10"
        Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name TileWallpaper -Value "0"

        rundll32.exe user32.dll, UpdatePerUserSystemParameters

        Add-Log "Wallpaper institucional aplicado: $WallpaperDestino" "OK"
    }

    Set-StatusFinal "WallpaperAplicado" $WallpaperAplicado
}
else {
    Add-Log "Wallpaper institucional ainda nao encontrado em: $WallpaperOrigem" "AVISO"
    Add-Log "Isso e esperado antes da extracao do pacote. O kit final deve aplicar novamente depois." "INFO"

    Set-StatusFinal "WallpaperAplicado" $false
}

# ---------------------------------------------------------
# LOGIN AUTOMATICO
# ---------------------------------------------------------

Set-LoginAutomaticoPainel

# ---------------------------------------------------------
# RESUMO FINAL INTELIGENTE
# ---------------------------------------------------------

Add-Log ""
Add-Log "========================================================"
Add-Log "              RESUMO FINAL DA PREPARACAO"
Add-Log "========================================================"

Add-StatusResumo `
    $StatusFinal["Administrador"] `
    "Executado como Administrador" `
    "Nao foi executado como Administrador"

Add-StatusResumo `
    $StatusFinal["UsuarioPadrao"] `
    "Usuario atual no padrao $ExpectedUser" `
    "Usuario atual fora do padrao $ExpectedUser"

Add-StatusResumo `
    $StatusFinal["NomePcPadrao"] `
    "Nome do computador no padrao $ExpectedComputerNamePattern" `
    "Nome do computador fora do padrao $ExpectedComputerNamePattern"

Add-StatusResumo `
    $StatusFinal["ChromeDisponivel"] `
    "Google Chrome disponivel" `
    "Google Chrome nao confirmado"

Add-StatusResumo `
    $StatusFinal["NodeDisponivel"] `
    "Node.js disponivel" `
    "Node.js nao confirmado"

Add-StatusResumo `
    $StatusFinal["AnyDeskEncontrado"] `
    "AnyDesk disponivel" `
    "AnyDesk nao encontrado"

Add-StatusResumo `
    $StatusFinal["EstruturaBaseOk"] `
    "Estrutura base C:\PainelRibas preparada" `
    "Estrutura base C:\PainelRibas nao foi totalmente preparada"

Add-StatusResumo `
    $StatusFinal["LoginAutomaticoConfigurado"] `
    "Login automatico do Windows configurado" `
    "Login automatico do Windows nao confirmado"

if ($StatusFinal["WallpaperAplicado"]) {
    Add-Log "Wallpaper institucional aplicado" "OK"
}
else {
    Add-Log "Wallpaper institucional ainda nao aplicado nesta etapa" "AVISO"
    Add-Log "O wallpaper sera aplicado novamente apos a extracao do pacote, quando os assets existirem em C:\PainelRibas." "INFO"
}

if ($StatusFinal["PrecisaReiniciar"]) {
    Add-Log "Reinicio/logoff recomendado apos esta etapa" "AVISO"
}
else {
    Add-Log "Nenhum reinicio obrigatorio detectado nesta etapa" "OK"
}

Add-Log ""
Add-Log "========================================================"
Add-Log "              PROXIMOS PASSOS"
Add-Log "========================================================"

# Pendencias que agora dependem do status real.
Add-PendenciaManualSe `
(-not $StatusFinal["UsuarioPadrao"]) `
    "Entrar/confirmar usuario local $ExpectedUser."

Add-PendenciaManualSe `
(-not $StatusFinal["NomePcPadrao"]) `
    "Confirmar nome do computador no padrao $ExpectedComputerNamePattern-XX."

Add-PendenciaManualSe `
(-not $StatusFinal["ChromeDisponivel"]) `
    "Instalar ou confirmar Google Chrome."

Add-PendenciaManualSe `
(-not $StatusFinal["NodeDisponivel"]) `
    "Instalar ou confirmar Node.js LTS."

Add-PendenciaManualSe `
(-not $StatusFinal["LoginAutomaticoConfigurado"]) `
    "Configurar login automatico do Windows para o usuario $ExpectedUser."

# AnyDesk encontrado nao significa que o acesso nao supervisionado esteja pronto.
if ($StatusFinal["AnyDeskEncontrado"]) {
    Add-Log "[MANUAL] Conferir senha/acesso nao supervisionado do AnyDesk e registrar em controle interno da TI." "INFO"
}
else {
    Add-Log "[MANUAL] Instalar/configurar AnyDesk com acesso nao supervisionado." "INFO"
}

# Pendencias fisicas/BIOS continuam manuais mesmo com kit profissional.
Add-Log "[MANUAL] Configurar BIOS/UEFI para ligar apos queda de energia." "INFO"
Add-Log "[MANUAL] Configurar BIOS/UEFI para nao travar sem teclado/mouse." "INFO"
Add-Log "[MANUAL] Testar HDMI, resolucao, escala e audio na TV real." "INFO"
Add-Log "[MANUAL] Testar conexao de rede, preferencialmente via cabo." "INFO"

$InstaladorPontoTv = "C:\PainelRibas\ponto-tv\instalar-ponto-tv.bat"

if (Test-Path $InstaladorPontoTv) {
    Add-ProximoPassoKitSe $true "Rodar $InstaladorPontoTv como Administrador."
}
else {
    Add-ProximoPassoKitSe $true "Extrair pacote PainelRibas-PontoTV.zip em C:\."
    Add-ProximoPassoKitSe $true "Depois rodar C:\PainelRibas\ponto-tv\instalar-ponto-tv.bat como Administrador."
}

if ($StatusFinal["PrecisaReiniciar"]) {
    Add-Log "[INFO] Reinicie ou faca logoff/login apos concluir as etapas pendentes, especialmente se Node.js ou Chrome foram instalados agora." "INFO"
}

Add-Log "========================================================"
Add-Log "PREPARACAO CONCLUIDA"
Add-Log "========================================================"

Write-Host ""
Write-Host "Relatorio gerado em:"
Write-Host $ReportPath -ForegroundColor Cyan
Write-Host ""
Write-Host "Preparacao finalizada."
Write-Host ""