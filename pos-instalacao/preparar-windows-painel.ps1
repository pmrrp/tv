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
    "*Xbox*",
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
        New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\PushNotifications" -Force | Out-Null
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\PushNotifications" -Name "ToastEnabled" -Type DWord -Value 0
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
        return
    }

    Add-Log "Preparando login automatico do Windows para o usuario $ExpectedUser..."

    if ($UsuarioAtual -ine $ExpectedUser) {
        Add-Log "Usuario atual nao e $ExpectedUser. Login automatico nao sera configurado automaticamente." "AVISO"
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
    }
    catch {
        Add-Log "Falha ao configurar login automatico: $($_.Exception.Message)" "ERRO"
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
}
else {
    Add-Log "Execute este script como Administrador." "ERRO"
    Add-Log "Encerrando preparacao." "ERRO"
    exit 1
}

$UsuarioAtual = $env:USERNAME
$NomePc = $env:COMPUTERNAME

Add-Log "Usuario atual: $UsuarioAtual"
Add-Log "Nome do computador: $NomePc"

if ($UsuarioAtual -ieq $ExpectedUser) {
    Add-Log "Usuario atual esta no padrao esperado: $ExpectedUser" "OK"
}
else {
    Add-Log "Usuario atual diferente do esperado. Esperado: $ExpectedUser | Atual: $UsuarioAtual" "AVISO"
    Add-Log "Recomendado executar a preparacao e o Kit logado no usuario Painel." "AVISO"
}

if ($NomePc -like "$ExpectedComputerNamePattern*") {
    Add-Log "Nome do computador segue o padrao esperado: $ExpectedComputerNamePattern*" "OK"
}
else {
    Add-Log "Nome do computador fora do padrao. Recomenda-se usar PAINEL-TV-XX." "AVISO"
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
            Get-AppxPackage -Name $PackagePattern -AllUsers -ErrorAction SilentlyContinue |
            Remove-AppxPackage -AllUsers -ErrorAction SilentlyContinue

            Get-AppxProvisionedPackage -Online |
            Where-Object { $_.DisplayName -like $PackagePattern } |
            Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue | Out-Null
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
        }
        else {
            Add-Log "Google Chrome ainda nao foi encontrado apos instalacao." "AVISO"
            Add-Log "Pode ser necessario reiniciar o Windows ou instalar manualmente." "AVISO"
        }
    }
    else {
        Add-Log "Instalacao automatica do Chrome nao executada." "AVISO"
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
    }
    catch {
        Add-Log "Node.js encontrado em $NodePath, mas nao foi possivel obter versao." "AVISO"
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
            }
            catch {
                Add-Log "Node.js encontrado apos instalacao em $NodePath, mas nao foi possivel obter versao." "AVISO"
            }
        }
        else {
            Add-Log "Node.js ainda nao foi encontrado apos instalacao." "AVISO"
            Add-Log "Pode ser necessario reiniciar/logoff para atualizar o PATH." "AVISO"
        }
    }
    else {
        Add-Log "Instalacao automatica do Node.js nao executada." "AVISO"
    }
}

# ---------------------------------------------------------
# INSTALACAO DO ANYDESK
# ---------------------------------------------------------

$AnyDeskPath = Find-AnyDesk

if ($AnyDeskPath) {
    Add-Log "AnyDesk encontrado em: $AnyDeskPath" "OK"
}
else {
    Add-Log "AnyDesk nao encontrado." "AVISO"

    if ($InstallAnyDesk -and $Winget) {
        Invoke-AcaoSegura "Instalar AnyDesk via winget ($AnyDeskWingetId)" {
            winget install --id $AnyDeskWingetId --exact --silent --accept-source-agreements --accept-package-agreements
        } | Out-Null

        Update-PathDaSessao

        $AnyDeskPath = Find-AnyDesk

        if ($AnyDeskPath) {
            Add-Log "AnyDesk encontrado apos instalacao: $AnyDeskPath" "OK"
            Add-Log "Configure manualmente o acesso nao supervisionado e registre a senha apenas no controle interno da TI." "AVISO"
        }
        else {
            Add-Log "AnyDesk ainda nao foi encontrado apos instalacao. Pode ser necessario reiniciar ou instalar manualmente." "AVISO"
        }
    }
    else {
        Add-Log "Instalacao automatica do AnyDesk nao executada." "AVISO"
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

foreach ($Pasta in $PastasBase) {
    if (Test-Path $Pasta) {
        Add-Log "Pasta ja existe: $Pasta" "OK"
    }
    else {
        Invoke-AcaoSegura "Criar pasta: $Pasta" {
            New-Item -ItemType Directory -Path $Pasta -Force | Out-Null
        } | Out-Null
    }
}

# ---------------------------------------------------------
# LOGIN AUTOMATICO
# ---------------------------------------------------------

Set-LoginAutomaticoPainel

# ---------------------------------------------------------
# RESUMO FINAL
# ---------------------------------------------------------

Add-Log ""
Add-Log "========================================================"
Add-Log "              RESUMO FINAL DA PREPARACAO"
Add-Log "========================================================"

if (Test-Administrador) {
    Add-Log "Executado como Administrador" "OK"
}
else {
    Add-Log "Executado sem Administrador" "ERRO"
}

if ($UsuarioAtual -ieq $ExpectedUser) {
    Add-Log "Usuario atual no padrao Painel" "OK"
}
else {
    Add-Log "Usuario atual diferente de Painel: $UsuarioAtual" "AVISO"
}

if ($NomePc -like "$ExpectedComputerNamePattern*") {
    Add-Log "Nome do computador no padrao PAINEL-TV" "OK"
}
else {
    Add-Log "Nome do computador fora do padrao PAINEL-TV" "AVISO"
}

if (Find-Chrome) {
    Add-Log "Google Chrome disponivel" "OK"
}
else {
    Add-Log "Google Chrome indisponivel" "AVISO"
}

if (Find-Node) {
    Add-Log "Node.js disponivel" "OK"
}
else {
    Add-Log "Node.js indisponivel no PATH/caminhos padrao" "AVISO"
}

if (Find-AnyDesk) {
    Add-Log "AnyDesk disponivel" "OK"
}
else {
    Add-Log "AnyDesk indisponivel" "AVISO"
}

Add-Log "Estrutura base C:\PainelRibas preparada" "OK"

Add-Log ""
Add-Log "========================================================"
Add-Log "              PROXIMOS PASSOS"
Add-Log "========================================================"
Add-Log "[MANUAL] Entrar/confirmar usuario local Painel."
Add-Log "[MANUAL] Confirmar nome PAINEL-TV-XX."
Add-Log "[MANUAL] Configurar BIOS/UEFI para ligar apos queda de energia."
Add-Log "[MANUAL] Configurar BIOS/UEFI para nao travar sem teclado/mouse."
Add-Log "[MANUAL] Instalar/configurar AnyDesk com acesso nao supervisionado."
Add-Log "[MANUAL] Configurar login automatico do Windows."
Add-Log "[KIT] Extrair pacote PainelRibas-PontoTV.zip em C:\."
Add-Log "[KIT] Rodar C:\PainelRibas\ponto-tv\instalar-ponto-tv.bat como Administrador."

Add-Log "========================================================"
Add-Log "PREPARACAO CONCLUIDA"
Add-Log "========================================================"

Write-Host ""
Write-Host "Relatorio gerado em:"
Write-Host $ReportPath -ForegroundColor Cyan
Write-Host ""
Write-Host "Preparacao finalizada."
Write-Host ""