@echo off
REM =========================================================
REM PAINEL RIBAS - KIT PONTO TV
REM =========================================================
REM Este arquivo .BAT é o botão simples para o técnico executar.
REM Ele chama o script PowerShell preparar-ponto-tv.ps1.
REM
REM Por que usar BAT?
REM - Dá para executar com duplo clique.
REM - Evita digitar comando no PowerShell.
REM - Permite chamar o PowerShell com ExecutionPolicy Bypass só nesta execução.
REM =========================================================

REM setlocal faz as variáveis criadas aqui valerem só dentro deste BAT.
setlocal

REM %~dp0 é a pasta onde este próprio .BAT está.
REM Exemplo: C:\...\painel-prefeitura-ribas\ponto-tv\
set "SCRIPT_DIR=%~dp0"

REM Monta o caminho completo do script PowerShell.
set "PS_SCRIPT=%SCRIPT_DIR%preparar-ponto-tv.ps1"

echo.
echo ========================================================
echo        PAINEL RIBAS - KIT PONTO TV
echo ========================================================
echo.

REM Confere se o arquivo .ps1 existe antes de tentar executar.
if not exist "%PS_SCRIPT%" (
    echo ERRO: Arquivo preparar-ponto-tv.ps1 nao encontrado.
    echo Caminho esperado:
    echo %PS_SCRIPT%
    echo.
    pause
    exit /b 1
)

REM Chama o PowerShell.
REM -NoProfile evita carregar configurações pessoais do usuário.
REM -ExecutionPolicy Bypass permite rodar este script sem alterar a política global do Windows.
REM -File informa o arquivo .ps1 que será executado.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%"

echo.
echo Processo finalizado.
echo.

REM Pausa para o técnico ler o resultado antes da janela fechar.
pause

REM Encerra o escopo local das variáveis.
endlocal
