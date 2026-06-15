@echo off
setlocal

REM =========================================================
REM PAINEL RIBAS - TESTE RAPIDO DO PONTO TV
REM =========================================================
REM Este script ajuda o tecnico a validar rapidamente:
REM - Player Agent local
REM - playlist local
REM - tarefas agendadas
REM - player remoto
REM =========================================================

set "AGENT_HEALTH=http://localhost:3579/health"
set "AGENT_PLAYLIST=http://localhost:3579/playlist.json"
set "PLAYER_URL=https://painelribas.com.br/"
set "TASK_AGENT=PainelRibasPlayerAgent"
set "TASK_KIOSK=PainelRibasChromeKiosk"

echo.
echo ========================================================
echo        PAINEL RIBAS - TESTE RAPIDO DO PONTO TV
echo ========================================================
echo.

echo [1/5] Verificando tarefa do Player Agent...
schtasks /Query /TN "%TASK_AGENT%" >nul 2>nul
if errorlevel 1 (
    echo [AVISO] Tarefa nao encontrada: %TASK_AGENT%
) else (
    echo [OK] Tarefa encontrada: %TASK_AGENT%
)

echo.
echo [2/5] Verificando tarefa do Chrome Quiosque...
schtasks /Query /TN "%TASK_KIOSK%" >nul 2>nul
if errorlevel 1 (
    echo [AVISO] Tarefa nao encontrada: %TASK_KIOSK%
) else (
    echo [OK] Tarefa encontrada: %TASK_KIOSK%
)

echo.
echo [3/5] Testando Player Agent local...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-RestMethod '%AGENT_HEALTH%' -TimeoutSec 3; Write-Host '[OK] Agent respondeu:' $r.nome } catch { Write-Host '[AVISO] Agent nao respondeu:' $_.Exception.Message }"

echo.
echo [4/5] Abrindo playlist local do Agent no navegador...
start "" "%AGENT_PLAYLIST%"

echo.
echo [5/5] Abrindo player remoto no navegador...
start "" "%PLAYER_URL%"

echo.
echo ========================================================
echo Teste rapido concluido.
echo ========================================================
echo.
pause

endlocal