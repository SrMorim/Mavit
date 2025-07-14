@echo off
title Mavit - Instalador
cls

echo.
echo  ==================================================
echo   Mavit - Instalador Windows Ultra-Simples
echo  ==================================================
echo.
echo  [INFO] Instalando Mavit na sua maquina...
echo.

REM Definir pasta de instalacao
set "INSTALL_PATH=%LOCALAPPDATA%\Mavit"

REM Remover instalacao anterior se existir
if exist "%INSTALL_PATH%" (
    echo  [INFO] Removendo versao anterior...
    rmdir /s /q "%INSTALL_PATH%" 2>nul
)

REM Criar pasta de instalacao
echo  [INFO] Criando pasta de instalacao...
mkdir "%INSTALL_PATH%" 2>nul

REM Copiar todos os arquivos do win-unpacked
echo  [INFO] Copiando aplicativo (isso pode levar alguns segundos)...
xcopy /E /I /Q /Y "win-unpacked\*" "%INSTALL_PATH%\" >nul

REM Verificar se a copia foi bem-sucedida
if not exist "%INSTALL_PATH%\Mavit.exe" (
    echo  [ERRO] Falha na instalacao! Arquivo principal nao encontrado.
    echo  [ERRO] Verifique se a pasta 'win-unpacked' existe neste local.
    pause
    exit /b 1
)

REM Criar atalho na area de trabalho usando VBScript
echo  [INFO] Criando atalho na area de trabalho...
call CreateShortcut.vbs

REM Criar entrada no menu iniciar (opcional)
set "START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
if exist "%START_MENU%" (
    copy "%USERPROFILE%\Desktop\Mavit.lnk" "%START_MENU%\Mavit.lnk" >nul 2>&1
)

REM Criar desinstalador
echo  [INFO] Criando desinstalador...
(
echo @echo off
echo title Mavit - Desinstalador
echo cls
echo.
echo  Desinstalando Mavit...
echo.
echo  [INFO] Removendo arquivos...
echo  rmdir /s /q "%INSTALL_PATH%"
echo  [INFO] Removendo atalhos...
echo  del "%USERPROFILE%\Desktop\Mavit.lnk" 2^>nul
echo  del "%START_MENU%\Mavit.lnk" 2^>nul
echo.
echo  [SUCESSO] Mavit foi desinstalado com sucesso!
echo  pause
) > "%INSTALL_PATH%\Desinstalar.bat"

cls
echo.
echo  ==================================================
echo   Mavit - Instalacao Concluida com Sucesso!
echo  ==================================================
echo.
echo  [SUCESSO] O Mavit foi instalado em:
echo  %INSTALL_PATH%
echo.
echo  [SUCESSO] Atalho criado na area de trabalho
echo.
echo  [INFO] Para desinstalar, execute:
echo  %INSTALL_PATH%\Desinstalar.bat
echo.

REM Perguntar se deseja executar o aplicativo
echo.
set /p "EXECUTAR=Deseja executar o Mavit agora? (S/N): "
if /i "%EXECUTAR%"=="S" (
    echo.
    echo  [INFO] Iniciando Mavit...
    start "" "%INSTALL_PATH%\Mavit.exe"
    exit /b 0
)

echo.
echo  Instalacao finalizada! Pressione qualquer tecla para sair.
pause >nul