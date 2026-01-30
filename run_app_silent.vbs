' Executa run_app.bat sem exibir nenhuma janela (só o navegador aparece)
Set fso = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")
dirBat = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = dirBat
WshShell.Run "cmd /c run_app.bat", 0, False
