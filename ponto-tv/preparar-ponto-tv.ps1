# =========================================================
# PAINEL RIBAS - PREPARADOR DO PONTO TV
# =========================================================
# Primeira versão: diagnóstico/simulação.
#
# Objetivo deste script:
# - validar ambiente do Windows;
# - localizar Node.js, Chrome e AnyDesk;
# - conferir tarefas agendadas;
# - testar o Player Agent em http://localhost:3579/health;
# - gerar relatório local;
# - NÃO alterar nada perigoso por padrão.
# =========================================================

# Continue: se um diagnóstico não-crítico falhar, o script continua.
$ErrorActionPreference = "Continue"

# ---------------------------------------------------------
# CAMINHOS BASE
# ---------------------------------------------------------

# Descobre a pasta onde este .ps1 está.
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Caminho do JSON de configuração real.
$ConfigPath = Join-Path $ScriptDir "config-ponto-tv.json"

# Sem config, o script não sabe o que verificar.
if (!(Test-Path $ConfigPath)) {
    Write-Host "ERRO: config-ponto-tv.json nao encontrado em:" -ForegroundColor Red
    Write-Host $ConfigPath
    exit 1
}

# ---------------------------------------------------------
# CARREGA CONFIGURAÇÃO
# ---------------------------------------------------------

try {
    # -Raw lê o arquivo inteiro como uma string.
    # ConvertFrom-Json transforma o texto JSON em objeto PowerShell.
    $Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
}
catch {
    Write-Host "ERRO: Nao foi possivel ler config-ponto-tv.json." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Define pasta dos relatórios. Se não houver no JSON, usa "relatorios".
$ReportFolderName = if ($Config.reportFolder) { $Config.reportFolder } else { "relatorios" }
$ReportFolder = Join-Path $ScriptDir $ReportFolderName

# Cria pasta de relatórios, se ainda não existir.
if (!(Test-Path $ReportFolder)) {
    New-Item -ItemType Directory -Path $ReportFolder | Out-Null
}

# Nome único do relatório com data/hora.
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ReportPath = Join-Path $ReportFolder "relatorio-ponto-tv-$Timestamp.txt"

# Lista em memória para guardar tudo que aparecerá no relatório.
$Resultados = New-Object System.Collections.Generic.List[string]

# ---------------------------------------------------------
# FUNÇÃO DE LOG
# ---------------------------------------------------------

function Add-Log {
    param(
        [string]$Mensagem,
        [string]$Nivel = "INFO"
    )

    # Monta linha padronizada.
    $Linha = "[{0}] [{1}] {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Nivel, $Mensagem

    # Guarda no relatório.
    $Resultados.Add($Linha) | Out-Null

    # Mostra colorido na tela.
    switch ($Nivel) {
        "OK" { Write-Host $Linha -ForegroundColor Green }
        "AVISO" { Write-Host $Linha -ForegroundColor Yellow }
        "ERRO" { Write-Host $Linha -ForegroundColor Red }
        default { Write-Host $Linha }
    }
}

# ---------------------------------------------------------
# VERIFICA SE ESTÁ COMO ADMINISTRADOR
# ---------------------------------------------------------

function Test-Administrador {
    $Identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $Principal = New-Object Security.Principal.WindowsPrincipal($Identity)
    return $Principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# ---------------------------------------------------------
# PROCURA COMANDO NO PATH
# ---------------------------------------------------------

function Get-Comando {
    param([string]$Nome)

    try {
        return Get-Command $Nome -ErrorAction SilentlyContinue
    }
    catch {
        return $null
    }
}

# ---------------------------------------------------------
# TESTA NODE.JS
# ---------------------------------------------------------

function Test-NodeJs {
    $NodeCmd = Get-Comando "node.exe"

    if ($NodeCmd) {
        try {
            $NodeVersion = node -v

            return @{
                Encontrado = $true
                Caminho    = $NodeCmd.Source
                Versao     = $NodeVersion
            }
        }
        catch {
            return @{
                Encontrado = $true
                Caminho    = $NodeCmd.Source
                Versao     = "Versao nao identificada"
            }
        }
    }

    return @{
        Encontrado = $false
        Caminho    = $null
        Versao     = $null
    }
}

# ---------------------------------------------------------
# NODE.JS — INSTALAÇÃO ASSISTIDA
# ---------------------------------------------------------

function Install-NodeJsAssistido {
    Add-Log "Preparando verificacao/instalacao assistida do Node.js..."

    $NodeInfo = Test-NodeJs

    if ($NodeInfo.Encontrado) {
        Add-Log "Node.js encontrado: $($NodeInfo.Versao) em $($NodeInfo.Caminho)" "OK"
        return $true
    }

    Add-Log "Node.js nao encontrado no PATH." "AVISO"

    if ($Config.enableNodeInstall -ne $true) {
        Add-Log "Instalacao automatica do Node.js esta desativada por configuracao." "AVISO"
        Add-Log "Para instalar manualmente: baixe o Node.js LTS ou use winget install OpenJS.NodeJS.LTS." "AVISO"
        return $false
    }

    $ExecutandoComoAdmin = Test-Administrador

    if ($ExecutandoComoAdmin -ne $true -and $Config.dryRun -ne $true) {
        Add-Log "Instalacao do Node.js exige Administrador quando dryRun=false. Execute o kit como Administrador." "ERRO"
        return $false
    }

    $NodeConfig = $Config.node

    if ($null -eq $NodeConfig) {
        Add-Log "Bloco 'node' nao encontrado no config-ponto-tv.json. Usando configuracao padrao de winget." "AVISO"

        $NodeConfig = [PSCustomObject]@{
            installMethod   = "winget"
            wingetPackageId = "OpenJS.NodeJS.LTS"
        }
    }

    $InstallMethod = if ($NodeConfig.installMethod) { [string]$NodeConfig.installMethod } else { "winget" }
    $WingetPackageId = if ($NodeConfig.wingetPackageId) { [string]$NodeConfig.wingetPackageId } else { "OpenJS.NodeJS.LTS" }

    if ($InstallMethod -ne "winget") {
        Add-Log "Metodo de instalacao do Node.js nao suportado nesta versao: $InstallMethod" "ERRO"
        return $false
    }

    $WingetCmd = Get-Comando "winget.exe"

    if (!$WingetCmd) {
        Add-Log "winget nao encontrado neste Windows." "ERRO"
        Add-Log "Instale o Node.js LTS manualmente e rode o Kit novamente." "AVISO"
        return $false
    }

    Add-Log "winget encontrado em: $($WingetCmd.Source)" "OK"
    Add-Log "Pacote Node.js configurado: $WingetPackageId"

    Invoke-AcaoSegura "Instalar Node.js LTS via winget ($WingetPackageId)" {
        winget install `
            --id $WingetPackageId `
            --exact `
            --accept-source-agreements `
            --accept-package-agreements `
            --silent
    }

    if ($Config.dryRun -eq $true) {
        Add-Log "[DRY-RUN] Apos instalar Node.js, seria necessario reabrir o terminal ou reiniciar o instalador." "AVISO"
        return $false
    }

    Add-Log "Verificando Node.js apos tentativa de instalacao..."

    $NodeInfoDepois = Test-NodeJs

    if ($NodeInfoDepois.Encontrado) {
        Add-Log "Node.js encontrado apos instalacao: $($NodeInfoDepois.Versao) em $($NodeInfoDepois.Caminho)" "OK"
        return $true
    }

    Add-Log "Node.js ainda nao foi encontrado apos instalacao." "AVISO"
    Add-Log "Pode ser necessario fechar e abrir o terminal, fazer logoff ou reiniciar o Windows para atualizar o PATH." "AVISO"

    return $false
}

# ---------------------------------------------------------
# RESOLVE CAMINHOS RELATIVOS AO KIT
# ---------------------------------------------------------

function Resolve-CaminhoKit {
    param(
        [string]$CaminhoRelativo
    )

    if ([string]::IsNullOrWhiteSpace($CaminhoRelativo)) {
        return $null
    }

    if ([System.IO.Path]::IsPathRooted($CaminhoRelativo)) {
        return $CaminhoRelativo
    }

    return [System.IO.Path]::GetFullPath((Join-Path $ScriptDir $CaminhoRelativo))
}

# ---------------------------------------------------------
# TESTA URL JSON
# ---------------------------------------------------------

function Test-HttpJson {
    param(
        [string]$Url,
        [int]$TimeoutSec = 3
    )

    try {
        $Resposta = Invoke-RestMethod -Uri $Url -TimeoutSec $TimeoutSec
        return @{ Ok = $true; Dados = $Resposta; Erro = $null }
    }
    catch {
        return @{ Ok = $false; Dados = $null; Erro = $_.Exception.Message }
    }
}

# ---------------------------------------------------------
# PROCURA TAREFA AGENDADA
# ---------------------------------------------------------

function Test-TarefaAgendada {
    param([string]$NomeTarefa)

    try {
        return Get-ScheduledTask -TaskName $NomeTarefa -ErrorAction SilentlyContinue
    }
    catch {
        return $null
    }
}

# ---------------------------------------------------------
# LOCALIZA CHROME
# ---------------------------------------------------------

function Find-Chrome {
    $Possiveis = @(
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
    )

    foreach ($Caminho in $Possiveis) {
        if ($Caminho -and (Test-Path $Caminho)) { return $Caminho }
    }

    $Cmd = Get-Comando "chrome.exe"
    if ($Cmd) { return $Cmd.Source }

    return $null
}

# ---------------------------------------------------------
# LOCALIZA ANYDESK
# ---------------------------------------------------------

# ---------------------------------------------------------
# EXECUTA OU SIMULA AÇÕES
# ---------------------------------------------------------

function Invoke-AcaoSegura {
    param(
        [string]$Descricao,
        [scriptblock]$Acao
    )

    if ($Config.dryRun -eq $true) {
        Add-Log "[DRY-RUN] $Descricao" "AVISO"
        return
    }

    try {
        Add-Log "Executando: $Descricao"
        & $Acao
        Add-Log "Concluido: $Descricao" "OK"
    }
    catch {
        Add-Log "Falha ao executar '$Descricao': $($_.Exception.Message)" "ERRO"
    }
}

# ---------------------------------------------------------
# GARANTE EXISTÊNCIA DE PASTA
# ---------------------------------------------------------

function Confirm-Pasta {
    param(
        [string]$Caminho
    )

    if ([string]::IsNullOrWhiteSpace($Caminho)) {
        return
    }

    if (Test-Path $Caminho) {
        Add-Log "Pasta ja existe: $Caminho" "OK"
        return
    }

    Invoke-AcaoSegura "Criar pasta: $Caminho" {
        New-Item -ItemType Directory -Force -Path $Caminho | Out-Null
    }
}

function Find-AnyDesk {
    # Caminhos comuns quando AnyDesk está instalado.
    $Possiveis = @(
        "$env:ProgramFiles\AnyDesk\AnyDesk.exe",
        "${env:ProgramFiles(x86)}\AnyDesk\AnyDesk.exe",
        "$env:LocalAppData\Programs\AnyDesk\AnyDesk.exe",
        "$env:LocalAppData\AnyDesk\AnyDesk.exe",
        "$env:AppData\AnyDesk\AnyDesk.exe",
        "$env:ProgramData\AnyDesk\AnyDesk.exe"
    )

    foreach ($Caminho in $Possiveis) {
        if ($Caminho -and (Test-Path $Caminho)) {
            return @{ Encontrado = $true; Caminho = $Caminho; Tipo = "Instalado" }
        }
    }

    # Tenta pelo PATH.
    $Cmd = Get-Comando "AnyDesk.exe"
    if ($Cmd) { return @{ Encontrado = $true; Caminho = $Cmd.Source; Tipo = "PATH" } }

    # Tenta pelo serviço do Windows.
    try {
        $Servico = Get-CimInstance Win32_Service -Filter "Name LIKE '%AnyDesk%' OR DisplayName LIKE '%AnyDesk%'" -ErrorAction SilentlyContinue
        if ($Servico -and $Servico.PathName) {
            $PathServico = $Servico.PathName

            if ($PathServico -match '"([^"]+\.exe)"') {
                $Exe = $Matches[1]
                if (Test-Path $Exe) { return @{ Encontrado = $true; Caminho = $Exe; Tipo = "Servico" } }
            }

            if ($PathServico -match '([A-Za-z]:\\.*?AnyDesk.*?\.exe)') {
                $Exe = $Matches[1]
                if (Test-Path $Exe) { return @{ Encontrado = $true; Caminho = $Exe; Tipo = "Servico" } }
            }
        }
    }
    catch {}

    # Tenta pelo registro de programas instalados.
    $RegistryPaths = @(
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*"
    )

    foreach ($RegPath in $RegistryPaths) {
        try {
            $Apps = Get-ItemProperty $RegPath -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like "*AnyDesk*" }
            foreach ($App in $Apps) {
                if ($App.InstallLocation) {
                    $ExePossivel = Join-Path $App.InstallLocation "AnyDesk.exe"
                    if (Test-Path $ExePossivel) { return @{ Encontrado = $true; Caminho = $ExePossivel; Tipo = "Registro" } }
                }
                if ($App.DisplayIcon) {
                    $DisplayIcon = $App.DisplayIcon -replace '"', ""
                    $DisplayIcon = $DisplayIcon -replace ",\d+$", ""
                    if (Test-Path $DisplayIcon) { return @{ Encontrado = $true; Caminho = $DisplayIcon; Tipo = "Registro" } }
                }
            }
        }
        catch {}
    }

    # Detecção de arquivo baixado/portátil em Downloads.
    $DownloadsAnyDesk = Join-Path $env:USERPROFILE "Downloads\AnyDesk.exe"
    if (Test-Path $DownloadsAnyDesk) {
        return @{ Encontrado = $true; Caminho = $DownloadsAnyDesk; Tipo = "PortatilOuInstaladorEmDownloads" }
    }

    return @{ Encontrado = $false; Caminho = $null; Tipo = "NaoEncontrado" }
}

# ---------------------------------------------------------
# VALIDA CONFIGURAÇÃO DO PLAYER AGENT
# ---------------------------------------------------------

function Test-ConfigPlayerAgent {
    Add-Log "Validando config.agent.json do Player Agent..."

    $AgentConfig = $Config.agent

    if ($null -eq $AgentConfig) {
        Add-Log "Bloco 'agent' nao encontrado no config-ponto-tv.json." "AVISO"
        return
    }

    $ConfigAgentPath = Resolve-CaminhoKit $AgentConfig.relativeConfigPath

    if (!(Test-Path $ConfigAgentPath)) {
        Add-Log "config.agent.json nao encontrado em: $ConfigAgentPath" "AVISO"
        return
    }

    try {
        $AgentJson = Get-Content $ConfigAgentPath -Raw | ConvertFrom-Json
        $ServerBaseUrl = [string]$AgentJson.serverBaseUrl
        $ExpectedUrl = [string]$AgentConfig.expectedServerBaseUrl

        Add-Log "config.agent.json encontrado em: $ConfigAgentPath" "OK"
        Add-Log "serverBaseUrl atual do Agent: $ServerBaseUrl"

        if ($ServerBaseUrl -match "localhost|127\.0\.0\.1") {
            Add-Log "O Player Agent esta apontando para localhost. Isso serve para desenvolvimento, mas nao para PC de TV em producao." "AVISO"
        }

        if (![string]::IsNullOrWhiteSpace($ExpectedUrl) -and $ServerBaseUrl -ne $ExpectedUrl) {
            Add-Log "serverBaseUrl diferente do esperado. Esperado: $ExpectedUrl" "AVISO"
        }

        if ($ServerBaseUrl -eq $ExpectedUrl) {
            Add-Log "serverBaseUrl do Agent esta correto para producao." "OK"
        }
    }
    catch {
        Add-Log "Falha ao ler config.agent.json: $($_.Exception.Message)" "AVISO"
    }
}

# ---------------------------------------------------------
# PLAYER AGENT — INSTALAÇÃO E INICIALIZAÇÃO
# ---------------------------------------------------------

function Set-PlayerAgent {
    Add-Log "Preparando Player Agent local..."

    $NodeInfo = Test-NodeJs

    if ($NodeInfo.Encontrado -ne $true) {
        Add-Log "Player Agent depende do Node.js, mas Node.js nao foi encontrado. Instalacao/inicializacao do Agent sera ignorada." "ERRO"
        return
    }

    $ExecutandoComoAdmin = Test-Administrador

    if ($ExecutandoComoAdmin -ne $true -and $Config.dryRun -ne $true) {
        Add-Log "Instalacao do Player Agent exige Administrador quando dryRun=false. Execute o kit como Administrador." "ERRO"
        return
    }

    $AgentConfig = $Config.agent

    if ($null -eq $AgentConfig) {
        Add-Log "Bloco 'agent' nao encontrado no config-ponto-tv.json. Nao sera possivel instalar o Player Agent automaticamente." "AVISO"
        return
    }

    Test-ConfigPlayerAgent

    $TaskName = if ($Config.agentTaskName) { $Config.agentTaskName } else { "PainelRibasPlayerAgent" }
    $InstallScriptPath = Resolve-CaminhoKit $AgentConfig.relativeInstallScript

    Add-Log "Nome da tarefa do Player Agent: $TaskName"
    Add-Log "Script de instalacao do Agent: $InstallScriptPath"

    $AgentTask = Test-TarefaAgendada $TaskName

    if ($AgentTask) {
        Add-Log "Tarefa do Player Agent ja existe: $TaskName" "OK"
    }
    else {
        if (!(Test-Path $InstallScriptPath)) {
            Add-Log "Script de instalacao do Player Agent nao encontrado: $InstallScriptPath" "ERRO"
            return
        }

        Invoke-AcaoSegura "Instalar tarefa agendada do Player Agent" {
            Start-Process `
                -FilePath "cmd.exe" `
                -ArgumentList "/c `"$InstallScriptPath`"" `
                -Wait `
                -WindowStyle Normal
        }
    }

    if ($AgentConfig.runTaskAfterInstall -eq $true) {
        Invoke-AcaoSegura "Iniciar tarefa agendada do Player Agent" {
            schtasks /Run /TN $TaskName | Out-Null
        }
    }

    $HealthUrl = if ($Config.localAgentHealthUrl) { $Config.localAgentHealthUrl } else { "http://localhost:3579/health" }
    $Timeout = if ($AgentConfig.healthTimeoutSeconds) { [int]$AgentConfig.healthTimeoutSeconds } else { 5 }
    $RetrySeconds = if ($AgentConfig.healthRetrySeconds) { [int]$AgentConfig.healthRetrySeconds } else { 5 }

    if ($Config.dryRun -eq $true) {
        Add-Log "[DRY-RUN] Testaria novamente o endpoint do Player Agent em: $HealthUrl" "AVISO"
        return
    }

    Add-Log "Aguardando $RetrySeconds segundo(s) para o Player Agent iniciar..."
    Start-Sleep -Seconds $RetrySeconds

    $Health = Test-HttpJson $HealthUrl $Timeout

    if ($Health.Ok) {
        Add-Log "Player Agent respondeu apos instalacao/inicializacao: $HealthUrl" "OK"

        try {
            if ($Health.Dados.nome) {
                Add-Log "Nome retornado pelo agent: $($Health.Dados.nome)"
            }
        }
        catch {
            Add-Log "Agent respondeu, mas alguns campos nao puderam ser lidos." "AVISO"
        }
    }
    else {
        Add-Log "Player Agent ainda nao respondeu apos tentativa de inicializacao. Erro: $($Health.Erro)" "AVISO"
    }

    Add-Log "Rotina do Player Agent finalizada."
}

# ---------------------------------------------------------
# CONFIGURAÇÕES DE ENERGIA DO PONTO TV
# ---------------------------------------------------------

function Set-ConfiguracoesEnergia {
    Add-Log "Preparando configuracoes de energia para ponto de TV..."

    $ExecutandoComoAdmin = Test-Administrador

    if ($ExecutandoComoAdmin -ne $true -and $Config.dryRun -ne $true) {
        Add-Log "Configuracoes de energia exigem Administrador quando dryRun=false. Execute o kit como Administrador." "ERRO"
        return
    }

    if ($ExecutandoComoAdmin -ne $true -and $Config.dryRun -eq $true) {
        Add-Log "Nao esta como Administrador, mas dryRun=true. As configuracoes de energia serao apenas simuladas." "AVISO"
    }

    $PowerConfig = $Config.power

    if ($null -eq $PowerConfig) {
        Add-Log "Bloco 'power' nao encontrado no config-ponto-tv.json. Usando valores padrao." "AVISO"

        $PowerConfig = [PSCustomObject]@{
            setHighPerformance      = $true
            disableHibernate        = $true
            acMonitorTimeoutMinutes = 0
            acStandbyTimeoutMinutes = 0
            acDiskTimeoutMinutes    = 0
        }
    }

    if ($PowerConfig.setHighPerformance -eq $true) {
        Invoke-AcaoSegura "Ativar plano de energia Alto desempenho, quando disponivel" {
            powercfg /setactive SCHEME_MIN | Out-Null
        }
    }

    if ($PowerConfig.disableHibernate -eq $true) {
        Invoke-AcaoSegura "Desativar hibernacao do Windows" {
            powercfg /hibernate off | Out-Null
        }
    }

    $MonitorTimeout = if ($null -ne $PowerConfig.acMonitorTimeoutMinutes) { [int]$PowerConfig.acMonitorTimeoutMinutes } else { 0 }
    $StandbyTimeout = if ($null -ne $PowerConfig.acStandbyTimeoutMinutes) { [int]$PowerConfig.acStandbyTimeoutMinutes } else { 0 }
    $DiskTimeout = if ($null -ne $PowerConfig.acDiskTimeoutMinutes) { [int]$PowerConfig.acDiskTimeoutMinutes } else { 0 }

    Invoke-AcaoSegura "Configurar tela para nunca desligar na energia" {
        powercfg /change monitor-timeout-ac $MonitorTimeout | Out-Null
    }

    Invoke-AcaoSegura "Configurar suspensao para nunca ocorrer na energia" {
        powercfg /change standby-timeout-ac $StandbyTimeout | Out-Null
    }

    Invoke-AcaoSegura "Configurar disco para nunca desligar na energia" {
        powercfg /change disk-timeout-ac $DiskTimeout | Out-Null
    }

    Invoke-AcaoSegura "Desativar suspensao hibrida na energia" {
        powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP HYBRIDSLEEP 0 | Out-Null
        powercfg /setactive SCHEME_CURRENT | Out-Null
    }

    Invoke-AcaoSegura "Garantir que o tempo de suspensao AC esteja zerado no esquema atual" {
        powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP STANDBYIDLE 0 | Out-Null
        powercfg /setactive SCHEME_CURRENT | Out-Null
    }

    Invoke-AcaoSegura "Garantir que o tempo de desligamento de video AC esteja zerado no esquema atual" {
        powercfg /setacvalueindex SCHEME_CURRENT SUB_VIDEO VIDEOIDLE 0 | Out-Null
        powercfg /setactive SCHEME_CURRENT | Out-Null
    }

    Add-Log "Rotina de energia finalizada."
}

# ---------------------------------------------------------
# CHROME EM MODO QUIOSQUE
# ---------------------------------------------------------

function Set-ChromeQuiosque {
    Add-Log "Preparando Chrome em modo quiosque..."

    $ExecutandoComoAdmin = Test-Administrador

    if ($ExecutandoComoAdmin -ne $true -and $Config.dryRun -ne $true) {
        Add-Log "Criacao da tarefa de quiosque exige Administrador quando dryRun=false. Execute o kit como Administrador." "ERRO"
        return
    }

    if ($ExecutandoComoAdmin -ne $true -and $Config.dryRun -eq $true) {
        Add-Log "Nao esta como Administrador, mas dryRun=true. O quiosque sera apenas simulado." "AVISO"
    }

    $ChromePath = Find-Chrome

    if (!$ChromePath) {
        Add-Log "Google Chrome nao encontrado. Nao sera possivel preparar o modo quiosque." "ERRO"
        return
    }

    $KioskConfig = $Config.kiosk

    if ($null -eq $KioskConfig) {
        Add-Log "Bloco 'kiosk' nao encontrado no config-ponto-tv.json. Usando configuracao padrao." "AVISO"

        $KioskConfig = [PSCustomObject]@{
            delaySeconds      = 20
            chromeUserDataDir = "C:\PainelRibas\chrome-profile"
            arguments         = @(
                "--kiosk",
                "--start-fullscreen",
                "--autoplay-policy=no-user-gesture-required",
                "--disable-session-crashed-bubble",
                "--disable-infobars",
                "--no-first-run",
                "--disable-features=TranslateUI"
            )
        }
    }

    $PlayerUrl = if ($Config.playerUrl) { $Config.playerUrl } else { "https://painelribas.com.br/" }
    $TaskName = if ($Config.kioskTaskName) { $Config.kioskTaskName } else { "PainelRibasChromeKiosk" }
    $DelaySeconds = if ($KioskConfig.delaySeconds) { [int]$KioskConfig.delaySeconds } else { 20 }
    $ChromeUserDataDir = if ($KioskConfig.chromeUserDataDir) { [string]$KioskConfig.chromeUserDataDir } else { "C:\PainelRibas\chrome-profile" }

    Confirm-Pasta $ChromeUserDataDir

    $ArgsLista = New-Object System.Collections.Generic.List[string]

    foreach ($Arg in $KioskConfig.arguments) {
        if (![string]::IsNullOrWhiteSpace($Arg)) {
            $ArgsLista.Add($Arg) | Out-Null
        }
    }

    $ArgsLista.Add("--user-data-dir=`"$ChromeUserDataDir`"") | Out-Null
    $ArgsLista.Add("`"$PlayerUrl`"") | Out-Null

    $ChromeArgs = $ArgsLista -join " "

    Add-Log "Chrome encontrado em: $ChromePath" "OK"
    Add-Log "URL do player para quiosque: $PlayerUrl"
    Add-Log "Perfil isolado do Chrome: $ChromeUserDataDir"
    Add-Log "Nome da tarefa de quiosque: $TaskName"
    Add-Log "Delay da tarefa: $DelaySeconds segundo(s)"
    Add-Log "Argumentos do Chrome: $ChromeArgs"

    Invoke-AcaoSegura "Criar/atualizar tarefa agendada do Chrome em modo quiosque" {
        $Action = New-ScheduledTaskAction -Execute $ChromePath -Argument $ChromeArgs

        $Trigger = New-ScheduledTaskTrigger -AtLogOn

        if ($DelaySeconds -gt 0) {
            $Trigger.Delay = "PT$($DelaySeconds)S"
        }

        $Settings = New-ScheduledTaskSettingsSet `
            -AllowStartIfOnBatteries `
            -DontStopIfGoingOnBatteries `
            -StartWhenAvailable `
            -MultipleInstances IgnoreNew

        Register-ScheduledTask `
            -TaskName $TaskName `
            -Action $Action `
            -Trigger $Trigger `
            -Settings $Settings `
            -Description "Abre o Painel Ribas automaticamente no Google Chrome em modo quiosque." `
            -Force | Out-Null
    }

    Add-Log "Rotina de Chrome quiosque finalizada."
}

# =========================================================
# INÍCIO DO DIAGNÓSTICO
# =========================================================

Add-Log "========================================================"
Add-Log "PAINEL RIBAS - DIAGNOSTICO DO PONTO TV"
Add-Log "========================================================"
Add-Log "Modo dryRun: $($Config.dryRun)"
Add-Log "ScriptDir: $ScriptDir"
Add-Log "Relatorio: $ReportPath"
Add-Log "Player URL: $($Config.playerUrl)"
Add-Log "Health Agent URL: $($Config.localAgentHealthUrl)"
Add-Log "========================================================"

# Windows
Add-Log "Iniciando diagnostico do Windows..."

if (Test-Administrador) { Add-Log "Executando com permissao de Administrador." "OK" }
else { Add-Log "Nao esta executando como Administrador. Algumas configuracoes futuras exigirao Administrador." "AVISO" }

Add-Log "Usuario atual: $env:USERNAME"
Add-Log "Dominio/Maquina do usuario: $env:USERDOMAIN"
Add-Log "Nome do computador: $env:COMPUTERNAME"

try {
    $Os = Get-CimInstance Win32_OperatingSystem
    Add-Log "Sistema operacional: $($Os.Caption)"
    Add-Log "Versao: $($Os.Version)"
    Add-Log "Arquitetura: $($Os.OSArchitecture)"
}
catch { Add-Log "Nao foi possivel obter detalhes do sistema operacional: $($_.Exception.Message)" "AVISO" }

if ($Config.computerNamePattern) {
    if ($env:COMPUTERNAME -like "$($Config.computerNamePattern)*") { Add-Log "Nome do computador segue o padrao esperado: $($Config.computerNamePattern)*" "OK" }
    else { Add-Log "Nome do computador nao segue o padrao esperado: $($Config.computerNamePattern)*" "AVISO" }
}

# Node
Add-Log "Verificando Node.js..."

$NodeDisponivel = Install-NodeJsAssistido

if ($NodeDisponivel -ne $true) {
    Add-Log "Node.js nao esta disponivel neste momento. Recursos que dependem do Player Agent podem falhar ate o Node.js ser instalado." "AVISO"
}

# Chrome
Add-Log "Verificando Google Chrome..."
$ChromePath = Find-Chrome
if ($ChromePath) { Add-Log "Google Chrome encontrado em: $ChromePath" "OK" }
else { Add-Log "Google Chrome nao encontrado." "AVISO" }

# AnyDesk
if ($Config.enableAnyDeskCheck -eq $true) {
    Add-Log "Verificando AnyDesk..."
    $AnyDeskInfo = Find-AnyDesk

    if ($AnyDeskInfo.Encontrado) {
        if ($AnyDeskInfo.Tipo -eq "PortatilOuInstaladorEmDownloads") {
            Add-Log "AnyDesk.exe encontrado em Downloads: $($AnyDeskInfo.Caminho)" "AVISO"
            Add-Log "Isso indica que ele pode estar apenas baixado/portatil, nao instalado como acesso nao supervisionado." "AVISO"
        }
        else {
            Add-Log "AnyDesk encontrado em: $($AnyDeskInfo.Caminho) [Tipo: $($AnyDeskInfo.Tipo)]" "OK"
        }
    }
    else { Add-Log "AnyDesk nao encontrado. Instalacao/configuracao pode ser feita manualmente depois." "AVISO" }
}
else { Add-Log "Verificacao do AnyDesk desativada por configuracao." }

# Tarefas
Add-Log "Verificando tarefa agendada do Player Agent..."
$AgentTaskName = if ($Config.agentTaskName) { $Config.agentTaskName } else { "PainelRibasPlayerAgent" }
$AgentTask = Test-TarefaAgendada $AgentTaskName
if ($AgentTask) { Add-Log "Tarefa do Player Agent encontrada: $AgentTaskName" "OK"; Add-Log "Estado da tarefa do agente: $($AgentTask.State)" }
else { Add-Log "Tarefa do Player Agent nao encontrada: $AgentTaskName" "AVISO" }

Add-Log "Verificando tarefa agendada do Chrome Quiosque..."
$KioskTaskName = if ($Config.kioskTaskName) { $Config.kioskTaskName } else { "PainelRibasChromeKiosk" }
$KioskTask = Test-TarefaAgendada $KioskTaskName
if ($KioskTask) { Add-Log "Tarefa do Chrome Quiosque encontrada: $KioskTaskName" "OK"; Add-Log "Estado da tarefa do quiosque: $($KioskTask.State)" }
else { Add-Log "Tarefa do Chrome Quiosque nao encontrada: $KioskTaskName" "AVISO" }

# ---------------------------------------------------------
# PLAYER AGENT — INSTALAÇÃO AUTOMÁTICA PELO KIT
# ---------------------------------------------------------

if ($Config.enableAgentSetup -eq $true) {
    Set-PlayerAgent
}
else {
    Add-Log "Instalacao/inicializacao automatica do Player Agent desativada por configuracao."
}

# Health Agent
Add-Log "Testando endpoint local do Player Agent..."
$HealthUrl = if ($Config.localAgentHealthUrl) { $Config.localAgentHealthUrl } else { "http://localhost:3579/health" }
$Health = Test-HttpJson $HealthUrl 3
if ($Health.Ok) {
    Add-Log "Player Agent respondeu em: $HealthUrl" "OK"
    try {
        if ($Health.Dados.nome) { Add-Log "Nome retornado pelo agent: $($Health.Dados.nome)" }
        if ($null -ne $Health.Dados.midias.total) { Add-Log "Total de midias em cache local: $($Health.Dados.midias.total)" }
    }
    catch { Add-Log "Agent respondeu, mas nao foi possivel ler todos os campos." "AVISO" }
}
else { Add-Log "Player Agent nao respondeu em $HealthUrl. Erro: $($Health.Erro)" "AVISO" }

# Energia diagnóstico
Add-Log "Coletando informacoes basicas de energia..."
try { Add-Log "Plano de energia ativo: $(powercfg /GETACTIVESCHEME)" }
catch { Add-Log "Nao foi possivel consultar plano de energia: $($_.Exception.Message)" "AVISO" }

if ($Config.enablePowerTweaks -eq $true) {
    Set-ConfiguracoesEnergia
}
else {
    Add-Log "Alteracoes de energia desativadas por configuracao."
}

# Quiosque diagnóstico
if ($Config.enableKioskTask -eq $true) {
    Set-ChromeQuiosque
}
else {
    Add-Log "Criacao de quiosque desativada por configuracao."
}

# Limpeza diagnóstico
if ($Config.enableCleanup -eq $true) {
    if ($Config.dryRun -eq $true) { Add-Log "enableCleanup=true, mas dryRun=true. Nenhuma limpeza sera executada." "AVISO" }
    else { Add-Log "Limpeza real ainda nao implementada nesta sprint." "AVISO" }
}
else { Add-Log "Limpeza desativada por configuracao." }

# Encerramento
Add-Log "========================================================"
Add-Log "DIAGNOSTICO CONCLUIDO"
Add-Log "========================================================"

try {
    $Resultados | Out-File -FilePath $ReportPath -Encoding UTF8
    Write-Host ""
    Write-Host "Relatorio gerado em:" -ForegroundColor Cyan
    Write-Host $ReportPath -ForegroundColor Cyan
}
catch {
    Write-Host "ERRO ao salvar relatorio: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Fim do diagnostico do Kit Ponto TV." -ForegroundColor Green
