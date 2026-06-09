@echo off
setlocal

REM =========================================================
REM PAINEL RIBAS - INSTALAR TAREFA DO PLAYER AGENT
REM =========================================================
REM Cria uma tarefa agendada para iniciar o agente local
REM automaticamente no logon do Windows.
REM =========================================================

set "SCRIPT_DIR=%~dp0"
set "TASK_NAME=PainelRibasPlayerAgent"
set "VBS_FILE=%SCRIPT_DIR%iniciar-agent-hidden.vbs"

echo.
echo ========================================================
echo Instalando tarefa agendada: %TASK_NAME%
echo ========================================================
echo.

if not exist "%VBS_FILE%" (
    echo ERRO: Arquivo nao encontrado:
    echo %VBS_FILE%
    pause
    exit /b 1
)

REM Cria tarefa no logon do usuário atual.
REM /DELAY 0000:10 espera 10 segundos depois do login.
schtasks /Create /TN "%TASK_NAME%" /TR "wscript.exe ""%VBS_FILE%""" /SC ONLOGON /DELAY 0000:10 /F

if errorlevel 1 (
    echo.
    echo ERRO ao criar a tarefa.
    echo Tente executar este arquivo como Administrador.
    echo.
    pause
    exit /b 1
)

echo.
echo Tarefa criada com sucesso.
echo.
echo Para testar agora, execute:
echo schtasks /Run /TN "%TASK_NAME%"
echo.
pause

endlocal