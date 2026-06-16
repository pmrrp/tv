@echo off
setlocal

REM =========================================================
REM PAINEL RIBAS - PREPARACAO DO WINDOWS PARA PONTO TV
REM =========================================================

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%preparar-windows-painel.ps1"

echo.
echo ========================================================
echo    PAINEL RIBAS - PREPARACAO DO WINDOWS PARA PONTO TV
echo ========================================================
echo.

if not exist "%PS_SCRIPT%" (
    echo ERRO: preparar-windows-painel.ps1 nao encontrado.
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