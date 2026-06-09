@echo off
setlocal

REM =========================================================
REM PAINEL RIBAS - REMOVER TAREFA DO PLAYER AGENT
REM =========================================================

set "TASK_NAME=PainelRibasPlayerAgent"

echo.
echo Removendo tarefa agendada: %TASK_NAME%
echo.

schtasks /Delete /TN "%TASK_NAME%" /F

if errorlevel 1 (
    echo.
    echo Nao foi possivel remover a tarefa ou ela nao existe.
    echo.
    pause
    exit /b 1
)

echo.
echo Tarefa removida com sucesso.
echo.
pause

endlocal