' Mavit - Criador de Atalho Windows
' Script VBScript para criar atalho nativo do Windows

On Error Resume Next

' Definir variaveis
Dim WshShell, oShellLink, strDesktop, strInstallPath, strExePath, strIconPath

' Criar objeto Windows Shell
Set WshShell = CreateObject("WScript.Shell")

' Obter pasta da area de trabalho
strDesktop = WshShell.SpecialFolders("Desktop")

' Definir caminhos
strInstallPath = WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Mavit"
strExePath = strInstallPath & "\Mavit.exe"
strIconPath = strInstallPath & "\resources\assets\icon.ico"

' Verificar se o executavel existe
Dim fso
Set fso = CreateObject("Scripting.FileSystemObject")
If Not fso.FileExists(strExePath) Then
    WScript.Echo "ERRO: Mavit.exe nao encontrado em " & strExePath
    WScript.Quit 1
End If

' Criar atalho na area de trabalho
Set oShellLink = WshShell.CreateShortcut(strDesktop & "\Mavit.lnk")

' Configurar propriedades do atalho
oShellLink.TargetPath = strExePath
oShellLink.WorkingDirectory = strInstallPath  
oShellLink.Description = "Mavit - Kanban Board Application"
oShellLink.WindowStyle = 1

' Definir icone se existir
If fso.FileExists(strIconPath) Then
    oShellLink.IconLocation = strIconPath & ",0"
ElseIf fso.FileExists(strInstallPath & "\Mavit.exe") Then
    oShellLink.IconLocation = strInstallPath & "\Mavit.exe,0"
End If

' Salvar atalho
oShellLink.Save

' Verificar se o atalho foi criado com sucesso
If fso.FileExists(strDesktop & "\Mavit.lnk") Then
    WScript.Echo "Atalho criado com sucesso!"
Else
    WScript.Echo "ERRO: Falha ao criar atalho"
    WScript.Quit 1
End If

' Limpar objetos
Set oShellLink = Nothing
Set WshShell = Nothing
Set fso = Nothing

WScript.Quit 0