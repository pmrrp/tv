@echo off
setlocal

REM =========================================================
REM PAINEL RIBAS - GERADOR DO PACOTE PONTO TV
REM =========================================================

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%gerar-pacote-ponto-tv.ps1"

echo.
echo ========================================================
echo        PAINEL RIBAS - GERADOR DO PACOTE PONTO TV
echo ========================================================
echo.

if not exist "%PS_SCRIPT%" (
    echo ERRO: gerar-pacote-ponto-tv.ps1 nao encontrado.
    echo Caminho esperado:
    echo %PS_SCRIPT%
    echo.
    pause
    exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%"

echo.
echo Processo finalizado.
echo.
pause

endlocal