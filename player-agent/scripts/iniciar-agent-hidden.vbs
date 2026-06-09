' =========================================================
' PAINEL RIBAS - INICIAR PLAYER AGENT OCULTO
' =========================================================
' Este script executa iniciar-agent.bat sem abrir janela visível.
' Usado pela tarefa agendada do Windows.
' =========================================================

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
batPath = scriptDir & "\iniciar-agent.bat"

shell.Run """" & batPath & """", 0, False