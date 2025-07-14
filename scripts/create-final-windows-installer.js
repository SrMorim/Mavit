#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Criando Instalador Windows FINAL - Como o antigo MaverDash...');

const releaseDir = path.join(__dirname, '..', 'release');
const winUnpackedDir = path.join(releaseDir, 'win-unpacked');
const finalInstallerDir = path.join(releaseDir, 'Mavit-Final-Installer');

// Verificar se build Windows existe
if (!fs.existsSync(winUnpackedDir)) {
    console.error('❌ Build Windows não encontrada. Execute "npm run dist:linux" primeiro.');
    console.error('   (Será usado como base para criar versão Windows)');
    process.exit(1);
}

console.log('📋 Build encontrada, criando instalador final...');

// Limpar diretório anterior
if (fs.existsSync(finalInstallerDir)) {
    console.log('🗑️ Removendo versão anterior...');
    fs.rmSync(finalInstallerDir, { recursive: true, force: true });
}

// Criar estrutura do instalador
fs.mkdirSync(finalInstallerDir, { recursive: true });

console.log('📁 Criando estrutura do instalador...');

// Copiar todos os arquivos do win-unpacked
console.log('📋 Copiando arquivos da aplicação...');
execSync(`cp -r "${winUnpackedDir}"/* "${finalInstallerDir}"/`);

// Criar script de instalação principal
console.log('🛠️ Criando script de instalação...');

const installScript = `@echo off
title Mavit - Instalador
cls

echo.
echo  ================================================
echo   Mavit - Instalador Windows Automatico
echo  ================================================
echo.
echo  [INFO] Instalando Mavit no seu computador...
echo.

REM Definir pasta de instalacao
set "INSTALL_PATH=%LOCALAPPDATA%\\Mavit"

REM Remover instalacao anterior se existir
if exist "%INSTALL_PATH%" (
    echo  [INFO] Removendo versao anterior...
    rmdir /s /q "%INSTALL_PATH%" 2>nul
)

REM Criar pasta de instalacao
echo  [INFO] Criando pasta de instalacao...
mkdir "%INSTALL_PATH%" 2>nul

REM Copiar todos os arquivos
echo  [INFO] Copiando aplicativo (isso pode levar alguns segundos)...
xcopy /E /I /Q /Y "*" "%INSTALL_PATH%\\" >nul

REM Excluir o proprio instalador da pasta de destino
del "%INSTALL_PATH%\\INSTALADOR.bat" 2>nul
del "%INSTALL_PATH%\\README.txt" 2>nul

REM Verificar se a copia foi bem-sucedida
if not exist "%INSTALL_PATH%\\Mavit.exe" (
    echo  [ERRO] Falha na instalacao! Arquivo principal nao encontrado.
    pause
    exit /b 1
)

REM Criar atalho na area de trabalho
echo  [INFO] Criando atalho na area de trabalho...

REM Usar PowerShell para criar atalho nativo
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\\Desktop\\Mavit.lnk'); $Shortcut.TargetPath = '%INSTALL_PATH%\\Mavit.exe'; $Shortcut.WorkingDirectory = '%INSTALL_PATH%'; $Shortcut.Description = 'Mavit - Kanban Board Application'; $Shortcut.Save()"

REM Criar entrada no menu iniciar
set "START_MENU=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs"
if exist "%START_MENU%" (
    copy "%USERPROFILE%\\Desktop\\Mavit.lnk" "%START_MENU%\\Mavit.lnk" >nul 2>&1
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
echo  del "%USERPROFILE%\\Desktop\\Mavit.lnk" 2^>nul
echo  del "%START_MENU%\\Mavit.lnk" 2^>nul
echo.
echo  [SUCESSO] Mavit foi desinstalado com sucesso!
echo  pause
) > "%INSTALL_PATH%\\Desinstalar.bat"

cls
echo.
echo  ================================================
echo   Mavit - Instalacao Concluida com Sucesso!
echo  ================================================
echo.
echo  [SUCESSO] O Mavit foi instalado em:
echo  %INSTALL_PATH%
echo.
echo  [SUCESSO] Atalho criado na area de trabalho
echo.
echo  [INFO] Para desinstalar, execute:
echo  %INSTALL_PATH%\\Desinstalar.bat
echo.

REM Perguntar se deseja executar o aplicativo
echo.
set /p "EXECUTAR=Deseja executar o Mavit agora? (S/N): "
if /i "%EXECUTAR%"=="S" (
    echo.
    echo  [INFO] Iniciando Mavit...
    start "" "%INSTALL_PATH%\\Mavit.exe"
    exit /b 0
)

echo.
echo  Instalacao finalizada! Pressione qualquer tecla para sair.
pause >nul`;

fs.writeFileSync(path.join(finalInstallerDir, 'INSTALADOR.bat'), installScript);

// Criar README detalhado
const readme = `# Mavit - Instalador Windows Final

## Como Instalar (MUITO SIMPLES):

1. Extrair todos os arquivos desta pasta em qualquer lugar
2. Executar "INSTALADOR.bat" (duplo clique)
3. Seguir as instrucoes na tela
4. PRONTO! Atalho criado na area de trabalho

## O que acontece durante a instalacao:

✓ Copia todos os arquivos para %LOCALAPPDATA%\\Mavit
✓ Cria atalho "Mavit" na area de trabalho
✓ Cria entrada no menu iniciar
✓ Cria desinstalador automatico
✓ Opcao de executar imediatamente

## Requisitos:
- Windows 10/11
- Aproximadamente 300MB de espaco livre

## Desinstalacao:
- Execute: %LOCALAPPDATA%\\Mavit\\Desinstalar.bat
- OU va em Painel de Controle > Programas (se disponivel)

## Sobre o Mavit:
Aplicativo de quadro Kanban customizavel para gerenciamento 
de tarefas e projetos.

Desenvolvido pela Maver Team
Versao: 1.0.0

---
Instalador criado automaticamente
Funciona exatamente como o antigo MaverDash`;

fs.writeFileSync(path.join(finalInstallerDir, 'README.txt'), readme);

// Criar versao ZIP para distribuicao
console.log('📦 Criando arquivo ZIP para distribuicao...');

const zipPath = path.join(releaseDir, 'Mavit-1.0.0-Final-Installer.zip');
if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
}

try {
    execSync(`cd "${releaseDir}" && zip -r "Mavit-1.0.0-Final-Installer.zip" "Mavit-Final-Installer"`);
    
    console.log('✅ Instalador Windows FINAL criado com sucesso!');
    console.log(`📁 Localização: ${zipPath}`);
    console.log(`📂 Pasta: ${finalInstallerDir}`);
    
    // Mostrar estatisticas
    const stats = fs.statSync(zipPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
    
    console.log(`📊 Tamanho: ${sizeMB}MB`);
    
} catch (error) {
    console.error('❌ Erro ao criar ZIP:', error.message);
    console.log('⚠️ Arquivos criados na pasta, mas ZIP falhou');
}

console.log('\\n🎉 Instalador FINAL criado!');
console.log('\\n📋 Como funciona:');
console.log('1. Usuario baixa Mavit-1.0.0-Final-Installer.zip');
console.log('2. Extrai em qualquer pasta');
console.log('3. Executa "INSTALADOR.bat"');
console.log('4. Mavit fica instalado e pronto para uso!');
console.log('\\n✨ Funciona EXATAMENTE como o antigo MaverDash!');