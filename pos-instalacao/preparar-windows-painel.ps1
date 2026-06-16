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
# - instalar Chrome e Node.js via winget;
# - preparar estrutura base C:\PainelRibas;
# - gerar relatorio da preparacao.
#
# IMPORTANTE:
# - Execute como Administrador.
# - Nao configura BIOS.
# - Nao configura login automatico.
# - Nao configura AnyDesk nao supervisionado.
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

$ChromeWingetId = "Google.Chrome"
$NodeWingetId = "OpenJS.NodeJS.LTS"

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
    "*GetHelp*",
    "*Getstarted*",
    "*MicrosoftOfficeHub*",
    "*MicrosoftStickyNotes*",
    "*MicrosoftTodos*",
    "*PowerAutomateDesktop*",
    "*WindowsFeedbackHub*",
    "*ZuneMusic*",
    "*ZuneVideo*",
    "*LinkedIn*"
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

    Add-Log "Ajustes de privacidade/sugestoes finalizados." "OK"
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

$NodeCmd = Get-Comando "node.exe"

if ($NodeCmd) {
    try {
        $NodeVersion = & node -v
        Add-Log "Node.js encontrado: $NodeVersion em $($NodeCmd.Source)" "OK"
    }
    catch {
        Add-Log "Node.js encontrado, mas nao foi possivel obter versao." "AVISO"
    }
}
else {
    Add-Log "Node.js nao encontrado no PATH." "AVISO"

    if ($InstallNode -and $Winget) {
        Invoke-AcaoSegura "Instalar Node.js LTS via winget ($NodeWingetId)" {
            winget install --id $NodeWingetId --exact --silent --accept-source-agreements --accept-package-agreements
        } | Out-Null

        $NodeCmd = Get-Comando "node.exe"

        if ($NodeCmd) {
            try {
                $NodeVersion = & node -v
                Add-Log "Node.js encontrado apos instalacao: $NodeVersion em $($NodeCmd.Source)" "OK"
            }
            catch {
                Add-Log "Node.js encontrado apos instalacao, mas nao foi possivel obter versao." "AVISO"
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

if (Get-Comando "node.exe") {
    Add-Log "Node.js disponivel" "OK"
}
else {
    Add-Log "Node.js indisponivel no PATH atual" "AVISO"
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