# Guia de Build e Distribuição

Este documento explica como compilar e distribuir o Mavit para diferentes plataformas.

## Pré-requisitos

### Sistema Base
- **Node.js**: 18.x ou superior
- **npm**: 8.x ou superior  
- **Git**: Para controle de versão
- **Python**: 3.x (para node-gyp)

### Ferramentas Específicas por Plataforma

#### Windows
- **Visual Studio Build Tools** ou **Visual Studio Community** com C++ workload
- **Windows SDK** (incluído com Visual Studio)

#### Linux
- **build-essential**: `sudo apt-get install build-essential`
- **libnss3-dev**: `sudo apt-get install libnss3-dev`
- **libgtk-3-dev**: `sudo apt-get install libgtk-3-dev`

#### macOS
- **Xcode Command Line Tools**: `xcode-select --install`

## Configuração do Ambiente

### 1. Clone e Instale Dependências
```bash
git clone https://github.com/seu-usuario/mavit.git
cd mavit
npm install
```

### 2. Gere os Ícones da Aplicação
```bash
# Primeiro, gere os ícones a partir do SVG
# Veja assets/README-icons.md para instruções detalhadas

# Certifique-se de que existem:
ls assets/icon.ico   # Windows
ls assets/icon.png   # Linux  
ls assets/icon.icns  # macOS (opcional)
```

## Builds de Desenvolvimento

### Iniciar em Modo Desenvolvimento
```bash
# Padrão (todas as plataformas)
npm run dev

# Linux (recomendado para desenvolvimento no Linux)
npm run dev:linux

# Ou separadamente
npm run dev:react      # Apenas servidor React
npm run dev:electron   # Apenas Electron (após React estar rodando)
```

### Verificar Código
```bash
npm run lint           # ESLint
npm run build:react    # Teste build React
npm run build:electron # Teste build Electron
```

## Builds de Produção

### Build Completo
```bash
npm run build
```
Esto comando executa:
1. `npm run build:react` - Compila o frontend React
2. `npm run build:electron` - Compila o código Electron TypeScript

### Verificar Build
```bash
# Teste o build localmente
npm run preview

# Ou execute o Electron diretamente
./node_modules/.bin/electron .
```

## Criação de Instaladores

### Script Automatizado (Recomendado)
```bash
# Para a plataforma atual
npm run release

# Para todas as plataformas
npm run release:all

# Plataformas específicas
npm run release:win    # Windows
npm run release:linux  # Linux
```

### Electron Builder Manual
```bash
# Plataforma atual
npm run dist

# Plataformas específicas
npm run dist:win       # Windows (.exe)
npm run dist:linux     # Linux (AppImage + .deb)

# Com arquiteturas específicas
npx electron-builder --win --x64
npx electron-builder --linux --x64
```

## Configurações Avançadas

### Variáveis de Ambiente
```bash
# Build otimizado
export NODE_ENV=production

# Debug do electron-builder
export DEBUG=electron-builder

# Pular assinatura de código (desenvolvimento)
export CSC_IDENTITY_AUTO_DISCOVERY=false
```

### Otimizações de Build

#### Windows
```bash
# Build apenas 64-bit (mais comum)
npx electron-builder --win --x64

# NSIS personalizado
npx electron-builder --win --config.nsis.oneClick=false
```

#### Linux
```bash
# Apenas AppImage (mais portável)
npx electron-builder --linux AppImage

# Apenas DEB
npx electron-builder --linux deb

# Com metadados específicos
npx electron-builder --linux --config.linux.category=Office
```

## Estrutura de Saída

Após o build, os arquivos são criados em:
```
release/
├── Mavit Setup 1.0.0.exe          # Windows Installer
├── Mavit-1.0.0.AppImage            # Linux AppImage
├── mavit_1.0.0_amd64.deb           # Debian Package
├── Mavit-1.0.0-mac.dmg             # macOS Installer (se disponível)
└── latest-linux.yml                    # Metadados de update
```

## Solução de Problemas

### Erros Comuns

#### "Python not found"
```bash
# Instale Python e configure
npm config set python python3
```

#### "MSBuild not found" (Windows)
```bash
# Instale Visual Studio Build Tools
npm config set msvs_version 2022
```

#### "Unable to find Electron" 
```bash
# Reinstale Electron
npm install electron --save-dev
```

#### "Icon file not found"
```bash
# Verifique os ícones
ls -la assets/
# Gere os ícones ausentes conforme assets/README-icons.md
```

### Limpeza de Cache
```bash
# Limpe caches npm
npm cache clean --force

# Limpe node_modules
rm -rf node_modules package-lock.json
npm install

# Limpe builds anteriores
rm -rf dist release
```

### Debug de Build
```bash
# Build com verbose
DEBUG=electron-builder npm run dist

# Build com mais informações
npx electron-builder --publish=never --config.compression=store
```

## Performance e Otimização

### Reduzir Tamanho do Bundle
```bash
# Analise o bundle
npx webpack-bundle-analyzer dist/assets/*.js

# Build com compressão máxima
npx electron-builder --config.compression=maximum
```

### Builds Incrementais
```bash
# Apenas React (mais rápido para mudanças no frontend)
npm run build:react

# Skip dependencies (se não mudaram)
npx electron-builder --config.buildDependenciesFromSource=false
```

## Distribuição

### Upload Manual
1. Vá para [GitHub Releases](https://github.com/seu-usuario/mavit/releases)
2. Crie nova release
3. Faça upload dos arquivos de `release/`
4. Publique a release

### Checklist Pré-Release
- [ ] Testou em Windows e Linux
- [ ] Verificou ícones e metadados
- [ ] Testou instalação e desinstalação
- [ ] Atualizou version no package.json
- [ ] Criou CHANGELOG.md
- [ ] Testou import/export de dados
- [ ] Verificou performance

### Tags e Versionamento
```bash
# Bump version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0  
npm version major  # 1.0.0 -> 2.0.0

# Push com tags
git push origin main --tags
```