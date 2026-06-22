# =========================================================
# PAINEL RIBAS - GERADOR DO PACOTE PONTO TV
# =========================================================
# Este script monta um ZIP pronto para implantação em PCs/mini PCs das TVs.
#
# Ele cria uma estrutura padronizada:
#
# PainelRibas/
#   player-agent/
#   ponto-tv/
#
# E ajusta os configs do pacote para produção, sem alterar os arquivos
# originais do projeto local.
# =========================================================

$ErrorActionPreference = "Stop"

# ---------------------------------------------------------
# CAMINHOS BASE
# ---------------------------------------------------------

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$PlayerAgentOrigem = Join-Path $RootDir "player-agent"
$PontoTvOrigem = Join-Path $RootDir "ponto-tv"
$AssetsOrigem = Join-Path $RootDir "assets"

$DistDir = Join-Path $RootDir "dist"
$StageDir = Join-Path $DistDir "PainelRibas"
$ZipPath = Join-Path $DistDir "PainelRibas-PontoTV.zip"

$ServerProducao = "https://painelribas.com.br"
$PlayerUrlProducao = "https://painelribas.com.br/"

function Save-JsonUtf8SemBom {
    param(
        [Parameter(Mandatory = $true)]$Objeto,
        [Parameter(Mandatory = $true)][string]$Caminho,
        [int]$Depth = 20
    )

    $Json = $Objeto | ConvertTo-Json -Depth $Depth
    $Utf8SemBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Caminho, $Json, $Utf8SemBom)
}


Write-Host ""
Write-Host "========================================================"
Write-Host "       PAINEL RIBAS - GERADOR DO PACOTE PONTO TV"
Write-Host "========================================================"
Write-Host ""

# ---------------------------------------------------------
# VALIDAÇÕES
# ---------------------------------------------------------

if (!(Test-Path $PlayerAgentOrigem)) {
    Write-Host "ERRO: pasta player-agent nao encontrada em:" -ForegroundColor Red
    Write-Host $PlayerAgentOrigem
    exit 1
}

if (!(Test-Path $PontoTvOrigem)) {
    Write-Host "ERRO: pasta ponto-tv nao encontrada em:" -ForegroundColor Red
    Write-Host $PontoTvOrigem
    exit 1
}

# ---------------------------------------------------------
# LIMPA DIST/STAGE
# ---------------------------------------------------------

if (Test-Path $StageDir) {
    Remove-Item $StageDir -Recurse -Force
}

if (!(Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir | Out-Null
}

New-Item -ItemType Directory -Path $StageDir | Out-Null

# ---------------------------------------------------------
# COPIA PASTAS PARA ESTRUTURA FINAL
# ---------------------------------------------------------

Write-Host "[INFO] Copiando player-agent..."
Copy-Item $PlayerAgentOrigem -Destination (Join-Path $StageDir "player-agent") -Recurse -Force

Write-Host "[INFO] Copiando ponto-tv..."
Copy-Item $PontoTvOrigem -Destination (Join-Path $StageDir "ponto-tv") -Recurse -Force

if (Test-Path $AssetsOrigem) {
    Write-Host "[INFO] Copiando assets essenciais do ponto TV..."

    $AssetsDestino = Join-Path $StageDir "assets"

    New-Item -ItemType Directory -Path $AssetsDestino -Force | Out-Null

    $AssetsEssenciais = @(
        "wallpaper.jpg",
        "brasao.jpg",
        "favicon.svg",
        "logo-prefeitura.svg",
        "watermark-prefeitura.svg"
    )

    foreach ($Asset in $AssetsEssenciais) {
        $OrigemAsset = Join-Path $AssetsOrigem $Asset
        $DestinoAsset = Join-Path $AssetsDestino $Asset

        if (Test-Path $OrigemAsset) {
            Copy-Item $OrigemAsset -Destination $DestinoAsset -Force
            Write-Host "[OK] Asset copiado: assets\$Asset"
        }
        else {
            Write-Host "[AVISO] Asset essencial nao encontrado: assets\$Asset" -ForegroundColor Yellow
        }
    }

    $FontsOrigem = Join-Path $AssetsOrigem "fonts"

    if (Test-Path $FontsOrigem) {
        Write-Host "[INFO] Copiando fontes essenciais..."
        Copy-Item $FontsOrigem -Destination (Join-Path $AssetsDestino "fonts") -Recurse -Force
    }
}
else {
    Write-Host "[AVISO] Pasta assets nao encontrada. Assets institucionais nao irao no pacote." -ForegroundColor Yellow
}

# ---------------------------------------------------------
# REMOVE COISAS LOCAIS QUE NAO DEVEM IR NO PACOTE
# ---------------------------------------------------------

$ItensParaRemover = @(
    "player-agent\cache",
    "player-agent\logs",
    "player-agent\node_modules",
    "ponto-tv\relatorios"
)

foreach ($Item in $ItensParaRemover) {
    $Caminho = Join-Path $StageDir $Item

    if (Test-Path $Caminho) {
        Write-Host "[INFO] Removendo item local do pacote: $Item"
        Remove-Item $Caminho -Recurse -Force
    }
}

# Recria pasta de relatorios vazia
$RelatoriosDir = Join-Path $StageDir "ponto-tv\relatorios"
New-Item -ItemType Directory -Path $RelatoriosDir -Force | Out-Null

# ---------------------------------------------------------
# AJUSTA config.agent.json PARA PRODUCAO
# ---------------------------------------------------------

$AgentConfigPath = Join-Path $StageDir "player-agent\config.agent.json"

if (Test-Path $AgentConfigPath) {
    Write-Host "[INFO] Ajustando config.agent.json para producao..."

    $AgentConfig = Get-Content $AgentConfigPath -Raw | ConvertFrom-Json
    $AgentConfig.serverBaseUrl = $ServerProducao

    Save-JsonUtf8SemBom -Objeto $AgentConfig -Caminho $AgentConfigPath -Depth 20
}
else {
    Write-Host "[AVISO] config.agent.json nao encontrado no pacote." -ForegroundColor Yellow
}

# ---------------------------------------------------------
# AJUSTA config-ponto-tv.json PARA PRODUCAO
# ---------------------------------------------------------

$PontoConfigPath = Join-Path $StageDir "ponto-tv\config-ponto-tv.json"

if (Test-Path $PontoConfigPath) {
    Write-Host "[INFO] Ajustando config-ponto-tv.json para producao..."

    $PontoConfig = Get-Content $PontoConfigPath -Raw | ConvertFrom-Json

    $PontoConfig.dryRun = $false
    $PontoConfig.playerUrl = $PlayerUrlProducao
    $PontoConfig.localAgentHealthUrl = "http://localhost:3579/health"

    # Em pacote de implantacao real, queremos que o Kit tente preparar o ponto.
    $PontoConfig.enableAgentSetup = $true
    $PontoConfig.enablePowerTweaks = $true
    $PontoConfig.enableKioskTask = $true
    $PontoConfig.enableCleanup = $false
    $PontoConfig.enableAnyDeskCheck = $true

    # Node assistido fica ligado no pacote final.
    # Se winget nao existir, o Kit vai avisar e orientar instalacao manual.
    $PontoConfig.enableNodeInstall = $true

    if ($PontoConfig.agent) {
        $PontoConfig.agent.expectedServerBaseUrl = $ServerProducao
    }

    Save-JsonUtf8SemBom -Objeto $PontoConfig -Caminho $PontoConfigPath -Depth 30
}
else {
    Write-Host "[AVISO] config-ponto-tv.json nao encontrado no pacote." -ForegroundColor Yellow
}

# ---------------------------------------------------------
# CRIA LEIA-ME DO PACOTE
# ---------------------------------------------------------

$LeiaMePath = Join-Path $StageDir "LEIA-ME-INSTALACAO.txt"

@"
PAINEL RIBAS - PACOTE PONTO TV

ESTRUTURA ESPERADA APOS EXTRAIR:

C:\PainelRibas\player-agent
C:\PainelRibas\ponto-tv

COMO INSTALAR:

1. Extraia a pasta PainelRibas deste ZIP diretamente em C:\

O resultado deve ficar assim:

C:\PainelRibas\player-agent
C:\PainelRibas\ponto-tv

2. Execute como Administrador:

C:\PainelRibas\ponto-tv\instalar-ponto-tv.bat

3. Ao final, confira o RESUMO FINAL DO PONTO TV.

4. Pendencias manuais ainda devem ser feitas pelo tecnico:

- configurar BIOS para ligar apos queda de energia;
- configurar BIOS para nao travar sem teclado/mouse;
- configurar login automatico do Windows;
- configurar AnyDesk com acesso nao supervisionado;
- testar HDMI, audio e resolucao na TV real;
- testar queda e retorno de energia;
- testar funcionamento prolongado.

OBSERVACAO:

Este pacote ja ajusta o Player Agent para usar:

$ServerProducao

"@ | Out-File -FilePath $LeiaMePath -Encoding UTF8

# ---------------------------------------------------------
# GERA ZIP FINAL
# ---------------------------------------------------------

if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

Write-Host "[INFO] Gerando ZIP final..."
Compress-Archive -Path $StageDir -DestinationPath $ZipPath -Force

Write-Host ""
Write-Host "========================================================"
Write-Host "PACOTE GERADO COM SUCESSO" -ForegroundColor Green
Write-Host "========================================================"
Write-Host $ZipPath -ForegroundColor Cyan
Write-Host ""
Write-Host "Ao extrair em C:\, o resultado deve ser:"
Write-Host "C:\PainelRibas\player-agent"
Write-Host "C:\PainelRibas\ponto-tv"
Write-Host ""