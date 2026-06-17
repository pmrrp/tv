@echo off
setlocal EnableExtensions

title Painel Ribas - Instalacao Kit Painel

echo ========================================================
echo        PAINEL RIBAS - INSTALACAO KIT PAINEL
echo ========================================================
echo.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Execute este arquivo como Administrador.
    echo.
    pause
    exit /b 1
)

set "BASE=%~dp0"
set "ZIP=%BASE%PainelRibas-PontoTV.zip"
set "PREP=%BASE%preparar-windows-painel.ps1"

if not exist "%PREP%" (
    echo [ERRO] Arquivo nao encontrado:
    echo %PREP%
    echo.
    pause
    exit /b 1
)

if not exist "%ZIP%" (
    echo [ERRO] Arquivo nao encontrado:
    echo %ZIP%
    echo.
    pause
    exit /b 1
)

echo [1/4] Preparando Windows...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PREP%"
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha na preparacao do Windows.
    pause
    exit /b 1
)

echo.
echo [2/4] Extraindo pacote em C:\ ...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '%ZIP%' -DestinationPath 'C:\' -Force"
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao extrair pacote.
    pause
    exit /b 1
)

if not exist "C:\PainelRibas\ponto-tv\preparar-ponto-tv.ps1" (
    echo.
    echo [ERRO] O pacote foi extraido, mas o preparar-ponto-tv.ps1 nao foi encontrado.
    echo Esperado: C:\PainelRibas\ponto-tv\preparar-ponto-tv.ps1
    pause
    exit /b 1
)

echo.
echo [3/4] Instalando Ponto TV...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\PainelRibas\ponto-tv\preparar-ponto-tv.ps1"
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha na instalacao do Ponto TV.
    pause
    exit /b 1
)

echo.
echo [4/4] Validando Player Agent local...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest http://localhost:3579/health -UseBasicParsing | Select-Object StatusCode, StatusDescription"

echo.
echo ========================================================
echo INSTALACAO KIT PAINEL FINALIZADA
echo ========================================================
echo.
echo Reinicie o Windows para validar:
echo - Login automatico
echo - Player Agent
echo - Chrome Quiosque
echo - Painel em tela cheia
echo.

exit /b 0