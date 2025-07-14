# Guia de Instalação Detalhado

Este guia fornece instruções passo-a-passo para instalar o Mavit em diferentes sistemas operacionais.

## 📥 Download dos Instaladores

### Onde Baixar
- **GitHub Releases**: https://github.com/seu-usuario/mavit/releases/latest
- **Verificação de Assinatura**: Sempre baixe da fonte oficial

### Arquivos Disponíveis
| Arquivo | Plataforma | Tamanho | Descrição |
|---------|------------|---------|-----------|
| `Mavit-Setup.exe` | Windows x64/x86 | ~150MB | Instalador com assistente |
| `Mavit.AppImage` | Linux x64 | ~160MB | Aplicação portável |
| `mavit.deb` | Ubuntu/Debian | ~150MB | Pacote DEB |

## 🖥️ Windows

### Requisitos Mínimos
- **OS**: Windows 10 versão 1903 ou superior
- **RAM**: 4GB mínimo, 8GB recomendado
- **Espaço**: 500MB livres
- **CPU**: x64 ou x86

### Instalação Padrão

1. **Baixar o Instalador**
   ```
   https://github.com/seu-usuario/mavit/releases/latest/download/Mavit-Setup.exe
   ```

2. **Executar como Administrador**
   - Clique direito no arquivo
   - Selecione "Executar como administrador"
   - Confirme no controle de conta de usuário

3. **Seguir o Assistente**
   ```
   Bem-vindo → Licença → Pasta de Instalação → Componentes → Instalar
   ```

4. **Opções Recomendadas**
   - ✅ Criar atalho na área de trabalho
   - ✅ Criar entrada no menu Iniciar
   - ✅ Associar arquivos .kanban
   - ❌ Iniciar automaticamente com Windows (opcional)

### Instalação Silenciosa (Avançado)
```cmd
# Instalação completamente silenciosa
Mavit-Setup.exe /S

# Com diretório personalizado
Mavit-Setup.exe /S /D=C:\MeusDados\Mavit

# Com log de instalação
Mavit-Setup.exe /S /LOG=C:\temp\mavit-install.log
```

### Localização dos Arquivos
```
📁 Programa: C:\Program Files\Mavit\
📁 Dados: %APPDATA%\mavit\
📁 Logs: %APPDATA%\mavit\logs\
📁 Backup: %USERPROFILE%\Documents\Mavit\
```

### Problemas Comuns Windows

#### Antivírus Bloqueia
**Sintoma**: Windows Defender ou antivírus bloqueia instalação
```
⚠️ Windows protegeu seu PC
   Não reconhecemos o editor deste aplicativo
```

**Solução**:
1. Clique em "Mais informações"
2. Clique em "Executar mesmo assim"
3. Ou adicione exceção no antivírus

#### Erro de Permissão
**Sintoma**: "Acesso negado" durante instalação
**Solução**: Execute sempre como administrador

#### .NET Framework em Falta
**Sintoma**: Erro sobre .NET durante instalação
**Solução**: 
```cmd
# Baixe e instale .NET 6.0 Runtime
https://dotnet.microsoft.com/download/dotnet/6.0
```

## 🐧 Linux

### Distribuições Suportadas
- **Ubuntu**: 20.04+ (focal)
- **Debian**: 11+ (bullseye)
- **Fedora**: 35+
- **Arch Linux**: Rolling
- **openSUSE**: Leap 15.4+
- **Outras**: Via AppImage

### Método 1: AppImage (Universal)

#### Vantagens
- ✅ Funciona em qualquer distribuição
- ✅ Não requer instalação
- ✅ Não afeta o sistema
- ✅ Fácil de remover

#### Instalação AppImage
```bash
# 1. Baixar
wget https://github.com/seu-usuario/mavit/releases/latest/download/Mavit.AppImage

# 2. Tornar executável
chmod +x Mavit.AppImage

# 3. Executar
./Mavit.AppImage
```

#### Integração no Desktop
```bash
# Criar atalho manual
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/mavit.desktop << EOF
[Desktop Entry]
Name=Mavit
Comment=Kanban Board Application
Exec=/home/$USER/Apps/Mavit.AppImage
Icon=mavit
Terminal=false
Type=Application
Categories=Office;ProjectManagement;
StartupWMClass=Mavit
EOF

# Atualizar cache de aplicativos
update-desktop-database ~/.local/share/applications
```

### Método 2: Pacote DEB (Ubuntu/Debian)

#### Instalação via GUI
1. Baixe o arquivo `.deb`
2. Clique duplo no arquivo
3. Use o instalador gráfico do sistema

#### Instalação via Terminal
```bash
# Baixar
wget https://github.com/seu-usuario/mavit/releases/latest/download/mavit.deb

# Instalar
sudo dpkg -i mavit.deb

# Resolver dependências (se necessário)
sudo apt-get install -f

# Executar
mavit
```

### Dependências Linux
O pacote DEB instala automaticamente, mas se necessário:
```bash
# Ubuntu/Debian
sudo apt-get install \
    libgtk-3-0 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libatspi2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2

# Fedora
sudo dnf install \
    gtk3 \
    nss \
    libXScrnSaver \
    libXtst \
    xdg-utils \
    at-spi2-atk \
    libdrm \
    libXcomposite \
    libXdamage \
    libXrandr \
    mesa-libgbm \
    alsa-lib
```

### Localização dos Arquivos Linux
```
📁 Programa: /opt/Mavit/ (DEB) ou ./Mavit.AppImage
📁 Dados: ~/.config/mavit/
📁 Logs: ~/.config/mavit/logs/
📁 Backup: ~/Documents/Mavit/
```

### Problemas Comuns Linux

#### AppImage Não Executa
```bash
# Verificar permissões
ls -la Mavit.AppImage

# Se não estiver executável
chmod +x Mavit.AppImage

# Teste com debug
./Mavit.AppImage --verbose

# Problemas com FUSE
sudo apt-get install fuse libfuse2
```

#### Dependências em Falta
```bash
# Verificar dependências em falta
ldd Mavit.AppImage

# Para DEB
sudo apt-get install -f
```

#### Problema de Display
```bash
# Se usando Wayland
export GDK_BACKEND=x11

# Se usando SSH
export DISPLAY=:0
```

## 🍎 macOS (Experimental)

> **Nota**: Suporte para macOS está em desenvolvimento

### Requisitos
- **OS**: macOS 11.0+ (Big Sur)
- **Arquitetura**: Intel (x64) ou Apple Silicon (ARM64)

### Instalação
```bash
# Baixar DMG
curl -L -o Mavit.dmg \
  https://github.com/seu-usuario/mavit/releases/latest/download/Mavit.dmg

# Montar e instalar
open Mavit.dmg
# Arraste Mavit.app para Applications
```

## 🔧 Verificação da Instalação

### Teste Básico
1. **Abrir aplicativo**
2. **Criar primeiro quadro**
3. **Adicionar coluna**
4. **Criar cartão**
5. **Testar drag & drop**

### Verificação de Integridade
```bash
# Windows (PowerShell)
Get-FileHash Mavit-Setup.exe -Algorithm SHA256

# Linux
sha256sum Mavit.AppImage
sha256sum mavit.deb

# Comparar com hashes oficiais em:
# https://github.com/seu-usuario/mavit/releases/latest
```

## 📁 Gerenciamento de Dados

### Localização dos Dados
| SO | Caminho |
|----|---------|
| Windows | `%APPDATA%\mavit\` |
| Linux | `~/.config/mavit/` |
| macOS | `~/Library/Application Support/mavit/` |

### Backup Manual
```bash
# Windows
copy "%APPDATA%\mavit\*" "C:\MeuBackup\"

# Linux/macOS
cp -r ~/.config/mavit/ ~/backup-mavit/
```

### Migração Entre Computadores
1. **Exportar dados** via aplicativo (JSON)
2. **Copiar pasta de dados** manualmente
3. **Importar dados** no novo computador

## 🗑️ Desinstalação

### Windows
```
Configurações → Aplicativos → Mavit → Desinstalar
```
Ou usar o desinstalador em:
```
C:\Program Files\Mavit\Uninstall Mavit.exe
```

### Linux DEB
```bash
sudo apt-get remove mavit
```

### Linux AppImage
```bash
# Simplesmente delete o arquivo
rm Mavit.AppImage

# Remova dados se desejar
rm -rf ~/.config/mavit/
```

## 🆘 Suporte

### Logs de Instalação
- **Windows**: `%TEMP%\mavit-install.log`
- **Linux**: Terminal output durante instalação

### Reportar Problemas
1. Inclua informação do sistema (OS, versão)
2. Anexe logs de erro
3. Descreva passos para reproduzir
4. Use o template em: https://github.com/seu-usuario/mavit/issues/new