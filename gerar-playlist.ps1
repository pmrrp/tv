# =========================================================
# GERADOR AUTOMÁTICO DE PLAYLIST
# - Renomeia arquivos da pasta "midia"
# - Remove acentos e caracteres problemáticos
# - Troca espaços por underscore
# - Gera playlist.json automaticamente
# =========================================================

# Pasta onde ficam os arquivos de mídia
$mediaFolder = Join-Path $PSScriptRoot "midia"

# Arquivo playlist.json que será gerado
$playlistFile = Join-Path $PSScriptRoot "playlist.json"

# Duração padrão das imagens em segundos
$imageDuration = 8

# Extensões aceitas como vídeo
$videoExtensions = @(".mp4", ".webm", ".ogg", ".mov")

# Extensões aceitas como imagem
$imageExtensions = @(".jpg", ".jpeg", ".png", ".webp", ".gif")

# ---------------------------------------------------------
# Remove acentos de uma string
# ---------------------------------------------------------
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

# ---------------------------------------------------------
# Converte nome em formato seguro
# ---------------------------------------------------------
function Convert-ToSafeFileName {
    param ([string]$baseName)

    # Remove acentos
    $safe = Remove-Accents $baseName

    # Minúsculas
    $safe = $safe.ToLower()

    # Espaços viram underscore
    $safe = $safe -replace '\s+', '_'

    # Remove caracteres estranhos
    $safe = $safe -replace '[^a-z0-9_\-]', ''

    # Remove underscores repetidos
    $safe = $safe -replace '_+', '_'

    # Remove underscores do começo/fim
    $safe = $safe.Trim('_')

    return $safe
}

# ---------------------------------------------------------
# Valida se a pasta existe
# ---------------------------------------------------------
if (-not (Test-Path $mediaFolder)) {
    Write-Host "A pasta 'midia' não foi encontrada." -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------
# Renomeia arquivos da pasta de mídia
# ---------------------------------------------------------
$files = Get-ChildItem -Path $mediaFolder -File

foreach ($file in $files) {
    $extension = $file.Extension.ToLower()
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

    $safeBaseName = Convert-ToSafeFileName $baseName
    $newName = "$safeBaseName$extension"
    $newPath = Join-Path $mediaFolder $newName

    if ($file.Name -ne $newName) {
        $counter = 1

        # Evita conflito de nomes
        while (Test-Path $newPath) {
            $newName = "${safeBaseName}_$counter$extension"
            $newPath = Join-Path $mediaFolder $newName
            $counter++
        }

        Rename-Item -Path $file.FullName -NewName $newName
        Write-Host "Renomeado: $($file.Name) -> $newName" -ForegroundColor Yellow
    }
}

# ---------------------------------------------------------
# Lê novamente os arquivos já renomeados
# ---------------------------------------------------------
$renamedFiles = Get-ChildItem -Path $mediaFolder -File | Sort-Object Name

# Lista que vai virar JSON
$playlist = @()

foreach ($file in $renamedFiles) {
    $extension = $file.Extension.ToLower()
    $relativePath = "midia/$($file.Name)"

    if ($videoExtensions -contains $extension) {
        $playlist += [PSCustomObject]@{
            tipo    = "video"
            arquivo = $relativePath
        }
    }
    elseif ($imageExtensions -contains $extension) {
        $playlist += [PSCustomObject]@{
            tipo    = "imagem"
            arquivo = $relativePath
            duracao = $imageDuration
        }
    }
}

# ---------------------------------------------------------
# Gera o playlist.json
# ---------------------------------------------------------
$playlist | ConvertTo-Json -Depth 3 | Set-Content -Path $playlistFile -Encoding UTF8

Write-Host ""
Write-Host "playlist.json gerado com sucesso!" -ForegroundColor Green
Write-Host "Total de itens: $($playlist.Count)" -ForegroundColor Cyan