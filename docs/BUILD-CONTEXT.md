# Mavit - Contexto de Build para Claude Code

## 📁 Estrutura de Arquivos Preservada

### **Localização dos Builds:**
- **Arquivos movidos para**: `../Mavit-Archives/release-v1.0.0/`
- **Motivo**: Pasta `release/` muito grande para GitHub (1.1GB)
- **Status**: Preservada fora do repositório para contexto futuro

### **Builds Criados (v1.0.0):**

#### **Windows:**
- ✅ `Mavit-1.0.0-Windows-FINAL.zip` (106.7 MB)
- ✅ `win-unpacked/` (280 MB) - Build completo do electron-builder
- ✅ `Install.bat` - Script de instalação principal
- ✅ `CreateShortcut.vbs` - Criador de atalho Windows nativo

#### **Linux:**
- ✅ `mavit_1.0.0_amd64.deb` (70.8 MB)
- ✅ `Mavit-1.0.0.AppImage` (103.5 MB)
- ✅ `linux-unpacked/` (280 MB) - Build completo do electron-builder

## 🛠️ Scripts de Build Preservados

### **Principais Scripts:**
1. **`scripts/create-windows-ready.js`** - Gerador do instalador Windows final
2. **`scripts/generate-icons.js`** - Gerador de ícones
3. **`Install.bat`** - Instalador Windows (preservado em `docs/installers/`)
4. **`CreateShortcut.vbs`** - Criador de atalho (preservado em `docs/installers/`)

### **Comandos de Build:**
```bash
# Build completo
npm run build && npm run dist

# Build específico Windows
npm run dist:win

# Build específico Linux  
npm run dist:linux

# Criar instalador Windows final
node scripts/create-windows-ready.js
```

## 🔧 Configurações Importantes

### **package.json - Seção build:**
```json
{
  "build": {
    "appId": "com.maver.mavit",
    "productName": "Mavit",
    "directories": {
      "buildResources": "assets",
      "output": "release"
    },
    "win": {
      "target": [{"target": "nsis", "arch": ["x64"]}]
    },
    "linux": {
      "target": [
        {"target": "AppImage", "arch": ["x64"]},
        {"target": "deb", "arch": ["x64"]}
      ]
    }
  }
}
```

### **Dependências Importantes:**
- `electron-builder`: ^24.9.1
- `electron`: ^28.0.0
- Build targets: NSIS (Windows), DEB + AppImage (Linux)

## 📋 Processo de Build Documentado

### **1. Preparação:**
```bash
npm install
npm run build:react
npm run build:electron
```

### **2. Build Multiplataforma:**
```bash
npm run dist:linux    # Gera DEB + AppImage
npm run dist:win      # Gera estrutura Windows
```

### **3. Instalador Windows Final:**
```bash
node scripts/create-windows-ready.js  # Cria instalador completo
```

### **4. Estrutura Final:**
```
release/
├── mavit_1.0.0_amd64.deb
├── Mavit-1.0.0.AppImage  
├── Mavit-1.0.0-Windows-FINAL.zip
├── win-unpacked/              # Build Windows completo
└── linux-unpacked/            # Build Linux completo
```

## 🚀 Para Futuras Atualizações

### **Comandos Principais:**
1. **Rebuild completo**: `npm run build && npm run dist`
2. **Instalar Windows**: `node scripts/create-windows-ready.js`
3. **Testar builds**: Scripts estão em `docs/installers/`

### **Localização dos Builds:**
- **Builds antigos**: `../Mavit-Archives/release-v1.0.0/`
- **Builds novos**: `release/` (será recriada automaticamente)

### **Contexto Preservado:**
- ✅ Scripts de build funcionais
- ✅ Configurações de electron-builder
- ✅ Documentação completa de processo
- ✅ Histórico de builds arquivado

## 🎯 Resumo para Claude Code

**Claude Code pode:**
- ✅ Recriar todos os builds usando os scripts preservados
- ✅ Modificar instaladores usando templates em `docs/installers/`
- ✅ Consultar builds anteriores em `../Mavit-Archives/`
- ✅ Manter consistência usando esta documentação

**O contexto está preservado**, mesmo com `release/` removida do repositório.