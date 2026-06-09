@echo off
setlocal

REM =========================================================
REM PAINEL RIBAS - INSTALADOR DO PONTO DE TV
REM =========================================================
REM Este script prepara o mini PC da TV para rodar o
REM Player Agent local automaticamente.
REM
REM O objetivo é reduzir a configuração manual do ponto.
REM =========================================================

set "SCRIPT_DIR=%~dp0"
set "AGENT_DIR=%SCRIPT_DIR%.."
set "TASK_NAME=PainelRibasPlayerAgent"
set "INSTALL_TASK_SCRIPT=%SCRIPT_DIR%instalar-tarefa-agent.bat"
set "AGENT_JS=%AGENT_DIR%\agent.js"
set "CONFIG_FILE=%AGENT_DIR%\config.agent.json"
set "HEALTH_URL=http://localhost:3579/health"

echo.
echo ========================================================
echo        PAINEL RIBAS - INSTALADOR DO PONTO DE TV
echo ========================================================
echo.
echo Este assistente vai preparar este computador para:
echo.
echo  - iniciar o Player Agent automaticamente;
echo  - manter cache local da playlist e das midias;
echo  - permitir fallback local do player em caso de queda de rede.
echo.
echo ========================================================
echo.

REM ---------------------------------------------------------
REM 1. Verifica Node.js
REM ---------------------------------------------------------

echo [1/5] Verificando Node.js...

where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo ERRO: Node.js nao foi encontrado no PATH.
    echo.
    echo Instale o Node.js LTS neste computador e execute este
    echo instalador novamente.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set "NODE_VERSION=%%v"

echo OK - Node.js encontrado: %NODE_VERSION%
echo.

REM ---------------------------------------------------------
REM 2. Verifica arquivos essenciais
REM ---------------------------------------------------------

echo [2/5] Verificando arquivos do Player Agent...

if not exist "%AGENT_JS%" (
    echo.
    echo ERRO: agent.js nao encontrado.
    echo Caminho esperado:
    echo %AGENT_JS%
    echo.
    pause
    exit /b 1
)

if not exist "%CONFIG_FILE%" (
    echo.
    echo ERRO: config.agent.json nao encontrado.
    echo Caminho esperado:
    echo %CONFIG_FILE%
    echo.
    pause
    exit /b 1
)

if not exist "%INSTALL_TASK_SCRIPT%" (
    echo.
    echo ERRO: instalar-tarefa-agent.bat nao encontrado.
    echo Caminho esperado:
    echo %INSTALL_TASK_SCRIPT%
    echo.
    pause
    exit /b 1
)

echo OK - Arquivos essenciais encontrados.
echo.

REM ---------------------------------------------------------
REM 3. Instala tarefa agendada do agente
REM ---------------------------------------------------------

echo [3/5] Instalando tarefa automatica do Player Agent...
echo.

call "%INSTALL_TASK_SCRIPT%"

if errorlevel 1 (
    echo.
    echo ERRO: Falha ao instalar tarefa automatica.
    echo Tente executar este instalador como Administrador.
    echo.
    pause
    exit /b 1
)

echo.
echo OK - Tarefa automatica instalada.
echo.

REM ---------------------------------------------------------
REM 4. Executa a tarefa para teste imediato
REM ---------------------------------------------------------

echo [4/5] Iniciando Player Agent para teste...

schtasks /Run /TN "%TASK_NAME%" >nul 2>nul

if errorlevel 1 (
    echo.
    echo AVISO: Nao foi possivel iniciar a tarefa automaticamente.
    echo Voce pode testar manualmente depois com:
    echo schtasks /Run /TN "%TASK_NAME%"
    echo.
) else (
    echo OK - Tarefa acionada.
)

echo Aguardando alguns segundos para o servidor local iniciar...
timeout /t 5 /nobreak >nul

echo.

REM ---------------------------------------------------------
REM 5. Abre pagina de saude do agente
REM ---------------------------------------------------------

echo [5/5] Abrindo verificacao do agente local...
echo URL: %HEALTH_URL%
echo.

start "" "%HEALTH_URL%"

echo ========================================================
echo INSTALACAO CONCLUIDA
echo ========================================================
echo.
echo Verifique se a pagina aberta mostra:
echo.
echo   "ok": true
echo   "Painel Ribas Player Agent"
echo.
echo Se aparecer, o agente local esta funcionando.
echo.
echo Em caso de reinicio do Windows, o agente deve iniciar
echo automaticamente apos o login.
echo.
echo ========================================================
echo.
pause

endlocal