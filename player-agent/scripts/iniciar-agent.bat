@echo off
setlocal

REM =========================================================
REM PAINEL RIBAS - INICIAR PLAYER AGENT LOCAL
REM =========================================================
REM Este script inicia o agente local do player.
REM Ele usa caminhos relativos, então funciona mesmo se a pasta
REM do projeto mudar de lugar.
REM =========================================================

set "SCRIPT_DIR=%~dp0"

REM A pasta do agente é um nível acima da pasta scripts/
for %%I in ("%SCRIPT_DIR%..") do set "AGENT_DIR=%%~fI"

set "AGENT_JS=%AGENT_DIR%\agent.js"
set "LOG_DIR=%AGENT_DIR%\logs"
set "BOOT_LOG=%LOG_DIR%\agent-startup.log"

REM Garante pasta de logs
if not exist "%LOG_DIR%" (
    mkdir "%LOG_DIR%"
)

echo ======================================================== >> "%BOOT_LOG%"
echo [%date% %time%] Iniciando Painel Ribas Player Agent... >> "%BOOT_LOG%"
echo Pasta do agente: %AGENT_DIR% >> "%BOOT_LOG%"

REM Evita abrir outra instância se a porta local já estiver em uso.
REM Observação: se futuramente trocar a porta 3579, ajuste aqui também.
netstat -ano | findstr /R /C:":3579 .*LISTENING" >nul 2>nul
if not errorlevel 1 (
    echo [%date% %time%] Porta 3579 ja esta em uso. Agent provavelmente ja esta rodando. >> "%BOOT_LOG%"
    exit /b 0
)

REM Verifica se o Node.js está disponível
where node >nul 2>nul
if errorlevel 1 (
    echo [%date% %time%] ERRO: Node.js nao encontrado no PATH. >> "%BOOT_LOG%"
    echo Node.js nao encontrado. Instale o Node.js ou ajuste o PATH.
    pause
    exit /b 1
)

if not exist "%AGENT_JS%" (
    echo [%date% %time%] ERRO: agent.js nao encontrado em %AGENT_JS% >> "%BOOT_LOG%"
    echo agent.js nao encontrado.
    pause
    exit /b 1
)

cd /d "%AGENT_DIR%"

echo [%date% %time%] Executando node agent.js... >> "%BOOT_LOG%"

node "%AGENT_JS%"

echo [%date% %time%] Agent finalizado. >> "%BOOT_LOG%"

endlocal