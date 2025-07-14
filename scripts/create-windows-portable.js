#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Criando versão portátil para Windows...');

// Diretório da build
const buildDir = path.join(__dirname, '..', 'dist');
const releaseDir = path.join(__dirname, '..', 'release');
const electronDir = path.join(__dirname, '..', 'electron');

// Verificar se as builds existem
if (!fs.existsSync(buildDir)) {
    console.error('❌ Build React não encontrada. Execute "npm run build" primeiro.');
    process.exit(1);
}

if (!fs.existsSync(path.join(buildDir, '..', 'dist', 'electron'))) {
    console.error('❌ Build Electron não encontrada. Execute "npm run build" primeiro.');
    process.exit(1);
}

// Criar estrutura para Windows
const winPortableDir = path.join(releaseDir, 'Mavit-Windows-Portable');

console.log('📁 Criando estrutura de arquivos...');

// Garantir que o diretório de release existe
if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir, { recursive: true });
}

// Remover diretório anterior se existir
if (fs.existsSync(winPortableDir)) {
    fs.rmSync(winPortableDir, { recursive: true, force: true });
}

// Criar novo diretório
fs.mkdirSync(winPortableDir, { recursive: true });

// Copiar arquivos necessários
console.log('📋 Copiando arquivos da aplicação...');

// Copiar React build
const reactBuildTarget = path.join(winPortableDir, 'dist');
execSync(`cp -r "${buildDir}" "${reactBuildTarget}"`);

// Copiar Electron build
const electronBuildSource = path.join(__dirname, '..', 'dist', 'electron');
const electronBuildTarget = path.join(winPortableDir, 'electron');
execSync(`cp -r "${electronBuildSource}" "${electronBuildTarget}"`);

// Copiar package.json essencial
const packageJson = {
    "name": "mavit",
    "version": "1.0.0",
    "description": "Mavit - Customizable Kanban Board Application",
    "main": "electron/main.js",
    "author": "Maver Team"
};

fs.writeFileSync(
    path.join(winPortableDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
);

// Copiar ícones
console.log('🎨 Copiando ícones...');
const assetsDir = path.join(winPortableDir, 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

const iconFiles = ['icon.ico', 'icon.png', 'icon-32.png', 'icon-64.png', 'icon-128.png'];
iconFiles.forEach(iconFile => {
    const sourcePath = path.join(__dirname, '..', 'assets', iconFile);
    if (fs.existsSync(sourcePath)) {
        const targetPath = path.join(assetsDir, iconFile);
        fs.copyFileSync(sourcePath, targetPath);
    }
});

// Criar script de execução para Windows
const runScript = `@echo off
echo Iniciando Mavit...
set ELECTRON_DISABLE_SECURITY_WARNINGS=true
npx electron . --no-sandbox --disable-setuid-sandbox --disable-gpu
pause`;

fs.writeFileSync(path.join(winPortableDir, 'Mavit.bat'), runScript);

// Criar README para Windows
const readme = `# Mavit - Versão Portátil para Windows

## Como usar:

1. Certifique-se que o Node.js está instalado no seu sistema
   - Baixe em: https://nodejs.org/

2. Instale as dependências:
   npm install

3. Execute o aplicativo:
   - Clique duplo em "Mavit.bat"
   - OU execute no terminal: npx electron .

## Requisitos:
- Node.js (versão 16 ou superior)
- Windows 10/11

## Sobre:
Mavit é um aplicativo de quadro Kanban personalizável para gerenciamento de tarefas.

Desenvolvido pela Maver Team
Versão: 1.0.0
`;

fs.writeFileSync(path.join(winPortableDir, 'README.txt'), readme);

// Criar arquivo package.json para instalação de dependências
const fullPackageJson = `{
  "name": "mavit",
  "version": "1.0.0",
  "description": "Mavit - Customizable Kanban Board Application",
  "main": "electron/main.js",
  "dependencies": {
    "electron": "^28.0.0"
  },
  "author": "Maver Team"
}`;

fs.writeFileSync(path.join(winPortableDir, 'package.json'), fullPackageJson);

console.log('📦 Criando arquivo ZIP...');

// Criar ZIP
const zipPath = path.join(releaseDir, 'Mavit-1.0.0-Windows-Portable.zip');
if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
}

try {
    execSync(`cd "${releaseDir}" && zip -r "Mavit-1.0.0-Windows-Portable.zip" "Mavit-Windows-Portable"`);
    console.log('✅ Versão portátil para Windows criada com sucesso!');
    console.log(`📁 Localização: ${zipPath}`);
    console.log(`📂 Pasta: ${winPortableDir}`);
} catch (error) {
    console.error('❌ Erro ao criar ZIP:', error.message);
}

console.log('\n🎉 Processo concluído!');
console.log('\n📋 Instruções para o usuário:');
console.log('1. Extrair o ZIP em qualquer pasta');
console.log('2. Executar "npm install" na pasta extraída'); 
console.log('3. Executar "Mavit.bat" ou "npx electron ."');