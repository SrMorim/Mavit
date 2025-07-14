#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Criando Instalador Windows Avançado...');

const buildDir = path.join(__dirname, '..', 'dist');
const releaseDir = path.join(__dirname, '..', 'release');
const assetsDir = path.join(__dirname, '..', 'assets');

// Verificar builds
if (!fs.existsSync(buildDir)) {
    console.error('❌ Build React não encontrada. Execute "npm run build" primeiro.');
    process.exit(1);
}

// Criar estrutura
const winInstallerDir = path.join(releaseDir, 'Mavit-Windows-Installer');

console.log('📁 Criando estrutura do instalador...');

if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir, { recursive: true });
}

if (fs.existsSync(winInstallerDir)) {
    fs.rmSync(winInstallerDir, { recursive: true, force: true });
}

fs.mkdirSync(winInstallerDir, { recursive: true });

// Copiar arquivos da aplicação
console.log('📋 Copiando arquivos...');

// React build
const reactTarget = path.join(winInstallerDir, 'app', 'dist');
fs.mkdirSync(path.dirname(reactTarget), { recursive: true });
execSync(`cp -r "${buildDir}" "${reactTarget}"`);

// Electron build
const electronSource = path.join(__dirname, '..', 'dist', 'electron');
const electronTarget = path.join(winInstallerDir, 'app', 'electron');
execSync(`cp -r "${electronSource}" "${electronTarget}"`);

// Assets
const appAssetsTarget = path.join(winInstallerDir, 'app', 'assets');
fs.mkdirSync(appAssetsTarget, { recursive: true });

const iconFiles = ['icon.ico', 'icon.png', 'icon-32.png', 'icon-64.png', 'icon-128.png'];
iconFiles.forEach(iconFile => {
    const sourcePath = path.join(assetsDir, iconFile);
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, path.join(appAssetsTarget, iconFile));
    }
});

// Package.json para o app
const appPackageJson = {
    "name": "mavit",
    "version": "1.0.0",
    "description": "Mavit - Customizable Kanban Board Application",
    "main": "electron/main.js",
    "author": "Maver Team",
    "dependencies": {
        "electron": "^28.0.0"
    }
};

fs.writeFileSync(
    path.join(winInstallerDir, 'app', 'package.json'),
    JSON.stringify(appPackageJson, null, 2)
);

console.log('🛠️ Criando scripts de instalação...');

// Script de instalação principal (PowerShell)
const installScript = `# Mavit Installer
# Instalador automatico para Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       Mavit Installer v1.0        " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js esta instalado
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js não encontrado"
    }
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "📥 Baixe e instale Node.js em: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "⚠️  Após instalar Node.js, execute este instalador novamente." -ForegroundColor Yellow
    Read-Host "Pressione Enter para abrir o site do Node.js"
    Start-Process "https://nodejs.org/"
    exit 1
}

# Definir diretorio de instalacao
$installPath = "$env:LOCALAPPDATA\\Mavit"
Write-Host "📁 Diretório de instalação: $installPath" -ForegroundColor Cyan

# Criar diretorio de instalacao
Write-Host "📋 Criando diretório de instalação..." -ForegroundColor Yellow
if (Test-Path $installPath) {
    Write-Host "⚠️  Removendo instalação anterior..." -ForegroundColor Yellow
    Remove-Item -Path $installPath -Recurse -Force
}
New-Item -Path $installPath -ItemType Directory -Force | Out-Null

# Copiar arquivos
Write-Host "📦 Copiando arquivos da aplicação..." -ForegroundColor Yellow
Copy-Item -Path ".\\app\\*" -Destination $installPath -Recurse -Force

# Instalar dependencias
Write-Host "⬇️  Instalando dependências..." -ForegroundColor Yellow
Set-Location $installPath
npm install --production --silent

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências!" -ForegroundColor Red
    exit 1
}

# Criar script de execucao
$runScript = @"
@echo off
cd /d "$installPath"
set ELECTRON_DISABLE_SECURITY_WARNINGS=true
npx electron . --no-sandbox --disable-setuid-sandbox --disable-gpu
"@

$runScriptPath = "$installPath\\Mavit.bat"
$runScript | Out-File -FilePath $runScriptPath -Encoding ASCII

Write-Host "🖥️  Criando atalhos..." -ForegroundColor Yellow

# Criar atalho na area de trabalho
$WshShell = New-Object -comObject WScript.Shell
$desktopPath = [System.Environment]::GetFolderPath("Desktop")
$shortcutPath = "$desktopPath\\Mavit.lnk"

$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $runScriptPath
$Shortcut.WorkingDirectory = $installPath
$Shortcut.IconLocation = "$installPath\\assets\\icon.ico"
$Shortcut.Description = "Mavit - Kanban Board Application"
$Shortcut.Save()

Write-Host "✅ Atalho criado na área de trabalho!" -ForegroundColor Green

# Criar atalho no menu iniciar
$startMenuPath = "$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs"
$startMenuShortcut = "$startMenuPath\\Mavit.lnk"

$StartShortcut = $WshShell.CreateShortcut($startMenuShortcut)
$StartShortcut.TargetPath = $runScriptPath
$StartShortcut.WorkingDirectory = $installPath
$StartShortcut.IconLocation = "$installPath\\assets\\icon.ico"
$StartShortcut.Description = "Mavit - Kanban Board Application"
$StartShortcut.Save()

Write-Host "✅ Atalho criado no menu iniciar!" -ForegroundColor Green

# Criar entrada no registro para desinstalacao
Write-Host "📝 Registrando no sistema..." -ForegroundColor Yellow

$uninstallScript = @"
@echo off
echo Desinstalando Mavit...
rmdir /s /q "$installPath"
del "$desktopPath\\Mavit.lnk" 2>nul
del "$startMenuShortcut" 2>nul
reg delete "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Mavit" /f 2>nul
echo Mavit desinstalado com sucesso!
pause
"@

$uninstallPath = "$installPath\\Uninstall.bat"
$uninstallScript | Out-File -FilePath $uninstallPath -Encoding ASCII

# Registro no Windows
try {
    $regPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Mavit"
    New-Item -Path $regPath -Force | Out-Null
    Set-ItemProperty -Path $regPath -Name "DisplayName" -Value "Mavit"
    Set-ItemProperty -Path $regPath -Name "DisplayVersion" -Value "1.0.0"
    Set-ItemProperty -Path $regPath -Name "Publisher" -Value "Maver Team"
    Set-ItemProperty -Path $regPath -Name "InstallLocation" -Value $installPath
    Set-ItemProperty -Path $regPath -Name "UninstallString" -Value $uninstallPath
    Set-ItemProperty -Path $regPath -Name "DisplayIcon" -Value "$installPath\\assets\\icon.ico"
    
    Write-Host "✅ Registrado no Painel de Controle!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Aviso: Não foi possível registrar no Painel de Controle" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Instalação concluída com sucesso!" -ForegroundColor Green
Write-Host "📌 Atalhos criados na área de trabalho e menu iniciar" -ForegroundColor Green
Write-Host "🗑️  Para desinstalar: Execute '$uninstallPath'" -ForegroundColor Cyan
Write-Host ""

# Perguntar se quer executar
$response = Read-Host "Deseja executar o Mavit agora? (S/N)"
if ($response -eq "S" -or $response -eq "s") {
    Write-Host "🚀 Iniciando Mavit..." -ForegroundColor Green
    Start-Process -FilePath $runScriptPath -WorkingDirectory $installPath
}

Write-Host "Instalação finalizada! Pressione Enter para sair..." -ForegroundColor Cyan
Read-Host`;

fs.writeFileSync(path.join(winInstallerDir, 'Install.ps1'), installScript);

// Script de instalação simples (Batch)
const batchInstaller = `@echo off
echo ========================================
echo        Mavit Installer v1.0        
echo ========================================
echo.

echo 🚀 Iniciando instalação do Mavit...
echo.

REM Verificar PowerShell
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PowerShell não encontrado!
    echo Este instalador requer PowerShell.
    pause
    exit /b 1
)

echo 📋 Executando instalador PowerShell...
powershell -ExecutionPolicy Bypass -File "%~dp0Install.ps1"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro durante a instalação!
    pause
    exit /b 1
)

echo.
echo ✅ Instalação concluída!
pause`;

fs.writeFileSync(path.join(winInstallerDir, 'INSTALAR.bat'), batchInstaller);

// README detalhado
const readme = `# Mavit - Instalador Windows

## 🚀 Instalação Automática

### Método 1: Executar INSTALAR.bat (Recomendado)
1. Clique duplo em "INSTALAR.bat"
2. Siga as instruções na tela
3. O instalador criará atalhos automaticamente

### Método 2: PowerShell Direto
1. Clique com botão direito em "Install.ps1"
2. Selecione "Executar com PowerShell"

## 📋 Requisitos
- Windows 10/11
- Node.js (será solicitado download se não estiver instalado)
- PowerShell (já incluso no Windows)

## 🎯 O que o instalador faz:
- ✅ Verifica se Node.js está instalado
- ✅ Instala o aplicativo em %LOCALAPPDATA%\\Mavit
- ✅ Cria atalho na área de trabalho
- ✅ Cria atalho no menu iniciar
- ✅ Registra no Painel de Controle (Programas)
- ✅ Cria desinstalador automático

## 🗑️ Desinstalação
- Via Painel de Controle → Programas
- OU execute: %LOCALAPPDATA%\\Mavit\\Uninstall.bat

## 📞 Suporte
- Desenvolvido pela Maver Team
- Versão: 1.0.0

## 🔧 Solução de Problemas

### Node.js não encontrado
O instalador abrirá automaticamente o site https://nodejs.org/ para download.

### Erro de PowerShell
Execute como Administrador ou altere a política:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

### Antivírus bloqueia
Alguns antivírus podem bloquear scripts. Adicione exceção temporária.
`;

fs.writeFileSync(path.join(winInstallerDir, 'README.txt'), readme);

console.log('📦 Criando pacote final...');

// Criar ZIP final
const zipPath = path.join(releaseDir, 'Mavit-1.0.0-Windows-Installer.zip');
if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
}

try {
    execSync(`cd "${releaseDir}" && zip -r "Mavit-1.0.0-Windows-Installer.zip" "Mavit-Windows-Installer"`);
    console.log('✅ Instalador Windows criado com sucesso!');
    console.log(`📁 Localização: ${zipPath}`);
    console.log(`📂 Pasta: ${winInstallerDir}`);
} catch (error) {
    console.error('❌ Erro ao criar ZIP:', error.message);
}

console.log('\n🎉 Instalador Windows Avançado criado!');
console.log('\n📋 Características:');
console.log('- 🔍 Detecção automática de Node.js');
console.log('- 📥 Download automático se necessário');
console.log('- 🖥️  Atalhos automáticos (desktop + menu)');
console.log('- 📝 Registro no Painel de Controle');
console.log('- 🗑️  Desinstalador incluído');
console.log('- ⚡ Execução opcional pós-instalação');

console.log('\n📤 Para distribuir:');
console.log('1. Envie o arquivo ZIP');
console.log('2. Usuário extrai em qualquer pasta');
console.log('3. Usuário executa "INSTALAR.bat"');
console.log('4. Instalação automática completa!');