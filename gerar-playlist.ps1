# =========================================================
# GERADOR AUTOMÁTICO DE PLAYLIST
# =========================================================
#
# O que este script faz:
# 1. Lê os arquivos da pasta "midia"
# 2. Renomeia os arquivos para nomes seguros
#    - remove acentos
#    - deixa tudo minúsculo
#    - troca espaços por underscore
#    - remove caracteres problemáticos
# 3. Gera automaticamente o arquivo playlist.json
#
# Objetivo:
# evitar edição manual de nomes e do JSON da playlist
# =========================================================


# =========================================================
# CONFIGURAÇÕES BÁSICAS
# =========================================================

# Pasta onde ficam os arquivos de mídia
$mediaFolder = Join-Path $PSScriptRoot "midia"

# Caminho do arquivo playlist.json que será gerado
$playlistFile = Join-Path $PSScriptRoot "playlist.json"

# Duração padrão das imagens, em segundos
$imageDuration = 8

# Extensões aceitas como vídeo
$videoExtensions = @(".mp4", ".webm", ".ogg", ".mov")

# Extensões aceitas como imagem
$imageExtensions = @(".jpg", ".jpeg", ".png", ".webp", ".gif")


# =========================================================
# FUNÇÃO: REMOVE ACENTOS
# =========================================================
#
# Exemplo:
# "Ação Social" -> "Acao Social"
# =========================================================
function Remove-Accents {
    param ([string]$text)

    $normalized = $text.Normalize([Text.NormalizationForm]::FormD)
    $stringBuilder = New-Object System.Text.StringBuilder

    foreach ($char in $normalized.ToCharArray()) {
        $unicodeCategory = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($char)
        if ($unicodeCategory -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$stringBuilder.Append($char)
        }
    }

    return $stringBuilder.ToString().Normalize([Text.NormalizationForm]::FormC)
}


# =========================================================
# FUNÇÃO: CONVERTE NOME PARA FORMATO SEGURO
# =========================================================
#
# Regras:
# - remove acentos
# - deixa minúsculo
# - troca espaços por "_"
# - remove caracteres problemáticos
# - remove underscores repetidos
#
# Exemplo:
# "Vídeo da Saúde (Final)!" -> "video_da_saude_final"
# =========================================================
function Convert-ToSafeFileName {
    param ([string]$baseName)

    # Remove acentos
    $safe = Remove-Accents $baseName

    # Converte para minúsculas
    $safe = $safe.ToLower()

    # Troca espaços por underscore
    $safe = $safe -replace '\s+', '_'

    # Remove caracteres que não sejam:
    # letras, números, underscore ou hífen
    $safe = $safe -replace '[^a-z0-9_\-]', ''

    # Remove underscores duplicados
    $safe = $safe -replace '_+', '_'

    # Remove underscore no começo e no fim
    $safe = $safe.Trim('_')

    return $safe
}


# =========================================================
# VALIDA SE A PASTA DE MÍDIA EXISTE
# =========================================================
if (-not (Test-Path $mediaFolder)) {
    Write-Host "A pasta 'midia' não foi encontrada." -ForegroundColor Red
    exit 1
}


# =========================================================
# ETAPA 1: RENOMEAR ARQUIVOS DA PASTA MIDIA
# =========================================================
#
# Esta etapa garante que os nomes fiquem seguros para:
# - navegador
# - servidor
# - JSON
# - futuras automações
# =========================================================

$files = Get-ChildItem -Path $mediaFolder -File

foreach ($file in $files) {
    $extension = $file.Extension.ToLower()
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

    # Converte o nome-base para formato seguro
    $safeBaseName = Convert-ToSafeFileName $baseName

    # Monta o novo nome com a extensão original
    $newName = "$safeBaseName$extension"
    $newPath = Join-Path $mediaFolder $newName

    # Só renomeia se realmente mudou
    if ($file.Name -ne $newName) {
        $counter = 1

        # Se já existir arquivo com o mesmo nome,
        # adiciona sufixo numérico
        while (Test-Path $newPath) {
            $newName = "${safeBaseName}_$counter$extension"
            $newPath = Join-Path $mediaFolder $newName
            $counter++
        }

        Rename-Item -Path $file.FullName -NewName $newName
        Write-Host "Renomeado: $($file.Name) -> $newName" -ForegroundColor Yellow
    }
}


# =========================================================
# ETAPA 2: LER NOVAMENTE OS ARQUIVOS JÁ RENOMEADOS
# =========================================================
#
# Agora que os arquivos estão padronizados,
# lemos novamente a pasta para gerar a playlist correta.
# =========================================================
$renamedFiles = Get-ChildItem -Path $mediaFolder -File | Sort-Object Name


# =========================================================
# ETAPA 3: MONTAR A LISTA DA PLAYLIST
# =========================================================
#
# Cada item vira um objeto do tipo:
#
# Vídeo:
# {
#   "tipo": "video",
#   "arquivo": "midia/nome.mp4"
# }
#
# Imagem:
# {
#   "tipo": "imagem",
#   "arquivo": "midia/nome.jpg",
#   "duracao": 8
# }
# =========================================================
$playlist = @()

foreach ($file in $renamedFiles) {
    $extension = $file.Extension.ToLower()

    # Caminho relativo que o frontend usa
    $relativePath = "midia/$($file.Name)"

    # Se for vídeo
    if ($videoExtensions -contains $extension) {
        $playlist += [PSCustomObject]@{
            tipo    = "video"
            arquivo = $relativePath
        }
    }

    # Se for imagem
    elseif ($imageExtensions -contains $extension) {
        $playlist += [PSCustomObject]@{
            tipo    = "imagem"
            arquivo = $relativePath
            duracao = $imageDuration
        }
    }
}


# =========================================================
# ETAPA 4: GERAR O ARQUIVO playlist.json
# =========================================================
$playlist |
    ConvertTo-Json -Depth 3 |
    Set-Content -Path $playlistFile -Encoding UTF8


# =========================================================
# LOG FINAL
# =========================================================
Write-Host ""
Write-Host "playlist.json gerado com sucesso!" -ForegroundColor Green
Write-Host "Total de itens: $($playlist.Count)" -ForegroundColor Cyan

# Encerra explicitamente para evitar processos presos
exit 0